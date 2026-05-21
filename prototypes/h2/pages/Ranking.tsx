import { useState } from 'react';
import { Heading, Text } from '@/components';
import { Pill, StatusPill, TabChip } from '@/staging';
import type { StatusPillTone } from '@/staging';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';

/**
 * /h2/ranking — Ranking Hub. Cross-channel view showing how base units
 * (blog posts, FAQs, reviews, GBP posts, citations) move the needle on
 * SEO, AEO, Map Ranking, and Reputation collectively.
 *
 * Layout:
 *   - Top: 4 channel scorecards
 *   - Middle: impact matrix (base unit × channel)
 *   - Bottom: unified activity feed across all channels
 *
 * Channel color-coding maps to existing tokens:
 *   SEO        → var(--purple)
 *   AEO        → var(--blue-70)
 *   Map        → var(--green-50)
 *   Reputation → var(--orange-70)
 */

// ─── TYPES ────────────────────────────────────────────────────────────

type Channel = 'SEO' | 'AEO' | 'Map' | 'Reputation';
type BaseUnit = 'Blog posts' | 'FAQ sections' | 'Reviews & replies' | 'GBP posts' | 'Citations';
type FeedItemType = 'blog' | 'faq' | 'review' | 'gbp';

interface ScoreCard {
  channel: Channel;
  metric: string;
  value: string;
  trend: string;
  trendUp: boolean | null;
}

interface MatrixCell {
  count: number;
  active: boolean;
}

interface ActivityItem {
  id: string;
  type: FeedItemType;
  label: string;
  title: string;
  channel: Channel;
  date: string;
  status: string;
  statusTone: StatusPillTone;
}

// ─── DATA ─────────────────────────────────────────────────────────────

const SCORECARDS: ScoreCard[] = [
  { channel: 'SEO',        metric: 'Avg. keyword position', value: '4.2',  trend: '↑ +1.3 vs last month', trendUp: true },
  { channel: 'AEO',        metric: 'Citation rate',         value: '29%',  trend: '↑ +6pp vs last month', trendUp: true },
  { channel: 'Map',        metric: 'Map Pack rank',         value: '#2',   trend: '→ Steady',             trendUp: null },
  { channel: 'Reputation', metric: 'Avg. rating',           value: '4.7★', trend: '↑ +0.2 vs last month', trendUp: true },
];

const BASE_UNITS: BaseUnit[] = [
  'Blog posts',
  'FAQ sections',
  'Reviews & replies',
  'GBP posts',
  'Citations',
];

const CHANNELS: Channel[] = ['SEO', 'AEO', 'Map', 'Reputation'];

// Each row = base unit, each col = channel. { count, active }
const MATRIX: Record<BaseUnit, Record<Channel, MatrixCell>> = {
  'Blog posts':       { SEO: { count: 8, active: true },  AEO: { count: 8, active: true },  Map: { count: 0, active: false }, Reputation: { count: 0, active: false } },
  'FAQ sections':     { SEO: { count: 6, active: true },  AEO: { count: 6, active: true },  Map: { count: 0, active: false }, Reputation: { count: 0, active: false } },
  'Reviews & replies':{ SEO: { count: 0, active: false }, AEO: { count: 0, active: false }, Map: { count: 14, active: true }, Reputation: { count: 14, active: true } },
  'GBP posts':        { SEO: { count: 0, active: false }, AEO: { count: 0, active: false }, Map: { count: 4, active: true },  Reputation: { count: 0, active: false } },
  'Citations':        { SEO: { count: 0, active: false }, AEO: { count: 7, active: true },  Map: { count: 0, active: false }, Reputation: { count: 0, active: false } },
};

