import {useEffect, useRef, useState} from 'react';
import {CHORDS_BY_NAME} from '../chords';
import {strumChord, metronomeTick, currentTime} from '../audio';
import type {Song} from '../types';

export interface SongPlayback {
  playing: boolean;
  barIndex: number;
  nextBarIndex: number;
  togglePlay: () => void;
  stop: () => void;
  stepBar: (step: number) => void;
}

export function useSongPlayback(song: Song, bpm: number, onBarChord: (chordName: string) => void): SongPlayback {
  const [playing, setPlaying] = useState(false);
  const [barIndex, setBarIndex] = useState(0);

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const onBarChordRef = useRef(onBarChord);
  onBarChordRef.current = onBarChord;

  useEffect(() => {
    if (!playing) return;
    const chord = CHORDS_BY_NAME[song.bars[barIndex]];
    onBarChordRef.current(chord.name);
    strumChord(chord, 0.045);
    const beat = 60 / bpmRef.current;
    for (let tick = 1; tick < 4; tick++) metronomeTick(currentTime() + 0.03 + tick * beat);
    const timer = setTimeout(
      () => {
        setBarIndex(index => (index + 1) % song.bars.length);
      },
      beat * 4 * 1000,
    );
    return () => clearTimeout(timer);
  }, [playing, barIndex, song]);

  function stop(): void {
    setPlaying(false);
    setBarIndex(0);
  }

  function togglePlay(): void {
    if (playing) {
      stop();
    } else {
      setBarIndex(0);
      setPlaying(true);
    }
  }

  function stepBar(step: number): void {
    setBarIndex(index => (index + step + song.bars.length) % song.bars.length);
  }

  return {
    playing,
    barIndex,
    nextBarIndex: (barIndex + 1) % song.bars.length,
    togglePlay,
    stop,
    stepBar,
  };
}
