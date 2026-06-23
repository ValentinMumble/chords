import {DIFFICULTY_LABELS, type Song, type SongLevel} from '../songs';

interface SongBarProps {
  songs: readonly Song[];
  song: Song;
  songIndex: number;
  onSongChange: (index: number) => void;
  level: SongLevel;
  onLevelChange: (level: SongLevel) => void;
}

// The slim top-of-page selector: which song, and (if it has one) its level.
export function SongBar({songs, song, songIndex, onSongChange, level, onLevelChange}: SongBarProps) {
  return (
    <div className="song-bar">
      <select
        className="song-select"
        aria-label="Choose a song"
        value={songIndex}
        onChange={event => onSongChange(Number(event.target.value))}
      >
        {([1, 2, 3] as const)
          .filter(tier => songs.some(entry => entry.difficulty === tier))
          .map(tier => (
            <optgroup key={tier} label={DIFFICULTY_LABELS[tier]}>
              {songs.map((entry, index) =>
                entry.difficulty === tier ? (
                  <option key={entry.name} value={index}>
                    {entry.name}
                  </option>
                ) : null,
              )}
            </optgroup>
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
    </div>
  );
}
