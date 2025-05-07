"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import designProjectService from '@/services/designProjectService';

type DesignProjectProps = {
  $id: string;
  name: string;
  status: string;
  createdAt: string;
  description?: string;
  thumbnailUrl?: string;
};

export default function DesignProjects() {
  const [projects, setProjects] = useState<DesignProjectProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch recent design projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      if (user && user.$id) {
        try {
          const fetchedProjects = await designProjectService.getDesignerProjects(user.$id);
          // Only show the most recent 3 projects in the dashboard widget
          setProjects(fetchedProjects.slice(0, 3));
        } catch (error) {
          console.error('Error fetching design projects:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles: Record<string, string> = {
      'Draft': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Active Design Projects</h2>
      </div>
      <div className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-700"></div>
          </div>
        ) : projects.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {projects.map((project) => (
              <li key={project.$id}>
                <Link href={`/room-designer?projectId=${project.$id}`} className="block hover:bg-gray-50">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-amber-800 truncate">{project.name}</p>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="mt-2 flex justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {project.description || 'No description'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No active design projects
          </div>
        )}
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <Link href="/dashboard/designs" className="text-sm font-medium text-amber-800 hover:text-amber-700">
          View all projects →
        </Link>
      </div>
    </div>
  );
}