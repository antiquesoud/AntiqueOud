import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/lib/constants'

interface Order {
  id: string
  orderNumber: string
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  subtotal: number
  tax: number
  shippingFee: number
  discount: number
  total: number
  createdAt: string
  updatedAt: string
  trackingNumber?: string
  items: {
    id: string
    quantity: number
    price: number
    hasReviewed?: boolean
    review?: {
      id: string
      rating: number
      createdAt: string
    }
    product: {
      id: string
      name: string
      nameAr: string
      slug?: string
      images: { url: string }[]
      brand?: {
        name: string
        nameAr: string
      }
    }
  }[]
  address: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    phone: string
  }
}

interface OrdersResponse {
  data: Order[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function useOrders(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () =>
      apiClient.get<OrdersResponse>('/orders', { page, limit }),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => apiClient.get<Order>(`/orders/${id}`),
    enabled: !!id,
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.post(`/orders/${orderId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
