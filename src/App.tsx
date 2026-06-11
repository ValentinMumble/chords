import {CHORDS, CHORDS_BY_NAME} from './chords';
import {SONGS} from './songs';
import {strumChord} from './audio';
import {Board} from './components/Board';
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

  const song = SONGS[songIndex] ?? SONGS[0];
  const chord = CHORDS_BY_NAME[chordName] ?? CHORDS_BY_NAME.C;
  const visible = filter === 'all' ? CHORDS : CHORDS.filter(entry => entry.type === filter);

  const playback = useSongPlayback(song, bpm, setChordName);
  const nextChordName = playback.playing ? song.bars[playback.nextBarIndex] : null;

  function selectChord(name: string): void {
    setChordName(name);
    strumChord(CHORDS_BY_NAME[name], 0.045);
  }

  function changeSong(index: number): void {
    playback.stop();
    setSongIndex(index);
    setBpm(SONGS[index].bpm);
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
    onStrum: () => strumChord(chord, 0.045),
    onArpeggio: () => strumChord(chord, 0.35),
  });

  return (
    <main>
      <h1>Chords 🎸</h1>
      <ChordFilters filter={filter} onChange={setFilter} />
      <ChordGrid chords={visible} selected={chord.name} onSelect={selectChord} />
      <div className="viewer">
        <Board chord={chord} />
        {nextChordName && <NextUpCard chordName={nextChordName} />}
        <ChordDetails chord={chord} />
      </div>
      <h2>Practice songs</h2>
      <SongPlayer
        song={song}
        songIndex={songIndex}
        onSongChange={changeSong}
        bpm={bpm}
        onBpmChange={setBpm}
        playback={playback}
      />
    </main>
  );
}
