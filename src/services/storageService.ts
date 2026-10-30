/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isDemoMode } from '../lib/supabaseClient';

const BUCKET_NAME = 'product-images';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and WebP images are accepted.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image size must be less than 2 MB.' };
  }
  return { valid: true };
}

export const storageService = {
  async uploadProductImage(productId: string, file: File): Promise<string> {
    const check = validateImageFile(file);
    if (!check.valid) throw new Error(check.error);

    if (isDemoMode || !supabase) {
      // In demo mode, return an object URL or high quality unsplash image
      return URL.createObjectURL(file);
    }

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const path = `products/${productId}/${timestamp}-${cleanFileName}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file);
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadCategoryImage(categoryId: string, file: File): Promise<string> {
    const check = validateImageFile(file);
    if (!check.valid) throw new Error(check.error);

    if (isDemoMode || !supabase) {
      return URL.createObjectURL(file);
    }

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const path = `categories/${categoryId}/${timestamp}-${cleanFileName}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file);
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },
};
