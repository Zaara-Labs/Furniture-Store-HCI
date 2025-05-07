"use client";

import { useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "react-hot-toast";
import { Product } from "@/types/collections/Product";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'outlined' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  onSuccess?: () => void;
}

export default function WishlistButton({
  product,
  className = "",
  showText = true,
  variant = 'default',
  size = 'md',
  onSuccess
}: WishlistButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } = useWishlist();
  
  // Check if product is already in wishlist
  const isItemInWishlist = isInWishlist(product.$id);

  // Helper function to safely get product price
  const getProductPrice = () => {
    // If product.price is a single number, use that
    if (typeof product.price === 'number') {
      return product.price;
    }
    
    // If product has variation_prices and it's an array, use the selected one or first one
    if (product.variation_prices && Array.isArray(product.variation_prices) && product.variation_prices.length > 0) {
      return product.variation_prices[0];
    }
    
    // If product.price is an array, use the first element
    if (Array.isArray(product.price) && product.price.length > 0) {
      return product.price[0];
    }
    
    // Fallback to 0 if no valid price is found
    return 0;
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (isItemInWishlist) {
        // Find the item ID to remove
        const itemToRemove = wishlistItems.find(item => item.productId === product.$id);
        if (itemToRemove) {
          await removeFromWishlist(itemToRemove.id);
        }
      } else {
        // Get the correctly formatted price
        const price = getProductPrice();
        
        await addToWishlist({
          productId: product.$id,
          name: product.name,
          price: price,
          image: product.main_image_url || "",
          slug: product.slug,
        });
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      // Small delay for better UI feedback
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  // Variant classes
  const variantClasses = {
    default: isItemInWishlist 
      ? 'bg-amber-50 text-amber-800 border border-amber-800 hover:bg-amber-100' 
      : 'bg-transparent border border-gray-300 text-gray-700 hover:border-amber-800 hover:text-amber-800',
    outlined: 'bg-transparent border border-amber-800 text-amber-800 hover:bg-amber-50',
    'icon-only': isItemInWishlist 
      ? 'text-amber-800 hover:text-amber-900' 
      : 'text-gray-500 hover:text-amber-800'
  };

  const buttonClass = `
    rounded-md transition-all flex items-center justify-center 
    disabled:opacity-70 disabled:cursor-not-allowed
    ${sizeClasses[size]} 
    ${variantClasses[variant]}
    ${variant === 'icon-only' ? '' : 'min-w-[100px]'}
    ${className}
  `;

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={isProcessing}
      className={buttonClass}
      aria-label={isItemInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      title={isItemInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      type="button"
    >
      {isProcessing ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {isItemInWishlist ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          
          {showText && variant !== 'icon-only' && (
            <span className="ml-2">
              {isItemInWishlist ? "Wishlisted" : "Wishlist"}
            </span>
          )}
        </>
      )}
    </button>
  );
}
