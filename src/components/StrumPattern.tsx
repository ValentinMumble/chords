import type {PickPattern, StrumPattern as Pattern} from '../songs';
import styles from './StrumPattern.module.css';

interface StrumPatternProps {
  pattern: Pattern;
  pick?: PickPattern;
  playing: boolean;
  subdivision: number;
  barSeconds: number;
}

// Beat label under each slot: simple meters count "1 & 2 & …"; compound meters
// (subdivision 3, e.g. 6/8) count every subdivision "1 2 3 4 5 6".
function slotLabel(index: number, subdivision: number): string {
  if (subdivision === 2) return index % 2 === 0 ? String(index / 2 + 1) : '&';
  return String(index + 1);
}

export function StrumPattern({pattern, pick, playing, subdivision, barSeconds}: StrumPatternProps) {
  const picking = pick !== undefined;
  const slots = pick ?? pattern;
  return (
    <div className={styles.strum}>
      <span className={styles.label}>{picking ? 'Pick' : 'Strum'}</span>
      <div className={styles.grid}>
        {playing && (
          <span className={styles.playhead} style={{animationDuration: `${barSeconds}s`}} aria-hidden="true" />
        )}
        {slots.map((slot, index) => {
          if (picking) {
            const voice = slot as number | null;
            const active = voice !== null;
            const bass = voice === 0;
            return (
              <div key={index} className={`${styles.slot}${bass ? ` ${styles.accent}` : ''}`}>
                <span className={styles.pluckDot}>{active ? <span /> : null}</span>
                <span className={styles.beat}>{slotLabel(index, subdivision)}</span>
              </div>
            );
          }
          const stroke = slot as Pattern[number];
          const accent = stroke === 'D' && index === 0;
          const slotClass = [styles.slot, stroke === 'U' && styles.up, accent && styles.accent]
            .filter(Boolean)
            .join(' ');
          return (
            <div key={index} className={slotClass}>
              <span className={styles.arrow}>{stroke === 'D' ? '↓' : stroke === 'U' ? '↑' : ''}</span>
              <span className={styles.beat}>{slotLabel(index, subdivision)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
