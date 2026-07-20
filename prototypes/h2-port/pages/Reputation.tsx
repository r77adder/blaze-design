import { useState, type MouseEvent } from 'react';
import { Button, Heading, IconButton, Modal, ModalStack, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Facebook, Google, Instagram, LinkExternal, TikTok, Twitter } from '@/icons/20';
import { StatusPill, TabChip, useToast } from '@/staging';
import type { StatusPillTone } from '@/staging';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';
import { useDevState } from '../dev-state-context';
import { ReputationColdView } from './ColdViews';

/**
 * /h2/reputation — deep port of Blaze H2 Features/reputation.html.
 *
 * KPI strip + tabbed surface (Reviews & Comments / Business Insights /
 * Social Listening). Each tab shows a list of items needing attention,
 * many with an AI-drafted reply ready to approve.
 *
 * Source pills use a uniform gray background (`var(--dark-4)`) with the
 * platform's brand logo on the left. Logos come from our 20px icon set
 * (Google/Instagram/TikTok/Facebook/Twitter); Yelp and Reddit fall back
 * to small `<img>` tags from their public CDN/Wikimedia.
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

interface ResponseHistoryEntry {
  who: string;
  when: string;
  text: string;
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
  /** Short body shown on the list card. */
  body: string;
  /** Full review/comment text shown inside the detail modal. */
  fullText: string;
  containment?: { label: string; tone: 'escalating' | 'emerging' | 'pattern' | 'isolated' };
  velocity?: string;
  aiDraft?: AiDraft;
  /** When true, the AI has already auto-replied with high confidence; render
   *  in the "Auto-replied" section with an Edit-reply link instead of the
   *  approve flow. */
  autoReplied?: boolean;
  /** Prior replies from the team or other channels. */
  history?: ResponseHistoryEntry[];
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

/**
 * Renders the brand mark for a source.
 * - Google / Instagram / TikTok / Facebook / Twitter come from our 20px icon lib.
 * - Yelp uses its public favicon from yelp.com.
 * - Reddit uses redditstatic.com favicon.
 * - Anything else falls back to a first-letter monogram on `var(--dark-90)`.
 */
function SourceLogo({ source, label }: { source: Source; label: string }) {
  const size = 14;
  if (source === 'google') return <Google width={size} height={size} />;
  if (source === 'instagram') return <Instagram width={size} height={size} />;
  if (source === 'tiktok') return <TikTok width={size} height={size} />;
  if (source === 'facebook') return <Facebook width={size} height={size} />;
  // 'x' / twitter not used in this fixture set but covered for completeness.
  if (source === 'yelp') {
    return (
      <img
        src="https://www.yelp.com/favicon.ico"
        alt=""
        width={size}
        height={size}
        style={{ borderRadius: 2, display: 'block' }}
      />
    );
  }
  if (source === 'reddit') {
    return (
      <img
        src="https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png"
        alt=""
        width={size}
        height={size}
        style={{ borderRadius: 2, display: 'block' }}
      />
    );
  }
  // Fallback: first-letter monogram.
  const letter = (label || '?').replace(/^[a-z]\//i, '').charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        background: 'var(--dark-90)',
        color: 'var(--light-100)',
        fontSize: 12,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}
    >
      {letter}
    </span>
  );
}


const INSIGHT_TILE_STYLES: Record<InsightItem['category'], { bg: string; color: string }> = {
  priority: { bg: '#FEE2E2', color: '#991B1B' },
  product: { bg: '#FEF3C7', color: '#854D0E' },
  content: { bg: '#DBEAFE', color: '#1E40AF' },
  opp: { bg: '#D1FAE5', color: '#065F46' },
  capacity: { bg: '#EDE9FE', color: '#5B21B6' },
};

const INSIGHT_CATEGORY_TONES: Record<InsightItem['category'], StatusPillTone> = {
  priority: 'danger',
  product: 'warning',
  content: 'info',
  opp: 'success',
  capacity: 'accent',
};

