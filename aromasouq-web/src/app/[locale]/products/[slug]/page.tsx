"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Heart, Minus, Plus, Share2, Package, Truck, CheckCircle, RotateCcw, Lock, Coins } from "lucide-react"
import { Lens } from "@/components/aceternity/lens"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/ui/product-card"
import { ProductCarousel } from "@/components/homepage/product-carousel"
import { useProduct } from "@/hooks/useProducts"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { useWishlist } from "@/hooks/useWishlist"
import { useWallet } from "@/hooks/useWallet"
import { formatCurrency, calculateDiscount } from "@/lib/utils"
import { getProductImageUrl, hasProductImages, getRandomPlaceholderImage, isPlaceholderImage } from "@/lib/image-utils"
import { ReviewStats } from "@/components/reviews/ReviewStats"
import { ReviewList } from "@/components/reviews/ReviewList"
import { useReviewStats } from "@/hooks/useReviews"
import { apiClient } from "@/lib/api-client"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { VariantSelector } from "@/components/product/VariantSelector"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('productDetail')
  const tProducts = useTranslations('products')
  const { data: product, isLoading } = useProduct(params.slug as string)
  const { addToCart, addToCartAsync } = useCart()
  const { isAuthenticated } = useAuth()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { wallet } = useWallet()
  const { data: reviewStats } = useReviewStats(product?.id || '')

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedVariantData, setSelectedVariantData] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [coinsToUse, setCoinsToUse] = useState(0)

  // Handler for variant selection
  const handleVariantChange = (variantId: string | null, variantData: any) => {
    setSelectedVariant(variantId)
    setSelectedVariantData(variantData)
    // Reset quantity when variant changes
    setQuantity(1)
  }

  // Handle Buy Now - Add to cart and redirect to checkout
  const handleBuyNow = async () => {
    if (!product) return
    try {
      await addToCartAsync({ productId: product.id, variantId: selectedVariant || undefined, quantity })
      // Route to appropriate checkout page based on auth status
      router.push(isAuthenticated ? '/checkout' : '/guest-checkout')
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Failed to add to cart:', error)
    }
  }

  // Fetch best sellers for "You may also like" section
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await apiClient.get('/products/featured')
        setRelatedProducts(Array.isArray(response) ? response.slice(0, 6) : []) // Get 6 best sellers
      } catch (error) {
        console.error('Failed to fetch related products:', error)
      }
    }
    fetchBestSellers()
  }, [])

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg">{t('loading')}</p>
      </div>
    )
  }

  // Use variant price and stock if a variant is selected, otherwise use product price and stock
  const basePrice = selectedVariantData?.price ?? product.regularPrice
  const salePrice = selectedVariantData?.salePrice ?? product.salePrice // Use variant sale price if available
  const discount = salePrice ? calculateDiscount(basePrice, salePrice) : 0
  const currentPrice = salePrice || basePrice
  const savings = salePrice ? basePrice - salePrice : 0
  const currentStock = selectedVariantData?.stock ?? product.stockQuantity
  const currentImageUrl = getProductImageUrl(product, selectedImage)
  const productHasImages = hasProductImages(product)

  // Calculate total price with coins
  const totalPrice = currentPrice * quantity
  const maxCoinsUsable = wallet?.balance || 0
  const coinDiscount = Math.min(coinsToUse, maxCoinsUsable, totalPrice)
  const finalPrice = totalPrice - coinDiscount

  return (
    <div className="bg-gradient-to-br from-[#ECDBC7]/10 via-white to-[#ECDBC7]/10 min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-[5%] py-4 sm:py-6">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold overflow-x-auto">
          <Link href="/" className="text-transparent bg-clip-text bg-gradient-to-r from-[#550000] to-[#6B0000] hover:from-[#6B0000] hover:to-[#8B0000] transition-all">
            {t('home')}
          </Link>
          <span className="text-[#B3967D]">→</span>
          {product.category?.nameEn && (
            <>
              <Link href={`/products?categorySlug=${product.category.slug}`} className="text-transparent bg-clip-text bg-gradient-to-r from-[#550000] to-[#6B0000] hover:from-[#6B0000] hover:to-[#8B0000] transition-all">
                {product.category.nameEn}
              </Link>
              <span className="text-[#B3967D]">→</span>
            </>
          )}
          <span className="text-gray-700">{product.nameEn}</span>
        </div>
      </div>

      {/* Product Main Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-[5%] mb-8 sm:mb-12 lg:mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Image Gallery - Sticky */}
          <div className="lg:sticky lg:top-[140px] lg:self-start">
            {/* Main Image with Lens Zoom */}
            {(() => {
              const displayImage = currentImageUrl || getRandomPlaceholderImage(product.id)
              const isPlaceholder = isPlaceholderImage(displayImage)
              return (
                <Lens lensSize={200} zoomFactor={2.5} className="mb-3 sm:mb-4">
                  <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[550px] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#ECDBC7] via-[#F5E6D3] to-[#ECDBC7] shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white">
                    <Image
                      src={displayImage}
                      alt={product.nameEn}
                      fill
                      className="object-cover"
                    />

                  </div>
                </Lens>
              )
            })()}

            {/* Thumbnails */}
            {productHasImages && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image, index) => {
                  const thumbUrl = getProductImageUrl(product, index)
                  return (
                    <button
                      key={image.id || index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] lg:w-[100px] lg:h-[100px] rounded-lg sm:rounded-xl overflow-hidden transition-all shadow-md sm:shadow-lg hover:shadow-xl sm:hover:shadow-2xl hover:scale-105 ${
                        selectedImage === index
                          ? 'ring-2 sm:ring-4 ring-[#550000] shadow-xl sm:shadow-2xl scale-105'
                          : 'ring-1 sm:ring-2 ring-[#ECDBC7] hover:ring-[#B3967D]'
                      }`}
                    >
                      <Image
                        src={thumbUrl || getRandomPlaceholderImage(product.id)}
                        alt={`Product ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="py-0 sm:py-3">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-2 sm:mb-3 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800">
                {product.nameEn}
              </span>
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-[#ECDBC7]">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#ECDBC7]/10 to-[#ECDBC7]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-[#ECDBC7] shadow-md">
                <div className="flex text-base sm:text-2xl">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                      style={{
                        textShadow: i < Math.floor(product.rating || 0) ? '0 0 3px rgba(251, 191, 36, 0.6)' : 'none'
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {(product.rating || 0) > 0 && <span className="text-sm sm:text-base font-black text-gray-700">{(product.rating || 0).toFixed(1)}</span>}
              </div>
              <a href="#reviews" className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#550000] to-[#6B0000] hover:from-[#6B0000] hover:to-[#8B0000] transition-all whitespace-nowrap">
                {product.reviewCount || 0} {tProducts('reviews')}
              </a>
            </div>

            {/* Price */}
            <div className="mb-4 sm:mb-8 pb-4 sm:pb-8 border-b-2 border-[#ECDBC7]">
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-2 sm:mb-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#550000] to-[#6B0000]">
                  {formatCurrency(currentPrice)}
                </span>
                {product.salePrice && discount > 0 && (
                  <>
                    <span className="text-lg sm:text-xl lg:text-2xl text-gray-400 line-through font-bold">
                      {formatCurrency(product.regularPrice)}
                    </span>
                    <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 font-black shadow-lg border-2 border-[#D4AF37]/30">
                      -{discount}% {t('offBadge')}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.descriptionEn && (
              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700">
                  {product.descriptionEn}
                </p>
              </div>
            )}

            {/* Variant Selector */}
            <VariantSelector
              productId={product.id}
              selectedVariantId={selectedVariant}
              onVariantChange={handleVariantChange}
            />

            {/* Size Display - Only show if no variants and product has size */}
            {product.size && !selectedVariantData && (
              <div className="mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-black text-gray-700 block mb-2 sm:mb-3">{tProducts('size')}</span>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B3967D] to-[#C9A86A] text-white rounded-xl font-black shadow-lg hover:shadow-xl transition-all border-2 border-[#B3967D]/30">
                  <Package className="h-5 w-5" />
                  <span>{product.size}</span>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4 sm:mb-8">
              <span className="text-xs sm:text-sm font-black text-gray-700 block mb-2 sm:mb-3">{tProducts('quantity')}</span>
              <div className="flex items-center border-2 border-[#B3967D] rounded-lg sm:rounded-xl bg-white shadow-md sm:shadow-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 hover:bg-gradient-to-r hover:from-[#550000] hover:to-[#6B0000] hover:text-white transition-all rounded-l-lg sm:rounded-l-xl"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <span className="px-4 sm:px-6 font-black text-lg sm:text-xl w-16 sm:w-20 text-center text-gray-800">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 hover:bg-gradient-to-r hover:from-[#550000] hover:to-[#6B0000] hover:text-white transition-all rounded-r-lg sm:rounded-r-xl"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= currentStock}
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-10">
              <Button
                className="flex-1 h-12 sm:h-16 bg-gradient-to-r from-[#B3967D] to-[#C9A86A] hover:from-[#C9A86A] hover:to-[#D4AF74] hover:shadow-2xl hover:scale-105 transition-all text-white font-black text-base sm:text-lg rounded-lg sm:rounded-xl border-2 border-[#B3967D]/30"
                onClick={() => addToCart({ productId: product.id, variantId: selectedVariant || undefined, quantity })}
                disabled={currentStock === 0}
              >
                {currentStock === 0 ? tProducts('outOfStock') : tProducts('addToCart')}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 sm:h-16 border-2 border-[#B3967D] text-gray-800 hover:bg-gradient-to-r hover:from-[#B3967D] hover:to-[#C9A86A] hover:text-white font-black text-base sm:text-lg transition-all rounded-lg sm:rounded-xl hover:shadow-2xl hover:scale-105"
                onClick={handleBuyNow}
                disabled={currentStock === 0}
              >
                {tProducts('buyNow')}
              </Button>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-[#B3967D] hover:border-red-500 hover:bg-red-50 transition-all rounded-lg sm:rounded-xl shadow-md hover:shadow-lg"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${isWishlisted(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-[#B3967D] hover:border-[#550000] hover:bg-[#ECDBC7]/20 transition-all rounded-lg sm:rounded-xl shadow-md hover:shadow-lg"
                >
                  <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-[5%] mb-8 sm:mb-12 lg:mb-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b-2 border-[#ECDBC7] bg-gradient-to-r from-white to-[#ECDBC7]/20 h-auto p-0 rounded-none shadow-md overflow-x-auto scrollbar-hide">
            <TabsTrigger
              value="description"
              className="data-[state=active]:border-b-4 data-[state=active]:border-[#550000] data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#550000] data-[state=active]:to-[#6B0000] data-[state=active]:font-black rounded-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-bold text-gray-600 hover:text-gray-800 transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              {t('tabs.description')}
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:border-b-4 data-[state=active]:border-[#550000] data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#550000] data-[state=active]:to-[#6B0000] data-[state=active]:font-black rounded-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-bold text-gray-600 hover:text-gray-800 transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              {t('tabs.reviews')} ({product.reviewCount || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4 text-charcoal">{t('productDescription')}</h3>
              <p className="text-[15px] leading-relaxed text-gray-700 mb-4">
                {product.descriptionEn || t('defaultDescription')}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-charcoal">{t('customerReviews')}</h3>
              <Link href={`/products/${params.slug}/write-review`}>
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#550000] text-white">
                  {tProducts('writeReview')}
                </Button>
              </Link>
            </div>

            {reviewStats && <ReviewStats stats={reviewStats} />}
            <ReviewList productId={product.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-[5%] mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-2">{t('youMayAlsoLike')}</h2>
            <p className="text-sm sm:text-[15px] text-gray-600">{t('similarFragrances')}</p>
          </div>
          <ProductCarousel products={relatedProducts} compact={true} />
        </div>
      )}
    </div>
  )
}
