// Onboarding-port content, ported 1:1 from the H2 web onboarding rework
// (origin/prototype/h2-onboarding-rework: prototypes/h2/cold-flows/strategy-data.ts).
// Only the slices the SwipeStep + GoalsStep bodies consume are kept here.
//
// H2 runs a single fixed demo account (CertaPro Painters of Austin), so the
// content is hardcoded and leaned paid-first (Paid Social + Paid Search).
// Everything here is a starting point the user edits in the page.

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
      title: 'Austin Painters: Free Estimate Today',
      desc: 'Interior, exterior & cabinet pros. 1,500+ local jobs. Book a free on-site quote this week.',
    },
  },
  {
    id: 'sw3',
    source: 'Hill Country Finishes',
    channel: 'TikTok / Reels',
    headline: 'Cabinet refinish time-lapse',
    note: 'High-reach short video, unpolished. Cabinet content over-indexes. Worth testing as paid social creative.',
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
    headline: 'Before/after carousel: color of the month',
    note: 'Clean portrait carousel with a bold swipe-through reveal. Strong organic, easily boosted.',
    aspect: '4 / 5',
  },
  {
    id: 'sw6',
    source: 'Five Star Painting',
    channel: 'YouTube Ad',
    headline: '15s pre-roll: "Why Austin trusts us"',
    note: 'Skippable in-stream with a hook in the first 5 seconds. Cheap reach for brand awareness.',
    aspect: '16 / 9',
  },
  {
    id: 'sw7',
    source: 'WOW 1 Day Painting',
    channel: 'Display Ad',
    headline: 'Retargeting banner: "Still thinking it over?"',
    note: 'Classic GDN retargeting banner. Keeps the brand in front after a site visit.',
    aspect: '1.91 / 1',
  },
];

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
  thirty:
    'Launch always-on Paid Search on high-intent Austin terms and a Meta lead-gen campaign. Stand up a dedicated estimate landing page with conversion tracking.',
  sixty:
    'Double inbound estimate requests vs. baseline. Add retargeting + a past-customer lookalike on Meta. Cut cost-per-lead with negative keywords and creative iteration.',
  ninety:
    'Predictable pipeline: 25+ qualified estimate requests/month from paid channels, cost-per-lead trending down, and a tested creative library feeding both Search and Social.',
  channels: ['Paid Search', 'Paid Social (Meta)', 'Local Services Ads', 'Email'],
  drivingGrowth:
    'Referrals and yard signs drive most revenue today; almost nothing comes from paid or organic search yet.',
  worked:
    'Word of mouth, truck/job-site visibility, and a 4.7★ review base that builds instant trust.',
  notWorked:
    'Boosted posts with no targeting, a homepage that doesn\'t convert paid traffic, and inconsistent lead follow-up.',
};

export const PLAN_CHANNELS = [
  'Paid Search',
  'Paid Social',
  'Local Services Ads',
  'Local SEO',
  'Reputation',
  'Email',
  'Landing Pages',
  'Retargeting',
];
export const DEFAULT_PLAN = ['Paid Search', 'Paid Social', 'Local Services Ads', 'Email'];

export interface MajorEvent {
  label: string;
  when: string;
  tag: 'Company' | 'Industry';
}
export const MAJOR_EVENTS: MajorEvent[] = [
  { label: 'Spring exterior season: peak demand', when: '2026-03', tag: 'Industry' },
  { label: 'Summer interior + cabinet push', when: '2026-06', tag: 'Industry' },
  { label: 'Fall booking promo window', when: '2026-09', tag: 'Company' },
  { label: 'Year-end commercial repaint budgets', when: '2026-11', tag: 'Industry' },
];
