/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/shop/ProductCard';
import { Search, Filter, SlidersHorizontal, RotateCcw, X, Check } from 'lucide-react';

interface ShopPageProps {
  initialCategorySlug?: string;
  onSelectProduct?: (id: string) => void;
  openAuthModal?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategorySlug,
  onSelectProduct,
  openAuthModal,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { activeProducts, activeCategories } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategorySlug || slug || 'all'
  );

  useEffect(() => {
    if (slug) {
      setSelectedCategory(slug);
    } else if (initialCategorySlug) {
      setSelectedCategory(initialCategorySlug);
    }
  }, [slug, initialCategorySlug]);

  const handleSelectProduct = (id: string) => {
    if (onSelectProduct) {
      onSelectProduct(id);
    } else {
      const target = activeProducts.find((p) => p.id === id);
      navigate(target ? `/product/${target.slug}` : `/product/${id}`);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'featured'>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return activeProducts
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const cat = activeCategories.find((c) => c.slug === selectedCategory);
          if (cat && product.category_id !== cat.id) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        // Price range
        if (product.base_price < minPrice || product.base_price > maxPrice) {
          return false;
        }

        // In-stock only
        if (inStockOnly) {
          const totalStock = product.variants.reduce((sum, v) => sum + v.stock_quantity, 0);
          if (totalStock <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.base_price - b.base_price;
        if (sortBy === 'price-desc') return b.base_price - a.base_price;
        if (sortBy === 'featured') return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [
    activeProducts,
    activeCategories,
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(15000);
    setInStockOnly(false);
    setSortBy('newest');
  };

  const isFiltered =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    minPrice > 0 ||
    maxPrice < 15000 ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Sticky Filter Bar */}
      <div className="sticky top-20 z-30 bg-[#F8F4EA]/95 backdrop-blur-md border border-[#E4DFD1] rounded-[12px] p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(15,59,46,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3B2E]">
            {selectedCategory === 'all'
              ? 'Catalog'
              : activeCategories.find((c) => c.slug === selectedCategory)?.name || 'Catalog'}
          </h1>
          <p className="text-xs text-[#6B6B66] mt-0.5">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} · Free Delivery Nationwide
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] border border-[#E4DFD1] rounded-[10px] text-xs font-semibold bg-white text-[#0F3B2E] shadow-xs"
          >
            <Filter className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
            Filters {isFiltered && '(Active)'}
          </button>

          {/* Quick Category Tabs (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#0F3B2E] text-[#F8F4EA]'
                  : 'bg-white text-[#6B6B66] border border-[#E4DFD1] hover:text-[#0F3B2E]'
              }`}
            >
              All
            </button>
            {activeCategories.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === c.slug
                    ? 'bg-[#0F3B2E] text-[#F8F4EA]'
                    : 'bg-white text-[#6B6B66] border border-[#E4DFD1] hover:text-[#0F3B2E]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <span className="text-xs text-[#6B6B66] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-medium bg-white border border-[#E4DFD1] rounded-[10px] px-3 py-2.5 min-h-[44px] text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden md:block space-y-6">
          <div className="bg-white p-5 rounded-[12px] border border-[#E4DFD1] shadow-[0_4px_20px_rgba(15,59,46,0.04)] space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4DFD1] pb-3">
              <h3 className="font-serif text-base font-bold text-[#0F3B2E] flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} /> Filter Products
              </h3>
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#B8963E] hover:text-[#0F3B2E] font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-xs font-semibold text-[#1C1C1C] block mb-2 uppercase tracking-wider">
                Keyword Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Kurta, Attar, Leather..."
                  className="w-full text-xs px-3 py-2.5 bg-white border border-[#E4DFD1] rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-3 text-[#6B6B66] hover:text-[#1C1C1C]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-semibold text-[#1C1C1C] block mb-2 uppercase tracking-wider">
                Department
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-[8px] text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#0F3B2E] text-[#F8F4EA] font-bold'
                      : 'text-[#6B6B66] hover:bg-[#F8F4EA] hover:text-[#0F3B2E]'
                  }`}
                >
                  All Categories ({activeProducts.length})
                </button>
                {activeCategories.map((c) => {
                  const count = activeProducts.filter((p) => p.category_id === c.id).length;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full text-left px-3 py-2 rounded-[8px] text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === c.slug
                          ? 'bg-[#0F3B2E] text-[#F8F4EA] font-bold'
                          : 'text-[#6B6B66] hover:bg-[#F8F4EA] hover:text-[#0F3B2E]'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[11px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-semibold text-[#1C1C1C] block mb-2 uppercase tracking-wider">
                Max Price: Rs. {maxPrice.toLocaleString()}
              </label>
              <input
                type="range"
                min="500"
                max="15000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0F3B2E]"
              />
              <div className="flex justify-between text-[11px] text-[#6B6B66] mt-1">
                <span>Rs. 500</span>
                <span>Rs. 15,000</span>
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-2 border-t border-[#E4DFD1]">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#1C1C1C]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-sm accent-[#0F3B2E] w-4 h-4"
                />
                <span>In-Stock Items Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area: 2 columns mobile, 3 tablet, 3-4 desktop */}
        <main className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-[12px] border border-[#E4DFD1] p-12 text-center space-y-4 shadow-[0_4px_20px_rgba(15,59,46,0.04)]">
              <div className="w-12 h-12 bg-[#F8F4EA] rounded-full flex items-center justify-center mx-auto text-[#B8963E]">
                <Search className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F3B2E]">
                No items match your selected filters
              </h3>
              <p className="text-xs text-[#6B6B66] max-w-sm mx-auto">
                Try widening your price range, searching for different keywords, or selecting another department.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 min-h-[44px] rounded-[10px] bg-[#0F3B2E] text-[#F8F4EA] font-semibold text-xs hover:bg-[#0A2A21] transition-colors shadow-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleSelectProduct}
                  openAuthModal={openAuthModal}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-t-[20px] sm:rounded-[16px] max-h-[85vh] p-6 space-y-6 overflow-y-auto shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-[#E4DFD1] pb-4">
              <h3 className="font-serif text-lg font-bold text-[#0F3B2E]">Filter Catalog</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-[#6B6B66] hover:text-[#1C1C1C]"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <p className="text-xs font-semibold uppercase text-[#6B6B66] mb-2 tracking-wider">
                Department
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left p-2.5 rounded-[8px] text-xs ${
                    selectedCategory === 'all'
                      ? 'bg-[#0F3B2E] text-[#F8F4EA] font-bold'
                      : 'text-[#1C1C1C] hover:bg-[#F8F4EA]'
                  }`}
                >
                  All Categories ({activeProducts.length})
                </button>
                {activeCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left p-2.5 rounded-[8px] text-xs ${
                      selectedCategory === c.slug
                        ? 'bg-[#0F3B2E] text-[#F8F4EA] font-bold'
                        : 'text-[#1C1C1C] hover:bg-[#F8F4EA]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <p className="text-xs font-semibold uppercase text-[#6B6B66] mb-2 tracking-wider">
                Max Price: Rs. {maxPrice.toLocaleString()}
              </p>
              <input
                type="range"
                min="500"
                max="15000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0F3B2E]"
              />
            </div>

            <div className="pt-4 border-t border-[#E4DFD1] flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 min-h-[44px] border border-[#0F3B2E] rounded-[10px] text-xs font-semibold text-[#0F3B2E]"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 min-h-[44px] bg-[#0F3B2E] rounded-[10px] text-xs font-semibold text-[#F8F4EA]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
