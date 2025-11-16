/**
 * {t('title')} Component
 * Horizontal carousel of regional fragrance origins
 */

'use client';

import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { Region } from '@/lib/api/homepage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { translateRegion, safeTranslate } from '@/lib/translation-helpers';

interface ShopByRegionProps {
  regions: Region[];
}

// Custom regions with specific flags as requested
const customRegions = [
  { name: 'Hindi', flag: '🇮🇳', key: 'hindi' },
  { name: 'Silani', flag: '🇱🇰', key: 'silani' },
  { name: 'Cambodi', flag: '🇰🇭', key: 'cambodi' },
  { name: 'Philipini', flag: '🇵🇭', key: 'philipini' },
  { name: 'Meruke', flag: '🇮🇩', key: 'meruke' },
];

// Flag emoji mapping for regions - extended with new regions
const regionFlags: Record<string, string> = {
  uae: '🇦🇪',
  'saudi arabia': '🇸🇦',
  saudi: '🇸🇦',
  kuwait: '🇰🇼',
  qatar: '🇶🇦',
  oman: '🇴🇲',
  bahrain: '🇧🇭',
  france: '🇫🇷',
  french: '🇫🇷',
  italy: '🇮🇹',
  italian: '🇮🇹',
  spain: '🇪🇸',
  spanish: '🇪🇸',
  uk: '🇬🇧',
  'united kingdom': '🇬🇧',
  usa: '🇺🇸',
  america: '🇺🇸',
  india: '🇮🇳',
  indian: '🇮🇳',
  hindi: '🇮🇳',
  arab: '🇸🇦',
  arabic: '🇸🇦',
  european: '🇪🇺',
  silani: '🇱🇰',
  'sri lanka': '🇱🇰',
  cambodi: '🇰🇭',
  cambodia: '🇰🇭',
  philipini: '🇵🇭',
  philippines: '🇵🇭',
  meruke: '🇮🇩',
  indonesia: '🇮🇩',
};

function getRegionFlag(regionName: string | undefined): string {
  if (!regionName) return '🌍';
  const normalized = regionName.toLowerCase();
  for (const [key, flag] of Object.entries(regionFlags)) {
    if (normalized.includes(key)) {
      return flag;
    }
  }
  return '🌍';
}

export function ShopByRegion({ regions }: ShopByRegionProps) {
  const t = useTranslations('homepage.shopByRegion');
  const tRegions = useTranslations('regions');
  const tCommon = useTranslations('common');
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = 264 * 4; // (card width 240 + gap 24) * 4
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // ONLY show the 5 custom regions - map them to database data if available
  const allRegions = customRegions.map(cr => {
    const dbRegion = regions.find(r => r.region?.toLowerCase().includes(cr.key));
    return {
      region: cr.name,
      count: dbRegion?.count || 0,
      flag: cr.flag,
      searchKey: cr.key, // Keep the key for URL filtering
    };
  });

  return (
    <div className="relative overflow-hidden bg-white py-16 mb-0">
      {/* Subtle pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #550000 0px, #550000 1px, transparent 1px, transparent 20px)`,
          opacity: 0.03
        }}></div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl text-[#550000] font-bold mb-2">
              {t('title')}
            </h2>
            <p className="text-base text-gray-600">
              {t('description')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center transition-all duration-300 hover:bg-[#550000] hover:border-[#550000] hover:text-white shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center transition-all duration-300 hover:bg-[#550000] hover:border-[#550000] hover:text-white shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {allRegions.map((region, index) => (
            <Link
              key={region.region || `region-${index}`}
              href={`/products?region=${encodeURIComponent(region.searchKey)}`}
              className="flex-shrink-0 w-[220px] bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer border border-gray-200 group"
            >
              <div className="h-[140px] flex items-center justify-center text-7xl bg-gray-50 group-hover:bg-gray-100 transition-all duration-300">
                {region.flag}
              </div>
              <div className="p-4 text-center bg-white">
                <div className="text-base font-bold text-[#550000] mb-1">
                  {region.region}
                </div>
                <div className="text-xs text-gray-600 font-semibold">
                  {region.count} {safeTranslate(tCommon, 'products', 'Products')}
                </div>
              </div>
            </Link>
          ))}</div>
      </div>
    </div>
  );
}
