import {applyRhythm, column, slots, type Note} from '../../tab';
import type {PracticeCard} from './types';

// She's Lost Control (Joy Division), from a printed guitar arrangement.
// The bass line played on guitar, high on the A string: a quarter then six
// eighths on D (17) and C (15), and the D-C-B♭-G runs with a held note on beat 3.
// Fingers: index on 13 and 10, ring on 15, pinky on 17.
const BASS_FINGER: Record<number, number> = {10: 1, 13: 1, 15: 3, 17: 4};
const onAString = (frets: number[]) => frets.map(fret => column([[4, fret, BASS_FINGER[fret]]]));
const STEADY = [1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
const RUN = [0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5];
export const SHES_LOST_CONTROL_BASS = applyRhythm(
  [
    onAString([17, 17, 17, 17, 17, 17, 17]),
    onAString([15, 17, 15, 13, 13, 13, 13]),
    onAString([15, 15, 15, 15, 15, 15, 15]),
    onAString([13, 15, 13, 10, 10, 10, 10]),
  ],
  barIndex => (barIndex % 2 === 0 ? STEADY : RUN),
  2,
);

// The guitar riff, as power chords on the three low strings (the top three
// strings of the printed voicings are crossed out on the sheet). Eighth-note
// strums with an eighth rest ('.') on beats 2 and 4: G G · A A A · A#,
// A# A# · C C C · D, two bars of D, then the same with A in place of D. Root on
// the low E (index), fifth and octave on A and D (ring and pinky).
const ROOT_FRET: Record<string, number> = {G: 3, A: 5, 'A#': 6, C: 8, D: 10};
const powerChord = (name: string): Note[] => {
  const root = ROOT_FRET[name];
  return [
    [5, root, 1],
    [4, root + 2, 3],
    [3, root + 2, 4],
  ];
};
const riffBar = (...strums: string[]) =>
  slots(
    strums.map(name => (name === '.' ? '.' : powerChord(name))),
    0.5,
  );
const eightOf = (name: string) => riffBar(...Array.from({length: 8}, () => name));
export const SHES_LOST_CONTROL_RIFF = [
  riffBar('G', 'G', '.', 'A', 'A', 'A', '.', 'A#'),
  riffBar('A#', 'A#', '.', 'C', 'C', 'C', '.', 'D'),
  eightOf('D'),
  eightOf('D'),
  riffBar('G', 'G', '.', 'A', 'A', 'A', '.', 'A#'),
  riffBar('A#', 'A#', '.', 'C', 'C', 'C', '.', 'A'),
  eightOf('A'),
  eightOf('A'),
];
export const SHES_LOST_CONTROL_RIFF_CHORDS = [
  'G · A · A#',
  'A# · C · D',
  'D',
  'D',
  'G · A · A#',
  'A# · C · A',
  'A',
  'A',
];

export const shesLostControl: PracticeCard = {
  id: 'shes-lost-control',
  title: "She's Lost Control — Joy Division",
  label: "She's Lost Control",
  tabs: [
    {
      note: (
        <>
          The bass line played on guitar, high on the A string (frets 10 to 17): index on 13 and 10, ring on 15, pinky
          on 17. Pick it as written, starting with two downstrokes. Then the guitar riff as power chords on the three
          low strings: G · A · A# · C, landing on D, then again landing on A. Keep the rests on beats 2 and 4 crisp.
        </>
      ),
      bars: SHES_LOST_CONTROL_BASS,
      storageKey: 'slc-bass',
      defaultTempo: 140,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 2,
      firstBar: 1,
      caption: 'Bass line on the A string — hold the note on beat 3 in bars 2 and 4',
    },
    {
      bars: SHES_LOST_CONTROL_RIFF,
      storageKey: 'slc-riff',
      defaultTempo: 140,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 2,
      chords: SHES_LOST_CONTROL_RIFF_CHORDS,
      firstBar: 1,
      caption: 'Guitar riff — power chords on the three low strings, rests on beats 2 and 4',
    },
  ],
};
