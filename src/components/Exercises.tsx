import {useEffect, useRef, useState, type ReactNode} from 'react';
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
  SOMEDAY,
  SOMEDAY_CHORDS,
  SOMEDAY_CHORUS,
  SOMEDAY_CHORUS_CHORDS,
} from '../data/exercises';

// An exercise card whose open/closed state is remembered per card in localStorage,
// so long tabs can be folded away and stay that way across visits.
function CollapsibleExercise({id, title, children}: {id: string; title: string; children: ReactNode}) {
  const [open, setOpen] = usePersistedState(`exercise:${id}:open`, true);
  return (
    <section className="exercise" id={`exercise-${id}`}>
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

// Short names for the landscape jump index, in card order (ids match the cards).
const INDEX: {id: string; label: string}[] = [
  {id: 'someday', label: 'Someday'},
  {id: 'polly', label: 'Polly'},
  {id: 'miss-you', label: 'Miss You'},
  {id: 'dust', label: 'Dust in the Wind'},
  {id: 'stairway', label: 'Stairway'},
  {id: 'a-forest', label: 'A Forest'},
  {id: 'dexterity', label: 'Dexterity'},
  {id: 'chromatic', label: 'Chromatic walk'},
  {id: 'peter-gunn', label: 'Peter Gunn'},
];

// Jump straight to a card, like the iOS A–Z index. Off-screen cards are not
// rendered (content-visibility) and only take their real height once drawn, so
// a smooth scroll would stop short; jump instantly, then correct once the cards
// around the target have rendered.
function jumpTo(id: string): void {
  const card = document.getElementById(`exercise-${id}`);
  if (!card) return;
  card.scrollIntoView({block: 'start'});
  requestAnimationFrame(() => requestAnimationFrame(() => card.scrollIntoView({block: 'start'})));
}

// How long a tapped index entry stays highlighted regardless of scroll position.
const JUMP_HOLD_MS = 400;

// The card being read: the last one whose top has passed a reading line about a
// third of the way down (at most 160px), or the last card once the page is
// scrolled to the bottom. Updated at most once a frame while scrolling.
function useCurrentCard(): string {
  const [currentId, setCurrentId] = useState(INDEX[0].id);
  const frame = useRef(0);
  useEffect(() => {
    const update = () => {
      frame.current = 0;
      const line = Math.min(window.innerHeight * 0.35, 160);
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = INDEX[0].id;
      if (atBottom && window.scrollY > 0) current = INDEX[INDEX.length - 1].id;
      else
        for (const {id} of INDEX) {
          const card = document.getElementById(`exercise-${id}`);
          if (card && card.getBoundingClientRect().top <= line) current = id;
        }
      setCurrentId(current);
    };
    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return currentId;
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
  const currentId = useCurrentCard();
  const [jumpedTo, setJumpedTo] = useState<{id: string; at: number} | null>(null);
  // Right after a jump, show the tapped card even if the page can't scroll far
  // enough to bring it to the reading line (cards near the end of the page).
  const highlighted = jumpedTo && performance.now() - jumpedTo.at < JUMP_HOLD_MS ? jumpedTo.id : currentId;
  return (
    <div className="practice">
      {/* Phone landscape only (CSS): a pinned index to jump straight to a card. */}
      <nav className="practice-index" aria-label="Jump to exercise">
        {INDEX.map(({id, label}) => (
          <button
            key={id}
            aria-current={highlighted === id ? 'true' : undefined}
            onClick={() => {
              setJumpedTo({id, at: performance.now()});
              jumpTo(id);
            }}
          >
            {label}
          </button>
        ))}
        <button className="practice-index-top" onClick={() => window.scrollTo(0, 0)}>
          ↑ Top
        </button>
      </nav>
      <div className="exercises">
        <CollapsibleExercise id="someday" title="Someday — The Strokes">
          <p className="exercise-note">
            Albert Hammond Jr's intro lead: three-note shapes on the top three strings, moving between A and D around
            the 5th to 9th frets. Index barres fret 5, middle on 6, ring on 7, pinky reaches the 9. Rhythm simplified to
            steady hits so you can lock the shapes in first.
          </p>
          <PlayableTab
            bars={SOMEDAY}
            storageKey="someday"
            defaultTempo={110}
            subdiv={2}
            showRhythm
            barsPerRow={3}
            chords={SOMEDAY_CHORDS}
            firstBar={1}
            caption="The intro riff — let the last A ring before looping"
            {...shared}
          />
          <PlayableTab
            bars={SOMEDAY_CHORUS}
            storageKey="someday-chorus"
            defaultTempo={110}
            subdiv={2}
            showRhythm
            barsPerRow={3}
            chords={SOMEDAY_CHORUS_CHORDS}
            firstBar={1}
            caption="Chorus lead — double-stop on 3, high note on 4, then the double-stop again on the next downbeat"
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
      </div>
    </div>
  );
}
