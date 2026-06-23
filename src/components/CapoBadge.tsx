// A small capo on a neck: faint strings running across a fretboard, with the
// capo bar (and its grip) clamped over them.
export function CapoBadge({fret}: {fret: number}) {
  return (
    <span className="capo-badge">
      <svg className="capo-icon" viewBox="0 0 46 30" width="34" height="22" aria-hidden="true">
        <rect
          x="3"
          y="6"
          width="40"
          height="18"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
        />
        {[0, 1, 2, 3, 4, 5].map(string => (
          <line
            key={string}
            x1="3"
            y1={8 + string * 2.8}
            x2="43"
            y2={8 + string * 2.8}
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.3"
          />
        ))}
        <rect x="14" y="2" width="6" height="26" rx="3" fill="currentColor" />
        <circle cx="17" cy="26.5" r="3.4" fill="currentColor" />
      </svg>
      Capo {fret}
    </span>
  );
}
