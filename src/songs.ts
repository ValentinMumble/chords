import type {ChordName} from './chords';
import type {GuitarSoundId} from './audio';

export interface Song {
  readonly name: string;
  readonly bpm: number;
  readonly sound: GuitarSoundId;
  readonly bars: readonly ChordName[];
}

export const SONGS: readonly Song[] = [
  {
    name: "Knockin' on Heaven's Door — Bob Dylan",
    bpm: 72,
    sound: 'acoustic_guitar_steel',
    bars: ['G', 'D', 'Am7', 'Am7', 'G', 'D', 'C', 'C'],
  },
  {
    name: 'Stand by Me — Ben E. King',
    bpm: 60,
    sound: 'electric_guitar_clean',
    bars: ['G', 'G', 'Em', 'Em', 'C', 'D', 'G', 'G'],
  },
  {
    name: 'Let It Be — The Beatles',
    bpm: 74,
    sound: 'acoustic_guitar_nylon',
    bars: ['C', 'G', 'Am', 'Fmaj7', 'C', 'G', 'Fmaj7', 'C'],
  },
  {
    name: 'Wild Thing — The Troggs',
    bpm: 84,
    sound: 'overdriven_guitar',
    bars: ['A', 'D', 'E', 'D'],
  },
];
