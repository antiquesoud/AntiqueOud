/**
 * Homepage - Antique Oud
 * Main landing page with all featured sections
 */

import { AnnouncementBar } from '@/components/homepage/announcement-bar';
import { HeroSlider } from '@/components/homepage/hero-slider';
import { ShopByCategory } from '@/components/homepage/shop-by-category';
import { OurBrandSpotlight } from '@/components/homepage/our-brand-spotlight';
import { FlashSale } from '@/components/homepage/flash-sale';
import { FeaturedCollections } from '@/components/homepage/featured-collections';
import { ShopByScent } from '@/components/homepage/shop-by-scent';
import { OudCollection } from '@/components/homepage/oud-collection';
import { BestSellers } from '@/components/homepage/best-sellers';
import { ShopByOccasion } from '@/components/homepage/shop-by-occasion';
import { ShopByRegion } from '@/components/homepage/shop-by-region';
import { ShopByBrand } from '@/components/homepage/shop-by-brand';

// API functions
import {
  getCategories,
  getBrands,
  getOurBrandProducts,
  getFlashSaleProducts,
  getFeaturedProducts,
  getScentFamilies,
  getOccasions,
  getRegions,
} from '@/lib/api/homepage';

export const revalidate = 1800; // Revalidate every 30 minutes

export default async function HomePage() {
  // Fetch all data in parallel for optimal performance
  const [
    categories,
    brands,
    ourBrandProducts,
    flashSaleProducts,
    featuredProducts,
    scentFamilies,
    occasions,
    regions,
  ] = await Promise.all([
    getCategories(),
    getBrands(),
    getOurBrandProducts(),
    getFlashSaleProducts(),
    getFeaturedProducts(),
    getScentFamilies(),
    getOccasions(),
    getRegions(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Shop by Category */}
      {categories.length > 0 && <ShopByCategory categories={categories} />}

      {/* Our Brand Spotlight */}
      {ourBrandProducts.length > 0 && (
        <OurBrandSpotlight products={ourBrandProducts} />
      )}

      {/* Flash Sale */}
      {flashSaleProducts.length > 0 && (
        <FlashSale products={flashSaleProducts} />
      )}

      {/* Featured Collections (Gender Banners) */}
      <FeaturedCollections />

      {/* Shop by Scent Family */}
      {scentFamilies.length > 0 && (
        <ShopByScent scentFamilies={scentFamilies} />
      )}

      {/* Oud Collection Showcase */}
      <OudCollection />

      {/* Best Sellers */}
      {featuredProducts.length > 0 && (
        <BestSellers products={featuredProducts} />
      )}

      {/* Shop by Occasion */}
      {occasions.length > 0 && <ShopByOccasion occasions={occasions} />}

      {/* Shop by Region */}
      {regions.length > 0 && <ShopByRegion regions={regions} />}

      {/* Shop by Brand */}
      {brands.length > 0 && <ShopByBrand brands={brands} />}
    </div>
  );
}
