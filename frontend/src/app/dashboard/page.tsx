"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';

// Import components with dynamic loading to prevent server-side rendering issues
const DashboardLayout = dynamic(
  () => import('@/components/dashboard/DashboardLayout'),
  { ssr: false }
);

const DashboardStats = dynamic(
  () => import('@/components/dashboard/DashboardStats'),
  { ssr: false }
);

const DesignProjects = dynamic(
  () => import('@/components/dashboard/DesignProjects'),
  { ssr: false }
);

const CustomerRequests = dynamic(
  () => import('@/components/dashboard/CustomerRequests'),
  { ssr: false }
);

export default function DesignerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [loading, user, router]);

  return (
    <RoleBasedRoute allowedRoles={['designer']}>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Designer Dashboard</h1>
          
          <DashboardStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <DesignProjects />
            <CustomerRequests />
          </div>
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}