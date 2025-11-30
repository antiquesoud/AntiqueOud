/**
 * Flash Sale Component
 * Displays limited-time offers with countdown timer
 */

'use client';

import { useTranslations } from 'next-intl';
import { Product } from '@/lib/api/homepage';
import { ProductCarousel } from './product-carousel';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import toast from 'react-hot-toast';

interface FlashSaleProps {
  products: Product[];
}

export function FlashSale({ products }: FlashSaleProps) {
  const t = useTranslations('homepage.flashSale');
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
      {/* Removed - clean background */}
      

      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B3967D] to-transparent"></div>

      <div className="container mx-auto px-[5%] relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          {/* Decorative line above title */}
          <div className="flex items-center justify-center mb-4">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#B3967D]"></div>
            <div className="mx-4 text-[#B3967D] text-sm tracking-widest uppercase">Limited Time</div>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#B3967D]"></div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl text-\[#550000\] font-bold mb-3 tracking-wide">
            {t('title')}
          </h2>

          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Exclusive deals on premium fragrances
          </p>
        </div>

        <ProductCarousel
          products={products}
          compact={true}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={isWishlisted}
        />
      </div>

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B3967D] to-transparent"></div>
    </div>
  );
}
