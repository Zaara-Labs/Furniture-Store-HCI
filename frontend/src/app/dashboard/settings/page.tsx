"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/context/AuthContext';

export default function DesignerSettings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/auth/login?redirect=/dashboard/settings');
    }

    // Populate the form with user data when available
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [loading, user, router]);

  return (
    <RoleBasedRoute allowedRoles={['designer']}>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Account Settings</h1>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-amber-700 text-amber-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'notifications'
                      ? 'border-amber-700 text-amber-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'security'
                      ? 'border-amber-700 text-amber-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Security
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              
              {activeTab === 'profile' && (
                <form>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-800'
                      >
                      </button>
                    </div>
                  </div>
                </form>
              )}
              
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Password</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your password to keep your account secure.
                    </p>
                  </div>
                  
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-800"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Account Management</h3>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Sign Out From All Devices</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Sign out from all browsers and devices except this one.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Permanently delete your account and all associated data.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}