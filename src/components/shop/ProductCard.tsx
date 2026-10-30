/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatPKR } from '../../utils/ecommerce-logic';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Heart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  openAuthModal?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  openAuthModal,
}) => {
  const { isInWishlist, toggleWishlist, categories } = useStore();
  const wishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);

  // Find category name
  const category = categories.find((c) => c.id === product.category_id);

  // Calculate discount percentage if compare_at_price exists
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
    : 0;

  // Calculate total stock across active variants
  const totalStock = product.variants
    .filter((v) => v.is_active)
    .reduce((sum, v) => sum + v.stock_quantity, 0);

  const isOutOfStock = totalStock === 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = toggleWishlist(product.id);
    if (result.requiresAuth && openAuthModal) {
      openAuthModal();
    }
  };

  const hasSecondImage = product.images && product.images.length > 1;
  const displayImage = isHovered && hasSecondImage ? product.images[1] : product.images[0];

  return (
    <div
      onClick={() => onSelect(product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-[12px] border border-[#E4DFD1] overflow-hidden shadow-[0_4px_20px_rgba(15,59,46,0.06)] hover:shadow-[0_10px_30px_rgba(15,59,46,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Square Image Container */}
      <div className="relative aspect-square w-full bg-[#F8F4EA] overflow-hidden">
        <ImageWithFallback
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-out"
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#0F3B2E]/70 backdrop-blur-[2px] flex items-center justify-center p-4 z-20">
            <span className="px-3.5 py-1.5 rounded-full bg-[#F8F4EA] text-[#0F3B2E] text-xs font-bold uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-[#B8963E] text-[#F8F4EA] text-[10.5px] font-bold px-2 py-0.5 rounded-full shadow-xs tracking-wide">
              Save {discountPercent}%
            </span>
          )}
          {product.is_featured && !hasDiscount && (
            <span className="bg-[#0F3B2E] text-[#F8F4EA] text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
              Curated
            </span>
          )}
        </div>

        {/* Wishlist Button top-right */}
        <button
          onClick={handleWishlistClick}
          aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-xs flex items-center justify-center transition-all shadow-xs z-10 ${
            wishlisted
              ? 'bg-[#B3372F]/10 text-[#B3372F]'
              : 'bg-white/85 text-[#6B6B66] hover:text-[#B3372F] hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#B3372F]' : ''}`} strokeWidth={1.5} />
        </button>

        {/* Quick View Button on Hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <span className="w-full py-2 bg-[#0F3B2E]/90 hover:bg-[#0F3B2E] text-[#F8F4EA] text-xs font-semibold rounded-[10px] text-center shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} />
              View Options
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {category && (
            <p className="text-[11px] font-medium text-[#6B6B66] uppercase tracking-wider mb-1">
              {category.name}
            </p>
          )}
          <h3 className="font-serif font-bold text-[#1C1C1C] text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-[#0F3B2E] transition-colors">
            {product.name}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-xs text-[#6B6B66]">
            <span>
              {product.variants.length > 1
                ? `${product.variants.length} options`
                : 'Single variant'}
            </span>
            {totalStock > 0 && totalStock <= 5 && (
              <span className="text-[#C98A12] font-medium">· Only {totalStock} left</span>
            )}
          </div>
        </div>

        {/* Price & Free Delivery Tag */}
        <div className="mt-3 pt-2.5 border-t border-[#E4DFD1]/60 flex items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-bold text-[15px] sm:text-base text-[#0F3B2E] tabular-nums">
              {formatPKR(product.base_price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#6B6B66] line-through tabular-nums">
                {formatPKR(product.compare_at_price!)}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-[#0F3B2E] bg-[#E6EFEA] px-2 py-0.5 rounded-full shrink-0">
            Free Delivery
          </span>
        </div>
      </div>
    </div>
  );
};
