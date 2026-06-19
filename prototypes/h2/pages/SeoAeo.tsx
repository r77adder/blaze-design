import { Fragment, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, IconButton, Modal, Text } from '@/components';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRefresh,
  ArrowRight,
  ChevronDown,
  BarChart,
  CheckboxChecked,
  Close,
  Copy,
  Download,
  File02,
  Filter,
  Globe,
  GrabHandle,
  LinkAngled,
  Map02,
  MoreDots,
  Marker03,
  Microphone,
  Plus,
  Search,
  Send1 as Send,
  Settings,
  Share,
  Star,
  Stars,
  Trash2,
} from '@/icons/20';
import { Check as CheckSm } from '@/icons/16';
import { GoHighLevelBrand, WixBrand, WordPressBrand } from '@/icons/35';
import { Chip, StatusPill, TabChip, Tabs, Toggle } from '@/staging';
import type { StatusPillTone } from '@/staging';
import { H2Layout } from '../H2Layout';
import { useDevState } from '../dev-state-context';
import { useApprovalSettings } from '../approval-settings-context';

type SeoAeoTab = 'dashboard' | 'analytics' | 'how-it-works' | 'settings';
type AnalyticsSubTab = 'seo' | 'aeo';

// ─── DASHBOARD DATA ───────────────────────────────────────────────────

type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
type PostStatus = 'Review' | 'Queued' | 'Posted' | 'Failed';
/** Why a Failed row failed — drives its recovery CTA. */
type FailReason = 'publish' | 'generation';
type TopicCluster = 'Best Painters in Austin' | 'Interior Paint Colors' | 'Cabinet Painting Cost Guide' | 'Exterior Painting in Texas Heat';

interface PostRow {
  keyword: string;
  title: string;
  searchVol: string;
  aiVol: string;
  difficulty: DifficultyLevel;
  scheduled: string;
  status: PostStatus;
  failReason?: FailReason;
}

interface ClusterGroup {
  cluster: TopicCluster;
  seedKeyword: string;
  seedSearchVol: string;
  seedAiVol: string;
  firstScheduled: string;
  status: PostStatus;
  posts: PostRow[];
}

const CLUSTER_GROUPS: ClusterGroup[] = [
  {
    cluster: 'Best Painters in Austin',
    seedKeyword: 'best painters austin 2026',
    seedSearchVol: '14.2K', seedAiVol: '9.9K',
    firstScheduled: 'May 19', status: 'Review',
    posts: [
      { keyword: 'house painters austin TX',      title: 'How to choose a house painter in Austin without getting burned', searchVol: '5.4K',  aiVol: '3.2K', difficulty: 'Medium', scheduled: 'May 22', status: 'Review' },
      { keyword: 'painter near me',               title: 'Why "painter near me" matters more than you think',             searchVol: '1.2K',  aiVol: '480',  difficulty: 'Easy',   scheduled: 'May 26', status: 'Review' },
      { keyword: 'residential painters austin',   title: 'Residential painters in Austin: what sets the best apart',      searchVol: '880',   aiVol: '310',  difficulty: 'Easy',   scheduled: 'May 30', status: 'Queued' },
      { keyword: 'how to hire a painter',         title: 'How to hire a painter: 8 questions to ask before signing',      searchVol: '720',   aiVol: '260',  difficulty: 'Easy',   scheduled: 'Jun 3',  status: 'Queued' },
      { keyword: 'painter reviews austin',        title: 'Austin painter reviews: what customers actually care about',     searchVol: '640',   aiVol: '190',  difficulty: 'Easy',   scheduled: 'Jun 7',  status: 'Queued' },
      { keyword: 'commercial painters austin',    title: 'Commercial painting in Austin: what facilities managers should know', searchVol: '2.9K', aiVol: '1.7K', difficulty: 'Medium', scheduled: 'May 14', status: 'Failed', failReason: 'publish' },
      { keyword: 'cheap painters austin',         title: 'Are cheap painters in Austin worth it? What to watch for',      searchVol: '1.1K',  aiVol: '520',  difficulty: 'Easy',   scheduled: 'May 12', status: 'Failed', failReason: 'generation' },
    ],
  },
  {
    cluster: 'Interior Paint Colors',
    seedKeyword: 'interior painting austin',
    seedSearchVol: '9.1K', seedAiVol: '6.8K',
    firstScheduled: 'May 28', status: 'Review',
    posts: [
      { keyword: 'low-VOC interior paint',        title: 'Low-VOC interior paint: what families and pet owners should know', searchVol: '6.3K', aiVol: '4.1K', difficulty: 'Easy',   scheduled: 'Jun 2',  status: 'Queued' },
      { keyword: 'best interior paint colors',    title: 'Best interior paint colors for Austin homes in 2026',              searchVol: '4.8K', aiVol: '2.9K', difficulty: 'Medium', scheduled: 'Jun 9',  status: 'Queued' },
      { keyword: 'paint color consultation',      title: 'What to expect from a paint color consultation',                   searchVol: '2.1K', aiVol: '1.4K', difficulty: 'Easy',   scheduled: 'Jun 13', status: 'Queued' },
      { keyword: 'accent wall ideas austin',      title: 'Accent wall ideas that work in Texas homes',                       searchVol: '1.5K', aiVol: '820',  difficulty: 'Easy',   scheduled: 'Jun 17', status: 'Queued' },
    ],
  },
  {
    cluster: 'Cabinet Painting Cost Guide',
    seedKeyword: 'cabinet painting austin',
    seedSearchVol: '7.8K', seedAiVol: '5.5K',
    firstScheduled: 'Jun 5', status: 'Posted',
    posts: [
      { keyword: 'kitchen cabinet refinishing',   title: 'How long does a cabinet refinishing project actually take?',      searchVol: '3.2K', aiVol: '2.1K', difficulty: 'Easy',   scheduled: 'Jun 9',  status: 'Queued' },
      { keyword: 'cabinet paint vs stain',        title: 'Cabinet paint vs stain: which holds up better in a kitchen?',    searchVol: '2.4K', aiVol: '1.6K', difficulty: 'Easy',   scheduled: 'Jun 14', status: 'Queued' },
      { keyword: 'refinish kitchen cabinets cost', title: 'How much does it cost to refinish kitchen cabinets in Austin?', searchVol: '1.9K', aiVol: '1.1K', difficulty: 'Easy',   scheduled: 'Jun 18', status: 'Queued' },
    ],
  },
  {
    cluster: 'Exterior Painting in Texas Heat',
    seedKeyword: 'exterior painting austin',
    seedSearchVol: '5.9K', seedAiVol: '3.8K',
    firstScheduled: 'Jun 12', status: 'Queued',
    posts: [
      { keyword: 'best exterior paint for heat',  title: 'Best exterior paint for Texas heat — what actually holds up',    searchVol: '3.1K', aiVol: '1.9K', difficulty: 'Easy',   scheduled: 'Jun 16', status: 'Queued' },
      { keyword: 'exterior paint colors austin',  title: '8 exterior paint colors that survive Texas heat',                searchVol: '2.2K', aiVol: '1.3K', difficulty: 'Medium', scheduled: 'Jun 20', status: 'Queued' },
      { keyword: 'stucco painting austin',        title: 'Stucco painting in Austin: what to know before you start',       searchVol: '1.4K', aiVol: '780',  difficulty: 'Easy',   scheduled: 'Jun 24', status: 'Queued' },
      { keyword: 'deck staining austin',          title: 'Deck staining in Austin — timing, products, and cost',           searchVol: '980',  aiVol: '510',  difficulty: 'Easy',   scheduled: 'Jun 28', status: 'Queued' },
    ],
  },
];

const DIFFICULTY_TONE: Record<DifficultyLevel, StatusPillTone> = {
  Hard:   'neutral',
  Medium: 'neutral',
  Easy:   'neutral',
};

// Status pill colors: Queued = grey (neutral), Review = yellow (custom
// override below), Posted = purple (accent), Failed = red (danger).
const STATUS_TONE: Record<PostStatus, StatusPillTone> = {
  Queued: 'neutral',
  Review: 'warning',
  Posted: 'accent',
  Failed: 'danger',
};

/** Chronological order, oldest (top) → newest (bottom): already-published
 *  or failed posts first, then the one in review, then future queued ones. */
const STATUS_ORDER: Record<PostStatus, number> = { Posted: 0, Failed: 1, Review: 2, Queued: 3 };

/** Status pill with the right tone per status. Review gets a yellow
 *  override (the pill component has no yellow tone — use the --status-review
 *  token directly). */
function StatusPillFor({ status }: { status: PostStatus }) {
  if (status === 'Review') {
    return (
      <StatusPill tone="warning" style={{ background: 'rgba(237, 182, 44, 0.14)', borderColor: 'rgba(237, 182, 44, 0.32)', color: '#946a00' }}>
        Review
      </StatusPill>
    );
  }
  return <StatusPill tone={STATUS_TONE[status]}>{status}</StatusPill>;
}

/** Posted rows are locked — they can't be reordered or deleted. */
function isLocked(status: PostStatus) {
  return status === 'Posted';
}

type ClusterFilter = 'all' | TopicCluster;

const CLUSTER_FILTERS: { key: ClusterFilter; label: string; count: number }[] = [
  { key: 'all',                                   label: 'All topics',                       count: 20 },
  { key: 'Best Painters in Austin',               label: 'Best Painters in Austin',          count: 6  },
  { key: 'Interior Paint Colors',                 label: 'Interior Paint Colors',            count: 5  },
  { key: 'Cabinet Painting Cost Guide',           label: 'Cabinet Painting Cost Guide',      count: 4  },
  { key: 'Exterior Painting in Texas Heat',       label: 'Exterior Painting in Texas Heat',  count: 5  },
];

// ─── ANALYTICS DATA ───────────────────────────────────────────────────

interface Competitor {
  rank: number;
  brand: string;
  isYou: boolean;
  sov: number;
  sovLabel: string;
  avgPos: string;
  citations: string;
  wow: string;
  wowUp: boolean | null;
}

const COMPETITORS: Competitor[] = [
  { rank: 1, brand: 'Five Star Painting of South Austin', isYou: false, sov: 38, sovLabel: '38%', avgPos: '#1.4', citations: '52/wk', wow: '↑ +1%',    wowUp: true  },
  { rank: 2, brand: 'Paper Moon Painting',                isYou: false, sov: 31, sovLabel: '31%', avgPos: '#1.9', citations: '43/wk', wow: '→ Flat',   wowUp: null  },
  { rank: 3, brand: 'CertaPro Painters of Austin',        isYou: true,  sov: 29, sovLabel: '29%', avgPos: '#2.1', citations: '28/wk', wow: '↑ +6 pts', wowUp: true  },
  { rank: 4, brand: 'WOW 1 Day Painting Austin',          isYou: false, sov: 22, sovLabel: '22%', avgPos: '#2.6', citations: '31/wk', wow: '↓ −2%',    wowUp: false },
  { rank: 5, brand: 'College Pro Painters',               isYou: false, sov: 16, sovLabel: '16%', avgPos: '#3.0', citations: '19/wk', wow: '↑ +1%',    wowUp: true  },
];

type QueryIntent = 'Commercial' | 'Informational' | 'Navigational' | 'Comparison';

interface QueryRow {
  query: string;
  intent: QueryIntent;
  cited: boolean;
  aiVol: string;
  trend: string;
  trendUp: boolean | null;
}

const QUERY_ROWS: QueryRow[] = [
  { query: 'painters austin',                     intent: 'Commercial',    cited: true,  aiVol: '14.2K', trend: '↑ Strong', trendUp: true  },
  { query: 'house painters austin TX',            intent: 'Commercial',    cited: true,  aiVol: '10.3K', trend: '↑ Rising', trendUp: true  },
  { query: 'how to choose an austin painter',     intent: 'Informational', cited: true,  aiVol: '8.7K',  trend: '→ Stable', trendUp: null  },
  { query: 'cabinet painting austin',             intent: 'Commercial',    cited: true,  aiVol: '6.2K',  trend: '→ Stable', trendUp: null  },
  { query: 'interior painting austin cost',       intent: 'Informational', cited: false, aiVol: '8.1K',  trend: '↓ Missed', trendUp: false },
  { query: 'commercial painters austin',          intent: 'Commercial',    cited: false, aiVol: '7.2K',  trend: '↓ Missed', trendUp: false },
];

interface CitationItem {
  icon: string;
  title: string;
  type: string;
  date: string;
  platforms: string;
  citations: number;
}

