"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Collection } from '@/types/collections/Collection';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { collectionService } from '@/services/collectionService';

// Import and use framer-motion only in this client component
import dynamic from 'next/dynamic';

// Import ClientAnimations component with no server-side rendering
const ClientAnimations = dynamic(
  () => import('./ClientAnimations'),
  { ssr: false }
);

// Main page component
export default function CollectionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-8">Our Collections</h1>
          
          <CollectionsContent />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Collections content component that handles data fetching
function CollectionsContent() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch collections data from Appwrite using our service
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Using our collection service instead of direct database calls
        const collectionsData = await collectionService.getAllCollections();
        setCollections(collectionsData);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setError("Failed to load collections. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Dummy image URLs for collections without images - in a real app, these would be stored in the database
  const defaultImages = [
    "/images/landing_collection/living.jpg",
    "/images/landing_collection/dining.jpg",
    "/images/landing_collection/bed.jpg",
    "/images/landing_collection/office.jpg"
  ];

  // Loading state UI
  if (isLoading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-md shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error Loading Collections</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <p className="mt-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md transition-colors"
                  >
                    Try Again
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No collections found UI
  if (collections.length === 0) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-amber-50 mb-6">
              <svg className="h-12 w-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Collections Found</h3>
            <p className="text-gray-600 mb-6">We haven&apos;t set up any furniture collections yet.</p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-lg shadow-sm inline-flex items-center transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main content with collections - using ClientAnimations component
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto">
        <ClientAnimations 
          collections={collections} 
          defaultImages={defaultImages}
        />
      </div>
    </div>
  );
}