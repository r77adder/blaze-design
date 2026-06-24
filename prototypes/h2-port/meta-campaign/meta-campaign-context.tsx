import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useToast } from '@/staging';
import { COMPETITOR_CREATIVE, type CreativeFormat } from './competitor-creative';
import { ORGANIC_CREATIVE } from './organic-creative';
import { AI_CREATIVE } from './ai-creative';
import { PROVEN_ADS } from './proven-ads';
import type { SafetyNetConfig } from './confidence/types';
import type { Campaign, Ad } from '../pages/PaidSocial';
import type {
  AdSet,
  BidStrategy,
  BudgetType,
  CampaignObjective,
  CampaignSchedule,
  Concept,
  CopyBundle,
  CopyOverrides,
  SpecialAdCategory,
  Variant,
} from './concept/types';
import { OBJECTIVE_LABEL } from './concept/types';
import {
  defaultAdSet,
  recommendedDefaultConcept,
} from './concept/defaults';

/**
 * Drives the 4-stage "New campaign" flow on /h2/paid-social. The stages
 * mirror Meta's actual setup hierarchy:
 *
 *   1. Campaign  — name, objective, budget type/amount, bid strategy, special
 *                  ad category.
 *   2. Ad set    — name, performance goal, conversion event, pixel,
 *                  destination URL, audience, geo targeting.
 *   3. Ads       — concept-grouped creative selection. One concept = one
 *                  source angle + shared copy bundle + multiple variants.
 *                  Per-variant copy override is allowed and marked as a
 *                  deviation test.
 *   4. Review    — Campaign > Ad set > Ad hierarchy summary + confidence
 *                  layer (preflight, safety net, similar campaigns).
 *
 * State resets on every start() — a half-finished draft should never persist.
 */

export type MetaCampaignStep = 1 | 2 | 3 | 4;

// CampaignObjective moved to ./concept/types — re-exported below for
// backward compatibility with imports across the prototype.
export type { CampaignObjective } from './concept/types';

/** Adapted-variant shape kept exported for the back-compat AddAdsModal flow
 *  and the legacy confidence-layer readers. The new wizard reads `Variant`
 *  under `Concept` instead — see `concept/types.ts`. */
export interface GeneratedAd {
  id: string;
  sourceId: string;
  /** Where the creative came from — past paid ad, organic post, competitor, or Blaze AI. */
  source: 'proven' | 'competitor' | 'organic' | 'ai';
  /** Origin label depending on source: campaign name (proven), platform (organic),
   *  competitor name (competitor), or AI concept (ai). */
  origin: string;
  metric: string;
  format: CreativeFormat;
  image: string;
  /** Editable per-variant copy — each ad has its own headline, CTA, and caption. */
  headline: string;
  cta: AdCta;
  primaryText: string;
  included: boolean;
}

/** Human-readable provenance line, e.g. "Replay of Spring 2024 · Winner · 4.8% CTR",
 *  "Your Instagram post · 9.2% engagement", "From Five · 3.4x ROAS",
 *  or "Blaze AI · {concept}". */
export function adProvenance(ad: GeneratedAd): string {
  if (ad.source === 'organic') return `Your ${ad.origin} post · ${ad.metric}`;
  if (ad.source === 'ai') return `Blaze AI · ${ad.origin}`;
  if (ad.source === 'proven') return `Replay of ${ad.origin} · ${ad.metric}`;
  return `From ${ad.origin.split(' ')[0]} · ${ad.metric}`;
}

/** Meta's standard CTA set — mirrors the client form's 10 options. */
export type AdCta =
  | 'Learn more'
  | 'Sign up'
  | 'Get offer'
  | 'Shop now'
  | 'Subscribe'
  | 'Download'
  | 'Book now'
  | 'Get quote'
  | 'Contact us'
  | 'Send message';

export const AD_CTA_OPTIONS: AdCta[] = [
  'Learn more',
  'Sign up',
  'Get offer',
  'Shop now',
  'Subscribe',
  'Download',
  'Book now',
  'Get quote',
  'Contact us',
  'Send message',
];

export type Gender = 'all' | 'men' | 'women';

export const GENDER_LABEL: Record<Gender, string> = {
  all: 'All genders',
  men: 'Men',
  women: 'Women',
};

export const LANGUAGE_OPTIONS = [
  'English (US)',
  'Spanish (US)',
  'English & Spanish',
];

