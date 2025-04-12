"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment, Loader } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { getGPUTier } from 'detect-gpu';

// Define quality settings type
interface QualitySettings {
  shadows: boolean;
  pixelRatio: number;
  antialias: boolean;
  envMapIntensity: number;
  lightIntensity: number;
  maxTextureSize: number;
  useSimpleMaterials: boolean;
}

// Define quality presets
const QUALITY_PRESETS: Record<string, QualitySettings> = {
  // Low-end devices
  low: {
    shadows: false,
    pixelRatio: 1,
    antialias: false,
    envMapIntensity: 0.5,
    lightIntensity: 0.8,
    maxTextureSize: 512,
    useSimpleMaterials: true
  },
  // Mid-range devices
  medium: {
    shadows: true,
    pixelRatio: 1.5,
    antialias: true,
    envMapIntensity: 1,
    lightIntensity: 1,
    maxTextureSize: 1024,
    useSimpleMaterials: false
  },
  // High-end devices
  high: {
    shadows: true,
    pixelRatio: window.devicePixelRatio || 2,
    antialias: true,
    envMapIntensity: 1.5,
    lightIntensity: 1.2,
    maxTextureSize: 2048,
    useSimpleMaterials: false
  }
};

// Hardware capability detection hook
function useDeviceCapabilities() {
  const [tier, setTier] = useState<string>('medium');
  const [qualitySettings, setQualitySettings] = useState<QualitySettings>(QUALITY_PRESETS.medium);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function detectCapabilities() {
      try {
        setIsLoading(true);

        // Detecting GPU capabilities
        const gpuTier = await getGPUTier();

        // Setting quality based on GPU tier and device type
        let deviceTier = 'medium';

        if (gpuTier.tier === 0) {
          deviceTier = 'low';
        } else if (gpuTier.tier >= 2 && !gpuTier.isMobile) {
          deviceTier = 'high';
        }

        console.log(navigator);
        console.log(typeof navigator);
        // Checking memory constraints
        const memory = (navigator as Navigator)?.deviceMemory;
        if (memory && memory <= 4) {
          deviceTier = 'low';
        }

        // Checking for battery saving mode
        const connection = (navigator as Navigator)?.connection;
        if (connection && (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
          deviceTier = 'low';
        }

        console.log(`Device capabilities detected: ${deviceTier} tier (GPU Tier: ${gpuTier.tier}, Mobile: ${gpuTier.isMobile})`);

        setTier(deviceTier);
        setQualitySettings(QUALITY_PRESETS[deviceTier as keyof typeof QUALITY_PRESETS]);
      } catch (error) {
        console.error("Error detecting device capabilities:", error);
        // Fall back to medium quality
        setTier('medium');
        setQualitySettings(QUALITY_PRESETS.medium);
      } finally {
        setIsLoading(false);
      }
    }

    detectCapabilities();
  }, []);

  return { tier, qualitySettings, isLoading };
}

// Model component props
interface ModelProps {
  modelPath: string;
  qualitySettings: QualitySettings;
  selectedTexture: string | null;
  errorState: React.Dispatch<React.SetStateAction<boolean>>
}

