"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DesignProjects from '@/components/dashboard/DesignProjects';
import CustomerRequests from '@/components/dashboard/CustomerRequests';
import { useAuth } from '@/context/AuthContext';

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