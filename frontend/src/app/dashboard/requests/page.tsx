"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/context/AuthContext';

// Mock data for customer requests (in a real app, this would come from your database)
const mockRequests = [
  {
    id: '1',
    client: 'Emma Thompson',
    email: 'emma@example.com',
    requestType: 'Design Consultation',
    status: 'New',
    message: 'I need help designing my living room with your furniture pieces. Looking for a modern aesthetic.',
    date: '2025-05-06',
    isRead: false
  },
  {
    id: '2',
    client: 'David Chen',
    email: 'david@example.com',
    requestType: 'Custom Order',
    status: 'In Progress',
    message: 'I\'d like to order a custom dining table that matches the chairs I purchased last month.',
    date: '2025-05-04',
    isRead: true
  },
  {
    id: '3',
    client: 'Sarah Johnson',
    email: 'sarah@example.com',
    requestType: 'Design Consultation',
    status: 'New',
    message: 'I need assistance planning my home office with space-saving furniture options.',
    date: '2025-05-03',
    isRead: false
  },
  {
    id: '4',
    client: 'Michael Rodriguez',
    email: 'michael@example.com',
    requestType: 'Product Inquiry',
    status: 'Completed',
    message: 'I\'m interested in the Meridian Coffee Table but would like to know if it comes in other wood finishes.',
    date: '2025-05-01',
    isRead: true
  }
];

export default function CustomerRequests() {
  const [requests, setRequests] = useState(mockRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/auth/login?redirect=/dashboard/requests');
    }
  }, [loading, user, router]);

  // Filter requests based on status
  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(request => request.status.toLowerCase() === filterStatus.toLowerCase());

  const markAsRead = (id) => {
    setRequests(prev => prev.map(request => 
      request.id === id ? { ...request, isRead: true } : request
    ));
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeBadge = (type) => {
    switch(type.toLowerCase()) {
      case 'design consultation':
        return 'bg-purple-100 text-purple-800';
      case 'custom order':
        return 'bg-amber-100 text-amber-800';
      case 'product inquiry':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const newRequestsCount = requests.filter(request => !request.isRead).length;

  return (
    <RoleBasedRoute allowedRoles={['designer']}>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Customer Requests</h1>
              <p className="mt-2 text-gray-600">
                Manage design consultations, custom orders, and product inquiries
                {newRequestsCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {newRequestsCount} new
                  </span>
                )}
              </p>
            </div>
            
            <div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
              >
                <option value="all">All Requests</option>
                <option value="new">New</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-700"></div>
            </div>
          ) : (
            <>
              {filteredRequests.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customer requests found</h3>
                  <p className="text-gray-500">
                    {filterStatus === 'all' 
                      ? 'You haven\'t received any customer requests yet.' 
                      : `You don't have any ${filterStatus} requests.`}
                  </p>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <li 
                        key={request.id} 
                        className={`${!request.isRead ? 'bg-amber-50' : ''}`}
                      >
                        <Link 
                          href={`/dashboard/requests/${request.id}`} 
                          className="block hover:bg-gray-50"
                          onClick={() => markAsRead(request.id)}
                        >
                          <div className="px-6 py-4">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-900">{request.client}</p>
                                {!request.isRead && (
                                  <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{new Date(request.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRequestTypeBadge(request.requestType)}`}>
                                {request.requestType}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{request.message}</p>
                            <p className="mt-1 text-xs text-gray-500 truncate">{request.email}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}