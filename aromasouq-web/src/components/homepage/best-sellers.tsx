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
    <div className="relative overflow-hidden bg-gradient-to-br from-[#550000] via-[#6b0000] to-[#8b0000] py-20 mb-0">
      {/* Artistic background elements - Stars and constellation patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Constellation lines and stars */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 1000 1000" fill="none">
          {/* Stars */}
          <circle cx="150" cy="100" r="3" fill="#B3967D" className="animate-pulse" />
          <circle cx="280" cy="180" r="2" fill="#B3967D" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
          <circle cx="420" cy="120" r="4" fill="#FFED4E" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
          <circle cx="700" cy="150" r="2" fill="#B3967D" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
          <circle cx="850" cy="200" r="3" fill="#B3967D" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
          <circle cx="200" cy="400" r="2" fill="#FFED4E" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
          <circle cx="600" cy="450" r="3" fill="#B3967D" className="animate-pulse" style={{ animationDelay: '1.8s' }} />
          <circle cx="300" cy="700" r="2" fill="#B3967D" className="animate-pulse" style={{ animationDelay: '2.1s' }} />
          <circle cx="750" cy="650" r="4" fill="#FFED4E" className="animate-pulse" style={{ animationDelay: '2.4s' }} />

          {/* Constellation lines */}
          <line x1="150" y1="100" x2="280" y2="180" stroke="#B3967D" strokeWidth="1" opacity="0.3" />
          <line x1="280" y1="180" x2="420" y2="120" stroke="#B3967D" strokeWidth="1" opacity="0.3" />
          <line x1="700" y1="150" x2="850" y2="200" stroke="#B3967D" strokeWidth="1" opacity="0.3" />
          <line x1="200" y1="400" x2="600" y2="450" stroke="#B3967D" strokeWidth="1" opacity="0.3" />
        </svg>

        {/* Trophy and award icons as SVG */}
        <svg className="absolute top-20 right-[15%] w-40 h-40 opacity-10" viewBox="0 0 100 100" fill="none">
          <path d="M50 10L60 35H85L65 50L75 75L50 60L25 75L35 50L15 35H40L50 10Z" fill="url(#trophy-gradient)" className="drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"/>
          <defs>
            <linearGradient id="trophy-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B3967D" />
              <stop offset="100%" stopColor="#B3967D" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="absolute bottom-32 left-[10%] w-32 h-32 opacity-10 animate-pulse" viewBox="0 0 100 100" fill="none">
          <path d="M50 10L60 35H85L65 50L75 75L50 60L25 75L35 50L15 35H40L50 10Z" fill="url(#star-gradient)" className="drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"/>
          <defs>
            <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFED4E" />
              <stop offset="100%" stopColor="#B3967D" />
            </linearGradient>
          </defs>
        </svg>

        {/* Glowing orbs for depth */}
        <div className="absolute top-40 left-[20%] w-72 h-72 bg-[#550000]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-[15%] w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"></div>

        {/* Sparkles */}
        <div className="absolute top-28 left-[35%] w-2 h-2 bg-[#B3967D] rounded-full shadow-[0_0_20px_8px_rgba(253,224,71,0.6)] animate-pulse"></div>
        <div className="absolute top-56 right-[40%] w-2 h-2 bg-pink-300 rounded-full shadow-[0_0_20px_8px_rgba(251,207,232,0.6)] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-40 left-[45%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(216,180,254,0.6)] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-[25%] w-2 h-2 bg-[#B3967D] rounded-full shadow-[0_0_20px_8px_rgba(250,204,21,0.6)] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B3967D] via-[#8b0000] to-[#550000] text-white px-5 py-2 rounded-full mb-4 shadow-2xl text-sm font-black tracking-wider border-2 border-[#ECDBC7]/30">
            <TrendingUp className="w-5 h-5 animate-bounce" />
            <span>{t('badge').toUpperCase()}</span>
            <span className="text-lg">⭐</span>
          </div>

          <h2 className="text-5xl md:text-6xl text-white font-black mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {t('title')}
          </h2>

          <p className="text-lg text-[#ECDBC7] font-semibold max-w-3xl mx-auto">
            🏆 {t('description')}
          </p>
        </div>

        <ProductCarousel products={products} compact={false} />
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white"></div>
    </div>
  );
}
