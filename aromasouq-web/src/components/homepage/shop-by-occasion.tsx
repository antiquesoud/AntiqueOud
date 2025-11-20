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
import Image from 'next/image';

interface ShopByOccasionProps {
  occasions: Occasion[];
}

// Image mapping for occasions
const occasionImages: Record<string, { image: string; alt: string }> = {
  office: {
    image: 'https://images.unsplash.com/photo-1585916420730-d7f95e942d43?w=300&h=300&fit=crop&q=80',
    alt: 'Professional office fragrance'
  },
  party: {
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=300&fit=crop&q=80',
    alt: 'Party celebration'
  },
  date: {
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=300&h=300&fit=crop&q=80',
    alt: 'Romantic evening'
  },
  wedding: {
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=300&fit=crop&q=80',
    alt: 'Wedding celebration'
  },
  ramadan: {
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=300&h=300&fit=crop&q=80',
    alt: 'Ramadan - Islamic lanterns and mosque'
  },
  eid: {
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=300&h=300&fit=crop&q=80',
    alt: 'Eid celebration - mosque and festivities'
  },
  daily: {
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300&h=300&fit=crop&q=80',
    alt: 'Daily casual fragrance'
  },
};

function getOccasionImage(occasionName: string | undefined): { image: string; alt: string } {
  const defaultImage = {
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=300&h=300&fit=crop&q=80',
    alt: 'Premium fragrance'
  };
  if (!occasionName) return defaultImage;
  const normalized = occasionName.toLowerCase();
  for (const [key, imageData] of Object.entries(occasionImages)) {
    if (normalized.includes(key)) {
      return imageData;
    }
  }
  return defaultImage;
}

function getOccasionTagKey(occasionName: string | undefined): string {
  if (!occasionName) return 'daily';
  const normalized = occasionName.toLowerCase();
  for (const key of Object.keys(occasionImages)) {
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
    <div className="relative overflow-hidden bg-gradient-to-br from-[#550000]/5 via-white to-[#ECDBC7]/10 py-20 mb-0">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#ECDBC7]/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tr from-[#B3967D]/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#550000] to-[#6B0000] text-white px-5 py-1.5 rounded-full mb-3 shadow-lg text-xs font-bold tracking-wide">
              {t('badge').toUpperCase()}
            </div>
            <h2 className="text-5xl text-[var(--color-deep-navy)] font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#550000] to-[#6B0000]">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
          <div className="hidden lg:flex gap-2 ml-4">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border-2 border-[#ECDBC7] bg-white flex items-center justify-center transition-all duration-300 hover:bg-[#550000] hover:border-[#550000] hover:text-white shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border-2 border-[#ECDBC7] bg-white flex items-center justify-center transition-all duration-300 hover:bg-[#550000] hover:border-[#550000] hover:text-white shadow-sm"
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
            const imageData = getOccasionImage(occasion.occasion);
            const tagKey = getOccasionTagKey(occasion.occasion);
            return (
              <Link
                key={occasion.occasion || `occasion-${index}`}
                href={`/products?occasion=${encodeURIComponent(occasion.occasion)}`}
                className="flex-shrink-0 w-[160px] md:w-auto bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer border border-white/50 group hover:bg-gradient-to-br hover:from-[#ECDBC7]/30 hover:to-[#F5E6D3]/20"
              >
                <div className="relative h-[140px] overflow-hidden">
                  <Image
                    src={imageData.image}
                    alt={imageData.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 160px, (max-width: 1024px) 33vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#550000]/30 via-[#550000]/5 to-transparent"></div>
                </div>
                <div className="p-6 px-4">
                  <div className="text-base font-bold text-[var(--color-deep-navy)] mb-2">
                    {translateOccasion(tOccasions, occasion.occasion)}
                  </div>
                  <div className="text-xs text-[#550000] font-semibold bg-[#ECDBC7] px-3 py-1 rounded-full inline-block">
                    {safeTranslate(t, `tags.${tagKey}`, '')}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
