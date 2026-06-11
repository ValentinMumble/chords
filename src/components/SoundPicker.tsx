import {GUITAR_SOUNDS} from '../audio';

interface SoundPickerProps {
  sound: string;
  onChange: (sound: string) => void;
}

export function SoundPicker({sound, onChange}: SoundPickerProps) {
  return (
    <div className="sound">
      <label htmlFor="guitar-sound">🎸 Sound</label>
      <select id="guitar-sound" value={sound} onChange={event => onChange(event.target.value)}>
        {GUITAR_SOUNDS.map(entry => (
          <option key={entry.id} value={entry.id}>
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  );
}
