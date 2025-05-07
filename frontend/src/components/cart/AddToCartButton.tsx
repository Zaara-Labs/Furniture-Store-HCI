"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { Product } from "@/types/collections/Product";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'outlined' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  onSuccess?: () => void;
  showQuantityBadge?: boolean;
  variantIndex?: number; // Add variant index prop
}

export default function AddToCartButton({
  product,
  quantity = 1,
  className = "",
  showText = true,
  variant = 'default',
  size = 'md',
  onSuccess,
  showQuantityBadge = false,
  variantIndex = 0, // Default to first variant
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  
  // Get the current quantity in cart for badge display
  const quantityInCart = getItemQuantity(product.$id);
  // Check if this specific product + variant combination is in cart
  const isAlreadyInCart = isInCart(product.$id, variantIndex);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding || !product) return;

    // Check if the product has a stock_quantity and it's zero
    if (product.stock_quantity !== undefined && product.stock_quantity <= 0) {
      toast.error("Sorry, this product is out of stock");
      return;
    }

    if (isAlreadyInCart) {
      toast.success("Item already in cart");
    }

    setIsAdding(true);
    try {
      // Extract the price correctly based on the variant index
      let price = 0;
      
      if (product.variation_prices && product.variation_prices.length > variantIndex) {
        // Use the price for the selected variant
        price = product.variation_prices[variantIndex];
      } else if (Array.isArray(product.price)) {
        // Fallback to first price in array
        price = product.price[0] || 0;
      } else {
        // Fallback to regular price
        price = typeof product.price === 'number' ? product.price : 0;
      }

      // Get variant name if available
      let variantName = '';
      if (product.variation_names && product.variation_names.length > variantIndex) {
        variantName = product.variation_names[variantIndex];
      }

      // Get the appropriate image for this variant if available
      const image = 
        (product.variation_images && product.variation_images.length > variantIndex) 
          ? product.variation_images[variantIndex] 
          : (product.main_image_url || "");

      await addToCart({
        productId: product.$id,
        name: variantName ? `${product.name} - ${variantName}` : product.name,
        price: price,
        quantity: quantity,
        image: image,
        slug: product.slug || "",
        variant_index: variantIndex, // Add variant information
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      // Small delay for better UI feedback
      setTimeout(() => setIsAdding(false), 300);
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
    default: 'bg-amber-800 text-white hover:bg-amber-900',
    outlined: 'bg-transparent border border-amber-800 text-amber-800 hover:bg-amber-50',
    'icon-only': 'bg-amber-800 text-white hover:bg-amber-900'
  };

  const buttonClass = `
    rounded-md transition-all flex items-center justify-center relative
    disabled:opacity-70 disabled:cursor-not-allowed 
    ${sizeClasses[size]} 
    ${variantClasses[variant]}
    ${isAlreadyInCart && variant === 'default' ? 'bg-amber-900' : ''}
    ${className}
  `;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || isAlreadyInCart}
      className={buttonClass}
      aria-label={isAlreadyInCart ? "Already in cart" : "Add to cart"}
      title={isAlreadyInCart ? "Already in cart" : "Add to cart"}
    >
      {isAdding ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
        { isAlreadyInCart?
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          :
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
          </svg>
          }
          {showText && (
            <span className="ml-2">
              {isAlreadyInCart ? "Already in Cart" : "Add to Cart"}
            </span>
          )}
          
          {/* Quantity badge for items already in cart */}
          {showQuantityBadge && isAlreadyInCart && (
            <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {quantityInCart}
            </span>
          )}
        </>
      )}
    </button>
  );
}
