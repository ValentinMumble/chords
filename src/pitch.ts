// Pitch detection for the tuner: plain functions, no audio or React, so they
// can be tested on synthetic signals.

import {TUNING} from './tuning';

// Guitar range we listen for: a little below low E (82 Hz) to well above the
// high e (330 Hz), so harmonics or a badly detuned string still register.
const MIN_HZ = 60;
const MAX_HZ = 1000;
// Below this loudness (RMS of the window) we treat the input as silence.
const SILENCE_RMS = 0.01;

// Estimate the fundamental frequency of one window of samples, or null when it
// is too quiet or no clear period is found. Autocorrelation with the lag search
// limited to the guitar range, then parabolic interpolation around the peak for
// sub-sample precision (a cent is ~0.06% of the period).
export function detectPitch(samples: Float32Array, sampleRate: number): number | null {
  let sumSquares = 0;
  for (const sample of samples) sumSquares += sample * sample;
  if (Math.sqrt(sumSquares / samples.length) < SILENCE_RMS) return null;

  const minLag = Math.floor(sampleRate / MAX_HZ);
  const maxLag = Math.min(Math.ceil(sampleRate / MIN_HZ), samples.length - 1);
  const size = samples.length - maxLag;
  const correlation = new Float32Array(maxLag + 2);
  for (let lag = 0; lag <= maxLag + 1; lag++) {
    let sum = 0;
    for (let index = 0; index < size; index++) sum += samples[index] * samples[index + lag];
    correlation[lag] = sum;
  }

  // Skip the central peak (lag 0 slope), then collect the local peaks after it.
  let lag = minLag;
  while (lag < maxLag && correlation[lag] > correlation[lag + 1]) lag++;
  const peaks: number[] = [];
  let strongest = 0;
  for (; lag <= maxLag; lag++) {
    if (correlation[lag] > correlation[lag - 1] && correlation[lag] >= correlation[lag + 1]) {
      peaks.push(lag);
      strongest = Math.max(strongest, correlation[lag]);
    }
  }
  // Reject weak periodicity (noise, a strum of many notes).
  if (peaks.length === 0 || strongest < correlation[0] * 0.5) return null;
  // Multiples of the period correlate almost as well as the period itself, so
  // take the first peak that is nearly as strong as the best (avoids octave errors).
  const bestLag = peaks.find(peak => correlation[peak] >= strongest * 0.9) ?? peaks[0];
  const bestValue = correlation[bestLag];

  const before = correlation[bestLag - 1];
  const after = correlation[bestLag + 1];
  const curve = before + after - 2 * bestValue;
  const shift = curve !== 0 ? (before - after) / (2 * curve) : 0;
  return sampleRate / (bestLag + shift);
}

export function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

// How far `hz` is from `targetHz`, in cents (100 cents = one semitone).
export function centsBetween(hz: number, targetHz: number): number {
  return 1200 * Math.log2(hz / targetHz);
}

// The open string (index into TUNING, 0 = low E) closest to `hz`.
export function nearestString(hz: number): number {
  let best = 0;
  let bestDistance = Infinity;
  TUNING.forEach((string, index) => {
    const distance = Math.abs(centsBetween(hz, midiToHz(string.midi)));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

// The chromatic note being played, e.g. "G♯2", for when a string is far off.
export function noteName(hz: number): string {
  const midi = Math.round(69 + 12 * Math.log2(hz / 440));
  return NOTE_NAMES[((midi % 12) + 12) % 12] + String(Math.floor(midi / 12) - 1);
}
