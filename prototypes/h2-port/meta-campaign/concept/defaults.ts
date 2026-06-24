// Factories for default ad set + themed concepts, plus per-variant
// materializers for adding individual creatives (past winner / organic /
// competitor / Blaze-generated) to a concept's mixed slate.
import type { CreativeFormat } from '../competitor-creative';
import { PROVEN_ADS } from '../proven-ads';
import { ORGANIC_CREATIVE } from '../organic-creative';
import { COMPETITOR_CREATIVE } from '../competitor-creative';
import { AI_CREATIVE } from '../ai-creative';
import type {
  AdSet,
  AdSetConversionEvent,
  AdSetPerformanceGoal,
  Concept,
  CopyBundle,
  Variant,
  VariantSourceType,
} from './types';

const DEFAULT_PIXEL_ID = 'pxl_blaze_certapro_austin';
const DEFAULT_PIXEL_NAME = 'CertaPro Austin Pixel';

const DEFAULT_PERFORMANCE_GOAL: AdSetPerformanceGoal = 'maximize-leads';
const DEFAULT_CONVERSION_EVENT: AdSetConversionEvent = 'Lead';

const DEFAULT_AGE_RANGE = { min: 25, max: 64 };

const DEFAULT_AUDIENCE_LANGUAGE = 'English (US)';
const DEFAULT_AUDIENCE_LOCATIONS = ['Austin, TX · 25mi'];

/** "{Campaign Name} – Default Ad Set" — em-dash separator per the spec. */
export function defaultAdSetName(campaignName: string): string {
  return `${campaignName} – Default Ad Set`;
}

/** Build the default ad set when a new campaign is started. */
export function defaultAdSet(campaignName: string, websiteUrl: string): AdSet {
  return {
    id: `adset-default-${Date.now()}`,
    name: defaultAdSetName(campaignName),
    conversionLocation: 'website',
    performanceGoal: DEFAULT_PERFORMANCE_GOAL,
    conversionEvent: DEFAULT_CONVERSION_EVENT,
    pixelId: DEFAULT_PIXEL_ID,
    pixelName: DEFAULT_PIXEL_NAME,
    websiteUrl,
    audienceMode: 'advantage-plus',
    ageMin: DEFAULT_AGE_RANGE.min,
    ageMax: DEFAULT_AGE_RANGE.max,
    gender: 'all',
    language: DEFAULT_AUDIENCE_LANGUAGE,
    locations: [...DEFAULT_AUDIENCE_LOCATIONS],
    detailedTargeting: [],
    customAudiences: [],
    // Form's recommended exclusion baseline — keeps spend off existing
    // customers + people who just bought.
    exclusions: ['Existing customers', 'Recent converters (7–14d)'],
    placementsMode: 'advantage-plus',
    concepts: [],
  };
}

// ─── Concept themes ──────────────────────────────────────────────────────

/** A pre-built theme. A concept materialized from a theme owns the
 *  strategy fields and a shared copy bundle; its variant slate is built
 *  from a mix of sources Blaze recommends for that angle. */
export interface ConceptTheme {
  /** kebab-case identifier — stable across runs. */
  id: string;
  name: string;
  rationale: string;
  intendedAudience: string;
  valueProp: string;
  offerAngle: string;
  keyMessage: string;
  /** Shared copy bundle inherited by every variant. */
  copy: CopyBundle;
  /** Recommended starting slate — IDs into the four source pools. Blaze's
   *  "suggested mix" for this theme. Order in the slate mirrors this order
   *  (proven first, then organic, then competitor, then AI). */
  proven: string[];
  organic: string[];
  competitor: string[];
  ai: string[];
}

/** The themes Blaze surfaces in the "Add concept" picker on Stage 3. Each
 *  one comes with a recommended slate so the user lands on a populated,
 *  editable starting point. */
export const CONCEPT_THEMES: ConceptTheme[] = [
  {
    id: 'owner-led-trust',
    name: 'Owner-led trust',
    rationale: 'Lean on the trust signals your account already won on — owner-led visits, recent neighborhood transformations, and a 2-year warranty.',
    intendedAudience: 'Austin homeowners 30–65, home-improvement intent, high consideration',
    valueProp: 'Same crew your neighbors already trust',
    offerAngle: 'Free in-home estimate this week',
    keyMessage: 'Faded exteriors, transformed in days',
    copy: {
      primaryText: 'Trusted Austin painters with a 2-year warranty. Free in-home estimate this week — the same crew your neighbors already loved.',
      headline: 'Faded exteriors, transformed in days',
      description: '',
      cta: 'Get quote',
    },
    proven: ['proven-westlake-reel', 'proven-hoa-static'],
    organic: ['organic-cabinet-timelapse'],
    competitor: ['five-star-reel'],
    ai: ['ai-warranty-lead'],
  },
  {
    id: 'before-after-transformation',
    name: 'Before / after transformation',
    rationale: 'Visual-proof angle. Competitor accounts in Austin are moving toward transformation reels — keep pace before fatigue eats your share.',
    intendedAudience: 'Same homeowners, scroll-stopper visual-led',
    valueProp: 'See the change before you book',
    offerAngle: 'Spot the difference — your house, three days apart',
    keyMessage: 'Your house, three days apart',
    copy: {
      primaryText: 'Cedar Park, Tarrytown, Westlake — see what 3 days with our crew looks like before you book.',
      headline: 'Your house, three days apart',
      description: '',
      cta: 'Get quote',
    },
    proven: ['proven-tarrytown-carousel'],
    organic: ['organic-tarrytown-beforeafter'],
    competitor: ['paper-moon-carousel'],
    ai: ['ai-neighbor-proof'],
  },
  {
    id: 'speed-and-warranty',
    name: 'Speed & warranty',
    rationale: 'Lean on the operational story — fast scheduling, transparent timelines, written guarantees. Pulls high-intent shoppers off competitor sites.',
    intendedAudience: 'Homeowners actively shopping painters, time-sensitive',
    valueProp: '4-day exterior timeline + 2-year guarantee',
    offerAngle: 'Free estimate, fixed-price quote',
    keyMessage: 'Booked, painted, guaranteed in 4 days',
    copy: {
      primaryText: 'Fast scheduling, local crews, and a transparent 4-day exterior timeline. Free estimate with a fixed-price quote.',
      headline: 'Booked, painted, guaranteed in 4 days',
      description: '',
      cta: 'Get quote',
    },
    proven: ['proven-color-static'],
    organic: ['organic-review-graphic'],
    competitor: ['wow-1day-timeline'],
    ai: ['ai-warranty-lead', 'ai-pricing-transparency'],
  },
];

