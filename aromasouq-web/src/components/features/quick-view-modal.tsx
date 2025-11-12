'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingCart, Heart, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProductImagePlaceholder } from '@/components/ui/product-image-placeholder'
import { formatCurrency } from '@/lib/utils'
import { getProductImageUrl } from '@/lib/image-utils'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { ScentPyramid } from './scent-pyramid'
import toast from 'react-hot-toast'

interface Product {
  id: string
  slug: string
  nameEn: string
  descriptionEn: string
  regularPrice: number
  salePrice?: number
  stockQuantity: number
  averageRating: number
  reviewCount: number
  images?: { id: string; url: string }[]
  brand?: { nameEn: string }
  category?: { nameEn: string }
  variants?: { id: string; name: string; price: number; stock: number }[]
  scentProfile?: {
    topNotes: string[]
    heartNotes: string[]
    baseNotes: string[]
  }
}

interface QuickViewModalProps {
  product: Product | null
  open: boolean
  onClose: () => void
}

export function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>()
  const [quantity, setQuantity] = useState(1)

  const { addToCart } = useCart()
  const { wishlist, toggleWishlist } = useWishlist()

  if (!product) return null

  const isWishlisted = wishlist?.some((p: any) => p.id === product.id) || false
  const finalPrice = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.price || product.regularPrice
    : product.salePrice || product.regularPrice
  const finalStock = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.stock || product.stockQuantity
    : product.stockQuantity

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      variantId: selectedVariant,
      quantity,
    })
    toast.success(`${product.nameEn} added to cart`)
  }

  const handleToggleWishlist = () => {
    toggleWishlist(product.id)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
            >
              {/* Left: Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                  {getProductImageUrl(product, selectedImage) ? (
                    <Image
                      src={getProductImageUrl(product, selectedImage)!}
                      alt={product.nameEn}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <ProductImagePlaceholder className="w-full h-full" size="lg" />
                  )}

                  {/* Wishlist Heart */}
                  <button
                    onClick={handleToggleWishlist}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 transition-all ${
                        isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'
                      }`}
                    />
                  </button>
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          selectedImage === index ? 'border-oud-gold' : 'border-transparent'
                        }`}
                      >
                        <Image src={image.url} alt={`${product.nameEn} view ${index + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="space-y-6">
                {/* Close Button */}
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Title & Brand */}
                <div>
                  <p className="text-sm text-oud-gold font-medium mb-1">{product.brand?.nameEn}</p>
                  <h2 className="text-2xl font-playfair font-bold text-deep-navy mb-2">
                    {product.nameEn}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.averageRating || 0)
                              ? 'text-[#B3967D]/400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {(product.averageRating || 0).toFixed(1)} ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-deep-navy">
                    {formatCurrency(finalPrice)}
                  </span>
                  {product.salePrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(product.regularPrice)}
                    </span>
                  )}
                </div>

                {/* Coins Earned */}
                <div className="flex items-center gap-2 text-sm text-oud-gold">
                  <span className="font-medium">
                    Earn {Math.floor(finalPrice * 0.01 / 0.1)} coins with this purchase
                  </span>
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Size</label>
                    <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose size" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.name} - {formatCurrency(variant.price)}
                            {variant.stock < 10 && variant.stock > 0 && (
                              <span className="text-[#B3967D]/600 ml-2">(Only {variant.stock} left)</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Short Description */}
                <p className="text-sm text-gray-600 line-clamp-3">{product.descriptionEn}</p>

                {/* Scent Pyramid (if available) */}
                {product.scentProfile && (
                  <ScentPyramid
                    topNotes={product.scentProfile.topNotes}
                    heartNotes={product.scentProfile.heartNotes}
                    baseNotes={product.scentProfile.baseNotes}
                    compact
                  />
                )}

                {/* Stock Status */}
                {finalStock > 0 && finalStock < 10 && (
                  <Badge variant="outline" className="bg-[#B3967D]/50 text-[#B3967D]/700 border-[#B3967D]/300">
                    Only {finalStock} left in stock!
                  </Badge>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={finalStock === 0}
                    className="flex-1"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {finalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>

                  <Button variant="outline" size="lg" asChild>
                    <Link href={`/products/${product.slug}`}>
                      View Full Details
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
