// Instagram phone-frame mockup. Used for the "Reviewing social media
// presence" scan step. Avatar header + follower stats + story highlights +
// 3-column post grid (Unsplash placeholders). The grid posts fade in
// sequentially so the panel feels alive while the scanner "scrolls".

const POSTS = [
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&q=75',
  'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=200&q=75',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&q=75',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=75',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&q=75',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=75',
  'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=200&q=75&fit=crop&crop=top',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&q=75&fit=crop&crop=bottom',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=75&fit=crop&crop=top',
];

const HIGHLIGHTS = ['The Crew', 'Repairs', 'Specials', 'Tips', 'BTS'];

export function InstagramPanel() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(180deg, rgba(124, 92, 252, 0.05) 0%, rgba(124, 92, 252, 0.10) 100%)',
        borderRadius: 14,
        border: '1px solid var(--dark-8)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
        padding: 24,
        overflow: 'hidden',
      }}
    >
      {/* phone frame */}
      <div
        style={{
          width: 280,
          maxWidth: '100%',
          borderRadius: 24,
          background: 'var(--dark-90)',
          padding: 8,
          boxShadow: '0 18px 40px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            background: 'var(--light-100)',
            borderRadius: 18,
            overflow: 'hidden',
            fontFamily: 'Sohne, sans-serif',
          }}
        >
          {/* iOS status row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 14px 4px',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--dark-90)',
            }}
          >
            <span>9:41</span>
            <span style={{ fontSize: 9, color: 'var(--status-approved)' }}>● ● ● ●</span>
          </div>

          {/* nav header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px 10px',
              borderBottom: '1px solid var(--dark-4)',
            }}
          >
            <span style={{ fontSize: 16, color: 'var(--dark-90)' }}>‹</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-90)' }}>brightdayhvac</span>
          </div>

          {/* profile header */}
          <div style={{ padding: '14px 14px 10px' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 8 }}>
              {/* avatar */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, var(--purple), var(--red-70))',
                  padding: 2,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'var(--light-100)',
                    padding: 2,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'var(--dark-90)',
                      color: 'var(--light-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    BD
                  </div>
                </div>
              </div>

              {/* stats */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                {[
                  { n: '47', l: 'posts' },
                  { n: '892', l: 'followers' },
                  { n: '214', l: 'following' },
                ].map((s) => (
                  <div key={s.l}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-90)' }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: 'var(--dark-60)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark-90)' }}>Bright Day HVAC</div>
            <div style={{ fontSize: 10, color: 'var(--dark-60)', lineHeight: 1.4 }}>
              Local AC + heating · Austin, TX 🌞
              <br />
              Same-day repair · brightdayhvac.com
            </div>
          </div>

          {/* highlights row */}
          <div style={{ display: 'flex', gap: 10, padding: '0 14px 10px', overflowX: 'hidden' }}>
            {HIGHLIGHTS.map((h, i) => (
              <div key={h} style={{ textAlign: 'center', flexShrink: 0 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '1.5px solid var(--dark-15)',
                    background: 'var(--dark-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: 'var(--dark-60)',
                  }}
                >
                  {['🔧', '❄', '🎉', '💡', '👷'][i]}
                </div>
                <div style={{ fontSize: 9, color: 'var(--dark-60)', marginTop: 2 }}>{h}</div>
              </div>
            ))}
          </div>

          {/* post grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              borderTop: '1px solid var(--dark-4)',
            }}
          >
            {POSTS.map((src, i) => (
              <div
                key={i}
                style={{
                  paddingTop: '100%',
                  position: 'relative',
                  opacity: 0,
                  animation: `igFadeIn 380ms ease ${i * 80}ms forwards`,
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes igFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
