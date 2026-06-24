import type { ComponentType } from 'react';
import type { IconProps } from '@/icons/Types';
import type { ToolId } from '../tools-context';
import Calendar1 from '@/icons/20/Calendar1';
import Map02 from '@/icons/20/Map02';
import Globe from '@/icons/20/Globe';
import Google from '@/icons/20/Google';
import Cursor04 from '@/icons/20/Cursor04';
import LineChartUp02 from '@/icons/20/LineChartUp02';
import Star from '@/icons/20/Star';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import Templates from '@/icons/20/Templates';
import UserProfileCircle from '@/icons/20/UserProfileCircle';

/**
 * DIY onboarding feature catalog.
 *
 * The DIY feature picker (step 5) splits features into two groups:
 *   - "addable" — features the user can self-serve onto a Starter/Growth plan.
 *   - "dfy-only" — features that require a Done-For-You engagement. Selecting
 *     any of these diverts the flow to "Talk to a Strategist" rather than
 *     self-serve checkout.
 *
 * This catalog is intentionally separate from the global `ToolId` taxonomy
 * (tools-context). DIY introduces two product areas — Local SEO and
 * Competitor Ranking — that aren't part of the billed `ToolId` set, so we map
 * each feature to a `toolId` only when an equivalent exists. The mapped
 * ToolIds feed the post-onboarding Home cold state; the DIY plan tier is
 * driven by the COUNT of addable features (≤3 → Starter, 4+ → Growth), not by
 * the mapped ToolIds.
 */

export type DiyFeatureId =
  | 'organic-campaigns'
  | 'local-seo'
  | 'seo-aeo'
  | 'paid-search'
  | 'paid-social'
  | 'competitor-ranking';

export type DfyFeatureId =
  | 'reputation'
  | 'ai-receptionist'
  | 'website-landing-pages'
  | 'ugc-content';

export interface FeatureDef<Id extends string> {
  id: Id;
  label: string;
  description: string;
  icon: ComponentType<IconProps>;
  /** Underlying billing ToolId, when one exists. Undefined for DIY-native
   *  areas (Local SEO, Competitor Ranking) that aren't part of `ToolId`. */
  toolId?: ToolId;
}

/** Features a DIY user can add to a self-serve plan on their own. */
export const DIY_ADDABLE_FEATURES: FeatureDef<DiyFeatureId>[] = [
  {
    id: 'organic-campaigns',
    label: 'Organic Campaigns',
    description: 'Schedule and publish across every social channel.',
    icon: Calendar1,
    toolId: 'Organic Campaigns',
  },
  {
    id: 'local-seo',
    label: 'Local SEO',
    description: 'Rank in the local map pack and keep your Google Business Profile sharp.',
    icon: Map02,
  },
  {
    id: 'seo-aeo',
    label: 'SEO/AEO',
    description: 'Rank on Google and get cited by ChatGPT, Perplexity, and other answer engines.',
    icon: Globe,
    toolId: 'SEO/AEO',
  },
  {
    id: 'paid-search',
    label: 'Paid Search',
    description: 'Google Ads keywords, bids, and conversion tracking.',
    icon: Google,
    toolId: 'Paid Search',
  },
  {
    id: 'paid-social',
    label: 'Paid Social',
    description: 'Run and optimize Meta, TikTok, and LinkedIn ads.',
    icon: Cursor04,
    toolId: 'Paid Social',
  },
  {
    id: 'competitor-ranking',
    label: 'Competitor Ranking',
    description: 'Track how you stack up against local competitors over time.',
    icon: LineChartUp02,
  },
];

/** Features available only with a Done-For-You engagement. */
export const DFY_ONLY_FEATURES: FeatureDef<DfyFeatureId>[] = [
  {
    id: 'reputation',
    label: 'Reputation Management',
    description: 'We monitor and respond to every review across Google, Yelp, and more.',
    icon: Star,
    toolId: 'Reputation',
  },
  {
    id: 'ai-receptionist',
    label: 'AI Receptionist',
    description: 'An AI agent answers inbound email, SMS, and chat in under 2 minutes.',
    icon: UserProfileGroup,
    toolId: 'SDR',
  },
  {
    id: 'website-landing-pages',
    label: 'Website & Landing Pages',
    description: 'We design and ship landing pages and site updates for you.',
    icon: Templates,
    toolId: 'Landing Pages',
  },
  {
    id: 'ugc-content',
    label: 'UGC Content',
    description: 'We produce creator-style AI avatar videos and UGC for your channels.',
    icon: UserProfileCircle,
    toolId: 'UGC Content',
  },
];

/** Default DIY selection — 3 addable features → lands on the Starter plan. */
export const DEFAULT_DIY_FEATURES: DiyFeatureId[] = ['organic-campaigns', 'local-seo', 'seo-aeo'];

const ADDABLE_BY_ID = new Map(DIY_ADDABLE_FEATURES.map((f) => [f.id, f]));

/** Look up an addable feature definition by id. */
export function diyFeatureById(id: DiyFeatureId): FeatureDef<DiyFeatureId> | undefined {
  return ADDABLE_BY_ID.get(id);
}

/** Map a set of selected DIY feature ids to their underlying ToolIds (for the
 *  post-onboarding Home cold state). Features without a ToolId are dropped. */
export function diyFeatureToolIds(ids: DiyFeatureId[]): ToolId[] {
  return ids
    .map((id) => ADDABLE_BY_ID.get(id)?.toolId)
    .filter((t): t is ToolId => Boolean(t));
}
