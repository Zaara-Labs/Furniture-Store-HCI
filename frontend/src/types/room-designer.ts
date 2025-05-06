import { Product } from './collections/Product';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

export interface RoomSettings {
  width: number;
  length: number;
  height: number;
  wallColor: string;
  floorColor: string;
}

export interface FurnitureItemProps {
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

export interface FurnitureComponentProps {
  item: FurnitureItemProps;
  index: number;
  isSelected: boolean;
  roomDimensions: { width: number; length: number; height: number };
  onSelect: () => void;
  onPositionUpdate: (newPos: [number, number, number]) => void;
  draggingEnabled: boolean;
}

export interface RoomPreset {
  name: string;
  width: number;
  length: number;
  height: number;
  wallColor: string;
  floorColor: string;
}

export type ViewType = 'default' | 'overhead' | 'front';

export interface CameraRefs {
  cameraRef: React.RefObject<THREE.PerspectiveCamera>;
  controlsRef: React.RefObject<OrbitControlsImpl>;
}