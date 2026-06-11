import {instrument, type Player} from 'soundfont-player';
import type {Chord} from './types';

const STRING_MIDI = [40, 45, 50, 55, 59, 64];
const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let ctx: AudioContext | null = null;
let guitar: Player | null = null;
let guitarLoading = false;

export function audioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  if (!guitarLoading) {
    guitarLoading = true;
    instrument(ctx, 'acoustic_guitar_steel')
      .then(player => {
        guitar = player;
      })
      .catch(() => {
        guitarLoading = false;
      });
  }
  return ctx;
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

export function strumChord(chord: Chord, stagger: number): void {
  const context = audioContext();
  const start = context.currentTime + 0.03;
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

export function metronomeTick(when: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 1100;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.06, when + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.08);
}

export function currentTime(): number {
  return audioContext().currentTime;
}
