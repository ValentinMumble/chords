import type {Chord, ChordType} from './types';

const CHORD_LIST = [
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
  {name: 'F#m', desc: 'F# minor (barre)', type: 'minor', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1]},
  {name: 'C#m', desc: 'C# minor (barre)', type: 'minor', frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1]},
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
  {name: 'A7sus4', desc: 'A7 suspended 4', type: 'other', frets: [-1, 0, 2, 0, 3, 0], fingers: [0, 0, 1, 0, 3, 0]},
  {name: 'D6/9', desc: 'D six-nine', type: 'other', frets: [2, 0, 0, 2, 0, 0], fingers: [2, 0, 0, 3, 0, 0]},
] as const satisfies readonly Chord[];

export type ChordName = (typeof CHORD_LIST)[number]['name'];

export const CHORDS: readonly Chord[] = CHORD_LIST;

export const CHORDS_BY_NAME = Object.fromEntries(CHORD_LIST.map(chord => [chord.name, chord])) as Record<
  ChordName,
  Chord
>;

export function getChord(name: string): Chord | undefined {
  return (CHORDS_BY_NAME as Record<string, Chord | undefined>)[name];
}

export type ChordFilter = ChordType | 'all';
export type ShapeFilter = 'any' | 'open' | 'barre';

export const FILTER_TYPES: {key: ChordFilter; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'major', label: 'Major'},
  {key: 'minor', label: 'Minor'},
  {key: 'seventh', label: '7ths'},
  {key: 'other', label: 'Sus & add'},
];

export const SHAPE_FILTERS: {key: Exclude<ShapeFilter, 'any'>; label: string}[] = [
  {key: 'open', label: 'Open'},
  {key: 'barre', label: 'Barre'},
];

// Per-finger color code (1 index, 2 middle, 3 ring, 4 pinky). Coral-led palette
// harmonious with the accent; all read with white numerals in both modes.
export const FINGER_COLORS: Record<number, string> = {
  1: '#d85a30',
  2: '#ba7517',
  3: '#0f6e56',
  4: '#534ab7',
};

export interface Barre {
  finger: number;
  fret: number;
  fromString: number;
  toString: number;
}

export function findBarres(chord: Chord): Barre[] {
  const groups = new Map<string, number[]>();
  chord.fingers.forEach((finger, stringIndex) => {
    if (finger > 0) {
      const key = `${finger}:${chord.frets[stringIndex]}`;
      groups.set(key, [...(groups.get(key) ?? []), stringIndex]);
    }
  });
  // One finger fretting two or more strings at the same fret is physically a
  // barre, even when other fingers fret higher notes on the strings between.
  return [...groups.entries()]
    .filter(([, strings]) => strings.length >= 2)
    .map(([key, strings]) => {
      const [finger, fret] = key.split(':').map(Number);
      return {finger, fret, fromString: Math.min(...strings), toString: Math.max(...strings)};
    });
}

export function isBarreChord(chord: Chord): boolean {
  return findBarres(chord).some(barre => barre.toString - barre.fromString >= 2);
}

const NOTE_NAMES = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];
const OPEN_SEMITONES = [0, 5, 10, 15, 19, 24];

export function noteName(stringIndex: number, fret: number): string {
  return NOTE_NAMES[(OPEN_SEMITONES[stringIndex] + fret) % 12];
}

// The distinct notes a chord sounds, lowest string first (root usually first).
export function chordNotes(chord: Chord): string[] {
  const seen = new Set<string>();
  const notes: string[] = [];
  chord.frets.forEach((fret, stringIndex) => {
    if (fret < 0) return;
    const note = noteName(stringIndex, fret);
    if (!seen.has(note)) {
      seen.add(note);
      notes.push(note);
    }
  });
  return notes;
}

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const DEGREES = ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];

// Each distinct note plus its scale degree relative to the chord's root
// (parsed from the name), e.g. C major → C:R, E:3, G:5.
export function chordTones(chord: Chord): {note: string; degree: string}[] {
  const root = chord.name.match(/^([A-G]#?)/)?.[1];
  const rootIndex = root ? CHROMATIC.indexOf(root) : -1;
  return chordNotes(chord).map(note => {
    const index = CHROMATIC.indexOf(note);
    const degree = rootIndex >= 0 && index >= 0 ? DEGREES[(index - rootIndex + 12) % 12] : '';
    return {note, degree};
  });
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
