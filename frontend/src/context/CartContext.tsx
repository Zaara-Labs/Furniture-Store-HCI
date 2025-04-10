"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { appwriteService, databases } from '@/services/appwrite';
import { useAuth } from './AuthContext';
import { ID, Query } from 'appwrite';

// Define cart item structure
export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

// Define types for Cart context
type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
};

// Create context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  isLoading: false,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);

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
      // For simplicity in this example, we'll use localStorage for anonymous users
      // and Appwrite DB for logged-in users
      if (user) {
        // Fetch from Appwrite database if logged in
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
          'cart', // Replace with your actual collection name
          [Query.equal('userId', userOrSessionId)]
        );
        
        // Map response to CartItem structure
        const items: CartItem[] = response.documents.map(doc => ({
          id: doc.$id,
          productId: doc.productId,
          name: doc.name,
          price: doc.price,
          quantity: doc.quantity,
          image: doc.image,
        }));
        
        setCartItems(items);
      } else {
        // For anonymous users, use localStorage
        const storedCart = localStorage.getItem(`cart_${userOrSessionId}`);
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItems([]);
    }
  };

  // Save cart to appropriate storage
  const saveCart = async (items: CartItem[], userOrSessionId: string) => {
    if (!userOrSessionId) return;
    
    try {
      if (user) {
        // For logged-in users, we would sync with Appwrite DB
        // This is a simplified example - you'd need to handle creates/updates/deletes
        console.log("Saving cart to database for user:", userOrSessionId);
      } else {
        // For anonymous users, save to localStorage
        localStorage.setItem(`cart_${userOrSessionId}`, JSON.stringify(items));
      }
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  // Add item to cart
  const addToCart = async (newItem: Omit<CartItem, "id">) => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.productId === newItem.productId);
      
      let updatedCart: CartItem[];
      
      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        updatedCart = cartItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + newItem.quantity } 
            : item
        );
      } else {
        // Add new item to cart
        const itemToAdd: CartItem = {
          ...newItem,
          id: user ? ID.unique() : `local_${Date.now()}`,
        };
        
        updatedCart = [...cartItems, itemToAdd];
      }
      
      // Update state
      setCartItems(updatedCart);
      
      // Save to storage
      await saveCart(updatedCart, sessionId);
    } catch (error) {
      console.error("Error adding item to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    if (!sessionId || quantity < 1) return;
    
    try {
      setIsLoading(true);
      
      // Find item and update quantity
      const updatedCart = cartItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      
      // Update state
      setCartItems(updatedCart);
      
      // Save to storage
      await saveCart(updatedCart, sessionId);
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (id: string) => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Filter out the item to remove
      const updatedCart = cartItems.filter(item => item.id !== id);
      
      // Update state
      setCartItems(updatedCart);
      
      // Save to storage
      await saveCart(updatedCart, sessionId);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Empty the cart
      setCartItems([]);
      
      // Save to storage
      await saveCart([], sessionId);
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setIsLoading(false);
    }
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
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};