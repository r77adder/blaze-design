/**
 * Static data for the Business Scorecard tab on /h2/tools.
 *
 * The workspace is "CertaPro Painters of Austin" (residential + commercial
 * painting contractor), so competitors are real Austin-area painters rather
 * than the BBQ shops in the source mockup. Scores are tuned so CertaPro is
 * behind on paid/social and ahead on reputation/website — leaves room for
 * the page to feel like a story.
 */

export type CompetitorId = 'radiant' | 'pure' | 'calm' | 'wellspring' | 'vital';

export interface Competitor {
  id: CompetitorId;
  name: string;
  /** Single-letter avatar fallback. */
  initial: string;
  /** Avatar tint. */
  color: string;
  /** True for the workspace itself (highlighted row). */
  self?: boolean;
}

// NOTE: IDs are kept as the original keys ('pure', 'calm', 'wellspring',
// 'vital', 'radiant') so the rest of the file's records keep typing — the
// labels are what matter to the UI.
export const COMPETITORS: Competitor[] = [
  { id: 'pure', name: 'Five Star Painting of South Austin', initial: 'F', color: '#7c5cfc' },
  { id: 'calm', name: 'Paper Moon Painting', initial: 'P', color: '#0179cf' },
  { id: 'wellspring', name: 'WOW 1 DAY PAINTING Austin', initial: 'W', color: '#04af00' },
  { id: 'vital', name: 'Austin Custom Painting', initial: 'A', color: '#e65cac' },
  { id: 'radiant', name: 'CertaPro Painters of Austin', initial: 'C', color: '#fcb728', self: true },
];

export type Platform = 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'x' | 'youtube';

export const SOCIAL_PLATFORMS: Platform[] = ['instagram', 'facebook', 'linkedin', 'tiktok', 'x', 'youtube'];

/** Overall score for the page header. */
export const OVERALL_SCORE = 50;
export const OVERALL_DELTA = 12;
/** Display string for "since you started Blaze". Today is ~May 2026. */
export const BLAZE_START_LABEL = 'since Mar 15';

export const SECTION_META = {
  social: { score: 20, delta: 8 },
  paidSocial: { score: 28, delta: 14 },
  paidSearch: { score: 35, delta: 9 },
  seo: { score: 71, delta: 22 },
  aeo: { score: 52, delta: 18 },
  website: { score: 65, delta: 15 },
  reputation: { score: 82, delta: 4 },
} as const;

// ── Section 1: Social Media Presence ───────────────────────────────────────

/** Map of which platforms each competitor is active on. */
export const SOCIAL_PRESENCE: Record<CompetitorId, Record<Platform, boolean>> = {
  pure:       { instagram: true,  facebook: true,  linkedin: true,  tiktok: true,  x: false, youtube: true  },
  calm:       { instagram: true,  facebook: true,  linkedin: false, tiktok: false, x: false, youtube: false },
  wellspring: { instagram: true,  facebook: true,  linkedin: false, tiktok: true,  x: false, youtube: true  },
  vital:      { instagram: true,  facebook: true,  linkedin: true,  tiktok: false, x: false, youtube: false },
  radiant:    { instagram: true,  facebook: true,  linkedin: true,  tiktok: false, x: false, youtube: false },
};

export interface PlatformMetrics {
  /** Headline summary for this platform's sub-card cluster. */
  headline: string;
  /** Index aligned with COMPETITORS order (pure, calm, wellspring, vital, radiant). */
  postsPerWeek: number[];
  followersK: number[];
  engagementPct: number[];
  impressionsK: number[];
  averages: {
    postsPerWeek: number;
    followersK: number;
    engagementPct: number;
    impressionsK: number;
  };
  /** Deltas for the workspace (CertaPro Austin) on this platform, since starting Blaze. */
  selfDeltas: {
    postsPerWeek: number;
    followersK: number;
    engagementPct: number;
    impressionsK: number;
  };
}

