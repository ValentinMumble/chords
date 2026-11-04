import {useEffect, useRef} from 'react';
import {
  CHORDS,
  CHORDS_BY_NAME,
  FILTER_TYPES,
  getChord,
  isBarreChord,
  type ChordFilter,
  type ShapeFilter,
} from '../chords';
import {FOUR_FOUR, SONGS} from '../songs';
import {GUITAR_SOUNDS, setGuitarSound, strum} from '../audio';
import {usePersistedState} from './usePersistedState';
import {useSongPlayback} from './useSongPlayback';

// Everything the Songs section needs: the chosen song, chord, tempo and sound
// (saved in the browser), the play-along, and the chord library filters. App
// owns it (the keyboard shortcuts use it too) and SongsView draws it.
export function useSongs() {
  const [filter, setFilter] = usePersistedState('chords:filter', 'all');
  const [shape, setShape] = usePersistedState<string>('chords:shape', 'any');
  const [chordName, setChordName] = usePersistedState('chords:chord', 'C');
  const [songIndex, setSongIndex] = usePersistedState('chords:song', 0);
  const [bpm, setBpm] = usePersistedState('chords:bpm', SONGS[0].version.bpm);
  const [sound, setSound] = usePersistedState<string>('chords:sound', GUITAR_SOUNDS[0].id);

  const song = SONGS[songIndex] ?? SONGS[0];
  const version = song.version;
  const meter = version.meter ?? FOUR_FOUR;
  const chord = getChord(chordName) ?? CHORDS_BY_NAME.C;
  const activeFilter = (FILTER_TYPES.some(type => type.key === filter) ? filter : 'all') as ChordFilter;
  const activeShape: ShapeFilter = shape === 'open' || shape === 'barre' ? shape : 'any';
  const visible = CHORDS.filter(entry => {
    const typeMatches = activeFilter === 'all' || entry.type === activeFilter;
    const shapeMatches = activeShape === 'any' || (activeShape === 'barre') === isBarreChord(entry);
    return typeMatches && shapeMatches;
  });

  const activeSound = GUITAR_SOUNDS.find(entry => entry.id === sound) ?? GUITAR_SOUNDS[0];
  useEffect(() => {
    setGuitarSound(activeSound.id);
  }, [activeSound.id]);

  const playback = useSongPlayback(version.bars, bpm, version.pattern, version.pick, meter.subdivision, setChordName);
  // The next chord in the song progression, shown beside the diagram whether or
  // not playback is running, so you can see what's coming.
  const nextChordName = version.bars[playback.nextBarIndex].name;

  // Brief pulse on the diagram whenever the chord changes (a struck-chord cue).
  const diagramRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const element = diagramRef.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    element.animate([{transform: 'scale(1)'}, {transform: 'scale(1.03)'}, {transform: 'scale(1)'}], {
      duration: 200,
      easing: 'ease-out',
    });
  }, [chord.name]);

  function selectChord(name: string): void {
    const next = getChord(name);
    if (!next) return;
    playback.stop();
    setChordName(name);
    strum(next);
  }

  function selectBar(index: number, extend: boolean): void {
    // Shift/cmd-click sets a practice loop from the current position to here.
    if (extend) {
      playback.setLoop(playback.barIndex, index);
      return;
    }
    // A plain click clears any loop and moves the progression position either
    // way, so the next-up card tracks the selected chord even while stopped.
    playback.clearLoop();
    playback.goToBar(index);
    if (playback.playing) return;
    const next = getChord(version.bars[index].name);
    if (!next) return;
    setChordName(next.name);
    strum(next);
  }

  function changeSong(index: number): void {
    playback.stop();
    setSongIndex(index);
    const nextVersion = SONGS[index].version;
    setBpm(nextVersion.bpm);
    setSound(SONGS[index].sound);
    // Show the new song's first chord right away, not only once playback starts.
    setChordName(nextVersion.bars[0].name);
  }

  // Arrow keys: jump bars while playing, otherwise step through the library.
  function step(direction: number): void {
    if (playback.playing) {
      playback.stepBar(direction);
    } else if (visible.length > 0) {
      const index = visible.findIndex(entry => entry.name === chord.name);
      selectChord(visible[(index + direction + visible.length) % visible.length].name);
    }
  }

  return {
    song,
    songIndex,
    version,
    meter,
    chord,
    bpm,
    setBpm,
    activeSound,
    setSound,
    playback,
    nextChordName,
    diagramRef,
    activeFilter,
    setFilter,
    activeShape,
    setShape,
    visible,
    selectChord,
    selectBar,
    changeSong,
    step,
  };
}

export type SongsState = ReturnType<typeof useSongs>;
