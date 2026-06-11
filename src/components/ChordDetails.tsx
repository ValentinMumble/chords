export function ChordDetails() {
  return (
    <div className="panel">
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
          <kbd>space</kbd> to strum, <kbd>a</kbd> for arpeggio.
        </p>
      </div>
    </div>
  );
}
