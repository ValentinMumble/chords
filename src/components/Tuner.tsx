import {useState} from 'react';
import {currentTime, pluckMidi} from '../audio';
import {usePitchDetector} from '../hooks/usePitchDetector';
import {centsBetween, midiToHz, nearestString, noteName} from '../pitch';
import {TUNING} from '../tuning';
import styles from './Tuner.module.css';

// Within this many cents a string counts as in tune.
const IN_TUNE = 5;
// The needle's range either side of the target note.
const RANGE = 50;
const STRING_ORDINALS = ['6th', '5th', '4th', '3rd', '2nd', '1st'];

// A guitar tuner: listens to the mic, picks the nearest open string (or the one
// you locked by tapping it), and shows how many cents sharp or flat you are.
export function Tuner() {
  const {state, frequency, start, stop} = usePitchDetector();
  // A string tapped to tune against; null = follow the nearest string.
  const [locked, setLocked] = useState<number | null>(null);

  const target = locked ?? (frequency !== null ? nearestString(frequency) : null);
  const cents = frequency !== null && target !== null ? centsBetween(frequency, midiToHz(TUNING[target].midi)) : null;
  const inTune = cents !== null && Math.abs(cents) < IN_TUNE;
  const tone = cents === null ? 'idle' : inTune ? 'good' : Math.abs(cents) < 15 ? 'close' : 'off';
  const needle = cents === null ? 0 : Math.max(-RANGE, Math.min(RANGE, cents));

  function chooseString(index: number): void {
    setLocked(current => (current === index ? null : index));
    // Reference note, so you can also tune by ear.
    pluckMidi(TUNING[index].midi, currentTime() + 0.02, 0.9);
  }

  let status: string;
  if (state === 'denied') status = 'Microphone blocked. Allow it for this site in Settings, then try again.';
  else if (state === 'unsupported') status = "This browser can't use the microphone.";
  else if (state === 'idle') status = 'Tap Start, then play a single open string.';
  else if (cents === null) status = 'Listening… play a single open string.';
  else if (inTune) status = 'In tune';
  else if (cents < 0) status = `Too low by ${Math.round(-cents)} cents · tighten ↑`;
  else status = `Too high by ${Math.round(cents)} cents · loosen ↓`;

  return (
    <section className={styles.card}>
      <div className={styles.reading}>
        <div className={styles.note}>
          <span className={`${styles.letter} ${styles[tone]}`}>{target !== null ? TUNING[target].en : '–'}</span>
          <span className={styles.noteSub}>
            {target !== null ? `${TUNING[target].fr} · ${STRING_ORDINALS[target]} string` : 'Standard tuning'}
            {locked !== null && ' · locked'}
          </span>
        </div>
        <div className={styles.heard}>
          {frequency !== null ? (
            <>
              <span>{noteName(frequency)}</span>
              <span className={styles.hz}>{frequency.toFixed(1)} Hz</span>
            </>
          ) : (
            <span className={styles.hz}>— Hz</span>
          )}
        </div>
      </div>

      <div
        className={styles.meter}
        role="meter"
        aria-label="Cents off the target note"
        aria-valuemin={-RANGE}
        aria-valuemax={RANGE}
        aria-valuenow={cents === null ? 0 : Math.round(cents)}
      >
        <div className={styles.zone} />
        {[-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map(mark => (
          <span
            key={mark}
            className={`${styles.tick}${mark % 50 === 0 ? ` ${styles.major}` : ''}`}
            style={{left: `${mark + 50}%`}}
          />
        ))}
        <div className={`${styles.needle} ${styles[tone]}`} style={{left: `${needle + 50}%`}} />
      </div>
      <div className={styles.scaleLabels}>
        <span>♭ −50</span>
        <span>0</span>
        <span>+50 ♯</span>
      </div>

      <p className={`${styles.status} ${styles[tone]}`}>{status}</p>

      <div className={styles.strings} role="group" aria-label="Strings: tap to lock and hear the reference note">
        {TUNING.map((string, index) => (
          <button
            key={index}
            className={`${styles.string}${locked === index ? ` ${styles.locked}` : target === index ? ` ${styles.current}` : ''}`}
            onClick={() => chooseString(index)}
            aria-pressed={locked === index}
          >
            <span className={styles.stringEn}>{string.en}</span>
            <span className={styles.stringFr}>{string.fr}</span>
          </button>
        ))}
      </div>

      <div className={styles.controls}>
        {state === 'listening' ? (
          <button className="tab-play playing" onClick={stop}>
            <span aria-hidden="true">◼</span>
            Stop
          </button>
        ) : (
          <button className="tab-play" onClick={() => void start()}>
            <span aria-hidden="true">●</span>
            Start tuning
          </button>
        )}
        <span className={styles.hint}>
          {locked === null
            ? 'Auto: follows the nearest string. Tap a string to lock it and hear it.'
            : 'Tap the string again to go back to auto.'}
        </span>
      </div>
    </section>
  );
}