const CITATION_ITEMS: CitationItem[] = [
  { icon: '🎨', title: 'The complete guide to hiring a painter in Austin (2026)',    type: 'Blog',    date: 'Mar 18', platforms: 'ChatGPT',              citations: 18 },
  { icon: '🏠', title: 'Cabinet refinishing vs replacement — Austin cost guide',     type: 'Blog',    date: 'Apr 2',  platforms: 'ChatGPT',              citations: 11 },
  { icon: '✅', title: '7 things to look for when hiring an Austin painter',          type: 'Blog',    date: 'Mar 28', platforms: 'ChatGPT',              citations: 9  },
  { icon: '🔍', title: 'CertaPro Painters of Austin — services & service area',       type: 'Landing', date: 'Apr 10', platforms: 'Google AI Overviews',  citations: 6  },
  { icon: '🌞', title: 'Exterior paint colors that survive Texas heat',               type: 'Blog',    date: 'Apr 7',  platforms: 'Google AI Overviews',  citations: 3  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────

/** Maps a query-intent label to a StatusPill tone. Used in the AEO Analytics
 *  table to color-code intent column cells. Yellow/orange tones are not used
 *  in tables — Commercial sits on neutral instead of warning. */
function intentTone(intent: QueryIntent): StatusPillTone {
  switch (intent) {
    case 'Commercial':    return 'neutral';
    case 'Informational': return 'info';
    case 'Navigational':  return 'accent';
    case 'Comparison':    return 'success';
  }
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────

function AutoPublishToggle() {
  const [on, setOn] = useState(false);
  return (
    <Toggle checked={on} onChange={setOn} tone="success">
      Auto-publish
    </Toggle>
  );
}

/** Topic filters live behind a Filter button. Click to open a popover with
 *  the cluster checkboxes; the active filter's label collapses onto the
 *  button so the toolbar stays scannable. */
function ClusterFilterChips({ active, onChange }: { active: ClusterFilter; onChange: (k: ClusterFilter) => void }) {
  const [open, setOpen] = useState(false);
  const activeFilter = CLUSTER_FILTERS.find((f) => f.key === active) ?? CLUSTER_FILTERS[0];

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <Button
        variant="tertiary"
        size="sm"
        frontIcon={Filter}
        onPress={() => setOpen((v) => !v)}
      >
        {activeFilter.key === 'all' ? 'All topics' : activeFilter.label} · {activeFilter.count}
      </Button>
      {open && (
        <>
          {/* Click-away catcher */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          />
          <div
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              zIndex: 11,
              minWidth: 280,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-4)',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              padding: 4,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {CLUSTER_FILTERS.map((f) => {
              const selected = f.key === active;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => { onChange(f.key); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12,
                    padding: '8px 12px',
                    background: selected ? 'var(--dark-4)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--dark-2)'; }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Text variant="secondary" style={{ color: 'var(--dark-90)', fontWeight: selected ? 500 : 400 }}>
                    {f.key === 'all' ? 'All topics' : f.label}
                  </Text>
                  <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>{f.count}</Text>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function AeoBadge({ label }: { label: string }) {
  return <StatusPill tone="success" size="sm">{label}</StatusPill>;
}


// ─── DASHBOARD MODALS ─────────────────────────────────────────────────

/** Local modal chrome. The lib's `<Modal.Root>` is designed to be rendered
 *  through the `openModal()` stack API; using it inline skips the portal
 *  that mounts the dark backdrop. To keep the simple conditional-render
 *  pattern (`{activeModal === 'x' && <XModal onClose={...} />}`) we render
 *  our own backdrop + container here, then nest `<Modal.Header>` /
 *  `<Modal.Content>` / `<Modal.Footer>` inside for the standard chrome. */
const MODAL_WIDTHS: Record<'sm' | 'md' | 'lg' | 'fullscreen', number | string> = {
  sm: 480,
  md: 680,
  lg: 920,
  fullscreen: 'calc(100vw - 48px)',
};

function ModalBackdrop({
  onClose,
  size = 'md',
  children,
}: {
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'var(--light-100)',
          borderRadius: 12,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.18)',
          maxHeight: 'calc(100vh - 48px)',
          width: MODAL_WIDTHS[size],
          maxWidth: 'calc(100vw - 48px)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── SHARED: structure settings data + primitives ─────────────────────

const STRUCTURE_IMPACT_PLATFORMS = ['Google', 'ChatGPT', 'Gemini'];

const STRUCTURE_IMPACTS: Record<string, Record<string, { dots: number; label: string; color: string }>> = {
  structure: {
    Google:     { dots: 3, label: 'High', color: 'var(--green-50)' },
    ChatGPT:    { dots: 3, label: 'High', color: 'var(--green-50)' },
    Perplexity: { dots: 2, label: 'Med',  color: 'var(--orange-70)' },
    Gemini:     { dots: 2, label: 'Med',  color: 'var(--orange-70)' },
  },
  faq: {
    Google:     { dots: 2, label: 'Med',  color: 'var(--orange-70)' },
    ChatGPT:    { dots: 3, label: 'High', color: 'var(--green-50)' },
    Perplexity: { dots: 3, label: 'High', color: 'var(--green-50)' },
    Gemini:     { dots: 2, label: 'Med',  color: 'var(--orange-70)' },
  },
  schema: {
    Google:     { dots: 3, label: 'High', color: 'var(--green-50)' },
    ChatGPT:    { dots: 1, label: 'Low',  color: 'var(--dark-40)' },
    Perplexity: { dots: 1, label: 'Low',  color: 'var(--dark-40)' },
    Gemini:     { dots: 2, label: 'Med',  color: 'var(--orange-70)' },
  },
};

function RadioOption({ checked, onSelect, label, sublabel }: { checked: boolean; onSelect: () => void; label: string; sublabel?: string }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
        padding: '12px 14px',
        border: `1px solid ${checked ? 'var(--dark-90)' : 'var(--dark-4)'}`,
        borderRadius: 10,
        cursor: 'pointer',
        background: checked ? 'var(--light-100)' : 'var(--dark-4)',
        flex: 1,
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{label}</div>
      {sublabel && <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>{sublabel}</div>}
    </button>
  );
}

function StructureSettingsContent({
  structure, setStructure,
  faq, setFaq,
  schema, setSchema,
}: {
  structure: 'answer-first' | 'traditional';
  setStructure: (v: 'answer-first' | 'traditional') => void;
  faq: 'end' | 'inline' | 'off';
  setFaq: (v: 'end' | 'inline' | 'off') => void;
  schema: 'both' | 'faq-only' | 'none';
  setSchema: (v: 'both' | 'faq-only' | 'none') => void;
}) {
  const settingImpactMap: Record<string, typeof STRUCTURE_IMPACTS.structure> = {
    'Post structure': STRUCTURE_IMPACTS.structure,
    'FAQ blocks':     STRUCTURE_IMPACTS.faq,
    'Schema markup':  STRUCTURE_IMPACTS.schema,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Post structure */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Text variant="primary" style={{ fontWeight: 500, color: 'var(--dark-90)' }}>Post structure</Text>
          <StatusPill tone="success" size="sm">Recommended: Answer-First</StatusPill>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <RadioOption checked={structure === 'answer-first'} onSelect={() => setStructure('answer-first')} label="Answer-First (BLUF)" sublabel="Lead with the direct answer, then elaborate. AI engines pull from the first 2–3 sentences." />
          <RadioOption checked={structure === 'traditional'} onSelect={() => setStructure('traditional')} label="Traditional Intro" sublabel="Context-setting opening paragraph before the main point." />
        </div>
      </div>

      {/* FAQ block placement */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Text variant="primary" style={{ fontWeight: 500, color: 'var(--dark-90)' }}>FAQ block placement</Text>
          <StatusPill tone="success" size="sm">Recommended: End of post</StatusPill>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <RadioOption checked={faq === 'end'} onSelect={() => setFaq('end')} label="End of post" sublabel="FAQ section after main content — cleanest for Google FAQ schema." />
          <RadioOption checked={faq === 'inline'} onSelect={() => setFaq('inline')} label="Inline throughout" sublabel="Q&A blocks after each section. Higher AI citation rate, more editorial." />
          <RadioOption checked={faq === 'off'} onSelect={() => setFaq('off')} label="Off" sublabel="No FAQ blocks. Not recommended — loses AEO signal." />
        </div>
      </div>

      {/* Structured data */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Text variant="primary" style={{ fontWeight: 500, color: 'var(--dark-90)' }}>Structured data (schema markup)</Text>
          <StatusPill tone="success" size="sm">Recommended: FAQ + HowTo</StatusPill>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <RadioOption checked={schema === 'both'} onSelect={() => setSchema('both')} label="FAQ + HowTo Schema" sublabel="Adds both schema types. Maximizes rich result eligibility." />
          <RadioOption checked={schema === 'faq-only'} onSelect={() => setSchema('faq-only')} label="FAQ Schema only" sublabel="Adds FAQ structured data. Good baseline." />
          <RadioOption checked={schema === 'none'} onSelect={() => setSchema('none')} label="None" sublabel="No schema markup. Not recommended." />
        </div>
      </div>

      {/* Ranking impact table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Heading level={3} style={{ display: 'block' }}>Ranking impact of your current settings</Heading>
        <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--dark-60)', borderBottom: '1px solid var(--dark-4)', whiteSpace: 'nowrap', width: '34%' }}>Setting</th>
                {STRUCTURE_IMPACT_PLATFORMS.map((p) => (
                  <th key={p} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 400, fontSize: 12, color: 'var(--dark-60)', borderBottom: '1px solid var(--dark-4)', whiteSpace: 'nowrap' }}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(settingImpactMap).map(([label, imp]) => (
                <tr key={label}>
                  <td style={{ padding: '14px 12px', fontSize: 14, color: 'var(--dark-90)', borderBottom: '1px solid var(--dark-4)' }}>{label}</td>
                  {STRUCTURE_IMPACT_PLATFORMS.map((p) => (
                    <td key={p} style={{ padding: '14px 12px', textAlign: 'center', fontSize: 14, color: 'var(--dark-60)', borderBottom: '1px solid var(--dark-4)' }}>
                      {imp[p].label}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ConfigureModal({ onClose }: { onClose: () => void }) {
  const [structure, setStructure] = useState<'answer-first' | 'traditional'>('answer-first');
  const [faq, setFaq] = useState<'end' | 'inline' | 'off'>('end');
  const [schema, setSchema] = useState<'both' | 'faq-only' | 'none'>('both');

  const settingImpactMap: Record<string, typeof STRUCTURE_IMPACTS.structure> = {
    'Post structure': STRUCTURE_IMPACTS.structure,
    'FAQ blocks':     STRUCTURE_IMPACTS.faq,
    'Schema markup':  STRUCTURE_IMPACTS.schema,
  };
  void settingImpactMap;

  return (
    <ModalBackdrop onClose={onClose} size="md">
      <Modal.Header
        title="Answer-First Structure & FAQ Blocks"
        headingLevel={4}
        onClose={onClose}
        subHeader={
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            Choose how Blaze structures every generated post. These settings affect how often you get cited by both Google and AI search engines.
          </Text>
        }
      />
      <Modal.Content compact={false}>
        <StructureSettingsContent
          structure={structure} setStructure={setStructure}
          faq={faq} setFaq={setFaq}
          schema={schema} setSchema={setSchema}
        />
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent>
          <Modal.FooterButton variant="ghost" onPress={onClose}>Cancel</Modal.FooterButton>
          <Modal.FooterButton variant="primary" onPress={onClose}>Apply to All Posts</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </ModalBackdrop>
  );
}

function SetupModal({ onClose }: { onClose: () => void }) {
  const discrepancies = [
    {
      field: 'Business name',
      status: 'error',
      values: [
        { platform: 'Website', value: 'CertaPro Painters of Austin', ok: true },
        { platform: 'Google Business', value: 'CertaPro Painters Austin', ok: false },
        { platform: 'LinkedIn', value: 'CertaPro Austin TX', ok: false },
        { platform: 'Yelp', value: 'CertaPro Painters of Austin', ok: true },
      ],
      note: 'Inconsistent name signals confuse entity matching. Use exact same string everywhere.',
      editLinks: [
        { platform: 'Google Business', href: '#' },
        { platform: 'LinkedIn', href: '#' },
      ],
    },
    {
      field: 'Brand description',
      status: 'warning',
      values: [
        { platform: 'Website', value: '142 words — comprehensive', ok: true },
        { platform: 'Google Business', value: '28 words — too short', ok: false },
        { platform: 'LinkedIn', value: '95 words — good', ok: true },
        { platform: 'Yelp', value: '12 words — too short', ok: false },
      ],
      note: 'Short descriptions reduce AI engine confidence in brand identity. Aim for 80–120 words.',
      editLinks: [
        { platform: 'Google Business', href: '#' },
        { platform: 'Yelp', href: '#' },
      ],
    },
    {
      field: 'Service categories',
      status: 'warning',
      values: [
        { platform: 'Website', value: 'Interior painting, Exterior painting, Cabinet refinishing', ok: true },
        { platform: 'Google Business', value: 'Painter', ok: false },
        { platform: 'LinkedIn', value: 'Painting contractor & cabinet refinishing', ok: true },
        { platform: 'Yelp', value: 'Painters', ok: false },
      ],
      note: 'Category labels affect how AI engines classify you. Align with your primary keyword clusters.',
      editLinks: [
        { platform: 'Google Business', href: '#' },
        { platform: 'Yelp', href: '#' },
      ],
    },
    {
      field: 'Phone number',
      status: 'ok',
      values: [
        { platform: 'Website', value: '(512) 323-9502', ok: true },
        { platform: 'Google Business', value: '(512) 323-9502', ok: true },
        { platform: 'LinkedIn', value: '(512) 323-9502', ok: true },
        { platform: 'Yelp', value: '(512) 323-9502', ok: true },
      ],
      note: '',
      editLinks: [],
    },
  ];

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'error') return <span style={{ fontSize: 15, color: 'var(--red-50)' }}>✕</span>;
    if (status === 'warning') return <span style={{ fontSize: 15, color: 'var(--orange-70)' }}>⚠</span>;
    return <span style={{ fontSize: 15, color: 'var(--green-50)' }}>✓</span>;
  };

  const errorCount = discrepancies.filter((d) => d.status === 'error').length;
  const warnCount = discrepancies.filter((d) => d.status === 'warning').length;

  return (
    <ModalBackdrop onClose={onClose} size="md">
      <Modal.Header
        title="Entity Profile & Brand Consistency"
        headingLevel={4}
        onClose={onClose}
        subHeader={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              Blaze found mismatches across your platforms. Fix these to help AI engines reliably identify CertaPro Painters of Austin as a single authoritative entity.
            </Text>
            <div style={{ display: 'flex', gap: 8 }}>
              <StatusPill tone="danger" size="sm">{errorCount} error{errorCount !== 1 ? 's' : ''}</StatusPill>
              <StatusPill tone="warning" size="sm">{warnCount} warning{warnCount !== 1 ? 's' : ''}</StatusPill>
            </div>
          </div>
        }
      />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {discrepancies.map((d) => (
            <div key={d.field} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Title + status icon outside the bordered card; bulb note
                  becomes a subheading underneath. */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusIcon status={d.status} />
                <Text variant="primary" style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{d.field}</Text>
                {d.status === 'ok' && <Text variant="metadata" style={{ color: 'var(--green-50)' }}>All platforms match</Text>}
              </div>
              {d.note && (
                <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.5 }}>
                  {d.note}
                </Text>
              )}
              {d.status !== 'ok' && (
                <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {d.values.map((v) => (
                      <div key={v.platform} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--dark-4)' }}>
                        <span style={{ fontSize: 12, color: v.ok ? 'var(--green-50)' : 'var(--orange-70)', marginTop: 1 }}>{v.ok ? '✓' : '⚠'}</span>
                        <div>
                          <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)' }}>{v.platform}</Text>
                          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)', marginTop: 2, fontStyle: v.ok ? 'normal' : 'italic' }}>{v.value}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {d.editLinks.map((link) => (
                      <a key={link.platform} href={link.href} style={{ fontSize: 12, color: 'var(--dark-90)', background: 'var(--dark-4)', borderRadius: 6, padding: '5px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Edit on {link.platform} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent>
          <Modal.FooterButton variant="ghost" onPress={onClose}>Close</Modal.FooterButton>
          <Modal.FooterButton variant="primary">Copy canonical brand profile</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </ModalBackdrop>
  );
}

function ViewPostModal({ row, onClose }: { row: ContentRow | null; onClose: () => void }) {
  const [activePanel, setActivePanel] = useState<'actions' | 'metadata' | 'comments'>('actions');

  const title = row?.title ?? 'The 7 best painters in Austin for 2026';
  const score = 83;

  const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const start = { x: cx + r * Math.cos(toRad(startDeg)), y: cy + r * Math.sin(toRad(startDeg)) };
    const end = { x: cx + r * Math.cos(toRad(endDeg)), y: cy + r * Math.sin(toRad(endDeg)) };
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  };

  // `sections` and `improveActions` use real lib icons rendered at size 16.
  // (No Sparkle/Ruler icons in the lib at any size; Stars and File02 are the
  // closest matches for ✨ and 📏 respectively.)
  const sections: { label: string; Icon: typeof BarChart }[] = [
    { label: 'SEO Analysis',              Icon: BarChart },
    { label: 'Check for Plagiarism',      Icon: Search },
    { label: 'Configure Blog Metadata',   Icon: Settings },
    { label: 'Copy Text to Clipboard',    Icon: Copy },
    { label: 'Download Post Media Only',  Icon: Download },
  ];

  const improveActions: { label: string; Icon: typeof Stars }[] = [
    { label: 'Improve Quality', Icon: Stars },
    { label: 'Edit Tone',       Icon: Microphone },
    { label: 'Change Length',   Icon: File02 },
  ];

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{ width: 960, display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>

        {/* Editor top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--dark-4)', background: 'var(--light-100)', borderRadius: '16px 16px 0 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 4, marginRight: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28CA41' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--dark-80)', fontWeight: 500, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
            <StatusPill tone="warning" size="sm">Scheduled</StatusPill>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button variant="tertiary" size="xs" frontIcon={LinkAngled}>Connect to a blog</Button>
            <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>Fri, May 22 6:14pm</Text>
            <IconButton icon={Close} variant="ghost" onPress={onClose} aria-label="Close" />
          </div>
        </div>

        {/* Formatting toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: '1px solid var(--dark-4)', background: 'var(--light-100)', flexShrink: 0 }}>
          {['Title ▾', 'Bullets', 'Numbered', 'Indent', 'Align', 'A', '/ Callout ▾', '"Quote ▾', '≡ ▾'].map((t) => (
            <button key={t} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--dark-60)', fontFamily: 'inherit', padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>{t}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ background: 'var(--dark-4)', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--dark-80)', fontFamily: 'inherit', padding: '5px 10px', borderRadius: 6, fontWeight: 500 }}>⊞ Elements</button>
          </div>
        </div>

        {/* Body: editor + sidebar */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left: blog post editor */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0', background: 'var(--light-100)' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 48px' }}>
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                <File02 size={16} color="var(--dark-60)" />
                <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>Blog Post</Text>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.25, color: 'var(--dark-90)', marginBottom: 20, fontFamily: 'Georgia, serif' }}>{title}</h1>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--dark-80)', marginBottom: 24 }}>
                Hiring a painter in Austin is more than picking the lowest bid. The right crew balances prep work, paint quality, and clear communication — and the wrong one can leave you with peeling trim a year later. This guide walks through the seven painters Austin homeowners recommend most, what each one is known for, and how to pick the right fit for your project.
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark-90)', marginBottom: 16, fontFamily: 'Georgia, serif' }}>Choosing the right Austin painter</h2>
              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
                <div style={{ background: 'linear-gradient(135deg, #c9633a 0%, #d6a86b 100%)', height: 180, display: 'flex', alignItems: 'flex-end', padding: 20 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--light-100)', lineHeight: 1.2, marginBottom: 4 }}>Best painters in Austin</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Vetted local pros for interior, exterior, and cabinets.</div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--dark-80)', marginBottom: 16 }}>
                Not every painter is the right fit for every job. Whether you're refinishing a kitchen, repainting a stucco exterior, or running an HOA repaint project, the right crew balances prep, communication, and finish quality. Here's what to look for before you sign.
              </p>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark-90)', marginBottom: 10 }}>Top picks for Austin in 2026</h3>
              <ul style={{ paddingLeft: 20, lineHeight: 2, color: 'var(--dark-80)', fontSize: 15 }}>
                <li>CertaPro Painters of Austin — best for residential + HOA repaints</li>
                <li>Five Star Painting of South Austin — best for interior repaints</li>
                <li>Paper Moon Painting — best for color consultation</li>
              </ul>

              {/* Ask Blaze bar */}
              <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--dark-4)', border: '1px solid var(--dark-4)', borderRadius: 10, padding: '10px 14px' }}>
                <input placeholder="Ask Blaze to edit or generate..." style={{ flex: 1, border: 'none', background: 'none', fontSize: 13, color: 'var(--dark-80)', outline: 'none', fontFamily: 'inherit' }} readOnly />
                <IconButton icon={Send} variant="primary" size="xs" aria-label="Send to Blaze" />
              </div>
            </div>
          </div>

          {/* Right: actions sidebar */}
          <div style={{ width: 240, borderLeft: '1px solid var(--dark-4)', overflow: 'auto', background: 'var(--light-100)', flexShrink: 0 }}>
            {/* Panel tabs */}
            <Tabs.Root value={activePanel} onChange={(v) => setActivePanel(v as typeof activePanel)} style={{ borderBottom: '1px solid var(--dark-4)' }}>
              <Tabs.Tab value="actions" style={{ flex: 1 }}>Actions</Tabs.Tab>
              <Tabs.Tab value="metadata" style={{ flex: 1 }}>Metadata</Tabs.Tab>
              <Tabs.Tab value="comments" style={{ flex: 1 }}>Comments</Tabs.Tab>
            </Tabs.Root>

            {activePanel === 'actions' && (
              <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-60)', marginBottom: 12 }}>Prepare to publish</div>
                  {/* SEO Score gauge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
                    <svg width="120" height="70" viewBox="0 0 120 70">
                      <path d={describeArc(60, 60, 44, 180, 360)} fill="none" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="10" strokeLinecap="round" />
                      <path d={describeArc(60, 60, 44, 180, 180 + (score / 100) * 180)} fill="none" style={{ stroke: score >= 80 ? 'var(--green-50)' : score >= 60 ? 'var(--orange-70)' : 'var(--red-50)' }} strokeWidth="10" strokeLinecap="round" />
                      <text x="60" y="58" textAnchor="middle" fontSize="20" fontWeight="800" style={{ fill: 'var(--dark-90)' }}>{score}</text>
                      <text x="60" y="70" textAnchor="middle" fontSize="8" style={{ fill: 'var(--dark-60)' }}>Content SEO Score</text>
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: 100, marginTop: -4, fontSize: 10, color: 'var(--dark-40)' }}>
                      <span>0</span><span>Suggested 1</span><span>100</span>
                    </div>
                  </div>
                  {sections.map((s) => {
                    const Icon = s.Icon;
                    return (
                      <button key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '7px 4px', color: 'var(--dark-80)', fontFamily: 'inherit', textAlign: 'left', borderRadius: 6 }}>
                        <Icon size={16} /> <Text variant="metadata" style={{ color: 'var(--dark-80)' }}>{s.label}</Text>
                      </button>
                    );
                  })}
                </div>
                <div>
                  <Text variant="metadata" style={{ display: 'block', fontWeight: 700, color: 'var(--dark-60)', marginBottom: 8 }}>Improve your content</Text>
                  {improveActions.map((a) => {
                    const Icon = a.Icon;
                    return (
                      <button key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '7px 4px', color: 'var(--dark-80)', fontFamily: 'inherit', textAlign: 'left', borderRadius: 6 }}>
                        <Icon size={16} /> <Text variant="metadata" style={{ color: 'var(--dark-80)' }}>{a.label}</Text>
                      </button>
                    );
                  })}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-60)', marginBottom: 8 }}>What last happened</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--dark-60)', alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--dark-15)', marginTop: 4, flexShrink: 0 }} />
                    <div>You made 1 edit <span style={{ color: 'var(--dark-40)' }}>May 19, 2026</span></div>
                  </div>
                  <Button variant="tertiary" size="xs" style={{ marginTop: 8 }}>History</Button>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-60)', marginBottom: 8 }}>Doc info</div>
                  {[['Owner', 'John Bunnell'], ['Created', 'Today at 6:14pm'], ['Updated', 'Today at 10:37pm']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: 'var(--dark-60)' }}>{k}</span>
                      <span style={{ color: 'var(--dark-80)', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activePanel === 'metadata' && (
              <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--dark-60)' }}>Configure SEO title, meta description, slug, and featured image for this post.</div>
            )}
            {activePanel === 'comments' && (
              <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--dark-60)' }}>No comments yet.</div>
            )}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─── SETUP CHECKLIST ─────────────────────────────────────────────────

/** Persistent setup banner shown at the top of the page (above tabs) until
 *  all steps are complete. Steps are: connect blog → configure structure →
 *  fix profile inconsistencies. */
function SetupChecklist({ onLearnMore, onConfigureStructure, onFixProfile, onConnectBlog }: {
  onLearnMore: () => void;
  onConfigureStructure: () => void;
  onFixProfile: () => void;
  onConnectBlog: () => void;
}) {
  const steps = [
    {
      num: 1,
      title: 'Learn more about how blog works',
      desc: 'See how Blaze writes and publishes posts that rank on Google and get cited by AI engines.',
      action: onLearnMore,
    },
    {
      num: 2,
      title: 'Set your posting frequency',
      desc: 'Choose how many posts per week and which days they go live.',
      action: onConfigureStructure,
    },
    {
      num: 3,
      title: 'Connect accounts to publish and get insights',
      desc: 'Link your blog and analytics accounts so Blaze can publish automatically and track performance.',
      action: onConnectBlog,
    },
  ];

  return (
    <div style={{ borderRadius: 12, background: 'var(--dark-2)', border: '1px solid var(--dark-4)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--dark-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} color="var(--status-connect)" />
          <Text variant="secondary" style={{ fontWeight: 500, color: 'var(--dark-90)' }}>
            Complete setup before Blaze can generate content · 3 steps remaining
          </Text>
        </div>
        <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
          Under 5 minutes total
        </Text>
      </div>
      {steps.map((step, i) => (
        <button
          key={step.num}
          type="button"
          onClick={step.action}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: i < steps.length - 1 ? '1px solid var(--dark-4)' : 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
            width: '100%',
            transition: 'background-color 120ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dark-4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Text variant="metadata" style={{ color: 'var(--dark-40)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: 16 }}>
            {step.num}.
          </Text>
          <Text variant="secondary" style={{ color: 'var(--dark-90)', fontWeight: 500, flexShrink: 0 }}>
            {step.title}
          </Text>
          <Text variant="metadata" style={{ color: 'var(--dark-60)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {step.desc}
          </Text>
          <ArrowRight size={16} color="var(--dark-40)" />
        </button>
      ))}
    </div>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────

function AddKeywordRow({ tdStyle, onAdd }: { tdStyle: React.CSSProperties; onAdd: () => void }) {
  return (
    <tr style={{ background: 'var(--dark-2)' }}>
      <td style={{ ...tdStyle, borderBottom: '1px solid var(--dark-4)' }} />
      <td colSpan={5} style={{ ...tdStyle, borderBottom: '1px solid var(--dark-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="secondary" size="sm" frontIcon={Plus} onPress={onAdd}>
            Add a keyword
          </Button>
        </div>
      </td>
    </tr>
  );
}

/** Row "..." menu — Post Now / Mark as Posted, shown on Review rows. */
function RowMoreMenu({ onPostNow, onMarkPosted }: { onPostNow: () => void; onMarkPosted: () => void }) {
  const [open, setOpen] = useState(false);
  const items: { label: string; action: () => void }[] = [
    { label: 'Post Now', action: onPostNow },
    { label: 'Mark as Posted', action: onMarkPosted },
  ];
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <IconButton icon={MoreDots} variant="ghost" size="sm" aria-label="More actions" onPress={() => setOpen((v) => !v)} />
      {open && (
        <>
          <span onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 21, minWidth: 160, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', padding: 4, display: 'flex', flexDirection: 'column' }}>
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                onClick={() => { setOpen(false); it.action(); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: 'var(--dark-90)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dark-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </span>
  );
}

/** Hover tooltip wrapper — used to explain disabled actions. */
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span style={{ position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, whiteSpace: 'nowrap', background: 'var(--dark-90)', color: 'var(--light-100)', fontSize: 12, lineHeight: 1.4, padding: '6px 8px', borderRadius: 6, zIndex: 30, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}>
          {label}
        </span>
      )}
    </span>
  );
}

/** Credit cost shown inline on generate/regenerate actions. */
function CreditBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6, color: 'var(--dark-60)' }}>
      <Stars size={14} color="var(--dark-60)" />16
    </span>
  );
}

/** Small drag-handle affordance shown at the left of a reorderable row. */
function DragHandle({ visible }: { visible: boolean }) {
  return (
    <span style={{ width: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', opacity: visible ? 1 : 0, transition: 'opacity 120ms', flexShrink: 0 }}>
      <GrabHandle size={14} color="var(--dark-40)" />
    </span>
  );
}

function ClusterTableRow({
  group,
  clusterNum,
  expanded,
  onToggle,
  tdStyle,
  onViewPost,
  onAddKeyword,
  onDragStart,
  onDrop,
  onDelete,
  onMarkPosted,
  onPostDragStart,
  onPostDrop,
  onPostDelete,
  onPostMarkPosted,
}: {
  group: ClusterGroup;
  clusterNum: number;
  expanded: boolean;
  onToggle: () => void;
  tdStyle: React.CSSProperties;
  onViewPost: () => void;
  onAddKeyword: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  onDelete: () => void;
  onMarkPosted: () => void;
  onPostDragStart: (index: number) => void;
  onPostDrop: (index: number) => void;
  onPostDelete: (index: number) => void;
  onPostMarkPosted: (index: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const postCount = group.posts.length + 1; // +1 for the seed post
  const locked = isLocked(group.status);

  return (
    <>
      {/* Cluster header row */}
      <tr
        draggable={!locked}
        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text', ''); onDragStart(); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onDrop(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onToggle}
        style={{ cursor: 'pointer', background: hovered ? 'var(--dark-2)' : 'var(--light-100)' }}
      >
        <td style={{ ...tdStyle, color: 'var(--dark-40)', verticalAlign: 'middle' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <DragHandle visible={hovered && !locked} />
            <ChevronDown
              size={14}
              color="var(--dark-40)"
              style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms', flexShrink: 0 }}
            />
            {clusterNum}
          </div>
        </td>
        <td style={tdStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text variant="secondary" style={{ fontWeight: 600, color: 'var(--dark-90)' }}>{group.cluster}</Text>
                <StatusPill tone="neutral" size="sm">Cluster</StatusPill>
              </div>
              <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
                "{group.seedKeyword}" · {postCount} posts{group.status !== 'Posted' ? ' · Publish first to generate keyword posts' : ''}
              </Text>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: hovered ? 1 : 0, transition: 'opacity 120ms', flexShrink: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {!locked && (
                <IconButton icon={Trash2} variant="ghost" size="sm" aria-label="Delete cluster" onPress={onDelete} />
              )}
              {group.status === 'Review' && (
                <RowMoreMenu onPostNow={onMarkPosted} onMarkPosted={onMarkPosted} />
              )}
              {group.status === 'Queued'
                ? <Button size="sm" variant="secondary">Generate Post<CreditBadge /></Button>
                : <Button size="sm" variant="secondary" endIcon={ArrowRight} onPress={onViewPost}>View Post</Button>}
            </div>
          </div>
        </td>
        <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: 'var(--dark-60)' }}>{group.seedSearchVol}</span>
          <span style={{ color: 'var(--dark-15)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'var(--dark-90)' }}>{group.seedAiVol}</span>
        </td>
        <td style={{ ...tdStyle, color: 'var(--dark-40)' }}>—</td>
        <td style={{ ...tdStyle, color: 'var(--dark-60)' }}>{group.firstScheduled}</td>
        <td style={tdStyle}>
          <StatusPillFor status={group.status} />
        </td>
      </tr>

      {/* Child post rows */}
      {expanded && group.posts.map((post, i) => (
        <PostChildRow
          key={post.keyword}
          post={post}
          index={i + 1}
          clusterNum={clusterNum}
          tdStyle={tdStyle}
          pillarPublished={group.status === 'Posted'}
          onView={onViewPost}
          onDragStart={() => onPostDragStart(i)}
          onDrop={() => onPostDrop(i)}
          onDelete={() => onPostDelete(i)}
          onMarkPosted={() => onPostMarkPosted(i)}
        />
      ))}

      {/* Add keyword row */}
      {expanded && (
        <AddKeywordRow tdStyle={tdStyle} onAdd={onAddKeyword} />
      )}
    </>
  );
}

function PostChildRow({
  post,
  index,
  clusterNum,
  tdStyle,
  pillarPublished,
  onView,
  onDragStart,
  onDrop,
  onDelete,
  onMarkPosted,
}: {
  post: PostRow;
  index: number;
  clusterNum: number;
  tdStyle: React.CSSProperties;
  pillarPublished: boolean;
  onView: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  onDelete: () => void;
  onMarkPosted: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = isLocked(post.status);
  const childTd: React.CSSProperties = {
    ...tdStyle,
    borderBottom: '1px solid var(--dark-4)',
    background: hovered ? 'var(--dark-4)' : 'var(--dark-2)',
  };

  return (
    <tr
      draggable={!locked}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text', ''); onDragStart(); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ ...childTd, color: 'var(--dark-40)', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DragHandle visible={hovered && !locked} />
          {clusterNum}.{index}
        </div>
      </td>
      <td style={childTd}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ paddingLeft: 4, minWidth: 0 }}>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)' }}>{post.title}</Text>
            <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
              "{post.keyword}"
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: hovered ? 1 : 0, transition: 'opacity 120ms', flexShrink: 0 }}>
            {!locked && (
              <IconButton icon={Trash2} variant="ghost" size="sm" aria-label="Delete keyword" onPress={onDelete} />
            )}
            {post.status === 'Review' && (
              <RowMoreMenu onPostNow={onMarkPosted} onMarkPosted={onMarkPosted} />
            )}
            {post.status === 'Queued' && (
              pillarPublished
                ? <Button size="sm" variant="secondary">Generate Post<CreditBadge /></Button>
                : (
                  <Tooltip label="Available once the cluster post is published">
                    <Button size="sm" variant="secondary" isDisabled>Generate Post<CreditBadge /></Button>
                  </Tooltip>
                )
            )}
            {(post.status === 'Review' || post.status === 'Posted') && <Button size="sm" variant="secondary" endIcon={ArrowRight} onPress={onView}>View Post</Button>}
            {post.status === 'Failed' && (
              post.failReason === 'generation'
                ? <Button size="sm" variant="secondary" frontIcon={ArrowRefresh}>Regenerate<CreditBadge /></Button>
                : <Button size="sm" variant="secondary" endIcon={ArrowRight}>Repost Now</Button>
            )}
          </div>
        </div>
      </td>
      <td style={{ ...childTd, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: 'var(--dark-60)' }}>{post.searchVol}</span>
        <span style={{ color: 'var(--dark-15)', margin: '0 4px' }}>/</span>
        <span style={{ color: 'var(--dark-90)' }}>{post.aiVol}</span>
      </td>
      <td style={childTd}>
        <StatusPill tone={DIFFICULTY_TONE[post.difficulty]}>{post.difficulty}</StatusPill>
      </td>
      <td style={{ ...childTd, color: 'var(--dark-60)' }}>{post.scheduled}</td>
      <td style={childTd}>
        {post.status === 'Queued' && !pillarPublished ? (
          <Tooltip label="Available once the cluster post is published">
            <StatusPill tone="neutral">Waiting on cluster</StatusPill>
          </Tooltip>
        ) : (
          <StatusPillFor status={post.status} />
        )}
      </td>
    </tr>
  );
}

function DashboardTab({ onLearnMore, onScheduleFrequency, onAddCluster, onOpenAnalytics }: { onLearnMore: () => void; onScheduleFrequency: () => void; onAddCluster: () => void; onOpenAnalytics: (sub: 'seo' | 'aeo') => void }) {
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<'configure' | 'view-post' | 'connect-blog' | null>(null);
  const [addKeywordCluster, setAddKeywordCluster] = useState<TopicCluster | null>(null);
  // First cluster expanded by default so the nested structure is immediately visible
  const [expandedClusters, setExpandedClusters] = useState<Set<TopicCluster>>(
    new Set(['Best Painters in Austin'])
  );

  // Editable copy of the cluster data so rows can be reordered / deleted.
  // Seeded in chronological order (Queued → Review → Posted) for both
  // clusters and the keywords within them; drag can reorder from there.
  const [groups, setGroups] = useState<ClusterGroup[]>(() => {
    const byStatus = <T extends { status: PostStatus }>(arr: T[]) =>
      [...arr].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    return byStatus(CLUSTER_GROUPS).map((g) => ({ ...g, posts: byStatus(g.posts) }));
  });
  // Tracks the row currently being dragged.
  const dragRef = useRef<{ kind: 'cluster' | 'post'; cluster: TopicCluster; index: number } | null>(null);

  function toggleCluster(cluster: TopicCluster) {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      next.has(cluster) ? next.delete(cluster) : next.add(cluster);
      return next;
    });
  }

  function dropOnCluster(toCluster: TopicCluster) {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || d.kind !== 'cluster') return;
    setGroups((prev) => {
      const arr = [...prev];
      const from = arr.findIndex((g) => g.cluster === d.cluster);
      const to = arr.findIndex((g) => g.cluster === toCluster);
      if (from < 0 || to < 0 || from === to) return prev;
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }

  function dropOnPost(cluster: TopicCluster, toIndex: number) {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || d.kind !== 'post' || d.cluster !== cluster) return;
    setGroups((prev) => prev.map((g) => {
      if (g.cluster !== cluster) return g;
      const posts = [...g.posts];
      if (d.index === toIndex) return g;
      const [moved] = posts.splice(d.index, 1);
      posts.splice(toIndex, 0, moved);
      return { ...g, posts };
    }));
  }

  function deleteCluster(cluster: TopicCluster) {
    setGroups((prev) => prev.filter((g) => g.cluster !== cluster));
  }

  function deletePost(cluster: TopicCluster, index: number) {
    setGroups((prev) => prev.map((g) => (g.cluster === cluster ? { ...g, posts: g.posts.filter((_, i) => i !== index) } : g)));
  }

  function markClusterPosted(cluster: TopicCluster) {
    setGroups((prev) => prev.map((g) => (g.cluster === cluster ? { ...g, status: 'Posted' } : g)));
  }

  function markPostPosted(cluster: TopicCluster, index: number) {
    setGroups((prev) => prev.map((g) => (g.cluster === cluster ? { ...g, posts: g.posts.map((p, i) => (i === index ? { ...p, status: 'Posted' } : p)) } : g)));
  }

  // Table styles — borders use --dark-4 per design spec; cells share one
  // 13px text size and 400 weight unless explicitly bumped (numeric
  // columns get tabular-nums; the title column gets 500 weight).
  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: 400,
    fontSize: 12,
    color: 'var(--dark-60)',
    borderBottom: '1px solid var(--dark-4)',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '14px 12px',
    fontSize: 14,
    fontWeight: 400,
    color: 'var(--dark-90)',
    borderBottom: '1px solid var(--dark-4)',
    verticalAlign: 'middle',
  };

  return (
    <div style={{ padding: '24px 28px 80px', maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

      <SetupChecklist
        onLearnMore={onLearnMore}
        onConnectBlog={() => setActiveModal('connect-blog')}
        onConfigureStructure={onScheduleFrequency}
        onFixProfile={() => navigate('/h2/organic-profile?tab=profile-consistency')}
      />

      {/* 4 insight metric cards — Local SEO card format */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
        {([
          { Ic: BarChart, label: 'Organic traffic',  value: '2,820', unit: '/mo',        delta: '↑ 8%',  foot: 'Growing — typical for month 2', sub: 'seo' },
          { Ic: Search,   label: 'Avg. Google rank', value: '#7.4',  unit: undefined,    delta: '↑ 3.8', foot: 'Improved from #11.2',         sub: 'seo' },
          { Ic: Stars,    label: 'AI citations',     value: '28',    unit: 'this week',  delta: '↑ 8',   foot: 'Your best week yet',          sub: 'aeo' },
        ] as { Ic: typeof BarChart; label: string; value: string; unit?: string; delta: string; foot: string; sub: 'seo' | 'aeo' }[]).map((m) => {
          const Ic = m.Ic;
          return (
            <button
              key={m.label}
              type="button"
              onClick={() => onOpenAnalytics(m.sub)}
              style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'block', width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--dark-60)', display: 'inline-flex', alignItems: 'center', gap: 4, letterSpacing: '0.02em' }}>
                  <Ic size={12} /> {m.label}
                </span>
                <ArrowRight size={14} color="var(--dark-40)" />
              </div>
              <div style={{ fontSize: 26, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.4px', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                {m.value}
                <span style={{ fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: 5, lineHeight: 1, background: 'var(--green-10)', color: 'var(--status-approved)' }}>{m.delta}</span>
                {m.unit && <span style={{ fontSize: 12, color: 'var(--dark-60)', fontWeight: 400 }}>{m.unit}</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dark-40)', marginTop: 4 }}>{m.foot}</div>
            </button>
          );
        })}

        {/* Posts published card — same format, clickable to Settings */}
        <button
          type="button"
          onClick={onScheduleFrequency}
          style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'block', width: '100%' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--dark-60)', display: 'inline-flex', alignItems: 'center', gap: 4, letterSpacing: '0.02em' }}>
              <Send size={12} /> Posts published
            </span>
            <ArrowRight size={14} color="var(--dark-40)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.4px', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            14
            <span style={{ fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: 5, lineHeight: 1, background: 'var(--dark-4)', color: 'var(--dark-60)' }}>4 / wk</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-40)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: '#21759B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'var(--light-100)', flexShrink: 0 }}>W</span>
            www.bestpainter.com
          </div>
        </button>
      </div>

      {/* Section heading + filter live on the same row — filter sits to the
          right of the headline + subtitle stack. */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Heading level={3} style={{ display: 'block' }}>
            Posts Blaze will generate for you
          </Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
            High-AEO-value keywords where CertaPro Austin isn't being cited · 20 posts across 4 topic clusters
          </Text>
        </div>
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={onAddCluster}>
          Add topic cluster
        </Button>
      </div>

      <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 72 }} />
            <col />
            <col style={{ width: 140 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 160 }} />
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Cluster / keyword</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Search / AI vol.</th>
              <th style={thStyle}>Difficulty</th>
              <th style={thStyle}>Scheduled</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, i) => (
              <ClusterTableRow
                key={group.cluster}
                group={group}
                clusterNum={i + 1}
                expanded={expandedClusters.has(group.cluster)}
                onToggle={() => toggleCluster(group.cluster)}
                tdStyle={tdStyle}
                onViewPost={() => setActiveModal('view-post')}
                onAddKeyword={() => setAddKeywordCluster(group.cluster)}
                onDragStart={() => { dragRef.current = { kind: 'cluster', cluster: group.cluster, index: i }; }}
                onDrop={() => dropOnCluster(group.cluster)}
                onDelete={() => deleteCluster(group.cluster)}
                onMarkPosted={() => markClusterPosted(group.cluster)}
                onPostDragStart={(idx) => { dragRef.current = { kind: 'post', cluster: group.cluster, index: idx }; }}
                onPostDrop={(idx) => dropOnPost(group.cluster, idx)}
                onPostDelete={(idx) => deletePost(group.cluster, idx)}
                onPostMarkPosted={(idx) => markPostPosted(group.cluster, idx)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {activeModal === 'connect-blog' && <ConnectBlogModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'configure' && <ConfigureModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'view-post' && <ViewPostModal row={null} onClose={() => setActiveModal(null)} />}
      {addKeywordCluster && <AddKeywordsModal cluster={addKeywordCluster} onClose={() => setAddKeywordCluster(null)} />}
    </div>
  );
}

// ─── ANALYTICS TAB ───────────────────────────────────────────────────

function SparklineSvg() {
  return (
    <svg width="100%" height="56" viewBox="0 0 300 56" preserveAspectRatio="none" style={{ display: 'block' }}>
      <polyline
        points="0,48 30,44 60,40 90,36 120,32 150,28 180,22 210,18 240,12 270,8 300,4"
        fill="none"
        style={{ stroke: 'var(--purple)' }}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points="0,48 30,44 60,40 90,36 120,32 150,28 180,22 210,18 240,12 270,8 300,4 300,56 0,56"
        fill="rgba(124, 92, 252, 0.07)"
        strokeWidth="0"
      />
    </svg>
  );
}

function MetricCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, padding: '18px 20px', background: 'var(--light-100)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {children}
    </div>
  );
}

/** Simple key/value bullet list used inside MetricCards — replaces the
 *  previous mix of colored progress bars and StatusPills with a single,
 *  consistent layout that reduces color noise. */
function BulletList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item) => (
        <li key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>{item.label}</Text>
          <Text variant="metadata" style={{ color: 'var(--dark-90)' }}>{item.value}</Text>
        </li>
      ))}
    </ul>
  );
}

function AnalyticsTab() {
  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: 400,
    fontSize: 12,
    color: 'var(--dark-60)',
    borderBottom: '1px solid var(--dark-4)',
    whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '11px 12px',
    fontSize: 13,
    color: 'var(--dark-90)',
    borderBottom: '1px solid var(--dark-4)',
    verticalAlign: 'middle',
  };

  return (
    <div style={{ padding: '24px 28px 80px', maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Caution banner — AEO data is directional */}
      <div style={{ borderRadius: 12, background: 'var(--dark-2)', border: '1px solid var(--dark-4)', padding: '14px 16px', display: 'flex', gap: 12 }}>
        <span style={{ flexShrink: 0, display: 'inline-flex', marginTop: 1 }}>
          <AlertTriangle size={16} color="var(--status-connect)" />
        </span>
        <div>
          <Text variant="secondary" style={{ display: 'block', fontWeight: 500, color: 'var(--dark-90)' }}>
            AEO is a rapidly evolving area — interpret this data with caution
          </Text>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', lineHeight: 1.6, marginTop: 2 }}>
            Blaze uses proven SEO best practices as its foundation, with a small amount of weight given to AEO signals (configurable in Settings). AI engines like ChatGPT and Google AI Overviews are unpredictable. They update their citation behavior frequently and may not always behave the way our data reflects. Treat AEO metrics as directional, not definitive.
          </Text>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>

        {/* 1. AI Share of Voice */}
        <MetricCard>
          <div>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>AI Share of Voice</Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 400, color: 'var(--dark-90)', lineHeight: 1 }}>29%</div>
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>+6 pts vs. last week</Text>
            </div>
          </div>
          <BulletList
            items={[
              { label: 'CertaPro Austin', value: '29%' },
              { label: 'Category avg.', value: '18%' },
            ]}
          />
        </MetricCard>

        {/* 2. Average Position */}
        <MetricCard>
          <div>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>Average Position</Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 400, color: 'var(--dark-90)', lineHeight: 1 }}>2.1</div>
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>+0.4 vs. last week</Text>
            </div>
          </div>
          <BulletList
            items={[
              { label: 'ChatGPT', value: '#1' },
              { label: 'Google AI', value: '#2' },
            ]}
          />
        </MetricCard>

        {/* 3. Citations this week */}
        <MetricCard>
          <div>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>Citations this week</Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 400, color: 'var(--dark-90)', lineHeight: 1 }}>28</div>
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>+8 vs. last week (20)</Text>
            </div>
          </div>
          <BulletList
            items={[
              { label: 'ChatGPT', value: '17' },
              { label: 'Google AI', value: '11' },
            ]}
          />
        </MetricCard>

        {/* 4. Market Share */}
        <MetricCard>
          <div>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>Market Share</Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 400, color: 'var(--dark-90)', lineHeight: 1 }}>12%</div>
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>+2 pts of AI mentions</Text>
            </div>
          </div>
          <BulletList
            items={[
              { label: 'Category rank', value: '#3' },
              { label: 'Last month', value: '#4' },
            ]}
          />
        </MetricCard>
      </div>

      {/* Sparkline trend chart — title sits outside the bordered card. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={3} style={{ display: 'block' }}>AI Share of Voice trend — 12 weeks</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>CertaPro Austin vs. category average</Text>
          </div>
          <StatusPill tone="accent" size="sm">29% this week</StatusPill>
        </div>
        <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, padding: '18px 20px', background: 'var(--light-100)' }}>
          <SparklineSvg />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <Text variant="metadata" style={{ color: 'var(--dark-40)' }}>Feb 24</Text>
            <Text variant="metadata" style={{ color: 'var(--dark-40)' }}>May 12</Text>
          </div>
        </div>
      </div>

      {/* Competitor Leaderboard — title + Add competitor action sit outside. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={3} style={{ display: 'block' }}>Competitor Leaderboard</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
              AI Share of Voice vs. direct competitors · Austin painting category
            </Text>
          </div>
          <Button size="sm" variant="tertiary" frontIcon={Plus}>Add competitor</Button>
        </div>
        <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 36 }}>#</th>
              <th style={thStyle}>Brand</th>
              <th style={thStyle}>AI Visibility (SoV)</th>
              <th style={thStyle}>Avg. Pos.</th>
              <th style={thStyle}>Citations</th>
              <th style={thStyle}>WoW</th>
              <th style={{ ...thStyle, width: 60 }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {COMPETITORS.map((c) => {
              return (
                <tr key={c.rank}>
                  <td style={{ ...tdStyle, color: c.isYou ? 'var(--purple)' : 'var(--dark-40)', fontWeight: c.isYou ? 700 : 500 }}>
                    {c.rank}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: c.isYou ? 700 : 500 }}>
                    {c.brand}
                    {c.isYou && (
                      <StatusPill tone="accent" size="sm" style={{ marginLeft: 6 }}>You</StatusPill>
                    )}
                  </td>
                  <td style={{ ...tdStyle, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--dark-8)', overflow: 'hidden', maxWidth: 120 }}>
                        <div style={{ width: `${(c.sov / 40) * 100}%`, height: '100%', borderRadius: 4, background: c.isYou ? 'var(--purple)' : 'var(--dark-40)' }} />
                      </div>
                      <Text variant="secondary" style={{ fontWeight: c.isYou ? 600 : 400, color: c.isYou ? 'var(--purple)' : 'var(--dark-90)', minWidth: 32 }}>
                        {c.sovLabel}
                      </Text>
                    </div>
                  </td>
                  <td style={tdStyle}>{c.avgPos}</td>
                  <td style={tdStyle}>{c.citations}</td>
                  <td style={{ ...tdStyle, color: c.wowUp === true ? 'var(--green-50)' : c.wowUp === false ? 'var(--red-70)' : 'var(--dark-40)' }}>
                    {c.wow}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 16, textAlign: 'center', color: c.wowUp === true ? 'var(--green-50)' : c.wowUp === false ? 'var(--red-70)' : 'var(--dark-40)' }}>
                    {c.wowUp === true ? '↑' : c.wowUp === false ? '↓' : '→'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Query Performance + Citation Map — stacked vertically. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Query Performance — title outside the bordered card. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Heading level={3} style={{ display: 'block' }}>Query Performance</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>How CertaPro Austin appears across AI search queries</Text>
          </div>
          <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Query</th>
                <th style={{ ...thStyle, width: 100 }}>Intent</th>
                <th style={{ ...thStyle, width: 60 }}>Cited</th>
                <th style={{ ...thStyle, width: 70, textAlign: 'right' }}>AI Vol.</th>
                <th style={{ ...thStyle, width: 90 }}>Trend</th>
                <th style={{ ...thStyle, width: 90 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {QUERY_ROWS.map((q) => {
                return (
                  <tr key={q.query}>
                    <td style={{ ...tdStyle, fontWeight: 500, }}>{q.query}</td>
                    <td style={tdStyle}>
                      <StatusPill tone={intentTone(q.intent)} size="sm">
                        {q.intent}
                      </StatusPill>
                    </td>
                    <td style={tdStyle}>
                      {q.cited
                        ? <Text variant="secondary" style={{ color: 'var(--green-50)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckSm size={14} /> Yes</Text>
                        : <Text variant="secondary" style={{ color: 'var(--red-70)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Close size={14} /> No</Text>
                      }
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{q.aiVol}</td>
                    <td style={{ ...tdStyle, color: q.trendUp === true ? 'var(--green-50)' : q.trendUp === false ? 'var(--red-70)' : 'var(--dark-40)' }}>
                      {q.trend}
                    </td>
                    <td style={tdStyle}>
                      {q.cited
                        ? <Button size="sm" variant="ghost">View Topics</Button>
                        : <Button size="sm" variant="tertiary">Add Topic Cluster</Button>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        {/* Citation Map — title outside the bordered card. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Heading level={3} style={{ display: 'block' }}>Top Citations Generated</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>Which content is generating AI citations</Text>
          </div>
          <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {CITATION_ITEMS.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: idx < CITATION_ITEMS.length - 1 ? '1px solid var(--dark-4)' : 'none',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="secondary" style={{ fontWeight: 500, display: 'block', color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </Text>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', marginTop: 2 }}>
                    {item.type} · {item.date} · {item.platforms}
                  </Text>
                </div>
                <StatusPill tone="accent" size="sm">{item.citations} citations</StatusPill>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETUP TAB ────────────────────────────────────────────────────────

const SEED_CLUSTERS = [
  { label: 'Best Painters in Austin',         keywords: 42, reason: 'High AI search volume, low citation competition' },
  { label: 'Interior Paint Colors',           keywords: 38, reason: 'Core service — strong entity signal opportunity' },
  { label: 'Cabinet Painting Cost Guide',     keywords: 31, reason: 'Trending upward in AI search in the last 30 days' },
  { label: 'Exterior Painting in Texas Heat', keywords: 24, reason: 'Low difficulty, quick citation wins' },
  { label: 'HOA & Commercial Repaints',       keywords: 19, reason: 'Commercial intent — high conversion value' },
];

const AI_SURFACES = [
  { id: 'chatgpt', label: 'ChatGPT',            desc: 'Via Bing web browsing. Requires Bing indexing.', icon: '✦', color: '#10A37F' },
  { id: 'google',  label: 'Google AI Overviews', desc: 'E-E-A-T + schema signals. Pulls from top 30% of page.', icon: '⬡', color: '#4285F4' },
];

/** Section block for the Settings tab. Title + subtitle sit OUTSIDE the
 *  bordered card so the chrome is just the content. */
function SectionCard({ id, title, subtitle, children }: { id?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <Heading level={3} style={{ display: 'block' }}>{title}</Heading>
        {subtitle && <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>{subtitle}</Text>}
      </div>
      <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, background: 'var(--light-100)', padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn = false }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--dark-4)' }}>
      <div>
        <Text variant="primary" style={{ display: 'block', fontWeight: 500 }}>{label}</Text>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>{desc}</Text>
      </div>
      <Toggle checked={on} onChange={setOn} aria-label={label} />
    </div>
  );
}

