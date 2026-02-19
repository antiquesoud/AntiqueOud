import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { Cart, CartItem } from '@/types'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

/**
 * Cart Hook with Optimistic Updates & Debounced Batch Sync
 *
 * Performance optimizations:
 * - Optimistic updates for instant UI feedback (like Amazon, Shopify)
 * - Instant toast notifications on click (not waiting for API)
 * - Navbar cart count updates immediately
 * - Debounced batch sync - multiple clicks = 1 API call
 * - Immediate rollback on error
 */
export function useCart() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Use different endpoints based on authentication status
  const cartEndpoint = isAuthenticated ? '/cart' : '/guest-cart'
  const cartQueryKey = ['cart', isAuthenticated ? 'user' : 'guest']

  // Refs for debounced batch sync
  const pendingUpdatesRef = useRef<Map<string, number>>(new Map())
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: cart, isLoading } = useQuery({
    queryKey: cartQueryKey,
    queryFn: () => apiClient.get<Cart>(cartEndpoint),
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on every component mount
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes - cart updates via optimistic mutations
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 min for background updates
  })

  // Debounced sync function - batches multiple updates into single API call
  const debouncedSync = useCallback(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)

    syncTimerRef.current = setTimeout(async () => {
      const updates = Array.from(pendingUpdatesRef.current.entries())
      if (updates.length === 0) return

      pendingUpdatesRef.current.clear()

      try {
        // Try batch sync first
        await apiClient.patch(`${cartEndpoint}/sync`, {
          items: updates.map(([itemId, quantity]) => ({ itemId, quantity }))
        })
      } catch (error: unknown) {
        // If batch sync fails (404 or other error), fall back to individual calls
        console.warn('Batch sync failed, falling back to individual calls:', error)
        for (const [itemId, quantity] of updates) {
          try {
            if (quantity === 0) {
              await apiClient.delete(`${cartEndpoint}/items/${itemId}`)
            } else {
              await apiClient.patch(`${cartEndpoint}/items/${itemId}`, { quantity })
            }
          } catch (e) {
            console.error('Individual update failed:', e)
          }
        }
      }
      // Always sync with server after updates
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    }, 500) // 500ms debounce - faster feedback
  }, [cartEndpoint, queryClient, cartQueryKey])

  // Optimistic add to cart - instant UI update
  const addToCart = useMutation({
    mutationFn: (data: { productId: string; variantId?: string; quantity: number }) =>
      apiClient.post(`${cartEndpoint}/items`, data), // Returns CartItem, not full Cart
    onMutate: async (newItem) => {
      // Instant toast - don't wait for API
      toast.success('Added to cart')

      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: cartQueryKey })

      // Snapshot the previous cart
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      // Optimistically update cart count immediately
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
                id: `temp-${Date.now()}`, // Temporary ID until server responds
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

        // Calculate new item count
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: updatedItems,
          summary: {
            ...previousCart.summary,
            itemCount: newItemCount,
          },
        })
      }

      return { previousCart }
    },
    onSuccess: () => {
      // Server returns CartItem, not full Cart - invalidate to fetch updated cart
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
    onError: (_err, _vars, context) => {
      // Rollback to previous cart on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      toast.error('Failed to add to cart')
    },
  })

  // Optimistic update for quantity changes (legacy - for components still using this)
  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.patch<Cart>(`${cartEndpoint}/items/${itemId}`, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      // Instant toast
      toast.success('Cart updated')

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartQueryKey })

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      // Optimistically update the cache with items and itemCount
      if (previousCart) {
        const updatedItems = previousCart.items.map((item: CartItem) =>
          item.id === itemId ? { ...item, quantity } : item
        )
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: updatedItems,
          summary: {
            ...previousCart.summary,
            itemCount: newItemCount,
          },
        })
      }

      return { previousCart }
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      toast.error('Failed to update cart')
    },
    onSettled: () => {
      // Sync with server
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Optimistic update with debounced batch sync
  const updateCartItem = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      // Queue for batch sync instead of immediate API call
      pendingUpdatesRef.current.set(itemId, quantity)
      debouncedSync()
      return { itemId, quantity }
    },
    onMutate: async ({ itemId, quantity }) => {
      // Instant toast
      toast.success('Cart updated')

      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      if (previousCart) {
        const updatedItems = previousCart.items.map((item: CartItem) =>
          item.id === itemId ? { ...item, quantity } : item
        )
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: updatedItems,
          summary: {
            ...previousCart.summary,
            itemCount: newItemCount,
          },
        })
      }

      return { previousCart }
    },
    onError: (error: unknown, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update cart'
      toast.error(errorMessage)
    },
  })

  // Optimistic update for remove with debounced sync
  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      // Queue removal (quantity 0) for batch sync
      pendingUpdatesRef.current.set(itemId, 0)
      debouncedSync()
      return { itemId }
    },
    onMutate: async (itemId) => {
      // Instant toast
      toast.success('Removed from cart')

      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      // Optimistically remove the item and update count
      if (previousCart) {
        const updatedItems = previousCart.items.filter((item: CartItem) => item.id !== itemId)
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: updatedItems,
          summary: {
            ...previousCart.summary,
            itemCount: newItemCount,
          },
        })
      }

      return { previousCart }
    },
    onError: (error: unknown, _itemId, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      console.error('Remove from cart error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item'
      toast.error(errorMessage)
    },
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

      // Clear any pending sync updates
      pendingUpdatesRef.current.clear()
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current)
        syncTimerRef.current = null
      }

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

    // Clear any pending sync updates
    pendingUpdatesRef.current.clear()
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current)
      syncTimerRef.current = null
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
