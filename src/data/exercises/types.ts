import type {ReactNode} from 'react';
import type {Col} from '../../tab';

// One playable tab on a Practice card, with an optional note shown above it.
export interface PracticeTab {
  bars: Col[][];
  // Remembers this tab's tempo in localStorage; bump it to reset the default.
  storageKey: string;
  defaultTempo: number;
  minTempo?: number;
  // Grid columns per beat (2 = eighths, 4 = sixteenths).
  subdiv: number;
  showRhythm?: boolean;
  barsPerRow: number;
  chords?: (string | null)[];
  firstBar?: number;
  caption?: string;
  note?: ReactNode;
}

// A Practice card: its title, the short name in the side index, and its tabs.
export interface PracticeCard {
  id: string;
  title: string;
  label: string;
  tabs: PracticeTab[];
}
