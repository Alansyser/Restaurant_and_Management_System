'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isAdmin } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import StoreLayout from '@/components/StoreLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  if (isAdmin(user)) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <StoreLayout>{children}</StoreLayout>;
}