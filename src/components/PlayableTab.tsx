import {useEffect, useMemo} from 'react';
import {ensureAudio} from '../audio';
import {usePersistedState} from '../hooks/usePersistedState';
import {useTabPlayback} from '../hooks/useTabPlayback';
import type {Col} from '../tab';
import {TabBlock} from './TabStaff';
import styles from './PlayableTab.module.css';

// A tab with transport: a play/stop button and a speed slider. Columns play at
// the given subdivision and loop; the playhead (from useTabPlayback) is fed back
// into the staves as a highlighted column. Only one PlayableTab sounds at a time
// — `activeTab`/`onActivate` are lifted to the parent so starting one stops the
// rest (and the space bar can stop the active one).
export function PlayableTab({
  bars,
  storageKey,
  activeTab,
  onActivate,
  defaultTempo = 120,
  minTempo = 40,
  subdiv = 1,
  evenNotes = false,
  showRhythm = false,
  ...blockProps
}: {
  bars: Col[][];
  storageKey: string;
  activeTab: string | null;
  onActivate: (key: string | null) => void;
  defaultTempo?: number;
  minTempo?: number;
  subdiv?: number;
  evenNotes?: boolean;
  showRhythm?: boolean;
  caption?: string;
  barsPerRow?: number;
  chords?: (string | null)[];
  firstBar?: number;
}) {
  const columns = useMemo(() => bars.flat(), [bars]);
  const [tempo, setTempo] = usePersistedState(`tab:${storageKey}:tempo`, defaultTempo);
  const {playing, column, toggle, stop} = useTabPlayback(columns, tempo, subdiv, evenNotes);

  // Stop this tab if another became the active one while it was playing.
  useEffect(() => {
    if (playing && activeTab !== storageKey) stop();
  }, [activeTab, playing, storageKey, stop]);

  function handleToggle(): void {
    ensureAudio(); // resume the audio context within the tap (needed on iOS)
    onActivate(playing ? null : storageKey);
    toggle();
  }

  return (
    <div className={styles.playable}>
      <div className={styles.controls}>
        <button
          className={`tab-play${playing ? ' playing' : ''}`}
          onClick={handleToggle}
          aria-label={playing ? 'Stop' : 'Play'}
        >
          <span aria-hidden="true">{playing ? '◼' : '▶'}</span>
          {playing ? 'Stop' : 'Play'}
        </button>
        <label className={styles.tempo}>
          <input
            type="range"
            min={minTempo}
            max={220}
            step={5}
            value={tempo}
            onChange={event => setTempo(Number(event.target.value))}
          />
          <span className={styles.tempoValue}>{tempo} bpm</span>
        </label>
      </div>
      <TabBlock
        bars={bars}
        playingCol={playing ? column : -1}
        subdiv={subdiv}
        showRhythm={showRhythm}
        {...blockProps}
      />
    </div>
  );
}
