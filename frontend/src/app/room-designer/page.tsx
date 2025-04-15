"use client";

import { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { productService } from '@/services/appwrite';
import { Product } from '@/types/collections/Product';
import Image from 'next/image';
import Link from 'next/link';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

interface FurnitureItemProps {
  id: string;
  name: string;
  model: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  textureUrl?: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  dimensionSku: string;
}

export default function DesignerPage() {
  const [room, setRoom] = useState({ width: 8, length: 8, height: 3, wallColor: '#f5f5f5', floorColor: '#e0e0e0' });
  const [furniture, setFurniture] = useState<FurnitureItemProps[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [draggingEnabled, setDraggingEnabled] = useState(true);
  
  // Camera related refs and state
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef(null);
  
  // Initial camera position based on default room
  const initialCameraPosition = [8, 5, 16];

  // Room Presets
  const presets = [
    { name: 'Living Room', width: 8, length: 10, height: 3, wallColor: '#f0e6d2', floorColor: '#8b5a2b' },
    { name: 'Bedroom', width: 6, length: 8, height: 3, wallColor: '#e6f0f2', floorColor: '#a0a0a0' },
    { name: 'Office', width: 5, length: 6, height: 2.8, wallColor: '#ffffff', floorColor: '#c0c0c0' },
    { name: 'Dining', width: 7, length: 7, height: 3, wallColor: '#fffbe6', floorColor: '#bfa76a' },
    { name: 'Kids Room', width: 5, length: 5, height: 2.7, wallColor: '#fce4ec', floorColor: '#f8bbd0' },
    { name: 'Bathroom', width: 5, length: 5, height: 2.5, wallColor: '#e0f7fa', floorColor: '#b2ebf2' },
  ];

  // Fetch all products
  useEffect(() => {
    setIsLoading(true);
    productService.getAllProducts().then(res => {
      setProducts(res.documents as Product[]);
      setIsLoading(false);
    });
  }, []);

  // To apply room presets
  const applyPreset = (preset) => {
    setRoom(preset);
    
    if (controlsRef.current) {
      controlsRef.current.target.set(preset.width / 2, preset.height / 2, preset.length / 2);
    }
  };

  // To add furniture to room
  const addFurniture = (product: Product) => {
    const unitFactor = getUnitConversionFactor(product.dim_sku || 'cm');
    
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
      textureUrl: product.variation_texture_urls?.[0],
      dimensions: {
        width: product.dim_width || 1,
        height: product.dim_height || 1,
        depth: product.dim_depth || 1,
      },
      dimensionSku: product.dim_sku || 'cm',
    } as FurnitureItemProps]);
    setCurrentProductId(product.$id);
    setSelectedItemIndex(furniture.length);
  };
  
  // Helper function to get unit conversion factor to meters
  const getUnitConversionFactor = (unit: string) => {
    switch(unit.toLowerCase()) {
      case 'm': return 1;
      case 'cm': return 0.01;
      case 'in': return 0.0254;
      case 'ft': return 0.3048;
      default: return 1; // Default to m
    }
  };

  const updateFurniturePosition = (index: number, newPosition: [number, number, number]) => {
    console.log(`Updating position of item ${index} to ${newPosition}`);
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

  const toggleDragging = () => {
    setDraggingEnabled(prev => !prev);
  };

  const selectFurniture = (index) => {
    setSelectedItemIndex(index);
    const item = furniture[index];
    if (item && controlsRef.current) {
      // Focus on the selected item
      controlsRef.current.target.set(item.position[0], item.position[1], item.position[2]);
      controlsRef.current.update();
    }
  };

  const updateRoomDimensions = (dimensions: Partial<typeof room>) => {
    setRoom(prev => ({ ...prev, ...dimensions }));
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

  const resetCameraView = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(initialCameraPosition[0], initialCameraPosition[1], initialCameraPosition[2]);
      controlsRef.current.target.set(room.width / 2, room.height / 2, room.length / 2);
      controlsRef.current.update();
    }
  };

  const setOverheadView = () => {
    if (controlsRef.current && cameraRef.current) {
      const height = Math.max(room.width, room.length) * 0.75;
      cameraRef.current.position.set(room.width / 2, height * 1.5, room.length / 2);
      controlsRef.current.target.set(room.width / 2, 0, room.length / 2);
      controlsRef.current.update();
    }
  };

  const setFrontView = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(room.width / 2, room.height / 2, room.length * 1.5);
      controlsRef.current.target.set(room.width / 2, room.height / 2, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow flex flex-col md:flex-row pt-20">
        {/* 3D Canvas */}
        <div className="h-[60vh] md:h-auto md:w-[70%] relative bg-gray-50 border-b md:border-b-0">
          <Canvas 
            shadows
            gl={{ antialias: true, preserveDrawingBuffer: true }}
            dpr={[1, 1.5]} // Limit DPR to prevent performance issues
            style={{ 
              width: '100%', 
              height: '100%',
              background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)' 
            }}
          >
            {/* Scene Setup */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            
            {/* Room */}
            <Room3D settings={room} />
            
            {/* Furniture */}
            <Suspense fallback={null}>
              {furniture.map((item, index) => (
                <FurnitureItem 
                  key={`${item.id}-${index}`}
                  item={item} 
                  index={index}
                  isSelected={index === selectedItemIndex}
                  roomDimensions={room}
                  onSelect={() => selectFurniture(index)}
                  onPositionUpdate={(newPos) => updateFurniturePosition(index, newPos)}
                  draggingEnabled={draggingEnabled}
                />
              ))}
            </Suspense>
            
            {/* Camera & Controls */}
            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.1}
              minDistance={2}
              maxDistance={30}
              target={[room.width / 2, room.height / 2, room.length / 2]}
              enabled={!draggingEnabled || selectedItemIndex === null}
            />
            
            <PerspectiveCamera
              makeDefault
              ref={cameraRef}
              position={initialCameraPosition}
              fov={45}
              near={0.1}
              far={1000}
            />
            
            <Environment preset="sunset" background={false} />
          </Canvas>
          
          {/* Top toolbar */}
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
            <div className="h-6 border-r border-gray-300"></div>
            <button 
              className={`p-2 rounded-full transition-colors ${
                draggingEnabled 
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              title={draggingEnabled ? "Disable Dragging" : "Enable Dragging"}
              onClick={toggleDragging}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </button>
          </div>

          {/* Room Settings panel */}
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
                  <span className="text-xs font-medium">{room.width}m</span>
                </div>
                <input 
                  type="range" 
                  min={3} 
                  max={20} 
                  value={room.width} 
                  onChange={(e) => updateRoomDimensions({ width: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-600">Length</label>
                  <span className="text-xs font-medium">{room.length}m</span>
                </div>
                <input 
                  type="range" 
                  min={3} 
                  max={20} 
                  value={room.length}
                  onChange={(e) => updateRoomDimensions({ length: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-600">Height</label>
                  <span className="text-xs font-medium">{room.height}m</span>
                </div>
                <input 
                  type="range" 
                  min={2} 
                  max={5} 
                  step={0.1}
                  value={room.height}
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
                      value={room.wallColor} 
                      onChange={(e) => updateRoomDimensions({ wallColor: e.target.value })}
                      className="w-8 h-8 rounded border overflow-hidden cursor-pointer"
                    />
                    <span className="ml-2 text-xs uppercase">{room.wallColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Floor Color</label>
                  <div className="flex items-center">
                    <input 
                      type="color" 
                      value={room.floorColor} 
                      onChange={(e) => updateRoomDimensions({ floorColor: e.target.value })}
                      className="w-8 h-8 rounded border overflow-hidden cursor-pointer"
                    />
                    <span className="ml-2 text-xs uppercase">{room.floorColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Item controls */}
          {selectedItemIndex !== null && (
            <div className="absolute bottom-4 left-4 right-4 mx-auto bg-white p-4 rounded-lg shadow-md border border-gray-100 max-w-lg">
              <h3 className="font-medium text-sm mb-3 flex items-center text-amber-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                {furniture[selectedItemIndex]?.name || "Item Controls"}
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
              
              {/* Position Controls */}
              <div className="mb-3 border-b border-gray-100 pb-3">
                <h4 className="text-xs text-gray-600 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Position
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex flex-col">
                    <label className="text-gray-500 mb-1">X</label>
                    <input 
                      type="number" 
                      value={furniture[selectedItemIndex]?.position[0].toFixed(2)} 
                      onChange={(e) => {
                        const newPos = [...furniture[selectedItemIndex].position];
                        newPos[0] = Number(e.target.value);
                        updateFurniturePosition(selectedItemIndex, newPos as [number, number, number]);
                      }}
                      className="border rounded px-2 py-1"
                      step="0.1"
                      min="0"
                      max={room.width}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-500 mb-1">Y</label>
                    <input 
                      type="number" 
                      value={furniture[selectedItemIndex]?.position[1].toFixed(2)} 
                      onChange={(e) => {
                        const newPos = [...furniture[selectedItemIndex].position];
                        newPos[1] = Number(e.target.value);
                        updateFurniturePosition(selectedItemIndex, newPos as [number, number, number]);
                      }}
                      className="border rounded px-2 py-1"
                      step="0.1"
                      min="0"
                      max={room.height}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-500 mb-1">Z</label>
                    <input 
                      type="number" 
                      value={furniture[selectedItemIndex]?.position[2].toFixed(2)} 
                      onChange={(e) => {
                        const newPos = [...furniture[selectedItemIndex].position];
                        newPos[2] = Number(e.target.value);
                        updateFurniturePosition(selectedItemIndex, newPos as [number, number, number]);
                      }}
                      className="border rounded px-2 py-1"
                      step="0.1"
                      min="0"
                      max={room.length}
                    />
                  </div>
                </div>
              </div>
              
              {/* Texture Options */}
              {(() => {
                const currentProduct = products.find(p => p.$id === furniture[selectedItemIndex]?.id);
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

          {/* Guide bar */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 text-xs rounded-full px-3 py-1.5 shadow-sm border border-gray-100 text-gray-700 pointer-events-none">
            <span>{draggingEnabled ? "Drag to move furniture • Click to select" : "Click to select • Use controls to position"}</span>
          </div>
          
          {/* Furniture List Overlay*/}
          {furniture.length > 0 && (
            <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md border border-gray-100 max-w-sm max-h-[300px] overflow-auto">
              <h4 className="text-xs font-medium mb-2 text-gray-700">Furniture Items</h4>
              <ul className="space-y-1">
                {furniture.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => selectFurniture(index)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-md ${
                        selectedItemIndex === index 
                          ? "bg-amber-100 text-amber-800" 
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.name || `Item ${index + 1}`}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Product selection sidebar */}
        <div className="md:w-[30%] bg-white p-4 overflow-y-auto h-[40vh] md:h-auto border-l border-t md:border-t-0 border-gray-300 shadow-sm flex flex-col">
          <h2 className="font-medium text-lg mb-4 text-amber-800 border-b pb-2 border-amber-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            Add Furniture
          </h2>
          
          {/* Search bar */}
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
          
          {/* Product list */}
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
                    onClick={() => addFurniture(product)}
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
          
          {/* Room presets */}
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
                onClick={() => setRoom({
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
                onClick={() => setRoom({
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
                onClick={() => setRoom({
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
                onClick={() => setRoom({
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

function FurnitureItem({
  item,
  index,
  isSelected,
  roomDimensions,
  onSelect,
  onPositionUpdate,
  draggingEnabled
}) {
  const { scene } = useGLTF(item.model, true);
  const groupRef = useRef();
  const { camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load texture if available
  useEffect(() => {
    if (!scene) return;
    
    if (item.textureUrl) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(item.textureUrl, (texture) => {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Apply texture to the material
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });
      });
    }
  }, [scene, item.textureUrl]);
  
  // Update position from props - ensures the 3D object matches the React state
  useEffect(() => {
    if (groupRef.current && !isDragging) {
      groupRef.current.position.set(...item.position);
    }
  }, [item.position, isDragging]);
  
  // Handle dragging - now using consistent position updates
  useEffect(() => {
    if (!groupRef.current || !draggingEnabled) return;
    
    const controls = new DragControls([groupRef.current], camera, document.querySelector('canvas'));
    
    controls.addEventListener('dragstart', (event) => {
      console.log('Drag started:', groupRef.current.position);
      setIsDragging(true);
      onSelect(); // Select this item when drag starts
      console.log('Room dimension:', roomDimensions);
    });
    
    controls.addEventListener('drag', (event) => {
      // Keep Y position (height) constant during drag
      const y = item.position[1];
      event.object.position.y = y;
      console.log('Dragging:', event.object.position);

      // Calculate absolute position of the item from the relative coordinates
      const abs_x = groupRef.current.position.x + event.object.position.x;
      const abs_z = groupRef.current.position.z + event.object.position.z;
      
      // Constrain to room boundaries
      const halfWidth = item.dimensions.width * getUnitConversionFactor(item.dimensionSku) / 2;
      const halfDepth = item.dimensions.depth * getUnitConversionFactor(item.dimensionSku) / 2;

      event.object.position.x = Math.max(halfWidth, Math.min(roomDimensions.width - halfWidth, abs_x)) - groupRef.current.position.x;
      event.object.position.z = Math.max(halfDepth, Math.min(roomDimensions.length - halfDepth, abs_z)) - groupRef.current.position.z;
    });
    
    controls.addEventListener('dragend', (event) => {
      console.log('Drag ended:', event.object.position);
      setIsDragging(false);
      console.log('Initial absolute x', groupRef.current.position.x);
      console.log('Initial absolute z', groupRef.current.position.z);
      
      // Use the same update function for both drag and position controls
      onPositionUpdate([
        groupRef.current.position.x + event.object.position.x,
        groupRef.current.position.y,
        groupRef.current.position.z + event.object.position.z
      ]);
      event.object.position.x = 0;
      event.object.position.z = 0;
      
      console.log('Transformed relative x', event.object.position.x);
      console.log('Final absolute x', groupRef.current.position.x);
      console.log('Transformed relative z', event.object.position.z);
      console.log('Final absolute z', groupRef.current.position.z);
      console.log('Diff final & transformed x', groupRef.current.position.x - event.object.position.x);
      console.log('Diff final & transformed z', groupRef.current.position.z - event.object.position.z);
    });
    
    return () => {
      controls.dispose();
    };
  }, [camera, draggingEnabled, item.dimensions, item.dimensionSku, item.position, onPositionUpdate, onSelect, roomDimensions.length, roomDimensions.width]);
  
  // Apply correct dimensions based on the model and database dimensions
  useEffect(() => {
    if (!scene) return;
    
    // Ensure we scale the model properly on first load
    if (!modelLoaded) {
      console.log(`Scaling model for item ${index}:`, item.dimensions);
      
      // Calculate real-world size in meters based on dimension SKU
      const unitMultiplier = getUnitConversionFactor(item.dimensionSku);
      
      const targetWidth = item.dimensions.width * unitMultiplier;
      const targetHeight = item.dimensions.height * unitMultiplier;
      const targetDepth = item.dimensions.depth * unitMultiplier;
      
      console.log(`Target dimensions (m): ${targetWidth} x ${targetHeight} x ${targetDepth}`);
      
      // Reset any previous scaling and update world matrix
      scene.scale.set(1, 1, 1);
      scene.updateMatrixWorld(true);
      
      // Get the actual size of the model
      const box = new THREE.Box3().setFromObject(scene);
      const modelSize = box.getSize(new THREE.Vector3());
      
      console.log(`Original model size: ${modelSize.x} x ${modelSize.y} x ${modelSize.z}`);
      
      if (modelSize.x > 0 && modelSize.y > 0 && modelSize.z > 0) {
        // Calculate scale factors for each dimension
        const scaleX = targetWidth / modelSize.x;
        const scaleY = targetHeight / modelSize.y;
        const scaleZ = targetDepth / modelSize.z;
        
        // Apply uniform scaling if the model has unusual proportions
        let finalScaleX = scaleX;
        let finalScaleY = scaleY;
        let finalScaleZ = scaleZ;
        
        // Check if dimensions are very different - might indicate model orientation issues
        const maxScale = Math.max(scaleX, scaleY, scaleZ);
        const minScale = Math.min(scaleX, scaleY, scaleZ);
        
        if (maxScale / minScale > 5) {
          // If scales are very different, use the median scale as a uniform scale factor
          const scales = [scaleX, scaleY, scaleZ].sort((a, b) => a - b);
          const uniformScale = scales[1]; // Median value
          finalScaleX = finalScaleY = finalScaleZ = uniformScale;
          console.log(`Applied uniform scaling factor: ${uniformScale} due to disproportionate dimensions`);
        } else {
          console.log(`Applied scale factors: ${finalScaleX}, ${finalScaleY}, ${finalScaleZ}`);
        }
        
        // Apply scaling
        scene.scale.set(finalScaleX, finalScaleY, finalScaleZ);
        scene.updateMatrixWorld(true);
        
        // Verify final size
        const newBox = new THREE.Box3().setFromObject(scene);
        const newSize = newBox.getSize(new THREE.Vector3());
        console.log(`New model size: ${newSize.x.toFixed(2)} x ${newSize.y.toFixed(2)} x ${newSize.z.toFixed(2)}`);
        
        setModelLoaded(true);
      } else {
        console.warn('Model has invalid dimensions. Retrying scaling...');
        
        // Try again after a delay to let the model fully load
        const retryTimer = setTimeout(() => {
          setModelLoaded(false); // Force another attempt
        }, 500);
        
        return () => clearTimeout(retryTimer);
      }
    }
  }, [scene, item.dimensions, item.dimensionSku, modelLoaded, index]);
  
  // Optimized clone of the 3D model
  const clonedModel = useMemo(() => {
    if (!scene) return null;
    return scene.clone();
  }, [scene]);

  return (
    <group
      ref={groupRef}
      position={item.position}
      rotation={item.rotation}
      scale={[item.scale, item.scale, item.scale]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {clonedModel ? <primitive object={clonedModel} /> : (
        <mesh>
          <boxGeometry args={[
            item.dimensions.width * getUnitConversionFactor(item.dimensionSku), 
            item.dimensions.height * getUnitConversionFactor(item.dimensionSku), 
            item.dimensions.depth * getUnitConversionFactor(item.dimensionSku)
          ]} />
          <meshStandardMaterial color={isSelected ? "#f59e0b" : "#cccccc"} />
        </mesh>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <group>
          <Html center>
            <div className="w-6 h-6 rounded-full bg-amber-500 shadow-lg border-2 border-white -mt-6 flex items-center justify-center text-white text-xs font-bold">
              {index + 1}
            </div>
          </Html>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[
              Math.max(item.dimensions.width, item.dimensions.depth) * getUnitConversionFactor(item.dimensionSku) * 0.5,
              Math.max(item.dimensions.width, item.dimensions.depth) * getUnitConversionFactor(item.dimensionSku) * 0.55,
              32
            ]} />
            <meshBasicMaterial color="#f59e0b" opacity={0.5} transparent />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Helper function for unit conversion in component scope
function getUnitConversionFactor(unit: string) {
  switch(unit?.toLowerCase()) {
    case 'm': return 1;
    case 'cm': return 0.01;
    case 'in': return 0.0254;
    case 'ft': return 0.3048;
    default: return 1; // Default to m if unknown
  }
}

function Room3D({ settings }: { settings: { width: number, length: number, height: number, wallColor: string, floorColor: string } }) {
  const { width, length, height, wallColor, floorColor } = settings;
  
  // Use memo to prevent unnecessary rebuilding of geometry
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(width, length), [width, length]);
  const wallGeometry1 = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);
  const wallGeometry2 = useMemo(() => new THREE.PlaneGeometry(length, height), [length, height]);
  
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width/2, 0, length/2]} receiveShadow>
        <primitive object={floorGeometry} />
        <meshStandardMaterial color={floorColor} roughness={0.8} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[width/2, height/2, 0]} receiveShadow>
        <primitive object={wallGeometry1} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>
      
      <mesh position={[0, height/2, length/2]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <primitive object={wallGeometry2} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>
      
      <mesh position={[width, height/2, length/2]} rotation={[0, -Math.PI/2, 0]} receiveShadow>
        <primitive object={wallGeometry2} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>
      
      <mesh position={[width/2, height/2, length]} rotation={[0, Math.PI, 0]} receiveShadow>
        <primitive object={wallGeometry1} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>
    </group>
  );
}