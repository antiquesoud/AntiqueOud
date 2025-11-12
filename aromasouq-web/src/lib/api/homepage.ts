/**
 * Homepage API Service
 * Fetches all data needed for homepage sections
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  logo?: string;
  _count: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  brand: {
    name: string;
    slug: string;
  };
  images: Array<{ url: string } | string>;
  price: number;
  salePrice?: number;
  rating?: number;
  reviewCount?: number;
}

export interface ScentFamily {
  scentFamily: string;
  count: number;
}

export interface Occasion {
  occasion: string;
  count: number;
}

export interface Region {
  region: string;
  count: number;
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const res = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch all brands
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch brands');
    return res.json();
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

/**
 * Fetch Antique Oud brand products
 */
export async function getOurBrandProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?brandSlug=antique-oud&limit=10`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });
    if (!res.ok) throw new Error('Failed to fetch Antique Oud products');
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching Antique Oud products:', error);
    return [];
  }
}

/**
 * Fetch flash sale products
 */
export async function getFlashSaleProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/flash-sale`, {
      next: { revalidate: 300 }, // Cache for 5 minutes (flash sales change frequently)
    });
    if (!res.ok) throw new Error('Failed to fetch flash sale products');
    return res.json();
  } catch (error) {
    console.error('Error fetching flash sale products:', error);
    return [];
  }
}

/**
 * Fetch featured products (used for Best Sellers section)
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/featured`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error('Failed to fetch featured products');
    return res.json();
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

/**
 * Fetch Oud category products
 */
export async function getOudProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?categorySlug=oud&limit=8`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error('Failed to fetch Oud products');
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching Oud products:', error);
    return [];
  }
}

/**
 * Fetch available scent families
 */
export async function getScentFamilies(): Promise<ScentFamily[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/scent-families`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch scent families');
    return res.json();
  } catch (error) {
    console.error('Error fetching scent families:', error);
    return [];
  }
}

/**
 * Fetch available occasions
 */
export async function getOccasions(): Promise<Occasion[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/occasions`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch occasions');
    return res.json();
  } catch (error) {
    console.error('Error fetching occasions:', error);
    return [];
  }
}

/**
 * Fetch available regions
 */
export async function getRegions(): Promise<Region[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/regions`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch regions');
    return res.json();
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
}

/**
 * Fetch Oud types for Oud Collection Showcase
 */
export async function getOudTypes(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/oud-types`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch oud types');
    return res.json();
  } catch (error) {
    console.error('Error fetching oud types:', error);
    return [];
  }
}

/**
 * Get gender-specific collections (For Featured Collections banners)
 */
export async function getGenderBanners() {
  try {
    const res = await fetch(`${API_BASE_URL}/products/gender-banners`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch gender banners');
    return res.json();
  } catch (error) {
    console.error('Error fetching gender banners:', error);
    return {
      men: { count: 0 },
      women: { count: 0 },
    };
  }
}
