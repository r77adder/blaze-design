import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { BUSINESS_TYPES, type BusinessType, type ToolId } from '../tools-context';
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

/** Stable identifier for every screen — the source of truth for routing in
 *  `<Onboarding>`. Numeric `step` is just an index into `STEP_SEQUENCE`; the
 *  ID is what tells you WHAT to render. */
export type StepId =
  | 'website'
  | 'loading'
  | 'basics'
  | 'scorecard'
  | 'strategy-diy'
  | 'pricing-diy'
  | 'checkout';

/** Screen order. Used by `next`/`back`, the progress bar, and the router in
 *  `<Onboarding>`. Keep this in sync with the StepId union. */
export const STEP_SEQUENCE: StepId[] = [
  'website',
  'loading',
  'basics',
  'scorecard',
  'strategy-diy',
  'pricing-diy',
  'checkout',
];

/**
 * Terms used across the onboarding pricing screens.
 *   1  → "Monthly"
 *   3, 6, 12, 18 → longer terms (deeper discounts)
 *
 * The DIY pricing UI exposes [1, 3, 6, 12, 18].
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
  websiteUrl: string;
  contentLanguage: string;
  profile: BusinessProfile;
  /** Step 5 selection — uses the DIY feature catalog (diy-features.ts), NOT
   *  the global ToolId set, because DIY introduces Local SEO + Competitor
   *  Ranking which aren't billed ToolIds. Starts with 3 (Starter sweet-spot);
   *  adding a 4th jumps the user to Growth. */
  diyFeatures: DiyFeatureId[];
  term: Term;
}

// v6: onboarding collapsed to a single DIY-only flow — dropped the `track`
// and `dfySelectedTools` keys. Bumping the key invalidates v5 entries cleanly
// — fine for prototype storage.
const STORAGE_KEY = 'h2-onboarding-v6';

const INITIAL_STATE: OnboardingState = {
  active: true,
  step: 1,
  complete: false,
  websiteUrl: '',
  contentLanguage: 'English (US)',
  profile: DEFAULT_PROFILE,
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
  setWebsiteUrl: (url: string) => void;
  setContentLanguage: (lang: string) => void;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  setBusinessType: (type: BusinessType) => void;
  /** Addable-feature toggle (operates on the DIY feature catalog). */
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
      const max = STEP_SEQUENCE.length;
      return { ...s, step: Math.max(1, Math.min(max, step)) };
    });
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      const max = STEP_SEQUENCE.length;
      return { ...s, step: Math.min(max, s.step + 1) };
    });
  }, []);

  const back = useCallback(() => {
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) }));
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

  // ToolId[] view of the selection: maps the addable feature catalog down to
  // ToolIds (Local SEO / Competitor Ranking drop out — they have no billed
  // ToolId). This feeds Home cold post-trial.
  const selectedTools = diyFeatureToolIds(state.diyFeatures);

  const totalSteps = STEP_SEQUENCE.length;
  const stepId = STEP_SEQUENCE[Math.min(state.step, totalSteps) - 1];

  const value = useMemo<OnboardingContextValue>(
    () => ({
      ...state,
      selectedTools,
      stepId,
      totalSteps,
      setStep,
      next,
      back,
      setWebsiteUrl,
      setContentLanguage,
      updateProfile,
      setBusinessType,
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
      setWebsiteUrl,
      setContentLanguage,
      updateProfile,
      setBusinessType,
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
