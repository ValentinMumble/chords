import type {Chord} from '../types';

const MX = 18,
  MGAP = 19,
  MNUT = 22,
  MFGAP = 26,
  MNF = 3;

export function MiniDiagram({chord}: {chord: Chord}) {
  return (
    <svg viewBox="0 0 131 116" width={131} height={116} role="img" aria-label={`${chord.name} fingering`}>
      <rect x={MX - 1.5} y={MNUT - 3.5} width={MGAP * 5 + 3} height={4} rx={1.5} fill="var(--ink)" />
      {[0, 1, 2, 3, 4, 5].map(stringIndex => (
        <line
          key={stringIndex}
          x1={MX + stringIndex * MGAP}
          y1={MNUT}
          x2={MX + stringIndex * MGAP}
          y2={MNUT + MNF * MFGAP}
          stroke="var(--line)"
          strokeWidth={1}
        />
      ))}
      {[1, 2, 3].map(fret => (
        <line
          key={fret}
          x1={MX}
          y1={MNUT + fret * MFGAP}
          x2={MX + MGAP * 5}
          y2={MNUT + fret * MFGAP}
          stroke="var(--line)"
          strokeWidth={1}
        />
      ))}
      {chord.frets.map((fret, stringIndex) => {
        const x = MX + stringIndex * MGAP;
        const dotY = MNUT + (fret - 0.5) * MFGAP;
        return (
          <g key={stringIndex}>
            {fret === -1 && (
              <text x={x} y={MNUT - 9} textAnchor="middle" fontSize={10} fill="var(--faint)">
                ✕
              </text>
            )}
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
