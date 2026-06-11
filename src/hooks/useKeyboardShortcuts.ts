import { useEffect, useRef } from 'react';

export interface KeyboardHandlers {
  onArrow: (step: number) => void;
  onStrum: () => void;
  onArpeggio: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardHandlers): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        handlersRef.current.onArrow(event.key === 'ArrowRight' ? 1 : -1);
      } else if (event.key === ' ') {
        event.preventDefault();
        handlersRef.current.onStrum();
      } else if (event.key === 'a') {
        handlersRef.current.onArpeggio();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}
