import type {ChordName} from './chords';
import type {GuitarSoundId} from './audio';

// One chord in the progression: struck once, then held for `beats` beats.
export interface Bar {
  readonly name: ChordName;
  readonly beats: number;
}

// One eighth-note slot in a 4/4 bar: down-strum, up-strum, or rest.
export type Stroke = 'D' | 'U' | '-';
export type StrumPattern = readonly Stroke[];

// Down on every beat — simple and steady.
export const EASY_PATTERN: StrumPattern = ['D', '-', 'D', '-', 'D', '-', 'D', '-'];
// The classic folk/pop pattern: D · D-U · U-D-U (accent on the 1).
export const ADVANCED_PATTERN: StrumPattern = ['D', '-', 'D', 'U', '-', 'U', 'D', 'U'];

export interface SongVersion {
  readonly bpm: number;
  // Strummed across the bar on an eighth-note grid; tiled over each held chord
  // so long chords keep ringing instead of decaying to silence.
  readonly pattern: StrumPattern;
  readonly bars: readonly Bar[];
}

export interface Song {
  readonly name: string;
  readonly sound: GuitarSoundId;
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
];