/** Campaign-level draft state (Stage 1). Audience, targeting, pixel,
 *  destination URL now live on `AdSetDraft`. Copy now lives on each Concept. */
export interface MetaCampaignDraft {
  name: string;
  /** AI-generated campaign topic — what this campaign is about. Drives Blaze's
   *  concept-recommendation defaults. */
  campaignTopic: string;
  objective: CampaignObjective;
  /** Special ad category sub-options. Empty array = "No". Non-empty = "Yes"
   *  and Meta will restrict age / gender / detailed-targeting downstream. */
  specialAdCategories: SpecialAdCategory[];
  budgetType: BudgetType;
  /** Dollars. Daily when budgetType='daily', total when 'lifetime'. */
  budgetAmount: number;
  bidStrategy: BidStrategy;
  /** Target value (CPA $ for cost-per-result, ROAS x for roas-goal, max bid
   *  $ for bid-cap). Undefined when bidStrategy === 'highest-volume'. */
  bidTargetValue?: number;
  /** Campaign run window. End is required when budgetType === 'lifetime'. */
  schedule: CampaignSchedule;
}

/** Ad-set-level draft (Stage 2). Mirrors `AdSet` minus `id` + `concepts` —
 *  concepts live on the provider as a parallel slice, and the id is minted
 *  on launch. */
export interface AdSetDraft {
  name: string;
  conversionLocation: AdSet['conversionLocation'];
  performanceGoal: AdSet['performanceGoal'];
  conversionEvent: AdSet['conversionEvent'];
  pixelId: string;
  pixelName: string;
  websiteUrl: string;
  audienceMode: AdSet['audienceMode'];
  ageMin: number;
  ageMax: number;
  gender: Gender;
  language: string;
  locations: string[];
  detailedTargeting: string[];
  customAudiences: string[];
  exclusions: string[];
  placementsMode: AdSet['placementsMode'];
  manualPlacements?: AdSet['manualPlacements'];
}

interface MetaCampaignContextValue {
  open: boolean;
  step: MetaCampaignStep;

  // Stage 1 — campaign draft
  draft: MetaCampaignDraft;
  setDraft: (updater: (prev: MetaCampaignDraft) => MetaCampaignDraft) => void;
  /** Cycle Blaze's AI-generated campaign topic through preset variations. */
  regenerateTopic: () => void;

  // Stage 2 — ad-set draft
  adSetDraft: AdSetDraft;
  setAdSetDraft: (updater: (prev: AdSetDraft) => AdSetDraft) => void;
  /** Convenience: set one ad-set field. */
  setAdSetField: <K extends keyof AdSetDraft>(key: K, value: AdSetDraft[K]) => void;

  // Stage 3 — concepts & variants
  concepts: Concept[];
  addConcept: (concept: Concept) => void;
  removeConcept: (conceptId: string) => void;
  updateConcept: (conceptId: string, patch: Partial<Omit<Concept, 'id' | 'variants' | 'copy'>>) => void;
  updateConceptCopy: (conceptId: string, patch: Partial<CopyBundle>) => void;
  addVariantToConcept: (conceptId: string, variant: Variant) => void;
  removeVariant: (conceptId: string, variantId: string) => void;
  setVariantIncluded: (conceptId: string, variantId: string, included: boolean) => void;
  setVariantCustomName: (conceptId: string, variantId: string, name: string) => void;
  /** Generic per-variant patch. Used by the variant asset fields
   *  (assetMode / assetLink / assetBrief) that don't have their own
   *  setters. */
  updateVariant: (conceptId: string, variantId: string, patch: Partial<Variant>) => void;
  setVariantOverride: <K extends keyof CopyOverrides>(
    conceptId: string,
    variantId: string,
    field: K,
    value: CopyOverrides[K],
  ) => void;
  clearVariantOverride: (
    conceptId: string,
    variantId: string,
    field?: keyof CopyOverrides,
  ) => void;

