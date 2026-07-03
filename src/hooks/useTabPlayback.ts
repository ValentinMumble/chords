import {useMemo, useState} from 'react';
import {pluckTab} from '../audio';
import {useStepClock} from './useStepClock';
import type {Col} from '../tab';

export interface TabPlayback {
  playing: boolean;
  // The index of the currently sounding column across the whole flattened tab,
  // or -1 when stopped. Used to draw the moving playhead.
  column: number;
  toggle: () => void;
  stop: () => void;
}

// Plays a tab and loops it, on the shared audio-clock scheduler (drift-free).
// Each column's notes are struck together (a chord slot).
//   `subdiv`    — how many steps make up one beat (1 = one step per beat).
//   `evenNotes` — when true, step only over columns that have notes, skipping
//                 empty (dash) columns. Use for tabs whose ASCII spacing is loose
//                 so the note stream plays evenly rather than by column width.
export function useTabPlayback(columns: readonly Col[], bpm: number, subdiv = 1, evenNotes = false): TabPlayback {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);

  // The column indices we actually step through: every column normally, or only
  // the note-bearing ones in even mode.
  const steps = useMemo(
    () =>
      evenNotes
        ? columns.flatMap((col, index) => (col.some(Boolean) ? [index] : []))
        : columns.map((_, index) => index),
    [columns, evenNotes],
  );

  const clock = useStepClock(
    playing,
    step,
    (current, at) => {
      if (steps.length > 0) {
        columns[steps[current % steps.length]].forEach((cell, row) => {
          if (cell) pluckTab(row, cell.fret, at, 0.8);
        });
      }
      return 60 / bpm / subdiv;
    },
    () => setStep(index => (steps.length ? (index + 1) % steps.length : -1)),
  );

  function stop(): void {
    setPlaying(false);
    setStep(-1);
    clock.reset();
  }

  function toggle(): void {
    if (playing) {
      stop();
    } else {
      clock.reset();
      setStep(0);
      setPlaying(true);
    }
  }

  const column = step >= 0 && steps.length > 0 ? steps[step % steps.length] : -1;
  return {playing, column, toggle, stop};
}
