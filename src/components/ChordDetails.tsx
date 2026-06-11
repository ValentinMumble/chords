import {frenchName} from '../chords';
import {strumChord} from '../audio';
import type {Chord} from '../types';

export function ChordDetails({chord}: {chord: Chord}) {
  return (
    <div className="panel">
      <p className="chord-title">{chord.name}</p>
      <p className="chord-sub">
        {chord.desc} · {frenchName(chord.name)}
      </p>
      <div className="actions">
        <button onClick={() => strumChord(chord, 0.045)}>&#9654;&#xFE0E; Strum</button>
        <button onClick={() => strumChord(chord, 0.35)}>&#9836;&#xFE0E; One by one</button>
      </div>
      <div className="help">
        <p>
          Vertical lines are strings, low E on the left. Numbered dots show which finger to use: 1 index, 2 middle, 3
          ring, 4 pinky.
        </p>
        <p>
          An O above the nut means play the string open; an &#x2715; means don't play it. Note names appear under each
          string.
        </p>
        <p>
          Keyboard: <kbd>&#x2190;</kbd> <kbd>&#x2192;</kbd> to change chord (or jump bars while a song plays),{' '}
          <kbd>space</kbd> to strum, <kbd>a</kbd> for one by one.
        </p>
      </div>
    </div>
  );
}
