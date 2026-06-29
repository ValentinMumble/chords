import {FINGER_COLORS} from '../chords';

// A note on the tab: the fret, the finger (1-4) that plays it (for colour
// coding, like the chord diagram), and `slur` = it connects to the next note on
// the same string (hammer-on / pull-off / slide).
type Cell = {fret: number; finger?: number; slur?: boolean} | null;
// A column is one time-slot across the six strings, high E first (index 0) to
// low E (index 5); null means that string isn't played on that slot.
type Col = Cell[];

const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

// Parse aligned ASCII tab (six lines, high-E first) into bars of columns. Tol-
// erates an optional string label and leading "|"/"||"; "|" separates bars. One
// char = one slot; digits are frets, everything else (dashes, p/h/slide marks)
// is a rest. Frets here are single digit.
function parseTab(lines: string[]): Col[][] {
  const perString = lines.map(line => line.replace(/^[a-gA-G]?\|*/, '').split('|').filter(seg => seg.length > 0));
  const barCount = perString[0].length;
  const bars: Col[][] = [];
  for (let bar = 0; bar < barCount; bar++) {
    const width = perString[0][bar].length;
    const columns: Col[] = Array.from({length: width}, () => [null, null, null, null, null, null]);
    // Walk each string left to right, placing notes. An articulation char
    // (p/h/b/r/s or a slide /\) before a note flags the previous note as
    // slurred to it.
    perString.forEach((stringBars, row) => {
      const text = stringBars[bar] ?? '';
      let lastNote = -1;
      let pendingSlur = false;
      for (let slot = 0; slot < width; slot++) {
        const char = text[slot];
        if (char !== undefined && char >= '0' && char <= '9') {
          columns[slot][row] = {fret: Number(char)};
          const prev = lastNote >= 0 ? columns[lastNote][row] : null;
          if (pendingSlur && prev) prev.slur = true;
          pendingSlur = false;
          lastNote = slot;
        } else if (char !== undefined && 'phbrs/\\'.includes(char)) {
          pendingSlur = true;
        }
      }
    });
    bars.push(columns);
  }
  return bars;
}

// The chromatic finger exercise: low E at fret 1 with fingers 1-2-3-4, then each
// higher string starts one fret higher, up to the high E with finger 4 on fret
// 9. Grouped four-to-a-bar so the position shift reads as a staircase.
function chromaticBars(descending: boolean): Col[][] {
  const notes: {physicalString: number; fret: number; finger: number}[] = [];
  for (let physicalString = 0; physicalString < 6; physicalString++) {
    for (let step = 0; step < 4; step++) {
      notes.push({physicalString, fret: physicalString + 1 + step, finger: step + 1});
    }
  }
  const sequence = descending ? [...notes].reverse() : notes;
  const bars: Col[][] = [];
  for (let index = 0; index < sequence.length; index += 4) {
    bars.push(
      sequence.slice(index, index + 4).map(note => {
        const column: Col = [null, null, null, null, null, null];
        column[5 - note.physicalString] = {fret: note.fret, finger: note.finger};
        return column;
      }),
    );
  }
  return bars;
}

