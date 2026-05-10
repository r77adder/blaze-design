import { Button } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';

/**
 * /h2/paid-search — port of Blaze H2 Features/paid-search.html (Live state).
 *
 * Source has 3 states (empty / wizard / live) plus a 4-step campaign
 * setup flow. This commit ports the steady "Live" view of one running
 * campaign: KPI strip, CTR chart, top-keywords table.
 *
 * NOT yet wired (TODO follow-ups):
 *  - New-campaign wizard (4-step flow)
 *  - Empty/no-campaigns state
 *  - Anomaly resolution actions
 */

const KPIS = [
  { label: 'Impressions', value: '8,432', delta: '↑ 12%', tone: 'up' as const },
  { label: 'Clicks', value: '187', delta: '↑ 8%', tone: 'up' as const },
  { label: 'CTR', value: '2.22%', delta: '↑ 0.4 pt', tone: 'up' as const },
  { label: 'Conversions', value: '6', delta: '↑ 2', tone: 'up' as const },
  { label: 'Spend', value: '$32.40', delta: '81% of daily', tone: 'flat' as const },
  { label: 'CPA', value: '$5.40', delta: 'on target', tone: 'up' as const },
];

const KEYWORDS = [
  { name: 'daily wellness routine', clicks: 62, conv: 3, status: 'Healthy' },
  { name: 'best adaptogens', clicks: 48, conv: 2, status: 'Healthy' },
  { name: 'ashwagandha benefits', clicks: 31, conv: 1, status: 'Healthy' },
  { name: 'wellness supplements', clicks: 23, conv: 0, status: 'Watch' },
  { name: 'stress supplements', clicks: 14, conv: 0, status: 'Healthy' },
];

const DELTA_COLORS = { up: '#0E6B33', down: '#B42318', flat: 'var(--dark-60)' };

export function PaidSearch() {
  const { showToast } = useToast();
  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => showToast({ message: 'Back to Campaigns (TODO)' })}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          color: 'var(--dark-60)',
          fontSize: 13,
          padding: '6px 0',
          marginBottom: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        ← Campaigns
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#20A14F',
            boxShadow: '0 0 0 4px rgba(32,161,79,0.18)',
            animation: 'pulse 1.6s ease-out infinite',
          }}
        />
        <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>Daily Wellness Bundle · Live</h2>
        <span style={{ fontSize: 12, color: 'var(--dark-60)', marginLeft: 4 }}>Started 2h 14m ago</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-60)', marginBottom: 18 }}>
        Search campaign · <strong>$40/day budget</strong> · Targeting wellness-curious adults 25–45, US
      </div>

      {/* KPI strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 10,
          marginBottom: 18,
        }}
      >
        {KPIS.map((k) => (
          <div
            key={k.label}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--dark-60)', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
              {k.value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: DELTA_COLORS[k.tone] }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* CTR chart card */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>CTR — last 14 days</h3>
          <span style={{ fontSize: 11, color: 'var(--dark-40)' }}>vs. industry benchmark</span>
        </div>
        <svg viewBox="0 0 600 160" width="100%" height="160" preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="paidSearchFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="rgba(0,0,0,0.04)" strokeWidth="1">
            <line x1="0" y1="20" x2="600" y2="20" />
            <line x1="0" y1="60" x2="600" y2="60" />
            <line x1="0" y1="100" x2="600" y2="100" />
            <line x1="0" y1="140" x2="600" y2="140" />
          </g>
          <g fontFamily="Sohne" fontSize="10" fill="rgba(0,0,0,0.4)">
            <text x="2" y="22">2.5%</text>
            <text x="2" y="62">2.0%</text>
            <text x="2" y="102">1.5%</text>
            <text x="2" y="142">1.0%</text>
          </g>
          <path
            d="M40 110 L100 105 L160 105 L220 100 L280 95 L340 92 L400 88 L460 85 L520 83 L580 82"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="1.4"
            fill="none"
            strokeDasharray="4 4"
          />
          <path
            d="M40 130 L100 120 L160 120 L220 95 L280 85 L340 90 L400 92 L460 70 L520 65 L580 75 L580 150 L40 150 Z"
            fill="url(#paidSearchFade)"
          />
          <path
            d="M40 130 L100 120 L160 120 L220 95 L280 85 L340 90 L400 92 L460 70 L520 65 L580 75"
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="580" cy="75" r="3.5" fill="#6366f1" />
          <g fontFamily="Sohne" fontSize="10" fill="rgba(0,0,0,0.4)">
            <text x="34" y="158">Apr 24</text>
            <text x="276" y="158">Apr 30</text>
            <text x="540" y="158">May 7</text>
          </g>
        </svg>
      </div>

      {/* Top keywords */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 10px' }}>Top performing keywords</h3>
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
          {KEYWORDS.map((kw, i) => (
            <div
              key={kw.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 100px 120px',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < KEYWORDS.length - 1 ? '1px solid var(--dark-8)' : 'none',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>{kw.name}</span>
              <span style={{ fontSize: 12, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>{kw.clicks} clicks</span>
              <span style={{ fontSize: 12, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>{kw.conv} conv.</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  color: kw.status === 'Healthy' ? '#0E6B33' : '#B45309',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: kw.status === 'Healthy' ? '#20A14F' : '#F59E0B',
                  }}
                />
                {kw.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PaidSearchTopbarAction() {
  const { showToast } = useToast();
  return (
    <Button variant="secondary" size="md" frontIcon={Plus} onClick={() => showToast({ message: 'New campaign wizard (TODO)' })}>
      New campaign
    </Button>
  );
}
