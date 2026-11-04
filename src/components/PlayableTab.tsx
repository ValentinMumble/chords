import {useEffect, useMemo, useState} from 'react';
import {ensureAudio} from '../audio';
import {usePersistedState} from '../hooks/usePersistedState';
import {useTabPlayback} from '../hooks/useTabPlayback';
import {addPractice} from '../practiceLog';
import type {Col} from '../tab';
import {TabBlock} from './TabStaff';
import styles from './PlayableTab.module.css';

const MAX_TEMPO = 220;
// The speed trainer's step, added each time the loop comes round.
const TEMPO_STEP = 5;
// One bar of clicks before the first note.
const COUNT_IN_BEATS = 4;
// Shorter runs (a tap to hear a phrase) don't count as practice.
const MIN_LOGGED_SECONDS = 3;

// A tab with transport: play/stop, a speed slider, and practice tools: a count-
// in, a loop over chosen bars and a speed trainer. Columns play at the given
// subdivision and loop; the playhead (from useTabPlayback) is fed back into the
// staves as a highlighted column. Only one PlayableTab sounds at a time —
// `activeTab`/`onActivate` are lifted to the parent so starting one stops the
// rest (and the space bar can stop the active one). Time spent playing goes to
// the practice log under `logId`.
export function PlayableTab({
  bars,
  storageKey,
  activeTab,
  onActivate,
  logId,
  defaultTempo = 120,
  minTempo = 40,
  subdiv = 1,
  evenNotes = false,
  showRhythm = false,
  firstBar,
  ...blockProps
}: {
  bars: Col[][];
  storageKey: string;
  activeTab: string | null;
  onActivate: (key: string | null) => void;
  logId?: string;
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
  const [countIn, setCountIn] = usePersistedState('practice:countIn', false);
  const [speedTrainer, setSpeedTrainer] = useState(false);
  const [loopBars, setLoopBars] = usePersistedState<[number, number]>(`tab:${storageKey}:loop`, [0, bars.length - 1]);

  // The chosen bars, kept inside the tab if it got shorter since they were saved.
  const lastBar = bars.length - 1;
  const fromBar = Math.min(Math.max(loopBars[0], 0), lastBar);
  const toBar = Math.min(Math.max(loopBars[1], fromBar), lastBar);
  const range = useMemo(() => {
    const starts = bars.map((_, index) => bars.slice(0, index).reduce((sum, bar) => sum + bar.length, 0));
    return [starts[fromBar], starts[toBar] + bars[toBar].length] as const;
  }, [bars, fromBar, toBar]);

  const {playing, column, countBeat, toggle, stop} = useTabPlayback(columns, tempo, {
    subdiv,
    evenNotes,
    range,
    countIn: countIn ? COUNT_IN_BEATS : 0,
    onLoop: speedTrainer ? () => setTempo(value => Math.min(MAX_TEMPO, value + TEMPO_STEP)) : undefined,
  });

  // Stop this tab if another became the active one while it was playing.
  useEffect(() => {
    if (playing && activeTab !== storageKey) stop();
  }, [activeTab, playing, storageKey, stop]);

  // Log the time from Play to Stop (or to leaving the page).
  useEffect(() => {
    if (!playing || !logId) return;
    const startedAt = performance.now();
    return () => {
      const seconds = Math.round((performance.now() - startedAt) / 1000);
      if (seconds >= MIN_LOGGED_SECONDS) addPractice(logId, seconds);
    };
  }, [playing, logId]);

  function handleToggle(): void {
    ensureAudio(); // resume the audio context within the tap (needed on iOS)
    onActivate(playing ? null : storageKey);
    toggle();
  }

  const barLabel = (index: number) => String((firstBar ?? 1) + index);

  return (
    <div className={styles.playable}>
      <div className={styles.controls}>
        <button
          className={`tab-play${playing ? ' playing' : ''}`}
          onClick={handleToggle}
          aria-label={playing ? 'Stop' : 'Play'}
        >
          <span aria-hidden="true">{playing ? '◼' : '▶'}</span>
          {countBeat ? `${countBeat}…` : playing ? 'Stop' : 'Play'}
        </button>
        <label className={styles.tempo}>
          <input
            type="range"
            min={minTempo}
            max={MAX_TEMPO}
            step={TEMPO_STEP}
            value={tempo}
            onChange={event => setTempo(Number(event.target.value))}
          />
          <span className={styles.tempoValue}>{tempo} bpm</span>
        </label>
      </div>
      <div className={styles.options}>
        <button className={styles.chip} aria-pressed={countIn} onClick={() => setCountIn(value => !value)}>
          Count-in
        </button>
        <button className={styles.chip} aria-pressed={speedTrainer} onClick={() => setSpeedTrainer(value => !value)}>
          +{TEMPO_STEP} bpm each loop
        </button>
        {bars.length > 1 && (
          <span className={styles.loop}>
            Bars
            <select
              aria-label="Loop from bar"
              value={fromBar}
              onChange={event => {
                const from = Number(event.target.value);
                setLoopBars([from, Math.max(from, toBar)]);
              }}
            >
              {bars.map((_, index) => (
                <option key={index} value={index}>
                  {barLabel(index)}
                </option>
              ))}
            </select>
            to
            <select
              aria-label="Loop to bar"
              value={toBar}
              onChange={event => {
                const to = Number(event.target.value);
                setLoopBars([Math.min(fromBar, to), to]);
              }}
            >
              {bars.map((_, index) => (
                <option key={index} value={index}>
                  {barLabel(index)}
                </option>
              ))}
            </select>
          </span>
        )}
      </div>
      <TabBlock
        bars={bars}
        playingCol={playing ? column : -1}
        subdiv={subdiv}
        showRhythm={showRhythm}
        firstBar={firstBar}
        {...blockProps}
      />
    </div>
  );
}
