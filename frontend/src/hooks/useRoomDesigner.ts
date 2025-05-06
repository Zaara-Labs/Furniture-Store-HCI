"use client";

import { useState, useEffect } from 'react';
import { productService } from '@/services/appwrite';
import { RoomSettings, FurnitureItemProps } from '@/types/room-designer';
import { Product } from '@/types/collections/Product';
import { getUnitConversionFactor } from '@/utils/roomUtils';

export function useRoomDesigner() {
  // Room state
  const [room, setRoom] = useState<RoomSettings>({
    width: 8,
    length: 8,
    height: 3,
    wallColor: '#f5f5f5',
    floorColor: '#e0e0e0'
  });

  // Furniture state
  const [furniture, setFurniture] = useState<FurnitureItemProps[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Add furniture to room
  const addFurniture = (product: Product) => {
    // Skip if product has no 3D model
    if (!product.model_3d_url) {
      console.error('Cannot add furniture: Product has no 3D model');
      return;
    }

    const position = [
      Math.random() * (room.width - 1) + 0.5,
      0,
      Math.random() * (room.length - 1) + 0.5
    ];

    setFurniture(prev => [...prev, {
      id: product.$id,
      name: product.name,
      model: product.model_3d_url,
      position: position as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: 1,
      textureUrl: product.variation_texture_urls?.[0] || '',
      dimensions: {
        width: product.dim_width || 1,
        height: product.dim_height || 1,
        depth: product.dim_depth || 1,
      },
      dimensionSku: product.dim_sku || 'cm',
    }]);

    setCurrentProductId(product.$id);
    setSelectedItemIndex(furniture.length);
  };

  // Update furniture position
  const updateFurniturePosition = (index: number, newPosition: [number, number, number]) => {
    setFurniture(prev => prev.map((item, i) =>
      i === index ? { ...item, position: newPosition } : item
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

  return {
    room,
    furniture,
    products,
    isLoading,
    currentProductId,
    selectedItemIndex,
    draggingEnabled,
    updateRoomDimensions,
    addFurniture,
    updateFurniturePosition,
    updateFurnitureTexture,
    rotateFurniture,
    adjustScale,
    removeFurniture,
    toggleDragging,
    selectFurniture,
    applyRoomPreset
  };
}