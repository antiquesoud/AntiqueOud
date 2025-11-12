'use client'

import { useParams, useRouter } from '@/i18n/navigation'
import { useOrder, useCancelOrder } from '@/hooks/useOrders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ArrowLeft, MapPin, CreditCard, Truck, Star, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-[#B3967D]/100 text-[#B3967D]/800' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const { data: order, isLoading } = useOrder(orderId)
  const cancelOrder = useCancelOrder()

  const handleCancelOrder = async () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder.mutateAsync(orderId)
        toast.success('Order cancelled successfully')
      } catch (error) {
        toast.error('Failed to cancel order')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  const statusClass = statusConfig[order.orderStatus as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')} at{' '}
            {format(new Date(order.createdAt), 'HH:mm')}
          </p>
        </div>
        <Badge className={statusClass} variant="secondary">
          {statusConfig[order.orderStatus as keyof typeof statusConfig]?.label || order.orderStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="font-medium hover:text-oud-gold transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Price: {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <CardTitle>Shipping Address</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium">{order.address.fullName}</p>
                <p className="text-muted-foreground mt-1">{order.address.addressLine1}</p>
                {order.address.addressLine2 && (
                  <p className="text-muted-foreground">{order.address.addressLine2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.address.city}, {order.address.state}
                </p>
                <p className="text-muted-foreground mt-2">Phone: {order.address.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Product Reviews Section - Only for DELIVERED orders */}
          {order.orderStatus === 'DELIVERED' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-oud-gold" />
                  <CardTitle>Product Reviews</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your experience with the products you received
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex gap-4 flex-1">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.product.images?.[0]?.url ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <div className="mt-2">
                            {item.hasReviewed ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <Star className="w-3 h-3 mr-1" />
                                  Reviewed
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {item.review?.rating}/5 stars
                                </span>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Not Reviewed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {item.hasReviewed ? (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/products/${item.product.slug || item.product.id}#reviews`}>
                              View Review
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-oud-gold hover:bg-oud-gold/90"
                            asChild
                          >
                            <Link href={`/products/${item.product.slug || item.product.id}/write-review?orderId=${order.id}`}>
                              Write Review
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (5%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-oud-gold">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <CardTitle>Payment Method</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {order.paymentMethod === 'CARD' ? 'Credit/Debit Card' : 'Cash on Delivery'}
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          {order.orderStatus === 'PENDING' && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleCancelOrder}
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
