"use client";

import { useCart } from "@/context/CartContext";
import CheckoutButton from "./CheckoutButton";
import Link from "next/link";

interface CartSummaryProps {
  showCheckoutButton?: boolean;
}

export default function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const { cartCount, cartTotal } = useCart();
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-lg font-medium mb-6">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <p className="text-gray-600">Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</p>
          <p className="font-medium">${cartTotal.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-600">Shipping</p>
          <p className="font-medium">Calculated at checkout</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-600">Tax</p>
          <p className="font-medium">Calculated at checkout</p>
        </div>
        <div className="border-t pt-4 flex justify-between">
          <p className="font-medium">Total</p>
          <p className="font-medium">${cartTotal.toFixed(2)}</p>
        </div>
      </div>
      
      {showCheckoutButton && <CheckoutButton />}
      
      <div className="mt-6">
        <Link
          href="/shop"
          className="text-amber-800 hover:text-amber-900 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
