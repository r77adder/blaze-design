import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Heading, Modal, ModalStack, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { useToast } from '@/staging';
import { H2Layout } from '../H2Layout';
import { useDevState } from '../dev-state-context';

/**
 * /h2/seo-aeo — deep port of `~/dev/Blaze H2 Features/seo-aeo.html`.
 *
 * Setup gate (localStorage 'blaze_aeo_setup') → 5-tab steady state:
 *   - Overview (Approval queue + summary stats + filter pills)
 *   - Citations (sparkline hero + filter row + matrix; click cell → drawer)
 *   - Brand facts (status counts + bar + accordion table)
 *   - Content (suggested briefs + generating + done states)
 *   - Trends (KPI cards + share-over-time SVG)
 *
 * Setup screen replays via `?reset=1` query param OR the "Reset setup" pill
 * in the Overview tab summary row. Cell drawer uses a vetted Modal in lieu
 * of a slide-in drawer for chrome consistency.
 */

const STORAGE_KEY = 'blaze_aeo_setup';

type TabId = 'overview' | 'citations' | 'facts' | 'content' | 'trends';

// ─── DATA ─────────────────────────────────────────────────────────────

const TOOLS: { id: string; name: string; logo: string; color: string }[] = [
  { id: 'chatgpt', name: 'ChatGPT', logo: 'G', color: '#10A37F' },
  { id: 'claude', name: 'Claude', logo: 'C', color: '#D97757' },
  { id: 'perplexity', name: 'Perplexity', logo: 'P', color: '#1A1D55' },
  { id: 'gemini', name: 'Gemini', logo: 'G', color: '#4285F4' },
  { id: 'aio', name: 'AIO', logo: 'AI', color: '#0F9D58' },
];

const COMPETITORS: { name: string; letter: string; color: string }[] = [
  { name: 'Moon Juice', letter: 'M', color: '#1A1D55' },
  { name: 'Ritual', letter: 'R', color: '#F5C97B' },
  { name: 'Care/of', letter: 'C', color: '#FFAE00' },
  { name: 'Athletic Greens', letter: 'A', color: '#20A14F' },
  { name: 'Bloom Nutrition', letter: 'B', color: '#F51780' },
  { name: 'Goop Wellness', letter: 'G', color: '#AE2222' },
  { name: 'HUM Nutrition', letter: 'H', color: '#6A00FF' },
];

const ICPS = [
  'Wellness-curious women 28-45',
  'Performance-minded professionals',
  'Holistic health practitioners',
];

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

type ApprovalKind = 'issue' | 'content';
type ApprovalState = 'pending' | 'approved' | 'dismissed';
interface ApprovalItem {
  id: string;
  kind: ApprovalKind;
  sev: 'high' | 'med' | 'low';
  issue?: string;
  title?: string;
  format?: string;
  targetQuery?: string;
  detail: string;
  action: string;
  meta: string;
  tab: TabId;
  state: ApprovalState;
}

const APPROVAL_INITIAL: Omit<ApprovalItem, 'state'>[] = [
  { id: 'fix-founding', kind: 'issue', sev: 'high', issue: 'Gemini gets your founding year wrong', detail: 'Gemini tells users Radiant was founded in 2017 in New York by a team of nutritionists. Actual: 2019, LA, by Mara Chen.', action: 'Publish a corrective About-page update with founder bio, schema markup, and a press-release backlink.', meta: 'Brand fact · 1 page · ~400 words', tab: 'facts' },
  { id: 'gap-comparison-12', kind: 'issue', sev: 'high', issue: '12 high-intent comparison queries have no Blaze content', detail: 'Comparison and evaluation queries — your highest-converting type — currently have nothing crawlable on your domain.', action: 'Generate 12 content briefs (8 comparison pages, 4 evaluation roundups) and route to the writer pipeline.', meta: 'Citations · 12 briefs · est. 2 weeks', tab: 'citations' },
  { id: 'content-adaptogen-guide', kind: 'content', sev: 'high', title: "The Adaptogen Buyer's Guide: Ashwagandha vs Rhodiola vs Lion's Mane", format: 'Pillar comparison page', targetQuery: 'ashwagandha vs rhodiola which is better', detail: 'Moon Juice gained 4 citations on this query last week with a 2,400-word comparison hub. You have no page targeting it.', action: 'Generate a 2,200-word pillar with ComparisonTable + FAQ schema. Closes 3 citation gaps.', meta: 'Content · ~2,200 words · 2 days', tab: 'content' },
  { id: 'content-multivitamin', kind: 'content', sev: 'high', title: 'How to Choose a Daily Multivitamin (Evidence-Backed Framework)', format: "Buyer's guide article", targetQuery: 'how to choose a daily multivitamin', detail: 'Highest-volume educational query in your set with no Blaze content. Care/of and Ritual share the top 3 citations.', action: "Generate a 1,800-word how-to with HowTo + FAQ schema. Matches AI Overview's preferred long-form structure.", meta: 'Content · ~1,800 words · 3 days', tab: 'content' },
  { id: 'moonjuice-watch', kind: 'issue', sev: 'med', issue: 'Moon Juice gained citations on 4 of your target queries', detail: 'Their new "Adaptogens 101" hub started showing in ChatGPT and Perplexity in the last 7 days.', action: 'Run a competitive teardown of their hub and queue 3 counter-content briefs.', meta: 'Citations · 4 queries · 1 competitor', tab: 'citations' },
  { id: 'content-mushrooms', kind: 'content', sev: 'med', title: 'Are Functional Mushroom Supplements Worth It? (2026 Review)', format: 'Evaluation roundup', targetQuery: 'are functional mushroom supplements worth it', detail: 'All 5 AI tools currently cite competitors here. Evaluation queries convert 3× better than educational ones.', action: 'Generate a 2,000-word review with Review + AggregateRating schema. 0% citation share today.', meta: 'Content · ~2,000 words · 3 days', tab: 'content' },
  { id: 'weekly-recheck', kind: 'issue', sev: 'low', issue: 'Weekly brand fact re-check is due', detail: 'Last full sweep ran 7 days ago. Recommended cadence is weekly to catch model updates.', action: 'Run a fresh check across all 5 AI tools and 12 brand facts.', meta: 'Brand fact · ~2 min · automated', tab: 'facts' },
];

