/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../utils/ecommerce-logic';
import { siteConfig } from '../config/site';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { formatOrderMessage, buildWhatsAppUrl } from '../lib/whatsapp';
import {
  CheckCircle2,
  Copy,
  Check,
  PackageCheck,
  ShieldCheck,
  MapPin,
  Phone,
} from 'lucide-react';

interface OrderSuccessPageProps {
  order?: Order;
  onNavigateTab?: (tab: string) => void;
  onTrackOrder?: (orderNumber: string, phone: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order: propOrder,
  onNavigateTab,
  onTrackOrder,
}) => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { orders } = useStore();

  const order = propOrder || orders.find((o) => o.order_number === paramOrderNumber);

  const [copied, setCopied] = useState(false);

  const handleNavigate = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      if (tab === 'shop') navigate('/shop');
      else if (tab === 'track-order') navigate('/track-order');
      else navigate('/');
    }
  };

  const handleTrack = (num: string, ph: string) => {
    if (onTrackOrder) {
      onTrackOrder(num, ph);
    } else {
      navigate(`/track-order?orderNumber=${encodeURIComponent(num)}&phone=${encodeURIComponent(ph)}`);
    }
  };

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#0F3B2E]">Order Confirmation</h2>
        <p className="text-xs text-[#6B6B66]">
          No recent order was found for the given reference. You can track your order status using your Order Number and Mobile Number.
        </p>
        <div className="pt-2">
          <Link
            to="/track-order"
            className="px-6 py-3 min-h-[44px] rounded-[10px] bg-[#0F3B2E] text-[#F8F4EA] font-semibold text-xs shadow-xs inline-flex items-center"
          >
            Go to Track Order
          </Link>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum BARVAKA team, I have just placed an order on your website. My Order Number is: ${order.order_number}. Name: ${order.customer_name}. Total: Rs. ${order.total.toLocaleString()}.`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Celebration Card */}
      <div className="bg-white rounded-[12px] border border-[#E4DFD1] p-8 text-center shadow-[0_4px_20px_rgba(15,59,46,0.06)] space-y-4">
        <div className="w-16 h-16 bg-[#E6EFEA] text-[#0F3B2E] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9 text-[#2E7D4F]" strokeWidth={1.5} />
        </div>

        <h1 className="font-serif text-3xl font-bold text-[#0F3B2E]">
          Order Confirmed with Khayr!
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B66] max-w-md mx-auto leading-relaxed">
          JazakAllah Khayr, <strong>{order.customer_name}</strong>. We have received your Cash on Delivery order and our fulfillment team in Karachi is preparing it for nationwide dispatch.
        </p>

        {/* Order Number Box */}
        <div className="p-4 bg-[#F8F4EA] border border-[#B8963E]/40 rounded-[10px] max-w-md mx-auto">
          <p className="text-xs font-semibold text-[#0F3B2E] uppercase tracking-wider mb-1">
            Order Reference Number
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-2xl font-bold text-[#0F3B2E] tracking-wider">
              {order.order_number}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-[8px] bg-white border border-[#E4DFD1] hover:bg-[#E6EFEA] text-[#0F3B2E] transition-colors"
              title="Copy Order Number"
            >
              {copied ? <Check className="w-4 h-4 text-[#2E7D4F]" /> : <Copy className="w-4 h-4 text-[#B8963E]" />}
            </button>
          </div>
          <p className="text-[11px] text-[#6B6B66] mt-2 font-medium">
            Please retain this number for doorstep inspection and rider confirmation.
          </p>
        </div>
      </div>

      {/* Order Summary & COD Notice */}
      <div className="bg-white rounded-[12px] border border-[#E4DFD1] p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,59,46,0.04)] space-y-6">
        <h2 className="font-serif text-xl font-bold text-[#0F3B2E] border-b border-[#E4DFD1] pb-3">
          Order Summary &amp; Verification
        </h2>

        {/* COD cash alert */}
        <div className="p-4 rounded-[10px] bg-[#E6EFEA] border border-[#0F3B2E]/20 text-[#0F3B2E] flex items-start gap-3 text-xs leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-[#B8963E] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <strong className="block font-semibold">Cash on Delivery (COD) Total: {formatPKR(order.total)}</strong>
            <span>Pay cash upon arrival. Open-parcel verification is welcome.</span>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1C1C]">
            Items Ordered ({order.items.length})
          </h3>
          <div className="space-y-3 border-y border-[#E4DFD1]/60 py-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                <div className="w-12 h-12 rounded-[8px] overflow-hidden border border-[#E4DFD1] shrink-0 bg-[#F8F4EA]">
                  <ImageWithFallback
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1C1C1C] truncate">{item.product_name}</p>
                  <p className="text-[#6B6B66]">{item.variant_label}</p>
                  <p className="text-[#6B6B66]">Qty: {item.quantity} × {formatPKR(item.unit_price)}</p>
                </div>
                <span className="font-bold text-[#0F3B2E] shrink-0 tabular-nums">
                  {formatPKR(item.line_total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#6B6B66] bg-[#F8F4EA] p-4 rounded-[10px] border border-[#E4DFD1]/60">
          <div className="space-y-1">
            <span className="font-semibold text-[#0F3B2E] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} /> Destination
            </span>
            <p className="leading-relaxed text-[#1C1C1C]">{order.shipping_address}, {order.city}, {order.province}</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-[#0F3B2E] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} /> Rider Contact
            </span>
            <p className="text-[#1C1C1C]">{order.customer_phone}</p>
            {order.order_notes && (
              <p className="text-[11px] text-[#6B6B66] italic mt-1">Instructions: {order.order_notes}</p>
            )}
          </div>
        </div>

        {/* Prominent WhatsApp Confirmation Callout */}
        <div className="p-4 sm:p-5 rounded-[12px] bg-[#E6EFEA] border border-[#0F3B2E]/20 text-center space-y-3">
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#0F3B2E]">
              Confirm your order faster by sending it to us on WhatsApp
            </p>
            <p className="text-[11px] text-[#6B6B66] mt-0.5">
              Send your full order details and item previews directly to our Karachi dispatch desk.
            </p>
          </div>

          <a
            href={buildWhatsAppUrl(formatOrderMessage({ order, origin: window.location.origin }))}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3.5 px-6 min-h-[44px] rounded-[10px] bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Send Order on WhatsApp</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => handleTrack(order.order_number, order.customer_phone)}
            className="flex-1 py-3 px-5 min-h-[44px] rounded-[10px] bg-[#0F3B2E] hover:bg-[#0A2A21] text-[#F8F4EA] font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <PackageCheck className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
            Track Parcel Status
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => handleNavigate('shop')}
            className="text-xs text-[#6B6B66] hover:text-[#0F3B2E] font-semibold underline"
          >
            Continue Shopping at BARVAKA
          </button>
        </div>
      </div>
    </div>
  );
};
