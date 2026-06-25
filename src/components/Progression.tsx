import {useEffect, useRef, useState} from 'react';
import type {Bar, Meter} from '../songs';
import type {SongPlayback} from '../hooks/useSongPlayback';

// Chord length as bars, given the meter's beats per bar.
function barLength(beats: number, beatsPerBar: number): string {
  const count = beats / beatsPerBar;
  if (count === 1) return '1 bar';
  if (count === 0.5) return '½ bar';
  return `${count} bars`;
}

// What the active pointer drag is doing: sweeping out a new range, or dragging
// one of the two loop-edge markers.
type DragMode = 'select' | 'start' | 'end';

interface ProgressionProps {
  bars: readonly Bar[];
  meter: Meter;
  playback: SongPlayback;
  onBarSelect: (index: number, extend: boolean) => void;
}

// The clickable chord strip, sitting under the diagram it drives: tap a chip to
// jump there; the current and next chips light up while playing. Drag across
// chips (or shift-click) to set a practice loop, then drag the end markers to
// fine-tune it.
export function Progression({bars, meter, playback, onBarSelect}: ProgressionProps) {
  const {playing, barIndex, nextBarIndex, loop, setLoop, clearLoop} = playback;
  const [dragMode, setDragMode] = useState<DragMode | null>(null);

  const loopRef = useRef(loop);
  loopRef.current = loop;
  // True once a drag actually moved across chips — used to swallow the click
  // that fires after a drag so it doesn't also jump/clear the loop.
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const lastIndexRef = useRef(-1);
  const anchorRef = useRef(0);

  useEffect(() => {
    if (!dragMode) return;
    function onMove(event: PointerEvent): void {
      const chip = (document.elementFromPoint(event.clientX, event.clientY) as Element | null)?.closest(
        '[data-bar-index]',
      );
      if (!chip) return;
      const index = Number(chip.getAttribute('data-bar-index'));
      if (index === lastIndexRef.current) return;
      lastIndexRef.current = index;
      if (dragMode === 'select') {
        if (index !== anchorRef.current) movedRef.current = true;
        if (movedRef.current) setLoop(anchorRef.current, index);
      } else if (dragMode === 'start') {
        const lp = loopRef.current;
        if (lp) setLoop(index, lp.end);
      } else {
        const lp = loopRef.current;
        if (lp) setLoop(lp.start, index);
      }
    }
    function onUp(): void {
      if (movedRef.current) suppressClickRef.current = true;
      setDragMode(null);
    }
    document.body.classList.add('looping-drag');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      document.body.classList.remove('looping-drag');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragMode, setLoop]);

  function startSelect(index: number, event: React.PointerEvent): void {
    if (event.button !== 0) return;
    movedRef.current = false;
    lastIndexRef.current = index;
    anchorRef.current = index;
    setDragMode('select');
  }

  function startMarker(mode: 'start' | 'end', event: React.PointerEvent): void {
    event.stopPropagation();
    event.preventDefault();
    movedRef.current = true;
    lastIndexRef.current = -1;
    setDragMode(mode);
  }

  function handleClick(index: number, event: React.MouseEvent): void {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onBarSelect(index, event.shiftKey || event.metaKey);
  }

  return (
    <div className="progression">
      <div className="bars" aria-label="Chord progression, one chip per chord">
        {bars.map((bar, index) => {
          const isCurrent = playing && index === barIndex;
          const isNext = playing && index === nextBarIndex && nextBarIndex !== barIndex;
          const inLoop = loop !== null && index >= loop.start && index <= loop.end;
          return (
            <button
              key={index}
              type="button"
              data-bar-index={index}
              className={`bar-chip${inLoop ? ' in-loop' : ''}${isCurrent ? ' current' : ''}${isNext ? ' next' : ''}`}
              style={{minWidth: 46 + (bar.beats / meter.beats) * 24}}
              onPointerDown={event => startSelect(index, event)}
              onClick={event => handleClick(index, event)}
              aria-label={`Play ${bar.name}, drag to set a practice loop`}
            >
              {loop !== null && index === loop.start && (
                <span
                  className="loop-marker left"
                  onPointerDown={event => startMarker('start', event)}
                  aria-label="Loop start"
                />
              )}
              <span className="chip-name">{bar.name}</span>
              <span className="chip-ticks" aria-label={barLength(bar.beats, meter.beats)}>
                {Array.from({length: Math.floor(bar.beats / meter.beats)}).map((_, tick) => (
                  <span key={tick} className="tick" />
                ))}
                {bar.beats % meter.beats >= meter.beats / 2 && <span className="tick half" />}
              </span>
              {loop !== null && index === loop.end && (
                <span
                  className="loop-marker right"
                  onPointerDown={event => startMarker('end', event)}
                  aria-label="Loop end"
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="loop-bar">
        {loop ? (
          <>
            <span className="loop-info">
              Looping {bars[loop.start].name}
              {loop.end !== loop.start ? ` → ${bars[loop.end].name}` : ''}
            </span>
            <button type="button" className="loop-clear" onClick={clearLoop}>
              Clear loop
            </button>
          </>
        ) : (
          <span className="loop-hint">Drag across chords to set a practice loop</span>
        )}
      </div>
    </div>
  );
}
