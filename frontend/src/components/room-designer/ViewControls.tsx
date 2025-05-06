"use client";

import { CameraRefs, RoomSettings } from '@/types/room-designer';

interface ViewControlsProps extends CameraRefs {
  room: RoomSettings;
  onToggleDragging: () => void;
  draggingEnabled: boolean;
}

const ViewControls = ({
  cameraRef,
  controlsRef,
  room,
  onToggleDragging,
  draggingEnabled
}: ViewControlsProps) => {
  
  const resetCameraView = () => {
    if (controlsRef.current && cameraRef.current) {
      const initialCameraPosition: [number, number, number] = [8, 5, 16];
      cameraRef.current.position.set(initialCameraPosition[0], initialCameraPosition[1], initialCameraPosition[2]);
      controlsRef.current.target.set(room.width / 2, room.height / 2, room.length / 2);
      controlsRef.current.update();
    }
  };

  const setOverheadView = () => {
    if (controlsRef.current && cameraRef.current) {
      const height = Math.max(room.width, room.length) * 0.75;
      cameraRef.current.position.set(room.width / 2, height * 1.5, room.length / 2);
      controlsRef.current.target.set(room.width / 2, 0, room.length / 2);
      controlsRef.current.update();
    }
  };

  const setFrontView = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(room.width / 2, room.height / 2, room.length * 1.5);
      controlsRef.current.target.set(room.width / 2, room.height / 2, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-md px-4 py-2 flex items-center space-x-3 z-10">
      <button 
        className="p-2 rounded-full hover:bg-amber-50 text-amber-800 transition-colors"
        title="Reset view"
        onClick={resetCameraView}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>
      <div className="h-6 border-r border-gray-300"></div>
      <button 
        className="p-2 rounded-full hover:bg-amber-50 text-amber-800 transition-colors"
        title="Overhead view"
        onClick={setOverheadView}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <button 
        className="p-2 rounded-full hover:bg-amber-50 text-amber-800 transition-colors"
        title="Front view"
        onClick={setFrontView}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      </button>
      <div className="h-6 border-r border-gray-300"></div>
      <button 
        className={`p-2 rounded-full transition-colors ${
          draggingEnabled 
          ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
        title={draggingEnabled ? "Disable Dragging" : "Enable Dragging"}
        onClick={onToggleDragging}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      </button>
    </div>
  );
};

export default ViewControls;