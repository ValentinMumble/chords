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
let currentSound: GuitarSoundId = GUITAR_SOUNDS[0].id;
const players = new Map<GuitarSoundId, Player>();
const loadingSounds = new Set<GuitarSoundId>();

export function ensureAudio(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setGuitarSound(sound: GuitarSoundId): void {
  currentSound = sound;
  if (ctx) loadGuitar();
}

export function loadGuitar(): void {
  const sound = currentSound;
  if (players.has(sound) || loadingSounds.has(sound)) return;
  loadingSounds.add(sound);
  instrument(ensureAudio(), sound)
    .then(player => {
      players.set(sound, player);
    })
    .catch(() => {
      loadingSounds.delete(sound);
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
  gain.connect(context.destination);
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
export function strumStroke(chord: Chord, when: number, direction: StrokeDirection, gain: number): void {
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
  const swing = (Math.random() - 0.5) * 0.012;
  notes.forEach((midi, index) => {
    const at = when + swing + index * stagger + (Math.random() - 0.5) * 0.005;
    const noteGain = Math.max(0.05, strumGain * (1 - index * 0.03));
    if (guitar) {
      guitar.play(midiToNote(midi), at, {gain: noteGain, duration});
    } else {
      pluckFallback(context, midiToFrequency(midi), at);
    }
  });
}

export function strum(chord: Chord, startTime?: number): void {
  strumStroke(chord, startTime ?? ensureAudio().currentTime + SCHEDULE_DELAY, 'down', 0.85);
}

export function arpeggio(chord: Chord): void {
  playChord(chord, ARPEGGIO_STAGGER);
}

// How long an arpeggio of this chord takes to ring out all its notes.
export function arpeggioDuration(chord: Chord): number {
  const played = chord.frets.filter(fret => fret >= 0).length;
  return Math.max(0.2, (played - 1) * ARPEGGIO_STAGGER + 0.3);
}
