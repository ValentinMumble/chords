import {applyRhythm, parseTab, type Col} from '../../tab';
import type {PracticeCard} from './types';

// Fingering for the Dust shapes, keyed by "row,fret" (row 0 = high e … 5 = low
// E), so the tab numbers get the same finger colours as the chord diagrams. Open
// strings stay uncoloured. Fret 2 is the middle finger on the D string but the
// ring finger on the G string, so it has to be keyed by string, not fret alone.
const DUST_FINGERS: Record<string, number> = {
  '4,3': 3, // A string, 3rd fret — ring (C bass)
  '4,2': 2, // A string, 2nd fret — the walk-down
  '3,2': 2, // D string, 2nd fret — middle
  '2,2': 3, // G string, 2nd fret — ring (A shapes)
  '1,1': 1, // B string, 1st fret — index
  '1,3': 4, // B string, 3rd fret — pinky (add9)
};
function colorByFret(bars: Col[][], fingers: Record<string, number>): Col[][] {
  for (const bar of bars) {
    for (const col of bar) {
      col.forEach((cell, row) => {
        if (cell) cell.finger = fingers[`${row},${cell.fret}`];
      });
    }
  }
  return bars;
}

// Dust in the Wind — Kansas (intro): one Travis-picking figure the whole way,
// just moving the chord shape (C · Cmaj7 · Cadd9 · C, then the A variations),
// the thumb keeping an alternating bass. 16 bars of standard-aligned tab, given
// an explicit rhythm: each bar is a quarter-note pinch then six eighths, except
// the last bar (a quarter, two eighths, then two quarters walking down).
const DUST_BAR_RHYTHM = [1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
const DUST_LAST_RHYTHM = [1, 0.5, 0.5, 1, 1];
export const DUST = applyRhythm(
  colorByFret(
    [
      ...parseTab([
        'e|-----------------|-----------------|-----------------|-----------------|',
        'B|-1---------1-----|-0---------0-----|-3---------3-----|-1---------1-----|',
        'G|-------0-------0-|-------0-------0-|-------0-------0-|-------0-------0-|',
        'D|-----2-------2---|-----2-------2---|-----2-------2---|-----2-------2---|',
        'A|-3-------3-------|-3-------3-------|-3-------3-------|-3-------3-------|',
        'E|-----------------|-----------------|-----------------|-----------------|',
      ]),
      ...parseTab([
        'e|-----------------|-----------------|-----------------|-----------------|',
        'B|-0---------0-----|-3---------3-----|-1---------1-----|-0---------0-----|',
        'G|-------2-------2-|-------2-------2-|-------2-------2-|-------2-------2-|',
        'D|-----2-------2---|-----2-------2---|-----2-------2---|-----2-------2---|',
        'A|-0-------0-------|-0-------0-------|-0-------0-------|-0-------0-------|',
        'E|-----------------|-----------------|-----------------|-----------------|',
      ]),
      ...parseTab([
        'e|-----------------|-----------------|-----------------|-----------------|',
        'B|-3---------3-----|-1---------1-----|-0---------0-----|-3---------3-----|',
        'G|-------0-------0-|-------0-------0-|-------0-------0-|-------0-------0-|',
        'D|-----2-------2---|-----2-------2---|-----2-------2---|-----2-------2---|',
        'A|-3-------3-------|-3-------3-------|-3-------3-------|-3-------3-------|',
        'E|-----------------|-----------------|-----------------|-----------------|',
      ]),
      ...parseTab([
        'e|-----------------|-----------------|-----------------|-----------------|',
        'B|-1---------1-----|-0---------0-----|-3---------3-----|-1-------1---3---|',
        'G|-------2-------2-|-------2-------2-|-------2-------2-|-------2---------|',
        'D|-----2-------2---|-----2-------2---|-----2-------2---|-----2-----------|',
        'A|-0-------0-------|-0-------0-------|-0-------0-------|-0-------0---2---|',
        'E|-----------------|-----------------|-----------------|-----------------|',
      ]),
    ],
    DUST_FINGERS,
  ),
  barIndex => (barIndex === 15 ? DUST_LAST_RHYTHM : DUST_BAR_RHYTHM),
  4,
);

export const dust: PracticeCard = {
  id: 'dust',
  title: 'Dust in the Wind — Kansas',
  label: 'Dust in the Wind',
  tabs: [
    {
      note: (
        <>
          The Travis-picking intro: one steady fingerpicking pattern the whole way, just moving the chord shape (C ·
          Cmaj7 · Cadd9 · C, then the A variations). The thumb keeps the alternating bass throughout.
        </>
      ),
      bars: DUST,
      storageKey: 'dust-2',
      defaultTempo: 170,
      subdiv: 4,
      showRhythm: true,
      barsPerRow: 4,
      firstBar: 1,
    },
  ],
};
