import type {Song} from '../songs';
import type {SongPlayback} from '../hooks/useSongPlayback';
import {SoundPicker} from './SoundPicker';

interface SongPlayerProps {
  songs: readonly Song[];
  song: Song;
  songIndex: number;
  onSongChange: (index: number) => void;
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
  bpm,
  onBpmChange,
  sound,
  onSoundChange,
  playback,
}: SongPlayerProps) {
  const {playing, barIndex, nextBarIndex, togglePlay} = playback;
  return (
    <div className="viewer" style={{display: 'block'}}>
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
        <button className="play-btn" aria-label={playing ? 'Stop' : 'Play'} onClick={togglePlay}>
          {playing ? <>&#9632;&#xFE0E;</> : <>&#9654;&#xFE0E;</>}
        </button>
        <div className="tempo">
          <label htmlFor="song-bpm">Tempo</label>
          <input
            type="range"
            id="song-bpm"
            min={40}
            max={120}
            step={2}
            value={bpm}
            onChange={event => onBpmChange(Number(event.target.value))}
          />
          <output>{bpm} bpm</output>
        </div>
        <SoundPicker sound={sound} onChange={onSoundChange} />
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
        Each chip is one bar of 4 beats: a strum on beat 1, ticks on 2–4. The diagram up top follows the current bar,
        with the next chord shown beside it.
      </p>
    </div>
  );
}
