import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { BUSINESS_TYPES, ALL_TOOLS, type BusinessType, type ToolId } from '../tools-context';
import {
  DEFAULT_DIY_FEATURES,
  diyFeatureToolIds,
  type DiyFeatureId,
} from './diy-features';

/**
 * OnboardingProvider — owns the prototype's first-run onboarding state for
 * the H2 prototype. The flow is rendered as a full-screen takeover (no
 * H2Layout chrome) by `<Onboarding />`. State is persisted to localStorage
 * so reload-mid-flow resumes; the DevStatePanel has a global toggle that
 * resets it to step 1 for re-demoing.
 *
 * Single self-serve (DIY) flow. Steps:
 *   1 website prompt
 *   2 loading/learning
 *   3 business profile basics
 *   4 promotional business scorecard
 *   5 pick your DIY features (build your plan)
 *   6 pricing (1/3/6/12/18 mo term picker, flat plan tier)
 *   7 mock Stripe checkout
 * After step 7 → `complete = true` and the user lands on Home (cold state).
 */

/** 1-indexed step within the onboarding sequence; clamp via `next`/`back`. */
export type OnboardingStep = number;

/**
 * Onboarding tracks — two self-serve onboarding variants we're A/B exploring:
 *   - `v1`  first version (per-feature opt-out selection, per-feature pricing).
 *   - `v2`  second version (additive feature catalog, flat plan-tier pricing).
 */
export type OnboardingTrack = 'v1' | 'v2';

/** Stable identifier for every screen — the source of truth for routing in
 *  `<Onboarding>`. Numeric `step` is just an index into `STEP_SEQUENCE`; the
 *  ID is what tells you WHAT to render. */
export type StepId =
  | 'website'
  | 'loading'
  | 'basics'
  | 'scorecard'
  // V1-only steps: the Strategy onboarding + Creative review flows folded into
  // the onboarding wizard (V2 runs these in the cold state instead).
  | 'creative-guidelines'
  | 'swipe-file'
  | 'goals-theme'
  | 'plan'
  | 'storyboard'
  | 'creative-feedback'
  | 'strategy-v1'
  | 'strategy-v2'
  | 'pricing-v1'
  | 'pricing-v2'
  // Legacy single-DIY-flow IDs — kept so the flat `STEP_SEQUENCE` and any
  // consumers that still reference the DIY screen names continue to compile.
  | 'strategy-diy'
  | 'pricing-diy'
  | 'checkout';

/** Per-track screen order. Used by `next`/`back`, the progress bar, and the
 *  router in `<Onboarding>`. Keep these in sync with the StepId union. */
export const TRACK_SEQUENCES: Record<OnboardingTrack, StepId[]> = {
  v1: [
    'website',
    'basics',
    'swipe-file',
    'creative-guidelines',
    'goals-theme',
    'plan',
    'storyboard',
    'creative-feedback',
    'pricing-v1',
    'checkout',
  ],
  v2: ['website', 'loading', 'basics', 'scorecard', 'strategy-v2', 'pricing-v2', 'checkout'],
};

/** Legacy flat screen order from the single self-serve (DIY) flow. Retained for
 *  backward compatibility with consumers that still reference `STEP_SEQUENCE`;
 *  new routing should read from `TRACK_SEQUENCES`. Keep in sync with StepId. */
export const STEP_SEQUENCE: StepId[] = [
  'website',
  'loading',
  'basics',
  'scorecard',
  'strategy-diy',
  'pricing-diy',
  'checkout',
];

/** Map a step ID to its equivalent in the other track when the user flips
 *  the prototype switch mid-flow. Strategy/pricing have direct counterparts. */
