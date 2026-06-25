/**
 * AI-prefilled Creative-review content for the V2 cold-state "Creative review"
 * flow. Hardcoded for the single CertaPro demo account and leaned paid-first:
 * the storyboard leads with Meta Ads + Search Ads, and the SEO/keyword plan
 * targets high-intent local painting searches.
 */

export type AssetType =
  | 'Meta Ad'
  | 'Search Ad'
  | 'Still Image'
  | 'Video'
  | 'Carousel'
  | 'Story'
  | 'Blog Post'
  | 'Email';

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  topic: string;
  caption: string;
  overlay: string;
}

// Paid formats first — the V2 emphasis.
export const ASSET_ORDER: AssetType[] = ['Meta Ad', 'Search Ad', 'Still Image', 'Video', 'Carousel', 'Story', 'Blog Post', 'Email'];

const IDEAS = ['before/after', 'cabinet refinish', 'free consult offer', 'crew at work', 'customer review', 'color reveal', '5-star proof', 'one-day exterior'];
const OVERLAYS = ['Free color consult', 'Book this week', '2,000+ Austin homes', 'Before → After', '4.7★ rated'];

export function generatedAssets(theme: string): GeneratedAsset[] {
  const out: GeneratedAsset[] = [];
  for (const type of ASSET_ORDER) {
    for (let i = 1; i <= 3; i++) {
      out.push({
        id: `${type.replace(/\s/g, '-').toLowerCase()}-${i}`,
        type,
        topic: `${theme}: ${type} — ${IDEAS[(i - 1) % IDEAS.length]}`,
        caption:
          'Austin trusts CertaPro to get it painted right the first time. Free color consult this week — see the difference a job-site-certified crew makes.',
        overlay: OVERLAYS[(i - 1) % OVERLAYS.length],
      });
    }
  }
  return out;
}

// ─── SEO / keyword plan (high-intent local painting terms) ──────────────────

export interface SeoKeyword {
  keyword: string;
  intent: 'Informational' | 'Commercial' | 'Local';
  volume: string;
  difficulty: 'Low' | 'Medium' | 'High';
  why: string;
}

export const SEO_KEYWORDS: SeoKeyword[] = [
  { keyword: 'painters austin', intent: 'Local', volume: '2.9k/mo', difficulty: 'High', why: 'Core local term with clear buying intent. Pair Local Services Ads + Search to own the top.' },
  { keyword: 'cabinet painting austin', intent: 'Commercial', volume: '880/mo', difficulty: 'Medium', why: 'High-ticket, high-margin service with rising demand. Strong paid-search + landing-page play.' },
  { keyword: 'house painters near me', intent: 'Local', volume: '4.4k/mo', difficulty: 'High', why: 'Highest-volume local search. Competitive, but the biggest demand pool for paid.' },
  { keyword: 'exterior painting cost austin', intent: 'Informational', volume: '1.3k/mo', difficulty: 'Low', why: 'Top research question. A pricing-explainer page captures leads early and feeds retargeting.' },
  { keyword: 'best painters austin', intent: 'Commercial', volume: '590/mo', difficulty: 'Low', why: 'Comparison intent + low difficulty. A "best of" page ranks fast and converts.' },
  { keyword: 'certapro austin', intent: 'Local', volume: '210/mo', difficulty: 'Low', why: 'Branded — defend it on Search so competitors can\'t intercept your ready-to-buy clicks.' },
];

// ─── Synthesized creative preferences ───────────────────────────────────────

export const CREATIVE_PREFS: { learned: string[]; avoid: string[] } = {
  learned: [
    'Lead paid creative with real before/after photos over stock imagery.',
    'Open every ad with the offer ("free color consult") and one clear next step.',
    'Always name Austin and lean on the 4.7★ review base for trust.',
    'Cabinet refinishing content over-indexes — give it its own ad set.',
  ],
  avoid: [
    'Corporate or hype-y language ("best-in-class", "premium solutions").',
    'Busy graphics with more than one message — kills paid-social performance.',
  ],
};

// ─── Campaign calendar (weekly schedule defaults + 2-month themes) ──────────

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const CONTENT_TYPES = ['Meta Ad', 'Search Ad', 'Still Image', 'Video', 'Carousel', 'Story', 'Blog Post', 'Email'] as const;
export const CHANNELS = ['Meta Ads', 'Instagram', 'Facebook', 'Google', 'TikTok', 'Email'] as const;
export const DEFAULT_CHANNEL: Record<string, string> = {
  'Meta Ad': 'Meta Ads',
  'Search Ad': 'Google',
  'Still Image': 'Instagram',
  Video: 'Instagram',
  Carousel: 'Instagram',
  Story: 'Instagram',
  'Blog Post': 'Google',
  Email: 'Email',
};

export interface WeekTheme {
  week: string;
  title: string;
  description: string;
  season: string;
}

export function seasonalThemes(): WeekTheme[] {
  return [
    { week: 'Jun 8', title: 'Cabinet Season launch', description: 'Kick off the flagship paid push — before/after Meta lead ads + Search on "cabinet painting austin". Heaviest spend week.', season: 'Summer' },
    { week: 'Jun 15', title: 'Before & after spotlight', description: 'Strongest proof creative of the month. Carousel + reel, retarget engaged viewers from week one.', season: 'Summer' },
    { week: 'Jun 22', title: 'Free color consult offer', description: 'Always-on lead-gen offer across Meta + Search. The concierge hook that converts high-intent searchers.', season: 'Summer' },
    { week: 'Jun 29', title: 'July 4th promo window', description: 'Holiday-timed limited offer with urgency. Layer Local Services Ads for top-of-map coverage.', season: 'Holiday' },
  ];
}
