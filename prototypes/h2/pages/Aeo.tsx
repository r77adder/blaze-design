import { useMemo, useState } from 'react';
import {
  Button,
  Heading,
  Modal,
  ModalStack,
  Text,
  useModals,
} from '@/components';
import type { StackModalProps } from '@/components';
import { MoreDots } from '@/icons/20';
import { TabChip, useToast } from '@/staging';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';
import { MapRankingBody } from './MapRankingBody';

/**
 * /h2/aeo — Answer-Engine Optimization.
 *
 * Four top-level sub-tabs in the topbar center (rendered as TabChips):
 *   - Overview — overview cards + secondary filter row (approval/future/published)
 *   - Citations — sparkline hero + matrix of queries × AI tools (click cell → modal)
 *   - Brand facts — status counts + per-fact accordion of AI-tool answers
 *   - Map Ranking — full Google Business Profile experience, rolled in from
 *     the now-removed /h2/map-ranking route. Hosts its own audit / loading /
 *     review / live / home view machine. The dev-state cold/steady toggle is
 *     keyed to `/h2/aeo` here — flipping cold rewinds the embedded experience
 *     to the audit step; flipping steady jumps to the home view.
 *
 * Citations + Brand-facts content recovered from the pre-split `SeoAeo.tsx`
 * deep port. Modal stack is required for the Citations cell-drawer modal.
 */

// ─── SHARED DATA ──────────────────────────────────────────────────────

type SubTab = 'overview' | 'citations' | 'facts' | 'map-ranking';

type Engine = 'ChatGPT' | 'Claude' | 'Perplexity' | 'Gemini' | 'AIO';

const ENGINE_COLOR: Record<Engine, string> = {
  ChatGPT: '#10A37F',
  Claude: '#D97757',
  Perplexity: '#1A1D55',
  Gemini: '#4285F4',
  AIO: '#0F9D58',
};

const TOOLS: { id: string; name: string; logo: string; color: string }[] = [
  { id: 'chatgpt', name: 'ChatGPT', logo: 'G', color: '#10A37F' },
  { id: 'claude', name: 'Claude', logo: 'C', color: '#D97757' },
  { id: 'perplexity', name: 'Perplexity', logo: 'P', color: '#1A1D55' },
  { id: 'gemini', name: 'Gemini', logo: 'G', color: '#4285F4' },
  { id: 'aio', name: 'AIO', logo: 'AI', color: '#0F9D58' },
];

// ─── OVERVIEW SUB-TAB DATA ────────────────────────────────────────────

type FilterKey = 'approval' | 'future' | 'published';

interface ApprovalItem {
  id: string;
  citationSource: string;
  headline: string;
  preview: string;
  /** First 2-3 sentences of the proposed article. Rendered as an indented
   *  quote-style block below the description to give approvers a feel for
   *  the article's voice without opening a full preview. */
  excerpt: string;
}

interface FutureItem {
  id: string;
  title: string;
  scheduledDate: string;
  engine: Engine;
}

interface PublishedItem {
  id: string;
  title: string;
  publishedDate: string;
  citingEngines: Engine[];
}

const APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: 'a1',
    citationSource: 'Perplexity · "best adaptogens for stress and anxiety"',
    headline: "The Adaptogen Buyer's Guide: Ashwagandha vs Rhodiola vs Lion's Mane",
    preview:
      "A 2,200-word pillar comparing the three most-asked-about adaptogens. Built to match Perplexity's preferred long-form comparison format and close the citation gap with Moon Juice.",
    excerpt:
      "Of the dozens of adaptogens marketed for stress, three keep surfacing in clinical reviews: ashwagandha, rhodiola, and lion's mane. Each works on a different pathway — cortisol modulation, neurotransmitter balance, and nerve-growth factor — so the right pick depends less on potency than on what your nervous system is actually struggling with. Here's how to tell them apart, and which one to start with if you only try one.",
  },
  {
    id: 'a2',
    citationSource: 'ChatGPT · "how to choose a daily multivitamin"',
    headline: 'How to Choose a Daily Multivitamin (Evidence-Backed Framework)',
    preview:
      "A how-to article with HowTo + FAQ schema. Highest-volume educational query in your set with no Blaze content — Care/of and Ritual currently share the top citations.",
    excerpt:
      "Most adults don't need a multivitamin — but the ones who do need it for very specific reasons. The CDC's NHANES data shows real deficiencies cluster around four nutrients: vitamin D, B12, magnesium, and iron. A good multivitamin covers those at clinically meaningful doses, skips the marketing-driven extras, and shows third-party testing for purity. Here's the four-question checklist we use to evaluate every formula.",
  },
  {
    id: 'a3',
    citationSource: 'Gemini · "are functional mushroom supplements worth it"',
    headline: 'Are Functional Mushroom Supplements Worth It? (2026 Review)',
    preview:
      "A 2,000-word evaluation roundup with Review + AggregateRating schema. All five tracked answer engines currently cite competitors here.",
    excerpt:
      "Functional mushrooms — lion's mane, reishi, cordyceps, chaga — went from health-food-store curiosity to a $2B category in five years. The research is more interesting than the marketing: there's solid evidence for cognitive benefits from lion's mane and sleep support from reishi, but most cordyceps studies were done on a species you can't buy. After testing 14 of the top-selling products against third-party assays, here's what actually works and what's mostly mycelium grown on rice.",
  },
];