const ATTENTION: AttentionItem[] = [
  {
    id: 'devon-yelp',
    severity: 'urgent', source: 'yelp', sourceLabel: 'Yelp',
    customer: 'Devon R. · Round Rock, TX', when: 'Yesterday', stars: 2,
    title: 'Quoted price went up after the job started',
    body: 'Estimate said $4,200 to refinish the hardwood. After two days the lead asked for another $900 for "extra prep." I would have appreciated a heads-up before they started.',
    fullText: 'Estimate said $4,200 to refinish the hardwood. After two days the lead asked for another $900 for "extra prep" because of subfloor rot and a leveling issue they hadn\'t flagged in the walk-through. I get that old floors hide surprises, but the quote should have a contingency line for that, or someone should call me before the boards come up. Crew was friendly and the finish looks good, but the surprise bill really soured the experience.',
    containment: { label: 'Escalating', tone: 'escalating' },
    velocity: '↗ 2.4× normal · 24h',
    aiDraft: {
      tone: 'Apologetic', confidence: 71, needsReview: true,
      text: '"Hi Devon, really sorry about the surprise on the subfloor rot. You\'re right that we should flag it before the crew pulls up boards. John (the owner) is going to call you today to walk through the invoice and make this right. Thanks for letting us know how it landed."',
    },
    history: [
      { who: 'Office · Marci', when: 'Yesterday, 4:12 PM', text: 'Refunded $200 of the change order. Asked Devon to call John directly.' },
      { who: 'Estimator auto-reply', when: 'Yesterday, 11:08 AM', text: 'Thanks for reaching out, your project manager will get back to you within 24 hours.' },
    ],
  },
  {
    id: 'austin-painters-reddit',
    severity: 'watch', source: 'reddit', sourceLabel: 'r/Austin',
    customer: 'u/cedar_park_carla', when: '5h ago',
    title: 'Any honest reviews of Grain Design Flooring Austin?',
    body: "Getting bids from a few flooring pros for a 2,400 sq ft hardwood refinish. Grain Design came in middle of the pack on price. Anyone here used them recently?",
    fullText: "Getting bids from a few flooring pros for a 2,400 sq ft hardwood refinish in Cedar Park. Grain Design came in middle of the pack on price. Anyone here used them recently? Two other local outfits are the ones I\'m also considering. Looking for honest takes on prep work and how they handle change orders.",
    containment: { label: 'Active discussion', tone: 'emerging' },
    velocity: '↗ 3× normal · 6h',
    aiDraft: {
      tone: 'Helpful, direct', confidence: 78,
      text: '"Hey Carla, John here, owner of Grain Design Flooring in Austin. Happy to share a few recent Cedar Park references and walk you through how we handle prep and change orders. Drop me an email at john@graindesignflooring.com or call (512) 323-9502 and I\'ll set it up."',
    },
    history: [
      { who: 'Community team · Matthew', when: 'March 14', text: 'Joined an r/Austin thread about hardwood refinishing prices. Answered 6 questions, got 32 upvotes.' },
    ],
  },
  {
    id: 'marissa-google',
    severity: 'urgent', source: 'google', sourceLabel: 'Google Reviews',
    customer: 'Marissa K. · Austin, TX', when: '2h ago', stars: 1,
    title: 'Finish peeling after 6 months, no response',
    body: "Floors were refinished in November. Three high-traffic spots are already peeling and I\'ve called twice with no callback. Disappointed, the crew itself was great.",
    fullText: "Floors were refinished in November. Three high-traffic spots by the doorways are already peeling and I\'ve called twice with no callback. Disappointed, the crew itself was great when they were here and I really liked working with the lead on the stain choice. But a six-month-old finish shouldn\'t be wearing through and I shouldn\'t have to chase someone to come look at it.",
    containment: { label: 'Isolated complaint', tone: 'isolated' },
    history: [
      { who: 'Office inbox', when: '4 days ago', text: 'Initial voicemail received, no callback logged.' },
    ],
  },
  {
    id: 'hannah-instagram',
    severity: 'watch', source: 'instagram', sourceLabel: 'Instagram comment',
    customer: '@hannahgoesgreen', when: '1d ago',
    title: 'Do you use a low-VOC finish? Nothing on the site.',
    body: "Hi! Trying to figure out if you use a low-VOC, water-based finish for refinishing jobs. Couldn\'t find anything in the FAQ.",
    fullText: "Hi! Trying to figure out if you use a low-VOC, water-based finish for refinishing jobs. Couldn\'t find anything in the FAQ or services page. We\'re expecting in August and I want to refinish the nursery floor but I\'m being careful about fumes. Would love a clear answer because we\'d love to book you for the refinish.",
    containment: { label: 'Emerging pattern', tone: 'pattern' },
    aiDraft: {
      tone: 'Warm, factual', confidence: 94,
      text: '"Hi Hannah! Great question, we use low-VOC, water-based finishes like Bona Traffic HD on request, at no extra charge. They cure fast and are safe around little ones and pets. We\'ll mention it on the in-home estimate. Call (512) 323-9502 whenever you\'re ready and we\'ll get you on the calendar before August!"',
    },
  },
  {
    id: 'priya-google',
    severity: 'watch', source: 'google', sourceLabel: 'Google Reviews',
    customer: 'Priya S. · Westlake, TX', when: '3h ago', stars: 4,
    title: 'Great floor refinish, wish the finish coat was thicker',
    body: 'Floors look factory-fresh and the crew was respectful of the home. Only nit, the finish feels a touch thin near the threshold.',
    fullText: 'Floors look factory-fresh and the crew was respectful of the home. Matthew came by twice to check the prep work which I really appreciated. Only nit, the finish feels a touch thin near the kitchen threshold, and a couple of spots are already showing a scuff. Would 100% hire them again, just maybe ask for an extra coat on high-traffic areas next time.',
    aiDraft: {
      tone: 'Warm, helpful', confidence: 92,
      text: '"Hi Priya, thanks so much for the kind words about Matthew and the crew! You\'re right that high-traffic areas like thresholds benefit from an extra coat. We\'ll come back out and touch those up at no charge, I\'ll have the office reach out to schedule. John"',
    },
  },
  {
    id: 'theo-facebook',
    severity: 'watch', source: 'facebook', sourceLabel: 'Facebook',
    customer: 'Theo M.', when: '6h ago',
    title: 'Do you cover Dripping Springs?',
    body: 'Do you cover Dripping Springs? Looking to refinish about 1,900 sq ft of hardwood.',
    fullText: 'Do you cover Dripping Springs? Looking to refinish about 1,900 sq ft of hardwood this summer, plus new LVP in a couple of rooms. Saw a friend\'s house in Westlake where you did the floors and it looked great.',
    aiDraft: {
      tone: 'Friendly, concise', confidence: 97,
      text: '"Hey Theo! Yes, Dripping Springs is in our service area. We can do a free in-home estimate any weekday. Call (512) 323-9502 or fill out the form at graindesignflooring.com and we\'ll get you on the calendar."',
    },
    history: [
      { who: 'Theo M.', when: '6 months ago', text: 'Asked about pricing on Instagram, got a standard "request an estimate" reply.' },
    ],
  },
];

