// Google SERP-style search results panel. Used for the "Examining keywords"
// and "Auditing Google ranking" scan steps. Search bar at top + ad row +
// organic results below. The customer's listing is highlighted; competitor
// ads sit above it.

const ORGANIC = [
  {
    domain: 'austinairpros.com',
    title: 'Austin Air Pros — #1 HVAC Repair in Austin, TX',
    snippet: 'Same-day AC repair, installation & maintenance. 4.8★ across 1,200+ reviews. Family-owned since 1998.',
    rank: 1,
  },
  {
    domain: 'reliablecomforthvac.com',
    title: 'Reliable Comfort HVAC | Austin Heating & Cooling',
    snippet: 'Licensed Texas HVAC contractors serving Austin and surrounding areas. Free estimates on installation.',
    rank: 2,
  },
  {
    domain: 'lonestarheatingair.com',
    title: 'Lone Star Heating & Air Conditioning — Austin',
    snippet: '24/7 emergency HVAC service in Greater Austin. Trusted by 650+ homeowners and businesses.',
    rank: 3,
  },
  {
    domain: 'brightdayhvac.com',
    title: 'Bright Day HVAC · Austin HVAC Repair & Installation',
    snippet: 'Reliable HVAC service since 2008. Schedule a free consultation today.',
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
        <span style={{ flex: 1, fontSize: 13, color: 'var(--dark-90)' }}>HVAC repair Austin</span>
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
          <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>reliablecomforthvac.com</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 500, marginBottom: 2 }}>
          Reliable Comfort — Bright Day HVAC alternative
        </div>
        <div style={{ fontSize: 11, color: 'var(--dark-60)', lineHeight: 1.4 }}>
          Looking for HVAC repair in Austin? Get a free estimate from Reliable Comfort instead.
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
