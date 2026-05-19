/**
 * Static data for the Business Scorecard tab on /h2/tools.
 *
 * The workspace is "Radiant Health" (wellness), so competitors are
 * wellness/health brands rather than the BBQ shops in the source mockup.
 * Scores are tuned so Radiant Health is behind on paid/social and ahead
 * on reputation/website — leaves room for the page to feel like a story.
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

export const COMPETITORS: Competitor[] = [
  { id: 'pure', name: 'Pure Vitality Co.', initial: 'P', color: '#7c5cfc' },
  { id: 'calm', name: 'Calm + Co', initial: 'C', color: '#0179cf' },
  { id: 'wellspring', name: 'Wellspring Health', initial: 'W', color: '#04af00' },
  { id: 'vital', name: 'Vital Bloom', initial: 'V', color: '#e65cac' },
  { id: 'radiant', name: 'Radiant Health', initial: 'R', color: '#fcb728', self: true },
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
  pure:       { instagram: true,  facebook: true,  linkedin: true,  tiktok: false, x: true,  youtube: true  },
  calm:       { instagram: true,  facebook: true,  linkedin: false, tiktok: true,  x: true,  youtube: true  },
  wellspring: { instagram: true,  facebook: true,  linkedin: true,  tiktok: true,  x: true,  youtube: true  },
  vital:      { instagram: true,  facebook: true,  linkedin: true,  tiktok: true,  x: true,  youtube: true  },
  radiant:    { instagram: true,  facebook: true,  linkedin: false, tiktok: false, x: false, youtube: false },
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
  /** Deltas for the workspace (Radiant Health) on this platform, since starting Blaze. */
  selfDeltas: {
    postsPerWeek: number;
    followersK: number;
    engagementPct: number;
    impressionsK: number;
  };
}

export const PLATFORM_METRICS: Record<Platform, PlatformMetrics> = {
  instagram: {
    headline: "Your Instagram presence has room to grow — here's where to focus.",
    postsPerWeek:  [5, 3, 2, 1, 0],
    followersK:    [334, 125, 43, 36, 32],
    engagementPct: [1.25, 0.07, 0.03, 0.01, 0.0],
    impressionsK:  [180, 95, 28, 12, 0],
    averages: { postsPerWeek: 3, followersK: 135, engagementPct: 0.34, impressionsK: 79 },
    selfDeltas: { postsPerWeek: 0, followersK: 4, engagementPct: 0.0, impressionsK: 0 },
  },
  facebook: {
    headline: "Facebook is a missed channel for you — competitors are still posting consistently.",
    postsPerWeek:  [3, 4, 2, 2, 1],
    followersK:    [212, 156, 88, 64, 41],
    engagementPct: [0.62, 0.41, 0.18, 0.12, 0.04],
    impressionsK:  [120, 88, 36, 22, 8],
    averages: { postsPerWeek: 3, followersK: 130, engagementPct: 0.33, impressionsK: 67 },
    selfDeltas: { postsPerWeek: 1, followersK: 3, engagementPct: 0.02, impressionsK: 5 },
  },
  linkedin: {
    headline: "You're not on LinkedIn yet — wellness B2B audiences live here.",
    postsPerWeek:  [2, 0, 3, 1, 0],
    followersK:    [18, 0, 24, 8, 0],
    engagementPct: [1.8, 0, 2.1, 0.9, 0],
    impressionsK:  [12, 0, 18, 6, 0],
    averages: { postsPerWeek: 2, followersK: 13, engagementPct: 1.2, impressionsK: 9 },
    selfDeltas: { postsPerWeek: 0, followersK: 0, engagementPct: 0, impressionsK: 0 },
  },
  tiktok: {
    headline: "TikTok is where wellness content is winning — and you're not there.",
    postsPerWeek:  [0, 4, 5, 3, 0],
    followersK:    [0, 84, 142, 56, 0],
    engagementPct: [0, 3.4, 4.1, 2.8, 0],
    impressionsK:  [0, 240, 380, 165, 0],
    averages: { postsPerWeek: 3, followersK: 71, engagementPct: 2.6, impressionsK: 196 },
    selfDeltas: { postsPerWeek: 0, followersK: 0, engagementPct: 0, impressionsK: 0 },
  },
  x: {
    headline: "X is low-volume for wellness — most of your competitors here barely post.",
    postsPerWeek:  [2, 3, 1, 2, 0],
    followersK:    [16, 22, 8, 12, 0],
    engagementPct: [0.4, 0.6, 0.2, 0.3, 0],
    impressionsK:  [8, 12, 4, 6, 0],
    averages: { postsPerWeek: 2, followersK: 15, engagementPct: 0.38, impressionsK: 8 },
    selfDeltas: { postsPerWeek: 0, followersK: 0, engagementPct: 0, impressionsK: 0 },
  },
  youtube: {
    headline: "YouTube long-form is helping competitors dominate search and AEO.",
    postsPerWeek:  [1, 1, 2, 1, 0],
    followersK:    [48, 32, 64, 28, 0],
    engagementPct: [2.1, 1.4, 2.8, 1.6, 0],
    impressionsK:  [56, 38, 84, 32, 0],
    averages: { postsPerWeek: 1, followersK: 43, engagementPct: 1.98, impressionsK: 53 },
    selfDeltas: { postsPerWeek: 0, followersK: 0, engagementPct: 0, impressionsK: 0 },
  },
};

