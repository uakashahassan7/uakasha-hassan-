/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { siteConfig } from '../../config/site';
import { Logo } from '../common/Logo';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { isAdmin } = useAuth();
  return (
    <footer className="bg-[#0A2A21] text-[#E6EFEA] pt-14 pb-10 border-t border-[#0F3B2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#0F3B2E]/80">
          {/* Brand Info with Logo Component */}
          <div className="space-y-4">
            <Logo variant="light" size="md" showTagline={true} />
            <p className="text-xs text-[#E6EFEA]/80 leading-relaxed pt-1">
              BARVAKA is Pakistan's premier online store with 100% Cash on Delivery and Free Delivery nationwide. Handcrafted apparel, unadulterated attars, electronics, and lifestyle goods.
            </p>
            <div className="pt-2">
              <a
                href={buildWhatsAppUrl('Hello BARVAKA, I would like to inquire about your products.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#0F3B2E] hover:bg-[#0F3B2E]/80 text-[#F8F4EA] border border-[#B8963E]/40 text-xs font-semibold shadow-xs transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                WhatsApp: {siteConfig.support.whatsappDisplay}
              </a>
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#F8F4EA] tracking-wider uppercase border-b border-[#0F3B2E] pb-2">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-[#E6EFEA]/80">
              <li>
                <button
                  onClick={() => setCurrentTab('track-order')}
                  className="hover:text-[#B8963E] transition-colors text-left"
                >
                  Track Your Order (COD)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('shop')}
                  className="hover:text-[#B8963E] transition-colors text-left"
                >
                  Catalog & Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="hover:text-[#B8963E] transition-colors text-left"
                >
                  About Our Brand & Values
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('contact')}
                  className="hover:text-[#B8963E] transition-colors text-left"
                >
                  Contact & Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery & Trust */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#F8F4EA] tracking-wider uppercase border-b border-[#0F3B2E] pb-2">
              Trust & Khayr
            </h4>
            <ul className="space-y-3 text-xs text-[#E6EFEA]/80">
              <li className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#B8963E] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  <strong className="text-[#F8F4EA] block font-medium">100% Free Nationwide Delivery</strong>
                  No hidden charges across 200+ cities in Pakistan.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B8963E] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  <strong className="text-[#F8F4EA] block font-medium">Cash on Delivery & Open Parcel</strong>
                  Inspect your parcel before paying courier.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#B8963E] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  <strong className="text-[#F8F4EA] block font-medium">7-Day Easy Exchange</strong>
                  Hassle-free size or product exchange.
                </span>
              </li>
            </ul>
          </div>

          {/* Store Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#F8F4EA] tracking-wider uppercase border-b border-[#0F3B2E] pb-2">
              Store Contact
            </h4>
            <div className="space-y-2.5 text-xs text-[#E6EFEA]/80">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B8963E] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{siteConfig.support.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B8963E] shrink-0" strokeWidth={1.5} />
                <span>{siteConfig.support.phone}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B8963E] shrink-0" strokeWidth={1.5} />
                <span>{siteConfig.support.email}</span>
              </p>
              <p className="text-[#E6EFEA]/60 text-[11px] pt-1">
                Hours: {siteConfig.support.timing}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E6EFEA]/60 gap-4">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Quality · Fast Delivery · Trust · Khayr.</p>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <button onClick={() => setCurrentTab('admin')} className="hover:text-[#F8F4EA] text-[#B8963E] font-medium">
                  Store Owner Portal
                </button>
                <span className="text-[#0F3B2E]">|</span>
              </>
            )}
            <span className="text-[#E6EFEA]">Currency: PKR (Rs.)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
