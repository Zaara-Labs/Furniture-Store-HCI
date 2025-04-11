"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment, Loader, useTexture } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { getGPUTier } from 'detect-gpu';
import type { PartytownConfig } from '@builder.io/partytown';

const QUALITY_PRESETS = {
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
  const [tier, setTier] = useState('medium');
  const [qualitySettings, setQualitySettings] = useState(QUALITY_PRESETS.medium);
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Checking memory constraints
        const memory = (navigator as any).deviceMemory;
        if (memory && memory <= 4) {
          deviceTier = 'low';
        }
        
        // Checking for battery saving mode
        const connection = (navigator as any).connection;
        if (connection && (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
          deviceTier = 'low';
        }
        
        console.log(`Device capabilities detected: ${deviceTier} tier (GPU Tier: ${gpuTier.tier}, Mobile: ${gpuTier.isMobile})`);
        
        setTier(deviceTier);
        setQualitySettings(QUALITY_PRESETS[deviceTier]);
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

function Model({ modelPath, qualitySettings }) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();
  
  // Apply quality settings to the model
  useEffect(() => {
    if (modelRef.current && qualitySettings) {
      modelRef.current.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          // Applying shadow settings
          node.castShadow = qualitySettings.shadows;
          node.receiveShadow = qualitySettings.shadows;
          
          // Applying material optimizations
          if (node.material) {
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
    }
  }, [scene, qualitySettings]);

  // Center and scale the model on load
  React.useEffect(() => {
    if (modelRef.current) {
      // Create bounding box
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Center the model
      modelRef.current.position.x = -center.x;
      modelRef.current.position.z = -center.z;
      modelRef.current.position.y = -box.min.y - 0.5 + 0.01;;
      
      // Scale model to reasonable size
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      modelRef.current.scale.set(scale, scale, scale);
    }
  }, [scene]);

  return <primitive ref={modelRef} object={scene} />;
}

// Simple ground component with quality-based rendering
function Ground({ qualitySettings }) {
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
    const handleContextLoss = (event) => {
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

// 3D model viewer component
interface ModelViewerProps {
  modelPath: string;
  className?: string;
}

const ThreeJSModelViewer: React.FC<ModelViewerProps> = ({ modelPath, className = "" }) => {
  const [hasError, setHasError] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const canvasRef = useRef(null);
  
  // Get device capabilities and quality settings
  const { tier, qualitySettings, isLoading: detectingDevice } = useDeviceCapabilities();

  // Handle context loss events
  useEffect(() => {
    const handleContextLoss = (e) => {
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
  }, [canvasRef.current]);

  const handleError = () => {
    console.error("Error loading model:", modelPath);
    setHasError(true);
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
          <div type="text/partytown" data-worker-component="true" style={{ width: '100%', height: '100%' }}>
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
                <Model modelPath={modelPath} qualitySettings={qualitySettings} />
              </Suspense>
            </Canvas>
          </div>
          
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