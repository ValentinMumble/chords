import type {Bar, Meter} from '../songs';
import type {SongPlayback} from '../hooks/useSongPlayback';

// Chord length as bars, given the meter's beats per bar.
function barLength(beats: number, beatsPerBar: number): string {
  const count = beats / beatsPerBar;
  if (count === 1) return '1 bar';
  if (count === 0.5) return '½ bar';
  return `${count} bars`;
}

interface ProgressionProps {
  bars: readonly Bar[];
  meter: Meter;
  playback: SongPlayback;
  onBarSelect: (index: number) => void;
}

// The clickable chord strip, sitting under the diagram it drives: tap a chip to
// jump there; the current and next chips light up while playing.
export function Progression({bars, meter, playback, onBarSelect}: ProgressionProps) {
  const {playing, barIndex, nextBarIndex} = playback;
  return (
    <div className="bars" aria-label="Chord progression, one chip per chord">
      {bars.map((bar, index) => {
        const isCurrent = playing && index === barIndex;
        const isNext = playing && index === nextBarIndex && nextBarIndex !== barIndex;
        return (
          <button
            key={index}
            type="button"
            className={`bar-chip${isCurrent ? ' current' : ''}${isNext ? ' next' : ''}`}
            style={{minWidth: 46 + (bar.beats / meter.beats) * 24}}
            onClick={() => onBarSelect(index)}
            aria-label={`Play ${bar.name}`}
          >
            <span className="chip-name">{bar.name}</span>
            <span className="chip-ticks" aria-label={barLength(bar.beats, meter.beats)}>
              {Array.from({length: Math.floor(bar.beats / meter.beats)}).map((_, tick) => (
                <span key={tick} className="tick" />
              ))}
              {bar.beats % meter.beats >= meter.beats / 2 && <span className="tick half" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
