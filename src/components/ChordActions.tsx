import {useState} from 'react';
import {arpeggio, arpeggioDuration, strum} from '../audio';
import type {Chord} from '../types';
import styles from './ChordActions.module.css';

export function ChordActions({chord}: {chord: Chord}) {
  const [arpKey, setArpKey] = useState(0);
  const [arpActive, setArpActive] = useState(false);
  const [arpDuration, setArpDuration] = useState(0);

  function playArpeggio(): void {
    setArpDuration(arpeggioDuration(chord));
    setArpKey(key => key + 1);
    setArpActive(true);
    arpeggio(chord);
  }

  return (
    <div className={styles.actions}>
      <button onClick={() => strum(chord)}>&#9654;&#xFE0E; Strum</button>
      <button onClick={playArpeggio}>
        {arpActive && (
          <span
            key={arpKey}
            className={styles.arpProgress}
            style={{animationDuration: `${arpDuration}s`}}
            onAnimationEnd={() => setArpActive(false)}
          />
        )}
        <span className={styles.label}>&#9836;&#xFE0E; Arpeggio</span>
      </button>
    </div>
  );
}
