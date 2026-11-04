import {applyRhythm, column, notes} from '../../tab';
import type {PracticeCard} from './types';

// Polly — Nirvana: the power chords, one ringing strum each, two beats apiece.
// Verse: E5 · G5 · D5 · C5; chorus ("isn't me…"): D5 · C5 · G5 · B♭5. Full
// three-string shapes (root, fifth, octave): index root, ring fifth, pinky
// octave. Two chords per bar, so the loop is verse row then chorus row.
const E5 = column(notes('E0 A2/3 D2/4'));
const G5 = column(notes('E3/1 A5/3 D5/4'));
const D5 = column(notes('A5/1 D7/3 G7/4'));
const C5 = column(notes('A3/1 D5/3 G5/4'));
const BB5 = column(notes('A1/1 D3/3 G3/4'));
export const POLLY = applyRhythm(
  [
    [E5, G5],
    [D5, C5],
    [D5, C5],
    [G5, BB5],
  ],
  () => [2, 2],
  2,
);
export const POLLY_CHORDS = ['E5 · G5', 'D5 · C5', 'D5 · C5', 'G5 · B♭5'];

export const polly: PracticeCard = {
  id: 'polly',
  title: 'Polly — Nirvana',
  label: 'Polly',
  tabs: [
    {
      note: (
        <>
          Power chords, one ringing strum each, two beats apiece. Verse: E5 · G5 · D5 · C5, then the chorus answers with
          D5 · C5 · G5 · B♭5. Full three-string shapes: index on the root, ring on the fifth, pinky on the octave. Slide
          the same shape between positions and keep the strums lazy.
        </>
      ),
      bars: POLLY,
      storageKey: 'polly',
      defaultTempo: 120,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 2,
      chords: POLLY_CHORDS,
      firstBar: 1,
      caption: 'Four chords, one strum each — the whole verse',
    },
  ],
};
