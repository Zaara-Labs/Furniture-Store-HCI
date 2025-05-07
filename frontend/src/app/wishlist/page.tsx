"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WishlistItem from "@/components/wishlist/WishlistItem";
import WishlistEmpty from "@/components/wishlist/WishlistEmpty";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlistItems, wishlistCount, clearWishlist, isLoading } = useWishlist();
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [sortBy, setSortBy] = useState("dateAdded"); // dateAdded or name or price

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      setIsClearingAll(true);
      try {
        await clearWishlist();
      } finally {
        setIsClearingAll(false);
      }
    }
  };

  // Sort items based on selected criteria
  const sortedItems = [...wishlistItems].sort((a, b) => {
    if (sortBy === "dateAdded") {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "price") {
      return a.price - b.price;
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-serif font-medium">My Wishlist</h1>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-serif font-medium">My Wishlist ({wishlistCount})</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-sm text-gray-600">Sort by:</label>
                <select 
                  id="sort" 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="dateAdded">Latest Added</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                </select>
              </div>
              
              {wishlistCount > 0 && (
                <button 
                  onClick={handleClearAll}
                  disabled={isClearingAll}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center transition-colors"
                >
                  {isClearingAll ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {wishlistCount === 0 ? (
            <WishlistEmpty />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    id={item.id}
                    productId={item.productId}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                    slug={item.slug}
                    dateAdded={item.dateAdded}
                  />
                ))}
              </div>
              
              <div className="mt-10 text-center">
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2 bg-white border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
