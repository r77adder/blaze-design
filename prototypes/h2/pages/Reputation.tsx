import { useState } from 'react';
import { Button } from '@/components';
import { useToast } from '@/staging';

/**
 * /h2/reputation — port of Blaze H2 Features/reputation.html.
 *
 * KPI strip + tabbed surface (Reviews & Comments / Business Insights /
 * Social Listening). Each tab shows a list of items needing attention,
 * many with an AI-drafted reply ready to approve.
 *
 * Brand-specific source pill colors (Yelp/Reddit/Google/Instagram/Facebook/
 * TikTok) are inlined — these are platform-brand colors, not part of our
 * generic token set.
 *
 * NOT yet wired (TODO follow-up):
 *  - Insights & Listening tabs (only Reviews & Comments has content)
 *  - "Edit" on AI drafts
 *  - Per-item drill-in
 */

type Severity = 'urgent' | 'watch';
type Source = 'yelp' | 'reddit' | 'google' | 'instagram' | 'facebook' | 'tiktok';

interface AttentionItem {
  severity: Severity;
  source: Source;
  sourceLabel: string;
  customer?: string;
  when: string;
  stars?: number; // 1-5; for star-rating sources
  title: string;
  body: string;
  containment?: string;
  velocity?: string;
  aiDraft?: {
    tone: string;
    confidence: number;
    text: string;
  };
}

const SOURCE_STYLES: Record<Source, { bg: string; fg: string }> = {
  google: { bg: '#FEF3E0', fg: '#B45309' },
  yelp: { bg: '#FEE4E2', fg: '#B42318' },
  reddit: { bg: '#FFE9DA', fg: '#C2410C' },
  facebook: { bg: '#E0EAFD', fg: '#1A56C8' },
  instagram: { bg: '#FCE7F3', fg: '#9D174D' },
  tiktok: { bg: '#F4F4F4', fg: '#111111' },
};

const ATTENTION: AttentionItem[] = [
  {
    severity: 'urgent', source: 'yelp', sourceLabel: 'Yelp',
    customer: 'Devon R. · Brooklyn, NY', when: 'Yesterday', stars: 2,
    title: 'Subscription charged twice, hard to cancel',
    body: 'Got billed twice for the same month and the help center kept routing me in circles. Took a chat agent 30 minutes to refund it.',
    containment: 'Escalating', velocity: '↗ 2.4× normal · 24h',
  },
  {
    severity: 'watch', source: 'reddit', sourceLabel: 'r/Supplements',
    customer: 'u/balanced_runner', when: '5h ago',
    title: 'Anyone else notice the new formula tastes different?',
    body: "Bought a bottle last week and the aftertaste is way more bitter than the old one. Wondering if Radiant Health changed something.",
    containment: 'Active issue', velocity: '↗ 3× normal · 6h',
    aiDraft: {
      tone: 'Curious, transparent', confidence: 78,
      text: '"Hey — that\'s a fair callout. We did tweak the formulation in March to remove a synthetic binder, which can shift the aftertaste. We\'re still iterating: a flavor-mask sachet is shipping to current subscribers next week, and if you\'d like one, reply with your order # and we\'ll send it on us."',
    },
  },
  {
    severity: 'urgent', source: 'google', sourceLabel: 'Google Reviews',
    customer: 'Marissa K. · Austin, TX', when: '2h ago', stars: 1,
    title: 'Order arrived damaged, no response from support',
    body: "I've emailed twice about the broken bottle and haven't heard back in 4 days. Disappointed because I really liked the product itself.",
    containment: 'Isolated complaint',
  },
  {
    severity: 'watch', source: 'instagram', sourceLabel: 'Instagram comment',
    customer: '@hannahgoesgreen', when: '1d ago',
    title: 'Is this safe while pregnant? No info on the site.',
    body: "Hi! Trying to figure out if the multi is safe during pregnancy — I couldn't find anything in the FAQ.",
    containment: 'Emerging pattern',
    aiDraft: {
      tone: 'Warm, factual', confidence: 94,
      text: '"Hi Hannah! Great question — our daily multi isn\'t formulated specifically for pregnancy, so we always recommend checking with your OB before adding any new supplement. We\'re rolling out a dedicated pregnancy-safe FAQ this month and will share when it\'s live!"',
    },
  },
];

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  delta: { tone: 'good' | 'bad' | 'warn'; text: string };
  sub: string;
}

const DELTA_STYLES: Record<KpiCardProps['delta']['tone'], { bg: string; color: string }> = {
  good: { bg: '#D2EFDB', color: '#0E6B33' },
  bad: { bg: '#FEE4E2', color: '#B42318' },
  warn: { bg: '#FFE9A8', color: '#7B5B00' },
};

function KpiCard({ label, value, unit, delta, sub }: KpiCardProps) {
  const ds = DELTA_STYLES[delta.tone];
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '14px 16px',
        flex: 1,
      }}
    >
      <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: '-0.3px',
            color: 'var(--dark-90)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, color: 'var(--dark-40)' }}>{unit}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            background: ds.bg,
            color: ds.color,
          }}
        >
          {delta.text}
        </span>
        <span style={{ fontSize: 11, color: 'var(--dark-40)' }}>{sub}</span>
      </div>
    </div>
  );
}

