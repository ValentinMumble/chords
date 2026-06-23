import type {ChordName} from './chords';
import type {GuitarSoundId} from './audio';

// One chord in the progression: struck once, then held for `beats` beats.
export interface Bar {
  readonly name: ChordName;
  readonly beats: number;
}

// One subdivision slot in a bar: down-strum, up-strum, or rest.
export type Stroke = 'D' | 'U' | '-';
export type StrumPattern = readonly Stroke[];

// A time signature, expressed as the felt beats per bar and how many strum
// slots each beat is divided into. 4/4 = 4 beats of 2 (eighths); 6/8 = 2
// dotted-quarter beats of 3. `bpm` is always the felt beat.
export interface Meter {
  readonly beats: number;
  readonly subdivision: number;
}
export const FOUR_FOUR: Meter = {beats: 4, subdivision: 2};
export const SIX_EIGHT: Meter = {beats: 2, subdivision: 3};

// 4/4 patterns (8 slots). Down on every beat — simple and steady.
export const EASY_PATTERN: StrumPattern = ['D', '-', 'D', '-', 'D', '-', 'D', '-'];
// The classic folk/pop pattern: D · D-U · U-D-U (accent on the 1).
export const ADVANCED_PATTERN: StrumPattern = ['D', '-', 'D', 'U', '-', 'U', 'D', 'U'];
// 6/8 patterns (6 slots): strum the two dotted-quarter pulses, with a lilt.
export const EASY_PATTERN_68: StrumPattern = ['D', '-', '-', 'D', '-', '-'];
export const ADVANCED_PATTERN_68: StrumPattern = ['D', '-', 'U', 'D', '-', 'U'];

export interface SongVersion {
  readonly bpm: number;
  readonly meter?: Meter;
  // Strummed across the bar on the subdivision grid; tiled over each held chord
  // so long chords keep ringing instead of decaying to silence.
  readonly pattern: StrumPattern;
  readonly bars: readonly Bar[];
}

export interface Song {
  readonly name: string;
  readonly sound: GuitarSoundId;
  readonly capo?: number;
  readonly easy: SongVersion;
  readonly advanced?: SongVersion;
}

export type SongLevel = 'easy' | 'advanced';

export function songVersion(song: Song, level: SongLevel): SongVersion {
  return level === 'advanced' && song.advanced ? song.advanced : song.easy;
}

// Build the easy version's bars from a compact [name, beats] list.
function bars(steps: readonly [ChordName, number][]): readonly Bar[] {
  return steps.map(([name, beats]) => ({name, beats}));
}

const knockin = bars([
  ['G', 4],
  ['D', 4],
  ['Am7', 8],
  ['G', 4],
  ['D', 4],
  ['C', 8],
]);
const standByMe = bars([
  ['G', 8],
  ['Em', 8],
  ['C', 4],
  ['D', 4],
  ['G', 8],
]);
const letItBe = bars([
  ['C', 4],
  ['G', 4],
  ['Am', 4],
  ['Fmaj7', 4],
  ['C', 4],
  ['G', 4],
  ['Fmaj7', 2],
  ['C', 2],
]);
const wildThing = bars([
  ['A', 4],
  ['D', 4],
  ['E', 4],
  ['D', 4],
]);
// Easy: basic open chords. Advanced: the song's real, richer voicings.
const wonderwallEasy = bars([
  ['Em', 4],
  ['G', 4],
  ['D', 4],
  ['A', 4],
  ['Em', 4],
  ['G', 4],
  ['D', 4],
  ['A', 4],
]);
const wonderwallAdvanced = bars([
  ['Em7', 4],
  ['G', 4],
  ['Dsus4', 4],
  ['A7sus4', 4],
  ['Em7', 4],
  ['G', 4],
  ['Dsus4', 4],
  ['A7sus4', 4],
]);
const horseEasy = bars([
  ['Em', 4],
  ['D', 4],
  ['Em', 4],
  ['D', 4],
]);
const horseAdvanced = bars([
  ['Em', 4],
  ['D6/9', 4],
  ['Em', 4],
  ['D6/9', 4],
]);
const threeLittleBirds = bars([
  ['A', 4],
  ['A', 4],
  ['D', 4],
  ['A', 4],
  ['E', 4],
  ['D', 4],
  ['A', 4],
  ['A', 4],
]);
const zombie = bars([
  ['Em', 4],
  ['C', 4],
  ['G', 4],
  ['D', 4],
]);
const countryRoads = bars([
  ['G', 4],
  ['D', 4],
  ['Em', 4],
  ['C', 4],
  ['G', 4],
  ['D', 4],
  ['C', 4],
  ['G', 4],
]);
// Verse in 6/8 — each chord is one bar (two dotted-quarter beats).
const fakePlasticTrees = bars([
  ['A', 2],
  ['E', 2],
  ['G', 2],
  ['D', 2],
]);

