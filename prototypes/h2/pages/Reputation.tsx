import { useState } from 'react';
import { Button, Modal, ModalStack, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { useToast } from '@/staging';
import { H2Layout } from '../H2Layout';

/**
 * /h2/reputation — deep port of Blaze H2 Features/reputation.html.
 *
 * KPI strip + tabbed surface (Reviews & Comments / Business Insights /
 * Social Listening). Each tab shows a list of items needing attention,
 * many with an AI-drafted reply ready to approve.
 *
 * Brand-specific source pill colors (Yelp/Reddit/Google/Instagram/Facebook/
 * TikTok) are inlined — these are platform-brand colors, not part of our
 * generic token set.
 *
 * Per-page-route pattern: <ReputationRoute /> wraps inner in <ModalStack>
 * to enable the AI draft Edit modal.
 */

type Severity = 'urgent' | 'watch';
type Source = 'yelp' | 'reddit' | 'google' | 'instagram' | 'facebook' | 'tiktok';

interface AiDraft {
  tone: string;
  confidence: number;
  text: string;
  /** When the model isn't confident, surface a softer "needs review" tint. */
  needsReview?: boolean;
}

interface AttentionItem {
  id: string;
  severity: Severity;
  source: Source;
  sourceLabel: string;
  customer?: string;
  when: string;
  stars?: number;
  title: string;
  body: string;
  containment?: { label: string; tone: 'escalating' | 'emerging' | 'pattern' | 'isolated' };
  velocity?: string;
  aiDraft?: AiDraft;
}

interface QuickDraftItem {
  id: string;
  source: Source;
  sourceLabel: string;
  stars?: number;
  author: string;
  excerpt: string;
  draft: AiDraft;
  approveLabel: string;
  approveToast: string;
}

interface InsightItem {
  id: string;
  category: 'priority' | 'product' | 'content' | 'opp' | 'capacity';
  categoryLabel: string;
  metaPills: { text: string; tone?: 'up' | 'good' }[];
  title: string;
  body: string;
  actionLabel: string;
  actionToast: string;
  icon: 'priority' | 'product' | 'content' | 'opp' | 'capacity';
}

interface MentionItem {
  id: string;
  source: Source;
  sourceLabel: string;
  when: string;
  text: string;
  author: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  meta: string;
}

interface TopicRow {
  topic: string;
  topicTone?: 'positive' | 'risk';
  mentions: number;
  sentiment: number;
  sentimentTone: 'green' | 'yellow' | 'red';
  velocity: string;
  trend: { dir: 'up' | 'down' | 'flat'; text: string };
  badge?: { kind: 'src'; source: Source; label: string } | { kind: 'spike'; label: string };
}

const SOURCE_STYLES: Record<Source, { bg: string; fg: string }> = {
  google: { bg: '#FEF3E0', fg: '#B45309' },
  yelp: { bg: '#FEE4E2', fg: '#B42318' },
  reddit: { bg: '#FFE9DA', fg: '#C2410C' },
  facebook: { bg: '#E0EAFD', fg: '#1A56C8' },
  instagram: { bg: '#FCE7F3', fg: '#9D174D' },
  tiktok: { bg: '#F4F4F4', fg: '#111111' },
};

const CONTAINMENT_STYLES: Record<NonNullable<AttentionItem['containment']>['tone'], { bg: string; color: string }> = {
  escalating: { bg: '#FEE2E2', color: '#991B1B' },
  emerging: { bg: '#FFE9A8', color: '#7B5B00' },
  pattern: { bg: '#FFF1D6', color: '#854D0E' },
  isolated: { bg: 'var(--dark-4)', color: 'var(--dark-60)' },
};

const INSIGHT_TILE_STYLES: Record<InsightItem['category'], { bg: string; color: string }> = {
  priority: { bg: '#FEE2E2', color: '#991B1B' },
  product: { bg: '#FEF3C7', color: '#854D0E' },
  content: { bg: '#DBEAFE', color: '#1E40AF' },
  opp: { bg: '#D1FAE5', color: '#065F46' },
  capacity: { bg: '#EDE9FE', color: '#5B21B6' },
};

const ATTENTION: AttentionItem[] = [
  {
    id: 'devon-yelp',
    severity: 'urgent', source: 'yelp', sourceLabel: 'Yelp',
    customer: 'Devon R. · Brooklyn, NY', when: 'Yesterday', stars: 2,
    title: 'Subscription charged twice, hard to cancel',
    body: 'Got billed twice for the same month and the help center kept routing me in circles. Took a chat agent 30 minutes to refund it.',
    containment: { label: 'Escalating', tone: 'escalating' },
    velocity: '↗ 2.4× normal · 24h',
  },
  {
    id: 'balanced-runner-reddit',
    severity: 'watch', source: 'reddit', sourceLabel: 'r/Supplements',
    customer: 'u/balanced_runner', when: '5h ago',
    title: 'Anyone else notice the new formula tastes different?',
    body: "Bought a bottle last week and the aftertaste is way more bitter than the old one. Wondering if Radiant Health changed something.",
    containment: { label: 'Active issue', tone: 'emerging' },
    velocity: '↗ 3× normal · 6h',
    aiDraft: {
      tone: 'Curious, transparent', confidence: 78,
      text: '"Hey — that\'s a fair callout. We did tweak the formulation in March to remove a synthetic binder, which can shift the aftertaste. We\'re still iterating: a flavor-mask sachet is shipping to current subscribers next week, and if you\'d like one, reply with your order # and we\'ll send it on us."',
    },
  },
  {
    id: 'marissa-google',
    severity: 'urgent', source: 'google', sourceLabel: 'Google Reviews',
    customer: 'Marissa K. · Austin, TX', when: '2h ago', stars: 1,
    title: 'Order arrived damaged, no response from support',
    body: "I've emailed twice about the broken bottle and haven't heard back in 4 days. Disappointed because I really liked the product itself.",
    containment: { label: 'Isolated complaint', tone: 'isolated' },
  },
  {
    id: 'hannah-instagram',
    severity: 'watch', source: 'instagram', sourceLabel: 'Instagram comment',
    customer: '@hannahgoesgreen', when: '1d ago',
    title: 'Is this safe while pregnant? No info on the site.',
    body: "Hi! Trying to figure out if the multi is safe during pregnancy — I couldn't find anything in the FAQ.",
    containment: { label: 'Emerging pattern', tone: 'pattern' },
    aiDraft: {
      tone: 'Warm, factual', confidence: 94,
      text: '"Hi Hannah! Great question — our daily multi isn\'t formulated specifically for pregnancy, so we always recommend checking with your OB before adding any new supplement. We\'re rolling out a dedicated pregnancy-safe FAQ this month and will share when it\'s live!"',
    },
  },
];

const QUICK_DRAFTS: QuickDraftItem[] = [
  {
    id: 'priya-google',
    source: 'google', sourceLabel: 'Google Reviews',
    stars: 4, author: 'Priya S.',
    excerpt: '"Love the daily multi but the capsules are a little big for me to swallow."',
    draft: {
      tone: 'Warm, helpful', confidence: 92,
      text: '"Hi Priya — thank you so much for sticking with the daily multi! Capsule size is something we hear from a few of our customers, and the team is actively testing a smaller mini-cap format for early next year…"',
    },
    approveLabel: 'Approve',
    approveToast: 'Reply approved',
  },
  {
    id: 'theo-facebook',
    source: 'facebook', sourceLabel: 'Facebook',
    author: 'Theo M.',
    excerpt: '"Do you ship to Canada yet?"',
    draft: {
      tone: 'Friendly, concise', confidence: 97,
      text: '"Hey Theo! We don\'t ship to Canada quite yet, but it\'s near the top of our 2026 roadmap. If you drop your email at radianthealth.co/canada we\'ll let you know the moment it goes live."',
    },
    approveLabel: 'Approve',
    approveToast: 'Reply approved',
  },
  {
    id: 'devon-yelp-quick',
    source: 'yelp', sourceLabel: 'Yelp',
    stars: 2, author: 'Devon R.',
    excerpt: '"Subscription charged twice, hard to cancel."',
    draft: {
      tone: 'Apologetic', confidence: 71, needsReview: true,
      text: '"Hi Devon — that\'s frustrating, and I\'m sorry it took so long to sort out. I\'ve flagged your account internally so a senior support lead will reach out today with confirmation of the refund and a small credit on your next order…"',
    },
    approveLabel: 'Send to team',
    approveToast: 'Sent to support team',
  },
];

const INSIGHTS: InsightItem[] = [
  {
    id: 'audit-cancel',
    category: 'priority', categoryLabel: 'High priority', icon: 'priority',
    metaPills: [
      { text: 'Subscription cancel' },
      { text: '+41%', tone: 'up' },
      { text: 'Yelp 2★' },
    ],
    title: 'Audit customer service & cancellation flow',
    body: '41% spike in negative mentions about subscription cancel friction, plus support-thread complaints across Yelp & Google. Root cause sits in policy + tooling, not just replies.',
    actionLabel: 'Brief support team',
    actionToast: 'Brief sent to support team',
  },
  {
    id: 'reformulate',
    category: 'product', categoryLabel: 'Product', icon: 'product',
    metaPills: [
      { text: 'New formula taste' },
      { text: '+60%', tone: 'up' },
      { text: 'Reddit r/Supplements' },
    ],
    title: 'Reformulate or offer alt-mix option for new formula',
    body: 'Bitter-aftertaste chatter on Reddit (+60% wk/wk) is reaching subscribers. Consider a side-by-side blind taste test, or ship a flavor-masking sachet to existing customers.',
    actionLabel: 'Open product brief',
    actionToast: 'Opening product brief',
  },
  {
    id: 'pregnancy-faq',
    category: 'content', categoryLabel: 'Content gap', icon: 'content',
    metaPills: [
      { text: 'Pregnancy safety' },
      { text: '+18%', tone: 'up' },
      { text: 'FAQ gap' },
    ],
    title: 'Publish a pregnancy-safety FAQ + carousel',
    body: '39 mentions in 7 days asking the same question across IG and the help center. A clear FAQ closes the loop, lifts trust, and removes a recurring inbound question.',
    actionLabel: 'Draft FAQ post',
    actionToast: 'Drafting FAQ post',
  },
  {
    id: 'energy-campaign',
    category: 'opp', categoryLabel: 'Opportunity', icon: 'opp',
    metaPills: [
      { text: 'Energy boost' },
      { text: '+8%', tone: 'good' },
      { text: 'TikTok 1.8k reactions' },
    ],
    title: 'Lean into "cleaner energy" as next campaign angle',
    body: 'Energy gummies are the #1 unsolicited positive theme (248 mentions, 91% positive). Pull this language directly into next month\'s hero campaign and ad copy.',
    actionLabel: 'Use in campaign',
    actionToast: 'Added to next campaign brief',
  },
  {
    id: 'auto-request',
    category: 'capacity', categoryLabel: 'Capacity', icon: 'capacity',
    metaPills: [
      { text: '42 review opps' },
      { text: 'Sentiment +2.1%', tone: 'good' },
    ],
    title: 'Activate auto-request for happy-moment reviews',
    body: '42 customers triggered a 90+ delight score this week but only 6 left a review. A 24-hour follow-up prompt could 4–5× your weekly review volume.',
    actionLabel: 'Turn on auto-request',
    actionToast: 'Auto-request turned on',
  },
];

const MENTIONS: MentionItem[] = [
  {
    id: 'm-1', source: 'reddit', sourceLabel: 'r/SkincareAddicts', when: '9h',
    text: 'Honestly the Radiant Health glow gummies cleared my skin in 3 weeks. Not paid, just hyped.',
    author: 'u/glow_lover_22', sentiment: 'positive', meta: '· 412 reactions · 48k reach',
  },
  {
    id: 'm-2', source: 'tiktok', sourceLabel: 'TikTok comment', when: '2d',
    text: 'I switched from [competitor] to Radiant Health and the energy gummies actually do something',
    author: '@morningwithmel', sentiment: 'positive', meta: '· 1,842 reactions · 180k views',
  },
  {
    id: 'm-3', source: 'reddit', sourceLabel: 'r/Supplements', when: '5h',
    text: 'Anyone else notice the new Radiant Health formula tastes different?',
    author: 'u/balanced_runner', sentiment: 'negative', meta: '· 38 reactions · 12k reach',
  },
  {
    id: 'm-4', source: 'google', sourceLabel: 'Google Search', when: '1d',
    text: "Roundup: 8 supplement subscriptions that don't lock you in (Radiant Health makes the list)",
    author: 'wellnessdigest.com', sentiment: 'positive', meta: '· Press',
  },
  {
    id: 'm-5', source: 'yelp', sourceLabel: 'Yelp', when: 'Yesterday',
    text: 'Subscription charged twice, hard to cancel — see review.',
    author: 'Devon R.', sentiment: 'negative', meta: '· Local',
  },
];

const TOPICS: TopicRow[] = [
  { topic: 'Energy boost', topicTone: 'positive', mentions: 248, sentiment: 91, sentimentTone: 'green', velocity: '1.2× normal', trend: { dir: 'up', text: '↑ +8%' }, badge: { kind: 'src', source: 'instagram', label: 'strongest' } },
  { topic: 'Shipping speed', mentions: 184, sentiment: 34, sentimentTone: 'red', velocity: '1.4× normal', trend: { dir: 'up', text: '↑ +22%' } },
  { topic: 'Sleep support', topicTone: 'positive', mentions: 162, sentiment: 86, sentimentTone: 'green', velocity: '1.0× normal', trend: { dir: 'flat', text: '— 0%' } },
  { topic: 'Capsule size', mentions: 96, sentiment: 58, sentimentTone: 'yellow', velocity: '1.1× normal', trend: { dir: 'up', text: '↑ +12%' } },
  { topic: 'Pricing', mentions: 88, sentiment: 49, sentimentTone: 'yellow', velocity: '0.9× normal', trend: { dir: 'down', text: '↓ −6%' } },
  { topic: 'Subscription cancel', topicTone: 'risk', mentions: 71, sentiment: 18, sentimentTone: 'red', velocity: '2.4× normal', trend: { dir: 'up', text: '↑ +41%' }, badge: { kind: 'spike', label: 'Spike detected' } },
  { topic: 'New formula taste', topicTone: 'risk', mentions: 54, sentiment: 42, sentimentTone: 'yellow', velocity: '3.1× normal', trend: { dir: 'up', text: '↑ +60%' }, badge: { kind: 'spike', label: 'Spreading on Reddit' } },
  { topic: 'Pregnancy safety', mentions: 39, sentiment: 61, sentimentTone: 'yellow', velocity: '1.3× normal', trend: { dir: 'up', text: '↑ +18%' } },
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

interface AiDraftBlockProps {
  draft: AiDraft;
  approveLabel?: string;
  onEdit: () => void;
  onApprove: () => void;
}

function AiDraftBlock({ draft, approveLabel = 'Approve & reply', onEdit, onApprove }: AiDraftBlockProps) {
  const palette = draft.needsReview
    ? { bg: '#FFF1D6', border: 'rgba(180,131,9,0.18)', headColor: '#854D0E', leadGlyph: '⊙ Needs human review' }
    : { bg: '#F1ECFF', border: 'rgba(124,92,252,0.18)', headColor: 'var(--purple)', leadGlyph: '✦ AI draft' };
  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
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
          color: palette.headColor,
          fontWeight: 500,
          marginBottom: 6,
        }}
      >
        {palette.leadGlyph} · {draft.tone}
        <span style={{ color: 'var(--dark-40)', fontWeight: 400, marginLeft: 'auto' }}>
          Confidence {draft.confidence}%
        </span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-90)', lineHeight: 1.5, marginBottom: 10 }}>
        {draft.text}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
        <Button variant="secondary" size="sm" onClick={onApprove}>{approveLabel}</Button>
      </div>
    </div>
  );
}

