"use client";

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

export default function CartNotification() {
  const { lastAddedItem } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (lastAddedItem) {
      setIsVisible(true);
      
      // Hide notification after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem]);
  
  if (!lastAddedItem) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 max-w-sm w-full"
        >
          <div className="flex items-start">
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              aria-label="Close notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative mr-4">
              {lastAddedItem.image ? (
                <Image 
                  src={lastAddedItem.image}
                  alt={lastAddedItem.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Added to Cart
              </p>
              <p className="text-sm text-gray-700 truncate mb-1">
                {lastAddedItem.name}
              </p>
              <p className="text-xs text-gray-500">
                Qty: {lastAddedItem.quantity} × ${lastAddedItem.price.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end space-x-2">
            <button
              onClick={() => setIsVisible(false)}
              className="text-amber-800 hover:text-amber-900 text-sm"
            >
              Continue Shopping
            </button>
            <Link
              href="/cart"
              className="bg-amber-800 text-white text-sm px-4 py-1 rounded-md hover:bg-amber-900"
            >
              View Cart
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
