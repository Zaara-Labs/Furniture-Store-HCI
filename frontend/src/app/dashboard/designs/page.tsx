"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/context/AuthContext';

// Mock data for design projects (in a real app, this would come from your database)
const mockProjects = [
  {
    id: '1',
    name: 'Modern Living Room',
    client: 'Emma Thompson',
    status: 'In Progress',
    lastUpdated: '2025-05-01',
    thumbnailUrl: '/images/living-room.jpg'
  },
  {
    id: '2',
    name: 'Minimalist Bedroom',
    client: 'David Chen',
    status: 'Completed',
    lastUpdated: '2025-04-28',
    thumbnailUrl: '/images/bedroom.jpg'
  },
  {
    id: '3',
    name: 'Executive Office',
    client: 'Sarah Johnson',
    status: 'Pending Review',
    lastUpdated: '2025-04-25',
    thumbnailUrl: '/images/office.jpg'
  },
  {
    id: '4',
    name: 'Urban Dining Space',
    client: 'Michael Rodriguez',
    status: 'Completed',
    lastUpdated: '2025-04-20',
    thumbnailUrl: '/images/dining.jpg'
  }
];

export default function DesignProjects() {
  const [projects, setProjects] = useState(mockProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/auth/login?redirect=/dashboard/designs');
    }
  }, [loading, user, router]);

  // Filter projects based on status
  const filteredProjects = filterStatus === 'all' 
    ? projects 
    : projects.filter(project => project.status.toLowerCase() === filterStatus);

  const handleCreateNewDesign = () => {
    // In a real implementation, this would navigate to a design creation page
    router.push('/dashboard/designs/new');
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <RoleBasedRoute allowedRoles={['designer']}>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Design Projects</h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Projects</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="pending review">Pending Review</option>
                </select>
              </div>

              <button 
                onClick={handleCreateNewDesign}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-md shadow-sm flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Design
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-700"></div>
            </div>
          ) : (
            <>
              {filteredProjects.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No design projects found</h3>
                  <p className="text-gray-500 mb-6">
                    {filterStatus === 'all' 
                      ? 'You haven\'t created any design projects yet.' 
                      : `You don't have any ${filterStatus} projects.`}
                  </p>
                  <button 
                    onClick={handleCreateNewDesign}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-800"
                  >
                    Create your first design
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <Link 
                      key={project.id}
                      href={`/dashboard/designs/${project.id}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative h-48 w-full">
                        {project.thumbnailUrl ? (
                          <Image
                            src={project.thumbnailUrl}
                            alt={project.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 22V12h6v10" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Client: {project.client}</p>
                        <p className="mt-3 text-sm text-gray-500">Last updated: {new Date(project.lastUpdated).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}