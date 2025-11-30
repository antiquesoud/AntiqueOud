/**
 * Best Sellers Component
 * Displays top-selling products
 */

'use client';

import { useTranslations } from 'next-intl';
import { Product } from '@/lib/api/homepage';
import { ProductCarousel } from './product-carousel';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import toast from 'react-hot-toast';

interface BestSellersProps {
  products: Product[];
}

export function BestSellers({ products }: BestSellersProps) {
  const t = useTranslations('homepage.bestSellers');
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const handleAddToCart = (product: any) => {
    addToCart({
      productId: product.id,
      quantity: 1,
    });
    toast.success(`${product.name || product.nameEn} added to cart`);
  };

  const handleToggleWishlist = (product: any) => {
    toggleWishlist(product.id);
    const isWishlisted = wishlist?.some((p: any) => p.id === product.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const isWishlisted = (productId: string) => {
    return wishlist?.some((p: any) => p.id === productId) || false;
  };

  return (
    <div className="relative overflow-hidden py-16 mb-8 bg-white">
      {/* Top border separator */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B3967D] to-transparent"></div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl text-[#550000] font-bold mb-2">
            {t('title')}
          </h2>

          <p className="text-base text-gray-600">
            {t('description')}
          </p>
        </div>

        <ProductCarousel
          products={products}
          compact={false}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={isWishlisted}
        />
      </div>

      {/* Bottom border separator */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B3967D] to-transparent"></div>
    </div>
  );
}
