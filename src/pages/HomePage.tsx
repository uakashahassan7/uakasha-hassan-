/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { TrustStrip } from '../components/common/TrustStrip';
import { ProductCard } from '../components/shop/ProductCard';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ArrowRight, ChevronRight, CheckCircle2, Sparkles, Tag } from 'lucide-react';

interface HomePageProps {
  onSelectProduct?: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
  openAuthModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onNavigateTab,
  openAuthModal,
}) => {
  const navigate = useNavigate();
  const { activeProducts, activeCategories, applyCouponCode } = useStore();

  const handleNavigate = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      if (tab === 'shop') navigate('/shop');
      else if (tab.startsWith('category-')) navigate(`/category/${tab.replace('category-', '')}`);
      else if (tab === 'track-order') navigate('/track-order');
      else navigate('/');
    }
  };

  const handleSelectProduct = (id: string) => {
    if (onSelectProduct) {
      onSelectProduct(id);
    } else {
      const prod = activeProducts.find((p) => p.id === id);
      navigate(prod ? `/product/${prod.slug}` : `/product/${id}`);
    }
  };

  const featuredProducts = activeProducts.filter((p) => p.is_featured).slice(0, 4);
  const newArrivals = [...activeProducts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F3EAD2]/50 via-[#F8F4EA] to-[#F8F4EA] border-b border-[#E4DFD1]/80">
        {/* Subtle Decorative Arch & Leaf Ornament in background */}
        <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center overflow-hidden">
          <svg width="800" height="600" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 600V300C100 134.315 234.315 0 400 0C565.685 0 700 134.315 700 300V600"
              stroke="#B8963E"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              opacity="0.35"
            />
            <path
              d="M180 600V320C180 198.497 278.497 100 400 100C521.503 100 620 198.497 620 320V600"
              stroke="#0F3B2E"
              strokeWidth="1"
              opacity="0.15"
            />
            {/* Small gold star & leaf motif */}
            <circle cx="400" cy="50" r="4" fill="#B8963E" opacity="0.6" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6EFEA] border border-[#0F3B2E]/20 text-[#0F3B2E] text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#B8963E]" />
                <span className="tracking-wide">Quality · Fast Delivery · Trust · Khayr</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[#0F3B2E] leading-[1.12]">
                Elegance, Craft &amp; <br />
                <span className="italic font-normal text-[#B8963E]">Khayr</span> at Your Doorstep
              </h1>

              <p className="text-base sm:text-lg text-[#6B6B66] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover refined stitched apparel, unadulterated artisanal attars, genuine leather, and curated essentials. Nationwide free delivery with 100% Cash on Delivery.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => handleNavigate('shop')}
                  className="w-full sm:w-auto px-8 py-3.5 min-h-[44px] rounded-[10px] bg-[#0F3B2E] hover:bg-[#0A2A21] text-[#F8F4EA] font-semibold text-sm shadow-[0_4px_20px_rgba(15,59,46,0.18)] transition-all flex items-center justify-center gap-2 group"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 text-[#B8963E] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleNavigate('track-order')}
                  className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] rounded-[10px] bg-white hover:bg-[#F8F4EA] text-[#0F3B2E] border border-[#E4DFD1] font-semibold text-sm shadow-xs transition-all"
                >
                  Track Your Parcel
                </button>
              </div>

              {/* Micro Trust badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#6B6B66]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" strokeWidth={1.5} /> Free Delivery Nationwide
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" strokeWidth={1.5} /> 100% Cash on Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" strokeWidth={1.5} /> Open Parcel Verification
                </span>
              </div>
            </div>

            {/* Right Hero Showcase Card */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative rounded-[16px] overflow-hidden shadow-[0_10px_30px_rgba(15,59,46,0.15)] border border-[#E4DFD1] aspect-4/3 group bg-[#F8F4EA]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"
                  alt="BARVAKA Featured Artisan Apparel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2A21]/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-[11px] uppercase tracking-widest text-[#B8963E] font-bold">
                    Signature Edition
                  </p>
                  <p className="font-serif text-xl font-bold text-[#F8F4EA]">
                    Crafted for Dignity &amp; Grace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip: 4 items with gold line icons */}
      <TrustStrip />

      {/* Category Grid (rounded-square / circular images) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-[#B8963E] tracking-wider uppercase">
              Curated Departments
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3B2E] mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => handleNavigate('shop')}
            className="text-xs font-semibold text-[#0F3B2E] hover:text-[#B8963E] flex items-center gap-1 transition-colors"
          >
            All Departments <ChevronRight className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {activeCategories.map((category) => {
            const count = activeProducts.filter((p) => p.category_id === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => handleNavigate(`category-${category.slug}`)}
                className="group relative rounded-[12px] overflow-hidden aspect-square border border-[#E4DFD1] shadow-[0_4px_20px_rgba(15,59,46,0.04)] hover:shadow-[0_10px_25px_rgba(15,59,46,0.1)] transition-all text-left flex flex-col justify-end p-3.5 bg-[#F8F4EA]"
              >
                <ImageWithFallback
                  src={category.image_url}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="relative z-10 text-white">
                  <h3 className="font-serif font-bold text-sm sm:text-base leading-tight group-hover:text-[#F3EAD2] transition-colors">
                    {category.name}
                  </h3>
                  <span className="text-[11px] text-[#F8F4EA]/80 mt-0.5 block font-sans">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Products: 2 columns mobile, 3 tablet, 4 desktop */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-[#B8963E] tracking-wider uppercase">
              Handpicked Craft
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3B2E] mt-1">
              Featured Products
            </h2>
          </div>
          <button
            onClick={() => handleNavigate('shop')}
            className="text-xs font-semibold text-[#0F3B2E] hover:text-[#B8963E] flex items-center gap-1 transition-colors"
          >
            View More <ChevronRight className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={handleSelectProduct}
              openAuthModal={openAuthModal}
            />
          ))}
        </div>
      </section>

      {/* Promotional Closing Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] bg-[#0F3B2E] text-[#F8F4EA] p-6 sm:p-10 relative overflow-hidden border border-[#0A2A21] shadow-[0_10px_30px_rgba(15,59,46,0.18)] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Subtle gold arch decoration */}
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none translate-x-12 translate-y-12">
            <svg width="320" height="320" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" stroke="#B8963E" strokeWidth="2" strokeDasharray="4 6" />
              <path d="M50 150V80C50 52 72 30 100 30C128 30 150 52 150 80V150" stroke="#B8963E" strokeWidth="2" />
            </svg>
          </div>

          <div className="space-y-2.5 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A2A21] border border-[#B8963E]/40 text-[#B8963E] text-xs font-semibold">
              <Tag className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} />
              <span>Inaugural Khayr Blessing</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F4EA]">
              Save 10% Extra on Your First Purchase
            </h3>
            <p className="text-[#E6EFEA]/80 text-xs sm:text-sm max-w-lg leading-relaxed">
              Use code <strong className="text-[#F8F4EA] font-mono bg-[#0A2A21] px-2 py-0.5 rounded-sm border border-[#B8963E]/40">WELCOME10</strong> during checkout on orders of Rs. 2,000 or more.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => {
                applyCouponCode('WELCOME10');
                handleNavigate('shop');
              }}
              className="px-6 py-3 min-h-[44px] rounded-[10px] bg-[#B8963E] hover:bg-[#B8963E]/90 text-[#0A2A21] font-bold text-xs shadow-md transition-colors"
            >
              Apply WELCOME10 &amp; Shop
            </button>
          </div>
        </div>
      </section>

      {/* New Arrivals: 2 columns mobile, 3 tablet, 4 desktop */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-[#B8963E] tracking-wider uppercase">
              Fresh in Collection
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3B2E] mt-1">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => handleNavigate('shop')}
            className="text-xs font-semibold text-[#0F3B2E] hover:text-[#B8963E] flex items-center gap-1 transition-colors"
          >
            See All <ChevronRight className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={handleSelectProduct}
              openAuthModal={openAuthModal}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