const AUTO_REPLIED: AttentionItem[] = [
  {
    id: 'sasha-google-auto',
    severity: 'watch', source: 'google', sourceLabel: 'Google Reviews',
    customer: 'Sasha L. · Lakeway, TX', when: '32m ago', stars: 5,
    title: 'Five stars, refinished our floors in 4 days, on budget',
    body: 'Crew showed up on time and kept the dust down. Refinished our floors in 4 days, on budget. John explained every step.',
    fullText: 'Crew showed up on time and the dust containment was better than I expected. Refinished our whole downstairs in 4 days, on budget. John explained every step, from sanding to stain color to the timeline. The stain sample session was the difference. Worth every penny. Already telling my neighbors.',
    autoReplied: true,
    aiDraft: {
      tone: 'Grateful, warm', confidence: 96,
      text: '"Sasha, thank you so much, really glad the stain samples landed for you and that the crew kept things clean. Tell your neighbors and we\'ll give them $200 off their estimate. John"',
    },
  },
  {
    id: 'jamal-instagram-auto',
    severity: 'watch', source: 'instagram', sourceLabel: 'Instagram comment',
    customer: '@jamalruns', when: '1h ago',
    title: 'How far out are you booking?',
    body: 'How far out are you booking right now? Looking to schedule a refinish for July.',
    fullText: 'How far out are you booking right now? Looking to schedule a hardwood refinish for July, about 1,400 sq ft in Pflugerville. No rush, just trying to plan around a trip.',
    autoReplied: true,
    aiDraft: {
      tone: 'Friendly, factual', confidence: 93,
      text: '"Hey! We\'re currently booking refinish jobs about 3-4 weeks out, so July is wide open. Call (512) 323-9502 or DM us and we\'ll set up a free estimate. Matthew"',
    },
  },
  {
    id: 'community-reddit-auto',
    severity: 'watch', source: 'reddit', sourceLabel: 'r/Austin',
    customer: 'u/clean_living_clara', when: '3h ago',
    title: 'Anyone refinish hardwood in Austin instead of replacing?',
    body: 'Looking to refinish oak floors instead of replacing, any recs in Austin?',
    fullText: 'Looking to refinish oak floors instead of ripping them out, any recs in Austin? Budget around $4-5k. Floors are red oak from the 90s, want to go a bit darker. Open to dust-free sanding shops.',
    autoReplied: true,
    aiDraft: {
      tone: 'Helpful, direct', confidence: 91,
      text: '"Yes! Refinishing instead of replacing is one of our specialties, dust-free sanding, custom stain, typically 4-6 days in your home. A recent Tarrytown red oak project ran around $4,800. Happy to do a free in-home estimate: (512) 323-9502."',
    },
  },
];

