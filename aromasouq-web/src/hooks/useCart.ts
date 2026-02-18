import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { Cart, CartItem } from '@/types'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

/**
 * Cart Hook with Optimistic Updates & Debounced Sync
 *
 * Performance optimizations:
 * - Optimistic updates for instant UI feedback
 * - Debounced API calls (batches rapid quantity changes)
 * - Instant toast notifications
 * - Reduced server round-trips
 */

// Debounce timeout for quantity updates (ms)
const DEBOUNCE_MS = 500

export function useCart() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Refs for debouncing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingUpdatesRef = useRef<Map<string, number>>(new Map())

  // Use different endpoints based on authentication status
  const cartEndpoint = isAuthenticated ? '/cart' : '/guest-cart'
  const cartQueryKey = ['cart', isAuthenticated ? 'user' : 'guest']

  const { data: cart, isLoading } = useQuery({
    queryKey: cartQueryKey,
    queryFn: () => apiClient.get<Cart>(cartEndpoint),
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on every component mount
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes - cart updates via optimistic mutations
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 min for background updates
  })

  // Optimistic add to cart - instant UI update + instant toast
  const addToCart = useMutation({
    mutationFn: (data: { productId: string; variantId?: string; quantity: number }) =>
      apiClient.post(`${cartEndpoint}/items`, data),
    onMutate: async (newItem) => {
      // Show toast immediately - don't wait for server
      toast.success('Added to cart')

      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      if (previousCart) {
        const existingItem = previousCart.items.find(
          (item: CartItem) =>
            item.productId === newItem.productId &&
            item.variantId === newItem.variantId
        )

        const updatedItems = existingItem
          ? previousCart.items.map((item: CartItem) =>
              item.productId === newItem.productId && item.variantId === newItem.variantId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            )
          : [
              ...previousCart.items,
              {
                id: `temp-${Date.now()}`,
                cartId: previousCart.id,
                productId: newItem.productId,
                variantId: newItem.variantId,
                quantity: newItem.quantity,
                product: {
                  id: newItem.productId,
                  name: 'Loading...',
                  slug: '',
                  image: '',
                  images: [],
                  price: 0,
                  stockQuantity: 999,
                  coinsToAward: 0,
                },
              } as CartItem,
            ]

        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: updatedItems,
          summary: {
            ...previousCart.summary,
            itemCount: (previousCart.summary?.itemCount || 0) + newItem.quantity,
          },
        })
      }

      return { previousCart }
    },
    onSuccess: () => {
      // Sync with server in background (no toast here - already shown)
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      toast.error('Failed to add to cart')
    },
  })

  // Debounced quantity update - batches rapid +/- clicks
  const debouncedApiCall = useCallback((itemId: string, quantity: number) => {
    // Store pending update
    pendingUpdatesRef.current.set(itemId, quantity)

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new debounced timer
    debounceTimerRef.current = setTimeout(async () => {
      // Process all pending updates
      const updates = Array.from(pendingUpdatesRef.current.entries())
      pendingUpdatesRef.current.clear()

      for (const [id, qty] of updates) {
        try {
          await apiClient.patch(`${cartEndpoint}/items/${id}`, { quantity: qty })
        } catch (error) {
          console.error('Failed to sync cart item:', error)
        }
      }

      // Single invalidation after all updates
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    }, DEBOUNCE_MS)
  }, [cartEndpoint, queryClient, cartQueryKey])

  // Optimistic update for quantity changes (instant UI, debounced API)
  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      // Don't call API here - it's debounced
      debouncedApiCall(itemId, quantity)
      return { itemId, quantity }
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      // Instant UI update
      if (previousCart) {
        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: previousCart.items.map((item: CartItem) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })
      }

      return { previousCart }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      toast.error('Failed to update cart')
    },
    // No onSettled - debounced API handles sync
  })

  // updateCartItem uses same debounced logic as updateQuantity
  const updateCartItem = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      debouncedApiCall(itemId, quantity)
      return { itemId, quantity }
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      if (previousCart) {
        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: previousCart.items.map((item: CartItem) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })
      }

      return { previousCart }
    },
    onError: (error: any, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      toast.error(error?.response?.data?.message || 'Failed to update cart')
    },
    // No onSettled - debounced API handles sync
  })

  // Optimistic remove - instant UI + instant toast
  const removeFromCart = useMutation({
    mutationFn: (itemId: string) => apiClient.delete(`${cartEndpoint}/items/${itemId}`),
    onMutate: async (itemId) => {
      // Show toast immediately
      toast.success('Removed from cart')

      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      if (previousCart) {
        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: previousCart.items.filter((item: CartItem) => item.id !== itemId),
        })
      }

      return { previousCart }
    },
    onSuccess: () => {
      // Sync with server (no toast - already shown)
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
    onError: (error: any, _itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      console.error('Remove from cart error:', error)
      toast.error(error?.response?.data?.message || 'Failed to remove item')
    },
    // Removed onSettled - onSuccess handles sync
  })

  const clearCart = useMutation({
    mutationFn: () => apiClient.delete(cartEndpoint),
    onMutate: async () => {
      // Cancel all cart queries immediately
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      // Immediately clear cart in cache - zero items
      const emptyCart: Cart = {
        id: previousCart?.id || '',
        items: [],
        summary: {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
          coinsEarnable: 0,
        },
      }

      // Set empty cart for both user and guest to ensure UI updates
      queryClient.setQueryData<Cart>(['cart', 'user'], emptyCart)
      queryClient.setQueryData<Cart>(['cart', 'guest'], emptyCart)

      return { previousCart }
    },
    onError: (_err, _vars, context) => {
      // Only rollback if there was a previous cart
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
    },
    onSettled: () => {
      // Final sync - invalidate all cart queries
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Immediate cart clear without API call (for after successful purchase)
  const clearCartImmediate = () => {
    const emptyCart: Cart = {
      id: '',
      items: [],
      summary: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
        coinsEarnable: 0,
      },
    }
    // Clear both user and guest carts immediately
    queryClient.setQueryData<Cart>(['cart', 'user'], emptyCart)
    queryClient.setQueryData<Cart>(['cart', 'guest'], emptyCart)
    // Then invalidate to sync with server
    queryClient.invalidateQueries({ queryKey: ['cart'] })
  }

  return {
    cart,
    isLoading,
    addToCart: addToCart.mutate,
    addToCartAsync: addToCart.mutateAsync,
    updateQuantity: updateQuantity.mutate,
    updateCartItem: updateCartItem.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
    clearCartImmediate, // For instant clear after purchase
    itemCount: cart?.summary?.itemCount || 0,
  }
}
