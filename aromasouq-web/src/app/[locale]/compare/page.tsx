'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useComparison } from '@/hooks/useComparison'
import { formatCurrency } from '@/lib/utils'
import { getFirstProductImage } from '@/lib/image-utils'

export default function ComparePage() {
  const { products, removeProduct, clear } = useComparison()

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-12">
          <h1 className="text-2xl font-playfair font-bold text-deep-navy mb-2">
            Product Comparison
          </h1>
          <p className="text-muted-foreground mb-6">
            You haven't added any products to compare yet
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-deep-navy">
            Compare Products ({products.length}/3)
          </h1>
          <p className="text-muted-foreground">Side-by-side comparison</p>
        </div>
        <Button variant="outline" onClick={clear}>
          Clear All
        </Button>
      </div>

      {/* Comparison Table */}
      <Card className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {/* Product Images */}
            <tr>
              <td className="p-4 font-medium bg-gray-50 w-48">Product</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center relative">
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden mb-3">
                    <Image
                      src={getFirstProductImage(product) || '/placeholder.png'}
                      alt={product.nameEn}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-medium hover:text-oud-gold"
                  >
                    {product.nameEn}
                  </Link>
                  <p className="text-sm text-muted-foreground">{product.brand?.nameEn}</p>
                </td>
              ))}
            </tr>

            {/* Price */}
            <tr>
              <td className="p-4 font-medium bg-gray-50">Price</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <p className="text-xl font-bold text-oud-gold">
                    {formatCurrency(product.salePrice || product.regularPrice)}
                  </p>
                  {product.salePrice && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.regularPrice)}
                    </p>
                  )}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr>
              <td className="p-4 font-medium bg-gray-50">Rating</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.averageRating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(product.averageRating || 0).toFixed(1)} ({product.reviewCount || 0})
                  </p>
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr>
              <td className="p-4 font-medium bg-gray-50">Category</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <Badge variant="outline">{product.category?.nameEn}</Badge>
                </td>
              ))}
            </tr>

            {/* Stock Status */}
            <tr>
              <td className="p-4 font-medium bg-gray-50">Availability</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  {product.stockQuantity > 10 ? (
                    <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                  ) : product.stockQuantity > 0 ? (
                    <Badge className="bg-amber-100 text-amber-800">
                      Only {product.stockQuantity} left
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                  )}
                </td>
              ))}
            </tr>

            {/* Description */}
            <tr>
              <td className="p-4 font-medium bg-gray-50 align-top">Description</td>
              {products.map((product) => (
                <td key={product.id} className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {product.descriptionEn}
                  </p>
                </td>
              ))}
            </tr>

            {/* Scent Notes (if available) */}
            {products.some((p) => p.scentProfile) && (
              <>
                <tr>
                  <td className="p-4 font-medium bg-gray-50">Top Notes</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm">
                      {product.scentProfile?.topNotes?.join(', ') || '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium bg-gray-50">Heart Notes</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm">
                      {product.scentProfile?.heartNotes?.join(', ') || '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium bg-gray-50">Base Notes</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm">
                      {product.scentProfile?.baseNotes?.join(', ') || '-'}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {/* Actions */}
            <tr>
              <td className="p-4 font-medium bg-gray-50">Actions</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <div className="space-y-2">
                    <Button className="w-full" asChild>
                      <Link href={`/products/${product.slug}`}>View Details</Link>
                    </Button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}