interface AttentionCardProps {
  item: AttentionItem;
  onEditDraft: (item: AttentionItem) => void;
  onApproveDraft: (item: AttentionItem) => void;
  onOpenThread: (item: AttentionItem) => void;
}

function AttentionCard({ item, onEditDraft, onApproveDraft, onOpenThread }: AttentionCardProps) {
  const containmentStyle = item.containment ? CONTAINMENT_STYLES[item.containment.tone] : null;
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
        <AiDraftBlock
          draft={item.aiDraft}
          onEdit={() => onEditDraft(item)}
          onApprove={() => onApproveDraft(item)}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {item.containment && containmentStyle && (
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 5,
              background: containmentStyle.bg,
              color: containmentStyle.color,
              fontWeight: 500,
            }}
          >
            {item.containment.label}
          </span>
        )}
        {item.velocity && (
          <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>{item.velocity}</span>
        )}
        {!item.aiDraft && (
          <div style={{ marginLeft: 'auto' }}>
            <Button variant="secondary" size="sm" onClick={() => onOpenThread(item)}>Open thread</Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface QuickDraftCardProps {
  item: QuickDraftItem;
  onEdit: (item: QuickDraftItem) => void;
  onApprove: (item: QuickDraftItem) => void;
}

function QuickDraftCard({ item, onEdit, onApprove }: QuickDraftCardProps) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <SourceBadge source={item.source} label={item.sourceLabel} />
        {item.stars !== undefined && <Stars n={item.stars} />}
        <span style={{ fontSize: 11, color: 'var(--dark-40)', marginLeft: 'auto' }}>{item.author}</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5, marginBottom: 10 }}>
        {item.excerpt}
      </div>
      <AiDraftBlock
        draft={item.draft}
        approveLabel={item.approveLabel}
        onEdit={() => onEdit(item)}
        onApprove={() => onApprove(item)}
      />
    </div>
  );
}