function equivalentStepId(stepId: StepId, newTrack: OnboardingTrack): StepId {
  const seq = TRACK_SEQUENCES[newTrack];
  if (seq.includes(stepId)) return stepId;
  if (stepId === 'strategy-v1') return 'strategy-v2';
  if (stepId === 'strategy-v2') return 'strategy-v1';
  if (stepId === 'pricing-v1') return 'pricing-v2';
  if (stepId === 'pricing-v2') return 'pricing-v1';
  // The V1-only strategy/creative steps have no V2 counterpart — land on the
  // last shared step (Scorecard) when switching tracks mid-flow.
  return seq.includes('scorecard') ? 'scorecard' : seq[0];
}

/**
 * Terms used across the onboarding pricing screens.
 *   1  → "Monthly" (V2 only)
 *   3, 6, 12 → shared
 *   18 → V2 only (longest, deepest discount)
 *
 * V1 pricing UI exposes only [3, 6, 12]; V2 exposes [1, 3, 6, 12, 18].
 */
export type Term = 1 | 3 | 6 | 12 | 18;

export interface BusinessProfile {
  name: string;
  type: BusinessType;
  elevatorPitch: string;
  audienceAgeMin: number;
  audienceAgeMax: number;
  audienceGender: string;
  audienceLocations: string[];
  contentAge: string;
  contentGender: string;
  contentEthnicity: string;
  primaryLanguage: string;
  positioningPrimary: string;
  positioningSecondary: string;
  positioningTertiary: string;
}

const DEFAULT_PROFILE: BusinessProfile = {
  name: 'CertaPro Painters of Austin',
  type: 'services',
  elevatorPitch:
    'A locally-owned residential and commercial painting contractor serving greater Austin for over a decade — trained crews, a job-site certified process, and concierge service from color consult to cleanup.',
  audienceAgeMin: 35,
  audienceAgeMax: 65,
  audienceGender: 'All Genders',
  audienceLocations: ['Austin, TX metro'],
  contentAge: '35-44',
  contentGender: 'All Genders',
  contentEthnicity: 'Multicultural/Diverse Group',
  primaryLanguage: 'English (US)',
  positioningPrimary:
    '"Your Local Painters" — a national-quality painting brand with deep Austin neighborhood expertise',
  positioningSecondary:
    '"We make the process easy and convenient" — color consultation, scheduling, prep, paint, cleanup handled end-to-end',
  positioningTertiary:
    '"Residential + commercial under one crew" — homeowners, HOAs, healthcare, restaurants, and offices served by the same trained team',
};

interface OnboardingState {
  /** True while the takeover is showing; toggling false lets the user out. */
  active: boolean;
  step: OnboardingStep;
  complete: boolean;
  /** Which onboarding flow is currently being run. Designers can flip this
   *  at any point via the top-right prototype switch — selections are kept
   *  per-track so the two flows feel independent. */
  track: OnboardingTrack;
  websiteUrl: string;
  contentLanguage: string;
  profile: BusinessProfile;
  /** V1 step 5 starts with everything on; user opts OUT of unwanted tools. */
  v1SelectedTools: ToolId[];
  /** V2 step 5 selection — uses the feature catalog (diy-features.ts), NOT the
   *  global ToolId set, because V2 introduces Local SEO + Competitor Ranking
   *  which aren't billed ToolIds. Starts with 3 (Starter sweet-spot); adding a
   *  4th jumps the user to Growth. */
  v2Features: DiyFeatureId[];
  /** Legacy single-DIY-flow selection — kept as an alias of `v2Features` so
   *  consumers that still read `diyFeatures` continue to work. Mirrors the
   *  same DIY feature catalog. */
  diyFeatures: DiyFeatureId[];
  term: Term;
}

// v6: renamed onboarding tracks dfy/diy → v1/v2 and the per-track state fields
// (dfySelectedTools → v1SelectedTools, diyFeatures → v2Features). The legacy
// single-DIY-flow `diyFeatures` key is mirrored from `v2Features` for backward
// compat. Bumping the key drops older entries cleanly — fine for prototype storage.
const STORAGE_KEY = 'h2-onboarding-v6';

