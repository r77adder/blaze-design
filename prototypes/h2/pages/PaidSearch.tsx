import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Heading, IconButton, Modal, ModalStack, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { StatusPill, TabChip, useToast } from '@/staging';
import Plus from '@/icons/20/Plus';
import AlertTriangle from '@/icons/20/AlertTriangle';
import Check2 from '@/icons/20/Check2';
import Stars from '@/icons/20/Stars';
import Globe from '@/icons/20/Globe';
import ChevronRightSmall from '@/icons/20/ChevronRightSmall';
import ArrowLeft from '@/icons/20/ArrowLeft';
import LinkExternal from '@/icons/20/LinkExternal';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';
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
  { label: 'Impressions', value: '6,210', delta: '↑ 11%', tone: 'up' as const },
  { label: 'Clicks', value: '142', delta: '↑ 9%', tone: 'up' as const },
  { label: 'CTR', value: '2.29%', delta: '↑ 0.3 pt', tone: 'up' as const },
  { label: 'Estimate requests', value: '8', delta: '↑ 3', tone: 'up' as const },
  { label: 'Spend', value: '$58.20', delta: '78% of daily', tone: 'flat' as const },
  { label: 'Cost per lead', value: '$7.28', delta: 'on target', tone: 'up' as const },
];

interface FatigueFlag {
  ageDays: number;
  signal: string;
  reason: string;
  competitors: string;
  proposals: string[];
}

// Inline fatigue flags surface on the Campaigns list row + one keyword in
// the Live view. Clicking opens FatigueRefreshModal — same proposed-refresh
// experience the home-feed item triggers via FeedItemModal.
const CAMPAIGN_FATIGUE: FatigueFlag = {
  ageDays: 21,
  signal: 'CTR -28% past 7d',
  reason:
    "Asset combo 'RSA Variant A' has dropped 28% CTR over the past 7 days while impressions held steady. Headline 1 has run unchanged for 21 days.",
  competitors:
    'Five Star Painting of South Austin rotated to question-led headlines this week ("Tired of peeling paint?" pattern) and lifted CTR ~24%. Paper Moon Painting added a free color consultation callout extension.',
  proposals: [
    'Rotate Headline 1 to a question-led variant',
    'Add a new "free color consultation" callout extension',
    'Pin a freshness signal — "Booking May exteriors now" — in description 2',
  ],
};

const LOCAL_AUSTIN_FATIGUE: FatigueFlag = {
  ageDays: 18,
  signal: 'CTR -22% past 7d',
  reason:
    "Asset combo 'Local — Cedar Park & Round Rock' has dropped 22% CTR over the past 7 days. The Austin-skyline hero image has been live for 18 days and is losing freshness.",
  competitors:
    'Two local competitors rotated to before/after exterior photos this week and lifted CTR ~16% on local geo terms.',
  proposals: [
    'Swap hero image to a Cedar Park exterior before/after',
    'Add a "Serving Cedar Park & Round Rock" callout extension',
    'Rotate Headline 2 to lead with a neighborhood landmark',
  ],
};

const REPURCHASE_FATIGUE: FatigueFlag = {
  ageDays: 24,
  signal: 'CTR -26% past 7d',
  reason:
    "Asset combo 'Past-customer repaint' has dropped 26% CTR over the past 7 days. The 'Welcome back' headline has been unchanged for 24 days.",
  competitors:
    'Two competitors launched loyalty-framed repaint campaigns this month, leading with a "10% off for return customers" hook instead of a generic re-engagement.',
  proposals: [
    'Rotate to a loyalty-framed headline — "Time for a touch-up?"',
    'Test a "10% off return customers" CTA over the generic CTA',
    'Add a "Free in-home estimate" callout',
  ],
};

const KEYWORD_FATIGUE: FatigueFlag = {
  ageDays: 28,
  signal: 'CPC +38% past 7d',
  reason:
    'CPC climbed 38% as 3 new competitors entered the auction. Quality Score holding at 8, but bid pressure is winning.',
  competitors:
    'Five Star Painting of South Austin and WOW 1 DAY PAINTING Austin both launched campaigns targeting this exact match in the past 10 days.',
  proposals: [
    'Switch from broad to phrase match to reduce auction overlap',
    'Add 4 negative keywords competitors are bidding on',
    'Test a lower max-CPC of $3.80 with Maximize Conversions',
  ],
};

// ─── CAMPAIGN LIST DATA ────────────────────────────────────────────────

type CampaignStatus =
  | 'live'
  | 'on-track'
  | 'testing'
  | 'winner'
  | 'spending-fast'
  | 'paused'
  | 'over-budget';

/** Google Ads campaign types we surface in the table. Mirrors the canonical
 *  Google Ads categories so the table reads natively to anyone used to it. */
type CampaignType = 'Search' | 'Display' | 'Shopping' | 'Video' | 'Performance Max' | 'App';

/** Google Ads bid strategies (subset). The strings are the labels Google
 *  itself uses, rendered verbatim in the table. */