interface Suggestion {
  id: string;
  title: string;
  format: string;
  targetQuery: string;
  secondaryCount: number;
  intent: string;
  why: string;
  impact: 'high' | 'med';
  impactNote: string;
  seoNote: string;
  estTime: string;
  estWords: number;
}

const SUGGESTIONS: Suggestion[] = [
  { id: 's1', title: "The Adaptogen Buyer's Guide: Ashwagandha vs Rhodiola vs Lion's Mane", format: 'Pillar comparison page', targetQuery: 'ashwagandha vs rhodiola which is better', secondaryCount: 2, intent: 'Comparison', why: 'Moon Juice gained 4 citations on this query last week with a 2,400-word comparison hub. You have no page targeting it.', impact: 'high', impactNote: 'Closes 3 citation gaps · est. +5 ChatGPT/Perplexity mentions', seoNote: 'Schema: ComparisonTable + FAQ · Title length 58/60', estTime: '2 days', estWords: 2200 },
  { id: 's2', title: 'How to Choose a Daily Multivitamin (Evidence-Backed Framework)', format: "Buyer's guide article", targetQuery: 'how to choose a daily multivitamin', secondaryCount: 2, intent: 'Educational', why: 'Highest-volume educational query in your set with no Blaze content. Care/of and Ritual share the top 3 citations.', impact: 'high', impactNote: "Closes 2 gaps · matches AI Overview's preferred long-form structure", seoNote: 'Schema: HowTo + FAQ · target ~1,800 words', estTime: '3 days', estWords: 1800 },
  { id: 's3', title: "Lion's Mane Evidence Brief: 12 Studies on Cognitive Performance", format: 'Evidence-led explainer', targetQuery: "lion's mane benefits scientific evidence", secondaryCount: 2, intent: 'Educational', why: "Your existing Lion's Mane page is already cited by 4 of 5 AI tools. Replicating its format here will likely cite the same way.", impact: 'med', impactNote: 'Reuses winning page format · expected fast indexing', seoNote: 'Schema: ScholarlyArticle + ClaimReview · DOI links boost authority', estTime: '2 days', estWords: 1500 },
];

const TONES = ['Authoritative', 'Practical', 'Warm & accessible'];

// ─── DESIGN TOKENS / STYLE HELPERS ────────────────────────────────────

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

const CELL_GREEN = 'var(--status-approved)';
const CELL_RED_BG = 'rgba(188,1,11,0.10)';
const CELL_RED_FG = 'var(--status-failed)';

// ─── ROUTE ────────────────────────────────────────────────────────────

export function SeoAeoRoute() {
  return (
    <ModalStack>
      <SeoAeoRouteInner />
    </ModalStack>
  );
}

function SeoAeoRouteInner() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, setState: setDevState } = useDevState();
  const devState = getState('/h2/seo-aeo');

  const [setupComplete, setSetupComplete] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (searchParams.get('reset') === '1') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return false;
    }
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  // Sync dev-state toggle → setupComplete. Cold = pre-setup, steady = configured.
  useEffect(() => {
    setSetupComplete(devState === 'steady');
  }, [devState]);

  const [setupLoading, setSetupLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Strip ?reset=1 after first read so refreshes don't loop
  useEffect(() => {
    if (searchParams.get('reset') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('reset');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleResetSetup = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSetupComplete(false);
    setSetupLoading(false);
    setActiveTab('overview');
    setDevState('/h2/seo-aeo', 'cold');
    showToast({ message: 'Setup reset — replay from the confirmation step' });
  };

  const handleConfirmSetup = () => {
    setSetupLoading(true);
    setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      setSetupLoading(false);
      setSetupComplete(true);
      setActiveTab('overview');
      setDevState('/h2/seo-aeo', 'steady');
    }, 1800);
  };

  if (!setupComplete) {
    return (
      <H2Layout>
        {setupLoading ? <SetupLoading /> : <SetupScreen onConfirm={handleConfirmSetup} />}
      </H2Layout>
    );
  }

  return (
    <H2Layout>
      <SteadyState
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onResetSetup={handleResetSetup}
      />
    </H2Layout>
  );
}

// ─── SETUP SCREEN ─────────────────────────────────────────────────────

type SetupSectionId = 'category' | 'icps' | 'competitors' | 'queries' | 'facts' | 'tools';

function SetupScreen({ onConfirm }: { onConfirm: () => void }) {
  const { openModal } = useModals();

  const edit = (id: SetupSectionId) => {
    openModal(SetupEditModal, { sectionId: id });
  };

  return (
    <>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '8px 4px 140px' }}>
        <Heading level={2} style={{ marginBottom: 8 }}>
          Confirm your AEO setup
        </Heading>
        <Text variant="secondary" style={{ display: 'block', maxWidth: 560, marginBottom: 32, lineHeight: 1.55 }}>
          We've pre-filled everything from your Brand Kit and Content Preferences. Review the summary below — edit anything that
          looks off, then run the first analysis.
        </Text>

        <SetupSection label="Category & use cases" source="Brand Kit → Brand Profile" onEdit={() => edit('category')}>
          <SetupRow k="Category" v="Wellness supplements · adaptogenic & functional" />
          <SetupRow k="Use cases" v="Daily wellness, stress, sleep, energy, hormone support" />
          <SetupRow k="Geography" v="United States, Canada, UK" />
        </SetupSection>

        <SetupSection label="ICPs" count={ICPS.length} source="Content Preferences" onEdit={() => edit('icps')}>
          {ICPS.map((icp, i) => (
            <SetupRow key={icp} k={`ICP ${i + 1}`} v={icp} />
          ))}
        </SetupSection>

        <SetupSection label="Competitors" count={COMPETITORS.length} onEdit={() => edit('competitors')}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COMPETITORS.map((c) => (
              <span key={c.name} style={chipStyle()}>
                <span style={chipMarkStyle(c.color)}>{c.letter}</span>
                {c.name}
              </span>
            ))}
          </div>
        </SetupSection>

        <SetupSection label="Target queries" count={24} onEdit={() => edit('queries')}>
          <Text variant="secondary" style={{ display: 'block', marginBottom: 8 }}>
            Top 6 of 24 — generated from your category, competitors, and ICPs.
          </Text>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {QUERIES.slice(0, 6).map((q) => (
              <li key={q.id} style={{ padding: '4px 0' }}>
                <Text>{q.q}</Text>
              </li>
            ))}
            <li style={{ padding: '4px 0' }}>
              <Text variant="secondary">+ 18 more</Text>
            </li>
          </ul>
        </SetupSection>

        <SetupSection label="Brand facts to check" count={BRAND_FACTS.length} source="Brand Kit" onEdit={() => edit('facts')}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {BRAND_FACTS.slice(0, 4).map((f) => (
              <li key={f.id} style={{ padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--dark-60)', background: 'var(--dark-4)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>
                  {f.cat}
                </span>
                <Text>{f.q}</Text>
              </li>
            ))}
            <li style={{ padding: '4px 0' }}>
              <Text variant="secondary">+ 2 more</Text>
            </li>
          </ul>
        </SetupSection>

        <SetupSection label="AI tools to monitor" count={TOOLS.length} onEdit={() => edit('tools')}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TOOLS.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px' }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: t.color, color: 'var(--light-100)', fontSize: 11, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.logo}
                </div>
                <Text>{t.name}</Text>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <SetupRow k="Cadence" v="Weekly · next run after first analysis completes" />
          </div>
        </SetupSection>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 238,
          right: 0,
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          zIndex: 10,
        }}
      >
        <Text variant="secondary">~2 min · 24 queries × 5 AI tools</Text>
        <Button variant="primary" size="md" onPress={onConfirm}>
          Looks good — start tracking →
        </Button>
      </div>
    </>
  );
}

