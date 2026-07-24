import {parseTab, parseSpacedTab, applyRhythm, type Col} from '../tab';

// The chromatic finger exercise: low E at fret 1 with fingers 1-2-3-4, then each
// higher string starts one fret higher, up to the high E with finger 4 on fret
// 9. Grouped four-to-a-bar so the position shift reads as a staircase.
function chromaticBars(descending: boolean): Col[][] {
  const notes: {physicalString: number; fret: number; finger: number}[] = [];
  for (let physicalString = 0; physicalString < 6; physicalString++) {
    for (let step = 0; step < 4; step++) {
      notes.push({physicalString, fret: physicalString + 1 + step, finger: step + 1});
    }
  }
  const sequence = descending ? [...notes].reverse() : notes;
  const bars: Col[][] = [];
  for (let index = 0; index < sequence.length; index += 4) {
    bars.push(
      sequence.slice(index, index + 4).map(note => {
        const column: Col = [null, null, null, null, null, null];
        column[5 - note.physicalString] = {fret: note.fret, finger: note.finger};
        return column;
      }),
    );
  }
  return bars;
}

// Peter Gunn (simplified): the open-string pedal alternating with frets 2·3·5·4
// — one per finger — giving 0·0·2·0·3·0·5·4. Shown on the low E only (played
// twice); run the same shape up every string.
function peterGunnBars(): Col[][] {
  const pattern = [0, 0, 2, 0, 3, 0, 5, 4];
  const bar: Col[] = pattern.map(fret => {
    const column: Col = [null, null, null, null, null, null];
    column[5] = {fret, finger: fret === 0 ? undefined : fret - 1};
    return column;
  });
  return [bar, bar];
}

// Tag every note as an even eighth (0.5 beat) on a two-per-beat grid, so the
// rhythm lane can draw and beam them. Used by the drills and the even arpeggios.
const evenEighths = (bars: Col[][]): Col[][] => applyRhythm(bars, () => [0.5], 2);

// Computed once at module load (stable references), so switching to Practice and
// re-renders don't rebuild these arrays or the tabs derived from them.
export const PETER_GUNN = evenEighths(peterGunnBars());
export const CHROMATIC = evenEighths([...chromaticBars(false), ...chromaticBars(true)]);

// Staircase finger-independence drill: within the same shifting four-fret box as
// the chromatic walk (one fret higher per string), each string plays all four
// notes — the odd fingers (1 & 3) then the even fingers (2 & 4) on that same
// string — before moving up. Finger n frets baseFret + (n-1). Coming back down
// mirrors it: strings high-to-low, fingers 4·2·3·1.
function staircaseBars(descending: boolean): Col[][] {
  const strings = descending ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
  const fingers = descending ? [4, 2, 3, 1] : [1, 3, 2, 4];
  return strings.map(physicalString => {
    const baseFret = physicalString + 1;
    return fingers.map(finger => {
      const column: Col = [null, null, null, null, null, null];
      column[5 - physicalString] = {fret: baseFret + (finger - 1), finger};
      return column;
    });
  });
}
export const STAIRCASE = evenEighths([...staircaseBars(false), ...staircaseBars(true)]);

// Exercice de dextérité — a finger-independence drill that crosses the low E and
// A strings with the 1-3-2-4 finger pattern. First half of the bar: low E plays
// frets k and k+1 (fingers 1·2) against the A string's k+2 and k+3 (fingers 3·4).
// Second half reverses the strings — fingers 1·2 move to the A string and 3·4 to
// the low E. Eight even eighths per bar, then the whole shape climbs one fret.
// Rows 4 = A, 5 = low E; fingers stay 1·3·2·4 throughout.
function dexterityBars(positions: number): Col[][] {
  return Array.from({length: positions}, (_unused, index) => {
    const fret = index + 1; // hand position: bar 1 starts at fret 1, bar 2 at 2 …
    // low string carries fingers 1·2, high string carries 3·4, interleaved.
    const half = (lowRow: number, highRow: number) => [
      {row: lowRow, fret, finger: 1},
      {row: highRow, fret: fret + 2, finger: 3},
      {row: lowRow, fret: fret + 1, finger: 2},
      {row: highRow, fret: fret + 3, finger: 4},
    ];
    // first half low E → A, second half flips to A → low E.
    const notes = [...half(5, 4), ...half(4, 5)];
    return notes.map(({row, fret: noteFret, finger}) => {
      const column: Col = [null, null, null, null, null, null];
      column[row] = {fret: noteFret, finger};
      return column;
    });
  });
}
export const DEXTERITY = evenEighths(dexterityBars(4));

