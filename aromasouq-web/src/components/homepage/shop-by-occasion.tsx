/**
 * {t('title')} Component
 * Grid display of occasion categories
 */

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Occasion } from '@/lib/api/homepage';
import { translateOccasion, safeTranslate } from '@/lib/translation-helpers';
import { SparkleOverlay } from '@/components/animations/sparkle-overlay';

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
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#550000]/10 via-[#B3967D]/5 to-[#ECDBC7]/20 py-20 mb-0">
      {/* Luxury Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Rich gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#550000]/30 via-[#B3967D]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tr from-[#B3967D]/30 via-[#ECDBC7]/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Sparkles */}
        <SparkleOverlay density="medium" color="#B3967D" />
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#550000] to-[#B3967D] text-white px-6 py-2 rounded-full mb-4 shadow-2xl text-sm font-black tracking-wider border-2 border-[#ECDBC7]/30 animate-glow-pulse">
            <span className="text-lg">✨</span>
            <span>{t('badge').toUpperCase()}</span>
            <span className="text-lg">✨</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-3 drop-shadow-md">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#550000] via-[#B3967D] to-[#550000]">
              {t('title')}
            </span>
          </h2>
          <p className="text-lg text-gray-700 font-semibold max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {occasions.filter(occasion => occasion.occasion).map((occasion, index) => {
            const icon = getOccasionIcon(occasion.occasion);
            const tagKey = getOccasionTagKey(occasion.occasion);
            return (
              <Link
                key={occasion.occasion || `occasion-${index}`}
                href={`/products?occasion=${encodeURIComponent(occasion.occasion)}`}
                className="relative bg-gradient-to-br from-white via-[#ECDBC7]/10 to-white rounded-2xl p-8 px-6 text-center shadow-[0_8px_30px_rgba(85,0,0,0.15)] transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(179,150,125,0.4)] cursor-pointer border-2 border-[#B3967D]/20 group hover:border-[#B3967D] overflow-hidden"
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B3967D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full transform" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />

                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#550000]/20 via-[#B3967D]/30 to-[#550000]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="text-6xl mb-5 transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 drop-shadow-lg filter group-hover:drop-shadow-2xl">{icon}</div>
                  <div className="text-base font-black text-[#550000] mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#550000] group-hover:to-[#B3967D]">
                    {translateOccasion(tOccasions, occasion.occasion)}
                  </div>
                  <div className="text-xs text-[#2D2D2D] font-bold bg-gradient-to-r from-[#B3967D]/20 to-[#ECDBC7]/30 px-3 py-1.5 rounded-full inline-block border border-[#B3967D]/30 group-hover:from-[#B3967D] group-hover:to-[#B3967D] group-hover:text-white group-hover:border-0 transition-all duration-300 shadow-md">
                    {safeTranslate(t, `tags.${tagKey}`, '')}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
    </div>
  );
}
