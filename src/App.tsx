import {useEffect} from 'react';
import {
  CHORDS,
  CHORDS_BY_NAME,
  FILTER_TYPES,
  frenchName,
  getChord,
  isBarreChord,
  type ChordFilter,
  type ShapeFilter,
} from './chords';
import {SONGS, songVersion, type SongLevel} from './songs';
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
  const [shape, setShape] = usePersistedState<string>('chords:shape', 'any');
  const [chordName, setChordName] = usePersistedState('chords:chord', 'C');
  const [songIndex, setSongIndex] = usePersistedState('chords:song', 0);
  const [bpm, setBpm] = usePersistedState('chords:bpm', SONGS[0].easy.bpm);
  const [sound, setSound] = usePersistedState<string>('chords:sound', GUITAR_SOUNDS[0].id);
  const [level, setLevel] = usePersistedState<string>('chords:level', 'easy');

  const song = SONGS[songIndex] ?? SONGS[0];
  const activeLevel: SongLevel = level === 'advanced' ? 'advanced' : 'easy';
  const version = songVersion(song, activeLevel);
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

  const playback = useSongPlayback(version.bars, bpm, version.beatsPerBar ?? 4, setChordName);
  const nextChordName = playback.playing ? version.bars[playback.nextBarIndex] : null;

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
    setBpm(songVersion(SONGS[index], activeLevel).bpm);
    setSound(SONGS[index].sound);
  }

  function changeLevel(next: SongLevel): void {
    playback.stop();
    setLevel(next);
    setBpm(songVersion(song, next).bpm);
  }

  useKeyboardShortcuts({
    onArrow: step => {
      if (playback.playing) {
        playback.stepBar(step);
      } else if (visible.length > 0) {
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
        level={activeLevel}
        onLevelChange={changeLevel}
        bars={version.bars}
        bpm={bpm}
        onBpmChange={setBpm}
        sound={activeSound.id}
        onSoundChange={setSound}
        playback={playback}
      />
      <div className="viewer chord-viewer">
        <div className="chord-heading">
          <div>
            <p className="chord-title">{chord.name}</p>
            <p className="chord-sub">{frenchName(chord.name)}</p>
          </div>
          <div className="actions">
            <button onClick={() => strum(chord)}>&#9654;&#xFE0E; Strum</button>
            <button onClick={() => arpeggio(chord)}>&#9836;&#xFE0E; One by one</button>
          </div>
        </div>
        <div className="chord-row">
          <Fretboard chord={chord} />
          {nextChordName && <NextUpCard chordName={nextChordName} />}
          <ChordDetails />
        </div>
      </div>
      <h2>Chord library</h2>
      <ChordFilters filter={activeFilter} onFilterChange={setFilter} shape={activeShape} onShapeChange={setShape} />
      {visible.length > 0 ? (
        <ChordGrid chords={visible} selected={chord.name} onSelect={selectChord} />
      ) : (
        <p className="empty-grid">No chords match these filters.</p>
      )}
    </main>
  );
}
