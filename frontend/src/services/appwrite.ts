import { Client, Account, Storage, ID, Databases, AppwriteException } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

// Get Appwrite configuration from environment variables
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

// Check if required environment variables are set
if (!APPWRITE_PROJECT_ID) {
  console.error('Missing Appwrite Project ID. Please set NEXT_PUBLIC_APPWRITE_PROJECT_ID in your .env.local file');
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
  createAccount: async (email: string, password: string, name: string) => {
    try {
      const newAccount = await account.create(
        ID.unique(),
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
        // Here you would implement merging anonymous cart with user cart
        // This will depend on your cart implementation
        await appwriteService.mergeAnonymousDataWithUser(anonId);

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
      return await account.get();
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

  // Merge anonymous data with logged-in user data
  mergeAnonymousDataWithUser: async (anonymousId: string) => {
    try {
      // Implementation depends on how you store cart/favorites/etc.
      // For example, if you store cart in a collection:

      // Get anonymous cart items
      const anonCart = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
        'cart',
        [
          // Query where userOrSessionId equals anonymousId
          // Replace with your actual field names
          // Query.equal('userOrSessionId', anonymousId)
        ]
      );

      // Get user ID after login
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser) return;

      // Update each cart item to belong to the logged in user
      // This is just an example - adjust to your actual data model
      /*
      for (const item of anonCart.documents) {
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
          'cart',
          item.$id,
          {
            userOrSessionId: currentUser.$id
          }
        );
      }
      */

      console.log('Anonymous session merged with user account');
    } catch (error) {
      console.error("Appwrite service :: mergeAnonymousDataWithUser :: error", error);
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
      // Don't log errors here as this is a common check that will fail for unauthenticated users
      return false;
    }
  }
};

export { client, account, storage, databases };
