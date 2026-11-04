import {column, parseSpacedTab} from '../../tab';
import {evenEighths} from './shared';
import type {PracticeCard} from './types';

// A Forest — The Cure (intro): the open-A bass alternates with the D-string
// melody, 7·3·2·3 twice, then one long run up-and-down 7·9·10·7·5·3·2. The
// opening 7 of each phrase is held a touch longer, and there's a pause between
// phrases (trailing rests). One character = one slot; edit the gaps to retime.
const FOREST_FINGER: Record<number, number> = {2: 2, 3: 3, 5: 1, 7: 1, 9: 3, 10: 4};
export const FOREST = parseSpacedTab(
  [
    {row: 3, text: 'D|-7---3--2--3----|-7---3--2--3----|-7---9--10-7--5--3--2-------|'},
    {row: 4, text: 'A|0---0--0--0-----|0---0--0--0-----|0---0--0--0--0--0--0--0--0--|'},
  ],
  FOREST_FINGER,
);

// The verse and chorus that follow the intro, straight from the song: two-string
// power chords hit as eight even eighth notes per bar. Verse is A5·C5·F5·D5,
// chorus is B5·C5·F♯5·C5. Each entry is [low string row, low fret, high string
// row, high fret] with rows 3 = D, 4 = A, 5 = E.
const FOREST_RIFF_STOPS: [number, number, number, number][] = [
  [4, 0, 3, 2], // A5 — A0 + D2
  [4, 3, 3, 5], // C5 — A3 + D5
  [5, 1, 4, 3], // F5 — E1 + A3
  [4, 5, 3, 7], // D5 — A5 + D7
  [4, 2, 3, 4], // B5 — A2 + D4
  [4, 3, 3, 5], // C5 — A3 + D5
  [5, 2, 4, 4], // F♯5 — E2 + A4
  [4, 3, 3, 5], // C5 — A3 + D5
];
export const FOREST_RIFF_CHORDS = ['A5', 'C5', 'F5', 'D5', 'B5', 'C5', 'F♯5', 'C5'];
export const FOREST_RIFF = evenEighths(
  FOREST_RIFF_STOPS.map(([loRow, loFret, hiRow, hiFret]) =>
    Array.from({length: 8}, () =>
      column([
        [loRow, loFret],
        [hiRow, hiFret],
      ]),
    ),
  ),
);

export const aForest: PracticeCard = {
  id: 'a-forest',
  title: 'A Forest — The Cure',
  label: 'A Forest',
  tabs: [
    {
      note: <>The post-punk intro, in A minor — a melodic line on the D string over the ringing open A.</>,
      bars: FOREST,
      storageKey: 'a-forest-5',
      defaultTempo: 112,
      minTempo: 20,
      subdiv: 6,
      barsPerRow: 2,
      firstBar: 1,
      caption: 'Intro in Am — open-A bass alternating with the melody',
    },
    {
      bars: FOREST_RIFF,
      storageKey: 'a-forest-riff-2',
      defaultTempo: 160,
      minTempo: 20,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 4,
      chords: FOREST_RIFF_CHORDS,
      firstBar: 12,
      caption: 'Verses then chorus — palm-muted (P.M.) power chords in straight eighths, down-picked',
    },
  ],
};
