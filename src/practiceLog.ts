import {useEffect, useState} from 'react';

// Time spent playing each Practice card, kept on this device (localStorage):
// seconds per day, by card id. Enough for today's time, the total and streaks.
export type PracticeLog = Record<string, Record<string, number>>;

const STORAGE_KEY = 'practice:log';
const CHANGE_EVENT = 'practice-log-change';
// Days kept per card; older ones are dropped so the log stays small.
const KEEP_DAYS = 400;

// A local calendar day as YYYY-MM-DD (the user's day, not UTC's).
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function readLog(): PracticeLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PracticeLog) : {};
  } catch {
    return {};
  }
}

export function addPractice(id: string, seconds: number, date = new Date()): void {
  const log = readLog();
  const days = {...log[id]};
  const day = dayKey(date);
  days[day] = (days[day] ?? 0) + seconds;
  const kept = Object.keys(days).sort().slice(-KEEP_DAYS);
  log[id] = Object.fromEntries(kept.map(key => [key, days[key]]));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // storage unavailable (private mode, quota): the time just isn't kept
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Days played in a row, ending today, or yesterday so a streak isn't lost
// before you've had the chance to play today.
export function streak(days: Iterable<string>, date = new Date()): number {
  const played = new Set(days);
  const back = (count: number) => dayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - count));
  let offset = played.has(back(0)) ? 0 : 1;
  let count = 0;
  while (played.has(back(offset))) {
    count += 1;
    offset += 1;
  }
  return count;
}

export interface PracticeStats {
  today: number;
  total: number;
  streak: number;
}

// Today's seconds, all-time seconds and the streak, over the given days.
export function stats(days: Record<string, number>, date = new Date()): PracticeStats {
  const values = Object.values(days);
  return {
    today: days[dayKey(date)] ?? 0,
    total: values.reduce((sum, seconds) => sum + seconds, 0),
    streak: streak(Object.keys(days), date),
  };
}

// All cards' days merged into one, for the overall summary.
export function mergeDays(log: PracticeLog): Record<string, number> {
  const merged: Record<string, number> = {};
  Object.values(log).forEach(days =>
    Object.entries(days).forEach(([day, seconds]) => {
      merged[day] = (merged[day] ?? 0) + seconds;
    }),
  );
  return merged;
}

// "45 s", "12 min", "1 h 05".
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
}

// The log, kept fresh as tabs record time (here or in another browser tab).
export function usePracticeLog(): PracticeLog {
  const [log, setLog] = useState(readLog);
  useEffect(() => {
    const refresh = () => setLog(readLog());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return log;
}
