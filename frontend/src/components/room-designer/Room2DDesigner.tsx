"use client";

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { RoomSettings, FurnitureItemProps } from '@/types/room-designer';
import { Product } from '@/types/collections/Product';
import { getUnitConversionFactor, roomPresets } from '@/utils/roomUtils';

interface Room2DDesignerProps {
  room: RoomSettings;
  furniture: FurnitureItemProps[];
  products: Product[];
  selectedItemIndex: number | null;
  onUpdateRoom: (dimensions: Partial<RoomSettings>) => void;
  onSelectFurniture: (index: number) => void;
  onUpdatePosition: (index: number, newPos: [number, number, number]) => void;
  onRotateFurniture: (index: number, axis: 'x' | 'y' | 'z', degrees: number) => void;
  onAddFurniture: (product: Product) => void;
  onRemoveFurniture: (index: number) => void;
  onApplyRoomPreset: (preset: RoomSettings) => void;
  onUpdateFurnitureTexture?: (index: number, textureUrl: string) => void;
}

const Room2DDesigner = ({
  room,
  furniture,
  products,
  selectedItemIndex,
  onUpdateRoom,
  onSelectFurniture,
  onUpdatePosition,
  onRotateFurniture,
  onAddFurniture,
  onRemoveFurniture,
  onApplyRoomPreset,
  onUpdateFurnitureTexture
}: Room2DDesignerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [scale, setScale] = useState(30); // pixels per meter
  const [dragging, setDragging] = useState(false);
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Update canvas dimensions when component mounts or window resizes
  useEffect(() => {
    const updateCanvasDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parentWidth = canvasRef.current.parentElement.clientWidth;
        const parentHeight = canvasRef.current.parentElement.clientHeight;
        setCanvasWidth(parentWidth);
        setCanvasHeight(parentHeight);
        
        // Adjust scale to fit room in canvas
        const widthScale = parentWidth * 0.8 / room.width;
        const heightScale = parentHeight * 0.8 / room.length;
        setScale(Math.min(widthScale, heightScale));
      }
    };

    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [room.width, room.length]);

  // Draw 2D room and furniture
  useEffect(() => {
    if (!canvasRef.current || canvasWidth === 0 || canvasHeight === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate room position to center it in canvas
    const roomX = (canvasWidth - room.width * scale) / 2;
    const roomY = (canvasHeight - room.length * scale) / 2;

    // Draw room
    ctx.fillStyle = room.floorColor;
    ctx.fillRect(roomX, roomY, room.width * scale, room.length * scale);
    
    // Draw room border
    ctx.strokeStyle = room.wallColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(roomX, roomY, room.width * scale, room.length * scale);

    // Draw grid (1m x 1m)
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = 1; x < room.width; x++) {
      ctx.beginPath();
      ctx.moveTo(roomX + x * scale, roomY);
      ctx.lineTo(roomX + x * scale, roomY + room.length * scale);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 1; y < room.length; y++) {
      ctx.beginPath();
      ctx.moveTo(roomX, roomY + y * scale);
      ctx.lineTo(roomX + room.width * scale, roomY + y * scale);
      ctx.stroke();
    }

    // Draw furniture
    furniture.forEach((item, index) => {
      // Get unit conversion factor
      const unitFactor = getUnitConversionFactor(item.dimensionSku);
      
      // Convert furniture dimensions to meters
      const width = item.dimensions.width * unitFactor;
      const depth = item.dimensions.depth * unitFactor;
      
      // Calculate furniture position in canvas
      const x = roomX + item.position[0] * scale - (width * scale) / 2;
      const y = roomY + item.position[2] * scale - (depth * scale) / 2;
      
      // Determine color based on selection
      ctx.fillStyle = index === selectedItemIndex ? '#ffb74d' : '#bdbdbd';
      
      if (item.rotation[1] === 0 || Math.abs(item.rotation[1]) === Math.PI) {
        // Not rotated or rotated 180 degrees
        ctx.fillRect(x, y, width * scale, depth * scale);
      } else {
        // Rotated 90 or 270 degrees - swap width and depth
        ctx.fillRect(x, y, depth * scale, width * scale);
      }
      
      // Draw furniture border
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      
      if (item.rotation[1] === 0 || Math.abs(item.rotation[1]) === Math.PI) {
        ctx.strokeRect(x, y, width * scale, depth * scale);
      } else {
        ctx.strokeRect(x, y, depth * scale, width * scale);
      }
      
      // Add label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      if (item.rotation[1] === 0 || Math.abs(item.rotation[1]) === Math.PI) {
        ctx.fillText(item.name, x + (width * scale) / 2, y + (depth * scale) / 2);
      } else {
        ctx.fillText(item.name, x + (depth * scale) / 2, y + (width * scale) / 2);
      }
    });

  }, [canvasWidth, canvasHeight, room, furniture, selectedItemIndex, scale]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate room position
    const roomX = (canvasWidth - room.width * scale) / 2;
    const roomY = (canvasHeight - room.length * scale) / 2;

    // Check if clicked on furniture
    for (let i = furniture.length - 1; i >= 0; i--) {
      const item = furniture[i];
      const unitFactor = getUnitConversionFactor(item.dimensionSku);
      const width = item.dimensions.width * unitFactor;
      const depth = item.dimensions.depth * unitFactor;
      
      let itemX = roomX + item.position[0] * scale - (width * scale) / 2;
      let itemY = roomY + item.position[2] * scale - (depth * scale) / 2;
      let itemWidth = width * scale;
      let itemDepth = depth * scale;
      
      if (item.rotation[1] !== 0 && Math.abs(item.rotation[1]) !== Math.PI) {
        // Adjust for rotation
        itemX = roomX + item.position[0] * scale - (depth * scale) / 2;
        itemY = roomY + item.position[2] * scale - (width * scale) / 2;
        itemWidth = depth * scale;
        itemDepth = width * scale;
      }
      
      if (x >= itemX && x <= itemX + itemWidth && y >= itemY && y <= itemY + itemDepth) {
        // Clicked on this furniture item
        onSelectFurniture(i);
        setDragging(true);
        setDragItemIndex(i);
        setDragStartPos({ x, y });
        return;
      }
    }

    // If clicked outside furniture, deselect
    onSelectFurniture(-1);
  };
  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || dragItemIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate position change in canvas pixels
    const deltaX = x - dragStartPos.x;
    const deltaY = y - dragStartPos.y;

    // Convert to meters
    const deltaXMeters = deltaX / scale;
    const deltaYMeters = deltaY / scale;

    // Get current item position
    const item = furniture[dragItemIndex];
    const newPosition: [number, number, number] = [
      item.position[0] + deltaXMeters,
      item.position[1],
      item.position[2] + deltaYMeters
    ];

    // Apply boundary constraints
    const unitFactor = getUnitConversionFactor(item.dimensionSku);
    const halfWidth = (item.dimensions.width * unitFactor) / 2;
    const halfDepth = (item.dimensions.depth * unitFactor) / 2;

    // Ensure item remains within room boundaries
    newPosition[0] = Math.max(halfWidth, Math.min(room.width - halfWidth, newPosition[0]));
    newPosition[2] = Math.max(halfDepth, Math.min(room.length - halfDepth, newPosition[2]));

    // Update position
    onUpdatePosition(dragItemIndex, newPosition);
    setDragStartPos({ x, y });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDragging(false);
    setDragItemIndex(null);
  };

  // Rotate selected furniture
  const handleRotate = () => {
    if (selectedItemIndex !== null) {
      onRotateFurniture(selectedItemIndex, 'y', 90);
    }
  };

  // Delete selected furniture
  const handleDelete = () => {
    if (selectedItemIndex !== null) {
      onRemoveFurniture(selectedItemIndex);
    }
  };

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md border border-gray-100 z-20">
        <h3 className="font-medium text-sm mb-3 flex items-center text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
          </svg>
          2D Design Controls
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
              onChange={(e) => onUpdateRoom({ width: Number(e.target.value) })}
              className="w-full accent-blue-600"
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
              onChange={(e) => onUpdateRoom({ length: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Wall Color</label>
              <div className="flex items-center">
                <input 
                  type="color" 
                  value={room.wallColor} 
                  onChange={(e) => onUpdateRoom({ wallColor: e.target.value })}
                  className="w-8 h-8 rounded border overflow-hidden cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Floor Color</label>
              <div className="flex items-center">
                <input 
                  type="color" 
                  value={room.floorColor} 
                  onChange={(e) => onUpdateRoom({ floorColor: e.target.value })}
                  className="w-8 h-8 rounded border overflow-hidden cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Room Layout Selection Panel */}
      <div className="absolute top-65 left-4 bg-white p-4 rounded-lg shadow-md border border-gray-200 z-20" style={{ maxHeight: '300px', width: '260px' }}>
        <h3 className="font-medium text-sm mb-3 flex items-center text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
          </svg>
          Select Room Layout
        </h3>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 max-h-[220px]">
          {roomPresets.map((preset, index) => (
            <button 
              key={index}
              className="flex flex-col items-center p-2 border border-gray-200 hover:border-blue-400 rounded text-center hover:bg-blue-50 transition-all"
              onClick={() => onApplyRoomPreset(preset)}
              title={`Apply ${preset.name} layout (${preset.width}m × ${preset.length}m)`}
            >
              <div 
                className="mb-1 rounded border-2 flex items-center justify-center relative"
                style={{ 
                  backgroundColor: preset.floorColor,
                  borderColor: preset.wallColor,
                  width: `${Math.min(60, preset.width * 6)}px`,
                  height: `${Math.min(50, preset.length * 5)}px`,
                }}
              >
                {/* Furniture icon to indicate scale */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-medium truncate w-full">{preset.name}</span>
              <span className="text-gray-500 text-xs">{preset.width}m × {preset.length}m</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected item controls */}
      {selectedItemIndex !== null && (
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-md border border-gray-100 z-20" style={{ width: '320px' }}>
          <h3 className="font-medium text-sm mb-3 flex items-center text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            {furniture[selectedItemIndex]?.name || "Item Controls"}
          </h3>
          
          <div className="flex space-x-3 mb-3 border-b border-gray-100 pb-3">
            <button 
              onClick={() => onRotateFurniture(selectedItemIndex, 'y', -45)} 
              className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
              title="Rotate left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={() => onRotateFurniture(selectedItemIndex, 'y', 45)} 
              className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
              title="Rotate right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={handleRotate} 
              className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
              title="Rotate 90°"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="border-r border-gray-200 mx-1"></div>
            <button 
              onClick={handleDelete} 
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
                  value={furniture[selectedItemIndex].position[0].toFixed(2)} 
                  onChange={(e) => {
                    const newPos = [...furniture[selectedItemIndex].position] as [number, number, number];
                    newPos[0] = Number(e.target.value);
                    onUpdatePosition(selectedItemIndex, newPos);
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
                  value={furniture[selectedItemIndex].position[1].toFixed(2)} 
                  onChange={(e) => {
                    const newPos = [...furniture[selectedItemIndex].position] as [number, number, number];
                    newPos[1] = Number(e.target.value);
                    onUpdatePosition(selectedItemIndex, newPos);
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
                  value={furniture[selectedItemIndex].position[2].toFixed(2)} 
                  onChange={(e) => {
                    const newPos = [...furniture[selectedItemIndex].position] as [number, number, number];
                    newPos[2] = Number(e.target.value);
                    onUpdatePosition(selectedItemIndex, newPos);
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
          {products.find(p => p.$id === furniture[selectedItemIndex].id)?.variation_texture_urls && (
            <div className="mb-3">
              <h4 className="text-xs text-gray-600 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                Available Options
              </h4>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {(() => {
                  const currentProduct = products.find(p => p.$id === furniture[selectedItemIndex].id);
                  if (!currentProduct || !currentProduct.variation_texture_urls || 
                      !currentProduct.variation_names || 
                      !currentProduct.variation_color_codes) return null;
                  
                  return currentProduct.variation_names.map((name, index) => {
                    const textureUrl = currentProduct.variation_texture_urls?.[index];
                    const colorCode = currentProduct.variation_color_codes?.[index];
                    
                    return (
                      <button 
                        key={index} 
                        onClick={() => onUpdateFurnitureTexture && onUpdateFurnitureTexture(selectedItemIndex, textureUrl || '')}
                        className={`flex items-center py-1.5 px-2.5 rounded-md transition-all ${
                          furniture[selectedItemIndex].textureUrl === textureUrl
                            ? "border-blue-800 bg-blue-50 shadow-sm"
                            : "border border-gray-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <span 
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0 border border-gray-200" 
                          style={{ backgroundColor: `#${colorCode}` }}
                        ></span>
                        <span className="text-xs font-medium truncate max-w-[80px]">{name}</span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            <p>Drag to move item • Use position controls for precise placement</p>
            <p>Rotation buttons for orientation • Click texture options to change appearance</p>
          </div>
        </div>
      )}

      {/* Simple product catalog */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md border border-gray-200 z-20" style={{ width: '250px', maxHeight: '400px' }}>
        <h3 className="font-medium text-sm mb-3 flex items-center text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          Add Furniture
        </h3>
        <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto pr-1">
          {products.filter(product => product.model_3d_url).map((product) => (
            <button
              key={product.$id}
              onClick={() => onAddFurniture(product)}
              className="text-left p-2 hover:bg-blue-50 rounded flex items-center"
            >
              <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image 
                    src={product.images[0]} 
                    alt={product.name} 
                    width={40} 
                    height={40} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-xs font-medium">{product.name}</div>
                <div className="text-xs text-gray-500">
                  {product.dim_width}x{product.dim_depth}x{product.dim_height} {product.dim_sku}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Helper text */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 text-xs rounded-full px-3 py-1.5 shadow-sm border border-gray-100 text-gray-700 z-20">
        <span>Click and drag to move items • Click to select • Choose room presets or customize dimensions</span>
      </div>
    </div>
  );
};

export default Room2DDesigner;