const FUTURE_ITEMS: FutureItem[] = [
  { id: 'f1', title: "Lion's Mane Evidence Brief: 12 Studies on Cognitive Performance", scheduledDate: 'May 18', engine: 'Perplexity' },
  { id: 'f2', title: 'Magnesium Glycinate vs Citrate: Which One You Actually Need', scheduledDate: 'May 22', engine: 'ChatGPT' },
  { id: 'f3', title: 'Best Supplements for Hormonal Balance in Your 30s', scheduledDate: 'May 26', engine: 'Claude' },
  { id: 'f4', title: 'Third-Party Tested Supplement Brands: The 2026 Shortlist', scheduledDate: 'May 30', engine: 'AIO' },
];

const PUBLISHED_ITEMS: PublishedItem[] = [
  { id: 'p1', title: 'Natural Sleep Aids That Actually Work', publishedDate: 'May 02', citingEngines: ['ChatGPT', 'Perplexity', 'AIO'] },
  { id: 'p2', title: "Lion's Mane Benefits: A Look at the Scientific Evidence", publishedDate: 'Apr 28', citingEngines: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'] },
  { id: 'p3', title: 'How Long Until Adaptogens Start Working?', publishedDate: 'Apr 24', citingEngines: ['ChatGPT', 'Claude', 'Gemini'] },
  { id: 'p4', title: 'Best Supplements for Women in Their 30s', publishedDate: 'Apr 18', citingEngines: ['Perplexity'] },
];

// ─── CITATIONS SUB-TAB DATA ───────────────────────────────────────────

type CellStatus = 'cited' | 'competitor' | 'neither';
type ContentState = 'live+cited' | 'live' | 'draft' | 'none';

interface QueryRow {
  id: number;
  q: string;
  intent: string;
  icp: string;
  status: CellStatus[];
  content: ContentState;
  lastChecked: string;
}

const QUERIES: QueryRow[] = [
  { id: 1, q: 'best adaptogens for stress and anxiety', intent: 'Comparison', icp: 'Wellness-curious', status: ['cited', 'competitor', 'cited', 'competitor', 'competitor'], content: 'live', lastChecked: '2d ago' },
  { id: 2, q: 'ashwagandha vs rhodiola which is better', intent: 'Comparison', icp: 'Wellness-curious', status: ['competitor', 'competitor', 'cited', 'neither', 'competitor'], content: 'draft', lastChecked: '2d ago' },
  { id: 3, q: 'are functional mushroom supplements worth it', intent: 'Evaluation', icp: 'Performance', status: ['competitor', 'competitor', 'competitor', 'competitor', 'competitor'], content: 'none', lastChecked: '2d ago' },
  { id: 4, q: 'how to choose a daily multivitamin', intent: 'Educational', icp: 'Wellness-curious', status: ['competitor', 'cited', 'competitor', 'competitor', 'competitor'], content: 'live', lastChecked: '2d ago' },
  { id: 5, q: 'best supplements for hormonal balance', intent: 'Comparison', icp: 'Wellness-curious', status: ['competitor', 'competitor', 'competitor', 'competitor', 'competitor'], content: 'none', lastChecked: '2d ago' },
  { id: 6, q: "lion's mane benefits scientific evidence", intent: 'Educational', icp: 'Holistic', status: ['cited', 'cited', 'cited', 'cited', 'competitor'], content: 'live+cited', lastChecked: '2d ago' },
  { id: 7, q: 'is Athletic Greens worth the price', intent: 'Evaluation', icp: 'Performance', status: ['competitor', 'competitor', 'competitor', 'competitor', 'competitor'], content: 'draft', lastChecked: '2d ago' },
  { id: 8, q: 'natural sleep aids that actually work', intent: 'Comparison', icp: 'Wellness-curious', status: ['cited', 'competitor', 'cited', 'competitor', 'cited'], content: 'live', lastChecked: '2d ago' },
  { id: 9, q: 'third-party tested supplement brands', intent: 'Educational', icp: 'Holistic', status: ['cited', 'cited', 'cited', 'cited', 'cited'], content: 'live+cited', lastChecked: '2d ago' },
  { id: 10, q: 'magnesium glycinate vs citrate', intent: 'Comparison', icp: 'Performance', status: ['competitor', 'cited', 'competitor', 'neither', 'competitor'], content: 'draft', lastChecked: '2d ago' },
  { id: 11, q: 'best supplements for women in 30s', intent: 'Comparison', icp: 'Wellness-curious', status: ['competitor', 'competitor', 'cited', 'competitor', 'competitor'], content: 'live', lastChecked: '2d ago' },
  { id: 12, q: 'how long until adaptogens start working', intent: 'Educational', icp: 'Wellness-curious', status: ['cited', 'cited', 'competitor', 'cited', 'neither'], content: 'live+cited', lastChecked: '2d ago' },
];

const CELL_GREEN = 'var(--status-approved)';
const CELL_RED_BG = 'rgba(188,1,11,0.10)';
const CELL_RED_FG = 'var(--status-failed)';

// ─── BRAND FACTS SUB-TAB DATA ─────────────────────────────────────────

type FactStatus = 'accurate' | 'partial' | 'wrong' | 'missing';

interface FactAnswer {
  tool: string;
  status: FactStatus;
  text: string;
  issue?: string;
}

interface BrandFact {
  id: string;
  cat: string;
  q: string;
  truth: string;
  answers: FactAnswer[];
}

const BRAND_FACTS: BrandFact[] = [
  {
    id: 'founded', cat: 'Company', q: 'When was Radiant Health founded?', truth: '2019, by herbalist Mara Chen in Los Angeles.',
    answers: [
      { tool: 'chatgpt', status: 'accurate', text: 'Founded in 2019 by herbalist Mara Chen in Los Angeles.' },
      { tool: 'claude', status: 'accurate', text: 'Founded in 2019 in Los Angeles by Mara Chen, an herbalist.' },
      { tool: 'perplexity', status: 'accurate', text: 'Launched in 2019 by founder Mara Chen.' },
      { tool: 'gemini', status: 'wrong', text: 'Founded in 2017 by a team of nutritionists in New York.', issue: 'Wrong year, wrong founder, wrong city.' },
      { tool: 'aio', status: 'missing', text: 'No founding information surfaced.', issue: 'Brand not present in answer.' },
    ],
  },
  {
    id: 'hero', cat: 'Products', q: "What is Radiant Health's flagship product?", truth: 'Calm Adaptogen Blend — KSM-66 ashwagandha + rhodiola + L-theanine.',
    answers: [
      { tool: 'chatgpt', status: 'accurate', text: 'Their flagship is the Calm Adaptogen Blend, combining KSM-66 ashwagandha with rhodiola and L-theanine.' },
      { tool: 'claude', status: 'partial', text: 'Best known for adaptogen blends, particularly an ashwagandha-based formula.', issue: "Doesn't name the product or full formulation." },
      { tool: 'perplexity', status: 'accurate', text: 'The Calm Adaptogen Blend is their hero SKU — 600mg KSM-66 ashwagandha, rhodiola, and L-theanine.' },
      { tool: 'gemini', status: 'wrong', text: 'Their hero product is a daily multivitamin.', issue: "We don't sell a multivitamin — confused with Ritual." },
      { tool: 'aio', status: 'missing', text: 'Not mentioned.', issue: 'Brand not surfaced for product queries.' },
    ],
  },
  {
    id: 'testing', cat: 'Quality', q: 'Are Radiant Health products third-party tested?', truth: 'Yes — every batch is NSF Certified for Sport.',
    answers: [
      { tool: 'chatgpt', status: 'accurate', text: 'Yes — all products are NSF Certified for Sport, tested per batch.' },
      { tool: 'claude', status: 'partial', text: "They state they test their products, though specifics aren't always clear.", issue: "Hedged — doesn't cite NSF certification." },
      { tool: 'perplexity', status: 'accurate', text: 'Every batch carries NSF Certified for Sport verification.' },
      { tool: 'gemini', status: 'partial', text: 'Performs internal quality testing on their supplements.', issue: 'Implies internal-only — misses third-party NSF cert.' },
      { tool: 'aio', status: 'wrong', text: 'Third-party testing status is not publicly disclosed.', issue: 'Disclosed prominently on every PDP.' },
    ],
  },
  {
    id: 'sourcing', cat: 'Sourcing', q: 'Where does Radiant Health source ashwagandha?', truth: 'Ixoreal Biomed (KSM-66), single-origin from Rajasthan, India.',
    answers: [
      { tool: 'chatgpt', status: 'accurate', text: 'Sourced as KSM-66 from Ixoreal Biomed in Rajasthan, India.' },
      { tool: 'claude', status: 'missing', text: "Specific sourcing details aren't surfaced.", issue: "Sourcing page exists but isn't being cited." },
      { tool: 'perplexity', status: 'accurate', text: 'Single-origin KSM-66 from Ixoreal Biomed (Rajasthan).' },
      { tool: 'gemini', status: 'missing', text: 'Sourcing not specified.', issue: "Sourcing page exists but isn't being cited." },
      { tool: 'aio', status: 'missing', text: 'Not surfaced.', issue: 'Brand not present in answer.' },
    ],
  },
  {
    id: 'price', cat: 'Products', q: 'What is the price of the Calm Adaptogen Blend?', truth: '$48 one-time, $38 on subscription. 60 capsules / 30-day supply.',
    answers: [
      { tool: 'chatgpt', status: 'accurate', text: '$48 one-time or $38 with subscription, for a 30-day supply (60 capsules).' },
      { tool: 'claude', status: 'partial', text: 'Around $40-$50 per bottle, with subscription discounts available.', issue: "Approximate — won't show in price-comparison answer." },
      { tool: 'perplexity', status: 'accurate', text: '$48 retail, $38 on subscribe-and-save. 60 ct.' },
      { tool: 'gemini', status: 'wrong', text: 'Approximately $65 per bottle.', issue: 'Off by $17.' },
      { tool: 'aio', status: 'missing', text: 'Price not shown.', issue: 'Pricing schema missing from PDP markup.' },
    ],
  },
  {
    id: 'values', cat: 'Values', q: 'Is Radiant Health vegan and cruelty-free?', truth: 'All capsules are vegan; no animal testing; Leaping Bunny certified.',
    answers: [
      { tool: 'chatgpt', status: 'accurate', text: 'Yes — vegan capsules, cruelty-free, and Leaping Bunny certified.' },
      { tool: 'claude', status: 'accurate', text: 'Vegan and Leaping Bunny certified cruelty-free.' },
      { tool: 'perplexity', status: 'accurate', text: 'Vegan capsules; Leaping Bunny certified; no animal testing.' },
      { tool: 'gemini', status: 'accurate', text: 'Yes, vegan and cruelty-free.' },
      { tool: 'aio', status: 'partial', text: 'Vegan formulation.', issue: 'Cruelty-free / Leaping Bunny status not surfaced.' },
    ],
  },
];

const STATUS_COLOR: Record<FactStatus, string> = {
  accurate: 'var(--status-approved)',
  partial: 'var(--status-review)',
  wrong: 'var(--status-failed)',
  missing: 'var(--dark-15)',
};
const STATUS_BG: Record<FactStatus, string> = {
  accurate: 'rgba(4,175,0,0.10)',
  partial: 'rgba(237,182,44,0.15)',
  wrong: 'rgba(188,1,11,0.10)',
  missing: 'var(--dark-4)',
};
const STATUS_LABEL: Record<FactStatus, string> = {
  accurate: '✓ Accurate',
  partial: '△ Partial',
  wrong: '✕ Wrong',
  missing: '○ Missing',
};

// ─── ROUTE ────────────────────────────────────────────────────────────

export function AeoRoute() {
  return (
    <ModalStack>
      <AeoInner />
    </ModalStack>
  );
}

function AeoInner() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');

  const topbarCenter = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(
        [
          { key: 'overview', label: 'Overview' },
          { key: 'citations', label: 'Citations' },
          { key: 'facts', label: 'Brand facts' },
          { key: 'map-ranking', label: 'Map Ranking' },
        ] as const
      ).map((t) => (
        <TabChip
          key={t.key}
          selected={activeSubTab === t.key}
          onSelect={() => setActiveSubTab(t.key)}
        >
          {t.label}
        </TabChip>
      ))}
    </div>
  );

  return (
    <H2Layout
      title="AEO"
      topbarCenter={topbarCenter}
      topbarRight={<GenerateReportButton />}
    >
      {activeSubTab === 'overview' && <OverviewSubTab />}
      {activeSubTab === 'citations' && <CitationsSubTab />}
      {activeSubTab === 'facts' && <BrandFactsSubTab />}
      {activeSubTab === 'map-ranking' && <MapRankingBody devStatePath="/h2/aeo" />}
    </H2Layout>
  );
}

