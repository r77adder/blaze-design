import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, ModalStack, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';
import AlertTriangle from '@/icons/20/AlertTriangle';
import Check2 from '@/icons/20/Check2';
import Stars from '@/icons/20/Stars';
import { H2Layout } from '../H2Layout';
import { useDevState } from '../dev-state-context';

/**
 * /h2/paid-search — deep port of `~/dev/Blaze H2 Features/paid-search.html`.
 *
 * States:
 *  - Empty (no campaigns yet)
 *  - Campaigns list (one campaign, can flag an anomaly)
 *  - Live campaign view (KPIs, anomaly card, CTR chart, keyword table)
 *  - Wizard modal (loading stage → summary stage with prep-modal links)
 *
 * Interactivity:
 *  - Topbar "New campaign" → opens WizardModal.
 *  - Empty-state CTA → opens WizardModal.
 *  - Campaigns list row → drills into live view.
 *  - Anomaly card actions (pause / lower bid / continue monitor) → toast +
 *    swap to .anomaly-resolved success block.
 *  - Wizard loading stage auto-progresses through 5 agent tasks then advances
 *    to summary. Summary "Back" returns to a fresh loading run. Launch closes
 *    the wizard and seeds a Live campaign.
 *  - Summary "Agent also prepared" links open nested prep modals (keywords /
 *    bid / negatives).
 */

// ─── DATA ────────────────────────────────────────────────────────────

const KPIS = [
  { label: 'Impressions', value: '8,432', delta: '↑ 12%', tone: 'up' as const },
  { label: 'Clicks', value: '187', delta: '↑ 8%', tone: 'up' as const },
  { label: 'CTR', value: '2.22%', delta: '↑ 0.4 pt', tone: 'up' as const },
  { label: 'Conversions', value: '6', delta: '↑ 2', tone: 'up' as const },
  { label: 'Spend', value: '$32.40', delta: '81% of daily', tone: 'flat' as const },
  { label: 'CPA', value: '$5.40', delta: 'on target', tone: 'up' as const },
];

interface Keyword {
  name: string;
  clicks: number;
  conv: number;
  status: 'ok' | 'alert' | 'paused' | 'watching';
}

const BASE_KEYWORDS: Keyword[] = [
  { name: 'daily wellness routine', clicks: 62, conv: 3, status: 'ok' },
  { name: 'best adaptogens', clicks: 48, conv: 2, status: 'ok' },
  { name: 'ashwagandha benefits', clicks: 31, conv: 1, status: 'ok' },
  { name: 'wellness supplements', clicks: 23, conv: 0, status: 'alert' },
  { name: 'stress supplements', clicks: 14, conv: 0, status: 'ok' },
];

const LOADING_TASKS = [
  {
    name: 'Pull context',
    subActions: ['Reading Brand Kit', 'Reviewing top product', 'Scanning recent campaigns'],
    summary: 'Brand Kit · Daily Wellness Bundle · 4 campaigns reviewed',
  },
  {
    name: 'Research keywords',
    subActions: ['Searching 12 competitors', 'Analyzing search trends', 'Clustering 47 keywords'],
    summary: '47 high-intent keywords across 3 themes',
  },
  {
    name: 'Draft ad copy',
    subActions: ['Reading brand voice patterns', 'Generating headlines', 'Writing descriptions'],
    summary: '3 RSA variants · 6 hook patterns from your voice',
  },
  {
    name: 'Pick bid strategy',
    subActions: ['Comparing 4 strategies', 'Modeling first-week performance', 'Selecting Maximize Conversions'],
    summary: 'Maximize Conversions — best for new campaigns',
  },
  {
    name: 'Build negative keywords',
    subActions: ['Identifying low-intent terms', 'Filtering off-brand searches', 'Building exclusion list'],
    summary: '47 negatives across 5 categories',
  },
];

const COPY_DATA = [
  {
    head: 'Daily Wellness Bundle — Built by Naturopaths',
    desc: '5-supplement routine for energy, focus, and stress. Free shipping. 30-day guarantee. Save 20% on your first order.',
  },
  {
    head: 'Stress Less, Live More — Clinically-Studied Adaptogens',
    desc: 'Naturopath-formulated stack with real ingredients and real results. 4.8★ from 12,000+ reviews. Try risk-free for 30 days.',
  },
  {
    head: 'Energy. Focus. Calm. One Daily Bundle, Built for You',
    desc: "No guesswork, no fluff — just the 5 supplements you actually need. Made in the USA, third-party tested. 20% off + free shipping.",
  },
];

