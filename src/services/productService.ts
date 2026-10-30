/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isDemoMode } from '../lib/supabaseClient';
import { MOCK_PRODUCTS } from '../lib/mockData';
import { Product, ProductVariant } from '../types';

let localProducts = [...MOCK_PRODUCTS];

export interface GetProductsParams {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
  limit?: number;
}

export const productService = {
  async getProducts(params: GetProductsParams = {}): Promise<Product[]> {
    if (isDemoMode || !supabase) {
      let result = [...localProducts].filter((p) => p.is_active);

      if (params.categorySlug && params.categorySlug !== 'all') {
        // Find category id by slug
        result = result.filter((p) => p.category_id.includes(params.categorySlug!) || p.slug.includes(params.categorySlug!));
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
      }

      if (params.minPrice !== undefined) {
        result = result.filter((p) => p.base_price >= params.minPrice!);
      }

      if (params.maxPrice !== undefined) {
        result = result.filter((p) => p.base_price <= params.maxPrice!);
      }

      if (params.inStockOnly) {
        result = result.filter((p) =>
          p.variants.some((v) => v.is_active && v.stock_quantity > 0)
        );
      }

      if (params.sortBy === 'price-asc') {
        result.sort((a, b) => a.base_price - b.base_price);
      } else if (params.sortBy === 'price-desc') {
        result.sort((a, b) => b.base_price - a.base_price);
      } else if (params.sortBy === 'featured') {
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      } else {
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      if (params.limit) {
        result = result.slice(0, params.limit);
      }

      return result;
    }

    let query = supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('is_active', true);

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params.minPrice !== undefined) {
      query = query.gte('base_price', params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      query = query.lte('base_price', params.maxPrice);
    }

    if (params.sortBy === 'price-asc') {
      query = query.order('base_price', { ascending: true });
    } else if (params.sortBy === 'price-desc') {
      query = query.order('base_price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isDemoMode || !supabase) {
      return localProducts.find((p) => p.slug === slug) || null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isDemoMode || !supabase) {
      return localProducts.find((p) => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    if (isDemoMode || !supabase) {
      const newProd: Product = {
        ...product,
        id: `prod-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      localProducts.unshift(newProd);
      return newProd;
    }

    const { variants, ...prodFields } = product;
    const { data: createdProduct, error } = await supabase
      .from('products')
      .insert([prodFields])
      .select()
      .single();

    if (error) throw error;

    if (variants && variants.length > 0) {
      const variantsWithProductId = variants.map((v) => ({
        ...v,
        product_id: createdProduct.id,
      }));
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantsWithProductId);
      if (variantError) throw variantError;
    }

    return this.getProductById(createdProduct.id) as Promise<Product>;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isDemoMode || !supabase) {
      localProducts = localProducts.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const updated = localProducts.find((p) => p.id === id);
      if (!updated) throw new Error('Product not found');
      return updated;
    }

    const { variants, ...prodUpdates } = updates;
    const { error } = await supabase.from('products').update(prodUpdates).eq('id', id);
    if (error) throw error;

    return this.getProductById(id) as Promise<Product>;
  },

  async deleteProduct(id: string): Promise<void> {
    if (isDemoMode || !supabase) {
      localProducts = localProducts.map((p) => (p.id === id ? { ...p, is_active: false } : p));
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },
};
