"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";

// Form data types
type PaymentFormData = {
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  paymentMethod: string;
};

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState<any>(null);

  // Initialize form with react-hook-form
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PaymentFormData>({
    defaultValues: {
      cardHolderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      paymentMethod: "credit"
    }
  });

  // Get payment method
  const paymentMethod = watch("paymentMethod");

  // Redirect if cart is empty or shipping details don't exist
  useEffect(() => {
    // Check for saved shipping details
    const savedShippingDetails = sessionStorage.getItem('shippingDetails');
    
    if (!savedShippingDetails) {
      toast.error("Please fill shipping details first");
      router.push("/checkout");
      return;
    }
    
    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }
    
    setShippingDetails(JSON.parse(savedShippingDetails));
  }, [cartItems.length, router]);

  // Handle form submission - simulate payment processing
  const onSubmit = (data: PaymentFormData) => {
    setIsLoading(true);
    
    // Store payment method and last 4 digits
    const paymentDetails = {
      method: data.paymentMethod,
      last4: data.cardNumber.slice(-4),
      cardHolder: data.cardHolderName
    };
    
    // Generate a unique order number
    const orderNumber = `FAB-${Math.floor(Math.random() * 900000) + 100000}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    // Create order object with all needed details
    const order = {
      orderNumber,
      orderDate: new Date().toISOString(),
      items: cartItems,
      shipping: shippingDetails,
      payment: paymentDetails,
      subtotal: cartTotal,
      shipping_cost: cartTotal > 100 ? 0 : 10,
      tax: cartTotal * 0.1,
      total: cartTotal + (cartTotal > 100 ? 0 : 10) + (cartTotal * 0.1)
    };
    
    // Simulate payment processing delay
    setTimeout(() => {
      try {
        // Store order in session storage for confirmation page
        sessionStorage.setItem('order', JSON.stringify(order));
        
        // Navigate to confirmation page
        router.push('/checkout/confirmation');
        
        // Clear cart after successful payment
        clearCart();
      } catch (error) {
        console.error("Error processing payment:", error);
        toast.error("Payment processing failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 2000); // 2 second artificial delay
  };

  // Calculate order totals
  const shippingCost = cartTotal > 100 ? 0 : 10;
  const taxAmount = cartTotal * 0.1;
  const orderTotal = cartTotal + shippingCost + taxAmount;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-8">Payment</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Payment Form */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-medium mb-6">Payment Information</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Payment method selection */}
                  <div className="space-y-4">
                    <p className="font-medium text-gray-700 mb-2">Select Payment Method</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <input 
                          id="credit-card" 
                          type="radio"
                          value="credit"
                          {...register("paymentMethod")}
                          className="sr-only"
                        />
                        <label 
                          htmlFor="credit-card"
                          className={`flex flex-col items-center p-4 border rounded-md cursor-pointer transition-all ${paymentMethod === 'credit' ? 'border-amber-800 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <span className="text-gray-700 font-medium">Credit Card</span>
                          <span className="text-xs text-gray-500 mt-1">Visa, Mastercard, Amex</span>
                        </label>
                      </div>
                      
                      <div className="relative">
                        <input 
                          id="debit-card" 
                          type="radio"
                          value="debit"
                          {...register("paymentMethod")}
                          className="sr-only"
                        />
                        <label 
                          htmlFor="debit-card"
                          className={`flex flex-col items-center p-4 border rounded-md cursor-pointer transition-all ${paymentMethod === 'debit' ? 'border-amber-800 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <span className="text-gray-700 font-medium">Debit Card</span>
                          <span className="text-xs text-gray-500 mt-1">Direct from your bank</span>
                        </label>
                      </div>
                      
                      <div className="relative">
                        <input 
                          id="paypal" 
                          type="radio"
                          value="paypal"
                          {...register("paymentMethod")}
                          className="sr-only"
                        />
                        <label 
                          htmlFor="paypal"
                          className={`flex flex-col items-center p-4 border rounded-md cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-amber-800 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <span className="text-gray-700 font-medium">PayPal</span>
                          <span className="text-xs text-gray-500 mt-1">Pay with PayPal</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Details */}
                  {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name *
                        </label>
                        <input
                          id="cardHolderName"
                          type="text"
                          {...register("cardHolderName", { 
                            required: "Cardholder name is required" 
                          })}
                          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                          placeholder="John Doe"
                        />
                        {errors.cardHolderName && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardHolderName.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number *
                        </label>
                        <input
                          id="cardNumber"
                          type="text"
                          {...register("cardNumber", { 
                            required: "Card number is required",
                            pattern: {
                              value: /^[0-9]{13,19}$/,
                              message: "Please enter a valid card number"
                            }
                          })}
                          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                        {errors.cardNumber && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date *
                          </label>
                          <input
                            id="expiryDate"
                            type="text"
                            {...register("expiryDate", { 
                              required: "Expiry date is required",
                              pattern: {
                                value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                                message: "Please use MM/YY format"
                              }
                            })}
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                          {errors.expiryDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            CVV *
                          </label>
                          <input
                            id="cvv"
                            type="text"
                            {...register("cvv", { 
                              required: "CVV is required",
                              pattern: {
                                value: /^[0-9]{3,4}$/,
                                message: "CVV must be 3 or 4 digits"
                              }
                            })}
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                            placeholder="123"
                            maxLength={4}
                          />
                          {errors.cvv && (
                            <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* PayPal message */}
                  {paymentMethod === 'paypal' && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-gray-700">
                        You'll be redirected to PayPal to complete your payment securely.
                        <br />
                        <span className="text-sm text-gray-500 mt-2 block">
                          Note: This is a simulation. No actual redirect will happen.
                        </span>
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => router.push('/checkout')}
                      className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Back to Shipping
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Payment...
                        </div>
                      ) : `Pay $${orderTotal.toFixed(2)}`}
                    </button>
                  </div>
                  
                  {/* Security notice */}
                  <div className="mt-4 text-xs text-gray-500 flex items-start">
                    <svg className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>
                      Your payment information is secure. We use industry-standard encryption technology.
                      <br />
                      <strong className="block mt-1">This is a simulation - no actual payment will be processed.</strong>
                    </span>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Right Column - Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-medium mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between py-3">
                        <div className="flex-1">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Subtotal</p>
                      <p className="font-medium">${cartTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Shipping</p>
                      <p className="font-medium">
                        {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Tax (10%)</p>
                      <p className="font-medium">${taxAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 flex justify-between">
                    <p className="font-medium">Total</p>
                    <p className="font-medium text-xl text-amber-800">${orderTotal.toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Shipping info summary */}
                {shippingDetails && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-700 mb-2">Shipping to:</h3>
                    <p className="text-sm text-gray-600">
                      {shippingDetails.fullName}<br />
                      {shippingDetails.addressLine1}<br />
                      {shippingDetails.addressLine2 && <>{shippingDetails.addressLine2}<br /></>}
                      {shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}<br />
                      {shippingDetails.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}