const FEED: ActivityItem[] = [
  { id: 'f1',  type: 'blog',   label: 'Blog Post',    title: 'The 5 Executive Coaching Certifications That Still Matter',        channel: 'SEO',        date: 'May 14', status: 'Published', statusTone: 'success' },
  { id: 'f2',  type: 'review', label: 'Review Reply', title: 'Replied to Sarah M. — ★★★★★ "Changed how I approach everything"', channel: 'Reputation', date: 'May 14', status: 'Replied',   statusTone: 'success' },
  { id: 'f3',  type: 'faq',    label: 'FAQ Section',  title: 'FAQ added to "Executive Coaching vs Mentoring" post (6 Qs)',       channel: 'AEO',        date: 'May 13', status: 'Published', statusTone: 'success' },
  { id: 'f4',  type: 'review', label: 'Review Reply', title: 'Replied to Marcus D. — ★★★★★ "Best investment I\'ve made"',       channel: 'Reputation', date: 'May 13', status: 'Replied',   statusTone: 'success' },
  { id: 'f5',  type: 'gbp',    label: 'GBP Post',     title: 'Google Business Profile — "Spring Wellness Week" post',           channel: 'Map',        date: 'May 12', status: 'Live',      statusTone: 'success' },
  { id: 'f6',  type: 'blog',   label: 'Blog Post',    title: 'What Is a Performance Coach? (And Why You Might Need One)',       channel: 'SEO',        date: 'May 10', status: 'Published', statusTone: 'success' },
  { id: 'f7',  type: 'faq',    label: 'FAQ Section',  title: 'FAQ added to "Performance Coaching for Startups" (4 Qs)',         channel: 'AEO',        date: 'May 10', status: 'Published', statusTone: 'success' },
  { id: 'f8',  type: 'review', label: 'Review Reply', title: 'Replied to James T. — ★★★★☆ "Great sessions, worth every cent"', channel: 'Reputation', date: 'May 9',  status: 'Replied',   statusTone: 'success' },
  { id: 'f9',  type: 'gbp',    label: 'GBP Post',     title: 'Google Business Profile — "Meet Your Coach: Dr. Anaya Patel"',    channel: 'Map',        date: 'May 7',  status: 'Live',      statusTone: 'success' },
  { id: 'f10', type: 'blog',   label: 'Blog Post',    title: 'How Performance Coaching Helps Startup Founders Scale Faster',    channel: 'SEO',        date: 'May 5',  status: 'Published', statusTone: 'success' },
  { id: 'f11', type: 'review', label: 'Review Reply', title: 'Replied to Elena R. — ★★★★★ "Transformed my leadership style"',  channel: 'Reputation', date: 'May 4',  status: 'Replied',   statusTone: 'success' },
  { id: 'f12', type: 'faq',    label: 'FAQ Section',  title: 'FAQ added to "Complete Guide to Performance Coaching" (8 Qs)',    channel: 'AEO',        date: 'May 3',  status: 'Published', statusTone: 'success' },
  { id: 'f13', type: 'gbp',    label: 'GBP Post',     title: 'Google Business Profile — "Client Success Story: 6 Months In"',  channel: 'Map',        date: 'May 1',  status: 'Live',      statusTone: 'success' },
  { id: 'f14', type: 'blog',   label: 'Blog Post',    title: '7 Things to Look For When Hiring a Performance Coach',            channel: 'SEO',        date: 'Apr 30', status: 'Published', statusTone: 'success' },
];

// Channel color-coding: text + tinted background. All values resolve to
// existing tokens (no raw hex). Backgrounds use rgba() composed from the
// token's underlying color (we can't @use a CSS var inside rgba directly,
// so the alpha-blended variants are spelled out here next to the source).
const CHANNEL_COLORS: Record<Channel, string> = {
  SEO:        'var(--purple)',       // #7c5cfc
  AEO:        'var(--blue-70)',      // #0179cf
  Map:        'var(--green-70)',     // #007729
  Reputation: 'var(--orange-70)',    // #bc550a
};

const CHANNEL_BG: Record<Channel, string> = {
  SEO:        'rgba(124, 92, 252, 0.10)', // var(--purple) at 10%
  AEO:        'rgba(1, 121, 207, 0.10)',  // var(--blue-70) at 10%
  Map:        'var(--green-10)',          // rgba(32, 161, 79, 0.1)
  Reputation: 'rgba(188, 85, 10, 0.10)',  // var(--orange-70) at 10%
};

// ─── PAGE ─────────────────────────────────────────────────────────────

export function RankingRoute() {
  return (
    <H2Layout title="Ranking" topbarRight={<GenerateReportButton />}>
      <div style={{ padding: '24px 28px 80px', maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <ScorecardRow />
        <ImpactMatrix />
        <ActivityFeed />
      </div>
    </H2Layout>
  );
}

// ─── SCORECARDS ───────────────────────────────────────────────────────

function ScorecardRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {SCORECARDS.map((card) => (
        <Scorecard key={card.channel} card={card} />
      ))}
    </div>
  );
}

function Scorecard({ card }: { card: ScoreCard }) {
  const trendColor =
    card.trendUp === null
      ? 'var(--dark-60)'
      : card.trendUp
      ? 'var(--green-50)'
      : 'var(--red-70)';

  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-4)',
        borderRadius: 12,
        padding: '20px 20px 18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Pill
          size="sm"
          style={{
            background: CHANNEL_BG[card.channel],
            color: CHANNEL_COLORS[card.channel],
          }}
        >
          {card.channel}
        </Pill>
      </div>
      <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 4 }}>
        {card.metric}
      </Text>
      {/* Big metric value — Heading level 2 at its default 400 weight; the
          designer-driven baseline is "stats are not bold". */}
      <Heading level={2} style={{ marginBottom: 8, lineHeight: 1.15 }}>
        {card.value}
      </Heading>
      <Text variant="metadata" style={{ color: trendColor }}>
        {card.trend}
      </Text>
    </div>
  );
}

