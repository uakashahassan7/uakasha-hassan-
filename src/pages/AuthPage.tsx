/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../config/site';
import { Logo } from '../components/common/Logo';
import { Lock, Mail, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const { loginWithEmail, registerCustomer, loginAs, currentUser, allUsers, showToast } = useStore();
  const { switchDemoRole, signIn, signInAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/';

  const defaultMode =
    initialMode ||
    (location.pathname.includes('register')
      ? 'register'
      : location.pathname.includes('forgot')
      ? 'forgot'
      : 'login');

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // If already logged in
  if (currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white rounded-[12px] border border-[#E4DFD1] p-8 text-center shadow-[0_4px_20px_rgba(15,59,46,0.06)] space-y-4">
          <div className="w-12 h-12 bg-[#E6EFEA] text-[#0F3B2E] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-[#2E7D4F]" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#0F3B2E]">Already Signed In</h2>
          <p className="text-xs text-[#6B6B66]">
            Signed in as <strong>{currentUser.full_name}</strong> ({currentUser.email}).
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate(currentUser.role === 'admin' ? '/admin' : '/account')}
              className="w-full py-3 min-h-[44px] rounded-[10px] bg-[#0F3B2E] text-[#F8F4EA] font-semibold text-xs shadow-xs hover:bg-[#0A2A21] transition-colors"
            >
              Go to {currentUser.role === 'admin' ? 'Store Owner Portal' : 'My Account'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 min-h-[44px] rounded-[10px] bg-white border border-[#E4DFD1] text-[#1C1C1C] font-semibold text-xs hover:bg-[#F8F4EA] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    if (!email.trim()) {
      setValidationErrors({ email: 'Please enter your email address' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail === ADMIN_EMAIL.toLowerCase();

    // If admin logs in at /login, authenticate and redirect to /admin
    if (isAdminEmail) {
      try {
        await signInAdmin(cleanEmail, password);
        navigate('/admin');
        return;
      } catch {
        setValidationErrors({ email: 'Invalid email or password.' });
        return;
      }
    }

    // Customer login: customers must never open /admin/*
    const safeRedirect = redirectPath.startsWith('/admin') ? '/account' : (redirectPath !== '/' ? redirectPath : '/account');

    try {
      await signIn(email, password);
      loginWithEmail(email, password);
      switchDemoRole('customer');
      navigate(safeRedirect);
    } catch {
      const ok = loginWithEmail(email, password);
      if (ok) {
        switchDemoRole('customer');
        navigate(safeRedirect);
      } else {
        setValidationErrors({ email: 'Invalid email or password.' });
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!email.trim()) errs.email = 'Email address is required';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters long';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }

    setValidationErrors({});
    const ok = registerCustomer({
      email,
      fullName,
      phone: phone.trim() || '03001234567',
    });

    if (ok) {
      switchDemoRole('customer');
      navigate(redirectPath !== '/' ? redirectPath : '/account');
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setValidationErrors({ email: 'Email address is required' });
      return;
    }
    setValidationErrors({});
    setForgotSubmitted(true);
    showToast('If this email exists, a reset link was sent', 'success');
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 sm:px-6">
      <div className="bg-white rounded-[12px] border border-[#E4DFD1] p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,59,46,0.06)] space-y-6">
        {/* Header with Logo */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Logo size="sm" showTagline={false} />
          <h2 className="font-serif text-2xl font-bold text-[#0F3B2E] pt-2">
            {mode === 'login' && 'Sign in to BARVAKA'}
            {mode === 'register' && 'Create your Account'}
            {mode === 'forgot' && 'Reset your Password'}
          </h2>
          <p className="text-xs text-[#6B6B66]">
            {mode === 'login' && 'Access order history, saved addresses, and wishlist'}
            {mode === 'register' && 'Quick registration for seamless COD shopping nationwide'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* Demo Fast Login Strip */}
        <div className="bg-[#F8F4EA] border border-[#E4DFD1] rounded-[10px] p-3.5 space-y-2">
          <p className="text-[11px] font-bold text-[#0F3B2E] uppercase tracking-wider">
            ⚡ Quick Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                switchDemoRole('customer');
                loginAs('customer');
                navigate(redirectPath.startsWith('/admin') ? '/account' : redirectPath);
              }}
              className="px-2.5 py-2 min-h-[44px] rounded-[8px] bg-white text-[#0F3B2E] font-semibold border border-[#E4DFD1] shadow-2xs hover:bg-[#E6EFEA] transition-colors text-left"
            >
              👤 Customer 1 <br />
              <span className="text-[10px] text-[#6B6B66] font-normal">Hassan Ali</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const cust2 = allUsers.find((u) => u.email === 'fatima.zahra@example.com') || allUsers[1];
                if (cust2) {
                  loginWithEmail(cust2.email);
                  navigate(redirectPath.startsWith('/admin') ? '/account' : redirectPath);
                }
              }}
              className="px-2.5 py-2 min-h-[44px] rounded-[8px] bg-white text-[#0F3B2E] font-semibold border border-[#E4DFD1] shadow-2xs hover:bg-[#E6EFEA] transition-colors text-left"
            >
              👤 Customer 2 <br />
              <span className="text-[10px] text-[#6B6B66] font-normal">Fatima Zahra</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1C] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hassan@example.com"
                  className={`w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-[10px] bg-white border text-xs text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E] ${
                    validationErrors.email ? 'border-[#B3372F] bg-[#B3372F]/5' : 'border-[#E4DFD1]'
                  }`}
                />
                <Mail className="w-4 h-4 text-[#B8963E] absolute left-3 top-3.5" strokeWidth={1.5} />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-[#B3372F] mt-1 font-medium">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-[#B8963E] hover:text-[#0F3B2E] hover:underline font-medium"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-[10px] bg-white border border-[#E4DFD1] text-xs text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E]"
                />
                <Lock className="w-4 h-4 text-[#B8963E] absolute left-3 top-3.5" strokeWidth={1.5} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 min-h-[44px] rounded-[10px] bg-[#0F3B2E] hover:bg-[#0A2A21] text-[#F8F4EA] font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              Sign In to Account
            </button>

            <div className="text-center pt-2 text-xs text-[#6B6B66]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#0F3B2E] font-semibold hover:underline"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1C] mb-1.5 uppercase tracking-wider">
                Full Name <span className="text-[#B3372F]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Hassan Ali"
                  className={`w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-[10px] bg-white border text-xs text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E] ${
                    validationErrors.fullName ? 'border-[#B3372F] bg-[#B3372F]/5' : 'border-[#E4DFD1]'
                  }`}
                />
                <User className="w-4 h-4 text-[#B8963E] absolute left-3 top-3.5" strokeWidth={1.5} />
              </div>
              {validationErrors.fullName && (
                <p className="text-xs text-[#B3372F] mt-1 font-medium">{validationErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1C] mb-1.5 uppercase tracking-wider">
                Email Address <span className="text-[#B3372F]">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hassan@example.com"
                  className={`w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-[10px] bg-white border text-xs text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E] ${
                    validationErrors.email ? 'border-[#B3372F] bg-[#B3372F]/5' : 'border-[#E4DFD1]'
                  }`}
                />
                <Mail className="w-4 h-4 text-[#B8963E] absolute left-3 top-3.5" strokeWidth={1.5} />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-[#B3372F] mt-1 font-medium">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1C] mb-1.5 uppercase tracking-wider">
                Mobile Number (For Courier)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-[10px] bg-white border border-[#E4DFD1] text-xs text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E]"
                />
                <Phone className="w-4 h-4 text-[#B8963E] absolute left-3 top-3.5" strokeWidth={1.5} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1C] mb-1.5 uppercase tracking-wider">
                Password <span className="text-[#B3372F]">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={`w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-[10px] bg-white border text-xs text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E] ${
                    validationErrors.password ? 'border-[#B3372F] bg-[#B3372F]/5' : 'border-[#E4DFD1]'
                  }`}
                />
                <Lock className="w-4 h-4 text-[#B8963E] absolute left-3 top-3.5" strokeWidth={1.5} />
              </div>
              {validationErrors.password && (
                <p className="text-xs text-[#B3372F] mt-1 font-medium">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1C] mb-1.5 uppercase tracking-wider">
                Confirm Password <span className="text-[#B3372F]">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className={`w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-[10px] bg-white border text-xs text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E] ${
                    validationErrors.confirmPassword ? 'border-[#B3372F] bg-[#B3372F]/5' : 'border-[#E4DFD1]'
                  }`}
                />
                <Lock className="w-4 h-4 text-[#B8963E] absolute left-3 top-3.5" strokeWidth={1.5} />
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-xs text-[#B3372F] mt-1 font-medium">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 min-h-[44px] rounded-[10px] bg-[#0F3B2E] hover:bg-[#0A2A21] text-[#F8F4EA] font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              Register Account <ArrowRight className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
            </button>

            <div className="text-center pt-2 text-xs text-[#6B6B66]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#0F3B2E] font-semibold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {forgotSubmitted ? (
              <div className="p-4 bg-[#E6EFEA] border border-[#0F3B2E]/20 rounded-[10px] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#2E7D4F] mx-auto" strokeWidth={1.5} />
                <p className="text-sm font-bold text-[#0F3B2E]">Reset Instructions Sent</p>
                <p className="text-xs text-[#6B6B66]">
                  If an account exists for this email, you will receive password reset instructions.
                </p>
                <button
                  onClick={() => {
                    setForgotSubmitted(false);
                    setMode('login');
                  }}
                  className="mt-3 px-4 py-2 min-h-[44px] bg-[#0F3B2E] text-[#F8F4EA] text-xs font-semibold rounded-[10px]"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1C] mb-1.5 uppercase tracking-wider">
                    Registered Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-[10px] bg-white border text-xs text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E] ${
                        validationErrors.email ? 'border-[#B3372F] bg-[#B3372F]/5' : 'border-[#E4DFD1]'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-[#B8963E] absolute left-3 top-3.5" strokeWidth={1.5} />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-[#B3372F] mt-1 font-medium">{validationErrors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 min-h-[44px] rounded-[10px] bg-[#0F3B2E] hover:bg-[#0A2A21] text-[#F8F4EA] font-semibold text-xs shadow-md transition-all"
                >
                  Send Reset Link
                </button>

                <div className="text-center pt-2 text-xs text-[#6B6B66]">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[#0F3B2E] font-semibold hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
