"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type RoleBasedRouteProps = {
  children: ReactNode;
  allowedRoles: ('customer' | 'designer')[];
  fallbackPath?: string;
};

/**
 * Component for role-based access control
 * Only renders children if the current user has one of the allowed roles
 * Otherwise redirects to the fallback path
 */
export default function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/access-denied' 
}: RoleBasedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check authorization when auth state changes
    if (!loading) {
      // If no user is logged in, redirect to login
      if (!user) {
        router.push(`/auth/login?redirect=${window.location.pathname}`);
        return;
      }

      // Check if user has one of the allowed roles
      const hasAllowedRole = allowedRoles.includes(user.role || 'customer');
      
      if (!hasAllowedRole) {
        // Redirect to fallback path if user doesn't have required role
        router.push(fallbackPath);
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, allowedRoles, fallbackPath, router]);

  // Show loading spinner while checking authorization
  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-amber-800">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-amber-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // Render children if authorized
  return <>{children}</>;
}