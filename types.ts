
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

export interface BetRound {
  wagered: number;
  won: number;
  win: boolean;
  prevBalance: number;
  prevUnit: number;
  prevConsecutiveLosses: number;
  targets: string[];
  actualNumber: string;
}