// ─── INSIGHTS PANE ────────────────────────────────────────────────

function InsightIcon({ kind }: { kind: InsightItem['icon'] }) {
  if (kind === 'priority') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
        <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><circle cx="12" cy="16.5" r="0.7" fill="currentColor" />
      </svg>
    );
  }
  if (kind === 'product') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
        <circle cx="12" cy="12" r="2" />
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      </svg>
    );
  }
  if (kind === 'content') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
        <line x1="4" y1="6" x2="14" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="11" y2="18" />
        <circle cx="17" cy="6" r="2" />
        <circle cx="8" cy="18" r="2" />
      </svg>
    );
  }
  if (kind === 'opp') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
        <path d="m12 3 2 4 4-2-1 4 4 1-3 3 3 3-4 1 1 4-4-2-2 4-2-4-4 2 1-4-4-1 3-3-3-3 4-1-1-4 4 2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <line x1="6" y1="20" x2="6" y2="12" />
      <line x1="12" y1="20" x2="12" y2="6" />
      <line x1="18" y1="20" x2="18" y2="14" />
    </svg>
  );
}

function BiHeader() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(124,92,252,0.05), rgba(124,92,252,0.02))',
        border: '1px solid rgba(124,92,252,0.18)',
        borderRadius: 14,
        padding: '18px 22px',
        display: 'grid',
        gridTemplateColumns: '46px 1fr auto',
        gap: 16,
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 46, height: 46, borderRadius: 12,
          background: 'linear-gradient(135deg, #7C5CFC, #5B21B6)',
          color: 'var(--light-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
          <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 16.5, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.1px', marginBottom: 4 }}>
          Strategic recommendations
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.5, maxWidth: 560 }}>
          The agent has analyzed all 1,248 mentions and surfaced five actions that would meaningfully shift your reputation this month.
        </div>
      </div>
    </div>
  );
}

