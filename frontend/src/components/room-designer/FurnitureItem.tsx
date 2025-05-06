"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { FurnitureComponentProps } from '@/types/room-designer';
import { getUnitConversionFactor } from '@/utils/roomUtils';
import { GLTF } from 'three-stdlib';

// Cache for storing model clones by instanceId
const modelInstanceCache = new Map<string, THREE.Group>();

// Cache for storing textures by URL
const textureCache = new Map<string, THREE.Texture>();

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
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();

  // Store instanceId and index for validation
  const instanceId = useMemo(() => item.instanceId || `instance-${index}`, [item.instanceId, index]);
  
  // Using instance-specific refs to track our model and its materials
  const instanceMaterials = useRef<THREE.Material[]>([]);
  
  // Load the model with error handling - this is the base model that we'll clone
  const { scene: baseScene, error } = useGLTF(item.model, true) as GLTF & { error?: Error };
  
  // Handle loading errors
  useEffect(() => {
    if (error) {
      console.error(`Error loading model for instance ${instanceId}:`, error);
      setLoadError(`Failed to load model: ${error.message}`);
      setIsLoading(false);
    }
  }, [error, instanceId]);

  // Deep clone a model and its materials, ensuring complete independence
  const createIndependentModelCopy = (originalScene: THREE.Group): THREE.Group => {
    console.log(`Creating independent model for instance ${instanceId} (index: ${index})`);
    
    // Create a deep clone of the scene
    const clonedScene = originalScene.clone(true);
    
    // Reset material references for this instance
    instanceMaterials.current = [];
    
    // Process all materials in the cloned scene to ensure uniqueness
    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        // Handle array of materials
        if (Array.isArray(node.material)) {
          node.material = node.material.map((mat) => {
            // Create a completely new material instance
            const newMat = new THREE.MeshStandardMaterial().copy(mat);
            
            // Store reference to our new material
            instanceMaterials.current.push(newMat);
            
            // Add metadata to help with debugging
            newMat.userData = { 
              instanceId, 
              furnitureIndex: index,
              originalMaterialUuid: mat.uuid
            };
            
            return newMat;
          });
        } 
        // Handle single material
        else if (node.material) {
          // Create a completely new material instance
          const newMat = new THREE.MeshStandardMaterial().copy(node.material);
          
          // Store reference to our new material
          instanceMaterials.current.push(newMat);
          
          // Add metadata to help with debugging
          newMat.userData = { 
            instanceId, 
            furnitureIndex: index,
            originalMaterialUuid: node.material.uuid
          };
          
          node.material = newMat;
        }
      }
    });
    
    console.log(`Created independent model with ${instanceMaterials.current.length} unique materials`);
    return clonedScene;
  };
  
  // Create/retrieve model for this instance
  useEffect(() => {
    if (!baseScene || modelLoaded) return;
    
    const initializeModel = () => {
      try {
        // Check if we have loaded meshes
        if (baseScene.children.length > 0) {
          console.log(`Initializing model for ${item.name} (instance: ${instanceId}, index: ${index})`);
          
          // Create an independent copy with unique materials
          const independentModel = createIndependentModelCopy(baseScene);
          
          // Store in our instance-specific ref
          modelRef.current = independentModel;
          
          // Cache the model by instanceId for potential reuse
          modelInstanceCache.set(instanceId, independentModel);
          
          // Now apply scaling and other settings
          applyModelSettings();
          
          setIsLoading(false);
          setModelLoaded(true);
        } else {
          // No meshes yet, try again shortly
          setTimeout(initializeModel, 100);
        }
      } catch (err) {
        console.error(`Error initializing model for instance ${instanceId}:`, err);
        setLoadError(`Error preparing model: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };
    
    initializeModel();
  }, [baseScene, instanceId, index, item.name, modelLoaded]);
  
  // Apply scaling and other settings to the model
  const applyModelSettings = () => {
    if (!modelRef.current) return;
    
    try {
      const model = modelRef.current;
      
      console.log(`Scaling model for instance ${instanceId} (index: ${index})`);
      
      // Calculate real-world size in meters based on dimension SKU
      const unitMultiplier = getUnitConversionFactor(item.dimensionSku);
      
      const targetWidth = item.dimensions.width * unitMultiplier;
      const targetHeight = item.dimensions.height * unitMultiplier;
      const targetDepth = item.dimensions.depth * unitMultiplier;
      
      // Reset scale and update matrix
      model.scale.set(1, 1, 1);
      model.updateMatrixWorld(true);
      
      // Calculate bounding box for scaling
      const box = new THREE.Box3().setFromObject(model);
      const modelSize = box.getSize(new THREE.Vector3());
      
      if (modelSize.x > 0 && modelSize.y > 0 && modelSize.z > 0) {
        // Calculate scale factors
        const scaleX = targetWidth / modelSize.x;
        const scaleY = targetHeight / modelSize.y;
        const scaleZ = targetDepth / modelSize.z;
        
        // Determine if we need uniform scaling for disproportionate models
        let finalScaleX = scaleX;
        let finalScaleY = scaleY;
        let finalScaleZ = scaleZ;
        
        const maxScale = Math.max(scaleX, scaleY, scaleZ);
        const minScale = Math.min(scaleX, scaleY, scaleZ);
        
        if (maxScale / minScale > 5) {
          // Use median for uniform scaling if dimensions are very different
          const scales = [scaleX, scaleY, scaleZ].sort((a, b) => a - b);
          const uniformScale = scales[1]; // Median value
          finalScaleX = finalScaleY = finalScaleZ = uniformScale;
        }
        
        // Apply scaling
        model.scale.set(finalScaleX, finalScaleY, finalScaleZ);
        model.updateMatrixWorld(true);
        
        // Apply initial texture if one is specified
        if (item.textureUrl) {
          applyTexture(item.textureUrl);
        }
      }
    } catch (err) {
      console.error(`Error scaling model for instance ${instanceId}:`, err);
      setLoadError(`Error configuring model: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Function to load and cache a texture
  const loadTexture = (url: string): Promise<THREE.Texture> => {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (textureCache.has(url)) {
        resolve(textureCache.get(url)!);
        return;
      }
      
      // Load new texture
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (texture) => {
          // Cache the texture
          textureCache.set(url, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  };
  
  // Apply texture to this specific instance only
  const applyTexture = async (textureUrl: string) => {
    if (!modelRef.current || instanceMaterials.current.length === 0) {
      console.warn(`Cannot apply texture to instance ${instanceId}: Model not ready`);
      return;
    }
    
    setIsTextureLoading(true);
    setTextureError(null);
    
    try {
      // Load or retrieve cached texture
      const texture = await loadTexture(textureUrl);
      
      // Apply to all materials for this instance (which we tracked in instanceMaterials)
      let materialsUpdated = 0;
      
      instanceMaterials.current.forEach(material => {
        if (material) {
          // Check if material is of a type that supports textures
          if (material instanceof THREE.MeshStandardMaterial) {
            material.map = texture;
            material.needsUpdate = true;
            materialsUpdated++;
          }
        }
      });
      
      setIsTextureLoading(false);
      console.log(`Texture applied to instance ${instanceId} (index: ${index}), updated ${materialsUpdated} materials`);
    } catch (err) {
      setIsTextureLoading(false);
      setTextureError(`Failed to load texture: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`Error applying texture to instance ${instanceId}:`, err);
    }
  };
  
  // Update texture when it changes in props
  useEffect(() => {
    if (modelLoaded && item.textureUrl) {
      applyTexture(item.textureUrl);
    }
  }, [item.textureUrl, modelLoaded]);
  
  // Update position from props
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
    const dragOffset = new THREE.Vector3();
    
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
        if ('controls' in camera && camera.controls) {
          (camera.controls as { enabled: boolean }).enabled = false;
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
        if ('controls' in camera && camera.controls) {
          (camera.controls as { enabled: boolean }).enabled = true;
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
      ) : modelRef.current ? (
        <>
          <primitive object={modelRef.current} />
          
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
          
          {/* Debug info - instance ID indicator (uncomment for debugging) */}
          {/* {isSelected && (
            <Html position={[0, placeholderBox.height + 0.3, 0]}>
              <div className="bg-blue-50 border border-blue-200 px-2 py-1 rounded-md shadow-sm text-xs">
                ID: {instanceId.substring(0, 8)}
              </div>
            </Html>
          )} */}
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