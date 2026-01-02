import { QueryClient } from '@tanstack/react-query'

/**
 * Optimized Query Client Configuration
 *
 * Performance optimizations:
 * - staleTime: 5 minutes - prevents unnecessary refetches
 * - gcTime: 30 minutes - keeps data in cache for reuse
 * - Disabled aggressive refetching behaviors
 * - Single retry on failure
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 30 * 60 * 1000,  // 30 minutes - garbage collection time (previously cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,      // Don't refetch on component mount
      refetchOnReconnect: false,  // Don't refetch on network reconnect
      retry: 1,
      // Deduplication: React Query automatically deduplicates concurrent requests
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
})

/**
 * Query key constants for consistent caching
 */
export const QUERY_KEYS = {
  // Products
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productSlug: (slug: string) => ['products', 'slug', slug] as const,
  featuredProducts: ['products', 'featured'] as const,
  flashSaleProducts: ['products', 'flash-sale'] as const,
  newArrivals: ['products', 'new-arrivals'] as const,

  // Categories & Brands
  categories: ['categories'] as const,
  brands: ['brands'] as const,

  // User data
  cart: ['cart'] as const,
  guestCart: ['guest-cart'] as const,
  wishlist: ['wishlist'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  addresses: ['addresses'] as const,
  wallet: ['wallet'] as const,

  // Aggregations (long cache)
  scentFamilies: ['aggregations', 'scent-families'] as const,
  occasions: ['aggregations', 'occasions'] as const,
  regions: ['aggregations', 'regions'] as const,
  productTypes: ['aggregations', 'product-types'] as const,
  oudTypes: ['aggregations', 'oud-types'] as const,
  genderBanners: ['aggregations', 'gender-banners'] as const,
}
