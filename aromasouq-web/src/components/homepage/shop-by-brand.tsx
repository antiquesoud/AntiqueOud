/**
 * {t('title')} Component
 * Grid display of brand cards
 */

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Brand } from '@/lib/api/homepage';

interface ShopByBrandProps {
  brands: Brand[];
}

export function ShopByBrand({ brands }: ShopByBrandProps) {
  const t = useTranslations('homepage.shopByBrand');
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#B3967D]/5 to-[#ECDBC7]/20 py-20 mb-0">
      {/* Luxury decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-[15%] w-96 h-96 bg-gradient-to-br from-[#B3967D]/25 via-[#550000]/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-[15%] w-96 h-96 bg-gradient-to-tr from-[#550000]/20 via-[#ECDBC7]/25 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

        {/* Floating sparkles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#B3967D] shadow-[0_0_10px_#B3967D] animate-sparkle"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#550000] to-[#B3967D] text-white px-6 py-2 rounded-full mb-4 shadow-2xl text-sm font-black tracking-wider border-2 border-[#ECDBC7]/30 animate-glow-pulse">
            <span className="text-lg">👑</span>
            <span>{t('badge').toUpperCase()}</span>
            <span className="text-lg">✨</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-3 drop-shadow-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#550000] via-[#B3967D] to-[#550000]">
              {t('title')}
            </span>
          </h2>
          <p className="text-lg text-gray-800 font-semibold max-w-2xl">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brandId=${brand.id}`}
              className="relative bg-gradient-to-br from-white via-[#ECDBC7]/10 to-white p-6 rounded-2xl text-center shadow-[0_8px_30px_rgba(85,0,0,0.15)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(179,150,125,0.4)] hover:-translate-y-3 cursor-pointer border-2 border-[#B3967D]/20 group hover:border-[#B3967D] overflow-hidden"
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B3967D]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />

              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#550000]/20 via-[#B3967D]/30 to-[#550000]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="text-lg font-black text-[#550000] mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#550000] group-hover:to-[#B3967D] transition-all">
                  {brand.name}
                </div>
                <div className="text-xs text-[#2D2D2D] font-bold bg-gradient-to-r from-[#B3967D]/20 to-[#ECDBC7]/30 px-3 py-1.5 rounded-full inline-block border border-[#B3967D]/30 group-hover:from-[#B3967D] group-hover:to-[#B3967D] group-hover:text-white group-hover:border-0 transition-all duration-300 shadow-md">
                  {brand._count.products} {t('products')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
    </div>
  );
}
