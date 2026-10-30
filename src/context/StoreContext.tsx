/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  Category,
  Coupon,
  Order,
  CartItem,
  Profile,
  ProductVariant,
  OrderStatus,
  CheckoutFormData,
  UserRole,
  ProductReview,
} from '../types';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_COUPONS,
  SEED_PROFILES,
  SEED_ORDERS,
  SEED_REVIEWS,
} from '../data/seedData';
import {
  generateOrderNumber,
  calculateCartTotals,
  getVariantPrice,
  validateCoupon,
  canTransitionOrderStatus,
  hasUserOrderedProduct,
  validateReviewInput,
} from '../utils/ecommerce-logic';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  // Catalog
  products: Product[];
  categories: Category[];
  activeCategories: Category[];
  activeProducts: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => { success: boolean; message: string };
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  cartTotals: ReturnType<typeof calculateCartTotals>;

  // Coupons
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'used_count'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

  // Orders
  orders: Order[];
  placeOrder: (formData: CheckoutFormData) => { success: boolean; order?: Order; error?: string };
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => { success: boolean; error?: string };
  findOrderByTracking: (orderNumber: string, phone: string) => Order | null;

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => { added: boolean; requiresAuth?: boolean };
  isInWishlist: (productId: string) => boolean;

  // Auth & Roles
  currentUser: Profile | null;
  allUsers: Profile[];
  loginAs: (role: 'guest' | 'customer' | 'admin') => void;
  loginWithEmail: (email: string, password?: string) => boolean;
  registerCustomer: (profileData: { email: string; fullName: string; phone: string }) => boolean;
  logout: () => void;
  updateCurrentUserProfile: (updates: Partial<Profile>) => void;

  // Reviews
  reviews: ProductReview[];
  addReview: (data: { productId: string; rating: number; comment: string }) => {
    success: boolean;
    message: string;
    review?: ProductReview;
  };
  deleteReview: (reviewId: string) => void;
  hasOrderedProduct: (productId: string) => boolean;
  getUserReviewForProduct: (productId: string) => ProductReview | undefined;

  // UI & Notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  isAdvisorOpen: boolean;
  setIsAdvisorOpen: (open: boolean) => void;
  isWishlistLoginModalOpen: boolean;
  openWishlistLoginModal: () => void;
  closeWishlistLoginModal: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'brv_products_v1',
  CATEGORIES: 'brv_categories_v1',
  COUPONS: 'brv_coupons_v1',
  ORDERS: 'brv_orders_v1',
  CART: 'brv_cart_v1',
  WISHLIST: 'brv_wishlist_v1',
  USERS: 'brv_users_v1',
  CURRENT_USER: 'brv_current_user_v1',
  APPLIED_COUPON: 'brv_applied_coupon_v1',
  REVIEWS: 'brv_reviews_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : SEED_PRODUCTS;
    } catch {
      return SEED_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : SEED_CATEGORIES;
    } catch {
      return SEED_CATEGORIES;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return saved ? JSON.parse(saved) : SEED_COUPONS;
    } catch {
      return SEED_COUPONS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : SEED_ORDERS;
    } catch {
      return SEED_ORDERS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [allUsers, setAllUsers] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : SEED_PROFILES;
    } catch {
      return SEED_PROFILES;
    }
  });

  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
      // default guest (null)
      return null;
    } catch {
      return null;
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLIED_COUPON);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : SEED_REVIEWS;
    } catch {
      return SEED_REVIEWS;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isWishlistLoginModalOpen, setIsWishlistLoginModalOpen] = useState(false);

  const openWishlistLoginModal = useCallback(() => {
    setIsWishlistLoginModalOpen(true);
  }, []);

  const closeWishlistLoginModal = useCallback(() => {
    setIsWishlistLoginModalOpen(false);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(STORAGE_KEYS.APPLIED_COUPON, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON);
    }
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  // Toast system
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Filtered lists
  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [categories]);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.is_active);
  }, [products]);

  // Cart calculations
  const cartTotals = useMemo(() => {
    return calculateCartTotals(cart, appliedCoupon);
  }, [cart, appliedCoupon]);

  // Add to cart with variant and stock validation
  const addToCart = useCallback(
    (product: Product, variant: ProductVariant, quantity: number) => {
      if (!variant.is_active || !product.is_active) {
        showToast('This item is currently unavailable', 'error');
        return { success: false, message: 'Item is unavailable' };
      }

      if (variant.stock_quantity <= 0) {
        showToast('Selected variant is out of stock', 'error');
        return { success: false, message: 'Out of stock' };
      }

      const cartItemId = `${product.id}-${variant.id}`;
      const existing = cart.find((item) => item.id === cartItemId);
      const currentQty = existing ? existing.quantity : 0;
      const targetQty = currentQty + quantity;

      if (targetQty > variant.stock_quantity) {
        const availableToAdd = variant.stock_quantity - currentQty;
        const msg = availableToAdd > 0
          ? `Only ${availableToAdd} more can be added (Stock: ${variant.stock_quantity})`
          : `You already have all ${variant.stock_quantity} available items in your cart`;
        showToast(msg, 'error');
        return { success: false, message: msg };
      }

      const unitPrice = getVariantPrice(product.base_price, variant.price);
      const variantParts: string[] = [];
      if (variant.size) variantParts.push(`Size: ${variant.size}`);
      if (variant.color) variantParts.push(`Color: ${variant.color}`);
      const variantLabel = variantParts.length > 0 ? variantParts.join(' · ') : 'Standard';

      setCart((prev) => {
        if (existing) {
          return prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity: targetQty, max_stock: variant.stock_quantity } : item
          );
        } else {
          const newItem: CartItem = {
            id: cartItemId,
            product_id: product.id,
            variant_id: variant.id,
            product_name: product.name,
            variant_label: variantLabel,
            unit_price: unitPrice,
            image_url: product.images[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500',
            quantity,
            max_stock: variant.stock_quantity,
            slug: product.slug,
          };
          return [...prev, newItem];
        }
      });

      showToast(`Added to cart: ${product.name} (${variantLabel})`, 'success');
      return { success: true };
    },
    [cart, showToast]
  );

  const removeFromCart = useCallback(
    (cartItemId: string) => {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      showToast('Item removed from cart', 'info');
    },
    [showToast]
  );

  const updateCartQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(cartItemId);
        return { success: true };
      }

      const item = cart.find((i) => i.id === cartItemId);
      if (!item) return { success: false, message: 'Item not found in cart' };

      // Find current stock from live product catalog
      const product = products.find((p) => p.id === item.product_id);
      const variant = product?.variants.find((v) => v.id === item.variant_id);
      const liveStock = variant ? variant.stock_quantity : item.max_stock;

      if (quantity > liveStock) {
        showToast(`Cannot exceed available stock of ${liveStock}`, 'error');
        return { success: false, message: `Only ${liveStock} units available` };
      }

      setCart((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity, max_stock: liveStock } : i))
      );
      return { success: true };
    },
    [cart, products, removeFromCart, showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Coupon handling
  const applyCouponCode = useCallback(
    (rawCode: string) => {
      const code = rawCode.trim().toUpperCase();
      const found = coupons.find((c) => c.code.toUpperCase() === code);
      if (!found) {
        return { success: false, message: 'Invalid coupon code. Please check and try again.' };
      }

      const subtotal = cart.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
      const result = validateCoupon(found, subtotal);
      if (!result.isValid) {
        return { success: false, message: result.errorMessage || 'Coupon cannot be applied' };
      }

      setAppliedCoupon(found);
      showToast(`Coupon "${found.code}" applied! You saved Rs. ${result.discountAmount}`, 'success');
      return { success: true, message: `Coupon applied: Rs. ${result.discountAmount} off` };
    },
    [coupons, cart, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  }, [showToast]);

  // Wishlist handling
  const toggleWishlist = useCallback(
    (productId: string) => {
      if (!currentUser) {
        openWishlistLoginModal();
        return { added: false, requiresAuth: true };
      }

      const exists = wishlist.includes(productId);
      if (exists) {
        setWishlist((prev) => prev.filter((id) => id !== productId));
        showToast('Removed from wishlist', 'info');
        return { added: false };
      } else {
        setWishlist((prev) => [...prev, productId]);
        showToast('Saved to your wishlist', 'success');
        return { added: true };
      }
    },
    [currentUser, wishlist, showToast, openWishlistLoginModal]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  // Order Placement - STRICT SERVER-LIKE VALIDATION
  const placeOrder = useCallback(
    (formData: CheckoutFormData) => {
      if (cart.length === 0) {
        return { success: false, error: 'Your cart is empty' };
      }

      // Verify stock & re-calculate verified unit prices from current product database
      const orderItems: Order['items'] = [];
      let verifiedSubtotal = 0;

      for (const cartItem of cart) {
        const product = products.find((p) => p.id === cartItem.product_id);
        if (!product || !product.is_active) {
          return { success: false, error: `Product "${cartItem.product_name}" is no longer available.` };
        }

        const variant = product.variants.find((v) => v.id === cartItem.variant_id);
        if (!variant || !variant.is_active) {
          return { success: false, error: `Selected variant for "${cartItem.product_name}" is no longer active.` };
        }

        if (cartItem.quantity > variant.stock_quantity) {
          return {
            success: false,
            error: `Insufficient stock for "${cartItem.product_name}". Only ${variant.stock_quantity} left in stock.`,
          };
        }

        const verifiedUnitPrice = getVariantPrice(product.base_price, variant.price);
        const lineTotal = verifiedUnitPrice * cartItem.quantity;
        verifiedSubtotal += lineTotal;

        orderItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          order_id: '', // Will be set with new order id
          product_id: product.id,
          variant_id: variant.id,
          product_name: product.name,
          variant_label: cartItem.variant_label,
          unit_price: verifiedUnitPrice,
          quantity: cartItem.quantity,
          line_total: lineTotal,
          image_url: cartItem.image_url,
        });
      }

      // Validate & calculate coupon discount
      let discountAmount = 0;
      let couponCode: string | null = null;
      if (appliedCoupon) {
        const couponValidation = validateCoupon(appliedCoupon, verifiedSubtotal);
        if (couponValidation.isValid) {
          discountAmount = couponValidation.discountAmount;
          couponCode = appliedCoupon.code;
        }
      }

      const deliveryFee = 0; // Always Free Delivery for BARVAKA in Pakistan
      const finalTotal = Math.max(0, verifiedSubtotal - discountAmount + deliveryFee);
      const orderNumber = generateOrderNumber();
      const orderId = `ord-${Date.now()}`;

      // Assign orderId to orderItems
      const populatedItems = orderItems.map((item) => ({ ...item, order_id: orderId }));

      const newOrder: Order = {
        id: orderId,
        order_number: orderNumber,
        user_id: currentUser ? currentUser.id : null,
        customer_name: formData.fullName.trim(),
        customer_phone: formData.phone.trim(),
        customer_email: formData.email ? formData.email.trim() : (currentUser ? currentUser.email : null),
        shipping_address: formData.address.trim(),
        city: formData.city.trim(),
        province: formData.province || 'Pakistan',
        postal_code: formData.postalCode || null,
        order_notes: formData.orderNotes ? formData.orderNotes.trim() : null,
        payment_method: 'cod',
        payment_status: 'unpaid',
        status: 'pending',
        subtotal: verifiedSubtotal,
        discount_amount: discountAmount,
        coupon_code: couponCode,
        delivery_fee: deliveryFee,
        total: finalTotal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: populatedItems,
      };

      // 1. Deduct variant stock
      setProducts((prev) =>
        prev.map((product) => {
          const itemsForProduct = cart.filter((item) => item.product_id === product.id);
          if (itemsForProduct.length === 0) return product;

          const updatedVariants = product.variants.map((v) => {
            const matchedCartItem = itemsForProduct.find((item) => item.variant_id === v.id);
            if (matchedCartItem) {
              const newStock = Math.max(0, v.stock_quantity - matchedCartItem.quantity);
              return { ...v, stock_quantity: newStock };
            }
            return v;
          });

          return { ...product, variants: updatedVariants };
        })
      );

      // 2. Increment coupon used count if used
      if (couponCode) {
        setCoupons((prev) =>
          prev.map((c) => (c.code === couponCode ? { ...c, used_count: c.used_count + 1 } : c))
        );
      }

      // 3. Save order to list
      setOrders((prev) => [newOrder, ...prev]);

      // 4. Clear cart and applied coupon
      setCart([]);
      setAppliedCoupon(null);

      showToast(`Order placed successfully! Order ID: ${newOrder.order_number}`, 'success');
      return { success: true, order: newOrder };
    },
    [cart, products, appliedCoupon, currentUser, showToast]
  );

  // Update order status with stock rollback if cancelled
  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      const role: UserRole = currentUser?.role || 'customer';
      const check = canTransitionOrderStatus(order.status, newStatus, role);
      if (!check.allowed) {
        return { success: false, error: check.reason || 'Transition not allowed' };
      }

      // If transition is to 'cancelled', restore variant stocks!
      if (newStatus === 'cancelled' && order.status !== 'cancelled') {
        setProducts((prevProducts) =>
          prevProducts.map((product) => {
            const itemsForProduct = order.items.filter((item) => item.product_id === product.id);
            if (itemsForProduct.length === 0) return product;

            const updatedVariants = product.variants.map((v) => {
              const matchedOrderItem = itemsForProduct.find((item) => item.variant_id === v.id);
              if (matchedOrderItem) {
                return { ...v, stock_quantity: v.stock_quantity + matchedOrderItem.quantity };
              }
              return v;
            });

            return { ...product, variants: updatedVariants };
          })
        );

        // Also decrement coupon count if coupon was used
        if (order.coupon_code) {
          setCoupons((prev) =>
            prev.map((c) =>
              c.code === order.coupon_code ? { ...c, used_count: Math.max(0, c.used_count - 1) } : c
            )
          );
        }
      }

      // Payment status updates to 'paid' when delivered
      const newPaymentStatus = newStatus === 'delivered' ? 'paid' : order.payment_status;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, payment_status: newPaymentStatus, updated_at: new Date().toISOString() }
            : o
        )
      );

      showToast(`Order ${order.order_number} status updated to ${newStatus.toUpperCase()}`, 'success');
      return { success: true };
    },
    [orders, currentUser, showToast]
  );

  // Track order by Order Number + Phone
  const findOrderByTracking = useCallback(
    (orderNumber: string, phone: string): Order | null => {
      const cleanNum = orderNumber.trim().toUpperCase();
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

      return (
        orders.find((o) => {
          const matchNum = o.order_number.toUpperCase() === cleanNum;
          const orderCleanPhone = o.customer_phone.replace(/[\s\-\(\)]/g, '');
          const matchPhone =
            orderCleanPhone === cleanPhone ||
            orderCleanPhone.endsWith(cleanPhone) ||
            cleanPhone.endsWith(orderCleanPhone);
          return matchNum && matchPhone;
        }) || null
      );
    },
    [orders]
  );

  // Admin Catalog actions
  const addProduct = useCallback(
    (newProdData: Omit<Product, 'id' | 'created_at'>) => {
      const id = `prod-${Date.now()}`;
      const newProduct: Product = {
        ...newProdData,
        id,
        created_at: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast(`Product "${newProduct.name}" created`, 'success');
    },
    [showToast]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      showToast('Product updated successfully', 'success');
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      // Check if product has orders
      const hasOrders = orders.some((o) => o.items.some((i) => i.product_id === id));
      if (hasOrders) {
        // Soft delete / deactivate as mandated by PRD Rule 8
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: false } : p)));
        showToast('Product has orders and was deactivated instead', 'info');
        return { success: true, message: 'Product has orders and was deactivated instead' };
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('Product permanently deleted', 'success');
        return { success: true, message: 'Product deleted' };
      }
    },
    [orders, showToast]
  );

  const addCategory = useCallback(
    (catData: Omit<Category, 'id' | 'created_at'>) => {
      const newCat: Category = {
        ...catData,
        id: `cat-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      showToast(`Category "${newCat.name}" added`, 'success');
    },
    [showToast]
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      showToast('Category updated', 'success');
    },
    [showToast]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      const hasProducts = products.some((p) => p.category_id === id);
      if (hasProducts) {
        showToast('Cannot delete category: Category has products. Please reassign or delete them first.', 'error');
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('Category deleted', 'info');
    },
    [products, showToast]
  );

  // Admin Coupon actions
  const addCoupon = useCallback(
    (couponData: Omit<Coupon, 'id' | 'used_count'>) => {
      const cleanCode = couponData.code.trim().toUpperCase();
      const duplicate = coupons.some((c) => c.code.toUpperCase() === cleanCode);
      if (duplicate) {
        showToast(`Coupon code "${cleanCode}" already exists. Please choose a unique code.`, 'error');
        return;
      }

      const newCoupon: Coupon = {
        ...couponData,
        id: `cpn-${Date.now()}`,
        code: cleanCode,
        used_count: 0,
      };
      setCoupons((prev) => [...prev, newCoupon]);
      showToast(`Coupon "${newCoupon.code}" created`, 'success');
    },
    [coupons, showToast]
  );

  const updateCoupon = useCallback(
    (id: string, updates: Partial<Coupon>) => {
      if (updates.code) {
        const cleanCode = updates.code.trim().toUpperCase();
        const duplicate = coupons.some((c) => c.id !== id && c.code.toUpperCase() === cleanCode);
        if (duplicate) {
          showToast(`Coupon code "${cleanCode}" already exists. Please choose a unique code.`, 'error');
          return;
        }
      }

      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates, code: updates.code ? updates.code.toUpperCase() : c.code } : c))
      );
      showToast('Coupon updated', 'success');
    },
    [coupons, showToast]
  );

  const deleteCoupon = useCallback(
    (id: string) => {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showToast('Coupon deleted', 'info');
    },
    [showToast]
  );

  // Authentication & Role Switcher
  const loginAs = useCallback(
    (role: 'guest' | 'customer' | 'admin') => {
      if (role === 'guest') {
        setCurrentUser(null);
        showToast('Browsing as Guest', 'info');
      } else if (role === 'admin') {
        const adminUser = allUsers.find((u) => u.role === 'admin') || SEED_PROFILES[0];
        setCurrentUser(adminUser);
        showToast(`Logged in as Store Owner (${adminUser.full_name})`, 'success');
      } else {
        const custUser = allUsers.find((u) => u.role === 'customer') || SEED_PROFILES[1];
        setCurrentUser(custUser);
        showToast(`Logged in as Customer (${custUser.full_name})`, 'success');
      }
    },
    [allUsers, showToast]
  );

  const loginWithEmail = useCallback(
    (email: string, _password?: string) => {
      const found = allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (found) {
        setCurrentUser(found);
        showToast(`Welcome back, ${found.full_name}!`, 'success');
        return true;
      }
      showToast('Account not found with this email', 'error');
      return false;
    },
    [allUsers, showToast]
  );

  const registerCustomer = useCallback(
    (data: { email: string; fullName: string; phone: string }) => {
      const exists = allUsers.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase());
      if (exists) {
        showToast('An account with this email already exists', 'error');
        return false;
      }

      const newProfile: Profile = {
        id: `user-${Date.now()}`,
        email: data.email.trim(),
        full_name: data.fullName.trim(),
        phone: data.phone.trim(),
        role: 'customer',
        created_at: new Date().toISOString(),
      };

      setAllUsers((prev) => [...prev, newProfile]);
      setCurrentUser(newProfile);
      showToast(`Account created! Welcome to BARVAKA, ${newProfile.full_name}`, 'success');
      return true;
    },
    [allUsers, showToast]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    showToast('You have been logged out', 'info');
  }, [showToast]);

  const updateCurrentUserProfile = useCallback(
    (updates: Partial<Profile>) => {
      if (!currentUser) return;
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
      showToast('Profile updated', 'success');
    },
    [currentUser, showToast]
  );

  // Review actions
  const hasOrderedProduct = useCallback(
    (productId: string) => {
      return hasUserOrderedProduct(orders, currentUser, productId);
    },
    [orders, currentUser]
  );

  const getUserReviewForProduct = useCallback(
    (productId: string) => {
      if (!currentUser) return undefined;
      const userEmail = currentUser.email?.toLowerCase();
      return reviews.find(
        (r) =>
          r.product_id === productId &&
          (r.user_id === currentUser.id || (userEmail && r.user_email?.toLowerCase() === userEmail))
      );
    },
    [reviews, currentUser]
  );

  const addReview = useCallback(
    (data: { productId: string; rating: number; comment: string }) => {
      if (!currentUser) {
        showToast('Please sign in to submit a review', 'error');
        return { success: false, message: 'Please sign in to submit a review' };
      }

      const ordered = hasUserOrderedProduct(orders, currentUser, data.productId);
      if (!ordered) {
        showToast('Only customers who have previously ordered this product can submit a verified review', 'error');
        return {
          success: false,
          message: 'Only customers who have previously ordered this product can submit a verified review',
        };
      }

      const validation = validateReviewInput(data.rating, data.comment);
      if (!validation.isValid) {
        const msg = validation.error || 'Invalid review input';
        showToast(msg, 'error');
        return { success: false, message: msg };
      }

      const userEmail = currentUser.email?.toLowerCase();
      const existingIndex = reviews.findIndex(
        (r) =>
          r.product_id === data.productId &&
          (r.user_id === currentUser.id || (userEmail && r.user_email?.toLowerCase() === userEmail))
      );

      let resultingReview: ProductReview;

      if (existingIndex >= 0) {
        // Update existing review
        resultingReview = {
          ...reviews[existingIndex],
          rating: data.rating,
          comment: data.comment.trim(),
          user_name: currentUser.full_name || reviews[existingIndex].user_name,
          verified_purchase: true,
          created_at: new Date().toISOString(),
        };
        setReviews((prev) => prev.map((r, i) => (i === existingIndex ? resultingReview : r)));
        showToast('Your review has been updated successfully!', 'success');
      } else {
        // Create new review
        resultingReview = {
          id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product_id: data.productId,
          user_id: currentUser.id,
          user_name: currentUser.full_name || 'Verified Customer',
          user_email: currentUser.email,
          rating: data.rating,
          comment: data.comment.trim(),
          created_at: new Date().toISOString(),
          verified_purchase: true,
        };
        setReviews((prev) => [resultingReview, ...prev]);
        showToast('Thank you! Your verified review has been published.', 'success');
      }

      return { success: true, message: 'Review saved', review: resultingReview };
    },
    [currentUser, orders, reviews, showToast]
  );

  const deleteReview = useCallback(
    (reviewId: string) => {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      showToast('Review removed', 'info');
    },
    [showToast]
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        activeCategories,
        activeProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotals,
        coupons,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        orders,
        placeOrder,
        updateOrderStatus,
        findOrderByTracking,
        wishlist,
        toggleWishlist,
        isInWishlist,
        currentUser,
        allUsers,
        loginAs,
        loginWithEmail,
        registerCustomer,
        logout,
        updateCurrentUserProfile,
        reviews,
        addReview,
        deleteReview,
        hasOrderedProduct,
        getUserReviewForProduct,
        toasts,
        showToast,
        dismissToast,
        isAdvisorOpen,
        setIsAdvisorOpen,
        isWishlistLoginModalOpen,
        openWishlistLoginModal,
        closeWishlistLoginModal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
