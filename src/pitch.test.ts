import {describe, expect, it} from 'vitest';
import {centsBetween, detectPitch, midiToHz, nearestString, noteName} from './pitch';
import {TUNING} from './tuning';

// A plucked-string-like tone: fundamental plus a strong 2nd and some 3rd
// harmonic (the classic trap for octave errors on a low E).
function tone(hz: number, sampleRate: number, length = 4096): Float32Array {
  const samples = new Float32Array(length);
  for (let index = 0; index < length; index++) {
    const time = index / sampleRate;
    samples[index] =
      0.3 * Math.sin(2 * Math.PI * hz * time) +
      0.35 * Math.sin(2 * Math.PI * 2 * hz * time + 0.4) +
      0.12 * Math.sin(2 * Math.PI * 3 * hz * time + 1.1);
  }
  return samples;
}

describe('detectPitch', () => {
  for (const sampleRate of [44100, 48000]) {
    for (const string of TUNING) {
      for (const detune of [-15, 0, 15]) {
        it(`${string.en} ${detune > 0 ? '+' : ''}${detune} cents @ ${sampleRate}`, () => {
          const target = midiToHz(string.midi) * 2 ** (detune / 1200);
          const detected = detectPitch(tone(target, sampleRate), sampleRate);
          expect(detected).not.toBeNull();
          expect(Math.abs(centsBetween(detected!, target))).toBeLessThan(2);
        });
      }
    }
  }

  it('returns null for silence', () => {
    expect(detectPitch(new Float32Array(4096), 48000)).toBeNull();
  });
});

describe('note helpers', () => {
  it('finds the nearest open string', () => {
    expect(nearestString(82)).toBe(0); // low E
    expect(nearestString(112)).toBe(1); // a flat A still maps to A
    expect(nearestString(329)).toBe(5); // high e
  });
  it('names the chromatic note', () => {
    expect(noteName(110)).toBe('A2');
    expect(noteName(103.83)).toBe('G♯2');
  });
});