function Model({ modelPath, qualitySettings, selectedTexture, errorState }: ModelProps) {
  const gltf = useGLTF(modelPath);
  const { scene } = gltf;
  const modelRef = useRef<THREE.Group>(null);
  const fabricMaterials = useRef<THREE.Material[]>([]);
  
  // Load fabric textures
  const [textureMap, setTextureMap] = useState<Record<string, THREE.Texture | null>>({});
  
  // Load all sample textures when component mounts
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const texturePaths = {
      "fine-gray": "/images/textures/chair_texture_1.jpeg",
      "mustard": "/images/textures/chair_texture_2.jpeg",
      "rose-pink": "/images/textures/chair_texture_3.jpeg",
      "charcoal-gray": "/images/textures/chair_texture_4.jpeg",
    };
    
    const loadedTextures: Record<string, THREE.Texture | null> = {};
    
    try{
      // Pre-load all textures
      Object.entries(texturePaths).forEach(([key, path]) => {
        textureLoader.load(
          path, 
          (texture) => {
            // Successfully loaded texture
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2, 2); // Adjust texture tiling
            texture.anisotropy = qualitySettings.antialias ? 4 : 1;
            
            // Update the texture map state
            loadedTextures[key] = texture;
            setTextureMap(prev => ({...prev, [key]: texture}));
          },
          undefined,
          (err) => {
            console.error(`Failed to load texture: ${path}`, err);
            loadedTextures[key] = null;
          }
        );
      });
    } catch (error) {
      console.error("Error loading textures:", error);
      errorState(true);
    }
    
    // Clean up textures on unmount
    return () => {
      Object.values(loadedTextures).forEach(texture => {
        if (texture) texture.dispose();
      });
    };
  }, [qualitySettings.antialias, errorState]);

  // Apply quality settings to the model and identify fabric materials
  useEffect(() => {
    if (modelRef.current && qualitySettings) {
      // Reset fabric materials array
      fabricMaterials.current = [];
      
      modelRef.current.traverse((node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          // Applying shadow settings
          node.castShadow = qualitySettings.shadows;
          node.receiveShadow = qualitySettings.shadows;

          // For texture swapping
          if (node.material) {
            // If it's an array of materials, add each one
            if (Array.isArray(node.material)) {
              node.material.forEach((mat: THREE.Material) => {
                if (!fabricMaterials.current.includes(mat)) {
                  fabricMaterials.current.push(mat);
                }
              });
            } 
            // Single material
            else if (!fabricMaterials.current.includes(node.material)) {
              fabricMaterials.current.push(node.material);
            }

            // Apply optimizations based on quality settings
            if (qualitySettings.useSimpleMaterials) {
              // Convert complex materials to basic materials for low-end devices
              if (node.material instanceof THREE.MeshStandardMaterial) {
                const color = node.material.color.clone();
                const basicMaterial = new THREE.MeshBasicMaterial({
                  color: color,
                  map: node.material.map
                });
                node.material = basicMaterial;
              }
            } else {
              // Optimize texture sizes for the given quality
              if (node.material.map) {
                node.material.map.anisotropy = qualitySettings.antialias ? 4 : 1;
              }
            }
          }
        }
      });
      
      console.log(`Found ${fabricMaterials.current.length} materials to apply textures to`);
    }
  }, [scene, qualitySettings]);

  // Apply texture changes when selectedTexture changes
  useEffect(() => {
    if (selectedTexture && fabricMaterials.current.length > 0) {
      const newTexture = textureMap[selectedTexture];
      
      if (newTexture) {
        console.log(`Applying texture: ${selectedTexture} to ${fabricMaterials.current.length} materials`);
        
        fabricMaterials.current.forEach((material: THREE.Material) => {
          if (!material) return;
          
          if (material instanceof THREE.MeshStandardMaterial) {
          // Store original material state if not already stored
          if (!material.userData) material.userData = {};
          if (!material.userData.hasOriginal) {
            material.userData.originalProps = {
              color: material.color ? material.color.clone() : null,
              map: material.map,
              roughness: material.roughness,
              metalness: material.metalness,
              normalScale: material.normalScale ? material.normalScale.clone() : null,
              normalMap: material.normalMap,
              aoMap: material.aoMap,
              aoMapIntensity: material.aoMapIntensity,
              envMapIntensity: material.envMapIntensity
            };
            material.userData.hasOriginal = true;
          }

          // Apply new texture while preserving all other material properties
          if (material.map) {
            newTexture.wrapS = material.map.wrapS;
            newTexture.wrapT = material.map.wrapT;

            if (material.map.repeat) newTexture.repeat.copy(material.map.repeat);
            if (material.map.offset) newTexture.offset.copy(material.map.offset);
            if (material.map.center) newTexture.center.copy(material.map.center);
            newTexture.rotation = material.map.rotation;
            
            // Apply texture
            material.map = newTexture;
            
            // Force material update
            material.needsUpdate = true;
          } else {
            // For materials without existing textures
            material.map = newTexture;
            material.needsUpdate = true;
          }
        }
        });
      } else {
        console.warn(`Texture for ${selectedTexture} not loaded yet or failed to load`);
      }
    }
  }, [selectedTexture, textureMap]);

  // Center and scale the model on load
  React.useEffect(() => {
    if (modelRef.current) {
      // Create bounding box
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center the model horizontally (x and z)
      modelRef.current.position.x = -center.x;
      modelRef.current.position.z = -center.z;

      // Position model on the ground plane (y=-0.5) with small offset to prevent z-fighting
      modelRef.current.position.y = -box.min.y - 0.5 + 0.01;

      // Scale model to reasonable size
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      modelRef.current.scale.set(scale, scale, scale);
    }
  }, [scene]);

  return <primitive ref={modelRef} object={scene} />;
}