const INSIGHTS: InsightItem[] = [
  {
    id: 'audit-change-orders',
    category: 'priority', categoryLabel: 'High priority', icon: 'priority',
    metaPills: [
      { text: 'Change orders' },
      { text: '+41%', tone: 'up' },
      { text: 'Yelp 2★' },
    ],
    title: 'Tighten the estimate and change-order process',
    body: '41% spike in negative mentions about surprise charges after the crew starts. The fix sits in the estimating walk-through, flag subfloor leveling, soft boards, and moisture risks before quoting.',
    actionLabel: 'Brief Matthew',
    actionToast: 'Brief sent to Matthew Tims · VP of Residential',
  },
  {
    id: 'low-voc-page',
    category: 'product', categoryLabel: 'Service offering', icon: 'product',
    metaPills: [
      { text: 'Water-based finish' },
      { text: '+60%', tone: 'up' },
      { text: 'IG + r/Austin' },
    ],
    title: 'Add water-based finish as a callout on every estimate',
    body: 'Low-VOC finish questions are up 60% wk/wk, driven by young families and pet owners. We already offer it at no extra charge, so making it visible removes a recurring objection.',
    actionLabel: 'Open service brief',
    actionToast: 'Opening service brief',
  },
  {
    id: 'low-voc-faq',
    category: 'content', categoryLabel: 'Content gap', icon: 'content',
    metaPills: [
      { text: 'Finish FAQ' },
      { text: '+18%', tone: 'up' },
      { text: 'FAQ gap' },
    ],
    title: 'Publish a water-based, pet-safe finish FAQ',
    body: '39 questions in 7 days across IG and Facebook ask the same thing. A short FAQ plus before/after carousel closes the loop and converts more jobs.',
    actionLabel: 'Draft FAQ post',
    actionToast: 'Drafting FAQ post',
  },
  {
    id: 'cabinet-campaign',
    category: 'opp', categoryLabel: 'Opportunity', icon: 'opp',
    metaPills: [
      { text: 'Floor refinishing' },
      { text: '+8%', tone: 'good' },
      { text: 'r/Austin 1.8k views' },
    ],
    title: 'Lean into refinish, do not replace as next campaign angle',
    body: 'Floor refinishing is the #1 unsolicited positive theme (248 mentions, 91% positive). Pull "factory-fresh" and "refinish, do not replace" directly into next month\'s hero ads.',
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
    title: 'Turn on auto-request for completed jobs',
    body: '42 homeowners hit a 90+ satisfaction score on the final walk-through this week, but only 6 left a Google review. A 24-hour text prompt could 4-5× your weekly review volume.',
    actionLabel: 'Turn on auto-request',
    actionToast: 'Auto-request turned on',
  },
];

const MENTIONS: MentionItem[] = [
  {
    id: 'm-1', source: 'reddit', sourceLabel: 'r/Austin', when: '9h',
    text: 'Grain Design just refinished our Tarrytown red oak, looks factory-fresh. Worth every dollar.',
    author: 'u/tarrytown_tracey', sentiment: 'positive', meta: '· 142 reactions · 18k reach',
  },
  {
    id: 'm-2', source: 'tiktok', sourceLabel: 'TikTok comment', when: '2d',
    text: 'We had Grain Design install wide-plank in Westlake and the crew was so respectful of the house',
    author: '@westlake_will', sentiment: 'positive', meta: '· 842 reactions · 90k views',
  },
  {
    id: 'm-3', source: 'reddit', sourceLabel: 'r/Austin', when: '5h',
    text: 'Any honest reviews of Grain Design Flooring? Considering them for a Cedar Park refinish.',
    author: 'u/cedar_park_carla', sentiment: 'neutral', meta: '· 38 reactions · 12k reach',
  },
  {
    id: 'm-4', source: 'google', sourceLabel: 'Google Search', when: '1d',
    text: "Best flooring pros in Austin 2026: 8 local companies homeowners actually recommend (Grain Design makes the list)",
    author: 'austin.curbed.com', sentiment: 'positive', meta: '· Press',
  },
  {
    id: 'm-5', source: 'yelp', sourceLabel: 'Yelp', when: 'Yesterday',
    text: 'Quote went up after they pulled up the old floor, see review.',
    author: 'Devon R.', sentiment: 'negative', meta: '· Local',
  },
];

const TOPICS: TopicRow[] = [
  { topic: 'Floor refinishing', topicTone: 'positive', mentions: 248, sentiment: 91, sentimentTone: 'green', velocity: '1.2× normal', trend: { dir: 'up', text: '↑ +8%' }, badge: { kind: 'src', source: 'instagram', label: 'strongest' } },
  { topic: 'Scheduling & timeline', mentions: 184, sentiment: 34, sentimentTone: 'red', velocity: '1.4× normal', trend: { dir: 'up', text: '↑ +22%' } },
  { topic: 'Stain & finish consult', topicTone: 'positive', mentions: 162, sentiment: 86, sentimentTone: 'green', velocity: '1.0× normal', trend: { dir: 'flat', text: '— 0%' } },
  { topic: 'Dust & site care', mentions: 96, sentiment: 58, sentimentTone: 'yellow', velocity: '1.1× normal', trend: { dir: 'up', text: '↑ +12%' } },
  { topic: 'Pricing', mentions: 88, sentiment: 49, sentimentTone: 'yellow', velocity: '0.9× normal', trend: { dir: 'down', text: '↓ −6%' } },
  { topic: 'Change orders', topicTone: 'risk', mentions: 71, sentiment: 18, sentimentTone: 'red', velocity: '2.4× normal', trend: { dir: 'up', text: '↑ +41%' }, badge: { kind: 'spike', label: 'Spike detected' } },
  { topic: 'Water-based finish', topicTone: 'risk', mentions: 54, sentiment: 42, sentimentTone: 'yellow', velocity: '3.1× normal', trend: { dir: 'up', text: '↑ +60%' }, badge: { kind: 'spike', label: 'Spreading on Reddit' } },
  { topic: 'Finish durability', mentions: 39, sentiment: 61, sentimentTone: 'yellow', velocity: '1.3× normal', trend: { dir: 'up', text: '↑ +18%' } },
];

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  delta: { tone: 'good' | 'bad' | 'warn'; text: string };
  sub: string;
}

