// Shared types and parsers for guitar tablature. Kept out of any component so
// hooks (e.g. useTabPlayback) and components can both depend on them without a
// component importing from another component.

// A note on the tab: the fret, the finger (1-4) that plays it (for colour
// coding, like the chord diagram), and `slur` = it connects to the next note on
// the same string (hammer-on / pull-off / slide).
export type Cell = {fret: number; finger?: number; slur?: boolean} | null;

// A column is one time-slot across the six strings, high E first (index 0) to
// low E (index 5); null means that string isn't played on that slot.
export type Col = Cell[];

const emptyColumn = (): Col => [null, null, null, null, null, null];

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
