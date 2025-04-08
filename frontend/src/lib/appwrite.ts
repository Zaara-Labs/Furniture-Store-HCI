import { Client, Account, Storage } from 'appwrite';

// This file is only imported by server components or server actions
// Initialize Appwrite client
const client = new Client();

// Get Appwrite configuration from environment variables (not NEXT_PUBLIC_)
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';

// Check if required environment variables are set
if (!APPWRITE_PROJECT_ID) {
  console.error('Missing Appwrite Project ID. Please set APPWRITE_PROJECT_ID in your .env file');
}

// Configure client
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize Account
const account = new Account(client);

// Initialize Storage
const storage = new Storage(client);

export { client, account, storage };
