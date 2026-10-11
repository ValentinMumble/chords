import {DIFFICULTY_LABELS, type Song} from '../songs';
import styles from './SongBar.module.css';

interface SongBarProps {
  songs: readonly Song[];
  songIndex: number;
  onSongChange: (index: number) => void;
}

// The slim top-of-page selector: which song.
export function SongBar({songs, songIndex, onSongChange}: SongBarProps) {
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
    </div>
  );
}