// ─── OVERVIEW SUB-TAB ────────────────────────────────────────────────

function OverviewSubTab() {
  const [filter, setFilter] = useState<FilterKey>('approval');
  const { showToast } = useToast();

  const counts = useMemo(
    () => ({
      approval: APPROVAL_ITEMS.length,
      future: FUTURE_ITEMS.length,
      published: PUBLISHED_ITEMS.length,
    }),
    [],
  );

  const handleApproveAll = () => {
    showToast({ message: `Approved all ${APPROVAL_ITEMS.length} items` });
  };

  return (
    <div style={{ padding: '24px 28px 80px', maxWidth: 1180, margin: '0 auto' }}>
      <OverviewCards />
      <FilterRow
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        onApproveAll={handleApproveAll}
      />
      <FilterContent filter={filter} />
    </div>
  );
}

function OverviewCards() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}
    >
      <OverviewCard label="Citations this week" value="7" delta="+2" deltaTone="up" sub="of 24 target queries" />
      <OverviewCard label="Coverage" value="29%" sub="across 4 of 5 engines" />
      <OverviewCard label="Approval queue" value="3" sub="items waiting on you" />
      <OverviewCard label="Published this month" value="12" delta="+4" deltaTone="up" sub="vs last month" />
    </div>
  );
}

