"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
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
import { ArrowLeft, Package, Upload, X, ImagePlus } from "lucide-react"
import { Link } from "@/i18n/navigation"
import imageCompression from 'browser-image-compression'
import { useTranslations } from 'next-intl'

// Comprehensive product validation schema
const createProductSchema = z.object({
  // Basic Info
  name: z.string().min(3, "Product name must be at least 3 characters"),
  nameAr: z.string().optional(),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  descriptionAr: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  customBrandName: z.string().optional(),

  // Pricing & Inventory
  price: z.number().min(1, "Price must be at least 1 AED"),
  compareAtPrice: z.number().optional(),
  cost: z.number().optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  barcode: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  lowStockAlert: z.number().optional(),

  // Media
  images: z.array(z.string()).optional(),
  video: z.string().optional(),

  // Specifications
  size: z.string().optional(),
  concentration: z.string().optional(),
  gender: z.enum(["men", "women", "unisex"]).optional(),

  // Scent Profile
  topNotes: z.string().optional(),
  heartNotes: z.string().optional(),
  baseNotes: z.string().optional(),
  notes: z.string().optional(),
  scentFamily: z.enum(["floral", "oriental", "woody", "fresh", "citrus", "fruity", "spicy", "aquatic", "green", "gourmand", "musky", "leather"]).optional(),
  longevity: z.string().optional(),
  sillage: z.string().optional(),
  season: z.string().optional(),

  // Classification (NOW MANDATORY)
  productType: z.enum(["ORIGINAL", "CLONE", "SIMILAR_DNA", "NICHE", "ATTAR", "BODY_SPRAY", "BAKHOOR", "HOME_FRAGRANCE", "GIFT_SET", "OUR_BRAND"]).optional(),
  region: z.string().optional(),
  occasion: z.string().optional(),
  oudType: z.string().optional(),
  collection: z.string().optional(),
  format: z.enum(["SPRAY", "OIL", "ROLLON", "SAMPLE", "GIFT_SET"]).optional(),
  priceSegment: z.enum(["BUDGET", "MID", "PREMIUM", "LUXURY", "ULTRA_LUXURY"]).optional(),

  // Advanced
  enableWhatsapp: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
  coinsToAward: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),

  // Flash Sale
  isOnSale: z.boolean().optional(),
  salePrice: z.number().optional(),
  saleEndDate: z.date().optional(),
  discountPercent: z.number().optional(),
})

type CreateProductInput = z.infer<typeof createProductSchema>

