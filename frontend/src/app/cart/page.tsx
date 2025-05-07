"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartItemList from "@/components/cart/CartItemList";
import CartSummary from "@/components/cart/CartSummary";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-8">Your Cart</h1>
          
          {/* We'll use the CartItemList component which already handles empty cart state */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items - always shown (handles empty state internally) */}
            <div className={cartCount > 0 ? "lg:w-2/3" : "w-full"}>
              <CartItemList />
            </div>
            
            {/* Cart Summary - only shown when there are items */}
            {cartCount > 0 && (
              <div className="lg:w-1/3">
                <CartSummary />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}