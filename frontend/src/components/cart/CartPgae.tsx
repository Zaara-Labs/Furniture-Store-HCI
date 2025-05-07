"use client";

import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartItemList from "./CartItemList";
import CartSummary from "./CartSummary";

export default function CartPage() {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-8">Your Cart</h1>
          
          {cartCount === 0 ? (
            <CartItemList />
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="lg:w-2/3">
                <CartItemList />
              </div>
              
              {/* Cart Summary */}
              <div className="lg:w-1/3">
                <CartSummary />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
