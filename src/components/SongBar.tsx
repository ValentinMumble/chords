import {DIFFICULTY_LABELS, type Song, type SongLevel} from '../songs';
import {SegmentedToggle} from './SegmentedToggle';
import styles from './SongBar.module.css';

const LEVELS: readonly {key: SongLevel; label: string}[] = [
  {key: 'easy', label: 'Easy'},
  {key: 'advanced', label: 'Advanced'},
];

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
    <div className={styles.songBar}>
      <select
        className={styles.songSelect}
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
        <SegmentedToggle ariaLabel="Difficulty" items={LEVELS} value={level} onChange={onLevelChange} />
      )}
    </div>
  );
}
