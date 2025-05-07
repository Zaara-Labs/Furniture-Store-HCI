"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/context/AuthContext';
import designProjectService, { DesignProject } from '@/services/designProjectService';

export default function DesignProjects() {
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, loading } = useAuth();
  const router = useRouter();

  // Fetch design projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      if (user && user.$id) {
        try {
          const fetchedProjects = await designProjectService.getDesignerProjects(user.$id);
          setProjects(fetchedProjects);
        } catch (error) {
          console.error('Error fetching design projects:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchProjects();
    } else if (!loading) {
      // If not loading and no user, redirect to login
      router.push('/auth/login?redirect=/dashboard/designs');
    }
  }, [user, loading, router]);

  // Filter projects based on status
  const filteredProjects = filterStatus === 'all' 
    ? projects 
    : projects.filter(project => project.status.toLowerCase() === filterStatus.toLowerCase());

  const handleCreateNewDesign = () => {
    // Navigate to the room designer to create a new project
    router.push('/room-designer');
  };

  const handleDeleteProject = async (event: React.MouseEvent, projectId: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this design project? This action cannot be undone.')) {
      setIsLoading(true);
      
      try {
        // Find the project to get the thumbnail URL
        const projectToDelete = projects.find(project => project.$id === projectId);
        
        // Delete thumbnail if it exists
        if (projectToDelete?.thumbnailUrl) {
          await designProjectService.deleteThumbnail(projectToDelete.thumbnailUrl);
        }
        
        // Delete the project
        await designProjectService.deleteProject(projectId);
        
        // Remove the deleted project from state
        setProjects(projects.filter(project => project.$id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete the project. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
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
                  <option value="Draft">Draft</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
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
                    <div
                      key={project.$id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative group"
                    >
                      <Link href={`/room-designer?projectId=${project.$id}`}>
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
                          <p className="mt-1 text-sm text-gray-500">{project.description || 'No description'}</p>
                          <p className="mt-3 text-sm text-gray-500">
                            {project.createdAt ? `Created: ${new Date(project.createdAt).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                      </Link>
                      
                      {/* Delete button that appears on hover */}
                      <button
                        onClick={(e) => project.$id && handleDeleteProject(e, project.$id)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        aria-label="Delete project"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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