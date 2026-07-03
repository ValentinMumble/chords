import {useEffect, useState} from 'react';
import {currentTime, pluckMidi, pluckTab} from '../audio';
import {usePersistedState} from '../hooks/usePersistedState';
// OPEN_PC / STRING_LABELS are high-e first (row 0), the row order pluckTab uses.
import {OPEN_PC, STRING_LABELS} from '../tuning';
import styles from './Scales.module.css';

const PITCH_CLASSES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
// French note names line up with the top-bar string reference.
const FRENCH = ['Do', 'Do♯', 'Ré', 'Ré♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];

interface Scale {
  key: string;
  name: string;
  // Semitone offsets from the root.
  intervals: number[];
}
const SCALES: Scale[] = [
  {key: 'minor-pent', name: 'Minor pentatonic', intervals: [0, 3, 5, 7, 10]},
  {key: 'major-pent', name: 'Major pentatonic', intervals: [0, 2, 4, 7, 9]},
  {key: 'major', name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11]},
  {key: 'minor', name: 'Natural minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10]},
  {key: 'blues', name: 'Blues', intervals: [0, 3, 5, 6, 7, 10]},
];

// A single movable box: SPAN frets shown at a time.
const SPAN = 5;
const MAX_START = 12;
const VIEW_W = 380;
const NUT_X = 46;
const OPEN_X = 24;
const RIGHT_PAD = 16;
const FRET_W = (VIEW_W - NUT_X - RIGHT_PAD) / SPAN;
const TOP_Y = 24;
const STRING_GAP = 30;
const DOT_R = 12;
const INLAY_FRETS = [3, 5, 7, 9, 12, 15, 17];

export function Scales() {
  const [root, setRoot] = usePersistedState('scales:root', 9); // A by default
  const [scaleKey, setScaleKey] = usePersistedState('scales:scale', 'minor-pent');
  const scale = SCALES.find(entry => entry.key === scaleKey) ?? SCALES[0];

  const inScale = new Set(scale.intervals.map(interval => (root + interval) % 12));

  // Home the box on the root's position on the low-E string, re-homing when the
  // root changes; the arrows then shift it freely up and down the neck.
  const homeFret = (((root - OPEN_PC[5]) % 12) + 12) % 12;
  const [startFret, setStartFret] = useState(homeFret);
  useEffect(() => {
    setStartFret(homeFret);
  }, [homeFret]);

  const stringY = (row: number) => TOP_Y + row * STRING_GAP;
  // A window index of 1..SPAN maps to a fret just right of the (index-1)th wire.
  const windowX = (index: number) => NUT_X + (index - 0.5) * FRET_W;
  const boardBottom = stringY(5);
  const height = boardBottom + 34;
  const lowFret = startFret + 1;
  const highFret = startFret + SPAN;

  // Play the scale ascending two octaves from the root, in a comfortable range.
  function playScale(): void {
    const base = 52 + root;
    const notes = [
      ...scale.intervals.map(interval => base + interval),
      ...scale.intervals.map(interval => base + 12 + interval),
      base + 24,
    ];
    const start = currentTime() + 0.05;
    notes.forEach((midi, index) => pluckMidi(midi, start + index * 0.26, 0.8));
  }

  // The scale notes visible in the current box (plus open strings at the nut).
  const dots = OPEN_PC.flatMap((openPc, row) => {
    const cells: {row: number; fret: number; pc: number; cx: number}[] = [];
    for (let fret = lowFret; fret <= highFret; fret++) {
      const pc = (openPc + fret) % 12;
      if (inScale.has(pc)) cells.push({row, fret, pc, cx: windowX(fret - startFret)});
    }
    if (startFret === 0) {
      const pc = openPc % 12;
      if (inScale.has(pc)) cells.push({row, fret: 0, pc, cx: OPEN_X});
    }
    return cells;
  });

  return (
    <div className="scales">
      <section className="exercise">
        <div className={styles.controls}>
          <div className={styles.field}>
            <span className={styles.label}>Root</span>
            <div className={styles.rootGrid}>
              {PITCH_CLASSES.map((name, pc) => (
                <button
                  key={pc}
                  className={`${styles.rootBtn}${pc === root ? ' ' + styles.active : ''}`}
                  onClick={() => setRoot(pc)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Scale</span>
            <select className={styles.select} value={scaleKey} onChange={event => setScaleKey(event.target.value)}>
              {SCALES.map(entry => (
                <option key={entry.key} value={entry.key}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <button className="tab-play" onClick={playScale}>
            <span aria-hidden="true">▶</span>
            Play scale
          </button>
        </div>

        <p className={styles.title}>
          {PITCH_CLASSES[root]} {scale.name}
          <span className={styles.french}> · {FRENCH[root]}</span>
        </p>

        <div className={styles.position}>
          <button
            className={styles.shift}
            onClick={() => setStartFret(current => Math.max(0, current - 1))}
            disabled={startFret === 0}
            aria-label="Move box toward the nut"
          >
            ◀
          </button>
          <span className={styles.posLabel}>
            {startFret === 0 ? `Open · frets 0–${SPAN}` : `Frets ${lowFret}–${highFret}`}
          </span>
          <button
            className={styles.shift}
            onClick={() => setStartFret(current => Math.min(MAX_START, current + 1))}
            disabled={startFret >= MAX_START}
            aria-label="Move box toward the body"
          >
            ▶
          </button>
        </div>

        <div className={styles.board}>
          <svg
            viewBox={`0 0 ${VIEW_W} ${height}`}
            role="img"
            aria-label={`${PITCH_CLASSES[root]} ${scale.name}, frets ${lowFret} to ${highFret}`}
          >
            {/* inlay markers within the window */}
            {INLAY_FRETS.filter(fret => fret >= lowFret && fret <= highFret).map(fret => {
              const cx = windowX(fret - startFret);
              const mid = (stringY(0) + stringY(5)) / 2;
              return fret === 12 ? (
                <g key={fret}>
                  <circle cx={cx} cy={stringY(1) + STRING_GAP / 2} r={4} fill="var(--line)" />
                  <circle cx={cx} cy={stringY(3) + STRING_GAP / 2} r={4} fill="var(--line)" />
                </g>
              ) : (
                <circle key={fret} cx={cx} cy={mid} r={4} fill="var(--line)" />
              );
            })}
            {/* strings */}
            {STRING_LABELS.map((label, row) => (
              <g key={label + row}>
                <text x={6} y={stringY(row)} dominantBaseline="central" fontSize={12} fill="var(--muted)">
                  {label}
                </text>
                <line
                  x1={NUT_X}
                  y1={stringY(row)}
                  x2={VIEW_W - RIGHT_PAD}
                  y2={stringY(row)}
                  stroke="var(--line)"
                  strokeWidth={0.8 + row * 0.3}
                />
              </g>
            ))}
            {/* fret wires (the nut, when the box is at the open position, is thicker) */}
            {Array.from({length: SPAN + 1}, (_, index) => (
              <line
                key={index}
                x1={NUT_X + index * FRET_W}
                y1={stringY(0)}
                x2={NUT_X + index * FRET_W}
                y2={stringY(5)}
                stroke="var(--line)"
                strokeWidth={index === 0 && startFret === 0 ? 3 : 1}
              />
            ))}
            {/* fret numbers */}
            {Array.from({length: SPAN}, (_, index) => {
              const fret = startFret + index + 1;
              return (
                <text
                  key={fret}
                  x={windowX(index + 1)}
                  y={boardBottom + 22}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--faint)"
                >
                  {fret}
                </text>
              );
            })}
            {/* scale notes in the box */}
            {dots.map(({row, fret, pc, cx}) => {
              const isRoot = pc === root;
              const cy = stringY(row);
              return (
                <g
                  key={`${row}-${fret}`}
                  className={styles.note}
                  onClick={() => pluckTab(row, fret, currentTime() + 0.02, 0.8)}
                  role="button"
                  aria-label={`${PITCH_CLASSES[pc]} on string ${STRING_LABELS[row]}, fret ${fret}`}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={DOT_R}
                    fill={isRoot ? 'var(--accent)' : 'var(--accent-soft)'}
                    stroke="var(--accent)"
                    strokeWidth={isRoot ? 0 : 1}
                  />
                  <text
                    x={cx}
                    y={cy}
                    dominantBaseline="central"
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={600}
                    fill={isRoot ? '#fff' : 'var(--accent)'}
                  >
                    {isRoot ? 'R' : PITCH_CLASSES[pc]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="exercise-note">
          One box position at a time. Filled dot = root (<strong>R</strong>). Use the arrows to slide the same shape up
          or down the neck — a new key, same fingering. Tap any note to hear it.
        </p>
      </section>
    </div>
  );
}
