// Shared types and parsers for guitar tablature. Kept out of any component so
// hooks (e.g. useTabPlayback) and components can both depend on them without a
// component importing from another component.

// A note on the tab: the fret, the finger (1-4) that plays it (for colour
// coding, like the chord diagram), `slur` = it connects to the next note on the
// same string (hammer-on / pull-off / slide), and `beats` = its explicit note
// length in beats (0.25 sixteenth, 0.5 eighth, 1 quarter …) for the rhythm lane.
export type Cell = {fret: number; finger?: number; slur?: boolean; beats?: number} | null;

// A column is one time-slot across the six strings, high E first (index 0) to
// low E (index 5); null means that string isn't played on that slot.
export type Col = Cell[];

export const emptyColumn = (): Col => [null, null, null, null, null, null];

// Parse aligned ASCII tab (six lines, high-E first) into bars of columns. Tol-
// erates an optional string label and leading "|"/"||"; "|" separates bars. One
// char = one slot; digits are frets, everything else (dashes, p/h/slide marks)
// is a rest. Frets here are single digit.
export function parseTab(lines: string[]): Col[][] {
  const perString = lines.map(line =>
    line
      .replace(/^[a-gA-G]?\|*/, '')
      .split('|')
      .filter(seg => seg.length > 0),
  );
  const barCount = perString[0].length;
  const bars: Col[][] = [];
  for (let bar = 0; bar < barCount; bar++) {
    const width = perString[0][bar].length;
    const columns: Col[] = Array.from({length: width}, emptyColumn);
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

// Parse a literal, spacing-accurate tab where one character = one slot and the
// dash spacing IS the rhythm (a note rings until the next event on its string).
// Multi-digit frets sound on their first digit; the remaining digits stay as
// rest slots to keep the strings character-aligned. `fingerByFret` colours the
// notes. Each line names which string row it is (0 = high e … 5 = low E).
export function parseSpacedTab(
  lines: {row: number; text: string}[],
  fingerByFret: Record<number, number> = {},
): Col[][] {
  const perString = lines.map(({row, text}) => ({
    row,
    bars: text
      .replace(/^[a-gA-G]?\|*/, '')
      .split('|')
      .filter(segment => segment.length > 0),
  }));
  const barCount = Math.max(...perString.map(entry => entry.bars.length));
  const bars: Col[][] = [];
  for (let bar = 0; bar < barCount; bar++) {
    const width = Math.max(...perString.map(entry => (entry.bars[bar] ?? '').length));
    const columns: Col[] = Array.from({length: width}, emptyColumn);
    perString.forEach(({row, bars: stringBars}) => {
      const text = stringBars[bar] ?? '';
      let slot = 0;
      while (slot < text.length) {
        const char = text[slot];
        if (char >= '0' && char <= '9') {
          let digits = char;
          let next = slot + 1;
          while (next < text.length && text[next] >= '0' && text[next] <= '9') {
            digits += text[next];
            next += 1;
          }
          const fret = Number(digits);
          columns[slot][row] = {fret, finger: fret === 0 ? undefined : fingerByFret[fret]};
          slot = next; // continuation digits stay as rest slots, keeping alignment
        } else {
          slot += 1;
        }
      }
    });
    bars.push(columns);
  }
  return bars;
}

// Re-grid a tab onto an explicit note-value rhythm. `rhythmFor(barIndex)` returns
// the length in beats of each sounding attack in that bar (0.5 = eighth, 1 =
// quarter …). Each attack becomes one column tagged with `beats`, followed by
// enough rest columns to fill its length on a `subdiv`-per-beat grid — so the
// grid is beat-aligned and the rhythm lane can draw exact, beamed note values.
// Rest columns in the input are dropped (the rhythm defines the spacing now).
export function applyRhythm(bars: Col[][], rhythmFor: (barIndex: number) => number[], subdiv: number): Col[][] {
  return bars.map((bar, barIndex) => {
    const rhythm = rhythmFor(barIndex);
    const attacks = bar.filter(column => column.some(Boolean));
    return attacks.flatMap((column, index) => {
      const beats = rhythm[index] ?? rhythm[rhythm.length - 1] ?? 1;
      const width = Math.max(1, Math.round(beats * subdiv));
      const first: Col = column.map(cell => (cell ? {...cell, beats} : null));
      const rests: Col[] = Array.from({length: width - 1}, emptyColumn);
      return [first, ...rests];
    });
  });
}

// --- Builders: write tab data as notes and patterns instead of filling columns
// by hand. Every exercise uses these, so a new song is a few short lines.

// A note to place in a column: [string row (0 = high e … 5 = low E), fret,
// finger?]. Leave the finger out for open strings.
export type Note = readonly [number, number, number?];

// One column sounding the given notes, each tagged with `beats` when given.
export function column(notes: readonly Note[], beats?: number): Col {
  const result = emptyColumn();
  notes.forEach(([row, fret, finger]) => {
    result[row] = beats === undefined ? {fret, finger} : {fret, finger, beats};
  });
  return result;
}

const STRING_ROWS: Record<string, number> = {e: 0, B: 1, G: 2, D: 3, A: 4, E: 5};

// Notes written like tab: 'B14/1 G14/1' = B string fret 14 with finger 1 and G
// string fret 14 with finger 1. The finger is optional ('E0' = open low E).
export function notes(text: string): Note[] {
  return text
    .trim()
    .split(/\s+/)
    .map(token => {
      const match = /^([eBGDAE])(\d+)(?:\/(\d))?$/.exec(token);
      if (!match) throw new Error(`Bad note "${token}" (expected like "B14/1")`);
      const [, string, fret, finger] = match;
      return [STRING_ROWS[string], Number(fret), finger === undefined ? undefined : Number(finger)] as const;
    });
}

// A bar laid out slot by slot on a fixed grid: notes to sound, '-' to let the
// previous notes ring on, '.' for silence. Each attack lasts slotBeats times
// (1 + the number of '-' right after it), so the rhythm lane draws it right.
export type Slot = readonly Note[] | '-' | '.';
export function slots(entries: readonly Slot[], slotBeats: number): Col[] {
  return entries.map((entry, index) => {
    if (entry === '-' || entry === '.') return emptyColumn();
    let held = 0;
    while (entries[index + 1 + held] === '-') held += 1;
    return column(entry, slotBeats * (1 + held));
  });
}

// Strum one chord shape on a pattern: 'x' strums, '-' rings on, '.' is silent.
// strum(notes('A5/1 D7/3 G7/3 B7/3'), 'xxxx-xxx', 0.25) is a bar of sixteenths.
export function strum(shape: readonly Note[], pattern: string, slotBeats: number): Col[] {
  return slots(
    [...pattern].map(char => (char === 'x' ? shape : char === '-' ? '-' : '.')),
    slotBeats,
  );
}
