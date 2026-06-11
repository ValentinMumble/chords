import { CHORDS_BY_NAME, frenchName } from '../chords';
import { MiniDiagram } from './MiniDiagram';

export function NextUpCard({ chordName }: { chordName: string }) {
  return (
    <div className="next-box visible" aria-live="polite">
      <p className="next-label">Next up</p>
      <p className="next-name">{chordName}</p>
      <p className="next-fr">{frenchName(chordName)}</p>
      <MiniDiagram chord={CHORDS_BY_NAME[chordName]} />
    </div>
  );
}
