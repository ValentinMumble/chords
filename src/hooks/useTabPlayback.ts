import {useMemo, useRef, useState} from 'react';
import {click, pluckTab} from '../audio';
import {useStepClock} from './useStepClock';
import type {Col} from '../tab';

export interface TabPlayback {
  playing: boolean;
  // The index of the currently sounding column across the whole flattened tab,
  // or -1 when stopped or counting in. Used to draw the moving playhead.
  column: number;
  // The count-in beat being clicked (1, 2, 3 …), or 0 once the tab plays.
  countBeat: number;
  toggle: () => void;
  stop: () => void;
}

export interface TabPlaybackOptions {
  // How many steps make up one beat (1 = one step per beat).
  subdiv?: number;
  // Step only over columns that have notes, skipping empty (dash) columns. Use
  // for tabs whose ASCII spacing is loose, so the notes play evenly.
  evenNotes?: boolean;
  // Play only the columns from `range[0]` up to (not including) `range[1]`,
  // looping over them (a chosen set of bars).
  range?: readonly [number, number];
  // Metronome beats clicked before the first note (0 = none). Only before the
  // first pass, not on every loop.
  countIn?: number;
  // Called each time playback wraps back to the start of the loop.
  onLoop?: () => void;
}

// Whether the note on `row` at column `index` is hammered or pulled from the one
// before it on that string (that note carries the slur).
function isSlurredInto(columns: readonly Col[], index: number, row: number): boolean {
  for (let back = index - 1; back >= 0; back--) {
    const cell = columns[back][row];
    if (cell) return !!cell.slur;
  }
  return false;
}

// Plays a tab and loops it, on the shared audio-clock scheduler (drift-free).
// Each column's notes are struck together (a chord slot).
export function useTabPlayback(
  columns: readonly Col[],
  bpm: number,
  {subdiv = 1, evenNotes = false, range, countIn = 0, onLoop}: TabPlaybackOptions = {},
): TabPlayback {
  const [playing, setPlaying] = useState(false);
  // -1 when stopped; then 0 … countIn - 1 for the clicks, then the tab steps.
  const [step, setStep] = useState(-1);
  // The count-in of the current run, fixed when Play is pressed.
  const [runCountIn, setRunCountIn] = useState(0);

  const [from, to] = range ?? [0, columns.length];
  // The column indices we actually step through: every column in the range, or
  // only the note-bearing ones in even mode.
  const steps = useMemo(() => {
    const indices = columns.map((_, index) => index).filter(index => index >= from && index < to);
    return evenNotes ? indices.filter(index => columns[index].some(Boolean)) : indices;
  }, [columns, evenNotes, from, to]);

  const stepRef = useRef(step);
  stepRef.current = step;
  const onLoopRef = useRef(onLoop);
  onLoopRef.current = onLoop;

  const clock = useStepClock(
    playing,
    step,
    (current, at) => {
      if (current < runCountIn) {
        click(at, current % 4 === 0);
        return 60 / bpm;
      }
      if (steps.length > 0) {
        const index = steps[(current - runCountIn) % steps.length];
        columns[index].forEach((cell, row) => {
          // A hammer-on or pull-off sounds softer than a picked note.
          if (cell) pluckTab(row, cell.fret, at, isSlurredInto(columns, index, row) ? 0.5 : 0.8);
        });
      }
      return 60 / bpm / subdiv;
    },
    () => {
      if (steps.length === 0) return setStep(-1);
      const next = stepRef.current + 1;
      if (next < runCountIn + steps.length) return setStep(next);
      onLoopRef.current?.();
      // A one-column loop would set the same step and never re-render.
      setStep(steps.length === 1 ? next : runCountIn);
    },
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
      setRunCountIn(countIn);
      setStep(0);
      setPlaying(true);
    }
  }

  const counting = step >= 0 && step < runCountIn;
  const column = step >= 0 && !counting && steps.length > 0 ? steps[(step - runCountIn) % steps.length] : -1;
  return {playing, column, countBeat: counting ? step + 1 : 0, toggle, stop};
}
