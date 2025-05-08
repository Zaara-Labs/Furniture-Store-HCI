"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

// Form data types
type ShippingFormData = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  saveAddress: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>({
    defaultValues: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Sri Lanka",
      phone: "",
      email: user?.email || "",
      saveAddress: true
    }
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart");
    }
    
    // Check for saved shipping details (e.g., if coming back from payment page)
    const savedShippingDetails = sessionStorage.getItem('shippingDetails');
    
    if (savedShippingDetails) {
      const parsedDetails = JSON.parse(savedShippingDetails);
      
      // Pre-populate form with saved details if they exist
      // Note: This doesn't work directly with react-hook-form, so we'd need to use setValue in a real implementation
    }
  }, [cartItems.length, router]);

  // Handle form submission
  const onSubmit = (data: ShippingFormData) => {
    setIsLoading(true);
    
    try {
      // Store shipping details in session storage for the payment page
      sessionStorage.setItem('shippingDetails', JSON.stringify(data));
      
      // If this were a real implementation, we might save the address to the user's account here
      
      // Navigate to payment page
      router.push('/checkout/payment');
    } catch (error) {
      console.error("Error saving shipping details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Shipping cost calculation (simplified)
  const shippingCost = cartTotal > 100 ? 0 : 10;
  // Tax calculation (simplified - 10%)
  const taxAmount = cartTotal * 0.1;
  // Order total
  const orderTotal = cartTotal + shippingCost + taxAmount;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="bg-[#f8f9fa] flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-8">Checkout</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Shipping Form */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-medium mb-6">Shipping Information</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      {...register("fullName", { 
                        required: "Full name is required" 
                      })}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      id="addressLine1"
                      type="text"
                      {...register("addressLine1", { 
                        required: "Address is required" 
                      })}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                      placeholder="123 Main St"
                    />
                    {errors.addressLine1 && (
                      <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <input
                      id="addressLine2"
                      type="text"
                      {...register("addressLine2")}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        id="city"
                        type="text"
                        {...register("city", { 
                          required: "City is required" 
                        })}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                        placeholder="Colombo"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        Province/State *
                      </label>
                      <input
                        id="state"
                        type="text"
                        {...register("state", { 
                          required: "Province/State is required" 
                        })}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                        placeholder="Western"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        {...register("postalCode", { 
                          required: "Postal code is required" 
                        })}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                        placeholder="10000"
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      id="country"
                      {...register("country", { 
                        required: "Country is required" 
                      })}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                    >
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Canada">Canada</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Malaysia">Malaysia</option>
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        {...register("phone", { 
                          required: "Phone number is required" 
                        })}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                        placeholder="+94 77 123 4567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register("email", { 
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                        placeholder="johndoe@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start pt-2">
                    <input
                      id="saveAddress"
                      type="checkbox"
                      {...register("saveAddress")}
                      className="h-4 w-4 text-amber-800 focus:ring-amber-800 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-600">
                      Save this address for future purchases
                    </label>
                  </div>
                  
                  <div className="pt-4 flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => router.push('/cart')}
                      className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Return to Cart
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Continue to Payment"}
                    </button>
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
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}