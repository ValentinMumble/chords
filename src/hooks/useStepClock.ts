import {useEffect, useRef} from 'react';
import {ensureAudio} from '../audio';

// If the scheduled time has fallen this far behind the audio clock (e.g. the tab
// was backgrounded), restart from now instead of trying to catch up.
const RESYNC_THRESHOLD = 0.1;

// Drives a stepping sequencer against the audio clock without drift — the shared
// engine behind both song and tab playback. While `active` and `index >= 0`, it
// calls `onStep(index, at)` to schedule that step's audio at time `at` (audio-
// context seconds) and expects back the DURATION in seconds that step occupies;
// when that time elapses it calls `advance()` (which should move `index` on).
// Each step begins exactly where the previous ended, so timing never drifts.
// `extraDeps` re-runs the scheduler when the underlying sequence changes.
// `reset()` clears the internal clock so the next step starts fresh — call it
// from stop / seek before changing `index`.
export function useStepClock(
  active: boolean,
  index: number,
  onStep: (index: number, at: number) => number,
  advance: () => void,
  extraDeps: readonly unknown[] = [],
): {reset: () => void} {
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;
  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const nextTimeRef = useRef(0);

  useEffect(() => {
    if (!active || index < 0) return;
    const context = ensureAudio();
    if (nextTimeRef.current < context.currentTime - RESYNC_THRESHOLD) {
      nextTimeRef.current = context.currentTime + 0.03;
    }
    const at = nextTimeRef.current;
    const duration = onStepRef.current(index, at);
    nextTimeRef.current = at + duration;
    const timer = setTimeout(() => advanceRef.current(), (nextTimeRef.current - context.currentTime) * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index, ...extraDeps]);

  return {
    reset: () => {
      nextTimeRef.current = 0;
    },
  };
}
