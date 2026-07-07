import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Heading, IconButton, Modal, ModalStack, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Chip, StatusPill, TabChip, TextField, Toggle, useToast } from '@/staging';
import Plus from '@/icons/20/Plus';
import AlertTriangle from '@/icons/20/AlertTriangle';
import Check2 from '@/icons/20/Check2';
import Stars from '@/icons/20/Stars';
import ChevronRightSmall from '@/icons/20/ChevronRightSmall';
import ArrowLeft from '@/icons/20/ArrowLeft';
import LinkExternal from '@/icons/20/LinkExternal';
import Edit1 from '@/icons/20/Edit1';
import Trash2 from '@/icons/20/Trash2';
import { H2Layout } from '../H2Layout';
import { PaidSearchInsightsView } from '../insights/PaidSearchInsights';
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
 *  - Live campaign "Ad groups" / "Negative keywords" section headers each
 *    have a Manage (pencil) button opening the same keyword/negative modal,
 *    scoped to that campaign's own state — add via the dashed "+ Add" input,
 *    remove via the chip's "x". Saving updates the dashboard's counts.
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

type MatchType = 'phrase' | 'exact' | 'broad';
type KeywordStatus = 'ok' | 'alert' | 'paused' | 'watching' | 'new';
type CompetitionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface KeywordTerm {
  term: string;
  match: MatchType;
  // Live rollup — feeds the Ad groups summary table on the dashboard.
  clicks: number;
  conv: number;
  status: KeywordStatus;
  fatigue?: FatigueFlag;
  // Keyword-research metadata — the same fields Google Ads Keyword Planner
  // (and our own campaign-creation wizard, see GoogleAdsCampaignWizard/Keywords)
  // surfaces per keyword. Shown in the manage-keywords modal.
  avgMonthlySearches: number;
  monthlySearches: number[]; // 12 values, chronological
  competition: CompetitionLevel;
  lowBid: number;
  highBid: number;
}

interface KwGroup {
  theme: string;
  // No match-type field here — in real Google Ads, match type lives on each
  // keyword criterion, not the ad group. See buildKwGroup's defaultMatch
  // param, which only seeds initial per-keyword values below.
  terms: KeywordTerm[];
  // Enabled/paused is a real, independent property of the Ad Group resource
  // itself in Google Ads — not derived from its keywords' statuses.
  status: 'active' | 'paused';
}

// Real performance + research data for the handful of keywords the prototype
// treats as "actually running" — everything else in KW_GROUPS gets plausible
// synthetic stats via deriveKeywordStats so every term reads as populated.
const KEYWORD_STATS: Record<
  string,
  {
    clicks: number;
    conv: number;
    status: KeywordStatus;
    fatigue?: FatigueFlag;
    avgMonthlySearches: number;
    monthlySearches: number[];
    competition: CompetitionLevel;
    lowBid: number;
    highBid: number;
  }
> = {
  'painters austin': {
    clicks: 62,
    conv: 4,
    status: 'ok',
    avgMonthlySearches: 8100,
    monthlySearches: [6600, 7200, 6900, 7800, 8400, 9100, 8800, 9500, 8100, 7900, 8300, 8100],
    competition: 'LOW',
    lowBid: 4.1,
    highBid: 18.4,
  },
  'exterior painting austin': {
    clicks: 48,
    conv: 3,
    status: 'ok',
    fatigue: KEYWORD_FATIGUE,
    avgMonthlySearches: 2900,
    monthlySearches: [3600, 3400, 3100, 3300, 3000, 2800, 2700, 2600, 2500, 2600, 2800, 2900],
    competition: 'LOW',
    lowBid: 5.2,
    highBid: 22,
  },
  'house painters austin': {
    clicks: 31,
    conv: 2,
    status: 'ok',
    avgMonthlySearches: 3600,
    monthlySearches: [3000, 3050, 3100, 3200, 3300, 3350, 3400, 3450, 3500, 3550, 3600, 3600],
    competition: 'LOW',
    lowBid: 3.4,
    highBid: 14.2,
  },
  'interior painters near me': {
    clicks: 23,
    conv: 0,
    status: 'alert',
    avgMonthlySearches: 5400,
    monthlySearches: [4100, 4300, 4600, 4900, 5300, 5600, 5900, 5700, 5500, 5300, 5400, 5400],
    competition: 'MEDIUM',
    lowBid: 3.8,
    highBid: 16.9,
  },
  'cabinet painting austin': {
    clicks: 14,
    conv: 1,
    status: 'ok',
    avgMonthlySearches: 1300,
    monthlySearches: [900, 950, 1000, 1050, 1100, 1150, 1150, 1200, 1200, 1250, 1280, 1300],
    competition: 'LOW',
    lowBid: 2.9,
    highBid: 12.1,
  },
};

function deriveKeywordStats(
  term: string,
  match: MatchType,
): {
  clicks: number;
  conv: number;
  status: KeywordStatus;
  avgMonthlySearches: number;
  monthlySearches: number[];
  competition: CompetitionLevel;
  lowBid: number;
  highBid: number;
} {
  const seed = term.length * 37 + term.charCodeAt(0) * 7 + term.charCodeAt(term.length - 1);
  const base = match === 'broad' ? 200 + (seed % 900) : match === 'phrase' ? 400 + (seed % 2500) : 100 + (seed % 1200);
  const direction = seed % 3; // 0 = up, 1 = down, 2 = seasonal-ish wobble
  const pctSwing = (20 + (seed % 40)) / 100;
  const monthlySearches = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    const drift = direction === 0 ? t * pctSwing : direction === 1 ? -t * pctSwing : Math.sin(t * Math.PI * 2) * 0.15;
    const wobble = Math.sin((seed + i * 13) * 0.7) * 0.06;
    return Math.max(10, Math.round(base * (1 + drift + wobble)));
  });
  const avgMonthlySearches = Math.round(monthlySearches.reduce((s, v) => s + v, 0) / monthlySearches.length / 10) * 10;
  const competition: CompetitionLevel =
    match === 'broad' ? 'LOW' : seed % 5 === 0 ? 'MEDIUM' : 'LOW';
  const lowBid = Math.round((1.5 + (seed % 400) / 100) * 100) / 100;
  const highBid = Math.round((lowBid + 3 + (seed % 15)) * 100) / 100;
  return {
    clicks: 2 + (seed % 11),
    conv: match === 'broad' ? 0 : seed % 5 === 0 ? 1 : 0,
    status: match === 'broad' ? 'watching' : 'ok',
    avgMonthlySearches,
    monthlySearches,
    competition,
    lowBid,
    highBid,
  };
}

function buildKeywordTerm(term: string, match: MatchType): KeywordTerm {
  return { term, match, ...(KEYWORD_STATS[term] ?? deriveKeywordStats(term, match)) };
}

