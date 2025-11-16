"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Heart, Minus, Plus, Share2, Package, Truck, CheckCircle, RotateCcw, Lock, Coins } from "lucide-react"
import { Lens } from "@/components/aceternity/lens"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder"
import { ProductCard } from "@/components/ui/product-card"
import { useProduct } from "@/hooks/useProducts"
import { useCart } from "@/hooks/useCart"
import { useWishlist } from "@/hooks/useWishlist"
import { useWallet } from "@/hooks/useWallet"
import { formatCurrency, calculateDiscount } from "@/lib/utils"
import { getProductImageUrl, hasProductImages } from "@/lib/image-utils"
import { ReviewStats } from "@/components/reviews/ReviewStats"
import { ReviewList } from "@/components/reviews/ReviewList"
import { useReviewStats } from "@/hooks/useReviews"
import { apiClient } from "@/lib/api-client"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export default function ProductDetailPage() {
  const params = useParams()
  const t = useTranslations('productDetail')
  const tProducts = useTranslations('products')
  const { data: product, isLoading } = useProduct(params.slug as string)
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { wallet } = useWallet()
  const { data: reviewStats } = useReviewStats(product?.id || '')

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [coinsToUse, setCoinsToUse] = useState(0)

  // Fetch best sellers for "You may also like" section
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await apiClient.get('/products/featured')
        setRelatedProducts(response.slice(0, 6)) // Get 6 best sellers
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

  const discount = product.salePrice ? calculateDiscount(product.regularPrice, product.salePrice) : 0
  const currentPrice = product.salePrice || product.regularPrice
  const savings = product.salePrice ? product.regularPrice - product.salePrice : 0
  const currentImageUrl = getProductImageUrl(product, selectedImage)
  const productHasImages = hasProductImages(product)

  // Calculate total price with coins
  const totalPrice = currentPrice * quantity
  const maxCoinsUsable = wallet?.balance || 0
  const coinDiscount = Math.min(coinsToUse, maxCoinsUsable, totalPrice)
  const finalPrice = totalPrice - coinDiscount

  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-[5%] py-4 sm:py-6">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold overflow-x-auto">
          <Link href="/" className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all">
            🏠 {t('home')}
          </Link>
          <span className="text-amber-400">→</span>
          {product.category?.nameEn && (
            <>
              <Link href={`/products?categorySlug=${product.category.slug}`} className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all">
                {product.category.nameEn}
              </Link>
              <span className="text-amber-400">→</span>
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
            {productHasImages ? (
              <Lens lensSize={200} zoomFactor={2.5} className="mb-3 sm:mb-4">
                <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[550px] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white">
                  {currentImageUrl ? (
                    <Image
                      src={currentImageUrl}
                      alt={product.nameEn}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <ProductImagePlaceholder className="w-full h-full" />
                  )}
                  {product.salePrice && (
                    <div className="absolute top-2 sm:top-5 left-2 sm:left-5 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-black shadow-xl border-2 border-red-400/30">
                      🔥 -{discount}% {t('offBadge')}
                    </div>
                  )}
                </div>
              </Lens>
            ) : (
              <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[550px] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 mb-3 sm:mb-4 shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white">
                <ProductImagePlaceholder className="w-full h-full" />
                {product.salePrice && (
                  <div className="absolute top-2 sm:top-5 left-2 sm:left-5 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-black shadow-xl border-2 border-red-400/30">
                    🔥 -{discount}% {t('offBadge')}
                  </div>
                )}
              </div>
            )}

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
                          ? 'ring-2 sm:ring-4 ring-amber-500 shadow-xl sm:shadow-2xl scale-105'
                          : 'ring-1 sm:ring-2 ring-amber-200 hover:ring-amber-400'
                      }`}
                    >
                      {thumbUrl ? (
                        <Image src={thumbUrl} alt={`Product ${index + 1}`} fill className="object-cover" />
                      ) : (
                        <ProductImagePlaceholder className="w-full h-full" size="sm" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="py-0 sm:py-3">
            {/* Brand */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-2 sm:mb-3 border-2 border-amber-200 shadow-md">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700 text-xs sm:text-sm font-black uppercase tracking-wider">
                ✨ {product.brand?.nameEn || t('premiumBrand')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-2 sm:mb-3 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800">
                {product.nameEn}
              </span>
            </h1>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-gray-500 mb-2 sm:mb-4 font-semibold">{t('specs.sku')}: {product.sku}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-amber-200">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-amber-200 shadow-md">
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
                <span className="text-sm sm:text-base font-black text-gray-700">{(product.rating || 0).toFixed(1)}</span>
              </div>
              <a href="#reviews" className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all whitespace-nowrap">
                📝 {product.reviewCount || 0} {tProducts('reviews')}
              </a>
            </div>

            {/* Price */}
            <div className="mb-4 sm:mb-8 pb-4 sm:pb-8 border-b-2 border-amber-200">
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-2 sm:mb-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  {formatCurrency(currentPrice)}
                </span>
                {product.salePrice && (
                  <>
                    <span className="text-lg sm:text-xl lg:text-2xl text-gray-400 line-through font-bold">
                      {formatCurrency(product.regularPrice)}
                    </span>
                    <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 font-black shadow-lg border-2 border-red-400/30">
                      -{discount}% {t('offBadge')}
                    </Badge>
                  </>
                )}
              </div>
              {savings > 0 && (
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-green-200 shadow-md">
                  <span className="text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-700 font-black">
                    💰 {t('youSave')} {formatCurrency(savings)}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.descriptionEn && (
              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700">
                  {product.descriptionEn}
                </p>
              </div>
            )}

            {/* Size Display */}
            {product.size && (
              <div className="mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-black text-gray-700 block mb-2 sm:mb-3">📦 {tProducts('size')}</span>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black shadow-lg hover:shadow-xl transition-all border-2 border-amber-400/30">
                  <Package className="h-5 w-5" />
                  <span>{product.size}</span>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4 sm:mb-8">
              <span className="text-xs sm:text-sm font-black text-gray-700 block mb-2 sm:mb-3">🔢 {tProducts('quantity')}</span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center border-2 border-amber-300 rounded-lg sm:rounded-xl bg-white shadow-md sm:shadow-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 sm:h-12 sm:w-12 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all rounded-l-lg sm:rounded-l-xl"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <span className="px-4 sm:px-6 font-black text-lg sm:text-xl w-16 sm:w-20 text-center text-gray-800">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 sm:h-12 sm:w-12 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all rounded-r-lg sm:rounded-r-xl"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border-2 border-green-200 shadow-md">
                  <span className="text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-700 font-black whitespace-nowrap">
                    ✅ {product.stockQuantity} {t('stockInStock')}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary with Coins */}
            <div className="mb-4 sm:mb-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-base sm:text-lg font-black text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                💰 {t('orderSummary')}
              </h3>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('subtotal')} ({quantity} {quantity > 1 ? t('items') : t('item')})</span>
                  <span className="font-bold text-gray-800">{formatCurrency(totalPrice)}</span>
                </div>

                {/* Coins Section */}
                {wallet && wallet.balance > 0 && (
                  <div className="pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-bold text-gray-700">{t('useCoins')}</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold">
                        {wallet.balance} {t('coinsAvailable')}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={Math.min(wallet.balance, totalPrice)}
                        value={coinsToUse}
                        onChange={(e) => setCoinsToUse(Number(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex items-center justify-between">
                        <input
                          type="number"
                          min="0"
                          max={Math.min(wallet.balance, totalPrice)}
                          value={coinsToUse}
                          onChange={(e) => setCoinsToUse(Math.min(Number(e.target.value), wallet.balance, totalPrice))}
                          className="w-24 px-3 py-2 border-2 border-blue-300 rounded-lg text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCoinsToUse(Math.min(wallet.balance, totalPrice))}
                          className="border-2 border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-white transition-all"
                        >
                          {t('useMax')}
                        </Button>
                      </div>
                      {coinsToUse > 0 && (
                        <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                          ✨ {t('youllSaveWithCoins', { amount: formatCurrency(coinDiscount) })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Coin Discount */}
                {coinsToUse > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span className="font-semibold">{t('coinDiscount')}</span>
                    <span className="font-bold">-{formatCurrency(coinDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-3 sm:pt-4 border-t-2 border-blue-300">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-black text-gray-800">{t('total')}</span>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                      {formatCurrency(finalPrice)}
                    </div>
                    {coinsToUse > 0 && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatCurrency(totalPrice)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-10">
              <Button
                className="flex-1 h-12 sm:h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-2xl hover:scale-105 transition-all text-white font-black text-base sm:text-lg rounded-lg sm:rounded-xl border-2 border-amber-400/30"
                onClick={() => addToCart({ productId: product.id, variantId: selectedVariant || undefined, quantity })}
                disabled={product.stockQuantity === 0}
              >
                {product.stockQuantity === 0 ? `❌ ${tProducts('outOfStock')}` : `🛒 ${tProducts('addToCart')}`}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 sm:h-16 border-2 border-amber-500 text-gray-800 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white font-black text-base sm:text-lg transition-all rounded-lg sm:rounded-xl hover:shadow-2xl hover:scale-105"
              >
                ⚡ {tProducts('buyNow')}
              </Button>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-amber-300 hover:border-red-500 hover:bg-red-50 transition-all rounded-lg sm:rounded-xl shadow-md hover:shadow-lg"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${isWishlisted(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-50 transition-all rounded-lg sm:rounded-xl shadow-md hover:shadow-lg"
                >
                  <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-8 pb-4 sm:pb-8 border-b-2 border-amber-200">
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-md border-2 border-blue-200 hover:shadow-lg transition-all">
                <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                </div>
                <span className="text-gray-700 font-bold">{t('freeDelivery')}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-md border-2 border-green-200 hover:shadow-lg transition-all">
                <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                </div>
                <span className="text-gray-700 font-bold">{t('authenticProducts')}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-md border-2 border-purple-200 hover:shadow-lg transition-all">
                <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm">
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                </div>
                <span className="text-gray-700 font-bold">{t('easyReturns')}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-md border-2 border-orange-200 hover:shadow-lg transition-all">
                <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                </div>
                <span className="text-gray-700 font-bold">{t('securePayment')}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm border-2 border-indigo-200 shadow-lg">
              <span className="text-base sm:text-lg">🚚</span> <strong className="text-gray-800 font-black">{t('delivery')}:</strong> <span className="text-gray-700 font-semibold">{t('usuallyShips')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-[5%] mb-8 sm:mb-12 lg:mb-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b-2 border-amber-200 bg-gradient-to-r from-white to-amber-50 h-auto p-0 rounded-none shadow-md overflow-x-auto scrollbar-hide">
            <TabsTrigger
              value="description"
              className="data-[state=active]:border-b-4 data-[state=active]:border-amber-500 data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:font-black rounded-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-bold text-gray-600 hover:text-gray-800 transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              📝 {t('tabs.description')}
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="data-[state=active]:border-b-4 data-[state=active]:border-amber-500 data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:font-black rounded-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-bold text-gray-600 hover:text-gray-800 transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              📊 {t('tabs.specifications')}
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:border-b-4 data-[state=active]:border-amber-500 data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:font-black rounded-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-bold text-gray-600 hover:text-gray-800 transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              🌸 {t('tabs.fragranceNotes')}
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:border-b-4 data-[state=active]:border-amber-500 data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:font-black rounded-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-bold text-gray-600 hover:text-gray-800 transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              ⭐ {t('tabs.reviews')} ({product.reviewCount || 0})
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

          <TabsContent value="specifications" className="mt-8">
            <h3 className="text-xl font-semibold mb-6 text-charcoal">{t('productSpecifications')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.brand && (
                <div className="flex py-3 border-b border-gray-200">
                  <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.brand')}:</span>
                  <span className="text-gray-700 text-sm">{product.brand.nameEn}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex py-3 border-b border-gray-200">
                  <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.sku')}:</span>
                  <span className="text-gray-700 text-sm">{product.sku}</span>
                </div>
              )}
              {product.gender && (
                <div className="flex py-3 border-b border-gray-200">
                  <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.gender')}:</span>
                  <span className="text-gray-700 text-sm capitalize">{product.gender}</span>
                </div>
              )}
              {product.scentFamily && (
                <div className="flex py-3 border-b border-gray-200">
                  <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.scentFamily')}:</span>
                  <span className="text-gray-700 text-sm">{product.scentFamily}</span>
                </div>
              )}
              {product.longevity && (
                <div className="flex py-3 border-b border-gray-200">
                  <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.longevity')}:</span>
                  <span className="text-gray-700 text-sm">{product.longevity}</span>
                </div>
              )}
              {product.sillage && (
                <div className="flex py-3 border-b border-gray-200">
                  <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.sillage')}:</span>
                  <span className="text-gray-700 text-sm">{product.sillage}</span>
                </div>
              )}
              {product.season && (
                <div className="flex py-3 border-b border-gray-200">
                  <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.bestSeason')}:</span>
                  <span className="text-gray-700 text-sm">{product.season}</span>
                </div>
              )}
              <div className="flex py-3 border-b border-gray-200">
                <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.stockStatus')}:</span>
                <span className="text-gray-700 text-sm">
                  {product.stockQuantity > 0 ? t('specs.inStockUnits', { count: product.stockQuantity }) : t('specs.outOfStock')}
                </span>
              </div>
              {product.concentration && (
                <div className="flex py-3 border-b border-gray-200">
                  <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.concentration')}:</span>
                  <span className="text-gray-700 text-sm">{product.concentration}</span>
                </div>
              )}
              {product.size && (
                <div className="flex py-3 border-b border-gray-200">
                  <span className="w-36 font-semibold text-charcoal text-sm">{t('specs.size')}:</span>
                  <span className="text-gray-700 text-sm">{product.size}</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-8">
            <h3 className="text-xl font-semibold mb-6 text-charcoal">{t('fragrancePyramid')}</h3>
            <div className="space-y-6">
              {product.topNotes && (
                <div>
                  <h4 className="text-sm font-semibold text-charcoal mb-3">{t('topNotes')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.topNotes.split(',').map((note: string, index: number) => (
                      <span key={index} className="px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-700">
                        {note.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.heartNotes && (
                <div>
                  <h4 className="text-sm font-semibold text-charcoal mb-3">{t('heartNotes')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.heartNotes.split(',').map((note: string, index: number) => (
                      <span key={index} className="px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-700">
                        {note.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.baseNotes && (
                <div>
                  <h4 className="text-sm font-semibold text-charcoal mb-3">{t('baseNotes')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.baseNotes.split(',').map((note: string, index: number) => (
                      <span key={index} className="px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-700">
                        {note.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-charcoal">{t('customerReviews')}</h3>
              <Link href={`/products/${params.slug}/write-review`}>
                <Button className="bg-gradient-to-r from-oud-gold to-amber-600 text-white">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
