"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const orderData = sessionStorage.getItem('order');
    
    if (!orderData) {
      toast.error("No order information found");
      router.push("/");
      return;
    }
    
    try {
      const parsedOrder = JSON.parse(orderData);
      setOrder(parsedOrder);
    } catch (error) {
      console.error("Error parsing order data:", error);
      toast.error("Could not load order details");
      router.push("/");
    }
  }, [router]);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading order details...</div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(order.orderDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="text-center mb-8">
              <div className="mb-6 mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-serif font-medium mb-2">Thank You for Your Order!</h1>
              <p className="text-gray-600">Your order has been received and is now being processed.</p>
              
              <div className="mt-4 text-sm px-4 py-2 bg-amber-50 text-amber-800 inline-block rounded-md">
                Order Number: <span className="font-medium">{order.orderNumber}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Order Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Information</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.shipping.fullName}</p>
                    <p>{order.shipping.addressLine1}</p>
                    {order.shipping.addressLine2 && <p>{order.shipping.addressLine2}</p>}
                    <p>
                      {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}
                    </p>
                    <p>{order.shipping.country}</p>
                    <p className="mt-2">{order.shipping.phone}</p>
                    <p>{order.shipping.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Order Summary</h3>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-1">
                      <p>Order Date:</p>
                      <p>{formattedDate}</p>
                    </div>
                    <div className="flex justify-between mb-1">
                      <p>Payment Method:</p>
                      <p className="capitalize">
                        {order.payment.method === 'credit' ? 'Credit Card' : 
                         order.payment.method === 'debit' ? 'Debit Card' : 'PayPal'}
                      </p>
                    </div>
                    {(order.payment.method === 'credit' || order.payment.method === 'debit') && (
                      <div className="flex justify-between">
                        <p>Card ending in:</p>
                        <p>•••• {order.payment.last4}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Items</h3>
                
                <div className="divide-y divide-gray-200">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-3 flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium">${order.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-600">Shipping</p>
                    <p className="font-medium">
                      {order.shipping_cost === 0 ? 'Free' : `$${order.shipping_cost.toFixed(2)}`}
                    </p>
                  </div>
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-600">Tax</p>
                    <p className="font-medium">${order.tax.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                    <p className="font-medium">Total</p>
                    <p className="font-medium text-lg text-amber-800">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 text-center">
              <p className="text-gray-600 mb-6">
                We've sent a confirmation email to <span className="font-medium">{order.shipping.email}</span> with your order details.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link
                  href="/shop"
                  className="px-6 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                >
                  Continue Shopping
                </Link>
                
                <Link
                  href="/orders"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  View All Orders
                </Link>
              </div>
              
              <p className="mt-8 text-sm text-gray-500">
                Need help? Contact our <Link href="/contact" className="text-amber-800 hover:underline">customer support team</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}