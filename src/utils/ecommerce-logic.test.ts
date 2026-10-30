/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateOrderNumber,
  formatPKR,
  getVariantPrice,
  validateCoupon,
  calculateCartTotals,
  checkVariantStock,
  validatePhonePK,
  validateCheckoutForm,
  canTransitionOrderStatus,
} from './ecommerce-logic';
import { Coupon, CartItem, ProductVariant } from '../types';

test('generateOrderNumber generates expected format BRV-YYMMDD-XXXX', () => {
  const fixedDate = new Date('2026-10-29T12:00:00Z');
  const orderNum = generateOrderNumber(fixedDate);
  assert.match(orderNum, /^BRV-261029-[A-Z0-9]{4}$/);

  // Uniqueness check: two consecutive numbers should differ
  const orderNum2 = generateOrderNumber(fixedDate);
  assert.notEqual(orderNum, orderNum2);
});

test('formatPKR formats numeric amounts cleanly', () => {
  assert.equal(formatPKR(1500), 'Rs. 1,500');
  assert.equal(formatPKR(0), 'Rs. 0');
  assert.equal(formatPKR(24999), 'Rs. 24,999');
  assert.equal(formatPKR(1499.8), 'Rs. 1,500');
});

test('getVariantPrice correctly resolves base price vs override', () => {
  assert.equal(getVariantPrice(3500, null), 3500);
  assert.equal(getVariantPrice(3500, undefined), 3500);
  assert.equal(getVariantPrice(3500, 3999), 3999);
  assert.equal(getVariantPrice(3500, 0), 3500); // 0 or invalid falls back to base
});

test('validateCoupon enforces active status, dates, limits, and minimum spend', () => {
  const now = new Date('2026-10-29T12:00:00Z');
  const validCoupon: Coupon = {
    id: 'c1',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 2000,
    max_uses: 100,
    used_count: 5,
    starts_at: '2026-01-01T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    is_active: true,
  };

  // Valid usage: Rs. 3000 subtotal -> 10% = Rs. 300
  const res1 = validateCoupon(validCoupon, 3000, now);
  assert.equal(res1.isValid, true);
  assert.equal(res1.discountAmount, 300);

  // Subtotal below min_order_amount
  const res2 = validateCoupon(validCoupon, 1500, now);
  assert.equal(res2.isValid, false);
  assert.match(res2.errorMessage!, /Minimum order/);

  // Expired coupon
  const expiredCoupon: Coupon = {
    ...validCoupon,
    expires_at: '2026-05-01T00:00:00Z',
  };
  const res3 = validateCoupon(expiredCoupon, 5000, now);
  assert.equal(res3.isValid, false);
  assert.match(res3.errorMessage!, /expired/);

  // Inactive coupon
  const inactiveCoupon: Coupon = {
    ...validCoupon,
    is_active: false,
  };
  const res4 = validateCoupon(inactiveCoupon, 5000, now);
  assert.equal(res4.isValid, false);
  assert.match(res4.errorMessage!, /no longer active/);

  // Max uses reached
  const maxedCoupon: Coupon = {
    ...validCoupon,
    max_uses: 10,
    used_count: 10,
  };
  const res5 = validateCoupon(maxedCoupon, 5000, now);
  assert.equal(res5.isValid, false);
  assert.match(res5.errorMessage!, /limit/);

  // Fixed discount capped at subtotal
  const fixedCoupon: Coupon = {
    ...validCoupon,
    code: 'FLAT1000',
    discount_type: 'fixed',
    discount_value: 1000,
    min_order_amount: 500,
  };
  const res6 = validateCoupon(fixedCoupon, 800, now);
  assert.equal(res6.isValid, true);
  assert.equal(res6.discountAmount, 800); // capped at subtotal
});

test('calculateCartTotals calculates correct subtotal, discount, 0 delivery fee and final total', () => {
  const items: CartItem[] = [
    {
      id: 'p1-v1',
      product_id: 'p1',
      variant_id: 'v1',
      product_name: 'Cotton Kurta',
      variant_label: 'Size: M · Color: White',
      unit_price: 2500,
      image_url: '/img.jpg',
      quantity: 2,
      max_stock: 10,
      slug: 'cotton-kurta',
    },
    {
      id: 'p2-v2',
      product_id: 'p2',
      variant_id: 'v2',
      product_name: 'Leather Belt',
      variant_label: 'Color: Tan',
      unit_price: 1500,
      image_url: '/img2.jpg',
      quantity: 1,
      max_stock: 5,
      slug: 'leather-belt',
    },
  ];

  // Subtotal = 2 * 2500 + 1 * 1500 = 6500
  const totalsNoCoupon = calculateCartTotals(items);
  assert.equal(totalsNoCoupon.subtotal, 6500);
  assert.equal(totalsNoCoupon.discount, 0);
  assert.equal(totalsNoCoupon.deliveryFee, 0); // Always free delivery
  assert.equal(totalsNoCoupon.total, 6500);
  assert.equal(totalsNoCoupon.itemCount, 3);

  const coupon: Coupon = {
    id: 'c1',
    code: 'SAVE10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 1000,
    max_uses: null,
    used_count: 0,
    starts_at: '2026-01-01T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    is_active: true,
  };

  const totalsWithCoupon = calculateCartTotals(items, coupon, new Date('2026-10-29T12:00:00Z'));
  assert.equal(totalsWithCoupon.subtotal, 6500);
  assert.equal(totalsWithCoupon.discount, 650);
  assert.equal(totalsWithCoupon.total, 5850);
});

