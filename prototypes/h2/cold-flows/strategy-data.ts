import type { ScoreStatus } from './cold-flow-shell';

/**
 * AI-prefilled Strategy content for the V2 cold-state "Strategy onboarding"
 * flow. H2 runs a single fixed demo account (CertaPro Painters of Austin), so
 * unlike blaze-dfy's per-account generators this is hardcoded — and leaned
 * paid-first (Paid Social + Paid Search) per the V2 direction.
 *
 * Everything here is a starting point the AM/owner edits in the flow.
 */

export const ACCOUNT = {
  name: 'CertaPro Painters of Austin',
  shortName: 'CertaPro Austin',
  city: 'Austin',
  domain: 'certapro.com/austin',
  founder: 'John Bunnell',
};

// ─── Brand context (editable markdown per field) ────────────────────────────

export const BRAND_CONTEXT: { overview: string; segments: string; services: string; bio: string } = {
  overview:
    'CertaPro Painters of Austin is a locally-owned residential and commercial painting contractor serving the greater Austin metro, backed by the national CertaPro network. The work and reputation are strong — the gap is demand generation. Today the pipeline rides on referrals and yard signs; there is almost no paid acquisition, so growth is capped by word of mouth.',
  segments:
    '- **Homeowners, 35–65** — researching painters for an interior/exterior project; high-intent, searching "painters near me" and scrolling Meta.\n- **Property managers & HOAs** — recurring commercial repaint work; reachable via paid search on commercial terms.\n- **Past customers & referrals** — highest-converting, lowest-cost; ripe for retargeting and email.',
  services:
    '- **Interior & exterior repainting** — the core, highest-margin offering.\n- **Cabinet refinishing** — fast-growing, high-ticket; strong paid-social creative subject.\n- **Commercial & HOA repaint** — recurring contracts; paid-search demand.\n- **Color consultation** — the concierge hook that differentiates the brand.',
  bio:
    'John Bunnell owns and runs CertaPro Painters of Austin. After a decade in the trade he built the franchise around a job-site-certified process and concierge service — color consult, prep, paint, cleanup, all handled. He wants a predictable lead engine so growth no longer depends on whoever happened to drive past a yard sign.',
};

// ─── Creative guidelines ────────────────────────────────────────────────────

export interface BrandColor {
  hex: string;
  name: string;
}
export interface BrandFont {
  family: string;
  role: 'Display' | 'Heading' | 'Body';
}

export const TAGLINES = [
  "Austin's most-referred painters.",
  'Painted right, the first time.',
  'Your home, handled end-to-end.',
];

export const TONE_SUMMARY =
  "Warm, confident, and local. Speak like a trusted neighbor who happens to run the best crew in town — never corporate, never hype. Lead with proof (photos, reviews, years in Austin) over adjectives. In paid ads, open with the offer and a clear next step.";

export const TONE_DOS = [
  '"We\'ll be there Tuesday at 8 — and we\'ll text when we\'re 20 minutes out."',
  '"2,000+ Austin homes painted. Free color consult this week."',
  'Lead paid creative with a before/after and a one-line offer.',
];
export const TONE_DONTS = [
  '"Leveraging best-in-class coating solutions for optimal outcomes."',
  '"Industry-leading quality you can trust!"',
  'Busy graphics with more than one message.',
];

export const BRAND_COLORS: BrandColor[] = [
  { hex: '#15326B', name: 'CertaPro Navy' },
  { hex: '#E4002B', name: 'Signal Red' },
  { hex: '#1E3A8A', name: 'Trust Blue' },
  { hex: '#F4F4F2', name: 'Drop Cloth' },
];

export const BRAND_FONTS: BrandFont[] = [
  { family: 'Montserrat', role: 'Display' },
  { family: 'Inter', role: 'Body' },
];

// ─── Swipe file (paid-first competitor benchmarks) ──────────────────────────

export interface SwipeItem {
  id: string;
  source: string;
  channel: string;
  headline: string;
  note: string;
  /** CSS aspect-ratio for the preview, matched to the format it represents
   *  (e.g. '9 / 16' for a reel, '16 / 9' for a YouTube ad). */
  aspect: string;
  /** 'search' renders a Google text-ad mock instead of an image preview. */
  kind?: 'image' | 'search';
  /** Copy for the search-ad mock (only used when kind === 'search'). */
  searchAd?: { url: string; title: string; desc: string };
}

