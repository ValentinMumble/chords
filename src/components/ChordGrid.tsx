import {frenchShort} from '../chords';
import type {Chord, ChordType} from '../types';
import styles from './ChordGrid.module.css';

interface ChordGridProps {
  chords: readonly Chord[];
  selected: string;
  onSelect: (name: string) => void;
}

// Library order: chords are grouped by type, shown under a small section label.
const SECTIONS: {type: ChordType; label: string}[] = [
  {type: 'major', label: 'Major'},
  {type: 'minor', label: 'Minor'},
  {type: 'seventh', label: 'Sevenths'},
  {type: 'other', label: 'Suspended & added'},
];

export function ChordGrid({chords, selected, onSelect}: ChordGridProps) {
  const sections = SECTIONS.map(section => ({
    ...section,
    items: chords.filter(chord => chord.type === section.type),
  })).filter(section => section.items.length > 0);
  // A single section is already named by the active filter, so skip its header.
  const showHeaders = sections.length > 1;

  return (
    <div className={styles.sections}>
      {sections.map(section => (
        <section key={section.type} className={styles.section}>
          {showHeaders && <h3 className={styles.sectionLabel}>{section.label}</h3>}
          <div className={styles.grid} role="group" aria-label={`${section.label} chords`}>
            {section.items.map(chord => (
              <button
                key={chord.name}
                className={chord.name === selected ? styles.active : undefined}
                onClick={() => onSelect(chord.name)}
              >
                <span>{chord.name}</span>
                <span className={styles.fr}>{frenchShort(chord.name)}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
