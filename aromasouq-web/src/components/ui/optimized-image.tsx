"use client"

import Image, { ImageProps } from 'next/image'
import { optimizeSupabaseImage } from '@/lib/image-utils'

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined
  fallback?: string
  optimizeWidth?: number
  optimizeQuality?: number
}

/**
 * Optimized Image component that automatically:
 * 1. Transforms Supabase URLs for smaller file sizes
 * 2. Adds proper sizing hints
 * 3. Uses lazy loading by default
 * 4. Handles fallback images
 */
export function OptimizedImage({
  src,
  fallback = '/placeholder-images/antik - posts2.jpg',
  optimizeWidth = 400,
  optimizeQuality = 75,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
  ...props
}: OptimizedImageProps) {
  // Use fallback if no src provided
  const imageSrc = src || fallback

  // Optimize Supabase URLs
  const optimizedSrc = optimizeSupabaseImage(imageSrc, {
    width: optimizeWidth,
    quality: optimizeQuality,
  })

  return (
    <Image
      src={optimizedSrc}
      sizes={sizes}
      loading={loading}
      {...props}
    />
  )
}

/**
 * Get optimized image URL for use in regular img tags or backgrounds
 */
export function getOptimizedImageUrl(
  src: string | null | undefined,
  width: number = 400,
  quality: number = 75,
  fallback: string = '/placeholder-images/antik - posts2.jpg'
): string {
  const imageSrc = src || fallback
  return optimizeSupabaseImage(imageSrc, { width, quality })
}