export const SWIPE_FILE: SwipeItem[] = [
  {
    id: 'sw1',
    source: 'Austin Pro Painters',
    channel: 'Meta Ad',
    headline: '"Free color consult this week" lead ad',
    note: 'Always-on lead form. Strong offer + urgency, before/after hero. The bar to beat on paid social.',
    aspect: '1 / 1',
  },
  {
    id: 'sw2',
    source: 'Lone Star Painting Co.',
    channel: 'Google Search Ad',
    headline: 'Bidding on "painters near me Austin"',
    note: 'Sitelinks to interior/exterior/commercial + call extension. Owns the high-intent search you\'re absent from.',
    aspect: 'auto',
    kind: 'search',
    searchAd: {
      url: 'lonestarpainting.com/austin',
      title: 'Austin Painters — Free Estimate Today',
      desc: 'Interior, exterior & cabinet pros. 1,500+ local jobs. Book a free on-site quote this week.',
    },
  },
  {
    id: 'sw3',
    source: 'Hill Country Finishes',
    channel: 'TikTok / Reels',
    headline: 'Cabinet refinish time-lapse',
    note: 'High-reach short video, unpolished. Cabinet content over-indexes — worth testing as paid social creative.',
    aspect: '9 / 16',
  },
  {
    id: 'sw4',
    source: 'Austin Pro Painters',
    channel: 'Landing Page',
    headline: 'Hero: "Get your free estimate" + review stars',
    note: 'Single CTA above the fold, 4-field form. This is where their paid traffic converts.',
    aspect: '16 / 10',
  },
  {
    id: 'sw5',
    source: 'Sherwin-Williams',
    channel: 'Instagram',
    headline: 'Before/after carousel — color of the month',
    note: 'Clean portrait carousel with a bold swipe-through reveal. Strong organic, easily boosted.',
    aspect: '4 / 5',
  },
  {
    id: 'sw6',
    source: 'Five Star Painting',
    channel: 'YouTube Ad',
    headline: '15s pre-roll — "Why Austin trusts us"',
    note: 'Skippable in-stream with a hook in the first 5 seconds. Cheap reach for brand awareness.',
    aspect: '16 / 9',
  },
  {
    id: 'sw7',
    source: 'WOW 1 Day Painting',
    channel: 'Display Ad',
    headline: 'Retargeting banner — "Still thinking it over?"',
    note: 'Classic GDN retargeting banner. Keeps the brand in front after a site visit.',
    aspect: '1.91 / 1',
  },
];

// ─── Competitive audit / scorecard (paid-first weighting) ───────────────────

export interface ScoreCheck {
  status: ScoreStatus;
  title: string;
  pts: string;
  desc: string;
}
export interface ScorecardArea {
  number: number;
  eyebrow: string;
  title: string;
  platforms: string[];
  score: number;
  maxScore: number;
  status: ScoreStatus;
  checks: ScoreCheck[];
}

const AREAS: ScorecardArea[] = [
  {
    number: 1,
    eyebrow: 'Paid Search',
    title: 'You are invisible on the searches that convert',
    platforms: ['Google', 'Bing'],
    score: 3,
    maxScore: 25,
    status: 'bad',
    checks: [
      { status: 'bad', title: 'Active Google Search ads', pts: '0 / 8 pts', desc: 'None detected. Competitors bid on "painters near me Austin" and "cabinet painting Austin" right now.' },
      { status: 'bad', title: 'Branded keyword defense', pts: '0 / 5 pts', desc: 'A competitor may be bidding on "CertaPro Austin" — siphoning your ready-to-buy clicks.' },
      { status: 'bad', title: 'Local service ads', pts: '0 / 5 pts', desc: 'No Google Local Services / "Guaranteed" presence — the top of the map for service searches.' },
      { status: 'warn', title: 'Conversion tracking', pts: '3 / 7 pts', desc: 'Analytics installed but no conversion events — you can\'t measure paid ROI yet.' },
    ],
  },
  {
    number: 2,
    eyebrow: 'Paid Social',
    title: "No always-on demand engine on Meta",
    platforms: ['Meta', 'TikTok'],
    score: 5,
    maxScore: 25,
    status: 'bad',
    checks: [
      { status: 'bad', title: 'Active Meta campaigns', pts: '0 / 7 pts', desc: 'Zero campaigns in the last 90 days. Competitors run always-on before/after lead ads.' },
      { status: 'bad', title: 'Lead capture', pts: '1 / 6 pts', desc: 'No instant-form or retargeting. Engaged viewers leave without a way to convert.' },
      { status: 'warn', title: 'Creative library', pts: '2 / 6 pts', desc: 'A handful of photos, no video. Before/after + cabinet time-lapses get 3× the reach.' },
      { status: 'warn', title: 'Audience setup', pts: '2 / 6 pts', desc: 'No custom or lookalike audiences from past customers — the cheapest paid wins.' },
    ],
  },
  {
    number: 3,
    eyebrow: 'Presence & Awareness',
    title: 'Hard to find where buyers already look',
    platforms: ['IG', 'FB', 'Google'],
    score: 9,
    maxScore: 25,
    status: 'bad',
    checks: [
      { status: 'bad', title: 'Social posting cadence', pts: '1 / 6 pts', desc: 'Last post 30+ days ago. Healthy Austin home-service accounts post 8–12×/month.' },
      { status: 'warn', title: 'Google Business Profile', pts: '3 / 7 pts', desc: 'Incomplete profile, few photos — hurts the local map ranking paid search leans on.' },
      { status: 'warn', title: 'Content variety', pts: '3 / 6 pts', desc: 'Mostly static photos. Before/after carousels + short video drive the reach.' },
      { status: 'bad', title: 'Branded search', pts: '2 / 6 pts', desc: `Directory sites outrank ${ACCOUNT.domain} for your own name.` },
    ],
  },
  {
    number: 4,
    eyebrow: 'Conversion & Reputation',
    title: 'Turn the clicks and reviews you already earn',
    platforms: ['Website', 'Google', 'Yelp'],
    score: 17,
    maxScore: 25,
    status: 'warn',
    checks: [
      { status: 'warn', title: 'Landing page for paid', pts: '2 / 6 pts', desc: 'Paid traffic would hit the homepage, not a focused estimate page — 30–60% conversion left on the table.' },
      { status: 'bad', title: 'Mobile page speed', pts: '1 / 5 pts', desc: 'Slow LCP on mobile; ~30% of paid clicks bounce before the page loads.' },
      { status: 'good', title: 'Average rating', pts: '6 / 6 pts', desc: '4.7★ across platforms — the trust foundation paid creative can lean on.' },
      { status: 'warn', title: 'Review velocity', pts: '8 / 8 pts', desc: 'Steady reviews, but no post-job ask flow to compound the advantage.' },
    ],
  },
];

