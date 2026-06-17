'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  ChevronRight,
  LogOut,
  Store as StoreIcon,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const storeNavItems: SidebarItem[] = [
  { name: 'Store Dashboard', href: '/store-dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: ClipboardList },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
];

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-emerald-900 text-white h-screen fixed left-0 top-0 overflow-y-auto z-20">
        <div className="p-6 border-b border-emerald-800">
          <h1 className="text-xl font-bold tracking-wider">RESTO MGMT</h1>
          <p className="text-xs text-emerald-300 mt-1">Store Portal</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {storeNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 group",
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-emerald-200 hover:bg-emerald-800 hover:text-white"
                )}
              >
                <div className="flex items-center">
                  <item.icon className={cn(
                    "w-5 h-5 mr-3",
                    isActive ? "text-white" : "text-emerald-300 group-hover:text-white"
                  )} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-emerald-800">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center mr-3">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-emerald-300 truncate">Store Manager</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}