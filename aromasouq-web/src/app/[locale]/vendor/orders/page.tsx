"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Eye, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api-client"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils"
import toast from "react-hot-toast"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

const statusColors: Record<string, string> = {
  PENDING: "bg-[#B3967D]/100 text-[#B3967D]/800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default function VendorOrdersPage() {
  const t = useTranslations('vendor.orders')
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendor-orders', searchQuery, statusFilter],
    queryFn: () => apiClient.get<{ data: any[] }>('/vendor/orders', {
      search: searchQuery,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }: { orderId: string; orderStatus: string }) =>
      apiClient.put(`/vendor/orders/${orderId}/status`, { orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
      toast.success(t('orderStatusUpdated'))
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('manageOrders')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
            <TabsTrigger value="PENDING">{t('pending')}</TabsTrigger>
            <TabsTrigger value="PROCESSING">{t('processing')}</TabsTrigger>
            <TabsTrigger value="SHIPPED">{t('shipped')}</TabsTrigger>
            <TabsTrigger value="DELIVERED">{t('delivered')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('orderNumber')}</TableHead>
              <TableHead>{t('customer')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('items')}</TableHead>
              <TableHead>{t('total')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : (!orders?.data || orders?.data?.length === 0) ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-muted-foreground">{t('noOrdersFound')}</p>
                </TableCell>
              </TableRow>
            ) : (
              orders?.data?.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/vendor/orders/${order.id}`} className="hover:text-oud-gold">
                      #{order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{formatDate(order.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{t('itemsCount', { count: order.itemCount })}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({
                            orderId: order.id,
                            orderStatus: 'PROCESSING'
                          })}
                        >
                          {t('process')}
                        </Button>
                      )}
                      {order.status === 'PROCESSING' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({
                            orderId: order.id,
                            orderStatus: 'SHIPPED'
                          })}
                        >
                          {t('ship')}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/vendor/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
