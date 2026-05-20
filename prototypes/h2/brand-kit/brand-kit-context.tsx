import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_FREEDOM,
  DEFAULT_STYLE,
  DEFAULT_TYPEFACE,
  type FreedomId,
  type StyleId,
  type TypefaceId,
} from './brand-kit-data';

/**
 * Brand Kit setup state — owns the user's picks across the 3-step flow:
 * visual style → typeface → photo freedom level. Survives page reload via
 * localStorage so the Home cold-state "Finalize your Brand kit" row reflects
 * completion immediately after the user returns from /h2/brand-kit.
 */

export type BrandKitStep = 1 | 2 | 3;

interface BrandKitState {
  step: BrandKitStep;
  style: StyleId;
  typeface: TypefaceId;
  freedom: FreedomId;
  done: boolean;
}

const STORAGE_KEY = 'h2-brand-kit-v1';

const INITIAL_STATE: BrandKitState = {
  step: 1,
  style: DEFAULT_STYLE,
  typeface: DEFAULT_TYPEFACE,
  freedom: DEFAULT_FREEDOM,
  done: false,
};

function loadStored(): BrandKitState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BrandKitState>;
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return null;
  }
}

interface BrandKitContextValue extends BrandKitState {
  setStep: (step: BrandKitStep) => void;
  next: () => void;
  back: () => void;
  setStyle: (id: StyleId) => void;
  setTypeface: (id: TypefaceId) => void;
  setFreedom: (id: FreedomId) => void;
  /** Mark complete (the flow saves on the final step's Continue). */
  finish: () => void;
  /** Reset back to step 1 + done=false. Used by the dev panel and the flow
   *  when the user wants to redo the setup. */
  reset: () => void;
}

const BrandKitContext = createContext<BrandKitContextValue | null>(null);

export function BrandKitProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BrandKitState>(() => loadStored() ?? INITIAL_STATE);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const setStep = useCallback((step: BrandKitStep) => {
    setState((s) => ({ ...s, step }));
  }, []);

  const next = useCallback(() => {
    setState((s) => ({ ...s, step: Math.min(3, s.step + 1) as BrandKitStep }));
  }, []);

  const back = useCallback(() => {
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) as BrandKitStep }));
  }, []);

  const setStyle = useCallback((style: StyleId) => {
    setState((s) => ({ ...s, style }));
  }, []);

  const setTypeface = useCallback((typeface: TypefaceId) => {
    setState((s) => ({ ...s, typeface }));
  }, []);

  const setFreedom = useCallback((freedom: FreedomId) => {
    setState((s) => ({ ...s, freedom }));
  }, []);

  const finish = useCallback(() => {
    // Reset step to 1 alongside marking done so the next entry into the flow
    // (via sidebar nav or Home cold) starts fresh rather than resuming on
    // step 3.
    setState((s) => ({ ...s, done: true, step: 1 }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  const value = useMemo<BrandKitContextValue>(
    () => ({
      ...state,
      setStep,
      next,
      back,
      setStyle,
      setTypeface,
      setFreedom,
      finish,
      reset,
    }),
    [state, setStep, next, back, setStyle, setTypeface, setFreedom, finish, reset],
  );

  return <BrandKitContext.Provider value={value}>{children}</BrandKitContext.Provider>;
}

export function useBrandKit(): BrandKitContextValue {
  const ctx = useContext(BrandKitContext);
  if (!ctx) throw new Error('useBrandKit must be used inside <BrandKitProvider>');
  return ctx;
}
