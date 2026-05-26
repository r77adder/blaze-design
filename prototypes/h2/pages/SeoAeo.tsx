import { Fragment, useState } from 'react';
import { Button, Heading, IconButton, Modal, Text } from '@/components';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  BarChart,
  CheckboxChecked,
  Close,
  Copy,
  Download,
  File02,
  Filter,
  LinkAngled,
  Microphone,
  Plus,
  Search,
  Send1 as Send,
  Settings,
  Stars,
} from '@/icons/20';
import { Check as CheckSm } from '@/icons/16';
import { StatusPill, TabChip, Tabs, Toggle } from '@/staging';
import type { StatusPillTone } from '@/staging';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';
import { useDevState } from '../dev-state-context';
import { MapRankingBody } from './MapRankingBody';

type SeoAeoTab = 'dashboard' | 'analytics' | 'seo-analytics' | 'map-pack' | 'settings';

// ─── DASHBOARD DATA ───────────────────────────────────────────────────

type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
type PostStatus = 'Review' | 'Queued';
type TopicCluster = 'Best Painters in Austin' | 'Interior Paint Colors' | 'Cabinet Painting Cost Guide' | 'Exterior Painting in Texas Heat';

interface ContentRow {
  num: number;
  cluster: TopicCluster;
  keyword: string;
  title: string;
  searchVol: string;
  aiVol: string;
  difficulty: DifficultyLevel;
  scheduled: string;
  aeoGain: string;
  status: PostStatus;
}

const CONTENT_ROWS: ContentRow[] = [
  { num: 1, cluster: 'Best Painters in Austin',           keyword: 'best painters austin 2026',            title: 'The 7 best painters in Austin for 2026',                       searchVol: '14.2K', aiVol: '9.9K', difficulty: 'Hard',   scheduled: 'May 19', aeoGain: '+0.5 pts', status: 'Review'  },
  { num: 2, cluster: 'Best Painters in Austin',           keyword: 'house painters austin TX',             title: 'How to choose a house painter in Austin without getting burned', searchVol: '5.4K',  aiVol: '3.2K', difficulty: 'Medium', scheduled: 'May 22', aeoGain: '+0.4 pts', status: 'Queued'  },
  { num: 3, cluster: 'Best Painters in Austin',           keyword: 'painter near me',                      title: 'Why "painter near me" matters more than you think',             searchVol: '1.2K',  aiVol: '480',  difficulty: 'Easy',   scheduled: 'May 26', aeoGain: '+0.3 pts', status: 'Queued'  },
  { num: 4, cluster: 'Interior Paint Colors',             keyword: 'interior painting austin',             title: 'Interior paint colors trending in Austin homes this year',      searchVol: '9.1K',  aiVol: '6.8K', difficulty: 'Medium', scheduled: 'May 28', aeoGain: '+0.4 pts', status: 'Review'  },
  { num: 5, cluster: 'Interior Paint Colors',             keyword: 'low-VOC interior paint',               title: 'Low-VOC interior paint: what families and pet owners should know', searchVol: '6.3K', aiVol: '4.1K', difficulty: 'Easy',  scheduled: 'Jun 2',  aeoGain: '+0.3 pts', status: 'Queued'  },
  { num: 6, cluster: 'Cabinet Painting Cost Guide',       keyword: 'cabinet painting austin',              title: 'Cabinet painting cost in Austin — refinish vs replace in 2026',  searchVol: '7.8K',  aiVol: '5.5K', difficulty: 'Medium', scheduled: 'Jun 5',  aeoGain: '+0.4 pts', status: 'Queued'  },
  { num: 7, cluster: 'Cabinet Painting Cost Guide',       keyword: 'kitchen cabinet refinishing',          title: 'How long does a cabinet refinishing project actually take?',    searchVol: '3.2K',  aiVol: '2.1K', difficulty: 'Easy',   scheduled: 'Jun 9',  aeoGain: '+0.3 pts', status: 'Queued'  },
  { num: 8, cluster: 'Exterior Painting in Texas Heat',   keyword: 'exterior painting austin',             title: '8 exterior paint colors that survive Texas heat',               searchVol: '5.9K',  aiVol: '3.8K', difficulty: 'Medium', scheduled: 'Jun 12', aeoGain: '+0.4 pts', status: 'Queued'  },
];

// Neutral palette for difficulty — the table reads as data, not status
// changes, so we keep tones quiet (no yellow/orange).
const DIFFICULTY_TONE: Record<DifficultyLevel, StatusPillTone> = {
  Hard:   'neutral',
  Medium: 'neutral',
  Easy:   'neutral',
};

