
import { EU_WHEEL_ORDER, US_WHEEL_ORDER } from './constants';
import { WheelMode } from './types';

export const getWheelOrder = (mode: WheelMode): string[] => {
  return mode === 'EU' ? EU_WHEEL_ORDER : US_WHEEL_ORDER;
};

export const getNeighbors = (number: string, mode: WheelMode, distance: number = 2): string[] => {
  const order = getWheelOrder(mode);
  // Find all occurrences (relevant for US wheel with duplicate 0/00 entries in the provided array)
  const indices = order.reduce((acc, val, idx) => (val === number ? [...acc, idx] : acc), [] as number[]);
  if (indices.length === 0) return [];

  const allNeighbors = new Set<string>();
  indices.forEach(index => {
    for (let i = -distance; i <= distance; i++) {
      let neighborIndex = (index + i) % order.length;
      if (neighborIndex < 0) neighborIndex += order.length;
      allNeighbors.add(order[neighborIndex]);
    }
  });
  
  return Array.from(allNeighbors);
};

export const detectZigzag = (spins: string[], mode: WheelMode): boolean => {
  if (spins.length < 4) return false;
  const order = getWheelOrder(mode);
  
  // Convert spins to wheel indices
  const lastIndices = spins.slice(-4).map(s => order.indexOf(s));
  
  // Calculate shortest distance jumps on the circular wheel
  const jumps = [];
  const len = order.length;
  for (let i = 0; i < lastIndices.length - 1; i++) {
    let diff = lastIndices[i+1] - lastIndices[i];
    // Normalize to shortest path (-len/2 to len/2)
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    
    // Direction: 1 for clockwise (right), -1 for counter-clockwise (left)
    jumps.push(diff > 0 ? 1 : diff < 0 ? -1 : 0);
  }

  // Check for strict alternating pattern: [1, -1, 1] or [-1, 1, -1]
  for (let i = 0; i < jumps.length - 2; i++) {
    if (jumps[i] !== 0 && jumps[i+1] !== 0 && jumps[i+2] !== 0) {
      if (jumps[i] !== jumps[i+1] && jumps[i+1] !== jumps[i+2]) {
        return true;
      }
    }
  }
  
  return false;
};

export const getRacetrackSection = (number: string, sections: any): string | null => {
  for (const [section, numbers] of Object.entries(sections)) {
    if ((numbers as string[]).includes(number)) return section;
  }
  return null;
};
