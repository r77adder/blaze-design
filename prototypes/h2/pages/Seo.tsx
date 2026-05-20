import { useState } from 'react';
import { Button, Text } from '@/components';
import { ChevronDown, Plus, Trash2 } from '@/icons/20';
import { StatusPill } from '@/staging';
import type { StatusPillTone } from '@/staging';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';
import { useDevState } from '../dev-state-context';
import { SeoColdView } from './ColdViews';

/**
 * /h2/seo — SEO Plan view. Focused on blog publishing + topic clusters.
 *
 * Layout matches the user's "SEO Plan" screenshot:
 *   - Topbar center: cadence pill + "Add new topic cluster" button.
 *   - Topbar right: Generate report button.
 *   - Table: hierarchical topic-cluster rows (1, 1.1, 1.2 …) with Main pill.
 */

interface ClusterRow {
  num: string;
  keyword: string;
  isMain: boolean;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  searchVolume: string;
  postDate: string;
}

const ROWS: ClusterRow[] = [
  // Cluster 1 — performance coaching
  { num: '1', keyword: 'performance coaching', isMain: true, title: 'The Complete Guide to Performance Coaching in 2026', difficulty: 'Hard', searchVolume: '8,100', postDate: 'May 14' },
  { num: '1.1', keyword: 'what is a performance coach', isMain: false, title: 'What Is a Performance Coach? (And Why You Might Need One)', difficulty: 'Easy', searchVolume: '2,400', postDate: 'May 16' },
  { num: '1.2', keyword: 'performance coaching for startups', isMain: false, title: 'How Performance Coaching Helps Startup Founders Scale Faster', difficulty: 'Medium', searchVolume: '590', postDate: 'May 19' },
  { num: '1.3', keyword: 'how to find a performance coach', isMain: false, title: '7 Things to Look For When Hiring a Performance Coach', difficulty: 'Easy', searchVolume: '1,300', postDate: 'May 21' },
  // Cluster 2 — executive coaching
  { num: '2', keyword: 'executive coaching', isMain: true, title: 'Executive Coaching in 2026: The Modern Playbook for Leaders', difficulty: 'Hard', searchVolume: '14,800', postDate: 'May 23' },
  { num: '2.1', keyword: 'executive coaching cost', isMain: false, title: 'How Much Does Executive Coaching Cost? Real Pricing Breakdown', difficulty: 'Medium', searchVolume: '3,600', postDate: 'May 26' },
  { num: '2.2', keyword: 'executive coaching vs mentoring', isMain: false, title: 'Executive Coaching vs Mentoring: Which One You Actually Need', difficulty: 'Easy', searchVolume: '880', postDate: 'May 28' },
  { num: '2.3', keyword: 'best executive coaching certifications', isMain: false, title: 'The 5 Executive Coaching Certifications That Still Matter', difficulty: 'Medium', searchVolume: '1,900', postDate: 'May 30' },
];

export function SeoRoute() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const devState = useDevState().getState('/h2/seo');
  if (devState === 'cold') return <H2Layout title="SEO"><SeoColdView /></H2Layout>;

  return (
    <H2Layout
      title="SEO Plan"
      topbarCenter={<TopbarCenter />}
      topbarRight={<GenerateReportButton />}
    >
      <div style={{ padding: '24px 28px 80px', maxWidth: 1180, margin: '0 auto' }}>
        <ClusterTable hoveredRow={hoveredRow} setHoveredRow={setHoveredRow} />
      </div>
    </H2Layout>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────────

function TopbarCenter() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <CadencePill />
      <Button variant="tertiary" size="md" frontIcon={Plus}>
        Add new topic cluster
      </Button>
    </div>
  );
}

function CadencePill() {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: hover ? 'var(--dark-4)' : 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        padding: '6px 12px',
        font: 'inherit',
        fontSize: 14,
        color: 'var(--dark-90)',
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
      }}
    >
      <span style={{ fontSize: 14 }}>{'📝'}</span>
      <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>
        4 blog posts/week
      </Text>
      <ChevronDown size={16} color="var(--dark-60)" />
    </button>
  );
}

// ─── TABLE ───────────────────────────────────────────────────────────

function ClusterTable({
  hoveredRow,
  setHoveredRow,
}: {
  hoveredRow: string | null;
  setHoveredRow: (n: string | null) => void;
}) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '48px 1.4fr 2fr 88px 96px 88px 116px',
          gap: 16,
          padding: '6px 20px',
          borderBottom: '1px solid var(--dark-8)',
          alignItems: 'center',
        }}
      >
        <HeaderCell>#</HeaderCell>
        <HeaderCell>Keyword</HeaderCell>
        <HeaderCell>Title</HeaderCell>
        <HeaderCell>Difficulty</HeaderCell>
        <HeaderCell>Search/mo</HeaderCell>
        <HeaderCell>Post date</HeaderCell>
        <HeaderCell>Blog status</HeaderCell>
      </div>
      {ROWS.map((row, idx) => (
        <ClusterRow
          key={row.num}
          row={row}
          isLast={idx === ROWS.length - 1}
          hovered={hoveredRow === row.num}
          onHover={(h) => setHoveredRow(h ? row.num : null)}
        />
      ))}
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <Text
      variant="metadata"
      style={{
        fontSize: 12,
        color: 'var(--dark-60)',
        fontWeight: 400,
      }}
    >
      {children}
    </Text>
  );
}

function ClusterRow({
  row,
  isLast,
  hovered,
  onHover,
}: {
  row: ClusterRow;
  isLast: boolean;
  hovered: boolean;
  onHover: (h: boolean) => void;
}) {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '48px 1.4fr 2fr 88px 96px 88px 116px',
        gap: 16,
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'center',
        background: hovered ? 'var(--dark-2)' : 'transparent',
        position: 'relative',
      }}
    >
      <Text
        variant="metadata"
        style={{
          color: row.isMain ? 'var(--dark-90)' : 'var(--dark-60)',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: row.isMain ? 500 : 400,
        }}
      >
        {row.num}
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <Text style={{ color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.keyword}
        </Text>
        {row.isMain && (
          <span style={{ display: 'inline-flex', flexShrink: 0 }}>
            <MainPill />
          </span>
        )}
      </div>
      <Text
        variant="secondary"
        style={{
          color: 'var(--dark-80)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {row.title}
      </Text>
      <div style={{ display: 'inline-flex', justifyContent: 'flex-start' }}>
        <DifficultyPill difficulty={row.difficulty} />
      </div>
      <Text
        variant="metadata"
        style={{ color: 'var(--dark-80)', fontVariantNumeric: 'tabular-nums' }}
      >
        {row.searchVolume}
      </Text>
      <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
        {row.postDate}
      </Text>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        {hovered ? <RowActions /> : <StatusPill tone="neutral" size="sm">Planned</StatusPill>}
      </div>
    </div>
  );
}

function MainPill() {
  return (
    <StatusPill tone="accent" size="sm">
      Main
    </StatusPill>
  );
}

const DIFFICULTY_TONES: Record<'Easy' | 'Medium' | 'Hard', StatusPillTone> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};

function DifficultyPill({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  return (
    <StatusPill tone={DIFFICULTY_TONES[difficulty]} size="sm">
      {difficulty}
    </StatusPill>
  );
}

function RowActions() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Button variant="secondary" size="sm">
        Generate post · 8
      </Button>
      <button
        type="button"
        aria-label="Delete row"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          background: 'transparent',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          color: 'var(--dark-60)',
        }}
      >
        <Trash2 size={16} color="var(--dark-60)" />
      </button>
    </div>
  );
}
