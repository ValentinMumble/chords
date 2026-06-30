type GuitarType = 'acoustic' | 'electric' | 'bass' | 'amp';

interface Instrument {
  name: string;
  kind: string;
  type: GuitarType;
  color: string;
  image?: string;
  price: number;
  bought: string;
  blurb: string;
  specs: {label: string; value: string}[];
}

const NECK = '#c8a877';
const FRETBOARD = '#5a3d28';
const DETAIL = 'rgba(0, 0, 0, 0.3)';
const OUTLINE = 'rgba(0, 0, 0, 0.22)';
const STRING = 'rgba(40, 40, 40, 0.42)';

// A small stylised silhouette coloured to the instrument's finish — not a photo,
// but a recognisable thumbnail for each card.
function GuitarArt({type, color}: {type: GuitarType; color: string}) {
  if (type === 'amp') {
    return (
      <svg className="gear-art" viewBox="0 0 100 172" role="img" aria-label="Amp illustration">
        <rect x={37} y={38} width={26} height={7} rx={3.5} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={2} />
        <rect x={14} y={46} width={72} height={104} rx={9} fill={color} stroke={OUTLINE} strokeWidth={1} />
        <rect x={20} y={52} width={60} height={14} rx={3} fill="rgba(0,0,0,0.25)" />
        {[30, 42, 54, 66].map(cx => (
          <circle key={cx} cx={cx} cy={59} r={2.5} fill="rgba(255,255,255,0.7)" />
        ))}
        <rect x={22} y={74} width={56} height={66} rx={6} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.16)" strokeWidth={1} />
        <circle cx={50} cy={107} r={20} fill="rgba(0,0,0,0.15)" />
        <circle cx={50} cy={107} r={7} fill="rgba(0,0,0,0.22)" />
        <rect x={20} y={150} width={8} height={4} rx={1} fill="rgba(0,0,0,0.4)" />
        <rect x={72} y={150} width={8} height={4} rx={1} fill="rgba(0,0,0,0.4)" />
      </svg>
    );
  }

  if (type === 'acoustic') {
    return (
      <svg className="gear-art" viewBox="0 0 100 172" role="img" aria-label="Acoustic guitar illustration">
        <rect x={40} y={4} width={20} height={18} rx={3} fill={NECK} stroke={OUTLINE} strokeWidth={0.8} />
        {[8, 13, 18].map(y => (
          <circle key={`l${y}`} cx={37} cy={y} r={1.6} fill={DETAIL} />
        ))}
        {[8, 13, 18].map(y => (
          <circle key={`r${y}`} cx={63} cy={y} r={1.6} fill={DETAIL} />
        ))}
        <rect x={44} y={21} width={12} height={2} fill={DETAIL} />
        <rect x={45} y={22} width={10} height={36} fill={FRETBOARD} />
        <path
          d="M50 56 C68 56 80 65 80 81 C80 92 72 94 72 102 C72 114 88 118 88 134 C88 154 71 162 50 162 C29 162 12 154 12 134 C12 118 28 114 28 102 C28 94 20 92 20 81 C20 65 32 56 50 56 Z"
          fill={color}
          stroke={OUTLINE}
          strokeWidth={1}
        />
        <circle cx={50} cy={106} r={13} fill="none" stroke={DETAIL} strokeWidth={1.5} />
        <circle cx={50} cy={106} r={9} fill={DETAIL} />
        <rect x={39} y={127} width={22} height={6} rx={2} fill={DETAIL} />
        {[-5, -3, -1, 1, 3, 5].map(dx => (
          <line key={dx} x1={50 + dx * 0.9} y1={23} x2={50 + dx} y2={127} stroke={STRING} strokeWidth={0.5} />
        ))}
      </svg>
    );
  }

  if (type === 'bass') {
    return (
      <svg className="gear-art" viewBox="0 0 100 172" role="img" aria-label="Bass illustration">
        <rect x={41} y={4} width={18} height={22} rx={3} fill={NECK} stroke={OUTLINE} strokeWidth={0.8} />
        {[7, 12, 17, 22].map(y => (
          <circle key={y} cx={55} cy={y} r={1.8} fill={DETAIL} />
        ))}
        <rect x={44} y={26} width={12} height={2} fill={DETAIL} />
        <rect x={45} y={27} width={10} height={58} fill={FRETBOARD} />
        <path
          d="M50 84 C64 84 75 90 75 103 C75 112 71 114 71 121 C71 132 83 136 83 149 C83 162 70 167 50 167 C30 167 17 162 17 149 C17 136 29 132 29 121 C29 114 25 112 25 103 C25 90 36 84 50 84 Z"
          fill={color}
          stroke={OUTLINE}
          strokeWidth={1}
        />
        <rect x={38} y={120} width={24} height={7} rx={1.5} fill={DETAIL} />
        <rect x={37} y={150} width={26} height={8} rx={2} fill={DETAIL} />
        {[-4.5, -1.5, 1.5, 4.5].map(dx => (
          <line key={dx} x1={50 + dx * 0.7} y1={27} x2={50 + dx} y2={152} stroke={STRING} strokeWidth={0.6} />
        ))}
      </svg>
    );
  }

  // Telecaster — single cutaway, black pickguard, chrome bridge + control plate.
  return (
    <svg className="gear-art" viewBox="0 0 100 172" role="img" aria-label="Telecaster illustration">
      <rect x={41} y={4} width={18} height={20} rx={3} fill={NECK} stroke={OUTLINE} strokeWidth={0.8} />
      {[6, 9, 12, 15, 18, 21].map(y => (
        <circle key={y} cx={55} cy={y} r={1.4} fill={DETAIL} />
      ))}
      <rect x={44} y={24} width={12} height={2} fill={DETAIL} />
      <rect x={45} y={25} width={10} height={42} fill={FRETBOARD} />
      <path
        d="M50 57 C38 56 28 58 22 66 C17 73 15 84 15 102 C15 130 28 153 50 153 C72 153 85 130 85 102 C85 88 84 78 79 71 C75 66 70 64 65 65 C61 66 59 69 60 73 C60 67 56 59 50 57 Z"
        fill={color}
        stroke={OUTLINE}
        strokeWidth={1}
      />
      <path
        d="M32 64 C45 61 58 63 61 75 C63 89 57 103 48 103 C38 104 28 97 26 85 C25 74 26 68 32 64 Z"
        fill="rgba(18, 18, 18, 0.82)"
      />
      <rect x={40} y={89} width={20} height={6} rx={1} fill="#c3c3c6" stroke={OUTLINE} strokeWidth={0.5} />
      <rect x={36} y={118} width={28} height={22} rx={2} fill="#c3c3c6" stroke={OUTLINE} strokeWidth={0.6} />
      <rect x={40} y={121} width={20} height={6} rx={1} fill={DETAIL} />
      {[131, 134, 137].map(y => (
        <line key={y} x1={40} y1={y} x2={60} y2={y} stroke={DETAIL} strokeWidth={0.6} />
      ))}
      <rect x={21} y={131} width={15} height={8} rx={2} fill="#c3c3c6" stroke={OUTLINE} strokeWidth={0.5} />
      <circle cx={25} cy={135} r={1.5} fill={DETAIL} />
      <circle cx={31} cy={135} r={1.5} fill={DETAIL} />
      {[-5, -3, -1, 1, 3, 5].map(dx => (
        <line key={dx} x1={50 + dx * 0.8} y1={25} x2={50 + dx * 0.7} y2={122} stroke={STRING} strokeWidth={0.5} />
      ))}
    </svg>
  );
}

