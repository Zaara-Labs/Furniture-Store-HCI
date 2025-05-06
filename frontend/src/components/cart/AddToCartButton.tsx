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
}

export default function AddToCartButton({
  product,
  quantity = 1,
  className = "",
  showText = true,
  variant = 'default',
  size = 'md',
  onSuccess,
  showQuantityBadge = false
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  
  // Get the current quantity in cart for badge display
  const quantityInCart = getItemQuantity(product.$id);
  const isAlreadyInCart = quantityInCart > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding || !product) return;

    // Check if the product has a stock_quantity and it's zero
    if (product.stock_quantity !== undefined && product.stock_quantity <= 0) {
      toast.error("Sorry, this product is out of stock");
      return;
    }

    setIsAdding(true);
    try {
      // Extract the price correctly regardless of whether it's an array or single value
      const price = Array.isArray(product.price) 
        ? product.price[0] 
        : (typeof product.price === 'number' ? product.price : 0);

      await addToCart({
        productId: product.$id,
        name: product.name,
        price: price,
        quantity: quantity,
        image: product.main_image_url || ""
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
      disabled={isAdding}
      className={buttonClass}
      aria-label={isAlreadyInCart ? "Add more to cart" : "Add to cart"}
      title={isAlreadyInCart ? "Add more to cart" : "Add to cart"}
    >
      {isAdding ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
          </svg>
          {showText && (
            <span className="ml-2">
              {isAlreadyInCart ? "Add more" : "Add to Cart"}
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
