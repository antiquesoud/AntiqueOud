import { Product } from '@/types'

/**
 * Optimize Supabase image URL with transformation parameters
 *
 * NOTE: Supabase Image Transformations (/render/image/) requires Pro plan
 * and can cause 403 errors if not properly configured.
 *
 * We now return the raw URL and let Next.js Image component handle
 * optimization, which is free and works reliably.
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
  // Return raw URL - let Next.js Image handle optimization
  // This avoids 403 errors from Supabase render endpoint
  if (!url) {
    return url
  }

  // If URL already has render/image (legacy), convert back to object URL
  if (url.includes('/storage/v1/render/image/public/')) {
    // Strip query params and convert back to regular storage URL
    const baseUrl = url.split('?')[0]
    return baseUrl.replace(
      '/storage/v1/render/image/public/',
      '/storage/v1/object/public/'
    )
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
