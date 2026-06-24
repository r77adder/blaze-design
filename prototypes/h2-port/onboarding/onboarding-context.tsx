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
 * Steps:
 *   1 website prompt
 *   2 loading/learning
 *   3 business profile basics
 *   4 promotional business scorecard
 *   5 confirm meta strategy (per-feature opt-out)
 *   6 pricing (3/6/12 mo term picker)
 *   7 mock Stripe checkout
 * After step 7 → `complete = true` and the user lands on Home (cold state).
 */

/** 1-indexed step within the active track's sequence. Both tracks today
 *  have 7 steps; clamp via `next`/`back`. */
export type OnboardingStep = number;

/**
 * Onboarding tracks:
 *   - `dfy`  "Done For You" (concierge, original flow).
 *   - `diy`  "Do It Yourself" (self-serve, flat plan).
 */
export type OnboardingTrack = 'dfy' | 'diy';

/** Stable identifier for every screen — the source of truth for routing in
 *  `<Onboarding>`. Numeric `step` is just an index into the active track's
 *  sequence; the ID is what tells you WHAT to render. */
export type StepId =
  | 'website'
  | 'loading'
  | 'basics'
  | 'scorecard'
  | 'strategy-dfy'
  | 'strategy-diy'
  | 'pricing-dfy'
  | 'pricing-diy'
  | 'checkout';

/** Per-track screen order. Used by `next`/`back`, the progress bar, and the
 *  router in `<Onboarding>`. Keep these in sync with the StepId union. */
export const TRACK_SEQUENCES: Record<OnboardingTrack, StepId[]> = {
  dfy: ['website', 'loading', 'basics', 'scorecard', 'strategy-dfy', 'pricing-dfy', 'checkout'],
  diy: ['website', 'loading', 'basics', 'scorecard', 'strategy-diy', 'pricing-diy', 'checkout'],
};

/** Map a step ID to its equivalent in the other track when the user flips
 *  the prototype switch mid-flow. Strategy/pricing have direct counterparts. */
function equivalentStepId(stepId: StepId, newTrack: OnboardingTrack): StepId {
  const seq = TRACK_SEQUENCES[newTrack];
  if (seq.includes(stepId)) return stepId;
  if (stepId === 'strategy-dfy') return 'strategy-diy';
  if (stepId === 'strategy-diy') return 'strategy-dfy';
  if (stepId === 'pricing-dfy') return 'pricing-diy';
  if (stepId === 'pricing-diy') return 'pricing-dfy';
  return seq[0];
}

/**
 * Terms used across the onboarding pricing screens.
 *   1  → "Monthly" (DIY only)
 *   3, 6, 12 → shared
 *   18 → DIY only (longest, deepest discount)
 *
 * DFY pricing UI exposes only [3, 6, 12]; DIY exposes [1, 3, 6, 12, 18].
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
    'CertaPro Painters of Austin is a locally-owned residential and commercial painting contractor serving the greater Austin metro for over a decade. Backed by the national CertaPro network and led by owner John Bunnell, the team pairs trained crews and a job-site certified process with concierge service — color consultation, prep, paint, cleanup — so homeowners and property managers get a finish they can show off and a project that wraps on schedule.',
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
  /** DFY step 5 starts with everything on; user opts OUT of unwanted tools. */
  dfySelectedTools: ToolId[];
  /** DIY step 5 selection — uses the DIY feature catalog (diy-features.ts),
   *  NOT the global ToolId set, because DIY introduces Local SEO + Competitor
   *  Ranking which aren't billed ToolIds. Starts with 3 (Starter sweet-spot);
   *  adding a 4th jumps the user to Growth. */
  diyFeatures: DiyFeatureId[];
  term: Term;
}

// v5: DIY selection moved from ToolId[] to the DIY feature catalog
// (diyFeatures: DiyFeatureId[]). Bumping the key invalidates v4 entries that
// still carry `diySelectedTools` cleanly — fine for prototype storage.
const STORAGE_KEY = 'h2-onboarding-v5';

// DFY default: every tool on. User opts OUT of unwanted features.
const DFY_DEFAULT_SELECTED: ToolId[] = [...ALL_TOOLS];

const INITIAL_STATE: OnboardingState = {
  active: true,
  step: 1,
  complete: false,
  track: 'dfy',
  websiteUrl: '',
  contentLanguage: 'English (US)',
  profile: DEFAULT_PROFILE,
  dfySelectedTools: DFY_DEFAULT_SELECTED,
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
  /** ToolId[] view of the current track's selection — for DFY it's the raw
   *  list; for DIY it's the addable features mapped to their ToolIds (drops
   *  Local SEO / Competitor Ranking, which have no billed ToolId). Used by the
   *  post-onboarding Home cold state. */
  selectedTools: ToolId[];
  /** The step ID for the current `(track, step)` pair — drives routing. */
  stepId: StepId;
  /** Total number of steps in the active track's sequence. */
  totalSteps: number;
  setStep: (step: OnboardingStep) => void;
  next: () => void;
  back: () => void;
  setTrack: (track: OnboardingTrack) => void;
  setWebsiteUrl: (url: string) => void;
  setContentLanguage: (lang: string) => void;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  setBusinessType: (type: BusinessType) => void;
  /** DFY feature toggle (operates on the ToolId list). */
  toggleTool: (id: ToolId) => void;
  /** DIY addable-feature toggle (operates on the DIY feature catalog). */
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
      const dfyTerms: Term[] = [3, 6, 12];
      const diyTerms: Term[] = [1, 3, 6, 12, 18];
      const validTerms = track === 'dfy' ? dfyTerms : diyTerms;
      const term = validTerms.includes(s.term) ? s.term : 12;

      // 2) Translate the user's current screen into the new track's sequence
      //    so flipping the switch lands them on the equivalent step (e.g.
      //    DFY-pricing ↔ DIY-pricing) instead of jumping around at random.
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
      const has = s.dfySelectedTools.includes(id);
      return {
        ...s,
        dfySelectedTools: has
          ? s.dfySelectedTools.filter((t) => t !== id)
          : [...s.dfySelectedTools, id],
      };
    });
  }, []);

  const toggleDiyFeature = useCallback((id: DiyFeatureId) => {
    setState((s) => {
      const has = s.diyFeatures.includes(id);
      return {
        ...s,
        diyFeatures: has
          ? s.diyFeatures.filter((f) => f !== id)
          : [...s.diyFeatures, id],
      };
    });
  }, []);

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

  // ToolId[] view of the selection: DFY uses its raw list; DIY maps its
  // addable feature catalog down to ToolIds (Local SEO / Competitor Ranking
  // drop out — they have no billed ToolId). This feeds Home cold post-trial.
  const selectedTools =
    state.track === 'dfy' ? state.dfySelectedTools : diyFeatureToolIds(state.diyFeatures);

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