export function scorecard() {
  const overall = AREAS.reduce((s, a) => s + a.score, 0);
  const overallMax = AREAS.reduce((s, a) => s + a.maxScore, 0);
  const reviewed = AREAS.reduce((s, a) => s + a.checks.length, 0);
  const needWork = AREAS.reduce((s, a) => s + a.checks.filter((c) => c.status !== 'good').length, 0);
  return { areas: AREAS, overall, overallMax, reviewed, needWork };
}

// ─── Goals & first campaign theme ───────────────────────────────────────────

export interface Goals {
  thirty: string;
  sixty: string;
  ninety: string;
  channels: string[];
  drivingGrowth: string;
  worked: string;
  notWorked: string;
}

export const GOALS: Goals = {
  thirty: 'Launch always-on Paid Search on high-intent Austin terms and a Meta lead-gen campaign. Stand up a dedicated estimate landing page with conversion tracking.',
  sixty: 'Double inbound estimate requests vs. baseline. Add retargeting + a past-customer lookalike on Meta. Cut cost-per-lead with negative keywords and creative iteration.',
  ninety: 'Predictable pipeline: 25+ qualified estimate requests/month from paid channels, cost-per-lead trending down, and a tested creative library feeding both Search and Social.',
  channels: ['Paid Search', 'Paid Social (Meta)', 'Local Services Ads', 'Email'],
  drivingGrowth: 'Referrals and yard signs drive most revenue today; almost nothing comes from paid or organic search yet.',
  worked: 'Word of mouth, truck/job-site visibility, and a 4.7★ review base that builds instant trust.',
  notWorked: 'Boosted posts with no targeting, a homepage that doesn\'t convert paid traffic, and inconsistent lead follow-up.',
};

export const PLAN_CHANNELS = ['Paid Search', 'Paid Social', 'Local Services Ads', 'Local SEO', 'Reputation', 'Email', 'Landing Pages', 'Retargeting'];
export const DEFAULT_PLAN = ['Paid Search', 'Paid Social', 'Local Services Ads', 'Email'];

export interface MajorEvent {
  label: string;
  when: string;
  tag: 'Company' | 'Industry';
}
export const MAJOR_EVENTS: MajorEvent[] = [
  { label: 'Spring exterior season — peak demand', when: '2026-03', tag: 'Industry' },
  { label: 'Summer interior + cabinet push', when: '2026-06', tag: 'Industry' },
  { label: 'Fall booking promo window', when: '2026-09', tag: 'Company' },
  { label: 'Year-end commercial repaint budgets', when: '2026-11', tag: 'Industry' },
];

export interface CampaignTheme {
  id: string;
  title: string;
  angle: string;
  recommended?: boolean;
}
export const CAMPAIGN_THEMES: CampaignTheme[] = [
  { id: 'cabinet-season', title: 'Cabinet Season', angle: 'High-ticket cabinet refinishing, sold on before/after paid social + retargeting. Strongest margin, strongest creative.', recommended: true },
  { id: 'free-consult', title: 'Free Color Consult', angle: 'Always-on Meta + Search lead-gen offer — the concierge hook that converts high-intent searchers.' },
  { id: 'exterior-spring', title: 'Spring Exterior Refresh', angle: 'Seasonal exterior demand captured with Local Services Ads and search.' },
];
