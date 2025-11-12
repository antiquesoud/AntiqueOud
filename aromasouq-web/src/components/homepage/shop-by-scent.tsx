/**
 * {t('title')} Component
 * Horizontal carousel of scent family cards
 */

'use client';

import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { ScentFamily } from '@/lib/api/homepage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { translateScentFamily, safeTranslate } from '@/lib/translation-helpers';

interface ShopByScentProps {
  scentFamilies: ScentFamily[];
}

// Icon mapping for scent families
const scentIcons: Record<string, string> = {
  floral: '🌸',
  fruity: '🍎',
  'fresh/aquatic': '🌊',
  oriental: '🌟',
  woody: '🌳',
  musky: '💨',
  'sweet/gourmand': '🍬',
  spicy: '🌶️',
  oud: '🪵',
  leather: '🧥',
};

function getScentIcon(scentName: string | undefined): string {
  if (!scentName) return '🌿';
  const normalized = scentName.toLowerCase();
  return scentIcons[normalized] || '🌿';
}

export function ShopByScent({ scentFamilies }: ShopByScentProps) {
  const t = useTranslations('homepage.shopByScent');
  const tScents = useTranslations('scentFamilies');
  const tCommon = useTranslations('common');
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = 244 * 4; // (card width 220 + gap 24) * 4
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative overflow-hidden bg-white py-20 mb-0">
      {/* Subtle Luxury Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-96 h-96 bg-gradient-to-br from-[#B3967D]/15 via-[#550000]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-gradient-to-tr from-[#550000]/10 via-[#ECDBC7]/15 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B3967D] to-[#550000] text-white px-6 py-2 rounded-full mb-4 shadow-2xl text-sm font-black tracking-wider border-2 border-white/30 animate-glow-pulse">
              <span className="text-lg">🌿</span>
              <span>{t('badge').toUpperCase()}</span>
              <span className="text-lg">✨</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-3 drop-shadow-lg">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3967D] via-[#550000] to-[#B3967D]">
                {t('title')}
              </span>
            </h2>
            <p className="text-lg text-gray-800 font-semibold">
              {t('description')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scroll('left')}
              className="w-14 h-14 rounded-full border-3 border-[#B3967D] bg-gradient-to-br from-white to-[#ECDBC7]/30 flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-[#B3967D] hover:to-[#550000] hover:text-white shadow-[0_4px_20px_rgba(179,150,125,0.3)] hover:shadow-[0_8px_30px_rgba(85,0,0,0.5)] hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-14 h-14 rounded-full border-3 border-[#B3967D] bg-gradient-to-br from-white to-[#ECDBC7]/30 flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-[#B3967D] hover:to-[#550000] hover:text-white shadow-[0_4px_20px_rgba(179,150,125,0.3)] hover:shadow-[0_8px_30px_rgba(85,0,0,0.5)] hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {scentFamilies.filter(scent => scent.scentFamily).map((scent, index) => (
            <Link
              key={scent.scentFamily || `scent-${index}`}
              href={`/products?scentFamily=${encodeURIComponent(scent.scentFamily)}`}
              className="relative flex-shrink-0 w-[260px] bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(179,150,125,0.25)] cursor-pointer text-center border border-gray-200 group hover:border-[#B3967D]"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#B3967D]/20 via-[#B3967D]/30 to-[#B3967D]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />

              <div className="relative text-7xl pt-10 pb-6 bg-gradient-to-br from-[#ECDBC7]/20 to-[#B3967D]/10 group-hover:from-[#ECDBC7]/30 group-hover:to-[#B3967D]/20 transition-all duration-300">
                <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                  {getScentIcon(scent.scentFamily)}
                </div>
              </div>
              <div className="relative p-6 bg-white">
                <div className="text-lg font-black text-[#550000] mb-3 group-hover:text-[#B3967D] transition-colors">
                  {translateScentFamily(tScents, scent.scentFamily)}
                </div>
                <div className="text-sm text-[#2D2D2D] font-bold bg-gradient-to-r from-[#ECDBC7] to-[#B3967D]/30 px-4 py-2 rounded-full inline-block group-hover:from-[#B3967D] group-hover:to-[#550000] group-hover:text-white transition-all duration-300 shadow-sm">
                  {scent.count} {safeTranslate(tCommon, 'products', 'Products')}
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
