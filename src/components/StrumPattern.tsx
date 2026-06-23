import type {PickPattern, StrumPattern as Pattern} from '../songs';

interface StrumPatternProps {
  pattern: Pattern;
  pick?: PickPattern;
  playing: boolean;
  subdivision: number;
  barSeconds: number;
}

// Beat label under each slot: simple meters count "1 & 2 & …"; compound meters
// (subdivision 3, e.g. 6/8) count every subdivision "1 2 3 4 5 6".
function slotLabel(index: number, subdivision: number): string {
  if (subdivision === 2) return index % 2 === 0 ? String(index / 2 + 1) : '&';
  return String(index + 1);
}

export function StrumPattern({pattern, pick, playing, subdivision, barSeconds}: StrumPatternProps) {
  const picking = pick !== undefined;
  const slots = pick ?? pattern;
  return (
    <div className="strum">
      <span className="strum-label">{picking ? 'Pick' : 'Strum'}</span>
      <div className="strum-grid">
        {playing && (
          <span className="strum-playhead" style={{animationDuration: `${barSeconds}s`}} aria-hidden="true" />
        )}
        {slots.map((slot, index) => {
          if (picking) {
            const voice = slot as number | null;
            const active = voice !== null;
            const bass = voice === 0;
            return (
              <div key={index} className={`strum-slot ${active ? 'pluck' : 'rest'}${bass ? ' accent' : ''}`}>
                <span className="pluck-dot">{active ? <span /> : null}</span>
                <span className="strum-beat">{slotLabel(index, subdivision)}</span>
              </div>
            );
          }
          const stroke = slot as Pattern[number];
          const kind = stroke === 'D' ? 'down' : stroke === 'U' ? 'up' : 'rest';
          const accent = stroke === 'D' && index === 0;
          return (
            <div key={index} className={`strum-slot ${kind}${accent ? ' accent' : ''}`}>
              <span className="strum-arrow">{stroke === 'D' ? '↓' : stroke === 'U' ? '↑' : ''}</span>
              <span className="strum-beat">{slotLabel(index, subdivision)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
