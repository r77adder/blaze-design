const T = {
  font:   'var(--ios-font)',
};

// Lock-screen mockup with the Blaze push notification banner.
// Tap the banner to open the Learning Loop in steady state.
export function LockScreen({ onOpenNotification }: { onOpenNotification: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'linear-gradient(180deg, #4a6f9b 0%, #2c4a6b 50%, #1a2d44 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '70px 16px 40px', overflow: 'hidden',
    }}>
      {/* Date + clock */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        <span style={{ fontFamily: T.font, fontSize: 17, color: '#fff', fontWeight: 500 }}>Monday, June 6</span>
        <span style={{ fontFamily: T.font, fontSize: 92, color: '#fff', fontWeight: 300, lineHeight: 1, letterSpacing: '-3px' }}>9:41</span>
      </div>
      {/* Blaze notification banner (tappable) */}
      <button
        type="button"
        onClick={onOpenNotification}
        style={{
          width: '100%', maxWidth: 360, padding: 14, borderRadius: 16,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(20px) saturate(140%)', WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', WebkitAppearance: 'none',
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(135deg, #ff8a3d 0%, #ff5630 50%, #c5253f 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.font, fontSize: 22, fontWeight: 700, color: '#fff',
        }}>
          B
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontFamily: T.font, fontSize: 13, color: '#fff', fontWeight: 600 }}>Blaze.ai</span>
            <span style={{ fontFamily: T.font, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>9:41 AM</span>
          </div>
          <p style={{ margin: 0, fontFamily: T.font, fontSize: 14, color: '#fff', lineHeight: 1.35 }}>
            Our first recommendation is ready 🎉 See what's driving your engagement — and what to do next.
          </p>
        </div>
      </button>
      {/* Dummy stacked notifications */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: '100%', maxWidth: 360, padding: 14, borderRadius: 16,
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(20px) saturate(140%)', WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8,
            opacity: 0.85,
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontFamily: T.font, fontSize: 13, color: '#fff', fontWeight: 600 }}>Title</span>
              <span style={{ fontFamily: T.font, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>9:41 AM</span>
            </div>
            <span style={{ fontFamily: T.font, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>Description</span>
          </div>
        </div>
      ))}
    </div>
  );
}