const DELTA_TONE: Record<KpiCardProps['delta']['tone'], StatusPillTone> = {
  good: 'success',
  bad: 'danger',
  warn: 'warning',
};

function KpiCard({ label, value, unit, delta, sub }: KpiCardProps) {
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
      <div style={{ fontSize: 12, color: 'var(--dark-60)', marginBottom: 8 }}>{label}</div>
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
        {unit && <span style={{ fontSize: 14, color: 'var(--dark-40)' }}>{unit}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StatusPill tone={DELTA_TONE[delta.tone]} size="sm">{delta.text}</StatusPill>
        <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>{sub}</span>
      </div>
    </div>
  );
}

function SourceBadge({ source, label }: { source: Source; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 8,
        background: 'var(--dark-4)',
        color: 'var(--dark-90)',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.2,
      }}
    >
      <SourceLogo source={source} label={label} />
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
  /** When true, render only an "Edit reply" link (no Approve button). */
  readOnly?: boolean;
  /** When true, render no action buttons at all. */
  hideActions?: boolean;
  /** Card layout — the reply, its confidence and the Edit / Post Reply actions
   *  all live inside this box, actions right-aligned along the bottom. */
  cardMode?: boolean;
  /** In cardMode, an already-published auto-reply shows only "Edit reply". */
  autoReplied?: boolean;
  approveLabel?: string;
  onEdit: () => void;
  onApprove?: () => void;
}

function AiDraftBlock({ draft, readOnly, hideActions, cardMode, autoReplied, approveLabel = 'Approve & reply', onEdit, onApprove }: AiDraftBlockProps) {
  // Neutral surface — dark-2 fill with a dark-4 hairline border.
  const leadGlyph = draft.needsReview ? '⊙ Needs human review' : '✦ AI draft';
  return (
    <div
      style={{
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
        borderRadius: 10,
        padding: '12px 14px',
        marginBottom: hideActions || cardMode ? 0 : 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          color: 'var(--purple)',
          fontWeight: 500,
          marginBottom: 6,
        }}
      >
        {leadGlyph} · {draft.tone}
        {!hideActions && !cardMode && (
          <span style={{ color: 'var(--dark-40)', fontWeight: 400, marginLeft: 'auto' }}>
            Confidence {draft.confidence}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.5, marginBottom: hideActions ? 0 : 12 }}>
        {draft.text}
      </div>
      {cardMode ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <StatusPill tone="neutral" size="sm">Confidence {draft.confidence}%</StatusPill>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {autoReplied ? (
              <Button variant="tertiary" size="sm" onClick={onEdit}>Edit reply</Button>
            ) : (
              <>
                <Button variant="tertiary" size="sm" onClick={onEdit}>Edit</Button>
                {onApprove && <Button variant="secondary" size="sm" onClick={onApprove}>Post Reply</Button>}
              </>
            )}
          </div>
        </div>
      ) : !hideActions ? (
        readOnly ? (
          <button
            type="button"
            onClick={onEdit}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 14,
              color: 'var(--purple)',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Edit reply
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
            {onApprove && (
              <Button variant="secondary" size="sm" onClick={onApprove}>{approveLabel}</Button>
            )}
          </div>
        )
      ) : null}
    </div>
  );
}

interface AttentionCardProps {
  item: AttentionItem;
  onEditDraft: (item: AttentionItem) => void;
  onApproveDraft: (item: AttentionItem) => void;
  onOpenDetail: (item: AttentionItem) => void;
}

