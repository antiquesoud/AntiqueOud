/**
 * Homepage - Antique Oud
 * Main landing page with all featured sections
 */

import { HeroSlider } from '@/components/homepage/hero-slider';
import { ShopByCategory } from '@/components/homepage/shop-by-category';
import { FlashSale } from '@/components/homepage/flash-sale';
import { BestSellers } from '@/components/homepage/best-sellers';
import { Testimonials } from '@/components/homepage/testimonials';

// API functions
import {
  getCategories,
  getFlashSaleProducts,
  getFeaturedProducts,
} from '@/lib/api/homepage';

export const revalidate = 1800; // Revalidate every 30 minutes

export default async function HomePage() {
  // Fetch all data in parallel for optimal performance
  const [
    categories,
    flashSaleProducts,
    featuredProducts,
  ] = await Promise.all([
    getCategories(),
    getFlashSaleProducts(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Shop by Category */}
      {categories.length > 0 && <ShopByCategory categories={categories} />}

      {/* Flash Sale */}
      {flashSaleProducts.length > 0 && (
        <FlashSale products={flashSaleProducts} />
      )}

      {/* Best Sellers */}
      {featuredProducts.length > 0 && (
        <BestSellers products={featuredProducts} />
      )}

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
