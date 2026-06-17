'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, canAccessAdminPages, getHomePathForRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import StoreLayout from '@/components/StoreLayout';

// Pages that don't require authentication
const PUBLIC_PATHS = ['/login'];

// Pages that only admin can access
const ADMIN_ONLY_PATHS = ['/products', '/suppliers', '/stores'];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Public paths
    if (PUBLIC_PATHS.includes(pathname)) {
      if (isAuthenticated && user) {
        // Already logged in - redirect to home
        router.replace(getHomePathForRole(user.role));
      }
      return;
    } else {
      // Private paths - check authentication
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      } else if (ADMIN_ONLY_PATHS.some(path => pathname.startsWith(path))) {
        if (!canAccessAdminPages(user)) {
          router.replace(getHomePathForRole('store'));
          return;
        }
      } else if (pathname === '/dashboard' && user && !isAdmin(user)) {
        router.replace(getHomePathForRole('store'));
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If public path and not authenticated
  if (PUBLIC_PATHS.includes(pathname)) {
    if (!isAuthenticated) {
      return <>{children}</>;
    }
    return null;
  }

  // If authenticated, render with proper layout
  if (isAuthenticated && user) {
    if (isAdmin(user)) {
      return <AdminLayout>{children}</AdminLayout>;
    } else {
      return <StoreLayout>{children}</StoreLayout>;
    }
  }

  return null;
}
