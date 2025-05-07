"use client";

import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls as StdLibOrbitControls } from 'three-stdlib';
import Navbar from '@/components/Navbar';
import RoomCanvas from '@/components/room-designer/RoomCanvas';
import ProductCatalog from '@/components/room-designer/ProductCatalog';
import { useRoomDesigner } from '@/hooks/useRoomDesigner';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { captureCanvasScreenshot } from '@/utils/roomUtils';
import designProjectService from '@/services/designProjectService';

export default function DesignerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('Untitled Project');
  const [projectDescription, setProjectDescription] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const {
    room,
    furniture,
    products,
    camera,
    isLoading,
    isSaving,
    currentProductId,
    selectedItemIndex,
    draggingEnabled,
    currentProject,
    cameraRef,
    controlsRef,
    updateRoomDimensions,
    updateCamera,
    addFurniture,
    updateFurniturePosition,
    updateFurnitureTexture,
    rotateFurniture,
    adjustScale,
    removeFurniture,
    toggleDragging,
    selectFurniture,
    applyRoomPreset,
    saveProject,
    loadProject,
    createNewProject,
    captureCurrentCameraState
  } = useRoomDesigner();

  // Load project if projectId is provided in URL
  useEffect(() => {
    if (projectId && user) {
      loadProject(projectId).then(project => {
        if (project) {
          setProjectName(project.name);
          setProjectDescription(project.description || '');
        }
      });
    }
  }, [projectId, user, loadProject]);

  // Handle save project
  const handleSaveProject = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/auth/login?redirect=/room-designer');
      return;
    }

    // If it's already a saved project or we're showing the save dialog
    if (currentProject || showSaveModal) {
      setSavingStatus('saving');
      
      try {
        // Capture latest camera state
        captureCurrentCameraState();
        
        // Capture screenshot for thumbnail
        const screenshotDataUrl = await captureCanvasScreenshot();
        
        // Process thumbnail
        let thumbnailUrl = currentProject?.thumbnailUrl;
        
        if (currentProject?.$id) {
          // Update existing thumbnail
          thumbnailUrl = await designProjectService.updateProjectThumbnail(
            currentProject.$id,
            screenshotDataUrl,
            currentProject.thumbnailUrl
          );
        } else if (screenshotDataUrl) {
          // For new projects, generate a temporary ID for the thumbnail
          const tempId = 'temp-' + Date.now();
          thumbnailUrl = await designProjectService.uploadThumbnail(screenshotDataUrl, tempId);
        }
        
        // Save the project with updated thumbnail URL
        const success = await saveProject({
          name: projectName,
          description: projectDescription,
          designerId: user.$id,
          thumbnailUrl: thumbnailUrl,
          status: currentProject?.status || 'Draft'
        });
        
        setSavingStatus(success ? 'success' : 'error');
        
        // Hide modal after saving
        if (success) {
          setTimeout(() => {
            setShowSaveModal(false);
            setSavingStatus('idle');
          }, 1500);
        }
      } catch (error) {
        console.error("Error saving project:", error);
        setSavingStatus('error');
      }
    } else {
      // Show save dialog for new projects
      setShowSaveModal(true);
    }
  };

  // Handle creating new project
  const handleNewProject = () => {
    createNewProject();
    setProjectName('Untitled Project');
    setProjectDescription('');
    // Remove projectId from URL
    router.push('/room-designer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Project actions header */}
      <div className="bg-white shadow-sm border-b px-4 py-2 fixed top-16 left-0 right-0 z-10 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-800">
            {currentProject ? projectName : 'New Room Design'}
          </h2>
          {currentProject && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {currentProject.status}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewProject}
            className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 text-sm border rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
          <button
            onClick={handleSaveProject}
            disabled={isSaving || savingStatus === 'saving'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded-md flex items-center disabled:opacity-50"
          >
            {savingStatus === 'saving' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>
      
      <main className="flex-grow flex flex-col md:flex-row pt-28">
        {/* 3D Canvas */}
        <RoomCanvas 
          room={room}
          furniture={furniture}
          camera={camera}
          products={products}
          selectedItemIndex={selectedItemIndex}
          cameraRef={cameraRef as React.RefObject<THREE.PerspectiveCamera>}
          controlsRef={controlsRef as unknown as React.RefObject<StdLibOrbitControls>}
          draggingEnabled={draggingEnabled}
          onUpdateRoom={updateRoomDimensions}
          onUpdateCamera={updateCamera}
          onSelectFurniture={selectFurniture}
          onUpdatePosition={updateFurniturePosition}
          onRotate={rotateFurniture}
          onScale={adjustScale}
          onRemoveFurniture={removeFurniture}
          onUpdateTexture={updateFurnitureTexture}
          onToggleDragging={toggleDragging}
          onCaptureCameraState={captureCurrentCameraState}
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
      
      {/* Save Project Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Project</h3>
            
            <div className="mb-4">
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
                Project Description (optional)
              </label>
              <textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a short description"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSavingStatus('idle');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                disabled={savingStatus === 'saving' || !projectName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {savingStatus === 'saving' ? 'Saving...' : 
                 savingStatus === 'success' ? 'Saved!' : 
                 savingStatus === 'error' ? 'Try Again' : 'Save'}
              </button>
            </div>
            
            {savingStatus === 'error' && (
              <p className="mt-2 text-sm text-red-600">
                Failed to save project. Please try again.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}