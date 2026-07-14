import type {ReactNode} from 'react';
import {PlayableTab} from './PlayableTab';
import {usePersistedState} from '../hooks/usePersistedState';
import {
  PETER_GUNN,
  CHROMATIC,
  STAIRCASE,
  FOREST,
  FOREST_RIFF,
  STAIRWAY,
  STAIRWAY_CHORDS,
  DUST,
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
          storageKey="peter-gunn"
          defaultTempo={130}
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
          storageKey="chromatic"
          defaultTempo={90}
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
          storageKey="staircase-3"
          defaultTempo={90}
          barsPerRow={6}
          caption="On each string 1·3 then 2·4 — up, then back down"
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
          storageKey="a-forest-riff"
          defaultTempo={120}
          minTempo={20}
          subdiv={2}
          barsPerRow={3}
          firstBar={1}
          caption="Two-note stops — let them ring, dig into the accents"
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
          evenNotes
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
          barsPerRow={4}
          firstBar={1}
          {...shared}
        />
      </CollapsibleExercise>
    </div>
  );
}
