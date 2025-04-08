"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Models } from 'appwrite';
import { useRouter } from 'next/navigation';
import { login, logout, createAccount, getCurrentUser } from '@/app/actions/auth';

// Define types for Auth context
type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check if user is logged in when the component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const { user, success } = await getCurrentUser();
      if (success && user) {
        setUser(user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Auth Status Error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login function - now using server action
  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const result = await login({ email, password });
      
      if (result.success) {
        await checkAuthStatus();
        router.push('/');
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function - now using server action
  const handleSignup = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      const result = await createAccount({ email, password, name });
      
      if (result.success) {
        await checkAuthStatus();
        router.push('/');
      } else {
        throw new Error(result.error || 'Signup failed');
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function - now using server action
  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await logout();
      
      if (result.success) {
        setUser(null);
        router.push('/');
      } else {
        throw new Error(result.error || 'Logout failed');
      }
    } catch (error: any) {
      console.error("Logout Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