function SourceBadge({ source, label }: { source: Source; label: string }) {
  const s = SOURCE_STYLES[source];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 7px',
        borderRadius: 5,
        background: s.bg,
        color: s.fg,
        fontSize: 11,
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

function Stars({ n }: { n: number }) {
  const filled = '★'.repeat(n);
  const empty = '★'.repeat(5 - n);
  return (
    <span style={{ fontSize: 12, color: '#F59E0B', letterSpacing: 1 }}>
      {filled}
      <span style={{ color: 'var(--dark-15)' }}>{empty}</span>
    </span>
  );
}

function AttentionCard({ item, onApprove }: { item: AttentionItem; onApprove: (msg: string) => void }) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <SourceBadge source={item.source} label={item.sourceLabel} />
        {item.stars !== undefined && <Stars n={item.stars} />}
        <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>{item.customer}</span>
        <span style={{ fontSize: 11, color: 'var(--dark-40)', marginLeft: 'auto' }}>{item.when}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.35, marginBottom: 6 }}>
        {item.title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5, marginBottom: 12 }}>
        {item.body}
      </div>
      {item.aiDraft && (
        <div
          style={{
            background: '#F1ECFF',
            border: '1px solid rgba(124,92,252,0.18)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              color: 'var(--purple)',
              fontWeight: 500,
              marginBottom: 6,
            }}
          >
            ✦ AI draft · {item.aiDraft.tone}
            <span style={{ color: 'var(--dark-40)', fontWeight: 400, marginLeft: 'auto' }}>
              Confidence {item.aiDraft.confidence}%
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--dark-90)', lineHeight: 1.5, marginBottom: 10 }}>
            {item.aiDraft.text}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="secondary" size="sm" onClick={() => onApprove('Edit (TODO)')}>Edit</Button>
            <Button variant="secondary" size="sm" onClick={() => onApprove(`Reply approved · sending to ${item.sourceLabel}`)}>
              Approve & reply
            </Button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {item.containment && (
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: 'var(--dark-4)', color: 'var(--dark-80)' }}>
            {item.containment}
          </span>
        )}
        {item.velocity && (
          <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>{item.velocity}</span>
        )}
        {!item.aiDraft && (
          <div style={{ marginLeft: 'auto' }}>
            <Button variant="secondary" size="sm" onClick={() => onApprove('Open thread (TODO)')}>Open thread</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Tabs({ active, onChange, counts }: {
  active: 'reviews' | 'insights' | 'listening';
  onChange: (k: 'reviews' | 'insights' | 'listening') => void;
  counts: { reviews?: number; insights?: number };
}) {
  const tabs: { key: typeof active; label: string; count?: number }[] = [
    { key: 'reviews', label: 'Reviews & Comments', count: counts.reviews },
    { key: 'insights', label: 'Business Insights', count: counts.insights },
    { key: 'listening', label: 'Social Listening' },
  ];
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--dark-8)', marginBottom: 16 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          style={{
            padding: '11px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${active === t.key ? 'var(--dark-90)' : 'transparent'}`,
            marginBottom: -1,
            fontFamily: 'inherit',
            fontSize: 13.5,
            fontWeight: active === t.key ? 500 : 400,
            color: active === t.key ? 'var(--dark-90)' : 'var(--dark-60)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {t.label}
          {t.count !== undefined && (
            <span
              style={{
                fontSize: 11,
                color: active === t.key ? 'var(--dark-90)' : 'var(--dark-40)',
                background: active === t.key ? 'var(--dark-8)' : 'var(--dark-4)',
                padding: '1px 7px',
                borderRadius: 99,
              }}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Reputation() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'reviews' | 'insights' | 'listening'>('reviews');

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--dark-60)',
            padding: '6px 12px',
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 99,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#20A14F',
              boxShadow: '0 0 0 4px rgba(32,161,79,0.16)',
            }}
          />
          Scan complete · 6 sources · 1,248 signals analyzed
        </span>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <KpiCard label="Reputation Health" value="82" unit="/100" delta={{ tone: 'good', text: '+4' }} sub="vs last 30 days" />
        <KpiCard label="Total Mentions" value="1,248" delta={{ tone: 'good', text: '+18%' }} sub="this week" />
        <KpiCard label="Positive Sentiment" value="74%" delta={{ tone: 'good', text: '+2.1%' }} sub="of all mentions" />
        <KpiCard label="Negative Sentiment" value="11%" delta={{ tone: 'bad', text: '+1.4%' }} sub="trending up" />
        <KpiCard label="Needs Attention" value="9" delta={{ tone: 'warn', text: '3 urgent' }} sub="reviews + comments" />
      </div>

      <Tabs active={tab} onChange={setTab} counts={{ reviews: 9, insights: 5 }} />

      {tab === 'reviews' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>Needs attention</h3>
            <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>9 items · sorted by impact</span>
          </div>
          {ATTENTION.map((item, i) => (
            <AttentionCard key={i} item={item} onApprove={(msg) => showToast({ message: msg })} />
          ))}
        </>
      )}
      {tab === 'insights' && (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--dark-40)' }}>
          Business Insights pane — TODO port from reputation.html
        </div>
      )}
      {tab === 'listening' && (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--dark-40)' }}>
          Social Listening pane — TODO port from reputation.html
        </div>
      )}
    </div>
  );
}
