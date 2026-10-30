/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, Coupon, OrderStatus, ProductVariant, UserRole, CheckoutFormData } from '../types';

/**
 * Generates unique order number in format: BRV-YYMMDD-XXXX
 * e.g. BRV-261029-K8N2
 */
export function generateOrderNumber(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit easily confused chars (I, O, 0, 1)
  let randomSuffix = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomSuffix += chars[randomIndex];
  }

  return `BRV-${yy}${mm}${dd}-${randomSuffix}`;
}

/**
 * Formats a numeric amount in PKR standard currency: Rs. 1,500
 */
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rs. 0';
  }
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString('en-PK')}`;
}

/**
 * Variant price = product_variants.price if not null, otherwise products.base_price
 */
export function getVariantPrice(basePrice: number, variantPrice?: number | null): number {
  if (variantPrice !== null && variantPrice !== undefined && variantPrice > 0) {
    return variantPrice;
  }
  return basePrice;
}

export interface CouponValidationResult {
  isValid: boolean;
  errorMessage?: string;
  discountAmount: number;
}

/**
 * Validates coupon rules:
 * - is_active === true
 * - starts_at <= now <= expires_at
 * - used_count < max_uses (when max_uses is set)
 * - subtotal >= min_order_amount
 * - percentage discount calculated on subtotal
 * - fixed discount cannot exceed subtotal
 */
export function validateCoupon(
  coupon: Coupon | null | undefined,
  subtotal: number,
  currentDate: Date = new Date()
): CouponValidationResult {
  if (!coupon) {
    return { isValid: false, errorMessage: 'No coupon provided', discountAmount: 0 };
  }

  if (!coupon.is_active) {
    return { isValid: false, errorMessage: 'This coupon is no longer active', discountAmount: 0 };
  }

  const nowTime = currentDate.getTime();
  const startTime = new Date(coupon.starts_at).getTime();
  const expiryTime = new Date(coupon.expires_at).getTime();

  if (nowTime < startTime) {
    return { isValid: false, errorMessage: 'Coupon has not started yet', discountAmount: 0 };
  }

  if (nowTime > expiryTime) {
    return { isValid: false, errorMessage: 'This coupon has expired', discountAmount: 0 };
  }

  if (coupon.max_uses !== null && coupon.max_uses !== undefined && coupon.used_count >= coupon.max_uses) {
    return { isValid: false, errorMessage: 'Coupon usage limit has been reached', discountAmount: 0 };
  }

  if (subtotal < coupon.min_order_amount) {
    return {
      isValid: false,
      errorMessage: `Minimum order of ${formatPKR(coupon.min_order_amount)} required for this coupon`,
      discountAmount: 0,
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = Math.round((subtotal * coupon.discount_value) / 100);
  } else {
    // Fixed amount discount cannot exceed subtotal
    discount = Math.min(coupon.discount_value, subtotal);
  }

  return {
    isValid: true,
    discountAmount: Math.max(0, discount),
  };
}

/**
 * Calculates cart totals: subtotal, discount, delivery fee (always 0), and final total
 */
export function calculateCartTotals(items: CartItem[], coupon?: Coupon | null, now: Date = new Date()) {
  const subtotal = items.reduce((acc, item) => {
    return acc + item.unit_price * item.quantity;
  }, 0);

  let discount = 0;
  let couponError: string | undefined;

  if (coupon) {
    const couponResult = validateCoupon(coupon, subtotal, now);
    if (couponResult.isValid) {
      discount = couponResult.discountAmount;
    } else {
      couponError = couponResult.errorMessage;
    }
  }

  const deliveryFee = 0; // Always Free Delivery for BARVAKA in v1
  const total = Math.max(0, subtotal - discount + deliveryFee);

  return {
    subtotal,
    discount,
    deliveryFee,
    total,
    couponError,
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
  };
}

/**
 * Validates stock quantity against requested quantity
 */
export function checkVariantStock(
  variant: Pick<ProductVariant, 'stock_quantity' | 'is_active'>,
  requestedQty: number
): { isAvailable: boolean; message?: string } {
  if (!variant.is_active) {
    return { isAvailable: false, message: 'This variant is currently inactive' };
  }
  if (variant.stock_quantity <= 0) {
    return { isAvailable: false, message: 'Out of stock' };
  }
  if (requestedQty > variant.stock_quantity) {
    return {
      isAvailable: false,
      message: `Only ${variant.stock_quantity} available in stock`,
    };
  }
  return { isAvailable: true };
}

/**
 * Validates Pakistan phone numbers (e.g. 03001234567, 0300-1234567, +923001234567)
 */
export function validatePhonePK(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Matches 03XXXXXXXXX (11 digits) or +923XXXXXXXXX (13 chars) or 923XXXXXXXXX (12 digits)
  const pkPhoneRegex = /^((\+92)|(92)|0)?3\d{9}$/;
  return pkPhoneRegex.test(cleaned);
}

/**
 * Validates checkout form data before placing an order
 */
export function validateCheckoutForm(form: Partial<CheckoutFormData>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!form.fullName || form.fullName.trim().length < 3) {
    errors.fullName = 'Full Name is required (minimum 3 characters)';
  }

  if (!form.phone || !validatePhonePK(form.phone)) {
    errors.phone = 'Valid Pakistan mobile number is required (e.g. 0300-1234567)';
  }

  if (form.email && form.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
  }

  if (!form.address || form.address.trim().length < 6) {
    errors.address = 'Detailed delivery address is required (house/shop, street, area)';
  }

  if (!form.city || form.city.trim().length < 2) {
    errors.city = 'Please specify your city';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Order status transition logic:
 * pending -> confirmed -> shipped -> delivered
 * cancelled allowed from pending, confirmed or shipped by admin only.
 * Customers cannot cancel in v1 (they contact via WhatsApp).
 */
export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  role: UserRole
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: false, reason: 'Order already has this status' };
  }

  if (role !== 'admin') {
    return { allowed: false, reason: 'Customers cannot change order status directly. Please contact support via WhatsApp.' };
  }

  if (currentStatus === 'delivered') {
    return { allowed: false, reason: 'Delivered orders cannot be modified' };
  }

  if (currentStatus === 'cancelled') {
    return { allowed: false, reason: 'Cancelled orders cannot be reopened' };
  }

  if (targetStatus === 'cancelled') {
    // Allowed from pending, confirmed, or shipped
    if (['pending', 'confirmed', 'shipped'].includes(currentStatus)) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Cannot cancel an order in this status' };
  }

  const validSequence: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };

  const allowedNext = validSequence[currentStatus] || [];
  if (allowedNext.includes(targetStatus)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Invalid transition from ${currentStatus} to ${targetStatus}`,
  };
}