const STATUS_TONE: Record<PostStatus, StatusPillTone> = {
  Review: 'accent',
  Queued: 'neutral',
};

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
  { icon: '🎨', title: 'The complete guide to hiring a painter in Austin (2026)',    type: 'Blog',    date: 'Mar 18', platforms: 'ChatGPT + Perplexity', citations: 18 },
  { icon: '🏠', title: 'Cabinet refinishing vs replacement — Austin cost guide',     type: 'Blog',    date: 'Apr 2',  platforms: 'ChatGPT',              citations: 11 },
  { icon: '✅', title: '7 things to look for when hiring an Austin painter',          type: 'Blog',    date: 'Mar 28', platforms: 'ChatGPT',              citations: 9  },
  { icon: '🔍', title: 'CertaPro Painters of Austin — services & service area',       type: 'Landing', date: 'Apr 10', platforms: 'Perplexity',           citations: 6  },
  { icon: '🌞', title: 'Exterior paint colors that survive Texas heat',               type: 'Blog',    date: 'Apr 7',  platforms: 'Perplexity',           citations: 3  },
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

function ConfigureModal({ onClose }: { onClose: () => void }) {
  const [structure, setStructure] = useState<'answer-first' | 'traditional'>('answer-first');
  const [faq, setFaq] = useState<'end' | 'inline' | 'off'>('end');
  const [schema, setSchema] = useState<'both' | 'faq-only' | 'none'>('both');

  const platforms = ['Google', 'ChatGPT', 'Perplexity', 'Gemini'];

  const impacts: Record<string, Record<string, { dots: number; label: string; color: string }>> = {
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

  const ImpactDots = ({ dots, color }: { dots: number; color: string }) => (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i <= dots ? color : 'var(--dark-15)' }} />
      ))}
    </div>
  );

  // Selectable tile — no radio circle. Selection = dark-90 border + dark-4 fill.
  const RadioOption = ({ checked, onSelect, label, sublabel }: { checked: boolean; onSelect: () => void; label: string; sublabel?: string }) => (
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

  const activeImpact = structure === 'answer-first' ? impacts.structure : ({} as typeof impacts.structure);

  const currentImpacts = {
    Google:     impacts.structure.Google,
    ChatGPT:    impacts.faq.ChatGPT,
    Perplexity: impacts.faq.Perplexity,
    Gemini:     impacts.schema.Gemini,
  };

  const settingImpactMap: Record<string, typeof impacts.structure> = {
    'Post structure': impacts.structure,
    'FAQ blocks': impacts.faq,
    'Schema markup': impacts.schema,
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Setting 1 */}
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

          {/* Setting 2 */}
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

          {/* Setting 3 */}
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

          {/* Impact table — looks like the rest of the page's tables now. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Heading level={3} style={{ display: 'block' }}>Ranking impact of your current settings</Heading>
            <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--dark-60)', borderBottom: '1px solid var(--dark-4)', whiteSpace: 'nowrap', width: '34%' }}>Setting</th>
                    {platforms.map((p) => (
                      <th key={p} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 400, fontSize: 12, color: 'var(--dark-60)', borderBottom: '1px solid var(--dark-4)', whiteSpace: 'nowrap' }}>{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(settingImpactMap).map(([label, imp]) => (
                    <tr key={label}>
                      <td style={{ padding: '14px 12px', fontSize: 14, color: 'var(--dark-90)', borderBottom: '1px solid var(--dark-4)' }}>{label}</td>
                      {platforms.map((p) => (
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
        <Text slot="left" variant="secondary" style={{ color: 'var(--dark-60)' }}>
          Fix the 3 issues above to unlock +4 AEO pts
        </Text>
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

// ─── DASHBOARD TAB ────────────────────────────────────────────────────

/** Row in the "Posts Blaze will generate for you" table. View button only
 *  appears on hover, anchored next to the title. */
function PostsTableRow({
  row,
  isReview,
  tdStyle,
  onView,
}: {
  row: ContentRow;
  isReview: boolean;
  tdStyle: React.CSSProperties;
  onView: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const titleColor = 'var(--dark-90)';
  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <td style={{ ...tdStyle, color: 'var(--dark-40)' }}>{row.num}</td>
      {/* Combined Title / Topic / Keyword cell — title is the lead, topic
          + keyword line collapse beneath at 12px since they're repetitive
          across rows. View / Approve buttons only appear on hover here so
          the Action column can go away entirely. */}
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <Text variant="secondary" style={{ display: 'block', color: titleColor }}>
              {row.title}
            </Text>
            <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
              {row.cluster} · "{row.keyword}"
            </Text>
          </div>
          <div style={{ display: 'flex', gap: 6, opacity: hovered ? 1 : 0, transition: 'opacity 120ms', flexShrink: 0 }}>
            {isReview ? (
              <>
                <Button size="sm" variant="secondary">Approve</Button>
                <Button size="sm" variant="secondary" onClick={onView}>View</Button>
              </>
            ) : (
              <Button size="sm" variant="secondary">Generate</Button>
            )}
          </div>
        </div>
      </td>
      <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: 'var(--dark-60)' }}>{row.searchVol}</span>
        <span style={{ color: 'var(--dark-15)', margin: '0 4px' }}>/</span>
        <span style={{ color: 'var(--dark-90)' }}>{row.aiVol}</span>
      </td>
      <td style={tdStyle}>
        <StatusPill tone={DIFFICULTY_TONE[row.difficulty]}>{row.difficulty}</StatusPill>
      </td>
      <td style={{ ...tdStyle, color: 'var(--dark-60)' }}>{row.scheduled}</td>
      <td style={{ ...tdStyle, textAlign: 'center' }}>
        <AeoBadge label={row.aeoGain} />
      </td>
      <td style={tdStyle}>
        <StatusPill tone={STATUS_TONE[row.status]}>{row.status}</StatusPill>
      </td>
    </tr>
  );
}

