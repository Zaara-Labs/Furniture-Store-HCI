"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Avoid hydration mismatch by only rendering after mounting on client
  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-8">My Account</h1>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-medium mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors"
                  onClick={() => router.push('/account/edit')}
                >
                  Edit Profile
                </button>
                <button 
                  className="ml-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4">Orders</h2>
                <p className="text-gray-600 mb-4">View and track your orders</p>
                <button 
                  className="px-4 py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50 transition-colors"
                  onClick={() => router.push('/orders')}
                >
                  View Orders
                </button>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4">Wishlist</h2>
                <p className="text-gray-600 mb-4">Products you've saved for later</p>
                <button 
                  className="px-4 py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50 transition-colors"
                  onClick={() => router.push('/wishlist')}
                >
                  View Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