function SetupSection({
  label,
  count,
  source,
  onEdit,
  children,
}: {
  label: string;
  count?: number;
  source?: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          paddingBottom: 12,
          borderBottom: '1px solid var(--dark-8)',
          marginBottom: 20,
        }}
      >
        <Heading level={3} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
          {label}
          {count !== undefined && (
            <Text variant="secondary" style={{ fontWeight: 400 }}>
              ({count})
            </Text>
          )}
        </Heading>
        <span style={{ flex: 1 }} />
        {source && <Text variant="secondary">{source}</Text>}
        {onEdit && (
          <Button variant="tertiary" size="sm" onPress={onEdit}>
            Edit
          </Button>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}

function SetupRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '4px 0' }}>
      <span style={{ width: 120, flexShrink: 0 }}>
        <Text variant="secondary">{k}</Text>
      </span>
      <Text>{v}</Text>
    </div>
  );
}

// ─── SETUP EDIT MODAL ────────────────────────────────────────────────

const SETUP_EDIT_META: Record<SetupSectionId, { title: string; description: string }> = {
  category: {
    title: 'Edit category & use cases',
    description: 'Tune what Blaze monitors. These shape every target query and citation check.',
  },
  icps: {
    title: 'Edit ICPs',
    description: 'The customer personas Blaze uses to score query intent and content relevance.',
  },
  competitors: {
    title: 'Edit competitors',
    description: 'Brands Blaze tracks against in citation matrices and competitive teardowns.',
  },
  queries: {
    title: 'Edit target queries',
    description: 'The questions Blaze runs across every AI tool. Edit, add, or remove.',
  },
  facts: {
    title: 'Edit brand facts',
    description: 'Ground-truth statements Blaze checks against every AI tool weekly.',
  },
  tools: {
    title: 'Edit AI tools to monitor',
    description: 'Which AI tools Blaze samples and how often.',
  },
};

function SetupEditModal({ close, sectionId }: StackModalProps & { sectionId: SetupSectionId }) {
  const meta = SETUP_EDIT_META[sectionId];
  const { showToast } = useToast();

  const handleSave = () => {
    showToast({ message: `${meta.title.replace(/^Edit /, '')} saved` });
    close();
  };

  return (
    <Modal.Root size="md" aria-labelledby="setup-edit-title">
      <Modal.Header title={meta.title} id="setup-edit-title" onClose={close} />
      <Modal.Content>
        <Text variant="secondary" style={{ display: 'block', marginBottom: 20, lineHeight: 1.55 }}>
          {meta.description}
        </Text>
        <SetupEditFields sectionId={sectionId} />
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={handleSave}>
            Save changes
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

const editFieldLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--dark-80)',
  marginBottom: 6,
  display: 'block',
  letterSpacing: '0.1px',
};

const editInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontFamily: 'inherit',
  fontSize: 13,
  color: 'var(--dark-90)',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 8,
  outline: 'none',
};

const editTextareaStyle: React.CSSProperties = {
  ...editInputStyle,
  minHeight: 80,
  resize: 'vertical',
  fontFamily: 'inherit',
  lineHeight: 1.5,
};

function SetupEditFields({ sectionId }: { sectionId: SetupSectionId }) {
  if (sectionId === 'category') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <EditField label="Category">
          <input
            type="text"
            defaultValue="Wellness supplements · adaptogenic & functional"
            style={editInputStyle}
          />
        </EditField>
        <EditField label="Use cases">
          <textarea
            defaultValue="Daily wellness, stress, sleep, energy, hormone support"
            style={editTextareaStyle}
          />
        </EditField>
        <EditField label="Geography">
          <select defaultValue="us-ca-uk" style={editInputStyle}>
            <option value="us-ca-uk">United States, Canada, UK</option>
            <option value="us">United States only</option>
            <option value="global">Global</option>
          </select>
        </EditField>
      </div>
    );
  }

  if (sectionId === 'icps') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ICPS.map((icp, i) => (
          <EditField key={icp} label={`ICP ${i + 1}`}>
            <input type="text" defaultValue={icp} style={editInputStyle} />
          </EditField>
        ))}
        <Button variant="tertiary" size="sm" onPress={() => undefined}>
          + Add ICP
        </Button>
      </div>
    );
  }

  if (sectionId === 'competitors') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {COMPETITORS.map((c) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={chipMarkStyle(c.color)}>{c.letter}</span>
            <input type="text" defaultValue={c.name} style={{ ...editInputStyle, flex: 1 }} />
            <Button variant="tertiary" size="sm" onPress={() => undefined}>
              Remove
            </Button>
          </div>
        ))}
        <Button variant="tertiary" size="sm" onPress={() => undefined} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
          + Add competitor
        </Button>
      </div>
    );
  }

  if (sectionId === 'queries') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {QUERIES.slice(0, 6).map((q) => (
          <EditField key={q.id} label={`Query ${q.id}`}>
            <input type="text" defaultValue={q.q} style={editInputStyle} />
          </EditField>
        ))}
        <Text variant="secondary" style={{ display: 'block', marginTop: 4 }}>
          + 18 more queries (edit all in bulk after launch)
        </Text>
      </div>
    );
  }

  if (sectionId === 'facts') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {BRAND_FACTS.slice(0, 4).map((f) => (
          <EditField key={f.id} label={f.cat}>
            <input type="text" defaultValue={f.q} style={editInputStyle} />
          </EditField>
        ))}
        <Button variant="tertiary" size="sm" onPress={() => undefined} style={{ alignSelf: 'flex-start' }}>
          + Add brand fact
        </Button>
      </div>
    );
  }

  // tools
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <EditField label="Enabled AI tools">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TOOLS.map((t) => (
            <label
              key={t.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 0' }}
            >
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--dark-90)' }} />
              <div style={{ width: 22, height: 22, borderRadius: 5, background: t.color, color: 'var(--light-100)', fontSize: 11, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.logo}
              </div>
              <Text>{t.name}</Text>
            </label>
          ))}
        </div>
      </EditField>
      <EditField label="Cadence">
        <select defaultValue="weekly" style={editInputStyle}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Every 2 weeks</option>
          <option value="monthly">Monthly</option>
        </select>
      </EditField>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={editFieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function chipStyle(): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--dark-4)',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    color: 'var(--dark-90)',
  };
}

