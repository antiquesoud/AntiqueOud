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

      {/* Artistic overlay elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {/* Perfume bottle SVG artwork */}
        <svg className="absolute bottom-10 left-[10%] w-32 h-40 opacity-10" viewBox="0 0 100 150" fill="none">
          <rect x="35" y="20" width="30" height="15" rx="2" fill="url(#bottle-gradient)" />
          <rect x="30" y="35" width="40" height="80" rx="4" fill="url(#bottle-gradient)" opacity="0.9" />
          <circle cx="50" cy="70" r="8" fill="white" opacity="0.3" />
          <defs>
            <linearGradient id="bottle-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C9A86A" />
              <stop offset="100%" stopColor="#8B7355" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="absolute top-20 right-[12%] w-28 h-36 opacity-10 transform rotate-12" viewBox="0 0 100 150" fill="none">
          <rect x="35" y="20" width="30" height="15" rx="2" fill="url(#bottle-gradient-2)" />
          <rect x="30" y="35" width="40" height="80" rx="4" fill="url(#bottle-gradient-2)" opacity="0.9" />
          <circle cx="50" cy="70" r="8" fill="white" opacity="0.3" />
          <defs>
            <linearGradient id="bottle-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#C9A86A" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating sparkles and fragrance waves */}
        <div className="absolute top-[15%] left-[20%] w-3 h-3 bg-[var(--color-oud-gold)] rounded-full shadow-[0_0_25px_10px_rgba(201,168,106,0.6)] animate-pulse"></div>
        <div className="absolute top-[25%] right-[25%] w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_20px_8px_rgba(250,204,21,0.5)] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-[30%] left-[15%] w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_20px_8px_rgba(251,191,36,0.5)] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] right-[18%] w-3 h-3 bg-[var(--color-oud-gold)] rounded-full shadow-[0_0_25px_10px_rgba(201,168,106,0.6)] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

        {/* Glowing orbs for depth */}
        <div className="absolute top-1/4 left-[15%] w-80 h-80 bg-[var(--color-oud-gold)]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-[15%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Fragrance wave patterns */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-5" viewBox="0 0 1000 1000" fill="none">
          <path d="M 0,500 Q 250,400 500,500 T 1000,500" stroke="#C9A86A" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M 0,520 Q 250,420 500,520 T 1000,520" stroke="#C9A86A" strokeWidth="2" fill="none" opacity="0.2" />
          <path d="M 0,540 Q 250,440 500,540 T 1000,540" stroke="#C9A86A" strokeWidth="2" fill="none" opacity="0.1" />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center text-white z-20">
        <div className="text-center max-w-4xl px-4 sm:px-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#550000] to-[#6B0000] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-5 shadow-2xl text-xs sm:text-sm font-black tracking-wider border-2 border-[#ECDBC7]/30 animate-pulse">
            <span className="text-sm sm:text-lg">✨</span>
            <span className="text-[10px] sm:text-sm">{t('subtitle').toUpperCase()}</span>
            <span className="text-sm sm:text-lg">✨</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-5 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ECDBC7] via-[#B3967D] to-[#ECDBC7]">
              {t('title')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-5 sm:mb-8 font-semibold text-white drop-shadow-lg max-w-2xl mx-auto px-2">
            🌟 {t('description')}
          </p>

          {/* CTA Button */}
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#550000] to-[#6B0000] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full text-sm sm:text-base lg:text-lg font-black transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(85,0,0,0.6)] shadow-2xl border-2 border-[#ECDBC7]/30 hover:scale-105"
          >
            <span>{t('shopNow')}</span>
            <span className="text-base sm:text-xl">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
