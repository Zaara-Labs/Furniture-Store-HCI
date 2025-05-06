"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/context/AuthContext';

export default function DesignerSettings() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
    specialization: '',
    yearsOfExperience: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newRequests: true,
    projectUpdates: true,
    marketingEmails: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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
        bio: user.bio || '',
        specialization: user.specialization || '',
        yearsOfExperience: user.yearsOfExperience || '',
      });
    }
  }, [loading, user, router]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // In a real app, this would update the user profile in the backend
      // await updateUserProfile(profileForm);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // In a real app, this would update notification settings in the backend
      // await updateNotificationSettings(notificationSettings);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

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
              {saveSuccess && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Your changes have been saved successfully.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit}>
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
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Designer Bio
                      </label>
                      <textarea
                        id="bio"
                        rows={4}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Brief description for your designer profile. This will be visible to customers.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                        Design Specialization
                      </label>
                      <select
                        id="specialization"
                        value={profileForm.specialization}
                        onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      >
                        <option value="">Select a specialization</option>
                        <option value="interior">Interior Design</option>
                        <option value="furniture">Furniture Design</option>
                        <option value="commercial">Commercial Spaces</option>
                        <option value="residential">Residential Spaces</option>
                        <option value="sustainable">Sustainable Design</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="yearsOfExperience"
                        min="0"
                        value={profileForm.yearsOfExperience}
                        onChange={(e) => setProfileForm({...profileForm, yearsOfExperience: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          isSaving ? 'bg-amber-400' : 'bg-amber-700 hover:bg-amber-800'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
              
              {activeTab === 'notifications' && (
                <form onSubmit={handleNotificationSubmit}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Email Notifications</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage how and when you receive email notifications.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="emailNotifications"
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings, 
                              emailNotifications: e.target.checked
                            })}
                            className="focus:ring-amber-500 h-4 w-4 text-amber-700 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                            Email Notifications
                          </label>
                          <p className="text-gray-500">Receive notifications via email.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="newRequests"
                            type="checkbox"
                            checked={notificationSettings.newRequests}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings, 
                              newRequests: e.target.checked
                            })}
                            className="focus:ring-amber-500 h-4 w-4 text-amber-700 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="newRequests" className="font-medium text-gray-700">
                            New Customer Requests
                          </label>
                          <p className="text-gray-500">Get notified when a new customer request is submitted.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="projectUpdates"
                            type="checkbox"
                            checked={notificationSettings.projectUpdates}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings, 
                              projectUpdates: e.target.checked
                            })}
                            className="focus:ring-amber-500 h-4 w-4 text-amber-700 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="projectUpdates" className="font-medium text-gray-700">
                            Project Updates
                          </label>
                          <p className="text-gray-500">Get notified about updates to your design projects.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="marketingEmails"
                            type="checkbox"
                            checked={notificationSettings.marketingEmails}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings, 
                              marketingEmails: e.target.checked
                            })}
                            className="focus:ring-amber-500 h-4 w-4 text-amber-700 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="marketingEmails" className="font-medium text-gray-700">
                            Marketing Emails
                          </label>
                          <p className="text-gray-500">Receive marketing and promotional emails about new features and events.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          isSaving ? 'bg-amber-400' : 'bg-amber-700 hover:bg-amber-800'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save Preferences'}
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