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

// 4/4 patterns (8 slots), each a distinct feel so songs don't blur together.
export const EASY_PATTERN: StrumPattern = ['D', '-', 'D', '-', 'D', '-', 'D', '-']; // steady downs
export const ADVANCED_PATTERN: StrumPattern = ['D', '-', 'D', 'U', '-', 'U', 'D', 'U']; // folk/pop D-DU-UDU
export const DRIVING_PATTERN: StrumPattern = ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D']; // eighth-note rock chug
export const BALLAD_PATTERN: StrumPattern = ['D', '-', '-', '-', 'D', '-', 'U', '-']; // sparse and gentle
export const ANTHEM_PATTERN: StrumPattern = ['D', '-', 'D', 'U', 'D', '-', 'D', 'U']; // strong, with up-strokes
// A Horse with No Name — a two-bar strum, one chord per bar (Em then D6/9), so
// its 16 eighth-note slots span both chords. Per chord:
//   Em:  E down up  E up down up   → D D U D U D U ·
//   F#:  F# up slap up down up down up → D U · U D U D U
// The app only strums whole chords, so the bass root (E/F#) is mapped to a down,
// and the slap becomes a rest (there's no percussive/muted stroke).
export const HORSE_PATTERN: StrumPattern = [
  'D',
  'D',
  'U',
  'D',
  'U',
  'D',
  'U',
  '-', // Em bar
  'D',
  'U',
  '-',
  'U',
  'D',
  'U',
  'D',
  'U', // F# (D6/9) bar
];
// 6/8 patterns (6 slots): strum the two dotted-quarter pulses, with a lilt.
export const EASY_PATTERN_68: StrumPattern = ['D', '-', '-', 'D', '-', '-'];
export const ADVANCED_PATTERN_68: StrumPattern = ['D', '-', 'U', 'D', '-', 'U'];

// A fingerpicking pattern: which voice (0 = lowest sounded string, upward) to
// pluck on each subdivision slot; null is a rest.
export type PickPattern = readonly (number | null)[];
// 6/8 roll: bass, then up and back across the chord.
export const PICK_68: PickPattern = [0, 2, 3, 4, 3, 2];
// 4/4 Travis-ish: alternating bass with upper voices.
export const PICK_44: PickPattern = [0, 3, 1, 3, 0, 4, 1, 3];
// 4/4 flowing arpeggio: bass then roll up the chord, alternating the bass note.
export const PICK_FLOW: PickPattern = [0, 2, 3, 4, 1, 2, 3, 4];

export interface SongVersion {
  readonly bpm: number;
  readonly meter?: Meter;
  // Strummed across the bar on the subdivision grid; tiled over each held chord
  // so long chords keep ringing instead of decaying to silence.
  readonly pattern: StrumPattern;
  // If set, the chord is fingerpicked with this voice pattern instead of strummed.
  readonly pick?: PickPattern;
  readonly bars: readonly Bar[];
}

export type Difficulty = 1 | 2 | 3;
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {1: 'Easy', 2: 'Intermediate', 3: 'Advanced'};

