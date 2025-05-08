import { ID, Query } from 'appwrite';
import { databases as appwriteDatabases } from './appwrite';

import { configService } from './configService';

// Constants
const DATABASE_ID = configService.getDatabaseId();
const CART_COLLECTION_ID = configService.getCollectionId('cart');

// Cart service for interacting with cart collection
export const cartService = {
  // Get cart items for a user or session
  getCartItems: async (userId: string) => {
    try {
      const response = await appwriteDatabases.listDocuments(
        DATABASE_ID,
        CART_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      // Check if a cart document exists for this user
      if (response.documents.length === 0) {
        return [];
      }

      const cartDoc = response.documents[0];

      // If there are no products in the cart, return empty array
      if (!cartDoc.products || cartDoc.products.length === 0) {
        return [];
      }

      // Create maps for quantity and variant index
      const quantityMap: Record<string, number> = {};
      const variantIndexMap: Record<string, number> = {};

      if (Array.isArray(cartDoc.quantities)) {
        cartDoc.products.forEach((productId: string, index: number) => {
          quantityMap[productId] = cartDoc.quantities[index] || 1;
        });
      }

      // Get variant indexes if they exist
      if (Array.isArray(cartDoc.variant_indexes)) {
        cartDoc.products.forEach((productId: string, index: number) => {
          variantIndexMap[index] = cartDoc.variant_indexes[index] || 0;
        });
      }

      // Fetch product details for each product in the cart
      const cartItems = [];
      for (let i = 0; i < cartDoc.products.length; i++) {
        const productId = cartDoc.products[i].$id || cartDoc.products[i];
        try {
          const product = await appwriteDatabases.getDocument(
            DATABASE_ID,
            configService.getCollectionId('product'),
            productId
          );

          // Get the correct variant index
          const variantIndex = variantIndexMap[i] || 0;

          // Get the price based on the variant
          let price = 0;
          if (product.variation_prices && product.variation_prices.length > variantIndex) {
            price = product.variation_prices[variantIndex];
          } else if (Array.isArray(product.price)) {
            price = product.price[0] || 0;
          } else {
            price = product.price || 0;
          }

          // Get variant name (if applicable)
          let variantName = '';
          if (product.variation_names && product.variation_names.length > variantIndex) {
            variantName = product.variation_names[variantIndex];
          }

          // Create a unique ID that includes variant information
          const uniqueId = `${cartDoc.$id}_${productId}_${variantIndex}`;

          cartItems.push({
            id: uniqueId,
            productId: productId,
            name: product.name + (variantName ? ` - ${variantName}` : ''),
            price: price,
            quantity: quantityMap[productId] || 1,
            image: product.variation_images && product.variation_images.length > variantIndex
              ? product.variation_images[variantIndex]
              : (product.main_image_url || ''),
            slug: product.slug || '',
            variant_index: variantIndex
          });
        } catch (err) {
          console.error(`Error fetching product ${productId}:`, err);
        }
      }

      return cartItems;
    } catch (error) {
      console.error("Error getting cart items:", error);
      return [];
    }
  },

  // Add item to cart
  addToCart: async (userId: string, productId: string, quantity: number, variantIndex = 0) => {
    try {
      // Check if cart exists for user
      const existingCarts = await appwriteDatabases.listDocuments(
        DATABASE_ID,
        CART_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      let cartId;
      let currentProducts = [];
      let currentQuantities = [];
      let currentVariantIndexes = [];

      // Get existing cart or create new one
      if (existingCarts.documents.length > 0) {
        const cart = existingCarts.documents[0];
        cartId = cart.$id;
        currentProducts = Array.isArray(cart.products) ? cart.products.map(product =>
          typeof product === 'object' && product !== null && '$id' in product ? product.$id : product
        ) : [];
        currentQuantities = cart.quantities || [];
        currentVariantIndexes = cart.variant_indexes || [];
      } else {
        // Create new cart
        const newCart = await appwriteDatabases.createDocument(
          DATABASE_ID,
          CART_COLLECTION_ID,
          ID.unique(),
          {
            userId: userId,
            products: [],
            quantities: [],
            variant_indexes: [],
            created_at: new Date(),
            updated_at: new Date()
          }
        );
        cartId = newCart.$id;
      }

      // Create a unique product key that includes both product ID and variant
      const getProductKey = (productId: string, variantIdx: number) => `${productId}_${variantIdx}`;

      // Map current products to their keys for easier lookup
      const productKeys: string[] = [];
      for (let i = 0; i < currentProducts.length; i++) {
        // Handle both string IDs and object IDs
        const pId = currentProducts[i].$id || currentProducts[i];
        const vIdx = currentVariantIndexes[i] || 0;
        productKeys.push(getProductKey(pId, vIdx));
      }

      // Find if this exact product+variant combination exists
      const existingProductIndex = productKeys.indexOf(getProductKey(productId, variantIndex));

      if (existingProductIndex > -1) {
        // Update quantity
        currentQuantities[existingProductIndex] = (currentQuantities[existingProductIndex] || 1) + quantity;
      } else {
        // Add new product
        currentProducts.push(productId);
        currentQuantities.push(quantity);
        currentVariantIndexes.push(variantIndex);
      }

      // Update cart in database
      const updatedCart = await appwriteDatabases.updateDocument(
        DATABASE_ID,
        CART_COLLECTION_ID,
        cartId,
        {
          products: currentProducts,
          quantities: currentQuantities,
          variant_indexes: currentVariantIndexes,
          updated_at: new Date()
        }
      );

      return updatedCart;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return null;
    }
  },

  // Update item quantity in cart
  updateCartItemQuantity: async (combinedId: string, quantity: number) => {
    try {
      // Parse the combined ID to get cart doc ID, product ID, and variant index
      const [cartId, productId, variantIndex] = combinedId.split('_');

      // Get the cart document
      const cart = await appwriteDatabases.getDocument(
        DATABASE_ID,
        CART_COLLECTION_ID,
        cartId
      );

      const products = cart.products || [];
      const quantities = cart.quantities || [];
      const variantIndexes = cart.variant_indexes || [];

      // Find product with matching product ID and variant index
      const productIndex = products.findIndex((p: string, idx: number) =>
        p === productId && variantIndexes[idx] === Number(variantIndex)
      );

      if (productIndex === -1) {
        return false;
      }

      // Update quantity
      quantities[productIndex] = quantity;

      // Update cart in database
      await appwriteDatabases.updateDocument(
        DATABASE_ID,
        CART_COLLECTION_ID,
        cartId,
        {
          quantities: quantities,
          updated_at: new Date()
        }
      );

      return true;
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      return false;
    }
  },

  // Remove item from cart
  removeFromCart: async (combinedId: string) => {
    try {
      // Parse the combined ID to get cart doc ID, product ID, and variant index
      const [cartId, productId, variantIndex] = combinedId.split('_');

      // Get the cart document
      const cart = await appwriteDatabases.getDocument(
        DATABASE_ID,
        CART_COLLECTION_ID,
        cartId
      );

      let products = cart.products || [];
      let quantities = cart.quantities || [];
      let variantIndexes = cart.variant_indexes || [];

      // Find product with matching product ID and variant index
      const productIndex = products.findIndex((p: string, idx: number) =>
        p === productId && variantIndexes[idx] === Number(variantIndex)
      );

      if (productIndex === -1) {
        return false;
      }

      // Remove product and quantity and variant index
      products = products.filter((_: string, i: number) => i !== productIndex);
      quantities = quantities.filter((_: number, i: number) => i !== productIndex);
      variantIndexes = variantIndexes.filter((_: number, i: number) => i !== productIndex);

      // Update cart in database
      await appwriteDatabases.updateDocument(
        DATABASE_ID,
        CART_COLLECTION_ID,
        cartId,
        {
          products: products,
          quantities: quantities,
          variant_indexes: variantIndexes,
          updated_at: new Date()
        }
      );

      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    }
  },

  // Clear the entire cart
  clearCart: async (userId: string) => {
    try {
      // Get user's cart
      const carts = await appwriteDatabases.listDocuments(
        DATABASE_ID,
        CART_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (carts.documents.length === 0) {
        return true;
      }

      // Update cart with empty arrays
      await appwriteDatabases.updateDocument(
        DATABASE_ID,
        CART_COLLECTION_ID,
        carts.documents[0].$id,
        {
          products: [],
          quantities: [],
          variant_indexes: [],
          updated_at: new Date()
        }
      );

      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  }
};
