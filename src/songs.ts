import type {ChordName} from './chords';
import type {GuitarSoundId} from './audio';

export interface SongVersion {
  readonly bpm: number;
  // Beats per chip. Easy charts use 4 (one strum per bar); advanced charts use
  // 2, so the same progression is strummed twice per bar at the real tempo.
  readonly beatsPerBar?: number;
  readonly bars: readonly ChordName[];
}

export interface Song {
  readonly name: string;
  readonly sound: GuitarSoundId;
  readonly easy: SongVersion;
  readonly advanced?: SongVersion;
}

export type SongLevel = 'easy' | 'advanced';

export function songVersion(song: Song, level: SongLevel): SongVersion {
  return level === 'advanced' && song.advanced ? song.advanced : song.easy;
}

export const SONGS: readonly Song[] = [
  {
    name: "Knockin' on Heaven's Door — Bob Dylan",
    sound: 'acoustic_guitar_steel',
    easy: {bpm: 72, bars: ['G', 'D', 'Am7', 'Am7', 'G', 'D', 'C', 'C']},
    advanced: {
      bpm: 72,
      beatsPerBar: 2,
      bars: ['G', 'G', 'D', 'D', 'Am7', 'Am7', 'Am7', 'Am7', 'G', 'G', 'D', 'D', 'C', 'C', 'C', 'C'],
    },
  },
  {
    name: 'Stand by Me — Ben E. King',
    sound: 'electric_guitar_clean',
    easy: {bpm: 118, bars: ['G', 'G', 'Em', 'Em', 'C', 'D', 'G', 'G']},
    advanced: {
      bpm: 118,
      beatsPerBar: 2,
      bars: ['G', 'G', 'G', 'G', 'Em', 'Em', 'Em', 'Em', 'C', 'C', 'D', 'D', 'G', 'G', 'G', 'G'],
    },
  },
  {
    name: 'Let It Be — The Beatles',
    sound: 'acoustic_guitar_nylon',
    easy: {bpm: 74, bars: ['C', 'G', 'Am', 'Fmaj7', 'C', 'G', 'Fmaj7', 'C']},
    advanced: {
      bpm: 74,
      beatsPerBar: 2,
      bars: ['C', 'C', 'G', 'G', 'Am', 'Am', 'Fmaj7', 'Fmaj7', 'C', 'C', 'G', 'G', 'Fmaj7', 'C', 'C', 'C'],
    },
  },
  {
    name: 'Wild Thing — The Troggs',
    sound: 'overdriven_guitar',
    easy: {bpm: 104, bars: ['A', 'D', 'E', 'D']},
    advanced: {bpm: 104, beatsPerBar: 2, bars: ['A', 'A', 'D', 'D', 'E', 'E', 'D', 'D']},
  },
];
