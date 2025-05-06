"use client";

import { RoomSettings as RoomSettingsType } from '@/types/room-designer';

interface RoomSettingsProps {
  room: RoomSettingsType;
  onUpdateRoom: (dimensions: Partial<RoomSettingsType>) => void;
}

const RoomSettings = ({ room, onUpdateRoom }: RoomSettingsProps) => {
  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md border border-gray-100">
      <h3 className="font-medium text-sm mb-3 flex items-center text-amber-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
        </svg>
        Room Settings
      </h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-600">Width</label>
            <span className="text-xs font-medium">{room.width}m</span>
          </div>
          <input 
            type="range" 
            min={3} 
            max={20} 
            value={room.width} 
            onChange={(e) => onUpdateRoom({ width: Number(e.target.value) })}
            className="w-full accent-amber-600"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-600">Length</label>
            <span className="text-xs font-medium">{room.length}m</span>
          </div>
          <input 
            type="range" 
            min={3} 
            max={20} 
            value={room.length}
            onChange={(e) => onUpdateRoom({ length: Number(e.target.value) })}
            className="w-full accent-amber-600"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-600">Height</label>
            <span className="text-xs font-medium">{room.height}m</span>
          </div>
          <input 
            type="range" 
            min={2} 
            max={5} 
            step={0.1}
            value={room.height}
            onChange={(e) => onUpdateRoom({ height: Number(e.target.value) })}
            className="w-full accent-amber-600"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Wall Color</label>
            <div className="flex items-center">
              <input 
                type="color" 
                value={room.wallColor} 
                onChange={(e) => onUpdateRoom({ wallColor: e.target.value })}
                className="w-8 h-8 rounded border overflow-hidden cursor-pointer"
              />
              <span className="ml-2 text-xs uppercase">{room.wallColor}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Floor Color</label>
            <div className="flex items-center">
              <input 
                type="color" 
                value={room.floorColor} 
                onChange={(e) => onUpdateRoom({ floorColor: e.target.value })}
                className="w-8 h-8 rounded border overflow-hidden cursor-pointer"
              />
              <span className="ml-2 text-xs uppercase">{room.floorColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSettings;