import { noteName } from '../chords';
import type { Chord } from '../types';

const X0 = 50, STR_GAP = 36, NUT_Y = 56, FRET_GAP = 64, N_FRETS = 4;

export function Board({ chord }: { chord: Chord }) {
  const maxFret = Math.max(...chord.frets);
  const baseFret = maxFret > N_FRETS ? Math.min(...chord.frets.filter((fret) => fret > 0)) : 1;

  const barres: Record<string, number[]> = {};
  chord.fingers.forEach((finger, stringIndex) => {
    if (finger > 0) {
      const key = `${finger}:${chord.frets[stringIndex]}`;
      (barres[key] = barres[key] ?? []).push(stringIndex);
    }
  });

  return (
    <svg viewBox="0 0 280 380" width="280" height="380" role="img" aria-label={`${chord.name} fingering diagram`}>
      {baseFret === 1 && <rect x={X0 - 2} y={NUT_Y - 5} width={STR_GAP * 5 + 4} height={6} rx={2} fill="var(--ink)" />}
      {[0, 1, 2, 3, 4, 5].map((stringIndex) => (
        <line
          key={stringIndex}
          x1={X0 + stringIndex * STR_GAP} y1={NUT_Y}
          x2={X0 + stringIndex * STR_GAP} y2={NUT_Y + N_FRETS * FRET_GAP}
          stroke="var(--line)" strokeWidth={1 + stringIndex * 0.25}
        />
      ))}
      {[1, 2, 3, 4].map((fret) => (
        <g key={fret}>
          <line x1={X0} y1={NUT_Y + fret * FRET_GAP} x2={X0 + STR_GAP * 5} y2={NUT_Y + fret * FRET_GAP} stroke="var(--line)" strokeWidth={1} />
          <text x={X0 - 26} y={NUT_Y + fret * FRET_GAP - FRET_GAP / 2 + 4} fontSize={12} fill="var(--faint)">{baseFret + fret - 1}</text>
        </g>
      ))}
      {Object.entries(barres)
        .filter(([, strings]) => strings.length > 2)
        .map(([key, strings]) => {
          const fret = Number(key.split(':')[1]) - baseFret + 1;
          return (
            <rect
              key={key}
              x={X0 + Math.min(...strings) * STR_GAP - 12}
              y={NUT_Y + (fret - 0.5) * FRET_GAP - 12}
              width={(Math.max(...strings) - Math.min(...strings)) * STR_GAP + 24}
              height={24} rx={12} fill="var(--accent)" opacity={0.3}
            />
          );
        })}
      {chord.frets.map((fret, stringIndex) => {
        const x = X0 + stringIndex * STR_GAP;
        const dotY = NUT_Y + (fret - baseFret + 0.5) * FRET_GAP;
        return (
          <g key={stringIndex}>
            {fret === -1 && <text x={x} y={NUT_Y - 16} textAnchor="middle" fontSize={15} fill="var(--faint)">✕</text>}
            {fret === 0 && <circle cx={x} cy={NUT_Y - 21} r={6} fill="none" stroke="var(--ink)" strokeWidth={1.5} />}
            {fret > 0 && (
              <>
                <circle cx={x} cy={dotY} r={13} fill="var(--ink)" />
                {chord.fingers[stringIndex] > 0 && (
                  <text x={x} y={dotY + 4.5} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--surface)">
                    {chord.fingers[stringIndex]}
                  </text>
                )}
              </>
            )}
            {fret >= 0 && (
              <text x={x} y={NUT_Y + N_FRETS * FRET_GAP + 26} textAnchor="middle" fontSize={13} fill="var(--muted)">
                {noteName(stringIndex, fret)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const MX = 18, MGAP = 19, MNUT = 22, MFGAP = 26, MNF = 3;

export function MiniDiagram({ chord }: { chord: Chord }) {
  return (
    <svg viewBox="0 0 131 116" width={131} height={116} role="img" aria-label={`${chord.name} fingering`}>
      <rect x={MX - 1.5} y={MNUT - 3.5} width={MGAP * 5 + 3} height={4} rx={1.5} fill="var(--ink)" />
      {[0, 1, 2, 3, 4, 5].map((stringIndex) => (
        <line
          key={stringIndex}
          x1={MX + stringIndex * MGAP} y1={MNUT}
          x2={MX + stringIndex * MGAP} y2={MNUT + MNF * MFGAP}
          stroke="var(--line)" strokeWidth={1}
        />
      ))}
      {[1, 2, 3].map((fret) => (
        <line key={fret} x1={MX} y1={MNUT + fret * MFGAP} x2={MX + MGAP * 5} y2={MNUT + fret * MFGAP} stroke="var(--line)" strokeWidth={1} />
      ))}
      {chord.frets.map((fret, stringIndex) => {
        const x = MX + stringIndex * MGAP;
        const dotY = MNUT + (fret - 0.5) * MFGAP;
        return (
          <g key={stringIndex}>
            {fret === -1 && <text x={x} y={MNUT - 9} textAnchor="middle" fontSize={10} fill="var(--faint)">✕</text>}
            {fret === 0 && <circle cx={x} cy={MNUT - 12} r={4} fill="none" stroke="var(--ink)" strokeWidth={1.2} />}
            {fret > 0 && (
              <>
                <circle cx={x} cy={dotY} r={8} fill="var(--ink)" />
                {chord.fingers[stringIndex] > 0 && (
                  <text x={x} y={dotY + 3.5} textAnchor="middle" fontSize={9} fontWeight={500} fill="var(--surface)">
                    {chord.fingers[stringIndex]}
                  </text>
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
