import {useEffect, useRef, useState} from 'react';
import {CHORDS_BY_NAME} from '../chords';
import {ensureAudio, pluckVoice, strumStroke} from '../audio';
import type {Bar, PickPattern, StrumPattern} from '../songs';

const RESYNC_THRESHOLD = 0.1;

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
  const nextBarTimeRef = useRef(0);

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

  useEffect(() => {
    if (!playing) return;
    const bar = bars[barIndex];
    const chord = CHORDS_BY_NAME[bar.name];
    onBarChordRef.current(chord.name);

    // Schedule against the audio clock so timing doesn't drift: each chord
    // starts exactly where the previous one ended. The strum pattern is an
    // eighth-note grid, tiled across the chord's beats and kept in phase across
    // chords (so the pattern doesn't restart mid-bar on a short chord).
    const context = ensureAudio();
    if (nextBarTimeRef.current < context.currentTime - RESYNC_THRESHOLD) {
      nextBarTimeRef.current = context.currentTime + 0.03;
    }
    const barStart = nextBarTimeRef.current;
    const beat = 60 / bpmRef.current;
    const sub = subdivisionRef.current;
    const slotDur = beat / sub;
    const pick = pickRef.current;
    const seqLength = pick ? pick.length : patternRef.current.length;
    let beatsBefore = 0;
    for (let index = 0; index < barIndex; index++) beatsBefore += bars[index].beats;
    const phase = (beatsBefore * sub) % seqLength;
    const slots = bar.beats * sub;
    for (let slot = 0; slot < slots; slot++) {
      const pos = (phase + slot) % seqLength;
      const onBeat = pos % sub === 0;
      const at = barStart + slot * slotDur + (onBeat ? 0 : slotDur * 0.14);
      if (pick) {
        const voice = pick[pos];
        if (voice === null) continue;
        pluckVoice(chord, voice, at, onBeat ? 0.92 : 0.62);
      } else {
        const stroke = patternRef.current[pos];
        if (stroke === '-') continue;
        const down = stroke === 'D';
        const beatIndex = pos / sub;
        // Downbeat loudest; alternating strong beats (1 & 3 in 4/4) get a bass thump.
        const strongBeat = onBeat && beatIndex % 2 === 0;
        const gain = !down ? 0.5 : !onBeat ? 0.7 : beatIndex === 0 ? 1 : strongBeat ? 0.9 : 0.78;
        strumStroke(chord, at, down ? 'down' : 'up', gain, down && strongBeat);
      }
    }
    nextBarTimeRef.current = barStart + bar.beats * beat;

    const timer = setTimeout(
      () => {
        setBarIndex(index => advanceFrom(index));
      },
      (nextBarTimeRef.current - context.currentTime) * 1000,
    );
    return () => clearTimeout(timer);
  }, [playing, barIndex, bars]);

  function stop(): void {
    setPlaying(false);
    setBarIndex(loop ? loop.start : 0);
    nextBarTimeRef.current = 0;
  }

  function togglePlay(): void {
    if (playing) {
      stop();
    } else {
      nextBarTimeRef.current = 0;
      setBarIndex(loop ? loop.start : 0);
      setPlaying(true);
    }
  }

  function stepBar(step: number): void {
    nextBarTimeRef.current = 0;
    setBarIndex(index => (index + step + bars.length) % bars.length);
  }

  function goToBar(index: number): void {
    nextBarTimeRef.current = 0;
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
