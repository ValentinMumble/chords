import {useEffect, useRef, useState} from 'react';

// While active, picks a random chord from the list every `intervalSeconds`
// (never the same one twice in a row) and reports it. Returns a tick counter
// that increments on each pick, for re-triggering a countdown animation.
export function useChordTrainer(
  chordNames: readonly string[],
  intervalSeconds: number,
  active: boolean,
  onPick: (name: string) => void,
): number {
  const [tick, setTick] = useState(0);
  const namesRef = useRef(chordNames);
  namesRef.current = chordNames;
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active) return;
    const pick = () => {
      const names = namesRef.current;
      if (names.length === 0) return;
      let next = names[Math.floor(Math.random() * names.length)];
      while (names.length > 1 && next === lastRef.current) {
        next = names[Math.floor(Math.random() * names.length)];
      }
      lastRef.current = next;
      onPickRef.current(next);
      setTick(value => value + 1);
    };
    pick();
    const id = window.setInterval(pick, intervalSeconds * 1000);
    return () => window.clearInterval(id);
  }, [active, intervalSeconds]);

  return tick;
}
