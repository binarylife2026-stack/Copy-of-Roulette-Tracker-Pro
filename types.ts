
export type WheelMode = 'EU' | 'US';

export interface RacetrackSections {
  Voisins: string[];
  Zero: string[];
  Tiers: string[];
  Orphelins: string[];
}

export interface Stats {
  hot: string[];
  cold: string[];
  isZigzag: boolean;
}

export type NumberStatus = 'default' | 'repeated' | 'missing' | 'selected';