interface GroundProps {
  qualitySettings: QualitySettings;
}

// Simple ground component with quality-based rendering
function Ground({ qualitySettings }: GroundProps) {
  // Use simpler material for low-end devices
  const material = qualitySettings.useSimpleMaterials
    ? <meshBasicMaterial color="#eeeeee" />
    : <meshStandardMaterial color="#eeeeee" roughness={0.8} metalness={0.2} />;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow={qualitySettings.shadows}>
      <planeGeometry args={[10, 10]} />
      {material}
    </mesh>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

// Instructions overlay
function Instructions() {
  return (
    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white p-2 rounded text-xs pointer-events-none">
      <p>Left-click: Rotate | Right-click: Pan | Scroll: Zoom</p>
    </div>
  );
}

// Error message component
function ErrorMessage() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-80">
      <div className="bg-white p-4 rounded shadow-lg text-red-600">
        Error loading model. Please try again later.
      </div>
    </div>
  );
}

// Context loss message component
function ContextLostMessage() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-yellow-100 bg-opacity-80">
      <div className="bg-white p-4 rounded shadow-lg text-yellow-700">
        3D viewer resources exceeded. Please reload the page.
      </div>
    </div>
  );
}

// Performance monitoring component
function PerformanceMonitor() {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    // Handle WebGL context loss events
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost - possible performance issue');
    };

    // Monitor frame rate
    let lastTime = performance.now();
    let frames = 0;
    let fps = 60;

    const checkPerformance = () => {
      frames++;
      const now = performance.now();

      if (now >= lastTime + 1000) {
        fps = 0.25 * frames + 0.75 * fps;
        frames = 0;
        lastTime = now;

        if (fps < 15) {
          console.warn('Low frame rate detected:', fps.toFixed(1), 'fps');
        }
      }

      requestAnimationFrame(checkPerformance);
    };

    canvas.addEventListener('webglcontextlost', handleContextLoss);
    const perfMonitor = requestAnimationFrame(checkPerformance);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLoss);
      cancelAnimationFrame(perfMonitor);
    };
  }, [gl]);

  return null;
}

interface ColorPaletteProps {
  onSelectTexture: (texture: string) => void;
  selectedTexture: string | null;
}

