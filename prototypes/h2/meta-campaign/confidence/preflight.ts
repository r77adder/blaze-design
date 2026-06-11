// Pure function that produces the ordered checklist of pre-launch checks for
// the current draft + ad slate. UI components render its output and wire the
// optional `fix` callbacks to the relevant context setters.
import type { GeneratedAd, MetaCampaignDraft } from '../meta-campaign-context';
import type { PreflightCheck, PreflightStatus } from './types';

const META_DAILY_MIN = 10;

export interface PreflightInput {
  draft: MetaCampaignDraft;
  generatedAds: GeneratedAd[];
  /** Computed elsewhere (e.g. estimateAudience().fillPct in Step5Review). */
  audienceFillPct: number;
  /** Fix callbacks supplied by the caller — wired to context setters at the
   *  composition seam in Step5Review so the helper stays pure-functional. */
  fixes?: {
    titleCaseAllCapsHeadlines?: () => void;
    focusDestinationUrl?: () => void;
  };
}

export interface PreflightResult {
  checks: PreflightCheck[];
  hasRedBlocker: boolean;
  greenCount: number;
  attentionCount: number;
}

export function runPreflight(input: PreflightInput): PreflightResult {
  const { draft, generatedAds, audienceFillPct, fixes } = input;
  const included = generatedAds.filter((a) => a.included);

  const checks: PreflightCheck[] = [];

  // Pixel — static green per origin doc (we pretend pixel is connected).
  checks.push({
    id: 'pixel',
    status: 'green',
    label: 'Meta Pixel connected',
    detail: 'Conversions will attribute back to this campaign.',
  });

  // Destination URL
  const hasUrl = (draft.websiteUrl ?? '').trim().length > 0;
  checks.push({
    id: 'destination',
    status: hasUrl ? 'green' : 'red',
    label: hasUrl ? 'Destination URL set' : 'Destination URL is missing',
    detail: hasUrl ? draft.websiteUrl : 'Add a landing URL on Step 1.',
    fix: fixes?.focusDestinationUrl,
    fixLabel: hasUrl ? undefined : 'Go to Step 1',
  });

  // Budget meets Meta minimum
  const budgetOK = draft.dailyBudget >= META_DAILY_MIN;
  checks.push({
    id: 'budget-min',
    status: budgetOK ? 'green' : 'red',
    label: budgetOK
      ? `Daily budget meets Meta minimum ($${draft.dailyBudget}/day)`
      : `Daily budget below Meta minimum ($${META_DAILY_MIN}/day required)`,
  });

  // Audience size in recommended band — uses the existing estimator's fillPct
  // signal (Step5Review's estimateAudience()). 22..70% is the "Recommended" band.
  const audienceStatus: PreflightStatus =
    audienceFillPct >= 22 && audienceFillPct <= 70 ? 'green' : 'amber';
  const audienceLabel =
    audienceFillPct < 22
      ? 'Audience is narrow — delivery may be expensive'
      : audienceFillPct > 70
        ? 'Audience is broad — relevance may suffer'
        : 'Audience size is in the recommended range';
  checks.push({
    id: 'audience',
    status: audienceStatus,
    label: audienceLabel,
  });

  // At least one ad included
  const hasAds = included.length > 0;
  checks.push({
    id: 'at-least-one-ad',
    status: hasAds ? 'green' : 'red',
    label: hasAds
      ? `${included.length} ad${included.length === 1 ? '' : 's'} included`
      : 'At least one ad must be included',
  });

  // Every included ad has a headline
  const missingHeadline = included.some((a) => !a.headline.trim());
  checks.push({
    id: 'ads-have-headline',
    status: missingHeadline ? 'red' : 'green',
    label: missingHeadline
      ? 'One or more ads are missing a headline'
      : 'All ads have a headline',
  });

  // Every included ad has caption text
  const missingCaption = included.some((a) => !a.primaryText.trim());
  checks.push({
    id: 'ads-have-caption',
    status: missingCaption ? 'red' : 'green',
    label: missingCaption
      ? 'One or more ads are missing a caption'
      : 'All ads have a caption',
  });

  // All-caps headline detector — amber with 1-click fix when fully uppercase.
  const allCapsAds = included.filter((a) => isAllCaps(a.headline));
  checks.push({
    id: 'ads-no-all-caps',
    status: allCapsAds.length > 0 ? 'amber' : 'green',
    label:
      allCapsAds.length > 0
        ? `${allCapsAds.length} headline${allCapsAds.length === 1 ? '' : 's'} in all caps`
        : 'No all-caps headlines',
    detail:
      allCapsAds.length > 0
        ? 'All-caps reads as shouting and tends to underperform.'
        : undefined,
    fix: allCapsAds.length > 0 ? fixes?.titleCaseAllCapsHeadlines : undefined,
    fixLabel: allCapsAds.length > 0 ? 'Title-case all' : undefined,
  });

  // Special ad categories acknowledgement — soft amber when toggled off.
  // For a painting business, this is the right default; we just nudge so the
  // user is reminded that the choice was deliberate.
  checks.push({
    id: 'special-ad-categories',
    status: draft.specialCategories ? 'amber' : 'green',
    label: draft.specialCategories
      ? 'Declared as a special ad category'
      : 'No special ad categories required',
    detail: draft.specialCategories
      ? 'Targeting restrictions apply per Meta policy.'
      : undefined,
  });

  const hasRedBlocker = checks.some((c) => c.status === 'red');
  const greenCount = checks.filter((c) => c.status === 'green').length;
  const attentionCount = checks.length - greenCount;

  return { checks, hasRedBlocker, greenCount, attentionCount };
}

/** Headline is "all caps" if 60%+ of its alphabetic characters are uppercase
 *  AND it contains at least two letters. Tolerates one shouty word in an
 *  otherwise mixed-case sentence. */
function isAllCaps(headline: string): boolean {
  const letters = headline.replace(/[^A-Za-z]/g, '');
  if (letters.length < 2) return false;
  const upper = headline.replace(/[^A-Z]/g, '').length;
  return upper / letters.length >= 0.6;
}

/** Title-case helper used by the 1-click fix. Title-cases every word; leaves
 *  short connector words lowercase except at the start. */
export function titleCaseHeadline(s: string): string {
  const SHORT = new Set(['a', 'an', 'and', 'or', 'the', 'in', 'on', 'of', 'to', 'for', 'at', 'by']);
  return s
    .toLowerCase()
    .split(/(\s+)/)
    .map((token, idx) => {
      if (/^\s+$/.test(token)) return token;
      if (idx > 0 && SHORT.has(token)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join('');
}