// Peter Gunn (simplified): the open-string pedal alternating with frets 2·3·5·4
// — one per finger — giving 0·0·2·0·3·0·5·4. Run the same shape up every string.
function peterGunnBars(): Col[][] {
  const pattern = [0, 0, 2, 0, 3, 0, 5, 4];
  return [0, 1, 2, 3, 4, 5].map(physicalString =>
    pattern.map(fret => {
      const column: Col = [null, null, null, null, null, null];
      column[5 - physicalString] = {fret, finger: fret === 0 ? undefined : fret - 1};
      return column;
    }),
  );
}

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
function TabStaff({bars, chords, firstBar}: {bars: Col[][]; chords?: (string | null)[]; firstBar?: number}) {
  const totalCols = bars.reduce((sum, bar) => sum + bar.length, 0);
  const available = VIEW_W - PAD_LEFT - PAD_RIGHT;
  const colW = (available - bars.length * BAR_GAP) / Math.max(totalCols, 1);
  const columns: {col: Col; x: number}[] = [];
  const barLines: number[] = [];
  let cursor = PAD_LEFT;
  bars.forEach(bar => {
    barLines.push(cursor + BAR_GAP / 2);
    cursor += BAR_GAP;
    bar.forEach(col => {
      columns.push({col, x: cursor + colW / 2});
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
  const height = stringY(5) + PAD_BOTTOM;

  return (
    <svg className="tab-staff" viewBox={`0 0 ${VIEW_W} ${height}`} role="img" aria-label="Guitar tab">
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
      {columns.map(({col, x}, colIndex) =>
        col.map((cell, row) =>
          cell === null ? null : (
            <g key={`${colIndex}-${row}`}>
              <rect
                x={x - (cell.fret > 9 ? 10 : 7)}
                y={stringY(row) - 9}
                width={cell.fret > 9 ? 20 : 14}
                height={18}
                fill="var(--bg)"
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
    </svg>
  );
}

function TabBlock({
  bars,
  caption,
  barsPerRow,
  chords,
  firstBar,
}: {
  bars: Col[][];
  caption?: string;
  barsPerRow?: number;
  chords?: (string | null)[];
  firstBar?: number;
}) {
  const perRow = barsPerRow ?? bars.length;
  const rows: {bars: Col[][]; chords?: (string | null)[]; start?: number}[] = [];
  for (let index = 0; index < bars.length; index += perRow) {
    rows.push({
      bars: bars.slice(index, index + perRow),
      chords: chords?.slice(index, index + perRow),
      start: firstBar !== undefined ? firstBar + index : undefined,
    });
  }
  return (
    <div className="tab-block">
      {caption && <p className="tab-caption">{caption}</p>}
      {rows.map((row, index) => (
        <div className="tab" key={index}>
          <TabStaff bars={row.bars} chords={row.chords} firstBar={row.start} />
        </div>
      ))}
    </div>
  );
}

// The full fingerpicked intro (Am · E/G# · C · D/F# · Fmaj7 · G/B …), 16 bars.
const STAIRWAY = [
  ...parseTab([
    'E||-----------5--7------------7--|--8---------8--2----------2--|--0---------------0--------|',
    'B||--------5------------5--------|------5-------------3--------|------1-----1--------1-----|',
    'G||-----5------------------5-----|---------5-------------2-----|---------2--------------2--|',
    'D||--7-----------6---------------|--5------------4-------------|--3------------------------|',
    'A||------------------------------|-----------------------------|---------------------------|',
    'E||------------------------------|-----------------------------|---------------------------|',
  ]),
  ...parseTab([
    '|-------------------------|--------------7------------7--|--8---------8--2----------2--|',
    '|--0---1--1---------------|-----------5---------5--------|------5-------------3--------|',
    '|--0---2--2------2--------|--------5---------------5-----|---------5-------------2-----|',
    '|-------------------------|-----7--------6---------------|--5------------4-------------|',
    '|--2---0--0------0--/8--7-|--0---------------------------|-----------------------------|',
    '|-------------------------|------------------------------|-----------------------------|',
  ]),
  ...parseTab([
    '|--0---------------0--------|------------------------|-----------0--2--------2--|',
    '|------1-----1--------1-----|--0---1--1--------------|-----------------3--------|',
    '|---------2--------------2--|--0---2--2--------------|--------0-----------2-----|',
    '|--3------------------------|------------------------|-----2--------0-----------|',
    '|---------------------------|--2---0--0--------0--2--|--3-----------------------|',
    '|---------------------------|------------------------|--------------------------|',
  ]),
  ...parseTab([
    '--0---------0--------------|--------------3--------3--|--3p-2-2--2--------------|',
    '------1--------0-----------|--1--------1-----0--------|-------3--3--------------|',
    '---------2--------2--------|-----0--------------0-----|-------2--2--------------|',
    '--3------------------------|--------2-----------------|--0----0--0--------------|',
    '---------------0-----0--2--|--3-----------------------|-------------------0--2--|',
    '---------------------------|--------------3-----------|-------------------------|',
  ]),
  ...parseTab([
    '|--------------2--------2--|--0---------0--------------|-----------------------2--|',
    '|-----------1-----3--------|------1--------0-----------|-----------1--------3-----|',
    '|--------0-----------2-----|---------2--------2--------|--------0--------2--------|',
    '|-----2--------0-----------|--3------------------------|-----2--------0-----------|',
    '|--3-----------------------|---------------0-----0--2--|--3-----------------------|',
    '|--------------------------|---------------------------|--------------------------|',
  ]),
  ...parseTab([
    '|--0---0--0-------------|',
    '|--1---1--1-------------|',
    '|--2---2--2-------------|',
    '|--3---3--3-------------|',
    '|-----------------------|',
    '|-----------------------|',
  ]),
];
// Chord above each of the 16 bars (the downbeat chord).
const STAIRWAY_CHORDS = [
  'Am', 'C', 'FM7', 'G/B', 'E+5/G#', 'C/G', 'FM7', 'G/B', 'C', 'FM7', 'C', 'D', 'C', 'FM7', 'C', 'FM7',
];

// A Forest — The Cure (intro): a melodic line on the D string over the ringing
// open A drone. Fingering (for colour coding) is the teacher's: 7→3, 3→3, 2→2,
// 3→3, 7→1, 9→3, 10→4, then the descending 7·5·3·2 all with finger 1.
function dNote(fret: number, finger?: number): Col {
  const column: Col = [null, null, null, null, null, null];
  column[3] = {fret, finger};
  return column;
}
function aDrone(): Col {
  const column: Col = [null, null, null, null, null, null];
  column[4] = {fret: 0};
  return column;
}
const FOREST = [
  [aDrone(), dNote(7, 3)],
  [aDrone(), dNote(3, 3), dNote(2, 2), dNote(0)],
  [aDrone(), dNote(3, 3)],
  [aDrone(), dNote(7, 1)],
  [aDrone(), dNote(9, 3), dNote(10, 4)],
  [aDrone(), dNote(7, 1), dNote(5, 1), dNote(3, 1)],
  [aDrone(), dNote(2, 1), dNote(0)],
];

export function Exercises() {
  return (
    <div className="exercises">
      <section className="exercise">
        <h2>Peter Gunn — riff drill</h2>
        <TabBlock bars={peterGunnBars()} barsPerRow={3} caption="Steady and palm-muted, every string" />
      </section>

      <section className="exercise">
        <h2>Finger independence — chromatic walk</h2>
        <p className="exercise-note">
          One finger per fret. Walk up four frets per string, shifting up a fret each string, then reverse
          back down. Slow and even — and <strong>pick strict down-up-down-up</strong> throughout, even across
          string changes.
        </p>
        <TabBlock bars={chromaticBars(false)} caption="Going up" />
        <TabBlock bars={chromaticBars(true)} caption="Coming back down" />
      </section>

      <section className="exercise">
        <h2>A Forest — The Cure</h2>
        <p className="exercise-note">
          The post-punk intro, in A minor — a melodic line on the D string over the ringing open A.
        </p>
        <TabBlock bars={FOREST} barsPerRow={4} firstBar={1} caption="Intro in Am — let the open A ring" />
      </section>

      <section className="exercise">
        <h2>Stairway to Heaven — intro</h2>
        <p className="exercise-note">
          The full fingerpicked intro — let each note ring. The chords move through Am · E/G# · C · D/F# ·
          Fmaj7 · G/B and around.
        </p>
        <TabBlock bars={STAIRWAY} barsPerRow={2} chords={STAIRWAY_CHORDS} firstBar={1} />
      </section>
    </div>
  );
}
