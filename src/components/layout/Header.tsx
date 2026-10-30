/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { siteConfig } from '../../config/site';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  LogOut,
  PackageCheck,
  LayoutDashboard,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
  onSearchSelect?: (productId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  onSearchSelect,
}) => {
  const {
    cart,
    wishlist,
    currentUser,
    loginAs,
    logout,
    setIsAdvisorOpen,
    products,
    activeCategories,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishItemCount = wishlist.length;

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.is_active &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const handleSelectSearchResult = (productId: string) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    if (onSearchSelect) {
      onSearchSelect(productId);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden md:inline text-emerald-300">
            🇵🇰 Nationwide Delivery Across 200+ Pakistani Cities
          </span>
          <span className="mx-auto md:mx-0 font-semibold tracking-wide">
            Free Delivery On All Orders · 100% Cash on Delivery (COD) · Open Parcel Verification
          </span>
          <span className="hidden md:inline text-emerald-300">
            Helpline: {siteConfig.support.whatsappDisplay}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-zinc-700 hover:text-emerald-900 rounded-lg hover:bg-zinc-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <button
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className="flex flex-col text-left group focus:outline-hidden"
          >
            <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors">
              {siteConfig.name}
            </span>
            <span className="text-[10px] tracking-wider text-emerald-800 font-semibold uppercase -mt-0.5">
              {siteConfig.tagline}
            </span>
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                placeholder="Search kurtas, lawn suits, pure attar, earbuds, wallets..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-300 rounded-full text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onMouseDown={() => handleSelectSearchResult(product.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-3 border-b border-zinc-100 last:border-0 transition-colors"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
                      <p className="text-xs text-emerald-800 font-semibold">
                        Rs. {product.base_price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* AI Advisor Button */}
            <button
              onClick={() => setIsAdvisorOpen(true)}
              aria-label="Khayr AI Advisor"
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300/60 text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              <span className="hidden sm:inline">Khayr AI</span>
            </button>

            {/* Role Switcher Demo Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : currentUser?.role === 'customer'
                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
                title="Switch role for evaluation"
              >
                <span className="hidden sm:inline">
                  {currentUser?.role === 'admin'
                    ? '👑 Admin (Owner)'
                    : currentUser?.role === 'customer'
                    ? '👤 Customer'
                    : '🌐 Guest'}
                </span>
                <span className="sm:hidden">
                  {currentUser?.role === 'admin'
                    ? '👑'
                    : currentUser?.role === 'customer'
                    ? '👤'
                    : '🌐'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                    Demo Role Switcher
                  </div>
                  <button
                    onClick={() => {
                      loginAs('guest');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-50 flex items-center justify-between"
                  >
                    <span>Browse as Guest</span>
                    {!currentUser && <span className="text-emerald-700 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      loginAs('customer');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-50 flex items-center justify-between"
                  >
                    <span>Customer (Hassan Ali)</span>
                    {currentUser?.role === 'customer' && <span className="text-emerald-700 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      loginAs('admin');
                      setIsUserDropdownOpen(false);
                      setCurrentTab('admin');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-50 text-amber-900 flex items-center justify-between font-medium"
                  >
                    <span>Store Owner (Admin)</span>
                    {currentUser?.role === 'admin' && <span className="text-emerald-700 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Admin Panel Direct Link (if admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  currentTab === 'admin'
                    ? 'bg-amber-900 text-white'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => {
                if (!currentUser) {
                  openAuthModal();
                } else {
                  setCurrentTab('account-wishlist');
                }
              }}
              aria-label={`Wishlist (${wishItemCount} items)`}
              className="relative p-2 text-zinc-700 hover:text-emerald-900 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishItemCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCurrentTab('cart')}
              aria-label={`Cart (${cartItemCount} items)`}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                currentTab === 'cart'
                  ? 'bg-emerald-900 text-white'
                  : 'bg-emerald-950 text-white hover:bg-emerald-900'
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
              <span className="font-semibold text-xs hidden sm:inline">Cart</span>
              <span className="bg-emerald-800 text-emerald-200 text-xs px-1.5 py-0.5 rounded-md font-bold">
                {cartItemCount}
              </span>
            </button>

            {/* Account Profile / Login Button */}
            {currentUser ? (
              <div className="relative group">
                <button
                  onClick={() => setCurrentTab('account')}
                  className="p-2 text-zinc-700 hover:text-emerald-900 rounded-lg hover:bg-zinc-100"
                  aria-label="Account Settings"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="hidden sm:inline-flex text-xs font-semibold text-emerald-950 hover:text-emerald-800 px-3 py-2 rounded-lg hover:bg-zinc-100 border border-zinc-300"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Secondary Navigation Row (Desktop) */}
        <nav className="hidden md:flex items-center justify-between border-t border-zinc-100 py-2.5 text-sm font-medium">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('home')}
              className={`hover:text-emerald-900 transition-colors ${
                currentTab === 'home' ? 'text-emerald-900 font-bold border-b-2 border-emerald-900 pb-0.5' : 'text-zinc-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab('shop')}
              className={`hover:text-emerald-900 transition-colors ${
                currentTab === 'shop' ? 'text-emerald-900 font-bold border-b-2 border-emerald-900 pb-0.5' : 'text-zinc-700'
              }`}
            >
              Shop All
            </button>

            {/* Category Quick Links */}
            {activeCategories.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCurrentTab(`category-${cat.slug}`)}
                className={`hover:text-emerald-900 transition-colors ${
                  currentTab === `category-${cat.slug}`
                    ? 'text-emerald-900 font-bold border-b-2 border-emerald-900 pb-0.5'
                    : 'text-zinc-600'
                }`}
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => setCurrentTab('track-order')}
              className={`hover:text-emerald-900 transition-colors flex items-center gap-1 ${
                currentTab === 'track-order'
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-900 pb-0.5'
                  : 'text-zinc-700'
              }`}
            >
              <PackageCheck className="w-4 h-4 text-emerald-700" />
              Track Order
            </button>
          </div>

          <div className="flex items-center gap-5 text-xs text-zinc-500">
            <button onClick={() => setCurrentTab('about')} className="hover:text-zinc-900">
              About
            </button>
            <button onClick={() => setCurrentTab('contact')} className="hover:text-zinc-900">
              Contact & WhatsApp
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200 px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-sm"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>

          {searchResults.length > 0 && (
            <div className="bg-zinc-50 rounded-xl p-2 space-y-1">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    handleSelectSearchResult(p.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs font-medium text-zinc-800 flex justify-between"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="text-emerald-700">Rs. {p.base_price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                setCurrentTab('home');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left rounded-lg bg-zinc-50 text-zinc-800 font-medium text-sm"
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentTab('shop');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left rounded-lg bg-zinc-50 text-zinc-800 font-medium text-sm"
            >
              All Products
            </button>
            <button
              onClick={() => {
                setCurrentTab('track-order');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left rounded-lg bg-zinc-50 text-emerald-950 font-medium text-sm flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4 text-emerald-700" />
              Track Order
            </button>
            <button
              onClick={() => {
                setIsAdvisorOpen(true);
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left rounded-lg bg-emerald-50 text-emerald-900 font-semibold text-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Khayr Advisor
            </button>
          </div>

          <div className="border-t border-zinc-100 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Categories
            </p>
            <div className="space-y-1">
              {activeCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCurrentTab(`category-${c.slug}`);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-1 text-sm text-zinc-700 hover:text-emerald-900"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-3 flex items-center justify-between text-xs">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => {
                    setCurrentTab('account');
                    setMobileMenuOpen(false);
                  }}
                  className="font-medium text-emerald-950"
                >
                  My Account ({currentUser.full_name})
                </button>
                <button onClick={logout} className="text-rose-600 flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-emerald-900 text-white font-semibold rounded-xl text-center"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
