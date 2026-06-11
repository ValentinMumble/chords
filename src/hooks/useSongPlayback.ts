import {useEffect, useRef, useState} from 'react';
import {CHORDS_BY_NAME} from '../chords';
import {ensureAudio, strumStroke} from '../audio';
import type {Bar, StrumPattern} from '../songs';

const RESYNC_THRESHOLD = 0.1;

export interface SongPlayback {
  playing: boolean;
  barIndex: number;
  nextBarIndex: number;
  togglePlay: () => void;
  stop: () => void;
  stepBar: (step: number) => void;
}

export function useSongPlayback(
  bars: readonly Bar[],
  bpm: number,
  pattern: StrumPattern,
  onBarChord: (chordName: string) => void,
): SongPlayback {
  const [playing, setPlaying] = useState(false);
  const [barIndex, setBarIndex] = useState(0);

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const patternRef = useRef(pattern);
  patternRef.current = pattern;
  const onBarChordRef = useRef(onBarChord);
  onBarChordRef.current = onBarChord;
  const nextBarTimeRef = useRef(0);

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
    const eighth = beat / 2;
    const pat = patternRef.current;
    let beatsBefore = 0;
    for (let index = 0; index < barIndex; index++) beatsBefore += bars[index].beats;
    const phase = (beatsBefore * 2) % pat.length;
    const slots = bar.beats * 2;
    for (let slot = 0; slot < slots; slot++) {
      const pos = (phase + slot) % pat.length;
      const stroke = pat[pos];
      if (stroke === '-') continue;
      const down = stroke === 'D';
      // Strong beats: 1 (loudest) and 3 (backbeat) carry a bass thump.
      const strongBeat = pos === 0 || pos === 4;
      const gain = down ? (pos === 0 ? 1 : pos === 4 ? 0.9 : 0.72) : 0.5;
      // Lay the off-beat up-strokes slightly late for a relaxed swing feel.
      const swing = pos % 2 === 1 ? eighth * 0.14 : 0;
      strumStroke(chord, barStart + slot * eighth + swing, down ? 'down' : 'up', gain, down && strongBeat);
    }
    nextBarTimeRef.current = barStart + bar.beats * beat;

    const timer = setTimeout(
      () => {
        setBarIndex(index => (index + 1) % bars.length);
      },
      (nextBarTimeRef.current - context.currentTime) * 1000,
    );
    return () => clearTimeout(timer);
  }, [playing, barIndex, bars]);

  function stop(): void {
    setPlaying(false);
    setBarIndex(0);
    nextBarTimeRef.current = 0;
  }

  function togglePlay(): void {
    if (playing) {
      stop();
    } else {
      nextBarTimeRef.current = 0;
      setBarIndex(0);
      setPlaying(true);
    }
  }

  function stepBar(step: number): void {
    nextBarTimeRef.current = 0;
    setBarIndex(index => (index + step + bars.length) % bars.length);
  }

  return {
    playing,
    barIndex,
    nextBarIndex: (barIndex + 1) % bars.length,
    togglePlay,
    stop,
    stepBar,
  };
}
