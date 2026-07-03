import {useEffect, useRef, useState} from 'react';
import {CHORDS_BY_NAME} from '../chords';
import {pluckVoice, strumStroke} from '../audio';
import {useStepClock} from './useStepClock';
import type {Bar, PickPattern, StrumPattern} from '../songs';

// An inclusive range of bar indices to loop over for practice.
export interface LoopRange {
  readonly start: number;
  readonly end: number;
}

export interface SongPlayback {
  playing: boolean;
  barIndex: number;
  nextBarIndex: number;
  loop: LoopRange | null;
  togglePlay: () => void;
  stop: () => void;
  stepBar: (step: number) => void;
  goToBar: (index: number) => void;
  setLoop: (a: number, b: number) => void;
  clearLoop: () => void;
}

export function useSongPlayback(
  bars: readonly Bar[],
  bpm: number,
  pattern: StrumPattern,
  pick: PickPattern | undefined,
  subdivision: number,
  onBarChord: (chordName: string) => void,
): SongPlayback {
  const [playing, setPlaying] = useState(false);
  const [barIndex, setBarIndex] = useState(0);
  const [loop, setLoopRange] = useState<LoopRange | null>(null);

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const patternRef = useRef(pattern);
  patternRef.current = pattern;
  const pickRef = useRef(pick);
  pickRef.current = pick;
  const subdivisionRef = useRef(subdivision);
  subdivisionRef.current = subdivision;
  const onBarChordRef = useRef(onBarChord);
  onBarChordRef.current = onBarChord;
  const loopRef = useRef(loop);
  loopRef.current = loop;

  // The bar after `index`: step within the loop when one is set (wrapping its
  // end back to its start), otherwise wrap around the whole song.
  function advanceFrom(index: number): number {
    const lp = loopRef.current;
    if (lp) return index >= lp.start && index < lp.end ? index + 1 : lp.start;
    return (index + 1) % bars.length;
  }

  // A loop can become invalid when the song or level changes (different bar
  // count); drop it so we never index past the end.
  useEffect(() => {
    setLoopRange(null);
  }, [bars]);

  // Schedule one bar at `barStart`: the strum/pick pattern is an eighth-note grid
  // tiled across the chord's beats and kept in phase across bars (so it doesn't
  // restart mid-bar on a short chord). Returns the bar's duration in seconds.
  const clock = useStepClock(
    playing,
    barIndex,
    (index, barStart) => {
      const bar = bars[index];
      const chord = CHORDS_BY_NAME[bar.name];
      onBarChordRef.current(chord.name);
      const beat = 60 / bpmRef.current;
      const sub = subdivisionRef.current;
      const slotDur = beat / sub;
      const pickPattern = pickRef.current;
      const seqLength = pickPattern ? pickPattern.length : patternRef.current.length;
      let beatsBefore = 0;
      for (let i = 0; i < index; i++) beatsBefore += bars[i].beats;
      const phase = (beatsBefore * sub) % seqLength;
      const slots = bar.beats * sub;
      for (let slot = 0; slot < slots; slot++) {
        const pos = (phase + slot) % seqLength;
        const onBeat = pos % sub === 0;
        const when = barStart + slot * slotDur + (onBeat ? 0 : slotDur * 0.14);
        if (pickPattern) {
          const voice = pickPattern[pos];
          if (voice === null) continue;
          pluckVoice(chord, voice, when, onBeat ? 0.92 : 0.62);
        } else {
          const stroke = patternRef.current[pos];
          if (stroke === '-') continue;
          const down = stroke === 'D';
          const beatIndex = pos / sub;
          // Downbeat loudest; alternating strong beats (1 & 3 in 4/4) get a bass thump.
          const strongBeat = onBeat && beatIndex % 2 === 0;
          const gain = !down ? 0.5 : !onBeat ? 0.7 : beatIndex === 0 ? 1 : strongBeat ? 0.9 : 0.78;
          strumStroke(chord, when, down ? 'down' : 'up', gain, down && strongBeat);
        }
      }
      return bar.beats * beat;
    },
    () => setBarIndex(index => advanceFrom(index)),
    [bars],
  );

  function stop(): void {
    setPlaying(false);
    setBarIndex(loop ? loop.start : 0);
    clock.reset();
  }

  function togglePlay(): void {
    if (playing) {
      stop();
    } else {
      clock.reset();
      setBarIndex(loop ? loop.start : 0);
      setPlaying(true);
    }
  }

  function stepBar(step: number): void {
    clock.reset();
    setBarIndex(index => (index + step + bars.length) % bars.length);
  }

  function goToBar(index: number): void {
    clock.reset();
    setBarIndex(((index % bars.length) + bars.length) % bars.length);
  }

  function setLoop(a: number, b: number): void {
    setLoopRange({start: Math.min(a, b), end: Math.max(a, b)});
  }

  function clearLoop(): void {
    setLoopRange(null);
  }

  const nextBarIndex = loop
    ? barIndex >= loop.start && barIndex < loop.end
      ? barIndex + 1
      : loop.start
    : (barIndex + 1) % bars.length;

  return {
    playing,
    barIndex,
    nextBarIndex,
    loop,
    togglePlay,
    stop,
    stepBar,
    goToBar,
    setLoop,
    clearLoop,
  };
}
