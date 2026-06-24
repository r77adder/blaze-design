// Domain types for the Meta-aligned campaign hierarchy:
//
//   Campaign > Ad set > Concept > Variant
//
// Concepts are the strategy unit Andrew described — one source angle + value
// prop + audience + offer + key message + shared copy bundle. Variants under
// a concept differ in creative format/execution but inherit copy by default
// (per-variant override allowed, marked as a "deviation" test).
import type { CreativeFormat } from '../competitor-creative';
import type { AdCta } from '../meta-campaign-context';

/** The four creative sources that can seed a concept. Same four that drove
 *  the old flat slate, but now anchored at the concept level (single source
 *  per concept). */
export type ConceptSourceType = 'proven' | 'organic' | 'competitor' | 'ai';

export interface CopyBundle {
  primaryText: string;
  headline: string;
  description: string;
  cta: AdCta;
}

/** Per-variant override of the concept's copy. Any missing fields fall back
 *  to the concept's shared copy. An empty object (or all-empty values) means
 *  the variant inherits cleanly. */
export interface CopyOverrides {
  primaryText?: string;
  headline?: string;
  description?: string;
  cta?: AdCta;
  /** Per-variant destination URL override. When unset, the variant inherits
   *  the ad set's URL. */
  websiteUrl?: string;
}

/** A single creative execution under a concept. Concepts are themes — the
 *  variants underneath them can be a MIX of sources (a past winner reel
 *  alongside a competitor-inspired carousel and a Blaze-generated angle,
 *  all tied to the same theme). Source provenance lives on the variant. */
export interface Variant {
  id: string;
  /** Where this specific creative came from. Drives the per-variant source
   *  pill ("Past winner" / "Organic post" / "Competitor-inspired" /
   *  "Blaze-generated"). */
  sourceType: VariantSourceType;
  /** Reference back to the source-data entry this variant was materialized
   *  from (proven ad id, organic post id, etc.). */
  sourceRefId: string;
  /** Headline metric from the source. Empty string for 'ai' source. */
  sourceMetric: string;
  format: CreativeFormat;
  image: string;
  /** Optional advanced-user override. When undefined, the resolver uses the
   *  default generator (`{Campaign}_{Concept}_{Format}_v{N}`). */
  customName?: string;
  overrides?: CopyOverrides;
  /** Whether this variant is included in the launch. */
  included: boolean;
  /** Asset link OR brief — mirrors the client form's "link to asset" vs
   *  "brief for asset" toggle. */
  assetMode?: 'link' | 'brief';
  assetLink?: string;
  assetBrief?: string;
}

/** A creative concept — the overarching THEME for an ad set. Variants
 *  underneath can be a mix of sources tied back to this theme; the concept
 *  itself just owns the strategy fields (audience / value prop / offer /
 *  key message) and the shared copy bundle every variant inherits. */
export interface Concept {
  id: string;
  name: string;
  rationale: string;
  intendedAudience: string;
  valueProp: string;
  offerAngle: string;
  keyMessage: string;
  copy: CopyBundle;
  variants: Variant[];
}

/** Source provenance for an individual variant. Variants under a single
 *  concept can have different source types — that's the whole point of the
 *  mixed slate. */
export type VariantSourceType = ConceptSourceType;

/** Performance-goal options on the ad set. Matches Meta's five options for
 *  most ad-set configurations. */
export type AdSetPerformanceGoal =
  | 'maximize-leads'
  | 'maximize-conversions'
  | 'maximize-landing-page-views'
  | 'maximize-link-clicks'
  | 'maximize-impressions'
  | 'maximize-daily-unique-reach';

/** Conversion event options. Mirrors common Meta lead-gen events for the
 *  category; not exhaustive — prototype scope. */
export type AdSetConversionEvent =
  | 'Lead'
  | 'Complete registration'
  | 'Purchase'
  | 'Schedule';

/** Where the conversion happens — drives whether destination URL,
 *  Instant Form, app deeplink, etc. is required. */