export interface Song {
  readonly name: string;
  readonly sound: GuitarSoundId;
  readonly difficulty: Difficulty;
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
  ['Am', 8],
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
// Horse is only two chords: Em and D6/9 (the F# one) — the same for both levels,
// which differ only in the strum. (D6/9 is an easy shape, close to Em.)
const horse = bars([
  ['Em', 4],
  ['D6/9', 4],
  ['Em', 4],
  ['D6/9', 4],
]);
const zombie = bars([
  ['Em', 4],
  ['C', 4],
  ['G', 4],
  ['D', 4],
]);
// In Dm (i–iv–V): the song is Dm·Gm·Asus4. With a capo on 5 those become the
// open shapes Am·Dm·Esus4 — what's drawn here.
const commeToi = bars([
  ['Am', 4],
  ['Dm', 4],
  ['Esus4', 4],
  ['Am', 4],
]);
// 6/8, fingerpicked — each chord one bar (two dotted-quarter beats).
const houseOfRisingSun = bars([
  ['Am', 2],
  ['C', 2],
  ['D', 2],
  ['F', 2],
  ['Am', 2],
  ['E', 2],
  ['Am', 2],
  ['E', 2],
]);
const sweetHomeAlabama = bars([
  ['D', 4],
  ['C', 4],
  ['G', 4],
]);
// Three open chords, bouncy I–IV–I–V.
const anyoneElseButYou = bars([
  ['G', 4],
  ['C', 4],
  ['G', 4],
  ['D', 4],
]);
// Fingerpicked, capo 2 — the verse phrase (I–V–vi–IV–V–I).
const jeLAimeAMourir = bars([
  ['D', 4],
  ['A', 4],
  ['Bm', 4],
  ['G', 4],
  ['A', 4],
  ['D', 4],
]);

// Named progressions for the trainer to walk in order (all use library chords).
export const TRAINER_PROGRESSIONS: {readonly name: string; readonly chords: readonly ChordName[]}[] = [
  {name: 'Pop (I–V–vi–IV)', chords: ['C', 'G', 'Am', 'F']},
  {name: 'Doo-wop (I–vi–IV–V)', chords: ['C', 'Am', 'F', 'G']},
  {name: 'Three-chord (I–IV–V)', chords: ['G', 'C', 'D']},
  {name: '12-bar blues in A', chords: ['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7']},
  {name: 'Canon in D', chords: ['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A']},
];

// Ordered easiest → hardest. Each song has its own feel (pattern/pick/tempo)
// so the set doesn't all sound alike.
export const SONGS: readonly Song[] = [
  {
    name: 'A Horse with No Name — America',
    sound: 'acoustic_guitar_steel',
    difficulty: 1,
    easy: {bpm: 122, pattern: EASY_PATTERN, bars: horse},
    advanced: {bpm: 122, pattern: HORSE_PATTERN, bars: horse},
  },
  {
    name: 'Sweet Home Alabama — Lynyrd Skynyrd',
    sound: 'electric_guitar_clean',
    difficulty: 1,
    easy: {bpm: 98, pattern: EASY_PATTERN, bars: sweetHomeAlabama},
    advanced: {bpm: 98, pattern: DRIVING_PATTERN, bars: sweetHomeAlabama},
  },
  {
    name: "Knockin' on Heaven's Door — Bob Dylan",
    sound: 'acoustic_guitar_steel',
    difficulty: 1,
    easy: {bpm: 72, pattern: EASY_PATTERN, bars: knockin},
    advanced: {bpm: 72, pattern: ADVANCED_PATTERN, bars: knockin},
  },
  {
    name: 'Zombie — The Cranberries',
    sound: 'overdriven_guitar',
    difficulty: 1,
    easy: {bpm: 84, pattern: EASY_PATTERN, bars: zombie},
    advanced: {bpm: 84, pattern: DRIVING_PATTERN, bars: zombie},
  },
  {
    name: 'Anyone Else But You — The Moldy Peaches',
    sound: 'acoustic_guitar_steel',
    difficulty: 1,
    easy: {bpm: 120, pattern: EASY_PATTERN, bars: anyoneElseButYou},
    advanced: {bpm: 120, pattern: ADVANCED_PATTERN, bars: anyoneElseButYou},
  },
  {
    name: 'Stand by Me — Ben E. King',
    sound: 'electric_guitar_clean',
    difficulty: 2,
    easy: {bpm: 118, pattern: EASY_PATTERN, bars: standByMe},
    advanced: {bpm: 118, pattern: BALLAD_PATTERN, bars: standByMe},
  },
  {
    name: 'Wonderwall — Oasis',
    sound: 'acoustic_guitar_steel',
    difficulty: 2,
    capo: 2,
    easy: {bpm: 87, pattern: EASY_PATTERN, bars: wonderwallEasy},
    advanced: {bpm: 87, pattern: ANTHEM_PATTERN, bars: wonderwallAdvanced},
  },
  {
    name: 'Comme toi — Jean-Jacques Goldman',
    sound: 'acoustic_guitar_nylon',
    difficulty: 2,
    capo: 5,
    easy: {bpm: 96, pattern: EASY_PATTERN, bars: commeToi},
    advanced: {bpm: 96, pattern: EASY_PATTERN, pick: PICK_44, bars: commeToi},
  },
  {
    name: 'House of the Rising Sun — The Animals',
    sound: 'acoustic_guitar_steel',
    difficulty: 3,
    easy: {bpm: 56, meter: SIX_EIGHT, pattern: EASY_PATTERN_68, pick: PICK_68, bars: houseOfRisingSun},
  },
  {
    name: "Je l'aime à mourir — Francis Cabrel",
    sound: 'acoustic_guitar_nylon',
    difficulty: 3,
    capo: 2,
    easy: {bpm: 100, pattern: EASY_PATTERN, bars: jeLAimeAMourir},
    advanced: {bpm: 100, pattern: EASY_PATTERN, pick: PICK_FLOW, bars: jeLAimeAMourir},
  },
];
