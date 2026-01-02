import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Cart, CartItem } from '@/types'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

/**
 * Cart Hook with Optimistic Updates
 *
 * Performance optimizations:
 * - Optimistic updates for instant UI feedback
 * - Rollback on error
 * - Debounced invalidation
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
    retry: false, // Don't retry on error to prevent multiple 401 redirects
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const addToCart = useMutation({
    mutationFn: (data: { productId: string; variantId?: string; quantity: number }) =>
      apiClient.post<Cart>(`${cartEndpoint}/items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Added to cart')
    },
    onError: () => {
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
      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey)

      // Optimistically clear
      if (previousCart) {
        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: [],
        })
      }

      return { previousCart }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  return {
    cart,
    isLoading,
    addToCart: addToCart.mutate,
    addToCartAsync: addToCart.mutateAsync,
    updateQuantity: updateQuantity.mutate,
    updateCartItem: updateCartItem.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
    itemCount: cart?.summary?.itemCount || 0,
  }
}
