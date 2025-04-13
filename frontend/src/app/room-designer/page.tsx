"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { productService } from "@/services/appwrite";
import { Product } from "@/types/collections/Product";
import Link from 'next/link';
import Image from 'next/image';

interface FurnitureItem {
  id: string;
  model: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  textureUrl?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  dimensionSku?: string;
}

interface RoomSettings {
  width: number;
  length: number;
  height: number;
  wallColor: string;
  floorColor: string;
}

// DraggableModel component allows furniture to be moved
const DraggableModel = ({ 
  modelPath, 
  position, 
  rotation, 
  scale,
  dimensions,
  dimensionSku,
  textureUrl, 
  onPositionChange, 
  onSelect, 
  isSelected,
  roomBounds,
  otherFurniture
}: {
  modelPath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number; 
  dimensions?: {width: number, height: number, depth: number};
  dimensionSku?: string;
  textureUrl?: string;
  onPositionChange: (newPosition: [number, number, number]) => void;
  onSelect: () => void;
  isSelected: boolean;
  roomBounds: {width: number, length: number};
  otherFurniture: {
    position: [number, number, number],
    dimensions?: {width: number, height: number, depth: number},
    dimensionSku?: string
  }[];
}) => {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<[number, number, number]>([0, 0, 0]);
  const [modelBounds, setModelBounds] = useState<{width: number, depth: number}>({ width: 1, depth: 1 });

  // Convert dimensions from source units to meters (for Three.js)
  const convertToMeters = (value: number, sku: string): number => {
    switch (sku?.toLowerCase()) {
      case 'cm': return value / 100;
      case 'in': return value * 0.0254;
      case 'ft': return value * 0.3048;
      case 'm': 
      default: return value;
    }
  };

  useEffect(() => {
    if (dimensions && dimensionSku) {
      const widthInMeters = convertToMeters(dimensions.width, dimensionSku);
      const depthInMeters = convertToMeters(dimensions.depth, dimensionSku);
      
      setModelBounds({
        width: widthInMeters,
        depth: depthInMeters
      });
    }
  }, [dimensions, dimensionSku]);

  useEffect(() => {
    if (modelRef.current) {
      // Clone the scene to avoid modifying the cached one
      const clonedScene = scene.clone();
      
      // Apply texture if provided
      if (textureUrl) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(textureUrl, (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          
          clonedScene.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
              const mesh = node as THREE.Mesh;
              if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material = mesh.material.clone();
                (mesh.material as THREE.MeshStandardMaterial).map = texture;
                mesh.material.needsUpdate = true;
              }
            }
          });
        });
      }
      
      // Remove any existing children and add the cloned scene
      while (modelRef.current.children.length > 0) {
        modelRef.current.remove(modelRef.current.children[0]);
      }
      modelRef.current.add(clonedScene);
      
      // Calculate proper scaling based on dimensions if provided
      if (dimensions && dimensionSku) {
        // Convert dimensions to meters
        const widthInMeters = convertToMeters(dimensions.width, dimensionSku);
        const heightInMeters = convertToMeters(dimensions.height, dimensionSku);
        const depthInMeters = convertToMeters(dimensions.depth, dimensionSku);
        
        // Get the original bounding box to find model proportions
        const box = new THREE.Box3().setFromObject(clonedScene);
        const modelSize = box.getSize(new THREE.Vector3());
        
        // Calculate scale factors for each dimension
        const scaleX = widthInMeters / modelSize.x;
        const scaleY = heightInMeters / modelSize.y;
        const scaleZ = depthInMeters / modelSize.z;
        
        // Apply the calculated scale
        clonedScene.scale.set(scaleX * scale, scaleY * scale, scaleZ * scale);
        
        // Center the model based on its base (bottom)
        const centeredBox = new THREE.Box3().setFromObject(clonedScene);
        clonedScene.position.y = -centeredBox.min.y; // Align the bottom of the model to y=0
        clonedScene.position.x = -centeredBox.getCenter(new THREE.Vector3()).x;
        clonedScene.position.z = -centeredBox.getCenter(new THREE.Vector3()).z;
      } else {
        // Fallback to default scaling and centering if dimensions aren't provided
        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = box.getCenter(new THREE.Vector3());
        clonedScene.position.sub(center);
        clonedScene.position.y = 0;
      }
    }
  }, [scene, textureUrl, dimensions, dimensionSku, scale]);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    dragStartPos.current = [...position] as [number, number, number];
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && modelRef.current) {
      e.stopPropagation();
      
      // Get the intersection point with the ground plane
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectPoint = new THREE.Vector3();
      
      if (e.ray) {
        e.ray.intersectPlane(groundPlane, intersectPoint);
      } else {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(e.point.x, e.point.y), e.camera);
        raycaster.ray.intersectPlane(groundPlane, intersectPoint);
      }
      
      // Calculate potential new position
      let newX = intersectPoint.x;
      let newZ = intersectPoint.z;
      
      // Boundary checks to keep furniture within the room
      const halfWidth = modelBounds.width / 2;
      const halfDepth = modelBounds.depth / 2;
      
      // Room boundaries (accounting for furniture size)
      const roomMaxX = roomBounds.width / 2 - halfWidth;
      const roomMinX = -roomBounds.width / 2 + halfWidth;
      const roomMaxZ = roomBounds.length / 2 - halfDepth;
      const roomMinZ = -roomBounds.length / 2 + halfDepth;
      
      // Constrain position within room boundaries
      newX = Math.min(Math.max(newX, roomMinX), roomMaxX);
      newZ = Math.min(Math.max(newZ, roomMinZ), roomMaxZ);
      
      // Check collision with other furniture
      const currentFurnitureCollisionBox = {
        minX: newX - halfWidth,
        maxX: newX + halfWidth,
        minZ: newZ - halfDepth,
        maxZ: newZ + halfDepth
      };
      
      let hasCollision = false;
      
      for (const item of otherFurniture) {
        // Skip collision check with self
        if (item.position[0] === position[0] && item.position[2] === position[2]) {
          continue;
        }
        
        // Calculate other item bounds
        const otherWidth = item.dimensions 
          ? convertToMeters(item.dimensions.width, item.dimensionSku || 'cm') 
          : 1;
        const otherDepth = item.dimensions 
          ? convertToMeters(item.dimensions.depth, item.dimensionSku || 'cm') 
          : 1;
        
        const otherX = item.position[0];
        const otherZ = item.position[2];
        
        const otherCollisionBox = {
          minX: otherX - otherWidth / 2,
          maxX: otherX + otherWidth / 2,
          minZ: otherZ - otherDepth / 2,
          maxZ: otherZ + otherDepth / 2
        };
        
        // Check for overlap between collision boxes
        if (
          currentFurnitureCollisionBox.minX < otherCollisionBox.maxX &&
          currentFurnitureCollisionBox.maxX > otherCollisionBox.minX &&
          currentFurnitureCollisionBox.minZ < otherCollisionBox.maxZ &&
          currentFurnitureCollisionBox.maxZ > otherCollisionBox.minZ
        ) {
          hasCollision = true;
          break;
        }
      }
      
      if (!hasCollision) {
        onPositionChange([newX, position[1], newZ]);
      }
    }
  };

  const onPointerUp = () => {
    setIsDragging(false);
  };

  return (
    <group
      ref={modelRef}
      position={position}
      rotation={rotation.map(r => r * Math.PI / 180) as [number, number, number]}
      scale={[scale, scale, scale]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerOut={onPointerUp}
    >
      {isSelected && (
        <mesh position={[0, -0.05, 0]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial color="#3498db" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

// Room component creates walls and floor
const Room = ({ settings }: { settings: RoomSettings }) => {
  const { width, length, height, wallColor, floorColor } = settings;
  
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>
      
      {/* Back Wall */}
      <mesh position={[0, height / 2, -length / 2]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Left Wall */}
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Right Wall */}
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Main room designer component
function RoomDesigner() {
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get('productId');
  
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProductId, setCurrentProductId] = useState<string | null>(initialProductId);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [roomSettings, setRoomSettings] = useState<RoomSettings>({
    width: 10,
    length: 10,
    height: 3,
    wallColor: '#f5f5f5',
    floorColor: '#d2b48c',
  });

  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Camera position states
  const defaultCameraPosition = useMemo(() => new THREE.Vector3(5, 5, 5), []);
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  
  // Camera control functions
  const resetCameraView = () => {
    if (orbitControlsRef.current && cameraRef.current) {
      // Reset camera position to default
      cameraRef.current.position.copy(defaultCameraPosition);
      orbitControlsRef.current.target.copy(defaultTarget);
      
      // Update orbit controls
      orbitControlsRef.current.update();
    }
  };
  
  const setOverheadView = () => {
    if (orbitControlsRef.current && cameraRef.current) {
      // Calculate appropriate height based on room size
      const height = Math.max(roomSettings.width, roomSettings.length) * 0.75;
      
      // Position camera directly above the center of the room
      cameraRef.current.position.set(0, height, 0);
      orbitControlsRef.current.target.set(0, 0, 0);
      
      // Update orbit controls
      orbitControlsRef.current.update();
    }
  };
  
  const setFrontView = () => {
    if (orbitControlsRef.current && cameraRef.current) {
      // Position camera at the front of the room
      cameraRef.current.position.set(0, roomSettings.height / 2, roomSettings.length);
      orbitControlsRef.current.target.set(0, roomSettings.height / 2, 0);
      
      // Update orbit controls
      orbitControlsRef.current.update();
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productService.getAllProducts();
        setProducts(response.documents as Product[]);
        
        // If there's an initial product ID, add it to the room
        if (initialProductId) {
          const product = response.documents.find(p => p.$id === initialProductId) as Product;
          if (product && product.model_3d_url) {
            addFurnitureToRoom(product);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [initialProductId]);

  const addFurnitureToRoom = (product: Product) => {
    if (!product.model_3d_url) return;
    
    // Create dimensions object from individual dimension fields
    const dimensions = {
      width: product.dim_width || 1,
      height: product.dim_height || 1,
      depth: product.dim_depth || 1
    };
    
    const newItem: FurnitureItem = {
      id: product.$id,
      model: product.model_3d_url,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      textureUrl: product.variation_texture_urls?.[0],
      dimensions: dimensions, 
      dimensionSku: product.dim_sku || 'cm' // Default to cm if not specified
    };
    
    setFurniture(prev => [...prev, newItem]);
    setSelectedItemIndex(furniture.length);
  };

  const updateFurniturePosition = (index: number, newPosition: [number, number, number]) => {
    setFurniture(prev => prev.map((item, i) => 
      i === index ? { ...item, position: newPosition } : item
    ));
  };

  const updateFurnitureTexture = (index: number, textureUrl: string) => {
    setFurniture(prev => prev.map((item, i) => 
      i === index ? { ...item, textureUrl } : item
    ));
  };

  const rotateFurniture = (index: number, axis: 'x' | 'y' | 'z', degrees: number) => {
    setFurniture(prev => prev.map((item, i) => {
      if (i !== index) return item;
      
      const newRotation = [...item.rotation] as [number, number, number];
      switch(axis) {
        case 'x': newRotation[0] += degrees; break;
        case 'y': newRotation[1] += degrees; break;
        case 'z': newRotation[2] += degrees; break;
      }
      
      return { ...item, rotation: newRotation };
    }));
  };

  const adjustScale = (index: number, factor: number) => {
    setFurniture(prev => prev.map((item, i) => 
      i === index ? { ...item, scale: Math.max(0.1, item.scale * factor) } : item
    ));
  };

  const removeFurniture = (index: number) => {
    setFurniture(prev => prev.filter((_, i) => i !== index));
    setSelectedItemIndex(null);
  };

  const updateRoomDimensions = (dimensions: Partial<RoomSettings>) => {
    setRoomSettings(prev => ({ ...prev, ...dimensions }));
  };

  // Filter products based on search query
  const filteredProducts = products
    .filter(product => product.model_3d_url)
    .filter(product => 
      searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow flex flex-col md:flex-row pt-20">
        {/* 3D Canvas with improved layout */}
        <div className="h-[60vh] md:h-auto md:w-[70%] relative bg-gray-50 border-b md:border-b-0">
          <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }} style={{ background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)' }}>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            
            <Room settings={roomSettings} />
            
            {furniture.map((item, index) => (
              <DraggableModel
                key={`${item.id}-${index}`}
                modelPath={item.model}
                position={item.position}
                rotation={item.rotation}
                scale={item.scale}
                dimensions={item.dimensions}
                dimensionSku={item.dimensionSku}
                textureUrl={item.textureUrl}
                onPositionChange={(newPos) => updateFurniturePosition(index, newPos)}
                onSelect={() => setSelectedItemIndex(index)}
                isSelected={selectedItemIndex === index}
                roomBounds={{ width: roomSettings.width, length: roomSettings.length }}
                otherFurniture={furniture.filter((_, i) => i !== index)}
              />
            ))}
            
            <PerspectiveCamera makeDefault position={[5, 5, 5]} ref={cameraRef} />
            <OrbitControls 
              ref={orbitControlsRef}
              enableDamping 
              dampingFactor={0.1}
              minDistance={1}
              maxDistance={20}
              camera={cameraRef.current || undefined}
            />
          </Canvas>
          
          {/* Top toolbar for important actions */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-md px-4 py-2 flex items-center space-x-3 z-10">
            <button 
              className="p-2 rounded-full hover:bg-amber-50 text-amber-800 transition-colors"
              title="Reset view"
              onClick={resetCameraView}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="h-6 border-r border-gray-300"></div>
            <button 
              className="p-2 rounded-full hover:bg-amber-50 text-amber-800 transition-colors"
              title="Overhead view"
              onClick={setOverheadView}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="p-2 rounded-full hover:bg-amber-50 text-amber-800 transition-colors"
              title="Front view"
              onClick={setFrontView}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Improved room settings panel */}
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <h3 className="font-medium text-sm mb-3 flex items-center text-amber-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
              Room Settings
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-600">Width</label>
                  <span className="text-xs font-medium">{roomSettings.width}m</span>
                </div>
                <input 
                  type="range" 
                  min={3} 
                  max={20} 
                  value={roomSettings.width} 
                  onChange={(e) => updateRoomDimensions({ width: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-600">Length</label>
                  <span className="text-xs font-medium">{roomSettings.length}m</span>
                </div>
                <input 
                  type="range" 
                  min={3} 
                  max={20} 
                  value={roomSettings.length}
                  onChange={(e) => updateRoomDimensions({ length: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-600">Height</label>
                  <span className="text-xs font-medium">{roomSettings.height}m</span>
                </div>
                <input 
                  type="range" 
                  min={2} 
                  max={5} 
                  step={0.1}
                  value={roomSettings.height}
                  onChange={(e) => updateRoomDimensions({ height: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Wall Color</label>
                  <div className="flex items-center">
                    <input 
                      type="color" 
                      value={roomSettings.wallColor} 
                      onChange={(e) => updateRoomDimensions({ wallColor: e.target.value })}
                      className="w-8 h-8 rounded border overflow-hidden cursor-pointer"
                    />
                    <span className="ml-2 text-xs uppercase">{roomSettings.wallColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Floor Color</label>
                  <div className="flex items-center">
                    <input 
                      type="color" 
                      value={roomSettings.floorColor} 
                      onChange={(e) => updateRoomDimensions({ floorColor: e.target.value })}
                      className="w-8 h-8 rounded border overflow-hidden cursor-pointer"
                    />
                    <span className="ml-2 text-xs uppercase">{roomSettings.floorColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Redesigned item controls */}
          {selectedItemIndex !== null && (
            <div className="absolute bottom-4 left-4 right-4 mx-auto bg-white p-4 rounded-lg shadow-md border border-gray-100 max-w-lg">
              <h3 className="font-medium text-sm mb-3 flex items-center text-amber-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                Item Controls
              </h3>
              
              <div className="flex space-x-3 mb-3 border-b border-gray-100 pb-3">
                <button 
                  onClick={() => rotateFurniture(selectedItemIndex, 'y', -45)} 
                  className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
                  title="Rotate left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={() => rotateFurniture(selectedItemIndex, 'y', 45)} 
                  className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
                  title="Rotate right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="border-r border-gray-200 mx-1"></div>
                <button 
                  onClick={() => adjustScale(selectedItemIndex, 1.2)} 
                  className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
                  title="Scale up"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={() => adjustScale(selectedItemIndex, 0.8)} 
                  className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
                  title="Scale down"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="border-r border-gray-200 mx-1"></div>
                <button 
                  onClick={() => removeFurniture(selectedItemIndex)} 
                  className="bg-red-50 hover:bg-red-100 p-2 rounded-full text-red-600"
                  title="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Apply textures with color codes and variation names */}
              {(() => {
                const currentProduct = products.find(p => p.$id === furniture[selectedItemIndex].id);
                if (!currentProduct || !currentProduct.variation_texture_urls || !currentProduct.variation_names || !currentProduct.variation_color_codes) {
                  return null;
                }
                
                return (
                  <div>
                    <h4 className="text-xs text-gray-600 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                      </svg>
                      Available Options
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentProduct.variation_names.map((name, index) => {
                        const textureUrl = currentProduct.variation_texture_urls?.[index];
                        const colorCode = currentProduct.variation_color_codes?.[index];
                        
                        return (
                          <button 
                            key={index} 
                            onClick={() => updateFurnitureTexture(selectedItemIndex, textureUrl || '')}
                            className={`flex items-center py-1.5 px-2.5 rounded-md transition-all ${
                              furniture[selectedItemIndex].textureUrl === textureUrl
                                ? "border-amber-800 bg-amber-50 shadow-sm"
                                : "border border-gray-200 bg-white hover:border-amber-300"
                            }`}
                          >
                            <span 
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0 border border-gray-200" 
                              style={{ backgroundColor: `#${colorCode}` }}
                            ></span>
                            <span className="text-xs font-medium truncate max-w-[80px]">{name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Simple help tooltip */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 text-xs rounded-full px-3 py-1.5 shadow-sm border border-gray-100 text-gray-700 pointer-events-none">
            <span>Drag to move • Left-click: Rotate • Right-click: Pan • Scroll: Zoom</span>
          </div>
        </div>
        
        {/* Redesigned product selection sidebar with flex layout to position elements */}
        <div className="md:w-[30%] bg-white p-4 overflow-y-auto h-[40vh] md:h-auto border-l border-t md:border-t-0 border-gray-300 shadow-sm flex flex-col">
          <h2 className="font-medium text-lg mb-4 text-amber-800 border-b pb-2 border-amber-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            Add Furniture
          </h2>
          
          {/* Enhanced search bar */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 absolute left-3 top-3 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Product list with flex-grow to take available space */}
          <div className="flex-grow overflow-y-auto mb-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-800 mb-2"></div>
                  <p className="text-sm text-gray-500">Loading furniture...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 mb-2">No furniture matches your search</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-amber-700 underline text-sm hover:text-amber-900"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map(product => (
                  <div 
                    key={product.$id} 
                    className={`bg-white rounded-lg border hover:shadow-md transition-all p-2 cursor-pointer 
                      ${currentProductId === product.$id ? 'ring-2 ring-amber-500 border-transparent shadow-sm' : 'border-gray-200 hover:border-amber-200'}`}
                    onClick={() => {
                      setCurrentProductId(product.$id);
                      addFurnitureToRoom(product);
                    }}
                  >
                    <div className="aspect-square relative mb-2 rounded-md overflow-hidden bg-gray-100 group">
                      {product.main_image_url ? (
                        <>
                          <Image 
                            src={product.main_image_url}
                            alt={product.name}
                            fill
                            className="object-cover rounded group-hover:scale-105 transition-transform"
                            sizes="(max-width: 768px) 50vw, 15vw"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                            <button className="bg-amber-700 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                          <span className="text-xs text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium truncate">{product.name}</h3>
                    <p className="text-xs text-amber-700 font-medium">${product.variation_prices ? product.variation_prices[0] : 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Room presets section fixed at bottom */}
          <div className="border-t border-gray-100 pt-4 mt-auto">
            <h3 className="font-medium text-sm mb-3 text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Room Presets
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="border border-gray-200 hover:border-amber-300 p-3 rounded-lg hover:bg-amber-50 transition-all text-left"
                onClick={() => setRoomSettings({
                  width: 8,
                  length: 10,
                  height: 3,
                  wallColor: '#f0e6d2',
                  floorColor: '#8b5a2b',
                })}
              >
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-[#f0e6d2] border border-gray-300 mr-2"></span>
                  <span className="text-sm font-medium">Living Room</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">8m × 10m space</p>
              </button>
              
              <button 
                className="border border-gray-200 hover:border-amber-300 p-3 rounded-lg hover:bg-amber-50 transition-all text-left"
                onClick={() => setRoomSettings({
                  width: 6,
                  length: 8,
                  height: 3,
                  wallColor: '#e6f0f2',
                  floorColor: '#a0a0a0',
                })}
              >
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-[#e6f0f2] border border-gray-300 mr-2"></span>
                  <span className="text-sm font-medium">Bedroom</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">6m × 8m space</p>
              </button>
              
              <button 
                className="border border-gray-200 hover:border-amber-300 p-3 rounded-lg hover:bg-amber-50 transition-all text-left"
                onClick={() => setRoomSettings({
                  width: 5,
                  length: 6,
                  height: 2.8,
                  wallColor: '#ffffff',
                  floorColor: '#c0c0c0',
                })}
              >
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-white border border-gray-300 mr-2"></span>
                  <span className="text-sm font-medium">Office</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">5m × 6m space</p>
              </button>
              
              <button 
                className="border border-gray-200 hover:border-amber-300 p-3 rounded-lg hover:bg-amber-50 transition-all text-left"
                onClick={() => setRoomSettings({
                  width: 5,
                  length: 5,
                  height: 2.8,
                  wallColor: '#e0f2e0',
                  floorColor: '#a0a0a0',
                })}
              >
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-[#e0f2e0] border border-gray-300 mr-2"></span>
                  <span className="text-sm font-medium">Bathroom</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">5m × 5m space</p>
              </button>
            </div>
          
            <div className="mt-4 text-center">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center px-4 py-2 text-amber-800 border border-amber-300 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Browse More Products
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Page component with Suspense boundary
export default function RoomDesignerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading Room Designer...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <RoomDesigner />
    </Suspense>
  );
}