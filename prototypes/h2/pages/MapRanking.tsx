import { Button } from '@/components';
import { useToast } from '@/staging';
import ArrowRightSm from '@/icons/16/ArrowRightSm';

/**
 * /h2/map-ranking — port of Blaze H2 Features/map-ranking.html (steady "live" state).
 *
 * NOT yet wired (TODO follow-ups):
 *  - Multi-step setup flow (audit → working → review → live). Currently
 *    only the live home is rendered.
 *  - Score/strength rings (rendered as flat numbers — SVG ring port deferred).
 *  - "View on Google" topbar action click target.
 */

const COMPETITORS = [
  { rank: 1, name: 'Texas Star Roofing', recent: 'Added 6 reviews in the past week', reviews: '4.9 (213)', you: false },
  { rank: 2, name: 'Apex Roofing & Restoration', recent: 'Up 2 spots this week', reviews: '4.8 (28)', you: true },
  { rank: 3, name: 'Lone Star Roofers', recent: 'Slipped 1 spot', reviews: '4.7 (157)', you: false },
  { rank: 4, name: 'Hill Country Roof Co', recent: 'Holding steady', reviews: '4.6 (94)', you: false },
  { rank: 5, name: 'River City Roofing', recent: 'New competitor', reviews: '4.8 (12)', you: false },
];

const ACTIVITY = [
  { kind: 'success', icon: '★', t: 'New 5-star review from Daniel K.', s: '"Crew was on time and cleaned up perfectly. Highly recommend."', time: '2h ago' },
  { kind: 'info', icon: '↗', t: 'Post published to Google', s: 'Storm prep checklist · 47 views in the first hour', time: 'Yesterday' },
  { kind: 'info', icon: '💬', t: 'Replied to a 4-star review', s: 'Drafted by Blaze · Approved by you · Published', time: 'Yesterday' },
  { kind: '', icon: '🕒', t: 'Profile update: hours confirmed', s: 'Saturday hours updated to 8 AM – 1 PM', time: 'Sat' },
  { kind: 'success', icon: '★', t: 'New 5-star review from Janelle B.', s: '"They handled the insurance claim end to end. Stress-free."', time: 'Apr 18' },
  { kind: 'info', icon: '↗', t: 'Post published to Google', s: 'Behind the scenes — South Austin tear-off', time: 'Apr 16' },
];

