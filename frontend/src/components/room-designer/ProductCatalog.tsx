"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/collections/Product';
import { roomPresets } from '@/utils/roomUtils';
import { RoomSettings } from '@/types/room-designer';

interface ProductCatalogProps {
  products: Product[];
  isLoading: boolean;
  currentProductId: string | null;
  onAddFurniture: (product: Product) => void;
  onApplyRoomPreset: (settings: RoomSettings) => void;
}

const ProductCatalog = ({
  products,
  isLoading,
  currentProductId,
  onAddFurniture,
  onApplyRoomPreset
}: ProductCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on search query
  const filteredProducts = products
    .filter(product => product.model_3d_url)
    .filter(product =>
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="md:w-[30%] bg-white p-4 overflow-y-auto h-[40vh] md:h-auto border-l border-t md:border-t-0 border-gray-300 shadow-sm flex flex-col">
      <h2 className="font-medium text-lg mb-4 text-amber-800 border-b pb-2 border-amber-100 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        </svg>
        Add Furniture
      </h2>
      
      {/* Search bar */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search furniture..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
        />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 absolute left-3 top-3 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')} 
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Product list */}
      <div className="flex-grow overflow-y-auto mb-4 px-2 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-800 mb-2"></div>
              <p className="text-sm text-gray-500">Loading furniture...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 mb-2">No furniture matches your search</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-2 text-amber-700 underline text-sm hover:text-amber-900"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <div 
                key={product.$id} 
                className={`bg-white rounded-lg border hover:shadow-md transition-all p-2 cursor-pointer 
                  ${currentProductId === product.$id ? 'ring-2 ring-amber-500 border-transparent shadow-sm' : 'border-gray-200 hover:border-amber-200'}`}
                onClick={() => onAddFurniture(product)}
              >
                <div className="aspect-square relative mb-2 rounded-md overflow-hidden bg-gray-100 group">
                  {product.main_image_url ? (
                    <>
                      <Image 
                        src={product.main_image_url}
                        alt={product.name}
                        fill
                        className="object-cover rounded group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 50vw, 15vw"
                      />
                      <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                        <button className="bg-amber-700 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <p className="text-xs text-amber-700 font-medium">${product.variation_prices ? product.variation_prices[0] : 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Room presets */}
      <div className="border-t border-gray-100 pt-4 mt-auto">
        <h3 className="font-medium text-sm mb-3 text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Room Presets
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {roomPresets.slice(0, 4).map((preset, index) => (
            <button 
              key={index}
              className="border border-gray-200 hover:border-amber-300 p-3 rounded-lg hover:bg-amber-50 transition-all text-left"
              onClick={() => onApplyRoomPreset(preset)}
            >
              <div className="flex items-center">
                <span 
                  className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                  style={{ backgroundColor: preset.wallColor }}
                ></span>
                <span className="text-sm font-medium">{preset.name}</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">{preset.width}m × {preset.length}m space</p>
            </button>
          ))}
        </div>
      
        <div className="mt-4 text-center">
          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center px-4 py-2 text-amber-800 border border-amber-300 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            Browse More Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;