// ─── IMPACT MATRIX ────────────────────────────────────────────────────

function ImpactMatrix() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Section title sits outside the bordered card so the card holds only
          the data grid. */}
      <div>
        <Heading level={3} style={{ display: 'block' }}>
          Ranking impact by content type
        </Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
          Which base units are contributing to each channel this month
        </Text>
      </div>
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-4)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >

      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px repeat(4, 1fr)',
          padding: '8px 20px',
          borderBottom: '1px solid var(--dark-4)',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div />
        {CHANNELS.map((ch) => (
          <div key={ch} style={{ display: 'flex', justifyContent: 'center' }}>
            <Pill
              size="sm"
              style={{
                background: CHANNEL_BG[ch],
                color: CHANNEL_COLORS[ch],
              }}
            >
              {ch}
            </Pill>
          </div>
        ))}
      </div>

      {/* Body rows */}
      {BASE_UNITS.map((unit, idx) => (
        <MatrixRow key={unit} unit={unit} isLast={idx === BASE_UNITS.length - 1} />
      ))}
      </div>
    </div>
  );
}

function MatrixRow({ unit, isLast }: { unit: BaseUnit; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '200px repeat(4, 1fr)',
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'center',
        gap: 12,
        background: hovered ? 'var(--dark-2)' : 'transparent',
        transition: 'background 100ms',
      }}
    >
      <Text variant="largeList" style={{ color: 'var(--dark-90)' }}>
        {unit}
      </Text>
      {CHANNELS.map((ch) => {
        const cell = MATRIX[unit][ch];
        return (
          <div key={ch} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="secondary" style={{ color: cell.active ? 'var(--dark-90)' : 'var(--dark-40)' }}>
              {cell.active ? cell.count : '—'}
            </Text>
          </div>
        );
      })}
    </div>
  );
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────

function ActivityFeed() {
  const [filter, setFilter] = useState<Channel | 'All'>('All');
  const channels: (Channel | 'All')[] = ['All', 'SEO', 'AEO', 'Map', 'Reputation'];

  const filtered = filter === 'All' ? FEED : FEED.filter((i) => i.channel === filter);

  // Group by date, preserving order
  const dates = Array.from(new Set(filtered.map((i) => i.date)));
  const grouped = dates.map((date) => ({ date, items: filtered.filter((i) => i.date === date) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Headline + filter chips sit OUTSIDE the bordered card. */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Heading level={3} style={{ display: 'block' }}>
            Content activity
          </Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
            Published base units grouped by date
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {channels.map((ch) => (
            <TabChip key={ch} selected={filter === ch} onSelect={() => setFilter(ch)}>
              {ch}
            </TabChip>
          ))}
        </div>
      </div>
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-4)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >

      {/* Date groups */}
      {grouped.map((group, gi) => (
        <div key={group.date}>
          {/* Date divider */}
          <div
            style={{
              padding: '6px 20px',
              background: 'var(--dark-2)',
              borderBottom: '1px solid var(--dark-4)',
              borderTop: gi === 0 ? 'none' : '1px solid var(--dark-4)',
            }}
          >
            <Text variant="label" style={{ display: 'block', color: 'var(--dark-60)' }}>
              {group.date}
            </Text>
          </div>
          {/* Compact rows */}
          {group.items.map((item, idx) => (
            <FeedRow key={item.id} item={item} isLast={gi === grouped.length - 1 && idx === group.items.length - 1} />
          ))}
        </div>
      ))}
      </div>
    </div>
  );
}

function FeedRow({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr auto',
        gap: 16,
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'center',
        background: hovered ? 'var(--dark-2)' : 'transparent',
        transition: 'background 100ms',
      }}
    >
      {/* Type label — plain text, color-coded by channel family */}
      <Text variant="secondary" style={{ color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>
        {item.label}
      </Text>

      {/* Title */}
      <Text variant="secondary" lineClamp={1} style={{ display: 'block', color: 'var(--dark-90)' }}>
        {item.title}
      </Text>

      {/* Channel tag — the single status indicator for the row */}
      <Pill
        size="sm"
        style={{
          background: CHANNEL_BG[item.channel],
          color: CHANNEL_COLORS[item.channel],
          whiteSpace: 'nowrap',
        }}
      >
        {item.channel}
      </Pill>
    </div>
  );
}
