import { Account, Client, ID, Storage } from 'appwrite';

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
      return await account.createEmailPasswordSession(email, password);
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
      console.error("Appwrite service :: getCurrentUser :: error", error);
      return null;
    }
  },

  // Logout
  logout: async () => {
    try {
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
      return false;
    }
  }
};

export { client, account, storage };
