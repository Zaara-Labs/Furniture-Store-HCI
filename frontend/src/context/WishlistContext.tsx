"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { appwriteService, databases } from '@/services/appwrite';
import { useAuth } from './AuthContext';
import { ID, Query } from 'appwrite';
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
  const [dbAvailable, setDbAvailable] = useState<boolean>(false);

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
        
        // Check if the wishlist database collection exists
        await checkDatabaseAvailability();
        
        // Load wishlist items
        await fetchWishlistItems(userOrSessionId);
      } catch (error) {
        console.error("Failed to initialize wishlist:", error);
        // Fall back to localStorage-only mode
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initializeWishlist();
  }, [user]);

  // Check if database collection exists
  const checkDatabaseAvailability = async () => {
    try {
      // Try to list a single document to check if collection exists
      await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
        'wishlist',
        [Query.limit(1)]
      );
      setDbAvailable(true);
      console.log("Wishlist database collection is available");
      return true;
    } catch (error: any) {
      if (error?.code === 404) {
        console.log("Wishlist collection does not exist, using localStorage only");
        setDbAvailable(false);
        return false;
      }
      throw error; // Rethrow other errors
    }
  };

  // Load wishlist directly from localStorage
  const loadFromLocalStorage = () => {
    try {
      const userOrSessionId = user?.$id || 'anonymous';
      const storedWishlist = localStorage.getItem(`wishlist_${userOrSessionId}`);
      if (storedWishlist) {
        const items = JSON.parse(storedWishlist);
        // Ensure dateAdded is a Date object
        items.forEach((item: any) => {
          item.dateAdded = new Date(item.dateAdded);
        });
        setWishlistItems(items);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      setWishlistItems([]);
    }
  };

  // Fetch wishlist items from database or local storage
  const fetchWishlistItems = async (userOrSessionId: string) => {
    try {
      // Always try localStorage first
      const storedWishlist = localStorage.getItem(`wishlist_${userOrSessionId}`);
      let localItems: WishlistItem[] = [];
      
      if (storedWishlist) {
        try {
          localItems = JSON.parse(storedWishlist);
          // Ensure dateAdded is a Date object
          localItems.forEach((item) => {
            item.dateAdded = new Date(item.dateAdded);
          });
        } catch (parseError) {
          console.error("Error parsing stored wishlist:", parseError);
        }
      }

      // If user is logged in and database is available, try to fetch from database
      if (user && dbAvailable) {
        try {
          const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
            'wishlist', // Collection name
            [Query.equal('userId', userOrSessionId)]
          );
          
          // Map response to WishlistItem structure
          const dbItems: WishlistItem[] = response.documents.map(doc => ({
            id: doc.$id,
            productId: doc.productId,
            name: doc.name,
            price: doc.price,
            image: doc.image,
            slug: doc.slug,
            dateAdded: new Date(doc.dateAdded || doc.$createdAt),
          }));
          
          setWishlistItems(dbItems);
          
          // Update localStorage with db items for backup
          localStorage.setItem(`wishlist_${userOrSessionId}`, JSON.stringify(dbItems));
        } catch (dbError) {
          // If error fetching from DB, fall back to local items
          console.error("Error fetching from database, using local items:", dbError);
          setWishlistItems(localItems);
        }
      } else {
        // For anonymous users or when DB is unavailable, use localStorage
        setWishlistItems(localItems);
      }
    } catch (error) {
      console.error("Error in fetchWishlistItems:", error);
      setWishlistItems([]);
    }
  };

  // Save wishlist to appropriate storage
  const saveWishlist = async (items: WishlistItem[], userOrSessionId: string) => {
    if (!userOrSessionId) return;
    
    try {
      // Always save to localStorage for both anonymous and logged-in users
      localStorage.setItem(`wishlist_${userOrSessionId}`, JSON.stringify(items));
      
      // We don't attempt to save to database because it doesn't exist yet
      // This functionality would be added once the database collection is created
    } catch (error) {
      console.error("Error saving wishlist:", error);
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
      
      // Add new item to wishlist
      const itemToAdd: WishlistItem = {
        ...newItem,
        id: `local_${Date.now()}`, // Always use local ID for now
        dateAdded: new Date(),
      };
      
      const updatedWishlist = [...wishlistItems, itemToAdd];
      
      // Update state
      setWishlistItems(updatedWishlist);
      
      // Save to storage
      await saveWishlist(updatedWishlist, sessionId);
      
      toast.success(`${newItem.name} added to your wishlist`);
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
      
      // Filter out the item to remove
      const updatedWishlist = wishlistItems.filter(item => item.id !== id);
      
      // Update state
      setWishlistItems(updatedWishlist);
      
      // Save to storage
      await saveWishlist(updatedWishlist, sessionId);
      
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} removed from your wishlist`);
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
      
      // Empty the wishlist
      setWishlistItems([]);
      
      // Save to storage
      await saveWishlist([], sessionId);
      
      toast.success("Wishlist cleared");
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
