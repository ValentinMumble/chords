import { frenchShort } from '../chords';
import type { Chord } from '../types';

interface ChordGridProps {
  chords: Chord[];
  selected: string;
  onSelect: (name: string) => void;
}

export function ChordGrid({ chords, selected, onSelect }: ChordGridProps) {
  return (
    <div className="chord-grid" role="group" aria-label="Chord selection">
      {chords.map((chord) => (
        <button
          key={chord.name}
          className={chord.name === selected ? 'active' : ''}
          onClick={() => onSelect(chord.name)}
        >
          <span>{chord.name}</span>
          <span className="fr">{frenchShort(chord.name)}</span>
        </button>
      ))}
    </div>
  );
}
