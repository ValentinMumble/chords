import {useState} from 'react';
import type {Chord} from '../types';
import {useChordTrainer} from '../hooks/useChordTrainer';
import {usePersistedState} from '../hooks/usePersistedState';

interface ChordTrainerProps {
  chords: readonly Chord[];
  onPick: (name: string) => void;
}

const MIN_SECONDS = 1;
const MAX_SECONDS = 8;

export function ChordTrainer({chords, onPick}: ChordTrainerProps) {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = usePersistedState('chords:trainer-seconds', 4);
  const names = chords.map(chord => chord.name);
  const tick = useChordTrainer(names, seconds, active && names.length > 0, onPick);

  return (
    <div className="viewer trainer">
      <div className="trainer-controls">
        <button
          className="trainer-toggle"
          aria-label={active ? 'Stop trainer' : 'Start trainer'}
          onClick={() => setActive(value => !value)}
        >
          {active ? (
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path d="M3.5 1.8 L13.5 8 L3.5 14.2 Z" fill="currentColor" />
            </svg>
          )}
          {active ? 'Stop' : 'Start'}
        </button>
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
      {active && names.length > 0 && (
        <div className="trainer-countdown">
          <span key={tick} style={{animationDuration: `${seconds}s`}} />
        </div>
      )}
      <p className="song-hint">
        Flashes a random chord from the library filter below ({names.length} chord{names.length === 1 ? '' : 's'}).
        Practice switching to each shape before the bar runs out — narrow the filters to drill a specific set.
      </p>
    </div>
  );
}
