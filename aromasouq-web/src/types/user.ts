import { UserRole, UserStatus, VendorStatus } from '@/lib/constants'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  avatar?: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  preferredLanguage: 'en' | 'ar'
  coinsBalance: number
  createdAt: Date
  updatedAt: Date
  vendor?: Vendor
}

export interface Vendor {
  id: string
  userId: string
  businessName: string
  logo?: string
  coverImage?: string
  taglineEn?: string
  taglineAr?: string
  shortDescriptionEn?: string
  shortDescriptionAr?: string
  brandStoryEn?: string
  brandStoryAr?: string
  email: string
  phone: string
  whatsappNumber?: string
  instagramUrl?: string
  tiktokUrl?: string
  websiteUrl?: string
  status: VendorStatus
  createdAt: Date
}

export interface Wallet {
  userId: string
  balance: number
  lifetimeEarned: number
  lifetimeSpent: number
}

export interface CoinTransaction {
  id: string
  userId: string
  type: 'EARNED' | 'SPENT' | 'EXPIRED' | 'BONUS'
  amount: number
  balance: number
  source: string
  description: string
  createdAt: Date
}

export interface Address {
  id: string
  userId: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  emirate: string
  country: string
  zipCode: string
  isDefault: boolean
}
