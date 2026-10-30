/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isDemoMode } from '../lib/supabaseClient';
import { MOCK_CATEGORIES } from '../lib/mockData';
import { Category } from '../types';

let localCategories = [...MOCK_CATEGORIES];

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    if (isDemoMode || !supabase) {
      return [...localCategories].sort((a, b) => a.sort_order - b.sort_order);
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (isDemoMode || !supabase) {
      return localCategories.find((c) => c.slug === slug) || null;
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    if (isDemoMode || !supabase) {
      const newCat: Category = {
        ...category,
        id: `cat-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      localCategories.push(newCat);
      return newCat;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (isDemoMode || !supabase) {
      localCategories = localCategories.map((c) => (c.id === id ? { ...c, ...updates } : c));
      const updated = localCategories.find((c) => c.id === id);
      if (!updated) throw new Error('Category not found');
      return updated;
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    if (isDemoMode || !supabase) {
      localCategories = localCategories.filter((c) => c.id !== id);
      return;
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};
