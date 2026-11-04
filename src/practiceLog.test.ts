import {describe, expect, it} from 'vitest';
import {dayKey, formatDuration, mergeDays, stats, streak} from './practiceLog';

const NOV_4 = new Date(2026, 10, 4, 21, 30);

describe('dayKey', () => {
  it('uses the local calendar day', () => {
    expect(dayKey(NOV_4)).toBe('2026-11-04');
  });
});

describe('streak', () => {
  it('counts days in a row up to today', () => {
    expect(streak(['2026-11-02', '2026-11-03', '2026-11-04'], NOV_4)).toBe(3);
  });

  it('keeps a streak that ended yesterday', () => {
    expect(streak(['2026-11-02', '2026-11-03'], NOV_4)).toBe(2);
  });

  it('stops at a missed day', () => {
    expect(streak(['2026-11-01', '2026-11-03', '2026-11-04'], NOV_4)).toBe(2);
    expect(streak(['2026-11-01', '2026-11-02'], NOV_4)).toBe(0);
  });

  it('crosses month ends', () => {
    expect(streak(['2026-10-31', '2026-11-01'], new Date(2026, 10, 1))).toBe(2);
  });
});

describe('stats', () => {
  it('sums today, the total and the streak', () => {
    expect(stats({'2026-11-03': 120, '2026-11-04': 90}, NOV_4)).toEqual({today: 90, total: 210, streak: 2});
  });
});

describe('mergeDays', () => {
  it('adds up the same day across cards', () => {
    expect(mergeDays({a: {'2026-11-04': 60}, b: {'2026-11-04': 30, '2026-11-03': 10}})).toEqual({
      '2026-11-04': 90,
      '2026-11-03': 10,
    });
  });
});

describe('formatDuration', () => {
  it.each([
    [45, '45 s'],
    [720, '12 min'],
    [3900, '1 h 05'],
  ])('%i s → %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});