function AttentionCard({ item, onEditDraft, onApproveDraft, onOpenDetail }: AttentionCardProps) {
  // Inner controls (Edit / Post Reply / platform link) stop propagation so
  // clicking them doesn't also open the detail modal.
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail(item);
        }
      }}
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '20px 22px',
        marginBottom: 12,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {/* Top row: platform logo + name, stars, customer on the left; timestamp
       *  and a link out to the hosting platform on the right. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SourceLogo source={item.source} label={item.sourceLabel} />
            <Text variant="secondary" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{item.sourceLabel}</Text>
          </span>
          {item.stars !== undefined && <Stars n={item.stars} />}
          {item.customer && <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>{item.customer}</Text>}
        </div>
        <div onClick={stop} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Text variant="secondary" style={{ color: 'var(--dark-40)' }}>{item.when}</Text>
          <IconButton
            variant="tertiary"
            size="sm"
            icon={LinkExternal}
            aria-label={`View on ${item.sourceLabel}`}
            title={`View on ${item.sourceLabel}`}
            onPress={() => { /* opens the review on the hosting platform */ }}
          />
        </div>
      </div>

      <Heading level={5} style={{ margin: '0 0 4px', lineHeight: 1.35 }}>{item.title}</Heading>

      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', lineHeight: 1.5, marginBottom: item.aiDraft ? 16 : 0 }}>
        {item.body}
      </Text>

      {item.aiDraft ? (
        <div onClick={stop}>
          <AiDraftBlock
            draft={item.aiDraft}
            cardMode
            autoReplied={item.autoReplied}
            onEdit={() => onEditDraft(item)}
            onApprove={() => onApproveDraft(item)}
          />
        </div>
      ) : (
        <div onClick={stop} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" size="sm" onClick={() => onOpenDetail(item)}>
            Review &amp; reply
          </Button>
        </div>
      )}
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
    <div style={{ marginBottom: 12 }}>
      <Heading level={3}>Strategic recommendations</Heading>
      <div style={{ marginTop: 4 }}>
        <Text variant="secondary">
          The agent has analyzed all 1,248 mentions and surfaced five actions that would meaningfully shift your reputation this month.
        </Text>
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
          <StatusPill tone={INSIGHT_CATEGORY_TONES[item.category]} size="sm">
            {item.categoryLabel}
          </StatusPill>
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
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.05px', lineHeight: 1.35, marginBottom: 6 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.55 }}>
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

const SENTIMENT_TONES: Record<MentionItem['sentiment'], StatusPillTone> = {
  positive: 'success',
  negative: 'danger',
  neutral: 'neutral',
};

const SENTIMENT_LABELS: Record<MentionItem['sentiment'], string> = {
  positive: 'Positive',
  negative: 'Negative',
  neutral: 'Neutral',
};

const SENTIMENT_DOT: Record<TopicRow['sentimentTone'], string> = {
  green: '#20A14F',
  yellow: '#F59E0B',
  red: '#D92D20',
};

function MentionRow({ item, isLast }: { item: MentionItem; isLast: boolean }) {
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
      {/* Eyebrow: source badge + sentiment pill on the left, timestamp on the right. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <SourceBadge source={item.source} label={item.sourceLabel} />
        <StatusPill tone={SENTIMENT_TONES[item.sentiment]} size="sm">
          {SENTIMENT_LABELS[item.sentiment]}
        </StatusPill>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--dark-40)' }}>{item.when}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--dark-80)', lineHeight: 1.5 }}>{item.text}</div>
      {/* Second line: muted metadata — author + reactions/reach. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--dark-40)' }}>
        <span style={{ color: 'var(--dark-60)', fontWeight: 500 }}>{item.author}</span>
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
                fontSize: 12, color: 'var(--dark-60)',
                textAlign: 'left',
                padding: '6px 14px',
                borderBottom: '1px solid var(--dark-8)',
                fontWeight: 400,
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
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12 }}>
                <span style={{ fontWeight: 500, color: topicColor }}>{row.topic}</span>
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12, color: 'var(--dark-90)' }}>
                {row.mentions}
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12, color: 'var(--dark-90)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: SENTIMENT_DOT[row.sentimentTone] }} />
                  {row.sentiment}%
                </span>
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12, color: 'var(--dark-90)' }}>
                {row.velocity}
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12, color: trendColor }}>
                {row.trend.text}
              </td>
              <td style={{ padding: '11px 14px', borderBottom: i === TOPICS.length - 1 ? 'none' : '1px solid var(--dark-4)', fontSize: 12 }}>
                {row.badge?.kind === 'src' && <SourceBadge source={row.badge.source} label={row.badge.label} />}
                {row.badge?.kind === 'spike' && (
                  <StatusPill tone="danger" size="sm">{row.badge.label}</StatusPill>
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
      {/* "Public mentions" title sits outside the bordered card. The "live · 5 latest"
          micro-label is parked on the right of the H3. */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <Heading level={3}>Public mentions</Heading>
        <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>live · 5 latest</span>
      </div>
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '18px 20px',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {MENTIONS.map((m, i) => (
            <MentionRow key={m.id} item={m} isLast={i === MENTIONS.length - 1} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <Heading level={3}>Trending topics</Heading>
        <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>last 7 days · 8 themes</span>
      </div>
      <TopicsTable />
    </>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────

export type TabKey = 'reviews' | 'insights' | 'listening';

/** The Reputation subtabs, so a host shell can render them in its own topbar
 *  (controlled) instead of inline. `count` badges are constant in this proto. */
export const REPUTATION_TABS = [
  { key: 'reviews', label: 'Reviews & Comments', count: ATTENTION.length },
  { key: 'insights', label: 'Business Insights', count: 5 },
  { key: 'listening', label: 'Social Listening' },
] as const;

export function ReputationTabs({ tab, onTab }: { tab: TabKey; onTab: (t: TabKey) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
      {REPUTATION_TABS.map((t) => (
        <TabChip key={t.key} selected={tab === t.key} count={t.count} onSelect={() => onTab(t.key)}>
          {t.label}
        </TabChip>
      ))}
    </div>
  );
}

// ─── ITEM-DETAIL MODAL ────────────────────────────────────────────

function ItemDetailModal({
  close,
  item,
  onSendReply,
  onApproveDraft,
  onEditDraft,
}: StackModalProps & {
  item: AttentionItem;
  onSendReply: (text: string) => void;
  onApproveDraft: () => void;
  onEditDraft: () => void;
}) {
  const [reply, setReply] = useState('');
  const canSend = reply.trim().length > 0;
  return (
    <Modal.Root size="md" aria-labelledby="item-detail-title" data-testid="item-detail-modal">
      <Modal.Header
        title={item.title}
        id="item-detail-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        {/* meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <SourceBadge source={item.source} label={item.sourceLabel} />
          {item.stars !== undefined && <Stars n={item.stars} />}
          <span style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: 500 }}>
            {item.customer}
          </span>
          <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>· {item.when}</span>
        </div>

        {/* full review text */}
        <div
          style={{
            fontSize: 14,
            color: 'var(--dark-90)',
            lineHeight: 1.6,
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 20,
          }}
        >
          {item.fullText}
        </div>

        {/* AI draft (if present) */}
        {item.aiDraft && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--dark-60)',
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              Suggested reply
            </div>
            <AiDraftBlock
              draft={item.aiDraft}
              onEdit={onEditDraft}
              onApprove={() => {
                onApproveDraft();
                close();
              }}
            />
          </div>
        )}

        {/* prior response history */}
        {item.history && item.history.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--dark-60)',
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              Prior responses
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.history.map((h, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--dark-2)',
                    border: '1px solid var(--dark-8)',
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--dark-90)', fontWeight: 500 }}>{h.who}</span>
                    <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>{h.when}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.55 }}>{h.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* inline reply compose */}
        <div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--dark-60)',
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            Your reply
          </div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            placeholder={`Reply to ${item.customer ?? 'this customer'}…`}
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
              minHeight: 96,
              lineHeight: 1.55,
            }}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Close
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="primary"
            isDisabled={!canSend}
            onPress={() => {
              onSendReply(reply.trim());
              close();
            }}
          >
            Send reply
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
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
        <p style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--dark-60)' }}>
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

