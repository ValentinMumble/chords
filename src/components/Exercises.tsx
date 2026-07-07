import {PlayableTab} from './PlayableTab';
import {PETER_GUNN, CHROMATIC, FOREST, STAIRWAY, STAIRWAY_CHORDS, DUST} from '../data/exercises';

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
      <section className="exercise">
        <h2>Peter Gunn — riff drill</h2>
        <PlayableTab
          bars={PETER_GUNN}
          storageKey="peter-gunn"
          defaultTempo={130}
          barsPerRow={2}
          caption="On the low E, played twice — then run the same shape up each string"
          {...shared}
        />
      </section>

      <section className="exercise">
        <h2>Finger independence — chromatic walk</h2>
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
      </section>

      <section className="exercise">
        <h2>A Forest — The Cure</h2>
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
      </section>

      <section className="exercise">
        <h2>Stairway to Heaven — intro</h2>
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
      </section>

      <section className="exercise">
        <h2>Dust in the Wind — Kansas</h2>
        <p className="exercise-note">
          The Travis-picking intro: one steady fingerpicking pattern the whole way, just moving the chord shape (C ·
          Cmaj7 · Cadd9 · C, then the A variations). The thumb keeps the alternating bass throughout.
        </p>
        <PlayableTab
          bars={DUST}
          storageKey="dust"
          defaultTempo={86}
          subdiv={4}
          barsPerRow={4}
          firstBar={1}
          {...shared}
        />
      </section>
    </div>
  );
}
