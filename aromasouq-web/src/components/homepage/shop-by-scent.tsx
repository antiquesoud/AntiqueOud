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

// Background image mapping for scent families - using natural product images from Pexels (free to use)
const scentImages: Record<string, string> = {
  // Fresh pink/red roses - floral fragrance
  floral: 'https://images.pexels.com/photos/736230/pexels-photo-736230.jpeg?auto=compress&cs=tinysrgb&w=400',
  // Fresh citrus fruits with slices - fruity scents
  fruity: '/scent-images/citrus.jpg',
  // Green leaves with bokeh - fresh natural scents
  fresh: '/scent-images/fresh.jpg',
  // Blue water wave - aquatic fresh scents
  'fresh/aquatic': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&auto=format&fit=crop',
  aquatic: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&auto=format&fit=crop',
  // Burning incense sticks - oriental spices
  oriental: 'https://images.pexels.com/photos/6157052/pexels-photo-6157052.jpeg?auto=compress&cs=tinysrgb&w=400',
  // Wood bark texture - woody scents (KEEP - user approved)
  woody: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&auto=format&fit=crop',
  // Amber crystals - musky (KEEP - user approved)
  musky: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&auto=format&fit=crop',
  // Vanilla pods/beans natural - sweet gourmand
  'sweet/gourmand': 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=400',
  // Cinnamon sticks close up - spicy
  spicy: 'https://images.pexels.com/photos/1008747/pexels-photo-1008747.jpeg?auto=compress&cs=tinysrgb&w=400',
  // Agarwood chips/oud wood natural
  oud: 'https://images.pexels.com/photos/6207587/pexels-photo-6207587.jpeg?auto=compress&cs=tinysrgb&w=400',
  // Brown leather texture close-up
  leather: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400',
};

function getScentImage(scentName: string | undefined): string {
  if (!scentName) return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop';
  const normalized = scentName.toLowerCase();
  return scentImages[normalized] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop';
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
    <div className="relative overflow-hidden bg-gray-50 py-16 mb-0">
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
          {scentFamilies.filter(scent => scent.scentFamily).map((scent, index) => {
            const scentImage = getScentImage(scent.scentFamily);

            return (
              <Link
                key={scent.scentFamily || `scent-${index}`}
                href={`/products?scentFamily=${encodeURIComponent(scent.scentFamily)}`}
                className="flex-shrink-0 w-[220px] bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer text-center border border-gray-200 group"
              >
                {/* Background Image Section */}
                <div
                  className="h-[160px] bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${scentImage})` }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all"></div>

                  {/* Scent name overlay on image */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">
                      {translateScentFamily(tScents, scent.scentFamily)}
                    </h3>
                  </div>
                </div>

                {/* Product count section */}
                <div className="p-4 bg-white">
                  <div className="text-xs text-gray-600 font-semibold">
                    {scent.count} {safeTranslate(tCommon, 'products', 'Products')}
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
