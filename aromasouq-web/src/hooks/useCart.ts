import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Cart, CartItem } from '@/types'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

/**
 * Cart Hook with Optimistic Updates (Industry-Grade)
 *
 * Performance optimizations:
 * - Optimistic updates for instant UI feedback (like Amazon, Shopify)
 * - Immediate rollback on error
 * - Fresh data on every mount (staleTime: 0)
 * - Proper cache cleanup with gcTime
 */
export function useCart() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Use different endpoints based on authentication status
  const cartEndpoint = isAuthenticated ? '/cart' : '/guest-cart'
  const cartQueryKey = ['cart', isAuthenticated ? 'user' : 'guest']

  const { data: cart, isLoading } = useQuery({
    queryKey: cartQueryKey,
    queryFn: () => apiClient.get<Cart>(cartEndpoint),
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 0, // Always fetch fresh - cart data should be accurate
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 min for background updates
  })

  // Optimistic add to cart - instant UI update
  const addToCart = useMutation({
    mutationFn: (data: { productId: string; variantId?: string; quantity: number }) =>
      apiClient.post(`${cartEndpoint}/items`, data), // Returns CartItem, not full Cart
    onMutate: async (newItem) => {
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

  // Optimistic update for quantity changes
  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.patch<Cart>(`${cartEndpoint}/items/${itemId}`, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartQueryKey })

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      // Optimistically update the cache
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
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
    },
    onSettled: () => {
      // Sync with server
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const updateCartItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.patch<Cart>(`${cartEndpoint}/items/${itemId}`, { quantity }),
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
    onSuccess: () => {
      toast.success('Cart updated')
    },
    onError: (error: any, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      toast.error(error?.response?.data?.message || 'Failed to update cart')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Optimistic update for remove
  const removeFromCart = useMutation({
    mutationFn: (itemId: string) => apiClient.delete(`${cartEndpoint}/items/${itemId}`),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      // Optimistically remove the item
      if (previousCart) {
        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: previousCart.items.filter((item: CartItem) => item.id !== itemId),
        })
      }

      return { previousCart }
    },
    onSuccess: () => {
      toast.success('Removed from cart')
    },
    onError: (error: any, _itemId, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
      console.error('Remove from cart error:', error)
      toast.error(error?.response?.data?.message || 'Failed to remove item')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
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
