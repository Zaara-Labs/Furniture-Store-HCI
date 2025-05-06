"use client";

import { useMemo } from 'react';
import * as THREE from 'three';
import { RoomSettings } from '@/types/room-designer';

interface Room3DProps {
  settings: RoomSettings;
}

const Room3D = ({ settings }: Room3DProps) => {
  const { width, length, height, wallColor, floorColor } = settings;
  
  // Use memo to prevent unnecessary rebuilding of geometry
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(width, length), [width, length]);
  const wall1Geometry = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);
  const wall2Geometry = useMemo(() => new THREE.PlaneGeometry(length, height), [length, height]);
  const wall3Geometry = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);
  const wall4Geometry = useMemo(() => new THREE.PlaneGeometry(length, height), [length, height]);
  
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width/2, 0, length/2]} receiveShadow>
        <primitive object={floorGeometry} />
        <meshStandardMaterial color={floorColor} roughness={0.8} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[width/2, height/2, 0]} receiveShadow>
        <primitive object={wall1Geometry} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>
      
      <mesh position={[0, height/2, length/2]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <primitive object={wall2Geometry} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>
      
      <mesh position={[width/2, height/2, length]} rotation={[0, Math.PI, 0]} receiveShadow>
        <primitive object={wall3Geometry} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>

      <mesh position={[width, height/2, length/2]} rotation={[0, -Math.PI/2, 0]} receiveShadow>
        <primitive object={wall4Geometry} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>
    </group>
  );
};

export default Room3D;