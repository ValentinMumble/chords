import {GUITAR_SOUNDS} from '../audio';

interface SoundPickerProps {
  sound: string;
  onChange: (sound: string) => void;
}

export function SoundPicker({sound, onChange}: SoundPickerProps) {
  return (
    <select aria-label="Guitar sound" value={sound} onChange={event => onChange(event.target.value)}>
      {GUITAR_SOUNDS.map(entry => (
        <option key={entry.id} value={entry.id}>
          {entry.label}
        </option>
      ))}
    </select>
  );
}
