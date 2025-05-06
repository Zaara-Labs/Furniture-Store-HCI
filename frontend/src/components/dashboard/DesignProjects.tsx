"use client";

import React from 'react';
import Link from 'next/link';

type DesignProjectProps = {
  id: string;
  name: string;
  customer: string;
  status: 'in-progress' | 'review' | 'completed';
  lastUpdated: string;
};

const projects: DesignProjectProps[] = [
  {
    id: 'proj-1',
    name: 'Living Room Modern Setup',
    customer: 'James Wilson',
    status: 'in-progress',
    lastUpdated: '2 days ago'
  },
  {
    id: 'proj-2',
    name: 'Office Workspace Redesign',
    customer: 'Sarah Miller',
    status: 'review',
    lastUpdated: '1 day ago'
  },
  {
    id: 'proj-3',
    name: 'Bedroom Furniture Set',
    customer: 'Robert Johnson',
    status: 'completed',
    lastUpdated: '3 days ago'
  },
  {
    id: 'proj-4',
    name: 'Kitchen Cabinet Setup',
    customer: 'Emily Davis',
    status: 'in-progress',
    lastUpdated: '5 hours ago'
  }
];

export default function DesignProjects() {
  // Status badge component
  const StatusBadge = ({ status }: { status: DesignProjectProps['status'] }) => {
    const statusStyles = {
      'in-progress': 'bg-blue-100 text-blue-800',
      'review': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    };

    const statusLabel = {
      'in-progress': 'In Progress',
      'review': 'Under Review',
      'completed': 'Completed'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[status]}`}>
        {statusLabel[status]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Active Design Projects</h2>
      </div>
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/dashboard/designs/${project.id}`} className="block hover:bg-gray-50">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-amber-800 truncate">{project.name}</p>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mt-2 flex justify-between">
                    <p className="text-sm text-gray-600">
                      Customer: {project.customer}
                    </p>
                    <p className="text-sm text-gray-500">
                      Updated {project.lastUpdated}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <Link href="/dashboard/designs" className="text-sm font-medium text-amber-800 hover:text-amber-700">
          View all projects →
        </Link>
      </div>
    </div>
  );
}