// Stylized CSS map (no external image — Unsplash doesn't have Maps-grade
// stock). Off-white base + soft road strokes + green park blob + a few
// building rectangles gets us the "you are looking at Google Maps" vibe
// without committing to a real map provider. Used for "Locating your
// business" and "Analyzing the market" scan steps. When `revealCompetitors`
// flips true (step 4), all competitor pins fade in sequentially.

interface Pin {
  x: number;
  y: number;
  label: string;
  isYou?: boolean;
}

const PINS: Pin[] = [
  { x: 52, y: 50, label: 'CertaPro Austin', isYou: true },
  { x: 28, y: 32, label: 'Five Star Painting' },
  { x: 70, y: 28, label: 'Paper Moon Painting' },
  { x: 22, y: 66, label: 'WOW 1 DAY Austin' },
  { x: 78, y: 60, label: 'College Pro Painters' },
  { x: 44, y: 76, label: 'Austin Custom Painting' },
];

export function MapPanel({ revealCompetitors = false }: { revealCompetitors?: boolean }) {
  return (
    <div
      style={{
        background: '#E8EEF3',
        borderRadius: 14,
        border: '1px solid var(--dark-8)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Map-like background — diagonal road network + a green park blob */}
      <svg
        viewBox="0 0 600 540"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* park / greenspace */}
        <ellipse cx="120" cy="440" rx="160" ry="80" fill="#D7E8C8" opacity="0.85" />
        <ellipse cx="500" cy="100" rx="120" ry="70" fill="#D7E8C8" opacity="0.65" />

        {/* water */}
        <path
          d="M -20 250 C 100 200, 200 280, 320 240 S 540 220, 640 260 L 640 320 C 540 280, 420 320, 320 300 S 100 260, -20 310 Z"
          fill="#BFD8E8"
          opacity="0.8"
        />

        {/* major roads */}
        <line x1="-50" y1="220" x2="650" y2="270" stroke="#FFFFFF" strokeWidth="14" />
        <line x1="-50" y1="220" x2="650" y2="270" stroke="#E2C76A" strokeWidth="3" />

        <line x1="120" y1="-20" x2="280" y2="560" stroke="#FFFFFF" strokeWidth="12" />
        <line x1="120" y1="-20" x2="280" y2="560" stroke="#E5E0D2" strokeWidth="2" />

        <line x1="500" y1="-20" x2="380" y2="560" stroke="#FFFFFF" strokeWidth="10" />
        <line x1="500" y1="-20" x2="380" y2="560" stroke="#E5E0D2" strokeWidth="2" />

        {/* minor roads */}
        <line x1="-20" y1="400" x2="620" y2="430" stroke="#FFFFFF" strokeWidth="6" />
        <line x1="0" y1="120" x2="620" y2="150" stroke="#FFFFFF" strokeWidth="6" />
        <line x1="200" y1="0" x2="180" y2="540" stroke="#FFFFFF" strokeWidth="5" />
        <line x1="450" y1="0" x2="430" y2="540" stroke="#FFFFFF" strokeWidth="5" />

        {/* building blocks */}
        {[
          [60, 160, 50, 30],
          [140, 320, 80, 40],
          [300, 100, 60, 50],
          [340, 360, 70, 50],
          [480, 380, 60, 40],
          [520, 250, 50, 40],
          [40, 70, 70, 40],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="#DDE3E8" rx="3" opacity="0.8" />
        ))}
      </svg>

      {/* pins */}
      {PINS.map((p, i) => {
        const visible = p.isYou || revealCompetitors;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -100%)',
              opacity: visible ? 1 : 0,
              transition: `opacity 500ms ease ${i * 90}ms`,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50% 50% 50% 0',
                background: p.isYou ? 'var(--purple)' : 'var(--red-70)',
                transform: 'rotate(-45deg)',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--light-100)',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <span style={{ transform: 'rotate(45deg)', lineHeight: 1 }}>
                {p.isYou ? '★' : '•'}
              </span>
            </div>
            <div
              style={{
                marginTop: 6,
                padding: '3px 8px',
                background: 'var(--light-100)',
                border: '1px solid var(--dark-8)',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                color: p.isYou ? 'var(--purple)' : 'var(--dark-90)',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                transform: 'translateX(-50%)',
                marginLeft: 14,
              }}
            >
              {p.label}
            </div>
          </div>
        );
      })}

      {/* watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          fontSize: 10,
          color: 'var(--dark-60)',
          background: 'rgba(255, 255, 255, 0.85)',
          padding: '2px 6px',
          borderRadius: 4,
          fontFamily: 'Sohne, sans-serif',
        }}
      >
        Map data ©2026
      </div>
    </div>
  );
}
