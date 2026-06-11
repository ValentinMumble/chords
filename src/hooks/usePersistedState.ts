import {useEffect, useState} from 'react';

export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode, quota) — state just won't persist
    }
  }, [key, value]);

  return [value, setValue] as const;
}
