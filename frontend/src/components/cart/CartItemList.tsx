"use client";

import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";
import Link from "next/link";

export default function CartItemList() {
  const { cartItems, cartCount } = useCart();
  if (cartCount === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
        <Link 
          href="/shop"
          className="inline-block px-5 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <ul className="divide-y divide-gray-200">
        {cartItems.map((item) => (
          <li key={item.id}>
            <CartItem 
              id={item.id}
              productId={item.productId}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
              image={item.image}
              slug={item.slug}
              variant_index={item.variant_index}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
