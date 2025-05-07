"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appwriteService } from "@/services/appwrite";

// Define User type based on your Appwrite user structure
type User = {
  $id: string;
  email: string;
  name: string;
  role?: 'customer' | 'designer'; // Add role field
  // Add other fields as needed
};

// Define AuthContext type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: 'customer' | 'designer') => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  isDesigner: () => boolean; // Add function to check if user is designer
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => {},
  isDesigner: () => false, // Default implementation
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  
  // Check authentication status when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check if user is authenticated
  const checkAuthStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      const currentUser = await appwriteService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user is a designer
  const isDesigner = (): boolean => {
    return user?.role === 'designer';
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await appwriteService.login(email, password);
      await checkAuthStatus();
      router.push('/');
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string, role?: 'customer' | 'designer'): Promise<void> => {
    try {
      setLoading(true);
      await appwriteService.createAccount(email, password, name, role);
      await checkAuthStatus();
      router.push('/');
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await appwriteService.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
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
    login,
    signup,
    logout,
    checkAuthStatus,
    isDesigner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