  // Persisted output
  /** Campaigns created via the flow this session — prepended to the table. */
  createdCampaigns: Campaign[];
  /** Ads added to existing campaigns via the per-campaign Add-ads flow. */
  addedAdsByCampaign: Record<string, Ad[]>;
  addAdsToCampaign: (campaignId: string, ads: Ad[]) => void;
  /** New concepts (= ad sets) authored on a campaign's detail page after
   *  launch. Each entry becomes a synthetic ad-set section via
   *  synthesizeAdSets. */
  addedConceptsByCampaign: Record<string, Concept[]>;
  addConceptToCampaign: (campaignId: string, concept: Concept) => void;
  /** Per-ad-set audience / targeting edits authored on the detail page.
   *  Patched into the resolved ad sets at read time so the originals stay
   *  immutable. */
  adSetEditsByCampaign: Record<string, Record<string, Partial<AdSet>>>;
  updateAdSet: (campaignId: string, adSetId: string, patch: Partial<AdSet>) => void;
  /** Safety-net rules persisted per campaign — set at launch, editable on the
   *  detail page. Missing entry = use computed defaults. */
  safetyNetByCampaign: Record<string, SafetyNetConfig>;
  setSafetyNet: (campaignId: string, config: SafetyNetConfig) => void;
  /** Authored by Stage 4's SafetyNetEditor while the wizard is open;
   *  consumed by MetaCampaignModal at Launch time. */
  pendingSafetyNet: SafetyNetConfig | null;
  setPendingSafetyNet: (config: SafetyNetConfig | null) => void;
  /** Set by Stage 4's PreflightChecklist; gates the modal's Launch button. */
  launchBlocked: boolean;
  setLaunchBlocked: (blocked: boolean) => void;

  // Wizard control
  start: () => void;
  close: () => void;
  next: () => void;
  back: () => void;
  finish: (safetyNet?: SafetyNetConfig) => void;
}

const TOPIC_ALTERNATES = [
  'Spring exterior repaints across the Austin metro — leaning on owner-led trust and recent neighborhood transformations to drive estimate requests.',
  'Cabinet and interior refinishes for Austin homeowners stalled on color choice — pairing free color consults with a 2-year warranty.',
  'Storm and sun damage repaints in the Austin metro — fast scheduling, local crews, and a transparent 4-day exterior timeline.',
];

/** Blaze's default recommended creative slate (legacy). Kept exported for
 *  back-compat with the AddAdsModal flow. The new wizard seeds a default
 *  concept via `recommendedDefaultConcept()`. */
export const RECOMMENDED_SLATE_IDS = [
  'proven-westlake-reel',
  'proven-hoa-static',
  'organic-cabinet-timelapse',
  'five-star-reel',
  'ai-warranty-lead',
];

/** Compute a default campaign schedule — starts tomorrow (so the user
 *  doesn't accidentally launch right now), no end date set unless the
 *  user picks Lifetime. */
function defaultCampaignSchedule(): CampaignSchedule {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 1);
  return { startsAt: startsAt.toISOString().slice(0, 10) };
}

const DEFAULT_DRAFT: MetaCampaignDraft = {
  name: 'Spring Exterior — Competitor Playbook',
  campaignTopic: TOPIC_ALTERNATES[0]!,
  objective: 'leads',
  specialAdCategories: [],
  budgetType: 'daily',
  budgetAmount: 90,
  bidStrategy: 'highest-volume',
  schedule: defaultCampaignSchedule(),
};

const DEFAULT_AD_SET_WEBSITE = 'https://certapro.com/austin';

function buildDefaultAdSetDraft(campaignName: string): AdSetDraft {
  const a = defaultAdSet(campaignName, DEFAULT_AD_SET_WEBSITE);
  return {
    name: a.name,
    conversionLocation: a.conversionLocation,
    performanceGoal: a.performanceGoal,
    conversionEvent: a.conversionEvent,
    pixelId: a.pixelId,
    pixelName: a.pixelName,
    websiteUrl: a.websiteUrl,
    audienceMode: a.audienceMode,
    ageMin: a.ageMin,
    ageMax: a.ageMax,
    gender: a.gender,
    language: a.language,
    locations: a.locations,
    detailedTargeting: [...a.detailedTargeting],
    customAudiences: [...a.customAudiences],
    exclusions: [...a.exclusions],
    placementsMode: a.placementsMode,
    manualPlacements: a.manualPlacements ? [...a.manualPlacements] : undefined,
  };
}

const MetaCampaignContext = createContext<MetaCampaignContextValue | null>(null);

/** Convert a GeneratedAd (creative provenance + adapted assets) into an Ad
 *  ready to drop into a campaign row. Source-aware naming. Used by the
 *  back-compat AddAdsModal flow. */
