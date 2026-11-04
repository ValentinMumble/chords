import {applyRhythm, parseSpacedTab} from '../../tab';
import type {PracticeCard} from './types';

// Miss You — The Rolling Stones: the guitar hook in open (first) position, the
// same G·A·D·C melody on the open G, G2, B3 and B1. Two Am bars sing the
// "ooh ooh" line (two eighths up, a quarter on the high D, then four eighths
// falling back) and the Dm7 bar answers it, letting the last note ring.
const MISS_YOU_RHYTHM = [0.5, 0.5, 1, 0.5, 0.5, 0.5, 0.5];
const MISS_YOU_LAST_RHYTHM = [0.5, 0.5, 1, 2];
export const MISS_YOU = applyRhythm(
  parseSpacedTab(
    [
      {row: 1, text: 'B|-----3-1--------|-----3-1--------|------1----|'},
      {row: 2, text: 'G|-0-2------2-0-2-|-0-2------2-0-2-|-0-2----2--|'},
    ],
    {1: 1, 2: 2, 3: 3},
  ),
  barIndex => (barIndex === 2 ? MISS_YOU_LAST_RHYTHM : MISS_YOU_RHYTHM),
  2,
);
export const MISS_YOU_CHORDS = ['Am', 'Am', 'Dm7'];

export const missYou: PracticeCard = {
  id: 'miss-you',
  title: 'Miss You — The Rolling Stones',
  label: 'Miss You',
  tabs: [
    {
      note: (
        <>
          The disco-blues hook in open position, on the G and B strings — one finger per fret (1 · 2 · 3). Two bars over
          Am sing the "ooh ooh" line, and the Dm7 bar answers — let that last note ring.
        </>
      ),
      bars: MISS_YOU,
      storageKey: 'miss-you',
      defaultTempo: 110,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 3,
      chords: MISS_YOU_CHORDS,
      firstBar: 1,
      caption: 'The guitar hook — loop it until it swings',
    },
  ],
};
