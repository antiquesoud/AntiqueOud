'use client'

import { useState } from 'react'
import { Search, Eye, Package, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'

export default function AdminOrdersPage() {
  const t = useTranslations('admin.orders')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string>('ALL')

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-orders', { search, status: activeTab === 'ALL' ? undefined : activeTab }],
    queryFn: () => apiClient.get('/admin/orders', {
      search: search || undefined,
      status: activeTab === 'ALL' ? undefined : activeTab,
      page: 1,
      limit: 50,
    }),
  })

  const orders = Array.isArray(data) ? data : (data?.data || [])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      PROCESSING: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
      SHIPPED: { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
      DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    }

    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Group items by vendor and calculate totals
  const getVendorSummary = (order: any) => {
    const vendorMap = new Map<string, { name: string; items: number; total: number }>()

    order.items?.forEach((item: any) => {
      const vendorId = item.product?.vendor?.id || 'unknown'
      const vendorName = item.product?.vendor?.businessName || 'Unknown Vendor'

      if (vendorMap.has(vendorId)) {
        const current = vendorMap.get(vendorId)!
        current.items += item.quantity
        current.total += item.price * item.quantity
      } else {
        vendorMap.set(vendorId, {
          name: vendorName,
          items: item.quantity,
          total: item.price * item.quantity,
        })
      }
    })

    return Array.from(vendorMap.values())
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-deep-navy">Orders Management</h1>
        <p className="text-gray-600 mt-1">View and manage all platform orders from all vendors</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number, customer name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ALL">All Orders</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
          <TabsTrigger value="PROCESSING">Processing</TabsTrigger>
          <TabsTrigger value="SHIPPED">Shipped</TabsTrigger>
          <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders ({orders?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading orders...</div>
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vendor(s) & Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => {
                        const vendorSummary = getVendorSummary(order)
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-mono text-sm">#{order.orderNumber}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {order.user?.firstName} {order.user?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {vendorSummary.map((vendor, idx) => (
                                  <div key={idx} className="flex items-center gap-1 text-sm">
                                    <Store className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-medium">{vendor.name}</span>
                                    <span className="text-muted-foreground">
                                      ({vendor.items} items - {formatCurrency(vendor.total)})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{formatCurrency(order.total)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {order.items?.length || 0} items total
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  variant="outline"
                                  className={
                                    order.paymentMethod === 'CREDIT_CARD'
                                      ? 'bg-blue-50 text-blue-700'
                                      : order.paymentMethod === 'CASH_ON_DELIVERY'
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-gray-50 text-gray-700'
                                  }
                                >
                                  {order.paymentMethod === 'CREDIT_CARD' ? 'Card' :
                                   order.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' :
                                   order.paymentMethod}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    order.paymentStatus === 'PAID'
                                      ? 'bg-green-50 text-green-700'
                                      : order.paymentStatus === 'PENDING'
                                      ? 'bg-yellow-50 text-yellow-700'
                                      : 'bg-red-50 text-red-700'
                                  }
                                >
                                  {order.paymentStatus}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                            <TableCell>
                              <p className="text-sm">{formatDate(order.createdAt)}</p>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/orders/${order.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