export type ConversionLocation =
  | 'website'
  | 'app'
  | 'messaging-apps'
  | 'calls'
  | 'instant-forms';

/** Audience targeting mode. Advantage+ lets Meta find the audience using
 *  the inputs as suggestions; Original uses them as hard targeting. */
export type AudienceMode = 'advantage-plus' | 'original';

/** Placements mode. Advantage+ lets Meta pick placements; Manual exposes
 *  the per-placement checklist. */
export type PlacementsMode = 'advantage-plus' | 'manual';

/** Manual placement options surfaced when PlacementsMode === 'manual'. */
export type ManualPlacement =
  | 'feeds'
  | 'stories'
  | 'reels'
  | 'in-stream-video'
  | 'search-results'
  | 'marketplace'
  | 'right-column'
  | 'messenger-inbox';

/** Special ad category sub-options. Empty array (or undefined) means "No". */
export type SpecialAdCategory =
  | 'credit'
  | 'employment'
  | 'housing'
  | 'social-issues-elections-politics';

export interface AdSet {
  id: string;
  /** Default: `{Campaign Name} – Default Ad Set`. */
  name: string;
  conversionLocation: ConversionLocation;
  performanceGoal: AdSetPerformanceGoal;
  conversionEvent: AdSetConversionEvent;
  /** Mocked pixel id — prototype always-connected default. */
  pixelId: string;
  pixelName: string;
  /** Destination URL — kept on the ad set as the default for any variant
   *  that doesn't override. */
  websiteUrl: string;
  /** Audience mode — Advantage+ vs Original. Drives whether the audience
   *  inputs below are hard filters or suggestions. */
  audienceMode: AudienceMode;
  ageMin: number;
  ageMax: number;
  gender: 'all' | 'men' | 'women';
  language: string;
  locations: string[];
  /** Detailed targeting — interests, behaviors, demographics. */
  detailedTargeting: string[];
  /** Custom audiences to include (site visitors, email lists, lookalikes). */
  customAudiences: string[];
  /** Audiences to exclude (existing customers, recent converters). */
  exclusions: string[];
  /** Placements mode. */
  placementsMode: PlacementsMode;
  /** Active placements when placementsMode === 'manual'. */
  manualPlacements?: ManualPlacement[];
  /** Concepts owned by this ad set. Spec default: 1 concept per ad set. */
  concepts: Concept[];
}

/** Bid-strategy options at the campaign level. Spec mentions bid strategy
 *  alongside budget; these are the common Meta options. */
export type BidStrategy =
  | 'highest-volume'
  | 'cost-per-result-goal'
  | 'roas-goal'
  | 'bid-cap';

/** Budget cadence on the campaign. */
export type BudgetType = 'daily' | 'lifetime';

/** Campaign objective — Meta's six headline objectives. */
export type CampaignObjective =
  | 'awareness'
  | 'traffic'
  | 'engagement'
  | 'leads'
  | 'app-promotion'
  | 'sales';

// Display labels used by dropdowns + summary copy.

export const PERFORMANCE_GOAL_LABEL: Record<AdSetPerformanceGoal, string> = {
  'maximize-leads': 'Maximize number of leads',
  'maximize-conversions': 'Maximize conversions',
  'maximize-landing-page-views': 'Maximize landing page views',
  'maximize-link-clicks': 'Maximize link clicks',
  'maximize-impressions': 'Maximize impressions',
  'maximize-daily-unique-reach': 'Maximize daily unique reach',
};

export const PERFORMANCE_GOAL_ORDER: AdSetPerformanceGoal[] = [
  'maximize-conversions',
  'maximize-leads',
  'maximize-landing-page-views',
  'maximize-link-clicks',
  'maximize-impressions',
  'maximize-daily-unique-reach',
];

export const CONVERSION_EVENT_ORDER: AdSetConversionEvent[] = [
  'Lead',
  'Complete registration',
  'Purchase',
  'Schedule',
];

