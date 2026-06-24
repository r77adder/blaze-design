// Shared types for the Pre-launch Confidence Layer.

export interface SafetyRule {
  enabled: boolean;
  /** Threshold value — its unit depends on which rule (dollars, percent, etc.). */
  threshold: number;
}

export interface SafetyNetConfig {
  /** Auto-pause an ad when its CPR exceeds this dollar threshold for 3 days. */
  pauseCprAbove: SafetyRule;
  /** Hard cap on total weekly spend in dollars. */
  capWeeklySpend: SafetyRule;
  /** Alert when any ad's CTR drops below this percentage. */
  alertCtrBelow: SafetyRule;
}

export type PreflightStatus = 'green' | 'amber' | 'red';

/** What a single preflight item asks the user to confirm. */
export interface PreflightCheck {
  /** Stable id used for tracking & 1-click fix wiring. */
  id: string;
  status: PreflightStatus;
  label: string;
  /** Optional secondary line shown beneath the label. */
  detail?: string;
  /** Optional 1-click fix — when present, the UI renders a button that
   *  invokes it. Returning void; the function is expected to mutate state
   *  via context setters. */
  fix?: () => void;
  /** Label for the fix button when present, e.g. "Title-case". */
  fixLabel?: string;
}

/** Result of finding the closest historical campaign for the "Similar to" card. */
export interface SimilarMatch {
  campaignId: string;
  campaignName: string;
  /** Composite score; higher is closer. */
  score: number;
  /** Human-readable dimensions where the new campaign aligns with this one. */
  similarities: string[];
  /** Human-readable dimensions where the new campaign departs from this one. */
  differences: string[];
  /** Performance recap, sourced from the matched campaign. */
  metrics: {
    ctr?: number;
    costPerResult?: number;
    impressions?: number;
    results?: number;
    status?: string;
  };
}
