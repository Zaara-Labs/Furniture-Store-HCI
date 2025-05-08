"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

// Import client-only components with dynamic imports
const RoomDesignerContent = dynamic(
  () => import('./ClientComponents'),
  { ssr: false, loading: () => <LoadingState /> }
);

// Simple loading component
function LoadingState() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-screen pt-24">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading room designer...</p>
      </div>
    </div>
  );
}

// Component that uses useSearchParams must be wrapped in Suspense
function RoomDesignerWithParams() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { user } = useAuth();

  return <RoomDesignerContent projectId={projectId} user={user} />;
}

export default function DesignerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Suspense fallback={<LoadingState />}>
        <RoomDesignerWithParams />
      </Suspense>
    </div>
  );
}