function chipMarkStyle(bg: string): React.CSSProperties {
  return {
    width: 18,
    height: 18,
    borderRadius: 5,
    background: bg,
    color: 'var(--light-100)',
    fontSize: 10,
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

function SetupLoading() {
  const [msg, setMsg] = useState(0);
  const messages = useMemo(
    () => [
      'Asking ChatGPT about "best adaptogens for stress and anxiety"…',
      'Checking who\'s cited for "ashwagandha vs rhodiola"…',
      'Sampling Perplexity for 24 target queries…',
      'Analyzing competitor citations across Moon Juice, Ritual, Athletic Greens…',
      'Building your citation matrix…',
    ],
    [],
  );
  useEffect(() => {
    const id = setInterval(() => setMsg((i) => (i + 1) % messages.length), 1100);
    return () => clearInterval(id);
  }, [messages.length]);
  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '80px 28px', textAlign: 'center' }}>
      <div
        style={{
          width: 48,
          height: 48,
          border: '3px solid var(--dark-8)',
          borderTopColor: 'var(--dark-90)',
          borderRadius: '50%',
          margin: '0 auto 24px',
          animation: 'aeo-spin 0.8s linear infinite',
        }}
      />
      <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.2px', marginBottom: 8 }}>
        Running your first citation analysis…
      </h2>
      <p style={{ fontSize: 13.5, color: 'var(--dark-60)', minHeight: 20 }}>{messages[msg]}</p>
      <style>{`@keyframes aeo-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── STEADY STATE SHELL ───────────────────────────────────────────────

function SteadyState({
  activeTab,
  onChangeTab,
  onResetSetup,
}: {
  activeTab: TabId;
  onChangeTab: (t: TabId) => void;
  onResetSetup: () => void;
}) {
  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview', badge: 5 },
    { id: 'citations', label: 'Citations' },
    { id: 'facts', label: 'Brand facts' },
    { id: 'content', label: 'Content' },
    { id: 'trends', label: 'Trends' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: 0,
          padding: '0 28px',
          background: 'var(--light-100)',
          borderBottom: '1px solid var(--dark-8)',
          flexShrink: 0,
        }}
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeTab(t.id)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--dark-90)' : 'transparent'}`,
                cursor: 'pointer',
                font: 'inherit',
                fontSize: 13.5,
                color: isActive ? 'var(--dark-90)' : 'var(--dark-60)',
                fontWeight: isActive ? 500 : 400,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {t.label}
              {t.badge !== undefined && (
                <span
                  style={{
                    background: 'var(--brand)',
                    color: '#1a1a1a',
                    fontSize: 10.5,
                    fontWeight: 500,
                    borderRadius: 5,
                    padding: '1px 6px',
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }}>
        {activeTab === 'overview' && <OverviewTab onResetSetup={onResetSetup} onJumpToTab={onChangeTab} />}
        {activeTab === 'citations' && <CitationsTab />}
        {activeTab === 'facts' && <FactsTab />}
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'trends' && <TrendsTab />}
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────

type ApprovalFilter = 'all' | 'issues' | 'content';

function OverviewTab({
  onResetSetup,
  onJumpToTab,
}: {
  onResetSetup: () => void;
  onJumpToTab: (t: TabId) => void;
}) {
  const { showToast } = useToast();
  const [items, setItems] = useState<ApprovalItem[]>(() => APPROVAL_INITIAL.map((i) => ({ ...i, state: 'pending' })));
  const [filter, setFilter] = useState<ApprovalFilter>('all');

  const pending = items.filter((i) => i.state === 'pending');
  const approved = items.filter((i) => i.state === 'approved');
  const dismissed = items.filter((i) => i.state === 'dismissed');
  const pIssues = pending.filter((i) => i.kind === 'issue').length;
  const pContent = pending.filter((i) => i.kind === 'content').length;

  const visible = filter === 'all' ? items : filter === 'issues' ? items.filter((i) => i.kind === 'issue') : items.filter((i) => i.kind === 'content');

  const setState = (id: string, state: ApprovalState) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, state } : i)));

  const approveAll = () => {
    setItems((prev) => prev.map((i) => (i.state === 'pending' ? { ...i, state: 'approved' } : i)));
    showToast({ message: 'Approved all pending actions' });
  };

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          marginBottom: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 4 }}>
            {pending.length > 0 ? (
              <>
                Blaze AI proposes <strong style={{ fontWeight: 500 }}>{pending.length} actions</strong> — {pIssues} issue{' '}
                {pIssues === 1 ? 'fix' : 'fixes'} and {pContent} new {pContent === 1 ? 'piece' : 'pieces'} of content.
              </>
            ) : (
              "You're all caught up. Blaze will keep monitoring and queue new actions here."
            )}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--dark-60)' }}>
            Review each below, or approve everything in one go. Approved actions run immediately.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <Button variant="tertiary" size="sm" onPress={onResetSetup}>
            Reset setup
          </Button>
          <Button variant="tertiary" size="sm" onPress={() => showToast({ message: 'Monitoring paused' })}>
            Pause monitoring
          </Button>
          <Button
            variant="primary"
            size="md"
            isDisabled={pending.length === 0}
            onPress={approveAll}
          >
            Approve all{pending.length > 0 ? ` (${pending.length})` : ''} →
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <Stat num={pIssues} label="Issues to fix" />
        <Stat num={pContent} label="Content to generate" />
        <Stat num={approved.length} label="Approved this week" color="var(--status-approved)" />
        <Stat num={dismissed.length} label="Dismissed" color="var(--dark-40)" />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
          All ({pending.length})
        </FilterPill>
        <FilterPill active={filter === 'issues'} onClick={() => setFilter('issues')}>
          Issues ({pIssues})
        </FilterPill>
        <FilterPill active={filter === 'content'} onClick={() => setFilter('content')}>
          Content ({pContent})
        </FilterPill>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map((item) => (
          <ApprovalCard
            key={item.id}
            item={item}
            onJumpToTab={onJumpToTab}
            onSetState={setState}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ num, label, color }: { num: number; label: string; color?: string }) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: color ?? 'var(--dark-90)',
          letterSpacing: '-0.4px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {num}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function FilterPill({
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
        background: active ? 'var(--dark-90)' : 'var(--light-100)',
        border: `1px solid ${active ? 'var(--dark-90)' : 'var(--dark-8)'}`,
        borderRadius: 7,
        padding: '6px 12px',
        font: 'inherit',
        fontSize: 12.5,
        color: active ? 'var(--light-100)' : 'var(--dark-60)',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function ApprovalCard({
  item,
  onJumpToTab,
  onSetState,
}: {
  item: ApprovalItem;
  onJumpToTab: (t: TabId) => void;
  onSetState: (id: string, state: ApprovalState) => void;
}) {
  const isApproved = item.state === 'approved';
  const isDismissed = item.state === 'dismissed';
  return (
    <div
      style={{
        background: isApproved ? 'rgba(0,0,0,0.02)' : 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '16px 18px',
        opacity: isDismissed ? 0.55 : 1,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 28px 1fr',
          gap: 16,
          marginBottom: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--dark-60)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                borderRadius: 4,
                padding: '1px 6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: item.kind === 'issue' ? 'rgba(188,1,11,0.10)' : 'rgba(124,92,252,0.12)',
                color: item.kind === 'issue' ? 'var(--status-failed)' : 'var(--purple)',
              }}
            >
              {item.kind}
            </span>
            {item.kind === 'content'
              ? `${item.format} · targets "${item.targetQuery}"`
              : `detected on ${item.tab === 'facts' ? 'Brand facts' : item.tab === 'citations' ? 'Citations' : 'Content'}`}
          </div>
          <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: 0, marginBottom: 4, lineHeight: 1.35 }}>
            {item.kind === 'content' ? item.title : item.issue}
          </h4>
          <p style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.5, margin: 0 }}>{item.detail}</p>
        </div>
        <div style={{ color: 'var(--dark-25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          →
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--dark-60)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: 'var(--purple)', color: 'var(--light-100)', fontSize: 9.5, fontWeight: 500, borderRadius: 4, padding: '1px 6px', letterSpacing: '0.06em' }}>
              AI
            </span>
            Proposed action
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.5, margin: 0 }}>{item.action}</p>
          <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--dark-40)' }}>{item.meta}</div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 6,
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderTop: '1px solid var(--dark-4)',
          paddingTop: 12,
        }}
      >
        {item.state === 'pending' && (
          <>
            <Button variant="tertiary" size="sm" onPress={() => onJumpToTab(item.tab)}>
              Review
            </Button>
            <Button variant="tertiary" size="sm" onPress={() => onSetState(item.id, 'dismissed')}>
              Dismiss
            </Button>
            <Button variant="secondary" size="sm" onPress={() => onSetState(item.id, 'approved')}>
              Approve
            </Button>
          </>
        )}
        {isApproved && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 500,
              background: 'rgba(4,175,0,0.10)',
              color: 'var(--status-approved)',
            }}
          >
            ✓ Approved · {item.kind === 'content' ? 'generating' : 'running'}
          </span>
        )}
        {isDismissed && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 7,
              fontSize: 12,
              background: 'var(--dark-4)',
              color: 'var(--dark-60)',
            }}
          >
            Dismissed{' '}
            <button
              type="button"
              onClick={() => onSetState(item.id, 'pending')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 12, color: 'var(--dark-90)', textDecoration: 'underline', padding: 0 }}
            >
              Undo
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

