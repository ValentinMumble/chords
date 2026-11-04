import {applyRhythm, column, notes, slots, strum, type Note} from '../../tab';
import type {PracticeCard} from './types';

// Someday — The Strokes: Albert Hammond Jr's intro/verse lead, three-note shapes
// on the G·B·e strings over A and D. Verse rhythm simplified to mostly quarter-
// note hits so it is easy to lock in: bar 1 A then the D shape, bar 2 the high
// C# pull back to A, bar 3 the A held. Fingers: 5 index, 6 middle, 7 ring, 9 pinky.
const A = column(notes('e5/1 B5/1 G6/2'));
const D = column(notes('e5/1 B7/3 G7/3'));
const SOMEDAY_RHYTHM = [[1, 1, 1, 1], [1, 1, 2], [4]];
export const SOMEDAY = applyRhythm(
  [
    [A, column(notes('e7/3 B5/1 G6/2')), D, column(notes('e7/3 B7/3 G7/3'))], // A, A up to B, D, D6
    [column(notes('e9/4 B7/3 G7/3')), column(notes('e7/3 B7/3 G7/3')), column(notes('e7/3 B5/1 G6/2'))], // Dmaj7, D6, A
    [A], // let it ring
  ],
  barIndex => SOMEDAY_RHYTHM[barIndex],
  2,
);
export const SOMEDAY_CHORDS = ['A · D', 'D · A', 'A'];

// The chorus lead (Albert Hammond Jr), moved one string down from the record
// (same notes, on the B and G strings): double-stops with a high note on top,
// stepping down A → C#m → F#m, then the D and A shapes back up on the G·B·e
// strings in 5th position (as in the verse lead). Each group lands its
// double-stop on beat 3, the high note on 4, and repeats the same double-stop on
// the next downbeat. Two slots per beat; '-' lets the notes ring, '.' is silent.
const chorusBar = (...entries: (string | '-' | '.')[]) =>
  slots(
    entries.map(entry => (entry === '-' || entry === '.' ? entry : notes(entry))),
    0.5,
  );
export const SOMEDAY_CHORUS = [
  chorusBar('.', '.', '.', '.', 'B14/1 G14/1', '-', 'B17/4', '-'), // C# · A, then E
  chorusBar('B14/1 G14/1', '-', '-', '-', 'B12/1 G13/2', '-', 'B15/4', '-'), // B · G#, then D
  chorusBar('B12/1 G13/2', '-', '-', '-', 'B10/1 G11/2', '-', 'B14/4', '-'), // A · F#, then C#
  chorusBar('B10/1 G11/2', '-', '-', '-', 'e5/1 B7/3 G7/3', '-', '-', '-'), // D
  chorusBar('e5/1 B5/1 G6/2', '-', '-', '-', '-', '-', '-', '-'), // A, let it ring
];
export const SOMEDAY_CHORUS_CHORDS = ['A', 'C#m', 'F#m', 'D', 'A'];

// Nick Valensi's rhythm part: A/E and D strummed in constant down-up sixteenths
// (106 bpm). Verse bars: A/E, then D twice; the first D bar lets the chord ring
// through the first sixteenth of beats 2 and 4.
const A_OVER_E: Note[] = notes('e5/1 B5/1 G6/2 D7/3 A7/4');
const D_CHORD: Note[] = notes('B7/3 G7/3 D7/3 A5/1');
export const SOMEDAY_RHYTHM_PART = [
  strum(A_OVER_E, 'xxxxxxxxxxxxxxxx', 0.25),
  strum(D_CHORD, 'xxxx-xxxxxxx-xxx', 0.25),
  strum(D_CHORD, 'xxxxxxxxxxxxxxxx', 0.25),
];
export const SOMEDAY_RHYTHM_CHORDS = ['A/E', 'D', 'D'];

export const someday: PracticeCard = {
  id: 'someday',
  title: 'Someday — The Strokes',
  label: 'Someday',
  tabs: [
    {
      note: (
        <>
          Albert Hammond Jr's intro lead: three-note shapes on the top three strings, moving between A and D around the
          5th to 9th frets. Index barres fret 5, middle on 6, ring on 7, pinky reaches the 9. Rhythm simplified to
          steady hits so you can lock the shapes in first.
        </>
      ),
      bars: SOMEDAY,
      storageKey: 'someday',
      defaultTempo: 110,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 3,
      chords: SOMEDAY_CHORDS,
      firstBar: 1,
      caption: 'The intro riff — let the last A ring before looping',
    },
    {
      bars: SOMEDAY_CHORUS,
      storageKey: 'someday-chorus',
      defaultTempo: 110,
      subdiv: 2,
      showRhythm: true,
      barsPerRow: 3,
      chords: SOMEDAY_CHORUS_CHORDS,
      firstBar: 1,
      caption: 'Chorus lead — double-stop on 3, high note on 4, then the double-stop again on the next downbeat',
    },
    {
      bars: SOMEDAY_RHYTHM_PART,
      storageKey: 'someday-rhythm',
      defaultTempo: 106,
      subdiv: 4,
      showRhythm: true,
      barsPerRow: 1,
      chords: SOMEDAY_RHYTHM_CHORDS,
      firstBar: 1,
      caption: 'Rhythm part (Nick Valensi) — A/E then D, constant down-up sixteenths; let the held chords ring',
    },
  ],
};