function buildKwGroup(
  theme: string,
  defaultMatch: MatchType,
  terms: string[],
  status: 'active' | 'paused' = 'active',
): KwGroup {
  return { theme, terms: terms.map((t) => buildKeywordTerm(t, defaultMatch)), status };
}

const KW_GROUPS: KwGroup[] = [
  buildKwGroup('Brand & Generic', 'phrase', [
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
  ]),
  buildKwGroup('High-intent buyers', 'exact', [
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
  ]),
  buildKwGroup('Discovery', 'broad', [
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
  ], 'paused'),
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

// Negative keywords are a single flat list scoped to the whole campaign —
// Google Ads has no ad-group-style categorization for these. Mirrors
// apps/blaze's GoogleAdsCampaignWizard `negativeKeywords: string[]` shape.
const NEGATIVE_KEYWORDS: string[] = [
  'diy painting',
  'how to paint a wall',
  'paint your own',
  'paint tutorial',
  'youtube painting',
  'free paint',
  'painting tips reddit',
  'painting for beginners',
  'cheap paint',
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
  'painter jobs',
  'painter hiring',
  'painter salary',
  'painter apprenticeship',
  'painting career',
  'become a painter',
  'painter resume',
  'painter union',
  'painters dallas',
  'painters houston',
  'painters san antonio',
  'painters fort worth',
  'painters el paso',
  'painters california',
];
const NEG_TOTAL = NEGATIVE_KEYWORDS.length;

// ─── AD COPY DATA ──────────────────────────────────────────────────────
// Headlines/descriptions/sitelinks/callouts — the Google Ads "assets" that
// make up the campaign's responsive search ads. Character limits and
// min/max counts mirror the real Google Ads constraints (and apps/blaze's
// GoogleAdsCampaignWizard/Copy/constants.ts), so the editing modals below
// enforce the same rules a live campaign actually has.
const HEADLINE_MAX_LEN = 30;
const MIN_HEADLINES = 3;
const MAX_HEADLINES = 15;
const DESCRIPTION_MAX_LEN = 90;
const MIN_DESCRIPTIONS = 2;
const MAX_DESCRIPTIONS = 4;
const SITELINK_HEADLINE_MAX_LEN = 25;
const SITELINK_DESC_MAX_LEN = 35;
const MAX_SITELINKS = 20;
const CALLOUT_MAX_LEN = 25;
const MAX_CALLOUTS = 20;

interface Sitelink {
  headline: string;
  url: string;
  description: string;
  description2: string;
}

const HEADLINES: string[] = [
  'CertaPro Painters of Austin',
  'Free In-Home Estimate',
  '187 5-Star Google Reviews',
  'Done in 4 Days, Built to Last',
  '2-Year Workmanship Warranty',
  'Locally Owned & Certified',
  '0% Financing Available',
  'Serving Austin Homeowners',
];

const DESCRIPTIONS: string[] = [
  'Interior, exterior & cabinet painting across Austin metro. Free estimates, 2-yr warranty.',
  'Locally owned and certified. Serving Austin, Cedar Park, Round Rock, and Lakeway.',
  '187 5-star Google reviews from Austin homeowners. Book your free consultation today.',
];

const SITELINKS: Sitelink[] = [
  {
    headline: 'Free Estimate',
    url: 'certapro.com/estimate',
    description: 'Book your free in-home quote',
    description2: 'No obligation, fast response',
  },
  {
    headline: 'Our Services',
    url: 'certapro.com/services',
    description: 'Interior, exterior & cabinets',
    description2: 'Residential & commercial work',
  },
  {
    headline: 'Customer Reviews',
    url: 'certapro.com/reviews',
    description: '187 5-star Google reviews',
    description2: 'See what Austin homeowners say',
  },
  {
    headline: 'Financing Options',
    url: 'certapro.com/financing',
    description: '0% financing on $2,500+ jobs',
    description2: 'Flexible monthly payment plans',
  },
];

const CALLOUTS: string[] = [
  'Free Estimates',
  '2-Year Warranty',
  'Licensed & Insured',
  'Locally Owned',
  '0% Financing Available',
  '187 5-Star Reviews',
];

const DELTA_COLORS = { up: '#0E6B33', down: 'var(--status-failed)', flat: 'var(--dark-60)' };

type View = 'empty' | 'campaigns' | 'live';
type AnomalyAction = 'pause' | 'lower' | 'monitor';
interface AnomalyState {
  resolved: boolean;
  action: AnomalyAction | null;
}

type SubTab = 'campaigns' | 'insights';

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
      <div style={{ fontSize: 12, color: isPaused ? 'var(--dark-60)' : 'var(--dark-80)' }}>
        {campaign.campaignType}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <CampaignStatusPill status={campaign.status} />
      </div>
      <div style={{ fontSize: 12, color: isPaused ? 'var(--dark-60)' : 'var(--dark-80)' }}>
        {campaign.bidStrategy}
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 500, color: isPaused ? 'var(--dark-60)' : 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtMoney(campaign.spend)}
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, color: isPaused ? 'var(--dark-60)' : 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtInt(campaign.clicks)}
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 500, color: isPaused ? 'var(--dark-60)' : 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtInt(campaign.conversions)}
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, color: isPaused ? 'var(--dark-60)' : 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
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

function FatigueSummaryBanner({ title, items }: { title?: string; items: FatigueSummaryItem[] }) {
  const headerText =
    title ?? `Creative fatigue · ${items.length} ad set${items.length === 1 ? '' : 's'} need attention`;
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
          {headerText}
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
      <span style={{ marginLeft: 'auto', color: 'var(--dark-60)', display: 'inline-flex' }} aria-hidden>
        <ChevronRightSmall size={16} />
      </span>
    </button>
  );
}

// ─── LIVE CAMPAIGN VIEW (steady state) ─────────────────────────────────

// Shared section header used across the live campaign dashboard — an H3
// title, an optional right-aligned action (Edit button / count), and an
// optional Secondary-text helper line beneath.
function SectionHeader({
  title,
  helperText,
  action,
}: {
  title: string;
  helperText?: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: helperText ? 0 : 12,
        }}
      >
        <Heading level={3} style={{ margin: 0 }}>
          {title}
        </Heading>
        {action}
      </div>
      {helperText && (
        <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.4, margin: '0 0 12px', maxWidth: 640 }}>
          {helperText}
        </Text>
      )}
    </>
  );
}

