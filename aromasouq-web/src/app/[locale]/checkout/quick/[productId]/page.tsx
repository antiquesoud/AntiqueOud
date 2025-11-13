'use client'

import { useState } from 'react'
import { useParams } from '@/i18n/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'
import { useQuickCheckout } from '@/hooks/useQuickCheckout'
import { formatCurrency } from '@/lib/utils'
import { getFirstProductImage } from '@/lib/image-utils'
import { GiftOptionsModal } from '@/components/features/gift-options-modal'

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
  emirate: string
  country: string
  zipCode?: string
}

export default function QuickCheckoutPage() {
  const params = useParams()
  const productId = params.productId as string

  const [selectedVariant, setSelectedVariant] = useState<string | undefined>()
  const [quantity] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [deliveryMethod, setDeliveryMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD')
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH_ON_DELIVERY'>('CARD')
  const [giftOptionsOpen, setGiftOptionsOpen] = useState(false)
  const [giftOptions, setGiftOptions] = useState<any>(null)

  const { quickCheckout, isProcessing } = useQuickCheckout()

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => apiClient.get(`/products/slug/${productId}`),
  })

  const { data: addresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => apiClient.get('/addresses'),
  })

  const handleCheckout = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    quickCheckout({
      productId,
      variantId: selectedVariant,
      quantity,
      addressId: selectedAddress,
      deliveryMethod,
      paymentMethod: paymentMethod === 'CARD' ? 'CARD' : 'CASH_ON_DELIVERY',
      giftOptions,
    })
  }

  if (productLoading || addressesLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    )
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
  const total = subtotal + deliveryCost + giftWrappingCost

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
          <h1 className="text-2xl font-playfair font-bold text-deep-navy">Express Checkout</h1>
          <p className="text-sm text-muted-foreground">Complete your purchase in seconds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Product</CardTitle>
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
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                {addresses?.map((address) => (
                  <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value={address.id} id={address.id} />
                    <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                      <p className="font-medium">{address.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.addressLine1}, {address.city}, {address.emirate}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {(!addresses || addresses.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No addresses found. Please add one in your account settings.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as any)}>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="STANDARD" id="standard" />
                  <Label htmlFor="standard" className="flex-1 cursor-pointer">
                    <p className="font-medium">Standard Delivery (3-5 days)</p>
                    <p className="text-sm text-muted-foreground">AED 15.00</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="EXPRESS" id="express" />
                  <Label htmlFor="express" className="flex-1 cursor-pointer">
                    <p className="font-medium">Express Delivery (1-2 days)</p>
                    <p className="text-sm text-muted-foreground">AED 25.00</p>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="CARD" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="CASH_ON_DELIVERY" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    Cash on Delivery
                  </Label>
                </div>
              </RadioGroup>
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
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span>{formatCurrency(deliveryCost)}</span>
              </div>
              {giftWrappingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Gift Wrapping</span>
                  <span>{formatCurrency(giftWrappingCost)}</span>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-oud-gold">{formatCurrency(total)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={isProcessing || !selectedAddress}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Complete Purchase'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <GiftOptionsModal
        open={giftOptionsOpen}
        onClose={() => setGiftOptionsOpen(false)}
        onSave={setGiftOptions}
        initialOptions={giftOptions}
      />
    </div>
  )
}