// The full fingerpicked intro (Am · E/G# · C · D/F# · Fmaj7 · G/B …), 16 bars —
// a flowing even-eighth arpeggio, re-gridded so the notes beam in pairs.
export const STAIRWAY = evenEighths([
  ...parseTab([
    'E||-----------5--7------------7--|--8---------8--2----------2--|--0---------------0--------|',
    'B||--------5------------5--------|------5-------------3--------|------1-----1--------1-----|',
    'G||-----5------------------5-----|---------5-------------2-----|---------2--------------2--|',
    'D||--7-----------6---------------|--5------------4-------------|--3------------------------|',
    'A||------------------------------|-----------------------------|---------------------------|',
    'E||------------------------------|-----------------------------|---------------------------|',
  ]),
  ...parseTab([
    '|-------------------------|--------------7------------7--|--8---------8--2----------2--|',
    '|--0---1--1---------------|-----------5---------5--------|------5-------------3--------|',
    '|--0---2--2------2--------|--------5---------------5-----|---------5-------------2-----|',
    '|-------------------------|-----7--------6---------------|--5------------4-------------|',
    '|--2---0--0------0--/8--7-|--0---------------------------|-----------------------------|',
    '|-------------------------|------------------------------|-----------------------------|',
  ]),
  ...parseTab([
    '|--0---------------0--------|------------------------|-----------0--2--------2--|',
    '|------1-----1--------1-----|--0---1--1--------------|-----------------3--------|',
    '|---------2--------------2--|--0---2--2--------------|--------0-----------2-----|',
    '|--3------------------------|------------------------|-----2--------0-----------|',
    '|---------------------------|--2---0--0--------0--2--|--3-----------------------|',
    '|---------------------------|------------------------|--------------------------|',
  ]),
  ...parseTab([
    '--0---------0--------------|--------------3--------3--|--3p-2-2--2--------------|',
    '------1--------0-----------|--1--------1-----0--------|-------3--3--------------|',
    '---------2--------2--------|-----0--------------0-----|-------2--2--------------|',
    '--3------------------------|--------2-----------------|--0----0--0--------------|',
    '---------------0-----0--2--|--3-----------------------|-------------------0--2--|',
    '---------------------------|--------------3-----------|-------------------------|',
  ]),
  ...parseTab([
    '|--------------2--------2--|--0---------0--------------|-----------------------2--|',
    '|-----------1-----3--------|------1--------0-----------|-----------1--------3-----|',
    '|--------0-----------2-----|---------2--------2--------|--------0--------2--------|',
    '|-----2--------0-----------|--3------------------------|-----2--------0-----------|',
    '|--3-----------------------|---------------0-----0--2--|--3-----------------------|',
    '|--------------------------|---------------------------|--------------------------|',
  ]),
  ...parseTab([
    '|--0---0--0-------------|',
    '|--1---1--1-------------|',
    '|--2---2--2-------------|',
    '|--3---3--3-------------|',
    '|-----------------------|',
    '|-----------------------|',
  ]),
]);
// Chord above each of the 16 bars (the downbeat chord).
export const STAIRWAY_CHORDS = [
  'Am',
  'C',
  'FM7',
  'G/B',
  'E+5/G#',
  'C/G',
  'FM7',
  'G/B',
  'C',
  'FM7',
  'C',
  'D',
  'C',
  'FM7',
  'C',
  'FM7',
];

// A Forest — The Cure (intro): the open-A bass alternates with the D-string
// melody — 7·3·2·3 twice, then one long run up-and-down 7·9·10·7·5·3·2. The
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

// A Forest — the verse and chorus that follow the intro, straight from the song:
// two-string power chords hit as eight even eighth notes per bar. Verse is
// A5·C5·F5·D5, chorus is B5·C5·F♯5·C5. Each entry is [low string row, low fret,
// high string row, high fret] with rows 3 = D, 4 = A, 5 = E.
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
export const FOREST_RIFF: Col[][] = evenEighths(
  FOREST_RIFF_STOPS.map(([loRow, loFret, hiRow, hiFret]) =>
    Array.from({length: 8}, () => {
      const column: Col = [null, null, null, null, null, null];
      column[loRow] = {fret: loFret};
      column[hiRow] = {fret: hiFret};
      return column;
    }),
  ),
);

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