type BidStrategyType =
  | 'Maximize conversions'
  | 'Target CPA'
  | 'Target ROAS'
  | 'Manual CPC'
  | 'Maximize clicks';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number; // daily budget
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
  status: CampaignStatus;
  campaignType: CampaignType;
  bidStrategy: BidStrategyType;
  startedLabel: string;
  // Optional flags shown alongside the status pill
  anomaly?: boolean; // CPC spike — only the primary live campaign
  fatigue?: FatigueFlag;
  // The 'live' campaign drills into the LiveCampaign detail view; others
  // route to the same view as a stub (no detail screen for them in this
  // prototype).
  primary?: boolean;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: 'exterior-painting-austin',
    name: 'Exterior painting — Austin metro',
    channel: 'Search · $80/day · Started 2h 14m ago',
    budget: 80,
    spend: 58.2,
    impressions: 6210,
    clicks: 142,
    conversions: 8,
    cpa: 7.28,
    status: 'live',
    campaignType: 'Search',
    bidStrategy: 'Maximize conversions',
    startedLabel: 'Started 2h 14m ago',
    anomaly: true,
    fatigue: CAMPAIGN_FATIGUE,
    primary: true,
  },
  {
    id: 'branded-certapro',
    name: 'Branded — CertaPro Austin',
    channel: 'Search · $40/day · Running 6 weeks',
    budget: 40,
    spend: 32.8,
    impressions: 3120,
    clicks: 246,
    conversions: 32,
    cpa: 1.03,
    status: 'on-track',
    campaignType: 'Search',
    bidStrategy: 'Target CPA',
    startedLabel: 'Running 6 weeks',
  },
  {
    id: 'interior-painters',
    name: 'Interior painters near me',
    channel: 'Search · $60/day · Testing 4 days',
    budget: 60,
    spend: 48.6,
    impressions: 4820,
    clicks: 118,
    conversions: 5,
    cpa: 9.72,
    status: 'testing',
    campaignType: 'Search',
    bidStrategy: 'Maximize clicks',
    startedLabel: 'Testing 4 days',
  },
  {
    id: 'cabinet-refinishing',
    name: 'Cabinet refinishing Austin',
    channel: 'Search · $50/day · Running 3 weeks',
    budget: 50,
    spend: 46.4,
    impressions: 5680,
    clicks: 184,
    conversions: 24,
    cpa: 1.93,
    status: 'winner',
    campaignType: 'Performance Max',
    bidStrategy: 'Target ROAS',
    startedLabel: 'Running 3 weeks',
  },
  {
    id: 'local-cedar-park',
    name: 'Local — Cedar Park & Round Rock',
    channel: 'Search · $30/day · Running 18 days',
    budget: 30,
    spend: 28.9,
    impressions: 2410,
    clicks: 78,
    conversions: 6,
    cpa: 4.82,
    status: 'spending-fast',
    campaignType: 'Search',
    bidStrategy: 'Maximize conversions',
    startedLabel: 'Running 18 days',
    fatigue: LOCAL_AUSTIN_FATIGUE,
  },
  {
    id: 'repaint-past-customers',
    name: 'Repaint — past customers',
    channel: 'Search · $20/day · Paused 2 days ago',
    budget: 20,
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    cpa: 0,
    status: 'paused',
    campaignType: 'Search',
    bidStrategy: 'Manual CPC',
    startedLabel: 'Paused 2 days ago',
    fatigue: REPURCHASE_FATIGUE,
  },
  {
    id: 'commercial-hoa',
    name: 'Commercial & HOA painters',
    channel: 'Search · $90/day · Running 9 days',
    budget: 90,
    spend: 104.8,
    impressions: 9420,
    clicks: 312,
    conversions: 11,
    cpa: 9.53,
    status: 'over-budget',
    campaignType: 'Search',
    bidStrategy: 'Maximize conversions',
    startedLabel: 'Running 9 days',
  },
];

interface Keyword {
  name: string;
  clicks: number;
  conv: number;
  status: 'ok' | 'alert' | 'paused' | 'watching';
  fatigue?: FatigueFlag;
}

const BASE_KEYWORDS: Keyword[] = [
  { name: 'painters austin', clicks: 62, conv: 4, status: 'ok' },
  { name: 'exterior painting austin', clicks: 48, conv: 3, status: 'ok', fatigue: KEYWORD_FATIGUE },
  { name: 'house painters austin', clicks: 31, conv: 2, status: 'ok' },
  { name: 'interior painters near me', clicks: 23, conv: 0, status: 'alert' },
  { name: 'cabinet painting austin', clicks: 14, conv: 1, status: 'ok' },
];

const LOADING_TASKS = [
  {
    name: 'Pull context',
    subActions: ['Reading Brand Kit', 'Reviewing service mix', 'Scanning recent campaigns'],
    summary: 'Brand Kit · Exterior painting · 4 campaigns reviewed',
  },
  {
    name: 'Research keywords',
    subActions: ['Searching 12 local competitors', 'Analyzing search trends', 'Clustering 47 keywords'],
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
    subActions: ['Identifying low-intent terms', 'Filtering DIY searches', 'Building exclusion list'],
    summary: '47 negatives across 5 categories',
  },
];

