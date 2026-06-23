import {useEffect, useRef, useState} from 'react';

// While active, reports a chord every `intervalSeconds`: either the next chord
// in order (ordered, for walking a progression) or a random one that never
// repeats twice in a row. `sourceKey` restarts the cycle when it changes.
// Returns a tick counter that increments per pick, for the countdown animation.
export function useChordTrainer(
  chordNames: readonly string[],
  intervalSeconds: number,
  active: boolean,
  ordered: boolean,
  sourceKey: string,
  onPick: (name: string) => void,
): number {
  const [tick, setTick] = useState(0);
  const namesRef = useRef(chordNames);
  namesRef.current = chordNames;
  const orderedRef = useRef(ordered);
  orderedRef.current = ordered;
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const indexRef = useRef(0);
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active) return;
    indexRef.current = 0;
    const pick = () => {
      const names = namesRef.current;
      if (names.length === 0) return;
      let next: string;
      if (orderedRef.current) {
        next = names[indexRef.current % names.length];
        indexRef.current += 1;
      } else {
        next = names[Math.floor(Math.random() * names.length)];
        while (names.length > 1 && next === lastRef.current) {
          next = names[Math.floor(Math.random() * names.length)];
        }
      }
      lastRef.current = next;
      onPickRef.current(next);
      setTick(value => value + 1);
    };
    pick();
    const id = window.setInterval(pick, intervalSeconds * 1000);
    return () => window.clearInterval(id);
  }, [active, intervalSeconds, sourceKey]);

  return tick;
}
