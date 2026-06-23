import {chordNotes} from '../chords';
import type {Chord} from '../types';

export function ChordNotes({chord}: {chord: Chord}) {
  return (
    <div className="notes-box">
      <p className="notes-label">Notes</p>
      <div className="notes-list">
        {chordNotes(chord).map((note, index) => (
          <span key={index} className={`note${index === 0 ? ' root' : ''}`}>
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}