// Shared wrapper for the ad-copy sections below (Headlines/Descriptions/
// Callouts) — H3 title + Secondary helper copy + a top-right "Edit" button
// opening that section's modal. Each section's body (the read-only list
// itself) still renders independently since they each display differently.
function AdCopySection({
  title,
  helperText,
  onEdit,
  editLabel,
  children,
}: {
  title: string;
  helperText: string;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 40 }}>
      <SectionHeader
        title={title}
        helperText={helperText}
        action={
          <Button variant="secondary" size="sm" frontIcon={Edit1} aria-label={editLabel} onPress={onEdit}>
            Edit
          </Button>
        }
      />
      {children}
    </div>
  );
}

function LiveCampaign({
  anomaly,
  onResolveAnomaly,
}: {
  anomaly: AnomalyState;
  onResolveAnomaly: (action: AnomalyAction) => void;
}) {
  const { openModal } = useModals();
  const { showToast } = useToast();
  // Live keyword + negative-keyword state for this campaign — editable from
  // the dashboard below, independent of the wizard's pre-launch KW_GROUPS/
  // NEGATIVE_KEYWORDS prep data.
  const [keywordGroups, setKeywordGroups] = useState<KwGroup[]>(KW_GROUPS);
  const [negativeKeywords, setNegativeKeywords] = useState<string[]>(NEGATIVE_KEYWORDS);
  // Ad copy — headlines, descriptions, sitelinks, and callouts. Each is its
  // own section with its own Edit affordance opening its own modal, so
  // updating one doesn't touch the others — unlike the wizard's Copy step,
  // which edits (and autosaves) all four together on one page.
  const [headlines, setHeadlines] = useState<string[]>(HEADLINES);
  const [descriptions, setDescriptions] = useState<string[]>(DESCRIPTIONS);
  const [sitelinks, setSitelinks] = useState<Sitelink[]>(SITELINKS);
  const [callouts, setCallouts] = useState<string[]>(CALLOUTS);
  // Sitelinks are edited inline on the dashboard (no modal) — one card at a
  // time. `null` = nothing in edit mode; an index equal to the list length =
  // the "add new" card is open.
  const [sitelinkEditingIndex, setSitelinkEditingIndex] = useState<number | null>(null);

  // Editing an ad group opens the keyword modal scoped to that one group;
  // the whole row is the click target now (no kebab menu).
  const handleOpenEditGroup = (g: KwGroup) => {
    openModal(KeywordsPrepModal, {
      groups: [g],
      isLiveCampaign: true,
      validateName: (name) =>
        keywordGroups.some(
          (grp) => grp.theme !== g.theme && grp.theme.toLowerCase() === name.toLowerCase(),
        )
          ? `An ad group named "${name}" already exists`
          : null,
      onSave: ([updated]) =>
        setKeywordGroups((prev) => prev.map((grp) => (grp.theme === g.theme ? updated : grp))),
    });
  };

  // Sitelinks — inline add/edit/delete committed straight to the dashboard.
  const handleSaveSitelink = (index: number, updated: Sitelink) => {
    const isNew = index >= sitelinks.length;
    setSitelinks((prev) => (index < prev.length ? prev.map((s, i) => (i === index ? updated : s)) : [...prev, updated]));
    setSitelinkEditingIndex(null);
    showToast({ message: isNew ? `Added sitelink "${updated.headline}"` : `Updated sitelink "${updated.headline}"` });
  };
  const handleDeleteSitelink = (index: number) => {
    const removed = sitelinks[index];
    setSitelinks((prev) => prev.filter((_, i) => i !== index));
    setSitelinkEditingIndex((prev) => (prev === null || prev === index ? null : prev > index ? prev - 1 : prev));
    showToast({ message: `Deleted sitelink "${removed.headline}"` });
  };

  // Negative keywords — inline pills: add via the "+ Add" pill, remove via
  // each pill's ×. Commits straight to the dashboard.
  const handleAddNegative = (term: string) => {
    const trimmed = term.trim();
    if (negativeKeywords.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      showToast({ message: `"${trimmed}" is already a negative keyword` });
      return;
    }
    setNegativeKeywords((prev) => [...prev, trimmed]);
    showToast({ message: `Added "${trimmed}" to negative keywords` });
  };
  const handleRemoveNegative = (term: string) => {
    setNegativeKeywords((prev) => prev.filter((t) => t !== term));
    showToast({ message: `Removed "${term}" from negative keywords` });
  };

  // Callouts — same inline pill treatment.
  const handleAddCallout = (term: string) => {
    const trimmed = term.trim();
    if (callouts.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      showToast({ message: `"${trimmed}" is already a callout` });
      return;
    }
    setCallouts((prev) => [...prev, trimmed]);
    showToast({ message: `Added "${trimmed}" callout` });
  };
  const handleRemoveCallout = (term: string) => {
    setCallouts((prev) => prev.filter((t) => t !== term));
    showToast({ message: `Removed "${term}" callout` });
  };

  const handleOpenAddGroup = () => {
    openModal(KeywordsPrepModal, {
      groups: [{ theme: '', terms: [], status: 'paused' }],
      mode: 'create',
      isLiveCampaign: true,
      validateName: (name) =>
        keywordGroups.some((g) => g.theme.toLowerCase() === name.toLowerCase())
          ? `An ad group named "${name}" already exists`
          : null,
      // Starts paused — a brand-new ad group has no keywords to serve ads
      // against until the user adds some and comes back to resume it.
      onSave: ([newGroup]) => setKeywordGroups((prev) => [...prev, newGroup]),
    });
  };

  const handleToggleGroupStatus = (theme: string, currentStatus: KwGroup['status']) => {
    const next = currentStatus === 'active' ? 'paused' : 'active';
    setKeywordGroups((prev) => prev.map((g) => (g.theme === theme ? { ...g, status: next } : g)));
    showToast({ message: `${next === 'active' ? 'Resumed' : 'Paused'} "${theme}"` });
  };

  // Issues surfaced in the summary banner.
  const warningItems: FatigueSummaryItem[] = [
    {
      key: 'cpc',
      name: 'CPC spike detected',
      signal: 'CPC up 38% past 4h · "interior painters near me"',
      onSelect: () => openModal(BidReviewModal, { onResolve: onResolveAnomaly }),
    },
    {
      key: 'fatigue',
      name: 'Creative fatigue detected',
      signal: 'RSA Variant A · CTR -28% past 7d',
      onSelect: () =>
        openModal(FatigueRefreshModal, {
          fatigue: CAMPAIGN_FATIGUE,
          adName: 'Exterior painting — Austin metro · RSA · Variant A',
        }),
    },
  ];

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      {/* Warning summary — one banner (header + clickable rows) listing every
          issue that needs attention. The CPC row drops out once resolved,
          leaving a 'resolved' confirmation above the banner. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        <FatigueSummaryBanner
          title={`${warningItems.length} issue${warningItems.length === 1 ? ' needs' : 's need'} attention`}
          items={warningItems}
        />
      </div>

      {/* Campaign summary — sits just below the warnings. */}
      <div style={{ fontSize: 14, color: 'var(--dark-90)', marginBottom: 18 }}>
        <strong>$80/day budget</strong> · Targeting homeowners 35–65 in Austin metro · Started 2h 14m ago
      </div>

      {/* KPI strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 10,
          marginBottom: 40,
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
                fontSize: 26,
                fontWeight: 400,
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

      {/* CTR chart — header pulled out as a section H3 above the card. */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader
          title="CTR — last 14 days"
          action={<Text variant="secondary" color="var(--dark-60)">vs. industry benchmark</Text>}
        />
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: 16 }}>
        <svg viewBox="0 0 600 160" width="100%" height="240" preserveAspectRatio="none" style={{ display: 'block' }}>
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
          <g fontFamily="Sohne" fontSize="12" style={{ fill: 'var(--dark-60)' }}>
            <text x="2" y="22">2.5%</text>
            <text x="2" y="62">2.0%</text>
            <text x="2" y="102">1.5%</text>
            <text x="2" y="142">1.0%</text>
          </g>
          <path
            d="M40 110 L100 105 L160 105 L220 100 L280 95 L340 92 L400 88 L460 85 L520 83 L580 82"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="1"
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
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="580" cy="75" r="3.5" fill="#6366f1" />
          <g fontFamily="Sohne" fontSize="12" style={{ fill: 'var(--dark-60)' }}>
            <text x="34" y="158">Apr 24</text>
            <text x="276" y="158">Apr 30</text>
            <text x="540" y="158">May 7</text>
          </g>
        </svg>
        </div>
      </div>

      {/* Ad groups — the Google Ads campaign → ad group → keywords hierarchy.
          Each row in keywordGroups becomes an ad group with a few sample
          keywords. Clicks/conv roll up from each keyword's own stats (see
          KeywordTerm) rather than a fixed number. Click a row to edit its
          keywords; the per-row toggle pauses/resumes the ad group; adding a
          whole new ad group happens at the bottom of the section. */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader title="Ad groups" />
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 90px 90px 90px 96px',
              gap: 12,
              padding: '8px 16px',
              borderBottom: '1px solid var(--dark-8)',
              fontSize: 14,
              letterSpacing: '0.28px',
              color: 'var(--dark-60)',
              fontWeight: 400,
            }}
          >
            <div>Ad group</div>
            <div style={{ textAlign: 'right' }}>Keywords</div>
            <div style={{ textAlign: 'right' }}>Clicks</div>
            <div style={{ textAlign: 'right' }}>Conv.</div>
            <div style={{ textAlign: 'right' }}>Active</div>
          </div>
          {keywordGroups.map((g, i) => {
            const clicks = g.terms.reduce((n, t) => n + t.clicks, 0);
            const conv = g.terms.reduce((n, t) => n + t.conv, 0);
            return (
              <div
                key={g.theme}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenEditGroup(g)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenEditGroup(g);
                  }
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 90px 90px 90px 96px',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < keywordGroups.length - 1 ? '1px solid var(--dark-8)' : 'none',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  background: 'transparent',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{g.theme}</span>
                  <span style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.terms.slice(0, 3).map((t) => t.term).join(' · ')}{g.terms.length > 3 ? ' · …' : ''}
                  </span>
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
                {/* Toggle stops propagation so pausing/resuming doesn't also
                    open the edit modal. */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                  <Toggle
                    checked={g.status === 'active'}
                    onChange={() => handleToggleGroupStatus(g.theme, g.status)}
                    aria-label={`${g.status === 'active' ? 'Pause' : 'Resume'} ${g.theme}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" size="sm" frontIcon={Plus} onPress={handleOpenAddGroup}>
            Add ad group
          </Button>
        </div>
      </div>

      {/* Negative keywords — a single flat list for the whole campaign (no
          ad-group-style categories; that's not how Google Ads models these).
          Inline pills: remove via each pill's ×, add via the "+ Add" pill.
          Changes commit straight to the dashboard. */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader
          title="Negative keywords"
          helperText="Searches your ads won't show up for."
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {negativeKeywords.map((t) => (
            <Chip key={t} size="sm" selected={false} deletable onDelete={() => handleRemoveNegative(t)}>
              {t}
            </Chip>
          ))}
          <AddChipInput onAdd={handleAddNegative} label="Add keyword" placeholder="New keyword…" />
        </div>
      </div>

      {/* Headlines — the responsive search ad headline pool Google mixes and
          tests in combination. Read-only here; "Edit" opens a modal where
          every add/edit/remove is staged locally and only committed back to
          this dashboard on Save — same one-transaction pattern as Ad groups
          and Negative keywords. */}
      <AdCopySection
        title="Headlines"
        editLabel="Edit headlines"
        onEdit={() => openModal(HeadlinesPrepModal, { headlines, onSave: setHeadlines })}
        helperText="Google mixes and tests these in your ads."
      >
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
          {headlines.map((h, i) => (
            <div
              key={h}
              style={{
                padding: '10px 16px',
                fontSize: 14,
                letterSpacing: '0.28px',
                color: 'var(--dark-90)',
                borderBottom: i < headlines.length - 1 ? '1px solid var(--dark-8)' : 'none',
              }}
            >
              {h}
            </div>
          ))}
        </div>
      </AdCopySection>

      <AdCopySection
        title="Descriptions"
        editLabel="Edit descriptions"
        onEdit={() => openModal(DescriptionsPrepModal, { descriptions, onSave: setDescriptions })}
        helperText="Appear below your headlines."
      >
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
          {descriptions.map((d, i) => (
            <div
              key={d}
              style={{
                padding: '10px 16px',
                fontSize: 14,
                letterSpacing: '0.28px',
                color: 'var(--dark-90)',
                borderBottom: i < descriptions.length - 1 ? '1px solid var(--dark-8)' : 'none',
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </AdCopySection>

      {/* Sitelinks — edited inline on the dashboard, one card at a time.
          Each card has its own edit (pencil) + delete (trash) affordances;
          "Add sitelink" opens a fresh card at the bottom. */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader
          title="Sitelinks"
          helperText="Links to specific pages on your site."
        />
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
          {sitelinks.map((s, i) => (
            <SitelinkCardRow
              key={i}
              sitelink={s}
              isEditing={sitelinkEditingIndex === i}
              isLast={i === sitelinks.length - 1 && sitelinkEditingIndex !== sitelinks.length}
              onStartEdit={() => setSitelinkEditingIndex(i)}
              onCancelEdit={() => setSitelinkEditingIndex(null)}
              onSave={(updated) => handleSaveSitelink(i, updated)}
              onDelete={() => handleDeleteSitelink(i)}
            />
          ))}
          {sitelinkEditingIndex === sitelinks.length && (
            <SitelinkCardRow
              sitelink={{ headline: '', url: '', description: '', description2: '' }}
              isEditing
              isLast
              onStartEdit={() => {}}
              onCancelEdit={() => setSitelinkEditingIndex(null)}
              onSave={(updated) => handleSaveSitelink(sitelinks.length, updated)}
              onDelete={() => setSitelinkEditingIndex(null)}
            />
          )}
        </div>
        {sitelinkEditingIndex === null && sitelinks.length < MAX_SITELINKS && (
          <div style={{ marginTop: 12 }}>
            <Button
              variant="secondary"
              size="sm"
              frontIcon={Plus}
              onPress={() => setSitelinkEditingIndex(sitelinks.length)}
            >
              Add sitelink
            </Button>
          </div>
        )}
      </div>

      {/* Callouts — inline pills, same as negative keywords. */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader
          title="Callouts"
          helperText="Short phrases shown beneath your ad."
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {callouts.map((c) => (
            <Chip key={c} size="sm" selected={false} deletable onDelete={() => handleRemoveCallout(c)}>
              {c}
            </Chip>
          ))}
          {callouts.length < MAX_CALLOUTS && (
            <AddChipInput onAdd={handleAddCallout} label="Add callout" placeholder="New callout…" maxLength={CALLOUT_MAX_LEN} />
          )}
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
                  fontSize: 26,
                  fontWeight: 400,
                  letterSpacing: '-0.6px',
                  color: 'var(--dark-90)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {conv}
              </span>
              <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>
                estimate requests <span style={{ color: 'var(--dark-60)' }}>/ day</span>
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

interface KeywordsPrepModalProps {
  groups?: KwGroup[];
  onSave?: (groups: KwGroup[]) => void;
  // True only when opened from the live dashboard — gates the "Fatigue"
  // badge, since that's a live signal that can't exist pre-launch.
  isLiveCampaign?: boolean;
  // 'create' when opened via the dashboard's "Add ad group" — swaps in
  // create-flavored copy/labels; the empty starting group + always-editable
  // name input are otherwise identical to the edit flow.
  mode?: 'edit' | 'create';
  // Cross-group duplicate-name check the modal can't do on its own when
  // scoped to a single group (it doesn't see sibling ad groups). Return an
  // error message to block saving, or null if the name is fine.
  validateName?: (name: string) => string | null;
}

// Column widths mirror apps/blaze's GoogleAdsCampaignWizard/Keywords/KeywordsTable
// so this modal reads like the real campaign-creation keyword-research table.
const COL_WIDTHS = { match: 90, searches: 100, trend: 140, competition: 115, bid: 100 };

function KeywordsPrepModal({
  close,
  groups: initialGroups,
  onSave,
  isLiveCampaign = false,
  mode = 'edit',
  validateName,
}: StackModalProps & KeywordsPrepModalProps) {
  const { showToast } = useToast();
  const { openModal } = useModals();
  const [groups, setGroups] = useState<KwGroup[]>(initialGroups ?? KW_GROUPS);
  const total = groups.reduce((n, g) => n + g.terms.length, 0);

  const handleAdd = (index: number, term: string) => {
    const group = groups[index];
    if (group.terms.some((t) => t.term.toLowerCase() === term.toLowerCase())) return;
    // Google Ads defaults a newly-added keyword to broad match — match type
    // is a per-keyword property, the ad group has no default to inherit.
    const newTerm = buildKeywordTerm(term, 'broad');
    setGroups((prev) => prev.map((g, i) => (i === index ? { ...g, terms: [...g.terms, newTerm] } : g)));
    showToast({ message: `Added "${term}" to ${group.theme || 'this ad group'}` });
  };

  const handleRemove = (index: number, term: string) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, terms: g.terms.filter((t) => t.term !== term) } : g)),
    );
    showToast({ message: `Removed "${term}" from ${groups[index].theme || 'this ad group'}` });
  };

  const handleMatchChange = (index: number, term: string, match: MatchType) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, terms: g.terms.map((t) => (t.term === term ? { ...t, match } : t)) } : g)),
    );
  };

  const handleThemeChange = (index: number, newTheme: string) => {
    setGroups((prev) => prev.map((g, i) => (i === index ? { ...g, theme: newTheme } : g)));
  };

  const handleSave = () => {
    for (let i = 0; i < groups.length; i++) {
      const trimmed = groups[i].theme.trim();
      if (!trimmed) {
        showToast({ message: 'Give every ad group a name before saving' });
        return;
      }
      const internalDupe = groups.some((g, j) => j !== i && g.theme.trim().toLowerCase() === trimmed.toLowerCase());
      if (internalDupe) {
        showToast({ message: `An ad group named "${trimmed}" already exists` });
        return;
      }
    }
    if (groups.length === 1) {
      const error = validateName?.(groups[0].theme.trim());
      if (error) {
        showToast({ message: error });
        return;
      }
    }
    const finalGroups = groups.map((g) => ({ ...g, theme: g.theme.trim() }));
    onSave?.(finalGroups);
    showToast({
      message: mode === 'create' ? `Added ad group "${finalGroups[0].theme}"` : 'Keyword changes saved',
    });
    close();
  };

  const isSingleGroup = groups.length === 1;

  return (
    <Modal.Root size="md" aria-labelledby="kw-prep-title" data-testid="paid-search-keywords-modal">
      <Modal.Header
        title={
          mode === 'create'
            ? 'Add ad group'
            : isSingleGroup
              ? `Search keywords — ${groups[0].theme}`
              : 'Search keywords'
        }
        id="kw-prep-title"
        onClose={close}
      />
      <Modal.Content>
        <p style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5, margin: '0 0 16px' }}>
          {mode === 'create'
            ? "Name this ad group and add its first keywords — you can always come back and edit it later."
            : isSingleGroup
              ? `${total} keywords in this ad group. Add or remove anything, or change a keyword's match type.`
              : `${groups.length} themes · ${total} keywords — drawn from your service mix, brand voice, and 12 Austin painting competitor scans. Add or remove anything, or change a keyword's match type.`}
        </p>
        {groups.map((g, index) => (
          <div key={index} style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <input
                value={g.theme}
                onChange={(e) => handleThemeChange(index, e.target.value)}
                placeholder="Ad group name"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  color: 'var(--dark-90)',
                  border: '1px solid var(--dark-15)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  minWidth: 220,
                  outline: 'none',
                }}
              />
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 12,
                  color: 'var(--dark-60)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {g.terms.length} {g.terms.length === 1 ? 'term' : 'terms'}
              </span>
            </div>
            <KeywordsTableHeader />
            <div>
              {g.terms.map((t) => (
                <KeywordRow
                  key={t.term}
                  kw={t}
                  onMatchChange={(match) => handleMatchChange(index, t.term, match)}
                  onRemove={() => handleRemove(index, t.term)}
                  onOpenFatigue={
                    isLiveCampaign && t.fatigue
                      ? () => openModal(FatigueRefreshModal, { fatigue: t.fatigue!, adName: t.term })
                      : undefined
                  }
                />
              ))}
            </div>
            <div style={{ paddingTop: 8 }}>
              <AddChipInput onAdd={(term) => handleAdd(index, term)} />
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
          <Modal.FooterButton variant="primary" onPress={handleSave}>
            {mode === 'create' ? 'Add ad group' : 'Save changes'}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function KeywordsTableHeader() {
  const labelStyle: React.CSSProperties = { fontSize: 12, color: 'var(--dark-40)' };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
        minHeight: 28,
        paddingBottom: 6,
        borderBottom: '1px solid var(--dark-8)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, ...labelStyle }}>Keyword</div>
      <div style={{ width: COL_WIDTHS.match, flexShrink: 0, ...labelStyle }}>Match type</div>
      <div style={{ width: COL_WIDTHS.searches, flexShrink: 0, textAlign: 'right', ...labelStyle }}>
        Avg. monthly searches
      </div>
      <div style={{ width: COL_WIDTHS.trend, flexShrink: 0, ...labelStyle }}>Trend (12mo)</div>
      <div style={{ width: COL_WIDTHS.competition, flexShrink: 0, ...labelStyle }}>Competition</div>
      <div style={{ width: COL_WIDTHS.bid, flexShrink: 0, ...labelStyle }}>Top of page bid</div>
      <div style={{ width: 28, flexShrink: 0 }} />
    </div>
  );
}

function KeywordRow({
  kw,
  onMatchChange,
  onRemove,
  onOpenFatigue,
}: {
  kw: KeywordTerm;
  onMatchChange: (match: MatchType) => void;
  onRemove: () => void;
  onOpenFatigue?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 44,
        borderBottom: '1px solid var(--dark-4)',
      }}
    >
      <span
        title={kw.term}
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--dark-80)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {kw.term}
      </span>
      <div style={{ width: COL_WIDTHS.match, flexShrink: 0 }}>
        <MatchTypeSelect value={kw.match} onChange={onMatchChange} />
      </div>
      <div
        style={{
          width: COL_WIDTHS.searches,
          flexShrink: 0,
          textAlign: 'right',
          fontSize: 13,
          color: 'var(--dark-90)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatSearchVolume(kw.avgMonthlySearches)}
      </div>
      <TrendCell monthlySearches={kw.monthlySearches} />
      <div style={{ width: COL_WIDTHS.competition, flexShrink: 0 }}>
        <CompetitionBadge level={kw.competition} />
      </div>
      <div style={{ width: COL_WIDTHS.bid, flexShrink: 0, fontSize: 12, color: 'var(--dark-60)' }}>
        {formatBid(kw.lowBid)} – {formatBid(kw.highBid)}
      </div>
      {onOpenFatigue && (
        <button
          type="button"
          onClick={onOpenFatigue}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
        >
          <StatusPill tone="warning" size="sm">
            Fatigue
          </StatusPill>
        </button>
      )}
      <IconButton
        variant="ghost"
        size="sm"
        icon={Trash2}
        aria-label={`Remove ${kw.term}`}
        onPress={onRemove}
        style={{ flexShrink: 0 }}
      />
    </div>
  );
}

function MatchTypeSelect({ value, onChange }: { value: MatchType; onChange: (match: MatchType) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as MatchType)}
      style={{
        width: 82,
        padding: '5px 8px',
        border: '1px solid var(--dark-15)',
        borderRadius: 6,
        background: 'var(--light-100)',
        fontSize: 12,
        fontFamily: 'inherit',
        color: 'var(--dark-80)',
        cursor: 'pointer',
      }}
    >
      <option value="broad">broad</option>
      <option value="phrase">phrase</option>
      <option value="exact">exact</option>
    </select>
  );
}

