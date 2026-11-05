import {column, type Col} from '../../tab';
import {evenEighths} from './shared';
import type {PracticeCard} from './types';

// The chromatic finger exercise: low E at fret 1 with fingers 1-2-3-4, then each
// higher string starts one fret higher, up to the high E with finger 4 on fret
// 9. Grouped four-to-a-bar so the position shift reads as a staircase.
function chromaticBars(descending: boolean): Col[][] {
  const steps: {physicalString: number; fret: number; finger: number}[] = [];
  for (let physicalString = 0; physicalString < 6; physicalString++) {
    for (let step = 0; step < 4; step++) {
      steps.push({physicalString, fret: physicalString + 1 + step, finger: step + 1});
    }
  }
  const sequence = descending ? [...steps].reverse() : steps;
  const bars: Col[][] = [];
  for (let index = 0; index < sequence.length; index += 4) {
    bars.push(
      sequence.slice(index, index + 4).map(step => column([[5 - step.physicalString, step.fret, step.finger]])),
    );
  }
  return bars;
}

// Peter Gunn (simplified): the open-string pedal alternating with frets 2·3·5·4
// (one per finger), giving 0·0·2·0·3·0·5·4. Shown on the low E only (played
// twice); run the same shape up every string.
function peterGunnBars(): Col[][] {
  const bar = [0, 0, 2, 0, 3, 0, 5, 4].map(fret => column([[5, fret, fret === 0 ? undefined : fret - 1]]));
  return [bar, bar];
}

// Staircase finger-independence drill: within the same shifting four-fret box as
// the chromatic walk (one fret higher per string), each string plays all four
// notes, the odd fingers (1 and 3) then the even fingers (2 and 4) on that same
// string, before moving up. Finger n frets baseFret + (n-1). Coming back down
// mirrors it: strings high-to-low, fingers 4·2·3·1.
function staircaseBars(descending: boolean): Col[][] {
  const strings = descending ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
  const fingers = descending ? [4, 2, 3, 1] : [1, 3, 2, 4];
  return strings.map(physicalString =>
    fingers.map(finger => column([[5 - physicalString, physicalString + 1 + (finger - 1), finger]])),
  );
}

// Dexterity drill across the low E and A strings with the 1-3-2-4 finger
// pattern. First half of the bar: low E plays frets k and k+1 (fingers 1·2)
// against the A string's k+2 and k+3 (fingers 3·4). Second half swaps the
// strings. Eight even eighths per bar, then the whole shape climbs one fret.
// Rows 4 = A, 5 = low E.
function dexterityBars(positions: number): Col[][] {
  return Array.from({length: positions}, (_unused, index) => {
    const fret = index + 1; // hand position: bar 1 starts at fret 1, bar 2 at 2 …
    const half = (lowRow: number, highRow: number) => [
      column([[lowRow, fret, 1]]),
      column([[highRow, fret + 2, 3]]),
      column([[lowRow, fret + 1, 2]]),
      column([[highRow, fret + 3, 4]]),
    ];
    return [...half(5, 4), ...half(4, 5)];
  });
}

// The spider: frets 1-2-3-4 with fingers 1-2-3-4 on every string, from the high
// e down to the low E, one string per bar. Each finger stays down until it's
// needed on the next string.
function spiderBars(): Col[][] {
  return [0, 1, 2, 3, 4, 5].map(row => [1, 2, 3, 4].map(fret => column([[row, fret, fret]])));
}

// Computed once at module load (stable references), so switching to Practice and
// re-renders don't rebuild these arrays or the tabs derived from them.
export const PETER_GUNN = evenEighths(peterGunnBars());
export const CHROMATIC = evenEighths([...chromaticBars(false), ...chromaticBars(true)]);
export const STAIRCASE = evenEighths([...staircaseBars(false), ...staircaseBars(true)]);
export const DEXTERITY = evenEighths(dexterityBars(4));
export const SPIDER = evenEighths(spiderBars());

export const dexterity: PracticeCard = {
  id: 'dexterity',
  title: 'Dexterity exercise',
  label: 'Dexterity',
  tabs: [
    {
      note: (
        <>
          Finger independence across the low E and A strings, one finger per fret. On each hand position play E frets{' '}
          <strong>1·2</strong> (fingers 1·2) against A frets <strong>3·4</strong> (fingers 3·4), alternating string to
          string in a <strong>1·3·2·4</strong> pattern. Slow and even, then shift the whole shape up a fret each bar.
        </>
      ),
      bars: DEXTERITY,
      storageKey: 'dexterity',
      defaultTempo: 60,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 2,
      caption: 'Climbs one fret per bar — keep every note the same length',
    },
    {
      note: (
        <>
          The spider: frets 1·2·3·4 with fingers 1·2·3·4 on each string, from the high e down to the low E.{' '}
          <strong>Keep each finger down as long as you can</strong>, lifting it only when it moves to the next string.
        </>
      ),
      bars: SPIDER,
      storageKey: 'spider',
      defaultTempo: 50,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 6,
      caption: 'One string per bar, fingers stay down',
    },
  ],
};

export const chromatic: PracticeCard = {
  id: 'chromatic',
  title: 'Finger independence — chromatic walk',
  label: 'Chromatic walk',
  tabs: [
    {
      note: (
        <>
          One finger per fret. Walk up four frets per string, shifting up a fret each string, then reverse back down.
          Slow and even — and <strong>pick strict down-up-down-up</strong> throughout, even across string changes.
        </>
      ),
      bars: CHROMATIC,
      storageKey: 'chromatic-2',
      defaultTempo: 45,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 6,
      caption: 'Up, then back down',
    },
    {
      note: (
        <>
          A staircase, four notes per string: the odd fingers (1 · 3) then the even ones (2 · 4) on the same string,
          before moving up a fret to the next string — then reverse back down (4 · 2 · 3 · 1).
        </>
      ),
      bars: STAIRCASE,
      storageKey: 'staircase-4',
      defaultTempo: 45,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 6,
      caption: 'On each string 1·3 then 2·4 — up, then back down',
    },
  ],
};

export const peterGunn: PracticeCard = {
  id: 'peter-gunn',
  title: 'Peter Gunn — riff drill',
  label: 'Peter Gunn',
  tabs: [
    {
      bars: PETER_GUNN,
      storageKey: 'peter-gunn-2',
      defaultTempo: 65,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 2,
      caption: 'On the low E, played twice — then run the same shape up each string',
    },
  ],
};