export function buildAdFromGenerated(g: GeneratedAd, budget: number): Ad {
  const name =
    g.source === 'organic'
      ? `${g.format} — your ${g.origin} post`
      : g.source === 'ai'
        ? `${g.format} — ${g.origin}`
        : g.source === 'proven'
          ? `${g.format} — replay of ${g.origin}`
          : `${g.format} — inspired by ${g.origin.split(' ')[0]}`;
  return {
    id: g.id,
    name,
    thumb: g.image,
    budget,
    spent: 0,
    results: 0,
    costPerResult: 0,
    impressions: 0,
    ctr: 0,
    status: 'testing',
    enabled: true,
  };
}

/** Build the ad variants from the chosen creative — proven past ads first
 *  (strongest signal), then organic posts, competitor adaptations, and finally
 *  Blaze-AI-generated concepts. Used by the back-compat AddAdsModal flow. */
export function buildGeneratedAds(selectedIds: Set<string>): GeneratedAd[] {
  const proven: GeneratedAd[] = PROVEN_ADS.filter((p) =>
    selectedIds.has(p.id),
  ).map((p) => ({
    id: `gen-${p.id}`,
    sourceId: p.id,
    source: 'proven',
    origin: p.campaignName,
    metric: p.metric,
    format: p.format,
    image: p.image,
    headline: p.headline,
    primaryText: p.primaryText,
    cta: 'Get quote',
    included: true,
  }));

  const organic: GeneratedAd[] = ORGANIC_CREATIVE.filter((o) =>
    selectedIds.has(o.id),
  ).map((o) => ({
    id: `gen-${o.id}`,
    sourceId: o.id,
    source: 'organic',
    origin: o.platform,
    metric: o.metric,
    format: o.format,
    image: o.image,
    headline: o.adapted.headline,
    primaryText: o.adapted.primaryText,
    cta: 'Get quote',
    included: true,
  }));

  const competitor: GeneratedAd[] = COMPETITOR_CREATIVE.filter((c) =>
    selectedIds.has(c.id),
  ).map((c) => ({
    id: `gen-${c.id}`,
    sourceId: c.id,
    source: 'competitor',
    origin: c.peer,
    metric: c.metric,
    format: c.format,
    image: c.adapted.image,
    headline: c.adapted.headline,
    primaryText: c.adapted.primaryText,
    cta: 'Get quote',
    included: true,
  }));

  const ai: GeneratedAd[] = AI_CREATIVE.filter((a) => selectedIds.has(a.id)).map(
    (a) => ({
      id: `gen-${a.id}`,
      sourceId: a.id,
      source: 'ai',
      origin: a.concept,
      // AI ads don't carry a forecast metric — provenance shows the concept name.
      metric: '',
      format: a.format,
      image: a.adapted.image,
      headline: a.adapted.headline,
      primaryText: a.adapted.primaryText,
      cta: 'Get quote',
      included: true,
    }),
  );

  return [...proven, ...organic, ...competitor, ...ai];
}

/** Materialize the finished draft + ad-set + concepts into a single Campaign
 *  for the table. Builds the full `adSets: AdSet[]` hierarchy AND a flat
 *  `ads: Ad[]` array for back-compat with the existing table renderers. */
