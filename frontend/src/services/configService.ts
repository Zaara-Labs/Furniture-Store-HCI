import appwriteConfig from '../../appwrite.json';

// Define types for the configuration data we need
interface CollectionConfig {
  $id: string;
  name: string;
  databaseId: string;
}

export interface AppwriteConfig {
  projectId: string;
  projectName: string;
  databaseId: string;
  collections: {
    product: string;
    product_category: string;
    collection: string;
  };
  buckets: {
    productImages: string;
    productModels: string;
  };
  endpoint: string;
}

// This service provides access to configuration values from appwrite.json
class ConfigService {
  private config: AppwriteConfig;

  constructor() {
    // Extract and structure the configuration data
    const databaseId = appwriteConfig.databases[0]?.$id || '';

    // Find collections by name
    const findCollection = (name: string): CollectionConfig | undefined =>
      appwriteConfig.collections.find(col => col.name === name);

    const productCollection = findCollection('product');
    const categoryCollection = findCollection('product_category');
    const collectionCollection = findCollection('collection');

    // Find buckets by name
    const productImagesBucket = appwriteConfig.buckets.find(b => b.name === 'product-images');
    const productModelsBucket = appwriteConfig.buckets.find(b => b.name === 'product-models');

    this.config = {
      projectId: appwriteConfig.projectId,
      projectName: appwriteConfig.projectName,
      databaseId: databaseId,
      collections: {
        product: productCollection?.$id || '',
        product_category: categoryCollection?.$id || '',
        collection: collectionCollection?.$id || '',
      },
      buckets: {
        productImages: productImagesBucket?.$id || '',
        productModels: productModelsBucket?.$id || '',
      },
      // Default endpoint for Appwrite
      endpoint: 'https://cloud.appwrite.io/v1',
    };
  }

  // Method to get the entire config
  getConfig(): AppwriteConfig {
    return this.config;
  }

  // Helper methods for commonly accessed values
  getProjectId(): string {
    return this.config.projectId;
  }

  getDatabaseId(): string {
    return this.config.databaseId;
  }

  getCollectionId(collection: keyof AppwriteConfig['collections']): string {
    return this.config.collections[collection];
  }

  getBucketId(bucket: keyof AppwriteConfig['buckets']): string {
    return this.config.buckets[bucket];
  }

  getEndpoint(): string {
    return this.config.endpoint;
  }
}

// Export a singleton instance
export const configService = new ConfigService();

// Also export for testing or for cases where a new instance is needed
export default ConfigService;