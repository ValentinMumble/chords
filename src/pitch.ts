// Pitch detection for the tuner: plain functions, no audio or React, so they
// can be tested on synthetic signals.

import {TUNING} from './tuning';

// Guitar range we listen for: a little below low E (82 Hz) to well above the
// high e (330 Hz), so harmonics or a badly detuned string still register.
const MIN_HZ = 60;
const MAX_HZ = 1000;
// Only true digital silence is rejected by level: a guitar a metre from a
// phone mic (no auto gain) is quiet, so noise is rejected by clarity instead.
const SILENCE_RMS = 0.0005;
// How periodic the signal must be (normalized peak height, 0 to 1) to count.
const MIN_CLARITY = 0.7;

// The signal level (RMS) of a window, for the mic level meter.
export function signalLevel(samples: Float32Array): number {
  let sumSquares = 0;
  for (const sample of samples) sumSquares += sample * sample;
  return Math.sqrt(sumSquares / samples.length);
}

// Estimate the fundamental frequency of one window of samples, or null when it
// is silent or no clear period is found. McLeod's normalized square difference
// (NSDF): autocorrelation divided by the energy of the overlapping parts, so the
// result is the same at any volume and on a decaying note. Lags are limited to
// the guitar range; parabolic interpolation gives sub-sample precision.
export function detectPitch(samples: Float32Array, sampleRate: number): number | null {
  if (signalLevel(samples) < SILENCE_RMS) return null;

  const size = samples.length;
  const maxLag = Math.min(Math.ceil(sampleRate / MIN_HZ), size - 2);
  const minLag = Math.floor(sampleRate / MAX_HZ);
  const nsdf = new Float32Array(maxLag + 2);
  // m(lag) = sum of squares of both overlapping parts, updated incrementally.
  let energy = 0;
  for (const sample of samples) energy += 2 * sample * sample;
  for (let lag = 0; lag <= maxLag + 1; lag++) {
    if (lag > 0) energy -= samples[lag - 1] ** 2 + samples[size - lag] ** 2;
    let correlation = 0;
    for (let index = 0; index < size - lag; index++) correlation += samples[index] * samples[index + lag];
    nsdf[lag] = energy > 0 ? (2 * correlation) / energy : 0;
  }

  // Key maxima: the highest point of each positive lobe after the first
  // negative zero crossing (which skips the central peak at lag 0).
  let lag = 1;
  while (lag <= maxLag && nsdf[lag] > 0) lag++;
  const peaks: number[] = [];
  let strongest = 0;
  while (lag <= maxLag) {
    while (lag <= maxLag && nsdf[lag] <= 0) lag++;
    let best = -1;
    while (lag <= maxLag && nsdf[lag] > 0) {
      if (lag >= minLag && (best < 0 || nsdf[lag] > nsdf[best])) best = lag;
      lag++;
    }
    if (best > 0) {
      peaks.push(best);
      strongest = Math.max(strongest, nsdf[best]);
    }
  }
  if (peaks.length === 0 || strongest < MIN_CLARITY) return null;
  // Multiples of the period score almost as well as the period itself, so take
  // the first peak that is nearly as strong as the best (avoids octave errors).
  const bestLag = peaks.find(peak => nsdf[peak] >= strongest * 0.9) ?? peaks[0];

  const before = nsdf[bestLag - 1];
  const after = nsdf[bestLag + 1];
  const curve = before + after - 2 * nsdf[bestLag];
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