function buildCampaign(
  draft: MetaCampaignDraft,
  adSetDraft: AdSetDraft,
  concepts: Concept[],
): Campaign {
  const includedVariants = concepts.flatMap((c) =>
    c.variants.filter((v) => v.included).map((v) => ({ concept: c, variant: v })),
  );
  const perAdBudget = Math.max(
    1,
    Math.round(draft.budgetAmount / Math.max(1, includedVariants.length)),
  );
  const childAds: Ad[] = includedVariants.map(({ concept, variant }, i) => ({
    id: variant.id,
    name:
      variant.customName?.trim() ||
      `${variant.format} — ${concept.name} v${i + 1}`,
    thumb: variant.image,
    budget: perAdBudget,
    spent: 0,
    results: 0,
    costPerResult: 0,
    impressions: 0,
    ctr: 0,
    status: 'testing',
    enabled: true,
  }));

  // 1 concept = 1 ad set is the v1 default. Each concept materializes its
  // own ad set on launch, inheriting the Stage 2 template (targeting,
  // pixel, destination, audience) and taking its name from the concept.
  const builtAdSets: AdSet[] = concepts
    .filter((c) => c.variants.some((v) => v.included))
    .map((concept, i) => ({
      id: `adset-${Date.now()}-${i}`,
      name: `${draft.name} – ${concept.name}`,
      conversionLocation: adSetDraft.conversionLocation,
      performanceGoal: adSetDraft.performanceGoal,
      conversionEvent: adSetDraft.conversionEvent,
      pixelId: adSetDraft.pixelId,
      pixelName: adSetDraft.pixelName,
      websiteUrl: adSetDraft.websiteUrl,
      audienceMode: adSetDraft.audienceMode,
      ageMin: adSetDraft.ageMin,
      ageMax: adSetDraft.ageMax,
      gender: adSetDraft.gender,
      language: adSetDraft.language,
      locations: [...adSetDraft.locations],
      detailedTargeting: [...adSetDraft.detailedTargeting],
      customAudiences: [...adSetDraft.customAudiences],
      exclusions: [...adSetDraft.exclusions],
      placementsMode: adSetDraft.placementsMode,
      manualPlacements: adSetDraft.manualPlacements ? [...adSetDraft.manualPlacements] : undefined,
      concepts: [{
        ...concept,
        variants: concept.variants.filter((v) => v.included),
      }],
    }));

  return {
    id: `new-${Date.now()}`,
    name: draft.name,
    budget: draft.budgetAmount,
    spent: 0,
    results: 0,
    costPerResult: 0,
    status: 'testing',
    enabled: true,
    ads: childAds.length ? childAds : undefined,
    adSets: builtAdSets.length ? builtAdSets : undefined,
  };
}

