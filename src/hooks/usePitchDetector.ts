import {useCallback, useEffect, useRef, useState} from 'react';
import {ensureAudio} from '../audio';
import {detectPitch, signalLevel} from '../pitch';

// Window of samples per reading: ~85 ms, enough for a few periods of low E.
const WINDOW = 4096;
// Median over the last few readings steadies the needle without lagging much.
const SMOOTHING = 5;
// Keep showing the last reading briefly after the note fades.
const HOLD_MS = 700;

export type MicState = 'idle' | 'listening' | 'denied' | 'unsupported';

// Listens to the microphone and reports the detected frequency (Hz, or null
// when nothing clear is playing) and the input level (RMS, for a level meter). `start` must run inside a tap: iOS only
// grants the mic and resumes audio from a user gesture. The mic is released on
// `stop` and when the component using it unmounts (leaving the Tuner tab).
export function usePitchDetector() {
  const [state, setState] = useState<MicState>('idle');
  const [frequency, setFrequency] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const frameRef = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    nodesRef.current.forEach(node => node.disconnect());
    nodesRef.current = [];
    setFrequency(null);
    setLevel(0);
    setState(current => (current === 'listening' ? 'idle' : current));
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      return;
    }
    const context = ensureAudio();
    void context.resume();
    let stream: MediaStream;
    try {
      // Raw signal: the phone's voice processing would distort the pitch.
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false},
      });
    } catch {
      setState('denied');
      return;
    }
    streamRef.current = stream;
    // Opening the mic switches iOS's audio session, which can suspend the context.
    void context.resume();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = WINDOW;
    // Safari only processes nodes that lead to the output, so route the
    // analyser into the speakers through a muted gain (nothing is heard).
    const mute = context.createGain();
    mute.gain.value = 0;
    source.connect(analyser);
    analyser.connect(mute);
    mute.connect(context.destination);
    nodesRef.current = [source, analyser, mute];
    const samples = new Float32Array(WINDOW);
    const recent: number[] = [];
    let lastHeard = 0;
    let skip = false;
    setState('listening');

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      skip = !skip; // ~30 readings a second is plenty
      if (skip) return;
      if (context.state === 'suspended') void context.resume();
      analyser.getFloatTimeDomainData(samples);
      setLevel(signalLevel(samples));
      const hz = detectPitch(samples, context.sampleRate);
      const now = performance.now();
      if (hz === null) {
        if (now - lastHeard > HOLD_MS) {
          recent.length = 0;
          setFrequency(null);
        }
        return;
      }
      lastHeard = now;
      recent.push(hz);
      if (recent.length > SMOOTHING) recent.shift();
      const sorted = [...recent].sort((first, second) => first - second);
      setFrequency(sorted[Math.floor(sorted.length / 2)]);
    };
    tick();
  }, []);

  useEffect(() => stop, [stop]);

  return {state, frequency, level, start, stop};
}
