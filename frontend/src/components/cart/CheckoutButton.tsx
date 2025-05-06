"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutButton() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      if (user) {
        // User is logged in, proceed to checkout
        router.push('/checkout');
      } else {
        // User is not logged in, redirect to login with return URL
        router.push('/auth/login?redirect=/checkout');
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full py-3 px-6 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors disabled:opacity-70 flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : user ? (
        'Proceed to Checkout'
      ) : (
        'Sign in to Checkout'
      )}
    </button>
  );
}
