"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { useGLTF } from '@react-three/drei';
import { FurnitureComponentProps } from '@/types/room-designer';
import { getUnitConversionFactor } from '@/utils/roomUtils';
import { GLTF } from 'three-stdlib';

const FurnitureItem = ({
  item,
  index,
  isSelected,
  roomDimensions,
  onSelect,
  onPositionUpdate,
  draggingEnabled
}: FurnitureComponentProps) => {
  const gltf = useGLTF(item.model, true) as GLTF;
  const scene = gltf.scene;
  const groupRef = useRef<THREE.Group>(null);
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
    
    // Define a basic type for the drag event object if not already defined elsewhere
    interface DragEvent {
      type: string;
      object: THREE.Object3D;
    }

    controls.addEventListener('dragstart', () => {
      console.log('Drag started:', groupRef.current?.position);
      setIsDragging(true);
      onSelect(); // Select this item when drag starts
    });
    
    controls.addEventListener('drag', (event: DragEvent) => {
      if (!groupRef.current) return;
      
      // Keep Y position (height) constant during drag
      const y = item.position[1];
      event.object.position.y = y;

      // Calculate absolute position of the item from the relative coordinates
      const abs_x = groupRef.current.position.x + event.object.position.x;
      const abs_z = groupRef.current.position.z + event.object.position.z;
      
      // Constrain to room boundaries
      const halfWidth = item.dimensions.width * getUnitConversionFactor(item.dimensionSku) / 2;
      const halfDepth = item.dimensions.depth * getUnitConversionFactor(item.dimensionSku) / 2;

      event.object.position.x = Math.max(halfWidth, Math.min(roomDimensions.width - halfWidth, abs_x)) - groupRef.current.position.x;
      event.object.position.z = Math.max(halfDepth, Math.min(roomDimensions.length - halfDepth, abs_z)) - groupRef.current.position.z;
    });
    
    controls.addEventListener('dragend', (event: DragEvent) => {
      console.log('Drag ended:', event.object.position);
      setIsDragging(false);
      
      if (!groupRef.current) return;
      
      // Use the same update function for both drag and position controls
      onPositionUpdate([
        groupRef.current.position.x + event.object.position.x,
        groupRef.current.position.y,
        groupRef.current.position.z + event.object.position.z
      ]);
      event.object.position.x = 0;
      event.object.position.z = 0;
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
};

export default FurnitureItem;