import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, IconButton, Modal, ModalStack, useModals } from '@/components';
import { useToast } from '@/staging';
import type { StackModalProps } from '@/components';
import ArrowLeft from '@/icons/20/ArrowLeft';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import Check2 from '@/icons/20/Check2';
import Computer from '@/icons/20/Computer';
import Plus from '@/icons/20/Plus';
import Settings from '@/icons/20/Settings';
import { H2Layout } from '../H2Layout';

/**
 * /h2/landing-pages — deep port of `~/dev/Blaze H2 Features/landing-pages.html`.
 *
 * Four screens driven by `view` state (mirrors source's `goTo()`):
 *   1. hub       — list of existing pages with CVR / status / source.
 *                  Top-bar "New Landing Page" opens the campaign modal.
 *                  Row click → editor for that page.
 *   2. loading   — agent analysis: 6 sequenced lines (~250ms + 600ms each)
 *                  ending with "Done — your page is ready." Manual CTA
 *                  "Review your page →" appears after the sequence and
 *                  advances to editor. Cleanup on unmount cancels timers.
 *   3. editor    — 3-pane: section list (left) + canvas page preview
 *                  (center, with sticky review-progress bar) + edit panel
 *                  (right). Inner editor-topbar replaces page content top
 *                  with back / page-name input / Insert / viewport / zoom /
 *                  settings / Publish. Publish is gated on approving all 5
 *                  sections.
 *   4. published — success banner + URL + KPI sparkline + AI suggestions
 *                  + top-sources & section-engagement cards.
 *
 * Approval state is per-section (Set<SectionId>) — sticking with the source's
 * model. Suggestions are also a Set<string>. selectedCampaign feeds the page
 * source label and loading line.
 *
 * For routes that need a modal (campaign chooser, new page), the route is
 * wrapped in <ModalStack> and uses useModals.
 */

// ─── TYPES & DATA ─────────────────────────────────────────────────────

type View = 'hub' | 'loading' | 'editor' | 'published';
type Status = 'Live' | 'Draft' | 'Needs Review' | 'Paused';
type SectionId = 'hero' | 'why' | 'benefits' | 'proof' | 'cta';

interface Page {
  name: string;
  source: string;
  status: Status;
  cvr: string;
  updated: string;
  channel: string;
  ab?: boolean;
}

interface Campaign {
  id: string;
  name: string;
  type: 'Organic' | 'Paid Search' | 'Social';
  typeC: 'organic' | 'paid' | 'social';
  status: 'Active' | 'Paused';
  metric: string;
  metricSub: string;
  headline: string;
}

const INITIAL_PAGES: Page[] = [
  { name: 'CRM for small teams — landing page', source: 'Spring SEO Push — Small Business CRM', status: 'Live', cvr: '4.6%', updated: '2 days ago', channel: 'Organic' },
];

const CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Spring SEO Push — Small Business CRM', type: 'Organic', typeC: 'organic', status: 'Active', metric: "Top keyword: 'crm for small teams'", metricSub: '12.4k impressions / wk', headline: '12.4k impressions' },
  { id: 'c2', name: 'Google Ads — Competitor Keywords', type: 'Paid Search', typeC: 'paid', status: 'Active', metric: 'CTR 6.1%', metricSub: '$2.18 CPC', headline: '6.1%' },
  { id: 'c3', name: 'Retargeting — Abandoned Trial Users', type: 'Paid Search', typeC: 'paid', status: 'Active', metric: 'CVR 8.9%', metricSub: '1,402 in audience', headline: '8.9%' },
  { id: 'c4', name: 'LinkedIn — Ops Manager Persona', type: 'Social', typeC: 'social', status: 'Active', metric: 'CTR 2.4%', metricSub: '42 leads · last 14d', headline: '2.4%' },
  { id: 'c5', name: 'Best Email Tool — Organic Cluster', type: 'Organic', typeC: 'organic', status: 'Paused', metric: 'Page 1 for 18 terms', metricSub: '8.6k organic / mo', headline: '18 terms' },
  { id: 'c6', name: 'YouTube Pre-roll — Founder Story', type: 'Social', typeC: 'social', status: 'Active', metric: 'View-rate 41%', metricSub: '$0.04 CPV', headline: '41%' },
];

const SECTIONS: { id: SectionId; name: string }[] = [
  { id: 'hero', name: 'Hero' },
  { id: 'why', name: 'Why Radiant' },
  { id: 'benefits', name: 'Key Benefits' },
  { id: 'proof', name: 'Social Proof' },
  { id: 'cta', name: 'Final CTA' },
];

interface SectionCopy {
  eyebrow: string;
  headline: string;
  sub?: string;
  cta?: string;
  items?: { icn: string; t: string; s: string }[];
  quotes?: { text: string; who: string }[];
}