function OverviewCard({
  label,
  value,
  delta,
  deltaTone,
  sub,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'up' | 'down';
  sub: string;
}) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '16px 20px',
      }}
    >
      <Text
        variant="metadata"
        style={{
          color: 'var(--dark-60)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 500,
          fontSize: 11,
        }}
      >
        {label}
      </Text>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: 'var(--dark-90)',
            letterSpacing: '-0.4px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {delta && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: deltaTone === 'up' ? 'var(--status-approved)' : 'var(--status-failed)',
            }}
          >
            {deltaTone === 'up' ? '▲' : '▼'} {delta}
          </span>
        )}
      </div>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
        {sub}
      </Text>
    </div>
  );
}

function FilterRow({
  filter,
  onFilterChange,
  counts,
  onApproveAll,
}: {
  filter: FilterKey;
  onFilterChange: (f: FilterKey) => void;
  counts: { approval: number; future: number; published: number };
  onApproveAll: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '6px 0 20px',
        borderBottom: '1px solid var(--dark-8)',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(
          [
            { key: 'approval', label: 'Approval needed', count: counts.approval },
            { key: 'future', label: 'Future content', count: counts.future },
            { key: 'published', label: 'Published', count: counts.published },
          ] as const
        ).map((f) => (
          <TabChip
            key={f.key}
            selected={filter === f.key}
            count={f.count}
            onSelect={() => onFilterChange(f.key)}
          >
            {f.label}
          </TabChip>
        ))}
      </div>
      {filter === 'approval' && (
        <Button variant="secondary" size="md" onPress={onApproveAll}>
          Approve all
        </Button>
      )}
    </div>
  );
}

function FilterContent({ filter }: { filter: FilterKey }) {
  if (filter === 'approval') return <ApprovalList />;
  if (filter === 'future') return <FutureList />;
  return <PublishedList />;
}

