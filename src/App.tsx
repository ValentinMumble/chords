import { useEffect, useRef, useState } from 'react';
import { CHORDS, CHORDS_BY_NAME, FILTER_TYPES, frenchName, frenchShort } from './chords';
import { SONGS } from './songs';
import { Board, MiniDiagram } from './components/Diagram';
import { strumChord, metronomeTick, currentTime } from './audio';
import { loadState, saveState } from './state';

const saved = loadState();
const initialChord = saved.chord && CHORDS_BY_NAME[saved.chord] ? saved.chord : 'C';
const initialSong = saved.songIndex !== undefined && SONGS[saved.songIndex] ? saved.songIndex : 0;

export default function App() {
  const [filter, setFilter] = useState(saved.filter ?? 'all');
  const [chordName, setChordName] = useState(initialChord);
  const [songIndex, setSongIndex] = useState(initialSong);
  const [bpm, setBpm] = useState(saved.bpm ?? SONGS[initialSong].bpm);
  const [playing, setPlaying] = useState(false);
  const [barIndex, setBarIndex] = useState(0);

  const song = SONGS[songIndex];
  const chord = CHORDS_BY_NAME[chordName];
  const visible = filter === 'all' ? CHORDS : CHORDS.filter((entry) => entry.type === filter);
  const nextBarIndex = (barIndex + 1) % song.bars.length;
  const nextChordName = playing ? song.bars[nextBarIndex] : null;

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  useEffect(() => {
    saveState({ chord: chordName, filter, songIndex, bpm });
  }, [chordName, filter, songIndex, bpm]);

  useEffect(() => {
    if (!playing) return;
    const barChord = CHORDS_BY_NAME[song.bars[barIndex]];
    setChordName(barChord.name);
    strumChord(barChord, 0.045);
    const beat = 60 / bpmRef.current;
    for (let tick = 1; tick < 4; tick++) metronomeTick(currentTime() + 0.03 + tick * beat);
    const timer = setTimeout(() => {
      setBarIndex((index) => (index + 1) % song.bars.length);
    }, beat * 4 * 1000);
    return () => clearTimeout(timer);
  }, [playing, barIndex, song]);

  const keyStateRef = useRef({ playing, visible, chordName, song });
  keyStateRef.current = { playing, visible, chordName, song };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      const state = keyStateRef.current;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const step = event.key === 'ArrowRight' ? 1 : -1;
        if (state.playing) {
          setBarIndex((index) => (index + step + state.song.bars.length) % state.song.bars.length);
        } else {
          const index = state.visible.findIndex((entry) => entry.name === state.chordName);
          const next = state.visible[(index + step + state.visible.length) % state.visible.length];
          setChordName(next.name);
          strumChord(next, 0.045);
        }
      } else if (event.key === ' ') {
        event.preventDefault();
        strumChord(CHORDS_BY_NAME[state.chordName], 0.045);
      } else if (event.key === 'a') {
        strumChord(CHORDS_BY_NAME[state.chordName], 0.35);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function selectChord(name: string): void {
    setChordName(name);
    strumChord(CHORDS_BY_NAME[name], 0.045);
  }

  function changeSong(index: number): void {
    setPlaying(false);
    setBarIndex(0);
    setSongIndex(index);
    setBpm(SONGS[index].bpm);
  }

  function togglePlay(): void {
    if (playing) {
      setPlaying(false);
      setBarIndex(0);
    } else {
      setBarIndex(0);
      setPlaying(true);
    }
  }

  return (
    <main>
      <h1>Chords 🎸</h1>

      <div className="filters" role="group" aria-label="Filter chords by type">
        {FILTER_TYPES.map((type) => (
          <button
            key={type.key}
            className={filter === type.key ? 'active' : ''}
            onClick={() => setFilter(type.key)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="chord-grid" role="group" aria-label="Chord selection">
        {visible.map((entry) => (
          <button
            key={entry.name}
            className={entry.name === chordName ? 'active' : ''}
            onClick={() => selectChord(entry.name)}
          >
            <span>{entry.name}</span>
            <span className="fr">{frenchShort(entry.name)}</span>
          </button>
        ))}
      </div>

      <div className="viewer">
        <Board chord={chord} />
        {nextChordName && (
          <div className="next-box visible" aria-live="polite">
            <p className="next-label">Next up</p>
            <p className="next-name">{nextChordName}</p>
            <p className="next-fr">{frenchName(nextChordName)}</p>
            <MiniDiagram chord={CHORDS_BY_NAME[nextChordName]} />
          </div>
        )}
        <div className="panel">
          <p className="chord-title">{chord.name}</p>
          <p className="chord-sub">{chord.desc} · {frenchName(chord.name)}</p>
          <div className="actions">
            <button onClick={() => strumChord(chord, 0.045)}>&#9654;&#xFE0E; Strum</button>
            <button onClick={() => strumChord(chord, 0.35)}>&#9836;&#xFE0E; One by one</button>
          </div>
          <div className="help">
            <p>Vertical lines are strings, low E on the left. Numbered dots show which finger to use: 1 index, 2 middle, 3 ring, 4 pinky.</p>
            <p>An O above the nut means play the string open; an &#x2715; means don't play it. Note names appear under each string.</p>
            <p>Keyboard: <kbd>&#x2190;</kbd> <kbd>&#x2192;</kbd> to change chord (or jump bars while a song plays), <kbd>space</kbd> to strum, <kbd>a</kbd> for one by one.</p>
          </div>
        </div>
      </div>

      <h2>Practice songs</h2>
      <div className="viewer" style={{ display: 'block' }}>
        <div className="song-bar">
          <select
            aria-label="Choose a song"
            value={songIndex}
            onChange={(event) => changeSong(Number(event.target.value))}
          >
            {SONGS.map((entry, index) => (
              <option key={entry.name} value={index}>{entry.name}</option>
            ))}
          </select>
          <button onClick={togglePlay}>
            {playing ? <>&#9632;&#xFE0E; Stop</> : <>&#9654;&#xFE0E; Play</>}
          </button>
          <div className="tempo">
            <label htmlFor="song-bpm">Tempo</label>
            <input
              type="range" id="song-bpm" min={40} max={120} step={2}
              value={bpm}
              onChange={(event) => setBpm(Number(event.target.value))}
            />
            <output>{bpm} bpm</output>
          </div>
        </div>
        <div className="bars" aria-label="Chord progression, one chip per bar">
          {song.bars.map((name, index) => {
            const isCurrent = playing && index === barIndex;
            const isNext = playing && index === nextBarIndex && nextBarIndex !== barIndex;
            return (
              <div key={index} className={`bar-chip${isCurrent ? ' current' : ''}${isNext ? ' next' : ''}`}>
                {name}
              </div>
            );
          })}
        </div>
        <p className="song-hint">
          Each chip is one bar of 4 beats: a strum on beat 1, ticks on 2–4. The diagram up top follows
          the current bar, with the next chord shown beside it.
        </p>
      </div>
    </main>
  );
}
