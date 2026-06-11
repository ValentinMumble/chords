import {useEffect} from 'react';
import {CHORDS, CHORDS_BY_NAME, FILTER_TYPES, getChord, isBarreChord} from './chords';
import {SONGS} from './songs';
import {arpeggio, GUITAR_SOUNDS, setGuitarSound, strum} from './audio';
import {Fretboard} from './components/Fretboard';
import {ChordFilters} from './components/ChordFilters';
import {ChordGrid} from './components/ChordGrid';
import {ChordDetails} from './components/ChordDetails';
import {NextUpCard} from './components/NextUpCard';
import {SongPlayer} from './components/SongPlayer';
import {useSongPlayback} from './hooks/useSongPlayback';
import {useKeyboardShortcuts} from './hooks/useKeyboardShortcuts';
import {usePersistedState} from './hooks/usePersistedState';

export default function App() {
  const [filter, setFilter] = usePersistedState('chords:filter', 'all');
  const [chordName, setChordName] = usePersistedState('chords:chord', 'C');
  const [songIndex, setSongIndex] = usePersistedState('chords:song', 0);
  const [bpm, setBpm] = usePersistedState('chords:bpm', SONGS[0].bpm);
  const [sound, setSound] = usePersistedState<string>('chords:sound', GUITAR_SOUNDS[0].id);

  const song = SONGS[songIndex] ?? SONGS[0];
  const chord = getChord(chordName) ?? CHORDS_BY_NAME.C;
  const activeFilter = FILTER_TYPES.some(type => type.key === filter) ? filter : 'all';
  const visible = CHORDS.filter(entry => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'barre') return isBarreChord(entry);
    return entry.type === activeFilter;
  });

  const activeSound = GUITAR_SOUNDS.find(entry => entry.id === sound) ?? GUITAR_SOUNDS[0];
  useEffect(() => {
    setGuitarSound(activeSound.id);
  }, [activeSound.id]);

  const playback = useSongPlayback(song, bpm, setChordName);
  const nextChordName = playback.playing ? song.bars[playback.nextBarIndex] : null;

  function selectChord(name: string): void {
    const next = getChord(name);
    if (!next) return;
    playback.stop();
    setChordName(name);
    strum(next);
  }

  function changeSong(index: number): void {
    playback.stop();
    setSongIndex(index);
    setBpm(SONGS[index].bpm);
    setSound(SONGS[index].sound);
  }

  useKeyboardShortcuts({
    onArrow: step => {
      if (playback.playing) {
        playback.stepBar(step);
      } else {
        const index = visible.findIndex(entry => entry.name === chord.name);
        selectChord(visible[(index + step + visible.length) % visible.length].name);
      }
    },
    onStrum: () => strum(chord),
    onArpeggio: () => arpeggio(chord),
  });

  return (
    <main>
      <h1>Chords 🎸</h1>
      <SongPlayer
        songs={SONGS}
        song={song}
        songIndex={songIndex}
        onSongChange={changeSong}
        bpm={bpm}
        onBpmChange={setBpm}
        sound={activeSound.id}
        onSoundChange={setSound}
        playback={playback}
      />
      <div className="viewer">
        <Fretboard chord={chord} />
        {nextChordName && <NextUpCard chordName={nextChordName} />}
        <ChordDetails chord={chord} />
      </div>
      <h2>Chord library</h2>
      <ChordFilters filter={activeFilter} onChange={setFilter} />
      <ChordGrid chords={visible} selected={chord.name} onSelect={selectChord} />
    </main>
  );
}
