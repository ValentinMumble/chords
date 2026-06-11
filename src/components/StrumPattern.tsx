import type {StrumPattern as Pattern} from '../songs';

interface StrumPatternProps {
  pattern: Pattern;
  playing: boolean;
  barSeconds: number;
}

export function StrumPattern({pattern, playing, barSeconds}: StrumPatternProps) {
  return (
    <div className="strum">
      <span className="strum-label">Strum</span>
      <div className="strum-grid">
        {playing && (
          <span className="strum-playhead" style={{animationDuration: `${barSeconds}s`}} aria-hidden="true" />
        )}
        {pattern.map((stroke, index) => {
          const kind = stroke === 'D' ? 'down' : stroke === 'U' ? 'up' : 'rest';
          const accent = stroke === 'D' && index === 0;
          return (
            <div key={index} className={`strum-slot ${kind}${accent ? ' accent' : ''}`}>
              <span className="strum-arrow">{stroke === 'D' ? '↓' : stroke === 'U' ? '↑' : ''}</span>
              <span className="strum-beat">{index % 2 === 0 ? index / 2 + 1 : '&'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
