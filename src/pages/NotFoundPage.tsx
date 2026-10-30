/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, HelpCircle } from 'lucide-react';
import { siteConfig } from '../config/site';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 bg-[#E6EFEA] text-[#0F3B2E] rounded-[16px] flex items-center justify-center mx-auto border border-[#0F3B2E]/20 shadow-xs">
        <HelpCircle className="w-10 h-10 text-[#B8963E]" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B8963E]">
          404 Not Found
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F3B2E]">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B66] max-w-md mx-auto leading-relaxed">
          The page or product you were looking for doesn't exist or has been relocated. Explore our curated collections with 100% Free Nationwide Delivery.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-[10px] bg-[#0F3B2E] text-[#F8F4EA] font-semibold text-xs shadow-xs hover:bg-[#0A2A21] transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} /> Return to Home
        </Link>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-[10px] bg-white border border-[#E4DFD1] text-[#0F3B2E] font-semibold text-xs hover:bg-[#F8F4EA] transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} /> Browse Catalog
        </Link>
      </div>

      <div className="pt-8 border-t border-[#E4DFD1] text-xs text-[#6B6B66]">
        Need assistance? WhatsApp our Karachi support team at{' '}
        <span className="font-semibold text-[#0F3B2E]">{siteConfig.support.whatsappDisplay}</span>
      </div>
    </div>
  );
};
