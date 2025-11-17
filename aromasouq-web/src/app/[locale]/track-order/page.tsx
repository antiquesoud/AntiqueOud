'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'
import { Package, Clock, CheckCircle, XCircle, Truck, Search, Mail, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'

const statusConfig = {
  PENDING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { icon: Package, color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { icon: Truck, color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  CANCELLED: { icon: XCircle, color: 'bg-red-100 text-red-800' },
}

export default function TrackOrderPage() {
  const t = useTranslations('track')
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orderNumber.trim() || !email.trim()) {
      toast.error(t('fillAllFields') || 'Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.post<any>('/orders/track', {
        orderNumber: orderNumber.trim(),
        email: email.trim(),
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
            <form onSubmit={handleTrackOrder} className="space-y-4">
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

        {orderData && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {t('orderDetails') || 'Order Details'}
                </CardTitle>
                {renderOrderStatus(orderData.order.orderStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
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
                  <span>{formatCurrency(orderData.order.total)}</span>
                </div>
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
                    {orderData.order.address.street}, {orderData.order.address.building}
                    <br />
                    {orderData.order.address.city}, {orderData.order.address.country}
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
                    {orderData.order.shippingAddress.street}, {orderData.order.shippingAddress.building}
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
      </div>
    </div>
  )
}