// V1 default: every tool on. User opts OUT of unwanted features.
const V1_DEFAULT_SELECTED: ToolId[] = [...ALL_TOOLS];

const INITIAL_STATE: OnboardingState = {
  active: true,
  step: 1,
  complete: false,
  track: 'v1',
  websiteUrl: '',
  contentLanguage: 'English (US)',
  profile: DEFAULT_PROFILE,
  v1SelectedTools: V1_DEFAULT_SELECTED,
  v2Features: DEFAULT_DIY_FEATURES,
  diyFeatures: DEFAULT_DIY_FEATURES,
  term: 12,
};

function loadStored(): OnboardingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    // Forgiving merge — old shapes that don't include newer keys fall back to defaults.
    return {
      ...INITIAL_STATE,
      ...parsed,
      profile: { ...INITIAL_STATE.profile, ...(parsed.profile ?? {}) },
    };
  } catch {
    return null;
  }
}

interface OnboardingContextValue extends OnboardingState {
  /** ToolId[] view of the selection — the addable DIY features mapped to their
   *  ToolIds (drops Local SEO / Competitor Ranking, which have no billed
   *  ToolId). Used by the post-onboarding Home cold state. */
  selectedTools: ToolId[];
  /** The step ID for the current `step` — drives routing. */
  stepId: StepId;
  /** Total number of steps in the sequence. */
  totalSteps: number;
  setStep: (step: OnboardingStep) => void;
  next: () => void;
  back: () => void;
  setTrack: (track: OnboardingTrack) => void;
  setWebsiteUrl: (url: string) => void;
  setContentLanguage: (lang: string) => void;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  setBusinessType: (type: BusinessType) => void;
  /** V1 feature toggle (operates on the ToolId list). */
  toggleTool: (id: ToolId) => void;
  /** V2 addable-feature toggle (operates on the feature catalog). */
  toggleV2Feature: (id: DiyFeatureId) => void;
  /** Legacy addable-feature toggle (alias of `toggleV2Feature`, operates on
   *  the DIY feature catalog). Kept for backward compat with DIY-flow consumers. */
  toggleDiyFeature: (id: DiyFeatureId) => void;
  setTerm: (term: Term) => void;
  /** Mark complete + close the takeover. */
  finish: () => void;
  /** Close the takeover without marking complete — designer "skip" button. */
  skip: () => void;
  /** Open the takeover (re-trigger). Optionally reset to step 1. */
  open: (opts?: { reset?: boolean }) => void;
  /** Hard reset — wipes localStorage, returns to step 1, opens. */
  reset: () => void;
  /** Helpers exposed for nicer copy in the strategy step. */
  businessTypeLabel: string;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => loadStored() ?? INITIAL_STATE);

  // Persist on every change (cheap — small JSON).
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [state]);

  const setStep = useCallback((step: OnboardingStep) => {
    setState((s) => {
      const max = TRACK_SEQUENCES[s.track].length;
      return { ...s, step: Math.max(1, Math.min(max, step)) };
    });
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      const max = TRACK_SEQUENCES[s.track].length;
      return { ...s, step: Math.min(max, s.step + 1) };
    });
  }, []);

  const back = useCallback(() => {
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) }));
  }, []);

  const setTrack = useCallback((track: OnboardingTrack) => {
    setState((s) => {
      // 1) Snap term to one the new track can render.
      // Both tracks use the self-serve plan-tier term set now.
      const v1Terms: Term[] = [1, 3, 6, 12, 18];
      const v2Terms: Term[] = [1, 3, 6, 12, 18];
      const validTerms = track === 'v1' ? v1Terms : v2Terms;
      const term = validTerms.includes(s.term) ? s.term : 12;

      // 2) Translate the user's current screen into the new track's sequence
      //    so flipping the switch lands them on the equivalent step (e.g.
      //    V1-pricing ↔ V2-pricing) instead of jumping around at random.
      const oldSeq = TRACK_SEQUENCES[s.track];
      const newSeq = TRACK_SEQUENCES[track];
      const currentId = oldSeq[s.step - 1];
      const targetId = currentId ? equivalentStepId(currentId, track) : newSeq[0];
      const newStep = Math.max(1, newSeq.indexOf(targetId) + 1);

      return { ...s, track, term, step: newStep };
    });
  }, []);

  const setWebsiteUrl = useCallback((websiteUrl: string) => {
    setState((s) => ({ ...s, websiteUrl }));
  }, []);

  const setContentLanguage = useCallback((contentLanguage: string) => {
    setState((s) => ({ ...s, contentLanguage }));
  }, []);

  const updateProfile = useCallback((patch: Partial<BusinessProfile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  }, []);

  const setBusinessType = useCallback((type: BusinessType) => {
    setState((s) => ({ ...s, profile: { ...s.profile, type } }));
  }, []);

  const toggleTool = useCallback((id: ToolId) => {
    setState((s) => {
      const has = s.v1SelectedTools.includes(id);
      return {
        ...s,
        v1SelectedTools: has
          ? s.v1SelectedTools.filter((t) => t !== id)
          : [...s.v1SelectedTools, id],
      };
    });
  }, []);

  const toggleV2Feature = useCallback((id: DiyFeatureId) => {
    setState((s) => {
      const has = s.v2Features.includes(id);
      const next = has ? s.v2Features.filter((f) => f !== id) : [...s.v2Features, id];
      // Keep the legacy `diyFeatures` mirror in lockstep with `v2Features`.
      return { ...s, v2Features: next, diyFeatures: next };
    });
  }, []);

  // Legacy alias retained for DIY-flow consumers — delegates to the V2 toggle.
  const toggleDiyFeature = toggleV2Feature;

  const setTerm = useCallback((term: Term) => {
    setState((s) => ({ ...s, term }));
  }, []);

  const finish = useCallback(() => {
    setState((s) => ({ ...s, complete: true, active: false }));
  }, []);

  const skip = useCallback(() => {
    setState((s) => ({ ...s, active: false }));
  }, []);

  const open = useCallback((opts?: { reset?: boolean }) => {
    setState((s) =>
      opts?.reset
        ? { ...INITIAL_STATE, active: true }
        : { ...s, active: true, complete: false, step: s.complete ? 1 : s.step },
    );
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState({ ...INITIAL_STATE });
  }, []);

  const businessTypeLabel = useMemo(
    () => BUSINESS_TYPES.find((b) => b.id === state.profile.type)?.label ?? 'Services',
    [state.profile.type],
  );

  // Both tracks now use the self-serve additive model. The Home cold-state
  // feature rows map the V2 feature catalog down to ToolIds (Local SEO /
  // Competitor Ranking drop out — they have no billed ToolId).
  const selectedTools = diyFeatureToolIds(state.v2Features);

  const sequence = TRACK_SEQUENCES[state.track];
  const totalSteps = sequence.length;
  const stepId = sequence[Math.min(state.step, totalSteps) - 1];

  const value = useMemo<OnboardingContextValue>(
    () => ({
      ...state,
      selectedTools,
      stepId,
      totalSteps,
      setStep,
      next,
      back,
      setTrack,
      setWebsiteUrl,
      setContentLanguage,
      updateProfile,
      setBusinessType,
      toggleTool,
      toggleV2Feature,
      toggleDiyFeature,
      setTerm,
      finish,
      skip,
      open,
      reset,
      businessTypeLabel,
    }),
    [
      state,
      selectedTools,
      stepId,
      totalSteps,
      setStep,
      next,
      back,
      setTrack,
      setWebsiteUrl,
      setContentLanguage,
      updateProfile,
      setBusinessType,
      toggleTool,
      toggleV2Feature,
      toggleDiyFeature,
      setTerm,
      finish,
      skip,
      open,
      reset,
      businessTypeLabel,
    ],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return ctx;
}
