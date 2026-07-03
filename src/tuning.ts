// The single source of truth for the guitar's standard tuning. Everywhere else
// derives its view from this instead of re-listing the strings.

export interface OpenString {
  readonly midi: number; // MIDI note of the open string
  readonly pc: number; // pitch class 0-11 (C=0)
  readonly en: string; // English note letter (low E uppercase, high e lowercase)
  readonly fr: string; // French / solfège name
}

// Low to high (6th string → 1st): index 0 = low E. This is the order chord
// shapes and the fretboard diagram use.
export const TUNING: readonly OpenString[] = [
  {midi: 40, pc: 4, en: 'E', fr: 'Mi'},
  {midi: 45, pc: 9, en: 'A', fr: 'La'},
  {midi: 50, pc: 2, en: 'D', fr: 'Ré'},
  {midi: 55, pc: 7, en: 'G', fr: 'Sol'},
  {midi: 59, pc: 11, en: 'B', fr: 'Si'},
  {midi: 64, pc: 4, en: 'e', fr: 'Mi'},
];

// Open-string MIDI notes, low to high — index by chord string (0 = low E).
export const STRING_MIDI = TUNING.map(string => string.midi);

// High-e first (row 0 = high e), the order tabs and the scale fretboard use.
const HIGH_FIRST = [...TUNING].reverse();
export const STRING_LABELS = HIGH_FIRST.map(string => string.en); // ['e','B','G','D','A','E']
export const OPEN_PC = HIGH_FIRST.map(string => string.pc); // [4,11,7,2,9,4]
