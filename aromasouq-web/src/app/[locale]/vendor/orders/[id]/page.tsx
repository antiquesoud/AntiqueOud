"use client"

import { useState } from "react"
import { useParams, useRouter } from "@/i18n/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { ArrowLeft, Package, MapPin, User, CreditCard, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const statusLabels: Record<string, string> = {
  PENDING: 'statusPending',
  CONFIRMED: 'statusConfirmed',
  PROCESSING: 'statusProcessing',
  SHIPPED: 'statusShipped',
  DELIVERED: 'statusDelivered',
  CANCELLED: 'statusCancelled',
}

const statusFlow: Record<string, string> = {
  PENDING: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
}

export default function VendorOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const orderId = params.id as string
  const t = useTranslations('vendor.orderDetail')

  const [trackingNumber, setTrackingNumber] = useState("")

  const { data: order, isLoading } = useQuery({
    queryKey: ['vendor-order', orderId],
    queryFn: () => apiClient.get<any>(`/vendor/orders/${orderId}`),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderStatus, trackingNumber }: { orderStatus: string; trackingNumber?: string }) =>
      apiClient.put(`/vendor/orders/${orderId}/status`, { orderStatus, trackingNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
      toast.success(t('updating'))
      setTrackingNumber("")
    },
    onError: () => {
      toast.error(t('updating'))
    },
  })

  const handleStatusUpdate = (newStatus: string) => {
    const payload: any = { orderStatus: newStatus }
    if (newStatus === 'SHIPPED' && trackingNumber) {
      payload.trackingNumber = trackingNumber
    }
    updateStatusMutation.mutate(payload)
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
            <Link href="/vendor/orders">{t('backToOrders')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const nextStatus = statusFlow[order.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vendor/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{t('orderNumber', { number: order.orderNumber })}</h1>
          <p className="text-muted-foreground">
            {t('placedOn', { date: formatDate(order.createdAt) })}
          </p>
        </div>
        <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
          {t(statusLabels[order.status] || order.status.toLowerCase())}
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
                {order.items?.map((item: any) => (
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
                      <h3 className="font-medium">{item.product.name}</h3>
                      {item.variant && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {item.variant.size}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.variant.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            SKU: {item.variant.sku}
                          </span>
                        </div>
                      )}
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

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <CardTitle>{t('customer')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-muted-foreground">{order.customerEmail}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <CardTitle>{t('shippingAddress')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {order.address ? (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{order.address.fullName}</p>
                    <p className="text-muted-foreground">{order.address.street}</p>
                    <p className="text-muted-foreground">{order.address.apartment}</p>
                    <p className="text-muted-foreground">
                      {order.address.city}, {order.address.state} {order.address.zipCode}
                    </p>
                    <p className="text-muted-foreground">{order.address.country}</p>
                    <p className="text-muted-foreground mt-2">
                      <span className="font-medium">Phone:</span> {order.address.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('addressDetails')}</p>
                )}
              </CardContent>
            </Card>
          </div>
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
                <span>{t('itemsCount', { count: order.itemCount })}</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('vendorTotal')}</span>
                <span className="text-oud-gold">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Update Actions */}
          {nextStatus && (
            <Card>
              <CardHeader>
                <CardTitle>{t('updateOrderStatus')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {t('currentStatus', { status: order.status })}
                </div>

                {nextStatus === 'SHIPPED' && (
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">{t('trackingNumber')}</Label>
                    <Input
                      id="trackingNumber"
                      placeholder={t('trackingNumberPlaceholder')}
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending
                    ? t('updating')
                    : t('markAs', { status: nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase() })}
                </Button>

                <p className="text-xs text-muted-foreground">
                  {t('notifyCustomer')}
                </p>
              </CardContent>
            </Card>
          )}

          {order.status === 'DELIVERED' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('orderComplete')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('orderCompleteDesc')}
                </p>
              </CardContent>
            </Card>
          )}

          {order.status === 'CANCELLED' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('orderCancelled')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('orderCancelledDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
