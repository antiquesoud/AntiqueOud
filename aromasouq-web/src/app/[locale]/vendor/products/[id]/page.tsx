"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as z from "zod"
import imageCompression from "browser-image-compression"
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
import { ArrowLeft, Package, Loader2, Upload, X, ImagePlus, Trash2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { VariantManager } from "@/components/vendor/VariantManager"
import { useTranslations } from 'next-intl'

// Schema for product update - includes all fields from create
const updateProductSchema = z.object({
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
  price: z.number().min(0, "Price cannot be negative"),
  compareAtPrice: z.number().optional(),
  cost: z.number().optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  barcode: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  lowStockAlert: z.number().optional(),
  // Media
  images: z.array(z.string()).optional(),
  video: z.string().optional(),
  // Specs
  size: z.string().optional(),
  concentration: z.string().optional(),
  gender: z.string().optional(),
  // Scent Profile
  topNotes: z.string().optional(),
  heartNotes: z.string().optional(),
  baseNotes: z.string().optional(),
  notes: z.string().optional(),
  scentFamily: z.string().optional(),
  longevity: z.string().optional(),
  sillage: z.string().optional(),
  season: z.string().optional(),
  // Classification
  productType: z.string().optional(),
  region: z.string().optional(),
  occasion: z.string().optional(),
  oudType: z.string().optional(),
  collection: z.string().optional(),
  format: z.string().optional(),
  priceSegment: z.string().optional(),
  // WhatsApp & Coins
  enableWhatsapp: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
  coinsToAward: z.number().optional(),
  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  // Status
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  // Flash Sale
  isOnSale: z.boolean().optional(),
  salePrice: z.number().optional(),
  discountPercent: z.number().optional(),
  saleEndDate: z.string().optional(),
})

type UpdateProductInput = z.infer<typeof updateProductSchema>

export default function EditProductPage() {
  const t = useTranslations('vendor.newProduct')
  const tEdit = useTranslations('vendor.editProduct')
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const productId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [isInitialLoad, setIsInitialLoad] = useState(true) // Track if form has been initialized

  // Image upload state
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)

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

  // Populate form when product data is loaded - ONLY on initial load
  // This prevents form reset when images are uploaded (which triggers a refetch)
  useEffect(() => {
    if (product && isInitialLoad) {
      form.reset({
        // Basic Info
        name: product.name || "",
        nameAr: product.nameAr || "",
        slug: product.slug || "",
        description: product.description || "",
        descriptionAr: product.descriptionAr || "",
        categoryId: product.categoryId || "",
        brandId: product.brandId || "",
        customBrandName: product.customBrandName || "",
        // Pricing & Inventory
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice || undefined,
        cost: product.cost || undefined,
        sku: product.sku || "",
        barcode: product.barcode || "",
        stock: product.stock || 0,
        lowStockAlert: product.lowStockAlert || 10,
        // Media - convert image objects to URL strings
        images: (product.images || [])
          .map((img: any) => {
            if (typeof img === 'object' && img?.url) return img.url
            if (typeof img === 'string' && img.trim()) return img
            return null
          })
          .filter(Boolean),
        video: product.video || "",
        // Specs
        size: product.size || "",
        concentration: product.concentration || "",
        gender: product.gender || "",
        // Scent Profile
        topNotes: product.topNotes || "",
        heartNotes: product.heartNotes || "",
        baseNotes: product.baseNotes || "",
        notes: product.notes || "",
        scentFamily: product.scentFamily || "",
        longevity: product.longevity || "",
        sillage: product.sillage || "",
        season: product.season || "",
        // Classification
        productType: product.productType || "",
        region: product.region || "",
        occasion: product.occasion || "",
        oudType: product.oudType || "",
        collection: product.collection || "",
        format: product.format || "",
        priceSegment: product.priceSegment || "",
        // WhatsApp & Coins
        enableWhatsapp: product.enableWhatsapp || false,
        whatsappNumber: product.whatsappNumber || "",
        coinsToAward: product.coinsToAward || 0,
        // SEO
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        // Status
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured || false,
        // Flash Sale
        isOnSale: product.isOnSale || false,
        salePrice: product.salePrice || undefined,
        discountPercent: product.discountPercent || undefined,
        saleEndDate: product.saleEndDate ? new Date(product.saleEndDate).toISOString().split('T')[0] : "",
      })
      setIsInitialLoad(false) // Mark as initialized, won't reset form again
    }
  }, [product, form, isInitialLoad])

  // Auto-generate slug when product name changes
  const watchedName = form.watch('name')
  useEffect(() => {
    // Only auto-generate if form is initialized and name changed
    if (!isInitialLoad && watchedName) {
      const generatedSlug = watchedName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .substring(0, 100) // Limit length

      form.setValue('slug', generatedSlug, { shouldDirty: true })
    }
  }, [watchedName, isInitialLoad, form])

  // Get valid existing images - images can be objects with url property or strings
  const getExistingImages = () => {
    if (!product?.images) return []
    return product.images.filter((img: any) => {
      // Handle object format: { id, url, ... }
      if (typeof img === 'object' && img?.url) return true
      // Handle string format (legacy)
      if (typeof img === 'string' && img.trim()) return true
      return false
    })
  }
  const existingImages = getExistingImages()
  const existingImagesCount = existingImages.length

  // Get image URL from image object or string
  const getImageUrl = (img: any): string => {
    if (typeof img === 'object' && img?.url) return img.url
    if (typeof img === 'string') return img
    return ''
  }

  // Get image ID from image object
  const getImageId = (img: any): string | null => {
    if (typeof img === 'object' && img?.id) return img.id
    return null
  }

  // Handle image selection with compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check total number of images (existing + new)
    if (existingImagesCount + selectedImages.length + files.length > 10) {
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
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
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
      console.error('Image compression failed:', error)
      toast.error(t('failedToCompress'))
    } finally {
      setIsCompressing(false)
    }
  }

  // Remove a selected image (not yet uploaded)
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index)
      URL.revokeObjectURL(prev[index])
      return newPreviews
    })
  }

  // Upload new images
  const uploadNewImages = async () => {
    if (selectedImages.length === 0) return

    setIsUploadingImages(true)
    try {
      await apiClient.uploadFiles(`/uploads/products/${productId}/images`, selectedImages, 'files')
      toast.success(`${selectedImages.length} image(s) uploaded successfully`)

      // Clear selected images
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
      setSelectedImages([])
      setImagePreviews([])

      // Refresh product data
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
    } catch (error: any) {
      console.error('Image upload failed:', error)
      toast.error(error?.response?.data?.message || 'Failed to upload images')
    } finally {
      setIsUploadingImages(false)
    }
  }

  // Remove an existing image from the product
  const removeExistingImage = async (imageToRemove: any) => {
    if (!product?.images) return

    const confirmed = window.confirm('Are you sure you want to remove this image?')
    if (!confirmed) return

    try {
      const imageId = getImageId(imageToRemove)
      const imageUrl = getImageUrl(imageToRemove)

      // If we have an image ID, try to delete via API
      if (imageId) {
        // Try to delete the image record
        try {
          await apiClient.delete(`/products/${productId}/images/${imageId}`)
        } catch (e) {
          // If delete endpoint doesn't exist, fall back to updating images array
          console.log('Image delete endpoint not available, updating images array')
        }
      }

      // Update product images array by filtering out the removed image
      const updatedImages = existingImages
        .filter((img: any) => {
          const currentUrl = getImageUrl(img)
          const currentId = getImageId(img)
          // Remove by ID if available, otherwise by URL
          if (imageId && currentId) return currentId !== imageId
          return currentUrl !== imageUrl
        })
        .map((img: any) => getImageUrl(img)) // Convert to string URLs for the update

      // Update product with new images array
      await apiClient.patch(`/products/${productId}`, { images: updatedImages })
      toast.success('Image removed successfully')

      // Refresh product data
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
    } catch (error: any) {
      console.error('Failed to remove image:', error)
      toast.error(error?.response?.data?.message || 'Failed to remove image')
    }
  }

  const onSubmit = async (data: UpdateProductInput) => {
    setIsLoading(true)
    try {
      // Clean up data - SAME approach as CREATE page
      // Remove empty strings, null, and undefined values before sending to backend
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => {
          // IMPORTANT: Exclude 'images' from form submission - images are managed separately
          // via upload/delete buttons to avoid race conditions that overwrite newly uploaded images
          if (key === 'images') return false
          // Remove empty strings, null, and undefined
          if (value === '' || value === null || value === undefined) return false
          // Remove zero values for optional numeric fields (but keep stock which can be 0)
          // Keep arrays even if empty
          if (Array.isArray(value)) return true
          // Keep all other values
          return true
        })
      )

      console.log('Submitting cleaned data:', cleanedData)
      await apiClient.patch(`/products/${productId}`, cleanedData)
      toast.success(tEdit('productUpdated'))
      router.push('/vendor/products')
    } catch (error: any) {
      console.error('Update product error:', error)
      toast.error(error?.response?.data?.message || tEdit('failedToUpdate'))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form validation errors
  const onFormError = (errors: any) => {
    console.error('Form validation errors:', errors)
    const errorMessages = Object.entries(errors)
      .map(([field, error]: [string, any]) => `${field}: ${error?.message}`)
      .join(', ')
    toast.error(`Validation errors: ${errorMessages}`)
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
        <form onSubmit={form.handleSubmit(onSubmit, onFormError)}>
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

                {/* Tab 2: Media - Image Upload */}
                <TabsContent value="media">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('media')}</CardTitle>
                      <CardDescription>
                        {tEdit('mediaDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Existing Images */}
                      {existingImagesCount > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Current Images</p>
                            <p className="text-xs text-muted-foreground">
                              {existingImagesCount} existing
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {existingImages.map((image: any, index: number) => {
                              const imageUrl = getImageUrl(image)
                              const altText = typeof image === 'object' ? image.altText : `Product image ${index + 1}`
                              return (
                                <div
                                  key={getImageId(image) || index}
                                  className="relative group aspect-square border rounded-lg overflow-hidden"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={altText || `Product image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // If image fails to load, show placeholder
                                      (e.target as HTMLImageElement).style.display = 'none'
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeExistingImage(image)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    title="Remove image"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                    {typeof image === 'object' && image.isFeatured ? '⭐ Featured' : `Image ${index + 1}`}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* No images message */}
                      {existingImagesCount === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                          No images uploaded yet
                        </div>
                      )}

                      {/* Image Upload Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{t('productImages')}</p>
                          <p className="text-xs text-muted-foreground">
                            {existingImagesCount + selectedImages.length}/10 images
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
                            id="image-upload-edit"
                            disabled={isCompressing || existingImagesCount + selectedImages.length >= 10}
                          />
                          <label
                            htmlFor="image-upload-edit"
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

                        {/* New Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">New Images to Upload</p>
                              <Button
                                type="button"
                                onClick={uploadNewImages}
                                disabled={isUploadingImages}
                                size="sm"
                              >
                                {isUploadingImages ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload {selectedImages.length} Image(s)
                                  </>
                                )}
                              </Button>
                            </div>
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
                                    {(selectedImages[index]?.size / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              ))}
                            </div>
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

                {/* Tab 5: Scent Profile */}
                <TabsContent value="scent">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('scentProfile')}</CardTitle>
                      <CardDescription>
                        {t('scentProfileDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Note Pyramid */}
                      <div className="space-y-4">
                        <h4 className="font-medium">{t('notePyramid')}</h4>
                        <FormField
                          control={form.control}
                          name="topNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('topNotes')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('topNotesPlaceholder')} {...field} />
                              </FormControl>
                              <FormDescription>{t('topNotesDesc')}</FormDescription>
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
                              <FormDescription>{t('heartNotesDesc')}</FormDescription>
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
                              <FormDescription>{t('baseNotesDesc')}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('generalNotes')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('generalNotesPlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Scent Characteristics */}
                      <div className="space-y-4">
                        <h4 className="font-medium">{t('scentCharacteristics')}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="scentFamily"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('scentFamily')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('selectScentFamily')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="woody">Woody</SelectItem>
                                    <SelectItem value="oriental">Oriental</SelectItem>
                                    <SelectItem value="floral">Floral</SelectItem>
                                    <SelectItem value="fresh">Fresh</SelectItem>
                                    <SelectItem value="citrus">Citrus</SelectItem>
                                    <SelectItem value="spicy">Spicy</SelectItem>
                                    <SelectItem value="gourmand">Gourmand</SelectItem>
                                    <SelectItem value="leather">Leather</SelectItem>
                                    <SelectItem value="musky">Musky</SelectItem>
                                    <SelectItem value="aquatic">Aquatic</SelectItem>
                                    <SelectItem value="green">Green</SelectItem>
                                    <SelectItem value="fruity">Fruity</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="longevity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('longevity')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('selectLongevity')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="WEAK">Weak (1-2 hours)</SelectItem>
                                    <SelectItem value="MODERATE">Moderate (3-4 hours)</SelectItem>
                                    <SelectItem value="LONG_LASTING">Long Lasting (5-7 hours)</SelectItem>
                                    <SelectItem value="VERY_LONG_LASTING">Very Long Lasting (8-12 hours)</SelectItem>
                                    <SelectItem value="ETERNAL">Eternal (12+ hours)</SelectItem>
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
                            name="sillage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('sillage')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('selectSillage')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="INTIMATE">Intimate</SelectItem>
                                    <SelectItem value="MODERATE">Moderate</SelectItem>
                                    <SelectItem value="STRONG">Strong</SelectItem>
                                    <SelectItem value="ENORMOUS">Enormous</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>{t('sillageDesc')}</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="season"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('season')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('selectSeason')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="SPRING">Spring</SelectItem>
                                    <SelectItem value="SUMMER">Summer</SelectItem>
                                    <SelectItem value="FALL">Fall</SelectItem>
                                    <SelectItem value="WINTER">Winter</SelectItem>
                                    <SelectItem value="ALL_SEASON">All Season</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>{t('seasonDesc')}</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 6: Specifications */}
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
                            <FormDescription>{t('sizeDesc')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
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
                                  <SelectItem value="parfum">Parfum (Extrait)</SelectItem>
                                  <SelectItem value="edp">Eau de Parfum (EDP)</SelectItem>
                                  <SelectItem value="edt">Eau de Toilette (EDT)</SelectItem>
                                  <SelectItem value="edc">Eau de Cologne (EDC)</SelectItem>
                                  <SelectItem value="attar">Attar (Oil)</SelectItem>
                                  <SelectItem value="oud">Oud</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>{t('concentrationDesc')}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('gender')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('selectGender')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="men">Male</SelectItem>
                                  <SelectItem value="women">Female</SelectItem>
                                  <SelectItem value="unisex">Unisex</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>{t('genderDesc')}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
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
                                <SelectItem value="OTHERS">{t('others')}</SelectItem>
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
                                <SelectItem value="HINDI">🇮🇳 Hindi Oud</SelectItem>
                                <SelectItem value="SILANI">🇱🇰 Silani Oud</SelectItem>
                                <SelectItem value="CAMBODI">🇰🇭 Cambodi Oud</SelectItem>
                                <SelectItem value="PHILIPINI">🇵🇭 Philipini Oud</SelectItem>
                                <SelectItem value="MERUKE">🇮🇩 Meruke Oud</SelectItem>
                                <SelectItem value="UAE">🇦🇪 UAE</SelectItem>
                                <SelectItem value="SAUDI">🇸🇦 Saudi Arabia</SelectItem>
                                <SelectItem value="KUWAIT">🇰🇼 Kuwait</SelectItem>
                                <SelectItem value="QATAR">🇶🇦 Qatar</SelectItem>
                                <SelectItem value="OMAN">🇴🇲 Oman</SelectItem>
                                <SelectItem value="BAHRAIN">🇧🇭 Bahrain</SelectItem>
                                <SelectItem value="FRANCE">🇫🇷 France</SelectItem>
                                <SelectItem value="ITALY">🇮🇹 Italy</SelectItem>
                                <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                                <SelectItem value="USA">🇺🇸 United States</SelectItem>
                                <SelectItem value="INDIA">🇮🇳 India</SelectItem>
                                <SelectItem value="THAILAND">🇹🇭 Thailand</SelectItem>
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

                      {/* Format */}
                      <FormField
                        control={form.control}
                        name="format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('format')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectFormat')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SPRAY">Spray</SelectItem>
                                <SelectItem value="OIL">Oil</SelectItem>
                                <SelectItem value="ROLLON">Roll-On</SelectItem>
                                <SelectItem value="SAMPLE">Sample</SelectItem>
                                <SelectItem value="GIFT_SET">Gift Set</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t('formatDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Price Segment */}
                      <FormField
                        control={form.control}
                        name="priceSegment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('priceSegment')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('selectPriceSegment')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="BUDGET">Budget (&lt; 100 AED)</SelectItem>
                                <SelectItem value="MID">Mid-Range (100-300 AED)</SelectItem>
                                <SelectItem value="PREMIUM">Premium (300-700 AED)</SelectItem>
                                <SelectItem value="LUXURY">Luxury (700-1500 AED)</SelectItem>
                                <SelectItem value="ULTRA_LUXURY">Ultra Luxury (&gt; 1500 AED)</SelectItem>
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

                {/* Tab 8: Advanced */}
                <TabsContent value="advanced">
                  <div className="space-y-6">
                    {/* Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('productStatus')}</CardTitle>
                        <CardDescription>{t('productStatusDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{t('isActive')}</FormLabel>
                                <FormDescription>{t('isActiveDesc')}</FormDescription>
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
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{t('isFeatured')}</FormLabel>
                                <FormDescription>{t('isFeaturedDesc')}</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Flash Sale */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('flashSale')}</CardTitle>
                        <CardDescription>{t('flashSaleDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="isOnSale"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{t('enableFlashSale')}</FormLabel>
                                <FormDescription>{t('enableFlashSaleDesc')}</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        {form.watch('isOnSale') && (
                          <div className="grid grid-cols-2 gap-4 pt-4">
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
                                      placeholder="79.99"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormDescription>{t('salePriceDesc')}</FormDescription>
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
                                      placeholder="20"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormDescription>{t('discountPercentDesc')}</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="saleEndDate"
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>{t('saleEndDate')}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>{t('saleEndDateDesc')}</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* WhatsApp */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('whatsappSettings')}</CardTitle>
                        <CardDescription>{t('whatsappSettingsDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="enableWhatsapp"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{t('enableWhatsapp')}</FormLabel>
                                <FormDescription>{t('enableWhatsappDesc')}</FormDescription>
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
                                  <Input placeholder="+971501234567" {...field} />
                                </FormControl>
                                <FormDescription>{t('whatsappNumberDesc')}</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>

                    {/* Coins & Rewards */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('coinsRewards')}</CardTitle>
                        <CardDescription>{t('coinsRewardsDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="coinsToAward"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('coinsToAward')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="10"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormDescription>{t('coinsToAwardDesc')}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* SEO */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('seoSettings')}</CardTitle>
                        <CardDescription>{t('seoSettingsDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('metaTitle')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('metaTitlePlaceholder')} {...field} />
                              </FormControl>
                              <FormDescription>{t('metaTitleDesc')}</FormDescription>
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
                              <FormDescription>{t('metaDescriptionDesc')}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
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
