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

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Term = 3 | 6 | 12;

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
  name: 'Shereen Hoban Coaching',
  type: 'services',
  elevatorPitch:
    'Shereen Hoban is a woman veteran-owned graphic design agency that transcends traditional design services by combining military precision with creative storytelling. Operating at the intersection of strategic marketing design and specialized product development, SHD serves as both a creative partner and a mission-driven advocate for underserved communities.',
  audienceAgeMin: 18,
  audienceAgeMax: 100,
  audienceGender: 'All Genders',
  audienceLocations: ['United States'],
  contentAge: '18-24',
  contentGender: 'All Genders',
  contentEthnicity: 'Multicultural/Diverse Group',
  primaryLanguage: 'English (US)',
  positioningPrimary:
    '"The veteran designer who understands your mission" — leveraging unique military background to connect with purpose-driven organizations',
  positioningSecondary:
    '"Your strategic design partner from concept to completion" — emphasizing comprehensive, end-to-end service capability',
  positioningTertiary:
    '"Empowering communities through purposeful design" — highlighting social impact focus',
};

interface OnboardingState {
  /** True while the takeover is showing; toggling false lets the user out. */
  active: boolean;
  step: OnboardingStep;
  complete: boolean;
  websiteUrl: string;
  contentLanguage: string;
  profile: BusinessProfile;
  /** Set of tools the user opted IN to during step 5. Drives pricing in step 6. */
  selectedTools: ToolId[];
  term: Term;
}

const STORAGE_KEY = 'h2-onboarding-v1';

// All tools default to selected in the strategy step — the user opts OUT.
const DEFAULT_SELECTED: ToolId[] = [...ALL_TOOLS];

const INITIAL_STATE: OnboardingState = {
  active: true,
  step: 1,
  complete: false,
  websiteUrl: '',
  contentLanguage: 'English (US)',
  profile: DEFAULT_PROFILE,
  selectedTools: DEFAULT_SELECTED,
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
  setStep: (step: OnboardingStep) => void;
  next: () => void;
  back: () => void;
  setWebsiteUrl: (url: string) => void;
  setContentLanguage: (lang: string) => void;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  setBusinessType: (type: BusinessType) => void;
  toggleTool: (id: ToolId) => void;
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
    setState((s) => ({ ...s, step }));
  }, []);

  const next = useCallback(() => {
    setState((s) => ({ ...s, step: Math.min(7, s.step + 1) as OnboardingStep }));
  }, []);

  const back = useCallback(() => {
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) as OnboardingStep }));
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
      const has = s.selectedTools.includes(id);
      return {
        ...s,
        selectedTools: has
          ? s.selectedTools.filter((t) => t !== id)
          : [...s.selectedTools, id],
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

  const value = useMemo<OnboardingContextValue>(
    () => ({
      ...state,
      setStep,
      next,
      back,
      setWebsiteUrl,
      setContentLanguage,
      updateProfile,
      setBusinessType,
      toggleTool,
      setTerm,
      finish,
      skip,
      open,
      reset,
      businessTypeLabel,
    }),
    [
      state,
      setStep,
      next,
      back,
      setWebsiteUrl,
      setContentLanguage,
      updateProfile,
      setBusinessType,
      toggleTool,
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
