import { FILTER_TYPES } from '../chords';

interface ChordFiltersProps {
  filter: string;
  onChange: (key: string) => void;
}

export function ChordFilters({ filter, onChange }: ChordFiltersProps) {
  return (
    <div className="filters" role="group" aria-label="Filter chords by type">
      {FILTER_TYPES.map((type) => (
        <button
          key={type.key}
          className={filter === type.key ? 'active' : ''}
          onClick={() => onChange(type.key)}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
