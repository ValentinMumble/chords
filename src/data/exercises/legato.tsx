import {type Col} from '../../tab';
import type {PracticeCard} from './types';

// The teacher's legato routine (Hammer & Pull off, exercices poussés): pairs of
// notes one fret apart, first position (finger = fret). Each pair is
// [string row (0 = high e … 5 = low E), lower fret]. It climbs from the low E to
// the high e on frets 1-2, comes back on 2-3, then on 3-4, and returns on 2-3:
// three bars of sixteen sixteenths.
const PAIRS: [number, number][][] = [
  [
    [5, 1],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  [
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [5, 3],
    [4, 3],
    [3, 3],
    [2, 3],
  ],
  [
    [1, 3],
    [0, 3],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
  ],
];

// One note on its own column, a sixteenth long.
function note(row: number, fret: number, slur = false): Col {
  const col: Col = [null, null, null, null, null, null];
  col[row] = slur ? {fret, finger: fret, beats: 0.25, slur} : {fret, finger: fret, beats: 0.25};
  return col;
}

// Hammer-ons go up a fret within each pair (pick the first, hammer the second);
// pull-offs play the same pairs from the top fret down.
function legatoBars(pull: boolean): Col[][] {
  return PAIRS.map(bar =>
    bar.flatMap(([row, low]) => {
      const [first, second] = pull ? [low + 1, low] : [low, low + 1];
      return [note(row, first, true), note(row, second)];
    }),
  );
}

export const HAMMER_ONS = legatoBars(false);
export const PULL_OFFS = legatoBars(true);

export const legato: PracticeCard = {
  id: 'legato',
  title: 'Hammer-ons and pull-offs',
  label: 'Legato',
  tabs: [
    {
      note: (
        <>
          Pick only the first note of each pair and <strong>hammer</strong> the second with the next finger, hard enough
          that it rings as loud as the picked one. One finger per fret, from the low E up to the high e and back.
        </>
      ),
      bars: HAMMER_ONS,
      storageKey: 'hammer-ons',
      defaultTempo: 50,
      subdiv: 4,
      showRhythm: true,
      barsPerRow: 1,
      caption: 'Hammer-on routine — pick, hammer, pick, hammer',
    },
    {
      note: (
        <>
          The same pairs from the top fret down: keep both fingers down, pick the higher note, then{' '}
          <strong>pull off</strong> with a small downward flick so the lower note sounds.
        </>
      ),
      bars: PULL_OFFS,
      storageKey: 'pull-offs',
      defaultTempo: 50,
      subdiv: 4,
      showRhythm: true,
      barsPerRow: 1,
      caption: 'Legato pull-off — pick, pull, pick, pull',
    },
  ],
};
