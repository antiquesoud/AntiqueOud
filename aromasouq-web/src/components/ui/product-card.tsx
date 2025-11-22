"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Play, ShoppingCart, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlareCard } from "@/components/aceternity/glare-card"
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder"
import { cn, formatCurrency, calculateDiscount } from "@/lib/utils"
import { getFirstProductImage, isPlaceholderImage } from "@/lib/image-utils"
import { Product } from "@/types"
import { useTranslations, useLocale } from "next-intl"
import { useDirection } from "@/lib/rtl-utils"

interface ProductCardProps {
  product: Product
  featured?: boolean
  showVideo?: boolean
  onQuickView?: (product: any) => void
  onAddToCart?: (product: any) => void
  onToggleWishlist?: (product: any) => void
  isWishlisted?: boolean
  className?: string
  compact?: boolean
}

export function ProductCard({
  product,
  featured = false,
  showVideo = true,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  className,
  compact = false,
}: ProductCardProps) {
  const t = useTranslations('products')
  const locale = useLocale()
  const { isRTL } = useDirection()

  // Handle both API response formats
  const hasVideo = showVideo && product.videos && product.videos.length > 0
  const regularPrice = (product as any).regularPrice || (product as any).price || 0
  const salePrice = (product as any).salePrice
  const discount = salePrice ? calculateDiscount(regularPrice, salePrice) : 0
  const stockQuantity = (product as any).stockQuantity || (product as any).stock || 0
  const isLowStock = stockQuantity > 0 && stockQuantity < 5

  // Get product image (returns placeholder if no image available)
  const productImage = getFirstProductImage(product)
  const isPlaceholder = isPlaceholderImage(productImage)

  const brandName = (product.brand as any)?.name || product.brand?.nameEn || (product as any).vendor?.businessName || 'Premium Brand'
  // Use Arabic name if locale is 'ar' and nameAr exists, otherwise use English name
  const productName = (locale === 'ar' && (product as any).nameAr)
    ? (product as any).nameAr
    : ((product as any).name || product.nameEn || 'Product')

  // Handle rating - check multiple possible field names
  const rating = product.rating || (product as any).averageRating || 0
  const reviewCount = product.reviewCount || (product as any).reviewCount || 0

  const CardWrapper = featured ? GlareCard : React.Fragment
  const wrapperProps = featured ? { className: "h-full" } : {}

  return (
    <CardWrapper {...wrapperProps}>
      <motion.div
        whileHover={{ y: compact ? -4 : -8 }}
        transition={{ duration: 0.3 }}
        className={cn("h-full", className)}
      >
        <Card className={cn(
          "h-full overflow-hidden transition-all duration-300",
          compact ? "hover:shadow-lg rounded-lg" : "hover:shadow-xl rounded-xl"
        )}>
          {/* Image Container */}
          <div className={cn(
            "relative overflow-hidden bg-gradient-to-br from-[#f8f8f8] via-[#f0f0f0] to-[#e8e8e8]",
            "aspect-square"
          )}>
            <Link href={`/products/${product.slug}`}>
              <Image
                src={productImage}
                alt={productName}
                fill
                className={isPlaceholder
                  ? "object-contain p-2 transition-transform duration-500 hover:scale-105"
                  : "object-cover transition-transform duration-500 hover:scale-110"
                }
              />
            </Link>

            {/* Badges */}
            <div className={cn(
              "absolute flex flex-col gap-1",
              compact ? "top-1.5" : "top-2",
              isRTL ? (compact ? "right-1.5" : "right-2") : (compact ? "left-1.5" : "left-2")
            )}>
              {product.createdAt && new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                <Badge className={cn(
                  "bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] border-0 text-white font-bold",
                  compact ? "text-[8px] py-0.5 px-1.5" : "text-[9px] py-0.5 px-2"
                )}>
                  {t('new')}
                </Badge>
              )}
              {discount > 0 && (
                <Badge className={cn(
                  "bg-gradient-to-br from-[#EF5350] to-[#E57373] border-0 text-white font-bold",
                  compact ? "text-[8px] py-0.5 px-1.5" : "text-[9px] py-0.5 px-2"
                )}>
                  {t('sale')} -{discount}%
                </Badge>
              )}
              {isLowStock && (
                <Badge className={cn(
                  "bg-gradient-to-br from-[#550000] to-[#6b0000] border-0 text-white font-bold shadow-[0_2px_8px_rgba(85,0,0,0.3)]",
                  compact ? "text-[8px] py-0.5 px-1.5" : "text-[9px] py-0.5 px-2"
                )}>
                  {stockQuantity} {t('left')}
                </Badge>
              )}
              {(product as any).salesCount && (product as any).salesCount > 0 && (
                <Badge className={cn(
                  "bg-gradient-to-br from-[#B3967D] to-[#B3967D] border-0 text-white font-bold shadow-[0_2px_8px_rgba(179,150,125,0.3)]",
                  compact ? "text-[8px] py-0.5 px-1.5" : "text-[9px] py-0.5 px-2"
                )}>
                  {(product as any).salesCount}
                </Badge>
              )}
            </div>

            {/* Wishlist Heart */}
            <motion.button
              whileTap={{ scale: 1.2 }}
              onClick={(e) => {
                e.preventDefault()
                onToggleWishlist?.(product)
              }}
              className={cn(
                "absolute rounded-full bg-white/90 hover:bg-white shadow-md transition-all hover:scale-110",
                compact ? "top-1.5 p-1" : "top-2 p-1.5",
                isRTL ? (compact ? "left-1.5" : "left-2") : (compact ? "right-1.5" : "right-2")
              )}
            >
              <Heart
                className={cn(
                  "transition-colors",
                  compact ? "w-3 h-3" : "w-4 h-4",
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                )}
              />
            </motion.button>

            {/* Video Play Icon */}
            {hasVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="p-3 rounded-full bg-white/90 shadow-lg">
                  <Play className="w-5 h-5 text-[#B3967D]" fill="currentColor" />
                </div>
              </div>
            )}

            {/* Quick View */}
            {onQuickView && (
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 flex items-end justify-center bg-black/20 p-3"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs py-1.5"
                  onClick={(e) => {
                    e.preventDefault()
                    onQuickView(product)
                  }}
                >
                  <Eye className={cn("w-3.5 h-3.5", isRTL ? "ml-1.5" : "mr-1.5")} />
                  {t('quickView')}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Maroon Separator Lines */}
          <div className="w-full">
            <div className="h-[2px] bg-[#550000]"></div>
            <div className="h-[2px] bg-[#550000] mt-[2px]"></div>
          </div>

          {/* Content */}
          <CardContent className={compact ? "p-2.5" : "p-3"}>
            {/* Brand */}
            <Link
              href={`/brands/${brandName.toLowerCase().replace(/\s+/g, '-')}`}
              className={cn(
                "text-[#B3967D] hover:text-[#B3967D] transition-colors font-semibold uppercase tracking-wide",
                compact ? "text-[9px]" : "text-[10px]"
              )}
            >
              {brandName}
            </Link>

            {/* Product Name */}
            <Link href={`/products/${product.slug}`}>
              <h3 className={cn(
                "font-bold truncate hover:text-[#B3967D] transition-colors text-[#2D2D2D]",
                compact ? "text-[12px] mt-0.5" : "text-[13px] mt-1"
              )}>
                {productName}
              </h3>
            </Link>

            {/* Rating */}
            <div className={cn("flex items-center gap-1.5", compact ? "mt-1" : "mt-1.5")}>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      compact ? "text-[11px]" : "text-[13px]",
                      i < Math.floor(rating) ? "text-[#FFD700]" : "text-gray-300"
                    )}
                    style={{
                      textShadow: i < Math.floor(rating) ? '0 0 2px rgba(255, 215, 0, 0.5)' : 'none'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className={cn("text-gray-500 font-medium", compact ? "text-[9px]" : "text-[10px]")}>
                ({reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className={cn("flex items-baseline gap-1.5", compact ? "mt-1.5" : "mt-2")}>
              <span className={cn("font-bold text-[#1A1F2E]", compact ? "text-sm" : "text-base")}>
                {formatCurrency(salePrice || regularPrice)}
              </span>
              {salePrice && (
                <span className={cn("text-gray-400 line-through", compact ? "text-[10px]" : "text-[11px]")}>
                  {formatCurrency(regularPrice)}
                </span>
              )}
            </div>

            {/* Coins - Smaller */}
            {(product as any).coinsToAward && (product as any).coinsToAward > 0 && (
              <div className="mt-1 text-[9px] text-gray-500">
                +{(product as any).coinsToAward} {t('coins')} 🪙
              </div>
            )}

            {/* Add to Cart Button - More refined */}
            {onAddToCart && (
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-3 bg-gradient-to-r from-[#550000] to-[#6b0000] hover:from-[#B3967D] hover:to-[#B3967D] text-[11px] py-1.5 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault()
                  onAddToCart(product)
                }}
                disabled={stockQuantity === 0}
              >
                {stockQuantity === 0 ? (
                  t('outOfStock')
                ) : (
                  <>
                    <ShoppingCart className={cn("w-3.5 h-3.5", isRTL ? "ml-1.5" : "mr-1.5")} />
                    {t('addToCart')}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </CardWrapper>
  )
}
