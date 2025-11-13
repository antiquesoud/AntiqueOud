import { Gender } from '@/lib/constants'

export interface Product {
  id: string
  vendorId: string
  categoryId: string
  brandId?: string
  nameEn: string
  nameAr: string
  slug: string
  sku: string
  descriptionEn: string
  descriptionAr: string
  regularPrice: number
  salePrice?: number
  stockQuantity: number
  lowStockThreshold: number
  images: ProductImage[]
  videos: ProductVideo[]
  variants: ProductVariant[]
  scentProfile?: ScentProfile
  rating: number
  reviewCount: number
  salesCount: number
  coinsToAward: number
  whatsappNumber?: string
  isNew: boolean
  size?: string
  concentration?: string
  gender?: string
  scentFamily?: string
  longevity?: string
  sillage?: string
  season?: string
  topNotes?: string
  heartNotes?: string
  baseNotes?: string
  createdAt: Date

  // Relations
  vendor?: {
    id: string
    businessName: string
    logo?: string
  }
  brand?: {
    id: string
    nameEn: string
    nameAr: string
  }
  category?: {
    id: string
    nameEn: string
    nameAr: string
    slug: string
  }
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  altText?: string
  position: number
  isFeatured: boolean
}

export interface ProductVideo {
  id: string
  productId: string
  url: string
  thumbnailUrl: string
  duration: number
  position: number
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  nameAr?: string
  sku: string
  price: number
  stock: number
  image?: string
  compareAtPrice?: number
  isActive: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

export interface ScentProfile {
  family: string
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  longevity: number
  sillage: number
  season: string[]
  gender: Gender
}

export interface Category {
  id: string
  nameEn: string
  nameAr: string
  slug: string
  descriptionEn?: string
  descriptionAr?: string
  image?: string
  parentId?: string
  productCount: number
}

export interface Brand {
  id: string
  nameEn: string
  nameAr: string
  slug: string
  logo?: string
  descriptionEn?: string
  descriptionAr?: string
  productCount: number
}
