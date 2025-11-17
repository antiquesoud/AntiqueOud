import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Cart } from '@/types'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

// Hook for cart management (supports both authenticated and guest users)
export function useCart() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Use different endpoints based on authentication status
  const cartEndpoint = isAuthenticated ? '/cart' : '/guest-cart'

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', isAuthenticated ? 'user' : 'guest'],
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

  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.patch<Cart>(`${cartEndpoint}/items/${itemId}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const updateCartItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.patch<Cart>(`${cartEndpoint}/items/${itemId}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Cart updated')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update cart')
    },
  })

  const removeFromCart = useMutation({
    mutationFn: (itemId: string) => apiClient.delete(`${cartEndpoint}/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Removed from cart')
    },
  })

  const clearCart = useMutation({
    mutationFn: () => apiClient.delete(cartEndpoint),
    onSuccess: () => {
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
