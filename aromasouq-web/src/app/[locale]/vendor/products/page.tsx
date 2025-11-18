"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder"
import { apiClient } from "@/lib/api-client"
import { formatCurrency } from "@/lib/utils"
import { getFirstProductImage } from "@/lib/image-utils"
import toast from "react-hot-toast"

export default function VendorProductsPage() {
  const t = useTranslations('vendor.products')
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [expandedProducts, setExpandedProducts] = useState<string[]>([])

  const { data: products, isLoading } = useQuery({
    queryKey: ['vendor-products', searchQuery, statusFilter],
    queryFn: async () => {
      const result = await apiClient.get<{ data: any[] }>('/vendor/products', {
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      console.log('Vendor products:', result)
      if (result.data && result.data.length > 0) {
        console.log('First product:', result.data[0])
        console.log('First product variants:', result.data[0].variants)
      }
      return result
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => apiClient.delete(`/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
      toast.success(t('productDeleted'))
      setDeleteProductId(null)
    },
    onError: () => {
      toast.error(t('failedToDelete'))
    },
  })

  const toggleVariantsExpanded = (productId: string) => {
    setExpandedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('manageProducts')}
          </p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/vendor/products/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('addProduct')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="draft">{t('draft')}</SelectItem>
                <SelectItem value="pending">{t('pendingReview')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('tableProduct')}</TableHead>
              <TableHead>{t('tableSKU')}</TableHead>
              <TableHead>{t('tablePrice')}</TableHead>
              <TableHead>{t('tableStock')}</TableHead>
              <TableHead>{t('tableStatus')}</TableHead>
              <TableHead>{t('tableSales')}</TableHead>
              <TableHead className="text-right">{t('tableActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : products?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">{t('noProductsFound')}</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/vendor/products/new">{t('addFirstProduct')}</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              products?.data?.map((product: any) => (
                <React.Fragment key={product.id}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {getFirstProductImage(product) ? (
                            <Image
                              src={getFirstProductImage(product)!}
                              alt={product.name || product.nameEn || 'Product image'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ProductImagePlaceholder className="w-full h-full" size="sm" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.nameEn}</p>
                          <p className="text-sm text-muted-foreground">{product.category?.nameEn}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      {product.variants && product.variants.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {product.variants.length} Variants
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => toggleVariantsExpanded(product.id)}
                          >
                            {expandedProducts.includes(product.id) ? 'Hide' : 'Show'} Details
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold">{formatCurrency(product.price || 0)}</p>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.compareAtPrice)}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.salesCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${product.slug}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('view')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/vendor/products/${product.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('edit')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteProductId(product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Variant rows (expandable) */}
                {expandedProducts.includes(product.id) && product.variants?.map((variant: any) => (
                  <TableRow key={variant.id} className="bg-muted/30">
                    <TableCell className="pl-16">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {variant.size}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{variant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{variant.sku}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm">{formatCurrency(variant.price)}</p>
                        {variant.salePrice && (
                          <p className="text-xs text-green-600">
                            Sale: {formatCurrency(variant.salePrice)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant.stock < 10 ? 'destructive' : 'secondary'} className="text-xs">
                        {variant.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        Edit Variant
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && deleteMutation.mutate(deleteProductId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
