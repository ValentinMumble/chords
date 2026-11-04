import {describe, expect, it} from 'vitest';
import {PRACTICE} from './practice';

const tabs = PRACTICE.flatMap(card => card.tabs.map(tab => ({card: card.id, ...tab})));

describe('Practice cards', () => {
  it('have unique ids and storage keys', () => {
    const ids = PRACTICE.map(card => card.id);
    expect(new Set(ids).size).toBe(ids.length);
    const keys = tabs.map(tab => tab.storageKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(tabs.map(tab => [tab.storageKey, tab] as const))('%s is well formed', (_key, tab) => {
    expect(tab.bars.length).toBeGreaterThan(0);
    tab.bars.forEach((bar, barIndex) => {
      const where = `${tab.storageKey} bar ${barIndex + 1}`;
      expect(bar.length, where).toBeGreaterThan(0);
      bar.forEach((col, colIndex) => {
        expect(col, `${where} column ${colIndex + 1}`).toHaveLength(6);
        col.forEach(cell => {
          if (!cell) return;
          expect(Number.isInteger(cell.fret) && cell.fret >= 0 && cell.fret <= 24, where).toBe(true);
          if (cell.finger !== undefined) expect([1, 2, 3, 4], where).toContain(cell.finger);
        });
      });
      // A note's length must fit before the next attack (or the bar's end), or
      // the rhythm lane draws notes on top of each other.
      const attacks = bar.flatMap((col, colIndex) => (col.some(Boolean) ? [colIndex] : []));
      attacks.forEach((start, index) => {
        const end = attacks[index + 1] ?? bar.length;
        bar[start].forEach(cell => {
          if (cell?.beats === undefined) return;
          expect(Math.round(cell.beats * tab.subdiv), `${where} column ${start + 1}`).toBeLessThanOrEqual(end - start);
        });
      });
    });
    if (tab.chords) expect(tab.chords.length, `${tab.storageKey} chords`).toBeLessThanOrEqual(tab.bars.length);
  });
});
