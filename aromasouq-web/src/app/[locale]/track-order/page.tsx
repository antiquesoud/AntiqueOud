'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'
import { Package, Clock, CheckCircle, XCircle, Truck, Search, Mail, FileText, AlertCircle, CreditCard } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { PaymobCheckout } from '@/components/payment/PaymobCheckout'
import { useRouter } from '@/i18n/navigation'

const statusConfig = {
  PENDING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { icon: Package, color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { icon: Truck, color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  CANCELLED: { icon: XCircle, color: 'bg-red-100 text-red-800' },
}

const paymentStatusConfig = {
  PENDING: { label: 'Payment Pending', color: 'bg-orange-100 text-orange-800' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Payment Failed', color: 'bg-red-100 text-red-800' },
}

export default function TrackOrderPage() {
  const t = useTranslations('track')
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  // Payment state
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isInitializingPayment, setIsInitializingPayment] = useState(false)

  // Track order function
  const handleTrackOrder = useCallback(async (orderNum?: string, orderEmail?: string) => {
    const trackOrderNumber = orderNum || orderNumber
    const trackEmail = orderEmail || email

    if (!trackOrderNumber.trim() || !trackEmail.trim()) {
      toast.error(t('fillAllFields') || 'Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.post<any>('/orders/track', {
        orderNumber: trackOrderNumber.trim(),
        email: trackEmail.trim(),
      })

      setOrderData(response)
      toast.success(t('orderFound') || 'Order found!')
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        t('orderNotFound') ||
        'Order not found. Please check your order number and email.'
      )
      setOrderData(null)
    } finally {
      setIsLoading(false)
    }
  }, [orderNumber, email, t])

  // Auto-fill from URL params and auto-track
  useEffect(() => {
    const urlOrderNumber = searchParams.get('orderNumber')
    const urlEmail = searchParams.get('email')

    if (urlOrderNumber && urlEmail) {
      setOrderNumber(urlOrderNumber)
      setEmail(urlEmail)
      // Auto-track the order
      handleTrackOrder(urlOrderNumber, urlEmail)
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleTrackOrder()
  }

  // Check if order has pending online payment
  const hasPendingOnlinePayment = (order: any) => {
    const onlinePaymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'WALLET', 'ONLINE_PAYMENT']
    return onlinePaymentMethods.includes(order?.paymentMethod) && order?.paymentStatus === 'PENDING'
  }

  // Initialize payment for pending orders
  const handleCompletePayment = async () => {
    if (!orderData?.order?.id) return

    setIsInitializingPayment(true)
    try {
      // Guest orders use guest payment endpoint
      const endpoint = orderData.type === 'guest'
        ? '/payments/create-intent-guest'
        : '/payments/create-intent'

      const paymentIntent = await apiClient.post<{ clientSecret: string }>(endpoint, {
        orderId: orderData.order.id,
      })

      setClientSecret(paymentIntent.clientSecret)
      setShowPaymentForm(true)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initialize payment')
    } finally {
      setIsInitializingPayment(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setClientSecret(null)
    toast.success('Payment successful!')
    // Refresh order data
    handleTrackOrder()
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setClientSecret(null)
    toast('Payment cancelled')
  }

  const renderOrderStatus = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-4 h-4 mr-1" />
        {t(`status.${status.toLowerCase()}`) || status}
      </Badge>
    )
  }

  const renderPaymentStatus = (status: string) => {
    const config = paymentStatusConfig[status as keyof typeof paymentStatusConfig] || paymentStatusConfig.PENDING

    return (
      <Badge className={config.color}>
        <CreditCard className="w-4 h-4 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Search className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">
            {t('title') || 'Track Your Order'}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle') || 'Enter your order number and email to track your order'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('enterDetails') || 'Enter Order Details'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="orderNumber">
                  <FileText className="w-4 h-4 inline mr-2" />
                  {t('orderNumber') || 'Order Number'}
                </Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder={t('orderNumberPlaceholder') || 'ORD-1234567890-ABCDEF'}
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {t('email') || 'Email Address'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder') || 'your@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>{t('searching') || 'Searching...'}</>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    {t('trackButton') || 'Track Order'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {orderData && !showPaymentForm && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle>
                  {t('orderDetails') || 'Order Details'}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {renderOrderStatus(orderData.order.orderStatus)}
                  {/* Show payment status for orders with online payment */}
                  {orderData.order.paymentMethod !== 'CASH_ON_DELIVERY' && (
                    renderPaymentStatus(orderData.order.paymentStatus)
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pending Payment Alert */}
              {hasPendingOnlinePayment(orderData.order) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{t('paymentPending') || 'Payment Not Completed'}</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    {t('completePaymentMessage') || 'Your order has been placed but payment was not completed. Complete payment to confirm your order.'}
                  </p>
                  <Button
                    onClick={handleCompletePayment}
                    className="w-full bg-oud-gold hover:bg-oud-gold/90"
                    disabled={isInitializingPayment}
                  >
                    {isInitializingPayment ? (
                      'Initializing Payment...'
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {t('completePayment') || 'Complete Payment'}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('orderNumberLabel') || 'Order Number'}
                  </p>
                  <p className="font-semibold">{orderData.order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('orderDate') || 'Order Date'}
                  </p>
                  <p className="font-semibold">
                    {format(new Date(orderData.order.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                {orderData.order.trackingNumber && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      {t('trackingNumber') || 'Tracking Number'}
                    </p>
                    <p className="font-semibold">{orderData.order.trackingNumber}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">{t('items') || 'Items'}</h3>
                <div className="space-y-4">
                  {orderData.order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded">
                        <Image
                          src={item.product.images?.[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('quantity') || 'Qty'}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('subtotal') || 'Subtotal'}:</span>
                  <span>{formatCurrency(orderData.order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('shipping') || 'Shipping'}:</span>
                  <span>{formatCurrency(orderData.order.shippingFee || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('tax') || 'Tax'}:</span>
                  <span>{formatCurrency(orderData.order.tax || 0)}</span>
                </div>
                {orderData.order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('discount') || 'Discount'}:</span>
                    <span>-{formatCurrency(orderData.order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>{t('total') || 'Total'}:</span>
                  <span className="text-oud-gold">{formatCurrency(orderData.order.total)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">
                  {t('paymentMethod') || 'Payment Method'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {orderData.order.paymentMethod === 'CASH_ON_DELIVERY'
                    ? (t('cashOnDelivery') || 'Cash on Delivery')
                    : orderData.order.paymentMethod === 'ONLINE_PAYMENT' || orderData.order.paymentMethod === 'CREDIT_CARD'
                    ? (t('onlinePayment') || 'Online Payment')
                    : orderData.order.paymentMethod}
                </p>
              </div>

              {/* Shipping Address */}
              {orderData.type === 'user' && orderData.order.address && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">
                    {t('shippingAddress') || 'Shipping Address'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {orderData.order.address.fullName}
                    <br />
                    {orderData.order.address.addressLine1 || orderData.order.address.street}
                    {orderData.order.address.addressLine2 && (
                      <>, {orderData.order.address.addressLine2}</>
                    )}
                    {orderData.order.address.building && (
                      <>, {orderData.order.address.building}</>
                    )}
                    <br />
                    {orderData.order.address.city}, {orderData.order.address.state || orderData.order.address.country}
                    <br />
                    {t('phone') || 'Phone'}: {orderData.order.address.phone}
                  </p>
                </div>
              )}

              {/* Guest Order Shipping Address */}
              {orderData.type === 'guest' && orderData.order.shippingAddress && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">
                    {t('shippingAddress') || 'Shipping Address'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {orderData.order.shippingAddress.fullName}
                    <br />
                    {orderData.order.shippingAddress.street}
                    {orderData.order.shippingAddress.building && (
                      <>, {orderData.order.shippingAddress.building}</>
                    )}
                    <br />
                    {orderData.order.shippingAddress.city}, {orderData.order.shippingAddress.country}
                    <br />
                    {t('phone') || 'Phone'}: {orderData.order.guestPhone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {showPaymentForm && clientSecret && orderData && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <PaymobCheckout
                clientSecret={clientSecret}
                orderId={orderData.order.id}
                total={orderData.order.total}
                isGuestOrder={orderData.type === 'guest'}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
