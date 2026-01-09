'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { CheckCircle, Package, ArrowRight, XCircle, Clock, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'

type PaymentState = 'success' | 'pending' | 'failed' | 'cancelled' | 'loading' | 'error'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('orderSuccessPage')
  const orderId = searchParams.get('orderId')

  // Get hydration state from auth store
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const queryClient = useQueryClient()
  const cartClearedRef = useRef(false)

  // Check Paymob redirect parameters
  // Paymob uses these params: success, pending, txn_response_code, message
  const paymobSuccess = searchParams.get('success')
  const paymobPending = searchParams.get('pending')
  const paymobTxnCode = searchParams.get('txn_response_code')
  const paymobMessage = searchParams.get('message') || searchParams.get('error_occured')

  // Guest email passed in URL for guest orders (needed to fetch order)
  const guestEmail = searchParams.get('guestEmail')

  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentState, setPaymentState] = useState<PaymentState>('loading')
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Determine initial payment state from Paymob URL params
  const getPaymentStateFromParams = useCallback(() => {
    // Paymob success param
    if (paymobSuccess === 'false') {
      return 'failed'
    }
    if (paymobSuccess === 'true') {
      return 'success'
    }
    // Paymob pending param
    if (paymobPending === 'true') {
      return 'pending'
    }
    // Check transaction response code (Paymob specific)
    // Code 0 or empty usually means success, non-zero means failure
    if (paymobTxnCode && paymobTxnCode !== '0' && paymobTxnCode !== '') {
      return 'failed'
    }
    return null // Unknown - will check order status
  }, [paymobSuccess, paymobPending, paymobTxnCode])

  // Fetch order with retry logic
  const fetchOrder = useCallback(async (isRetry = false) => {
    if (!orderId) return

    setIsLoading(true)
    setFetchError(null)

    try {
      // Try authenticated endpoint first
      let data: any = null

      try {
        data = await apiClient.get(`/orders/${orderId}`)
      } catch (authError: any) {
        // If 401 and not authenticated, try guest endpoint with email
        if (authError?.response?.status === 401 || authError?.response?.status === 403) {
          try {
            // Guest orders require email parameter
            const emailParam = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''
            data = await apiClient.get(`/guest-orders/${orderId}${emailParam}`)
          } catch (guestError) {
            // Both failed - re-throw the original error
            throw authError
          }
        } else {
          throw authError
        }
      }

      setOrder(data)

      // Determine payment state
      const paramState = getPaymentStateFromParams()

      if (paramState) {
        // Paymob params take precedence
        setPaymentState(paramState)
      } else {
        // Fall back to order status from database
        if (data.paymentStatus === 'PAID') {
          setPaymentState('success')
        } else if (data.paymentStatus === 'FAILED') {
          setPaymentState('failed')
        } else if (data.paymentStatus === 'PENDING') {
          // For pending, check if it's COD (no online payment needed)
          if (data.paymentMethod === 'CASH_ON_DELIVERY') {
            setPaymentState('success')
          } else {
            setPaymentState('pending')
          }
        } else {
          setPaymentState('pending')
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch order:', error)

      // Don't set error state if we can determine from Paymob params
      const paramState = getPaymentStateFromParams()
      if (paramState) {
        setPaymentState(paramState)
      } else {
        setFetchError('Unable to load order details')
        setPaymentState('error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [orderId, guestEmail, getPaymentStateFromParams])

  // Wait for hydration, then fetch order
  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    // Wait for Zustand to hydrate from localStorage
    if (!hasHydrated) {
      return
    }

    // Small delay to ensure cookies are properly set after redirect
    const timer = setTimeout(() => {
      fetchOrder()
    }, 100)

    return () => clearTimeout(timer)
  }, [orderId, router, hasHydrated, fetchOrder])

  // Retry handler
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchOrder(true)
  }

  // Clear cart when payment is successful (handles redirect from Paymob)
  useEffect(() => {
    if (paymentState === 'success' && !cartClearedRef.current) {
      cartClearedRef.current = true

      const clearCart = async () => {
        try {
          // Try to clear authenticated cart first
          if (isAuthenticated) {
            await apiClient.delete('/cart')
          } else {
            // Try guest cart
            await apiClient.delete('/guest-cart')
          }
          // Invalidate cart queries to update UI
          queryClient.invalidateQueries({ queryKey: ['cart'] })
          console.log('[OrderSuccess] Cart cleared successfully')
        } catch (error) {
          // Cart might already be empty or cleared by webhook - ignore
          console.log('[OrderSuccess] Cart clear skipped (may already be empty):', error)
        }
      }

      clearCart()
    }
  }, [paymentState, isAuthenticated, queryClient])

  // Show loading while hydrating or fetching
  if (!hasHydrated || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-oud-gold" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Error state with retry option
  if (paymentState === 'error' && !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Order</h1>
            <p className="text-gray-600">{fetchError || 'There was an issue loading your order details.'}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleRetry} className="bg-oud-gold hover:bg-oud-gold/90">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/orders">View My Orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Payment failed/cancelled UI
  if (paymentState === 'failed' || paymentState === 'cancelled') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {paymentState === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
            </h1>
            <p className="text-gray-600">
              {paymentState === 'cancelled'
                ? 'Your payment was cancelled. Your order has not been processed.'
                : paymobMessage || 'There was an issue processing your payment. Please try again.'}
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">What happened?</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {paymentState === 'cancelled'
                      ? 'You cancelled the payment process. No charges were made to your account.'
                      : 'Your payment could not be processed. This could be due to insufficient funds, card restrictions, or a technical issue.'}
                  </p>
                </div>
              </div>

              {order && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Order Reference:</p>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Amount: <span className="font-semibold text-oud-gold">{formatCurrency(order.total)}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Show guest-appropriate retry link */}
            {order?.guestEmail ? (
              <Button asChild className="flex-1 bg-gradient-to-r from-oud-gold to-amber-600 hover:from-oud-gold/90 hover:to-amber-600/90 text-white">
                <Link href={`/track-order?orderNumber=${order.orderNumber}&email=${order.guestEmail}`}>
                  View Order & Retry
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild className="flex-1 bg-gradient-to-r from-oud-gold to-amber-600 hover:from-oud-gold/90 hover:to-amber-600/90 text-white">
                <Link href="/checkout">
                  Try Again
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="flex-1">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Payment pending UI
  if (paymentState === 'pending') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
              <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Processing</h1>
            <p className="text-gray-600 mb-2">Your payment is being processed. This may take a moment.</p>
            <p className="text-sm text-gray-500">You will receive a confirmation email once complete.</p>
          </div>

          {order && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-600">Order Reference:</p>
                    <p className="font-semibold">{order.orderNumber}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Amount:</p>
                    <p className="font-semibold text-oud-gold">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Status
            </Button>
            {/* Show guest-appropriate link */}
            {order?.guestEmail ? (
              <Button asChild variant="outline">
                <Link href={`/track-order?orderNumber=${order.orderNumber}&email=${order.guestEmail}`}>Track Order</Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/account/orders">View My Orders</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // No order found
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">{t('orderNotFound')}</p>
          <div className="flex gap-4 justify-center mt-4">
            <Button asChild>
              <Link href="/account/orders">View My Orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">{t('goHome')}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Success UI
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('orderDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600">{t('orderNumber')}</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('orderDate')}</p>
                <p className="font-semibold">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600">{t('totalAmount')}</p>
                <p className="text-2xl font-bold text-oud-gold">{formatCurrency(order.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('paymentStatus')}</p>
                <p className="font-semibold text-green-600 capitalize">
                  {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Pay on Delivery' : order.paymentStatus}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">{t('deliveryAddress')}</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{order.address?.fullName || order.address?.name}</p>
                <p className="text-sm text-gray-600">{order.address?.addressLine1 || order.address?.street}</p>
                {order.address?.addressLine2 && (
                  <p className="text-sm text-gray-600">{order.address.addressLine2}</p>
                )}
                <p className="text-sm text-gray-600">
                  {order.address?.city}, {order.address?.state} {order.address?.zipCode}
                </p>
                <p className="text-sm text-gray-600">{order.address?.country}</p>
                <p className="text-sm text-gray-600 mt-2">Phone: {order.address?.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <p className="text-sm text-gray-600 mb-2">{t('itemsOrdered')} ({order.items?.length || 0})</p>
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.nameEn || item.product?.name}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">{item.variant.name}</p>
                      )}
                      <p className="text-sm text-gray-600">{t('quantity')}: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('whatsNext')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-oud-gold text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">{t('confirmation')}</p>
                <p className="text-sm text-gray-600">
                  {t('confirmationDesc').replace('{email}', order.user?.email || order.guestEmail || 'your email')}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-oud-gold text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">{t('processing')}</p>
                <p className="text-sm text-gray-600">{t('processingDesc')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">{t('delivery')}</p>
                <p className="text-sm text-gray-600">{t('deliveryDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Show different link based on whether it's a guest order */}
          {order.guestEmail ? (
            <Button asChild className="flex-1 bg-gradient-to-r from-oud-gold to-amber-600 hover:from-oud-gold/90 hover:to-amber-600/90">
              <Link href={`/track-order?orderNumber=${order.orderNumber}&email=${order.guestEmail}`}>
                {t('trackOrder')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild className="flex-1 bg-gradient-to-r from-oud-gold to-amber-600 hover:from-oud-gold/90 hover:to-amber-600/90">
              <Link href={`/account/orders/${order.id}`}>
                {t('viewOrderDetails')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="flex-1">
            <Link href="/products">{t('continueShopping')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
