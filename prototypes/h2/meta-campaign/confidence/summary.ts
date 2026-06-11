// Plain-English campaign summary composer. Produces a 2–3 sentence paragraph
// that reads like a brief, not a config. Used above the Launch button on
// Step5Review.
import type { GeneratedAd, MetaCampaignDraft } from '../meta-campaign-context';
import { OBJECTIVE_LABEL, GENDER_LABEL } from '../meta-campaign-context';
import type { SafetyNetConfig } from './types';

export interface SummaryInput {
  draft: MetaCampaignDraft;
  generatedAds: GeneratedAd[];
  safetyNet: SafetyNetConfig;
  /** Approximate weeks the weekly-cap covers; if absent we omit duration. */
  durationWeeks?: number;
}

export function campaignSummary(input: SummaryInput): string {
  const { draft, generatedAds, safetyNet, durationWeeks } = input;
  const included = generatedAds.filter((a) => a.included);

  if (included.length === 0) {
    return 'No ads selected yet — pick at least one creative on Step 2 to ship.';
  }

  const breakdown = sourceBreakdown(included);
  const objectivePhrase = objectivePhraseFor(draft.objective);
  const audiencePhrase = audiencePhraseFor(draft);
  const weeklySpend = draft.dailyBudget * 7;
  const cadencePhrase = durationWeeks
    ? `Over ${durationWeeks} ${durationWeeks === 1 ? 'week' : 'weeks'}, `
    : '';
  const postLaunch = postLaunchPhrase(safetyNet);

  const sentence1 =
    `${cadencePhrase}Blaze will ${objectivePhrase} with ${included.length} ad${included.length === 1 ? '' : 's'} (${breakdown})` +
    ` to ${audiencePhrase}, on a $${draft.dailyBudget}/day budget` +
    ` (~$${weeklySpend.toLocaleString()}/week).`;

  const sentence2 = postLaunch ? ` ${postLaunch}` : '';

  return sentence1 + sentence2;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function sourceBreakdown(ads: GeneratedAd[]): string {
  const counts = { proven: 0, organic: 0, competitor: 0, ai: 0 };
  for (const a of ads) counts[a.source]++;

  const parts: string[] = [];
  if (counts.proven > 0) {
    parts.push(`${counts.proven} replay${counts.proven === 1 ? '' : 's'} of past winners`);
  }
  if (counts.organic > 0) {
    parts.push(`${counts.organic} boost${counts.organic === 1 ? '' : 's'} of your top posts`);
  }
  if (counts.competitor > 0) {
    parts.push(
      `${counts.competitor} competitor-inspired variant${counts.competitor === 1 ? '' : 's'}`,
    );
  }
  if (counts.ai > 0) {
    parts.push(`${counts.ai} Blaze-AI concept${counts.ai === 1 ? '' : 's'}`);
  }
  if (parts.length === 0) return ads.length.toString();
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

function objectivePhraseFor(o: MetaCampaignDraft['objective']): string {
  switch (o) {
    case 'leads':
      return 'capture leads';
    case 'sales':
      return 'drive sales';
    case 'engagement':
      return 'drive engagement';
    case 'app-promotion':
      return 'drive app installs';
    case 'awareness':
      return 'build awareness';
    case 'traffic':
      return 'send traffic to your site';
  }
}

function audiencePhraseFor(draft: MetaCampaignDraft): string {
  const ageRange = `${draft.ageMin}–${draft.ageMax}`;
  const gender = GENDER_LABEL[draft.gender].toLowerCase();
  const locations =
    draft.locations.length === 0
      ? 'broad reach'
      : draft.locations.length === 1
        ? draft.locations[0]
        : `${draft.locations[0]} and ${draft.locations.length - 1} other location${draft.locations.length === 2 ? '' : 's'}`;
  return `homeowners in ${locations}, ages ${ageRange}, ${gender}`;
}

function postLaunchPhrase(safetyNet: SafetyNetConfig): string {
  const actions: string[] = [];
  if (safetyNet.pauseCprAbove.enabled) {
    actions.push(`pause any ad whose cost per lead climbs above $${safetyNet.pauseCprAbove.threshold}`);
  }
  if (safetyNet.alertCtrBelow.enabled) {
    actions.push(`alert you if click-through drops below ${safetyNet.alertCtrBelow.threshold}%`);
  }
  if (safetyNet.capWeeklySpend.enabled) {
    actions.push(`stop spending past $${safetyNet.capWeeklySpend.threshold}/week`);
  }
  if (actions.length === 0) {
    return 'Blaze will watch performance — no safety rules are active.';
  }
  if (actions.length === 1) return `Blaze will ${actions[0]}.`;
  if (actions.length === 2) return `Blaze will ${actions[0]} and ${actions[1]}.`;
  return `Blaze will ${actions.slice(0, -1).join(', ')}, and ${actions[actions.length - 1]}.`;
}
