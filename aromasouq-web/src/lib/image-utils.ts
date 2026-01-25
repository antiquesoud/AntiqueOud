import { Product } from '@/types'

/**
 * Optimize Supabase image URL with transformation parameters
 * This dramatically reduces image size (e.g., 2MB -> 50KB)
 */
export function optimizeSupabaseImage(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'origin'
  } = {}
): string {
  // Only transform Supabase URLs
  if (!url || !url.includes('supabase.co')) {
    return url
  }

  const { width = 400, height, quality = 75, format = 'webp' } = options

  // Check if it's a storage URL that can be transformed
  // Supabase storage URLs: /storage/v1/object/public/bucket/path
  if (url.includes('/storage/v1/object/public/')) {
    // Convert to render URL for transformation
    // From: /storage/v1/object/public/bucket/path
    // To: /storage/v1/render/image/public/bucket/path?width=X&height=Y
    const transformedUrl = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    )

    const params = new URLSearchParams()
    params.set('width', width.toString())
    if (height) params.set('height', height.toString())
    params.set('quality', quality.toString())
    params.set('format', format)
    params.set('resize', 'cover')

    return `${transformedUrl}?${params.toString()}`
  }

  return url
}

// List of available placeholder images
const PLACEHOLDER_IMAGES = [
  '/placeholder-images/antik - posts2.jpg',
  '/placeholder-images/antik - posts3.jpg',
  '/placeholder-images/antik - posts4.jpg',
  '/placeholder-images/antik - posts5.jpg',
  '/placeholder-images/antik - posts6.jpg',
  '/placeholder-images/antik - posts7.jpg',
  '/placeholder-images/antik - posts8.jpg',
  '/placeholder-images/antik - posts9.jpg',
  '/placeholder-images/antik - posts10.jpg',
  '/placeholder-images/antik - posts11.jpg',
  '/placeholder-images/antik - posts13.jpg',
  '/placeholder-images/antik - posts14.jpg',
  '/placeholder-images/antik - posts15.jpg',
]

/**
 * Get a random placeholder image based on product ID
 * Uses product ID as seed to ensure same product always gets same placeholder
 */
export function getRandomPlaceholderImage(productId?: string): string {
  if (!productId) {
    // If no ID, use truly random
    return PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)]
  }

  // Use product ID as seed for consistent randomness
  let hash = 0
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  const index = Math.abs(hash) % PLACEHOLDER_IMAGES.length
  return PLACEHOLDER_IMAGES[index]
}

/**
 * Get product image URL from various formats
 * Automatically optimizes Supabase images
 * Returns null if no image is available
 */
export function getProductImageUrl(
  product: Product | any,
  index: number = 0,
  size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'
): string | null {
  if (!product.images || product.images.length === 0) {
    return null
  }

  const image = product.images[index]
  if (!image) {
    return null
  }

  // Handle both string URLs and image objects
  const rawUrl = typeof image === 'string' ? image : image.url

  // Return raw URL for full size, optimize for others
  if (size === 'full') {
    return rawUrl
  }

  // Optimize Supabase images based on size
  const sizeConfig = {
    thumbnail: { width: 100, quality: 60 },
    medium: { width: 400, quality: 75 },
    large: { width: 800, quality: 85 },
  }

  return optimizeSupabaseImage(rawUrl, sizeConfig[size])
}

/**
 * Get raw product image URL without optimization
 * Use this only when you need the original image
 */
export function getRawProductImageUrl(
  product: Product | any,
  index: number = 0
): string | null {
  if (!product.images || product.images.length === 0) {
    return null
  }

  const image = product.images[index]
  if (!image) {
    return null
  }

  return typeof image === 'string' ? image : image.url
}

/**
 * Get first available product image URL or random placeholder if no image exists
 * Automatically optimizes Supabase images for faster loading
 */
export function getFirstProductImage(
  product: Product | any,
  size: 'thumbnail' | 'medium' | 'large' = 'medium'
): string {
  const imageUrl = getProductImageUrl(product, 0)

  if (imageUrl) {
    // Optimize Supabase images based on size
    const sizeConfig = {
      thumbnail: { width: 200, quality: 60 },
      medium: { width: 400, quality: 75 },
      large: { width: 800, quality: 85 },
    }
    return optimizeSupabaseImage(imageUrl, sizeConfig[size])
  }

  // Return random placeholder if no image available
  return getRandomPlaceholderImage(product?.id || product?.slug)
}

/**
 * Get optimized product image for specific dimensions
 */
export function getOptimizedProductImage(
  product: Product | any,
  width: number,
  height?: number,
  quality: number = 75
): string {
  const imageUrl = getProductImageUrl(product, 0)

  if (imageUrl) {
    return optimizeSupabaseImage(imageUrl, { width, height, quality })
  }

  return getRandomPlaceholderImage(product?.id || product?.slug)
}

/**
 * Check if product has images
 */
export function hasProductImages(product: Product | any): boolean {
  return !!(product.images && product.images.length > 0)
}

/**
 * Check if a URL is a placeholder image
 */
export function isPlaceholderImage(url: string): boolean {
  return url.includes('/placeholder-images/')
}
