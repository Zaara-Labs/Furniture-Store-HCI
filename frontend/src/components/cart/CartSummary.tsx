"use client";

import { useCart } from "@/context/CartContext";
import CheckoutButton from "./CheckoutButton";
import { useState, useEffect } from "react";

export default function CartSummary() {
  const { cartItems, cartTotal } = useCart();
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Calculate order totals
  useEffect(() => {
    // Free shipping for orders over $100, otherwise $10
    const shippingCost = cartTotal > 100 ? 0 : 10;
    // Tax is 10% of subtotal
    const taxAmount = cartTotal * 0.1;
    // Total is subtotal + shipping + tax
    const orderTotal = cartTotal + shippingCost + taxAmount;

    setShipping(shippingCost);
    setTax(taxAmount);
    setTotal(orderTotal);
  }, [cartTotal]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
          <span className="font-medium">${cartTotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tax (10%)</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>

        <div className="border-t pt-4 flex justify-between">
          <span className="font-medium">Total</span>
          <span className="font-medium text-xl text-amber-800">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping note */}
      {cartTotal < 100 && (
        <div className="mb-6 text-sm text-gray-600 bg-amber-50 p-3 rounded-md">
          Add <span className="font-medium text-amber-800">${(100 - cartTotal).toFixed(2)}</span> more to your cart for free shipping.
        </div>
      )}

      {/* Checkout button */}
      <CheckoutButton disabled={cartItems.length === 0} />

      {/* Payment methods info */}
      <div className="mt-4">
        <div className="text-xs text-gray-500 mb-2">We accept:</div>
        <div className="flex space-x-2">
          <div className="w-8 h-5 bg-gray-200 rounded"></div>
          <div className="w-8 h-5 bg-gray-200 rounded"></div>
          <div className="w-8 h-5 bg-gray-200 rounded"></div>
          <div className="w-8 h-5 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
