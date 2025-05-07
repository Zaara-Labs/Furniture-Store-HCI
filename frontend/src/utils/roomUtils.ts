/**
 * Convert dimensions from different units to meters
 */
export const getUnitConversionFactor = (unit: string): number => {
  switch (unit?.toLowerCase()) {
    case 'm': return 1;
    case 'cm': return 0.01;
    case 'in': return 0.0254;
    case 'ft': return 0.3048;
    default: return 1; // Default to meters if unknown
  }
};

/**
 * Room presets for quick room setup
 */
export const roomPresets = [
  { name: 'Living Room', width: 8, length: 10, height: 3, wallColor: '#f0e6d2', floorColor: '#8b5a2b' },
  { name: 'Bedroom', width: 6, length: 8, height: 3, wallColor: '#e6f0f2', floorColor: '#a0a0a0' },
  { name: 'Office', width: 5, length: 6, height: 2.8, wallColor: '#ffffff', floorColor: '#c0c0c0' },
  { name: 'Dining', width: 7, length: 7, height: 3, wallColor: '#fffbe6', floorColor: '#bfa76a' },
  { name: 'Kids Room', width: 5, length: 5, height: 2.7, wallColor: '#fce4ec', floorColor: '#f8bbd0' },
  { name: 'Bathroom', width: 5, length: 5, height: 2.5, wallColor: '#e0f7fa', floorColor: '#b2ebf2' },
];

/**
 * Calculate initial camera position based on room dimensions
 */
export const calculateInitialCameraPosition = (room: { width: number, length: number, height: number }): [number, number, number] => {
  const distance = Math.max(room.width, room.length) * 1.5;
  return [room.width / 2, room.height / 2, distance];
};

/**
 * Captures a screenshot from the Three.js canvas
 * @returns Promise with data URL of the screenshot
 */
export const captureCanvasScreenshot = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Find the canvas element created by Three.js
      const canvas = document.querySelector('canvas');

      if (!canvas) {
        reject(new Error('Canvas element not found'));
        return;
      }

      // Generate a PNG data URL from the canvas
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      reject(error);
    }
  });
};