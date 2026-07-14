import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Prototype-only view-state switch for the DFY **client** portal. A single
 * global flag flips every page between four variants:
 *   - `cold`: account just started onboarding (scorecard + strategy
 *                   ready, goals/creative still being worked on, go-live not
 *                   started).
 *   - `reviewing`: onboarding is nearly done. Everything (scorecard,
 *                   strategy, goals, creative) is ready for the client to
 *                   review, only go-live itself is still pending.
 *   - `mixed`: the client has already started reviewing: each item is in
 *                   a different stage (approved / changes requested / the AM
 *                   sent one back with addressed feedback / still untouched).
 *   - `steady`: live, populated, the current design.
 * Pages read `state` at the top of their render and branch.
 *
 * Defaults to `steady` (the live workspace) and persists the designer's choice
 * to localStorage so it survives reloads. Toggled from the bottom-left
 * <DevStatePanel/>.
 */
export type ClientState = 'cold' | 'reviewing' | 'mixed' | 'steady';

/** Review phases the client can submit feedback on from a review page. */
export type ReviewPhaseId = 'strategy' | 'goals' | 'creative';

interface ClientStateContextValue {
  state: ClientState;
  setState: (value: ClientState) => void;
  /** Which review phases the client has already submitted feedback on. The
   *  Review provider itself resets on every page visit, so this persisted
   *  map is what lets cold/reviewing Home show "Submitted" after the client
   *  is redirected back from a review page. */
  submittedPhases: Partial<Record<ReviewPhaseId, boolean>>;
  setPhaseSubmitted: (phase: ReviewPhaseId, value: boolean) => void;
}

const STORAGE_KEY = 'dfy-client-view-state';
const SUBMITTED_PHASES_KEY = 'dfy-client-submitted-phases';
const ClientStateContext = createContext<ClientStateContextValue | null>(null);

function initialState(): ClientState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'cold' || raw === 'reviewing' || raw === 'mixed' || raw === 'steady') return raw;
  } catch {
    /* ignore */
  }
  return 'steady';
}

function initialSubmittedPhases(): Partial<Record<ReviewPhaseId, boolean>> {
  try {
    const raw = window.localStorage.getItem(SUBMITTED_PHASES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {};
}

export function ClientStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ClientState>(initialState);
  const [submittedPhases, setSubmittedPhases] = useState<Partial<Record<ReviewPhaseId, boolean>>>(initialSubmittedPhases);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, state);
    } catch {
      /* ignore */
    }
  }, [state]);
  useEffect(() => {
    try {
      window.localStorage.setItem(SUBMITTED_PHASES_KEY, JSON.stringify(submittedPhases));
    } catch {
      /* ignore */
    }
  }, [submittedPhases]);
  const setPhaseSubmitted = (phase: ReviewPhaseId, value: boolean) =>
    setSubmittedPhases((prev) => ({ ...prev, [phase]: value }));
  const value = useMemo<ClientStateContextValue>(
    () => ({ state, setState, submittedPhases, setPhaseSubmitted }),
    [state, submittedPhases],
  );
  return <ClientStateContext.Provider value={value}>{children}</ClientStateContext.Provider>;
}

/** Fail-soft: components outside a provider get a no-op steady state, so any
 *  page can call useClientState() without a conditional provider. */
export function useClientState(): ClientStateContextValue {
  const ctx = useContext(ClientStateContext);
  if (!ctx) return { state: 'steady', setState: () => {}, submittedPhases: {}, setPhaseSubmitted: () => {} };
  return ctx;
}
