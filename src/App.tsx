import {CHORDS, CHORDS_BY_NAME, FILTER_TYPES, getChord} from './chords';
import {SONGS} from './songs';
import {arpeggio, strum} from './audio';
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

  const song = SONGS[songIndex] ?? SONGS[0];
  const chord = getChord(chordName) ?? CHORDS_BY_NAME.C;
  const activeFilter = FILTER_TYPES.some(type => type.key === filter) ? filter : 'all';
  const visible = activeFilter === 'all' ? CHORDS : CHORDS.filter(entry => entry.type === activeFilter);

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
      <ChordFilters filter={activeFilter} onChange={setFilter} />
      <ChordGrid chords={visible} selected={chord.name} onSelect={selectChord} />
      <div className="viewer">
        <Fretboard chord={chord} />
        {nextChordName && <NextUpCard chordName={nextChordName} />}
        <ChordDetails chord={chord} />
      </div>
      <h2>Practice songs</h2>
      <SongPlayer
        songs={SONGS}
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
