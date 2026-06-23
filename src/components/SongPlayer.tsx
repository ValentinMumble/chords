import {useState} from 'react';
import type {Bar, Meter, Song, SongLevel, StrumPattern as Pattern} from '../songs';
import type {SongPlayback} from '../hooks/useSongPlayback';
import {isSoundLoaded, preloadSound, whenSoundReady} from '../audio';
import {SoundPicker} from './SoundPicker';
import {Metronome} from './Metronome';
import {StrumPattern} from './StrumPattern';

interface SongPlayerProps {
  songs: readonly Song[];
  song: Song;
  songIndex: number;
  onSongChange: (index: number) => void;
  level: SongLevel;
  onLevelChange: (level: SongLevel) => void;
  bars: readonly Bar[];
  pattern: Pattern;
  meter: Meter;
  onBarSelect: (index: number) => void;
  bpm: number;
  recommendedBpm: number;
  onBpmChange: (bpm: number) => void;
  sound: string;
  onSoundChange: (sound: string) => void;
  playback: SongPlayback;
}

const BPM_MIN = 40;
const BPM_MAX = 160;
const BPM_STEP = 2;

// Chord length as bars, given the meter's beats per bar.
function barLength(beats: number, beatsPerBar: number): string {
  const bars = beats / beatsPerBar;
  if (bars === 1) return '1 bar';
  if (bars === 0.5) return '½ bar';
  return `${bars} bars`;
}

export function SongPlayer({
  songs,
  song,
  songIndex,
  onSongChange,
  level,
  onLevelChange,
  bars,
  pattern,
  meter,
  onBarSelect,
  bpm,
  recommendedBpm,
  onBpmChange,
  sound,
  onSoundChange,
  playback,
}: SongPlayerProps) {
  const {playing, barIndex, nextBarIndex, togglePlay} = playback;
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
    <div className="viewer song-player">
      <button
        className="play-btn"
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
      <div className="song-controls">
        <div className="song-row">
          <select
            className="song-select"
            aria-label="Choose a song"
            value={songIndex}
            onChange={event => onSongChange(Number(event.target.value))}
          >
            {songs.map((entry, index) => (
              <option key={entry.name} value={index}>
                {entry.name}
              </option>
            ))}
          </select>
          {song.advanced && (
            <div className="level-toggle" role="group" aria-label="Difficulty">
              <span
                className="level-indicator"
                style={{transform: level === 'advanced' ? 'translateX(100%)' : 'translateX(0)'}}
                aria-hidden="true"
              />
              <button className={level === 'easy' ? 'active' : ''} onClick={() => onLevelChange('easy')}>
                Easy
              </button>
              <button className={level === 'advanced' ? 'active' : ''} onClick={() => onLevelChange('advanced')}>
                Advanced
              </button>
            </div>
          )}
          {tuning && <span className="tuning-hint">tuning up…</span>}
        </div>
        <div className="settings-row">
          <div className="tempo">
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
            <div className="tempo-text">
              <span className="tempo-label">Tempo</span>
              <output>{bpm} bpm</output>
            </div>
            <button
              className="reset-tempo"
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
          <SoundPicker sound={sound} onChange={onSoundChange} />
        </div>
      </div>
      <div className="bars" aria-label="Chord progression, one chip per chord">
        {bars.map((bar, index) => {
          const isCurrent = playing && index === barIndex;
          const isNext = playing && index === nextBarIndex && nextBarIndex !== barIndex;
          return (
            <button
              key={index}
              type="button"
              className={`bar-chip${isCurrent ? ' current' : ''}${isNext ? ' next' : ''}`}
              style={{minWidth: 46 + (bar.beats / meter.beats) * 24}}
              onClick={() => onBarSelect(index)}
              aria-label={`Play ${bar.name}`}
            >
              <span className="chip-name">{bar.name}</span>
              <span className="chip-ticks" aria-label={barLength(bar.beats, meter.beats)}>
                {Array.from({length: Math.floor(bar.beats / meter.beats)}).map((_, tick) => (
                  <span key={tick} className="tick" />
                ))}
                {bar.beats % meter.beats >= meter.beats / 2 && <span className="tick half" />}
              </span>
            </button>
          );
        })}
      </div>
      <StrumPattern
        pattern={pattern}
        playing={playing}
        subdivision={meter.subdivision}
        barSeconds={(meter.beats * 60) / bpm}
      />
    </div>
  );
}
