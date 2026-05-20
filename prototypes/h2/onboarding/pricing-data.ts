import type { ToolId } from '../tools-context';
import type { Term } from './onboarding-context';

/**
 * Pricing model — each feature has a 12-month base, with multipliers for
 * shorter terms (12 mo = best price, 3 mo = highest). UGC and Ad Creative
 * are sold as packs (1 pack per 4 months), not monthly subscriptions.
 *
 * Prices match the spec in the H2 onboarding kickoff message:
 *   Organic / Paid Ads / Landing Pages / SEO+AEO+Reputation  → $899/m
 *   AI Receptionist (SDR)                                    → $100/m
 *   UGC Content                                              → $950/pack (mid of $700-1200)
 *   Ad Creative                                              → $400/pack
 */

export interface ToolPricing {
  toolId: ToolId;
  label: string;
  /** What it does — short copy used on the strategy and pricing rows. */
  blurb: string;
  /** "How Blaze improves it" — anchored to the user's gap. */
  benefit: string;
  /** Monthly base price for the 12-month term, in USD. */
  monthlyBase: number;
  /** True if the feature is billed as packs every 4 months instead of monthly. */
  isPack?: boolean;
  /** When isPack: per-pack price at 12-month term. Pack frequency is 1 / 4 mo. */
  packPrice?: number;
  /** Pack price range string for display ("700-1200"). Mid is used for math. */
  packRangeLabel?: string;
}

export const TOOL_PRICING: Record<ToolId, ToolPricing> = {
  'Organic Campaigns': {
    toolId: 'Organic Campaigns',
    label: 'Organic Campaigns',
    blurb: 'Schedule, publish, and optimize across Instagram, TikTok, LinkedIn, Facebook, X, and YouTube.',
    benefit:
      'We auto-generate a 30-day content calendar from your brand profile, schedule it across every channel, and tune cadence weekly based on what lands.',
    monthlyBase: 899,
  },
  SEO: {
    toolId: 'SEO',
    label: 'SEO & AEO',
    blurb: 'Rank on Google and get cited by ChatGPT, Perplexity, and other answer engines.',
    benefit:
      'Topic-cluster blogs targeting the queries we found you ranking #4+ on, plus structured data so AI assistants quote you when customers ask.',
    monthlyBase: 899,
  },
  AEO: {
    toolId: 'AEO',
    label: 'AEO',
    blurb: 'Be the answer in ChatGPT, Perplexity, Gemini, and Claude.',
    benefit:
      'We feed answer engines structured citations of your brand so customer prompts return you, not your competitors.',
    monthlyBase: 0, // rolled into SEO line in the proposal; kept here for shape
  },
  'UGC Content': {
    toolId: 'UGC Content',
    label: 'UGC & Avatar Content',
    blurb: 'Creator-style AI avatar videos and user-generated content for socials and ads.',
    benefit:
      'A pack of 8 UGC-style videos every 4 months — scripts, AI avatars, captions, ready to schedule in your campaigns.',
    monthlyBase: 0,
    isPack: true,
    packPrice: 950,
    packRangeLabel: '$700–$1,200',
  },
  'Paid Social': {
    toolId: 'Paid Social',
    label: 'Paid Ads',
    blurb: 'Run and optimize Meta, TikTok, and LinkedIn ads with auto-bid management.',
    benefit:
      'We launch your first 3 campaigns within a week, manage daily budget allocation across creatives, and reallocate spend toward the winners weekly.',
    monthlyBase: 899,
  },
  'Paid Search': {
    toolId: 'Paid Search',
    label: 'Paid Search (Google Ads)',
    blurb: 'Keyword research, bid management, and conversion tracking for Google Ads.',
    benefit:
      'Daily bid tuning on your high-intent keywords + landing-page experiments to lift conversion rate from your ad clicks.',
    monthlyBase: 0, // bundled into Paid Ads in the proposal; here for shape
  },
  'Landing Pages': {
    toolId: 'Landing Pages',
    label: 'Landing Pages',
    blurb: 'High-converting pages tied to your campaigns.',
    benefit:
      'A new page per campaign + A/B-tested hero, CTA, and form variants. Auto-deploy to your domain.',
    monthlyBase: 899,
  },
  SDR: {
    toolId: 'SDR',
    label: 'AI Receptionist',
    blurb: 'AI SDR agent — handles inbound across email, SMS, and chat.',
    benefit:
      'Replies in under 2 minutes, qualifies leads against your criteria, books meetings into your calendar, and hands off warm leads to you.',
    monthlyBase: 100,
  },
  Reputation: {
    toolId: 'Reputation',
    label: 'Reputation Management',
    blurb: 'Monitor and respond to reviews across Google, Yelp, and more.',
    benefit:
      'Auto-drafted responses to every new review within an hour, drip campaigns to ask happy customers for reviews, and weekly sentiment digest.',
    monthlyBase: 0, // bundled into SEO/AEO/Reputation in the proposal
  },
};

