/**
 * {t('title')} Component
 * Grid display of occasion categories with mobile carousel
 */

'use client';

import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { Occasion } from '@/lib/api/homepage';
import { translateOccasion, safeTranslate } from '@/lib/translation-helpers';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShopByOccasionProps {
  occasions: Occasion[];
}

// Icon mapping for occasions
const occasionIcons: Record<string, string> = {
  office: '💼',
  party: '🎉',
  date: '💝',
  wedding: '💍',
  ramadan: '🌙',
  eid: '🌙',
  daily: '🌞',
};

function getOccasionIcon(occasionName: string | undefined): string {
  if (!occasionName) return '✨';
  const normalized = occasionName.toLowerCase();
  for (const [key, icon] of Object.entries(occasionIcons)) {
    if (normalized.includes(key)) {
      return icon;
    }
  }
  return '✨';
}

function getOccasionTagKey(occasionName: string | undefined): string {
  if (!occasionName) return 'daily';
  const normalized = occasionName.toLowerCase();
  for (const key of Object.keys(occasionIcons)) {
    if (normalized.includes(key)) {
      return key;
    }
  }
  return 'daily';
}

export function ShopByOccasion({ occasions }: ShopByOccasionProps) {
  const t = useTranslations('homepage.shopByOccasion');
  const tOccasions = useTranslations('occasions');
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = 220; // Adjust based on card width
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-20 mb-0">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-violet-300/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tr from-fuchsia-300/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-5 py-1.5 rounded-full mb-3 shadow-lg text-xs font-bold tracking-wide">
              ✨ {t('badge').toUpperCase()}
            </div>
            <h2 className="text-5xl text-[var(--color-deep-navy)] font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
          <div className="hidden lg:flex gap-2 ml-4">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border-2 border-violet-300 bg-white flex items-center justify-center transition-all duration-300 hover:bg-violet-500 hover:border-violet-500 hover:text-white shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border-2 border-violet-300 bg-white flex items-center justify-center transition-all duration-300 hover:bg-violet-500 hover:border-violet-500 hover:text-white shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible"
        >
          {occasions.filter(occasion => occasion.occasion).map((occasion, index) => {
            const icon = getOccasionIcon(occasion.occasion);
            const tagKey = getOccasionTagKey(occasion.occasion);
            return (
              <Link
                key={occasion.occasion || `occasion-${index}`}
                href={`/products?occasion=${encodeURIComponent(occasion.occasion)}`}
                className="flex-shrink-0 w-[160px] md:w-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 px-6 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer border border-white/50 group hover:bg-gradient-to-br hover:from-violet-50 hover:to-fuchsia-50"
              >
                <div className="text-6xl mb-5 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
                <div className="text-base font-bold text-[var(--color-deep-navy)] mb-2">
                  {translateOccasion(tOccasions, occasion.occasion)}
                </div>
                <div className="text-xs text-violet-600 font-semibold bg-violet-100 px-3 py-1 rounded-full inline-block">
                  {safeTranslate(t, `tags.${tagKey}`, '')}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
