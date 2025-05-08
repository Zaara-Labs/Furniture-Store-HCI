import { ID, Query } from 'appwrite';
import { databases as appwriteDatabases } from './appwrite';

import { configService } from './configService';

// Constants
const DATABASE_ID = '67f5616b000b636218db';
const WISHLIST_COLLECTION_ID = '681b065b00072d600e69';


// Wishlist service for interacting with wishlist collection
export const wishlistService = {
  // Get wishlist items for a user or session
  getWishlistItems: async (userId: string) => {
    try {
      const response = await appwriteDatabases.listDocuments(
        DATABASE_ID,
        WISHLIST_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      // Check if a wishlist document exists for this user
      if (response.documents.length === 0) {
        return [];
      }

      const wishlistDoc = response.documents[0];

      // If there are no products in the wishlist, return empty array
      if (!wishlistDoc.products || wishlistDoc.products.length === 0) {
        return [];
      }

      // Create a map of product IDs to added dates
      const dateMap: { [key: string]: Date } = {};
      if (Array.isArray(wishlistDoc.products_added_at)) {
        wishlistDoc.products.forEach((product: { $id: string }, index: number) => {
          dateMap[product.$id] = wishlistDoc.products_added_at[index] || new Date(wishlistDoc.created_at);
        });
      }

      // Fetch product details for each product in the wishlist
      const wishlistItems = [];
      for (let i = 0; i < wishlistDoc.products.length; i++) {
        const productId = wishlistDoc.products[i].$id;
        try {
          const product = await appwriteDatabases.getDocument(
            DATABASE_ID,
            configService.getCollectionId('product'),
            productId
          );

          wishlistItems.push({
            id: `${wishlistDoc.$id}_${productId}`, // Combine wishlist doc ID and product ID
            productId: productId,
            name: product.name,
            price: product.price || (Array.isArray(product.variation_prices) && product.variation_prices.length > 0 ? product.variation_prices[0] : 0),
            image: product.main_image_url || (Array.isArray(product.variation_images) ? product.variation_images[0] : ''),
            slug: product.slug,
            dateAdded: new Date(dateMap[productId])
          });
        } catch (err) {
          console.error(`Error fetching product ${productId}:`, err);
        }
      }

      return wishlistItems;
    } catch (error) {
      console.error("Error getting wishlist items:", error);
      return [];
    }
  },

  // Add item to wishlist
  addToWishlist: async (userId: string, productId: string) => {
    try {
      // Check if wishlist exists for user
      const existingWishlists = await appwriteDatabases.listDocuments(
        DATABASE_ID,
        WISHLIST_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      let wishlistId;
      let currentProducts = [];
      let currentAddedDates = [];

      // Get existing wishlist or create new one
      if (existingWishlists.documents.length > 0) {
        const wishlist = existingWishlists.documents[0];
        wishlistId = wishlist.$id;
        currentProducts = Array.isArray(wishlist.products) ? wishlist.products.map(product =>
          typeof product === 'object' && product !== null && '$id' in product ? product.$id : product
        ) : [];
        currentAddedDates = wishlist.products_added_at || [];
      } else {
        // Create new wishlist
        const newWishlist = await appwriteDatabases.createDocument(
          DATABASE_ID,
          WISHLIST_COLLECTION_ID,
          ID.unique(),
          {
            userId: userId,
            products: [],
            products_added_at: [],
            created_at: new Date(),
            updated_at: new Date()
          }
        );
        wishlistId = newWishlist.$id;
      }

      // Check if product exists in wishlist already
      const existingProductIndex = currentProducts.indexOf(productId);
      if (existingProductIndex > -1) {
        // Item already exists, just update its added date
        currentAddedDates[existingProductIndex] = new Date();
      } else {
        // Add new product
        currentProducts.push(productId);
        currentAddedDates.push(new Date());
      }
      // Update wishlist in database
      const updatedWishlist = await appwriteDatabases.updateDocument(
        DATABASE_ID,
        WISHLIST_COLLECTION_ID,
        wishlistId,
        {
          products: currentProducts,
          products_added_at: currentAddedDates,
          updated_at: new Date()
        }
      );

      return updatedWishlist;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return null;
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (userId: string, productId: string) => {
    try {
      // Get the wishlist document
      const wishlists = await appwriteDatabases.listDocuments(
        DATABASE_ID,
        WISHLIST_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (wishlists.documents.length === 0) {
        return false;
      }

      const wishlist = wishlists.documents[0];

      let products = wishlist.products || [];
      let addedDates = wishlist.products_added_at || [];

      // Find product index
      const productIndex = products.indexOf(productId);
      if (productIndex === -1) {
        return false;
      }

      // Remove product and its added date
      products = products.filter((_: string, i: number) => i !== productIndex);
      addedDates = addedDates.filter((_: string, i: number) => i !== productIndex);

      // Update wishlist in database
      await appwriteDatabases.updateDocument(
        DATABASE_ID,
        WISHLIST_COLLECTION_ID,
        wishlist.$id,
        {
          products: products,
          products_added_at: addedDates,
          updated_at: new Date()
        }
      );

      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }
  },

  // Clear the entire wishlist
  clearWishlist: async (userId: string) => {
    try {
      // Get user's wishlist
      const wishlists = await appwriteDatabases.listDocuments(
        DATABASE_ID,
        WISHLIST_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (wishlists.documents.length === 0) {
        return true;
      }

      // Update wishlist with empty arrays
      await appwriteDatabases.updateDocument(
        DATABASE_ID,
        WISHLIST_COLLECTION_ID,
        wishlists.documents[0].$id,
        {
          products: [],
          products_added_at: [],
          updated_at: new Date()
        }
      );

      return true;
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      return false;
    }
  }
};