// Color palette component for fabric textures
function ColorPalette({ onSelectTexture, selectedTexture }: ColorPaletteProps) {
  const textureOptions = [
        { name: "Charcoal Gray", key: "charcoal-gray", color: "#77808d" },
        { name: "Mustard", key: "mustard", color: "#ffe2ab" },
        { name: "Rose Pink", key: "rose-pink", color: "#fbb1d1" },
        { name: "Fine Gray", key: "fine-gray", color: "#d1d1d1" },
      ];

  return (
    <div className="absolute bottom-16 left-0 right-0 mx-auto p-3 bg-white bg-opacity-90 rounded-lg shadow-lg" style={{ maxWidth: "90%", width: "fit-content" }}>
      <h3 className="text-sm font-medium mb-2 text-gray-700">Color Options</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {textureOptions.map((texture) => (
          <button
            key={texture.key}
            title={texture.name}
            onClick={() => onSelectTexture(texture.key)}
            className={`w-8 h-8 rounded-full border overflow-hidden ${selectedTexture === texture.key ? 'border-4 border-blue-500' : 'border-transparent'}`}
            style={{ backgroundColor: texture.color}}
            aria-label={`Select ${texture.name} texture`}
          >
            <span className="sr-only">{texture.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 3D model viewer component
interface ModelViewerProps {
  modelPath: string;
  className?: string;
}

const ThreeJSModelViewer: React.FC<ModelViewerProps> = ({ modelPath, className = "" }) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [contextLost, setContextLost] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  // Set default texture to the first texture option
  const [selectedTexture, setSelectedTexture] = useState<string | null>("fine-gray");
  const [showTexturePalette, setShowTexturePalette] = useState<boolean>(false);
  
  // Get device capabilities and quality settings
  const { tier, qualitySettings, isLoading: detectingDevice } = useDeviceCapabilities();

  // Handle context loss events
  useEffect(() => {
    const handleContextLoss = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL context lost');
      setContextLost(true);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLoss);
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLoss);
      };
    }
  }, []);

  // Toggle texture palette visibility
  const toggleTexturePalette = () => {
    setShowTexturePalette(prev => !prev);
  };

  // Handle texture selection
  const handleSelectTexture = (texture: string) => {
    console.log(`Selected texture: ${texture}`);
    setSelectedTexture(texture);
  };

  if (contextLost) {
    return <ContextLostMessage />;
  }
  
  if (detectingDevice) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-800 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-700">Optimizing for your device...</p>
        </div>
      </div>
    );
  }



  return (
    <div 
      className={`w-full h-full relative ${className}`}
      style={{ minHeight: '300px', touchAction: 'none' }}
      ref={canvasRef}
      data-quality-tier={tier}
    >
      {hasError ? (
        <ErrorMessage />
      ) : (
        <>
          <div data-worker-component="true" style={{ width: '100%', height: '100%' }}>
            <Canvas
              shadows={qualitySettings.shadows}
              dpr={[1, qualitySettings.pixelRatio]}
              camera={{ position: [2, 2, 4], fov: 50 }}
              style={{ background: '#f8f9fa', height: '100%', width: '100%' }}
              frameloop={tier === 'low' ? 'demand' : 'always'}
              gl={{
                antialias: qualitySettings.antialias,
                powerPreference: tier === 'high' ? 'high-performance' : 'low-power',
                alpha: false,
                stencil: false,
                depth: true,
              }}
              onCreated={({ gl }) => {
                gl.setClearColor('#f8f9fa');
                gl.shadowMap.enabled = qualitySettings.shadows;
                if (qualitySettings.shadows) {
                  gl.shadowMap.type = THREE.PCFSoftShadowMap;
                }
                console.log(`3D viewer initialized with ${tier} quality settings`);
              }}
            >
              {/* Camera and controls */}
              <PerspectiveCamera makeDefault position={[2, 2, 4]} />
              <OrbitControls 
                enableDamping={tier !== 'low'}
                dampingFactor={0.05}
                minDistance={0.5}
                maxDistance={10}
                enableZoom={true}
                enableRotate={true}
                enablePan={true}
              />
              
              {/* Performance monitoring */}
              <PerformanceMonitor />
              
              <ambientLight intensity={qualitySettings.lightIntensity * 0.7} />
              <directionalLight 
                position={[5, 5, 5]} 
                intensity={qualitySettings.lightIntensity}
                castShadow={qualitySettings.shadows}
                shadow-mapSize-width={qualitySettings.maxTextureSize / 2}
                shadow-mapSize-height={qualitySettings.maxTextureSize / 2}
              />
              
              {!qualitySettings.useSimpleMaterials && (
                <Environment preset="sunset" />
              )}
              
              <Ground qualitySettings={qualitySettings} />
              
              <Suspense fallback={<LoadingFallback />}>
                <Model modelPath={modelPath} qualitySettings={qualitySettings} selectedTexture={selectedTexture} errorState={setHasError} />
              </Suspense>
            </Canvas>
          </div>
          
          {/* Texture customization button */}
          <button 
            className="absolute top-12 right-2 bg-white rounded-md p-2 shadow-md hover:bg-gray-100 transition-colors flex items-center"
            onClick={toggleTexturePalette}
            aria-label="Customize fabric texture"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Color Variations</span>
          </button>
          
          {/* Show texture palette when button is clicked */}
          {showTexturePalette && (
            <ColorPalette onSelectTexture={handleSelectTexture} selectedTexture={selectedTexture} />
          )}
          
          <Instructions />
          <Loader />
        </>
      )}
      <div className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-500">
        Quality: {tier}
      </div>
    </div>
  );
};

export default ThreeJSModelViewer;
