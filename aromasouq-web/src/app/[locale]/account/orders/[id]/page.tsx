'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from '@/i18n/navigation'
import { useOrder, useCancelOrder } from '@/hooks/useOrders'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Package, ArrowLeft, MapPin, CreditCard, Truck, Download, Star, MessageSquare, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { redirectToHostedCheckout } from '@/lib/paymob'
import toast from 'react-hot-toast'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { useTranslations } from 'next-intl'

export default function OrderDetailPage() {
  const t = useTranslations('account.orderDetailPage')
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, hasHydrated } = useAuth()
  const orderId = params.id as string

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login')
    }
  }, [hasHydrated, isAuthenticated, router])

  const { data: order, isLoading } = useOrder(orderId)
  const cancelOrder = useCancelOrder()
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const tOrders = useTranslations('account.ordersPage')

  const statusConfig = {
    PENDING: { label: tOrders('statuses.pending'), color: 'bg-[#B3967D]/100 text-[#B3967D]/800' },
    CONFIRMED: { label: tOrders('statuses.confirmed'), color: 'bg-blue-100 text-blue-800' },
    PROCESSING: { label: tOrders('statuses.processing'), color: 'bg-purple-100 text-purple-800' },
    SHIPPED: { label: tOrders('statuses.shipped'), color: 'bg-indigo-100 text-indigo-800' },
    DELIVERED: { label: tOrders('statuses.delivered'), color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: tOrders('statuses.cancelled'), color: 'bg-red-100 text-red-800' },
  }

  const paymentStatusConfig = {
    PENDING: { label: tOrders('paymentStatuses.pending'), color: 'bg-orange-100 text-orange-800' },
    PAID: { label: tOrders('paymentStatuses.paid'), color: 'bg-green-100 text-green-800' },
    FAILED: { label: tOrders('paymentStatuses.failed'), color: 'bg-red-100 text-red-800' },
  }

  // Check if order has pending online payment
  const hasPendingOnlinePayment = (order: any) => {
    const onlinePaymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'WALLET', 'ONLINE_PAYMENT']
    return onlinePaymentMethods.includes(order?.paymentMethod) && order?.paymentStatus === 'PENDING'
  }

  const handleCancelOrder = async () => {
    if (confirm(t('confirmCancel'))) {
      try {
        await cancelOrder.mutateAsync(orderId)
        toast.success(t('orderCancelledSuccess'))
      } catch (error) {
        toast.error(t('orderCancelFailed'))
      }
    }
  }

  const handleDownloadInvoice = async () => {
    if (!order) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/invoice`, {
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to download invoice')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${order.orderNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(t('invoiceDownloaded'))
    } catch (error) {
      toast.error(t('failedToDownloadInvoice'))
    }
  }

  const handleRetryPayment = async () => {
    if (!order) return

    try {
      setIsProcessingPayment(true)

      // Call API to create payment intent
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: 'card',
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create payment intent')
      }

      const data = await res.json()

      if (data.clientSecret) {
        // Redirect to Paymob hosted checkout
        redirectToHostedCheckout(data.clientSecret)
      } else {
        throw new Error('No client secret received')
      }
    } catch (error: any) {
      console.error('Retry payment error:', error)
      toast.error(error.message || t('paymentError'))
      setIsProcessingPayment(false)
    }
  }

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oud-gold"></div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">{t('loadingOrder')}</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('orderNotFound')}</h2>
          <Button asChild>
            <Link href="/orders">{t('backToOrders')}</Link>
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
          <h1 className="text-2xl font-bold">{t('orderNumber', { number: order.orderNumber })}</h1>
          <p className="text-sm text-muted-foreground">
            {t('placedOn', {
              date: format(new Date(order.createdAt), 'MMMM dd, yyyy'),
              time: format(new Date(order.createdAt), 'HH:mm')
            })}
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
              <CardTitle>{t('orderItems')}</CardTitle>
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
                        {t('quantity')}: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('price')}: {formatCurrency(item.price)}
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
                <CardTitle>{t('shippingAddress')}</CardTitle>
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
                <p className="text-muted-foreground mt-2">{t('phone')}: {order.address.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Product Reviews Section - Only for DELIVERED orders */}
          {order.orderStatus === 'DELIVERED' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-oud-gold" />
                  <CardTitle>{t('productReviews')}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('shareYourExperience')}
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
                          {item.product.brand && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.product.brand.name}
                            </p>
                          )}
                          <div className="mt-2">
                            {item.hasReviewed ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <Star className="w-3 h-3 mr-1" />
                                  {t('reviewed')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {t('starsRating', { rating: item.review?.rating || 0 })}
                                </span>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {t('notReviewed')}
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
                              {t('viewReview')}
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-oud-gold hover:bg-oud-gold/90"
                            asChild
                          >
                            <Link href={`/products/${item.product.slug || item.product.id}/write-review?orderId=${order.id}`}>
                              {t('writeReview')}
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
              <CardTitle>{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('subtotal')}</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('shipping')}</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('tax')}</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('discount')}</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('total')}</span>
                <span className="text-oud-gold">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <CardTitle>{t('paymentMethod')}</CardTitle>
                </div>
                {/* Payment Status Badge */}
                {order.paymentStatus && (
                  <Badge className={paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.color || 'bg-gray-100 text-gray-800'} variant="secondary">
                    {paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.label || order.paymentStatus}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                {['CREDIT_CARD', 'DEBIT_CARD', 'WALLET', 'ONLINE_PAYMENT'].includes(order.paymentMethod as string)
                  ? t('creditCard')
                  : t('cashOnDelivery')}
              </p>

              {/* Pending Payment Alert */}
              {hasPendingOnlinePayment(order) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{t('paymentPending')}</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    {t('completePaymentMessage')}
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-oud-gold to-amber-600 hover:from-oud-gold/90 hover:to-amber-600/90 text-white"
                    onClick={handleRetryPayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('processing')}
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('completePayment')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Tracking Timeline */}
          {order.orderStatus !== 'CANCELLED' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <CardTitle>{t('orderTracking')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <OrderTimeline
                  currentStatus={order.orderStatus}
                  trackingNumber={order.trackingNumber}
                  createdAt={order.createdAt}
                  updatedAt={order.updatedAt}
                />
              </CardContent>
            </Card>
          )}

          {/* Download Invoice Button */}
          {order.orderStatus !== 'PENDING' && order.orderStatus !== 'CANCELLED' && (
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleDownloadInvoice}
            >
              <Download className="w-4 h-4" />
              {t('downloadInvoice')}
            </Button>
          )}

          {/* Actions */}
          {order.orderStatus === 'PENDING' && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleCancelOrder}
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending ? t('cancelling') : t('cancelOrder')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
