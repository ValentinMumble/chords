import type {CSSProperties} from 'react';
import {useState} from 'react';
import {FINGER_COLORS} from './chords';
import {arpeggio, strum} from './audio';
import {Exercises} from './components/Exercises';
import {Scales} from './components/Scales';
import {Fleet} from './components/Fleet';
import {Tuner} from './components/Tuner';
import {SegmentedToggle} from './components/SegmentedToggle';
import {SongsView} from './components/SongsView';
import {TUNING} from './tuning';
import {MODES} from './modes';
import {useAudioUnlock} from './hooks/useAudioUnlock';
import {useKeyboardShortcuts} from './hooks/useKeyboardShortcuts';
import {useModeRoute} from './hooks/useModeRoute';
import {useSongs} from './hooks/useSongs';
import styles from './App.module.css';

export default function App() {
  const songs = useSongs();
  // Which Practice exercise is currently playing (its storageKey), so the space
  // bar can stop it. Owned here because the keyboard handler lives in App.
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [mode, switchMode] = useModeRoute(next => {
    if (next !== 'songs') songs.playback.stop();
    if (next !== 'exercises') setActiveExercise(null);
  });
  useAudioUnlock();

  useKeyboardShortcuts({
    onArrow: songs.step,
    onPlayPause: () => {
      if (mode === 'songs') songs.playback.togglePlay();
      else if (mode === 'exercises' && activeExercise) setActiveExercise(null);
      else strum(songs.chord);
    },
    onStrum: () => strum(songs.chord),
    onArpeggio: () => arpeggio(songs.chord),
  });

  return (
    <main>
      <div className={styles.topbar}>
        <h1>
          {/* The logo takes you back to the top, like tapping an iOS title bar. */}
          <button className={styles.logo} onClick={() => window.scrollTo(0, 0)}>
            🎸 Chords
          </button>
        </h1>
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
      ) : mode === 'tuner' ? (
        <Tuner />
      ) : mode === 'gear' ? (
        <Fleet />
      ) : (
        <SongsView songs={songs} />
      )}
      {/* Phone portrait: the sections move to a floating glass tab bar, like an
          iOS app. Hidden (CSS) wherever the top switcher is shown. */}
      <nav
        className={styles.tabBar}
        aria-label="Sections"
        style={
          {
            '--count': MODES.length,
            '--index': MODES.findIndex(item => item.key === mode),
          } as CSSProperties
        }
      >
        {/* The glass lens under the current tab: it slides from one tab to the next. */}
        <span className={styles.tabGlow} aria-hidden="true" />
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
