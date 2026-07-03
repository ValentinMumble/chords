import {FLEET, type GuitarType} from '../data/fleet';
import {GuitarArt} from './GuitarArt';
import styles from './Fleet.module.css';

// Rough string-life windows in days, per instrument type. Acoustic strings dull
// fastest (oxidation), bass strings can last the longest. Used to nudge a
// restring, not a hard rule.
const RESTRING_LIFE: Record<Exclude<GuitarType, 'amp'>, {fresh: number; aging: number}> = {
  acoustic: {fresh: 60, aging: 120},
  electric: {fresh: 90, aging: 180},
  bass: {fresh: 240, aging: 480},
};

function daysSince(iso: string): number {
  return Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
}

// A coarse "N yr M mo" (or "N days" under a month) span between two dates.
function humanSpan(fromISO: string, toISO: string): string {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months--;
  if (months < 1) {
    const days = Math.max(0, Math.round((to.getTime() - from.getTime()) / 86_400_000));
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearPart = years ? `${years} yr` : '';
  const monthPart = rest ? `${rest} mo` : '';
  return [yearPart, monthPart].filter(Boolean).join(' ');
}

function restringStatus(type: GuitarType, days: number): {level: string; label: string} {
  const life = RESTRING_LIFE[type as Exclude<GuitarType, 'amp'>] ?? RESTRING_LIFE.electric;
  if (days <= life.fresh) return {level: 'fresh', label: 'Fresh strings'};
  if (days <= life.aging) return {level: 'aging', label: 'Getting worn'};
  return {level: 'overdue', label: 'Time to restring'};
}

// A per-instrument string-change log: shows how long since the strings were last
// fitted, with an age-based restring nudge. The date is a static field in the
// FLEET data (edit it in code when you change strings).
function StringLog({
  type,
  date,
  previousFitted,
}: {
  type: GuitarType;
  date: string | undefined;
  previousFitted?: string;
}) {
  if (!date) return null;
  const days = daysSince(date);
  const status = restringStatus(type, days);
  const fitted = new Date(date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
  const oldAge = previousFitted ? humanSpan(previousFitted, date) : null;
  return (
    <div className={styles.strings}>
      <div className={styles.stringsHead}>
        <span className={styles.stringsTitle}>Strings</span>
        <span className={`${styles.badge} ${styles[status.level]}`}>
          {status.label} · {days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} old`}
        </span>
      </div>
      <span className={styles.stringsDate}>
        Fitted {fitted}
        {oldAge ? ` · old set was ${oldAge} old` : ''}
      </span>
    </div>
  );
}

export function Fleet() {
  const total = FLEET.reduce((sum, item) => sum + item.price, 0);
  const instrumentCount = FLEET.filter(item => item.type !== 'amp').length;
  return (
    <div className={styles.fleet}>
      <div className={styles.summary}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{instrumentCount}</span>
          <span className={styles.statLabel}>instruments</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>€{total.toLocaleString('en-US')}</span>
          <span className={styles.statLabel}>total paid</span>
        </div>
      </div>
      {FLEET.map(instrument => (
        <section className={styles.card} key={instrument.name}>
          <div className={styles.head}>
            {instrument.image ? (
              <img className={styles.photo} src={instrument.image} alt={instrument.name} loading="lazy" />
            ) : (
              <GuitarArt type={instrument.type} color={instrument.color} />
            )}
            <div className={styles.title}>
              <h2>{instrument.name}</h2>
              <span className={styles.kind}>{instrument.kind}</span>
            </div>
          </div>
          <p className={styles.blurb}>{instrument.blurb}</p>
          <dl className={styles.specs}>
            {instrument.specs.map(spec => (
              <div className={styles.spec} key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
            <div className={styles.spec}>
              <dt>Bought</dt>
              <dd>{instrument.bought}</dd>
            </div>
            <div className={styles.spec}>
              <dt>Paid</dt>
              <dd>€{instrument.price}</dd>
            </div>
          </dl>
          {instrument.type !== 'amp' && (
            <StringLog type={instrument.type} date={instrument.restrung} previousFitted={instrument.previousFitted} />
          )}
        </section>
      ))}
    </div>
  );
}