export const PLATFORM_METRICS: Record<Platform, PlatformMetrics> = {
  instagram: {
    headline: "Your Instagram presence has room to grow — homeowners shop before-and-afters here.",
    postsPerWeek:  [4, 2, 5, 2, 1],
    followersK:    [12.4, 6.8, 18.2, 4.1, 2.6],
    engagementPct: [1.42, 0.88, 2.15, 0.62, 0.34],
    impressionsK:  [38, 22, 64, 14, 6],
    averages: { postsPerWeek: 3, followersK: 8.8, engagementPct: 1.08, impressionsK: 29 },
    selfDeltas: { postsPerWeek: 1, followersK: 0.4, engagementPct: 0.08, impressionsK: 2 },
  },
  facebook: {
    headline: "Facebook is still where Austin neighborhood groups vet contractors — competitors are ahead.",
    postsPerWeek:  [3, 4, 2, 2, 2],
    followersK:    [9.6, 14.2, 7.1, 3.8, 5.4],
    engagementPct: [0.74, 0.92, 0.41, 0.28, 0.36],
    impressionsK:  [22, 31, 16, 9, 12],
    averages: { postsPerWeek: 3, followersK: 8.0, engagementPct: 0.54, impressionsK: 18 },
    selfDeltas: { postsPerWeek: 1, followersK: 0.3, engagementPct: 0.06, impressionsK: 3 },
  },
  linkedin: {
    headline: "LinkedIn matters for HOA boards and facilities directors — your presence is light.",
    postsPerWeek:  [1, 0, 0, 2, 1],
    followersK:    [1.2, 0, 0, 2.4, 0.9],
    engagementPct: [0.9, 0, 0, 1.4, 0.5],
    impressionsK:  [3, 0, 0, 8, 2],
    averages: { postsPerWeek: 1, followersK: 0.9, engagementPct: 0.56, impressionsK: 3 },
    selfDeltas: { postsPerWeek: 0, followersK: 0.1, engagementPct: 0, impressionsK: 0 },
  },
  tiktok: {
    headline: "Time-lapse paint videos crush on TikTok — and you're not posting yet.",
    postsPerWeek:  [3, 0, 6, 0, 0],
    followersK:    [8.4, 0, 24.1, 0, 0],
    engagementPct: [3.1, 0, 4.6, 0, 0],
    impressionsK:  [62, 0, 140, 0, 0],
    averages: { postsPerWeek: 2, followersK: 6.5, engagementPct: 1.54, impressionsK: 40 },
    selfDeltas: { postsPerWeek: 0, followersK: 0, engagementPct: 0, impressionsK: 0 },
  },
  x: {
    headline: "X is low-volume for painting contractors — neither you nor competitors are posting.",
    postsPerWeek:  [0, 0, 0, 0, 0],
    followersK:    [0.3, 0, 0, 0, 0],
    engagementPct: [0.1, 0, 0, 0, 0],
    impressionsK:  [0, 0, 0, 0, 0],
    averages: { postsPerWeek: 0, followersK: 0.06, engagementPct: 0.02, impressionsK: 0 },
    selfDeltas: { postsPerWeek: 0, followersK: 0, engagementPct: 0, impressionsK: 0 },
  },
  youtube: {
    headline: "YouTube how-to videos help competitors win 'how much does it cost to paint' queries.",
    postsPerWeek:  [1, 0, 2, 0, 0],
    followersK:    [3.4, 0, 6.8, 0, 0],
    engagementPct: [2.4, 0, 3.1, 0, 0],
    impressionsK:  [14, 0, 28, 0, 0],
    averages: { postsPerWeek: 1, followersK: 2.0, engagementPct: 1.1, impressionsK: 8 },
    selfDeltas: { postsPerWeek: 0, followersK: 0, engagementPct: 0, impressionsK: 0 },
  },
};

// ── Section 2: Paid Social ──────────────────────────────────────────────────

/** Ad counts per platform per competitor. null = not running on that
 *  platform (rendered as "—"). */
export const PAID_SOCIAL_ADS: Record<CompetitorId, Record<Platform, number | null>> = {
  pure:       { instagram: 16, facebook: 14, linkedin: null, tiktok: 4,    x: null, youtube: 2    },
  calm:       { instagram: 6,  facebook: 8,  linkedin: null, tiktok: null, x: null, youtube: null },
  wellspring: { instagram: 22, facebook: 18, linkedin: null, tiktok: 9,    x: null, youtube: 3    },
  vital:      { instagram: 5,  facebook: 7,  linkedin: 1,    tiktok: null, x: null, youtube: null },
  radiant:    { instagram: null, facebook: null, linkedin: null, tiktok: null, x: null, youtube: null },
};

// ── Section 3: Paid Search ─────────────────────────────────────────────────

/** Active Google Ads per competitor. */
export const PAID_SEARCH_ADS: Record<CompetitorId, number> = {
  pure: 12,
  calm: 4,
  wellspring: 18,
  vital: 6,
  radiant: 3,
};

// ── Section 4: Google Visibility (SEO) ─────────────────────────────────────

export interface SeoQuery {
  query: string;
  topName: string;
  /** Ranking, or null if not ranked. */
  organic: number | null;
  /** Map pack rank, or null if not on map. */
  map: number | null;
}

