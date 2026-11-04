import {useEffect, useRef, useState} from 'react';
import {MODE_PATHS, modeFromPath, type Mode} from '../modes';

// The current section, kept in sync with the URL path: switching pushes a
// history entry, and the back and forward buttons switch back. `onChange` runs
// before every switch (stop playback and so on); the latest one is always used.
export function useModeRoute(onChange: (next: Mode) => void): [Mode, (next: Mode) => void] {
  const [mode, setMode] = useState<Mode>(() => modeFromPath(window.location.pathname));
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const onPopState = () => {
      const next = modeFromPath(window.location.pathname);
      onChangeRef.current(next);
      setMode(next);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function switchMode(next: Mode): void {
    if (window.location.pathname !== MODE_PATHS[next]) window.history.pushState(null, '', MODE_PATHS[next]);
    onChangeRef.current(next);
    setMode(next);
  }

  return [mode, switchMode];
}