const COPY: Record<SectionId, SectionCopy> = {
  hero: {
    eyebrow: 'CRM · Built for small teams',
    headline: 'The CRM your team will actually use.',
    sub: 'Spend less time wrangling pipelines and more time closing. Built for teams of 2–20 — no admin, no consultants, no 30-day onboarding.',
    cta: 'Start free trial',
  },
  why: {
    eyebrow: 'Why Radiant',
    headline: 'CRM that fits how small teams actually work.',
    sub: 'No bloated enterprise checklists. No multi-week setup. Just the pipeline, inbox, and reporting your reps need to close — designed for teams of 2 to 20.',
  },
  benefits: {
    eyebrow: 'Key Benefits',
    headline: 'What you get on day one.',
    items: [
      { icn: '⚡', t: 'Set up in 10 minutes', s: "Drop in your inbox, import your contacts, you're live." },
      { icn: '✦', t: 'Pipelines that auto-update', s: 'No more nagging reps to update deal stages.' },
      { icn: '◆', t: 'Reports your team will read', s: "One screen showing what's working — and what's not." },
    ],
  },
  proof: {
    eyebrow: 'Social Proof',
    headline: 'Loved by small teams that ship.',
    quotes: [
      { text: '"Switched from Salesforce in a weekend. Our reps actually use this one."', who: '— Maya R., Head of Sales, Pollen Studio' },
      { text: "\"The first CRM that didn't need a consultant. Set up in an afternoon.\"", who: '— Jamie L., Co-founder, NorthMark' },
    ],
  },
  cta: {
    eyebrow: 'Get started',
    headline: 'Run your sales pipeline like a small team should.',
    sub: 'Free 14-day trial. No credit card.',
    cta: 'Start free trial',
  },
};

