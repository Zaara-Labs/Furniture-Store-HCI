"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
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
  // State for model loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTextureLoading, setIsTextureLoading] = useState(false);
  const [textureError, setTextureError] = useState<string | null>(null);
  const [textureUrl, setTextureUrl] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Load the model with error handling
  const { scene, error } = useGLTF(item.model, true) as GLTF & { error?: Error };
  
  // Handle loading errors
  useEffect(() => {
    if (error) {
      console.error('Error loading model:', error);
      setLoadError(`Failed to load model: ${error.message}`);
      setIsLoading(false);
    }
  }, [error]);
  
  // Handle model loading completion
  useEffect(() => {
    if (scene && !modelLoaded) {
      const checkModelLoaded = () => {
        // Check if the scene has any children (meshes)
        if (scene.children.length > 0) {
          console.log(`Model loaded successfully for ${item.name}`);
          setIsLoading(false);
          // Apply settings once the model is fully loaded
          applyModelSettings();
        } else {
          // If no children yet, check again after a short delay
          setTimeout(checkModelLoaded, 100);
        }
      };
      
      checkModelLoaded();
    }
  }, [scene]);
  
  // Function to apply settings to the model once loaded
  const applyModelSettings = () => {
    if (!scene) return;
    
    console.log(`Scaling model for item ${index}:`, item.dimensions);
    
    try {
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
        
        // Apply texture if available
        if (item.textureUrl) {
          applyTexture(item.textureUrl);
        }
        
        setModelLoaded(true);
      } else {
        console.warn('Model has invalid dimensions, will retry...');
        // Try again after a delay
        setTimeout(() => applyModelSettings(), 500);
      }
    } catch (err) {
      console.error('Error applying model settings:', err);
      setLoadError(`Error configuring model: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };
  
  // Function to apply texture to the model
  const applyTexture = (textureUrl: string) => {
    if (!scene) return;

    setIsTextureLoading(true);
    setTextureError(null);
    setTextureUrl(textureUrl);
    
    try {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        textureUrl,
        (texture) => {
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              // Apply texture to the material
              child.material.map = texture;
              child.material.needsUpdate = true;
            }
          });
          setIsTextureLoading(false);
          console.log('Texture applied successfully');
        },
        undefined,
        (err) => {
          setIsTextureLoading(false);
          setTextureError(`Failed to load texture: ${err instanceof Error ? err.message : String(err)}`);
          console.error('Error loading texture:', err);
        }
      );
    } catch (err) {
      console.error('Error applying texture:', err);
    }
  };
  
  // Update texture when it changes in props
  useEffect(() => {
    if (modelLoaded && item.textureUrl) {
      applyTexture(item.textureUrl);
    }
  }, [item.textureUrl, modelLoaded]);
  
  // Update position from props - ensures the 3D object matches the React state
  useEffect(() => {
    if (groupRef.current && !isDragging) {
      groupRef.current.position.set(...item.position);
    }
  }, [item.position, isDragging]);
  
  // Handle dragging
  useEffect(() => {
    if (!groupRef.current || !draggingEnabled || !modelLoaded) return;

    // Create a plane for XZ movement constraint (parallel to the floor)
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const fixedY = item.position[1]; // Store Y position to maintain it during drag
    
    // Raycaster for plane intersection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const intersectionPoint = new THREE.Vector3();
    
    // Track drag state
    let isDragging = false;
    let dragOffset = new THREE.Vector3();
    
    // Get canvas for event handling
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Start dragging
    const onPointerDown = (event: PointerEvent) => {
      if (!groupRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Set raycaster from camera
      raycaster.setFromCamera(mouse, camera);
      
      // If ray intersects with object, start dragging
      const intersects = raycaster.intersectObject(groupRef.current, true);
      if (intersects.length > 0) {
        // Prevent orbit controls from interfering
        if (camera.controls && camera.controls.enabled) {
          camera.controls.enabled = false;
        }
        
        // Calculate intersection with floor plane
        raycaster.ray.intersectPlane(floorPlane, intersectionPoint);
        
        // Calculate offset so the object doesn't jump to the cursor
        dragOffset.copy(groupRef.current.position).sub(intersectionPoint);
        
        isDragging = true;
        setIsDragging(true);
        onSelect(); // Select this item
        
        // Prevent default browser behavior
        event.preventDefault();
      }
    };
    
    // Continue dragging
    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging || !groupRef.current) return;
      
      // Calculate mouse position
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Cast ray and find intersection with floor plane
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(floorPlane, intersectionPoint);
      
      // Set new position with offset and fixed Y
      const newPos = intersectionPoint.add(dragOffset);
      newPos.y = fixedY; // Keep Y position fixed
      
      // Calculate dimensions for boundary checking
      const unitFactor = getUnitConversionFactor(item.dimensionSku);
      const halfWidth = (item.dimensions.width * unitFactor) / 2;
      const halfDepth = (item.dimensions.depth * unitFactor) / 2;
      
      // Apply room boundary constraints
      newPos.x = Math.max(halfWidth, Math.min(roomDimensions.width - halfWidth, newPos.x));
      newPos.z = Math.max(halfDepth, Math.min(roomDimensions.length - halfDepth, newPos.z));
      
      // Update position
      groupRef.current.position.copy(newPos);
    };
    
    // End dragging
    const onPointerUp = () => {
      if (isDragging && groupRef.current) {
        isDragging = false;
        setIsDragging(false);
        
        // Re-enable orbit controls
        if (camera.controls) {
          camera.controls.enabled = true;
        }
        
        // Notify parent component of position update
        onPositionUpdate([
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z
        ]);
      }
    };
    
    // Add event listeners
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);
    
    // Clean up
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerUp);
    };
  }, [camera, draggingEnabled, item.position, item.dimensions, item.dimensionSku, onPositionUpdate, onSelect, roomDimensions.length, roomDimensions.width, modelLoaded]);
  
  // Optimized clone of the 3D model
  const clonedModel = useMemo(() => {
    if (!scene || !modelLoaded) return null;
    return scene.clone();
  }, [scene, modelLoaded]);

  // Create a placeholder box with the correct dimensions
  const placeholderBox = useMemo(() => {
    const width = item.dimensions.width * getUnitConversionFactor(item.dimensionSku);
    const height = item.dimensions.height * getUnitConversionFactor(item.dimensionSku);
    const depth = item.dimensions.depth * getUnitConversionFactor(item.dimensionSku);
    return { width, height, depth };
  }, [item.dimensions, item.dimensionSku]);

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
      {isLoading ? (
        // Loading state - display a placeholder box with a loading indicator
        <>
          <mesh>
            <boxGeometry args={[
              placeholderBox.width, 
              placeholderBox.height, 
              placeholderBox.depth
            ]} />
            <meshStandardMaterial color="#cccccc" opacity={0.7} transparent />
          </mesh>
          <Html center>
            <div className="bg-white bg-opacity-90 px-3 py-2 rounded-md shadow-md">
              <div className="flex items-center justify-center">
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-amber-600 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Loading {item.name}...</span>
              </div>
            </div>
          </Html>
        </>
      ) : loadError ? (
        // Error state - display error message and placeholder box
        <>
          <mesh>
            <boxGeometry args={[
              placeholderBox.width, 
              placeholderBox.height, 
              placeholderBox.depth
            ]} />
            <meshStandardMaterial color="#ff6b6b" opacity={0.7} transparent />
          </mesh>
          <Html center>
            <div className="bg-white bg-opacity-90 px-3 py-2 rounded-md shadow-md max-w-[200px]">
              <div className="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mb-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-red-600">Failed to load model</span>
              </div>
            </div>
          </Html>
        </>
      ) : clonedModel ? (
        <>
          <primitive object={clonedModel} />
          
          {/* Texture loading indicator */}
          {isTextureLoading && isSelected && (
            <Html center>
              <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-sm">
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-3 w-3 mr-2 border-t-2 border-amber-600 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Applying texture...</span>
                </div>
              </div>
            </Html>
          )}
          
          {/* Texture error indicator */}
          {textureError && isSelected && (
            <Html position={[0, placeholderBox.height + 0.2, 0]}>
              <div className="bg-red-50 border border-red-200 px-2 py-1 rounded-md shadow-sm">
                <div className="flex items-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Texture error</span>
                </div>
              </div>
            </Html>
          )}
        </>
      ) : (
        // Fallback placeholder if no model but no error
        <mesh>
          <boxGeometry args={[
            placeholderBox.width, 
            placeholderBox.height, 
            placeholderBox.depth
          ]} />
          <meshStandardMaterial color={isSelected ? "#f59e0b" : "#cccccc"} />
        </mesh>
      )}
      
      {/* Selection indicator - always show regardless of loading state */}
      {isSelected && (
        <group>
          <Html center>
            <div className="w-6 h-6 rounded-full bg-amber-500 shadow-lg border-2 border-white -mt-6 flex items-center justify-center text-white text-xs font-bold">
              {index + 1}
            </div>
          </Html>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[
              Math.max(placeholderBox.width, placeholderBox.depth) * 0.5,
              Math.max(placeholderBox.width, placeholderBox.depth) * 0.55,
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