export const CONVERSION_LOCATION_LABEL: Record<ConversionLocation, string> = {
  website: 'Website',
  app: 'App',
  'messaging-apps': 'Messaging apps',
  calls: 'Calls',
  'instant-forms': 'Instant Forms',
};

export const CONVERSION_LOCATION_ORDER: ConversionLocation[] = [
  'website',
  'app',
  'messaging-apps',
  'calls',
  'instant-forms',
];

export const BID_STRATEGY_LABEL: Record<BidStrategy, string> = {
  'highest-volume': 'Highest volume',
  'cost-per-result-goal': 'Cost per result goal',
  'roas-goal': 'ROAS goal',
  'bid-cap': 'Bid cap',
};

export const BID_STRATEGY_ORDER: BidStrategy[] = [
  'highest-volume',
  'cost-per-result-goal',
  'roas-goal',
  'bid-cap',
];

/** Which bid strategies require a numeric target. Highest-volume runs
 *  open; the others bid toward a specific value. */
export const BID_STRATEGY_NEEDS_TARGET: Record<BidStrategy, boolean> = {
  'highest-volume': false,
  'cost-per-result-goal': true,
  'roas-goal': true,
  'bid-cap': true,
};

export const OBJECTIVE_LABEL: Record<CampaignObjective, string> = {
  awareness: 'Awareness',
  traffic: 'Traffic',
  engagement: 'Engagement',
  leads: 'Leads',
  'app-promotion': 'App promotion',
  sales: 'Sales',
};

export const OBJECTIVE_ORDER: CampaignObjective[] = [
  'awareness',
  'traffic',
  'engagement',
  'leads',
  'app-promotion',
  'sales',
];

export const OBJECTIVE_DESCRIPTION: Record<CampaignObjective, string> = {
  awareness: 'Stay top-of-mind across your audience.',
  traffic: 'Send people from Meta to your site.',
  engagement: 'Likes, comments, shares, messages.',
  leads: 'Form fills, sign-ups, contact requests.',
  'app-promotion': 'App installs and in-app events.',
  sales: 'Purchases and conversions.',
};

export const SPECIAL_AD_CATEGORY_LABEL: Record<SpecialAdCategory, string> = {
  credit: 'Credit',
  employment: 'Employment',
  housing: 'Housing',
  'social-issues-elections-politics': 'Social issues, elections or politics',
};

export const SPECIAL_AD_CATEGORY_ORDER: SpecialAdCategory[] = [
  'credit',
  'employment',
  'housing',
  'social-issues-elections-politics',
];

export const MANUAL_PLACEMENT_LABEL: Record<ManualPlacement, string> = {
  feeds: 'Feeds',
  stories: 'Stories',
  reels: 'Reels',
  'in-stream-video': 'In-stream video',
  'search-results': 'Search results',
  marketplace: 'Marketplace',
  'right-column': 'Right column',
  'messenger-inbox': 'Messenger inbox',
};

export const MANUAL_PLACEMENT_ORDER: ManualPlacement[] = [
  'feeds',
  'stories',
  'reels',
  'in-stream-video',
  'search-results',
  'marketplace',
  'right-column',
  'messenger-inbox',
];

export const SOURCE_TYPE_LABEL: Record<ConceptSourceType, string> = {
  proven: 'Past winner',
  organic: 'Organic post',
  competitor: 'Competitor-inspired',
  ai: 'Blaze-generated',
};

/** Display labels for Meta's four ad formats. Internal CreativeFormat
 *  values map onto these for everything user-facing. */
export const FORMAT_DISPLAY_LABEL: Record<CreativeFormat, string> = {
  Static: 'Single image',
  Reel: 'Single video',
  Carousel: 'Carousel',
  UGC: 'Single video',
};

/** Campaign schedule — start date is required; end is required when budget
 *  type is lifetime. Stored as ISO date strings ("YYYY-MM-DD" or full ISO). */
export interface CampaignSchedule {
  startsAt: string;
  endsAt?: string;
}
