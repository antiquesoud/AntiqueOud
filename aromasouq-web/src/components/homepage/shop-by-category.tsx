/**
 * Shop by Category Component
 * Displays categories as circular icons
 */

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Category } from '@/lib/api/homepage';
import { translateCategory } from '@/lib/translation-helpers';

interface ShopByCategoryProps {
  categories: Category[];
}

export function ShopByCategory({ categories }: ShopByCategoryProps) {
  const t = useTranslations('homepage.categories');
  const tCategories = useTranslations('categories');

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#ECDBC7]/30 via-white to-[#B3967D]/15 py-20 mb-0">
      {/* Luxury decorative elements - Hexagon patterns and sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Hexagon patterns */}
        <svg className="absolute top-10 left-[8%] w-24 h-24 opacity-20" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" stroke="#B3967D" strokeWidth="3" fill="url(#hex-gradient)" />
          <defs>
            <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B3967D" opacity="0.4" />
              <stop offset="100%" stopColor="#550000" opacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="absolute bottom-20 right-[10%] w-20 h-20 opacity-20 animate-pulse" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" stroke="#B3967D" strokeWidth="3" fill="url(#hex-gradient-2)" />
          <defs>
            <linearGradient id="hex-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#550000" opacity="0.4" />
              <stop offset="100%" stopColor="#B3967D" opacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="absolute top-1/2 left-[5%] w-16 h-16 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }} viewBox="0 0 100 100" fill="none">
          <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" stroke="#ECDBC7" strokeWidth="3" fill="url(#hex-gradient-3)" />
          <defs>
            <linearGradient id="hex-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B3967D" opacity="0.4" />
              <stop offset="100%" stopColor="#ECDBC7" opacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Glowing orbs with richer colors */}
        <div className="absolute top-20 right-[20%] w-96 h-96 bg-gradient-to-br from-[#B3967D]/30 via-[#550000]/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-[#550000]/20 via-[#ECDBC7]/25 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B3967D]/15 rounded-full blur-3xl"></div>

        {/* Enhanced sparkles with animation */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#B3967D] shadow-[0_0_10px_#B3967D] animate-sparkle"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Decorative circles pattern */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-8" viewBox="0 0 1000 1000" fill="none">
          <circle cx="200" cy="200" r="100" stroke="#B3967D" strokeWidth="2" fill="none" opacity="0.4" />
          <circle cx="800" cy="300" r="80" stroke="#550000" strokeWidth="2" fill="none" opacity="0.3" />
          <circle cx="300" cy="700" r="120" stroke="#B3967D" strokeWidth="2" fill="none" opacity="0.35" />
          <circle cx="700" cy="800" r="90" stroke="#ECDBC7" strokeWidth="2" fill="none" opacity="0.3" />
        </svg>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B3967D] to-[#550000] text-white px-6 py-2 rounded-full mb-4 shadow-2xl text-sm font-black tracking-wider border-2 border-[#ECDBC7]/30 animate-glow-pulse">
            <span className="text-lg">🎯</span>
            <span>{t('subtitle').toUpperCase()}</span>
            <span className="text-lg">✨</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black mb-3 drop-shadow-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3967D] via-[#550000] to-[#B3967D]">
              {t('title')}
            </span>
          </h2>

          <p className="text-lg text-gray-800 font-semibold max-w-2xl mx-auto">
            🌺 {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-8 max-w-[1100px] mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?categorySlug=${category.slug}`}
              className="text-center group cursor-pointer transition-all duration-300 hover:-translate-y-3"
            >
              <div className="relative w-[140px] h-[140px] rounded-full mx-auto mb-4 flex items-center justify-center text-7xl shadow-[0_10px_40px_rgba(85,0,0,0.2)] transition-all duration-300 group-hover:shadow-[0_25px_70px_rgba(179,150,125,0.6)] group-hover:scale-115 overflow-hidden">
                {/* Rich gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#B3967D] via-[#550000]/20 to-[#ECDBC7] animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />

                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#550000]/40 via-[#B3967D]/50 to-[#550000]/40 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

                {/* Ring border */}
                <div className="absolute inset-0 rounded-full border-[6px] border-white shadow-inner"></div>

                {/* Category sparkles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-[#B3967D] shadow-[0_0_8px_#B3967D] animate-sparkle"
                      style={{
                        left: `${30 + Math.random() * 40}%`,
                        top: `${30 + Math.random() * 40}%`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Icon */}
                <span className="relative z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] filter brightness-110 group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
              </div>
              <div className="font-black text-gray-800 text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#B3967D] group-hover:to-[#550000] transition-all">
                {translateCategory(tCategories, category.name)}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white"></div>
    </div>
  );
}
