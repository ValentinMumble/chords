import {FILTER_TYPES, SHAPE_FILTERS, type ChordFilter, type ShapeFilter} from '../chords';

interface ChordFiltersProps {
  filter: ChordFilter;
  onFilterChange: (key: ChordFilter) => void;
  shape: ShapeFilter;
  onShapeChange: (key: ShapeFilter) => void;
}

export function ChordFilters({filter, onFilterChange, shape, onShapeChange}: ChordFiltersProps) {
  return (
    <div className="filters">
      <div role="group" aria-label="Filter chords by type" style={{display: 'contents'}}>
        {FILTER_TYPES.map(type => (
          <button
            key={type.key}
            className={filter === type.key ? 'active' : ''}
            onClick={() => onFilterChange(type.key)}
          >
            {type.label}
          </button>
        ))}
      </div>
      <span className="filter-divider" aria-hidden="true" />
      <div role="group" aria-label="Filter chords by shape" style={{display: 'contents'}}>
        {SHAPE_FILTERS.map(entry => (
          <button
            key={entry.key}
            className={shape === entry.key ? 'active' : ''}
            onClick={() => onShapeChange(shape === entry.key ? 'any' : entry.key)}
          >
            {entry.label}
          </button>
        ))}
      </div>
    </div>
  );
}
