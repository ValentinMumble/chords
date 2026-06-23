import {instrument, type Player} from 'soundfont-player';
import type {Chord} from './types';

const STRING_MIDI = [40, 45, 50, 55, 59, 64];
const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const STRUM_STAGGER = 0.014;
export const ARPEGGIO_STAGGER = 0.35;
const SCHEDULE_DELAY = 0.03;

export const GUITAR_SOUNDS = [
  {id: 'acoustic_guitar_steel', label: 'Steel acoustic'},
  {id: 'acoustic_guitar_nylon', label: 'Nylon acoustic'},
  {id: 'electric_guitar_clean', label: 'Clean electric'},
  {id: 'electric_guitar_jazz', label: 'Jazz electric'},
  {id: 'electric_guitar_muted', label: 'Muted electric'},
  {id: 'overdriven_guitar', label: 'Overdriven'},
  {id: 'distortion_guitar', label: 'Distortion'},
  {id: 'guitar_harmonics', label: 'Harmonics'},
] as const;
export type GuitarSoundId = (typeof GUITAR_SOUNDS)[number]['id'];

let ctx: AudioContext | null = null;
let busInput: GainNode | null = null;
let currentSound: GuitarSoundId = GUITAR_SOUNDS[0].id;
const players = new Map<GuitarSoundId, Player>();
const loadingSounds = new Set<GuitarSoundId>();

// A short decaying-noise impulse response — a small room, so the dry samples
// don't sound bone-dry/MIDI.
function roomImpulse(context: AudioContext): AudioBuffer {
  const length = Math.floor(context.sampleRate * 1.6);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
    }
  }
  return buffer;
}

export function ensureAudio(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    // Everything plays into busInput, which splits to a dry path and a wet
    // (reverb) path before the output.
    busInput = ctx.createGain();
    const dry = ctx.createGain();
    dry.gain.value = 0.9;
    const wet = ctx.createGain();
    wet.gain.value = 0.22;
    const reverb = ctx.createConvolver();
    reverb.buffer = roomImpulse(ctx);
    busInput.connect(dry).connect(ctx.destination);
    busInput.connect(reverb).connect(wet).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function output(): AudioNode {
  ensureAudio();
  return busInput ?? ctx!.destination;
}

export function setGuitarSound(sound: GuitarSoundId): void {
  currentSound = sound;
  if (ctx) loadGuitar();
}

export function loadGuitar(): void {
  const sound = currentSound;
  if (players.has(sound) || loadingSounds.has(sound)) return;
  loadingSounds.add(sound);
  const ac = ensureAudio();
  // Route the instrument through the reverb bus instead of straight to output.
  instrument(ac, sound, {destination: output()})
    .then(player => {
      players.set(sound, player);
    })
    .catch(() => {
      loadingSounds.delete(sound);
    });
}

export function isSoundLoaded(): boolean {
  return players.has(currentSound);
}

// Kick off loading the current instrument early (e.g. on hover) so the first
// strum uses real samples instead of the synth fallback.
export function preloadSound(): void {
  ensureAudio();
  loadGuitar();
}

export function whenSoundReady(): Promise<void> {
  if (players.has(currentSound)) return Promise.resolve();
  loadGuitar();
  return new Promise(resolve => {
    const check = () => (players.has(currentSound) ? resolve() : window.setTimeout(check, 80));
    check();
  });
}

export function currentTime(): number {
  return ensureAudio().currentTime;
}

function midiToNote(midi: number): string {
  return PITCH_CLASSES[midi % 12] + String(Math.floor(midi / 12) - 1);
}

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function pluckFallback(context: AudioContext, frequency: number, when: number): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  osc.type = 'triangle';
  osc.frequency.value = frequency;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2800, when);
  filter.frequency.exponentialRampToValueAtTime(700, when + 1.2);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.18, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 1.6);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(output());
  osc.start(when);
  osc.stop(when + 1.7);
}

function playChord(chord: Chord, stagger: number, startTime?: number): void {
  const context = ensureAudio();
  loadGuitar();
  const start = startTime ?? context.currentTime + SCHEDULE_DELAY;
  const guitar = players.get(currentSound);
  let played = 0;
  chord.frets.forEach((fret, stringIndex) => {
    if (fret < 0) return;
    const midi = STRING_MIDI[stringIndex] + fret;
    const when = start + played * stagger;
    if (guitar) {
      guitar.play(midiToNote(midi), when, {gain: 0.7, duration: 2.5});
    } else {
      pluckFallback(context, midiToFrequency(midi), when);
    }
    played++;
  });
}

export type StrokeDirection = 'down' | 'up';

// The midi notes of a chord's sounded strings, low to high.
function chordVoices(chord: Chord): number[] {
  const notes: number[] = [];
  chord.frets.forEach((fret, stringIndex) => {
    if (fret >= 0) notes.push(STRING_MIDI[stringIndex] + fret);
  });
  return notes;
}

// A single strum. Down-strokes sweep low-to-high across all strings; up-strokes
// are lighter and snappier, catching mostly the top strings. Timing and volume
// are humanized slightly so repeated strums don't sound mechanical.
export function strumStroke(
  chord: Chord,
  when: number,
  direction: StrokeDirection,
  gain: number,
  withBass = false,
): void {
  const context = ensureAudio();
  loadGuitar();
  const guitar = players.get(currentSound);
  let notes = chordVoices(chord);
  let stagger = STRUM_STAGGER;
  let duration = 1.4;
  if (direction === 'up') {
    notes = notes.slice(-4).reverse();
    stagger = STRUM_STAGGER * 0.6;
    duration = 1.1;
  }
  // One velocity feel per strum (±10%), plus a hair of timing wobble per note.
  const strumGain = gain * (0.92 + Math.random() * 0.16);
  const wobble = (Math.random() - 0.5) * 0.012;
  notes.forEach((midi, index) => {
    const at = when + wobble + index * stagger + (Math.random() - 0.5) * 0.005;
    let noteGain = strumGain * (1 - index * 0.03);
    // On the beat, dig into the bass strings for a "boom-chick" thump.
    if (withBass && direction === 'down') noteGain *= index === 0 ? 1.45 : index === 1 ? 1.18 : 1;
    if (guitar) {
      guitar.play(midiToNote(midi), at, {gain: Math.max(0.05, noteGain), duration});
    } else {
      pluckFallback(context, midiToFrequency(midi), at);
    }
  });
}

export function strum(chord: Chord, startTime?: number): void {
  strumStroke(chord, startTime ?? ensureAudio().currentTime + SCHEDULE_DELAY, 'down', 0.85);
}

// Pluck a single string of the chord — voice 0 is the lowest sounded string,
// counting up. Used for fingerpicking patterns.
export function pluckVoice(chord: Chord, voiceIndex: number, when: number, gain: number): void {
  const context = ensureAudio();
  loadGuitar();
  const guitar = players.get(currentSound);
  const voices = chordVoices(chord);
  if (voices.length === 0) return;
  const midi = voices[Math.min(voiceIndex, voices.length - 1)];
  if (guitar) {
    guitar.play(midiToNote(midi), when, {gain, duration: 1.9});
  } else {
    pluckFallback(context, midiToFrequency(midi), when);
  }
}

export function arpeggio(chord: Chord): void {
  playChord(chord, ARPEGGIO_STAGGER);
}

// How long an arpeggio of this chord takes to ring out all its notes.
export function arpeggioDuration(chord: Chord): number {
  const played = chord.frets.filter(fret => fret >= 0).length;
  return Math.max(0.2, (played - 1) * ARPEGGIO_STAGGER + 0.3);
}
