"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CartPage() {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(id);
    try {
      await updateQuantity(id, newQuantity);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setIsRemoving(id);
    try {
      await removeFromCart(id);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleCheckout = () => {
    if (user) {
      router.push('/checkout');
    } else {
      // For anonymous users, redirect to login with return URL
      router.push('/auth/login?redirect=/checkout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-8">Your Cart</h1>
          
          {cartCount === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
              <Link 
                href="/shop"
                className="inline-block px-6 py-3 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="lg:w-2/3">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="py-4 px-6 text-left">Product</th>
                        <th className="py-4 px-6 text-center">Quantity</th>
                        <th className="py-4 px-6 text-right">Price</th>
                        <th className="py-4 px-6 text-right">Total</th>
                        <th className="py-4 px-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover object-center"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No image</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <Link href={`/product/${item.productId}`} className="font-medium text-gray-800 hover:text-amber-800">
                                  {item.name}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center items-center">
                              <button 
                                onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                disabled={isUpdating === item.id}
                                className="p-1 border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className="w-12 text-center border-t border-b border-gray-300 p-1 focus:outline-none"
                                disabled={isUpdating === item.id}
                              />
                              <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={isUpdating === item.id}
                                className="p-1 border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-medium">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving === item.id}
                              className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                              aria-label="Remove item"
                            >
                              {isRemoving === item.id ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Cart Summary */}
              <div className="lg:w-1/3">
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
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 px-6 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                  >
                    {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                  </button>
                  
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
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}