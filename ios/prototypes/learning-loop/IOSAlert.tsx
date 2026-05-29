const T = {
  font:   'var(--ios-font)',
};

// iOS-style system alert dialog.
// Uses iOS native font stack and the system blue for the affirmative action.
export function IOSAlert({ onDeny, onAllow }: { onDeny: () => void; onAllow: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90,
    }}>
      <div style={{
        width: 270, background: 'rgba(245,245,245,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 24px 50px rgba(0,0,0,0.25)',
      }}>
        <div style={{ padding: '20px 16px 18px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: T.font, fontSize: 17, fontWeight: 600, color: 'rgba(0,0,0,0.9)' }}>
            “Blaze” Would Like to Send You Notifications
          </span>
          <span style={{ fontFamily: T.font, fontSize: 13, color: 'rgba(0,0,0,0.8)', lineHeight: 1.3 }}>
            Notifications may include alerts, sounds and icon badges. These can be configured in Settings.
          </span>
        </div>
        <div style={{ display: 'flex', borderTop: '0.5px solid rgba(0,0,0,0.2)' }}>
          <button
            type="button"
            onClick={onDeny}
            style={{
              flex: 1, padding: '11px 0', background: 'transparent', border: 'none', cursor: 'pointer',
              borderRight: '0.5px solid rgba(0,0,0,0.2)',
              fontFamily: T.font, fontSize: 17, color: '#007aff', WebkitAppearance: 'none',
            }}
          >
            Don't Allow
          </button>
          <button
            type="button"
            onClick={onAllow}
            style={{
              flex: 1, padding: '11px 0', background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: T.font, fontSize: 17, fontWeight: 600, color: '#007aff', WebkitAppearance: 'none',
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
