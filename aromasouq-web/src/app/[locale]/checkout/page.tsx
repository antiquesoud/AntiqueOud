"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useCart } from "@/hooks/useCart"
import { useWallet } from "@/hooks/useWallet"
import { useCoupon, type CouponValidationResponse } from "@/hooks/useCoupon"
import { addressSchema, type AddressInput } from "@/lib/validations"
import { formatCurrency } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import toast from "react-hot-toast"
import { useTranslations } from "next-intl"

type DeliveryMethod = "standard" | "express" | "sameDay"

export default function CheckoutPage() {
  const router = useRouter()
  const t = useTranslations('checkout')
  const tCommon = useTranslations('common')
  const { cart, clearCart } = useCart()
  const { data: wallet } = useWallet()
  const { validateCoupon, isValidating, resetValidation } = useCoupon()

  const [currentStep, setCurrentStep] = useState(1)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [coinsToUse, setCoinsToUse] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { id: 1, name: t('steps.address'), key: "address" },
    { id: 2, name: t('steps.delivery'), key: "delivery" },
    { id: 3, name: t('steps.payment'), key: "payment" },
    { id: 4, name: t('steps.review'), key: "review" },
  ]

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      router.push('/cart')
    }
  }, [cart, router])

  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null)

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "Dubai",
      country: "UAE",
      zipCode: "",
    },
  })

  // Calculate shipping cost based on delivery method
  const shippingCosts: Record<DeliveryMethod, number> = {
    standard: (cart?.summary?.subtotal || 0) >= 300 ? 0 : 25,
    express: 25,
    sameDay: 50,
  }

  const shippingCost = shippingCosts[deliveryMethod]

  // Calculate coupon discount
  const couponDiscount = appliedCoupon?.discountAmount || 0

  // Calculate max coins (50% of subtotal after coupon discount)
  const subtotalAfterCoupon = (cart?.summary?.subtotal || 0) - couponDiscount
  const maxCoinsAllowed = Math.min(
    wallet?.balance || 0,
    Math.floor((subtotalAfterCoupon * 0.5) / 0.1)
  )

  const coinsDiscount = coinsToUse * 0.1
  const subtotal = cart?.summary?.subtotal || 0
  const totalDiscount = couponDiscount + coinsDiscount
  const taxAmount = (subtotal - totalDiscount + shippingCost) * 0.05
  const finalTotal = subtotal - totalDiscount + shippingCost + taxAmount

  // Handler for coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t('enterPromoCode'))
      return
    }

    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        orderAmount: subtotal,
      })
      setAppliedCoupon(result)
      toast.success(t('couponApplied'))
    } catch (error) {
      // Error already handled by useCoupon hook
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    resetValidation()
  }

  const onSubmit = async (data: AddressInput) => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      return
    }

    // Final submission
    setIsSubmitting(true)
    try {
      // First, create the address
      const address = await apiClient.post<{ id: string }>('/addresses', data)

      // Then create the order using the address ID
      const order = await apiClient.post<{ id: string; orderNumber: string }>('/orders', {
        addressId: address.id,
        paymentMethod: paymentMethod === 'card' ? 'CARD' : 'CASH_ON_DELIVERY',
        coinsToUse,
        couponCode: appliedCoupon?.coupon.code,
      })

      toast.success(`Order #${order.orderNumber} placed successfully!`)
      clearCart()
      router.push(`/order-success?orderId=${order.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('processing'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('loading')}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > step.id
                      ? "bg-green-600 text-white"
                      : currentStep === step.id
                      ? "bg-oud-gold text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className="text-xs mt-2 font-medium">{step.name}</span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    currentStep > step.id ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('shippingAddress')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('fullName')} *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('phone')} *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+971 50 123 4567" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="addressLine1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('addressLine1')} *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="addressLine2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('addressLine2')}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('city')} *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('state')} *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Dubai">Dubai</SelectItem>
                                  <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                                  <SelectItem value="Sharjah">Sharjah</SelectItem>
                                  <SelectItem value="Ajman">Ajman</SelectItem>
                                  <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                                  <SelectItem value="Fujairah">Fujairah</SelectItem>
                                  <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('zipCode')}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" variant="primary" className="w-full">
                        {t('continueToDelivery')}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Delivery */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('deliveryMethod')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RadioGroup value={deliveryMethod} onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}>
                        <div className="space-y-3">
                          <Label
                            htmlFor="standard"
                            className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-oud-gold transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="standard" id="standard" />
                              <div>
                                <p className="font-semibold">{t('standardDelivery')}</p>
                                <p className="text-sm text-muted-foreground">{t('deliveryTime3to5')}</p>
                              </div>
                            </div>
                            <span className="font-semibold">
                              {subtotal >= 300 ? t('freeShipping') : formatCurrency(25)}
                            </span>
                          </Label>

                          <Label
                            htmlFor="express"
                            className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-oud-gold transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="express" id="express" />
                              <div>
                                <p className="font-semibold">{t('expressDelivery')}</p>
                                <p className="text-sm text-muted-foreground">{t('deliveryTime1to2')}</p>
                              </div>
                            </div>
                            <span className="font-semibold">{formatCurrency(25)}</span>
                          </Label>

                          <Label
                            htmlFor="sameDay"
                            className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-oud-gold transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="sameDay" id="sameDay" />
                              <div>
                                <p className="font-semibold">{t('sameDayDelivery')}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t('deliveryTimeSameDay')}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold">{formatCurrency(50)}</span>
                          </Label>
                        </div>
                      </RadioGroup>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(1)}
                        >
                          {tCommon('back')}
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                          {t('continueToPayment')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('paymentMethod')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Coupon Code */}
                      <div>
                        <h3 className="font-semibold mb-2">{t('haveCouponCode')}</h3>
                        {!appliedCoupon ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder={t('enterPromoCode')}
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleApplyCoupon()
                                }
                              }}
                              disabled={isValidating}
                            />
                            <Button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={isValidating || !couponCode.trim()}
                              variant="outline"
                            >
                              {isValidating ? t('validating') : t('apply')}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-4 border border-green-500 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-semibold text-green-700">{appliedCoupon.coupon.code}</p>
                              <p className="text-sm text-green-600">
                                {appliedCoupon.coupon.discountType === 'PERCENTAGE'
                                  ? `${appliedCoupon.coupon.discountValue}%`
                                  : formatCurrency(appliedCoupon.coupon.discountValue)}
                                {' • '}{t('savedWithCoupon', { amount: formatCurrency(appliedCoupon.discountAmount) })}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveCoupon}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {t('remove')}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Coins Redemption */}
                      {wallet && wallet.balance > 0 && (
                        <div className="bg-gradient-to-br from-[#B3967D]/50 to-[#B3967D]/50 border-2 border-[#B3967D]/200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{t('useCoins')}</h3>
                            <Badge className="bg-gradient-to-r from-[#B3967D]/500 to-[#B3967D]/500 text-white font-bold">
                              {wallet.balance} {t('coinsAvailable')}
                            </Badge>
                          </div>

                          <p className="text-xs text-gray-600 mb-4">
                            {t('coinValue')} • {t('maxCoinsLimit', { count: maxCoinsAllowed })}
                          </p>

                          <div className="space-y-3">
                            <Slider
                              value={[coinsToUse]}
                              onValueChange={([value]) => setCoinsToUse(value)}
                              max={maxCoinsAllowed}
                              step={1}
                              className="mb-2"
                            />

                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max={maxCoinsAllowed}
                                value={coinsToUse}
                                onChange={(e) => {
                                  const value = Math.min(Number(e.target.value), maxCoinsAllowed)
                                  setCoinsToUse(Math.max(0, value))
                                }}
                                className="w-28 h-9 text-sm"
                                placeholder="0"
                              />
                              <span className="text-sm text-gray-600 flex-1">{t('coinsAvailable')}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setCoinsToUse(maxCoinsAllowed)}
                                className="border-[#B3967D]/500 text-[#B3967D]/700 hover:bg-[#B3967D]/500 hover:text-white"
                              >
                                {t('useMaxCoins')}
                              </Button>
                            </div>

                            {coinsToUse > 0 && (
                              <div className="flex justify-between text-sm pt-2 border-t border-[#B3967D]/200">
                                <span className="font-semibold text-gray-700">{t('coinDiscount')}:</span>
                                <span className="font-bold text-green-600">
                                  - {formatCurrency(coinsDiscount)}
                                </span>
                              </div>
                            )}
                          </div>

                          <Separator className="my-6" />
                        </div>
                      )}

                      {/* Payment Method */}
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="space-y-3">
                          <Label
                            htmlFor="card"
                            className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-oud-gold transition-colors"
                          >
                            <RadioGroupItem value="card" id="card" className="mt-1" />
                            <div className="flex-1">
                              <p className="font-semibold">{t('creditCard')}</p>
                              <p className="text-sm text-muted-foreground">
                                Visa, Mastercard, Amex accepted
                              </p>
                            </div>
                          </Label>

                          <Label
                            htmlFor="cod"
                            className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-oud-gold transition-colors"
                          >
                            <RadioGroupItem value="cod" id="cod" className="mt-1" />
                            <div className="flex-1">
                              <p className="font-semibold">{t('cashOnDelivery')}</p>
                              <p className="text-sm text-muted-foreground">Pay when you receive</p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(2)}
                        >
                          {tCommon('back')}
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                          {t('reviewOrder')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('reviewOrder')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-2">{t('shippingAddress')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {form.getValues("fullName")}<br />
                          {form.getValues("addressLine1")}<br />
                          {form.getValues("city")}, {form.getValues("state")}<br />
                          {form.getValues("phone")}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-2">{t('deliveryMethod')}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {deliveryMethod.replace(/([A-Z])/g, ' $1').trim()} - {formatCurrency(shippingCost)}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-2">{t('paymentMethod')}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {paymentMethod === 'card' ? t('creditCard') : t('cashOnDelivery')}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(3)}
                        >
                          {tCommon('back')}
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? t('processing') : t('placeOrder')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </form>
          </Form>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('subtotal')} ({cart?.summary?.itemCount || 0} {t('items')}):</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('discount')} ({appliedCoupon.coupon.code}):</span>
                    <span className="font-semibold">- {formatCurrency(couponDiscount)}</span>
                  </div>
                )}

                {coinsToUse > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('coinsAvailable')} ({coinsToUse}):</span>
                    <span className="font-semibold">- {formatCurrency(coinsDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>{t('shipping')}:</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? t('freeShipping') : formatCurrency(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>{t('tax')} (5%):</span>
                  <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="font-bold">{t('total')}:</span>
                <span className="text-2xl font-bold text-oud-gold">
                  {formatCurrency(finalTotal)}
                </span>
              </div>

              <div className="bg-gradient-to-r from-oud-gold/10 to-amber-500/10 p-3 rounded-lg text-sm">
                <p className="font-semibold text-oud-gold">
                  {t('youllEarnCoins', { count: cart?.summary?.coinsEarnable || 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
