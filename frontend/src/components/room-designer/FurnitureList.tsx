"use client";

import { FurnitureItemProps } from '@/types/room-designer';

interface FurnitureListProps {
  furniture: FurnitureItemProps[];
  selectedItemIndex: number | null;
  onSelectFurniture: (index: number) => void;
}

const FurnitureList = ({
  furniture,
  selectedItemIndex,
  onSelectFurniture
}: FurnitureListProps) => {
  if (furniture.length === 0) return null;
  
  return (
    <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md border border-gray-100 max-w-sm max-h-[300px] overflow-auto">
      <h4 className="text-xs font-medium mb-2 text-gray-700">Furniture Items</h4>
      <ul className="space-y-1">
        {furniture.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => onSelectFurniture(index)}
              className={`w-full text-left text-xs py-1.5 px-2 rounded-md ${
                selectedItemIndex === index 
                  ? "bg-amber-100 text-amber-800" 
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {item.name || `Item ${index + 1}`}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FurnitureList;