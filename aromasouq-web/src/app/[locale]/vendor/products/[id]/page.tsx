"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { apiClient } from "@/lib/api-client"
import toast from "react-hot-toast"
import { ArrowLeft, Package, Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { VariantManager } from "@/components/vendor/VariantManager"
import { useTranslations } from 'next-intl'

// Reuse the same schema from new product page
const updateProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  nameAr: z.string().optional(),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  descriptionAr: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  price: z.number().min(1, "Price must be at least 1 AED"),
  compareAtPrice: z.number().optional(),
  cost: z.number().optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  barcode: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  lowStockAlert: z.number().optional(),
  images: z.array(z.string()).optional(),
  video: z.string().optional(),
  size: z.string().optional(),
  concentration: z.string().optional(),
  gender: z.string().optional(),
  topNotes: z.string().optional(),
  heartNotes: z.string().optional(),
  baseNotes: z.string().optional(),
  notes: z.string().optional(),
  scentFamily: z.string().optional(),
  longevity: z.string().optional(),
  sillage: z.string().optional(),
  season: z.string().optional(),
  productType: z.string().optional(),
  region: z.string().optional(),
  occasion: z.string().optional(),
  oudType: z.string().optional(),
  collection: z.string().optional(),
  enableWhatsapp: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
  coinsToAward: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

type UpdateProductInput = z.infer<typeof updateProductSchema>

export default function EditProductPage() {
  const t = useTranslations('vendor.newProduct')
  const tEdit = useTranslations('vendor.editProduct')
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
  })

  // Fetch product data
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiClient.get<any>(`/products/${productId}`),
    enabled: !!productId,
  })

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get<any[]>('/categories'),
  })

  // Fetch brands
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => apiClient.get<any[]>('/brands'),
  })

  // Populate form when product data is loaded
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        nameAr: product.nameAr || "",
        slug: product.slug || "",
        description: product.description || "",
        descriptionAr: product.descriptionAr || "",
        categoryId: product.categoryId || "",
        brandId: product.brandId || "",
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice || undefined,
        cost: product.cost || undefined,
        sku: product.sku || "",
        barcode: product.barcode || "",
        stock: product.stock || 0,
        lowStockAlert: product.lowStockAlert || 10,
        images: product.images || [],
        video: product.video || "",
        size: product.size || "",
        concentration: product.concentration || "",
        gender: product.gender || "",
        topNotes: product.topNotes || "",
        heartNotes: product.heartNotes || "",
        baseNotes: product.baseNotes || "",
        notes: product.notes || "",
        scentFamily: product.scentFamily || "",
        longevity: product.longevity || "",
        sillage: product.sillage || "",
        season: product.season || "",
        enableWhatsapp: product.enableWhatsapp || false,
        whatsappNumber: product.whatsappNumber || "",
        coinsToAward: product.coinsToAward || 0,
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured || false,
      })
    }
  }, [product, form])

  const onSubmit = async (data: UpdateProductInput) => {
    setIsLoading(true)
    try {
      await apiClient.patch(`/products/${productId}`, data)
      toast.success(tEdit('productUpdated'))
      router.push('/vendor/products')
    } catch (error: any) {
      console.error('Update product error:', error)
      toast.error(error?.response?.data?.message || tEdit('failedToUpdate'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-oud-gold" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{tEdit('productNotFound')}</p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/vendor/products">{tEdit('backToProducts')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vendor/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{tEdit('title')}</h1>
          <p className="text-muted-foreground">
            {tEdit('subtitle')}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-8">
                  <TabsTrigger value="basic">{t('tabBasic')}</TabsTrigger>
                  <TabsTrigger value="media">{t('tabMedia')}</TabsTrigger>
                  <TabsTrigger value="pricing">{t('tabPricing')}</TabsTrigger>
                  <TabsTrigger value="variants">{tEdit('tabVariants')}</TabsTrigger>
                  <TabsTrigger value="scent">{t('tabScent')}</TabsTrigger>
                  <TabsTrigger value="specs">{t('tabSpecs')}</TabsTrigger>
                  <TabsTrigger value="classification">{t('tabClassification')}</TabsTrigger>
                  <TabsTrigger value="advanced">{t('tabAdvanced')}</TabsTrigger>
                </TabsList>

                {/* Tab 1: Basic Info */}
                <TabsContent value="basic">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('basicInfo')}</CardTitle>
                      <CardDescription>
                        {tEdit('basicInfoDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('productNameEn')} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t('productNameEnPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nameAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('productNameAr')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('productNameArPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('urlSlug')} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t('urlSlugPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('descriptionEn')} *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t('descriptionEnPlaceholder')}
                                rows={5}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="descriptionAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('descriptionAr')}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t('descriptionArPlaceholder')}
                                rows={5}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('category')} *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('selectCategory')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map((category: any) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="brandId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('brand')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('selectBrand')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {brands?.map((brand: any) => (
                                    <SelectItem key={brand.id} value={brand.id}>
                                      {brand.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 2: Media - Same as new product page */}
                <TabsContent value="media">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('media')}</CardTitle>
                      <CardDescription>
                        {tEdit('mediaDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                          {tEdit('imageUploadComingSoon')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tEdit('currentImages', { count: product.images?.length || 0 })}
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="video"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('videoUrl')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('videoUrlPlaceholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('videoUrlDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 3: Pricing & Inventory - Same structure as new product */}
                <TabsContent value="pricing">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('pricingInventory')}</CardTitle>
                      <CardDescription>
                        {tEdit('pricingInventoryDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('priceAED')} *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder={t('priceAEDPlaceholder')}
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="compareAtPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('compareAtPrice')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="149.99"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormDescription>
                                {t('compareAtPriceDesc')}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('costPerItem')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="50.00"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('costPerItemDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('skuLabel')} *</FormLabel>
                              <FormControl>
                                <Input placeholder={t('skuPlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="barcode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('barcode')}</FormLabel>
                              <FormControl>
                                <Input placeholder="123456789012" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('stockQuantity')} *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="100"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lowStockAlert"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('lowStockAlert')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="10"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 4: Variants */}
                <TabsContent value="variants">
                  <Card>
                    <CardHeader>
                      <CardTitle>{tEdit('variants')}</CardTitle>
                      <CardDescription>
                        {tEdit('variantsDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VariantManager productId={(Array.isArray(params.id) ? params.id[0] : params.id) || ''} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tabs 5-7: Copy the same structure from new product page for Scent, Specs, and Advanced */}
                <TabsContent value="scent">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('scentProfile')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Same fields as new product page */}
                      <div className="grid gap-4">
                        <FormField control={form.control} name="topNotes" render={({ field }) => (
                          <FormItem><FormLabel>{t('topNotes')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="heartNotes" render={({ field }) => (
                          <FormItem><FormLabel>{t('heartNotes')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="baseNotes" render={({ field }) => (
                          <FormItem><FormLabel>{t('baseNotes')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="specs">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('specifications')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField control={form.control} name="size" render={({ field }) => (
                        <FormItem><FormLabel>{t('size')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="concentration" render={({ field }) => (
                        <FormItem><FormLabel>{t('concentration')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem><FormLabel>{t('gender')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 7: Classification (Phase 2) */}
                <TabsContent value="classification">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('classification')}</CardTitle>
                      <CardDescription>
                        {t('classificationDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Product Type */}
                      <FormField
                        control={form.control}
                        name="productType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('productType')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectProductType')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ORIGINAL">{t('original')}</SelectItem>
                                <SelectItem value="CLONE">{t('clone')}</SelectItem>
                                <SelectItem value="SIMILAR_DNA">{t('similarDNA')}</SelectItem>
                                <SelectItem value="NICHE">{t('niche')}</SelectItem>
                                <SelectItem value="ATTAR">Attar</SelectItem>
                                <SelectItem value="BODY_SPRAY">{t('bodySpray')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t('productTypeDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Region */}
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('originRegion')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectRegion')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UAE">UAE</SelectItem>
                                <SelectItem value="SAUDI">Saudi Arabia</SelectItem>
                                <SelectItem value="KUWAIT">Kuwait</SelectItem>
                                <SelectItem value="QATAR">Qatar</SelectItem>
                                <SelectItem value="OMAN">Oman</SelectItem>
                                <SelectItem value="BAHRAIN">Bahrain</SelectItem>
                                <SelectItem value="FRANCE">France</SelectItem>
                                <SelectItem value="ITALY">Italy</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="USA">United States</SelectItem>
                                <SelectItem value="INDIA">India</SelectItem>
                                <SelectItem value="THAILAND">Thailand</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t('regionDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Occasion */}
                      <FormField
                        control={form.control}
                        name="occasion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('suitableOccasions')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('occasionsPlaceholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('occasionsDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Oud Type (if applicable) */}
                      <FormField
                        control={form.control}
                        name="oudType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('oudType')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectOudType')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="CAMBODIAN">{t('cambodianOud')}</SelectItem>
                                <SelectItem value="INDIAN">{t('indianOud')}</SelectItem>
                                <SelectItem value="THAI">{t('thaiOud')}</SelectItem>
                                <SelectItem value="MALAYSIAN">{t('malaysianOud')}</SelectItem>
                                <SelectItem value="LAOTIAN">{t('laotianOud')}</SelectItem>
                                <SelectItem value="MUKHALLAT">{t('mukhallat')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t('oudTypeDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Collection */}
                      <FormField
                        control={form.control}
                        name="collection"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('collection')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectCollection')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="RAMADAN">{t('ramadanCollection')}</SelectItem>
                                <SelectItem value="SIGNATURE">{t('signatureCollection')}</SelectItem>
                                <SelectItem value="CELEBRITY">{t('celebrityCollection')}</SelectItem>
                                <SelectItem value="MOST_LOVED">{t('mostLoved')}</SelectItem>
                                <SelectItem value="TRENDING">{t('trendingNow')}</SelectItem>
                                <SelectItem value="EXCLUSIVE">{t('exclusive')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t('collectionDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 8: Advanced */}
                <TabsContent value="advanced">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('advancedSettings')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField control={form.control} name="isActive" render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel>{t('isActive')}</FormLabel>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="isFeatured" render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel>{t('isFeatured')}</FormLabel>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>{t('actions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? tEdit('updating') : tEdit('updateProduct')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href="/vendor/products">{t('cancelButton')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