const SUGGESTIONS = [
  { id: 's1', body: <><b>Headline variant with urgency language</b> is outperforming on similar paid pages — try applying ("Start your trial today" vs. current).</> },
  { id: 's2', body: <><b>Organic visitors are bouncing at the benefits section</b> — consider reordering Social Proof above Key Benefits for first-time visitors.</> },
  { id: 's3', body: <><b>This page's CTR is 18% below your paid average</b> — a layout change to a single-column hero may help on Google Ads traffic.</> },
];

const LOAD_LINES = [
  'Analyzing top-performing ad copy…',
  'Identifying highest-converting keywords…',
  'Reading organic traffic patterns…',
  'Applying BrandKit — voice, images, layout…',
  'Structuring page for conversion…',
  'Done — your page is ready.',
];

const TABS = ['All', 'Live', 'Draft', 'Needs Review'] as const;
type Tab = (typeof TABS)[number];

const STATUS_PILL: Record<Status, { bg: string; color: string; dot: string }> = {
  Live: { bg: 'rgba(32,161,79,0.10)', color: 'rgb(32,161,79)', dot: 'rgb(32,161,79)' },
  Draft: { bg: 'var(--dark-4)', color: 'var(--dark-80)', dot: 'var(--dark-60)' },
  'Needs Review': { bg: 'rgba(239,104,0,0.10)', color: 'rgb(239,104,0)', dot: 'rgb(239,104,0)' },
  Paused: { bg: 'var(--dark-4)', color: 'var(--dark-60)', dot: 'var(--dark-40)' },
};

// ─── HELPERS ──────────────────────────────────────────────────────────

function thumbSvg(idx: number) {
  const palettes: [string, string][] = [
    ['#1A1D55', '#fff'],
    ['#AE2222', '#fff'],
    ['#7383A2', '#fff'],
    ['#15823F', '#fff'],
  ];
  const [bg, accent] = palettes[idx % palettes.length];
  return (
    <svg viewBox="0 0 88 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect width="88" height="56" fill={accent} />
      <rect x="0" y="0" width="88" height="14" fill={bg} />
      <rect x="6" y="22" width="42" height="4" rx="1" fill={bg} />
      <rect x="6" y="30" width="56" height="2.5" rx="1" fill="rgba(0,0,0,0.10)" />
      <rect x="6" y="36" width="50" height="2.5" rx="1" fill="rgba(0,0,0,0.10)" />
      <rect x="6" y="44" width="20" height="6" rx="3" fill={bg} />
    </svg>
  );
}

// ─── HUB ──────────────────────────────────────────────────────────────

function HubView({ pages, onOpenPage }: { pages: Page[]; onOpenPage: (p: Page) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const counts = {
    All: pages.length,
    Live: pages.filter((p) => p.status === 'Live').length,
    Draft: pages.filter((p) => p.status === 'Draft').length,
    'Needs Review': pages.filter((p) => p.status === 'Needs Review').length,
  };
  const filtered = activeTab === 'All' ? pages : pages.filter((p) => p.status === activeTab);

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  color: isActive ? 'var(--dark-90)' : 'var(--dark-60)',
                  background: isActive ? 'var(--dark-8)' : 'transparent',
                  border: 'none',
                  fontWeight: isActive ? 500 : 400,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {tab}
                <span style={{ color: 'var(--dark-40)', marginLeft: 4 }}>{counts[tab]}</span>
              </button>
            );
          })}
        </div>
        <input
          placeholder="Search pages…"
          style={{
            width: 240,
            padding: '8px 12px',
            border: '1px solid var(--dark-8)',
            borderRadius: 8,
            fontFamily: 'inherit',
            fontSize: 13,
            background: 'var(--light-100)',
            color: 'var(--dark-90)',
            outline: 'none',
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            background: 'var(--light-100)',
            border: '1px dashed var(--dark-15)',
            borderRadius: 14,
            padding: '56px 32px',
            textAlign: 'center',
            maxWidth: 540,
            margin: '16px auto 0',
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 6 }}>
            No landing pages yet
          </h3>
          <p style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.55, maxWidth: 360, margin: '0 auto 20px' }}>
            Create your first page from a campaign — Blaze writes it, you review, you publish.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((p, i) => {
            const sp = STATUS_PILL[p.status];
            return (
              <div
                key={p.name + i}
                role="button"
                tabIndex={0}
                onClick={() => onOpenPage(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenPage(p);
                  }
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '88px 1fr 110px 90px 140px 24px',
                  gap: 14,
                  alignItems: 'center',
                  background: 'var(--light-100)',
                  border: '1px solid var(--dark-8)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.12s',
                }}
              >
                <div style={{ width: 88, height: 56, borderRadius: 8, overflow: 'hidden', background: 'var(--dark-4)', flexShrink: 0 }}>
                  {thumbSvg(i)}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5, color: 'var(--dark-90)', marginBottom: 2 }}>
                    {p.name}
                    {p.ab && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'rgba(32,161,79,0.12)',
                          color: 'rgb(32,161,79)',
                          borderRadius: 5,
                          padding: '1px 7px',
                          fontSize: 10.5,
                          fontWeight: 500,
                          marginLeft: 6,
                        }}
                      >
                        ⚡ A/B · Winner found
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>
                    {p.source}
                    <span style={{ display: 'inline-block', width: 3, height: 3, borderRadius: '50%', background: 'var(--dark-25)', margin: '0 6px', verticalAlign: 'middle' }} />
                    {p.updated}
                  </div>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 9px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 500,
                    background: sp.bg,
                    color: sp.color,
                    width: 'fit-content',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: sp.dot }} />
                  {p.status}
                </span>
                <div style={{ fontSize: 12, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
                  {p.cvr === '—' ? (
                    <>
                      <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark-40)', letterSpacing: '-0.2px' }}>—</div>
                      <div style={{ fontSize: 10.5, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Not published</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.2px' }}>{p.cvr}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CVR</div>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>{p.channel}</div>
                <div style={{ color: 'var(--dark-40)', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, textAlign: 'center' }} title="More" onClick={(e) => e.stopPropagation()}>
                  ⋯
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CAMPAIGN MODAL ───────────────────────────────────────────────────

function CampaignChooserModal({
  close,
  onGenerate,
}: StackModalProps & {
  onGenerate: (campaign: Campaign | null) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>(CAMPAIGNS[0].id);
  const selected = CAMPAIGNS.find((c) => c.id === selectedId) ?? null;

  const typeStyle: Record<Campaign['typeC'], { bg: string; color: string }> = {
    organic: { bg: 'rgba(0,131,226,0.10)', color: 'rgb(0,131,226)' },
    paid: { bg: '#F1ECFF', color: '#7C5CFC' },
    social: { bg: 'rgba(239,104,0,0.10)', color: 'rgb(239,104,0)' },
  };

  return (
    <Modal.Root size="lg" aria-labelledby="campaign-modal-title" data-testid="campaign-chooser-modal">
      <Modal.Header
        title="Which campaign should we build from?"
        subtitle="Blaze reads your top-performing ads, keywords, and audience signals to draft a page that converts."
        id="campaign-modal-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CAMPAIGNS.map((c) => {
            const isSel = c.id === selectedId;
            const ts = typeStyle[c.typeC];
            const statusBg = c.status === 'Active' ? 'rgba(32,161,79,0.10)' : 'var(--dark-4)';
            const statusColor = c.status === 'Active' ? 'rgb(32,161,79)' : 'var(--dark-60)';
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(c.id);
                  }
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 90px',
                  gap: 14,
                  alignItems: 'center',
                  padding: '12px 14px',
                  border: `1.5px solid ${isSel ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: isSel ? 'rgba(0,0,0,0.02)' : 'transparent',
                  transition: 'border-color 0.12s, background 0.12s',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `1.5px solid ${isSel ? 'var(--dark-90)' : 'var(--dark-15)'}`,
                    background: isSel ? 'var(--dark-90)' : 'transparent',
                    position: 'relative',
                  }}
                >
                  {isSel && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 4,
                        background: '#fff',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13.5, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 3 }}>
                    <span>{c.name}</span>
                    <span style={{ fontSize: 10.5, borderRadius: 5, padding: '1px 7px', background: ts.bg, color: ts.color }}>{c.type}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '2px 7px', borderRadius: 5, background: statusBg, color: statusColor }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor }} />
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>
                    {c.metric}
                    <span style={{ display: 'inline-block', width: 3, height: 3, borderRadius: '50%', background: 'var(--dark-25)', margin: '0 6px', verticalAlign: 'middle' }} />
                    {c.metricSub}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{c.headline}</div>
                  <div style={{ color: 'var(--dark-40)', fontSize: 11 }}>{c.type}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="secondary" onPress={() => onGenerate(null)}>
            Skip — start blank
          </Modal.FooterButton>
          <Modal.FooterButton variant="primary" onPress={() => onGenerate(selected)}>
            Generate landing page
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── LOADING ──────────────────────────────────────────────────────────

function LoadingView({ sourceName, onAdvance }: { sourceName: string; onAdvance: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [done, setDone] = useState<boolean[]>(() => LOAD_LINES.map(() => false));
  const [ctaShown, setCtaShown] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    LOAD_LINES.forEach((_, i) => {
      const delay = 250 + i * 600;
      timers.push(
        setTimeout(() => {
          setActiveIdx(i);
          if (i > 0) {
            setDone((prev) => {
              const next = [...prev];
              next[i - 1] = true;
              return next;
            });
          }
        }, delay),
      );
    });
    // Final flip: mark the last line as done and reveal the CTA.
    const finalDelay = 250 + LOAD_LINES.length * 600 + 200;
    timers.push(
      setTimeout(() => {
        setDone((prev) => {
          const next = [...prev];
          next[LOAD_LINES.length - 1] = true;
          return next;
        });
        setCtaShown(true);
      }, finalDelay),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        minHeight: 'calc(100vh - 120px)',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: '100%',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 16,
          padding: '36px 36px 32px',
          boxShadow: '0 24px 50px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: '#7C5CFC',
            background: '#F1ECFF',
            borderRadius: 5,
            padding: '3px 9px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 500,
            marginBottom: 14,
          }}
        >
          ✦ Agent · Analysis
        </div>
        <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.2px', marginBottom: 6 }}>
          Reading your campaign…
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--dark-60)', marginBottom: 24 }}>
          Source: <b style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{sourceName}</b>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {LOAD_LINES.map((line, i) => {
            const shown = i <= activeIdx;
            const isDone = done[i];
            const isActive = i === activeIdx && !isDone;
            const color = isActive || isDone ? 'var(--dark-90)' : 'var(--dark-60)';
            return (
              <div
                key={line}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  color,
                  opacity: shown ? 1 : 0,
                  transform: shown ? 'none' : 'translateY(4px)',
                  transition: 'opacity 0.3s cubic-bezier(0.2,0,0,1), transform 0.3s cubic-bezier(0.2,0,0,1)',
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDone ? 'rgb(32,161,79)' : '#7C5CFC',
                    flexShrink: 0,
                  }}
                >
                  {isActive ? (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '1.6px solid #7C5CFC',
                        borderTopColor: 'transparent',
                        animation: 'lp-spin 0.8s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                  ) : isDone ? (
                    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor">
                      <path d="m12 2 1.6 4.6L18 8.2l-3.4 2.5L16 15l-4-2.7L8 15l1.4-4.3L6 8.2l4.4-1.6z" />
                    </svg>
                  )}
                </span>
                <span>{line}</span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            opacity: ctaShown ? 1 : 0,
            transform: ctaShown ? 'none' : 'translateY(4px)',
            transition: 'opacity 0.3s cubic-bezier(0.2,0,0,1), transform 0.3s cubic-bezier(0.2,0,0,1)',
          }}
        >
          <Button variant="primary" size="lg" onPress={onAdvance} aria-disabled={!ctaShown}>
            Review your page →
          </Button>
        </div>
      </div>
      <style>{`@keyframes lp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── EDITOR ──────────────────────────────────────────────────────────

function SectionBody({ id }: { id: SectionId }) {
  const c = COPY[id];
  const isCta = id === 'cta';
  const eyebrowColor = isCta ? 'rgba(255,255,255,0.7)' : 'var(--dark-60)';
  const headingColor = isCta ? '#fff' : '#1A1D55';
  const subColor = isCta ? 'rgba(255,255,255,0.7)' : 'var(--dark-60)';

  return (
    <>
      <div
        style={{
          fontSize: 10.5,
          color: eyebrowColor,
          letterSpacing: '0.12em',
          fontWeight: 500,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {c.eyebrow}
      </div>
      {id === 'hero' ? (
        <h1
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: headingColor,
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          The CRM your team will <span style={{ color: '#B06000', fontStyle: 'italic' }}>actually use</span>.
        </h1>
      ) : (
        <h2
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: headingColor,
            letterSpacing: '-0.3px',
            marginBottom: 12,
          }}
        >
          {c.headline}
        </h2>
      )}
      {c.sub && (
        <p style={{ fontSize: 13, color: subColor, lineHeight: 1.55, marginBottom: 18, maxWidth: 540 }}>
          {c.sub}
        </p>
      )}
      {(id === 'hero' || id === 'cta') && c.cta && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, maxWidth: 420 }}>
            <input
              placeholder="Work email"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: isCta ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--dark-8)',
                borderRadius: 7,
                fontFamily: 'inherit',
                fontSize: 13,
                background: isCta ? 'rgba(255,255,255,0.1)' : 'var(--light-100)',
                color: isCta ? '#fff' : 'var(--dark-90)',
                outline: 'none',
              }}
              readOnly
            />
            <button
              type="button"
              style={{
                background: isCta ? '#FCB728' : '#1A1D55',
                color: isCta ? '#1a1a1a' : '#fff',
                border: 'none',
                borderRadius: 7,
                padding: '10px 16px',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {c.cta}
            </button>
          </div>
          {id === 'hero' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--dark-60)' }}>
              <span style={{ color: '#FCB728', letterSpacing: 1 }}>★★★★★</span>
              <span>4.8 — 1,200+ teams</span>
            </div>
          )}
        </>
      )}
      {id === 'benefits' && c.items && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {c.items.map((it) => (
            <div key={it.t} style={{ padding: 14, border: '1px solid var(--dark-8)', borderRadius: 10, background: 'var(--light-100)' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: '#F1ECFF',
                  color: '#7C5CFC',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                {it.icn}
              </div>
              <h4 style={{ fontSize: 13.5, fontWeight: 500, color: '#1A1D55', marginBottom: 4 }}>{it.t}</h4>
              <p style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.5 }}>{it.s}</p>
            </div>
          ))}
        </div>
      )}
      {id === 'proof' && c.quotes && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {c.quotes.map((q) => (
            <div key={q.who} style={{ padding: 14, border: '1px solid var(--dark-8)', borderRadius: 10, background: '#fafafa' }}>
              <div style={{ fontSize: 13, color: 'var(--dark-90)', lineHeight: 1.5, marginBottom: 10 }}>{q.text}</div>
              <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>{q.who}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function EditorView({
  pageName,
  setPageName,
  campaign,
  selectedSection,
  setSelectedSection,
  approved,
  setApproved,
  onBack,
  onPublish,
}: {
  pageName: string;
  setPageName: (v: string) => void;
  campaign: Campaign | null;
  selectedSection: SectionId;
  setSelectedSection: (id: SectionId) => void;
  approved: Set<SectionId>;
  setApproved: (next: Set<SectionId>) => void;
  onBack: () => void;
  onPublish: () => void;
}) {
  const { showToast } = useToast();
  const c = COPY[selectedSection];
  const sec = SECTIONS.find((s) => s.id === selectedSection)!;
  const isApproved = approved.has(selectedSection);
  const allApproved = approved.size === SECTIONS.length;
  const publishUnlocked = allApproved;
  const srcLabel = campaign?.name.split('—')[0].trim() ?? 'Built from scratch';

  const approveSection = useCallback(() => {
    const next = new Set(approved);
    next.add(selectedSection);
    setApproved(next);
    const nextSec = SECTIONS.find((s) => !next.has(s.id));
    if (nextSec) setSelectedSection(nextSec.id);
    if (next.size === SECTIONS.length) {
      showToast({ message: 'All sections approved — ready to publish' });
    }
  }, [approved, selectedSection, setApproved, setSelectedSection, showToast]);

  const unapprove = () => {
    const next = new Set(approved);
    next.delete(selectedSection);
    setApproved(next);
  };

  const approveAll = () => {
    const next = new Set<SectionId>();
    SECTIONS.forEach((s) => next.add(s.id));
    setApproved(next);
    showToast({ message: 'Approved all 5 sections' });
  };

  // 3-pane layout escapes the .content padding (24px) via negative margin.
  return (
    <div
      style={{
        margin: -24,
        height: 'calc(100vh - 56px - 0px + 48px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f0f0f0',
      }}
    >
      {/* Editor topbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          background: 'var(--light-100)',
          borderBottom: '1px solid var(--dark-8)',
          flexShrink: 0,
        }}
      >
        <IconButton variant="ghost" size="md" icon={ArrowLeft} aria-label="Back" onPress={onBack} />
        <input
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--dark-90)',
            letterSpacing: '0.05px',
            padding: '6px 8px',
            borderRadius: 6,
            outline: 'none',
            minWidth: 240,
          }}
        />
        <span
          style={{
            fontSize: 11.5,
            color: 'var(--dark-60)',
            background: 'rgba(0,0,0,0.02)',
            border: '1px solid var(--dark-4)',
            borderRadius: 6,
            padding: '3px 9px',
            marginLeft: 6,
          }}
        >
          Built from: <b style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{srcLabel}</b>
        </span>
        <div style={{ flex: 1 }} />
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={() => showToast({ message: 'Insert section (TODO)' })}>
          Insert
        </Button>
        <div
          style={{
            display: 'inline-flex',
            border: '1px solid var(--dark-8)',
            borderRadius: 7,
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            aria-label="Desktop"
            style={{
              background: 'var(--dark-90)',
              border: 'none',
              padding: '6px 9px',
              cursor: 'pointer',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Computer size={14} />
          </button>
          <button
            type="button"
            aria-label="Mobile"
            onClick={() => showToast({ message: 'Mobile preview (TODO)' })}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 9px',
              cursor: 'pointer',
              color: 'var(--dark-60)',
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: 'inherit',
              fontSize: 12,
            }}
          >
            ▢
          </button>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid var(--dark-8)',
            borderRadius: 7,
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            style={{ background: 'none', border: 'none', width: 26, height: 30, cursor: 'pointer', color: 'var(--dark-60)', fontSize: 14, fontFamily: 'inherit' }}
          >
            −
          </button>
          <span style={{ padding: '0 8px', fontSize: 12, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>100%</span>
          <button
            type="button"
            style={{ background: 'none', border: 'none', width: 26, height: 30, cursor: 'pointer', color: 'var(--dark-60)', fontSize: 14, fontFamily: 'inherit' }}
          >
            +
          </button>
        </div>
        <IconButton variant="secondary" size="md" icon={Settings} aria-label="Settings" onPress={() => showToast({ message: 'Page settings (TODO)' })} />
        <Button variant="primary" size="md" onPress={onPublish} aria-disabled={!publishUnlocked}>
          Publish
        </Button>
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '220px 1fr 280px',
          overflow: 'hidden',
        }}
      >
        {/* Left pane: section navigator */}
        <aside
          style={{
            background: 'var(--light-100)',
            borderRight: '1px solid var(--dark-8)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', borderBottom: '1px solid var(--dark-4)' }}>
            <button
              type="button"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                padding: '11px 14px',
                fontFamily: 'inherit',
                fontSize: 11,
                color: 'var(--dark-90)',
                letterSpacing: '0.08em',
                fontWeight: 500,
                cursor: 'pointer',
                borderBottom: '2px solid var(--dark-90)',
              }}
            >
              SECTIONS
            </button>
            <button
              type="button"
              onClick={() => showToast({ message: 'Chat (TODO)' })}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                padding: '11px 14px',
                fontFamily: 'inherit',
                fontSize: 11,
                color: 'var(--dark-40)',
                letterSpacing: '0.08em',
                fontWeight: 500,
                cursor: 'pointer',
                borderBottom: '2px solid transparent',
              }}
            >
              CHAT
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px 8px' }}>
            <span style={{ fontSize: 11, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
              Page sections
            </span>
            <button
              type="button"
              aria-label="Add"
              onClick={() => showToast({ message: 'Add section (TODO)' })}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--dark-60)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px 12px', gap: 2 }}>
            {SECTIONS.map((s) => {
              const sel = s.id === selectedSection;
              const okay = approved.has(s.id);
              return (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedSection(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedSection(s.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontSize: 13,
                    color: sel ? 'var(--dark-90)' : 'var(--dark-80)',
                    background: sel ? 'var(--dark-4)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{ color: 'var(--dark-25)', fontSize: 14, cursor: 'grab', userSelect: 'none' }}>⋮⋮</span>
                  <span style={{ flex: 1 }}>{s.name}</span>
                  <span style={{ color: 'rgb(32,161,79)', fontSize: 12, opacity: okay ? 1 : 0 }}>✓</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center pane: canvas preview */}
        <div
          style={{
            overflowY: 'auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f0f0f0',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 880,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
            }}
          >
            {SECTIONS.map((s) => {
              const sel = s.id === selectedSection;
              const okay = approved.has(s.id);
              const isCta = s.id === 'cta';
              return (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedSection(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedSection(s.id);
                    }
                  }}
                  style={{
                    padding: '36px 40px',
                    borderBottom: s.id === 'cta' ? 'none' : '1px solid var(--dark-4)',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: sel ? 'inset 0 0 0 2px var(--dark-90)' : 'none',
                    borderRadius: sel ? 8 : 0,
                    background: isCta ? 'linear-gradient(135deg, #1A1D55 0%, #2F3B82 100%)' : undefined,
                    color: isCta ? '#fff' : undefined,
                  }}
                >
                  {sel && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'var(--dark-90)',
                        color: '#fff',
                        fontSize: 10.5,
                        fontWeight: 500,
                        padding: '2px 7px',
                        borderRadius: 5,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {s.name}
                    </span>
                  )}
                  {okay && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(32,161,79,0.10)',
                        color: 'rgb(32,161,79)',
                        fontSize: 10.5,
                        fontWeight: 500,
                        padding: '2px 7px',
                        borderRadius: 5,
                        letterSpacing: '0.02em',
                      }}
                    >
                      ✓ Approved
                    </span>
                  )}
                  <SectionBody id={s.id} />
                </div>
              );
            })}
          </div>

          {/* Sticky review status bar */}
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              width: '100%',
              maxWidth: 880,
              marginTop: 14,
              background: 'var(--dark-90)',
              color: '#fff',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {approved.size} of {SECTIONS.length} sections approved
              </span>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.16)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'rgb(32,161,79)',
                    borderRadius: 2,
                    transition: 'width 0.3s cubic-bezier(0.2,0,0,1)',
                    width: `${(approved.size / SECTIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={approveAll}
              style={{
                background: 'var(--light-100)',
                color: 'var(--dark-90)',
                border: 'none',
                borderRadius: 7,
                padding: '7px 12px',
                fontFamily: 'inherit',
                fontSize: 12.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Approve all
            </button>
          </div>
        </div>

        {/* Right pane: edit panel */}
        <aside
          style={{
            background: 'var(--light-100)',
            borderLeft: '1px solid var(--dark-8)',
            overflowY: 'auto',
            padding: 18,
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 6 }}>
            Editing
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 12, letterSpacing: '0.05px' }}>
            {sec.name}
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginBottom: 6, fontWeight: 500 }}>Eyebrow</div>
            <input
              defaultValue={c.eyebrow}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid var(--dark-8)',
                borderRadius: 7,
                fontFamily: 'inherit',
                fontSize: 13,
                color: 'var(--dark-90)',
                background: 'var(--light-100)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginBottom: 6, fontWeight: 500 }}>Headline</div>
            <input
              defaultValue={c.headline}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid var(--dark-8)',
                borderRadius: 7,
                fontFamily: 'inherit',
                fontSize: 13,
                color: 'var(--dark-90)',
                background: 'var(--light-100)',
                outline: 'none',
              }}
            />
          </div>
          {c.sub !== undefined && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginBottom: 6, fontWeight: 500 }}>Body</div>
              <textarea
                defaultValue={c.sub}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--dark-8)',
                  borderRadius: 7,
                  fontFamily: 'inherit',
                  fontSize: 13,
                  color: 'var(--dark-90)',
                  background: 'var(--light-100)',
                  outline: 'none',
                  minHeight: 80,
                  resize: 'vertical',
                  lineHeight: 1.5,
                }}
              />
            </div>
          )}
          {c.cta && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginBottom: 6, fontWeight: 500 }}>CTA label</div>
              <input
                defaultValue={c.cta}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--dark-8)',
                  borderRadius: 7,
                  fontFamily: 'inherit',
                  fontSize: 13,
                  color: 'var(--dark-90)',
                  background: 'var(--light-100)',
                  outline: 'none',
                }}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Button
              variant="secondary"
              size="md"
              frontIcon={ArrowRefresh}
              onPress={() => showToast({ message: 'Regenerated by Blaze ✦' })}
            >
              Regenerate
            </Button>
            {isApproved ? (
              <Button variant="secondary" size="md" frontIcon={Check2} onPress={unapprove}>
                Approved
              </Button>
            ) : (
              <Button variant="secondary" size="md" onPress={approveSection}>
                Approve
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── PUBLISHED ─────────────────────────────────────────────────────────

function Sparkline() {
  const data = [3.1, 3.4, 2.9, 3.6, 3.8, 3.5, 4.0, 4.1, 3.9, 4.3, 4.5, 4.4, 4.7, 4.6];
  const W = 600;
  const H = 140;
  const min = Math.min(...data) - 0.4;
  const max = Math.max(...data) + 0.4;
  const xs = data.map((_, i) => (i / (data.length - 1)) * (W - 30) + 15);
  const ys = data.map((v) => H - 18 - ((v - min) / (max - min)) * (H - 36));
  const path = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L ${xs[xs.length - 1].toFixed(1)},${H - 12} L ${xs[0].toFixed(1)},${H - 12} Z`;
  const grid: number[] = [];
  for (let i = 1; i < 4; i++) {
    grid.push((H - 24) * (i / 4) + 6);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      {grid.map((y, i) => (
        <line key={i} x1="0" y1={y} x2={W} y2={y} stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      <path d={area} fill="rgba(26,29,85,0.07)" />
      <path d={path} fill="none" stroke="#1A1D55" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3.5" fill="#1A1D55" />
      <text x="15" y={H - 2} fill="rgba(0,0,0,0.4)" fontSize="10" fontFamily="Söhne, Inter">Apr 22</text>
      <text x={W / 2 - 18} y={H - 2} fill="rgba(0,0,0,0.4)" fontSize="10" fontFamily="Söhne, Inter">Apr 29</text>
      <text x={W - 50} y={H - 2} fill="rgba(0,0,0,0.4)" fontSize="10" fontFamily="Söhne, Inter">May 5</text>
    </svg>
  );
}

function PublishedView({ pageName, onEdit }: { pageName: string; onEdit: () => void }) {
  const { showToast } = useToast();
  const [bannerShown, setBannerShown] = useState(false);
  const [applied, setApplied] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const id = setTimeout(() => setBannerShown(true), 100);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{ padding: '0 28px 48px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', paddingTop: 18 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(32,161,79,0.10)',
            border: '1px solid rgba(32,161,79,0.32)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 13,
            color: 'var(--dark-80)',
            opacity: bannerShown ? 1 : 0,
            transform: bannerShown ? 'none' : 'translateY(-4px)',
            transition: 'opacity 0.3s cubic-bezier(0.2,0,0,1), transform 0.3s cubic-bezier(0.2,0,0,1)',
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgb(32,161,79)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check2 size={11} />
          </span>
          <div>
            <b style={{ color: 'var(--dark-90)', fontWeight: 500 }}>Page published.</b> Visitors can find it now — Blaze is watching for signals to improve it.
          </div>
          <a
            onClick={() => showToast({ message: 'Open live page (TODO)' })}
            style={{ marginLeft: 'auto', color: 'var(--dark-90)', fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}
          >
            View page ↗
          </a>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 8, letterSpacing: '-0.2px' }}>
          {pageName}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 500,
              background: 'rgba(32,161,79,0.10)',
              color: 'rgb(32,161,79)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(32,161,79)' }} />
            Live
          </span>
          <code
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 6,
              padding: '4px 9px',
              fontFamily: 'ui-monospace,monospace',
              fontSize: 12,
              color: 'var(--dark-80)',
            }}
          >
            radiant.com/crm-small-teams
          </code>
          <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>Published 2 min ago</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 18 }}>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 14, padding: '18px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.05px', color: 'var(--dark-90)' }}>Conversion Insights</h3>
              <div style={{ fontSize: 11.5, color: 'var(--dark-40)' }}>Last 14 days · simulated</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
              {[
                { lbl: 'Visitors', val: '3,184', delta: '+12.4% wk' },
                { lbl: 'Conversions', val: '147', delta: '+18.7% wk' },
                { lbl: 'CVR', val: '4.6%', delta: '+0.3 pts' },
              ].map((k) => (
                <div key={k.lbl}>
                  <div style={{ fontSize: 11, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 4 }}>
                    {k.lbl}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.4px', fontVariantNumeric: 'tabular-nums' }}>{k.val}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 500, color: 'rgb(32,161,79)', marginTop: 2 }}>{k.delta}</div>
                </div>
              ))}
            </div>
            <div style={{ width: '100%', height: 140 }}>
              <Sparkline />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '0.05px' }}>AI Suggestions</span>
              <span style={{ fontSize: 11.5, color: 'var(--dark-40)' }}>{SUGGESTIONS.length} new</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTIONS.map((s) => {
                const isApplied = applied.has(s.id);
                return (
                  <div
                    key={s.id}
                    style={{
                      background: 'var(--light-100)',
                      border: '1px solid var(--dark-8)',
                      borderRadius: 12,
                      padding: 14,
                      transition: 'border-color 0.12s, opacity 0.2s',
                      opacity: isApplied ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: '#7C5CFC',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: 11,
                        }}
                      >
                        ✦
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--dark-80)', lineHeight: 1.5 }}>{s.body}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isApplied ? (
                        <span
                          style={{
                            fontSize: 11.5,
                            color: 'rgb(32,161,79)',
                            background: 'rgba(32,161,79,0.10)',
                            borderRadius: 5,
                            padding: '3px 8px',
                            fontWeight: 500,
                          }}
                        >
                          ✓ Applied
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Set(applied);
                              next.add(s.id);
                              setApplied(next);
                            }}
                            style={{
                              background: 'var(--dark-90)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 11px',
                              fontFamily: 'inherit',
                              fontSize: 11.5,
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast({ message: 'Dismissed suggestion' })}
                            style={{
                              background: 'none',
                              color: 'var(--dark-60)',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 11px',
                              fontFamily: 'inherit',
                              fontSize: 11.5,
                              cursor: 'pointer',
                            }}
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11.5, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10 }}>
              Top sources
            </div>
            {[
              { src: 'Google · Paid', val: '1,402 · 5.1% CVR' },
              { src: 'Google · Organic', val: '1,108 · 4.2% CVR' },
              { src: 'LinkedIn · Organic', val: '412 · 3.8% CVR' },
              { src: 'Direct', val: '262 · 5.6% CVR' },
            ].map((r, i, arr) => (
              <div
                key={r.src}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--dark-4)',
                  fontSize: 12.5,
                  color: 'var(--dark-80)',
                }}
              >
                <span>{r.src}</span>
                <span style={{ color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{r.val}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11.5, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10 }}>
              Section engagement
            </div>
            {[
              { src: 'Hero', val: '100% viewed' },
              { src: 'Why Radiant', val: '88% viewed' },
              { src: 'Key Benefits', val: '61% viewed · ⚠ drop-off' },
              { src: 'Social Proof', val: '52% viewed' },
              { src: 'Final CTA', val: '38% viewed' },
            ].map((r, i, arr) => (
              <div
                key={r.src}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--dark-4)',
                  fontSize: 12.5,
                  color: 'var(--dark-80)',
                }}
              >
                <span>{r.src}</span>
                <span style={{ color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="md" onPress={() => showToast({ message: 'View live page (TODO)' })}>
            View live page ↗
          </Button>
          <Button variant="secondary" size="md" onPress={onEdit}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── ROUTE ────────────────────────────────────────────────────────────

export function LandingPagesRoute() {
  return (
    <ModalStack>
      <LandingPagesRouteInner />
    </ModalStack>
  );
}

function LandingPagesRouteInner() {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();
  const [view, setView] = useState<View>('hub');
  const [pages, setPages] = useState<Page[]>(INITIAL_PAGES);
  const [campaign, setCampaign] = useState<Campaign | null>(CAMPAIGNS[0]);
  const [pageName, setPageName] = useState('CRM for small teams — landing page');
  const [selectedSection, setSelectedSection] = useState<SectionId>('hero');
  const [approved, setApproved] = useState<Set<SectionId>>(() => new Set());

  const openCampaignChooser = useCallback(() => {
    openModal(CampaignChooserModal, {
      onGenerate: (c) => {
        setCampaign(c);
        setApproved(new Set());
        setSelectedSection('hero');
        setPageName('CRM for small teams — landing page');
        closeModal();
        setView('loading');
      },
    });
  }, [openModal, closeModal]);

  const openPage = (p: Page) => {
    setPageName(p.name);
    setView('editor');
  };

  const publish = () => {
    if (approved.size !== SECTIONS.length) {
      showToast({ message: 'Approve all 5 sections before publishing' });
      return;
    }
    setPages((prev) => {
      const exists = prev.find((p) => p.name === pageName);
      if (exists) return prev;
      return [
        ...prev,
        {
          name: pageName,
          source: campaign ? campaign.name : 'Built from scratch',
          status: 'Live',
          cvr: '4.6%',
          updated: 'Just published',
          channel: campaign ? campaign.type : 'Custom',
        },
      ];
    });
    setView('published');
  };

  const topbarRight = useMemo(() => {
    if (view === 'hub') {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="md" onPress={() => showToast({ message: 'Import URL (TODO)' })}>
            Import URL
          </Button>
          <Button variant="secondary" size="md" frontIcon={Plus} onPress={openCampaignChooser}>
            New Landing Page
          </Button>
        </div>
      );
    }
    if (view === 'loading') {
      return (
        <Button variant="ghost" size="md" onPress={() => setView('hub')}>
          Cancel
        </Button>
      );
    }
    if (view === 'published') {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="md" onPress={() => showToast({ message: 'View live page (TODO)' })}>
            View live page ↗
          </Button>
          <Button variant="secondary" size="md" onPress={() => setView('editor')}>
            Edit
          </Button>
        </div>
      );
    }
    return undefined;
  }, [view, showToast, openCampaignChooser]);

  const title = useMemo(() => {
    if (view === 'loading') return 'Building your page';
    if (view === 'published') return 'Landing Pages › CRM for small teams';
    return 'Landing Pages';
  }, [view]);

  return (
    <H2Layout title={title} topbarRight={topbarRight}>
      {view === 'hub' && <HubView pages={pages} onOpenPage={openPage} />}
      {view === 'loading' && (
        <LoadingView
          sourceName={campaign?.name ?? 'Untitled'}
          onAdvance={() => setView('editor')}
        />
      )}
      {view === 'editor' && (
        <EditorView
          pageName={pageName}
          setPageName={setPageName}
          campaign={campaign}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          approved={approved}
          setApproved={setApproved}
          onBack={() => setView('hub')}
          onPublish={publish}
        />
      )}
      {view === 'published' && (
        <PublishedView pageName={pageName} onEdit={() => setView('editor')} />
      )}
    </H2Layout>
  );
}
