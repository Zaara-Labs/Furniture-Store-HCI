"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/types/collections/Collection';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { collectionService } from '@/services/collectionService';
import { motion } from 'framer-motion';

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
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Main content with collections
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-serif font-medium mb-4">Explore Our Furniture Collections</h2>
          <p className="max-w-3xl mx-auto text-gray-600">
            Discover our carefully curated furniture collections designed to transform your home into a stylish and functional space.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {collections.map((collection, index) => (
            <motion.div key={collection.$id} variants={itemVariants}>
              <Link href={`/shop?collection=${collection.slug}`}>
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-[4/3] relative bg-gray-100">
                    <Image 
                      src={collection.image || defaultImages[index % defaultImages.length]} 
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-medium mb-2">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-sm text-white text-opacity-90">{collection.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-amber-800 font-medium">Explore Collection</span>
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 transform group-hover:translate-x-1 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action at the bottom */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="mb-6 text-gray-600">
            Can&apos;t find what you&apos;re looking for? Browse our full product catalog.
          </p>
          <Link 
            href="/shop" 
            className="inline-block px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
          >
            View All Products
          </Link>
        </motion.div>
      </div>
    </div>
  );
}