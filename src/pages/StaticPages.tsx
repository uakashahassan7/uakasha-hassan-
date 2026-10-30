/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { siteConfig } from '../config/site';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { ShieldCheck, Truck, Handshake, Sprout, Phone, Mail, MapPin, Clock } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold text-[#B8963E] tracking-wider uppercase">
          Brand Philosophy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F3B2E]">
          About {siteConfig.name}
        </h1>
        <p className="text-base text-[#6B6B66] max-w-xl mx-auto font-normal leading-relaxed">
          Rooted in authenticity, craftsmanship, ethical trade, and customer dignity across Pakistan.
        </p>
      </div>

      <div className="prose prose-zinc mx-auto text-sm text-[#1C1C1C] leading-relaxed space-y-6 bg-white rounded-[12px] border border-[#E4DFD1] p-8 shadow-[0_4px_20px_rgba(15,59,46,0.04)]">
        <h3 className="font-serif text-xl font-bold text-[#0F3B2E]">The Story of BARVAKA</h3>
        <p>
          BARVAKA was created with a clear standard: commerce in Pakistan should honor trust, craftsmanship, and transparency. Derived from our signature emerald emblem with a gold leaf and arch motif, our brand represents dignity, longevity, and Khayr.
        </p>
        <p>
          Every item in our catalog—from royal stitched kurtas and hand-blended pure attars to premium leather accessories and certified tech—is inspected with utmost scrutiny in our Karachi fulfillment facility prior to dispatch.
        </p>

        <h3 className="font-serif text-xl font-bold text-[#0F3B2E] mt-6">Our 4 Core Pillars</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mt-4">
          <div className="p-4 rounded-[10px] bg-[#F8F4EA] border border-[#E4DFD1] space-y-1.5">
            <h4 className="font-bold text-sm text-[#0F3B2E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} /> 1. Quality
            </h4>
            <p className="text-xs text-[#6B6B66]">
              From combed Egyptian cotton for our kurtas to 18-hour concentrated pure attars, we never cut corners on materials.
            </p>
          </div>

          <div className="p-4 rounded-[10px] bg-[#F8F4EA] border border-[#E4DFD1] space-y-1.5">
            <h4 className="font-bold text-sm text-[#0F3B2E] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} /> 2. Fast Delivery
            </h4>
            <p className="text-xs text-[#6B6B66]">
              Orders are dispatched swiftly nationwide to 200+ cities in Pakistan with 100% Free Delivery.
            </p>
          </div>

          <div className="p-4 rounded-[10px] bg-[#F8F4EA] border border-[#E4DFD1] space-y-1.5">
            <h4 className="font-bold text-sm text-[#0F3B2E] flex items-center gap-2">
              <Handshake className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} /> 3. Trust
            </h4>
            <p className="text-xs text-[#6B6B66]">
              We operate strictly on Cash on Delivery with open-parcel inspection rights on arrival, so customers pay only when satisfied.
            </p>
          </div>

          <div className="p-4 rounded-[10px] bg-[#F8F4EA] border border-[#E4DFD1] space-y-1.5">
            <h4 className="font-bold text-sm text-[#0F3B2E] flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} /> 4. Khayr
            </h4>
            <p className="text-xs text-[#6B6B66]">
              Khayr embodies ethical trade, honest pricing, and genuine customer-first service via our direct WhatsApp helpline ({siteConfig.support.whatsappDisplay}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-[#B8963E] tracking-wider uppercase">
          Customer Support
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#0F3B2E]">
          Contact BARVAKA
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B66] max-w-md mx-auto">
          We are here to assist you with order status, sizing inquiries, product advice, or exchanges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Support Channels */}
        <div className="bg-white rounded-[12px] border border-[#E4DFD1] p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,59,46,0.04)] space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#0F3B2E] border-b border-[#E4DFD1] pb-3">
            Direct Assistance
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-[#1C1C1C]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-[10px] bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <p className="font-semibold text-[#0F3B2E]">WhatsApp Helpline</p>
                <p className="text-xs text-[#6B6B66] mt-0.5">{siteConfig.support.whatsappDisplay} ({siteConfig.support.whatsapp})</p>
                <a
                  href={buildWhatsAppUrl('Hello BARVAKA, I am reaching out from your Contact page.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-2 min-h-[36px] rounded-[8px] bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                  <span>Open WhatsApp Chat</span>
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-[#E4DFD1]/60">
              <div className="p-2.5 rounded-[10px] bg-[#E6EFEA] text-[#0F3B2E] border border-[#0F3B2E]/20">
                <Phone className="w-5 h-5 text-[#B8963E]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-[#0F3B2E]">Telephone Support</p>
                <p className="text-xs text-[#6B6B66] mt-0.5">{siteConfig.support.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-[#E4DFD1]/60">
              <div className="p-2.5 rounded-[10px] bg-[#E6EFEA] text-[#0F3B2E] border border-[#0F3B2E]/20">
                <Mail className="w-5 h-5 text-[#B8963E]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-[#0F3B2E]">Email Support</p>
                <p className="text-xs text-[#6B6B66] mt-0.5">{siteConfig.support.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment & Address */}
        <div className="bg-white rounded-[12px] border border-[#E4DFD1] p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,59,46,0.04)] space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#0F3B2E] border-b border-[#E4DFD1] pb-3">
            Fulfillment Center
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-[#1C1C1C]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-[10px] bg-[#E6EFEA] text-[#0F3B2E] border border-[#0F3B2E]/20">
                <MapPin className="w-5 h-5 text-[#B8963E]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-[#0F3B2E]">Hub Address</p>
                <p className="text-xs text-[#6B6B66] mt-0.5 leading-relaxed">{siteConfig.support.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-[#E4DFD1]/60">
              <div className="p-2.5 rounded-[10px] bg-[#E6EFEA] text-[#0F3B2E] border border-[#0F3B2E]/20">
                <Clock className="w-5 h-5 text-[#B8963E]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-[#0F3B2E]">Business Hours</p>
                <p className="text-xs text-[#6B6B66] mt-0.5">{siteConfig.support.timing}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
