import {createRoot} from 'react-dom/client';
import App from './App';
import './theme.css';
import './style.css';

// Which side the Dynamic Island (or notch) is on in landscape. iOS reports the
// same safe-area inset on both sides, so theme.css keeps it only on that side.
// window.orientation: 90 = turned left (island on the left), -90 = turned right.
function markNotchSide(): void {
  const angle = typeof window.orientation === 'number' ? window.orientation : 0;
  document.documentElement.dataset.notch = angle === 90 ? 'left' : angle === -90 ? 'right' : 'none';
}
markNotchSide();
window.addEventListener('orientationchange', markNotchSide);
window.addEventListener('resize', markNotchSide);

createRoot(document.getElementById('root')!).render(<App />);