function InsightRow({ item, onAction, isFirst }: { item: InsightItem; onAction: (i: InsightItem) => void; isFirst: boolean }) {
  const tile = INSIGHT_TILE_STYLES[item.category];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '46px 1fr auto',
        gap: 18,
        padding: '18px 20px',
        borderTop: isFirst ? 'none' : '1px solid var(--dark-8)',
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          width: 42, height: 42, borderRadius: 11,
          background: tile.bg, color: tile.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <InsightIcon kind={item.icon} />
      </span>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6, fontSize: 12, color: 'var(--dark-60)' }}>
          <span
            style={{
              fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 5,
              letterSpacing: '0.04em', background: tile.bg, color: tile.color,
            }}
          >
            {item.categoryLabel}
          </span>
          {item.metaPills.map((pill, i) => (
            <span
              key={i}
              style={{
                color:
                  pill.tone === 'up'
                    ? '#991B1B'
                    : pill.tone === 'good'
                      ? '#065F46'
                      : 'var(--dark-60)',
              }}
            >
              {pill.text}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.05px', lineHeight: 1.35, marginBottom: 6 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.55 }}>
          {item.body}
        </div>
      </div>
      <div style={{ alignSelf: 'center' }}>
        <Button variant="secondary" size="sm" onClick={() => onAction(item)}>{item.actionLabel}</Button>
      </div>
    </div>
  );
}

function InsightsPane({ onAction }: { onAction: (i: InsightItem) => void }) {
  return (
    <>
      <BiHeader />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {INSIGHTS.map((item, i) => (
          <InsightRow key={item.id} item={item} onAction={onAction} isFirst={i === 0} />
        ))}
      </div>
    </>
  );
}

// ─── LISTENING PANE ───────────────────────────────────────────────

const SENTIMENT_STYLES: Record<MentionItem['sentiment'], { bg: string; color: string }> = {
  positive: { bg: '#D2EFDB', color: '#0E6B33' },
  negative: { bg: '#FEE4E2', color: '#B42318' },
  neutral: { bg: 'var(--dark-4)', color: 'var(--dark-60)' },
};

const SENTIMENT_DOT: Record<TopicRow['sentimentTone'], string> = {
  green: '#20A14F',
  yellow: '#F59E0B',
  red: '#D92D20',
};

function MentionRow({ item, isLast }: { item: MentionItem; isLast: boolean }) {
  const s = SENTIMENT_STYLES[item.sentiment];
  return (
    <div
      style={{
        padding: '12px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <SourceBadge source={item.source} label={item.sourceLabel} />
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--dark-40)' }}>{item.when}</span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--dark-80)', lineHeight: 1.5 }}>{item.text}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--dark-40)' }}>
        <span style={{ fontSize: 12, color: 'var(--dark-90)', fontWeight: 500 }}>{item.author}</span>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '1px 7px', borderRadius: 4,
            fontSize: 10.5, fontWeight: 500,
            background: s.bg, color: s.color,
          }}
        >
          {item.sentiment}
        </span>
        <span>{item.meta}</span>
      </div>
    </div>
  );
}

