'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from '@/i18n/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Coins, Tag, X, Check, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'
import { useQuickCheckout } from '@/hooks/useQuickCheckout'
import { useAuth } from '@/hooks/useAuth'
import { useWallet } from '@/hooks/useWallet'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { getFirstProductImage } from '@/lib/image-utils'
import { GiftOptionsModal } from '@/components/features/gift-options-modal'
import { useTranslations } from 'next-intl'
import { AddressForm } from '@/components/addresses/AddressForm'
import { useCreateAddress, CreateAddressDto } from '@/hooks/useAddresses'
import { StripeProvider } from '@/components/payment/StripeProvider'
import { StripeCardForm } from '@/components/payment/StripeCardForm'

interface Product {
  id: string
  slug: string
  nameEn: string
  regularPrice: number
  salePrice?: number
  images?: { url: string }[]
  brand?: { nameEn: string }
  variants?: { id: string; name: string; price: number }[]
}

interface Address {
  id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  emirate: string
  country: string
  zipCode?: string
}

export default function QuickCheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string
  const t = useTranslations('checkout')
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: wallet } = useWallet()

  const [selectedVariant, setSelectedVariant] = useState<string | undefined>()
  const [quantity] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [deliveryMethod, setDeliveryMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD')
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH_ON_DELIVERY'>('CARD')
  const [giftOptionsOpen, setGiftOptionsOpen] = useState(false)
  const [giftOptions, setGiftOptions] = useState<any>(null)

  const { quickCheckout, isProcessing } = useQuickCheckout()

  const [coinsToUse, setCoinsToUse] = useState(0)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [showStripeForm, setShowStripeForm] = useState(false)

  const createAddressMutation = useCreateAddress()

  // Authentication guard - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to continue')
      router.push(`/login?redirect=/checkout/quick/${productId}`)
    }
  }, [isAuthenticated, authLoading, router, productId])

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => apiClient.get(`/products/${productId}`),
  })

  const { data: addresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => apiClient.get('/addresses'),
  })

  const handleCreateAddress = (data: CreateAddressDto) => {
    createAddressMutation.mutate(data, {
      onSuccess: (newAddress: any) => {
        setShowAddressForm(false)
        setSelectedAddress(newAddress.id)
      },
    })
  }

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    const checkoutData: any = {
      productId,
      variantId: selectedVariant,
      quantity,
      addressId: selectedAddress,
      deliveryMethod,
      paymentMethod: paymentMethod === 'CARD' ? 'CREDIT_CARD' : 'CASH_ON_DELIVERY',
      coinsToUse,
      giftOptions,
    }

    // Only include couponCode if a coupon is actually applied
    if (appliedCoupon?.coupon.code) {
      checkoutData.couponCode = appliedCoupon.coupon.code
    }

    try {
      const order = await apiClient.post<{ id: string; orderNumber: string }>('/checkout/quick', checkoutData)

      setCreatedOrderId(order.id)
      setCreatedOrderNumber(order.orderNumber)

      if (paymentMethod === 'CARD') {
        const paymentIntent = await apiClient.post<{ clientSecret: string }>('/payments/create-intent', {
          orderId: order.id,
        })

        setClientSecret(paymentIntent.clientSecret)
        setShowStripeForm(true)
      } else {
        toast.success(`Order #${order.orderNumber} placed successfully!`)
        router.push(`/order-success?orderId=${order.id}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    }
  }

  const handlePaymentSuccess = () => {
    toast.success('Payment successful!')
    router.push(`/order-success?orderId=${createdOrderId}`)
  }

  const handlePaymentCancel = () => {
    setShowStripeForm(false)
    setClientSecret(null)
    toast('Payment cancelled')
  }

  if (productLoading || addressesLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // Early return if not authenticated (will redirect in useEffect)
  if (!isAuthenticated) {
    return null
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Product not found</div>
      </div>
    )
  }

  const finalPrice = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.price || product.regularPrice
    : product.salePrice || product.regularPrice

  const deliveryCost = deliveryMethod === 'EXPRESS' ? 25 : 15
  const giftWrappingCost = giftOptions?.giftWrapping
    ? giftOptions.giftWrapping === 'BASIC'
      ? 10
      : giftOptions.giftWrapping === 'PREMIUM'
      ? 20
      : 35
    : 0

  const subtotal = finalPrice * quantity

  // Coin discount (max 50% of subtotal, 1 coin = 1 AED)
  const maxCoinsDiscount = subtotal * 0.5
  const coinDiscount = Math.min(coinsToUse * 1.0, maxCoinsDiscount)

  // Coupon discount
  const couponDiscount = appliedCoupon?.discountAmount || 0

  const tax = (subtotal - coinDiscount - couponDiscount + deliveryCost + giftWrappingCost) * 0.05
  const total = subtotal - coinDiscount - couponDiscount + deliveryCost + giftWrappingCost + tax

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/products/${product.slug}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-playfair font-bold text-deep-navy">{t('expressCheckout')}</h1>
          <p className="text-sm text-muted-foreground">{t('completeInSeconds')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('product')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={getFirstProductImage(product) || '/placeholder.png'}
                    alt={product.nameEn}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{product.nameEn}</h3>
                  <p className="text-sm text-muted-foreground">{product.brand?.nameEn}</p>
                  <p className="text-oud-gold font-bold mt-1">{formatCurrency(finalPrice)}</p>
                </div>
              </div>

              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-4">
                  <Label>Size</Label>
                  <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name} - {formatCurrency(variant.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('deliveryAddress')}</span>
                {!showAddressForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addNewAddress')}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showAddressForm ? (
                <AddressForm
                  onSubmit={handleCreateAddress}
                  onCancel={() => setShowAddressForm(false)}
                  isSubmitting={createAddressMutation.isPending}
                  submitLabel={t('addNewAddress')}
                />
              ) : (
                <>
                  {addresses && addresses.length > 0 ? (
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value={address.id} id={address.id} />
                          <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <p className="font-medium">{address.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.addressLine1}, {address.city}, {address.state}
                            </p>
                            <p className="text-sm text-muted-foreground">{address.phone}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('noAddressesFound')}. {t('addAddressHere')}.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardHeader>
              <CardTitle>{t('deliveryMethod')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as any)}>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="STANDARD" id="standard" />
                  <Label htmlFor="standard" className="flex-1 cursor-pointer">
                    <p className="font-medium">{t('standardDeliveryLabel')}</p>
                    <p className="text-sm text-muted-foreground">AED 15.00</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="EXPRESS" id="express" />
                  <Label htmlFor="express" className="flex-1 cursor-pointer">
                    <p className="font-medium">{t('expressDeliveryLabel')}</p>
                    <p className="text-sm text-muted-foreground">AED 25.00</p>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentMethod')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="CARD" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    {t('creditCard')}
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="CASH_ON_DELIVERY" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    {t('cashOnDelivery')}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Use Coins */}
          {wallet && wallet.balance > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#B3967D]/600" />
                  {t('useCoins')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('available')}</span>
                  <span className="font-bold text-[#B3967D]/700">{wallet.balance} {t('coinsAvailable')}</span>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t('coinValueMax')}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max={Math.min(wallet.balance, subtotal * 0.5)}
                    value={coinsToUse}
                    onChange={(e) => setCoinsToUse(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#B3967D]/500 mt-2"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min="0"
                      max={Math.min(wallet.balance, subtotal * 0.5)}
                      value={coinsToUse}
                      onChange={(e) => setCoinsToUse(Math.min(Number(e.target.value), wallet.balance, subtotal * 0.5))}
                      className="w-20 px-3 py-2 border rounded-lg text-sm text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCoinsToUse(Math.min(wallet.balance, subtotal * 0.5))}
                    >
                      {t('useMaxCoins')}
                    </Button>
                  </div>
                </div>

                {coinsToUse > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      {t('youllSave', { amount: formatCurrency(coinDiscount) })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Apply Coupon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                {t('promoCode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('enterCode')}
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase().trim())
                        setCouponError('')
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg uppercase"
                    />
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const trimmedCode = couponCode.trim()
                        if (!trimmedCode) {
                          setCouponError(t('pleaseEnterCode'))
                          return
                        }
                        try {
                          const res = await apiClient.post('/coupons/validate', {
                            code: trimmedCode,
                            orderAmount: subtotal - coinDiscount,
                          })
                          setAppliedCoupon(res)
                          setCouponError('')
                          setCouponCode('')
                          toast.success(t('couponApplied'))
                        } catch (err: any) {
                          // Extract error message from NestJS error response
                          const errorMessage = err.response?.data?.message ||
                                             err.message ||
                                             t('invalidCode')
                          setCouponError(errorMessage)
                          setAppliedCoupon(null)
                          toast.error(errorMessage)
                        }
                      }}
                    >
                      {t('apply')}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{appliedCoupon.coupon.code}</p>
                        <p className="text-xs text-green-700">
                          {appliedCoupon.coupon.discountType === 'PERCENTAGE'
                            ? `${appliedCoupon.coupon.discountValue}%`
                            : formatCurrency(appliedCoupon.coupon.discountValue)} {t('off')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAppliedCoupon(null)
                        setCouponCode('')
                        toast.success(t('couponRemoved'))
                      }}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gift Options */}
          <Card>
            <CardHeader>
              <CardTitle>Gift Options</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setGiftOptionsOpen(true)} className="w-full">
                {giftOptions?.isGift ? 'Edit Gift Options' : 'Add Gift Wrapping'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{t('subtotal')}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {coinDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('coinDiscount')} ({coinsToUse})</span>
                  <span>-{formatCurrency(coinDiscount)}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('couponDiscount')}</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>{t('shipping')}</span>
                <span>{formatCurrency(deliveryCost)}</span>
              </div>

              {giftWrappingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t('giftWrapping')}</span>
                  <span>{formatCurrency(giftWrappingCost)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>{t('tax')} (5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>{t('total')}</span>
                <span className="text-oud-gold">{formatCurrency(total)}</span>
              </div>
              <Button
                variant="primary"
                onClick={handleCheckout}
                disabled={isProcessing || !selectedAddress}
                className="w-full"
                size="lg"
              >
                {isProcessing ? t('processing') : t('placeOrder')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <GiftOptionsModal
        open={giftOptionsOpen}
        onClose={() => setGiftOptionsOpen(false)}
        onSave={setGiftOptions}
      />

      {/* Stripe Payment Modal */}
      {showStripeForm && clientSecret && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Order #{createdOrderNumber}</strong> created. Complete payment to confirm.
                </p>
              </div>

              <StripeProvider clientSecret={clientSecret}>
                <StripeCardForm
                  orderId={createdOrderId!}
                  total={total}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </StripeProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
