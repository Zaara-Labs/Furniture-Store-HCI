import { ID, Query } from 'appwrite';
import { client as appwriteClient, databases } from './appwrite';
import { Collection } from '@/types/collections/Collection';
import { configService } from './configService';

const DATABASE_ID = '67f5616b000b636218db';
const COLLECTION_ID = '67f7d9a80003dd74b3d3';

export const collectionService = {
  // Get all collections
  getAllCollections: async (queries: string[] = []): Promise<Collection[]> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        queries
      );
      return response.documents as Collection[];
    } catch (error) {
      console.error("Collection service :: getAllCollections :: error", error);
      throw error;
    }
  },

  // Get a collection by slug
  getCollectionBySlug: async (slug: string): Promise<Collection | null> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("slug", slug)]
      );
      
      if (response.documents.length > 0) {
        return response.documents[0] as Collection;
      }
      return null;
    } catch (error) {
      console.error("Collection service :: getCollectionBySlug :: error", error);
      throw error;
    }
  },

  // Get a collection by ID
  getCollectionById: async (id: string): Promise<Collection | null> => {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id
      );
      return response as Collection;
    } catch (error) {
      console.error("Collection service :: getCollectionById :: error", error);
      return null;
    }
  },

  // Create a new collection
  createCollection: async (data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    featured?: boolean;
  }): Promise<Collection> => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        data
      );
      return response as Collection;
    } catch (error) {
      console.error("Collection service :: createCollection :: error", error);
      throw error;
    }
  },

  // Update an existing collection
  updateCollection: async (
    id: string,
    data: Partial<Collection>
  ): Promise<Collection> => {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id,
        data
      );
      return response as Collection;
    } catch (error) {
      console.error("Collection service :: updateCollection :: error", error);
      throw error;
    }
  },

  // Delete a collection
  deleteCollection: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error("Collection service :: deleteCollection :: error", error);
      throw error;
    }
  },

  // Get featured collections
  getFeaturedCollections: async (): Promise<Collection[]> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("featured", true)]
      );
      return response.documents as Collection[];
    } catch (error) {
      console.error("Collection service :: getFeaturedCollections :: error", error);
      return [];
    }
  }
};

export default collectionService;