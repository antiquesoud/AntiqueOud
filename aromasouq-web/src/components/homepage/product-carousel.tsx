/**
 * Product Carousel Component
 * Reusable horizontal scrolling product display
 */

'use client';

import { useRef } from 'react';
import { ProductCard } from '@/components/ui/product-card';
import { Product } from '@/lib/api/homepage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselProps {
  products: Product[];
  className?: string;
  compact?: boolean;
}

export function ProductCarousel({ products, className = '', compact = false }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardWidth = compact ? 200 : 240;
  const gap = compact ? 12 : 16;

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = (cardWidth + gap) * 4; // 4 cards at a time
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full border-2 border-gray-300 bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-[#550000] hover:border-[#550000] hover:text-white text-gray-700 shadow-sm hover:shadow-md"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full border-2 border-gray-300 bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-[#550000] hover:border-[#550000] hover:text-white text-gray-700 shadow-sm hover:shadow-md"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className={`flex ${compact ? 'gap-3' : 'gap-4'} overflow-x-auto scrollbar-hide scroll-smooth`}
      >
        {products.map((product) => (
          <div key={product.id} className={`flex-shrink-0 ${compact ? 'w-[200px]' : 'w-[240px]'}`}>
            <ProductCard product={product as any} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  );
}
