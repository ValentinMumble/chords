import {describe, expect, it} from 'vitest';
import {applyRhythm, column, emptyColumn, notes, slots, strum} from './tab';

describe('column', () => {
  it('places each note on its string row', () => {
    expect(
      column([
        [5, 3, 2],
        [0, 0],
      ]),
    ).toEqual([{fret: 0, finger: undefined}, null, null, null, null, {fret: 3, finger: 2}]);
  });

  it('tags every note with beats when given', () => {
    expect(column([[1, 5, 1]], 0.5)[1]).toEqual({fret: 5, finger: 1, beats: 0.5});
  });
});

describe('notes', () => {
  it('reads string, fret and optional finger', () => {
    expect(notes('B14/1 G14/1 E0')).toEqual([
      [1, 14, 1],
      [2, 14, 1],
      [5, 0, undefined],
    ]);
  });

  it('tells low E from high e', () => {
    expect(notes('e3 E3').map(([row]) => row)).toEqual([0, 5]);
  });

  it('throws on a bad token', () => {
    expect(() => notes('X5')).toThrow('Bad note "X5"');
  });
});

describe('slots', () => {
  const shape = notes('A2/1');

  it('lets "-" extend the previous attack and "." stay silent', () => {
    const bar = slots([shape, '-', '-', '.', shape], 0.5);
    expect(bar).toHaveLength(5);
    expect(bar[0][4]).toEqual({fret: 2, finger: 1, beats: 1.5});
    expect(bar[1]).toEqual(emptyColumn());
    expect(bar[3]).toEqual(emptyColumn());
    expect(bar[4][4]).toEqual({fret: 2, finger: 1, beats: 0.5});
  });
});

describe('strum', () => {
  it('turns a pattern into slots', () => {
    const shape = notes('D2/1 G2/2');
    expect(strum(shape, 'x-.x', 0.25)).toEqual(slots([shape, '-', '.', shape], 0.25));
  });
});

describe('applyRhythm', () => {
  it('pads each attack with rests to fill its length', () => {
    const attack = column([[0, 1, 1]]);
    const [bar] = applyRhythm([[attack, emptyColumn(), attack]], () => [1, 0.5], 2);
    expect(bar).toHaveLength(3);
    expect(bar[0][0]?.beats).toBe(1);
    expect(bar[1]).toEqual(emptyColumn());
    expect(bar[2][0]?.beats).toBe(0.5);
  });
});