function MetricCard({ icon, label, value, delta, deltaKind, foot }: {
  icon: string; label: string; value: string; delta?: string; deltaKind?: 'up' | 'down' | 'flat'; foot: string;
}) {
  const deltaColors: Record<NonNullable<typeof deltaKind>, string> = {
    up: '#0E6B33',
    down: '#B42318',
    flat: 'var(--dark-60)',
  };
  return (
    <div
      style={{
        flex: 1,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--dark-60)', marginBottom: 8 }}>
        <span aria-hidden style={{ fontSize: 13 }}>{icon}</span>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.3px', color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        {delta && (
          <span style={{ fontSize: 12, fontWeight: 500, color: deltaKind ? deltaColors[deltaKind] : 'var(--dark-60)' }}>
            {delta}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>{foot}</div>
    </div>
  );
}

export function MapRanking() {
  const { showToast } = useToast();
  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      {/* Action card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFF7E6 0%, #FFE4B5 100%)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 14,
          padding: '18px 20px',
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#9A6300', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Action needed
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 6px', lineHeight: 1.3 }}>
            Review a 4-star comment from Maria H.
          </h2>
          <p style={{ fontSize: 13, color: 'var(--dark-60)', margin: 0, lineHeight: 1.5 }}>
            The agent drafted a reply. Approve to publish, or tap to edit. Most homeowners read responses before booking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Button variant="tertiary" size="sm" onClick={() => showToast({ message: 'Skipped' })}>Skip for now</Button>
          <Button variant="secondary" size="sm" onClick={() => showToast({ message: 'Reply published to Google' })}>
            Review &amp; reply
          </Button>
        </div>
      </div>

      {/* Metric strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <MetricCard icon="📍" label="Map Pack rank" value="#2" delta="↑ +2" deltaKind="up" foot={'"roof repair austin" · last month'} />
        <MetricCard icon="👁" label="Profile views" value="1,284" delta="+12.3%" deltaKind="up" foot="vs last month" />
        <MetricCard icon="★" label="New reviews" value="5" delta="★ 4.8" deltaKind="up" foot="2 responded today" />
        <MetricCard icon="↗" label="Posts published" value="4" delta="On schedule" deltaKind="flat" foot="Next: Friday at 10 AM" />
      </div>

      {/* Nudge + competitor ladder */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 20,
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '20px 22px',
          marginBottom: 18,
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#20A14F' }} />
            <span style={{ fontSize: 11, color: '#0E6B33', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              You're climbing
            </span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 8px', lineHeight: 1.3 }}>
            Up 2 spots this week — let's keep the momentum going.
          </h2>
          <p style={{ fontSize: 13, color: 'var(--dark-60)', margin: '0 0 14px', lineHeight: 1.5 }}>
            You moved from #4 → #2 for "roof repair austin." The Texas Star team is still adding reviews fast. One more push and you could take #1 by month-end.
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <Button variant="primary" size="sm" endIcon={ArrowRightSm} onClick={() => showToast({ message: 'Review request sent to your last 5 customers' })}>
              Send review request
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => showToast({ message: 'Insights view (out of scope here)' })}>
              See full insight
            </Button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            Rather have us handle this? <a style={{ color: 'var(--purple)', textDecoration: 'none', cursor: 'pointer' }}>Upgrade to Done-for-You →</a>
          </div>
        </div>
        <div style={{ background: 'var(--default-bg)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 8 }}>
            "Roof repair austin" — top 5
          </div>
          {COMPETITORS.map((c) => (
            <div
              key={c.rank}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr auto',
                gap: 8,
                padding: '8px 0',
                borderBottom: '1px solid var(--dark-8)',
                background: c.you ? 'rgba(124,92,252,0.06)' : undefined,
                borderRadius: c.you ? 6 : undefined,
                paddingLeft: c.you ? 8 : 0,
                paddingRight: c.you ? 8 : 0,
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
                #{c.rank}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: c.you ? 500 : 400, color: 'var(--dark-90)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--dark-40)', marginTop: 1 }}>{c.recent}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--dark-60)' }}>★ {c.reviews}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity + side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 12px' }}>Recent activity</h3>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12 }}>
            {ACTIVITY.map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr auto',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--dark-8)' : 'none',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: a.kind === 'success' ? '#D2EFDB' : a.kind === 'info' ? '#E0EAFD' : 'var(--dark-4)',
                    color: a.kind === 'success' ? '#0E6B33' : a.kind === 'info' ? '#1A56C8' : 'var(--dark-60)',
                    fontSize: 14,
                  }}
                >
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>{a.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>{a.s}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 12px' }}>Profile strength</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: '5px solid var(--dark-90)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--dark-90)',
                }}
              >
                86
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>86% complete</div>
                <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>Almost fully optimized</div>
              </div>
            </div>
            {[
              { t: 'Add 5+ recent job photos', s: 'Biggest single boost · +12% to score' },
              { t: 'Answer 3 customer questions', s: 'Drafts ready · 1-min review' },
              { t: 'Add holiday hours for Memorial Day', s: 'Coming up in 4 weeks' },
            ].map((it, i) => (
              <div
                key={i}
                onClick={() => showToast({ message: `${it.t} (TODO)` })}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  padding: '10px 0',
                  borderTop: '1px solid var(--dark-8)',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>{it.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>{it.s}</div>
                </div>
                <span style={{ color: 'var(--dark-40)', alignSelf: 'center' }}>→</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 12px' }}>This month at a glance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { l: 'Posts', v: '4', d: '+1' },
                { l: 'Reviews', v: '5', d: '+2' },
                { l: 'Replies', v: '100%', d: '<2h avg' },
                { l: 'Q&A', v: '3', d: 'drafted' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: 'var(--dark-60)', marginBottom: 4 }}>{s.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark-90)' }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: 'var(--dark-40)', marginTop: 2 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MapRankingTopbarAction() {
  const { showToast } = useToast();
  return (
    <Button variant="secondary" size="md" onClick={() => showToast({ message: 'Open Google Business Profile' })}>
      View on Google
    </Button>
  );
}