export default function NewProductPage() {
  const t = useTranslations('vendor.newProduct')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isCompressing, setIsCompressing] = useState(false)

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      slug: "",
      description: "",
      descriptionAr: "",
      categoryId: "",
      brandId: "",
      customBrandName: "",
      price: 0,
      compareAtPrice: 0,
      cost: 0,
      sku: "",
      barcode: "",
      stock: 0,
      lowStockAlert: 10,
      images: [],
      video: "",
      size: "",
      concentration: "",
      gender: undefined,
      topNotes: "",
      heartNotes: "",
      baseNotes: "",
      notes: "",
      scentFamily: undefined,
      longevity: "",
      sillage: "",
      season: "",
      productType: undefined,
      region: "",
      occasion: "",
      oudType: "",
      collection: "",
      format: undefined,
      priceSegment: undefined,
      enableWhatsapp: false,
      whatsappNumber: "",
      coinsToAward: 0,
      metaTitle: "",
      metaDescription: "",
      isActive: true,
      isFeatured: false,
      isOnSale: false,
      salePrice: 0,
      saleEndDate: undefined,
      discountPercent: 0,
    },
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

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    form.setValue('name', value)
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    form.setValue('slug', slug)
  }

  // Handle image selection and compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check total number of images (existing + new)
    if (selectedImages.length + files.length > 10) {
      toast.error(t('maxImagesReached'))
      return
    }

    setIsCompressing(true)
    try {
      const compressedFiles: File[] = []
      const previews: string[] = []

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(t('notAnImage', { name: file.name }))
          continue
        }

        // Compress image
        const options = {
          maxSizeMB: 1, // Max file size 1MB
          maxWidthOrHeight: 1920, // Max dimension
          useWebWorker: true,
        }

        const compressedFile = await imageCompression(file, options)
        compressedFiles.push(compressedFile)

        // Create preview
        const previewUrl = URL.createObjectURL(compressedFile)
        previews.push(previewUrl)
      }

      setSelectedImages(prev => [...prev, ...compressedFiles])
      setImagePreviews(prev => [...prev, ...previews])
      toast.success(t('imagesCompressed', { count: compressedFiles.length }))
    } catch (error) {
      console.error('Image compression error:', error)
      toast.error(t('failedToCompress'))
    } finally {
      setIsCompressing(false)
    }
  }

  // Remove image from selection
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index)
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index])
      return newPreviews
    })
  }

  const onSubmit = async (data: CreateProductInput) => {
    console.log('Form submitted with data:', data)
    setIsLoading(true)
    try {
      // Step 1: Create the product
      const response = await apiClient.post<any>('/products', data)
      const productId = response.id

      // Step 2: Upload images if any
      if (selectedImages.length > 0) {
        toast.loading(t('uploadingImages', { count: selectedImages.length }), { id: 'upload-images' })

        try {
          await apiClient.uploadFiles(`/uploads/products/${productId}/images`, selectedImages, 'files')
          toast.success(t('productCreatedWithImages', { count: selectedImages.length }), { id: 'upload-images' })
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError)
          toast.error(t('productCreatedImagesFailed'), { id: 'upload-images' })
        }
      } else {
        toast.success(t('productCreated'))
      }

      router.push('/vendor/products')
    } catch (error: any) {
      console.error('Create product error:', error)
      toast.error(error?.response?.data?.message || t('failedToCreate'))
    } finally {
      setIsLoading(false)
    }
  }

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)
    toast.error(t('fillRequiredFields'))
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
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="basic">{t('tabBasic')}</TabsTrigger>
                  <TabsTrigger value="media">{t('tabMedia')}</TabsTrigger>
                  <TabsTrigger value="pricing">{t('tabPricing')}</TabsTrigger>
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
                        {t('basicInfoDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('productNameEn')} <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('productNameEnPlaceholder')}
                                {...field}
                                onChange={(e) => handleNameChange(e.target.value)}
                              />
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
                            <FormLabel>{t('urlSlug')} <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder={t('urlSlugPlaceholder')} {...field} />
                            </FormControl>
                            <FormDescription>
                              {t('urlSlugDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('descriptionEn')} <span className="text-red-500">*</span></FormLabel>
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

                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('category')} <span className="text-red-500">*</span></FormLabel>
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

                      <div className="grid grid-cols-2 gap-4">
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
                              <FormDescription>
                                Select from existing brands
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customBrandName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Brand Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Or enter your own brand name"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Use this if your brand is not in the list
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 2: Media */}
                <TabsContent value="media">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('media')}</CardTitle>
                      <CardDescription>
                        {t('mediaDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Image Upload Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{t('productImages')}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedImages.length}/10 images
                          </p>
                        </div>

                        {/* Upload Button */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-oud-gold transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            id="image-upload"
                            disabled={isCompressing || selectedImages.length >= 10}
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            {isCompressing ? (
                              <>
                                <Package className="h-12 w-12 mx-auto text-oud-gold mb-4 animate-pulse" />
                                <p className="text-sm text-muted-foreground">
                                  {t('compressing')}
                                </p>
                              </>
                            ) : (
                              <>
                                <ImagePlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-sm font-medium text-oud-gold mb-2">
                                  {t('clickToUpload')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t('imageRequirements')}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t('selectMultiple')}
                                </p>
                              </>
                            )}
                          </label>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-3 gap-4">
                            {imagePreviews.map((preview, index) => (
                              <div
                                key={index}
                                className="relative group aspect-square border rounded-lg overflow-hidden"
                              >
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                  {(selectedImages[index].size / 1024).toFixed(1)} KB
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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

                {/* Tab 3: Pricing & Inventory */}
                <TabsContent value="pricing">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('pricingInventory')}</CardTitle>
                      <CardDescription>
                        {t('pricingInventoryDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('priceAED')} <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder={t('priceAEDPlaceholder')}
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
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
                                  value={field.value || ''}
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
                                value={field.value || ''}
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
                              <FormLabel>{t('skuLabel')} <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder={t('skuPlaceholder')} {...field} />
                              </FormControl>
                              <FormDescription>
                                {t('skuDesc')}
                              </FormDescription>
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
                              <FormLabel>{t('stockQuantity')} <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="100"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
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
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormDescription>
                                {t('lowStockAlertDesc')}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 4: Scent Profile */}
                <TabsContent value="scent">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('scentProfile')}</CardTitle>
                      <CardDescription>
                        {t('scentProfileDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="topNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('topNotes')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('topNotesPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="heartNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('heartNotes')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('heartNotesPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="baseNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('baseNotes')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('baseNotesPlaceholder')} {...field} />
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
                            <FormLabel>{t('additionalNotes')}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t('additionalNotesPlaceholder')}
                                rows={3}
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
                          name="scentFamily"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('scentFamily')} <span className="text-red-500">*</span></FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('selectScentFamily')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="floral">Floral</SelectItem>
                                  <SelectItem value="oriental">Oriental</SelectItem>
                                  <SelectItem value="woody">Woody</SelectItem>
                                  <SelectItem value="fresh">Fresh</SelectItem>
                                  <SelectItem value="citrus">Citrus</SelectItem>
                                  <SelectItem value="fruity">Fruity</SelectItem>
                                  <SelectItem value="spicy">Spicy</SelectItem>
                                  <SelectItem value="aquatic">Aquatic</SelectItem>
                                  <SelectItem value="green">Green</SelectItem>
                                  <SelectItem value="gourmand">Gourmand</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="season"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('bestSeason')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('selectSeason')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="spring">{t('spring')}</SelectItem>
                                  <SelectItem value="summer">{t('summer')}</SelectItem>
                                  <SelectItem value="autumn">{t('autumn')}</SelectItem>
                                  <SelectItem value="winter">{t('winter')}</SelectItem>
                                  <SelectItem value="all">{t('allSeasons')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="longevity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('longevity')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('longevityPlaceholder')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="weak">{t('longevityWeak')}</SelectItem>
                                  <SelectItem value="moderate">{t('longevityModerate')}</SelectItem>
                                  <SelectItem value="long-lasting">{t('longevityLong')}</SelectItem>
                                  <SelectItem value="very-long-lasting">{t('longevityVeryLong')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sillage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('sillage')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('sillagePlaceholder')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="intimate">{t('sillageIntimate')}</SelectItem>
                                  <SelectItem value="moderate">{t('sillageModerate')}</SelectItem>
                                  <SelectItem value="strong">{t('sillageStrong')}</SelectItem>
                                  <SelectItem value="enormous">{t('sillageEnormous')}</SelectItem>
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

                {/* Tab 5: Specifications */}
                <TabsContent value="specs">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('specifications')}</CardTitle>
                      <CardDescription>
                        {t('specificationsDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('size')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('sizePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="concentration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('concentration')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectConcentration')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="parfum">{t('parfum')}</SelectItem>
                                <SelectItem value="edp">{t('edp')}</SelectItem>
                                <SelectItem value="edt">{t('edt')}</SelectItem>
                                <SelectItem value="edc">{t('edc')}</SelectItem>
                                <SelectItem value="attar">{t('attar')}</SelectItem>
                                <SelectItem value="oud">{t('oud')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('gender')} <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectGender')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="unisex">{t('unisex')}</SelectItem>
                                <SelectItem value="men">{t('men')}</SelectItem>
                                <SelectItem value="women">{t('women')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 6: Classification (Phase 2) */}
                <TabsContent value="classification">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('classification')}</CardTitle>
                      <CardDescription>
                        {t('classificationDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Product Type - NOW MANDATORY */}
                      <FormField
                        control={form.control}
                        name="productType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('productType')} <span className="text-red-500">*</span></FormLabel>
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
                                <SelectItem value="BAKHOOR">{t('bakhoor')}</SelectItem>
                                <SelectItem value="HOME_FRAGRANCE">{t('homeFragrance')}</SelectItem>
                                <SelectItem value="GIFT_SET">{t('giftSet')}</SelectItem>
                                <SelectItem value="OUR_BRAND">{t('ourBrand')}</SelectItem>
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

                      {/* Format - NOW MANDATORY */}
                      <FormField
                        control={form.control}
                        name="format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('format')} <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectFormat')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SPRAY">{t('spray')}</SelectItem>
                                <SelectItem value="OIL">{t('oil')}</SelectItem>
                                <SelectItem value="ROLLON">{t('rollOn')}</SelectItem>
                                <SelectItem value="SAMPLE">{t('sample')}</SelectItem>
                                <SelectItem value="GIFT_SET">{t('giftSet')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t('formatDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Price Segment - NOW MANDATORY */}
                      <FormField
                        control={form.control}
                        name="priceSegment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('priceSegment')} <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectPriceSegment')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="BUDGET">{t('budget')}</SelectItem>
                                <SelectItem value="MID">{t('midRange')}</SelectItem>
                                <SelectItem value="PREMIUM">{t('premium')}</SelectItem>
                                <SelectItem value="LUXURY">{t('luxury')}</SelectItem>
                                <SelectItem value="ULTRA_LUXURY">{t('ultraLuxury')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t('priceSegmentDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 7: Advanced */}
                <TabsContent value="advanced">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('advancedSettings')}</CardTitle>
                      <CardDescription>
                        {t('advancedSettingsDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* WhatsApp */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">{t('whatsappIntegration')}</h3>
                        <FormField
                          control={form.control}
                          name="enableWhatsapp"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{t('enableWhatsapp')}</FormLabel>
                                <FormDescription>
                                  {t('enableWhatsappDesc')}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {form.watch('enableWhatsapp') && (
                          <FormField
                            control={form.control}
                            name="whatsappNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('whatsappNumber')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('whatsappNumberPlaceholder')} {...field} />
                                </FormControl>
                                <FormDescription>
                                  {t('whatsappNumberDesc')}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* Coins System */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">{t('rewards')}</h3>
                        <FormField
                          control={form.control}
                          name="coinsToAward"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('coinsToAward')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={t('coinsToAwardPlaceholder')}
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                {t('coinsToAwardDesc')}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* SEO */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">{t('seoSettings')}</h3>
                        <FormField
                          control={form.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('metaTitle')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('metaTitlePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('metaDescription')}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t('metaDescriptionPlaceholder')}
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Visibility */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">{t('visibility')}</h3>
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{t('isActive')}</FormLabel>
                                <FormDescription>
                                  {t('isActiveDesc')}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{t('isFeatured')}</FormLabel>
                                <FormDescription>
                                  {t('isFeaturedDesc')}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Flash Sale */}
                      <div className="space-y-4 border-t pt-6">
                        <h3 className="font-semibold">{t('flashSale')}</h3>
                        <FormField
                          control={form.control}
                          name="isOnSale"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{t('putOnSale')}</FormLabel>
                                <FormDescription>
                                  {t('putOnSaleDesc')}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {form.watch('isOnSale') && (
                          <div className="space-y-4 pl-6 border-l-2 border-oud-gold/30">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="salePrice"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('salePrice')}</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={t('salePricePlaceholder')}
                                        {...field}
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      {t('salePriceDesc')}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="discountPercent"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('discountPercent')}</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder={t('discountPercentPlaceholder')}
                                        {...field}
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      {t('discountPercentDesc')}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="saleEndDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('saleEndDate')}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="datetime-local"
                                      {...field}
                                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {t('saleEndDateDesc')}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
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
                    onClick={() => console.log('Submit button clicked', form.formState.errors)}
                  >
                    {isLoading ? t('creating') : t('createProduct')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href="/vendor/products">{t('cancelButton')}</Link>
                  </Button>

                  {/* Debug Info */}
                  {Object.keys(form.formState.errors).length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-semibold text-red-800 mb-2">
                        {t('validationErrors')}
                      </p>
                      <ul className="text-xs text-red-700 space-y-1">
                        {Object.entries(form.formState.errors).map(([field, error]: [string, any]) => (
                          <li key={field}>
                            <strong>{field}:</strong> {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
