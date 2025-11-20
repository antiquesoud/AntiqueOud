/**
 * Oud Collection Showcase Component
 * Displays different types of Oud with descriptions
 */

'use client';

import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const oudTypes = [
  {
    image: 'https://images.unsplash.com/photo-1585916420730-d7f95e942d43?w=400&h=300&fit=crop&q=80',
    alt: 'Cambodian Oud Wood',
    translationKey: 'cambodian',
    slug: 'CAMBODIAN',
  },
  {
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&h=300&fit=crop&q=80',
    alt: 'Indian Oud Chips',
    translationKey: 'indian',
    slug: 'INDIAN',
  },
  {
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=300&fit=crop&q=80',
    alt: 'Thai Oud Essence',
    translationKey: 'thai',
    slug: 'THAI',
  },
  {
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop&q=80',
    alt: 'Mukhallat Oud Blend',
    translationKey: 'dehnAlOud',
    slug: 'MUKHALLAT',
  },
];

export function OudCollection() {
  const t = useTranslations('homepage.oudCollection');
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = 300; // Adjust based on card width
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#550000]/5 via-white to-[#ECDBC7]/10 py-16 mb-0">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle glowing orbs */}
        <div className="absolute top-20 right-[20%] w-64 h-64 bg-[#ECDBC7]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-[15%] w-72 h-72 bg-[#B3967D]/15 rounded-full blur-3xl"></div>

        {/* Decorative pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div style={{
            backgroundImage: `repeating-linear-gradient(45deg, #550000 0px, #550000 1px, transparent 1px, transparent 20px)`,
            opacity: 0.03,
            width: '100%',
            height: '100%'
          }}></div>
        </div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 bg-[#ECDBC7] text-[#550000] px-5 py-2 rounded-full mb-4 shadow-lg text-sm font-bold tracking-wide">
              <span>PREMIUM OUD COLLECTION</span>
            </div>
            <h2 className="text-4xl md:text-5xl text-[#550000] font-black mb-3">
              {t('title')}
            </h2>
            <p className="text-base text-gray-700 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
          <div className="hidden md:flex gap-2 ml-4">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border-2 border-[#550000]/30 bg-white flex items-center justify-center transition-all duration-300 hover:bg-[#550000] hover:border-[#550000] hover:text-white shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border-2 border-[#550000]/30 bg-white flex items-center justify-center transition-all duration-300 hover:bg-[#550000] hover:border-[#550000] hover:text-white shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible"
        >
          {oudTypes.map((oud) => (
            <Link
              key={oud.slug}
              href={`/products?oudType=${oud.slug}`}
              className="flex-shrink-0 w-[280px] md:w-auto rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer border-2 border-[#ECDBC7] group bg-white"
            >
              <div className="h-[180px] relative overflow-hidden">
                {/* Image */}
                <Image
                  src={oud.image}
                  alt={oud.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 280px, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Overlay gradient for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#550000]/40 via-[#550000]/10 to-transparent"></div>
              </div>
              <div className="p-5 text-center bg-gradient-to-br from-white to-[#ECDBC7]/10">
                <div className="text-lg font-black text-[#550000] mb-2">
                  {t(`oudTypes.${oud.translationKey}.name`)}
                </div>
                <div className="text-sm text-gray-700 mb-4 font-medium">
                  {t(`oudTypes.${oud.translationKey}.description`)}
                </div>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#550000] to-[#6B0000] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 border-[#ECDBC7]/30">
                  <span>{t('exploreCollection')}</span>
                  <span className="text-sm">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