interface KwGroup {
  theme: string;
  match: 'phrase' | 'exact' | 'broad';
  terms: string[];
}

const KW_GROUPS: KwGroup[] = [
  {
    theme: 'Brand & Generic',
    match: 'phrase',
    terms: [
      'daily wellness bundle',
      'wellness supplement bundle',
      'daily multivitamin bundle',
      'adaptogen bundle',
      'supplement stack for energy',
      'daily wellness routine',
      'supplements for adults',
      'daily wellness kit',
      'wellness subscription box',
      'health supplement starter',
      'clean wellness routine',
      'simple supplement stack',
    ],
  },
  {
    theme: 'High-intent buyers',
    match: 'exact',
    terms: [
      'best wellness supplements',
      'clinically tested adaptogens',
      'third-party tested supplements',
      'clean supplement brand',
      'naturopath designed supplements',
      'wellness bundle subscription',
      'daily supplement for energy and focus',
      'adaptogen routine for stress',
      'all-in-one supplement bundle',
      'best adaptogen stack',
      'best daily multivitamin',
      'daily energy supplement',
      'wellness bundle review',
      'adaptogen subscription',
      'clean supplements no fillers',
      'supplement bundle 30 day',
      'doctor formulated supplements',
      'wellness kit for women',
    ],
  },
  {
    theme: 'Discovery',
    match: 'broad',
    terms: [
      'energy and focus supplement',
      'natural stress relief',
      'clean wellness products',
      'adaptogen blend',
      'morning supplement routine',
      'wellness routine for adults',
      'clean energy supplement',
      'adaptogen for focus',
      'clean multivitamin',
      'supplements for working professionals',
      'everyday wellness',
      'clean stack supplements',
      'naturopath approved',
      'third party tested wellness',
      'clean ingredient supplements',
      'daily clean energy',
      'supplements for stress and focus',
    ],
  },
];
const KW_TOTAL = KW_GROUPS.reduce((n, g) => n + g.terms.length, 0);

interface BidStrategy {
  id: string;
  label: string;
  tag?: 'recommended';
  tagText?: string;
  desc: string;
}

const BID_STRATEGIES: BidStrategy[] = [
  {
    id: 'max_conv',
    label: 'Maximize Conversions',
    tag: 'recommended',
    tagText: 'Recommended',
    desc: 'Lets Google use your full budget on top-converting traffic. Best for new campaigns with limited historical data.',
  },
  {
    id: 'target_cpa',
    label: 'Target CPA',
    desc: 'Set a CPA goal and Google bids to hit it. Recommended once you have 30+ conversions of historical data.',
  },
  {
    id: 'manual_cpc',
    label: 'Manual CPC',
    desc: 'You set the max bid per click. More control, but slower learning. Use when budget is tight.',
  },
  {
    id: 'max_clicks',
    label: 'Maximize Clicks',
    desc: 'Drives the most clicks for your budget. Good for traffic-building, lower conversion focus.',
  },
];

const NEG_GROUPS = [
  {
    category: 'Free / DIY',
    terms: [
      'free vitamins',
      'homemade supplements',
      'diy adaptogen',
      'recipe',
      'make your own multivitamin',
      'free wellness sample',
      'free supplement trial',
      'wellness coupon',
      'discount code',
    ],
  },
  {
    category: 'Competitors',
    terms: [
      'athletic greens',
      'ag1',
      'ritual',
      'olly',
      'seed',
      'one a day',
      'centrum',
      'garden of life',
      'onnit',
      'huel',
      'nutricost',
      'nature made',
      'now foods',
      'swanson',
    ],
  },
  {
    category: 'Off-topic',
    terms: [
      'horse vitamins',
      'dog supplements',
      'pet wellness',
      'horse adaptogen',
      'cat multivitamin',
      'baby vitamins',
      'infant supplement',
      'toddler vitamins',
      'livestock supplement',
      'equine',
    ],
  },
  {
    category: 'Health conditions / claims',
    terms: [
      'cure',
      'treatment',
      'medical',
      'prescription',
      'medication',
      'disease',
      'therapy',
      'clinical trial',
    ],
  },
  {
    category: 'Out-of-region',
    terms: [
      'supplements canada',
      'wellness uk',
      'vitamins europe',
      'supplements australia',
      'adaptogen india',
      'wellness asia',
    ],
  },
];
const NEG_TOTAL = NEG_GROUPS.reduce((n, g) => n + g.terms.length, 0);

const DELTA_COLORS = { up: '#0E6B33', down: 'var(--status-failed)', flat: 'var(--dark-60)' };