const formatBid = (n: number) => `$${n.toFixed(2)}`;
const formatSearchVolume = (n: number) => n.toLocaleString('en-US');

const COMPETITION_COLORS: Record<CompetitionLevel, string> = { LOW: '#16a34a', MEDIUM: '#d97706', HIGH: '#dc2626' };

function CompetitionBadge({ level }: { level: CompetitionLevel }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px 3px 8px',
        borderRadius: 100,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
      }}
    >
      <span
        style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: COMPETITION_COLORS[level], flexShrink: 0 }}
      />
      <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>{level[0] + level.slice(1).toLowerCase()}</span>
    </span>
  );
}

// Trend threshold/logic mirrors apps/blaze's keywordTrendUtils.ts — compares
// the first-3 vs last-3 month average to classify direction, and flags
// choppy-but-flat series as "seasonal" via coefficient of variation.
type TrendType = 'up' | 'down' | 'neutral' | 'seasonal';
const TREND_THRESHOLD_PCT = 15;
const SEASONAL_CV_THRESHOLD = 0.12;

function getTrendInfo(values: number[]): { type: TrendType; pct: number | null; color: string } {
  const n = values.length;
  if (n < 2) return { type: 'neutral', pct: null, color: 'var(--dark-20)' };
  const windowSize = Math.min(3, Math.floor(n / 2));
  const baselineAvg = values.slice(0, windowSize).reduce((s, v) => s + v, 0) / windowSize;
  const recentAvg = values.slice(n - windowSize).reduce((s, v) => s + v, 0) / windowSize;
  const pctChange = baselineAvg === 0 ? 0 : ((recentAvg - baselineAvg) / baselineAvg) * 100;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const cv = mean === 0 ? 0 : Math.sqrt(variance) / mean;
  if (cv > SEASONAL_CV_THRESHOLD && Math.abs(pctChange) < TREND_THRESHOLD_PCT) {
    return { type: 'seasonal', pct: null, color: '#7c3aed' };
  }
  if (pctChange >= TREND_THRESHOLD_PCT) return { type: 'up', pct: Math.round(pctChange), color: '#16a34a' };
  if (pctChange <= -TREND_THRESHOLD_PCT) return { type: 'down', pct: Math.round(Math.abs(pctChange)), color: '#dc2626' };
  return { type: 'neutral', pct: null, color: 'var(--dark-20)' };
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 56;
  const H = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = ((i / (data.length - 1)) * W).toFixed(1);
      const y = (H - 2 - ((v - min) / range) * (H - 4)).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function TrendCell({ monthlySearches }: { monthlySearches: number[] }) {
  const trend = getTrendInfo(monthlySearches);
  return (
    <div style={{ width: COL_WIDTHS.trend, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
      <Sparkline data={monthlySearches} color={trend.color} />
      {trend.type === 'up' && <span style={{ fontSize: 12, color: '#16a34a', whiteSpace: 'nowrap' }}>↑ {trend.pct}%</span>}
      {trend.type === 'down' && <span style={{ fontSize: 12, color: '#dc2626', whiteSpace: 'nowrap' }}>↓ {trend.pct}%</span>}
      {trend.type === 'neutral' && <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>—</span>}
      {trend.type === 'seasonal' && <span style={{ fontSize: 12, color: '#7c3aed', whiteSpace: 'nowrap' }}>Seasonal</span>}
    </div>
  );
}

// Inline "+ Add" affordance shared by the keyword and negative-keyword
// modals — click to reveal a text input, Enter (or blur) commits it as a
// new chip in the parent list.
function AddChipInput({
  onAdd,
  label = 'Add',
  placeholder = 'New term…',
  maxLength,
}: {
  onAdd: (term: string) => void;
  label?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  if (!editing) {
    return (
      <Button variant="secondary" size="sm" frontIcon={Plus} onPress={() => setEditing(true)}>
        {label}
      </Button>
    );
  }

  const commit = () => {
    const term = value.trim();
    if (term) onAdd(term);
    setValue('');
    setEditing(false);
  };

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        } else if (e.key === 'Escape') {
          setValue('');
          setEditing(false);
        }
      }}
      onBlur={commit}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        fontSize: 12,
        fontFamily: 'inherit',
        color: 'var(--dark-90)',
        border: '1px solid var(--dark-15)',
        borderRadius: 6,
        padding: '5px 9px',
        width: 140,
        outline: 'none',
      }}
    />
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

