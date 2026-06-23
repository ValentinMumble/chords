import {chordTones} from '../chords';
import type {Chord} from '../types';

export function ChordNotes({chord}: {chord: Chord}) {
  return (
    <div className="notes-box">
      <p className="notes-label">Notes in this chord</p>
      <div className="notes-list">
        {chordTones(chord).map((tone, index) => (
          <span key={index} className={`note${tone.degree === 'R' ? ' root' : ''}`}>
            <span className="note-name">{tone.note}</span>
            <span className="note-degree">{tone.degree}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
