"use client";

import Navbar from '@/components/Navbar';
import RoomCanvas from '@/components/room-designer/RoomCanvas';
import ProductCatalog from '@/components/room-designer/ProductCatalog';
import { useRoomDesigner } from '@/hooks/useRoomDesigner';

export default function DesignerPage() {
  const {
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
  } = useRoomDesigner();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow flex flex-col md:flex-row pt-20">
        {/* 3D Canvas */}
        <RoomCanvas 
          room={room}
          furniture={furniture}
          products={products}
          selectedItemIndex={selectedItemIndex}
          draggingEnabled={draggingEnabled}
          onUpdateRoom={updateRoomDimensions}
          onSelectFurniture={selectFurniture}
          onUpdatePosition={updateFurniturePosition}
          onRotate={rotateFurniture}
          onScale={adjustScale}
          onRemoveFurniture={removeFurniture}
          onUpdateTexture={updateFurnitureTexture}
          onToggleDragging={toggleDragging}
        />
        
        {/* Product Catalog */}
        <ProductCatalog 
          products={products}
          isLoading={isLoading}
          currentProductId={currentProductId}
          onAddFurniture={addFurniture}
          onApplyRoomPreset={applyRoomPreset}
        />
      </main>
    </div>
  );
}