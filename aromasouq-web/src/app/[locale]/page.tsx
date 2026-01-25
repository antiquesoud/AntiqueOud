/**
 * Homepage - Antique Oud
 * Main landing page with all featured sections
 *
 * OPTIMIZED: Uses single /homepage API call instead of multiple calls
 * This dramatically reduces cold start impact and improves load time
 */

import { HeroSlider } from '@/components/homepage/hero-slider';
import { ShopByCategory } from '@/components/homepage/shop-by-category';
import { FlashSale } from '@/components/homepage/flash-sale';
import { BestSellers } from '@/components/homepage/best-sellers';
import { Testimonials } from '@/components/homepage/testimonials';

// API functions - using optimized combined endpoint
import { getHomepageData } from '@/lib/api/homepage';

export const revalidate = 300; // Revalidate every 5 minutes (matches backend cache)

export default async function HomePage() {
  // Single API call fetches all homepage data (optimized)
  const { categories, featured, flashSale } = await getHomepageData();

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Shop by Category */}
      {categories.length > 0 && <ShopByCategory categories={categories} />}

      {/* Flash Sale */}
      {flashSale.length > 0 && (
        <FlashSale products={flashSale} />
      )}

      {/* Best Sellers */}
      {featured.length > 0 && (
        <BestSellers products={featured} />
      )}

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