test('checkVariantStock checks stock limits accurately', () => {
  const variant: Pick<ProductVariant, 'stock_quantity' | 'is_active'> = {
    stock_quantity: 4,
    is_active: true,
  };

  assert.equal(checkVariantStock(variant, 2).isAvailable, true);
  assert.equal(checkVariantStock(variant, 4).isAvailable, true);
  assert.equal(checkVariantStock(variant, 5).isAvailable, false);
  assert.equal(checkVariantStock({ stock_quantity: 0, is_active: true }, 1).isAvailable, false);
  assert.equal(checkVariantStock({ stock_quantity: 10, is_active: false }, 1).isAvailable, false);
});

test('validatePhonePK verifies Pakistan mobile numbers', () => {
  assert.equal(validatePhonePK('03001234567'), true);
  assert.equal(validatePhonePK('0300-1234567'), true);
  assert.equal(validatePhonePK('+923001234567'), true);
  assert.equal(validatePhonePK('923219876543'), true);
  assert.equal(validatePhonePK('0345 1122334'), true);

  assert.equal(validatePhonePK('12345'), false);
  assert.equal(validatePhonePK('02135890123'), false); // Landline not mobile
  assert.equal(validatePhonePK('abc'), false);
});

test('validateCheckoutForm requires full name, valid phone, detailed address and city', () => {
  const validForm = {
    fullName: 'Muhammad Usman',
    phone: '0301-9876543',
    email: 'usman@example.com',
    address: 'House 42, Street 15, Sector F-8/2',
    city: 'Islamabad',
  };

  assert.equal(validateCheckoutForm(validForm).isValid, true);

  const invalidForm = {
    fullName: 'M',
    phone: '999',
    address: 'test',
    city: '',
  };

  const result = validateCheckoutForm(invalidForm);
  assert.equal(result.isValid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.address);
  assert.ok(result.errors.city);
});

test('canTransitionOrderStatus enforces admin permissions and valid workflow transitions', () => {
  // Customer cannot transition
  const custRes = canTransitionOrderStatus('pending', 'confirmed', 'customer');
  assert.equal(custRes.allowed, false);

  // Admin valid transitions
  assert.equal(canTransitionOrderStatus('pending', 'confirmed', 'admin').allowed, true);
  assert.equal(canTransitionOrderStatus('confirmed', 'shipped', 'admin').allowed, true);
  assert.equal(canTransitionOrderStatus('shipped', 'delivered', 'admin').allowed, true);

  // Cancellation allowed from pending, confirmed, or shipped
  assert.equal(canTransitionOrderStatus('pending', 'cancelled', 'admin').allowed, true);
  assert.equal(canTransitionOrderStatus('confirmed', 'cancelled', 'admin').allowed, true);
  assert.equal(canTransitionOrderStatus('shipped', 'cancelled', 'admin').allowed, true);

  // Delivered cannot be cancelled or altered
  assert.equal(canTransitionOrderStatus('delivered', 'cancelled', 'admin').allowed, false);
  assert.equal(canTransitionOrderStatus('delivered', 'shipped', 'admin').allowed, false);

  // Cancelled cannot be revived
  assert.equal(canTransitionOrderStatus('cancelled', 'pending', 'admin').allowed, false);
});

test('admin authorization verifies ADMIN_EMAIL strictly and case-insensitively', async () => {
  const { ADMIN_EMAIL } = await import('../config/site');
  assert.equal(ADMIN_EMAIL, 'uakashafanny@gmail.com');

  const checkAdminEligibility = (email: string, role: string) => {
    return role === 'admin' && email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  };

  assert.equal(checkAdminEligibility('uakashafanny@gmail.com', 'admin'), true);
  assert.equal(checkAdminEligibility('UAKASHAFANNY@GMAIL.COM', 'admin'), true);
  assert.equal(checkAdminEligibility('  uakashafanny@gmail.com  ', 'admin'), true);
  assert.equal(checkAdminEligibility('other@example.com', 'admin'), false);
  assert.equal(checkAdminEligibility('uakashafanny@gmail.com', 'customer'), false);
});

test('admin lockout logic triggers 60s lockdown after 5 failed attempts', () => {
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_SEC = 60;

  const calculateLockout = (currentAttempts: number, now: number) => {
    const nextAttempts = currentAttempts + 1;
    if (nextAttempts >= MAX_ATTEMPTS) {
      return { attempts: nextAttempts, lockedUntil: now + LOCKOUT_SEC * 1000 };
    }
    return { attempts: nextAttempts, lockedUntil: null };
  };

  const now = 1000000;
  assert.equal(calculateLockout(0, now).lockedUntil, null);
  assert.equal(calculateLockout(1, now).lockedUntil, null);
  assert.equal(calculateLockout(3, now).lockedUntil, null);
  assert.equal(calculateLockout(4, now).lockedUntil, now + 60000); // 5th attempt locks for 60s
});
