/**
 * Best Sellers Component
 * Displays top-selling products
 */

'use client';

import { useTranslations } from 'next-intl';
import { Product } from '@/lib/api/homepage';
import { ProductCarousel } from './product-carousel';
import { TrendingUp } from 'lucide-react';

interface BestSellersProps {
  products: Product[];
}

export function BestSellers({ products }: BestSellersProps) {
  const t = useTranslations('homepage.bestSellers');

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#550000] via-[#6B0000] to-[#550000] py-12 mb-0">
      {/* Decorative elements - stars and glaze effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div className="absolute top-20 right-[25%] w-64 h-64 bg-[#ECDBC7]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-[20%] w-80 h-80 bg-[#B3967D]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Sparkle stars */}
        <div className="absolute top-24 left-[30%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(236,219,199,0.6)] animate-pulse"></div>
        <div className="absolute top-48 right-[35%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(236,219,199,0.6)] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-[25%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(236,219,199,0.6)] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-[20%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(236,219,199,0.6)] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-36 left-[15%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_6px_rgba(255,255,255,0.5)] animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-48 right-[15%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_6px_rgba(255,255,255,0.5)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>

        {/* Trophy icon */}
        <svg className="absolute top-20 right-[15%] w-20 h-20 opacity-10" viewBox="0 0 100 100" fill="none">
          <path d="M50 10L60 35H85L65 50L75 75L50 60L25 75L35 50L15 35H40L50 10Z" fill="#ECDBC7" className="drop-shadow-[0_0_20px_rgba(236,219,199,0.6)]"/>
        </svg>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ECDBC7] text-[#550000] px-4 py-1.5 rounded-full mb-3 shadow-lg text-xs font-bold tracking-wide">
            <TrendingUp className="w-4 h-4" />
            <span>{t('badge').toUpperCase()}</span>
            <span className="text-base">⭐</span>
          </div>

          <h2 className="text-3xl md:text-4xl text-white font-bold mb-2">
            {t('title')}
          </h2>

          <p className="text-base text-[#ECDBC7]">
            {t('description')}
          </p>
        </div>

        <ProductCarousel products={products} compact={false} />
      </div>
    </div>
  );
}
