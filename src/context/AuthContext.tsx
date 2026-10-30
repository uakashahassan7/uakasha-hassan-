/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile, UserRole } from '../types';
import { authService } from '../services/authService';
import { supabase, isDemoMode } from '../lib/supabaseClient';
import { MOCK_PROFILES } from '../lib/mockData';
import { ADMIN_EMAIL } from '../config/site';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  switchDemoRole: (role: 'guest' | 'customer' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'barvaka_auth_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      return saved ? JSON.parse(saved) : null; // default guest
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with Supabase Auth session if not demo mode
  useEffect(() => {
    if (!isDemoMode && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          authService.getProfile(session.user.id).then((p) => {
            setProfile(p);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          authService.getProfile(session.user.id).then((p) => setProfile(p));
        } else {
          setProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  }, [profile]);

  const signIn = useCallback(async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await authService.signIn(email, password);
      setProfile(res.profile);
      setUser({ id: res.profile.id, email: res.profile.email });
    } finally {
      setLoading(false);
    }
  }, []);

  const signInAdmin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authService.signInAdmin(email, password);
      setProfile(res.profile);
      setUser({ id: res.profile.id, email: res.profile.email });
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone: string) => {
    setLoading(true);
    try {
      const res = await authService.signUp(email, password, fullName, phone);
      setProfile(res.profile);
      setUser({ id: res.profile.id, email: res.profile.email });
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setProfile(null);
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = await authService.updateProfile(profile.id, updates);
    setProfile(updated);
  }, [profile]);

  // Demo role switcher for testing in preview
  const switchDemoRole = useCallback((role: 'guest' | 'customer' | 'admin') => {
    if (role === 'guest') {
      setProfile(null);
      setUser(null);
    } else if (role === 'admin') {
      const admin = MOCK_PROFILES.find((p) => p.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || MOCK_PROFILES[0];
      setProfile(admin);
      setUser({ id: admin.id, email: admin.email });
    } else {
      const cust = MOCK_PROFILES[1];
      setProfile(cust);
      setUser({ id: cust.id, email: cust.email });
    }
  }, []);

  const isAdmin = Boolean(
    profile?.role === 'admin' &&
    profile?.email?.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase()
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        isDemoMode,
        signIn,
        signInAdmin,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