// ─── CITATIONS TAB ────────────────────────────────────────────────────

type CitationFilter = 'all' | 'gap' | 'cited';

function CitationsTab() {
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
  const points = data.map((v, i) => `${i * step},${h - (v / max) * (h - 8) - 4}`).join(' ');

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
          borderRadius: 14,
          padding: '22px 24px',
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 10 }}>
            Citation scoreboard
          </div>
          <div style={{ fontSize: 64, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-1.5px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            7<span style={{ fontSize: 24, color: 'var(--dark-40)' }}> / 24</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--dark-60)', marginTop: 6 }}>
            target queries cite Radiant Health
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(4,175,0,0.10)',
              color: 'var(--status-approved)',
              borderRadius: 5,
              padding: '4px 9px',
              fontSize: 12,
              fontWeight: 500,
              marginTop: 14,
            }}
          >
            ▲ +2 vs last week
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 8 }}>
            Across 4 of 5 monitored AI tools · 6 weeks of data
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Citations over time · last 13 weeks
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 60 }}>
            <polyline
              points={points}
              fill="none"
              stroke="var(--status-approved)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={(data.length - 1) * step} cy={h - (data[data.length - 1] / max) * (h - 8) - 4} r={3.5} fill="var(--status-approved)" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--dark-40)' }}>
            <span>Mar 1</span>
            <span>Apr 5</span>
            <span>May 6</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14, gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>Target queries</h3>
          <div style={{ fontSize: 12.5, color: 'var(--dark-60)', marginTop: 3 }}>
            Citation status across {TOOLS.length} AI tools · click any cell to see the actual response
          </div>
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
          padding: '10px 14px',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderBottom: 'none',
          borderRadius: '10px 10px 0 0',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Filter
        </span>
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
        <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>
          <span style={{ display: 'inline-block', width: 9, height: 9, background: CELL_GREEN, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          Cited
          <span style={{ display: 'inline-block', width: 9, height: 9, background: CELL_RED_BG, border: `1px solid ${CELL_RED_FG}`, borderRadius: 2, marginLeft: 10, marginRight: 4, verticalAlign: 'middle' }} />
          Competitor
          <span style={{ display: 'inline-block', width: 9, height: 9, background: 'var(--dark-4)', borderRadius: 2, marginLeft: 10, marginRight: 4, verticalAlign: 'middle' }} />
          Neither
        </span>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 5,
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
                  <div style={{ fontSize: 10.5, color: 'var(--dark-80)' }}>{t.name}</div>
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
                <div style={{ fontSize: 13, color: 'var(--dark-90)', marginBottom: 3 }}>{q.q}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--dark-60)' }}>
                  <span style={{ background: 'var(--dark-4)', padding: '1px 8px', borderRadius: 5, fontSize: 10.5 }}>
                    {q.intent}
                  </span>
                  <span>{q.icp}</span>
                </div>
              </td>
              {q.status.map((s, ti) => (
                <td key={ti} style={{ ...qTdStyle(qi === filtered.length - 1), textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => openModal(CellDrawerModal, { query: q, toolIdx: ti, status: s })}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: s === 'competitor' ? `1px solid ${CELL_RED_FG}` : 'none',
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
                            : 'var(--dark-25)',
                      font: 'inherit',
                    }}
                    title={`${TOOLS[ti].name}: ${s}`}
                  >
                    {s === 'cited' ? '✓' : s === 'competitor' ? '✕' : '–'}
                  </button>
                </td>
              ))}
              <td style={qTdStyle(qi === filtered.length - 1)}>
                <ContentPill content={q.content} onClickIfNone={() => showToast({ message: 'Content recommendations would open here' })} />
              </td>
              <td style={{ ...qTdStyle(qi === filtered.length - 1), color: 'var(--dark-40)', fontSize: 11.5 }}>
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
    padding: '10px 12px',
    background: 'rgba(0,0,0,0.02)',
    borderBottom: '1px solid var(--dark-8)',
    letterSpacing: '0.06em',
    fontWeight: 500,
    minWidth,
  };
}

