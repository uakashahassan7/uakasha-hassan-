/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Truck, Handshake, Sprout } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const items = [
    {
      icon: ShieldCheck,
      title: 'Quality Guaranteed',
      description: 'Hand-inspected materials, authentic craftsmanship & precision finish.',
    },
    {
      icon: Truck,
      title: 'Fast Free Delivery',
      description: '2–4 working days express nationwide dispatch with live courier tracking.',
    },
    {
      icon: Handshake,
      title: 'Trust & Cash on Delivery',
      description: '100% Cash on Delivery (COD) with open parcel doorstep verification.',
    },
    {
      icon: Sprout,
      title: 'Khayr & Ethical Trade',
      description: 'Honest pricing, 7-day hassle-free exchange & customer-first service.',
    },
  ];

  return (
    <section className="bg-white border-y border-[#E4DFD1] py-8 sm:py-10 shadow-[0_4px_20px_rgba(15,59,46,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-[12px] bg-[#F8F4EA]/60 border border-[#E4DFD1]/60 hover:border-[#B8963E]/40 hover:bg-[#F8F4EA] transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-full bg-[#E6EFEA] border border-[#B8963E]/30 flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className="w-5 h-5 text-[#B8963E]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#0F3B2E] tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#6B6B66] mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