const TARGET_COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France'];

/** Target country select — custom popover with a checkmark on the active row. */
function TargetCountrySelect({ onChange }: { onChange?: () => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('United States');
  return (
    <div style={{ position: 'relative', maxWidth: 280 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: 40, border: '1px solid var(--dark-8)', borderRadius: 8, padding: '0 12px', background: 'var(--light-100)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: 'var(--dark-90)' }}
      >
        {value}
        <ChevronDown size={16} color="var(--dark-60)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 21, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', padding: 6, display: 'flex', flexDirection: 'column' }}>
            {TARGET_COUNTRIES.map((c) => {
              const sel = c === value;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => { if (c !== value) onChange?.(); setValue(c); setOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '9px 10px', background: sel ? 'var(--dark-2)' : 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                  onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'var(--dark-2)'; }}
                  onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: sel ? 600 : 400 }}>{c}</span>
                  {sel && (
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--dark-90)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckSm size={11} color="var(--light-100)" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SetupTab() {
  const navigate = useNavigate();
  // Publishing/approval is controlled in one place — the Approval Settings modal.
  // This page only reflects the resulting status for SEO/AEO blogs.
  const { featureRequiresApproval } = useApprovalSettings();
  const blogRequiresApproval = featureRequiresApproval('seo-blogs');
  const [planActive, setPlanActive] = useState(true);
  const [blogConnected, setBlogConnected] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  // Becomes true the moment any setting changes; drives the Save/Cancel footer.
  const [dirty, setDirty] = useState(false);

  // Plan banner copy + pill depend on active and whether a blog is connected.
  const bannerCopy = !planActive
    ? 'Your SEO/AEO plan is paused — Blaze will not write or publish content until you turn your plan on.'
    : blogConnected
      ? 'SEO/AEO is active. Blaze is automatically writing and publishing blog content.'
      : 'SEO/AEO is active. Connect your blog to start publishing.';

  return (
    <div style={{ padding: '24px 28px 96px', maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Plan active / paused control */}
      <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, background: 'var(--light-100)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>{bannerCopy}</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {!planActive ? (
            <StatusPill tone="neutral">Paused</StatusPill>
          ) : blogConnected ? (
            <StatusPill tone="success">Active</StatusPill>
          ) : (
            <StatusPill
              tone="warning"
              onClick={() => setShowConnect(true)}
              style={{ cursor: 'pointer', background: 'rgba(237, 182, 44, 0.14)', borderColor: 'rgba(237, 182, 44, 0.32)', color: '#946a00' }}
            >
              Connect
            </StatusPill>
          )}
          <Toggle checked={planActive} onChange={(v) => { setPlanActive(v); setDirty(true); }} aria-label="SEO/AEO plan active" />
        </div>
      </div>

      {showConnect && <ConnectBlogModal onClose={() => { setShowConnect(false); setBlogConnected(true); }} />}

      {/* Frequency settings + auto-approve */}
      <SectionCard title="Blog post settings">
        {/* Publishing — read-only status mirroring Approval Settings (the one control). */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--dark-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Text variant="secondary" style={{ fontWeight: 500, color: 'var(--dark-90)' }}>Publishing</Text>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99,
                  fontSize: 11, fontFamily: 'inherit', whiteSpace: 'nowrap',
                  background: blogRequiresApproval ? 'rgba(32,161,79,0.1)' : 'var(--dark-4)',
                  color: blogRequiresApproval ? '#20a14f' : 'var(--dark-60)',
                  border: `1px solid ${blogRequiresApproval ? 'rgba(32,161,79,0.25)' : 'var(--dark-15)'}`,
                }}
              >
                {blogRequiresApproval ? 'Approval required' : 'Auto-publishes'}
              </span>
            </div>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>
              {blogRequiresApproval
                ? 'Posts require your sign-off before going live.'
                : 'Posts publish automatically on their scheduled date.'}
            </Text>
          </div>
          <Button variant="secondary" size="sm" onPress={() => navigate('/h2/approvals')} style={{ flexShrink: 0 }}>
            Manage in Approval Settings →
          </Button>
        </div>

        {/* Blog account */}
        <div style={{ marginBottom: 20 }}>
          <Text variant="secondary" style={{ display: 'block', fontWeight: 500, color: 'var(--dark-90)', marginBottom: 8 }}>Blog account</Text>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: '1px solid var(--dark-8)', borderRadius: 8, background: 'var(--light-100)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: 'var(--dark-90)' }}>
            <Globe size={16} color="var(--dark-60)" />
            Connect Account
            <ChevronDown size={14} color="var(--dark-60)" />
          </button>
        </div>

        {/* Posting cadence */}
        <PostingCadencePicker onChange={() => setDirty(true)} />

        {/* Target country */}
        <div style={{ borderTop: '1px solid var(--dark-4)', marginTop: 20, paddingTop: 20 }}>
          <Text variant="secondary" style={{ display: 'block', fontWeight: 500, color: 'var(--dark-90)', marginBottom: 8 }}>Target country</Text>
          <TargetCountrySelect onChange={() => setDirty(true)} />
        </div>
      </SectionCard>

      {/* Save / Cancel footer — shown only when there are unsaved changes */}
      {dirty && (
        <div
          style={{
            position: 'fixed', bottom: 0, left: 238, right: 0, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            padding: '16px 28px',
            background: 'var(--light-100)', borderTop: '1px solid var(--dark-8)',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <Button variant="ghost" onPress={() => setDirty(false)}>Cancel</Button>
          <Button variant="primary" onPress={() => setDirty(false)}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}

// ─── HOW IT WORKS TAB ─────────────────────────────────────────────────

/** "How we write blogs that get cited by AI" — annotated post mockup.
 *  Shared between the How-it-works tab and the cold-state accordion. */
function HowWeWriteContent() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 0, position: 'relative' }}>
      {/* Left: annotation items, each sized to line up with a mockup region */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[
          { label: 'Answer-first', desc: 'Every post leads with the direct answer in the first 2–3 sentences. AI engines pull from the top of the page — leading with the answer makes your content more likely to be quoted.', height: 130 },
          { label: 'HowTo schema markup', desc: 'Blaze adds structured data so Google can render rich results and AI engines can parse your content more reliably.', height: 130 },
          { label: 'FAQ blocks at the end', desc: "A Q&A section closes each post. These map to Google's FAQ schema and give AI engines a list of clean, quotable answers.", height: 110 },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, height: item.height, paddingRight: 24, paddingTop: 16 }}
          >
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <CheckSm size={12} color="var(--dark-60)" />
            </div>
            <div style={{ flex: 1 }}>
              <Text variant="secondary" style={{ fontWeight: 500, color: 'var(--dark-90)', display: 'block' }}>{item.label}</Text>
              <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.6, marginTop: 4, display: 'block' }}>{item.desc}</Text>
            </div>
            <div style={{ alignSelf: 'center', width: 24, height: 1, background: 'var(--dark-15)', flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* Right: blog post mockup */}
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 10, overflow: 'hidden', background: 'var(--light-100)', flexShrink: 0 }}>
        {/* Answer-first region */}
        <div style={{ borderBottom: '1px solid var(--dark-4)', height: 130, display: 'flex', flexDirection: 'column', background: 'var(--dark-2)', overflow: 'hidden' }}>
          <div style={{ height: 52, background: 'var(--dark-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text variant="metadata" style={{ color: 'var(--dark-40)' }}>Image</Text>
          </div>
          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 8, borderRadius: 2, background: 'var(--dark-15)', width: '90%' }} />
            <div style={{ height: 6, borderRadius: 2, background: 'var(--dark-8)', width: '100%' }} />
            <div style={{ height: 6, borderRadius: 2, background: 'var(--dark-8)', width: '80%' }} />
            <div style={{ height: 6, borderRadius: 2, background: 'var(--dark-8)', width: '95%' }} />
          </div>
        </div>

        {/* Schema markup region */}
        <div style={{ borderBottom: '1px solid var(--dark-4)', height: 130, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ border: '1.5px dashed var(--dark-15)', borderRadius: 6, padding: '6px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ height: 6, borderRadius: 2, background: 'var(--dark-8)', width: '100%' }} />
            <div style={{ height: 6, borderRadius: 2, background: 'var(--dark-8)', width: '85%' }} />
            <div style={{ height: 6, borderRadius: 2, background: 'var(--dark-8)', width: '95%' }} />
            <div style={{ height: 6, borderRadius: 2, background: 'var(--dark-8)', width: '70%' }} />
            <div style={{ height: 6, borderRadius: 2, background: 'var(--dark-8)', width: '90%' }} />
            <Text variant="metadata" style={{ color: 'var(--dark-40)', marginTop: 2 }}>schema</Text>
          </div>
        </div>

        {/* FAQ region */}
        <div style={{ height: 110, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Text variant="metadata" style={{ color: 'var(--dark-60)', fontWeight: 500 }}>FAQ</Text>
          {[90, 75, 85].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, border: '1px solid var(--dark-15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckSm size={9} color="var(--dark-40)" />
              </span>
              <div style={{ height: 6, borderRadius: 2, background: 'var(--dark-8)', width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Collapsible version of the above for the cold-state landing. */
function HowWeWriteAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: 12 }}
      >
        <span>
          <Text variant="secondary" style={{ fontWeight: 600, color: 'var(--dark-90)', display: 'block' }}>How we write blogs that get cited by AI</Text>
          <Text variant="metadata" style={{ color: 'var(--dark-60)', display: 'block', marginTop: 2 }}>Every post follows the same structure — designed so Google ranks it and AI engines quote it.</Text>
        </span>
        <ChevronDown size={18} color="var(--dark-60)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>
      {open && <div style={{ borderTop: '1px solid var(--dark-4)', padding: '20px' }}><HowWeWriteContent /></div>}
    </div>
  );
}

function HowItWorksTab({ onBackToDashboard }: { onBackToDashboard: () => void }) {
  return (
    <div style={{ padding: '24px 28px 80px', maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* How SEO/AEO plan works */}
      <SectionCard title="How the SEO/AEO plan works">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {[
            { Icon: Stars,    label: 'What Blaze does',          desc: 'Blaze researches the keywords your customers are searching for, writes blog posts optimized for Google and AI search engines, and publishes them to your site on a consistent schedule — without you lifting a finger.' },
            { Icon: BarChart, label: 'What to expect',           desc: 'SEO takes time. Most businesses start to see ranking movement in months 2–3 and meaningful organic traffic growth by month 4–6. AI citations can appear sooner — sometimes within weeks of publishing.' },
            { Icon: Send,     label: 'How to get results faster', desc: 'Publish more consistently — even weekly posts compound quickly. Connect your blog to auto-publish so nothing sits in draft. The more content Blaze publishes, the faster your authority builds.' },
          ].map((item) => {
            const Icon = item.Icon;
            return (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color="var(--dark-90)" />
                </div>
                <Text variant="secondary" style={{ fontWeight: 500, color: 'var(--dark-90)', display: 'block' }}>{item.label}</Text>
                <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.6, display: 'block' }}>{item.desc}</Text>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Answer-first structure & FAQ blocks — educational */}
      <SectionCard
        id="how-we-write"
        title="How we write blogs that get cited by AI"
        subtitle="Every post Blaze writes follows the same structure — designed so Google ranks it and AI engines quote it. Here's how each post is built."
      >
        <HowWeWriteContent />
      </SectionCard>

      <div>
        <Button variant="secondary" frontIcon={ArrowLeft} onPress={onBackToDashboard}>
          Go back to Dashboard
        </Button>
      </div>
    </div>
  );
}

// ─── SEO ANALYTICS DATA ──────────────────────────────────────────────

const ORGANIC_TRAFFIC_POINTS = [2180, 2340, 2410, 2590, 2720, 2870, 3050, 3180, 3390, 3620, 3900, 4180, 4821];

interface KeywordRankRow {
  keyword: string;
  cluster: string;
  currentRank: number;
  prevRank: number;
  searchVol: string;
  url: string;
}

const KEYWORD_RANK_ROWS: KeywordRankRow[] = [
  { keyword: 'painters austin',                   cluster: 'Best Painters Austin', currentRank: 3,  prevRank: 7,  searchVol: '14.2K', url: '/austin/blog/best-painters-austin'          },
  { keyword: 'house painters austin TX',          cluster: 'Best Painters Austin', currentRank: 6,  prevRank: 9,  searchVol: '5.4K',  url: '/austin/blog/how-to-choose-an-austin-painter' },
  { keyword: 'interior painting austin',          cluster: 'Interior Colors',      currentRank: 4,  prevRank: 4,  searchVol: '9.1K',  url: '/austin/blog/interior-paint-colors-austin'  },
  { keyword: 'low-VOC interior paint',            cluster: 'Interior Colors',      currentRank: 11, prevRank: 18, searchVol: '6.3K',  url: '/austin/blog/low-voc-interior-paint'        },
  { keyword: 'cabinet painting austin',           cluster: 'Cabinet Cost Guide',   currentRank: 8,  prevRank: 14, searchVol: '7.8K',  url: '/austin/blog/cabinet-painting-cost-austin'  },
  { keyword: 'exterior painting austin',          cluster: 'Texas Heat',           currentRank: 15, prevRank: 22, searchVol: '5.9K',  url: '/austin/blog/exterior-paint-colors-texas-heat' },
  { keyword: 'painter near me',                   cluster: 'Best Painters Austin', currentRank: 2,  prevRank: 5,  searchVol: '1.2K',  url: '/austin/blog/painter-near-me'               },
];

interface ConversionRow {
  event: string;
  source: string;
  conversions: number;
  convRate: string;
  trend: string;
  trendUp: boolean;
}

const CONVERSION_ROWS: ConversionRow[] = [
  { event: 'Free estimate requested', source: 'Organic search', conversions: 58,  convRate: '3.2%', trend: '↑ +14%', trendUp: true  },
  { event: 'Phone call booked',       source: 'Organic search', conversions: 41,  convRate: '2.3%', trend: '↑ +9%',  trendUp: true  },
  { event: 'Color guide downloaded',  source: 'Organic search', conversions: 29,  convRate: '1.6%', trend: '→ Flat', trendUp: false },
  { event: 'Newsletter sign-up',      source: 'Organic search', conversions: 14,  convRate: '0.8%', trend: '↑ +22%', trendUp: true  },
];

interface BacklinkRow {
  domain: string;
  authority: number;
  links: number;
  firstSeen: string;
  isNew: boolean;
}

const BACKLINK_ROWS: BacklinkRow[] = [
  { domain: 'austin.curbed.com',       authority: 94, links: 2, firstSeen: 'May 14', isNew: true  },
  { domain: 'do512.com',               authority: 78, links: 1, firstSeen: 'May 11', isNew: true  },
  { domain: 'kxan.com',                authority: 88, links: 3, firstSeen: 'Apr 28', isNew: false },
  { domain: 'hgtv.com',                authority: 91, links: 5, firstSeen: 'Apr 19', isNew: false },
  { domain: 'austin.eater.com',        authority: 82, links: 1, firstSeen: 'May 16', isNew: true  },
  { domain: 'bobvila.com',             authority: 87, links: 2, firstSeen: 'Mar 30', isNew: false },
];

function OrgTrafficSparkline() {
  const W = 300; const H = 56; const pad = 4;
  const min = Math.min(...ORGANIC_TRAFFIC_POINTS);
  const max = Math.max(...ORGANIC_TRAFFIC_POINTS);
  const pts = ORGANIC_TRAFFIC_POINTS.map((v, i) => {
    const x = pad + (i / (ORGANIC_TRAFFIC_POINTS.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / (max - min)) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <polyline points={pts} fill="none" style={{ stroke: 'var(--green-50)' }} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`${pts} ${W - pad},${H} ${pad},${H}`} fill="rgba(4, 175, 0, 0.07)" strokeWidth="0" />
    </svg>
  );
}

// ─── SEO ANALYTICS TAB ───────────────────────────────────────────────

/** Row in the Keyword Rankings table. View post button only appears on
 *  hover, anchored next to the keyword. The Action column is removed
 *  entirely since hover is the affordance. */
function KeywordRankingRow({
  r,
  delta,
  isTop10,
  tdStyle,
}: {
  r: KeywordRankRow;
  delta: number;
  isTop10: boolean;
  tdStyle: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <td style={{ ...tdStyle, fontWeight: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--dark-90)' }}>{r.keyword}</div>
            <Text variant="metadata" style={{ color: 'var(--dark-40)', display: 'block', marginTop: 1 }}>{r.url}</Text>
          </div>
          <div style={{ opacity: hovered ? 1 : 0, transition: 'opacity 120ms', flexShrink: 0 }}>
            <Button size="sm" variant="secondary">View post</Button>
          </div>
        </div>
      </td>
      <td style={{ ...tdStyle, color: 'var(--dark-60)' }}>{r.cluster}</td>
      <td style={{ ...tdStyle, textAlign: 'center', color: isTop10 ? 'var(--green-70)' : 'var(--dark-60)' }}>
        #{r.currentRank}
      </td>
      <td style={{ ...tdStyle, textAlign: 'center' }}>
        {delta !== 0 ? (
          <span style={{ color: delta > 0 ? 'var(--green-50)' : 'var(--red-70)' }}>
            {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}
          </span>
        ) : (
          <span style={{ color: 'var(--dark-40)' }}>—</span>
        )}
      </td>
      <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.searchVol}</td>
    </tr>
  );
}

function SeoAnalyticsTab() {
  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: 400,
    fontSize: 12,
    color: 'var(--dark-60)',
    borderBottom: '1px solid var(--dark-4)',
    whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '11px 12px',
    fontSize: 13,
    color: 'var(--dark-90)',
    borderBottom: '1px solid var(--dark-4)',
    verticalAlign: 'middle',
  };

  return (
    <div style={{ padding: '24px 28px 80px', maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* 1 ── Organic Traffic — title + trend chip outside the card. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={3} style={{ display: 'block' }}>Organic Traffic</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>Monthly visitors arriving from unpaid search</Text>
          </div>
          <StatusPill tone="success" size="sm">+18% vs. last month</StatusPill>
        </div>
        <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, padding: '18px 20px', background: 'var(--light-100)' }}>
        {/* Top row: main stat on the left, 3 side stats on the right. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 400, color: 'var(--dark-90)', lineHeight: 1 }}>4,821</span>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>organic visits / mo</Text>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'Avg. session duration', value: '2m 41s', up: true  },
              { label: 'Pages per session',      value: '2.8',   up: true  },
              { label: 'Bounce rate',             value: '54%',   up: false },
            ].map((s) => (
              <div key={s.label}>
                <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 4 }}>{s.label}</Text>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 18, fontWeight: 400, color: 'var(--dark-90)' }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: s.up ? 'var(--green-50)' : 'var(--dark-40)' }}>{s.up ? '↑' : '↓'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <OrgTrafficSparkline />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <Text variant="metadata" style={{ color: 'var(--dark-40)' }}>Jan</Text>
          <Text variant="metadata" style={{ color: 'var(--dark-40)' }}>May</Text>
        </div>
        </div>
      </div>

      {/* 2 ── Keyword Rankings — title + status pills outside the card. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={3} style={{ display: 'block' }}>Keyword Rankings</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>Position in Google for your target keywords</Text>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusPill tone="success" size="sm">4 in top 10</StatusPill>
            <StatusPill tone="accent" size="sm">+5 moved up</StatusPill>
          </div>
        </div>
        <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Keyword</th>
              <th style={{ ...thStyle, width: 130 }}>Cluster</th>
              <th style={{ ...thStyle, width: 80, textAlign: 'center' }}>Rank</th>
              <th style={{ ...thStyle, width: 72, textAlign: 'center' }}>Change</th>
              <th style={{ ...thStyle, width: 80, textAlign: 'right' }}>Search Vol.</th>
            </tr>
          </thead>
          <tbody>
            {KEYWORD_RANK_ROWS.map((r) => {
              const delta = r.prevRank - r.currentRank;
              const isTop10 = r.currentRank <= 10;
              return (
                <KeywordRankingRow key={r.keyword} r={r} delta={delta} isTop10={isTop10} tdStyle={tdStyle} />
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* 4 ── Backlinks / Referring Domains — title + stats outside the card. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={3} style={{ display: 'block' }}>Backlinks &amp; Referring Domains</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>Sites linking to you — a direct signal of authority to Google</Text>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)' }}>Total backlinks</Text>
              <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>847</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)' }}>Referring domains</Text>
              <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>124</Text>
            </div>
            <StatusPill tone="success" size="sm">+8 new domains this month</StatusPill>
          </div>
        </div>
        <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Referring domain</th>
              <th style={{ ...thStyle, width: 100, textAlign: 'center' }}>Authority</th>
              <th style={{ ...thStyle, width: 80, textAlign: 'center' }}>Links</th>
              <th style={{ ...thStyle, width: 110 }}>First seen</th>
              <th style={{ ...thStyle, width: 80 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {BACKLINK_ROWS.map((r) => (
              <tr key={r.domain}>
                <td style={{ ...tdStyle, color: 'var(--dark-90)' }}>{r.domain}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--dark-8)', overflow: 'hidden', maxWidth: 48 }}>
                      <div style={{ width: `${r.authority}%`, height: '100%', borderRadius: 3, background: r.authority >= 80 ? 'var(--green-50)' : r.authority >= 60 ? 'var(--dark-60)' : 'var(--dark-40)' }} />
                    </div>
                    <Text variant="metadata" style={{ fontWeight: 500, color: 'var(--dark-90)', minWidth: 20 }}>{r.authority}</Text>
                  </div>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{r.links}</td>
                <td style={{ ...tdStyle, color: 'var(--dark-60)' }}>{r.firstSeen}</td>
                <td style={tdStyle}>
                  {r.isNew
                    ? <StatusPill tone="success" size="sm">New</StatusPill>
                    : <StatusPill tone="neutral" size="sm">Active</StatusPill>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--dark-4)' }}>
          <Button variant="ghost" size="sm" endIcon={ArrowRight}>View all 124 domains</Button>
        </div>
        </div>
      </div>

    </div>
  );
}

// ─── ONBOARDING FLOW ─────────────────────────────────────────────────

const ONBOARDING_CLUSTERS: { label: string; keywords: number; difficulty: DifficultyLevel; vol: string; aiVol: string; defaultChecked: boolean }[] = [
  { label: 'Best Painters in Austin',           keywords: 13, difficulty: 'Easy',   vol: '40.5k', aiVol: '9.9k',  defaultChecked: true  },
  { label: 'Interior Paint Colors',             keywords: 8,  difficulty: 'Medium', vol: '74k',   aiVol: '6.8k',  defaultChecked: true  },
  { label: 'Cabinet Painting Cost Guide',       keywords: 11, difficulty: 'Easy',   vol: '3.6k',  aiVol: '2.1k',  defaultChecked: true  },
  { label: 'Exterior Painting in Texas Heat',   keywords: 13, difficulty: 'Hard',   vol: '6.6k',  aiVol: '3.8k',  defaultChecked: false },
  { label: 'HOA & Commercial Repaints',         keywords: 9,  difficulty: 'Easy',   vol: '12.1k', aiVol: '4.2k',  defaultChecked: false },
  { label: 'How to Find an Austin Painter',     keywords: 11, difficulty: 'Medium', vol: '301k',  aiVol: '18.2k', defaultChecked: false },
];

const PLATFORM_OPTIONS: { id: string; label: string; Brand?: typeof WordPressBrand; icon?: string; color?: string }[] = [
  { id: 'wordpress',   label: 'WordPress',   Brand: WordPressBrand },
  { id: 'wix',         label: 'Wix',         Brand: WixBrand },
  { id: 'gohighlevel', label: 'GoHighLevel', Brand: GoHighLevelBrand },
  { id: 'zapier',      label: 'Zapier' },
];

/** Zapier asterisk mark — inlined here because the lib has no Zapier brand
 *  icon and src/icons is eng-protected. Brand orange #FF4F00. */
function ZapierLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <g stroke="#FF4F00" strokeWidth={3.2} strokeLinecap="round">
        <line x1="12" y1="3.5" x2="12" y2="20.5" />
        <line x1="4.6" y1="7.75" x2="19.4" y2="16.25" />
        <line x1="4.6" y1="16.25" x2="19.4" y2="7.75" />
      </g>
    </svg>
  );
}

/** Renders a platform's brand logo, or a neutral tinted glyph box for
 *  platforms without a brand mark. */
function PlatformLogo({ p, size = 28 }: { p: (typeof PLATFORM_OPTIONS)[number]; size?: number }) {
  if (p.id === 'zapier') return <ZapierLogo size={size} />;
  if (p.Brand) {
    const Brand = p.Brand;
    return <Brand size={size} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 7, background: `${p.color}18`, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: p.color, flexShrink: 0 }}>
      {p.icon}
    </div>
  );
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/** Posting cadence control — a posts-per-week stepper plus a day-of-week
 *  picker. Self-contained state; used in onboarding and Settings. */
function PostingCadencePicker({ onChange }: { onChange?: () => void }) {
  const [postsPerWeek, setPostsPerWeek] = useState(4);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set([1, 3, 5])); // M, W, F

  function toggleDay(i: number) {
    onChange?.();
    setSelectedDays((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40 }}>
      {/* Posts per week stepper */}
      <div>
        <Text variant="secondary" style={{ display: 'block', fontWeight: 500, color: 'var(--dark-90)', marginBottom: 8 }}>Posts per week</Text>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Button variant="secondary" size="sm" onPress={() => { onChange?.(); setPostsPerWeek((v) => Math.max(1, v - 1)); }} aria-label="Decrease">−</Button>
          <input
            readOnly
            value={postsPerWeek}
            aria-label="Posts per week"
            style={{ width: 48, height: 32, textAlign: 'center', border: '1px solid var(--dark-8)', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', fontFamily: 'inherit', background: 'var(--light-100)' }}
          />
          <Button variant="secondary" size="sm" onPress={() => { onChange?.(); setPostsPerWeek((v) => Math.min(7, v + 1)); }} aria-label="Increase">+</Button>
        </div>
        <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 12 }}>
          {postsPerWeek * 20} credits / week
        </Text>
      </div>

      {/* Days to post */}
      <div>
        <Text variant="secondary" style={{ display: 'block', fontWeight: 500, color: 'var(--dark-90)', marginBottom: 8 }}>Days to post</Text>
        <div style={{ display: 'flex', gap: 6 }}>
          {DAYS_OF_WEEK.map((day, i) => (
            <Chip
              key={`${day}-${i}`}
              size="sm"
              selected={selectedDays.has(i)}
              onSelectionChange={() => toggleDay(i)}
              style={{ width: 36, height: 36, borderRadius: '50%', padding: 0, justifyContent: 'center' }}
            >
              {day}
            </Chip>
          ))}
        </div>
        <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 8 }}>
          {postsPerWeek} post{postsPerWeek !== 1 ? 's' : ''} will be spread across your selected days.
        </Text>
      </div>
    </div>
  );
}

type OnboardingStep = 'landing' | 'clusters' | 'platform';

function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<OnboardingStep>('landing');
  const [selectedClusters, setSelectedClusters] = useState<Set<string>>(
    new Set(ONBOARDING_CLUSTERS.filter((c) => c.defaultChecked).map((c) => c.label))
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [resetFocus, setResetFocus] = useState(false);

  function toggleCluster(label: string) {
    setSelectedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else if (next.size < 3) {
        next.add(label);
      }
      return next;
    });
  }

  if (step === 'landing') {
    return (
      <H2Layout title="SEO/AEO">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 28px 64px' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 60, height: 60, borderRadius: 16,
                background: 'var(--dark-4)', border: '1px solid var(--dark-8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Search size={28} color="var(--dark-60)" />
            </div>
            <Heading level={1} style={{ marginBottom: 12 }}>
              Rank on Google and get cited by AI
            </Heading>
            <Text variant="secondary" style={{ display: 'block', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
              Blaze writes and publishes a steady stream of blog posts that signal to Google and AI search engines that your site is the authority in your space.
            </Text>
          </div>

          {/* Primary CTA — moved up from the sticky footer so it lives with the hero copy */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
            <Button variant="primary" size="lg" endIcon={ArrowRight} onPress={() => setStep('clusters')}>
              Set Up My SEO/AEO Plan
            </Button>
          </div>

          {/* How Blaze does it */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-60)', textAlign: 'center', marginBottom: 16, letterSpacing: '0.02em' }}>
              How Blaze does it
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {(
                [
                  {
                    icon: Search,
                    title: 'Win the right keywords',
                    desc: 'Blaze researches what your customers search or ask AI, then prioritizes your topic clusters.',
                  },
                  {
                    icon: Send,
                    title: 'Publish blog posts consistently',
                    desc: 'Automatically write & publish optimized blog posts structured for search engines and AI.',
                  },
                  {
                    icon: Stars,
                    title: 'Earn rankings & AI citations',
                    desc: 'Consistent posts compound into search and AI authority. Climb Google rankings and get cited by ChatGPT, AI Overviews, and more.',
                  },
                ] as { icon: typeof Search; title: string; desc: string }[]
              ).map(({ icon: Ic, title, desc }) => (
                <div key={title} style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '20px 18px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Ic size={18} color="var(--dark-60)" />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 6, lineHeight: 1.3 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How we write blogs — collapsed accordion to avoid overwhelm */}
          <div style={{ marginBottom: 40 }}>
            <HowWeWriteAccordion />
          </div>

          {/* Upsell — DFY content strategy. Photo bleeds above the banner. */}
          <div
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: 20,
              borderRadius: 12,
              padding: '18px 24px 18px 124px',
              minHeight: 88,
              background: 'linear-gradient(100deg, #b9d9f4 0%, #d6e9f8 55%, #e7f1fa 100%)',
            }}
          >
            {/* Photo — cutout PNG anchored to the bottom-left so the head extends above the banner */}
            <div
              role="img"
              aria-label=""
              style={{
                position: 'absolute', left: 4, bottom: 0,
                width: 116, height: 138,
                backgroundImage: `url("${import.meta.env.BASE_URL}salesperson.png")`,
                backgroundSize: 'contain',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat',
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
              <Heading level={5}>Want results faster?</Heading>
              <Text variant="secondary">Have a Blaze content strategist build and manage your SEO/AEO plan 1:1.</Text>
            </div>
            <div style={{ flexShrink: 0 }}>
              <Button variant="secondary" endIcon={ArrowRight} onPress={() => setStep('clusters')}>
                Talk to a content expert 1:1
              </Button>
            </div>
          </div>
        </div>

      </H2Layout>
    );
  }

  // ── Step: pick topic clusters ──────────────────────────────────────
  if (step === 'clusters') {
    const canConfirm = selectedClusters.size === 3;
    return (
      <H2Layout title="SEO/AEO">
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 28px 120px' }}>
          <Heading level={1} style={{ marginBottom: 12 }}>What should your business be known for?</Heading>
          <Text variant="secondary" style={{ display: 'block', lineHeight: 1.65, marginBottom: 8 }}>
            Blaze groups your content into topic clusters — a main keyword and all the related questions people ask around it. Publishing multiple posts on the same topic is far more effective than random one-off posts, because it signals to Google that you're a genuine authority on the subject.
          </Text>
          <Text variant="secondary" style={{ display: 'block', lineHeight: 1.65, marginBottom: 28 }}>
            We've pre-selected 3 clusters based on what people are searching for in your market. Confirm them or swap in your own.
          </Text>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ paddingBottom: 10, textAlign: 'left', fontSize: 12, color: 'var(--dark-40)', fontWeight: 500, borderBottom: '1px solid var(--dark-4)' }}>Topic cluster</th>
                <th style={{ paddingBottom: 10, textAlign: 'left', fontSize: 12, color: 'var(--dark-40)', fontWeight: 500, borderBottom: '1px solid var(--dark-4)', width: 110 }}>Difficulty</th>
                <th style={{ paddingBottom: 10, textAlign: 'right', fontSize: 12, color: 'var(--dark-40)', fontWeight: 500, borderBottom: '1px solid var(--dark-4)', width: 140 }}>Search / AI vol.</th>
              </tr>
            </thead>
            <tbody>
              {ONBOARDING_CLUSTERS.map((c) => {
                const checked = selectedClusters.has(c.label);
                const canAdd = checked || selectedClusters.size < 3;
                return (
                  <tr
                    key={c.label}
                    onClick={() => canAdd && toggleCluster(c.label)}
                    style={{ cursor: canAdd ? 'pointer' : 'default', opacity: !canAdd ? 0.4 : 1 }}
                  >
                    <td style={{ padding: '16px 0', borderBottom: '1px solid var(--dark-4)', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {checked ? (
                          <CheckboxChecked size={22} />
                        ) : (
                          <span style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid var(--dark-15)', flexShrink: 0, display: 'block' }} />
                        )}
                        <span style={{ fontSize: 15, color: 'var(--dark-90)', fontWeight: 600 }}>
                          {c.label}
                          <span style={{ color: 'var(--dark-40)', fontWeight: 400, fontSize: 13 }}> · {c.keywords} keywords</span>
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 0', borderBottom: '1px solid var(--dark-4)', textAlign: 'left', fontSize: 14, color: 'var(--dark-60)', verticalAlign: 'middle' }}>{c.difficulty}</td>
                    <td style={{ padding: '16px 0', borderBottom: '1px solid var(--dark-4)', textAlign: 'right', fontSize: 14, verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums' }}>
                      <span style={{ color: 'var(--dark-60)' }}>{c.vol}</span>
                      <span style={{ color: 'var(--dark-15)', margin: '0 4px' }}>/</span>
                      <span style={{ color: 'var(--dark-90)' }}>{c.aiVol}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sticky footer CTA */}
        <div style={{ position: 'fixed', bottom: 0, left: 238, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 28px', background: 'var(--light-100)', borderTop: '1px solid var(--dark-8)', boxShadow: '0 -4px 16px rgba(0,0,0,0.04)' }}>
          <Button variant="ghost" onPress={() => setResetFocus(true)}>
            Reset My Topic Focus
          </Button>
          <Button variant="primary" size="lg" endIcon={ArrowRight} isDisabled={!canConfirm} onPress={() => canConfirm && setStep('platform')}>
            Confirm {selectedClusters.size} cluster{selectedClusters.size !== 1 ? 's' : ''}
          </Button>
        </div>
        {resetFocus && <ResetTopicFocusModal onClose={() => setResetFocus(false)} />}
      </H2Layout>
    );
  }

  // ── Step: choose publishing platform ───────────────────────────────
  if (step === 'platform') {
    return (
      <H2Layout title="SEO/AEO">
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 28px 120px' }}>
          <Heading level={1} style={{ marginBottom: 12 }}>Where should Blaze publish?</Heading>
          <Text variant="secondary" style={{ display: 'block', lineHeight: 1.65, marginBottom: 28 }}>
            Blaze writes the posts. To put them live on your site automatically, it needs to connect to your blog or CMS. Select your platform below.
          </Text>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {PLATFORM_OPTIONS.map((p) => {
              const selected = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`, background: 'var(--light-100)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
                >
                  <PlatformLogo p={p} size={28} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-90)' }}>{p.label}</span>
                </button>
              );
            })}
          </div>

          <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', lineHeight: 1.6 }}>
            Not sure which platform your site uses? Check with your web developer or look in your website admin panel. You can also skip this and connect later in Settings — but posts will stay in draft until you do.
          </Text>

        </div>

        {/* Sticky footer CTA */}
        <div style={{ position: 'fixed', bottom: 0, left: 238, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 28px', background: 'var(--light-100)', borderTop: '1px solid var(--dark-8)', boxShadow: '0 -4px 16px rgba(0,0,0,0.04)' }}>
          <Button variant="ghost" frontIcon={ArrowLeft} onPress={() => setStep('clusters')}>Back</Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button variant="ghost" onPress={onComplete}>Skip for now</Button>
            <Button variant="primary" size="lg" endIcon={ArrowRight} isDisabled={!selectedPlatform} onPress={() => selectedPlatform && onComplete()}>
              Continue
            </Button>
          </div>
        </div>
      </H2Layout>
    );
  }

  return null;
}

// ─── PLAN ACTIVE MODAL (post-onboarding confirmation) ─────────────────

function PlanActiveModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalBackdrop onClose={onClose} size="sm">
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
        <IconButton icon={Close} variant="ghost" size="sm" aria-label="Close" onPress={onClose} />
      </div>
      <Modal.Content compact={false}>
        {/* Icon badge */}
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(4, 175, 0, 0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <CheckSm size={20} color="var(--status-approved)" />
        </div>

        <Heading level={3} style={{ display: 'block', marginBottom: 8 }}>Your SEO/AEO plan is active</Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', lineHeight: 1.6, marginBottom: 24 }}>
          Blaze is writing your first batch of posts now. Your first draft will be ready for review shortly.
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {[
            '3 topic clusters confirmed',
            'Blog integration — connect in Settings to go live',
            'Weekly posting schedule set — adjust in Settings',
          ].map((text) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--dark-90)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckSm size={12} color="var(--light-100)" />
              </span>
              <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>{text}</Text>
            </div>
          ))}
        </div>

        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-40)', lineHeight: 1.6 }}>
          SEO is a long game — most businesses start seeing traction around month 3, then it compounds. Blaze runs in the background so you don't have to think about it.
        </Text>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent>
          <Modal.FooterButton variant="primary" onPress={onClose}>Go to My SEO/AEO Plan</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </ModalBackdrop>
  );
}

// ─── RESET TOPIC FOCUS MODAL ──────────────────────────────────────────

/** Lets the user search a new overall focus to regenerate the cluster
 *  suggestions. Opened from the cluster picker / Add-topic-cluster modal. */
function ResetTopicFocusModal({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState('');

  const fieldStyle: React.CSSProperties = {
    width: '100%', height: 38, border: '1px solid var(--dark-8)', borderRadius: 8,
    padding: '0 12px', fontSize: 14, fontFamily: 'inherit', color: 'var(--dark-90)',
    background: 'var(--light-100)', boxSizing: 'border-box',
  };

  return (
    <ModalBackdrop onClose={onClose} size="md">
      <Modal.Header
        title="Reset my topic focus"
        headingLevel={3}
        onClose={onClose}
        subHeader={
          <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.6 }}>
            Search for a new overall focus, and we'll generate new topic clusters around it.
          </Text>
        }
      />
      <Modal.Content compact={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16 }}>
          <div>
            <Text variant="metadata" style={{ display: 'block', fontWeight: 500, color: 'var(--dark-90)', marginBottom: 6 }}>Topic</Text>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. ai marketing" style={fieldStyle} />
          </div>
          <div>
            <Text variant="metadata" style={{ display: 'block', fontWeight: 500, color: 'var(--dark-90)', marginBottom: 6 }}>Results for</Text>
            <button style={{ ...fieldStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              United States
              <ChevronDown size={14} color="var(--dark-60)" />
            </button>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterButton slot="left" variant="ghost" onPress={onClose}>Back</Modal.FooterButton>
        <Modal.FooterContent>
          <Modal.FooterButton variant="primary" onPress={onClose}>Discover Topic Clusters</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </ModalBackdrop>
  );
}

// ─── CONNECT BLOG MODAL ───────────────────────────────────────────────

function ConnectBlogModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ModalBackdrop onClose={onClose} size="sm">
      <Modal.Header
        title="Connect your blog"
        headingLevel={4}
        onClose={onClose}
        subHeader={
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            Blaze will publish directly to your site on schedule. Select your platform to connect.
          </Text>
        }
      />
      <Modal.Content compact={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: -8 }}>
          {PLATFORM_OPTIONS.map((p) => {
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 12,
                  border: `1px solid ${isSelected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  background: 'var(--light-100)',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <PlatformLogo p={p} size={28} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-90)' }}>{p.label}</span>
              </button>
            );
          })}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent>
          <Modal.FooterButton variant="primary" isDisabled={!selected} onPress={onClose}>
            Connect
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </ModalBackdrop>
  );
}

// ─── ADD KEYWORDS MODAL ───────────────────────────────────────────────

const KEYWORD_SUGGESTIONS: { keyword: string; difficulty: DifficultyLevel; searchVol: string; aiVol: string; defaultChecked: boolean }[] = [
  { keyword: 'affordable painters austin',    difficulty: 'Medium', searchVol: '4.4k', aiVol: '2.6k', defaultChecked: true  },
  { keyword: 'licensed painting contractor',  difficulty: 'Easy',   searchVol: '2.1k', aiVol: '1.2k', defaultChecked: false },
  { keyword: 'painting quote austin',         difficulty: 'Easy',   searchVol: '1.8k', aiVol: '980',  defaultChecked: false },
  { keyword: 'eco-friendly painters',         difficulty: 'Medium', searchVol: '1.3k', aiVol: '740',  defaultChecked: true  },
  { keyword: 'same-day painting estimate',    difficulty: 'Easy',   searchVol: '920',  aiVol: '510',  defaultChecked: true  },
  { keyword: 'painters near downtown austin', difficulty: 'Easy',   searchVol: '760',  aiVol: '420',  defaultChecked: true  },
];

function AddKeywordsModal({ cluster, onClose }: { cluster: TopicCluster; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(KEYWORD_SUGGESTIONS.filter((k) => k.defaultChecked).map((k) => k.keyword)),
  );

  function toggle(keyword: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(keyword) ? next.delete(keyword) : next.add(keyword);
      return next;
    });
  }

  const thStyle: React.CSSProperties = {
    paddingBottom: 10, textAlign: 'left', fontSize: 12, color: 'var(--dark-40)',
    fontWeight: 500, borderBottom: '1px solid var(--dark-4)',
  };

  return (
    <ModalBackdrop onClose={onClose} size="md">
      <Modal.Header
        title="Add more keywords"
        headingLevel={3}
        onClose={onClose}
        subHeader={
          <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.6 }}>
            Select keywords to add to your {cluster} cluster. Blaze will automatically generate and publish a blog post for each one, helping you rank for more searches over time.
          </Text>
        }
      />
      <Modal.Content compact={false}>
        <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)' }}>Topic cluster</Text>
        <Text variant="secondary" style={{ display: 'block', fontWeight: 600, color: 'var(--dark-90)', marginBottom: 16 }}>{cluster}</Text>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Keyword</th>
              <th style={{ ...thStyle, width: 110 }}>Difficulty</th>
              <th style={{ ...thStyle, textAlign: 'right', width: 130 }}>Search / AI vol.</th>
            </tr>
          </thead>
          <tbody>
            {KEYWORD_SUGGESTIONS.map((k) => {
              const checked = selected.has(k.keyword);
              return (
                <tr key={k.keyword} onClick={() => toggle(k.keyword)} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '14px 0', borderBottom: '1px solid var(--dark-4)', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {checked ? (
                        <CheckboxChecked size={20} />
                      ) : (
                        <span style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid var(--dark-15)', flexShrink: 0, display: 'block' }} />
                      )}
                      <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>{k.keyword}</Text>
                    </div>
                  </td>
                  <td style={{ padding: '14px 0', borderBottom: '1px solid var(--dark-4)', fontSize: 14, color: 'var(--dark-60)', verticalAlign: 'middle' }}>{k.difficulty}</td>
                  <td style={{ padding: '14px 0', borderBottom: '1px solid var(--dark-4)', textAlign: 'right', fontSize: 14, verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ color: 'var(--dark-60)' }}>{k.searchVol}</span>
                    <span style={{ color: 'var(--dark-15)', margin: '0 4px' }}>/</span>
                    <span style={{ color: 'var(--dark-90)' }}>{k.aiVol}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent>
          <Modal.FooterButton variant="primary" isDisabled={selected.size === 0} onPress={onClose}>
            Add {selected.size > 0 ? selected.size : ''} keyword{selected.size === 1 ? '' : 's'}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </ModalBackdrop>
  );
}

// ─── ADD CLUSTER MODAL ────────────────────────────────────────────────

function AddClusterModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [resetFocus, setResetFocus] = useState(false);

  function toggle(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  const thStyle: React.CSSProperties = {
    paddingBottom: 10, textAlign: 'left', fontSize: 12, color: 'var(--dark-40)',
    fontWeight: 500, borderBottom: '1px solid var(--dark-4)',
  };

  if (resetFocus) return <ResetTopicFocusModal onClose={() => setResetFocus(false)} />;

  return (
    <ModalBackdrop onClose={onClose} size="md">
      <Modal.Header
        title="Add a topic cluster"
        headingLevel={3}
        onClose={onClose}
        subHeader={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.6 }}>
              Topic clusters are groups of related posts linked to one main topic. Publishing around the same subject signals authority to both Google and AI search engines — helping you rank higher and get cited more often.
            </Text>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.6 }}>
              We've ranked these by opportunity: high search volume, manageable difficulty, and strong AI citation potential.
            </Text>
          </div>
        }
      />
      <Modal.Content compact={false}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Topic cluster</th>
              <th style={{ ...thStyle, width: 110 }}>Difficulty</th>
              <th style={{ ...thStyle, textAlign: 'right', width: 130 }}>Search / AI vol.</th>
            </tr>
          </thead>
          <tbody>
            {ONBOARDING_CLUSTERS.map((c) => {
              const checked = selected.has(c.label);
              return (
                <tr key={c.label} onClick={() => toggle(c.label)} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '14px 0', borderBottom: '1px solid var(--dark-4)', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {checked ? (
                        <CheckboxChecked size={20} />
                      ) : (
                        <span style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid var(--dark-15)', flexShrink: 0, display: 'block' }} />
                      )}
                      <span style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: 600 }}>
                        {c.label}
                        <span style={{ color: 'var(--dark-40)', fontWeight: 400, fontSize: 12 }}> · {c.keywords} keywords</span>
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 0', borderBottom: '1px solid var(--dark-4)', fontSize: 14, color: 'var(--dark-60)', verticalAlign: 'middle' }}>{c.difficulty}</td>
                  <td style={{ padding: '14px 0', borderBottom: '1px solid var(--dark-4)', textAlign: 'right', fontSize: 14, verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ color: 'var(--dark-60)' }}>{c.vol}</span>
                    <span style={{ color: 'var(--dark-15)', margin: '0 4px' }}>/</span>
                    <span style={{ color: 'var(--dark-90)' }}>{c.aiVol}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterButton slot="left" variant="ghost" onPress={() => setResetFocus(true)}>
          Reset My Topic Focus
        </Modal.FooterButton>
        <Modal.FooterContent>
          <Modal.FooterButton variant="primary" isDisabled={selected.size === 0} onPress={onClose}>
            Add {selected.size > 0 ? selected.size : ''} {selected.size === 1 ? 'cluster' : 'clusters'}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </ModalBackdrop>
  );
}

// ─── ROUTE ────────────────────────────────────────────────────────────

export function SeoAeoRoute() {
  // Cold state = the onboarding flow (Set Up My SEO Plan hero + cluster
  // picker + platform connect). Steady state = the dashboard view a user
  // sees once onboarding is done. Designers flip between them via the
  // <DevStatePanel> cold/steady toggle.
  const { getState, setState } = useDevState();
  const devState = getState('/h2/seo-aeo');
  const [tab, setTab] = useState<SeoAeoTab>('dashboard');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<AnalyticsSubTab>('seo');
  const [showAddCluster, setShowAddCluster] = useState(false);
  // After finishing onboarding we flip to steady and show the "plan active"
  // confirmation as a modal over the live dashboard.
  const [showPlanActive, setShowPlanActive] = useState(false);

  if (devState === 'cold') {
    return (
      <OnboardingFlow
        onComplete={() => {
          setState('/h2/seo-aeo', 'steady');
          setShowPlanActive(true);
        }}
      />
    );
  }

  const topbarCenter = (
    <div style={{ display: 'flex', gap: 4 }}>
      <TabChip selected={tab === 'dashboard'} onSelect={() => setTab('dashboard')}>Dashboard</TabChip>
      <TabChip selected={tab === 'analytics'} onSelect={() => setTab('analytics')}>Analytics</TabChip>
      <TabChip selected={tab === 'settings'} onSelect={() => setTab('settings')}>Settings</TabChip>
    </div>
  );

  // "How it works" sits on the left, just after the SEO/AEO heading.
  const topbarTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: "'Sohne', sans-serif", fontWeight: 500, fontSize: 16, color: 'var(--dark-90)' }}>SEO/AEO</span>
      <TabChip selected={tab === 'how-it-works'} onSelect={() => setTab('how-it-works')}>How it works</TabChip>
    </div>
  );

  return (
    <H2Layout title={topbarTitle} topbarCenter={topbarCenter}>
      {tab === 'dashboard' ? (
        <DashboardTab
          onAddCluster={() => setShowAddCluster(true)}
          onOpenAnalytics={(sub) => {
            setAnalyticsSubTab(sub);
            setTab('analytics');
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 80);
          }}
          onLearnMore={() => {
            setTab('how-it-works');
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 80);
          }}
          onScheduleFrequency={() => {
            setTab('settings');
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 80);
          }}
        />
      ) : tab === 'analytics' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: '12px 20px', margin: '-24px -24px 0', position: 'sticky', top: -24, zIndex: 10, background: 'var(--default-bg)', borderBottom: '1px solid var(--dark-4)' }}>
            <TabChip selected={analyticsSubTab === 'seo'} onSelect={() => setAnalyticsSubTab('seo')}>SEO</TabChip>
            <TabChip selected={analyticsSubTab === 'aeo'} onSelect={() => setAnalyticsSubTab('aeo')}>AEO</TabChip>
          </div>
          {analyticsSubTab === 'seo' ? <SeoAnalyticsTab /> : <AnalyticsTab />}
        </>
      ) : tab === 'how-it-works' ? (
        <HowItWorksTab onBackToDashboard={() => setTab('dashboard')} />
      ) : (
        <SetupTab />
      )}
      {showAddCluster && <AddClusterModal onClose={() => setShowAddCluster(false)} />}
      {showPlanActive && <PlanActiveModal onClose={() => setShowPlanActive(false)} />}
    </H2Layout>
  );
}
