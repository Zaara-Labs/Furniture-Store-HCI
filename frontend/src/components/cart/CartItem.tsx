"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  slug: string;
  image?: string;
  variant_index?: number;
}

export default function CartItem({ id, productId, name, price, quantity, image, slug }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateQuantity(id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center py-6 border-b border-gray-200">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
      </div>
      
      <div className="ml-4 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <Link href={`/product/${slug}`} className="hover:text-amber-800">
              <h3>{name}</h3>
            </Link>
            <p className="ml-4">${price.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
            >
              -
            </button>
            <span className="px-3 py-1 border-x border-gray-300">{quantity}</span>
            <button
              type="button"
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
            >
              +
            </button>
          </div>
          
          <div className="flex">
            <button
              type="button"
              className="font-medium text-amber-800 hover:text-amber-700 flex items-center disabled:opacity-50"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
