import {CHORDS_BY_NAME, frenchName, type ChordName} from '../chords';
import {Fretboard} from './Fretboard';

export function NextUpCard({chordName}: {chordName: ChordName}) {
  return (
    <div className="next-box" aria-live="polite">
      <p className="next-label">Next up</p>
      <p className="next-name">{chordName}</p>
      <p className="next-fr">{frenchName(chordName)}</p>
      <Fretboard chord={CHORDS_BY_NAME[chordName]} variant="mini" />
    </div>
  );
}
