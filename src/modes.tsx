import type {ReactNode} from 'react';

// The app's sections (the tab switcher and the phone tab bar).
export type Mode = 'songs' | 'exercises' | 'scales' | 'tuner' | 'gear';

// Each tab has its own path, so a reload or bookmark keeps the tab and the
// browser's back button moves between tabs (vercel.json serves the app on all).
export const MODE_PATHS: Record<Mode, string> = {
  songs: '/',
  exercises: '/practice',
  scales: '/scales',
  tuner: '/tuner',
  gear: '/gear',
};

export function modeFromPath(pathname: string): Mode {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const match = (Object.keys(MODE_PATHS) as Mode[]).find(key => MODE_PATHS[key] === clean);
  return match ?? 'songs';
}

// Line icons for the phone tab bar, drawn in the SF Symbols spirit (24x24,
// rounded strokes, coloured by the tab's text colour).
const iconProps = {
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const MODES: {key: Mode; label: string; icon: ReactNode}[] = [
  {
    key: 'songs',
    label: 'Songs',
    icon: (
      <svg {...iconProps}>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </svg>
    ),
  },
  {
    key: 'exercises',
    label: 'Practice',
    icon: (
      <svg {...iconProps}>
        <path d="M8.5 3h7l4 18h-15z" />
        <path d="M12 17l4.5-9" />
        <path d="M6 14h12" />
      </svg>
    ),
  },
  {
    key: 'scales',
    label: 'Scales',
    icon: (
      <svg {...iconProps}>
        <path d="M5 20v-4M10 20v-8M15 20V8M20 20V4" strokeWidth={2.4} />
      </svg>
    ),
  },
  {
    key: 'tuner',
    label: 'Tuner',
    icon: (
      <svg {...iconProps}>
        <path d="M8.5 3v7a3.5 3.5 0 0 0 7 0V3" />
        <path d="M12 13.5V21" />
      </svg>
    ),
  },
  {
    key: 'gear',
    label: 'Gear',
    icon: (
      <svg {...iconProps}>
        <path d="M12 21c-3.2-3.1-7-8.2-7-12 0-3.4 3.1-5 7-5s7 1.6 7 5c0 3.8-3.8 8.9-7 12z" />
      </svg>
    ),
  },
];
