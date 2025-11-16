import { Product } from '@/types'

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
 * Returns null if no image is available
 */
export function getProductImageUrl(
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

  // Handle both string URLs and image objects
  return typeof image === 'string' ? image : image.url
}

/**
 * Get first available product image URL or random placeholder if no image exists
 */
export function getFirstProductImage(product: Product | any): string {
  const imageUrl = getProductImageUrl(product, 0)

  if (imageUrl) {
    return imageUrl
  }

  // Return random placeholder if no image available
  return getRandomPlaceholderImage(product?.id || product?.slug)
}

/**
 * Check if product has images
 */
export function hasProductImages(product: Product | any): boolean {
  return !!(product.images && product.images.length > 0)
}