export function MetaCampaignProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<MetaCampaignStep>(1);
  const [draft, setDraftState] = useState<MetaCampaignDraft>(DEFAULT_DRAFT);
  const [adSetDraft, setAdSetDraftState] = useState<AdSetDraft>(() =>
    buildDefaultAdSetDraft(DEFAULT_DRAFT.name),
  );
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [createdCampaigns, setCreatedCampaigns] = useState<Campaign[]>([]);
  const [addedAdsByCampaign, setAddedAdsByCampaign] = useState<Record<string, Ad[]>>({});
  const [addedConceptsByCampaign, setAddedConceptsByCampaign] = useState<Record<string, Concept[]>>({});
  const [adSetEditsByCampaign, setAdSetEditsByCampaign] = useState<Record<string, Record<string, Partial<AdSet>>>>({});
  const [safetyNetByCampaign, setSafetyNetByCampaign] = useState<Record<string, SafetyNetConfig>>({});
  const [pendingSafetyNet, setPendingSafetyNet] = useState<SafetyNetConfig | null>(null);
  const [launchBlocked, setLaunchBlocked] = useState(false);
  const { showToast } = useToast();

  // ─── Add-ads flow + safety net (unchanged) ───────────────────────────
  const addAdsToCampaign = useCallback((campaignId: string, ads: Ad[]) => {
    if (ads.length === 0) return;
    setAddedAdsByCampaign((prev) => ({
      ...prev,
      [campaignId]: [...(prev[campaignId] ?? []), ...ads],
    }));
    showToast({
      message: `${ads.length} ad${ads.length === 1 ? '' : 's'} added to this campaign`,
    });
  }, [showToast]);

  const addConceptToCampaign = useCallback((campaignId: string, concept: Concept) => {
    setAddedConceptsByCampaign((prev) => ({
      ...prev,
      [campaignId]: [...(prev[campaignId] ?? []), concept],
    }));
    showToast({
      message: `New ad set "${concept.name}" added — pick creative to fill it.`,
    });
  }, [showToast]);

  const updateAdSet = useCallback(
    (campaignId: string, adSetId: string, patch: Partial<AdSet>) => {
      setAdSetEditsByCampaign((prev) => ({
        ...prev,
        [campaignId]: {
          ...(prev[campaignId] ?? {}),
          [adSetId]: { ...((prev[campaignId] ?? {})[adSetId] ?? {}), ...patch },
        },
      }));
      showToast({ message: 'Ad set updated' });
    },
    [showToast],
  );

  const setSafetyNet = useCallback((campaignId: string, config: SafetyNetConfig) => {
    setSafetyNetByCampaign((prev) => ({ ...prev, [campaignId]: config }));
  }, []);

  // ─── Stage 1: campaign draft ─────────────────────────────────────────
  const setDraft = useCallback(
    (updater: (prev: MetaCampaignDraft) => MetaCampaignDraft) =>
      setDraftState((prev) => updater(prev)),
    [],
  );

  const regenerateTopic = useCallback(() => {
    setDraftState((prev) => {
      const idx = TOPIC_ALTERNATES.indexOf(prev.campaignTopic);
      const nextIdx = (idx + 1) % TOPIC_ALTERNATES.length;
      return { ...prev, campaignTopic: TOPIC_ALTERNATES[nextIdx]! };
    });
  }, []);

  // ─── Stage 2: ad-set draft ───────────────────────────────────────────
  const setAdSetDraft = useCallback(
    (updater: (prev: AdSetDraft) => AdSetDraft) =>
      setAdSetDraftState((prev) => updater(prev)),
    [],
  );

  const setAdSetField = useCallback(
    <K extends keyof AdSetDraft>(key: K, value: AdSetDraft[K]) => {
      setAdSetDraftState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // ─── Stage 3: concepts & variants ────────────────────────────────────
  const addConcept = useCallback((concept: Concept) => {
    setConcepts((prev) => [...prev, concept]);
  }, []);

  const removeConcept = useCallback((conceptId: string) => {
    setConcepts((prev) => prev.filter((c) => c.id !== conceptId));
  }, []);

  const updateConcept = useCallback(
    (conceptId: string, patch: Partial<Omit<Concept, 'id' | 'variants' | 'copy'>>) => {
      setConcepts((prev) =>
        prev.map((c) => (c.id === conceptId ? { ...c, ...patch } : c)),
      );
    },
    [],
  );

  const updateConceptCopy = useCallback(
    (conceptId: string, patch: Partial<CopyBundle>) => {
      setConcepts((prev) =>
        prev.map((c) =>
          c.id === conceptId ? { ...c, copy: { ...c.copy, ...patch } } : c,
        ),
      );
    },
    [],
  );

  const addVariantToConcept = useCallback(
    (conceptId: string, variant: Variant) => {
      setConcepts((prev) =>
        prev.map((c) =>
          c.id === conceptId ? { ...c, variants: [...c.variants, variant] } : c,
        ),
      );
    },
    [],
  );

  const removeVariant = useCallback((conceptId: string, variantId: string) => {
    setConcepts((prev) =>
      prev.map((c) =>
        c.id === conceptId
          ? { ...c, variants: c.variants.filter((v) => v.id !== variantId) }
          : c,
      ),
    );
  }, []);

  const setVariantIncluded = useCallback(
    (conceptId: string, variantId: string, included: boolean) => {
      setConcepts((prev) =>
        prev.map((c) =>
          c.id === conceptId
            ? {
                ...c,
                variants: c.variants.map((v) =>
                  v.id === variantId ? { ...v, included } : v,
                ),
              }
            : c,
        ),
      );
    },
    [],
  );

  const setVariantCustomName = useCallback(
    (conceptId: string, variantId: string, name: string) => {
      setConcepts((prev) =>
        prev.map((c) =>
          c.id === conceptId
            ? {
                ...c,
                variants: c.variants.map((v) =>
                  v.id === variantId ? { ...v, customName: name } : v,
                ),
              }
            : c,
        ),
      );
    },
    [],
  );

  const updateVariant = useCallback(
    (conceptId: string, variantId: string, patch: Partial<Variant>) => {
      setConcepts((prev) =>
        prev.map((c) =>
          c.id === conceptId
            ? {
                ...c,
                variants: c.variants.map((v) =>
                  v.id === variantId ? { ...v, ...patch } : v,
                ),
              }
            : c,
        ),
      );
    },
    [],
  );

  const setVariantOverride = useCallback(
    <K extends keyof CopyOverrides>(
      conceptId: string,
      variantId: string,
      field: K,
      value: CopyOverrides[K],
    ) => {
      setConcepts((prev) =>
        prev.map((c) =>
          c.id === conceptId
            ? {
                ...c,
                variants: c.variants.map((v) =>
                  v.id === variantId
                    ? {
                        ...v,
                        overrides: { ...(v.overrides ?? {}), [field]: value },
                      }
                    : v,
                ),
              }
            : c,
        ),
      );
    },
    [],
  );

  const clearVariantOverride = useCallback(
    (conceptId: string, variantId: string, field?: keyof CopyOverrides) => {
      setConcepts((prev) =>
        prev.map((c) =>
          c.id === conceptId
            ? {
                ...c,
                variants: c.variants.map((v) => {
                  if (v.id !== variantId) return v;
                  if (!field) return { ...v, overrides: undefined };
                  if (!v.overrides) return v;
                  const next = { ...v.overrides };
                  delete next[field];
                  return {
                    ...v,
                    overrides: Object.keys(next).length ? next : undefined,
                  };
                }),
              }
            : c,
        ),
      );
    },
    [],
  );

  // ─── Wizard control ──────────────────────────────────────────────────
  const start = useCallback(() => {
    setStep(1);
    setDraftState(DEFAULT_DRAFT);
    setAdSetDraftState(buildDefaultAdSetDraft(DEFAULT_DRAFT.name));
    // Seed one recommended default concept so Stage 3 lands populated.
    const seed = recommendedDefaultConcept();
    setConcepts(seed ? [seed] : []);
    setLaunchBlocked(false);
    setPendingSafetyNet(null);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const next = useCallback(() => {
    setStep((s) => (s < 4 ? ((s + 1) as MetaCampaignStep) : s));
  }, []);

  const back = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as MetaCampaignStep) : s));
  }, []);

  const finish = useCallback((safetyNet?: SafetyNetConfig) => {
    const campaign = buildCampaign(draft, adSetDraft, concepts);
    setCreatedCampaigns((prev) => [campaign, ...prev]);
    if (safetyNet) {
      setSafetyNetByCampaign((prev) => ({ ...prev, [campaign.id]: safetyNet }));
    }
    setOpen(false);
    setLaunchBlocked(false);
    const count = concepts.reduce(
      (sum, c) => sum + c.variants.filter((v) => v.included).length,
      0,
    );
    const activeRules = safetyNet
      ? [safetyNet.pauseCprAbove, safetyNet.capWeeklySpend, safetyNet.alertCtrBelow].filter(
          (r) => r.enabled,
        ).length
      : 0;
    const safetyPhrase = activeRules > 0 ? ` with ${activeRules} safety rule${activeRules === 1 ? '' : 's'} active` : '';
    showToast({
      message: `${draft.name} is live with ${count} ad${count === 1 ? '' : 's'} in testing${safetyPhrase}`,
    });
  }, [draft, adSetDraft, concepts, showToast]);

  const value = useMemo<MetaCampaignContextValue>(
    () => ({
      open,
      step,
      draft,
      setDraft,
      regenerateTopic,
      adSetDraft,
      setAdSetDraft,
      setAdSetField,
      concepts,
      addConcept,
      removeConcept,
      updateConcept,
      updateConceptCopy,
      addVariantToConcept,
      removeVariant,
      setVariantIncluded,
      setVariantCustomName,
      updateVariant,
      setVariantOverride,
      clearVariantOverride,
      createdCampaigns,
      addedAdsByCampaign,
      addAdsToCampaign,
      addedConceptsByCampaign,
      addConceptToCampaign,
      adSetEditsByCampaign,
      updateAdSet,
      safetyNetByCampaign,
      setSafetyNet,
      pendingSafetyNet,
      setPendingSafetyNet,
      launchBlocked,
      setLaunchBlocked,
      start,
      close,
      next,
      back,
      finish,
    }),
    [
      open,
      step,
      draft,
      setDraft,
      regenerateTopic,
      adSetDraft,
      setAdSetDraft,
      setAdSetField,
      concepts,
      addConcept,
      removeConcept,
      updateConcept,
      updateConceptCopy,
      addVariantToConcept,
      removeVariant,
      setVariantIncluded,
      setVariantCustomName,
      updateVariant,
      setVariantOverride,
      clearVariantOverride,
      createdCampaigns,
      addedAdsByCampaign,
      addAdsToCampaign,
      addedConceptsByCampaign,
      addConceptToCampaign,
      adSetEditsByCampaign,
      updateAdSet,
      safetyNetByCampaign,
      setSafetyNet,
      pendingSafetyNet,
      launchBlocked,
      start,
      close,
      next,
      back,
      finish,
    ],
  );

  return (
    <MetaCampaignContext.Provider value={value}>
      {children}
    </MetaCampaignContext.Provider>
  );
}

export function useMetaCampaign(): MetaCampaignContextValue {
  const ctx = useContext(MetaCampaignContext);
  if (!ctx) {
    throw new Error('useMetaCampaign must be used inside <MetaCampaignProvider>');
  }
  return ctx;
}

export { OBJECTIVE_LABEL };
