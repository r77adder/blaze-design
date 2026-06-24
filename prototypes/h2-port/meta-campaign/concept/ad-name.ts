// Default ad-name generator and resolver. Pattern:
//   {CampaignFirstWord}_{ConceptFirstWord}_{VariantFormat}_v{Sequence}
// Examples:
//   SpringExterior_OwnerLed_Reel_v1
//   SpringExterior_OwnerLed_Static_v2
//
// A variant's `customName?` overrides the generated default when present.
import type { Concept, Variant } from './types';

/** Strip non-ASCII / collapse whitespace into a single camel-able token. */
function tokenize(input: string): string {
  return input
    .replace(/[^A-Za-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (i === 0 ? capitalize(w) : capitalize(w)))
    .join('')
    .slice(0, 24);
}

function capitalize(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

/** Generate the default ad name for a variant. */
export function defaultAdName({
  campaignName,
  concept,
  variant,
  index,
}: {
  campaignName: string;
  concept: Concept;
  variant: Variant;
  index: number;
}): string {
  const campaignToken = tokenize(campaignName) || 'Campaign';
  const conceptToken = tokenize(concept.name) || 'Concept';
  const format = variant.format;
  const seq = index + 1;
  return `${campaignToken}_${conceptToken}_${format}_v${seq}`;
}

/** Resolved name: custom override if present, else the generated default. */
export function resolveAdName(params: {
  campaignName: string;
  concept: Concept;
  variant: Variant;
  index: number;
}): string {
  if (params.variant.customName && params.variant.customName.trim().length > 0) {
    return params.variant.customName;
  }
  return defaultAdName(params);
}
