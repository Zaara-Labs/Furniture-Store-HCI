import { ID, Query } from 'appwrite';
import { databases as appwriteDatabases, storage as appwriteStorage } from './appwrite';
import { RoomSettings, FurnitureItemProps } from '@/types/room-designer';

// Camera settings type
export interface CameraSettings {
  position: [number, number, number];
  target?: [number, number, number];
  viewAngle: number;
}

// Design Project data type
export interface DesignProject {
  $id?: string;
  name: string;
  description?: string;
  designerId: string;
  customerId?: string[];
  thumbnailUrl?: string;
  status: 'Draft' | 'In Progress' | 'Completed';
  room: string; // Stringified RoomSettings
  camera: string; // Stringified CameraSettings
  furniture: string; // Stringified FurnitureItemProps[]
  createdAt?: Date;
  updated_at?: Date;
}

// Parsed Design Project with properly typed data
export interface ParsedDesignProject extends Omit<DesignProject, 'room' | 'camera' | 'furniture'> {
  room: RoomSettings;
  camera: CameraSettings;
  furniture: FurnitureItemProps[];
}

// Constants
const DATABASE_ID = '67f5616b000b636218db';
const COLLECTION_ID = '681acfaa00300e79201f';
const THUMBNAIL_BUCKET_ID = '681ae81f0008111016d3';

// Design Project Service
const designProjectService = {
  // Create a new design project
  async createProject(projectData: Omit<DesignProject, '$id' | 'createdAt' | 'updated_at'>): Promise<DesignProject> {
    try {
      const response = await appwriteDatabases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          ...projectData,
          createdAt: new Date(),
          updated_at: new Date(),
        }
      );
      return response as unknown as DesignProject;
    } catch (error) {
      console.error('Error creating design project:', error);
      throw error;
    }
  },

  // Get all design projects for a specific designer
  async getDesignerProjects(designerId: string): Promise<DesignProject[]> {
    try {
      const response = await appwriteDatabases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal('designerId', designerId)]
      );
      return response.documents as unknown as DesignProject[];
    } catch (error) {
      console.error('Error fetching designer projects:', error);
      throw error;
    }
  },

  // Get a specific design project by ID
  async getProject(projectId: string): Promise<DesignProject> {
    try {
      const response = await appwriteDatabases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        projectId
      );
      return response as unknown as DesignProject;
    } catch (error) {
      console.error('Error fetching design project:', error);
      throw error;
    }
  },

  // Update an existing design project
  async updateProject(projectId: string, projectData: Partial<DesignProject>): Promise<DesignProject> {
    try {
      const response = await appwriteDatabases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        projectId,
        {
          ...projectData,
          updated_at: new Date()
        }
      );
      return response as unknown as DesignProject;
    } catch (error) {
      console.error('Error updating design project:', error);
      throw error;
    }
  },

  // Delete a design project
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      await appwriteDatabases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        projectId
      );
      return true;
    } catch (error) {
      console.error('Error deleting design project:', error);
      throw error;
    }
  },

  // Helper functions to parse and stringify design project data
  parseProject(project: DesignProject): ParsedDesignProject {
    return {
      ...project,
      room: JSON.parse(project.room) as RoomSettings,
      camera: JSON.parse(project.camera) as CameraSettings,
      furniture: JSON.parse(project.furniture) as FurnitureItemProps[]
    };
  },

  stringifyProject(project: Partial<ParsedDesignProject>): Partial<DesignProject> {
    const { room, camera, furniture, ...rest } = project;
    const result: Partial<DesignProject> = { ...rest };

    if (room) {
      result.room = JSON.stringify(room);
    }

    if (camera) {
      result.camera = JSON.stringify(camera);
    }

    if (furniture) {
      result.furniture = JSON.stringify(furniture);
    }

    return result;
  },

  // Thumbnail management functions

  /**
   * Upload a thumbnail image for a design project
   * @param dataUrl Base64 image data URL
   * @param projectId Project ID to associate with the thumbnail
   * @returns URL to the uploaded thumbnail
   */
  async uploadThumbnail(dataUrl: string, projectId: string): Promise<string> {
    try {
      // Convert data URL to blob
      const base64Data = dataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }

      const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/png' });
      const file = new File([blob], `project-${projectId}-${Date.now()}.png`, { type: 'image/png' });

      // Upload to Appwrite storage
      const result = await appwriteStorage.createFile(
        THUMBNAIL_BUCKET_ID,
        ID.unique(),
        file
      );

      // Get the file URL
      const fileURL = appwriteStorage.getFileView(
        THUMBNAIL_BUCKET_ID,
        result.$id
      );

      return fileURL;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw error;
    }
  },

  /**
   * Delete a thumbnail from storage
   * @param thumbnailUrl URL of thumbnail to delete
   * @returns Boolean indicating success
   */
  async deleteThumbnail(thumbnailUrl: string): Promise<boolean> {
    try {
      if (!thumbnailUrl) return true;

      // Extract the file ID from the URL
      const urlParts = thumbnailUrl.split('/');
      const fileId = urlParts[urlParts.length - 1];

      if (!fileId) {
        console.warn('Could not extract file ID from thumbnail URL:', thumbnailUrl);
        return false;
      }

      // Delete the file
      await appwriteStorage.deleteFile(
        THUMBNAIL_BUCKET_ID,
        fileId
      );

      return true;
    } catch (error) {
      console.error('Error deleting thumbnail:', error);
      // Don't throw here, just return false
      return false;
    }
  },

  /**
   * Update a project's thumbnail - handles deleting old one if it exists
   * @param projectId Project ID
   * @param dataUrl New thumbnail as data URL
   * @param currentThumbnailUrl Current thumbnail URL (if any)
   * @returns New thumbnail URL
   */
  async updateProjectThumbnail(projectId: string, dataUrl: string, currentThumbnailUrl?: string): Promise<string> {
    try {
      // Delete old thumbnail if it exists
      if (currentThumbnailUrl) {
        await this.deleteThumbnail(currentThumbnailUrl);
      }

      // Upload new thumbnail
      const newThumbnailUrl = await this.uploadThumbnail(dataUrl, projectId);

      return newThumbnailUrl;
    } catch (error) {
      console.error('Error updating project thumbnail:', error);
      throw error;
    }
  }
};

export default designProjectService;