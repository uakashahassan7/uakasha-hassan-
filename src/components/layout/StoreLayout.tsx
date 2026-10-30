/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useCategories, useProducts } from '../../hooks/useStoreData';
import { siteConfig } from '../../config/site';
import { Footer } from './Footer';
import { Logo } from '../common/Logo';
import { KhayrAdvisorModal } from '../advisor/KhayrAdvisorModal';
import { ToastContainer } from '../common/ToastContainer';
import { FloatingWhatsAppButton } from '../common/FloatingWhatsAppButton';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  PackageCheck,
  LogOut,
  AlertCircle,
} from 'lucide-react';

export const StoreLayout: React.FC = () => {
  const { profile, isAdmin, isDemoMode, switchDemoRole, signOut } = useAuth();
  const { loginAs, isAdvisorOpen, setIsAdvisorOpen, cart, isWishlistLoginModalOpen, closeWishlistLoginModal, showToast, logout, activeCategories, activeProducts } = useStore();
  const { itemCount: rawItemCount } = useCart();
  const { data: remoteCategories = [] } = useCategories();
  const { data: remoteProducts = [] } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();

  const categories = remoteCategories.length > 0 ? remoteCategories : activeCategories;
  const allProducts = remoteProducts.length > 0 ? remoteProducts : activeProducts;

  useEffect(() => {
    if (location.state && (location.state as any).accessDenied) {
      showToast('Access denied', 'error');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, showToast, navigate, location.pathname]);

  const totalCartCount = cart.length > 0 ? cart.reduce((sum, item) => sum + item.quantity, 0) : rawItemCount;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const searchResults = searchQuery.trim()
    ? allProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSelectSearch = (slug: string) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    navigate(`/product/${slug}`);
  };

  const handleSignOut = () => {
    logout();
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F4EA] text-[#1C1C1C] font-sans antialiased selection:bg-[#0F3B2E] selection:text-[#F8F4EA]">
      <ToastContainer />
      {isAdvisorOpen && <KhayrAdvisorModal />}

      {/* Guest Wishlist Prompt Modal */}
      {isWishlistLoginModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-[12px] shadow-[0_10px_30px_rgba(15,59,46,0.2)] border border-[#E4DFD1] max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-[#B3372F]/10 text-[#B3372F] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-7 h-7 fill-[#B3372F]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0F3B2E]">
                Please sign in to save items
              </h3>
              <p className="text-xs text-[#6B6B66] mt-1.5 leading-relaxed">
                Sign in to your account to save products to your personal wishlist and view them on any device.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login?redirect=/wishlist"
                onClick={closeWishlistLoginModal}
                className="w-full py-3 min-h-[44px] bg-[#0F3B2E] hover:bg-[#0A2A21] text-[#F8F4EA] font-semibold text-xs rounded-[10px] shadow-sm transition-colors block text-center"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={closeWishlistLoginModal}
                className="w-full py-2.5 min-h-[44px] text-[#6B6B66] hover:text-[#1C1C1C] text-xs font-semibold rounded-[10px] hover:bg-[#F8F4EA] transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="bg-[#B8963E] text-[#0A2A21] px-3 py-1.5 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-[#B8963E]/80">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
          <span>Demo mode active — test user accounts & order workflows</span>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-[#0A2A21] text-[#E6EFEA] text-xs py-2 px-4 border-b border-[#0F3B2E] text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden md:inline text-[#B8963E]">
            🇵🇰 Nationwide Free Delivery Across 200+ Pakistani Cities
          </span>
          <span className="mx-auto md:mx-0 font-semibold tracking-wide">
            Free Delivery on All Orders · 100% Cash on Delivery · Open Parcel Verification
          </span>
          <span className="hidden md:inline text-[#B8963E]">
            WhatsApp: {siteConfig.support.whatsappDisplay}
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E4DFD1] shadow-[0_4px_20px_rgba(15,59,46,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-[#0F3B2E] hover:bg-[#F8F4EA] rounded-[10px] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
            </button>

            {/* Brand Logo Component (Header logo height 36-44px) */}
            <Link to="/" className="group flex items-center focus:outline-hidden">
              <Logo variant="dark" size="md" showTagline={true} />
            </Link>

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
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4DFD1] rounded-[10px] text-xs text-[#1C1C1C] placeholder:text-[#6B6B66] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E] focus:border-[#0F3B2E] transition-all"
                />
                <Search className="w-4 h-4 text-[#B8963E] absolute left-3.5 top-3" strokeWidth={1.5} />
              </div>

              {/* Autocomplete Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] shadow-[0_10px_30px_rgba(15,59,46,0.12)] border border-[#E4DFD1] overflow-hidden z-50">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onMouseDown={() => handleSelectSearch(product.slug)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F8F4EA] flex items-center gap-3 border-b border-[#E4DFD1]/50 last:border-0 transition-colors"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-[8px] border border-[#E4DFD1]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1C1C1C] truncate">{product.name}</p>
                        <p className="text-xs text-[#0F3B2E] font-bold">
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
                className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[10px] bg-[#E6EFEA] text-[#0F3B2E] hover:bg-[#0F3B2E] hover:text-[#F8F4EA] border border-[#0F3B2E]/20 text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} />
                <span className="hidden sm:inline">Khayr AI</span>
              </button>

              {/* Demo Role Switcher */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 min-h-[44px] rounded-[10px] border text-xs font-medium transition-colors ${
                    isAdmin
                      ? 'bg-[#F3EAD2] text-[#0F3B2E] border-[#B8963E]'
                      : profile
                      ? 'bg-[#E6EFEA] text-[#0F3B2E] border-[#0F3B2E]/30'
                      : 'bg-white text-[#6B6B66] border-[#E4DFD1]'
                  }`}
                  title="Switch role for evaluation"
                >
                  <span className="hidden sm:inline">
                    {isAdmin
                      ? '👑 Admin (Owner)'
                      : profile
                      ? `👤 ${profile.full_name}`
                      : '🌐 Guest'}
                  </span>
                  <span className="sm:hidden">
                    {isAdmin ? '👑' : profile ? '👤' : '🌐'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#B8963E]" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-[12px] shadow-[0_10px_30px_rgba(15,59,46,0.15)] border border-[#E4DFD1] py-1.5 z-50 text-xs">
                    <div className="px-3 py-1.5 text-[#6B6B66] uppercase tracking-wider text-[10px] font-bold border-b border-[#E4DFD1]/60">
                      Demo Role Switcher
                    </div>
                    <button
                      onClick={() => {
                        switchDemoRole('guest');
                        loginAs('guest');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#F8F4EA] flex items-center justify-between"
                    >
                      <span>Browse as Guest</span>
                      {!profile && <span className="text-[#0F3B2E] font-bold">✓</span>}
                    </button>
                    <button
                      onClick={() => {
                        switchDemoRole('customer');
                        loginAs('customer');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#F8F4EA] flex items-center justify-between"
                    >
                      <span>Customer (Hassan Ali)</span>
                      {profile && !isAdmin && <span className="text-[#0F3B2E] font-bold">✓</span>}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#F8F4EA] text-[#0F3B2E] flex items-center justify-between font-semibold"
                      >
                        <span>Store Owner (Admin)</span>
                        <span className="text-[#0F3B2E] font-bold">✓</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Admin Panel Direct Link (if admin) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[10px] text-xs font-semibold bg-[#F3EAD2] text-[#0F3B2E] border border-[#B8963E]/40 hover:bg-[#B8963E] hover:text-[#F8F4EA] transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Admin
                </Link>
              )}

              {/* Wishlist */}
              <Link
                to={profile ? '/wishlist' : '/login?redirect=/wishlist'}
                aria-label="Wishlist"
                className="relative p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#0F3B2E] hover:bg-[#F8F4EA] rounded-[10px] transition-colors"
              >
                <Heart className="w-5 h-5 text-[#0F3B2E]" strokeWidth={1.5} />
              </Link>

              {/* Cart Button */}
              <Link
                to="/cart"
                aria-label={`Cart (${totalCartCount} items)`}
                className="relative flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-[10px] bg-[#0F3B2E] text-[#F8F4EA] hover:bg-[#0A2A21] shadow-xs transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
                <span className="font-semibold text-xs hidden sm:inline">Cart</span>
                <span className="bg-[#B8963E] text-[#0A2A21] text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalCartCount}
                </span>
              </Link>

              {/* User Account / Sign In */}
              {profile ? (
                <Link
                  to="/account"
                  className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#0F3B2E] hover:bg-[#F8F4EA] rounded-[10px] transition-colors"
                  aria-label="Account Settings"
                >
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center text-xs font-semibold text-[#0F3B2E] hover:bg-[#E6EFEA] px-3.5 py-2.5 min-h-[44px] rounded-[10px] border border-[#0F3B2E] transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Secondary Navigation Row (Desktop) */}
          <nav className="hidden md:flex items-center justify-between border-t border-[#E4DFD1]/70 py-2.5 text-xs font-medium">
            <div className="flex items-center gap-7">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive ? 'text-[#0F3B2E] font-bold border-b-2 border-[#0F3B2E] pb-0.5' : 'text-[#6B6B66] hover:text-[#0F3B2E]'
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive ? 'text-[#0F3B2E] font-bold border-b-2 border-[#0F3B2E] pb-0.5' : 'text-[#6B6B66] hover:text-[#0F3B2E]'
                  }`
                }
              >
                Shop All
              </NavLink>

              {/* Category Quick Links */}
              {categories.slice(0, 4).map((cat) => (
                <NavLink
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? 'text-[#0F3B2E] font-bold border-b-2 border-[#0F3B2E] pb-0.5' : 'text-[#6B6B66] hover:text-[#0F3B2E]'
                    }`
                  }
                >
                  {cat.name}
                </NavLink>
              ))}

              <NavLink
                to="/track-order"
                className={({ isActive }) =>
                  `transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-[#0F3B2E] font-bold border-b-2 border-[#0F3B2E] pb-0.5' : 'text-[#6B6B66] hover:text-[#0F3B2E]'
                  }`
                }
              >
                <PackageCheck className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} />
                Track Order
              </NavLink>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#6B6B66]">
              <Link to="/about" className="hover:text-[#0F3B2E] transition-colors">
                About BARVAKA
              </Link>
              <Link to="/contact" className="hover:text-[#0F3B2E] transition-colors">
                Contact & Support
              </Link>
            </div>
          </nav>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E4DFD1] px-4 pt-3 pb-6 space-y-4 shadow-xl">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#F8F4EA] border border-[#E4DFD1] rounded-[10px] text-xs text-[#1C1C1C]"
              />
              <Search className="w-4 h-4 text-[#B8963E] absolute left-3 top-3" strokeWidth={1.5} />
            </div>

            {searchResults.length > 0 && (
              <div className="bg-[#F8F4EA] rounded-[10px] p-2 space-y-1">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      handleSelectSearch(p.slug);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs font-medium text-[#1C1C1C] flex justify-between"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[#0F3B2E] font-bold">Rs. {p.base_price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-left rounded-[10px] bg-[#F8F4EA] text-[#0F3B2E] font-medium text-xs min-h-[44px] flex items-center"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-left rounded-[10px] bg-[#F8F4EA] text-[#0F3B2E] font-medium text-xs min-h-[44px] flex items-center"
              >
                All Products
              </Link>
              <Link
                to="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-left rounded-[10px] bg-[#F8F4EA] text-[#0F3B2E] font-medium text-xs flex items-center gap-1.5 min-h-[44px]"
              >
                <PackageCheck className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
                Track Order
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-left rounded-[10px] bg-[#E6EFEA] text-[#0F3B2E] font-semibold text-xs flex items-center gap-1.5 min-h-[44px]"
              >
                <ShoppingBag className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
                Cart ({totalCartCount})
              </Link>
            </div>

            <div className="border-t border-[#E4DFD1] pt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B66] mb-2">
                Departments
              </p>
              <div className="space-y-1">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/category/${c.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-xs text-[#1C1C1C] hover:text-[#0F3B2E]"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E4DFD1] pt-3 flex items-center justify-between text-xs">
              {profile ? (
                <div className="flex items-center justify-between w-full">
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-medium text-[#0F3B2E]"
                  >
                    My Account ({profile.full_name})
                  </Link>
                  <button onClick={handleSignOut} className="text-[#B3372F] flex items-center gap-1">
                    <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 min-h-[44px] bg-[#0F3B2E] text-[#F8F4EA] font-semibold rounded-[10px] text-center block"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating WhatsApp Quick Support (Public & Customer Pages) */}
      <FloatingWhatsAppButton />

      {/* Footer with Dark Emerald and Light Logo */}
      <Footer setCurrentTab={(tab) => {
        if (tab === 'home') navigate('/');
        else if (tab === 'shop') navigate('/shop');
        else if (tab === 'track-order') navigate('/track-order');
        else if (tab === 'about') navigate('/about');
        else if (tab === 'contact') navigate('/contact');
        else if (tab === 'admin') navigate('/admin');
      }} />
    </div>
  );
};