export const SEO_QUERIES: SeoQuery[] = [
  { query: 'painters Austin',              topName: 'WOW 1 DAY PAINTING Austin',         organic: 4,    map: 2 },
  { query: 'house painters Austin TX',      topName: 'Five Star Painting of South Austin', organic: 3,    map: 3 },
  { query: 'commercial painters Austin',    topName: 'CertaPro Painters of Austin',       organic: 2,    map: 1 },
  { query: 'interior painting Austin',      topName: 'Paper Moon Painting',               organic: null, map: 4 },
  { query: 'cabinet painting Austin',       topName: 'Five Star Painting of South Austin', organic: 5,    map: null },
  { query: 'HOA painters Austin',           topName: 'CertaPro Painters of Austin',       organic: 1,    map: 2 },
];

// ── Section 5: AEO (LLM visibility) ────────────────────────────────────────

export type AssistantName = 'ChatGPT' | 'Perplexity' | 'Gemini';
export const ASSISTANTS: AssistantName[] = ['ChatGPT', 'Perplexity', 'Gemini'];

export interface AeoPrompt {
  prompt: string;
  /** Whether CertaPro Austin was mentioned in each LLM's answer. */
  mentioned: Record<AssistantName, boolean>;
  /** Brand the assistant most often cites first for this prompt. */
  topMention: string;
}

export const AEO_PROMPTS: AeoPrompt[] = [
  {
    prompt: 'Who are the best house painters in Austin?',
    mentioned: { ChatGPT: true, Perplexity: false, Gemini: true },
    topMention: 'Five Star Painting of South Austin',
  },
  {
    prompt: 'Recommend a commercial painting contractor in Austin, TX',
    mentioned: { ChatGPT: true, Perplexity: true, Gemini: true },
    topMention: 'CertaPro Painters of Austin',
  },
  {
    prompt: 'Where can I get my kitchen cabinets repainted near Austin?',
    mentioned: { ChatGPT: false, Perplexity: false, Gemini: true },
    topMention: 'Paper Moon Painting',
  },
  {
    prompt: 'Painters for an HOA project in Round Rock',
    mentioned: { ChatGPT: true, Perplexity: false, Gemini: false },
    topMention: 'CertaPro Painters of Austin',
  },
  {
    prompt: 'Fastest exterior painters in the Austin area',
    mentioned: { ChatGPT: false, Perplexity: false, Gemini: false },
    topMention: 'WOW 1 DAY PAINTING Austin',
  },
];

// ── Section 6: Website Experience ──────────────────────────────────────────

export interface WebsiteCheck {
  id: string;
  label: string;
  ok: boolean;
  description: string;
}

export const WEBSITE_CONTENT: WebsiteCheck[] = [
  { id: 'booking',  label: 'On-site estimate request',  ok: true,  description: 'Estimate-request form is reachable from the hero and the footer — keeps leads on your domain.' },
  { id: 'cta',      label: 'Effective CTA above fold',  ok: true,  description: 'Your hero CTA ("Get a free estimate") is visible and action-oriented.' },
  { id: 'text',     label: 'Sufficient text content',   ok: false, description: 'Service pages average 280 words — aim for 600+ to help SEO and answer customer questions.' },
  { id: 'phone',    label: 'Visible phone number',      ok: true,  description: '(512) 323-9502 is sticky in the header on every page.' },
  { id: 'favicon',  label: 'Favicon',                   ok: true,  description: 'Your CertaPro favicon shows up cleanly in browser tabs.' },
];

export const WEBSITE_APPEARANCE: WebsiteCheck[] = [
  { id: 'mobile',   label: 'Mobile-friendly',           ok: true,  description: 'Your site renders well on phones and tablets — most estimate requests come from mobile.' },
  { id: 'speed',    label: 'Fast load time',            ok: false, description: 'First contentful paint is 3.8s — aim for under 2.5s. Hero photos are the main culprit.' },
  { id: 'imagery',  label: 'High-quality imagery',      ok: true,  description: 'Project photos are sharp, color-accurate, and on-brand.' },
  { id: 'brand',    label: 'Consistent brand colors',   ok: true,  description: 'CertaPro red + yellow palette applied across pages.' },
];

// ── Section 7: Reputation ──────────────────────────────────────────────────

export interface ReputationRow {
  competitor: CompetitorId;
  rating: number;
  reviews: number;
  responseRatePct: number;
  /** Reviews added in the last 30 days. */
  recent: number;
}

export const REPUTATION: ReputationRow[] = [
  { competitor: 'pure',       rating: 4.8, reviews: 612, responseRatePct: 82, recent: 18 },
  { competitor: 'calm',       rating: 4.7, reviews: 488, responseRatePct: 64, recent: 11 },
  { competitor: 'wellspring', rating: 4.9, reviews: 924, responseRatePct: 91, recent: 34 },
  { competitor: 'vital',      rating: 4.4, reviews: 142, responseRatePct: 38, recent:  4 },
  { competitor: 'radiant',    rating: 4.9, reviews: 786, responseRatePct: 97, recent: 22 },
];
