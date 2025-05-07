import { Client, Account, Storage, ID, Databases, AppwriteException, Query } from 'appwrite';
import { configService } from './configService';
import { Product } from '@/types/collections/Product';

// Initialize Appwrite client
const client = new Client();

// Get configuration from our config service instead of environment variables
const APPWRITE_ENDPOINT = configService.getEndpoint();
const APPWRITE_PROJECT_ID = configService.getProjectId();
const DATABASE_ID = configService.getDatabaseId();
const PRODUCT_COLLECTION_ID = configService.getCollectionId('product');
const PRODUCT_CATEGORY_COLLECTION_ID = configService.getCollectionId('product_category');

// Check if required configuration is available
if (!APPWRITE_PROJECT_ID) {
  console.error('Missing Appwrite Project ID. Please check your appwrite.json file');
}

// Configure client
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize Account
const account = new Account(client);

// Initialize Storage
const storage = new Storage(client);

// Initialize Databases
const databases = new Databases(client);

const ANONYMOUS_SESSION_KEY = 'anon_session_id';

// Function to get stored anonymous session ID from local storage
const getStoredAnonSessionId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ANONYMOUS_SESSION_KEY);
  }
  return null;
};

// Function to store anonymous session ID in local storage
const storeAnonSessionId = (sessionId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ANONYMOUS_SESSION_KEY, sessionId);
  }
};

// Authentication functions
export const appwriteService = {
  // Create a new account
  createAccount: async (email: string, password: string, name: string, role: 'customer' | 'designer' = 'customer') => {
    try {
      const userId = ID.unique();
      const newAccount = await account.create(
        userId,
        email,
        password,
        name
      );

      if (newAccount) {

        // Login immediately after successful signup
        return await appwriteService.login(email, password);
      } else {
        return null;
      }
    } catch (error) {
      console.error("Appwrite service :: createAccount :: error", error);
      throw error;
    }
  },

  // Login
  login: async (email: string, password: string) => {
    try {
      // When user logs in, we merge their anonymous cart if one exists
      const anonId = getStoredAnonSessionId();
      const session = await account.createEmailPasswordSession(email, password);

      if (anonId) {
        // Clear the anonymous session since we've merged it
        localStorage.removeItem(ANONYMOUS_SESSION_KEY);
      }

      return session;
    } catch (error) {
      console.error("Appwrite service :: login :: error", error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const currentAccount = await account.get();

      if (!currentAccount) return null;

      // Determine user role from the labels
      // If user has 'designer' label, use that role, otherwise default to 'customer'
      const role = currentAccount.labels?.includes('designer') ? 'designer' : 'customer';

      // Return user with role information
      return {
        ...currentAccount,
        role
      };
    } catch (error) {
      // Check specifically for the "missing scope" error for guests
      if (error instanceof AppwriteException &&
        error.message.includes('User (role: guests) missing scope')) {
        console.log("User is not authenticated, returning null");
        return null;
      }

      console.error("Appwrite service :: getCurrentUser :: error", error);
      return null;
    }
  },

  // Create or get anonymous session
  getAnonymousSession: async () => {
    try {
      // Check if we already have an anonymous session ID stored
      let anonId = getStoredAnonSessionId();

      if (!anonId) {
        // Create a new anonymous ID
        anonId = ID.unique();
        storeAnonSessionId(anonId);
      }

      return anonId;
    } catch (error) {
      console.error("Appwrite service :: getAnonymousSession :: error", error);
      return ID.unique(); // Fallback to a new ID
    }
  },

  // Logout
  logout: async () => {
    try {
      // When logging out, we don't clear the anonymous session
      // So the user still has their cart when they log out
      return await account.deleteSession('current');
    } catch (error) {
      console.error("Appwrite service :: logout :: error", error);
      throw error;
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      const user = await account.get();
      return Boolean(user);
    } catch (error) {
      console.debug("User is not authenticated", error);
      return false;
    }
  }
};

// Export a helper object for products that uses the configuration
export const productService = {
  getAllProducts: async (queries: string[] = []) => {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        PRODUCT_COLLECTION_ID,
        queries
      );
    } catch (error) {
      console.error("Product service :: getAllProducts :: error", error);
      throw error;
    }
  },

  getProductBySlug: async (slug: string): Promise<Product | null> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        PRODUCT_COLLECTION_ID,
        [Query.equal('slug', slug)]
      );
      return (response.documents[0] as Product) || null;
    } catch (error) {
      console.error("Product service :: getProductBySlug :: error", error);
      throw error;
    }
  },

  getProductCategories: async () => {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        PRODUCT_CATEGORY_COLLECTION_ID,
        []
      );
    } catch (error) {
      console.error("Product service :: getProductCategories :: error", error);
      throw error;
    }
  }
};

export { client, account, storage, databases };
