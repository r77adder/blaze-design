import { Button } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';

/**
 * /h2/influencer-content — port of Blaze H2 Features/influencer-content.html (Overview tab).
 *
 * Source has 4 tabs (Overview / Campaigns / Avatars / Content) plus a 7-step
 * campaign wizard. This commit ports the Overview tab.
 *
 * NOT yet wired (TODO follow-ups):
 *  - Campaigns / Avatars / Content tabs
 *  - 7-step campaign wizard
 *  - Tab-jump from stat cards
 */

const STATS = [
  { label: 'Active Campaigns', value: '3', icon: '📣' },
  { label: 'AI Avatars', value: '5', icon: '🤖' },
  { label: 'Videos Generated', value: '12', icon: '🎬' },
  { label: 'Pending Reviews', value: '4', icon: '🔔' },
  { label: 'Est. Reach', value: '142K', icon: '👁️' },
  { label: 'Avg. CTR', value: '4.6%', icon: '📈' },
];

const CAMPAIGNS = [
  { name: 'Day Heel — AI Avatar Campaign', avatars: 'Sofia · Elise', videos: 5, status: 'In Production', sc: '#157A3A', bg: '#DCF5E2', progress: 35 },
  { name: 'The Flat — Lifestyle AI Series', avatars: 'Jordan · Yuki · Amara', videos: 5, status: 'In Review', sc: '#1A56C2', bg: '#DBE9FF', progress: 60 },
  { name: 'Spring Loafer Drop — AI Demos', avatars: 'Sofia · Yuki · Amara', videos: 8, status: 'Running Ads', sc: '#B8440A', bg: '#FBE5DC', progress: 80 },
];

const ACTIVITY = [
  { time: '2h ago', icon: '🤖', text: '5 AI avatar videos generated and ready', action: 'View' },
  { time: '4h ago', icon: '⚠️', text: 'Brand-safety check flagged 1 video', action: 'Review' },
  { time: '6h ago', icon: '🎬', text: 'Sofia avatar — 3 new lifestyle clips', action: 'View' },
  { time: '1d ago', icon: '✓', text: 'Brief approved — Spring Loafer Drop', action: null },
  { time: '2d ago', icon: '⚡', text: 'Jordan avatar trained on Brand Kit', action: null },
];

const INSIGHTS = [
  { title: 'Lifestyle AI videos driving 5.1% CTR', tag: 'Content · Format', icon: '🎬' },
  { title: 'Sofia avatar outperforming by 2.3×', tag: 'Avatar · Insight', icon: '🤖' },
  { title: 'Tuesday 9am posts get +38% reach', tag: 'Scheduling · All', icon: '📅' },
];

export function InfluencerContent() {
  const { showToast } = useToast();
  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--dark-60)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 12px' }}>Active campaigns</h3>
          {CAMPAIGNS.map((c) => (
            <div
              key={c.name}
              onClick={() => showToast({ message: `Open ${c.name}` })}
              style={{
                background: 'var(--light-100)',
                border: '1px solid var(--dark-8)',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 8,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--dark-60)' }}>
                    🤖 {c.videos} AI videos · 🎭 {c.avatars}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: c.bg,
                    color: c.sc,
                    height: 'fit-content',
                  }}
                >
                  {c.status}
                </span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--dark-4)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.progress}%`, background: c.sc }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--dark-40)', marginTop: 4 }}>{c.progress}% complete</div>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 12px' }}>Recent activity</h3>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12 }}>
            {ACTIVITY.map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr auto',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--dark-8)' : 'none',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 16 }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--dark-90)' }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--dark-40)', marginTop: 2 }}>{a.time}</div>
                </div>
                {a.action && (
                  <Button variant="tertiary" size="sm" onClick={() => showToast({ message: `${a.action} ${a.text}` })}>
                    {a.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 12px' }}>🧠 Learning Loop snapshot</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {INSIGHTS.map((ins) => (
          <div
            key={ins.title}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{ins.icon}</span>
              <span style={{ fontSize: 11, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ins.tag}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.4 }}>{ins.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InfluencerContentTopbarAction() {
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="secondary" size="md" onClick={() => showToast({ message: 'Settings (TODO)' })}>Settings</Button>
      <Button variant="primary" size="md" frontIcon={Plus} onClick={() => showToast({ message: 'New campaign wizard (TODO)' })}>
        New Campaign
      </Button>
    </div>
  );
}