const FLEET: Instrument[] = [
  {
    name: 'Yamaha APX600',
    kind: 'Acoustic-electric',
    type: 'acoustic',
    color: '#d8b074',
    image: '/gear/apx600.png',
    price: 249,
    bought: 'June 2026',
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
    bought: 'June 2026',
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
    bought: 'May 2026',
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
    price: 110,
    bought: 'July 2005',
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

export function Fleet() {
  const total = FLEET.reduce((sum, item) => sum + item.price, 0);
  const instrumentCount = FLEET.filter(item => item.type !== 'amp').length;
  return (
    <div className="fleet">
      <div className="fleet-summary">
        <div className="fleet-stat">
          <span className="fleet-stat-value">{instrumentCount}</span>
          <span className="fleet-stat-label">instruments</span>
        </div>
        <div className="fleet-stat">
          <span className="fleet-stat-value">€{total.toLocaleString('en-US')}</span>
          <span className="fleet-stat-label">total paid</span>
        </div>
      </div>
      {FLEET.map(instrument => (
        <section className="gear-card" key={instrument.name}>
          <div className="gear-head">
            {instrument.image ? (
              <img className="gear-photo" src={instrument.image} alt={instrument.name} loading="lazy" />
            ) : (
              <GuitarArt type={instrument.type} color={instrument.color} />
            )}
            <div className="gear-title">
              <h2>{instrument.name}</h2>
              <span className="gear-kind">{instrument.kind}</span>
            </div>
          </div>
          <p className="gear-blurb">{instrument.blurb}</p>
          <dl className="gear-specs">
            {instrument.specs.map(spec => (
              <div className="gear-spec" key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
            <div className="gear-spec">
              <dt>Bought</dt>
              <dd>{instrument.bought}</dd>
            </div>
            <div className="gear-spec">
              <dt>Paid</dt>
              <dd>€{instrument.price}</dd>
            </div>
          </dl>
        </section>
      ))}
    </div>
  );
}
