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

// Mapping categories to images - 6 client categories (Air Freshener & Dakhoon hidden)
const categoryImages: Record<string, string> = {
  'oud': '/perfume-images/antik-posts9.jpg',
  'dehnal-oud': '/perfume-images/antik-posts11.jpg',
  'perfumes': '/perfume-images/antik-posts6.jpg',
  'all-over-spray': '/perfume-images/antik-posts7.jpg',
  'accessories': 'https://dygedwxdzyuqjrhtjrem.supabase.co/storage/v1/object/public/products/eab1742b-c388-414e-82d6-acaeb20a293d/images/c9dcdc59-85b5-4103-9a5a-20121700e78f-1770140650422.jpg',
  'limited-edition': '/categoryImage/_DSC8382.JPG.jpeg',
};

// Show these 6 client categories (in order) - Air Freshener & Dakhoon hidden
const allowedCategories = ['oud', 'dehnal-oud', 'perfumes', 'all-over-spray', 'accessories', 'limited-edition'];

interface ShopByCategoryProps {
  categories: Category[];
}

export function ShopByCategory({ categories }: ShopByCategoryProps) {
  const t = useTranslations('homepage.categories');
  const tCategories = useTranslations('categories');

  // Filter and sort categories according to allowedCategories order
  const filteredCategories = categories
    .filter((category) => allowedCategories.includes(category.slug))
    .sort((a, b) => allowedCategories.indexOf(a.slug) - allowedCategories.indexOf(b.slug));

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
          {filteredCategories.map((category) => {
            // Use database image if available, fallback to hardcoded mapping
            const categoryImage = category.image || categoryImages[category.slug] || '/perfume-images/antik-posts2.jpg';

            return (
              <Link
                key={category.id}
                href={`/products?categorySlug=${category.slug}`}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative bg-white rounded-xl overflow-hidden shadow-xl transition-all duration-300 group-hover:shadow-2xl">
                  {/* Category Image */}
                  <div
                    className="h-48 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${categoryImage})` }}
                  >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all"></div>
                  </div>

                  {/* Maroon Separator Lines */}
                  <div className="w-full">
                    <div className="h-[2px] bg-[#550000]"></div>
                    <div className="h-[2px] bg-[#550000] mt-[2px]"></div>
                  </div>

                  {/* Category Name */}
                  <div className="p-4 bg-white text-center">
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
