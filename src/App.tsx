import type {ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';
import {
  CHORDS,
  CHORDS_BY_NAME,
  FILTER_TYPES,
  FINGER_COLORS,
  frenchName,
  getChord,
  isBarreChord,
  type ChordFilter,
  type ShapeFilter,
} from './chords';
import {FOUR_FOUR, SONGS} from './songs';
import {arpeggio, ensureAudio, GUITAR_SOUNDS, setGuitarSound, strum} from './audio';
import {Fretboard} from './components/Fretboard';
import {ChordActions} from './components/ChordActions';
import {ChordFilters} from './components/ChordFilters';
import {ChordGrid} from './components/ChordGrid';
import {Exercises} from './components/Exercises';
import {Scales} from './components/Scales';
import {Fleet} from './components/Fleet';
import {CapoBadge} from './components/CapoBadge';
import {KeyboardHint} from './components/KeyboardHint';
import {NextUpCard} from './components/NextUpCard';
import {SongBar} from './components/SongBar';
import {Progression} from './components/Progression';
import {SegmentedToggle} from './components/SegmentedToggle';
import {Transport} from './components/Transport';
import {TUNING} from './tuning';
import {useSongPlayback} from './hooks/useSongPlayback';
import {useKeyboardShortcuts} from './hooks/useKeyboardShortcuts';
import {usePersistedState} from './hooks/usePersistedState';
import styles from './App.module.css';

type Mode = 'songs' | 'exercises' | 'scales' | 'gear';

// Line icons for the phone tab bar, drawn in the SF Symbols spirit (24x24,
// rounded strokes, coloured by the tab's text colour).
const iconProps = {
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};
const MODES: {key: Mode; label: string; icon: ReactNode}[] = [
  {
    key: 'songs',
    label: 'Songs',
    icon: (
      <svg {...iconProps}>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </svg>
    ),
  },
  {
    key: 'exercises',
    label: 'Practice',
    icon: (
      <svg {...iconProps}>
        <path d="M8.5 3h7l4 18h-15z" />
        <path d="M12 17l4.5-9" />
        <path d="M6 14h12" />
      </svg>
    ),
  },
  {
    key: 'scales',
    label: 'Scales',
    icon: (
      <svg {...iconProps}>
        <path d="M5 20v-4M10 20v-8M15 20V8M20 20V4" strokeWidth={2.4} />
      </svg>
    ),
  },
  {
    key: 'gear',
    label: 'Gear',
    icon: (
      <svg {...iconProps}>
        <path d="M12 21c-3.2-3.1-7-8.2-7-12 0-3.4 3.1-5 7-5s7 1.6 7 5c0 3.8-3.8 8.9-7 12z" />
      </svg>
    ),
  },
];

export default function App() {
  const [filter, setFilter] = usePersistedState('chords:filter', 'all');
  const [shape, setShape] = usePersistedState<string>('chords:shape', 'any');
  const [chordName, setChordName] = usePersistedState('chords:chord', 'C');
  const [songIndex, setSongIndex] = usePersistedState('chords:song', 0);
  const [bpm, setBpm] = usePersistedState('chords:bpm', SONGS[0].version.bpm);
  const [sound, setSound] = usePersistedState<string>('chords:sound', GUITAR_SOUNDS[0].id);
  const [mode, setMode] = useState<Mode>('songs');
  // Which Practice exercise is currently playing (its storageKey), so the space
  // bar can stop it. Owned here because the keyboard handler lives in App.
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

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

  // iOS only unlocks the AudioContext when it's resumed inside a user gesture.
  // Practice playback schedules its first note in a timer (not in the click), so
  // on iPhone the context would stay suspended and nothing sounds. Resume it on
  // the first tap/key anywhere, which counts as an in-gesture unlock.
  useEffect(() => {
    const unlock = () => ensureAudio();
    window.addEventListener('pointerdown', unlock, {once: true});
    window.addEventListener('keydown', unlock, {once: true});
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const playback = useSongPlayback(version.bars, bpm, version.pattern, version.pick, meter.subdivision, setChordName);
  // The next chord in the song progression — shown beside the diagram whether
  // or not playback is running, so you can see what's coming.
  const nextChordName = version.bars[playback.nextBarIndex].name;

  // Brief pulse on the diagram whenever the chord changes (a struck-chord cue).
  const diagramRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = diagramRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.animate([{transform: 'scale(1)'}, {transform: 'scale(1.03)'}, {transform: 'scale(1)'}], {
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

  function switchMode(next: Mode): void {
    if (next !== 'songs') playback.stop();
    if (next !== 'exercises') setActiveExercise(null);
    setMode(next);
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

  useKeyboardShortcuts({
    onArrow: step => {
      if (playback.playing) {
        playback.stepBar(step);
      } else if (visible.length > 0) {
        const index = visible.findIndex(entry => entry.name === chord.name);
        selectChord(visible[(index + step + visible.length) % visible.length].name);
      }
    },
    onPlayPause: () => {
      if (mode === 'songs') playback.togglePlay();
      else if (mode === 'exercises' && activeExercise) setActiveExercise(null);
      else strum(chord);
    },
    onStrum: () => strum(chord),
    onArpeggio: () => arpeggio(chord),
  });

  return (
    <main>
      <div className={styles.topbar}>
        <h1>🎸 Chords</h1>
        <div className={styles.legends}>
          <div className={styles.fingerLegend}>
            <span className={styles.legendLabel}>Fingers</span>
            {[1, 2, 3, 4].map(finger => (
              <span key={finger} className={styles.legendDot} style={{background: FINGER_COLORS[finger]}}>
                {finger}
              </span>
            ))}
          </div>
          <div className={styles.stringLegend} aria-label="String names, low to high">
            <span className={styles.legendLabel}>Strings</span>
            {TUNING.map((string, index) => (
              <span key={index} className={styles.stringItem}>
                <span className={styles.stringEn}>{string.en}</span>
                <span className={styles.stringFr}>{string.fr}</span>
              </span>
            ))}
          </div>
        </div>
        <SegmentedToggle
          className={styles.modeToggle}
          ariaLabel="Mode"
          items={MODES}
          value={mode}
          onChange={switchMode}
        />
      </div>
      {mode === 'exercises' ? (
        <Exercises activeTab={activeExercise} onActivate={setActiveExercise} />
      ) : mode === 'scales' ? (
        <Scales />
      ) : mode === 'gear' ? (
        <Fleet />
      ) : (
        <>
          <SongBar songs={SONGS} songIndex={songIndex} onSongChange={changeSong} />
          <div className={styles.player}>
            <Transport
              playback={playback}
              pattern={version.pattern}
              pick={version.pick}
              meter={meter}
              bpm={bpm}
              recommendedBpm={version.bpm}
              onBpmChange={setBpm}
              sound={activeSound.id}
              onSoundChange={setSound}
            />
            <section className={styles.stage}>
              <div className={styles.chordHeader}>
                <div>
                  <p className={styles.chordTitle}>{chord.name}</p>
                  <p className={styles.chordSub}>{frenchName(chord.name)}</p>
                </div>
                {song.capo ? <CapoBadge fret={song.capo} /> : null}
                <ChordActions chord={chord} />
              </div>
              <div className={styles.chordDiagrams}>
                <div className={styles.diagramWrap} ref={diagramRef}>
                  <Fretboard chord={chord} />
                </div>
                <NextUpCard chordName={nextChordName} />
              </div>
              <Progression bars={version.bars} meter={meter} playback={playback} onBarSelect={selectBar} />
            </section>
          </div>
          <h2>Chord library</h2>
          <ChordFilters filter={activeFilter} onFilterChange={setFilter} shape={activeShape} onShapeChange={setShape} />
          {visible.length > 0 ? (
            <ChordGrid chords={visible} selected={chord.name} onSelect={selectChord} />
          ) : (
            <p className={styles.emptyGrid}>No chords match these filters.</p>
          )}
          <KeyboardHint />
        </>
      )}
      {/* Phone portrait: the sections move to a floating glass tab bar, like an
          iOS app. Hidden (CSS) wherever the top switcher is shown. */}
      <nav className={styles.tabBar} aria-label="Sections">
        {MODES.map(item => (
          <button
            key={item.key}
            className={`${styles.tab}${item.key === mode ? ` ${styles.tabActive}` : ''}`}
            aria-current={item.key === mode ? 'page' : undefined}
            onClick={() => switchMode(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
