"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, ShoppingBag, Truck, CreditCard, Eye, Banknote } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { formatCurrency } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import toast from "react-hot-toast"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { PaymobCheckout } from "@/components/payment/PaymobCheckout"
import { useCart } from "@/hooks/useCart"

// Guest cart types
interface GuestCartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    nameAr?: string
    images: string[]
  }
  variant?: {
    id: string
    name: string
    nameAr?: string
  }
}

interface GuestCart {
  id: string
  items: GuestCartItem[]
  summary: {
    subtotal: number
    shipping: number
    tax: number
    total: number
    itemCount: number
    coinsEarnable: number
  }
}

// Payment method types - match logged-in checkout
type PaymentMethodType = "pay_online" | "cod"

// Payment method configuration
interface PaymentOption {
  id: PaymentMethodType
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isAvailable: () => boolean
  apiValue: string // Value to send to API
}

// Validation schema for guest checkout
const guestCheckoutSchema = z.object({
  guestEmail: z.string().email("Invalid email address"),
  guestPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  street: z.string().min(5, "Street address is required"),
  building: z.string().min(1, "Building is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  apartment: z.string().optional(),
  landmark: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["pay_online", "cod"]),
})

type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>

export default function GuestCheckoutPage() {
  const router = useRouter()
  const t = useTranslations('checkout')
  const tCommon = useTranslations('common')
  const { clearCartImmediate } = useCart()

  const [currentStep, setCurrentStep] = useState(1)
  const [cart, setCart] = useState<GuestCart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [guestEmail, setGuestEmail] = useState<string>('')
  const [orderCompleted, setOrderCompleted] = useState(false)

  // Payment method options - simplified to Pay Online and COD
  const paymentOptions: PaymentOption[] = useMemo(() => [
    {
      id: 'pay_online' as PaymentMethodType,
      name: t('payOnline'),
      description: t('payOnlineDesc') || 'Visa, Mastercard, Amex, Apple Pay, Google Pay',
      icon: CreditCard,
      isAvailable: () => true,
      apiValue: 'ONLINE_PAYMENT',
    },
    {
      id: 'cod' as PaymentMethodType,
      name: t('cashOnDelivery'),
      description: t('payWhenReceive') || 'Pay when you receive',
      icon: Banknote,
      isAvailable: () => true,
      apiValue: 'CASH_ON_DELIVERY',
    },
  ], [t])

  // All payment methods are always available
  const availablePaymentMethods = paymentOptions

  const steps = [
    { id: 1, name: t('steps.address'), icon: ShoppingBag },
    { id: 2, name: t('steps.delivery'), icon: Truck },
    { id: 3, name: t('steps.payment'), icon: CreditCard },
    { id: 4, name: t('steps.review'), icon: Eye },
    ...(showPaymentForm ? [{ id: 5, name: 'Complete Payment', icon: CreditCard }] : []),
  ]

  const form = useForm<GuestCheckoutInput>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      guestEmail: "",
      guestPhone: "",
      fullName: "",
      phone: "",
      street: "",
      building: "",
      city: "",
      country: "UAE",
      apartment: "",
      landmark: "",
      notes: "",
      paymentMethod: "pay_online", // Default to online payment
    },
  })

  // Fetch guest cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await apiClient.get<GuestCart>('/guest-cart')
        setCart(data)
      } catch (error: any) {
        console.error('Failed to fetch cart:', error)
        toast.error('Failed to load cart')
        router.push('/cart')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [router])

  // Redirect if cart is empty (but not if order was just completed)
  useEffect(() => {
    if (!orderCompleted && !isLoading && (!cart || !cart.items || cart.items.length === 0)) {
      toast.error('Your cart is empty')
      router.push('/products')
    }
  }, [cart, isLoading, router, orderCompleted])

  const onSubmit = async (data: GuestCheckoutInput) => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      return
    }

    // Map payment method to API value
    const selectedPaymentOption = paymentOptions.find(p => p.id === data.paymentMethod)
    const apiPaymentMethod = selectedPaymentOption?.apiValue || 'CASH_ON_DELIVERY'
    const isOnlinePayment = data.paymentMethod !== 'cod'

    // Final submission
    setIsSubmitting(true)
    try {
      const orderData = {
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          street: data.street,
          building: data.building,
          city: data.city,
          country: data.country,
          apartment: data.apartment,
          landmark: data.landmark,
          notes: data.notes,
        },
        paymentMethod: apiPaymentMethod,
      }

      const order = await apiClient.post<{ id: string; orderNumber: string }>('/guest-orders', orderData)

      setCreatedOrderId(order.id)
      setCreatedOrderNumber(order.orderNumber)
      setGuestEmail(data.guestEmail)

      // If online payment, initialize Paymob
      if (isOnlinePayment) {
        console.log('[Checkout] Creating payment intent for order:', order.id)

        try {
          // Always use 'card' - Paymob will show all payment options (card, Apple Pay, Google Pay)
          const paymentIntent = await apiClient.post<{ clientSecret: string }>('/payments/create-intent-guest', {
            orderId: order.id,
            paymentMethod: 'card',
          })

          console.log('[Checkout] Payment intent created successfully')
          console.log('[Checkout] Client secret received:', paymentIntent.clientSecret?.substring(0, 20) + '...')

          if (!paymentIntent.clientSecret) {
            throw new Error('No client secret received from payment API')
          }

          setClientSecret(paymentIntent.clientSecret)
          setShowPaymentForm(true)
          setCurrentStep(5)

          console.log('[Checkout] Moved to payment step 5')
        } catch (paymentError: any) {
          console.error('[Checkout] Payment intent creation failed:', paymentError)
          toast.error(paymentError.response?.data?.message || 'Failed to initialize payment. Please try again.')
          // Keep the order created, but don't proceed to payment
        }
      } else {
        // COD - complete immediately
        console.log('[Checkout] COD order placed, clearing cart...')
        setOrderCompleted(true)
        clearCartImmediate() // Instant UI update

        // Also clear server-side
        apiClient.delete('/guest-cart').catch(() => {})

        toast.success(`Order #${order.orderNumber} placed successfully!`)
        router.push(`/track-order?orderNumber=${order.orderNumber}&email=${data.guestEmail}`)
      }
    } catch (error: any) {
      console.error('[Checkout] Order creation failed:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = () => {
    setOrderCompleted(true)
    clearCartImmediate() // Instant UI update

    // Also clear server-side (fire and forget)
    apiClient.delete('/guest-cart').catch(() => {})

    toast.success('Payment successful!')
    router.push(`/order-success?orderId=${createdOrderId}`)
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setClientSecret(null)
    setCurrentStep(4)
    toast('Payment cancelled')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oud-gold mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('title')} (Guest)</h1>
      <p className="text-muted-foreground mb-8">Complete your purchase without creating an account</p>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.id
                        ? "bg-green-600 text-white"
                        : currentStep === step.id
                        ? "bg-oud-gold text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className="text-xs mt-2 font-medium text-center">{step.name}</span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Step 1: Contact & Address */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information & Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Contact Information */}
                      <div>
                        <h3 className="font-semibold mb-4 text-oud-gold">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="guestEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('email')} *</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" placeholder="your@email.com" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="guestPhone"
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
                      </div>

                      <Separator />

                      {/* Shipping Address */}
                      <div>
                        <h3 className="font-semibold mb-4 text-oud-gold">{t('shippingAddress')}</h3>
                        <div className="space-y-4">
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
                                  <FormLabel>Delivery {t('phone')} *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="+971 50 123 4567" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address *</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="building"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Building / Villa *</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="apartment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Apartment (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

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
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('country')} *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="UAE">UAE</SelectItem>
                                      <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                                      <SelectItem value="Kuwait">Kuwait</SelectItem>
                                      <SelectItem value="Qatar">Qatar</SelectItem>
                                      <SelectItem value="Oman">Oman</SelectItem>
                                      <SelectItem value="Bahrain">Bahrain</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="landmark"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nearby Landmark (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., Next to Dubai Mall" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Any special instructions for delivery" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button type="submit" variant="primary" className="w-full" size="lg">
                        {t('continueToDelivery')}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Delivery (Info Only for Guest) */}
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
                      <div className="bg-gradient-to-r from-oud-gold/10 to-amber-500/10 p-6 rounded-lg border border-oud-gold/20">
                        <div className="flex items-start gap-4">
                          <Truck className="w-8 h-8 text-oud-gold flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{t('standardDelivery')}</h3>
                            <p className="text-muted-foreground mb-2">{t('deliveryTime3to5')}</p>
                            <p className="text-sm font-medium text-oud-gold">
                              {formatCurrency(cart.summary.shipping || 30)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                        <p className="text-amber-700 font-medium text-center">
                          UAE: 30 AED | Gulf: 130 AED
                        </p>
                      </div>

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
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup value={field.value} onValueChange={field.onChange}>
                                <div className="space-y-3">
                                  {availablePaymentMethods.map((option) => {
                                    const IconComponent = option.icon
                                    return (
                                      <Label
                                        key={option.id}
                                        htmlFor={option.id}
                                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                          field.value === option.id
                                            ? 'border-oud-gold bg-oud-gold/5'
                                            : 'hover:border-oud-gold'
                                        }`}
                                      >
                                        <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                                        <IconComponent className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                        <div className="flex-1">
                                          <p className="font-semibold">{option.name}</p>
                                          <p className="text-sm text-muted-foreground">{option.description}</p>
                                        </div>
                                      </Label>
                                    )
                                  })}
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                        <h3 className="font-semibold mb-2">Contact Information</h3>
                        <p className="text-sm text-muted-foreground">
                          {form.getValues("guestEmail")}<br />
                          {form.getValues("guestPhone")}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-2">{t('shippingAddress')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {form.getValues("fullName")}<br />
                          {form.getValues("street")}, {form.getValues("building")}
                          {form.getValues("apartment") && `, Apt ${form.getValues("apartment")}`}<br />
                          {form.getValues("city")}, {form.getValues("country")}<br />
                          {form.getValues("phone")}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-2">{t('paymentMethod')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {paymentOptions.find(p => p.id === form.getValues("paymentMethod"))?.name || form.getValues("paymentMethod")}
                        </p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <strong>Order Tracking:</strong> We'll send order updates to <strong>{form.getValues("guestEmail")}</strong>
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

              {/* Step 5: Card Payment */}
              {currentStep === 5 && showPaymentForm && clientSecret && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Order #{createdOrderNumber}</strong> created. Complete payment to confirm.
                    </p>
                  </div>

                  <PaymobCheckout
                    clientSecret={clientSecret}
                    orderId={createdOrderId!}
                    total={cart?.summary.total || 0}
                    isGuestOrder={true}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                  />
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
              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items.map((item: any) => {
                  // Handle different image formats: string, object with url, or array
                  const getProductImage = () => {
                    const images = item.product?.images
                    const image = item.product?.image

                    // Check single image field first (transformed by backend)
                    if (image && typeof image === 'string' && image.length > 0) {
                      return image
                    }

                    // Check images array
                    if (Array.isArray(images) && images.length > 0) {
                      const firstImage = images[0]
                      if (typeof firstImage === 'string') {
                        return firstImage
                      }
                      if (firstImage?.url) {
                        return firstImage.url
                      }
                    }

                    return '/images/placeholder-product.png'
                  }

                  const productImage = getProductImage()
                  const productPrice = item.price || item.variant?.price || item.product?.salePrice || item.product?.price || 0

                  return (
                    <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={productImage}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="text-sm font-semibold text-oud-gold">{formatCurrency(productPrice * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('subtotal')} ({cart.items.length} {t('items')}):</span>
                  <span className="font-semibold">{formatCurrency(cart.summary.subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>{t('shipping')}:</span>
                  <span className="font-semibold">
                    {formatCurrency(cart.summary.shipping || 30)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>{t('tax')} (5%):</span>
                  <span className="font-semibold">{formatCurrency(cart.summary.tax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="font-bold">{t('total')}:</span>
                <span className="text-2xl font-bold text-oud-gold">
                  {formatCurrency(cart.summary.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
