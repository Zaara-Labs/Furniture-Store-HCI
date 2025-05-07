"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface WishlistItemProps {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  dateAdded: Date;
}

export default function WishlistItem({
  id,
  productId,
  name,
  price,
  image,
  slug,
  dateAdded
}: WishlistItemProps) {
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Safely format the price
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : '0.00';

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsRemoving(true);
    try {
      await removeFromWishlist(id);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    try {
      await addToCart({
        productId,
        name,
        // Ensure price is a number before adding to cart
        price: typeof price === 'number' ? price : 0,
        quantity: 1,
        image
      });
      
      toast.success(`${name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Format the date for display
  let timeAgo;
  try {
    timeAgo = formatDistanceToNow(new Date(dateAdded), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    timeAgo = "recently"; // Fallback if date is invalid
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group">
      <div className="relative">
        <Link href={`/product/${slug}`} className="block">
          <div className="aspect-square relative overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover object-center transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
        </Link>
        
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-90 rounded-full text-gray-600 hover:text-amber-800 transition-colors"
          aria-label="Remove from wishlist"
        >
          {isRemoving ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="p-4">
        <Link href={`/product/${slug}`} className="block">
          <h3 className="font-medium text-gray-800 mb-1 hover:text-amber-800 transition-colors truncate">{name}</h3>
        </Link>
        <p className="text-lg text-gray-900 font-medium mb-3">${formattedPrice}</p>
        
        <div className="flex justify-between items-center">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="bg-amber-800 text-white py-2 px-4 rounded-md hover:bg-amber-900 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed flex-1"
          >
            {isAddingToCart ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">Added {timeAgo}</p>
      </div>
    </div>
  );
}
