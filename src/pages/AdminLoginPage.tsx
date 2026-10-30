/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { ADMIN_EMAIL } from '../config/site';
import { isDemoMode } from '../lib/supabaseClient';
import { Logo } from '../components/common/Logo';
import { Lock, Mail, ShieldAlert, ArrowLeft, AlertCircle, Clock } from 'lucide-react';

const LOCKOUT_KEY = 'brv_admin_lockout_v1';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_SEC = 60;

interface LockoutState {
  attempts: number;
  lockedUntil: number | null;
}

export const AdminLoginPage: React.FC = () => {
  const { signInAdmin, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // If already authenticated as admin, redirect immediately to /admin
  useEffect(() => {
    if (isAdmin) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAdmin, navigate, location.state]);

  // Read stored lockout state
  const getStoredLockout = (): LockoutState => {
    try {
      const raw = sessionStorage.getItem(LOCKOUT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          attempts: Number(parsed.attempts) || 0,
          lockedUntil: parsed.lockedUntil ? Number(parsed.lockedUntil) : null,
        };
      }
    } catch {
      // ignore
    }
    return { attempts: 0, lockedUntil: null };
  };

  const saveLockout = (state: LockoutState) => {
    try {
      sessionStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  };

  // Timer loop for lockout countdown
  useEffect(() => {
    const checkLockout = () => {
      const state = getStoredLockout();
      if (state.lockedUntil) {
        const now = Date.now();
        const diffMs = state.lockedUntil - now;
        if (diffMs > 0) {
          const sec = Math.ceil(diffMs / 1000);
          setRemainingSeconds(sec);
        } else {
          // Lockout expired
          saveLockout({ attempts: 0, lockedUntil: null });
          setRemainingSeconds(0);
        }
      } else {
        setRemainingSeconds(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLocked = remainingSeconds > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLocked) {
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Invalid email or password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInAdmin(email, password);
      // Success: clear lockout
      saveLockout({ attempts: 0, lockedUntil: null });
      showToast('Admin authenticated successfully', 'success');
      navigate('/admin', { replace: true });
    } catch (err) {
      // Track failed attempt
      const current = getStoredLockout();
      const newAttempts = current.attempts + 1;

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_DURATION_SEC * 1000;
        saveLockout({ attempts: newAttempts, lockedUntil: lockUntil });
        setRemainingSeconds(LOCKOUT_DURATION_SEC);
      } else {
        saveLockout({ attempts: newAttempts, lockedUntil: null });
      }

      // Always show one generic message, never reveal which was wrong
      setErrorMessage('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#0F3B2E] selection:text-[#F8F4EA]">
      {/* Return to Storefront link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F3B2E] hover:text-[#0A2A21] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
          Return to Storefront
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[12px] border border-[#E4DFD1] shadow-[0_10px_30px_rgba(15,59,46,0.08)] space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-3 flex flex-col items-center">
            <Logo variant="dark" size="md" showTagline={false} />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6EFEA] border border-[#0F3B2E]/20 text-[10px] font-bold text-[#0F3B2E] uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B8963E]" strokeWidth={1.5} />
              Store Owner Portal · Authorized Access Only
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#0F3B2E]">
              Admin Sign In
            </h1>
            <p className="text-xs text-[#6B6B66] max-w-xs leading-relaxed">
              Authenticate with your verified administrator credentials to access the BARVAKA store control center.
            </p>
          </div>

          {/* Lockout Notice */}
          {isLocked && (
            <div
              className="bg-[#B3372F]/10 border border-[#B3372F]/30 rounded-[10px] p-3.5 text-center space-y-1.5 animate-in fade-in"
              role="alert"
            >
              <div className="flex items-center justify-center gap-2 text-[#B3372F] font-bold text-xs">
                <Clock className="w-4 h-4 animate-pulse" strokeWidth={1.5} />
                <span>Security Lockout Active</span>
              </div>
              <p className="text-xs text-[#B3372F]">
                Too many failed attempts. Form is locked for{' '}
                <strong className="font-mono text-sm underline">{remainingSeconds}s</strong>.
              </p>
              <p className="text-[11px] text-[#6B6B66]">
                Please wait for the timer to expire before re-entering credentials.
              </p>
            </div>
          )}

          {/* Generic Error Notice */}
          {!isLocked && errorMessage && (
            <div
              className="bg-[#B3372F]/10 border border-[#B3372F]/30 rounded-[10px] p-3 flex items-center gap-2.5 text-xs text-[#B3372F] font-medium"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Demo Mode Helper Notice (only shown in demo mode, completely disabled in real mode) */}
          {isDemoMode && (
            <div className="bg-[#F8F4EA] border border-[#B8963E]/40 rounded-[10px] p-3 text-[11px] text-[#0A2A21] space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-[#0F3B2E]">
                <span className="w-2 h-2 rounded-full bg-[#B8963E]" />
                Demo mode: use demo password demo1234. The real password is set in Supabase.
              </p>
              <p className="text-[#6B6B66] font-mono text-[10px]">
                Admin Identity: {ADMIN_EMAIL}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1.5"
              >
                Administrator Email <span className="text-[#B3372F]">*</span>
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="off"
                  disabled={isLocked || isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 min-h-[44px] rounded-[10px] bg-white border border-[#E4DFD1] text-xs text-[#1C1C1C] placeholder:text-[#6B6B66]/60 focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E] focus:border-[#0F3B2E] transition-all disabled:opacity-50 disabled:bg-[#F8F4EA]"
                />
                <Mail className="w-4 h-4 text-[#B8963E] absolute left-3.5 top-3.5" strokeWidth={1.5} />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1.5"
              >
                Password <span className="text-[#B3372F]">*</span>
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="off"
                  disabled={isLocked || isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 min-h-[44px] rounded-[10px] bg-white border border-[#E4DFD1] text-xs text-[#1C1C1C] placeholder:text-[#6B6B66]/60 focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E] focus:border-[#0F3B2E] transition-all disabled:opacity-50 disabled:bg-[#F8F4EA]"
                />
                <Lock className="w-4 h-4 text-[#B8963E] absolute left-3.5 top-3.5" strokeWidth={1.5} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLocked || isSubmitting}
              className="w-full py-3.5 px-4 min-h-[44px] rounded-[10px] bg-[#0F3B2E] hover:bg-[#0A2A21] text-[#F8F4EA] font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F8F4EA] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isLocked ? (
                <span>Locked ({remainingSeconds}s)</span>
              ) : (
                <span>Sign In to Admin Portal</span>
              )}
            </button>
          </form>

          {/* Footer Security Stamp */}
          <div className="pt-2 border-t border-[#E4DFD1]/60 text-center text-[10px] text-[#6B6B66]">
            Strict rate-limiting and audit logging are active. Unauthorized access attempts are monitored.
          </div>
        </div>
      </div>
    </div>
  );
};