type View = 'empty' | 'campaigns' | 'live';
type AnomalyAction = 'pause' | 'lower' | 'monitor';
interface AnomalyState {
  resolved: boolean;
  action: AnomalyAction | null;
}

// ─── EMPTY STATE ───────────────────────────────────────────────────────

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '60px 28px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'linear-gradient(135deg, var(--brand-yellow-50, #FCB728), #B06000)',
          color: 'var(--light-100)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 22,
        }}
      >
        <Stars size={28} />
      </div>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: '-0.4px',
          color: 'var(--dark-90)',
          margin: '0 0 10px',
        }}
      >
        Let Blaze run your first paid search campaign
      </h2>
      <p
        style={{
          fontSize: 14.5,
          color: 'var(--dark-60)',
          lineHeight: 1.55,
          margin: '0 auto 24px',
          maxWidth: 520,
        }}
      >
        The agent pulls your brand context, researches keywords, drafts ad copy, picks a bid
        strategy, and prepares negative keywords — all before you approve.
      </p>
      <Button variant="primary" size="lg" frontIcon={Plus} onPress={onStart}>
        Create campaign
      </Button>
    </div>
  );
}

// ─── CAMPAIGNS LIST ────────────────────────────────────────────────────

function CampaignsList({
  anomaly,
  onOpenLive,
}: {
  anomaly: AnomalyState;
  onOpenLive: () => void;
}) {
  const showAnomaly = !anomaly.resolved;
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 28px 60px' }}>
      {showAnomaly && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--yellow-bg, #FEF3C7)',
            border: '1px solid rgba(217,119,6,0.32)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 12,
            fontSize: 12.5,
            color: '#713F12',
          }}
        >
          <AlertTriangle size={14} />
          <span>
            Blaze flagged a CPC spike on <strong>"wellness supplements"</strong>
          </span>
          <button
            type="button"
            onClick={onOpenLive}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12.5,
              color: 'var(--dark-90)',
              fontWeight: 450,
              textDecoration: 'underline',
              textUnderlineOffset: 2,
              textDecorationColor: 'var(--dark-15)',
            }}
          >
            Review →
          </button>
        </div>
      )}

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
            gridTemplateColumns: '2fr 1fr 90px 100px 90px 80px 90px 28px',
            gap: 14,
            alignItems: 'center',
            padding: '11px 16px',
            background: 'var(--surface-2, #FAFAFA)',
            borderBottom: '1px solid var(--dark-8)',
            fontSize: 11,
            color: 'var(--dark-40)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 450,
          }}
        >
          <div>Campaign</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Spend</div>
          <div style={{ textAlign: 'right' }}>Impr.</div>
          <div style={{ textAlign: 'right' }}>Clicks</div>
          <div style={{ textAlign: 'right' }}>Conv.</div>
          <div style={{ textAlign: 'right' }}>CPA</div>
          <div />
        </div>
        <button
          type="button"
          onClick={onOpenLive}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 90px 100px 90px 80px 90px 28px',
            gap: 14,
            alignItems: 'center',
            padding: '14px 16px',
            background: 'transparent',
            border: 'none',
            width: '100%',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 450, color: 'var(--dark-90)' }}>Daily Wellness Bundle</div>
            <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 2 }}>
              Search · $40/day · Started 2h 14m ago
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: 5,
                fontSize: 11,
                fontWeight: 450,
                background: '#DCFCE7',
                color: '#14532D',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--status-approved)',
                  animation: 'pulse 1.6s ease-out infinite',
                }}
              />
              Live
            </span>
            {showAnomaly && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'var(--yellow-bg, #FEF3C7)',
                  color: '#713F12',
                  padding: '2px 7px',
                  borderRadius: 5,
                  fontSize: 10.5,
                  fontWeight: 500,
                }}
              >
                <AlertTriangle size={11} />1 anomaly
              </span>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
            $32.40
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>8,432</div>
          <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>187</div>
          <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>6</div>
          <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>$5.40</div>
          <div style={{ color: 'var(--dark-40)' }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── LIVE CAMPAIGN VIEW (steady state) ─────────────────────────────────

function LiveCampaign({
  anomaly,
  onBack,
  onResolveAnomaly,
}: {
  anomaly: AnomalyState;
  onBack: () => void;
  onResolveAnomaly: (action: AnomalyAction) => void;
}) {
  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          color: 'var(--dark-60)',
          fontSize: 13,
          padding: '6px 0',
          marginBottom: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        ← Campaigns
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'var(--status-approved)',
            boxShadow: '0 0 0 4px rgba(4,175,0,0.18)',
            animation: 'pulse 1.6s ease-out infinite',
          }}
        />
        <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>
          Daily Wellness Bundle · Live
        </h2>
        <span style={{ fontSize: 12, color: 'var(--dark-60)', marginLeft: 'auto' }}>Started 2h 14m ago</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-60)', marginBottom: 18 }}>
        Search campaign · <strong>$40/day budget</strong> · Targeting wellness-curious adults 25–45, US
      </div>

      {/* KPI strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 10,
          marginBottom: 18,
        }}
      >
        {KPIS.map((k) => (
          <div
            key={k.label}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--dark-60)', marginBottom: 6 }}>{k.label}</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--dark-90)',
                marginBottom: 4,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {k.value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: DELTA_COLORS[k.tone] }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Anomaly block — either card with actions or resolved success */}
      {anomaly.resolved ? <AnomalyResolved action={anomaly.action} /> : <AnomalyCard onResolve={onResolveAnomaly} />}

      {/* CTR chart card */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>CTR — last 14 days</h3>
          <span style={{ fontSize: 11, color: 'var(--dark-40)' }}>vs. industry benchmark</span>
        </div>
        <svg viewBox="0 0 600 160" width="100%" height="160" preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="paidSearchFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="rgba(0,0,0,0.04)" strokeWidth="1">
            <line x1="0" y1="20" x2="600" y2="20" />
            <line x1="0" y1="60" x2="600" y2="60" />
            <line x1="0" y1="100" x2="600" y2="100" />
            <line x1="0" y1="140" x2="600" y2="140" />
          </g>
          <g fontFamily="Sohne" fontSize="10" fill="rgba(0,0,0,0.4)">
            <text x="2" y="22">2.5%</text>
            <text x="2" y="62">2.0%</text>
            <text x="2" y="102">1.5%</text>
            <text x="2" y="142">1.0%</text>
          </g>
          <path
            d="M40 110 L100 105 L160 105 L220 100 L280 95 L340 92 L400 88 L460 85 L520 83 L580 82"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="1.4"
            fill="none"
            strokeDasharray="4 4"
          />
          <path
            d="M40 130 L100 120 L160 120 L220 95 L280 85 L340 90 L400 92 L460 70 L520 65 L580 75 L580 150 L40 150 Z"
            fill="url(#paidSearchFade)"
          />
          <path
            d="M40 130 L100 120 L160 120 L220 95 L280 85 L340 90 L400 92 L460 70 L520 65 L580 75"
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="580" cy="75" r="3.5" fill="#6366f1" />
          <g fontFamily="Sohne" fontSize="10" fill="rgba(0,0,0,0.4)">
            <text x="34" y="158">Apr 24</text>
            <text x="276" y="158">Apr 30</text>
            <text x="540" y="158">May 7</text>
          </g>
        </svg>
      </div>

      {/* Top keywords */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 10px' }}>
          Top performing keywords
        </h3>
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
          {BASE_KEYWORDS.map((kw, i) => {
            const effectiveStatus =
              kw.name === 'wellness supplements' && anomaly.resolved
                ? anomaly.action === 'pause'
                  ? 'paused'
                  : 'watching'
                : kw.status;
            return (
              <div
                key={kw.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 100px 120px',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < BASE_KEYWORDS.length - 1 ? '1px solid var(--dark-8)' : 'none',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>{kw.name}</span>
                <span style={{ fontSize: 12, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
                  {kw.clicks} clicks
                </span>
                <span style={{ fontSize: 12, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
                  {kw.conv} conv.
                </span>
                <KeywordStatusPill status={effectiveStatus} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KeywordStatusPill({ status }: { status: Keyword['status'] }) {
  const label =
    status === 'ok' ? 'Healthy' : status === 'alert' ? 'CPC spike' : status === 'paused' ? 'Paused' : 'Watching';
  const color =
    status === 'ok'
      ? { dot: 'var(--status-approved)', text: '#0E6B33' }
      : status === 'alert'
        ? { dot: 'var(--status-failed)', text: '#991B1B' }
        : { dot: 'var(--status-review)', text: '#713F12' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 500,
        color: color.text,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color.dot }} />
      {label}
    </span>
  );
}

// ─── ANOMALY CARD + RESOLVED ──────────────────────────────────────────

function AnomalyCard({ onResolve }: { onResolve: (a: AnomalyAction) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFF3D6 100%)',
        border: '1px solid rgba(245,158,11,0.32)',
        borderRadius: 14,
        padding: '18px 22px',
        marginBottom: 22,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(245,158,11,0.18)',
          color: 'var(--status-review)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AlertTriangle size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 5px' }}>
          CPC spike on "wellness supplements"
        </h4>
        <p style={{ fontSize: 12.5, color: 'var(--dark-80)', lineHeight: 1.55, margin: '0 0 14px' }}>
          Cost-per-click jumped <strong>+47%</strong> in the last hour ($0.92 → $1.35). Likely a competitor's
          auction-time bid bump. Three options:
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <AnomalyActionButton onClick={() => onResolve('pause')}>Pause keyword</AnomalyActionButton>
          <AnomalyActionButton onClick={() => onResolve('lower')}>Lower max bid to $1.40</AnomalyActionButton>
          <AnomalyActionButton primary onClick={() => onResolve('monitor')}>
            Continue monitoring
          </AnomalyActionButton>
        </div>
      </div>
    </div>
  );
}

function AnomalyActionButton({
  primary,
  onClick,
  children,
}: {
  primary?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: primary ? 'var(--dark-90)' : 'var(--light-100)',
        color: primary ? 'var(--light-100)' : 'var(--dark-90)',
        border: `1px solid ${primary ? 'var(--dark-90)' : 'var(--dark-15)'}`,
        borderRadius: 7,
        padding: '7px 13px',
        fontFamily: 'inherit',
        fontSize: 12.5,
        fontWeight: 450,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function AnomalyResolved({ action }: { action: AnomalyAction | null }) {
  const msg =
    action === 'pause'
      ? 'Paused "wellness supplements" — agent will alert if recovery looks viable.'
      : action === 'lower'
        ? 'Lowered max bid to $1.40 — saving ~$8/day at current pace.'
        : 'Continuing to monitor — agent will re-alert if CPC stays elevated for 4+ hours.';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#DCFCE7',
        color: '#14532D',
        border: '1px solid rgba(4,175,0,0.32)',
        borderRadius: 12,
        padding: '13px 18px',
        marginBottom: 22,
        fontSize: 13,
        fontWeight: 450,
      }}
    >
      <Check2 size={18} />
      <span>
        Resolved · {action === 'pause' ? 'Paused keyword' : action === 'lower' ? 'Lowered max bid' : 'Continuing to monitor'}
        {' — '}
        {msg}
      </span>
    </div>
  );
}

// ─── WIZARD MODAL ──────────────────────────────────────────────────────
// Two stages: loading (animated agent tasks) → summary (review + budget +
// launch). Summary's back arrow returns to a fresh loading run.

type WizardStage = 'loading' | 'summary';

interface WizardModalExtraProps {
  onComplete: () => void;
}

function WizardModal({ close, onComplete }: StackModalProps & WizardModalExtraProps) {
  const [stage, setStage] = useState<WizardStage>('loading');
  const [budget, setBudget] = useState(40);

  return (
    <Modal.Root size="md" aria-labelledby="paid-search-wizard-title" data-testid="paid-search-wizard">
      <Modal.Header
        title={stage === 'loading' ? 'Setting up your campaign' : 'Your campaign is ready to launch'}
        id="paid-search-wizard-title"
        onClose={close}
        onBack={stage === 'summary' ? () => setStage('loading') : undefined}
        compact={false}
      />
      <Modal.Content compact={false}>
        {stage === 'loading' ? (
          <WizardLoading onDone={() => setStage('summary')} onSkip={() => setStage('summary')} />
        ) : (
          <WizardSummary budget={budget} onBudgetChange={setBudget} />
        )}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            {stage === 'loading' ? 'Cancel' : 'Save as draft'}
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          {stage === 'loading' ? (
            <Modal.FooterButton variant="tertiary" onPress={() => setStage('summary')}>
              Skip ahead →
            </Modal.FooterButton>
          ) : (
            <Modal.FooterButton
              variant="primary"
              onPress={() => {
                onComplete();
                close();
              }}
            >
              Launch — ${budget}/day
            </Modal.FooterButton>
          )}
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

const STEP_MS = 1500;
const FINAL_PAUSE_MS = 600;

function WizardLoading({ onDone, onSkip: _onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [progress, setProgress] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    const TOTAL = LOADING_TASKS.length;
    const TOTAL_MS = TOTAL * STEP_MS + FINAL_PAUSE_MS;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const target = Math.min(TOTAL, Math.floor(elapsed / STEP_MS));
      setProgress(target);
      const activeIdx = Math.min(TOTAL - 1, target);
      const subs = LOADING_TASKS[activeIdx].subActions;
      const inTask = Math.max(0, elapsed - activeIdx * STEP_MS);
      setSubIdx(Math.min(subs.length - 1, Math.floor(inTask / (STEP_MS / subs.length))));
      if (elapsed >= TOTAL_MS) {
        clearInterval(id);
        onDone();
      }
    };
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FCB728, #B06000)',
          color: 'var(--light-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <Stars size={22} />
      </div>
      <p
        style={{
          fontSize: 13,
          color: 'var(--dark-60)',
          lineHeight: 1.55,
          margin: '0 0 18px',
          maxWidth: 480,
        }}
      >
        Watch as I work — pulling your brand context, researching keywords, drafting ads, and tuning bids.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
        {LOADING_TASKS.map((task, i) => {
          const isDone = i < progress;
          const isActive = i === progress && progress < LOADING_TASKS.length;
          const dim = !isDone && !isActive;
          return (
            <div
              key={task.name}
              style={{
                border: `1px solid ${isActive ? 'var(--dark-15)' : 'var(--dark-8)'}`,
                borderRadius: 10,
                padding: '12px 14px',
                background: isActive ? 'var(--light-100)' : 'var(--surface-2, #FAFAFA)',
                opacity: dim ? 0.45 : 1,
                transition: 'opacity 200ms ease, background 200ms ease, border-color 200ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: isDone
                      ? '1.5px solid var(--status-approved)'
                      : isActive
                        ? '1.5px solid var(--brand-yellow-50, #FCB728)'
                        : '1.5px solid var(--dark-15)',
                    background: isDone ? 'var(--status-approved)' : 'transparent',
                    borderTopColor: isActive ? 'transparent' : undefined,
                    animation: isActive ? 'spin 0.8s linear infinite' : undefined,
                    color: 'var(--light-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isDone && (
                    <svg viewBox="0 0 12 12" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 6.5l2 2 5-6" />
                    </svg>
                  )}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 450, color: 'var(--dark-90)' }}>{task.name}</div>
                  {isDone && (
                    <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 2 }}>{task.summary}</div>
                  )}
                </div>
              </div>
              {isActive && (
                <div
                  style={{
                    marginTop: 7,
                    fontSize: 11.5,
                    color: 'var(--dark-60)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    paddingLeft: 29,
                  }}
                >
                  <span style={{ color: 'var(--dark-25)' }}>↳</span>
                  <span>{task.subActions[subIdx]}</span>
                  <span
                    style={{
                      width: 2,
                      height: 11,
                      background: 'var(--brand-yellow-50, #FCB728)',
                      animation: 'blink 1s infinite',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          height: 4,
          background: 'var(--dark-4)',
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 6,
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'var(--dark-90)',
            borderRadius: 2,
            width: `${(progress / LOADING_TASKS.length) * 100}%`,
            transition: 'width 400ms cubic-bezier(0.2,0,0,1)',
          }}
        />
      </div>
    </div>
  );
}

function WizardSummary({ budget, onBudgetChange }: { budget: number; onBudgetChange: (n: number) => void }) {
  const { openModal } = useModals();
  const conv = useMemo(() => Math.round(budget * 0.075 * 10) / 10, [budget]);
  const cpa = useMemo(() => (budget / Math.max(budget * 0.075, 0.5)).toFixed(2), [budget]);
  const imp = useMemo(() => (budget / 1.4).toFixed(1), [budget]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <span
          style={{
            display: 'inline-block',
            background: 'var(--yellow-bg, #FEF3C7)',
            color: '#713F12',
            fontSize: 10.5,
            fontWeight: 500,
            padding: '3px 8px',
            borderRadius: 5,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Approval needed
        </span>
        <p style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5, margin: 0 }}>
          Driving sales for <strong style={{ color: 'var(--dark-90)', fontWeight: 450 }}>Daily Wellness Bundle</strong> ·
          Wellness-curious adults 25–45, US
        </p>
      </div>

      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '18px 20px',
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 14 }}>
          Ads being tested · 3 variants
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {COPY_DATA.map((c, i) => (
            <div
              key={c.head}
              style={{
                border: '1px solid var(--dark-8)',
                borderRadius: 10,
                padding: '12px 14px',
                background: 'var(--surface-2, #FAFAFA)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: 'var(--light-100)',
                  border: '1px solid var(--dark-15)',
                  color: 'var(--dark-80)',
                  fontSize: 10.5,
                  fontWeight: 500,
                  padding: '1px 7px',
                  borderRadius: 4,
                  marginBottom: 8,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Variant {String.fromCharCode(65 + i)}
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: 'var(--dark-60)',
                  marginBottom: 5,
                }}
              >
                <span style={{ color: 'var(--dark-90)', fontWeight: 500 }}>Sponsored</span>
                <span>·</span>
                <span>radianthealth.co/wellness-bundle</span>
              </div>
              <div style={{ fontSize: 14, color: '#2563EB', marginBottom: 3, lineHeight: 1.35 }}>{c.head}</div>
              <div style={{ fontSize: 11.5, color: 'var(--dark-60)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '18px 20px',
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 14 }}>
          Expected results
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexShrink: 0 }}>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 500,
                  letterSpacing: '-0.6px',
                  color: 'var(--dark-90)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {conv}
              </span>
              <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>
                conversions <span style={{ color: 'var(--dark-40)' }}>/ day</span>
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={budget}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.5 }}>
            Backed by <strong style={{ color: 'var(--dark-90)', fontWeight: 450 }}>${budget}/day</strong> · ~
            <strong style={{ color: 'var(--dark-90)', fontWeight: 450 }}>${cpa}</strong> per conversion ·{' '}
            <strong style={{ color: 'var(--dark-90)', fontWeight: 450 }}>{imp}k</strong> impressions
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.6 }}>
        Agent also prepared:{' '}
        <PrepLink onClick={() => openModal(KeywordsPrepModal, {})}>{KW_TOTAL} keywords</PrepLink> ·{' '}
        <PrepLink onClick={() => openModal(BidPrepModal, {})}>Maximize Conversions bid</PrepLink> ·{' '}
        <PrepLink onClick={() => openModal(NegativesPrepModal, {})}>{NEG_TOTAL} negative keywords</PrepLink>
      </div>
    </div>
  );
}

function PrepLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12.5,
        color: 'var(--dark-90)',
        textDecoration: 'underline',
        textDecorationColor: 'var(--dark-15)',
        textUnderlineOffset: 2,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

// ─── PREP DETAIL MODALS ────────────────────────────────────────────────

function KeywordsPrepModal({ close }: StackModalProps) {
  const { showToast } = useToast();
  return (
    <Modal.Root size="md" aria-labelledby="kw-prep-title" data-testid="paid-search-keywords-modal">
      <Modal.Header
        title="Search keywords"
        id="kw-prep-title"
        onClose={close}
        onBack={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <p style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5, margin: '0 0 16px' }}>
          {KW_GROUPS.length} themes — drawn from your top product, brand voice, and 12 competitor scans. Edit anything
          before launch.
        </p>
        {KW_GROUPS.map((g) => (
          <div key={g.theme} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>{g.theme}</span>
              <MatchTag match={g.match} />
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 11.5,
                  color: 'var(--dark-40)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {g.terms.length} terms
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {g.terms.map((t) => (
                <Chip key={t} term={t} onRemove={() => showToast({ message: `Removed "${t}" from this group` })} />
              ))}
              <button
                type="button"
                onClick={() => showToast({ message: 'Add keyword input would appear' })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'none',
                  border: '1px dashed var(--dark-15)',
                  color: 'var(--dark-60)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Plus size={11} /> Add
              </button>
            </div>
          </div>
        ))}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="primary"
            onPress={() => {
              showToast({ message: 'Keyword changes saved' });
              close();
            }}
          >
            Save changes
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function MatchTag({ match }: { match: KwGroup['match'] }) {
  const styles =
    match === 'exact'
      ? { bg: 'rgba(34,197,94,0.12)', color: '#15803d' }
      : match === 'phrase'
        ? { bg: 'rgba(59,130,246,0.10)', color: '#1E40AF' }
        : { bg: 'rgba(167,139,250,0.14)', color: '#5B21B6' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 10.5,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 5,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: styles.bg,
        color: styles.color,
      }}
    >
      {match}
    </span>
  );
}

function Chip({ term, onRemove }: { term: string; onRemove: () => void }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--surface-2, #FAFAFA)',
        border: '1px solid var(--dark-8)',
        borderRadius: 6,
        padding: '5px 9px',
        fontSize: 12.5,
        color: 'var(--dark-90)',
      }}
    >
      {term}
      <button
        type="button"
        aria-label={`Remove ${term}`}
        onClick={onRemove}
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--dark-40)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 2,
        }}
      >
        <svg viewBox="0 0 24 24" width={9} height={9} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </span>
  );
}

