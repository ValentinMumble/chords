import type {ChordName} from '../chords';
import type {Song, SongLevel} from '../songs';
import type {SongPlayback} from '../hooks/useSongPlayback';
import {SoundPicker} from './SoundPicker';

interface SongPlayerProps {
  songs: readonly Song[];
  song: Song;
  songIndex: number;
  onSongChange: (index: number) => void;
  level: SongLevel;
  onLevelChange: (level: SongLevel) => void;
  bars: readonly ChordName[];
  bpm: number;
  onBpmChange: (bpm: number) => void;
  sound: string;
  onSoundChange: (sound: string) => void;
  playback: SongPlayback;
}

export function SongPlayer({
  songs,
  song,
  songIndex,
  onSongChange,
  level,
  onLevelChange,
  bars,
  bpm,
  onBpmChange,
  sound,
  onSoundChange,
  playback,
}: SongPlayerProps) {
  const {playing, barIndex, nextBarIndex, togglePlay} = playback;
  return (
    <div className="viewer song-player">
      <button className="play-btn" aria-label={playing ? 'Stop' : 'Play'} onClick={togglePlay}>
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
      <div className="song-bar">
        <select
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
            <button className={level === 'easy' ? 'active' : ''} onClick={() => onLevelChange('easy')}>
              Easy
            </button>
            <button className={level === 'advanced' ? 'active' : ''} onClick={() => onLevelChange('advanced')}>
              Advanced
            </button>
          </div>
        )}
        <div className="tempo">
          <label htmlFor="song-bpm">Tempo</label>
          <input
            type="range"
            id="song-bpm"
            min={40}
            max={160}
            step={2}
            value={bpm}
            onChange={event => onBpmChange(Number(event.target.value))}
          />
          <output>{bpm} bpm</output>
        </div>
        <SoundPicker sound={sound} onChange={onSoundChange} />
      </div>
      <div className="bars" aria-label="Chord progression, one chip per bar">
        {bars.map((name, index) => {
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
        Each chip is one strum, with metronome ticks filling the bar. The diagram up top follows the current chord, with
        the next one shown beside it. Advanced strums twice per bar for a fuller rhythm.
      </p>
    </div>
  );
}
