"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, X, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency } from "@/lib/utils"
import { getRandomPlaceholderImage, isPlaceholderImage } from "@/lib/image-utils"
import toast from "react-hot-toast"
import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export default function CartPage() {
  const router = useRouter()
  const t = useTranslations('cart')
  const tProducts = useTranslations('products')
  const { cart, updateCartItem, removeFromCart, isLoading } = useCart()
  const { isAuthenticated } = useAuth()
  const [promoCode, setPromoCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState("")

  // Validate coupon mutation
  const validateCoupon = useMutation({
    mutationFn: async (code: string) => {
      const subtotal = cart?.summary?.subtotal || 0
      const res = await apiClient.post('/coupons/validate', {
        code: code.toUpperCase(),
        orderAmount: subtotal,
      })
      return res
    },
    onSuccess: (data) => {
      setAppliedCoupon(data)
      setCouponError('')
      setPromoCode('')
      toast.success(t('couponApplied'))
    },
    onError: (error: any) => {
      setCouponError(
        error.response?.data?.message || t('invalidCoupon')
      )
      setAppliedCoupon(null)
      toast.error(error.response?.data?.message || t('invalidCoupon'))
    },
  })

  const handleApplyCoupon = () => {
    if (!promoCode.trim()) {
      setCouponError(t('enterPromoCode'))
      return
    }
    setCouponError('')
    validateCoupon.mutate(promoCode.trim())
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setPromoCode('')
    setCouponError('')
    toast.success(t('removeCoupon'))
  }

  const handleProceedToCheckout = () => {
    if (appliedCoupon) {
      sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon))
    }
    // Route to appropriate checkout page based on auth status
    router.push(isAuthenticated ? '/checkout' : '/guest-checkout')
  }

  // Calculate totals with discount
  const subtotal = cart?.summary?.subtotal || 0
  const discount = appliedCoupon?.discountAmount || 0
  const shipping = cart?.summary?.shipping || 0
  const tax = cart?.summary?.tax || 0
  const total = subtotal - discount + shipping + tax

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold mb-4">{t('empty')}</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t('emptyDescription')}
          </p>
          <Button variant="primary" size="lg" asChild>
            <Link href="/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('continueShopping')}
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const productImage = (item: any) => {
    const firstImage = item.product?.images?.[0]
    if (!firstImage) {
      // Return random placeholder based on product ID for consistency
      return getRandomPlaceholderImage(item.productId || item.product?.id)
    }
    return typeof firstImage === 'string' ? firstImage : firstImage.url
  }

  const productName = (item: any) => {
    return item.product?.nameEn || item.product?.name || 'Product'
  }

  const productSlug = (item: any) => {
    return item.product?.slug || '#'
  }

  const productPrice = (item: any) => {
    return item.variant?.price || item.product?.salePrice || item.product?.regularPrice || 0
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{cart.summary?.itemCount || 0} {t('itemsInCart')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      {(() => {
                        const imgSrc = productImage(item)
                        const isPlaceholder = isPlaceholderImage(imgSrc)
                        return (
                          <Link
                            href={`/products/${productSlug(item)}`}
                            className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 group bg-gradient-to-br from-[#ECDBC7] via-[#F5E6D3] to-[#ECDBC7]"
                          >
                            <Image
                              src={imgSrc}
                              alt={productName(item)}
                              fill
                              className={isPlaceholder ? "object-contain p-2 group-hover:scale-105 transition-transform" : "object-cover group-hover:scale-105 transition-transform"}
                            />
                          </Link>
                        )
                      })()}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${productSlug(item)}`}
                          className="font-semibold hover:text-oud-gold transition-colors line-clamp-2"
                        >
                          {productName(item)}
                        </Link>

                        {item.variant && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                              {item.variant.name}
                            </span>
                          </div>
                        )}

                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-lg font-bold text-oud-gold">
                            {formatCurrency(productPrice(item))}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            × {item.quantity}
                          </span>
                        </div>

                        {/* Stock Warning */}
                        {(() => {
                          const stock = item.variant?.stock ?? item.product?.stockQuantity ?? 0
                          return stock < 5 && stock > 0 && (
                            <p className="text-xs text-[#B3967D]/600 mt-1">
                              {t('onlyLeftInStock', { count: stock })}
                            </p>
                          )
                        })()}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeFromCart(item.id)
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {/* Quantity Selector */}
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartItem({
                              itemId: item.id,
                              quantity: item.quantity - 1
                            })}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="px-3 font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartItem({
                              itemId: item.id,
                              quantity: item.quantity + 1
                            })}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <p className="text-sm font-bold">
                          {formatCurrency(productPrice(item) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Continue Shopping */}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('continueShopping')}
            </Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>{t('title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('subtotal')}:</span>
                  <span className="font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">{t('discount')}:</span>
                    <span className="font-semibold text-green-600">
                      - {formatCurrency(discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('shipping')}:</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">{t('freeShipping')} ✓</span>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>

                {subtotal < 300 && (
                  <p className="text-xs text-muted-foreground">
                    {t('addMoreForFreeShipping', { amount: formatCurrency(300 - subtotal) })}
                  </p>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('tax')} (5%):</span>
                  <span className="font-semibold">
                    {formatCurrency(tax)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold">{t('total')}:</span>
                <span className="text-2xl font-bold text-oud-gold">
                  {formatCurrency(total)}
                </span>
              </div>

              {/* Savings Highlight */}
              {discount > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 text-center font-medium">
                    {t('savingAmount', { amount: formatCurrency(discount) })}
                  </p>
                </div>
              )}

              {/* Coins Earning */}
              <div className="bg-gradient-to-r from-oud-gold/10 to-amber/10 p-3 rounded-lg">
                <p className="text-sm font-semibold text-oud-gold flex items-center gap-2">
                  {t('youllEarnCoins', { count: cart.summary?.coinsEarnable || 0 })}
                  <span className="text-xs text-muted-foreground">
                    (≈ {formatCurrency((cart.summary?.coinsEarnable || 0) * 0.1)})
                  </span>
                </p>
              </div>

              {/* Promo Code */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {t('applyPromoCode')}
                </label>

                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('enterPromoCode')}
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase())
                          setCouponError('')
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleApplyCoupon()
                          }
                        }}
                        className="uppercase"
                        disabled={validateCoupon.isPending}
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={!promoCode.trim() || validateCoupon.isPending}
                      >
                        {validateCoupon.isPending ? t('checkout') : t('applyCoupon')}
                      </Button>
                    </div>

                    {couponError && (
                      <p className="text-xs text-red-600">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            {appliedCoupon.coupon.code}
                          </p>
                          <p className="text-xs text-green-700">
                            {appliedCoupon.coupon.discountType === 'PERCENTAGE'
                              ? `${appliedCoupon.coupon.discountValue}% ${t('discount')}`
                              : `${formatCurrency(appliedCoupon.coupon.discountValue)} ${t('discount')}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-700 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleProceedToCheckout}
              >
                {t('checkout')}
              </Button>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="text-green-600">🔒</span>
                <span>{t('secureCheckout')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
