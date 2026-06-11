// Helpers for resolving a variant's effective copy and detecting deviations
// from its parent concept. Pure functions — easy to call from anywhere.
import type { Concept, CopyBundle, Variant } from './types';

/** Merge a variant's overrides over its concept's shared copy. */
export function resolveVariantCopy(variant: Variant, concept: Concept): CopyBundle {
  const o = variant.overrides ?? {};
  return {
    primaryText: o.primaryText ?? concept.copy.primaryText,
    headline: o.headline ?? concept.copy.headline,
    description: o.description ?? concept.copy.description,
    cta: o.cta ?? concept.copy.cta,
  };
}

/** True when the variant has at least one non-empty override that diverges
 *  from the concept's shared copy. Empty-string overrides count as no
 *  deviation (intentional clear). */
export function variantHasDeviation(variant: Variant, concept: Concept): boolean {
  const o = variant.overrides;
  if (!o) return false;
  if (o.primaryText && o.primaryText !== concept.copy.primaryText) return true;
  if (o.headline && o.headline !== concept.copy.headline) return true;
  if (o.description && o.description !== concept.copy.description) return true;
  if (o.cta && o.cta !== concept.copy.cta) return true;
  return false;
}

/** Count of variants under a concept whose copy deviates. Used for the
 *  "1 variant deviates" indicator on the concept card header. */
export function countDeviatingVariants(concept: Concept): number {
  return concept.variants.filter((v) => variantHasDeviation(v, concept)).length;
}