const COPY_DATA = [
  {
    head: 'CertaPro Painters of Austin — Your Local Painters',
    desc: 'Interior, exterior, and cabinet painting across Austin metro. Free in-home estimate. 2-year warranty. 187 5-star Google reviews.',
  },
  {
    head: 'Done in 4 Days. Painted to Last. — CertaPro Austin',
    desc: 'Locally owned, professionally certified. Serving Austin, Cedar Park, Round Rock, and Lakeway. $0/month financing on projects $2,500+.',
  },
  {
    head: 'Trusted Austin Painters — 187 5-Star Reviews',
    desc: 'Residential and commercial painting from the team Austin homeowners trust. Free color consultation with every estimate.',
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
      'painters austin',
      'austin painters',
      'house painters austin',
      'painting contractor austin',
      'local painters austin',
      'austin painting company',
      'professional painters austin',
      'austin tx painters',
      'certified painters austin',
      'best painters austin',
      'painting services austin',
      'austin home painters',
    ],
  },
  {
    theme: 'High-intent buyers',
    match: 'exact',
    terms: [
      'exterior painting austin',
      'interior painters near me',
      'cabinet painting austin',
      'cabinet refinishing austin',
      'house painting cost austin',
      'painting estimate austin',
      'free painting estimate austin',
      'color consultation austin',
      'deck staining austin',
      'fence staining austin',
      'stucco repair austin',
      'drywall repair austin',
      'power washing austin',
      'cedar park painters',
      'round rock painters',
      'lakeway painters',
      'westlake painters',
      'best painters austin tx',
    ],
  },
  {
    theme: 'Discovery',
    match: 'broad',
    terms: [
      'how much does it cost to paint a house',
      'paint colors for texas heat',
      'cabinet refinishing cost',
      'when to repaint exterior',
      'best exterior paint austin',
      'interior painting timeline',
      'whole house painting',
      'commercial painters austin',
      'hoa painters',
      'office painting austin',
      'restaurant painting austin',
      'painting near me',
      'house painters near me',
      'austin painting reviews',
      'austin painter recommendations',
      'how long does exterior paint last',
      'painting contractor near me',
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
    category: 'DIY / how-to',
    terms: [
      'diy painting',
      'how to paint a wall',
      'paint your own',
      'paint tutorial',
      'youtube painting',
      'free paint',
      'painting tips reddit',
      'painting for beginners',
      'cheap paint',
    ],
  },
  {
    category: 'Competitors',
    terms: [
      'five star painting',
      'paper moon painting',
      'wow 1 day painting',
      'college pro painters',
      'austin custom painting',
      'sherwin williams contractors',
      'home depot painters',
      'lowes painting service',
      'angi painters',
      'thumbtack painters',
      'handy painters',
      'taskrabbit painter',
    ],
  },
  {
    category: 'Off-topic',
    terms: [
      'art classes',
      'face painting',
      'auto body paint',
      'car painting',
      'nail painting',
      'paint store',
      'paint by numbers',
      'oil painting class',
      'watercolor',
      'paintball',
    ],
  },
  {
    category: 'Job seekers',
    terms: [
      'painter jobs',
      'painter hiring',
      'painter salary',
      'painter apprenticeship',
      'painting career',
      'become a painter',
      'painter resume',
      'painter union',
    ],
  },
  {
    category: 'Out-of-region',
    terms: [
      'painters dallas',
      'painters houston',
      'painters san antonio',
      'painters fort worth',
      'painters el paso',
      'painters california',
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

type SubTab = 'campaigns' | 'market-intelligence';

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
          fontSize: 14,
          color: 'var(--dark-60)',
          lineHeight: 1.55,
          margin: '0 auto 24px',
          maxWidth: 520,
        }}
      >
        The agent pulls your brand context, researches local painting keywords, drafts ad copy, picks a bid
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
  const { openModal } = useModals();
  const { showToast } = useToast();
  const showAnomaly = !anomaly.resolved;
  // One consolidated banner — inline list of every fatigued campaign.
  const fatigued = CAMPAIGNS.filter((c) => c.fatigue);
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 28px 60px' }}>
      {fatigued.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <FatigueSummaryBanner
            items={fatigued.map((c) => ({
              key: c.id,
              name: c.name,
              signal: c.fatigue!.signal,
              onSelect: () => {
                if (c.primary) {
                  onOpenLive();
                } else {
                  openModal(FatigueRefreshModal, {
                    fatigue: c.fatigue!,
                    adName: `${c.name} — Asset combo`,
                  });
                }
              },
            }))}
          />
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
            gridTemplateColumns: 'minmax(240px, 2fr) 110px 110px 140px 80px 70px 60px 70px',
            gap: 14,
            alignItems: 'center',
            padding: '6px 16px',
            borderBottom: '1px solid var(--dark-8)',
            fontSize: 12,
            color: 'var(--dark-60)',
            fontWeight: 400,
          }}
        >
          <div>Campaign</div>
          <div>Campaign type</div>
          <div>Status</div>
          <div>Bid strategy</div>
          <div style={{ textAlign: 'right' }}>Spend</div>
          <div style={{ textAlign: 'right' }}>Clicks</div>
          <div style={{ textAlign: 'right' }}>Conv.</div>
          <div style={{ textAlign: 'right' }}>CPA</div>
        </div>
        {CAMPAIGNS.map((c, i) => (
          <CampaignRow
            key={c.id}
            campaign={c}
            isFirst={i === 0}
            isLast={i === CAMPAIGNS.length - 1}
            showAnomaly={showAnomaly && !!c.anomaly}
            onOpen={() => {
              if (c.primary) onOpenLive();
              else showToast({ message: `${c.name} — detail view not built for this prototype yet` });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignRow({
  campaign,
  isFirst,
  isLast: _isLast,
  showAnomaly,
  onOpen,
}: {
  campaign: Campaign;
  isFirst: boolean;
  isLast: boolean;
  showAnomaly: boolean;
  onOpen: () => void;
}) {
  const isPaused = campaign.status === 'paused';
  const fmtMoney = (n: number) => `$${n.toFixed(2)}`;
  const fmtInt = (n: number) => n.toLocaleString('en-US');
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 2fr) 110px 110px 140px 80px 70px 60px 70px',
        gap: 14,
        alignItems: 'center',
        padding: '14px 16px',
        background: 'transparent',
        border: 'none',
        borderTop: isFirst ? 'none' : '1px solid var(--dark-8)',
        width: '100%',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{campaign.name}</div>
        <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>{campaign.channel}</div>
        {(showAnomaly || campaign.fatigue) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 6 }}>
            {showAnomaly && (
              <StatusPill tone="warning" size="sm">1 anomaly</StatusPill>
            )}
            {campaign.fatigue && (
              <FatigueFlagPill
                fatigue={campaign.fatigue}
                adName={`${campaign.name} — Asset combo`}
                asSpan
              />
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: isPaused ? 'var(--dark-40)' : 'var(--dark-80)' }}>
        {campaign.campaignType}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <CampaignStatusPill status={campaign.status} />
      </div>
      <div style={{ fontSize: 12, color: isPaused ? 'var(--dark-40)' : 'var(--dark-80)' }}>
        {campaign.bidStrategy}
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 500, color: isPaused ? 'var(--dark-40)' : 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtMoney(campaign.spend)}
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, color: isPaused ? 'var(--dark-40)' : 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtInt(campaign.clicks)}
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 500, color: isPaused ? 'var(--dark-40)' : 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtInt(campaign.conversions)}
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, color: isPaused ? 'var(--dark-40)' : 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
        {campaign.conversions > 0 ? fmtMoney(campaign.cpa) : '—'}
      </div>
    </button>
  );
}

