import {useEffect, useRef, useState} from 'react';
import {CHORDS_BY_NAME, type ChordName} from '../chords';
import {ensureAudio, strum} from '../audio';

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
  bars: readonly ChordName[],
  bpm: number,
  beatsPerBar: number,
  onBarChord: (chordName: string) => void,
): SongPlayback {
  const [playing, setPlaying] = useState(false);
  const [barIndex, setBarIndex] = useState(0);

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const beatsPerBarRef = useRef(beatsPerBar);
  beatsPerBarRef.current = beatsPerBar;
  const onBarChordRef = useRef(onBarChord);
  onBarChordRef.current = onBarChord;
  const nextBarTimeRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const chord = CHORDS_BY_NAME[bars[barIndex]];
    onBarChordRef.current(chord.name);

    // Schedule against the audio clock so bar timing doesn't drift: each bar
    // starts exactly where the previous one ended, and setTimeout only has to
    // land close enough to queue the next one.
    const context = ensureAudio();
    if (nextBarTimeRef.current < context.currentTime - RESYNC_THRESHOLD) {
      nextBarTimeRef.current = context.currentTime + 0.03;
    }
    const barStart = nextBarTimeRef.current;
    strum(chord, barStart);
    const beat = 60 / bpmRef.current;
    nextBarTimeRef.current = barStart + beatsPerBarRef.current * beat;

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
