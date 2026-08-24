import type {ReactNode} from 'react';
import {PlayableTab} from './PlayableTab';
import {usePersistedState} from '../hooks/usePersistedState';
import {
  PETER_GUNN,
  CHROMATIC,
  STAIRCASE,
  DEXTERITY,
  FOREST,
  FOREST_RIFF,
  FOREST_RIFF_CHORDS,
  STAIRWAY,
  STAIRWAY_CHORDS,
  DUST,
  MISS_YOU,
  MISS_YOU_CHORDS,
  POLLY,
  POLLY_CHORDS,
} from '../data/exercises';

// An exercise card whose open/closed state is remembered per card in localStorage,
// so long tabs can be folded away and stay that way across visits.
function CollapsibleExercise({id, title, children}: {id: string; title: string; children: ReactNode}) {
  const [open, setOpen] = usePersistedState(`exercise:${id}:open`, true);
  return (
    <section className="exercise">
      <button
        className={`exercise-toggle${open ? '' : ' collapsed'}`}
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
      >
        <span className="exercise-caret" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        <h2>{title}</h2>
      </button>
      {open && children}
    </section>
  );
}

export function Exercises({
  activeTab,
  onActivate,
}: {
  activeTab: string | null;
  onActivate: (key: string | null) => void;
}) {
  // The exercise whose transport is currently playing; starting one stops the
  // rest. Owned by App so the space bar (handled there) can stop it.
  const shared = {activeTab, onActivate};
  return (
    <div className="exercises">
      <CollapsibleExercise id="peter-gunn" title="Peter Gunn — riff drill">
        <PlayableTab
          bars={PETER_GUNN}
          storageKey="peter-gunn-2"
          defaultTempo={65}
          subdiv={2}
          showRhythm
          barsPerRow={2}
          caption="On the low E, played twice — then run the same shape up each string"
          {...shared}
        />
      </CollapsibleExercise>

      <CollapsibleExercise id="chromatic" title="Finger independence — chromatic walk">
        <p className="exercise-note">
          One finger per fret. Walk up four frets per string, shifting up a fret each string, then reverse back down.
          Slow and even — and <strong>pick strict down-up-down-up</strong> throughout, even across string changes.
        </p>
        <PlayableTab
          bars={CHROMATIC}
          storageKey="chromatic-2"
          defaultTempo={45}
          subdiv={2}
          showRhythm
          barsPerRow={6}
          caption="Up, then back down"
          {...shared}
        />
        <p className="exercise-note">
          A staircase, four notes per string: the odd fingers (1 · 3) then the even ones (2 · 4) on the same string,
          before moving up a fret to the next string — then reverse back down (4 · 2 · 3 · 1).
        </p>
        <PlayableTab
          bars={STAIRCASE}
          storageKey="staircase-4"
          defaultTempo={45}
          subdiv={2}
          showRhythm
          barsPerRow={6}
          caption="On each string 1·3 then 2·4 — up, then back down"
          {...shared}
        />
      </CollapsibleExercise>

      <CollapsibleExercise id="dexterity" title="Dexterity exercise">
        <p className="exercise-note">
          Finger independence across the low E and A strings, one finger per fret. On each hand position play E frets{' '}
          <strong>1·2</strong> (fingers 1·2) against A frets <strong>3·4</strong> (fingers 3·4), alternating string to
          string in a <strong>1·3·2·4</strong> pattern. Slow and even, then shift the whole shape up a fret each bar.
        </p>
        <PlayableTab
          bars={DEXTERITY}
          storageKey="dexterity"
          defaultTempo={60}
          subdiv={2}
          showRhythm
          barsPerRow={2}
          caption="Climbs one fret per bar — keep every note the same length"
          {...shared}
        />
      </CollapsibleExercise>

      <CollapsibleExercise id="a-forest" title="A Forest — The Cure">
        <p className="exercise-note">
          The post-punk intro, in A minor — a melodic line on the D string over the ringing open A.
        </p>
        <PlayableTab
          bars={FOREST}
          storageKey="a-forest-5"
          defaultTempo={112}
          minTempo={20}
          subdiv={6}
          barsPerRow={2}
          firstBar={1}
          caption="Intro in Am — open-A bass alternating with the melody"
          {...shared}
        />
        <PlayableTab
          bars={FOREST_RIFF}
          storageKey="a-forest-riff-2"
          defaultTempo={160}
          minTempo={20}
          subdiv={2}
          showRhythm
          barsPerRow={4}
          chords={FOREST_RIFF_CHORDS}
          firstBar={12}
          caption="Verses then chorus — palm-muted (P.M.) power chords in straight eighths, down-picked"
          {...shared}
        />
      </CollapsibleExercise>

      <CollapsibleExercise id="stairway" title="Stairway to Heaven — intro">
        <p className="exercise-note">
          The full fingerpicked intro — let each note ring. The chords move through Am · E/G# · C · D/F# · Fmaj7 · G/B
          and around.
        </p>
        <PlayableTab
          bars={STAIRWAY}
          storageKey="stairway-2"
          defaultTempo={72}
          subdiv={2}
          showRhythm
          barsPerRow={2}
          chords={STAIRWAY_CHORDS}
          firstBar={1}
          {...shared}
        />
      </CollapsibleExercise>

      <CollapsibleExercise id="dust" title="Dust in the Wind — Kansas">
        <p className="exercise-note">
          The Travis-picking intro: one steady fingerpicking pattern the whole way, just moving the chord shape (C ·
          Cmaj7 · Cadd9 · C, then the A variations). The thumb keeps the alternating bass throughout.
        </p>
        <PlayableTab
          bars={DUST}
          storageKey="dust-2"
          defaultTempo={170}
          subdiv={4}
          showRhythm
          barsPerRow={4}
          firstBar={1}
          {...shared}
        />
      </CollapsibleExercise>

      <CollapsibleExercise id="miss-you" title="Miss You — The Rolling Stones">
        <p className="exercise-note">
          The disco-blues hook in open position, on the G and B strings — one finger per fret (1 · 2 · 3). Two bars
          over Am sing the "ooh ooh" line, and the Dm7 bar answers — let that last note ring.
        </p>
        <PlayableTab
          bars={MISS_YOU}
          storageKey="miss-you"
          defaultTempo={110}
          subdiv={2}
          showRhythm
          barsPerRow={3}
          chords={MISS_YOU_CHORDS}
          firstBar={1}
          caption="The guitar hook — loop it until it swings"
          {...shared}
        />
      </CollapsibleExercise>

      <CollapsibleExercise id="polly" title="Polly — Nirvana">
        <p className="exercise-note">
          Power chords, one ringing strum each, two beats apiece. Verse: E5 · G5 · D5 · C5, then the chorus answers
          with D5 · C5 · G5 · B♭5. Full three-string shapes: index on the root, ring on the fifth, pinky on the
          octave. Slide the same shape between positions and keep the strums lazy.
        </p>
        <PlayableTab
          bars={POLLY}
          storageKey="polly"
          defaultTempo={120}
          subdiv={2}
          showRhythm
          barsPerRow={2}
          chords={POLLY_CHORDS}
          firstBar={1}
          caption="Four chords, one strum each — the whole verse"
          {...shared}
        />
      </CollapsibleExercise>
    </div>
  );
}
