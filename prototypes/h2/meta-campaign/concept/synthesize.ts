// Read-time synthesizer that turns a flat-ads Campaign into the
// Campaign > Ad set > Concept > Variant hierarchy. Used by the detail page
// so the same hierarchy UI works for both wizard-built campaigns (which
// already populate `adSets`) and seed campaigns (which don't yet).
import type { Campaign, Ad } from '../../pages/PaidSocial';
import type { AdSet, Concept, Variant } from './types';
import { defaultAdSetName } from './defaults';

/** Always returns at least one ad set. If the campaign already populated
 *  `adSets` (built via the new wizard), returns those verbatim. Otherwise
 *  synthesizes a default ad set wrapping a single concept whose variants
 *  mirror the flat `ads` array.
 *
 *  `extraConcepts` — concepts authored on the detail page after launch
 *  via the "Add ad set" affordance. Each one becomes its own synthetic
 *  ad set (1 concept = 1 ad set).
 *
 *  `adSetEdits` — per-ad-set overrides (audience / targeting changes
 *  made via the detail page's Edit affordance). Applied last so they
 *  shadow whatever the base or synthetic ad set carried. */
export function synthesizeAdSets(
  campaign: Campaign,
  extraConcepts: Concept[] = [],
  adSetEdits: Record<string, Partial<AdSet>> = {},
): AdSet[] {
  const baseAdSets = synthesizeBaseAdSets(campaign);
  const extraAdSets: AdSet[] = extraConcepts.map((concept) => ({
    id: `synth-adset-${concept.id}`,
    name: `${campaign.name} – ${concept.name}`,
    performanceGoal: 'maximize-leads',
    conversionEvent: 'Lead',
    pixelId: 'pxl_blaze_certapro_austin',
    pixelName: 'CertaPro Austin Pixel',
    websiteUrl: 'https://certapro.com/austin',
    ageMin: 25,
    ageMax: 64,
    gender: 'all',
    language: 'English (US)',
    locations: ['Austin, TX · 25mi'],
    concepts: [concept],
  }));
  const all = [...baseAdSets, ...extraAdSets];
  if (Object.keys(adSetEdits).length === 0) return all;
  return all.map((adSet) => {
    const patch = adSetEdits[adSet.id];
    return patch ? { ...adSet, ...patch } : adSet;
  });
}

function synthesizeBaseAdSets(campaign: Campaign): AdSet[] {
  if (campaign.adSets && campaign.adSets.length > 0) return campaign.adSets;

  const ads: Ad[] = campaign.ads ?? [];
  const variants: Variant[] = ads.map((ad, i) => ({
    id: ad.id,
    sourceType: 'proven',
    sourceRefId: `synth-${campaign.id}-${i}`,
    sourceMetric: '',
    format: 'Static',
    image: ad.thumb,
    customName: ad.name,
    included: ad.enabled,
  }));

  const defaultConcept: Concept = {
    id: `synth-concept-${campaign.id}`,
    name: campaign.name,
    rationale: 'Seed campaign — Blaze synthesized one default concept wrapping the existing ads.',
    intendedAudience: 'Austin homeowners 25–65, home-improvement intent',
    valueProp: '',
    offerAngle: '',
    keyMessage: '',
    copy: {
      primaryText: '',
      headline: '',
      description: '',
      cta: 'Get quote',
    },
    variants,
  };

  return [
    {
      id: `synth-adset-${campaign.id}`,
      name: defaultAdSetName(campaign.name),
      performanceGoal: 'maximize-leads',
      conversionEvent: 'Lead',
      pixelId: 'pxl_blaze_certapro_austin',
      pixelName: 'CertaPro Austin Pixel',
      websiteUrl: 'https://certapro.com/austin',
      ageMin: 25,
      ageMax: 64,
      gender: 'all',
      language: 'English (US)',
      locations: ['Austin, TX · 25mi'],
      concepts: [defaultConcept],
    },
  ];
}

/** Count the total ads under a campaign's hierarchy (variants summed across
 *  all concepts in all ad sets). Falls back to the legacy flat `ads`
 *  array when no hierarchy is present yet. */
export function countAdsInCampaign(campaign: Campaign): number {
  if (campaign.adSets && campaign.adSets.length > 0) {
    return campaign.adSets.reduce(
      (sum, as) => sum + as.concepts.reduce((s2, c) => s2 + c.variants.length, 0),
      0,
    );
  }
  return campaign.ads?.length ?? 0;
}
