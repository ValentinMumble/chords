import {findBarres, noteName} from '../chords';
import type {Chord} from '../types';

type Variant = 'full' | 'mini';

interface Geometry {
  width: number;
  height: number;
  x0: number;
  stringGap: number;
  nutY: number;
  fretGap: number;
  fretCount: number;
  nutHeight: number;
  stringTaper: number;
  dotRadius: number;
  dotFontSize: number;
  openRadius: number;
  openOffset: number;
  muteFontSize: number;
  muteOffset: number;
  showBarre: boolean;
  showFretNumbers: boolean;
  showNoteNames: boolean;
}

const GEOMETRIES: Record<Variant, Geometry> = {
  full: {
    width: 280,
    height: 380,
    x0: 50,
    stringGap: 36,
    nutY: 56,
    fretGap: 64,
    fretCount: 4,
    nutHeight: 6,
    stringTaper: 0.25,
    dotRadius: 13,
    dotFontSize: 13,
    openRadius: 6,
    openOffset: 21,
    muteFontSize: 15,
    muteOffset: 16,
    showBarre: true,
    showFretNumbers: true,
    showNoteNames: true,
  },
  mini: {
    width: 131,
    height: 116,
    x0: 18,
    stringGap: 19,
    nutY: 22,
    fretGap: 26,
    fretCount: 3,
    nutHeight: 4,
    stringTaper: 0,
    dotRadius: 8,
    dotFontSize: 9,
    openRadius: 4,
    openOffset: 12,
    muteFontSize: 10,
    muteOffset: 9,
    showBarre: false,
    showFretNumbers: false,
    showNoteNames: false,
  },
};

export function Fretboard({chord, variant = 'full'}: {chord: Chord; variant?: Variant}) {
  const geo = GEOMETRIES[variant];
  const stringX = (stringIndex: number) => geo.x0 + stringIndex * geo.stringGap;
  const fretY = (fret: number) => geo.nutY + fret * geo.fretGap;

  const maxFret = Math.max(...chord.frets);
  const baseFret = maxFret > geo.fretCount ? Math.min(...chord.frets.filter(fret => fret > 0)) : 1;
  const dotY = (fret: number) => geo.nutY + (fret - baseFret + 0.5) * geo.fretGap;

  const strings = [0, 1, 2, 3, 4, 5];
  const fretRows = Array.from({length: geo.fretCount}, (_, row) => row + 1);

  return (
    <svg
      viewBox={`0 0 ${geo.width} ${geo.height}`}
      width={geo.width}
      height={geo.height}
      role="img"
      aria-label={`${chord.name} fingering diagram`}
    >
      {baseFret === 1 && (
        <rect
          x={geo.x0 - geo.nutHeight / 3}
          y={geo.nutY - geo.nutHeight + 1}
          width={geo.stringGap * 5 + (geo.nutHeight * 2) / 3}
          height={geo.nutHeight}
          rx={geo.nutHeight / 3}
          fill="var(--ink)"
        />
      )}
      {strings.map(stringIndex => (
        <line
          key={stringIndex}
          x1={stringX(stringIndex)}
          y1={geo.nutY}
          x2={stringX(stringIndex)}
          y2={fretY(geo.fretCount)}
          stroke="var(--line)"
          strokeWidth={1 + stringIndex * geo.stringTaper}
        />
      ))}
      {fretRows.map(row => (
        <g key={row}>
          <line x1={geo.x0} y1={fretY(row)} x2={stringX(5)} y2={fretY(row)} stroke="var(--line)" strokeWidth={1} />
          {geo.showFretNumbers && (
            <text x={geo.x0 - 26} y={fretY(row) - geo.fretGap / 2 + 4} fontSize={12} fill="var(--faint)">
              {baseFret + row - 1}
            </text>
          )}
        </g>
      ))}
      {geo.showBarre &&
        findBarres(chord).map(barre => (
          <rect
            key={`${barre.finger}:${barre.fret}`}
            x={stringX(barre.fromString) - geo.dotRadius + 1}
            y={dotY(barre.fret) - geo.dotRadius + 1}
            width={(barre.toString - barre.fromString) * geo.stringGap + (geo.dotRadius - 1) * 2}
            height={(geo.dotRadius - 1) * 2}
            rx={geo.dotRadius - 1}
            fill="var(--accent)"
            opacity={0.3}
          />
        ))}
      {chord.frets.map((fret, stringIndex) => (
        <g key={stringIndex}>
          {fret === -1 && (
            <text
              x={stringX(stringIndex)}
              y={geo.nutY - geo.muteOffset}
              textAnchor="middle"
              fontSize={geo.muteFontSize}
              fill="var(--faint)"
            >
              ✕
            </text>
          )}
          {fret === 0 && (
            <circle
              cx={stringX(stringIndex)}
              cy={geo.nutY - geo.openOffset}
              r={geo.openRadius}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={1.5}
            />
          )}
          {fret > 0 && (
            <>
              <circle cx={stringX(stringIndex)} cy={dotY(fret)} r={geo.dotRadius} fill="var(--ink)" />
              {chord.fingers[stringIndex] > 0 && (
                <text
                  x={stringX(stringIndex)}
                  y={dotY(fret) + geo.dotFontSize * 0.35}
                  textAnchor="middle"
                  fontSize={geo.dotFontSize}
                  fontWeight={600}
                  fill="var(--surface)"
                >
                  {chord.fingers[stringIndex]}
                </text>
              )}
            </>
          )}
          {geo.showNoteNames && fret >= 0 && (
            <text
              x={stringX(stringIndex)}
              y={fretY(geo.fretCount) + 26}
              textAnchor="middle"
              fontSize={13}
              fill="var(--muted)"
            >
              {noteName(stringIndex, fret)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
