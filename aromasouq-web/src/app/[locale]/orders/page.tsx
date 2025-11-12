'use client'

import { useState } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'

const statusConfig = {
  PENDING: { label: 'Pending', icon: Clock, color: 'bg-[#B3967D]/100 text-[#B3967D]/800' },
  CONFIRMED: { label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
}

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrders(page, 10)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading your orders...</div>
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {data.data.map((order) => {
          const StatusIcon = statusConfig[order.orderStatus as keyof typeof statusConfig]?.icon || Package
          const statusClass = statusConfig[order.orderStatus as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'

          return (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge className={statusClass} variant="secondary">
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusConfig[order.orderStatus as keyof typeof statusConfig]?.label || order.orderStatus}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Deliver to: {order.address.fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.address.city}, {order.address.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-oud-gold">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                    {order.orderStatus === 'PENDING' && (
                      <Button variant="destructive" size="sm" className="flex-1">
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
            disabled={page === data.meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
