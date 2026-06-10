export type ChordType = 'major' | 'minor' | 'seventh' | 'other';

export interface Chord {
  name: string;
  desc: string;
  type: ChordType;
  frets: number[];
  fingers: number[];
}

export interface Song {
  name: string;
  bpm: number;
  bars: string[];
}
