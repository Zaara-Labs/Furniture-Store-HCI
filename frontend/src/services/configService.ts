/**
 * Configuration Service for Appwrite
 * This service manages all configuration settings for Appwrite connections
 */

// Use environment variables if available, otherwise fallback to defaults
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '681acb4d00068c521ea6';

// Collection IDs
const COLLECTIONS = {
  product: '67f69b00000c211cf835',
  product_category: '67f6abb3002b8c37ca9f',
  collection: '67f7d9a80003dd74b3d3',
  user: '681acbc5f9cd976eb9b5',
  cart: '681acbd00005fcf4b221',
  wishlist: '681b065b00072d600e69',
  design_project: '681acfaa00300e79201f',
};

// Bucket IDs for file storage
const BUCKETS = {
  productImages: '681acbe70002ac1663c3',
  productModels: '681acbef000788093e58',
  designProjectImages: '681acbf80008b791e2cc',
};

export const configService = {
  /**
   * Get the Appwrite endpoint URL
   */
  getEndpoint: () => ENDPOINT,

  /**
   * Get the Appwrite project ID
   */
  getProjectId: () => PROJECT_ID,

  /**
   * Get the database ID
   */
  getDatabaseId: () => DATABASE_ID,

  /**
   * Get a collection ID by name
   * @param name The name of the collection
   * @returns The collection ID or undefined if not found
   */
  getCollectionId: (name: keyof typeof COLLECTIONS): string => {
    return COLLECTIONS[name] || '';
  },

  /**
   * Get a bucket ID by name
   * @param name The name of the bucket
   * @returns The bucket ID or undefined if not found
   */
  getBucketId: (name: keyof typeof BUCKETS): string => {
    return BUCKETS[name] || '';
  }
};

export default configService;