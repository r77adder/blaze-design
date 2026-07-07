import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Designer-facing dev-state toggle for the DFY workspace. A single global
 * switch flips every page between its "cold" (new / empty / mid-onboarding)
 * and "steady" (populated / active account) view. Pages read `state` at the
 * top of their render to gate which variant they show.
 *
 * Defaults to `'steady'` so the workspace renders its full populated state
 * until the designer explicitly flips it cold.
 *
 * `'reviewed'` is a variant of cold onboarding where the client has already
 * returned a mix of approved / changes-requested / edited feedback across all
 * three reviews. It renders the same cold surfaces; the feedback itself is
 * seeded via the review context (see DevStatePanel).
 */
export type DfyState = 'cold' | 'steady' | 'reviewed';

interface DfyStateContextValue {
  state: DfyState;
  setState: (value: DfyState) => void;
}

const DfyStateContext = createContext<DfyStateContextValue | null>(null);

export function DfyStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DfyState>('steady');
  const value = useMemo<DfyStateContextValue>(() => ({ state, setState }), [state]);
  return <DfyStateContext.Provider value={value}>{children}</DfyStateContext.Provider>;
}

/** Fail-soft: components outside a provider get a no-op steady state so they
 *  can call useDfyState() without a conditional provider. */
export function useDfyState(): DfyStateContextValue {
  const ctx = useContext(DfyStateContext);
  if (!ctx) return { state: 'steady', setState: () => {} };
  return ctx;
}
