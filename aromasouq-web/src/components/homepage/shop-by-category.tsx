/**
 * Shop by Category Component
 * Displays categories as circular icons
 */

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Category } from '@/lib/api/homepage';
import { translateCategory } from '@/lib/translation-helpers';
import { ArabicBorder } from '@/components/ui/arabic-border';

// Mapping categories to images
const categoryImages: Record<string, string> = {
  'perfumes': '/perfume-images/antik-posts8.jpg',
  'oud': '/perfume-images/antik-posts9.jpg',
  'attars': '/perfume-images/antik-posts10.jpg',
  'bakhoor': '/perfume-images/antik-posts11.jpg',
  'gift-sets': '/perfume-images/antik-posts13.jpg',
  'home-fragrance': '/perfume-images/antik-posts14.jpg',
};

interface ShopByCategoryProps {
  categories: Category[];
}

export function ShopByCategory({ categories }: ShopByCategoryProps) {
  const t = useTranslations('homepage.categories');
  const tCategories = useTranslations('categories');

  return (
    <div className="relative overflow-hidden bg-white py-16 mb-0">
      {/* Subtle decorative pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #550000 0px, #550000 1px, transparent 1px, transparent 20px)`,
          opacity: 0.03
        }}></div>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#550000]">
            {t('title')}
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
          {categories.map((category) => {
            const categoryImage = categoryImages[category.slug] || '/perfume-images/antik-posts2.jpg';

            return (
              <Link
                key={category.id}
                href={`/products?categorySlug=${category.slug}`}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative bg-white rounded-xl overflow-hidden shadow-xl transition-all duration-300 group-hover:shadow-2xl border-4 border-[#ECDBC7]">
                  {/* Category Image */}
                  <div
                    className="h-48 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${categoryImage})` }}
                  >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all"></div>
                  </div>

                  {/* Arabic Border */}
                  <div className="h-12">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 400 48"
                      preserveAspectRatio="xMidYMid slice"
                      fill="none"
                    >
                      <defs>
                        <pattern id={`pattern-${category.id}`} x="0" y="0" width="40" height="48" patternUnits="userSpaceOnUse">
                          <path d="M20 8 L23 11 L20 14 L17 11 Z" fill="#550000" opacity="0.8" />
                          <path d="M20 34 L23 37 L20 40 L17 37 Z" fill="#550000" opacity="0.8" />
                          <path d="M10 24 L13 21 L16 24 L13 27 Z" fill="#550000" opacity="0.6" />
                          <path d="M30 24 L33 21 L36 24 L33 27 Z" fill="#550000" opacity="0.6" />
                          <rect x="0" y="0" width="40" height="2" fill="#550000" />
                          <rect x="0" y="46" width="40" height="2" fill="#550000" />
                        </pattern>
                      </defs>
                      <rect x="0" y="0" width="400" height="48" fill="#ECDBC7" />
                      <rect x="0" y="0" width="400" height="48" fill={`url(#pattern-${category.id})`} />
                    </svg>
                  </div>

                  {/* Category Name */}
                  <div className="p-4 bg-gradient-to-br from-[#ECDBC7] to-[#E5D4BD] text-center">
                    <h3 className="font-black text-[#550000] text-lg group-hover:scale-105 transition-all">
                      {translateCategory(tCategories, category.name)}
                    </h3>
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
