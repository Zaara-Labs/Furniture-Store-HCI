"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { appwriteService } from '@/services/appwrite';
import { cartService } from '@/services/cartService';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

// Define cart item structure
export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  variant_index?: number;
};

// Define types for Cart context
type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, "id">) => Promise<CartItem | undefined>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  lastAddedItem: CartItem | null;
  isInCart: (productId: string, variantIndex?: number) => boolean;
  getItemQuantity: (productId: string, variantIndex?: number) => number;
};

// Create context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: async () => undefined,
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  isLoading: false,
  lastAddedItem: null,
  isInCart: () => false,
  getItemQuantity: () => 0,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Cart stats calculations
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Initialize cart when component mounts or user/session changes
  useEffect(() => {
    const initializeCart = async () => {
      setIsLoading(true);
      try {
        // If logged in, use user ID, otherwise get/create anonymous session
        const userOrSessionId = user?.$id || await appwriteService.getAnonymousSession();
        setSessionId(userOrSessionId);
        
        // Load cart items
        await fetchCartItems(userOrSessionId);
      } catch (error) {
        console.error("Failed to initialize cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCart();
  }, [user]);

  // Fetch cart items from database
  const fetchCartItems = async (userOrSessionId: string) => {
    try {
      setIsLoading(true);
      
      if (!userOrSessionId) {
        setCartItems([]);
        return;
      }
      
      // Use the cart service to fetch items (works for both anonymous and logged-in users)
      const items = await cartService.getCartItems(userOrSessionId);
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart with improved feedback
  const addToCart = async (newItem: Omit<CartItem, "id">) => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Use cart service to add the item
      const result = await cartService.addToCart(
        sessionId,
        newItem.productId,
        newItem.quantity || 1, 
        newItem.variant_index || 0 // Pass variant index
      );
      
      if (result) {
        // Refresh the cart to get the updated state from the database
        await fetchCartItems(sessionId);
        
        // Set the last added item for UI feedback
        const addedItem = {
          id: `${result.$id}_${newItem.productId}_${newItem.variant_index || 0}`, // Format is cartDocId_productId_variantIndex
          productId: newItem.productId,
          name: newItem.name,
          price: newItem.price,
          quantity: newItem.quantity,
          image: newItem.image,
          slug: newItem.slug,
          variant_index: newItem.variant_index || 0
        };
        
        setLastAddedItem(addedItem);
        
        // Show success toast
        const existingItem = cartItems.find(item => 
          item.productId === newItem.productId && 
          item.variant_index === newItem.variant_index
        );
        
        if (existingItem) {
          toast.success(`Updated ${newItem.name} quantity in your cart`);
        } else {
          toast.success(`${newItem.name} added to your cart`);
        }
        
        return addedItem;
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    if (!sessionId || quantity < 1) return;
    
    try {
      setIsLoading(true);
      
      // Use cart service to update the quantity
      const success = await cartService.updateCartItemQuantity(id, quantity);
      
      if (success) {
        // Refresh the cart
        await fetchCartItems(sessionId);
        toast.success("Cart updated");
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      toast.error("Failed to update cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (id: string) => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Use cart service to remove the item
      const success = await cartService.removeFromCart(id);
      
      if (success) {
        // Refresh the cart
        await fetchCartItems(sessionId);
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Use cart service to clear the cart
      const success = await cartService.clearCart(sessionId);
      
      if (success) {
        // Update local state
        setCartItems([]);
        toast.success("Cart cleared");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if product is in cart
  const isInCart = (productId: string, variantIndex?: number): boolean => {
    if (variantIndex !== undefined) {
      // If variantIndex is provided, check both productId and variantIndex
      return cartItems.some(item => 
        item.productId === productId && 
        item.variant_index === variantIndex
      );
    }
    // Otherwise just check productId (backwards compatibility)
    return cartItems.some(item => item.productId === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId: string, variantIndex?: number): number => {
    if (variantIndex !== undefined) {
      // If variantIndex is provided, find the item with matching productId and variantIndex
      const item = cartItems.find(item => 
        item.productId === productId && 
        item.variant_index === variantIndex
      );
      return item ? item.quantity : 0;
    }
    // If no variantIndex provided, get total quantity of this product across all variants
    return cartItems
      .filter(item => item.productId === productId)
      .reduce((total, item) => total + item.quantity, 0);
  };

  // Context value
  const value = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading,
    lastAddedItem,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};