function qTdStyle(isLast: boolean): React.CSSProperties {
  return {
    padding: '11px 12px',
    borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
    fontSize: 12.5,
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
        borderRadius: 5,
        padding: '4px 10px',
        fontSize: 11.5,
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
    none: { color: 'var(--dark-40)', dot: 'var(--dark-25)', label: 'No content · Ideas →' },
  };
  const m = map[content];
  return (
    <span
      onClick={content === 'none' ? onClickIfNone : undefined}
      style={{
        fontSize: 11.5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        color: m.color,
        cursor: content === 'none' ? 'pointer' : 'default',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.dot }} />
      {m.label}
    </span>
  );
}

// ─── CELL DRAWER MODAL ────────────────────────────────────────────────

interface CellDrawerProps {
  query: QueryRow;
  toolIdx: number;
  status: CellStatus;
}

function CellDrawerModal({ close, query, toolIdx, status }: StackModalProps & CellDrawerProps) {
  const tool = TOOLS[toolIdx];
  const sample =
    status === 'cited'
      ? `Radiant Health is one of the most cited brands here. Their Calm Adaptogen Blend (KSM-66 ashwagandha + rhodiola + L-theanine) is referenced for both potency and third-party testing — every batch is NSF Certified for Sport.`
      : status === 'competitor'
        ? `Top brands surfaced for this query include Moon Juice, Ritual, and Care/of. Their comparison hubs and buyer's guides currently dominate ${tool.name}'s answer.`
        : `${tool.name} did not surface a brand recommendation for this query. The model returned a neutral educational answer with no citations.`;

  const statusLabel = status === 'cited' ? 'You are cited' : status === 'competitor' ? 'Competitor cited' : 'No citation';
  const statusColor = status === 'cited' ? 'var(--status-approved)' : status === 'competitor' ? 'var(--status-failed)' : 'var(--dark-40)';
  const statusBg = status === 'cited' ? 'rgba(4,175,0,0.10)' : status === 'competitor' ? 'rgba(188,1,11,0.10)' : 'var(--dark-4)';

  return (
    <Modal.Root size="md" aria-labelledby="aeo-cell-title" data-testid="aeo-cell-drawer">
      <Modal.Header
        title={`${tool.name} response`}
        id="aeo-cell-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
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
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 500,
              background: statusBg,
              color: statusColor,
            }}
          >
            {statusLabel}
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--dark-40)' }}>Last seen {query.lastChecked}</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10.5, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Query
          </div>
          <div style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: 500 }}>{query.q}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--dark-60)', marginTop: 6 }}>
            <span style={{ background: 'var(--dark-4)', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{query.intent}</span>
            <span>{query.icp}</span>
          </div>
        </div>

        <div
          style={{
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-4)',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 10.5, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Excerpt
          </div>
          <div style={{ fontSize: 13, color: 'var(--dark-80)', lineHeight: 1.55, fontStyle: 'italic' }}>"{sample}"</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
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

function DrawerMeta({ label, value, linkLike }: { label: string; value: string; linkLike?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 12.5,
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

// ─── BRAND FACTS TAB ──────────────────────────────────────────────────

function FactsTab() {
  const { showToast } = useToast();
  const [open, setOpen] = useState<string | null>(null);

  const counts: Record<FactStatus, number> = { accurate: 0, partial: 0, wrong: 0, missing: 0 };
  BRAND_FACTS.forEach((f) => f.answers.forEach((a) => counts[a.status]++));
  const total = BRAND_FACTS.length * TOOLS.length;

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14, gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>Brand fact check</h3>
          <div style={{ fontSize: 12.5, color: 'var(--dark-60)', marginTop: 3 }}>
            What AI tools say about you when asked directly · checked weekly
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button variant="tertiary" size="sm" onPress={() => showToast({ message: 'Add question (TODO)' })}>
            + Add question
          </Button>
          <Button variant="secondary" size="sm" onPress={() => showToast({ message: 'Re-checking…' })}>
            Re-check now
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,auto) 1fr',
          gap: 18,
          alignItems: 'center',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: '18px 22px',
          marginBottom: 14,
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
          <div style={{ fontSize: 11, color: 'var(--dark-40)', marginTop: 6 }}>
            {total} answers checked across {TOOLS.length} AI tools
          </div>
        </div>
      </div>

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
            padding: '10px 16px',
            background: 'rgba(0,0,0,0.02)',
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
                  width: 22,
                  height: 22,
                  borderRadius: 5,
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
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--dark-4)',
                  cursor: 'pointer',
                  background: isOpen ? 'var(--dark-2)' : 'transparent',
                }}
              >
                <div>
                  <div style={{ fontSize: 10.5, color: 'var(--dark-40)', marginBottom: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {f.cat}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--dark-90)', fontWeight: 500 }}>{f.q}</div>
                </div>
                {f.answers.map((a) => (
                  <div
                    key={a.tool}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      margin: '0 auto',
                      background: STATUS_COLOR[a.status],
                    }}
                    title={`${a.tool}: ${a.status}`}
                  />
                ))}
                <div style={{ color: 'var(--dark-40)', textAlign: 'center', fontSize: 11 }}>{isOpen ? '▾' : '▸'}</div>
              </div>
              {isOpen && (
                <div
                  style={{
                    background: 'var(--dark-2)',
                    borderBottom: '1px solid var(--dark-4)',
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--light-100)',
                      border: '1px solid var(--dark-8)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      marginBottom: 12,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontSize: 10.5, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
                      Your truth
                    </div>
                    <div style={{ color: 'var(--dark-90)' }}>{f.truth}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                    {f.answers.map((a) => {
                      const tool = TOOLS.find((t) => t.id === a.tool)!;
                      return (
                        <div
                          key={a.tool}
                          style={{
                            background: 'var(--light-100)',
                            border: '1px solid var(--dark-8)',
                            borderRadius: 8,
                            padding: '12px 14px',
                            borderLeftWidth: 3,
                            borderLeftStyle: 'solid',
                            borderLeftColor: STATUS_COLOR[a.status],
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--dark-90)' }}>
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 5,
                                  background: tool.color,
                                  color: 'var(--light-100)',
                                  fontSize: 9,
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
                                fontSize: 10.5,
                                padding: '2px 7px',
                                borderRadius: 5,
                                fontWeight: 500,
                                background: STATUS_BG[a.status],
                                color: STATUS_COLOR[a.status],
                              }}
                            >
                              {STATUS_LABEL[a.status]}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--dark-80)', lineHeight: 1.5, fontStyle: 'italic' }}>
                            "{a.text}"
                          </div>
                          {a.issue && (
                            <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--dark-60)', lineHeight: 1.5 }}>
                              <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>Issue:</strong> {a.issue}
                            </div>
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

function FactsStat({ num, label, color }: { num: number; label: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.4px', fontVariantNumeric: 'tabular-nums', color }}>
        {num}
      </div>
      <div style={{ fontSize: 11, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

// ─── CONTENT TAB ──────────────────────────────────────────────────────

type ContentMode = 'suggest' | 'generating' | 'done';

function ContentTab() {
  const { showToast } = useToast();
  const [idx, setIdx] = useState(0);
  const [tone, setTone] = useState(TONES[0]);
  const [mode, setMode] = useState<ContentMode>('suggest');
  const [stage, setStage] = useState(0);

  const item = SUGGESTIONS[idx];

  useEffect(() => {
    if (mode !== 'generating') return;
    setStage(0);
    const stages = 5;
    const id = setInterval(() => {
      setStage((s) => {
        if (s + 1 >= stages) {
          clearInterval(id);
          setTimeout(() => setMode('done'), 400);
          return s + 1;
        }
        return s + 1;
      });
    }, 700);
    return () => clearInterval(id);
  }, [mode]);

  const skip = () => {
    setIdx((i) => (i + 1) % SUGGESTIONS.length);
    setMode('suggest');
  };
  const reset = () => setMode('suggest');
  const publish = () => {
    showToast({ message: 'Published to your CMS · indexed in 24h' });
    setIdx((i) => (i + 1) % SUGGESTIONS.length);
    setMode('suggest');
  };

  if (!item) {
    return (
      <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 14,
            color: 'var(--dark-60)',
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: 500, marginBottom: 6 }}>All caught up</div>
          <div style={{ fontSize: 12.5 }}>Blaze will surface new content suggestions as gaps appear.</div>
        </div>
      </div>
    );
  }

  if (mode === 'generating') {
    const stages = [
      { label: 'Researching evidence', detail: 'scanning 28 studies, 14 competitor pages…' },
      { label: 'Drafting outline', detail: 'structuring for AI citation + SEO ranking signals…' },
      { label: 'Writing sections', detail: 'words across 8 sections…' },
      { label: 'Adding schema markup', detail: 'ComparisonTable, FAQ, ClaimReview…' },
      { label: 'Optimizing for citation', detail: 'matching format patterns AI tools cite most…' },
    ];
    return (
      <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 14,
            padding: '22px 24px',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--dark-4)' }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: '2.5px solid var(--dark-8)',
                borderTopColor: 'var(--purple)',
                borderRadius: '50%',
                animation: 'aeo-spin 0.8s linear infinite',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--dark-90)' }}>
                Generating "{item.title}"
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 2 }}>
                Optimized for citation + SEO indexing
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stages.map((s, j) => {
              const done = j < stage;
              const active = j === stage;
              return (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: done || active ? 1 : 0.4 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `1.5px solid ${done ? 'var(--status-approved)' : active ? 'var(--purple)' : 'var(--dark-15)'}`,
                      background: done ? 'var(--status-approved)' : 'transparent',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--light-100)',
                      fontSize: 9,
                      borderTopColor: active && !done ? 'transparent' : undefined,
                      animation: active && !done ? 'aeo-spin 0.8s linear infinite' : undefined,
                    }}
                  >
                    {done ? '✓' : ''}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--dark-90)', fontWeight: 500 }}>{s.label}</div>
                    {active && <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 2 }}>{s.detail}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <style>{`@keyframes aeo-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (mode === 'done') {
    return (
      <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 14, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 11.5, color: 'var(--dark-60)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, fontWeight: 500, padding: '2px 8px', borderRadius: 5, background: 'rgba(4,175,0,0.10)', color: 'var(--status-approved)' }}>
              ✓ Draft ready for review
            </span>
            <span>{item.format} · {item.estWords.toLocaleString()} words</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.2px', marginBottom: 14, lineHeight: 1.3 }}>
            {item.title}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 18 }}>
            <DoneCheckCard
              title="SEO checks"
              lines={['✓ Title length 58/60', '✓ ComparisonTable + FAQ schema applied', '✓ 8 internal links · 4 outbound to studies', '✓ Reading level: 8th grade']}
            />
            <DoneCheckCard
              title="AEO checks"
              lines={['✓ Direct-answer paragraph in first 100 words', '✓ Q&A blocks match AI Overview format', '✓ Brand fact (NSF cert) referenced 3×', '✓ Schema validated · cite-friendly markup']}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Button variant="tertiary" size="sm" onPress={reset}>
              Discard
            </Button>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="md" onPress={reset}>
                Save as draft
              </Button>
              <Button variant="primary" size="md" onPress={publish}>
                Publish →
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // suggest mode
  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '22px 24px',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--dark-60)', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--purple)', color: 'var(--light-100)', fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 5, letterSpacing: '0.06em' }}>
              AI
            </span>
            <span>Suggested for you · {item.format}</span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 5,
                background: item.impact === 'high' ? 'rgba(4,175,0,0.10)' : 'rgba(237,182,44,0.15)',
                color: item.impact === 'high' ? 'var(--status-approved)' : 'var(--status-review)',
              }}
            >
              {item.impact === 'high' ? 'High impact' : 'Medium impact'}
            </span>
          </div>
          <button
            type="button"
            onClick={skip}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 12, color: 'var(--dark-90)', textDecoration: 'underline', textUnderlineOffset: 2, padding: 0 }}
          >
            Skip
          </button>
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.2px', marginBottom: 14, lineHeight: 1.3 }}>
          {item.title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, color: 'var(--dark-40)' }}>Targets</span>
            <span style={{ fontSize: 13, color: 'var(--dark-90)', fontWeight: 500, fontStyle: 'italic' }}>"{item.targetQuery}"</span>
            <span style={{ background: 'var(--dark-4)', color: 'var(--dark-80)', borderRadius: 5, padding: '3px 9px', fontSize: 11.5 }}>
              {item.intent}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>+ {item.secondaryCount} secondary queries</div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-4)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#0083e2',
              color: 'var(--light-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              flexShrink: 0,
              fontStyle: 'italic',
              fontWeight: 500,
            }}
          >
            i
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--dark-80)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--dark-90)', fontWeight: 500, display: 'block', marginBottom: 3 }}>Why this content</strong>
            {item.why}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 14,
            marginBottom: 18,
            paddingBottom: 16,
            borderBottom: '1px solid var(--dark-4)',
          }}
        >
          <MetaCell label="Expected impact" value={item.impactNote} />
          <MetaCell label="SEO setup" value={item.seoNote} />
          <MetaCell label="Estimate" value={`~${item.estWords.toLocaleString()} words · ${item.estTime}`} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ fontSize: 12, color: 'var(--dark-60)', fontWeight: 500 }}>Tone</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {TONES.map((t) => {
              const active = tone === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  style={{
                    background: active ? 'var(--dark-90)' : 'var(--light-100)',
                    border: `1px solid ${active ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                    borderRadius: 7,
                    padding: '6px 12px',
                    font: 'inherit',
                    fontSize: 12,
                    color: active ? 'var(--light-100)' : 'var(--dark-80)',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Button variant="tertiary" size="sm" onPress={() => showToast({ message: 'Customize brief (TODO)' })}>
            Customize brief
          </Button>
          <Button variant="primary" size="md" onPress={() => setMode('generating')}>
            Approve & generate →
          </Button>
        </div>
      </div>

      {SUGGESTIONS.length > 1 && (
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '16px 18px' }}>
          <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', marginTop: 0, marginBottom: 10 }}>
            Up next · {SUGGESTIONS.length - 1 - idx} more suggestions
          </h4>
          {SUGGESTIONS.slice(idx + 1).map((s) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid var(--dark-4)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: 'var(--dark-90)', fontWeight: 500 }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 1 }}>
                  {s.format} · {s.estWords.toLocaleString()} words · {s.estTime}
                </div>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 5,
                  background: s.impact === 'high' ? 'rgba(4,175,0,0.10)' : 'rgba(237,182,44,0.15)',
                  color: s.impact === 'high' ? 'var(--status-approved)' : 'var(--status-review)',
                }}
              >
                {s.impact === 'high' ? 'High' : 'Medium'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--dark-90)', lineHeight: 1.45 }}>{value}</div>
    </div>
  );
}

function DoneCheckCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div
      style={{
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <div style={{ fontSize: 10.5, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: 'var(--dark-90)', marginTop: 5, lineHeight: 1.6 }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}

// ─── TRENDS TAB ───────────────────────────────────────────────────────

function TrendsTab() {
  // Citation share over time
  const series = [2, 3, 3, 4, 3, 4, 5, 5, 6, 5, 6, 7, 7];
  const W = 600;
  const H = 180;
  const pad = 30;
  const max = 8;
  const xs = series.map((_, i) => pad + (i / (series.length - 1)) * (W - 2 * pad));
  const ys = series.map((v) => H - pad - (v / max) * (H - 2 * pad));
  const path = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L ${xs[xs.length - 1].toFixed(1)},${H - pad} L ${xs[0].toFixed(1)},${H - pad} Z`;
  const grids: { y: number }[] = [];
  for (let i = 1; i < 4; i++) {
    grids.push({ y: pad + (i / 4) * (H - 2 * pad) });
  }

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14, gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>Trends</h3>
          <div style={{ fontSize: 12.5, color: 'var(--dark-60)', marginTop: 3 }}>
            Strategy started 6 weeks ago · See full trends in Learnings →
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
        <TrendCard label="Citations" num="+5" sub="since week 1" up />
        <TrendCard label="Coverage" num="29%" sub="of target queries" />
        <TrendCard label="Tools active" num="4 / 5" sub="citing you" />
      </div>

      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: '18px 20px',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 14 }}>
          Citation share over time
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 180 }}>
          {grids.map((g, i) => (
            <line key={i} x1={pad} y1={g.y} x2={W - pad} y2={g.y} stroke="rgba(0,0,0,0.04)" strokeWidth={1} />
          ))}
          <path d={area} fill="rgba(4,175,0,0.10)" />
          <path d={path} fill="none" stroke="var(--status-approved)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={4} fill="var(--status-approved)" />
        </svg>
      </div>
    </div>
  );
}

function TrendCard({ label, num, sub, up }: { label: string; num: string; sub: string; up?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '18px 20px',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 500, color: 'var(--dark-90)', marginTop: 8, letterSpacing: '-0.6px', fontVariantNumeric: 'tabular-nums' }}>
        {num}
      </div>
      <div style={{ fontSize: 12, color: up ? 'var(--status-approved)' : 'var(--dark-60)', marginTop: 4 }}>
        {sub}
      </div>
    </div>
  );
}
