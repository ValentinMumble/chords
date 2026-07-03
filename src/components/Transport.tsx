import {useState} from 'react';
import type {Meter, PickPattern, StrumPattern as Pattern} from '../songs';
import type {SongPlayback} from '../hooks/useSongPlayback';
import {isSoundLoaded, preloadSound, whenSoundReady} from '../audio';
import {SoundPicker} from './SoundPicker';
import {Metronome} from './Metronome';
import {StrumPattern} from './StrumPattern';
import styles from './Transport.module.css';

interface TransportProps {
  playback: SongPlayback;
  pattern: Pattern;
  pick?: PickPattern;
  meter: Meter;
  bpm: number;
  recommendedBpm: number;
  onBpmChange: (bpm: number) => void;
  sound: string;
  onSoundChange: (sound: string) => void;
}

const BPM_MIN = 40;
const BPM_MAX = 160;
const BPM_STEP = 2;

// The controls you set once and then leave alone: play, tempo, sound, and the
// strum/pick reference — tucked under the chord stage they drive.
export function Transport({
  playback,
  pattern,
  pick,
  meter,
  bpm,
  recommendedBpm,
  onBpmChange,
  sound,
  onSoundChange,
}: TransportProps) {
  const {playing, togglePlay} = playback;
  const [tuning, setTuning] = useState(false);

  function handlePlay(): void {
    const starting = !playing;
    togglePlay();
    if (starting && !isSoundLoaded()) {
      setTuning(true);
      whenSoundReady().then(() => setTuning(false));
    }
  }

  return (
    <div className={styles.transport}>
      <div className={styles.row}>
        <button
          className={styles.playBtn}
          aria-label={playing ? 'Stop' : 'Play'}
          onPointerEnter={preloadSound}
          onClick={handlePlay}
        >
          {playing ? (
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
              <rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
              <path d="M3.5 1.8 L13.5 8 L3.5 14.2 Z" fill="currentColor" />
            </svg>
          )}
        </button>
        <div className={styles.tempo}>
          <Metronome
            key={playing ? 'play' : 'idle'}
            playing={playing}
            beatSeconds={60 / bpm}
            bpm={bpm}
            min={BPM_MIN}
            max={BPM_MAX}
            step={BPM_STEP}
            onBpmChange={onBpmChange}
          />
          <div className={styles.tempoText}>
            <span>Tempo</span>
            <output>{bpm} bpm</output>
          </div>
          <button
            className={styles.resetTempo}
            aria-label="Reset to recommended tempo"
            title="Reset to recommended tempo"
            disabled={bpm === recommendedBpm}
            onClick={() => onBpmChange(recommendedBpm)}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>
        {tuning && <span className={styles.tuningHint}>tuning up…</span>}
        <SoundPicker sound={sound} onChange={onSoundChange} />
      </div>
      <StrumPattern
        pattern={pattern}
        pick={pick}
        playing={playing}
        subdivision={meter.subdivision}
        barSeconds={(meter.beats * 60) / bpm}
      />
    </div>
  );
}
