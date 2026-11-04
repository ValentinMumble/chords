import {useEffect} from 'react';
import {ensureAudio} from '../audio';

// iOS only starts or resumes audio inside a real tap (touchend/click, not a
// finger's pointerdown), and a home-screen app's audio is interrupted each time
// it goes to the background. So resume on every tap or key (a no-op once
// running) and when the app comes back to the foreground.
export function useAudioUnlock(): void {
  useEffect(() => {
    const unlock = () => ensureAudio();
    const onVisible = () => {
      if (document.visibilityState === 'visible') ensureAudio();
    };
    const events = ['touchend', 'click', 'keydown'] as const;
    events.forEach(name => window.addEventListener(name, unlock, {passive: true}));
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      events.forEach(name => window.removeEventListener(name, unlock));
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