function ApprovalList() {
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {APPROVAL_ITEMS.map((item) => (
        <ApprovalCard
          key={item.id}
          item={item}
          onApprove={() => showToast({ message: `Approved: ${item.headline}` })}
          onReject={() => showToast({ message: `Rejected: ${item.headline}` })}
        />
      ))}
    </div>
  );
}

function ApprovalCard({
  item,
  onApprove,
  onReject,
}: {
  item: ApprovalItem;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '20px 24px',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
      }}
    >
      <Text
        variant="metadata"
        style={{ display: 'block', color: 'var(--dark-60)', fontSize: 12 }}
      >
        {item.citationSource}
      </Text>
      <Heading level={5} style={{ color: 'var(--dark-90)', lineHeight: 1.35 }}>
        {item.headline}
      </Heading>
      <Text
        variant="secondary"
        style={{ display: 'block', color: 'var(--dark-60)', lineHeight: 1.55 }}
      >
        {item.preview}
      </Text>
      <div
        style={{
          background: 'var(--dark-2)',
          borderLeft: '4px solid var(--dark-15)',
          borderRadius: 4,
          padding: '8px 12px',
        }}
      >
        <Text
          variant="secondary"
          style={{
            display: 'block',
            color: 'var(--dark-80)',
            lineHeight: 1.55,
            fontStyle: 'italic',
          }}
        >
          {item.excerpt}
        </Text>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 4,
          paddingTop: 4,
        }}
      >
        <button
          type="button"
          onClick={onReject}
          aria-label="More options"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--dark-60)',
          }}
        >
          <MoreDots size={16} color="var(--dark-60)" />
        </button>
        <Button variant="secondary" size="md" onPress={onApprove}>
          Approve
        </Button>
      </div>
    </div>
  );
}

function FutureList() {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {FUTURE_ITEMS.map((item, idx) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 20px',
            borderBottom: idx === FUTURE_ITEMS.length - 1 ? 'none' : '1px solid var(--dark-4)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ display: 'block', color: 'var(--dark-90)' }}>{item.title}</Text>
            <Text
              variant="secondary"
              style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}
            >
              Scheduled for {item.scheduledDate}
            </Text>
          </div>
          <EngineChip engine={item.engine} />
        </div>
      ))}
    </div>
  );
}

