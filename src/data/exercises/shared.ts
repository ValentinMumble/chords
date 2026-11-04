import {applyRhythm, type Col} from '../../tab';

// Tag every note as an even eighth (0.5 beat) on a two-per-beat grid, so the
// rhythm lane can draw and beam them. Used by the drills and the even arpeggios.
export const evenEighths = (bars: Col[][]): Col[][] => applyRhythm(bars, () => [0.5], 2);
