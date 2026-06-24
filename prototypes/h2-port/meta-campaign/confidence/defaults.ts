// Compute sensible default safety-net thresholds from the user's history,
// falling back to category benchmarks when history is empty.
import type { Campaign } from '../../pages/PaidSocial';
import type { MetaCampaignDraft } from '../meta-campaign-context';
import type { SafetyNetConfig } from './types';

const CATEGORY_BENCHMARK_CPR = 78; // ~$78/lead in the home-services painting set
const CATEGORY_BENCHMARK_CTR_FLOOR = 1.5; // alert below 1.5%

/**
 * Compute Blaze-suggested safety-net thresholds anchored to the user's past
 * campaigns. All rules default to enabled — the user can toggle them off.
 */
export function defaultSafetyNetForDraft(
  draft: MetaCampaignDraft,
  history: Campaign[],
): SafetyNetConfig {
  const historicalCpr = medianCpr(history);
  const pauseCprAbove = Math.max(
    20,
    Math.round((historicalCpr ?? CATEGORY_BENCHMARK_CPR) * 1.4),
  );
  const capWeeklySpend = Math.round(draft.dailyBudget * 7 * 1.2);
  return {
    pauseCprAbove: { enabled: true, threshold: pauseCprAbove },
    capWeeklySpend: { enabled: true, threshold: capWeeklySpend },
    alertCtrBelow: { enabled: true, threshold: CATEGORY_BENCHMARK_CTR_FLOOR },
  };
}

function medianCpr(history: Campaign[]): number | undefined {
  const values = history
    .map((c) => c.costPerResult)
    .filter((v): v is number => typeof v === 'number' && v > 0);
  if (values.length === 0) return undefined;
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return values.length % 2 === 0
    ? (values[mid - 1]! + values[mid]!) / 2
    : values[mid]!;
}
