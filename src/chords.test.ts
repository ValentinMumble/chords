import {describe, expect, it} from 'vitest';
import {CHORDS, CHORDS_BY_NAME, findBarres, frenchName, frenchShort, getChord, isBarreChord, noteName} from './chords';

describe('frenchName', () => {
  it.each([
    ['C', 'Do majeur'],
    ['Am', 'La mineur'],
    ['B7', 'Si 7'],
    ['Am7', 'La mineur 7'],
    ['Cmaj7', 'Do majeur 7'],
    ['Cadd9', 'Do add 9'],
    ['Dsus4', 'Ré sus4'],
    ['Asus2', 'La sus2'],
  ])('%s → %s', (name, expected) => {
    expect(frenchName(name)).toBe(expected);
  });
});

describe('frenchShort', () => {
  it.each([
    ['C', 'Do'],
    ['Am7', 'La m7'],
    ['Gmaj7', 'Sol maj7'],
    ['Dsus4', 'Ré sus4'],
  ])('%s → %s', (name, expected) => {
    expect(frenchShort(name)).toBe(expected);
  });
});

describe('noteName', () => {
  it('names the open strings E A D G B E', () => {
    expect([0, 1, 2, 3, 4, 5].map(stringIndex => noteName(stringIndex, 0))).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
  });

  it('transposes by fret', () => {
    expect(noteName(1, 3)).toBe('C');
    expect(noteName(5, 1)).toBe('F');
  });
});

describe('findBarres', () => {
  it('finds the full barre on F', () => {
    expect(findBarres(CHORDS_BY_NAME.F)).toEqual([{finger: 1, fret: 1, fromString: 0, toString: 5}]);
  });

  it('finds the partial barre on Fm', () => {
    expect(findBarres(CHORDS_BY_NAME.Fm)).toEqual([{finger: 1, fret: 1, fromString: 0, toString: 5}]);
  });

  it('finds the barre on B and Bm even with other fingers between', () => {
    expect(findBarres(CHORDS_BY_NAME.B)).toEqual([{finger: 1, fret: 2, fromString: 1, toString: 5}]);
    expect(findBarres(CHORDS_BY_NAME.Bm)).toEqual([{finger: 1, fret: 2, fromString: 1, toString: 5}]);
  });

  it('finds the two-string mini-barre on Dm7', () => {
    expect(findBarres(CHORDS_BY_NAME.Dm7)).toEqual([{finger: 1, fret: 1, fromString: 4, toString: 5}]);
  });

  it('finds no barre on open chords', () => {
    expect(findBarres(CHORDS_BY_NAME.C)).toEqual([]);
    expect(findBarres(CHORDS_BY_NAME.Em)).toEqual([]);
  });
});

describe('isBarreChord', () => {
  it('flags the barre shapes', () => {
    expect(CHORDS.filter(isBarreChord).map(chord => chord.name)).toEqual(['F', 'B', 'Bm', 'Fm', 'F#m', 'C#m']);
  });

  it('does not flag the Dm7 mini-barre', () => {
    expect(isBarreChord(CHORDS_BY_NAME.Dm7)).toBe(false);
  });
});

describe('getChord', () => {
  it('returns the chord for a known name', () => {
    expect(getChord('Am7')).toBe(CHORDS_BY_NAME.Am7);
  });

  it('returns undefined for junk (e.g. stale localStorage)', () => {
    expect(getChord('Z9')).toBeUndefined();
    expect(getChord('')).toBeUndefined();
  });
});

describe('chord data integrity', () => {
  it.each(CHORDS.map(chord => [chord.name, chord] as const))('%s has coherent frets and fingers', (_, chord) => {
    chord.frets.forEach((fret, stringIndex) => {
      const finger = chord.fingers[stringIndex];
      if (fret <= 0) {
        expect(finger).toBe(0);
      } else {
        expect(finger).toBeGreaterThan(0);
      }
    });
  });
});
