/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { ToastContainer } from '../common/ToastContainer';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Tag,
  Users,
  Store,
  LogOut,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { profile, signOut, isDemoMode, switchDemoRole } = useAuth();
  const { logout, showToast } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // 30-minute inactivity auto-logout
  const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const lastActivityRef = React.useRef<number>(Date.now());

  const handleAdminLogout = React.useCallback(
    async (reason?: string) => {
      logout();
      await signOut();
      showToast(reason || 'Admin logged out successfully', 'info');
      navigate('/admin/login', { replace: true });
    },
    [logout, signOut, showToast, navigate]
  );

  React.useEffect(() => {
    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, recordActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        handleAdminLogout('Session expired after 30 minutes of inactivity.');
      }
    }, 15000); // Check every 15 seconds

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, recordActivity));
      clearInterval(checkInterval);
    };
  }, [handleAdminLogout]);

  const navItems = [
    { to: '/admin', label: 'Dashboard & Sales', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Orders & Dispatch', icon: ShoppingBag },
    { to: '/admin/products', label: 'Products & Stock', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Layers },
    { to: '/admin/coupons', label: 'Discount Coupons', icon: Tag },
    { to: '/admin/customers', label: 'Customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EA] flex flex-col font-sans text-[#1C1C1C]">
      <ToastContainer />
      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="bg-[#B8963E] text-[#0A2A21] px-4 py-1.5 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-[#B8963E]/80">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
          <span>Demo mode active — full admin permissions enabled</span>
          <button
            onClick={() => switchDemoRole('customer')}
            className="underline ml-2 hover:text-black font-bold"
          >
            (Switch to Customer View)
          </button>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="bg-[#0A2A21] text-[#F8F4EA] border-b border-[#0F3B2E] px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-[#E6EFEA] hover:text-white rounded-[8px]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
          </button>

          <Link to="/admin" className="flex items-center gap-2.5">
            <Logo variant="light" size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#B8963E]/20 text-[#B8963E] border border-[#B8963E]/30 hidden sm:inline-block">
              Store Owner Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-[10px] bg-[#0F3B2E] hover:bg-[#0F3B2E]/80 text-[#F8F4EA] border border-[#B8963E]/40 font-medium transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} /> Storefront
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="text-[#E6EFEA]/80 hidden sm:inline">
              {profile?.full_name || 'Admin'}
            </span>
            <button
              onClick={() => handleAdminLogout()}
              className="p-2 text-[#E6EFEA]/80 hover:text-[#B3372F] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Shell Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Deep Emerald Sidebar */}
        <aside
          className={`w-full md:w-64 bg-[#0F3B2E] text-[#E6EFEA] border-r border-[#0A2A21] p-4 flex flex-col shrink-0 ${
            mobileMenuOpen ? 'block' : 'hidden md:flex'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#B8963E] px-3 py-2">
            Store Management
          </div>

          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-[10px] text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#0A2A21] text-[#F8F4EA] border border-[#B8963E]/40 shadow-xs'
                        : 'text-[#E6EFEA]/80 hover:bg-[#0A2A21]/60 hover:text-[#F8F4EA]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Visible Sidebar Logout Button */}
          <div className="pt-4 mt-6 border-t border-[#0A2A21]/80">
            <button
              type="button"
              onClick={() => handleAdminLogout()}
              className="w-full flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-[10px] text-xs font-semibold text-[#E6EFEA] bg-[#0A2A21]/50 hover:bg-[#B3372F] hover:text-white border border-[#E6EFEA]/10 hover:border-[#B3372F] transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4 text-[#B8963E] group-hover:text-white" strokeWidth={1.5} />
              <span>Logout Admin</span>
            </button>
            <p className="text-[10px] text-[#E6EFEA]/50 text-center mt-2">
              Auto log-out after 30m idle
            </p>
          </div>
        </aside>

        {/* Clean Light Dashboard Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
