import type {Chord, ChordType} from './types';

export const CHORDS: Chord[] = [
  {name: 'C', desc: 'C major', type: 'major', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0]},
  {name: 'A', desc: 'A major', type: 'major', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0]},
  {name: 'G', desc: 'G major', type: 'major', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3]},
  {name: 'E', desc: 'E major', type: 'major', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0]},
  {name: 'D', desc: 'D major', type: 'major', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2]},
  {name: 'F', desc: 'F major (barre)', type: 'major', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1]},
  {name: 'B', desc: 'B major (barre)', type: 'major', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1]},
  {name: 'Am', desc: 'A minor', type: 'minor', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0]},
  {name: 'Em', desc: 'E minor', type: 'minor', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0]},
  {name: 'Dm', desc: 'D minor', type: 'minor', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1]},
  {name: 'Bm', desc: 'B minor (barre)', type: 'minor', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1]},
  {name: 'Fm', desc: 'F minor (barre)', type: 'minor', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1]},
  {name: 'A7', desc: 'A dominant 7', type: 'seventh', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0]},
  {name: 'B7', desc: 'B dominant 7', type: 'seventh', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4]},
  {name: 'C7', desc: 'C dominant 7', type: 'seventh', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0]},
  {name: 'D7', desc: 'D dominant 7', type: 'seventh', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3]},
  {name: 'E7', desc: 'E dominant 7', type: 'seventh', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0]},
  {name: 'G7', desc: 'G dominant 7', type: 'seventh', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1]},
  {name: 'Am7', desc: 'A minor 7', type: 'seventh', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0]},
  {name: 'Em7', desc: 'E minor 7', type: 'seventh', frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 3, 0]},
  {name: 'Dm7', desc: 'D minor 7', type: 'seventh', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1]},
  {name: 'Cmaj7', desc: 'C major 7', type: 'seventh', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0]},
  {name: 'Fmaj7', desc: 'F major 7', type: 'seventh', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0]},
  {name: 'Gmaj7', desc: 'G major 7', type: 'seventh', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, 0, 0, 0, 2]},
  {name: 'Cadd9', desc: 'C add 9', type: 'other', frets: [-1, 3, 2, 0, 3, 3], fingers: [0, 2, 1, 0, 3, 4]},
  {name: 'Dsus4', desc: 'D suspended 4', type: 'other', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3]},
  {name: 'Asus2', desc: 'A suspended 2', type: 'other', frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0]},
  {name: 'Esus4', desc: 'E suspended 4', type: 'other', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0]},
];

export const CHORDS_BY_NAME: Record<string, Chord> = Object.fromEntries(CHORDS.map(chord => [chord.name, chord]));

export const FILTER_TYPES: {key: ChordType | 'all'; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'major', label: 'Major'},
  {key: 'minor', label: 'Minor'},
  {key: 'seventh', label: '7ths'},
  {key: 'other', label: 'Sus & add'},
];

const NOTE_NAMES = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];
const OPEN_SEMITONES = [0, 5, 10, 15, 19, 24];

export function noteName(stringIndex: number, fret: number): string {
  return NOTE_NAMES[(OPEN_SEMITONES[stringIndex] + fret) % 12];
}

const FRENCH_ROOTS: Record<string, string> = {C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si'};
const FRENCH_SUFFIXES: Record<string, string> = {
  '': 'majeur',
  m: 'mineur',
  '7': '7',
  m7: 'mineur 7',
  maj7: 'majeur 7',
  add9: 'add 9',
  sus2: 'sus2',
  sus4: 'sus4',
};

function parseChordName(chordName: string): {root: string; suffix: string} {
  const match = chordName.match(/^([A-G])(#?)(.*)$/);
  if (!match) return {root: chordName, suffix: ''};
  return {root: FRENCH_ROOTS[match[1]] + match[2], suffix: match[3]};
}

export function frenchName(chordName: string): string {
  const {root, suffix} = parseChordName(chordName);
  return `${root} ${FRENCH_SUFFIXES[suffix] ?? suffix}`.trim();
}

export function frenchShort(chordName: string): string {
  const {root, suffix} = parseChordName(chordName);
  return suffix ? `${root} ${suffix}` : root;
}
