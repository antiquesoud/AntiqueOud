/**
 * Featured Collections Component
 * Twin banner display for Men's and Women's collections
 */

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function FeaturedCollections() {
  const t = useTranslations('homepage.featuredCollections');
  return (
    <div className="container mx-auto px-[5%] py-12 mb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
        {/* Men's Banner - Arab man with traditional attire */}
        <Link
          href="/products?gender=men"
          className="h-[300px] rounded-xl overflow-hidden relative group cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{
            backgroundImage: 'url(/gender-collections/man-traditional.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white z-10">
            <h3 className="text-3xl font-bold mb-2">{t('forHim')}</h3>
            <p className="text-sm mb-4 text-gray-100">
              {t('forHimDesc')}
            </p>
            <span className="inline-block bg-[#550000] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-[#770000] shadow-md">
              {t('shopMens')} →
            </span>
          </div>
        </Link>

        {/* Women's Banner - Arab woman with traditional attire */}
        <Link
          href="/products?gender=women"
          className="h-[300px] rounded-xl overflow-hidden relative group cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{
            backgroundImage: 'url(/gender-collections/woman-hijab.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white z-10">
            <h3 className="text-3xl font-bold mb-2">{t('forHer')}</h3>
            <p className="text-sm mb-4 text-gray-100">
              {t('forHerDesc')}
            </p>
            <span className="inline-block bg-[#550000] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-[#770000] shadow-md">
              {t('shopWomens')} →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
