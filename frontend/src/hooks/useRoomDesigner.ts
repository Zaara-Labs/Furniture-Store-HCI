"use client";

import { useState, useEffect, useRef } from 'react';
import { productService } from '@/services/appwrite';
import { RoomSettings, FurnitureItemProps, CameraSettings } from '@/types/room-designer';
import { Product } from '@/types/collections/Product';
import { getUnitConversionFactor } from '@/utils/roomUtils';
import designProjectService, { DesignProject, ParsedDesignProject } from '@/services/designProjectService';

// Helper to generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export function useRoomDesigner() {
  // Room state
  const [room, setRoom] = useState<RoomSettings>({
    width: 8,
    length: 8,
    height: 3,
    wallColor: '#f5f5f5',
    floorColor: '#e0e0e0'
  });

  // Camera state
  const [camera, setCamera] = useState<CameraSettings>({
    position: [0, 5, 10],
    target: [0, 0, 0],
    viewAngle: 50
  });

  // Project state
  const [currentProject, setCurrentProject] = useState<ParsedDesignProject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);

  // Furniture state
  const [furniture, setFurniture] = useState<FurnitureItemProps[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [draggingEnabled, setDraggingEnabled] = useState(true);

  // Fetch all products
  useEffect(() => {
    setIsLoading(true);
    productService.getAllProducts().then(res => {
      setProducts(res.documents as Product[]);
      setIsLoading(false);
    });
  }, []);

  // Update room settings
  const updateRoomDimensions = (dimensions: Partial<RoomSettings>) => {
    setRoom(prev => ({ ...prev, ...dimensions }));
  };

  // Update camera settings
  const updateCamera = (cameraSettings: Partial<CameraSettings>) => {
    setCamera(prev => ({ ...prev, ...cameraSettings }));
  };

  // Capture current camera position from refs
  const captureCurrentCameraState = () => {
    if (cameraRef.current && controlsRef.current) {
      const position = [
        cameraRef.current.position.x,
        cameraRef.current.position.y,
        cameraRef.current.position.z
      ] as [number, number, number];

      const target = [
        controlsRef.current.target.x,
        controlsRef.current.target.y,
        controlsRef.current.target.z
      ] as [number, number, number];

      setCamera({
        position,
        target,
        viewAngle: cameraRef.current.fov
      });

      return {
        position,
        target,
        viewAngle: cameraRef.current.fov
      };
    }
    return camera;
  };

  // Add furniture to room with better initial placement
  const addFurniture = (product: Product) => {
    // Skip if product has no 3D model
    if (!product.model_3d_url) {
      console.error('Cannot add furniture: Product has no 3D model');
      return;
    }

    // Get product dimensions (with fallback values)
    const width = product.dim_width || 1;
    const height = product.dim_height || 1;
    const depth = product.dim_depth || 1;
    const dimensionSku = product.dim_sku || 'cm';

    // Calculate initial position - center of room with small offset
    const initialPosition: [number, number, number] = [
      room.width / 2 + (Math.random() * 1 - 0.5),
      0, // Keep on floor
      room.length / 2 + (Math.random() * 1 - 0.5)
    ];

    // Create new furniture item with a unique instanceId
    const newFurniture: FurnitureItemProps = {
      id: (product.$id as string),
      instanceId: generateUUID(),
      name: product.name,
      model: product.model_3d_url,
      position: initialPosition,
      rotation: [0, 0, 0] as [number, number, number],
      scale: 1,
      textureUrl: product.variation_texture_urls?.[0] || '',
      dimensions: {
        width,
        height,
        depth,
      },
      dimensionSku,
    };

    // Update furniture state
    setFurniture(prev => [...prev, newFurniture]);
    setCurrentProductId(product.$id);

    // Select the newly added item
    const newIndex = furniture.length;
    setSelectedItemIndex(newIndex);
  };

  // Simple but robust position update with boundary enforcement
  const updateFurniturePosition = (index: number, newPosition: [number, number, number]) => {
    if (index < 0 || index >= furniture.length) return;

    const item = furniture[index];
    const unitFactor = getUnitConversionFactor(item.dimensionSku);
    const halfWidth = (item.dimensions.width * unitFactor) / 2;
    const halfDepth = (item.dimensions.depth * unitFactor) / 2;

    // Apply room boundary constraints
    const constrainedPosition: [number, number, number] = [
      Math.max(halfWidth, Math.min(room.width - halfWidth, newPosition[0])),
      newPosition[1], // Keep existing Y position
      Math.max(halfDepth, Math.min(room.length - halfDepth, newPosition[2]))
    ];

    // Update the furniture item with the new position
    setFurniture(prev => prev.map((item, i) =>
      i === index ? { ...item, position: constrainedPosition } : item
    ));
  };

  // Update furniture texture
  const updateFurnitureTexture = (index: number, textureUrl: string) => {
    setFurniture(prev => prev.map((item, i) =>
      i === index ? { ...item, textureUrl } : item
    ));
  };

  // Rotate furniture
  const rotateFurniture = (index: number, axis: 'x' | 'y' | 'z', degrees: number) => {
    setFurniture(prev => prev.map((item, i) => {
      if (i !== index) return item;

      const newRotation = [...item.rotation] as [number, number, number];
      switch (axis) {
        case 'x': newRotation[0] += degrees * (Math.PI / 180); break;
        case 'y': newRotation[1] += degrees * (Math.PI / 180); break;
        case 'z': newRotation[2] += degrees * (Math.PI / 180); break;
      }

      return { ...item, rotation: newRotation };
    }));
  };

  // Scale furniture
  const adjustScale = (index: number, factor: number) => {
    setFurniture(prev => prev.map((item, i) =>
      i === index ? { ...item, scale: Math.max(0.1, item.scale * factor) } : item
    ));
  };

  // Remove furniture
  const removeFurniture = (index: number) => {
    setFurniture(prev => prev.filter((_, i) => i !== index));
    setSelectedItemIndex(null);
  };

  // Toggle dragging mode
  const toggleDragging = () => {
    setDraggingEnabled(prev => !prev);
  };

  // Select furniture item
  const selectFurniture = (index: number) => {
    setSelectedItemIndex(index);
  };

  // Apply room preset
  const applyRoomPreset = (preset: RoomSettings) => {
    setRoom(preset);
  };

  // Design Project Functions
  const saveProject = async (projectInfo: {
    name: string;
    description?: string;
    designerId: string;
    customerId?: string[];
    thumbnailUrl?: string;
    status?: 'Draft' | 'In Progress' | 'Completed';
  }) => {
    try {
      setIsSaving(true);

      // Capture latest camera state
      const currentCameraState = captureCurrentCameraState();

      if (currentProject?.$id) {
        // Update existing project
        const updatedProject = await designProjectService.updateProject(
          currentProject.$id,
          designProjectService.stringifyProject({
            ...projectInfo,
            room,
            camera: currentCameraState,
            furniture
          })
        );

        setCurrentProject(designProjectService.parseProject(updatedProject));
      } else {

        // Create new project
        const newProject = await designProjectService.createProject({
          ...projectInfo,
          room: JSON.stringify(room),
          camera: JSON.stringify(currentCameraState),
          furniture: JSON.stringify(furniture),
          status: projectInfo.status || 'Draft'
        });

        setCurrentProject(designProjectService.parseProject(newProject));
      }

      return true;
    } catch (error) {
      console.error("Error saving project:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const project = await designProjectService.getProject(projectId);
      const parsedProject = designProjectService.parseProject(project);

      // Set current room state
      setRoom(parsedProject.room);

      // Set current camera state
      setCamera(parsedProject.camera);

      // Set current furniture state
      setFurniture(parsedProject.furniture);

      // Set current project
      setCurrentProject(parsedProject);

      return parsedProject;
    } catch (error) {
      console.error("Error loading project:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const success = await designProjectService.deleteProject(projectId);

      if (success && currentProject?.$id === projectId) {
        // Reset state if the deleted project was the current one
        setCurrentProject(null);
      }

      return success;
    } catch (error) {
      console.error("Error deleting project:", error);
      return false;
    }
  };

  const createNewProject = () => {
    // Reset to default state for a new project
    setRoom({
      width: 8,
      length: 8,
      height: 3,
      wallColor: '#f5f5f5',
      floorColor: '#e0e0e0'
    });
    setCamera({
      position: [0, 5, 10],
      target: [0, 0, 0],
      viewAngle: 50
    });
    setFurniture([]);
    setCurrentProject(null);
    setSelectedItemIndex(null);
  };

  return {
    room,
    furniture,
    products,
    camera,
    isLoading,
    isSaving,
    currentProductId,
    selectedItemIndex,
    draggingEnabled,
    currentProject,
    cameraRef,
    controlsRef,
    updateRoomDimensions,
    updateCamera,
    addFurniture,
    updateFurniturePosition,
    updateFurnitureTexture,
    rotateFurniture,
    adjustScale,
    removeFurniture,
    toggleDragging,
    selectFurniture,
    applyRoomPreset,
    saveProject,
    loadProject,
    deleteProject,
    createNewProject,
    captureCurrentCameraState
  };
}