/** Shell-agnostic Reputation surface. AM and the client both embed this inside
 *  their own shells, so it renders its tab strip inline (no topbar-chrome
 *  dependency) and never shows the cold state. This is the single source of
 *  truth so the two sides stay identical. */
/** `tab`/`onTab` let a host shell own tab state and render <ReputationTabs> in
 *  its own topbar; when omitted, the view self-manages and renders the tab strip
 *  inline. */
export function ReputationView({ tab, onTab }: { tab?: TabKey; onTab?: (t: TabKey) => void } = {}) {
  return (
    <ModalStack>
      <ReputationViewInner controlledTab={tab} controlledOnTab={onTab} />
    </ModalStack>
  );
}

function ReputationViewInner({ controlledTab, controlledOnTab }: { controlledTab?: TabKey; controlledOnTab?: (t: TabKey) => void }) {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();
  const [localTab, setLocalTab] = useState<TabKey>('reviews');
  const tab = controlledTab ?? localTab;
  const setTab = controlledOnTab ?? setLocalTab;
  // When the host drives the tabs (in its topbar), don't also render them inline.
  const tabsInHeader = controlledTab !== undefined;
  const [attention, setAttention] = useState<AttentionItem[]>(ATTENTION);

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

  const openItemDetail = (item: AttentionItem) => {
    openModal(ItemDetailModal, {
      item,
      onSendReply: () => showToast({ message: `Reply sent to ${item.customer ?? item.sourceLabel}` }),
      onApproveDraft: () => showToast({ message: `Reply approved · sending to ${item.sourceLabel}` }),
      onEditDraft: () => editAttentionDraft(item),
    });
  };

  const reviewCount = attention.length;

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      {/* Tab strip renders inline only when the host shell isn't showing it in
       *  the topbar. */}
      {!tabsInHeader && (
        <div style={{ marginBottom: 24 }}>
          <ReputationTabs tab={tab} onTab={setTab} />
        </div>
      )}

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <KpiCard label="Reputation Health" value="82" unit="/100" delta={{ tone: 'good', text: '+4' }} sub="vs last 30 days" />
        <KpiCard label="Total Mentions" value="1,248" delta={{ tone: 'good', text: '+18%' }} sub="this week" />
        <KpiCard label="Positive Sentiment" value="74%" delta={{ tone: 'good', text: '+2.1%' }} sub="of all mentions" />
        <KpiCard label="Negative Sentiment" value="11%" delta={{ tone: 'bad', text: '+1.4%' }} sub="trending up" />
        <KpiCard label="Needs Attention" value={String(reviewCount)} delta={{ tone: 'warn', text: '2 urgent' }} sub="reviews + comments" />
      </div>

      {tab === 'reviews' && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <Heading level={3}>Needs attention</Heading>
            <span style={{ fontSize: 14, color: 'var(--dark-40)' }}>{reviewCount} items · sorted by impact</span>
          </div>
          {attention.map((item) => (
            <AttentionCard
              key={item.id}
              item={item}
              onEditDraft={editAttentionDraft}
              onApproveDraft={(it) => showToast({ message: `Reply approved · sending to ${it.sourceLabel}` })}
              onOpenDetail={openItemDetail}
            />
          ))}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 32, marginBottom: 12 }}>
            <Heading level={3}>Auto-replied</Heading>
            <span style={{ fontSize: 14, color: 'var(--dark-40)' }}>{AUTO_REPLIED.length} items · high-confidence drafts published</span>
          </div>
          {AUTO_REPLIED.map((item) => (
            <AttentionCard
              key={item.id}
              item={item}
              onEditDraft={editAttentionDraft}
              onApproveDraft={(it) => showToast({ message: `Reply approved · sending to ${it.sourceLabel}` })}
              onOpenDetail={openItemDetail}
            />
          ))}
        </>
      )}
      {tab === 'insights' && <InsightsPane onAction={(i) => showToast({ message: i.actionToast })} />}
      {tab === 'listening' && <ListeningPane />}
    </div>
  );
}

