import type {ReactNode} from 'react';
import {FINGER_COLORS} from '../chords';
import {STRING_LABELS} from '../tuning';
import type {Col} from '../tab';
import styles from './TabStaff.module.css';

// Every staff uses the same viewBox width and scales to fill its container, so
// all tabs render at one width and one number size — each row's columns just
// space out to fill the line (sparser for shorter phrases).
const VIEW_W = 680;
const ROW_H = 22;
const PAD_LEFT = 26;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 15;
const BAR_GAP = 9;
// Bass strings are drawn thicker than treble, like real strings and the
// chord-diagram fretboard (high e → low E).
const STRING_WIDTHS = [0.8, 1, 1.2, 1.5, 1.9, 2.3];

// A graphical tab staff drawn in the chord diagram's visual language (themed
// SVG): tuning letters, tapered string lines, fret numbers sitting on them,
// and weighted bar lines. Columns are distributed evenly across the line.
function TabStaff({
  bars,
  chords,
  firstBar,
  activeCol,
  subdiv = 1,
  showRhythm = false,
}: {
  bars: Col[][];
  chords?: (string | null)[];
  firstBar?: number;
  // Index (within this staff's columns) of the column the playhead is on, or -1.
  activeCol?: number;
  // Grid columns per beat — used to work out each note's length for the rhythm lane.
  subdiv?: number;
  // Draw note-value stems (quarter/eighth/sixteenth) below the staff, like a real tab.
  showRhythm?: boolean;
}) {
  const totalCols = bars.reduce((sum, bar) => sum + bar.length, 0);
  const available = VIEW_W - PAD_LEFT - PAD_RIGHT;
  const colW = (available - bars.length * BAR_GAP) / Math.max(totalCols, 1);
  const columns: {col: Col; x: number; bar: number; colInBar: number}[] = [];
  const barLines: number[] = [];
  let cursor = PAD_LEFT;
  bars.forEach((bar, barIndex) => {
    barLines.push(cursor + BAR_GAP / 2);
    cursor += BAR_GAP;
    bar.forEach((col, colInBar) => {
      columns.push({col, x: cursor + colW / 2, bar: barIndex, colInBar});
      cursor += colW;
    });
  });
  const endX = cursor;
  const lineStart = barLines[0];
  const allBars = [...barLines, endX];
  // A header band above the staff holds bar numbers + chord names when present.
  const hasHeader = firstBar !== undefined || !!chords?.some(Boolean);
  const headerH = hasHeader ? 26 : 0;
  const stringY = (row: number) => PAD_TOP + headerH + row * ROW_H;
  const height = stringY(5) + PAD_BOTTOM + (showRhythm ? 30 : 0);

  return (
    <svg className={styles.staff} viewBox={`0 0 ${VIEW_W} ${height}`} role="img" aria-label="Guitar tab">
      {hasHeader &&
        bars.map((_, index) => (
          <g key={`hdr${index}`}>
            {firstBar !== undefined && (
              <text x={barLines[index] + 3} y={10} fontSize={9} fill="var(--faint)">
                {firstBar + index}
              </text>
            )}
            {chords?.[index] && (
              <text x={barLines[index] + 3} y={26} fontSize={12} fontWeight={500} fill="var(--muted)">
                {chords[index]}
              </text>
            )}
          </g>
        ))}
      {STRING_LABELS.map((label, row) => (
        <g key={label + row}>
          <text x={5} y={stringY(row)} dominantBaseline="central" fontSize={12} fill="var(--muted)">
            {label}
          </text>
          <line
            x1={lineStart}
            y1={stringY(row)}
            x2={endX}
            y2={stringY(row)}
            stroke="var(--line)"
            strokeWidth={STRING_WIDTHS[row]}
          />
        </g>
      ))}
      {allBars.map((bx, index) => (
        <line
          key={`bar${index}`}
          x1={bx}
          y1={stringY(0)}
          x2={bx}
          y2={stringY(5)}
          stroke="var(--line)"
          strokeWidth={index === 0 || index === allBars.length - 1 ? 1.6 : 0.9}
        />
      ))}
      {activeCol !== undefined && activeCol >= 0 && activeCol < columns.length && (
        <rect
          className={styles.playhead}
          x={columns[activeCol].x - colW / 2}
          y={stringY(0) - ROW_H / 2}
          width={colW}
          height={ROW_H * 5 + ROW_H}
          rx={4}
          fill="var(--accent-soft)"
        />
      )}
      {columns.map(({col, x}, colIndex) =>
        col.map((cell, row) =>
          cell === null ? null : (
            <g key={`${colIndex}-${row}`}>
              <rect
                x={x - (cell.fret > 9 ? 10 : 7)}
                y={stringY(row) - 9}
                width={cell.fret > 9 ? 20 : 14}
                height={18}
                fill={activeCol === colIndex ? 'var(--accent-soft)' : 'var(--bg)'}
              />
              <text
                x={x}
                y={stringY(row)}
                dominantBaseline="central"
                textAnchor="middle"
                fontSize={14}
                fontWeight={600}
                fill={cell.finger ? FINGER_COLORS[cell.finger] : 'var(--ink)'}
              >
                {cell.fret}
              </text>
            </g>
          ),
        ),
      )}
      {columns.map(({col, x}, colIndex) =>
        col.map((cell, row) => {
          if (!cell?.slur) return null;
          const next = columns.findIndex((entry, index) => index > colIndex && entry.col[row] !== null);
          if (next < 0) return null;
          const x2 = columns[next].x;
          const arcY = stringY(row) - 11;
          return (
            <path
              key={`slur-${colIndex}-${row}`}
              d={`M ${x} ${arcY} Q ${(x + x2) / 2} ${arcY - 5} ${x2} ${arcY}`}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={1}
            />
          );
        }),
      )}
      {showRhythm &&
        (() => {
          const top = stringY(5) + 16;
          const stemBottom = top + 13;
          const beamGap = 3.5;
          // Sounding columns with their explicit note length (beats) and which
          // beat of the bar they fall on, so eighths/sixteenths beam within a beat.
          const notes = columns
            .filter(entry => entry.col.some(Boolean))
            .map(entry => {
              const beats = entry.col.find(cell => cell?.beats)?.beats ?? 1;
              return {x: entry.x, bar: entry.bar, beat: Math.floor(entry.colInBar / subdiv), beats};
            });
          const flagsOf = (beats: number) =>
            beats >= 1 ? 0 : Math.max(1, Math.min(2, Math.round(Math.log2(1 / beats))));
          const marks: ReactNode[] = notes.map((note, i) => (
            <g key={`stem-${i}`} stroke="var(--muted)" strokeWidth={1}>
              <circle cx={note.x} cy={top} r={2.3} fill="var(--muted)" stroke="none" />
              <line x1={note.x} y1={top} x2={note.x} y2={stemBottom} />
            </g>
          ));
          // Beams: for each level, join runs of consecutive notes in the same beat.
          for (let level = 1; level <= 2; level += 1) {
            const y = stemBottom - (level - 1) * beamGap;
            let i = 0;
            while (i < notes.length) {
              if (flagsOf(notes[i].beats) < level) {
                i += 1;
                continue;
              }
              let j = i;
              while (
                j + 1 < notes.length &&
                notes[j + 1].bar === notes[i].bar &&
                notes[j + 1].beat === notes[i].beat &&
                flagsOf(notes[j + 1].beats) >= level
              ) {
                j += 1;
              }
              marks.push(
                j > i ? (
                  <line
                    key={`beam-${level}-${i}`}
                    x1={notes[i].x}
                    y1={y}
                    x2={notes[j].x}
                    y2={y}
                    stroke="var(--muted)"
                    strokeWidth={2}
                  />
                ) : (
                  <line
                    key={`flag-${level}-${i}`}
                    x1={notes[i].x}
                    y1={y}
                    x2={notes[i].x + 5}
                    y2={y - 3.5}
                    stroke="var(--muted)"
                    strokeWidth={1.4}
                  />
                ),
              );
              i = j + 1;
            }
          }
          return marks;
        })()}
    </svg>
  );
}

