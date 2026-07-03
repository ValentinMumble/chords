import {FILTER_TYPES, SHAPE_FILTERS, type ChordFilter, type ShapeFilter} from '../chords';
import styles from './ChordFilters.module.css';

interface ChordFiltersProps {
  filter: ChordFilter;
  onFilterChange: (key: ChordFilter) => void;
  shape: ShapeFilter;
  onShapeChange: (key: ShapeFilter) => void;
}

export function ChordFilters({filter, onFilterChange, shape, onShapeChange}: ChordFiltersProps) {
  return (
    <div className={styles.filters}>
      <div role="group" aria-label="Filter chords by type" style={{display: 'contents'}}>
        {FILTER_TYPES.map(type => (
          <button
            key={type.key}
            className={filter === type.key ? styles.active : undefined}
            onClick={() => onFilterChange(type.key)}
          >
            {type.label}
          </button>
        ))}
      </div>
      <span className={styles.divider} aria-hidden="true" />
      <div role="group" aria-label="Filter chords by shape" style={{display: 'contents'}}>
        {SHAPE_FILTERS.map(entry => (
          <button
            key={entry.key}
            className={shape === entry.key ? styles.active : undefined}
            onClick={() => onShapeChange(shape === entry.key ? 'any' : entry.key)}
          >
            {entry.label}
          </button>
        ))}
      </div>
    </div>
  );
}