function ReputationRouteInner() {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();
  const { getState } = useDevState();
  const isCold = getState('/h2/reputation') === 'cold';
  const [tab, setTab] = useState<TabKey>('reviews');
  const [attention, setAttention] = useState<AttentionItem[]>(ATTENTION);

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

  const openItemDetail = (item: AttentionItem) => {
    openModal(ItemDetailModal, {
      item,
      onSendReply: () => showToast({ message: `Reply sent to ${item.customer ?? item.sourceLabel}` }),
      onApproveDraft: () => showToast({ message: `Reply approved · sending to ${item.sourceLabel}` }),
      onEditDraft: () => editAttentionDraft(item),
    });
  };

  const reviewCount = attention.length;

  if (isCold) {
    return (
      <H2Layout>
        <ReputationColdView />
      </H2Layout>
    );
  }

  // Sub-tabs lifted into the topbar's center slot — state (active key + counts)
  // stays here, only the rendered chips are passed up.
  const topbarCenter = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(
        [
          { key: 'reviews', label: 'Reviews & Comments', count: reviewCount },
          { key: 'insights', label: 'Business Insights', count: 5 },
          { key: 'listening', label: 'Social Listening' },
        ] as const
      ).map((t) => (
        <TabChip
          key={t.key}
          selected={tab === t.key}
          count={t.count}
          onSelect={() => setTab(t.key)}
        >
          {t.label}
        </TabChip>
      ))}
    </div>
  );

  return (
    <H2Layout topbarCenter={topbarCenter} topbarRight={<GenerateReportButton />}>
      <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
        {/* KPI strip */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <KpiCard label="Reputation Health" value="82" unit="/100" delta={{ tone: 'good', text: '+4' }} sub="vs last 30 days" />
          <KpiCard label="Total Mentions" value="1,248" delta={{ tone: 'good', text: '+18%' }} sub="this week" />
          <KpiCard label="Positive Sentiment" value="74%" delta={{ tone: 'good', text: '+2.1%' }} sub="of all mentions" />
          <KpiCard label="Negative Sentiment" value="11%" delta={{ tone: 'bad', text: '+1.4%' }} sub="trending up" />
          <KpiCard label="Needs Attention" value={String(reviewCount)} delta={{ tone: 'warn', text: '2 urgent' }} sub="reviews + comments" />
        </div>

        {tab === 'reviews' && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <Heading level={3}>Needs attention</Heading>
              <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>{reviewCount} items · sorted by impact</span>
            </div>
            {attention.map((item) => (
              <AttentionCard
                key={item.id}
                item={item}
                onEditDraft={editAttentionDraft}
                onApproveDraft={(it) => showToast({ message: `Reply approved · sending to ${it.sourceLabel}` })}
                onOpenDetail={openItemDetail}
              />
            ))}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 32, marginBottom: 12 }}>
              <Heading level={3}>Auto-replied</Heading>
              <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>{AUTO_REPLIED.length} items · high-confidence drafts published</span>
            </div>
            {AUTO_REPLIED.map((item) => (
              <AttentionCard
                key={item.id}
                item={item}
                onEditDraft={editAttentionDraft}
                onApproveDraft={(it) => showToast({ message: `Reply approved · sending to ${it.sourceLabel}` })}
                onOpenDetail={openItemDetail}
              />
            ))}
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
