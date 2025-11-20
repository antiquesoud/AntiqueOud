"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, ShoppingBag, Truck, CreditCard, Eye } from "lucide-react"
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
import { StripeProvider } from "@/components/payment/StripeProvider"
import { StripeCardForm } from "@/components/payment/StripeCardForm"

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
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "ONLINE_PAYMENT", "BANK_TRANSFER"]),
})

type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>

export default function GuestCheckoutPage() {
  const router = useRouter()
  const t = useTranslations('checkout')
  const tCommon = useTranslations('common')

  const [currentStep, setCurrentStep] = useState(1)
  const [cart, setCart] = useState<GuestCart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [showStripeForm, setShowStripeForm] = useState(false)
  const [guestEmail, setGuestEmail] = useState<string>('')

  const steps = [
    { id: 1, name: t('steps.address'), icon: ShoppingBag },
    { id: 2, name: t('steps.delivery'), icon: Truck },
    { id: 3, name: t('steps.payment'), icon: CreditCard },
    { id: 4, name: t('steps.review'), icon: Eye },
    ...(showStripeForm ? [{ id: 5, name: 'Complete Payment', icon: CreditCard }] : []),
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
      paymentMethod: "CASH_ON_DELIVERY",
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

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && (!cart || !cart.items || cart.items.length === 0)) {
      toast.error('Your cart is empty')
      router.push('/products')
    }
  }, [cart, isLoading, router])

  const onSubmit = async (data: GuestCheckoutInput) => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      return
    }

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
        paymentMethod: data.paymentMethod,
      }

      const order = await apiClient.post<{ id: string; orderNumber: string }>('/guest-orders', orderData)

      setCreatedOrderId(order.id)
      setCreatedOrderNumber(order.orderNumber)
      setGuestEmail(data.guestEmail)

      // If online payment, initialize Stripe
      if (data.paymentMethod === 'ONLINE_PAYMENT') {
        console.log('[Checkout] Creating payment intent for order:', order.id)

        try {
          const paymentIntent = await apiClient.post<{ clientSecret: string }>('/payments/create-intent-guest', {
            orderId: order.id,
          })

          console.log('[Checkout] Payment intent created successfully')
          console.log('[Checkout] Client secret received:', paymentIntent.clientSecret?.substring(0, 20) + '...')

          if (!paymentIntent.clientSecret) {
            throw new Error('No client secret received from payment API')
          }

          setClientSecret(paymentIntent.clientSecret)
          setShowStripeForm(true)
          setCurrentStep(5)

          console.log('[Checkout] Moved to payment step 5')
        } catch (paymentError: any) {
          console.error('[Checkout] Payment intent creation failed:', paymentError)
          toast.error(paymentError.response?.data?.message || 'Failed to initialize payment. Please try again.')
          // Keep the order created, but don't proceed to payment
        }
      } else {
        // COD or Bank Transfer - complete immediately
        console.log('[Checkout] COD order placed, clearing cart...')

        try {
          await apiClient.delete('/guest-cart')
          console.log('[Checkout] Cart cleared successfully')
        } catch (error) {
          console.error('[Checkout] Failed to clear cart:', error)
          // Continue anyway
        }

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

  const handlePaymentSuccess = async () => {
    try {
      console.log('[Checkout] Payment successful, clearing cart...')

      // Clear the guest cart
      await apiClient.delete('/guest-cart')

      console.log('[Checkout] Cart cleared successfully')
      toast.success('Payment successful!')
      router.push(`/track-order?orderNumber=${createdOrderNumber}&email=${guestEmail}`)
    } catch (error) {
      console.error('[Checkout] Failed to clear cart:', error)
      // Still redirect even if cart clear fails
      toast.success('Payment successful!')
      router.push(`/track-order?orderNumber=${createdOrderNumber}&email=${guestEmail}`)
    }
  }

  const handlePaymentCancel = () => {
    setShowStripeForm(false)
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
                              {cart.summary.shipping === 0 ? t('freeShipping') : formatCurrency(cart.summary.shipping)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {cart.summary.subtotal >= 200 && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <p className="text-green-700 font-medium text-center">
                            🎉 You've qualified for FREE shipping!
                          </p>
                        </div>
                      )}

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
                                  <Label
                                    htmlFor="cod"
                                    className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-oud-gold transition-colors"
                                  >
                                    <RadioGroupItem value="CASH_ON_DELIVERY" id="cod" className="mt-1" />
                                    <div className="flex-1">
                                      <p className="font-semibold">{t('cashOnDelivery')}</p>
                                      <p className="text-sm text-muted-foreground">Pay with cash when you receive your order</p>
                                    </div>
                                  </Label>

                                  <Label
                                    htmlFor="online"
                                    className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-oud-gold transition-colors"
                                  >
                                    <RadioGroupItem value="ONLINE_PAYMENT" id="online" className="mt-1" />
                                    <div className="flex-1">
                                      <p className="font-semibold">Online Payment</p>
                                      <p className="text-sm text-muted-foreground">Pay securely with credit/debit card</p>
                                    </div>
                                  </Label>

                                  <Label
                                    htmlFor="bank"
                                    className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-oud-gold transition-colors"
                                  >
                                    <RadioGroupItem value="BANK_TRANSFER" id="bank" className="mt-1" />
                                    <div className="flex-1">
                                      <p className="font-semibold">Bank Transfer</p>
                                      <p className="text-sm text-muted-foreground">Transfer directly to our bank account</p>
                                    </div>
                                  </Label>
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
                          {form.getValues("paymentMethod") === "CASH_ON_DELIVERY" && t('cashOnDelivery')}
                          {form.getValues("paymentMethod") === "ONLINE_PAYMENT" && "Online Payment"}
                          {form.getValues("paymentMethod") === "BANK_TRANSFER" && "Bank Transfer"}
                        </p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <strong>📧 Order Tracking:</strong> We'll send order updates to <strong>{form.getValues("guestEmail")}</strong>
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

              {/* Step 5: Stripe Payment */}
              {currentStep === 5 && showStripeForm && clientSecret && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Order #{createdOrderNumber}</strong> created. Complete payment to confirm.
                    </p>
                  </div>

                  <StripeProvider clientSecret={clientSecret}>
                    <StripeCardForm
                      orderId={createdOrderId!}
                      total={cart?.summary.total || 0}
                      isGuestOrder={true}
                      onSuccess={handlePaymentSuccess}
                      onCancel={handlePaymentCancel}
                    />
                  </StripeProvider>
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
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.product.images?.[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      {item.variant && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                            {item.variant.name}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                    {cart.summary.shipping === 0 ? t('freeShipping') : formatCurrency(cart.summary.shipping)}
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
