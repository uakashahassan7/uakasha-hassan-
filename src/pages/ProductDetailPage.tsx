/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Product, ProductVariant } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPKR, getVariantPrice, calculateReviewSummary } from '../utils/ecommerce-logic';
import { ProductCard } from '../components/shop/ProductCard';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { ProductReviewsSection } from '../components/shop/ProductReviewsSection';
import { formatProductMessage, buildWhatsAppUrl } from '../lib/whatsapp';
import {
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  ChevronRight,
  Check,
  Star,
} from 'lucide-react';

interface ProductDetailPageProps {
  productId?: string;
  onSelectProduct?: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
  openAuthModal?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId: propProductId,
  onSelectProduct,
  onNavigateTab,
  openAuthModal,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, categories, addToCart, isInWishlist, toggleWishlist, showToast, reviews } = useStore();

  const handleSelectProduct = (id: string) => {
    if (onSelectProduct) {
      onSelectProduct(id);
    } else {
      const target = products.find((p) => p.id === id);
      navigate(target ? `/product/${target.slug}` : `/product/${id}`);
    }
  };

  const handleNavigate = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      if (tab === 'cart') navigate('/cart');
      else if (tab === 'checkout') navigate('/checkout');
      else if (tab === 'shop') navigate('/shop');
      else navigate('/');
    }
  };

  const targetIdentifier = propProductId || slug;

  const product = useMemo(() => {
    return products.find(
      (p) => p.id === targetIdentifier || p.slug === targetIdentifier
    );
  }, [products, targetIdentifier]);

  const category = useMemo(() => {
    return categories.find((c) => c.id === product?.category_id);
  }, [categories, product]);

  // Reviews summary for product
  const productReviews = useMemo(() => {
    return reviews.filter((r) => r.product_id === product?.id);
  }, [reviews, product?.id]);

  const reviewSummary = useMemo(() => {
    return calculateReviewSummary(productReviews);
  }, [productReviews]);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Active variants
  const activeVariants = useMemo(() => {
    return product ? product.variants.filter((v) => v.is_active) : [];
  }, [product]);

  // Extract unique sizes and colors
  const sizes = useMemo(() => {
    const list: string[] = [];
    activeVariants.forEach((v) => {
      if (v.size && !list.includes(v.size)) list.push(v.size);
    });
    return list;
  }, [activeVariants]);

  const colors = useMemo(() => {
    const list: { name: string; hex?: string }[] = [];
    activeVariants.forEach((v) => {
      if (v.color && !list.some((c) => c.name === v.color)) {
        list.push({ name: v.color, hex: v.color_hex });
      }
    });
    return list;
  }, [activeVariants]);

  // Selected size & color states
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    return sizes.length > 0 ? sizes[0] : null;
  });

  const [selectedColor, setSelectedColor] = useState<string | null>(() => {
    return colors.length > 0 ? colors[0].name : null;
  });

  const [quantity, setQuantity] = useState(1);

  // Resolved variant based on selection
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!product || activeVariants.length === 0) return undefined;

    if (selectedSize && selectedColor) {
      const match = activeVariants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );
      if (match) return match;
    }

    if (selectedSize) {
      const match = activeVariants.find((v) => v.size === selectedSize);
      if (match) return match;
    }

    if (selectedColor) {
      const match = activeVariants.find((v) => v.color === selectedColor);
      if (match) return match;
    }

    return activeVariants[0];
  }, [product, activeVariants, selectedSize, selectedColor]);

  // Calculate live price
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return getVariantPrice(product.base_price, selectedVariant?.price);
  }, [product, selectedVariant]);

  const comparePrice = selectedVariant?.compare_at_price ?? product?.compare_at_price;
  const hasDiscount = comparePrice && comparePrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice! - currentPrice) / comparePrice!) * 100)
    : 0;

  const currentStock = selectedVariant ? selectedVariant.stock_quantity : 0;
  const isOutOfStock = currentStock <= 0;

  // Handle Add To Cart
  const handleAddToCart = () => {
    if (!product) return false;
    if (sizes.length > 0 && !selectedSize) {
      showToast('Please select options', 'warning');
      return false;
    }
    if (colors.length > 0 && !selectedColor) {
      showToast('Please select options', 'warning');
      return false;
    }
    if (!selectedVariant) {
      showToast('Please select options', 'warning');
      return false;
    }
    const res = addToCart(product, selectedVariant, quantity);
    return res.success;
  };

  // Handle WhatsApp Order
  const handleOrderOnWhatsApp = () => {
    if (!product) return;
    if (sizes.length > 0 && !selectedSize) {
      showToast('Please select options', 'warning');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      showToast('Please select options', 'warning');
      return;
    }
    if (!selectedVariant) {
      showToast('Please select options', 'warning');
      return;
    }
    if (isOutOfStock) {
      showToast('This item is currently out of stock', 'warning');
      return;
    }

    const message = formatProductMessage({
      product,
      variant: selectedVariant,
      quantity,
      origin: window.location.origin,
    });
    const url = buildWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle Buy Now
  const handleBuyNow = () => {
    if (handleAddToCart()) {
      handleNavigate('checkout');
    }
  };

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category_id === product.category_id && p.id !== product.id && p.is_active)
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#0F3B2E]">Product Not Found</h2>
        <p className="text-xs text-[#6B6B66]">The item you are looking for may have been moved or deactivated.</p>
        <button
          onClick={() => handleNavigate('shop')}
          className="px-6 py-3 min-h-[44px] rounded-[10px] bg-[#0F3B2E] text-[#F8F4EA] font-semibold text-xs shadow-xs"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24 md:pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#6B6B66]">
        <button onClick={() => handleNavigate('home')} className="hover:text-[#0F3B2E] transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} />
        <button onClick={() => handleNavigate('shop')} className="hover:text-[#0F3B2E] transition-colors">
          Shop
        </button>
        {category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} />
            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab(`category-${category.slug}`);
                else navigate(`/category/${category.slug}`);
              }}
              className="hover:text-[#0F3B2E] transition-colors"
            >
              {category.name}
            </button>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} />
        <span className="text-[#0F3B2E] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Two-Column Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square rounded-[12px] bg-white overflow-hidden border border-[#E4DFD1] shadow-[0_4px_20px_rgba(15,59,46,0.06)]">
            <ImageWithFallback
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-[#B8963E] text-[#F8F4EA] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-[10px] overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-[#0F3B2E] ring-2 ring-[#0F3B2E]/20'
                      : 'border-[#E4DFD1] opacity-75 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions Module */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {category && (
              <span className="text-xs font-semibold text-[#B8963E] uppercase tracking-wider block mb-1">
                {category.name}
              </span>
            )}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F3B2E] leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#6B6B66]">
              {reviewSummary.totalReviews > 0 ? (
                <a
                  href="#reviews-section"
                  className="inline-flex items-center gap-1.5 hover:text-[#0F3B2E] transition-colors group cursor-pointer"
                >
                  <div className="flex text-[#B8963E]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(reviewSummary.averageRating)
                            ? 'fill-[#B8963E] text-[#B8963E]'
                            : 'text-[#E4DFD1] fill-transparent'
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-[#0F3B2E]">{reviewSummary.averageRating}</span>
                  <span className="group-hover:underline text-[#6B6B66]">
                    ({reviewSummary.totalReviews} verified {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </a>
              ) : (
                <a
                  href="#reviews-section"
                  className="inline-flex items-center gap-1 text-xs text-[#B8963E] hover:underline"
                >
                  <Star className="w-3.5 h-3.5 text-[#B8963E]" />
                  <span>Be the first to review</span>
                </a>
              )}
              <span>·</span>
              <span>SKU: {selectedVariant?.sku || 'BRV-STD'}</span>
              <span>·</span>
              <span className="text-[#0F3B2E] font-medium">100% Genuine Guarantee</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-[12px] bg-white border border-[#E4DFD1] shadow-xs flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-[#0F3B2E] tabular-nums">
                {formatPKR(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-[#6B6B66] line-through tabular-nums">
                  {formatPKR(comparePrice!)}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6EFEA] text-[#0F3B2E]">
              Free Delivery (COD)
            </span>
          </div>

          {/* Color Variant Selector: Circular Swatches with Name Tooltip */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider flex justify-between">
                <span>
                  Color: <strong className="text-[#0F3B2E] capitalize font-bold">{selectedColor}</strong>
                </span>
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => {
                  const isSelected = selectedColor === color.name;
                  const colorVariant = activeVariants.find((v) => v.color === color.name);
                  const isColorOut = colorVariant ? colorVariant.stock_quantity <= 0 : false;

                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={`${color.name}${isColorOut ? ' (Out of stock)' : ''}`}
                      disabled={isColorOut}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? 'border-[#0F3B2E] ring-2 ring-[#0F3B2E]/30 scale-110'
                          : isColorOut
                          ? 'border-[#E4DFD1] opacity-40 cursor-not-allowed'
                          : 'border-[#E4DFD1] hover:border-[#B8963E]'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full shadow-inner block"
                        style={{ backgroundColor: color.hex || '#E4DFD1' }}
                      />
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white absolute drop-shadow-md" strokeWidth={2.5} />
                      )}
                      {isColorOut && (
                        <span className="absolute inset-x-0 h-0.5 bg-[#B3372F] rotate-45" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Variant Selector: Pill Buttons with Strikethrough when Disabled */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#1C1C1C] uppercase tracking-wider">
                  Size: <strong className="text-[#0F3B2E] font-bold">{selectedSize}</strong>
                </span>
                <span className="text-[#6B6B66] text-[11px]">Standard Pakistani Fit</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const sizeVariant = activeVariants.find((v) => v.size === size);
                  const isSizeOut = sizeVariant ? sizeVariant.stock_quantity <= 0 : false;

                  return (
                    <button
                      key={size}
                      disabled={isSizeOut}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-11 px-4 rounded-full border text-xs font-semibold transition-all flex items-center justify-center ${
                        isSelected
                          ? 'border-[#0F3B2E] bg-[#0F3B2E] text-[#F8F4EA] shadow-xs'
                          : isSizeOut
                          ? 'border-[#E4DFD1] bg-[#F8F4EA] text-[#6B6B66]/50 line-through cursor-not-allowed opacity-60'
                          : 'border-[#E4DFD1] bg-white text-[#1C1C1C] hover:border-[#0F3B2E]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {isOutOfStock ? (
              <span className="font-semibold text-[#B3372F] bg-[#B3372F]/10 px-3 py-1 rounded-full border border-[#B3372F]/20">
                Out of Stock
              </span>
            ) : currentStock <= 5 ? (
              <span className="font-semibold text-[#C98A12] bg-[#F3EAD2] px-3 py-1 rounded-full border border-[#B8963E]/40">
                Only {currentStock} units remaining
              </span>
            ) : (
              <span className="font-semibold text-[#2E7D4F] bg-[#E6EFEA] px-3 py-1 rounded-full border border-[#2E7D4F]/20 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" strokeWidth={2} /> In Stock &amp; Ready to Dispatch
              </span>
            )}
          </div>

          {/* Desktop Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-[#E4DFD1] rounded-[10px] bg-white p-1 min-h-[44px]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-[#6B6B66] hover:text-[#1C1C1C] disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <span className="w-8 text-center font-bold text-xs text-[#1C1C1C] tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                  className="p-2 text-[#6B6B66] hover:text-[#1C1C1C] disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-5 min-h-[44px] rounded-[10px] bg-[#0F3B2E] hover:bg-[#0A2A21] disabled:bg-[#E4DFD1] disabled:cursor-not-allowed text-[#F8F4EA] font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>

              {/* Order on WhatsApp */}
              <button
                type="button"
                onClick={handleOrderOnWhatsApp}
                disabled={isOutOfStock}
                className="w-full sm:w-auto flex-1 py-3 px-5 min-h-[44px] rounded-[10px] bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-[#E4DFD1] disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Order on WhatsApp</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => {
                  const res = toggleWishlist(product.id);
                  if (res.requiresAuth) {
                    if (openAuthModal) openAuthModal();
                    else navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                  }
                }}
                aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                className={`p-3 min-h-[44px] min-w-[44px] rounded-[10px] border transition-colors flex items-center justify-center ${
                  wishlisted
                    ? 'border-[#B3372F]/30 bg-[#B3372F]/10 text-[#B3372F]'
                    : 'border-[#E4DFD1] bg-white text-[#6B6B66] hover:bg-[#F8F4EA]'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-[#B3372F]' : ''}`} strokeWidth={1.5} />
              </button>
            </div>

            {/* Buy Now (Direct Checkout) */}
            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 min-h-[44px] rounded-[10px] bg-[#0A2A21] hover:bg-black text-[#F8F4EA] font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-[#B8963E]/40"
              >
                <Zap className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
                Buy Now with Cash on Delivery
              </button>
            )}
          </div>

          {/* Delivery & Reassurance Box */}
          <div className="rounded-[12px] bg-white border border-[#E4DFD1] p-4 space-y-3 text-xs text-[#6B6B66] shadow-[0_4px_20px_rgba(15,59,46,0.04)]">
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-[#B8963E] shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <strong className="text-[#0F3B2E] block font-semibold">100% Free Nationwide Delivery</strong>
                <span>Swift 2–4 working days delivery across all major Pakistani cities.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#B8963E] shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <strong className="text-[#0F3B2E] block font-semibold">Cash on Delivery &amp; Open Parcel</strong>
                <span>Open and inspect your parcel before paying courier at your doorstep.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="w-4 h-4 text-[#B8963E] shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <strong className="text-[#0F3B2E] block font-semibold">7-Day Easy Exchange</strong>
                <span>Size doesn't fit? Quick exchange through WhatsApp helpline.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Section */}
      <section className="bg-white rounded-[12px] border border-[#E4DFD1] p-6 sm:p-8 space-y-4 shadow-[0_4px_20px_rgba(15,59,46,0.04)]">
        <h2 className="font-serif text-xl font-bold text-[#0F3B2E] border-b border-[#E4DFD1] pb-3">
          Product Details &amp; Material Specifications
        </h2>
        <div className="text-xs sm:text-sm text-[#1C1C1C] leading-relaxed space-y-4">
          <p>{product.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E4DFD1]/60 text-xs text-[#6B6B66]">
            <div>
              <span className="font-semibold text-[#0F3B2E] block mb-1">Authenticity &amp; Inspection</span>
              <p>Every piece is verified before dispatch from our Karachi fulfillment hub.</p>
            </div>
            <div>
              <span className="font-semibold text-[#0F3B2E] block mb-1">Care &amp; Longevity</span>
              <p>Store in a cool dry place. For apparel, gentle hand wash with like colors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <ProductReviewsSection
        product={product}
        openAuthModal={openAuthModal}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#0F3B2E]">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={handleSelectProduct}
                openAuthModal={openAuthModal}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E4DFD1] p-2.5 px-3 shadow-[0_-4px_20px_rgba(15,59,46,0.12)] z-40 flex items-center justify-between gap-2">
        <div className="min-w-0 pr-1">
          <p className="font-serif text-sm font-bold text-[#0F3B2E] tabular-nums leading-none">
            {formatPKR(currentPrice)}
          </p>
          <p className="text-[10px] text-[#6B6B66] truncate mt-0.5">
            {selectedVariant ? `${selectedVariant.color || ''} ${selectedVariant.size || ''}`.trim() : 'Free Delivery'}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 py-2.5 px-2 min-h-[44px] rounded-[10px] bg-[#0F3B2E] hover:bg-[#0A2A21] disabled:bg-[#E4DFD1] text-[#F8F4EA] font-semibold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} />
          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </button>

        <button
          type="button"
          onClick={handleOrderOnWhatsApp}
          disabled={isOutOfStock}
          className="flex-1 py-2.5 px-2 min-h-[44px] rounded-[10px] bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-[#E4DFD1] text-white font-semibold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1"
        >
          <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
