// Google SERP-style search results panel. Used for the "Examining keywords"
// and "Auditing Google ranking" scan steps. Search bar at top + ad row +
// organic results below. The customer's listing is highlighted; a competitor
// ad sits above it.

const ORGANIC = [
  {
    domain: 'fivestarpainting.com/south-austin',
    title: 'Five Star Painting of South Austin — #1 Painters in Austin, TX',
    snippet: 'Interior & exterior painting for Austin homes. 4.8★ across 1,400+ reviews. Free color consultations.',
    rank: 1,
  },
  {
    domain: 'papermoonpainting.com',
    title: 'Paper Moon Painting | Austin Interior & Exterior Painters',
    snippet: 'Licensed Texas painting contractors serving Austin and the Hill Country. Free estimates on every project.',
    rank: 2,
  },
  {
    domain: 'wow1day.com/austin',
    title: 'WOW 1 DAY PAINTING Austin — Painted in a Single Day',
    snippet: 'Professional painting crews finish most homes in one day. Trusted by 800+ Austin homeowners.',
    rank: 3,
  },
  {
    domain: 'certapro.com/austin',
    title: 'CertaPro Painters of Austin · Residential & Commercial Painters',
    snippet: 'Your local painters since 1992. Schedule a free estimate or color consultation today.',
    rank: 4,
    isYou: true,
  },
];

export function SerpPanel() {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        borderRadius: 14,
        border: '1px solid var(--dark-8)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
        padding: 20,
        height: '100%',
        overflow: 'hidden',
        fontFamily: 'Sohne, sans-serif',
      }}
    >
      {/* search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          border: '1px solid var(--dark-15)',
          borderRadius: 999,
          marginBottom: 14,
        }}
      >
        <span style={{ color: 'var(--dark-40)', fontSize: 14 }}>🔍</span>
        <span style={{ flex: 1, fontSize: 13, color: 'var(--dark-90)' }}>painters Austin</span>
        <span style={{ fontSize: 11, color: 'var(--dark-40)' }}>Google</span>
      </div>

      {/* sponsored ad row */}
      <div
        style={{
          padding: 12,
          background: 'rgba(124, 92, 252, 0.05)',
          border: '1px solid rgba(124, 92, 252, 0.18)',
          borderRadius: 8,
          marginBottom: 12,
          opacity: 0,
          animation: 'serpFadeIn 360ms ease 60ms forwards',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--dark-90)',
              padding: '1px 6px',
              border: '1px solid var(--dark-15)',
              borderRadius: 4,
            }}
          >
            Sponsored
          </span>
          <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>fivestarpainting.com/south-austin</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 500, marginBottom: 2 }}>
          Five Star Painting — CertaPro Austin alternative
        </div>
        <div style={{ fontSize: 11, color: 'var(--dark-60)', lineHeight: 1.4 }}>
          Looking for painters in Austin? Get a free estimate from Five Star Painting instead.
        </div>
      </div>

      {/* organic results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ORGANIC.map((r, i) => (
          <div
            key={r.domain}
            style={{
              padding: 10,
              borderRadius: 8,
              background: r.isYou ? 'rgba(188, 1, 11, 0.04)' : 'transparent',
              border: r.isYou ? '1px solid rgba(188, 1, 11, 0.18)' : '1px solid transparent',
              opacity: 0,
              animation: `serpFadeIn 360ms ease ${120 + i * 100}ms forwards`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark-40)' }}>#{r.rank}</span>
              <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>{r.domain}</span>
              {r.isYou && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--red-90)',
                    padding: '1px 6px',
                    background: 'rgba(188, 1, 11, 0.08)',
                    borderRadius: 4,
                    letterSpacing: '0.04em',
                  }}
                >
                  YOU
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 14,
                color: r.isYou ? 'var(--red-90)' : 'var(--purple)',
                fontWeight: 500,
                marginBottom: 3,
              }}
            >
              {r.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.4 }}>{r.snippet}</div>
          </div>
        ))}
      </div>

      <style>{`@keyframes serpFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
