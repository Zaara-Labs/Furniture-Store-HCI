"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/types/collections/Collection';
import { motion } from 'framer-motion';

// Props interface
interface ClientAnimationsProps {
  collections: Collection[];
  defaultImages: string[];
}

const ClientAnimations: React.FC<ClientAnimationsProps> = ({ collections, defaultImages }) => {
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

  return (
    <>
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
                <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                  {/* Container that holds both image and overlay - apply the scaling effect here */}
                  <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700">
                    <Image 
                      src={collection.image || defaultImages[index % defaultImages.length]} 
                      alt={collection.name}
                      fill
                      className="object-cover"
                      priority={index < 2}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all"></div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
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
    </>
  );
};

export default ClientAnimations;