function DashboardTab() {
  const [clusterFilter, setClusterFilter] = useState<ClusterFilter>('all');
  const [activeModal, setActiveModal] = useState<'configure' | 'setup' | 'view-post' | null>(null);
  const [viewPostRow, setViewPostRow] = useState<ContentRow | null>(null);

  const filtered = clusterFilter === 'all'
    ? CONTENT_ROWS
    : CONTENT_ROWS.filter((r) => r.cluster === clusterFilter);

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

      {/* Setup banner — matches the Paid Social / Paid Search creative-fatigue
          panel pattern: neutral dark-2 surface, dark-4 border, AlertTriangle
          icon in status-connect carries the warning weight. No yellow/orange
          palette on the chrome itself. */}
      <div style={{ borderRadius: 12, background: 'var(--dark-2)', border: '1px solid var(--dark-4)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--dark-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--status-connect)" />
            <Text variant="secondary" style={{ fontWeight: 500, color: 'var(--dark-90)' }}>
              Complete setup before Blaze can generate content · 2 steps remaining
            </Text>
          </div>
          <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
            Under 5 minutes total
          </Text>
        </div>
        {[
          { num: 1, title: 'Answer-first structure + FAQ blocks', desc: 'Configure how every generated post is formatted so AI engines cite it more often.', pts: '+6 pts', cta: 'Configure', modal: 'configure' as const },
          { num: 2, title: 'Entity profile & brand consistency', desc: 'Set your canonical brand description so AI engines recognize CertaPro Painters of Austin as a single authoritative source.', pts: '+4 pts', cta: 'Set up', modal: 'setup' as const },
        ].map((step, i, arr) => (
          <button
            key={step.num}
            type="button"
            onClick={() => setActiveModal(step.modal)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: i < arr.length - 1 ? '1px solid var(--dark-4)' : 'none',
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
            <Text variant="metadata" style={{ color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>
              {step.pts}
            </Text>
            <ArrowRight size={16} color="var(--dark-40)" />
          </button>
        ))}
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
        <ClusterFilterChips active={clusterFilter} onChange={setClusterFilter} />
      </div>

      <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 36 }} />
            <col />
            <col style={{ width: 130 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 100 }} />
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Title / topic</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Search / AI vol.</th>
              <th style={thStyle}>Difficulty</th>
              <th style={thStyle}>Scheduled</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>AEO / post</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const isReview = row.status === 'Review';
              return (
                <PostsTableRow
                  key={row.num}
                  row={row}
                  isReview={isReview}
                  tdStyle={tdStyle}
                  onView={() => { setViewPostRow(row); setActiveModal('view-post'); }}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {activeModal === 'configure' && <ConfigureModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'setup' && <SetupModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'view-post' && <ViewPostModal row={viewPostRow} onClose={() => setActiveModal(null)} />}
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
              { label: 'Perplexity', value: '#3' },
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
              { label: 'Perplexity', value: '11' },
              { label: 'Google AI', value: '—' },
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
            <Heading level={3} style={{ display: 'block' }}>Content → Citation Map</Heading>
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
  { label: 'Cabinet Painting Cost Guide',     keywords: 31, reason: 'Trending upward on Perplexity in the last 30 days' },
  { label: 'Exterior Painting in Texas Heat', keywords: 24, reason: 'Low difficulty, quick citation wins' },
  { label: 'HOA & Commercial Repaints',       keywords: 19, reason: 'Commercial intent — high conversion value' },
];

const AI_SURFACES = [
  { id: 'chatgpt',   label: 'ChatGPT',              desc: 'Via Bing web browsing. Requires Bing indexing.', icon: '✦', color: '#10A37F' },
  { id: 'perplexity', label: 'Perplexity',          desc: 'High citation volume (~22 sources/response). Recency-sensitive.', icon: '◎', color: '#6366F1' },
  { id: 'google',    label: 'Google AI Overviews',   desc: 'E-E-A-T + schema signals. Pulls from top 30% of page.', icon: '⬡', color: '#4285F4' },
];

/** Section block for the Settings tab. Title + subtitle sit OUTSIDE the
 *  bordered card so the chrome is just the content. */
function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

function SetupTab() {
  const [selectedClusters, setSelectedClusters] = useState<Set<string>>(
    new Set(['Best Painters in Austin', 'Interior Paint Colors', 'Cabinet Painting Cost Guide'])
  );
  const [selectedSurfaces, setSelectedSurfaces] = useState<Set<string>>(
    new Set(['chatgpt', 'perplexity', 'google'])
  );

  function toggleCluster(label: string) {
    setSelectedClusters(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  function toggleSurface(id: string) {
    setSelectedSurfaces(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div style={{ padding: '24px 28px 24px', maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Brand Description */}
      <SectionCard
        title="Brand description"
        subtitle="Pulled from your Brand Kit. Blaze embeds this in every generated post so AI engines recognize CertaPro Painters of Austin as an authoritative source."
      >
        <div style={{ background: 'var(--dark-4)', border: '1px solid var(--dark-4)', borderRadius: 8, padding: '14px 16px' }}>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)', lineHeight: 1.6 }}>
            CertaPro Painters of Austin is your local painting contractor serving homeowners and commercial properties across the Austin metro. We handle interior and exterior painting, cabinet refinishing, color consultation, deck & fence staining, drywall repair, power washing, stucco repair, and wood rot repair. We make the process easy and convenient — clear estimates, respectful crews, and finishes that last.
          </Text>
        </div>
        <Button variant="ghost" size="sm" endIcon={ArrowRight} style={{ marginTop: 10 }}>
          Edit in Brand Kit
        </Button>
      </SectionCard>

      {/* Seed Topic Clusters */}
      <SectionCard
        title="Seed topic clusters"
        subtitle="Select the clusters Blaze will generate SEO/AEO content for. Recommendations are based on AI search volume and citation gap analysis."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {SEED_CLUSTERS.map((cluster, i) => {
            const selected = selectedClusters.has(cluster.label);
            return (
              <div
                key={cluster.label}
                onClick={() => toggleCluster(cluster.label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 0',
                  borderBottom: i < SEED_CLUSTERS.length - 1 ? '1px solid var(--dark-4)' : undefined,
                  cursor: 'pointer',
                }}
              >
                {selected ? (
                  <CheckboxChecked size={20} />
                ) : (
                  <span style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid var(--dark-15)', flexShrink: 0, display: 'block' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-90)' }}>{cluster.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-40)', marginTop: 1 }}>{cluster.reason}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>{cluster.keywords} keywords</div>
              </div>
            );
          })}
        </div>
        <button style={{ marginTop: 14, background: 'none', border: '1px dashed var(--dark-15)', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', color: 'var(--dark-60)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', width: '100%' }}>
          + Add custom cluster
        </button>
      </SectionCard>

      {/* Target AI Surfaces */}
      <SectionCard
        title="Target AI surfaces"
        subtitle="All three use compatible citation signals — a single post can earn citations across all of them simultaneously."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {AI_SURFACES.map((surface, i) => {
            const selected = selectedSurfaces.has(surface.id);
            return (
              <div
                key={surface.id}
                onClick={() => toggleSurface(surface.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 0',
                  borderBottom: i < AI_SURFACES.length - 1 ? '1px solid var(--dark-4)' : undefined,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  border: selected ? `1px solid ${surface.color}` : '1px solid var(--dark-4)',
                  background: selected ? surface.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selected && <span style={{ color: 'var(--light-100)', fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: selected ? `${surface.color}18` : 'var(--dark-4)',
                  border: `1px solid ${selected ? surface.color + '40' : 'var(--dark-8)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                  color: surface.color,
                  transition: 'all 0.15s',
                }}>
                  {surface.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-90)' }}>{surface.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-40)', marginTop: 1 }}>{surface.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Generation settings */}
      <SectionCard title="Generation settings" subtitle="Control how Blaze generates and publishes SEO/AEO content.">
        <div style={{ marginTop: -12 }}>
          <ToggleRow
            label="Auto-publish"
            desc="Blaze publishes approved posts automatically on their scheduled date. Turn off to require manual approval before each post goes live."
            defaultOn={false}
          />
          <ToggleRow
            label="Answer-first structure"
            desc="Every post opens with a direct answer in the first 40–60 words — the primary citation trigger for ChatGPT, Perplexity, and Google AI Overviews."
            defaultOn={true}
          />
          <ToggleRow
            label="FAQ blocks"
            desc="Appends a structured FAQ section with FAQPage schema markup to every post. Strongly favored by Perplexity and Google AI Overviews."
            defaultOn={true}
          />
          <div style={{ paddingTop: 12 }}>
            <ToggleRow
              label="Include freshness signals"
              desc="Adds the current year to post titles and headings. Improves Perplexity citation rate by ~30%. Posts are flagged for quarterly refresh."
              defaultOn={true}
            />
          </div>
        </div>
      </SectionCard>

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

      {/* 3 ── Conversions from Organic — title + stat outside the card. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={3} style={{ display: 'block' }}>Conversions from Organic</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>Visitors from search taking a valuable action</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 400, color: 'var(--dark-90)', lineHeight: 1 }}>142</span>
            <Text variant="secondary" style={{ color: 'var(--green-50)' }}>↑ +12% vs. last month</Text>
          </div>
        </div>
        <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Conversion event</th>
              <th style={{ ...thStyle, width: 130 }}>Source</th>
              <th style={{ ...thStyle, width: 100, textAlign: 'right' }}>Conversions</th>
              <th style={{ ...thStyle, width: 90, textAlign: 'right' }}>Conv. rate</th>
              <th style={{ ...thStyle, width: 100 }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {CONVERSION_ROWS.map((r) => (
              <tr key={r.event}>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{r.event}</td>
                <td style={{ ...tdStyle, color: 'var(--dark-60)' }}>{r.source}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{r.conversions}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--dark-60)' }}>{r.convRate}</td>
                <td style={{ ...tdStyle, color: r.trendUp ? 'var(--green-50)' : 'var(--dark-40)' }}>{r.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--dark-4)', display: 'flex', gap: 24 }}>
          <div>
            <Text variant="metadata" style={{ color: 'var(--dark-40)', display: 'block' }}>Overall conv. rate</Text>
            <Text variant="secondary" style={{ fontWeight: 600, color: 'var(--dark-90)' }}>2.9%</Text>
          </div>
          <div>
            <Text variant="metadata" style={{ color: 'var(--dark-40)', display: 'block' }}>Organic share of all conversions</Text>
            <Text variant="secondary" style={{ fontWeight: 600, color: 'var(--dark-90)' }}>38%</Text>
          </div>
          <div>
            <Text variant="metadata" style={{ color: 'var(--dark-40)', display: 'block' }}>Top converting page</Text>
            <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>/austin/blog/best-painters-austin</Text>
          </div>
        </div>
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

const ONBOARDING_CLUSTERS: { label: string; keywords: number; kd: number; vol: string; defaultChecked: boolean }[] = [
  { label: 'Best Painters in Austin',           keywords: 13, kd: 3.0,  vol: '40.5k', defaultChecked: true  },
  { label: 'Interior Paint Colors',             keywords: 8,  kd: 7.0,  vol: '74k',   defaultChecked: true  },
  { label: 'Cabinet Painting Cost Guide',       keywords: 11, kd: 0.0,  vol: '3.6k',  defaultChecked: true  },
  { label: 'Exterior Painting in Texas Heat',   keywords: 13, kd: 16.0, vol: '6.6k',  defaultChecked: false },
  { label: 'HOA & Commercial Repaints',         keywords: 9,  kd: 4.0,  vol: '12.1k', defaultChecked: false },
  { label: 'How to Find an Austin Painter',     keywords: 11, kd: 11.0, vol: '301k',  defaultChecked: false },
];

const PLATFORM_OPTIONS = [
  { id: 'wordpress', label: 'WordPress',  icon: '◼', color: '#21759B' },
  { id: 'wix',       label: 'Wix',        icon: 'W', color: '#000000' },
  { id: 'webflow',   label: 'Webflow',    icon: '⬡', color: '#4353FF' },
  { id: 'custom',    label: 'Custom/API', icon: '⌥', color: '#6B7280' },
];

type OnboardingStep = 'landing' | 'clusters' | 'platform' | 'done';

function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<OnboardingStep>('landing');
  const [selectedClusters, setSelectedClusters] = useState<Set<string>>(
    new Set(ONBOARDING_CLUSTERS.filter((c) => c.defaultChecked).map((c) => c.label))
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

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
      <H2Layout title="SEO Relevance Plan">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '72vh', padding: '40px 24px', textAlign: 'center' }}>

          {/* Hero card */}
          <div style={{ width: 560, maxWidth: '100%', height: 288, borderRadius: 16, background: 'var(--green-50)', marginBottom: 32, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 36px', gap: 24 }}>
            {/* Mock blog post card */}
            <div style={{ width: 210, background: 'var(--light-100)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.22)', flexShrink: 0 }}>
              <div style={{ height: 80, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📝</div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--dark-90)', lineHeight: 1.4, marginBottom: 4 }}>The 7 best painters in Austin for 2026</div>
                <div style={{ fontSize: 10, color: 'var(--dark-60)' }}>July 8, 2026</div>
                <div style={{ fontSize: 10, color: 'var(--dark-60)', marginTop: 4, lineHeight: 1.5 }}>Hiring a painter in Austin is more than picking the lowest bid. The right crew balances prep work, paint quality, and...</div>
              </div>
            </div>

            {/* Right side: platform icons + trend arrow */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 46, height: 46, background: 'var(--light-100)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', fontWeight: 800, fontSize: 15, color: '#000' }}>W</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 40, height: 40, background: 'var(--light-100)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', fontSize: 18 }}>📊</div>
                  <div style={{ width: 40, height: 40, background: 'var(--light-100)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', fontSize: 18 }}>🌐</div>
                </div>
              </div>
              <svg width="88" height="56" viewBox="0 0 88 56" fill="none">
                <polyline points="4,52 22,42 38,30 54,18 70,8 82,3" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                <polyline points="75,1 82,3 80,10" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <Heading level={1} style={{ marginBottom: 12, lineHeight: 1.15, maxWidth: 460 }}>
            Let Blaze grow your blog traffic for you
          </Heading>
          <div style={{ fontSize: 15, color: 'var(--dark-60)', lineHeight: 1.65, maxWidth: 520, marginBottom: 28 }}>
            Choose a topic and Blaze automatically writes and publishes a set of related posts. Together they signal to Google and AI search engines that your site is an authority — and your rankings climb.
          </div>

          {/* SEO + AEO value props */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 32 }}>
            {[
              { icon: '📈', label: 'SEO Rankings', bg: '#dcfce7' },
              { icon: '✦', label: 'AI Citations', bg: '#ede9fe' },
              { icon: '🏆', label: 'Brand Authority', bg: '#fef9c3' },
            ].map((item, i, arr) => (
              <Fragment key={item.label}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 44, height: 44, background: item.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</div>
                  <Text variant="metadata" style={{ fontWeight: 500, color: 'var(--dark-60)' }}>{item.label}</Text>
                </div>
                {i < arr.length - 1 && <span style={{ color: 'var(--dark-15)', fontSize: 20 }}>→</span>}
              </Fragment>
            ))}
          </div>

          <Button variant="primary" size="lg" onPress={() => setStep('clusters')}>
            Set Up My SEO Plan
          </Button>
        </div>
      </H2Layout>
    );
  }

  // Modal content per step
  let modalContent: React.ReactNode;

  if (step === 'clusters') {
    const canConfirm = selectedClusters.size === 3;
    modalContent = (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <Heading level={3}>Pick 3 topic clusters to rank for.</Heading>
          <IconButton icon={Close} variant="ghost" onPress={() => setStep('landing')} aria-label="Close onboarding" />
        </div>
        <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.6, marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px' }}>Topic clusters are groups of related posts linked to one main topic. Publishing around the same subject signals authority to Google — helping you rank higher.</p>
          <p style={{ margin: 0 }}>We've pre-selected 3 clusters based on search volume and competition. Confirm or swap them out.</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ paddingBottom: 10, textAlign: 'left', fontSize: 12, color: 'var(--dark-40)', fontWeight: 600, borderBottom: '1px solid var(--dark-4)' }}>Topic cluster</th>
              <th style={{ paddingBottom: 10, textAlign: 'right', fontSize: 12, color: 'var(--dark-40)', fontWeight: 600, borderBottom: '1px solid var(--dark-4)', paddingRight: 20 }}>KD</th>
              <th style={{ paddingBottom: 10, textAlign: 'right', fontSize: 12, color: 'var(--dark-40)', fontWeight: 600, borderBottom: '1px solid var(--dark-4)' }}>Vol.</th>
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
                  <td style={{ padding: '13px 0', borderBottom: '1px solid var(--dark-4)', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {checked ? (
                        <CheckboxChecked size={20} />
                      ) : (
                        <span style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid var(--dark-15)', flexShrink: 0, display: 'block' }} />
                      )}
                      <span style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: checked ? 600 : 400 }}>
                        {c.label}
                        <span style={{ color: 'var(--dark-40)', fontWeight: 400, fontSize: 12 }}> including {c.keywords} ke...</span>
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 20px 13px 0', borderBottom: '1px solid var(--dark-4)', textAlign: 'right', fontSize: 14, color: 'var(--dark-90)', verticalAlign: 'middle' }}>{c.kd.toFixed(1)}</td>
                  <td style={{ padding: '13px 0', borderBottom: '1px solid var(--dark-4)', textAlign: 'right', fontSize: 14, color: 'var(--dark-90)', verticalAlign: 'middle' }}>{c.vol}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <Button
            variant="ghost"
            onPress={() => setSelectedClusters(new Set(ONBOARDING_CLUSTERS.filter((c) => c.defaultChecked).map((c) => c.label)))}
          >
            Reset My Topic Focus
          </Button>
          <Button
            variant="primary"
            isDisabled={!canConfirm}
            onPress={() => canConfirm && setStep('platform')}
          >
            Confirm {selectedClusters.size === 3 ? '3' : selectedClusters.size} Topic Cluster{selectedClusters.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </>
    );
  } else if (step === 'platform') {
    modalContent = (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <Heading level={3}>Connect your publishing platform</Heading>
          <IconButton icon={Close} variant="ghost" onPress={() => setStep('landing')} aria-label="Close onboarding" />
        </div>
        <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.6, marginBottom: 24 }}>
          Blaze will publish directly to your site on schedule. Select your platform to connect.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {PLATFORM_OPTIONS.map((p) => {
            const selected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 10, border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-4)'}`, background: selected ? 'var(--light-100)' : 'var(--dark-4)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${p.color}18`, border: `1px solid ${p.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: p.color, flexShrink: 0 }}>
                  {p.icon}
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark-90)' }}>{p.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="ghost" frontIcon={ArrowLeft} onPress={() => setStep('clusters')}>
            Back
          </Button>
          <Button
            variant="primary"
            isDisabled={!selectedPlatform}
            endIcon={ArrowRight}
            onPress={() => selectedPlatform && setStep('done')}
          >
            Continue
          </Button>
        </div>
      </>
    );
  } else {
    const platformLabel = PLATFORM_OPTIONS.find((p) => p.id === selectedPlatform)?.label ?? 'Platform';
    modalContent = (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <Heading level={3} style={{ marginBottom: 10 }}>You're all set!</Heading>
        <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 28px' }}>
          Blaze is generating your first batch of SEO + AEO-optimized posts. Expect your first post ready for review shortly.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, textAlign: 'left', maxWidth: 320, margin: '0 auto 32px' }}>
          {[
            `${selectedClusters.size} topic clusters confirmed`,
            `${platformLabel} connected`,
            'Generation schedule set — weekly cadence',
          ].map((text) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#dcfce7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--green-50)', flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
        <Button variant="primary" size="lg" endIcon={ArrowRight} onPress={onComplete}>
          Go to my SEO plan
        </Button>
      </div>
    );
  }

  return (
    <H2Layout title="SEO Relevance Plan">
      <ModalBackdrop onClose={() => setStep('landing')} size="md">
        <Modal.Content compact={false}>{modalContent}</Modal.Content>
      </ModalBackdrop>
    </H2Layout>
  );
}

// ─── ADD CLUSTER MODAL ────────────────────────────────────────────────

const ADD_CLUSTER_ROWS: {
  label: string;
  keywords: number;
  kd: number;
  searchVol: string;
  aiVol: string;
  recommended?: boolean;
}[] = [
  { label: 'How to Find an Austin Painter',       keywords: 11, kd: 11.0, searchVol: '301k',  aiVol: '18.2k', recommended: true  },
  { label: 'Deck & Fence Staining in Austin',     keywords: 9,  kd:  6.0, searchVol: '22.3k', aiVol: '9.1k',  recommended: true  },
  { label: 'Stucco Repair & Repainting',          keywords: 12, kd:  5.0, searchVol: '12.4k', aiVol: '7.8k',  recommended: false },
  { label: 'Wood Rot Repair Before Painting',     keywords: 8,  kd:  3.0, searchVol: '8.1k',  aiVol: '5.2k',  recommended: false },
  { label: 'Color Consultation for Austin Homes', keywords: 10, kd:  2.0, searchVol: '5.9k',  aiVol: '4.4k',  recommended: false },
  { label: 'HOA & Commercial Repaints',           keywords: 11, kd:  0.0, searchVol: '3.6k',  aiVol: '2.1k',  recommended: false },
  { label: 'Power Washing Before Painting',       keywords: 7,  kd:  4.0, searchVol: '2.8k',  aiVol: '1.9k',  recommended: false },
];

function AddClusterModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(ADD_CLUSTER_ROWS[0].label);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? ADD_CLUSTER_ROWS : ADD_CLUSTER_ROWS.slice(0, 6);
  const hidden = ADD_CLUSTER_ROWS.length - 6;

  const thStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--dark-40)',
    paddingBottom: 10,
    borderBottom: '1px solid var(--dark-4)',
    textAlign: 'left',
  };

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
                <th style={{ ...thStyle, width: '50%' }}>Topic cluster</th>
                <th style={{ ...thStyle, textAlign: 'right', paddingRight: 20 }}>KD</th>
                <th style={{ ...thStyle, textAlign: 'right', paddingRight: 20 }}>Search Vol.</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>AI Vol.</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const isSelected = selected === row.label;
                const cellBorder = isSelected ? '1px solid var(--dark-90)' : '1px solid var(--dark-4)';
                return (
                  <tr
                    key={row.label}
                    onClick={() => setSelected(isSelected ? null : row.label)}
                    style={{ cursor: 'pointer', background: isSelected ? 'var(--light-100)' : 'var(--dark-4)' }}
                  >
                    <td style={{ padding: '14px 12px', borderBottom: cellBorder, verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text variant="primary" style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{row.label}</Text>
                        {row.recommended && (
                          <StatusPill tone="success" size="sm">Top pick</StatusPill>
                        )}
                      </div>
                      <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>including {row.keywords} keywords</Text>
                    </td>
                    <td style={{ padding: '14px 20px 14px 0', textAlign: 'right', fontSize: 14, color: 'var(--dark-60)', borderBottom: cellBorder, fontVariantNumeric: 'tabular-nums' }}>
                      {row.kd.toFixed(1)}
                    </td>
                    <td style={{ padding: '14px 20px 14px 0', textAlign: 'right', fontSize: 14, color: 'var(--dark-90)', borderBottom: cellBorder, fontVariantNumeric: 'tabular-nums' }}>
                      {row.searchVol}
                    </td>
                    <td style={{ padding: '14px 0', textAlign: 'right', fontSize: 14, color: 'var(--dark-90)', borderBottom: cellBorder, fontVariantNumeric: 'tabular-nums' }}>
                      {row.aiVol}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!showAll && hidden > 0 && (
            <Button variant="ghost" size="sm" endIcon={ChevronDown} style={{ marginTop: 12 }} onPress={() => setShowAll(true)}>
              See {hidden} more
            </Button>
          )}

      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterButton
          slot="left"
          variant="ghost"
          onPress={() => setSelected(ADD_CLUSTER_ROWS[0].label)}
        >
          Reset recommendation
        </Modal.FooterButton>
        <Modal.FooterContent>
          <Modal.FooterButton
            variant="primary"
            isDisabled={!selected}
            onPress={onClose}
          >
            Add topic cluster
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
  const [showAddCluster, setShowAddCluster] = useState(false);

  if (devState === 'cold' && tab !== 'map-pack') {
    // "Go to my SEO plan" → flip the dev-state to 'steady' so the next
    // render shows the dashboard. The DevStatePanel toggle remains the
    // other way to swap views. Map Pack handles its own cold view (the
    // audit) inside <MapRankingBody>, so when that tab is active we let
    // the render fall through.
    return <OnboardingFlow onComplete={() => setState('/h2/seo-aeo', 'steady')} />;
  }

  const topbarCenter = (
    <div style={{ display: 'flex', gap: 4 }}>
      <TabChip selected={tab === 'dashboard'} onSelect={() => setTab('dashboard')}>Dashboard</TabChip>
      <TabChip selected={tab === 'seo-analytics'} onSelect={() => setTab('seo-analytics')}>SEO Analytics</TabChip>
      <TabChip selected={tab === 'analytics'} onSelect={() => setTab('analytics')}>AEO Analytics</TabChip>
      <TabChip selected={tab === 'map-pack'} onSelect={() => setTab('map-pack')}>Map Pack</TabChip>
      <TabChip selected={tab === 'settings'} onSelect={() => setTab('settings')}>Settings</TabChip>
    </div>
  );

  // Auto-publish lives inside Settings — see SetupTab. Topbar keeps the
  // Add-topic-cluster + Generate-report actions for the SEO/AEO data tabs;
  // Map Pack owns its own internal CTAs and shouldn't surface them either.
  const topbarRight = tab === 'settings' || tab === 'map-pack' ? null : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Button variant="tertiary" onClick={() => setShowAddCluster(true)}>
        <Plus size={16} />
        Add topic cluster
      </Button>
      <GenerateReportButton />
    </div>
  );

  return (
    <H2Layout topbarCenter={topbarCenter} topbarRight={topbarRight ?? undefined}>
      {tab === 'dashboard' ? (
        <DashboardTab />
      ) : tab === 'analytics' ? (
        <AnalyticsTab />
      ) : tab === 'seo-analytics' ? (
        <SeoAnalyticsTab />
      ) : tab === 'map-pack' ? (
        // Share the parent /h2/seo-aeo dev-state key so the floating
        // <DevStatePanel> cold/steady toggle drives Map Pack's audit/home
        // view directly. The cold→onboarding early-return above is gated
        // on `tab !== 'map-pack'`, so flipping to cold here shows the
        // Map Pack audit instead of the SEO Plan onboarding.
        <MapRankingBody devStatePath="/h2/seo-aeo" />
      ) : (
        <SetupTab />
      )}
      {showAddCluster && <AddClusterModal onClose={() => setShowAddCluster(false)} />}
      {tab === 'settings' && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--light-100)',
            borderTop: '1px solid var(--dark-4)',
            padding: 16,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            marginTop: 'auto',
          }}
        >
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save settings</Button>
        </div>
      )}
    </H2Layout>
  );
}
