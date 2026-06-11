import {useEffect, useRef} from 'react';
import {FINGER_COLORS, findBarres, noteName} from '../chords';
import type {Chord, Finger} from '../types';

const fingerColor = (finger: number) => FINGER_COLORS[finger] ?? 'var(--ink)';

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

  // When several different fingers land on the same fret, nudge them a couple
  // px off the straight line so they read like real (angled) fingers rather
  // than a rigid row. Barre fingers (alone on their fret) stay aligned.
  const fingersByFret = new Map<number, number[]>();
  ([1, 2, 3, 4] as const).forEach(finger => {
    const stringIndex = strings.find(index => chord.fingers[index] === finger);
    if (stringIndex !== undefined) {
      const fret = chord.frets[stringIndex];
      fingersByFret.set(fret, [...(fingersByFret.get(fret) ?? []), finger]);
    }
  });
  const stagger = geo.fretGap * 0.04;
  const fingerShift = (finger: number, fret: number) => {
    const group = fingersByFret.get(fret);
    if (!group || group.length < 2) return 0;
    return (group.indexOf(finger) - (group.length - 1) / 2) * stagger;
  };

  // Dots are tracked per finger, not per string: a finger that keeps its
  // position between chords (a pivot) stays anchored, while moving fingers
  // glide to their new string/fret. Lifted fingers fade out where they were.
  const lastDotPositions = useRef(new Map<Finger, {x: number; y: number}>());
  const fingerDots = ([1, 2, 3, 4] as const).map(finger => {
    const fingerStrings = strings.filter(stringIndex => chord.fingers[stringIndex] === finger);
    if (fingerStrings.length === 0) {
      return {finger, visible: false, position: lastDotPositions.current.get(finger), extras: []};
    }
    const [primaryString, ...extraStrings] = fingerStrings;
    const shift = fingerShift(finger, chord.frets[primaryString]);
    return {
      finger,
      visible: true,
      position: {x: stringX(primaryString), y: dotY(chord.frets[primaryString]) + shift},
      extras: extraStrings.map(stringIndex => ({x: stringX(stringIndex), y: dotY(chord.frets[stringIndex]) + shift})),
    };
  });

  useEffect(() => {
    fingerDots.forEach(dot => {
      if (dot.visible && dot.position) lastDotPositions.current.set(dot.finger, dot.position);
    });
  });

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
            className="barre"
            x={stringX(barre.fromString) - geo.dotRadius + 1}
            y={dotY(barre.fret) - geo.dotRadius + 1}
            width={(barre.toString - barre.fromString) * geo.stringGap + (geo.dotRadius - 1) * 2}
            height={(geo.dotRadius - 1) * 2}
            rx={geo.dotRadius - 1}
            fill={fingerColor(barre.finger)}
            opacity={0.28}
          />
        ))}
      {chord.frets.map((fret, stringIndex) => (
        <g key={stringIndex}>
          <text
            className="marker"
            x={stringX(stringIndex)}
            y={geo.nutY - geo.muteOffset}
            textAnchor="middle"
            fontSize={geo.muteFontSize}
            fill="var(--faint)"
            style={{opacity: fret === -1 ? 1 : 0}}
          >
            ✕
          </text>
          <circle
            className="marker"
            cx={stringX(stringIndex)}
            cy={geo.nutY - geo.openOffset}
            r={geo.openRadius}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={1.5}
            style={{opacity: fret === 0 ? 1 : 0}}
          />
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
      {fingerDots.map(dot =>
        dot.position ? (
          <g key={`finger-${dot.finger}`}>
            <g
              className="fret-dot"
              style={{
                transform: `translate(${dot.position.x}px, ${dot.position.y}px)`,
                opacity: dot.visible ? 1 : 0,
              }}
            >
              <circle r={geo.dotRadius} fill={fingerColor(dot.finger)} />
              <text
                y={geo.dotFontSize * 0.35}
                textAnchor="middle"
                fontSize={geo.dotFontSize}
                fontWeight={600}
                fill="#fff"
              >
                {dot.finger}
              </text>
            </g>
            {dot.extras.map((extra, extraIndex) => (
              <g key={extraIndex} className="fret-dot" style={{transform: `translate(${extra.x}px, ${extra.y}px)`}}>
                <circle r={geo.dotRadius} fill={fingerColor(dot.finger)} />
                <text
                  y={geo.dotFontSize * 0.35}
                  textAnchor="middle"
                  fontSize={geo.dotFontSize}
                  fontWeight={600}
                  fill="#fff"
                >
                  {dot.finger}
                </text>
              </g>
            ))}
          </g>
        ) : null,
      )}
    </svg>
  );
}
