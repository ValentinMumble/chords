import {Fragment, useEffect, useRef, useState, type ReactNode} from 'react';
import {PlayableTab} from './PlayableTab';
import {usePersistedState} from '../hooks/usePersistedState';
import {PRACTICE} from '../data/practice';
import {formatDuration, mergeDays, stats, usePracticeLog, type PracticeStats} from '../practiceLog';

// "Today 12 min · 3-day streak · 2 h 05 in all", leaving out what's empty.
function describe({today, total, streak}: PracticeStats): string {
  return [
    today > 0 && `Today ${formatDuration(today)}`,
    streak > 1 && `${streak}-day streak`,
    total > 0 && `${formatDuration(total)} in all`,
  ]
    .filter(Boolean)
    .join(' · ');
}

// An exercise card whose open/closed state is remembered per card in localStorage,
// so long tabs can be folded away and stay that way across visits. A card opened
// through a link (`linked`) opens even if it was folded.
function CollapsibleExercise({
  id,
  title,
  practice,
  linked,
  children,
}: {
  id: string;
  title: string;
  practice: string;
  linked: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = usePersistedState(`exercise:${id}:open`, true);
  useEffect(() => {
    if (linked) setOpen(true);
  }, [linked, setOpen]);
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
        {practice && <span className="exercise-log">{practice}</span>}
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

// The card named in the URL (/practice#someday), if there is one.
function cardFromHash(): string | null {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return INDEX.some(entry => entry.id === id) ? id : null;
}

// Keep the URL on the card last jumped to, so it can be shared or bookmarked.
// replaceState: the back button still leaves Practice, not each card.
function setCardHash(id: string | null): void {
  const {pathname, search} = window.location;
  window.history.replaceState(null, '', `${pathname}${search}${id ? `#${id}` : ''}`);
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

  // A link to one card: open it and jump there, on load and when the hash changes.
  const [linked, setLinked] = useState(cardFromHash);
  useEffect(() => {
    const onHashChange = () => setLinked(cardFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => {
    if (!linked) return;
    // After the card has opened (its effect runs first, the render follows).
    const frame = requestAnimationFrame(() => jumpTo(linked));
    return () => cancelAnimationFrame(frame);
  }, [linked]);

  const log = usePracticeLog();
  const overall = describe(stats(mergeDays(log)));
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
              setCardHash(id);
              jumpTo(id);
            }}
          >
            {label}
          </button>
        ))}
        <button
          className="practice-index-top"
          onClick={() => {
            setCardHash(null);
            window.scrollTo(0, 0);
          }}
        >
          ↑ Top
        </button>
      </nav>
      <div className="exercises">
        {overall && <p className="practice-summary">{overall}</p>}
        {PRACTICE.map(card => (
          <CollapsibleExercise
            key={card.id}
            id={card.id}
            title={card.title}
            practice={describe(stats(log[card.id] ?? {}))}
            linked={linked === card.id}
          >
            {card.tabs.map(({note, ...tab}) => (
              <Fragment key={tab.storageKey}>
                {note && <p className="exercise-note">{note}</p>}
                <PlayableTab {...tab} {...shared} logId={card.id} />
              </Fragment>
            ))}
          </CollapsibleExercise>
        ))}
      </div>
    </div>
  );
}
