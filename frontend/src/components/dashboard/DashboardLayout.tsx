"use client";

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Overview', href: '/dashboard', icon: 'chart-pie' },
    { name: 'Products', href: '/dashboard/products', icon: 'shopping-bag' },
    { name: 'Design Projects', href: '/dashboard/designs', icon: 'template' },
    { name: 'Customer Requests', href: '/dashboard/requests', icon: 'chat' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'cog' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-3 shadow">
          <Link href="/dashboard" className="text-xl font-bold text-amber-800">
            Designer Dashboard
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-amber-800 hover:bg-amber-50"
              >
                Sign out
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
          <div className="flex h-full flex-col">
            <div className="flex flex-shrink-0 items-center px-6 py-4">
              <Link href="/" className="text-xl font-bold text-amber-800">
                Furniture Store
              </Link>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              <nav className="flex-1 space-y-1 px-4 py-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-amber-100 text-amber-800'
                        : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user?.name?.charAt(0) || 'D'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-medium text-amber-800 hover:text-amber-900"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="pl-64 w-full">
          {/* Back button for subpages */}
          {pathname !== '/dashboard' && (
            <div className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-6 py-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile main content */}
      <div className="lg:hidden">
        <main className="w-full">
          {/* Back button for subpages on mobile */}
          {pathname !== '/dashboard' && (
            <div className="bg-white shadow-sm">
              <div className="px-4 py-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}