// Instagram phone-frame mockup. Used for the "Reviewing social media
// presence" scan step. Avatar header + follower stats + story highlights +
// 3-column post grid (real CertaPro Austin project photos). The grid posts
// fade in sequentially so the panel feels alive while the scanner "scrolls".

const POSTS = [
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/02/After-Pic.png',
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg',
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2022/03/white-painted-brick-home-686x353.jpg',
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/AfterIMG_0384-scaled.jpeg',
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/color_consultation_certapro_preview-686x353.jpg',
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/siding-painting.jpg',
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2025/01/After-4-rotated.jpeg',
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/deck-staining-1.jpg',
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/power-washing-2.jpg',
];

const HIGHLIGHTS = ['Cabinets', 'Exteriors', 'Crew', 'Specials', 'Before/After'];

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
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-90)' }}>certapro_austin</span>
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
                    CP
                  </div>
                </div>
              </div>

              {/* stats */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                {[
                  { n: '124', l: 'posts' },
                  { n: '1,840', l: 'followers' },
                  { n: '286', l: 'following' },
                ].map((s) => (
                  <div key={s.l}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-90)' }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: 'var(--dark-60)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark-90)' }}>CertaPro Painters of Austin</div>
            <div style={{ fontSize: 10, color: 'var(--dark-60)', lineHeight: 1.4 }}>
              Austin&rsquo;s painters · Residential + Commercial 🎨
              <br />
              Free estimates · 187 ★ · certapro.com/austin
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
                  {['🪵', '🏠', '👷', '🎉', '🎨'][i]}
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
