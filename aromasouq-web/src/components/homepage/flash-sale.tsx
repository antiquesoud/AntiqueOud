/**
 * Flash Sale Component
 * Displays limited-time offers with countdown timer
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/lib/api/homepage';
import { ProductCarousel } from './product-carousel';

interface FlashSaleProps {
  products: Product[];
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export function FlashSale({ products }: FlashSaleProps) {
  const t = useTranslations('homepage.flashSale');
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 12, minutes: 34, seconds: 56 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset to initial time when countdown ends
              return { hours: 12, minutes: 34, seconds: 56 };
            }
          }
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#550000] via-[#6b0000] to-[#8b0000] py-20 mb-0">
      {/* Lightning bolt artwork with glowing edges */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated lightning bolts */}
        <svg className="absolute top-10 left-[15%] w-32 h-48 opacity-20 animate-pulse" viewBox="0 0 100 200" fill="none">
          <path d="M50 0L30 80H60L40 200L90 80H60L80 0Z" fill="url(#lightning-gradient)" className="drop-shadow-[0_0_15px_rgba(179,150,125,0.8)]"/>
          <defs>
            <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B3967D" />
              <stop offset="100%" stopColor="#B3967D" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="absolute top-32 right-[10%] w-24 h-36 opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }} viewBox="0 0 100 200" fill="none">
          <path d="M50 0L30 80H60L40 200L90 80H60L80 0Z" fill="url(#lightning-gradient-2)" className="drop-shadow-[0_0_12px_rgba(179,150,125,0.6)]"/>
          <defs>
            <linearGradient id="lightning-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B3967D" />
              <stop offset="100%" stopColor="#ECDBC7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Glowing orbs and energy effects */}
        <div className="absolute top-20 right-[25%] w-64 h-64 bg-[#B3967D]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-[20%] w-80 h-80 bg-[#ECDBC7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#550000]/15 rounded-full blur-3xl"></div>

        {/* Sparkle effects */}
        <div className="absolute top-24 left-[40%] w-2 h-2 bg-[#B3967D] rounded-full shadow-[0_0_20px_8px_rgba(179,150,125,0.6)] animate-pulse"></div>
        <div className="absolute top-48 right-[35%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(236,219,199,0.6)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute bottom-32 left-[30%] w-2 h-2 bg-[#B3967D] rounded-full shadow-[0_0_20px_8px_rgba(179,150,125,0.6)] animate-pulse" style={{ animationDelay: '0.7s' }}></div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        {/* Header with centered countdown */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B3967D] via-[#B3967D] to-[#550000] text-white px-5 py-2 rounded-full mb-4 shadow-2xl text-sm font-black tracking-wider border-2 border-[#ECDBC7]/30">
            <span className="text-xl animate-pulse">⚡</span>
            <span>{t('badge').toUpperCase()}</span>
            <span className="text-xl animate-pulse">⚡</span>
          </div>

          <h2 className="text-5xl md:text-6xl text-white font-black mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {t('title')}
          </h2>

          <p className="text-lg text-[#ECDBC7] mb-6 font-semibold">
            ⏰ {t('hurry')}
          </p>

          {/* Elegant countdown timer */}
          <div className="flex justify-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B3967D] to-[#B3967D] rounded-2xl blur-lg opacity-60"></div>
              <div className="relative text-center bg-gradient-to-br from-white to-[#ECDBC7]/20 px-6 py-4 rounded-2xl border-4 border-[#B3967D]/50 shadow-2xl transform hover:scale-105 transition-transform">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#B3967D] to-[#B3967D] leading-none">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-widest font-bold mt-2">
                  {t('hours')}
                </div>
              </div>
            </div>

            <div className="flex items-center text-5xl font-black text-[#B3967D] drop-shadow-lg">:</div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B3967D] to-[#8b0000] rounded-2xl blur-lg opacity-60"></div>
              <div className="relative text-center bg-gradient-to-br from-white to-[#ECDBC7]/30 px-6 py-4 rounded-2xl border-4 border-[#B3967D]/50 shadow-2xl transform hover:scale-105 transition-transform">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#B3967D] to-[#8b0000] leading-none">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-widest font-bold mt-2">
                  {t('minutes')}
                </div>
              </div>
            </div>

            <div className="flex items-center text-5xl font-black text-[#B3967D] drop-shadow-lg">:</div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b0000] to-[#550000] rounded-2xl blur-lg opacity-60"></div>
              <div className="relative text-center bg-gradient-to-br from-white to-[#ECDBC7]/40 px-6 py-4 rounded-2xl border-4 border-[#8b0000]/50 shadow-2xl transform hover:scale-105 transition-transform animate-pulse">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#8b0000] to-[#550000] leading-none">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-widest font-bold mt-2">
                  {t('seconds')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProductCarousel products={products} compact={false} />
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white"></div>
    </div>
  );
}
