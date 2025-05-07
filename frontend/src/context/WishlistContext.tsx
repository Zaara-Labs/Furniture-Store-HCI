"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { appwriteService } from '@/services/appwrite';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

// Define wishlist item structure
export type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  dateAdded: Date;
};

// Define types for Wishlist context
type WishlistContextType = {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (item: Omit<WishlistItem, "id" | "dateAdded">) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
};

// Create context with default values
const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  wishlistCount: 0,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  clearWishlist: async () => {},
  isInWishlist: () => false,
  isLoading: false,
});

// Custom hook to use the wishlist context
export const useWishlist = () => useContext(WishlistContext);

// Provider component
export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Wishlist stats calculations
  const wishlistCount = wishlistItems.length;

  // Initialize wishlist when component mounts or user/session changes
  useEffect(() => {
    const initializeWishlist = async () => {
      setIsLoading(true);
      try {
        // If logged in, use user ID, otherwise get/create anonymous session
        const userOrSessionId = user?.$id || await appwriteService.getAnonymousSession();
        setSessionId(userOrSessionId);
        
        // Load wishlist items
        await fetchWishlistItems(userOrSessionId);
      } catch (error) {
        console.error("Failed to initialize wishlist:", error);
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWishlist();
  }, [user]);

  // Fetch wishlist items from database
  const fetchWishlistItems = async (userOrSessionId: string) => {
    try {
      setIsLoading(true);
      
      if (!userOrSessionId) {
        setWishlistItems([]);
        return;
      }
      
      // Use the wishlist service to fetch items
      const items = await wishlistService.getWishlistItems(userOrSessionId);
      setWishlistItems(items);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (newItem: Omit<WishlistItem, "id" | "dateAdded">) => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Check if product already exists in wishlist
      const existingItem = wishlistItems.find(item => item.productId === newItem.productId);
      
      if (existingItem) {
        toast.success(`${newItem.name} is already in your wishlist`);
        return;
      }
      
      // Use wishlist service to add the item
      const result = await wishlistService.addToWishlist(
        sessionId,
        newItem.productId,
      );
      
      if (result) {
        // Refresh the wishlist to get the updated state from the database
        await fetchWishlistItems(sessionId);
        toast.success(`${newItem.name} added to your wishlist`);
      }
    } catch (error) {
      console.error("Error adding item to wishlist:", error);
      toast.error("Failed to add item to wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (id: string) => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Find the item to be removed for notification
      const itemToRemove = wishlistItems.find(item => item.id === id);
      
      // Use wishlist service to remove the item
      const success = await wishlistService.removeFromWishlist(sessionId, id);
      
      if (success) {
        // Refresh the wishlist
        await fetchWishlistItems(sessionId);
        
        if (itemToRemove) {
          toast.success(`${itemToRemove.name} removed from your wishlist`);
        } else {
          toast.success("Item removed from your wishlist");
        }
      }
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      toast.error("Failed to remove item from wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Use wishlist service to clear the wishlist
      const success = await wishlistService.clearWishlist(sessionId);
      
      if (success) {
        // Update local state
        setWishlistItems([]);
        toast.success("Wishlist cleared");
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a product is in the wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  };

  // Context value
  const value = {
    wishlistItems,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    isLoading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
