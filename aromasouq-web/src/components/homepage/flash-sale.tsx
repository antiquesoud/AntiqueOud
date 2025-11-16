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
    <div className="relative overflow-hidden bg-gradient-to-br from-[#550000] via-[#6B0000] to-[#550000] py-12 mb-0">
      {/* Decorative elements - stars and glaze effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div className="absolute top-20 right-[25%] w-64 h-64 bg-[#ECDBC7]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-[20%] w-80 h-80 bg-[#B3967D]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Sparkle stars */}
        <div className="absolute top-24 left-[30%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(236,219,199,0.6)] animate-pulse"></div>
        <div className="absolute top-48 right-[35%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(236,219,199,0.6)] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-[25%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(236,219,199,0.6)] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-[20%] w-2 h-2 bg-[#ECDBC7] rounded-full shadow-[0_0_20px_8px_rgba(236,219,199,0.6)] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-36 left-[15%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_6px_rgba(255,255,255,0.5)] animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-48 right-[15%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_6px_rgba(255,255,255,0.5)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        {/* Header with countdown */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ECDBC7] text-[#550000] px-4 py-1.5 rounded-full mb-3 shadow-lg text-xs font-bold tracking-wide">
              <span className="text-base">⚡</span>
              <span>LIMITED TIME OFFER</span>
              <span className="text-base">⚡</span>
            </div>
            <h2 className="text-3xl md:text-4xl text-white font-bold mb-2">
              {t('title')}
            </h2>
            <p className="text-base text-[#ECDBC7]">
              {t('hurry')}
            </p>
          </div>

          {/* Stylish countdown timer */}
          <div className="flex gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#ECDBC7]/30 rounded-lg blur-md"></div>
              <div className="relative text-center bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-[#ECDBC7] shadow-xl">
                <div className="text-2xl font-bold text-[#550000]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-gray-600 uppercase font-semibold">
                  {t('hours')}
                </div>
              </div>
            </div>

            <div className="flex items-center text-2xl font-bold text-white">:</div>

            <div className="relative">
              <div className="absolute inset-0 bg-[#ECDBC7]/30 rounded-lg blur-md"></div>
              <div className="relative text-center bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-[#ECDBC7] shadow-xl">
                <div className="text-2xl font-bold text-[#550000]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-gray-600 uppercase font-semibold">
                  {t('minutes')}
                </div>
              </div>
            </div>

            <div className="flex items-center text-2xl font-bold text-white">:</div>

            <div className="relative">
              <div className="absolute inset-0 bg-[#ECDBC7]/30 rounded-lg blur-md"></div>
              <div className="relative text-center bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-[#ECDBC7] shadow-xl">
                <div className="text-2xl font-bold text-[#550000]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-gray-600 uppercase font-semibold">
                  {t('seconds')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProductCarousel products={products} compact={true} />
      </div>
    </div>
  );
}
