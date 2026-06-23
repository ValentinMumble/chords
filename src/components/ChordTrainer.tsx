import {useEffect, useState} from 'react';
import type {Chord} from '../types';
import {TRAINER_PROGRESSIONS} from '../songs';
import {useChordTrainer} from '../hooks/useChordTrainer';
import {usePersistedState} from '../hooks/usePersistedState';

interface ChordTrainerProps {
  chords: readonly Chord[];
  onPick: (name: string) => void;
}

const MIN_SECONDS = 1;
const MAX_SECONDS = 8;
const LIBRARY = 'library';

export function ChordTrainer({chords, onPick}: ChordTrainerProps) {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = usePersistedState('chords:trainer-seconds', 4);
  const [source, setSource] = usePersistedState<string>('chords:trainer-source', LIBRARY);

  const progression = TRAINER_PROGRESSIONS.find(entry => entry.name === source);
  const ordered = progression !== undefined;
  const names = progression ? [...progression.chords] : chords.map(chord => chord.name);
  const running = active && names.length > 0;
  const tick = useChordTrainer(names, seconds, running, ordered, source, onPick);

  // Tick a whole-second countdown to the next chord, resetting on each pick.
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!running) return;
    setRemaining(seconds);
    const id = window.setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, tick, seconds]);

  return (
    <div className="viewer trainer">
      <div className="trainer-controls">
        <button
          className="trainer-toggle"
          aria-label={active ? 'Stop trainer' : 'Start trainer'}
          onClick={() => setActive(value => !value)}
        >
          {active ? (
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M3.5 1.8 L13.5 8 L3.5 14.2 Z" fill="currentColor" />
            </svg>
          )}
        </button>
        <select aria-label="What to drill" value={source} onChange={event => setSource(event.target.value)}>
          <option value={LIBRARY}>Random (library)</option>
          {TRAINER_PROGRESSIONS.map(entry => (
            <option key={entry.name} value={entry.name}>
              {entry.name}
            </option>
          ))}
        </select>
        <div className="tempo">
          <label htmlFor="trainer-secs">Change every</label>
          <input
            type="range"
            id="trainer-secs"
            min={MIN_SECONDS}
            max={MAX_SECONDS}
            step={1}
            value={seconds}
            onChange={event => setSeconds(Number(event.target.value))}
          />
          <output>{seconds}s</output>
        </div>
      </div>
      {running && (
        <div className="trainer-countdown">
          <span className="countdown-num">{remaining}</span>
          <div className="countdown-track">
            <span key={tick} style={{animationDuration: `${seconds}s`}} />
          </div>
        </div>
      )}
      <p className="song-hint">
        {progression
          ? `Walks ${source} in order — practice the changes before the bar runs out.`
          : `Flashes a random chord from the library filter below (${names.length} chord${names.length === 1 ? '' : 's'}). Narrow the filters to drill a specific set.`}
      </p>
    </div>
  );
}
