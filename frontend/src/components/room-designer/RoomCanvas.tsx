"use client";

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import Room3D from './Room3D';
import FurnitureItem from './FurnitureItem';
import ViewControls from './ViewControls';
import RoomSettings from './RoomSettings';
import FurnitureControls from './FurnitureControls';
import FurnitureList from './FurnitureList';
import { RoomSettings as RoomSettingsType, FurnitureItemProps, CameraSettings } from '@/types/room-designer';
import { Product } from '@/types/collections/Product';

interface RoomCanvasProps {
  room: RoomSettingsType;
  furniture: FurnitureItemProps[];
  camera: CameraSettings;
  products: Product[];
  selectedItemIndex: number | null;
  draggingEnabled: boolean;
  cameraRef: React.RefObject<THREE.PerspectiveCamera>;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  onUpdateRoom: (dimensions: Partial<RoomSettingsType>) => void;
  onUpdateCamera?: (settings: Partial<CameraSettings>) => void;
  onSelectFurniture: (index: number) => void;
  onUpdatePosition: (index: number, newPos: [number, number, number]) => void;
  onRotate: (index: number, axis: 'x' | 'y' | 'z', degrees: number) => void;
  onScale: (index: number, factor: number) => void;
  onRemoveFurniture: (index: number) => void;
  onUpdateTexture: (index: number, textureUrl: string) => void;
  onToggleDragging: () => void;
  onCaptureCameraState?: () => void;
}

const RoomCanvas = ({
  room,
  furniture,
  camera,
  products,
  selectedItemIndex,
  draggingEnabled,
  cameraRef,
  controlsRef,
  onUpdateRoom,
  onUpdateCamera,
  onSelectFurniture,
  onUpdatePosition,
  onRotate,
  onScale,
  onRemoveFurniture,
  onUpdateTexture,
  onToggleDragging,
  onCaptureCameraState
}: RoomCanvasProps) => {
  return (
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
          {furniture.map((item: FurnitureItemProps, index: number) => (
            <FurnitureItem
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              isSelected={index === selectedItemIndex}
              roomDimensions={room}
              onSelect={() => onSelectFurniture(index)}
              onPositionUpdate={(newPos: [number, number, number]) => onUpdatePosition(index, newPos)}
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
          target={camera.target || [room.width / 2, room.height / 2, room.length / 2]}
          enabled={!draggingEnabled || selectedItemIndex === null}
          onChange={() => onCaptureCameraState?.()}
        />
        
        <PerspectiveCamera
          makeDefault
          ref={cameraRef}
          position={camera.position}
          fov={camera.viewAngle}
          near={0.1}
          far={1000}
          onUpdate={(self) => {
            if (onUpdateCamera) {
              onUpdateCamera({
                position: [self.position.x, self.position.y, self.position.z] as [number, number, number],
                viewAngle: self.fov
              });
            }
          }}
        />
        
        <Environment preset="sunset" background={false} />
      </Canvas>
      
      {/* Controls */}
      <ViewControls 
        cameraRef={cameraRef as React.RefObject<THREE.PerspectiveCamera>} 
        controlsRef={controlsRef as React.RefObject<OrbitControlsImpl>} 
        room={room}
        onToggleDragging={onToggleDragging}
        draggingEnabled={draggingEnabled}
      />
      
      <RoomSettings 
        room={room} 
        onUpdateRoom={onUpdateRoom} 
      />
      
      {/* Furniture List */}
      <FurnitureList 
        furniture={furniture}
        selectedItemIndex={selectedItemIndex}
        onSelectFurniture={onSelectFurniture}
      />
      
      {/* Helper instructions */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 text-xs rounded-full px-3 py-1.5 shadow-sm border border-gray-100 text-gray-700 pointer-events-none">
        <span>{draggingEnabled ? "Drag to move furniture • Click to select" : "Click to select • Use controls to position"}</span>
      </div>
      
      {/* Item controls */}
      {selectedItemIndex !== null && (
        <FurnitureControls 
          selectedItem={furniture[selectedItemIndex]}
          selectedIndex={selectedItemIndex}
          products={products}
          roomDimensions={room}
          onRotate={onRotate}
          onScale={onScale}
          onRemove={onRemoveFurniture}
          onUpdatePosition={onUpdatePosition}
          onUpdateTexture={onUpdateTexture}
        />
      )}
    </div>
  );
};

export default RoomCanvas;