function PublishedList() {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {PUBLISHED_ITEMS.map((item, idx) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 20px',
            borderBottom: idx === PUBLISHED_ITEMS.length - 1 ? 'none' : '1px solid var(--dark-4)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ display: 'block', color: 'var(--dark-90)' }}>{item.title}</Text>
            <Text
              variant="secondary"
              style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}
            >
              Published {item.publishedDate}
            </Text>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {item.citingEngines.map((e) => (
              <EngineChip key={e} engine={e} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EngineChip({ engine }: { engine: Engine }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        background: 'var(--dark-4)',
        color: 'var(--dark-90)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: ENGINE_COLOR[engine],
        }}
      />
      {engine}
    </span>
  );
}

// ─── CITATIONS SUB-TAB ───────────────────────────────────────────────

type CitationFilter = 'all' | 'gap' | 'cited';

function CitationsSubTab() {
  const { showToast } = useToast();
  const { openModal } = useModals();
  const [filter, setFilter] = useState<CitationFilter>('all');

  const filtered =
    filter === 'all'
      ? QUERIES
      : filter === 'gap'
        ? QUERIES.filter((q) => !q.status.includes('cited'))
        : QUERIES.filter((q) => q.status.includes('cited'));

  // Sparkline
  const data = [2, 3, 3, 4, 3, 4, 5, 5, 6, 5, 6, 7, 7];
  const max = 8;
  const w = 320;
  const h = 60;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - (v / max) * (h - 8) - 4}`)
    .join(' ');

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      {/* Hero metric */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: 32,
          alignItems: 'center',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: '24px',
          marginBottom: 24,
        }}
      >
        <div>
          <Text
            variant="metadata"
            style={{
              display: 'block',
              color: 'var(--dark-60)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 500,
              fontSize: 11,
              marginBottom: 8,
            }}
          >
            Citation scoreboard
          </Text>
          <div
            style={{
              fontSize: 64,
              fontWeight: 500,
              color: 'var(--dark-90)',
              letterSpacing: '-1.5px',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            7
            <span style={{ fontSize: 24, color: 'var(--dark-40)' }}> / 24</span>
          </div>
          <Text
            variant="secondary"
            style={{ display: 'block', color: 'var(--dark-60)', marginTop: 8 }}
          >
            target queries cite Radiant Health
          </Text>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(4,175,0,0.10)',
              color: 'var(--status-approved)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              fontWeight: 500,
              marginTop: 12,
            }}
          >
            ▲ +2 vs last week
          </span>
          <Text
            variant="metadata"
            style={{ display: 'block', color: 'var(--dark-60)', marginTop: 8 }}
          >
            Across 4 of 5 monitored AI tools · 6 weeks of data
          </Text>
        </div>
        <div>
          <Text
            variant="metadata"
            style={{
              display: 'block',
              color: 'var(--dark-60)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 8,
            }}
          >
            Citations over time · last 13 weeks
          </Text>
          <svg
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: 60 }}
          >
            <polyline
              points={points}
              fill="none"
              stroke="var(--status-approved)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={(data.length - 1) * step}
              cy={h - (data[data.length - 1] / max) * (h - 8) - 4}
              r={3.5}
              fill="var(--status-approved)"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 4,
              fontSize: 11,
              color: 'var(--dark-40)',
            }}
          >
            <span>Mar 1</span>
            <span>Apr 5</span>
            <span>May 6</span>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 20,
        }}
      >
        <div>
          <Heading level={5} style={{ color: 'var(--dark-90)', margin: 0 }}>
            Target queries
          </Heading>
          <Text
            variant="secondary"
            style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}
          >
            Citation status across {TOOLS.length} AI tools · click any cell to see the actual response
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button variant="tertiary" size="sm" onPress={() => showToast({ message: 'Add query (TODO)' })}>
            + Add query
          </Button>
          <Button variant="tertiary" size="sm" onPress={() => showToast({ message: 'Regenerate (TODO)' })}>
            Regenerate
          </Button>
          <Button variant="secondary" size="sm" onPress={() => showToast({ message: 'Bulk edit (TODO)' })}>
            Bulk edit
          </Button>
        </div>
      </div>

      {/* Filter row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderBottom: 'none',
          borderRadius: '10px 10px 0 0',
        }}
      >
        <Text
          variant="metadata"
          style={{
            color: 'var(--dark-40)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Filter
        </Text>
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All {QUERIES.length} queries
        </FilterChip>
        <FilterChip active={filter === 'gap'} onClick={() => setFilter('gap')}>
          Gaps only
        </FilterChip>
        <FilterChip active={filter === 'cited'} onClick={() => setFilter('cited')}>
          Where you're cited
        </FilterChip>
        <span style={{ flex: 1 }} />
        <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              background: CELL_GREEN,
              borderRadius: 2,
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />
          Cited
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              background: CELL_RED_BG,
              border: `1px solid ${CELL_RED_FG}`,
              borderRadius: 2,
              marginLeft: 12,
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />
          Competitor
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              background: 'var(--dark-4)',
              borderRadius: 2,
              marginLeft: 12,
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />
          Neither
        </Text>
      </div>

      <table
        style={{
          width: '100%',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: '0 0 10px 10px',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <thead>
          <tr>
            <th style={qThStyle('left', 280)}>Query</th>
            {TOOLS.map((t) => (
              <th key={t.id} style={qThStyle('center')}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: t.color,
                      color: 'var(--light-100)',
                      fontSize: 10,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {t.logo}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--dark-80)' }}>{t.name}</span>
                </div>
              </th>
            ))}
            <th style={{ ...qThStyle('left'), width: 120 }}>Your content</th>
            <th style={{ ...qThStyle('left'), width: 80 }}>Last check</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((q, qi) => (
            <tr key={q.id}>
              <td style={qTdStyle(qi === filtered.length - 1)}>
                <div style={{ fontSize: 13, color: 'var(--dark-90)', marginBottom: 4 }}>
                  {q.q}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                    color: 'var(--dark-60)',
                  }}
                >
                  <span
                    style={{
                      background: 'var(--dark-4)',
                      padding: '2px 8px',
                      borderRadius: 5,
                      fontSize: 11,
                    }}
                  >
                    {q.intent}
                  </span>
                  <span>{q.icp}</span>
                </div>
              </td>
              {q.status.map((s, ti) => (
                <td
                  key={ti}
                  style={{
                    ...qTdStyle(qi === filtered.length - 1),
                    textAlign: 'center',
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      openModal(CellDrawerModal, { query: q, toolIdx: ti, status: s })
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      border:
                        s === 'competitor' ? `1px solid ${CELL_RED_FG}` : 'none',
                      background:
                        s === 'cited'
                          ? CELL_GREEN
                          : s === 'competitor'
                            ? CELL_RED_BG
                            : 'var(--dark-4)',
                      color:
                        s === 'cited'
                          ? 'var(--light-100)'
                          : s === 'competitor'
                            ? CELL_RED_FG
                            : 'var(--dark-40)',
                      font: 'inherit',
                    }}
                    title={`${TOOLS[ti].name}: ${s}`}
                  >
                    {s === 'cited' ? '✓' : s === 'competitor' ? '✕' : '–'}
                  </button>
                </td>
              ))}
              <td style={qTdStyle(qi === filtered.length - 1)}>
                <ContentPill
                  content={q.content}
                  onClickIfNone={() =>
                    showToast({ message: 'Content recommendations would open here' })
                  }
                />
              </td>
              <td
                style={{
                  ...qTdStyle(qi === filtered.length - 1),
                  color: 'var(--dark-40)',
                  fontSize: 12,
                }}
              >
                {q.lastChecked}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function qThStyle(align: 'left' | 'center', minWidth?: number): React.CSSProperties {
  return {
    fontSize: 11,
    color: 'var(--dark-40)',
    textAlign: align,
    padding: '12px',
    background: 'var(--dark-2)',
    borderBottom: '1px solid var(--dark-8)',
    letterSpacing: '0.06em',
    fontWeight: 500,
    minWidth,
  };
}

function qTdStyle(isLast: boolean): React.CSSProperties {
  return {
    padding: '12px',
    borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
    fontSize: 13,
    verticalAlign: 'middle',
  };
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: active ? 'var(--dark-90)' : 'var(--dark-4)',
        color: active ? 'var(--light-100)' : 'var(--dark-80)',
        border: 'none',
        borderRadius: 6,
        padding: '4px 12px',
        fontSize: 12,
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        font: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

function ContentPill({
  content,
  onClickIfNone,
}: {
  content: ContentState;
  onClickIfNone: () => void;
}) {
  const map: Record<ContentState, { color: string; dot: string; label: string }> = {
    'live+cited': { color: 'var(--status-approved)', dot: 'var(--status-approved)', label: 'Live + cited' },
    live: { color: 'var(--dark-90)', dot: 'var(--dark-60)', label: 'Live' },
    draft: { color: 'var(--status-review)', dot: 'var(--status-review)', label: 'Draft' },
    none: { color: 'var(--dark-40)', dot: 'var(--dark-15)', label: 'No content · Ideas →' },
  };
  const m = map[content];
  return (
    <span
      onClick={content === 'none' ? onClickIfNone : undefined}
      style={{
        fontSize: 12,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: m.color,
        cursor: content === 'none' ? 'pointer' : 'default',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: m.dot,
        }}
      />
      {m.label}
    </span>
  );
}

// ─── CELL DRAWER MODAL (Citations) ────────────────────────────────────

interface CellDrawerProps {
  query: QueryRow;
  toolIdx: number;
  status: CellStatus;
}

function CellDrawerModal({
  close,
  query,
  toolIdx,
  status,
}: StackModalProps & CellDrawerProps) {
  const tool = TOOLS[toolIdx];
  const sample =
    status === 'cited'
      ? `Radiant Health is one of the most cited brands here. Their Calm Adaptogen Blend (KSM-66 ashwagandha + rhodiola + L-theanine) is referenced for both potency and third-party testing — every batch is NSF Certified for Sport.`
      : status === 'competitor'
        ? `Top brands surfaced for this query include Moon Juice, Ritual, and Care/of. Their comparison hubs and buyer's guides currently dominate ${tool.name}'s answer.`
        : `${tool.name} did not surface a brand recommendation for this query. The model returned a neutral educational answer with no citations.`;

  const statusLabel =
    status === 'cited'
      ? 'You are cited'
      : status === 'competitor'
        ? 'Competitor cited'
        : 'No citation';
  const statusColor =
    status === 'cited'
      ? 'var(--status-approved)'
      : status === 'competitor'
        ? 'var(--status-failed)'
        : 'var(--dark-40)';
  const statusBg =
    status === 'cited'
      ? 'rgba(4,175,0,0.10)'
      : status === 'competitor'
        ? 'rgba(188,1,11,0.10)'
        : 'var(--dark-4)';

  return (
    <Modal.Root size="md" aria-labelledby="aeo-cell-title" data-testid="aeo-cell-drawer">
      <Modal.Header
        title={`${tool.name} response`}
        id="aeo-cell-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: tool.color,
              color: 'var(--light-100)',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {tool.logo}
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              background: statusBg,
              color: statusColor,
            }}
          >
            {statusLabel}
          </span>
          <Text variant="metadata" style={{ color: 'var(--dark-40)' }}>
            Last seen {query.lastChecked}
          </Text>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text
            variant="metadata"
            style={{
              display: 'block',
              color: 'var(--dark-40)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            Query
          </Text>
          <div style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: 500 }}>
            {query.q}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--dark-60)',
              marginTop: 4,
            }}
          >
            <span
              style={{
                background: 'var(--dark-4)',
                padding: '2px 8px',
                borderRadius: 5,
                fontSize: 11,
              }}
            >
              {query.intent}
            </span>
            <span>{query.icp}</span>
          </div>
        </div>

        <div
          style={{
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-4)',
            borderRadius: 8,
            padding: '16px',
            marginBottom: 16,
          }}
        >
          <Text
            variant="metadata"
            style={{
              display: 'block',
              color: 'var(--dark-40)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 8,
            }}
          >
            Excerpt
          </Text>
          <div
            style={{
              fontSize: 13,
              color: 'var(--dark-80)',
              lineHeight: 1.55,
              fontStyle: 'italic',
            }}
          >
            "{sample}"
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <DrawerMeta label="Tool" value={tool.name} />
          <DrawerMeta label="Source link" value="View raw response →" linkLike />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Close
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>
            {status === 'cited' ? 'View page →' : 'Generate counter-content →'}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function DrawerMeta({
  label,
  value,
  linkLike,
}: {
  label: string;
  value: string;
  linkLike?: boolean;
}) {
  return (
    <div>
      <Text
        variant="metadata"
        style={{
          display: 'block',
          color: 'var(--dark-40)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <div
        style={{
          fontSize: 13,
          color: linkLike ? 'var(--purple)' : 'var(--dark-90)',
          textDecoration: linkLike ? 'underline' : 'none',
          textUnderlineOffset: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── BRAND FACTS SUB-TAB ─────────────────────────────────────────────

function BrandFactsSubTab() {
  const { showToast } = useToast();
  const [open, setOpen] = useState<string | null>(null);

  const counts: Record<FactStatus, number> = {
    accurate: 0,
    partial: 0,
    wrong: 0,
    missing: 0,
  };
  BRAND_FACTS.forEach((f) => f.answers.forEach((a) => counts[a.status]++));
  const total = BRAND_FACTS.length * TOOLS.length;

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 20,
        }}
      >
        <div>
          <Heading level={5} style={{ color: 'var(--dark-90)', margin: 0 }}>
            Brand fact check
          </Heading>
          <Text
            variant="secondary"
            style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}
          >
            What AI tools say about you when asked directly · checked weekly
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            variant="tertiary"
            size="sm"
            onPress={() => showToast({ message: 'Add question (TODO)' })}
          >
            + Add question
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => showToast({ message: 'Re-checking…' })}
          >
            Re-check now
          </Button>
        </div>
      </div>

      {/* Stats + bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,auto) 1fr',
          gap: 20,
          alignItems: 'center',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 16,
        }}
      >
        <FactsStat num={counts.accurate} label="Accurate" color="var(--status-approved)" />
        <FactsStat num={counts.partial} label="Partial" color="var(--status-review)" />
        <FactsStat num={counts.wrong} label="Wrong" color="var(--status-failed)" />
        <FactsStat num={counts.missing} label="Missing" color="var(--dark-40)" />
        <div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              overflow: 'hidden',
              display: 'flex',
              background: 'var(--dark-4)',
            }}
          >
            {(['accurate', 'partial', 'wrong', 'missing'] as FactStatus[]).map((s) => (
              <div key={s} style={{ flex: counts[s], background: STATUS_COLOR[s] }} />
            ))}
          </div>
          <Text
            variant="metadata"
            style={{ display: 'block', color: 'var(--dark-40)', marginTop: 8 }}
          >
            {total} answers checked across {TOOLS.length} AI tools
          </Text>
        </div>
      </div>

      {/* Accordion table */}
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
            gridTemplateColumns: `1fr repeat(${TOOLS.length},40px) 28px`,
            gap: 8,
            alignItems: 'center',
            padding: '12px 16px',
            background: 'var(--dark-2)',
            borderBottom: '1px solid var(--dark-8)',
            fontSize: 11,
            color: 'var(--dark-40)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          <div>Brand fact</div>
          {TOOLS.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: t.color,
                  color: 'var(--light-100)',
                  fontSize: 10,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {t.logo}
              </div>
            </div>
          ))}
          <div />
        </div>
        {BRAND_FACTS.map((f) => {
          const isOpen = open === f.id;
          return (
            <div key={f.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(isOpen ? null : f.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen(isOpen ? null : f.id);
                  }
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `1fr repeat(${TOOLS.length},40px) 28px`,
                  gap: 8,
                  alignItems: 'center',
                  padding: '16px',
                  borderBottom: '1px solid var(--dark-4)',
                  cursor: 'pointer',
                  background: isOpen ? 'var(--dark-2)' : 'transparent',
                }}
              >
                <div>
                  <Text
                    variant="metadata"
                    style={{
                      display: 'block',
                      color: 'var(--dark-40)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    {f.cat}
                  </Text>
                  <div style={{ fontSize: 13, color: 'var(--dark-90)', fontWeight: 500 }}>
                    {f.q}
                  </div>
                </div>
                {f.answers.map((a) => (
                  <div
                    key={a.tool}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      margin: '0 auto',
                      background: STATUS_COLOR[a.status],
                    }}
                    title={`${a.tool}: ${a.status}`}
                  />
                ))}
                <div
                  style={{
                    color: 'var(--dark-40)',
                    textAlign: 'center',
                    fontSize: 11,
                  }}
                >
                  {isOpen ? '▾' : '▸'}
                </div>
              </div>
              {isOpen && (
                <div
                  style={{
                    background: 'var(--dark-2)',
                    borderBottom: '1px solid var(--dark-4)',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--light-100)',
                      border: '1px solid var(--dark-8)',
                      borderRadius: 8,
                      padding: '12px',
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      variant="metadata"
                      style={{
                        display: 'block',
                        color: 'var(--dark-40)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Your truth
                    </Text>
                    <div style={{ fontSize: 13, color: 'var(--dark-90)' }}>{f.truth}</div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                      gap: 12,
                    }}
                  >
                    {f.answers.map((a) => {
                      const tool = TOOLS.find((t) => t.id === a.tool)!;
                      return (
                        <div
                          key={a.tool}
                          style={{
                            background: 'var(--light-100)',
                            border: '1px solid var(--dark-8)',
                            borderRadius: 8,
                            padding: '12px 16px',
                            borderLeftWidth: 4,
                            borderLeftStyle: 'solid',
                            borderLeftColor: STATUS_COLOR[a.status],
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--dark-90)',
                              }}
                            >
                              <div
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 5,
                                  background: tool.color,
                                  color: 'var(--light-100)',
                                  fontSize: 10,
                                  fontWeight: 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {tool.logo}
                              </div>
                              {tool.name}
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 5,
                                fontWeight: 500,
                                background: STATUS_BG[a.status],
                                color: STATUS_COLOR[a.status],
                              }}
                            >
                              {STATUS_LABEL[a.status]}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'var(--dark-80)',
                              lineHeight: 1.5,
                              fontStyle: 'italic',
                            }}
                          >
                            "{a.text}"
                          </div>
                          {a.issue && (
                            <Text
                              variant="secondary"
                              style={{
                                display: 'block',
                                marginTop: 8,
                                color: 'var(--dark-60)',
                                lineHeight: 1.5,
                              }}
                            >
                              <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
                                Issue:
                              </strong>{' '}
                              {a.issue}
                            </Text>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FactsStat({
  num,
  label,
  color,
}: {
  num: number;
  label: string;
  color: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: '-0.4px',
          fontVariantNumeric: 'tabular-nums',
          color,
        }}
      >
        {num}
      </div>
      <Text
        variant="metadata"
        style={{
          display: 'block',
          color: 'var(--dark-60)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginTop: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </Text>
    </div>
  );
}
