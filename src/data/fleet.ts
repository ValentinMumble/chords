export type GuitarType = 'acoustic' | 'electric' | 'bass' | 'amp';

export interface Instrument {
  name: string;
  kind: string;
  type: GuitarType;
  color: string;
  image?: string;
  price: number;
  bought: string;
  // Date the current strings were fitted (ISO YYYY-MM-DD). Omit for the amp.
  restrung?: string;
  // Date the previous (now-replaced) set was fitted — used to note how old the
  // old strings were at the last change. Omit if never restrung.
  previousFitted?: string;
  blurb: string;
  specs: {label: string; value: string}[];
}

export const FLEET: Instrument[] = [
  {
    name: 'Yamaha APX600',
    kind: 'Acoustic-electric',
    type: 'acoustic',
    color: '#d8b074',
    image: '/gear/apx600.png',
    price: 249,
    bought: '29 June 2026',
    restrung: '2026-06-29',
    blurb:
      "Yamaha's best-selling stage acoustic — a slim thinline cutaway that stays comfortable and " +
      'feedback-resistant, with a built-in preamp and tuner for plugging straight in.',
    specs: [
      {label: 'Body', value: 'Thinline single-cutaway (APX)'},
      {label: 'Top', value: 'Spruce'},
      {label: 'Back & sides', value: 'Nato (laminate)'},
      {label: 'Neck / board', value: 'Nato / rosewood'},
      {label: 'Scale', value: '634 mm (≈25")'},
      {label: 'Electronics', value: 'System65A preamp — 3-band EQ + chromatic tuner, under-saddle piezo'},
      {label: 'Strings', value: 'Light acoustic (.012–.053)'},
      {label: 'Best for', value: 'Strumming & fingerstyle, plugged-in on stage'},
    ],
  },
  {
    name: "Squier Classic Vibe '50s Telecaster",
    kind: 'Electric guitar · White Blonde',
    type: 'electric',
    color: '#ece0c2',
    image: '/gear/tele.png',
    price: 429,
    bought: '1 June 2026',
    restrung: '2026-06-01',
    blurb:
      'A pine-bodied take on the original solid-body — bright, twangy and cutting, with vintage-flavoured ' +
      'single-coils. The Classic Vibe line punches well above its price.',
    specs: [
      {label: 'Series', value: "Classic Vibe '50s"},
      {label: 'Finish', value: 'White Blonde'},
      {label: 'Body', value: 'Pine'},
      {label: 'Neck / board', value: 'Maple / maple (one-piece)'},
      {label: 'Pickups', value: 'Two Fender-Designed alnico single-coils'},
      {label: 'Controls', value: 'Master volume, master tone, 3-way switch'},
      {label: 'Scale', value: '25.5"'},
      {label: 'Bridge', value: 'Vintage-style Tele bridge'},
      {label: 'Best for', value: 'Twangy rhythm & lead — rock, country, blues, indie'},
    ],
  },
  {
    name: "Squier Classic Vibe '60s Mustang Bass",
    kind: 'Electric bass · Surf Green',
    type: 'bass',
    color: '#79c9b2',
    image: '/gear/mustang.png',
    price: 419,
    bought: '22 May 2026',
    restrung: '2026-05-22',
    blurb:
      'A short-scale offset bass in surf green — punchy and focused, with a friendly 30" scale that suits ' +
      'guitarists and shorter reaches.',
    specs: [
      {label: 'Series', value: "Classic Vibe '60s"},
      {label: 'Finish', value: 'Surf Green'},
      {label: 'Body', value: 'Poplar'},
      {label: 'Neck / board', value: 'Maple / laurel'},
      {label: 'Scale', value: 'Short scale, 30"'},
      {label: 'Pickups', value: 'Split single-coil (Fender-Designed)'},
      {label: 'Controls', value: 'Volume, tone'},
      {label: 'Strings', value: '4-string (short-scale set)'},
      {label: 'Best for', value: 'Tight, punchy low end; comfy for guitarists'},
    ],
  },
  {
    name: 'Storm JB100',
    kind: 'Electric bass · Sonic Blue',
    type: 'bass',
    color: '#8dc6e8',
    image: '/gear/storm.png',
    price: 110,
    bought: 'July 2005',
    restrung: '2026-05-08',
    // Bought in 2005 and never restrung until this year — the old set was ancient.
    previousFitted: '2005-07-01',
    blurb:
      'A budget Jazz-style bass in sonic blue — an affordable first bass with a basswood body and a long ' +
      '34" scale. Storm is an entry-level house brand, so specs vary by run.',
    specs: [
      {label: 'Finish', value: 'Sonic Blue'},
      {label: 'Style', value: 'Jazz Bass (J-style)'},
      {label: 'Body', value: 'Basswood'},
      {label: 'Neck / board', value: 'Maple / rosewood'},
      {label: 'Scale', value: 'Long scale, 34"'},
      {label: 'Pickups', value: 'Two single-coils (J-style)'},
      {label: 'Role', value: 'Affordable first bass'},
    ],
  },
  {
    name: 'Boss Katana Mini X',
    kind: 'Practice amp',
    type: 'amp',
    color: '#3a3d42',
    image: '/gear/katana.png',
    price: 159,
    bought: 'May 2026',
    blurb:
      'A 10-watt desktop amp with three amp voicings, onboard effects, Bluetooth streaming and a built-in ' +
      'tuner — small enough for a desk, loud enough for a room.',
    specs: [
      {label: 'Power', value: '10 W'},
      {label: 'Speaker', value: '5"'},
      {label: 'Amp types', value: 'Clean · Crunch · Brown'},
      {label: 'Effects', value: 'Reverb, delay, chorus / mod'},
      {label: 'Bluetooth', value: 'Audio streaming + app control'},
      {label: 'Tuner', value: 'Built-in'},
      {label: 'Runs on', value: 'Built-in rechargeable battery (USB-charged, ~10 h)'},
    ],
  },
];
