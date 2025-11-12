/**
 * Our Brand Spotlight Component
 * Showcases Antique Oud signature products
 */

'use client';

import { useTranslations } from 'next-intl';
import { Product } from '@/lib/api/homepage';
import { ProductCarousel } from './product-carousel';
import { Sparkles, Award } from 'lucide-react';

interface OurBrandSpotlightProps {
  products: Product[];
}

export function OurBrandSpotlight({ products }: OurBrandSpotlightProps) {
  const t = useTranslations('homepage.ourBrand');
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#B3967D]/50 via-[#B3967D]/50 to-[#B3967D]/50 py-20 mb-0">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-[var(--color-oud-gold)]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-[#B3967D]/300/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-oud-gold)] to-[#B3967D]/500 text-white px-6 py-2 rounded-full mb-4 shadow-lg">
            <Award className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide">EXCLUSIVE COLLECTION</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-5xl text-[var(--color-deep-navy)] font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-deep-navy)] to-[#B3967D]/900">
            Our Brand Signature Collection
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Handcrafted with passion, exclusively by Antique Oud • Premium Arabian Fragrances
          </p>
        </div>

        <ProductCarousel products={products} />
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
    </div>
  );
}
