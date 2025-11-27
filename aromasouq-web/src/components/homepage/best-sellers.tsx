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
    <div className="relative overflow-hidden py-12 mb-0" style={{
      backgroundImage: 'url(/perfume-images/antik-posts2.jpg)', // Using posts2 as posts12 doesn't exist
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Dark overlay for text readability - reduced opacity to show background better */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#550000]/50 via-[#6B0000]/45 to-[#550000]/50"></div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="text-center mb-8">

          <h2 className="text-3xl md:text-4xl text-white font-bold mb-2">
            {t('title')}
          </h2>

          <p className="text-base text-[#ECDBC7]">
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
    </div>
  );
}
