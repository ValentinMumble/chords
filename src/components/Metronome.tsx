import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

interface MetronomeProps {
  playing: boolean;
  beatSeconds: number;
  bpm: number;
  min: number;
  max: number;
  step: number;
  onBpmChange: (bpm: number) => void;
}

const VIEW_H = 56;
// Like a real wind-up metronome: the weight high on the arm is slow, low is
// fast. These are the weight's travel limits in viewBox units.
const WEIGHT_SLOW_Y = 16;
const WEIGHT_FAST_Y = 44;

// A pendulum whose half-swing lasts one beat — the arm reaches an extreme on
// every beat, in time with the audio. It doubles as the tempo control: drag
// the weight (or use arrow keys) to set the beat, like a real metronome.
export function Metronome({playing, beatSeconds, bpm, min, max, step, onBpmChange}: MetronomeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const rawRatio = (bpm - min) / (max - min);
  const ratio = Number.isFinite(rawRatio) ? Math.min(1, Math.max(0, rawRatio)) : 0;
  const weightY = WEIGHT_SLOW_Y + ratio * (WEIGHT_FAST_Y - WEIGHT_SLOW_Y);

  function commit(value: number): void {
    onBpmChange(Math.min(max, Math.max(min, value)));
  }

  function setFromClientY(clientY: number): void {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgY = ((clientY - rect.top) / rect.height) * VIEW_H;
    const t = Math.min(1, Math.max(0, (svgY - WEIGHT_SLOW_Y) / (WEIGHT_FAST_Y - WEIGHT_SLOW_Y)));
    commit(Math.round((min + t * (max - min)) / step) * step);
  }

  function handleDown(event: ReactPointerEvent<SVGSVGElement>): void {
    dragging.current = true;
    setIsDragging(true);
    try {
      svgRef.current?.setPointerCapture(event.pointerId);
    } catch {
      // no active pointer to capture (e.g. synthetic events) — drag still works
    }
    setFromClientY(event.clientY);
  }
  function handleMove(event: ReactPointerEvent<SVGSVGElement>): void {
    if (dragging.current) setFromClientY(event.clientY);
  }
  function handleUp(event: ReactPointerEvent<SVGSVGElement>): void {
    dragging.current = false;
    setIsDragging(false);
    try {
      svgRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // capture was never established
    }
  }

  function handleKey(event: ReactKeyboardEvent<SVGSVGElement>): void {
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') commit(bpm + step);
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') commit(bpm - step);
    else if (event.key === 'Home') commit(min);
    else if (event.key === 'End') commit(max);
    else return;
    event.preventDefault();
  }

  return (
    <svg
      ref={svgRef}
      className={isDragging ? 'metronome dragging' : 'metronome'}
      viewBox="0 0 40 56"
      width="62"
      height="86"
      role="slider"
      tabIndex={0}
      aria-label="Tempo"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={bpm}
      aria-valuetext={`${bpm} bpm`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onKeyDown={handleKey}
    >
      <path d="M13 10 L27 10 L33 50 L7 50 Z" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinejoin="round" />
      <line x1="7" y1="50" x2="33" y2="50" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
      <g
        className={playing ? 'metronome-arm swinging' : 'metronome-arm'}
        style={{animationDuration: `${beatSeconds}s`}}
      >
        <line x1="20" y1="50" x2="20" y2="12" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
        <circle className="metronome-weight" cx="20" cy={weightY} r="5" fill="var(--accent)" />
      </g>
    </svg>
  );
}
