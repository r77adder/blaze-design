// Browser-chrome wrapper around an HVAC-site hero photo. Used for the
// "Analyzing your website" and "Examining website experience" scan steps.
// The highlightRow prop draws a soft scroll/highlight band over the image
// when step 2 ("examining experience") is active — sells the idea that the
// scanner is reading the page, not just downloading it.

export function WebsitePanel({ highlightRow = false }: { highlightRow?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        borderRadius: 14,
        border: '1px solid var(--dark-8)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* browser chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'var(--dark-2)',
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ED6A5E' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#F4BE4F' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#62C554' }} />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 10px',
            background: 'var(--light-100)',
            borderRadius: 6,
            border: '1px solid var(--dark-8)',
            fontFamily: 'Sohne, sans-serif',
            fontSize: 12,
            color: 'var(--dark-60)',
            letterSpacing: '0.02em',
          }}
        >
          brightdayhvac.com
        </div>
        <div style={{ width: 33 }} />
      </div>

      {/* viewport */}
      <div style={{ position: 'relative', height: 'calc(100% - 42px)', background: '#0B0B0B', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=1200&q=75"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.95,
          }}
        />

        {/* hero overlay text — sells it as a real HVAC site */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '24px 28px 28px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)',
            color: 'var(--light-100)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 6 }}>
            Bright Day HVAC · Austin, TX
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1, maxWidth: 360 }}>
            Reliable HVAC service since 2008.
          </div>
        </div>

        {/* scroll/highlight band — appears on the "examining experience" step */}
        {highlightRow && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '40%',
              height: 60,
              background: 'rgba(124, 92, 252, 0.18)',
              borderTop: '1px solid var(--purple)',
              borderBottom: '1px solid var(--purple)',
              transition: 'top 800ms ease',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}