// Lays a tab out over one or more rows (barsPerRow bars each), threading the
// global playhead column down to whichever row it currently falls in.
export function TabBlock({
  bars,
  caption,
  barsPerRow,
  chords,
  firstBar,
  playingCol,
  subdiv,
  showRhythm,
}: {
  bars: Col[][];
  caption?: string;
  barsPerRow?: number;
  chords?: (string | null)[];
  firstBar?: number;
  // Playhead position as a column index across all of `bars`, or -1/undefined.
  playingCol?: number;
  subdiv?: number;
  showRhythm?: boolean;
}) {
  const perRow = barsPerRow ?? bars.length;
  const rows: {bars: Col[][]; chords?: (string | null)[]; start?: number; colOffset: number}[] = [];
  let colOffset = 0;
  for (let index = 0; index < bars.length; index += perRow) {
    const rowBars = bars.slice(index, index + perRow);
    rows.push({
      bars: rowBars,
      chords: chords?.slice(index, index + perRow),
      start: firstBar !== undefined ? firstBar + index : undefined,
      colOffset,
    });
    colOffset += rowBars.reduce((sum, bar) => sum + bar.length, 0);
  }
  return (
    <div className={styles.block}>
      {caption && <p className={styles.caption}>{caption}</p>}
      {rows.map((row, index) => {
        const rowCols = row.bars.reduce((sum, bar) => sum + bar.length, 0);
        const local = playingCol === undefined ? -1 : playingCol - row.colOffset;
        return (
          <div className={styles.row} key={index}>
            <TabStaff
              bars={row.bars}
              chords={row.chords}
              firstBar={row.start}
              activeCol={local >= 0 && local < rowCols ? local : -1}
              subdiv={subdiv}
              showRhythm={showRhythm}
            />
          </div>
        );
      })}
    </div>
  );
}
