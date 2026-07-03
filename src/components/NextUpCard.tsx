import {CHORDS_BY_NAME, frenchName, type ChordName} from '../chords';
import {Fretboard} from './Fretboard';
import styles from './NextUpCard.module.css';

export function NextUpCard({chordName}: {chordName: ChordName}) {
  return (
    <div className={styles.nextBox} aria-live="polite">
      <p className={styles.label}>Next up</p>
      <p className={styles.name}>{chordName}</p>
      <p className={styles.fr}>{frenchName(chordName)}</p>
      <Fretboard chord={CHORDS_BY_NAME[chordName]} variant="mini" />
    </div>
  );
}
