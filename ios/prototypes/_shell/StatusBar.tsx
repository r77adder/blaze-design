/**
 * StatusBar — iOS Dynamic Island status bar.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4648:7295
 *
 * Two themes:
 *   "dark"  — dark icons/text on light backgrounds (default for app screens)
 *   "white" — white icons/text for full-bleed hero imagery
 *
 * Layout: 402 px wide, 44 px tall. Three equal flex slots:
 *   [time centered] [Dynamic Island 125×37] [cellular · wifi · battery]
 */

export interface StatusBarProps {
  theme?: 'dark' | 'white';
  time?: string;
}

export function StatusBar({ theme = 'dark', time = '9:41' }: StatusBarProps) {
  const fg = theme === 'white' ? '#ffffff' : 'rgba(0,0,0,0.9)';

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '11px 16px',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Left slot — time */}
      <div
        style={{
          flex: '1 0 0',
          height: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 2,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            fontSize: 17,
            fontWeight: 600,
            lineHeight: '22px',
            color: fg,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {time}
        </span>
      </div>

      {/* Center — Dynamic Island pill */}
      <div
        style={{
          width: 125,
          height: 37,
          borderRadius: 100,
          background: '#000',
          flexShrink: 0,
        }}
      />

      {/* Right slot — cellular, wifi, battery */}
      <div
        style={{
          flex: '1 0 0',
          height: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          paddingTop: 1,
          minWidth: 0,
        }}
      >
        {/* Cellular — 19.2 × 12.226 */}
        <svg width="19.2" height="12.226" viewBox="0 0 19 12" fill="none" aria-hidden="true">
          <rect x="0"    y="7.5" width="3.2" height="4.5"  rx="0.6" fill={fg} />
          <rect x="4"    y="5"   width="3.2" height="7"    rx="0.6" fill={fg} />
          <rect x="8"    y="2.5" width="3.2" height="9.5"  rx="0.6" fill={fg} />
          <rect x="12"   y="0"   width="3.2" height="12"   rx="0.6" fill={fg} />
          <rect x="16"   y="0"   width="3.2" height="12"   rx="0.6" fill={fg} opacity="0.35" />
        </svg>

        {/* Wifi — 17.142 × 12.328 */}
        <svg width="17.142" height="12.328" viewBox="0 0 17 12" fill="none" aria-hidden="true">
          <circle cx="8.5" cy="10.5" r="1.5" fill={fg} />
          <path d="M4.5 6.8C5.7 5.6 7 5 8.5 5s2.8.6 4 1.8" stroke={fg} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M1.5 3.5C3.6 1.4 5.9 0.5 8.5 0.5S13.4 1.4 15.5 3.5" stroke={fg} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>

        {/* Battery — 27.328 × 13 */}
        <svg width="27.328" height="13" viewBox="0 0 27 13" fill="none" aria-hidden="true">
          <rect x="0.75" y="0.75" width="23.5" height="11.5" rx="3.25" stroke={fg} strokeWidth="1" opacity="0.35" />
          <rect x="2" y="2" width="18" height="9" rx="2" fill={fg} />
          <path d="M25.5 4.5v4c.9-.4 1.5-1.2 1.5-2s-.6-1.6-1.5-2z" fill={fg} opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