function CampaignStatusPill({ status }: { status: CampaignStatus }) {
  const config: Record<CampaignStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
    live: { label: 'Live', tone: 'success' },
    'on-track': { label: 'On track', tone: 'success' },
    testing: { label: 'Testing', tone: 'warning' },
    winner: { label: 'Winner', tone: 'success' },
    'spending-fast': { label: 'Spending too fast', tone: 'warning' },
    paused: { label: 'Paused', tone: 'neutral' },
    'over-budget': { label: 'Over budget', tone: 'danger' },
  };
  const c = config[status];
  return (
    <StatusPill tone={c.tone} size="sm">
      {c.label}
    </StatusPill>
  );
}

// ─── WARNING BANNER (shared) ──────────────────────────────────────────
// Used for both the campaign-detail CPC spike + Creative Fatigue warnings
// AND the campaign-list fatigue banner stack.

function WarningBanner({
  tone,
  title,
  body,
  actionLabel,
  onAction,
}: {
  tone: 'cpc' | 'fatigue';
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  // Softer treatment — less dramatic tint, lighter border, smaller icon.
  // tone === 'cpc' uses --status-connect (orange) family.
  // tone === 'fatigue' uses --status-failed (red) family.
  const palette =
    tone === 'cpc'
      ? {
          bg: 'rgba(237,124,44,0.04)',
          border: 'rgba(237,124,44,0.14)',
          iconColor: 'var(--status-connect)',
          titleColor: 'var(--dark-90)',
        }
      : {
          bg: 'rgba(188,1,11,0.04)',
          border: 'rgba(188,1,11,0.12)',
          iconColor: 'var(--red-90)',
          titleColor: 'var(--dark-90)',
        };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        padding: 12,
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: palette.iconColor,
          flexShrink: 0,
        }}
      >
        <AlertTriangle size={16} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: palette.titleColor, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.5 }}>{body}</div>
      </div>
      <div style={{ flexShrink: 0, alignSelf: 'center' }}>
        <Button variant="secondary" size="sm" onPress={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

// ─── FATIGUE SUMMARY BANNER (consolidated, list view) ──────────────────
// One softer red banner above the campaign table — inline list of fatigued
// campaigns, each row click opens the relevant FatigueRefreshModal (or drills
// into the live view for the primary campaign).

interface FatigueSummaryItem {
  key: string;
  name: string;
  signal: string;
  onSelect: () => void;
}

function FatigueSummaryBanner({ items }: { items: FatigueSummaryItem[] }) {
  return (
    <div
      style={{
        borderRadius: 12,
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
        overflow: 'hidden',
      }}
    >
      {/* header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-4)',
        }}
      >
        <AlertTriangle size={16} color="var(--status-connect)" />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
          Creative fatigue · {items.length} ad set{items.length === 1 ? '' : 's'} need attention
        </span>
      </div>
      {/* inline list of fatigued rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <FatigueSummaryRow
            key={item.key}
            name={item.name}
            signal={item.signal}
            onSelect={item.onSelect}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function FatigueSummaryRow({
  name,
  signal,
  onSelect,
  isLast,
}: {
  name: string;
  signal: string;
  onSelect: () => void;
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        background: hovered ? 'var(--dark-4)' : 'transparent',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        width: '100%',
        transition: 'background-color 120ms ease',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', flexShrink: 0 }}>
        {name}
      </span>
      <span
        style={{
          fontSize: 12,
          color: 'var(--dark-60)',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {signal}
      </span>
      <span style={{ marginLeft: 'auto', color: 'var(--dark-40)', display: 'inline-flex' }} aria-hidden>
        <ChevronRightSmall size={16} />
      </span>
    </button>
  );
}

// ─── LIVE CAMPAIGN VIEW (steady state) ─────────────────────────────────

function LiveCampaign({
  anomaly,
  onResolveAnomaly,
}: {
  anomaly: AnomalyState;
  onResolveAnomaly: (action: AnomalyAction) => void;
}) {
  const { openModal } = useModals();
  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ fontSize: 14, color: 'var(--dark-60)', marginBottom: 18 }}>
        Search campaign · <strong>$80/day budget</strong> · Targeting homeowners 35–65 in Austin metro ·
        Started 2h 14m ago
      </div>

      {/* Warning banner stack — both warnings surface above the metrics. The
          CPC banner falls back to a 'resolved' confirmation once the user has
          chosen a remediation action. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {anomaly.resolved ? (
          <AnomalyResolved action={anomaly.action} />
        ) : (
          <WarningBanner
            tone="cpc"
            title="CPC spike detected"
            body={'CPC up 38% in the last 4 hours on "interior painters near me". The agent suggests pausing the keyword or lowering max bid.'}
            actionLabel="Review bid"
            onAction={() => openModal(BidReviewModal, { onResolve: onResolveAnomaly })}
          />
        )}
        <WarningBanner
          tone="fatigue"
          title="Creative Fatigue detected"
          body={"Asset combo 'RSA Variant A' has dropped 28% CTR over the past 7 days. A refresh proposal is ready."}
          actionLabel="Review refresh"
          onAction={() =>
            openModal(FatigueRefreshModal, {
              fatigue: CAMPAIGN_FATIGUE,
              adName: 'Exterior painting — Austin metro · RSA · Variant A',
            })
          }
        />
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
            <div style={{ fontSize: 12, color: 'var(--dark-60)', marginBottom: 6 }}>{k.label}</div>
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
            <div style={{ fontSize: 12, fontWeight: 500, color: DELTA_COLORS[k.tone] }}>{k.delta}</div>
          </div>
        ))}
      </div>

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
          <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>vs. industry benchmark</span>
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

      {/* Ad groups — the Google Ads campaign → ad group → keywords hierarchy.
          Each row in KW_GROUPS becomes an ad group with its match type, theme,
          and a few sample keywords. Tapping the chevron expands the ad group
          to show its keywords; the first ad group also pulls in the live
          metrics from BASE_KEYWORDS so the prototype shows real numbers. */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>
            Ad groups
          </h3>
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            {KW_GROUPS.length} ad groups · {KW_TOTAL} keywords
          </span>
        </div>
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 110px 90px 90px 90px 120px',
              gap: 12,
              padding: '6px 16px',
              borderBottom: '1px solid var(--dark-8)',
              fontSize: 12,
              color: 'var(--dark-60)',
              fontWeight: 400,
            }}
          >
            <div>Ad group</div>
            <div>Match type</div>
            <div style={{ textAlign: 'right' }}>Keywords</div>
            <div style={{ textAlign: 'right' }}>Clicks</div>
            <div style={{ textAlign: 'right' }}>Conv.</div>
            <div>Status</div>
          </div>
          {KW_GROUPS.map((g, i) => {
            // Synthetic metrics per ad group — group 0 gets the live numbers
            // from BASE_KEYWORDS, the rest get plausible derived stats.
            const isLive = i === 0;
            const clicks = isLive ? BASE_KEYWORDS.reduce((n, k) => n + k.clicks, 0) : 30 + i * 18;
            const conv = isLive ? BASE_KEYWORDS.reduce((n, k) => n + k.conv, 0) : Math.max(0, 2 - i);
            return (
              <div
                key={g.theme}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 110px 90px 90px 90px 120px',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < KW_GROUPS.length - 1 ? '1px solid var(--dark-8)' : 'none',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{g.theme}</span>
                  <span style={{ fontSize: 12, color: 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.terms.slice(0, 3).join(' · ')}{g.terms.length > 3 ? ' · …' : ''}
                  </span>
                </div>
                <div>
                  <MatchTag match={g.match} />
                </div>
                <span style={{ textAlign: 'right', fontSize: 14, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
                  {g.terms.length}
                </span>
                <span style={{ textAlign: 'right', fontSize: 14, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
                  {clicks}
                </span>
                <span style={{ textAlign: 'right', fontSize: 14, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
                  {conv}
                </span>
                <div>
                  <StatusPill tone={isLive ? 'success' : 'neutral'} size="sm">
                    {isLive ? 'Active' : i === 1 ? 'Active' : 'Paused'}
                  </StatusPill>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Negative keywords — second half of the keyword controls. Lists the
          exclusion groups (Free/DIY, Competitors, Off-topic, etc.) with a
          count + a peek at the first few terms. Mirrors how negative
          keywords appear inside Google Ads ad groups + campaigns. */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>
            Negative keywords
          </h3>
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            {NEG_GROUPS.length} lists · {NEG_TOTAL} terms
          </span>
        </div>
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
          {NEG_GROUPS.map((g, i) => (
            <div
              key={g.category}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 90px',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < NEG_GROUPS.length - 1 ? '1px solid var(--dark-8)' : 'none',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{g.category}</span>
                <span style={{ fontSize: 12, color: 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.terms.slice(0, 4).join(' · ')}{g.terms.length > 4 ? ' · …' : ''}
                </span>
              </div>
              <span style={{ textAlign: 'right', fontSize: 14, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
                {g.terms.length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live keyword summary — anomaly state surfaces here. */}
      {anomaly.resolved && (
        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--dark-60)' }}>
          "interior painters near me" → {anomaly.action === 'pause' ? 'paused' : 'watching'} after CPC review.
        </div>
      )}
    </div>
  );
}

// ─── ANOMALY RESOLVED + BID REVIEW MODAL ──────────────────────────────

interface BidReviewModalProps {
  onResolve: (a: AnomalyAction) => void;
}

function BidReviewModal({ close, onResolve }: StackModalProps & BidReviewModalProps) {
  const handle = (a: AnomalyAction) => {
    onResolve(a);
    close();
  };
  return (
    <Modal.Root size="md" aria-labelledby="paid-search-bid-review-title">
      <Modal.Header
        title='CPC spike — "interior painters near me"'
        id="paid-search-bid-review-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(237,124,44,0.18)',
              color: 'var(--status-connect)',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Text variant="largeList" style={{ color: 'var(--dark-90)' }}>
              CPC up 38% in 4h
            </Text>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              $3.10 → $4.28 — likely a competitor's auction-time bid bump
            </Text>
          </div>
        </div>

        <FatigueSection title="Why we flagged this">
          {`Cost-per-click on "interior painters near me" jumped 38% in the last 4 hours while Quality Score held at 8. Three new competitors entered the auction this week.`}
        </FatigueSection>

        <FatigueBulletSection
          title="Proposed actions"
          bullets={[
            'Pause the keyword until competitor bid pressure normalizes',
            'Lower max-CPC to $3.80 — saves ~$22/day at current pace',
            'Continue monitoring — agent re-alerts if CPC stays elevated 4+ hours',
          ]}
        />
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={() => handle('monitor')}>
            Continue monitoring
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="tertiary" onPress={() => handle('pause')}>
            Pause keyword
          </Modal.FooterButton>
          <Modal.FooterButton variant="primary" onPress={() => handle('lower')}>
            Lower max bid to $3.80
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function AnomalyResolved({ action }: { action: AnomalyAction | null }) {
  const msg =
    action === 'pause'
      ? 'Paused "interior painters near me" — agent will alert if recovery looks viable.'
      : action === 'lower'
        ? 'Lowered max bid to $3.80 — saving ~$22/day at current pace.'
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
        fontSize: 14,
        fontWeight: 500,
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
          fontSize: 14,
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
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{task.name}</div>
                  {isDone && (
                    <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>{task.summary}</div>
                  )}
                </div>
              </div>
              {isActive && (
                <div
                  style={{
                    marginTop: 7,
                    fontSize: 12,
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
        <div style={{ marginBottom: 10 }}>
          <StatusPill tone="warning" size="sm">
            Approval needed
          </StatusPill>
        </div>
        <p style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5, margin: 0 }}>
          Driving estimate requests for <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>Exterior painting — Austin metro</strong> ·
          Homeowners 35–65, Austin metro
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
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 14 }}>
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
                  fontSize: 12,
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
                  fontSize: 12,
                  color: 'var(--dark-60)',
                  marginBottom: 5,
                }}
              >
                <span style={{ color: 'var(--dark-90)', fontWeight: 500 }}>Sponsored</span>
                <span>·</span>
                <span>certapro.com/austin</span>
              </div>
              <div style={{ fontSize: 14, color: '#2563EB', marginBottom: 3, lineHeight: 1.35 }}>{c.head}</div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.5 }}>{c.desc}</div>
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
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 14 }}>
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
              <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>
                estimate requests <span style={{ color: 'var(--dark-40)' }}>/ day</span>
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
          <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.5 }}>
            Backed by <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>${budget}/day</strong> · ~
            <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>${cpa}</strong> per estimate request ·{' '}
            <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{imp}k</strong> impressions
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.6 }}>
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
        fontSize: 12,
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
        <p style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5, margin: '0 0 16px' }}>
          {KW_GROUPS.length} themes — drawn from your service mix, brand voice, and 12 Austin painting competitor scans. Edit anything
          before launch.
        </p>
        {KW_GROUPS.map((g) => (
          <div key={g.theme} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{g.theme}</span>
              <MatchTag match={g.match} />
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 12,
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
        fontSize: 12,
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
        fontSize: 12,
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
        <p style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5, margin: '0 0 16px' }}>
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
                          fontSize: 12,
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
                  <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.5 }}>{s.desc}</div>
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
        <p style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5, margin: '0 0 16px' }}>
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
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{g.category}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 12,
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
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('campaigns');

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
        showToast({ message: 'Campaign launched · Exterior painting — Austin metro is now live' });
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

  // The primary live campaign is the one drillable into the detail view.
  // Title in the topbar reflects that campaign's name.
  const liveCampaign = CAMPAIGNS.find((c) => c.primary) ?? CAMPAIGNS[0];
  const isDetail = activeSubTab === 'campaigns' && view === 'live';

  const detailTitle = isDetail ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        aria-label="Back to campaigns"
        onPress={() => setView('campaigns')}
      />
      <span aria-hidden style={{ width: 1, height: 16, background: 'var(--dark-15)' }} />
      <Heading level={1} style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
        {liveCampaign.name}
      </Heading>
      <StatusPill tone="success" size="sm">Live</StatusPill>
    </div>
  ) : undefined;

  const topbarRight = isDetail ? (
    <>
      <Button variant="secondary" size="md" frontIcon={LinkExternal} onPress={() => undefined}>
        Open in Google Ads
      </Button>
      <GenerateReportButton />
    </>
  ) : (
    <>
      {activeSubTab === 'campaigns' && (
        <Button variant="secondary" size="md" frontIcon={Plus} onPress={handleOpenWizard}>
          New campaign
        </Button>
      )}
      <GenerateReportButton />
    </>
  );

  const topbarCenter = isDetail ? undefined : (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {(
        [
          { key: 'campaigns', label: 'Campaigns' },
          { key: 'market-intelligence', label: 'Market Intelligence' },
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
    <H2Layout title={detailTitle} topbarCenter={topbarCenter} topbarRight={topbarRight}>
      {activeSubTab === 'campaigns' && (
        <>
          {view === 'empty' && <EmptyState onStart={handleOpenWizard} />}
          {view === 'campaigns' && (
            <CampaignsList anomaly={anomaly} onOpenLive={() => setView('live')} />
          )}
          {view === 'live' && (
            <LiveCampaign
              anomaly={anomaly}
              onResolveAnomaly={handleResolveAnomaly}
            />
          )}
        </>
      )}
      {activeSubTab === 'market-intelligence' && <PaidSearchMarketIntelligenceView />}

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

// ─── MARKET INTELLIGENCE VIEW (Paid Search) ────────────────────────────

interface SearchMarketIntelCard {
  id: string;
  peer: string;
  peerDomain: string;
  metric: string;
  observedImage: string;
  adaptedImage: string;
  observedHeadline: string;
  observedDesc: string;
  observed: string;
  observedSummary: string;
  adaptedHeadline: string;
  adaptedDesc: string;
  adapted: string;
  adaptedSummary: string;
}

// Unsplash photo IDs picked for residential / exterior painting scenes.
const MARKET_INTEL_SEARCH: SearchMarketIntelCard[] = [
  {
    id: 'mi-q-1',
    peer: 'Five Star Painting of South Austin',
    peerDomain: 'fivestarpainting.com/austin',
    metric: '3.2x ROAS',
    observedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    observedHeadline: 'Austin Exterior Painters | 2-Year Warranty',
    observedDesc:
      'Licensed, insured, locally owned. Free in-home estimate. 2-year written warranty.',
    observed: 'Lead with warranty credibility in headline + free estimate in description.',
    observedSummary: 'Warranty credibility + free estimate hook.',
    adaptedHeadline: 'CertaPro Painters of Austin — 2-Year Warranty',
    adaptedDesc:
      'Locally owned, professionally certified. Free in-home estimate. 187 5-star reviews.',
    adapted: 'Same warranty hook, swapped to your name + your review count.',
    adaptedSummary: 'Warranty hook · your brand + 187 5-star reviews.',
  },
  {
    id: 'mi-q-2',
    peer: 'Paper Moon Painting',
    peerDomain: 'papermoonpainting.com',
    metric: 'CTR 4.8%',
    observedImage: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&q=80',
    observedHeadline: 'Tired of Peeling Paint? We Can Fix That.',
    observedDesc:
      "Austin homes get hammered by Texas sun. We use premium UV-stable paint. 4.9★ from 240+ reviews.",
    observed: 'Question-led headline targeting a specific exterior pain point.',
    observedSummary: 'Question-led pain-point hook.',
    adaptedHeadline: 'Peeling Paint? CertaPro Austin Can Help',
    adaptedDesc:
      "Texas-rated exterior paint, applied by certified crews. 4.7★ from 187 Google reviews.",
    adapted: 'Same question-led hook, our review count, our certification.',
    adaptedSummary: 'Same question hook · our 4.7★ social proof.',
  },
  {
    id: 'mi-q-3',
    peer: 'WOW 1 DAY PAINTING Austin',
    peerDomain: 'wow1day.com/austin',
    metric: '2.4x ROAS',
    observedImage: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    observedHeadline: 'Interior Painted in 1 Day — Furniture Back That Night',
    observedDesc:
      'No 4-day disruption. Our crew sizes up to finish in a single day. Same-week scheduling.',
    observed: 'Speed-led headline calls out the disruption objection directly.',
    observedSummary: 'Speed-led · disruption objection.',
    adaptedHeadline: 'Interior Painting — Done in 4 Days, Painted to Last',
    adaptedDesc:
      "Our crews are sized for your project. Same-week scheduling. 187 5-star reviews.",
    adapted: 'Counter the speed hook with our quality + scheduling promise.',
    adaptedSummary: 'Our quality + scheduling promise.',
  },
  {
    id: 'mi-q-4',
    peer: 'College Pro Painters',
    peerDomain: 'collegepro.com',
    metric: 'CTR 5.6%',
    observedImage: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    observedHeadline: 'Skip the Handyman. Hire a Real Painting Crew.',
    observedDesc:
      'Professional crews, prepped surfaces, premium paint. Serving Austin homeowners since 1971.',
    observed: 'Anti-handyman framing with concrete pro-crew positioning.',
    observedSummary: 'Anti-handyman framing · pro-crew positioning.',
    adaptedHeadline: 'Skip the Handyman — Hire CertaPro Austin',
    adaptedDesc:
      'Certified crews, professional prep, premium paint. Serving Austin metro homeowners.',
    adapted: 'Mirror the anti-handyman hook with our certification language.',
    adaptedSummary: 'Anti-handyman hook · our certification.',
  },
  {
    id: 'mi-q-5',
    peer: 'Austin Custom Painting',
    peerDomain: 'austincustompainting.com',
    metric: '2.9x ROAS',
    observedImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=600&q=80',
    observedHeadline: 'First Time Painting Your Home? Free Color Consult.',
    observedDesc:
      'Built for first-time homeowners. Free color consultation included. 5-star rated.',
    observed: 'First-time-buyer framing — explicit "first time" hook.',
    observedSummary: 'First-time framing · free color consult.',
    adaptedHeadline: 'New to Painting? Free Color Consultation Included',
    adaptedDesc:
      'CertaPro consultants help first-time homeowners pick the right color. 187 5-star reviews.',
    adapted: 'First-time hook applied with our existing free color consult.',
    adaptedSummary: 'First-time hook · our free consult.',
  },
  {
    id: 'mi-q-6',
    peer: 'Sherwin-Williams Pro Painters',
    peerDomain: 'sherwin-williams.com/pro',
    metric: 'CTR 4.1%',
    observedImage: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    observedHeadline: 'The Most Trusted Painting Brand in America',
    observedDesc:
      'Premium paint, certified contractors, lifetime warranty. Sherwin-Williams approved.',
    observed: 'Trust-led headline with specific brand-certification cue.',
    observedSummary: 'Trust hook · brand certification cue.',
    adaptedHeadline: 'Trusted Austin Painters — Sherwin-Williams Approved',
    adaptedDesc:
      'Premium Sherwin-Williams paint, certified CertaPro crews. 2-year written warranty.',
    adapted: 'Trust hook with our existing Sherwin-Williams partnership.',
    adaptedSummary: 'Trust hook · our SW partnership.',
  },
];

function PaidSearchMarketIntelligenceView() {
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 28px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
          Successful ad creative from peer businesses, adapted for your brand. Approve to add to your library.
        </Text>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {MARKET_INTEL_SEARCH.map((card) => (
          <SearchMarketIntelCardView key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function SearchMarketIntelCardView({ card }: { card: SearchMarketIntelCard }) {
  const { openModal } = useModals();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={() => openModal(SearchMarketIntelComparisonModal, { card })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--light-100)',
        border: `1px solid ${hovered ? 'var(--dark-15)' : 'var(--dark-8)'}`,
        boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'border-color 160ms ease, box-shadow 160ms ease',
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <Globe size={16} color="var(--dark-60)" />
        <Text variant="smallList" style={{ color: 'var(--dark-60)' }}>
          Observed at:
        </Text>
        <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
          {card.peer}
        </Text>
        <span
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            borderRadius: 999,
            background: 'rgba(4, 175, 0, 0.10)',
            color: 'var(--status-approved)',
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {card.metric}
        </span>
      </div>

      {/* Stock image teaser */}
      <div
        aria-hidden
        style={{
          height: 180,
          background: `var(--dark-4) center / cover no-repeat url(${card.observedImage})`,
        }}
      />

      {/* body — trimmed summary, no CTAs */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <Text
            variant="metadata"
            style={{
              color: 'var(--dark-60)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: 12,
              display: 'block',
              marginBottom: 4,
            }}
          >
            Observed
          </Text>
          <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>
            {card.observedSummary}
          </Text>
        </div>
        <div>
          <Text
            variant="metadata"
            style={{
              color: 'var(--dark-60)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: 12,
              display: 'block',
              marginBottom: 4,
            }}
          >
            Adapted for CertaPro Austin
          </Text>
          <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>
            {card.adaptedSummary}
          </Text>
        </div>
      </div>
    </button>
  );
}

// ─── MARKET INTELLIGENCE COMPARISON MODAL (Paid Search) ────────────────

interface SearchMarketIntelComparisonModalProps {
  card: SearchMarketIntelCard;
}

function SearchMarketIntelComparisonModal({
  close,
  card,
}: StackModalProps & SearchMarketIntelComparisonModalProps) {
  return (
    <Modal.Root size="lg" aria-labelledby="search-mi-comparison-title">
      <Modal.Header
        title="Compare creative"
        id="search-mi-comparison-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          <SearchComparisonPanel
            heading={`Observed at: ${card.peer}`}
            metricPill={card.metric}
            image={card.observedImage}
            domain={card.peerDomain}
            adHeadline={card.observedHeadline}
            adDesc={card.observedDesc}
            label="Observed"
            body={card.observed}
          />
          <SearchComparisonPanel
            heading="Proposed for CertaPro Austin"
            image={card.adaptedImage}
            domain="certapro.com/austin"
            adHeadline={card.adaptedHeadline}
            adDesc={card.adaptedDesc}
            label="Adapted"
            body={card.adapted}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Skip
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>
            Approve &amp; add to library
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── INLINE FATIGUE FLAG + REFRESH MODAL ───────────────────────────────

function FatigueFlagPill({
  fatigue,
  adName,
  asSpan = false,
}: {
  fatigue: FatigueFlag;
  adName: string;
  // Render as a span role=button when nested inside another <button> to keep
  // HTML valid (e.g. the Campaigns list row is a clickable <button>).
  asSpan?: boolean;
}) {
  const { openModal } = useModals();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(FatigueRefreshModal, { fatigue, adName });
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      openModal(FatigueRefreshModal, { fatigue, adName });
    }
  };
  const label = `Fatigue day ${fatigue.ageDays}`;
  if (asSpan) {
    return (
      <StatusPill
        tone="warning"
        size="sm"
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{ cursor: 'pointer' }}
      >
        {label}
      </StatusPill>
    );
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <StatusPill tone="warning" size="sm">
        {label}
      </StatusPill>
    </button>
  );
}

interface FatigueRefreshModalProps {
  fatigue: FatigueFlag;
  adName: string;
}

function FatigueRefreshModal({
  close,
  fatigue,
  adName,
}: StackModalProps & FatigueRefreshModalProps) {
  return (
    <Modal.Root size="md" aria-labelledby="paid-search-fatigue-refresh-title">
      <Modal.Header
        title={`Creative Fatigue — ${adName}`}
        id="paid-search-fatigue-refresh-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(188, 1, 11, 0.10)',
              color: 'var(--red-70)',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Text variant="largeList" style={{ color: 'var(--dark-90)' }}>
              Day {fatigue.ageDays}
            </Text>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              {fatigue.signal}
            </Text>
          </div>
        </div>

        <FatigueSection title="Why we flagged this">{fatigue.reason}</FatigueSection>
        <FatigueSection title="What competitors are doing">{fatigue.competitors}</FatigueSection>
        <FatigueBulletSection title="Proposed refresh" bullets={fatigue.proposals} />
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Snooze 7 days
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>
            Approve refresh
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function FatigueSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <Text
        variant="metadata"
        style={{
          color: 'var(--dark-60)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: 12,
          display: 'block',
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.6 }}>
        {children}
      </p>
    </section>
  );
}

function FatigueBulletSection({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <section style={{ marginBottom: 4 }}>
      <Text
        variant="metadata"
        style={{
          color: 'var(--dark-60)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: 12,
          display: 'block',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {bullets.map((b) => (
          <li key={b} style={{ fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.55 }}>
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SearchComparisonPanel({
  heading,
  metricPill,
  image,
  domain,
  adHeadline,
  adDesc,
  label,
  body,
}: {
  heading: string;
  metricPill?: string;
  image: string;
  domain: string;
  adHeadline: string;
  adDesc: string;
  label: string;
  body: string;
}) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <Globe size={16} color="var(--dark-60)" />
        <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
          {heading}
        </Text>
        {metricPill && (
          <span
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: 999,
              background: 'rgba(4, 175, 0, 0.10)',
              color: 'var(--status-approved)',
              fontSize: 12,
              fontWeight: 500,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {metricPill}
          </span>
        )}
      </div>
      <div
        aria-hidden
        style={{
          height: 220,
          background: `var(--dark-4) center / cover no-repeat url(${image})`,
        }}
      />
      <div style={{ padding: '16px 16px 12px', background: 'var(--dark-2)', borderTop: '1px solid var(--dark-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '1px 6px',
              borderRadius: 4,
              border: '1px solid var(--dark-15)',
              background: 'var(--light-100)',
              color: 'var(--dark-80)',
              fontSize: 12,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Sponsored
          </span>
          <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
            {domain}
          </Text>
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: '#1a0dab',
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {adHeadline}
        </div>
        <Text variant="smallList" style={{ color: 'var(--dark-80)' }}>
          {adDesc}
        </Text>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <Text
          variant="metadata"
          style={{
            color: 'var(--dark-60)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: 12,
            display: 'block',
          }}
        >
          {label}
        </Text>
        <Text variant="smallList" style={{ color: 'var(--dark-90)', lineHeight: 1.55 }}>
          {body}
        </Text>
      </div>
    </div>
  );
}