// ── Section 2: Paid Social ──────────────────────────────────────────────────

/** Ad counts per platform per competitor. null = not running on that
 *  platform (rendered as "—"). */
export const PAID_SOCIAL_ADS: Record<CompetitorId, Record<Platform, number | null>> = {
  pure:       { instagram: 24, facebook: 18, linkedin: 1,    tiktok: null, x: null, youtube: 5    },
  calm:       { instagram: 12, facebook: 12, linkedin: null, tiktok: 8,    x: null, youtube: null },
  wellspring: { instagram: 8,  facebook: 7,  linkedin: null, tiktok: 3,    x: null, youtube: 2    },
  vital:      { instagram: 18, facebook: 14, linkedin: null, tiktok: 6,    x: null, youtube: null },
  radiant:    { instagram: null, facebook: null, linkedin: null, tiktok: null, x: null, youtube: null },
};

// ── Section 3: Paid Search ─────────────────────────────────────────────────

/** Active Google Ads per competitor. */
export const PAID_SEARCH_ADS: Record<CompetitorId, number> = {
  pure: 14,
  calm: 9,
  wellspring: 6,
  vital: 11,
  radiant: 2,
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
  { query: 'Best wellness clinic in Austin', topName: 'Pure Vitality Co.', organic: 2, map: 3 },
  { query: 'Top-rated wellness center near me', topName: 'Wellspring Health', organic: null, map: 4 },
  { query: 'Holistic health retreats in Texas', topName: 'Vital Bloom', organic: null, map: null },
  { query: 'Affordable wellness coach Austin', topName: 'Calm + Co', organic: 5, map: 2 },
  { query: 'Wellness center with sauna', topName: 'Pure Vitality Co.', organic: 7, map: 1 },
];

// ── Section 5: AEO (LLM visibility) ────────────────────────────────────────

export type AssistantName = 'ChatGPT' | 'Perplexity' | 'Gemini';
export const ASSISTANTS: AssistantName[] = ['ChatGPT', 'Perplexity', 'Gemini'];

export interface AeoPrompt {
  prompt: string;
  /** Whether Radiant Health was mentioned in each LLM's answer. */
  mentioned: Record<AssistantName, boolean>;
  /** Brand the assistant most often cites first for this prompt. */
  topMention: string;
}

export const AEO_PROMPTS: AeoPrompt[] = [
  {
    prompt: 'Where should I go for a wellness retreat in Austin?',
    mentioned: { ChatGPT: true, Perplexity: false, Gemini: true },
    topMention: 'Pure Vitality Co.',
  },
  {
    prompt: 'Best holistic health centers in Texas',
    mentioned: { ChatGPT: false, Perplexity: false, Gemini: true },
    topMention: 'Wellspring Health',
  },
  {
    prompt: 'Recommend a wellness coach for stress',
    mentioned: { ChatGPT: true, Perplexity: true, Gemini: false },
    topMention: 'Calm + Co',
  },
  {
    prompt: 'Where can I find IV therapy in Austin?',
    mentioned: { ChatGPT: false, Perplexity: false, Gemini: false },
    topMention: 'Vital Bloom',
  },
  {
    prompt: 'What is the highest-rated wellness clinic near me?',
    mentioned: { ChatGPT: true, Perplexity: false, Gemini: false },
    topMention: 'Pure Vitality Co.',
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
  { id: 'booking',  label: 'On-site booking',           ok: false, description: 'Keep booking on your site to capture more revenue and avoid drop-off to third-party schedulers.' },
  { id: 'cta',      label: 'Effective CTA above fold',  ok: true,  description: 'Your hero CTA is visible and action-oriented.' },
  { id: 'text',     label: 'Sufficient text content',   ok: true,  description: 'Long-form content helps SEO and answers customer questions.' },
  { id: 'phone',    label: 'Visible phone number',      ok: false, description: 'A visible phone number gives customers one more easy way to reach you.' },
  { id: 'favicon',  label: 'Favicon',                   ok: true,  description: 'Your site has a recognizable browser-tab icon.' },
];

export const WEBSITE_APPEARANCE: WebsiteCheck[] = [
  { id: 'mobile',   label: 'Mobile-friendly',           ok: true,  description: 'Your site renders well on phones and tablets.' },
  { id: 'speed',    label: 'Fast load time',            ok: false, description: 'First contentful paint is 4.1s — aim for under 2.5s.' },
  { id: 'imagery',  label: 'High-quality imagery',      ok: true,  description: 'Photos are sharp and on-brand.' },
  { id: 'brand',    label: 'Consistent brand colors',   ok: true,  description: 'Your brand palette is applied across pages.' },
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
  { competitor: 'pure',       rating: 4.6, reviews: 1842, responseRatePct: 78, recent: 64 },
  { competitor: 'calm',       rating: 4.4, reviews: 1240, responseRatePct: 62, recent: 41 },
  { competitor: 'wellspring', rating: 4.2, reviews:  892, responseRatePct: 55, recent: 28 },
  { competitor: 'vital',      rating: 4.5, reviews:  712, responseRatePct: 70, recent: 33 },
  { competitor: 'radiant',    rating: 4.7, reviews: 1218, responseRatePct: 96, recent: 58 },
];
