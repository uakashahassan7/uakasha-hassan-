/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { ADMIN_EMAIL } from '../../config/site';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  const { currentUser } = useStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile && !currentUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading, profile } = useAuth();
  const { currentUser, showToast } = useStore();
  const location = useLocation();

  const activeProfile = profile || currentUser;
  const isUserAdmin = isAdmin || (activeProfile?.role === 'admin' && activeProfile?.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase());

  React.useEffect(() => {
    // If authenticated customer tries to open /admin/*, show Access denied toast
    if (!loading && activeProfile && !isUserAdmin) {
      showToast('Access denied', 'error');
    }
  }, [loading, activeProfile, isUserAdmin, showToast]);

  // Admin pages must not render any data before the access check finishes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F4EA] text-[#0F3B2E]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#0F3B2E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-serif font-bold text-[#0F3B2E] tracking-wider uppercase">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  // Not signed in -> redirect to /admin/login
  if (!activeProfile) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Signed in as customer -> redirect to / with toast
  if (!isUserAdmin) {
    return <Navigate to="/" state={{ accessDenied: true }} replace />;
  }

  // Signed in AND is the admin
  return <>{children}</>;
};