function BidPrepModal({ close }: StackModalProps) {
  const { showToast } = useToast();
  const [selected, setSelected] = useState('max_conv');
  return (
    <Modal.Root size="md" aria-labelledby="bid-prep-title" data-testid="paid-search-bid-modal">
      <Modal.Header
        title="Bid strategy"
        id="bid-prep-title"
        onClose={close}
        onBack={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <p style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5, margin: '0 0 16px' }}>
          How Google places your bids. The agent picked the strategy with the strongest first-week ROI for your budget.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BID_STRATEGIES.map((s) => {
            const isSelected = selected === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '14px 16px',
                  background: isSelected ? 'var(--light-100)' : 'var(--light-100)',
                  border: `1px solid ${isSelected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--dark-90)' : 'var(--dark-15)'}`,
                    flexShrink: 0,
                    marginTop: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--dark-90)' }} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{s.label}</span>
                    {s.tag === 'recommended' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10.5,
                          fontWeight: 500,
                          padding: '2px 7px',
                          borderRadius: 5,
                          background: 'rgba(34,197,94,0.14)',
                          color: '#15803d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {s.tagText}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </button>
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
          <Modal.FooterButton
            variant="primary"
            onPress={() => {
              const label = BID_STRATEGIES.find((s) => s.id === selected)?.label ?? '';
              showToast({ message: `Bid strategy: ${label}` });
              close();
            }}
          >
            Save bid strategy
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function NegativesPrepModal({ close }: StackModalProps) {
  const { showToast } = useToast();
  return (
    <Modal.Root size="md" aria-labelledby="neg-prep-title" data-testid="paid-search-negatives-modal">
      <Modal.Header
        title="Negative keywords"
        id="neg-prep-title"
        onClose={close}
        onBack={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <p style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5, margin: '0 0 16px' }}>
          Searches we'll exclude from the campaign — to protect spend on low-intent or off-brand traffic. Add, remove,
          or edit anything.
        </p>
        {NEG_GROUPS.map((g) => (
          <div
            key={g.category}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>{g.category}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 11.5,
                  color: 'var(--dark-40)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {g.terms.length} terms
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {g.terms.map((t) => (
                <Chip key={t} term={t} onRemove={() => showToast({ message: `Removed "${t}" from negatives` })} />
              ))}
            </div>
          </div>
        ))}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="primary"
            onPress={() => {
              showToast({ message: 'Negative keyword changes saved' });
              close();
            }}
          >
            Save changes
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── ROUTE ─────────────────────────────────────────────────────────────

export function PaidSearchRoute() {
  return (
    <ModalStack>
      <PaidSearchRouteInner />
    </ModalStack>
  );
}

function PaidSearchRouteInner() {
  const { showToast } = useToast();
  const { openModal } = useModals();
  const { getState } = useDevState();
  const devState = getState('/h2/paid-search');
  const [view, setView] = useState<View>('campaigns');
  const [anomaly, setAnomaly] = useState<AnomalyState>({ resolved: false, action: null });

  // Sync dev-state toggle → view. Cold = empty; steady = campaigns list.
  useEffect(() => {
    setView((prev) => {
      if (devState === 'cold') return 'empty';
      if (prev === 'empty') return 'campaigns';
      return prev;
    });
  }, [devState]);

  const handleOpenWizard = () => {
    openModal(WizardModal, {
      onComplete: () => {
        showToast({ message: 'Campaign launched · Daily Wellness Bundle is now live' });
        setView('campaigns');
      },
    });
  };

  const handleResolveAnomaly = (action: AnomalyAction) => {
    setAnomaly({ resolved: true, action });
    showToast({
      message:
        action === 'pause'
          ? 'Keyword paused — Blaze will keep watching'
          : action === 'lower'
            ? 'Max bid lowered to $1.40'
            : 'Continuing to monitor',
    });
  };

  const topbarRight = (
    <Button variant="secondary" size="md" frontIcon={Plus} onPress={handleOpenWizard}>
      New campaign
    </Button>
  );

  return (
    <H2Layout topbarRight={topbarRight}>
      {view === 'empty' && <EmptyState onStart={handleOpenWizard} />}
      {view === 'campaigns' && (
        <CampaignsList anomaly={anomaly} onOpenLive={() => setView('live')} />
      )}
      {view === 'live' && (
        <LiveCampaign
          anomaly={anomaly}
          onBack={() => setView('campaigns')}
          onResolveAnomaly={handleResolveAnomaly}
        />
      )}

      {/* Keyframes used by the loading spinner + pulse + caret blink. */}
      <style>{`
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(4,175,0,0.45); }
          70%  { box-shadow: 0 0 0 6px rgba(4,175,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(4,175,0,0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </H2Layout>
  );
}
