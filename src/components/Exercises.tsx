import {Fragment, useEffect, useRef, useState, type ReactNode} from 'react';
import {PlayableTab} from './PlayableTab';
import {usePersistedState} from '../hooks/usePersistedState';
import {PRACTICE} from '../data/practice';

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

// The side index, in card order: each card's id and short name.
const INDEX = PRACTICE.map(({id, label}) => ({id, label}));

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
        {PRACTICE.map(card => (
          <CollapsibleExercise key={card.id} id={card.id} title={card.title}>
            {card.tabs.map(({note, ...tab}) => (
              <Fragment key={tab.storageKey}>
                {note && <p className="exercise-note">{note}</p>}
                <PlayableTab {...tab} {...shared} />
              </Fragment>
            ))}
          </CollapsibleExercise>
        ))}
      </div>
    </div>
  );
}