function TopicsTable() {
  return (
    <table
      style={{
        width: '100%',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        borderCollapse: 'separate',
        borderSpacing: 0,
        overflow: 'hidden',
        marginBottom: 24,
      }}
    >
      <thead>
        <tr>
          {['Topic', 'Mentions', 'Sentiment', 'Velocity', 'Trend', ''].map((h, i) => (
            <th
              key={i}
              style={{
                fontSize: 11, color: 'var(--dark-40)',
                textAlign: 'left',
                padding: '10px 14px',
                background: 'var(--dark-2)',
                borderBottom: '1px solid var(--dark-8)',
                letterSpacing: '0.06em', fontWeight: 500,
                width: i === 0 ? '34%' : undefined,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TOPICS.map((row, i) => {
          const trendColor =
            row.trend.dir === 'up' ? '#20A14F' : row.trend.dir === 'down' ? '#D92D20' : 'var(--dark-40)';
          const topicColor =
            row.topicTone === 'risk'
              ? '#B42318'
              : row.topicTone === 'positive'
                ? '#0E6B33'
                : 'var(--dark-90)';
          return (
            <tr key={i}>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12.5 }}>
                <span style={{ fontWeight: 500, color: topicColor }}>{row.topic}</span>
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12.5, color: 'var(--dark-90)' }}>
                {row.mentions}
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12.5, color: 'var(--dark-90)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: SENTIMENT_DOT[row.sentimentTone] }} />
                  {row.sentiment}%
                </span>
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12.5, color: 'var(--dark-90)' }}>
                {row.velocity}
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12.5, color: trendColor }}>
                {row.trend.text}
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12.5 }}>
                {row.badge?.kind === 'src' && <SourceBadge source={row.badge.source} label={row.badge.label} />}
                {row.badge?.kind === 'spike' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 4, background: '#FEE4E2', color: '#B42318', fontSize: 11, fontWeight: 500 }}>
                    {row.badge.label}
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ListeningPane() {
  return (
    <>
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '18px 20px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>Public mentions</h3>
          <span style={{ fontSize: 11.5, color: 'var(--dark-40)' }}>live · 5 latest</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {MENTIONS.map((m, i) => (
            <MentionRow key={m.id} item={m} isLast={i === MENTIONS.length - 1} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.2px', color: 'var(--dark-90)', margin: 0 }}>Trending topics</h2>
        <span style={{ fontSize: 12.5, color: 'var(--dark-60)' }}>last 7 days · 8 themes</span>
      </div>
      <TopicsTable />
    </>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────

type TabKey = 'reviews' | 'insights' | 'listening';

function Tabs({ active, onChange, counts }: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  counts: { reviews?: number; insights?: number };
}) {
  const tabs: { key: TabKey; label: string; count?: number }[] = [
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

// ─── EDIT-DRAFT MODAL ─────────────────────────────────────────────

function EditDraftModal({
  close,
  initialText,
  onSave,
}: StackModalProps & {
  initialText: string;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(initialText);
  const canSave = text.trim().length > 0;
  return (
    <Modal.Root size="md" aria-labelledby="edit-draft-title" data-testid="edit-draft-modal">
      <Modal.Header
        title="Edit AI draft"
        id="edit-draft-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <p style={{ margin: '0 0 12px 0', fontSize: 13.5, color: 'var(--dark-60)' }}>
          Tweak the agent's reply before sending. Your changes don't change the agent's tone for future replies.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          style={{
            width: '100%',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--dark-90)',
            background: 'var(--light-100)',
            border: '1px solid var(--dark-15)',
            borderRadius: 9,
            padding: '10px 12px',
            outline: 'none',
            resize: 'vertical',
            minHeight: 160,
            lineHeight: 1.55,
          }}
        />
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" isDisabled={!canSave} onPress={() => onSave(text.trim())}>
            Save changes
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── ROUTE ────────────────────────────────────────────────────────

export function ReputationRoute() {
  return (
    <ModalStack>
      <ReputationRouteInner />
    </ModalStack>
  );
}

function ReputationRouteInner() {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();
  const [tab, setTab] = useState<TabKey>('reviews');
  const [attention, setAttention] = useState<AttentionItem[]>(ATTENTION);
  const [quickDrafts, setQuickDrafts] = useState<QuickDraftItem[]>(QUICK_DRAFTS);

  const editAttentionDraft = (item: AttentionItem) => {
    if (!item.aiDraft) return;
    openModal(EditDraftModal, {
      initialText: item.aiDraft.text,
      onSave: (text) => {
        setAttention((prev) =>
          prev.map((a) => (a.id === item.id && a.aiDraft ? { ...a, aiDraft: { ...a.aiDraft, text } } : a)),
        );
        closeModal();
        showToast({ message: 'Draft updated' });
      },
    });
  };

  const editQuickDraft = (item: QuickDraftItem) => {
    openModal(EditDraftModal, {
      initialText: item.draft.text,
      onSave: (text) => {
        setQuickDrafts((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, draft: { ...q.draft, text } } : q)),
        );
        closeModal();
        showToast({ message: 'Draft updated' });
      },
    });
  };

  return (
    <H2Layout>
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
            {attention.map((item) => (
              <AttentionCard
                key={item.id}
                item={item}
                onEditDraft={editAttentionDraft}
                onApproveDraft={(it) => showToast({ message: `Reply approved · sending to ${it.sourceLabel}` })}
                onOpenThread={() => showToast({ message: 'Open thread (TODO)' })}
              />
            ))}

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.2px', color: 'var(--dark-90)', margin: 0 }}>
                AI drafts ready to approve
              </h2>
              <span style={{ fontSize: 12.5, color: 'var(--dark-60)' }}>3 ready · ~25 min saved</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {quickDrafts.map((q) => (
                <QuickDraftCard
                  key={q.id}
                  item={q}
                  onEdit={editQuickDraft}
                  onApprove={(it) => showToast({ message: it.approveToast })}
                />
              ))}
            </div>
          </>
        )}
        {tab === 'insights' && (
          <InsightsPane onAction={(i) => showToast({ message: i.actionToast })} />
        )}
        {tab === 'listening' && <ListeningPane />}
      </div>
    </H2Layout>
  );
}
