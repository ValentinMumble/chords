export interface PersistedState {
  chord: string;
  filter: string;
  songIndex: number;
  bpm: number;
}

const STORAGE_KEY = 'chords:state:v1';

export function loadState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedState>) : {};
  } catch {
    return {};
  }
}

export function saveState(patch: Partial<PersistedState>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loadState(), ...patch }));
  } catch {
    // storage unavailable (private mode, quota) — state just won't persist
  }
}
