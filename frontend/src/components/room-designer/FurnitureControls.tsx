"use client";

import { FurnitureItemProps } from '@/types/room-designer';
import { Product } from '@/types/collections/Product';

interface FurnitureControlsProps {
  selectedItem: FurnitureItemProps;
  selectedIndex: number;
  products: Product[];
  roomDimensions: { width: number; length: number; height: number };
  onRotate: (index: number, axis: 'x' | 'y' | 'z', degrees: number) => void;
  onScale: (index: number, factor: number) => void;
  onRemove: (index: number) => void;
  onUpdatePosition: (index: number, newPos: [number, number, number]) => void;
  onUpdateTexture: (index: number, textureUrl: string) => void;
}

const FurnitureControls = ({
  selectedItem,
  selectedIndex,
  products,
  roomDimensions,
  onRotate,
  onScale,
  onRemove,
  onUpdatePosition,
  onUpdateTexture
}: FurnitureControlsProps) => {
  // Find product data for the selected item
  const currentProduct = products.find(p => p.$id === selectedItem?.id);

  return (
    <div className="absolute bottom-4 left-4 right-4 mx-auto bg-white p-4 rounded-lg shadow-md border border-gray-100 max-w-lg">
      <h3 className="font-medium text-sm mb-3 flex items-center text-amber-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
        </svg>
        {selectedItem?.name || "Item Controls"}
      </h3>
      
      <div className="flex space-x-3 mb-3 border-b border-gray-100 pb-3">
        <button 
          onClick={() => onRotate(selectedIndex, 'y', -45)} 
          className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
          title="Rotate left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={() => onRotate(selectedIndex, 'y', 45)} 
          className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
          title="Rotate right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="border-r border-gray-200 mx-1"></div>
        <button 
          onClick={() => onScale(selectedIndex, 1.2)} 
          className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
          title="Scale up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={() => onScale(selectedIndex, 0.8)} 
          className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-700"
          title="Scale down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="border-r border-gray-200 mx-1"></div>
        <button 
          onClick={() => onRemove(selectedIndex)} 
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
              value={selectedItem?.position[0].toFixed(2)} 
              onChange={(e) => {
                const newPos = [...selectedItem.position] as [number, number, number];
                newPos[0] = Number(e.target.value);
                onUpdatePosition(selectedIndex, newPos);
              }}
              className="border rounded px-2 py-1"
              step="0.1"
              min="0"
              max={roomDimensions.width}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-500 mb-1">Y</label>
            <input 
              type="number" 
              value={selectedItem?.position[1].toFixed(2)} 
              onChange={(e) => {
                const newPos = [...selectedItem.position] as [number, number, number];
                newPos[1] = Number(e.target.value);
                onUpdatePosition(selectedIndex, newPos);
              }}
              className="border rounded px-2 py-1"
              step="0.1"
              min="0"
              max={roomDimensions.height}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-500 mb-1">Z</label>
            <input 
              type="number" 
              value={selectedItem?.position[2].toFixed(2)} 
              onChange={(e) => {
                const newPos = [...selectedItem.position] as [number, number, number];
                newPos[2] = Number(e.target.value);
                onUpdatePosition(selectedIndex, newPos);
              }}
              className="border rounded px-2 py-1"
              step="0.1"
              min="0"
              max={roomDimensions.length}
            />
          </div>
        </div>
      </div>
      
      {/* Texture Options */}
      {currentProduct && currentProduct.variation_texture_urls && 
       currentProduct.variation_names && 
       currentProduct.variation_color_codes && (
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
                  onClick={() => onUpdateTexture(selectedIndex, textureUrl || '')}
                  className={`flex items-center py-1.5 px-2.5 rounded-md transition-all ${
                    selectedItem.textureUrl === textureUrl
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
      )}
    </div>
  );
};

export default FurnitureControls;