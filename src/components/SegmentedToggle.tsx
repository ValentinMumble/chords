import styles from './SegmentedToggle.module.css';

// A pill toggle with a sliding highlight behind the active option — used for the
// top-bar mode switch and the song difficulty switch. The indicator slides by
// one button width per step, so every button must be the same fixed width (see
// the module stylesheet).
interface SegmentedToggleProps<T extends string> {
  items: readonly {key: T; label: string}[];
  value: T;
  onChange: (key: T) => void;
  ariaLabel: string;
  className?: string;
}

export function SegmentedToggle<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedToggleProps<T>) {
  const activeIndex = Math.max(
    0,
    items.findIndex(item => item.key === value),
  );
  return (
    <div className={`${styles.toggle}${className ? ` ${className}` : ''}`} role="group" aria-label={ariaLabel}>
      <span className={styles.indicator} style={{transform: `translateX(${activeIndex * 100}%)`}} aria-hidden="true" />
      {items.map(item => (
        <button
          key={item.key}
          className={value === item.key ? styles.active : undefined}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
