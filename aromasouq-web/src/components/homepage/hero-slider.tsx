/**
 * Hero Slider Component
 * Main banner section with carousel of perfume images
 */

'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

const carouselImages = [
  '/perfume-images/antik-posts2.jpg',
  '/perfume-images/antik-posts3.jpg',
  '/perfume-images/antik-posts4.jpg',
  '/perfume-images/antik-posts5.jpg',
  '/perfume-images/antik-posts6.jpg',
  '/perfume-images/antik-posts7.jpg',
];

export function HeroSlider() {
  const t = useTranslations('homepage.hero');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[400px] sm:h-[500px] md:h-[550px] overflow-hidden mb-0">
      {/* Carousel Background Images */}
      {carouselImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center text-white z-20">
        <div className="text-center max-w-4xl px-4 sm:px-5">
          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-5 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ECDBC7] via-[#B3967D] to-[#ECDBC7]">
              {t('title')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-5 sm:mb-8 font-semibold text-white drop-shadow-lg max-w-2xl mx-auto px-2">
            {t('description')}
          </p>

          {/* CTA Button */}
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#B3967D] to-[#C9A86A] hover:from-[#C9A86A] hover:to-[#D4AF74] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full text-sm sm:text-base lg:text-lg font-black transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(179,150,125,0.5)] shadow-2xl border-2 border-white/30 hover:scale-105"
          >
            <span>{t('shopNow')}</span>
            <span className="text-base sm:text-xl">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