/**
 * Term multipliers — 12mo is base (1.0); shorter terms cost more per month.
 * Mirrors common agency retainer pricing.
 */
export const TERM_MULTIPLIER: Record<Term, number> = {
  12: 1.0,
  6: 1.15,
  3: 1.3,
};

export const TERM_LABEL: Record<Term, string> = {
  12: '12-month plan',
  6: '6-month plan',
  3: '3-month plan',
};

export const TERM_SUBTEXT: Record<Term, string> = {
  12: 'Best value — save 30% per month',
  6: 'Save 15% per month',
  3: 'Most flexible',
};

/**
 * Proposal-level grouping — we sell some features as a single bundled line
 * even though they're separate ToolIds internally. This keeps the pricing
 * table aligned to the user's mental model ("Paid Ads", "SEO & AEO &
 * Reputation Management") instead of leaking the internal taxonomy.
 */
export interface PricingLine {
  key: string;
  label: string;
  blurb: string;
  /** Tools that must be selected for this line to appear. ANY selected → show. */
  tools: ToolId[];
  /** Monthly base price (sum of constituent tools' monthlyBase). */
  monthlyBase: number;
  /** True if billed as packs / 4mo. */
  isPack?: boolean;
  packPrice?: number;
  packRangeLabel?: string;
}

export const PRICING_LINES: PricingLine[] = [
  {
    key: 'organic',
    label: 'Organic Campaigns',
    blurb: 'Schedule, publish, and tune content across every social channel.',
    tools: ['Organic Campaigns'],
    monthlyBase: 899,
  },
  {
    key: 'paid',
    label: 'Paid Ads (Social + Search)',
    blurb: 'Meta, TikTok, LinkedIn, and Google Ads with daily bid management.',
    tools: ['Paid Social', 'Paid Search'],
    monthlyBase: 899,
  },
  {
    key: 'landing',
    label: 'Landing Pages',
    blurb: 'A new high-converting page per campaign, with A/B testing.',
    tools: ['Landing Pages'],
    monthlyBase: 899,
  },
  {
    key: 'seo',
    label: 'SEO, AEO & Reputation Management',
    blurb: 'Rank on Google, get cited by AI assistants, manage your reviews.',
    tools: ['SEO', 'AEO', 'Reputation'],
    monthlyBase: 899,
  },
  {
    key: 'ugc',
    label: 'UGC Content',
    blurb: '1 pack of 8 creator-style AI avatar videos every 4 months.',
    tools: ['UGC Content'],
    monthlyBase: 0,
    isPack: true,
    packPrice: 950,
    packRangeLabel: '$700–$1,200 per pack',
  },
  {
    key: 'creative',
    label: 'Ad Creative',
    blurb: '1 pack of ad creative assets every 4 months — static + motion variants.',
    tools: ['Paid Social', 'Paid Search'],
    monthlyBase: 0,
    isPack: true,
    packPrice: 400,
    packRangeLabel: '$400 per pack',
  },
  {
    key: 'sdr',
    label: 'AI Receptionist',
    blurb: 'AI agent that handles inbound email, SMS, and chat in under 2 minutes.',
    tools: ['SDR'],
    monthlyBase: 100,
  },
];

export interface PricingTotals {
  monthly: number;
  /** Total over the full term (monthly × months + pack costs over term). */
  termTotal: number;
  /** Number of pack purchases in the term (ceil(months / 4)). */
  packsInTerm: number;
}

export function computePricing(selected: PricingLine[], term: Term): PricingTotals {
  const multiplier = TERM_MULTIPLIER[term];
  const monthly = selected
    .filter((l) => !l.isPack)
    .reduce((sum, l) => sum + Math.round(l.monthlyBase * multiplier), 0);
  const packsInTerm = Math.ceil(term / 4);
  const packCosts = selected
    .filter((l) => l.isPack)
    .reduce((sum, l) => sum + Math.round((l.packPrice ?? 0) * multiplier) * packsInTerm, 0);
  return {
    monthly,
    termTotal: monthly * term + packCosts,
    packsInTerm,
  };
}

/**
 * Pick the visible pricing lines from the user's selected tools. Any line
 * whose `tools` intersects with `selectedTools` is included.
 */
export function visibleLines(selectedTools: ToolId[]): PricingLine[] {
  const set = new Set(selectedTools);
  return PRICING_LINES.filter((l) => l.tools.some((t) => set.has(t)));
}

export function fmtUsd(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}