export const SONGS: readonly Song[] = [
  {
    name: "Knockin' on Heaven's Door — Bob Dylan",
    sound: 'acoustic_guitar_steel',
    easy: {bpm: 72, pattern: EASY_PATTERN, bars: knockin},
    advanced: {bpm: 72, pattern: ADVANCED_PATTERN, bars: knockin},
  },
  {
    name: 'Stand by Me — Ben E. King',
    sound: 'electric_guitar_clean',
    easy: {bpm: 118, pattern: EASY_PATTERN, bars: standByMe},
    advanced: {bpm: 118, pattern: ADVANCED_PATTERN, bars: standByMe},
  },
  {
    name: 'Let It Be — The Beatles',
    sound: 'acoustic_guitar_nylon',
    easy: {bpm: 74, pattern: EASY_PATTERN, bars: letItBe},
    advanced: {bpm: 74, pattern: ADVANCED_PATTERN, bars: letItBe},
  },
  {
    name: 'Wild Thing — The Troggs',
    sound: 'overdriven_guitar',
    easy: {bpm: 104, pattern: EASY_PATTERN, bars: wildThing},
    advanced: {bpm: 104, pattern: ADVANCED_PATTERN, bars: wildThing},
  },
  {
    name: 'Wonderwall — Oasis',
    sound: 'acoustic_guitar_steel',
    capo: 2,
    easy: {bpm: 87, pattern: EASY_PATTERN, bars: wonderwallEasy},
    advanced: {bpm: 87, pattern: ADVANCED_PATTERN, bars: wonderwallAdvanced},
  },
  {
    name: 'A Horse with No Name — America',
    sound: 'acoustic_guitar_steel',
    easy: {bpm: 122, pattern: EASY_PATTERN, bars: horseEasy},
    advanced: {bpm: 122, pattern: ADVANCED_PATTERN, bars: horseAdvanced},
  },
  {
    name: 'Three Little Birds — Bob Marley',
    sound: 'electric_guitar_clean',
    easy: {bpm: 76, pattern: EASY_PATTERN, bars: threeLittleBirds},
    advanced: {bpm: 76, pattern: ADVANCED_PATTERN, bars: threeLittleBirds},
  },
  {
    name: 'Zombie — The Cranberries',
    sound: 'overdriven_guitar',
    easy: {bpm: 84, pattern: EASY_PATTERN, bars: zombie},
    advanced: {bpm: 84, pattern: ADVANCED_PATTERN, bars: zombie},
  },
  {
    name: 'Take Me Home, Country Roads — John Denver',
    sound: 'acoustic_guitar_steel',
    easy: {bpm: 82, pattern: EASY_PATTERN, bars: countryRoads},
    advanced: {bpm: 82, pattern: ADVANCED_PATTERN, bars: countryRoads},
  },
  {
    name: 'Fake Plastic Trees — Radiohead',
    sound: 'acoustic_guitar_steel',
    easy: {bpm: 52, meter: SIX_EIGHT, pattern: EASY_PATTERN_68, bars: fakePlasticTrees},
    advanced: {bpm: 52, meter: SIX_EIGHT, pattern: ADVANCED_PATTERN_68, bars: fakePlasticTrees},
  },
];