interface NegativesPrepModalProps {
  terms?: string[];
  onSave?: (terms: string[]) => void;
}

function NegativesPrepModal({ close, terms: initialTerms, onSave }: StackModalProps & NegativesPrepModalProps) {
  const { showToast } = useToast();
  const [terms, setTerms] = useState<string[]>(initialTerms ?? NEGATIVE_KEYWORDS);

  const handleAdd = (term: string) => {
    const trimmed = term.trim();
    if (terms.some((t) => t.trim().toLowerCase() === trimmed.toLowerCase())) {
      showToast({ message: `"${trimmed}" is already a negative keyword` });
      return;
    }
    setTerms((prev) => [...prev, trimmed]);
    showToast({ message: `Added "${trimmed}" to negative keywords` });
  };

  const handleRemove = (term: string) => {
    setTerms((prev) => prev.filter((t) => t !== term));
    showToast({ message: `Removed "${term}" from negative keywords` });
  };

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
          These prevent your ads from showing on searches that won't convert — like people looking for DIY tips or
          free services.
        </p>
        <NegativeKeywordsEditor terms={terms} onAdd={handleAdd} onRemove={handleRemove} />
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
              onSave?.(terms);
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

function NegativeKeywordsEditor({
  terms,
  onAdd,
  onRemove,
}: {
  terms: string[];
  onAdd: (term: string) => void;
  onRemove: (term: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {terms.map((t) => (
        <Chip key={t} size="sm" selected={false} deletable onDelete={() => onRemove(t)}>
          {t}
        </Chip>
      ))}
      <AddChipInput onAdd={onAdd} placeholder="Add keyword…" />
    </div>
  );
}

// ─── AD COPY MODALS ─────────────────────────────────────────────────────
// Headlines, descriptions, sitelinks, and callouts each get their own modal
// — every add/edit/remove mutates the modal's own local state instantly,
// but none of it reaches the dashboard until "Save changes" fires onSave.
// Closing without saving discards the draft, same as Ad groups / Negative
// keywords above.

// Shared editable row for a single text asset (headline or description) —
// inline-editable input with a focus-only char count and a remove button.
function TextAssetRow({
  value,
  placeholder,
  maxLength,
  autoFocus,
  onChange,
  onRemove,
}: {
  value: string;
  placeholder?: string;
  maxLength: number;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    // Extra top padding reserves room for the focus-only char counter that
    // sits above the field's top-right — so the input width never changes.
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0 6px' }}>
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        {focused && (
          <span
            style={{
              position: 'absolute',
              top: -15,
              right: 2,
              fontSize: 11,
              color: 'var(--dark-40)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value.length}/{maxLength}
          </span>
        )}
        <TextField
          size="md"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          fullWidth
        />
      </div>
      <IconButton variant="ghost" size="sm" icon={Trash2} aria-label="Remove" onPress={onRemove} />
    </div>
  );
}

// Shared by Headlines and Descriptions — both are just a flat list of short
// text assets with a min/max count and a per-item character limit. "Add"
// appends an empty row to type directly into, rather than a separate
// chip-style commit step.
interface TextAssetListModalProps {
  close: () => void;
  titleId: string;
  testId: string;
  title: string;
  helperText: string;
  minMessage: string;
  savedMessage: string;
  addLabel: string;
  addPlaceholder: string;
  items: string[];
  min: number;
  max: number;
  maxLen: number;
  onSave?: (items: string[]) => void;
}

function TextAssetListModal({
  close,
  titleId,
  testId,
  title,
  helperText,
  minMessage,
  savedMessage,
  addLabel,
  addPlaceholder,
  items: initialItems,
  min,
  max,
  maxLen,
  onSave,
}: TextAssetListModalProps) {
  const { showToast } = useToast();
  const [items, setItems] = useState<string[]>(initialItems);

  // "Add" appends an empty row and lets the user type directly into it —
  // no separate chip-style commit step. Duplicate/empty cleanup happens
  // once, at Save (see handleSave below), not per-keystroke.
  const handleAddEmpty = () => setItems((prev) => [...prev, '']);
  const handleChange = (index: number, text: string) =>
    setItems((prev) => prev.map((t, i) => (i === index ? text : t)));
  const handleRemove = (index: number) => {
    const removed = items[index];
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (removed.trim()) showToast({ message: `Removed "${removed}"` });
  };

  const handleSave = () => {
    // Typing can produce a duplicate or an empty row; blocking mid-keystroke
    // would make typing feel broken, so trim/dedupe here instead, right
    // before this list reaches the dashboard's key={item}-keyed rendering.
    const trimmed = items.map((t) => t.trim()).filter(Boolean);
    const deduped = trimmed.filter(
      (t, i) => trimmed.findIndex((u) => u.toLowerCase() === t.toLowerCase()) === i,
    );
    if (deduped.length < min) {
      showToast({ message: minMessage });
      return;
    }
    onSave?.(deduped);
    showToast({ message: savedMessage });
    close();
  };

  return (
    <Modal.Root size="md" aria-labelledby={titleId} data-testid={testId}>
      <Modal.Header title={title} id={titleId} onClose={close} />
      <Modal.Content>
        <p style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5, margin: '0 0 16px' }}>{helperText}</p>
        <div>
          {items.map((text, i) => (
            <TextAssetRow
              key={i}
              value={text}
              placeholder={addPlaceholder}
              maxLength={maxLen}
              autoFocus={i === items.length - 1 && text === ''}
              onChange={(t) => handleChange(i, t)}
              onRemove={() => handleRemove(i)}
            />
          ))}
        </div>
        {items.length < max && (
          <div style={{ paddingTop: 8 }}>
            <Button variant="secondary" size="sm" frontIcon={Plus} onPress={handleAddEmpty}>
              {addLabel}
            </Button>
          </div>
        )}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={handleSave}>
            Save changes
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

interface HeadlinesPrepModalProps {
  headlines?: string[];
  onSave?: (headlines: string[]) => void;
}

function HeadlinesPrepModal({ close, headlines, onSave }: StackModalProps & HeadlinesPrepModalProps) {
  return (
    <TextAssetListModal
      close={close}
      titleId="headlines-prep-title"
      testId="paid-search-headlines-modal"
      title="Headlines"
      helperText={`Google mixes and tests these in combination — pick ${MIN_HEADLINES} to ${MAX_HEADLINES}.`}
      minMessage={`Add at least ${MIN_HEADLINES} headlines before saving`}
      savedMessage="Headline changes saved"
      addLabel="Add headline"
      addPlaceholder="New headline…"
      items={headlines ?? HEADLINES}
      min={MIN_HEADLINES}
      max={MAX_HEADLINES}
      maxLen={HEADLINE_MAX_LEN}
      onSave={onSave}
    />
  );
}

interface DescriptionsPrepModalProps {
  descriptions?: string[];
  onSave?: (descriptions: string[]) => void;
}

function DescriptionsPrepModal({ close, descriptions, onSave }: StackModalProps & DescriptionsPrepModalProps) {
  return (
    <TextAssetListModal
      close={close}
      titleId="descriptions-prep-title"
      testId="paid-search-descriptions-modal"
      title="Descriptions"
      helperText={`Appear below your headlines — pick ${MIN_DESCRIPTIONS} to ${MAX_DESCRIPTIONS}.`}
      minMessage={`Add at least ${MIN_DESCRIPTIONS} descriptions before saving`}
      savedMessage="Description changes saved"
      addLabel="Add description"
      addPlaceholder="New description…"
      items={descriptions ?? DESCRIPTIONS}
      min={MIN_DESCRIPTIONS}
      max={MAX_DESCRIPTIONS}
      maxLen={DESCRIPTION_MAX_LEN}
      onSave={onSave}
    />
  );
}

// Sitelink row — a single divided row within the Sitelinks table-list. View
// mode shows the committed values; edit mode is its own local draft
// (headline/url/description/description2) that only reaches the dashboard's
// `sitelinks` state on Save.
function SitelinkCardRow({
  sitelink,
  isEditing,
  isLast = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  sitelink: Sitelink;
  isEditing: boolean;
  isLast?: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updated: Sitelink) => void;
  onDelete: () => void;
}) {
  const [headline, setHeadline] = useState(sitelink.headline);
  const [url, setUrl] = useState(sitelink.url);
  const [description, setDescription] = useState(sitelink.description);
  const [description2, setDescription2] = useState(sitelink.description2);

  // Re-seed the draft from the current prop every time this row enters edit
  // mode. Rows are keyed by index in the Sitelinks section, so deleting an
  // earlier sitelink shifts this row's `sitelink` prop without remounting
  // the component — without this, the draft would still hold whatever the
  // previous occupant of this index last had mounted with.
  useEffect(() => {
    if (!isEditing) return;
    setHeadline(sitelink.headline);
    setUrl(sitelink.url);
    setDescription(sitelink.description);
    setDescription2(sitelink.description2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const labelStyle: React.CSSProperties = { fontSize: 12, color: 'var(--dark-60)', marginBottom: 4, display: 'block' };

  if (isEditing) {
    const handleCancel = () => {
      setHeadline(sitelink.headline);
      setUrl(sitelink.url);
      setDescription(sitelink.description);
      setDescription2(sitelink.description2);
      onCancelEdit();
    };
    // Both description lines are required, matching apps/blaze's real
    // GoogleAdsCampaignWizard/Copy/SitelinkCard.tsx save validation.
    const canSave = headline.trim() && url.trim() && description.trim() && description2.trim();
    return (
      <div style={{ padding: '14px 16px', borderBottom: isLast ? 'none' : '1px solid var(--dark-8)', background: 'var(--dark-2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <label>
            <span style={labelStyle}>Sitelink text</span>
            <TextField size="sm" value={headline} maxLength={SITELINK_HEADLINE_MAX_LEN} onChange={setHeadline} fullWidth />
          </label>
          <label>
            <span style={labelStyle}>URL</span>
            <TextField size="sm" value={url} onChange={setUrl} fullWidth />
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <label>
            <span style={labelStyle}>Description line 1</span>
            <TextField size="sm" value={description} maxLength={SITELINK_DESC_MAX_LEN} onChange={setDescription} fullWidth />
          </label>
          <label>
            <span style={labelStyle}>Description line 2</span>
            <TextField size="sm" value={description2} maxLength={SITELINK_DESC_MAX_LEN} onChange={setDescription2} fullWidth />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" size="sm" onPress={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isDisabled={!canSave}
            onPress={() => onSave({ headline: headline.trim(), url: url.trim(), description: description.trim(), description2: description2.trim() })}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 16px', borderBottom: isLast ? 'none' : '1px solid var(--dark-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, letterSpacing: '0.28px', fontWeight: 500, color: 'var(--blue-70)' }}>{sitelink.headline}</span>
            <span style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-60)' }}>{sitelink.url}</span>
          </div>
          <div style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-60)', marginTop: 2 }}>
            {sitelink.description}
            {sitelink.description2 ? ` · ${sitelink.description2}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <IconButton variant="ghost" size="sm" icon={Edit1} aria-label="Edit sitelink" onPress={onStartEdit} />
          <IconButton variant="ghost" size="sm" icon={Trash2} aria-label="Delete sitelink" onPress={onDelete} />
        </div>
      </div>
    </div>
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
      <Heading level={1} style={{ margin: 0, fontSize: 16, fontWeight: 500, letterSpacing: 'normal' }}>
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
    </>
  ) : (
    <>
      {activeSubTab === 'campaigns' && (
        <Button variant="secondary" size="md" frontIcon={Plus} onPress={handleOpenWizard}>
          New campaign
        </Button>
      )}
    </>
  );

  const topbarCenter = isDetail ? undefined : (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {(
        [
          { key: 'campaigns', label: 'Campaigns' },
          { key: 'insights', label: 'Insights' },
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
      {activeSubTab === 'insights' && <PaidSearchInsightsView />}

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