// ─── Concept + variant materialization ───────────────────────────────────

/** Materialize a concept from a theme. The variant slate is built from the
 *  theme's recommended source IDs across all 4 pools — that's Blaze's
 *  "suggested mix" for this angle, editable by the user. */
export function materializeThemedConcept(theme: ConceptTheme): Concept {
  const variants: Variant[] = [
    ...theme.proven.map((id) => materializeVariantFromSource('proven', id)).filter(isVariant),
    ...theme.organic.map((id) => materializeVariantFromSource('organic', id)).filter(isVariant),
    ...theme.competitor.map((id) => materializeVariantFromSource('competitor', id)).filter(isVariant),
    ...theme.ai.map((id) => materializeVariantFromSource('ai', id)).filter(isVariant),
  ];
  return {
    id: `concept-${theme.id}-${Date.now()}`,
    name: theme.name,
    rationale: theme.rationale,
    intendedAudience: theme.intendedAudience,
    valueProp: theme.valueProp,
    offerAngle: theme.offerAngle,
    keyMessage: theme.keyMessage,
    copy: { ...theme.copy },
    variants,
  };
}

/** Materialize a custom concept from a free-form name. No suggested slate —
 *  the user adds variants explicitly. */
export function materializeCustomConcept(name: string): Concept {
  return {
    id: `concept-custom-${Date.now()}`,
    name: name.trim() || 'Untitled concept',
    rationale: '',
    intendedAudience: '',
    valueProp: '',
    offerAngle: '',
    keyMessage: '',
    copy: {
      primaryText: '',
      headline: '',
      description: '',
      cta: 'Get quote',
    },
    variants: [],
  };
}

/** Materialize a single Variant from a specific source-data entry. Used by
 *  the per-concept "Add variant" picker on Stage 3 and the AddAdsModal. */
export function materializeVariantFromSource(
  sourceType: VariantSourceType,
  sourceRefId: string,
): Variant | null {
  switch (sourceType) {
    case 'proven': {
      const src = PROVEN_ADS.find((p) => p.id === sourceRefId);
      if (!src) return null;
      return baseVariant({
        sourceType,
        sourceRefId,
        sourceMetric: src.metric,
        format: src.format,
        image: src.image,
      });
    }
    case 'organic': {
      const src = ORGANIC_CREATIVE.find((o) => o.id === sourceRefId);
      if (!src) return null;
      return baseVariant({
        sourceType,
        sourceRefId,
        sourceMetric: src.metric,
        format: src.format,
        image: src.image,
      });
    }
    case 'competitor': {
      const src = COMPETITOR_CREATIVE.find((c) => c.id === sourceRefId);
      if (!src) return null;
      return baseVariant({
        sourceType,
        sourceRefId,
        sourceMetric: src.metric,
        format: src.format,
        image: src.adapted.image,
      });
    }
    case 'ai': {
      const src = AI_CREATIVE.find((a) => a.id === sourceRefId);
      if (!src) return null;
      return baseVariant({
        sourceType,
        sourceRefId,
        sourceMetric: '',
        format: src.format,
        image: src.adapted.image,
      });
    }
  }
}

function baseVariant({
  sourceType,
  sourceRefId,
  sourceMetric,
  format,
  image,
}: {
  sourceType: VariantSourceType;
  sourceRefId: string;
  sourceMetric: string;
  format: CreativeFormat;
  image: string;
}): Variant {
  return {
    id: `var-${sourceRefId}-${Date.now()}-${Math.floor(performance.now() * 1000) % 100000}`,
    sourceType,
    sourceRefId,
    sourceMetric,
    format,
    image,
    included: true,
  };
}

function isVariant(v: Variant | null): v is Variant {
  return v !== null;
}

// ─── Recommended default concept on start() ─────────────────────────────

/** The concept Blaze seeds on first wizard open. "Owner-led trust" is the
 *  highest-confidence default for the painters-in-Austin scenario. */
export function recommendedDefaultConcept(): Concept | null {
  const theme = CONCEPT_THEMES[0];
  if (!theme) return null;
  return materializeThemedConcept(theme);
}
