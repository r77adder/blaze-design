const T = {
  font:   'var(--ios-font)',
  light:  'var(--ios-light-100)',
  dark90: 'var(--ios-dark-90)',
  dark60: 'var(--ios-dark-60)',
  dark8:  'var(--ios-dark-8)',
};

export function NotifyMeModal({ onDismiss, onAccept }: { onDismiss: () => void; onAccept: () => void }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 280, background: T.light, borderRadius: 20, padding: 20,
          display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontFamily: T.font, fontSize: 18, fontWeight: 500, color: T.dark90 }}>Notifications</span>
          <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>
            We'll send one notification when your dashboard is ready on Sunday.
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 99,
              background: T.light, border: `1px solid ${T.dark8}`, cursor: 'pointer',
              fontFamily: T.font, fontSize: 16, color: T.dark90, WebkitAppearance: 'none',
            }}
          >
            No Thanks
          </button>
          <button
            type="button"
            onClick={onAccept}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 99,
              background: T.dark90, border: 'none', cursor: 'pointer',
              fontFamily: T.font, fontSize: 16, color: T.light, WebkitAppearance: 'none',
            }}
          >
            Sounds Good
          </button>
        </div>
      </div>
    </div>
  );
}
