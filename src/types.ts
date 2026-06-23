export type ChordType = 'major' | 'minor' | 'seventh' | 'other';

export type Fret = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Finger = 0 | 1 | 2 | 3 | 4;
export type StringFrets = readonly [Fret, Fret, Fret, Fret, Fret, Fret];
export type StringFingers = readonly [Finger, Finger, Finger, Finger, Finger, Finger];

export interface Chord {
  readonly name: string;
  readonly desc: string;
  readonly type: ChordType;
  readonly frets: StringFrets;
  readonly fingers: StringFingers;
}
