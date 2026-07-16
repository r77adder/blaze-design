import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Prototype-only view-state switch for the DFY **client** portal. A single
 * global flag flips every page between four variants:
 *   - `cold`      — account just started onboarding. The Growth Engine Review
 *                   is ready; the client opens it from Home and reviews it.
 *   - `reviewed`  — the client approved the whole Growth Engine Review; only
 *                   go-live itself is still pending. The completed look.
 *   - `mixed`     — the client requested changes in the review; Home shows how
 *                   many and that the strategist has been notified.
 *   - `steady`    — live, populated — the current design.
 * Pages read `state` at the top of their render and branch.
 *
 * Defaults to `steady` (the live workspace) and persists the designer's choice
 * to localStorage so it survives reloads. Toggled from the bottom-left
 * <DevStatePanel/>.
 */
export type ClientState = 'cold' | 'reviewed' | 'mixed' | 'steady';

/** Review phases the client can submit feedback on from a review page. */
export type ReviewPhaseId = 'strategy' | 'goals' | 'creative';

interface ClientStateContextValue {
  state: ClientState;
  setState: (value: ClientState) => void;
  /** Which review phases the client has already submitted feedback on. The
   *  Review provider itself resets on every page visit, so this persisted
   *  map is what lets cold/reviewed Home show "Submitted" after the client
   *  is redirected back from a review page. */
  submittedPhases: Partial<Record<ReviewPhaseId, boolean>>;
  setPhaseSubmitted: (phase: ReviewPhaseId, value: boolean) => void;
  /** Change-request notes the client left in the Growth Engine Review. Drives
   *  the `mixed` Home ("N changes sent to your strategist"). */
  reviewNotes: string[];
  setReviewNotes: (notes: string[]) => void;
  /** The full per-step verdicts + connection state from the last review, so
   *  reopening the flow to "View" shows every step marked as it was left. */
  reviewDecisions: Record<string, ReviewDecision>;
  reviewConnections: Record<string, boolean>;
  setReviewResult: (decisions: Record<string, ReviewDecision>, connections: Record<string, boolean>) => void;
  /** True while the full-screen Growth Engine Review overlay is open. The
   *  dev-state panel collapses to just the AM/Client switch while it is. */
  reviewFlowOpen: boolean;
  setReviewFlowOpen: (value: boolean) => void;
  /** Which side of the review is on screen (prototype control). While the
   *  review is open the dev panel's AM/Client switch flips this in place. */
  reviewSide: 'am' | 'client';
  setReviewSide: (side: 'am' | 'client') => void;
}

/** Mirrors the Growth Engine Review's per-item verdict shape. */
export interface ReviewDecision {
  status: 'approved' | 'changes';
  note?: string;
}

const STORAGE_KEY = 'dfy-client-view-state';
const SUBMITTED_PHASES_KEY = 'dfy-client-submitted-phases';
const REVIEW_NOTES_KEY = 'dfy-client-review-notes';
const REVIEW_RESULT_KEY = 'dfy-client-review-result';
const ClientStateContext = createContext<ClientStateContextValue | null>(null);

function initialState(): ClientState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'cold' || raw === 'reviewed' || raw === 'mixed' || raw === 'steady') return raw;
  } catch {
    /* ignore */
  }
  return 'steady';
}

function initialReviewNotes(): string[] {
  try {
    const raw = window.localStorage.getItem(REVIEW_NOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

function initialReviewResult(): { decisions: Record<string, ReviewDecision>; connections: Record<string, boolean> } {
  try {
    const raw = window.localStorage.getItem(REVIEW_RESULT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { decisions: {}, connections: {} };
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
  const [reviewNotes, setReviewNotes] = useState<string[]>(initialReviewNotes);
  const [reviewResult, setReviewResultState] = useState(initialReviewResult);
  const [reviewFlowOpen, setReviewFlowOpen] = useState(false);
  const [reviewSide, setReviewSide] = useState<'am' | 'client'>('client');
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
  useEffect(() => {
    try {
      window.localStorage.setItem(REVIEW_NOTES_KEY, JSON.stringify(reviewNotes));
    } catch {
      /* ignore */
    }
  }, [reviewNotes]);
  useEffect(() => {
    try {
      window.localStorage.setItem(REVIEW_RESULT_KEY, JSON.stringify(reviewResult));
    } catch {
      /* ignore */
    }
  }, [reviewResult]);
  const setPhaseSubmitted = (phase: ReviewPhaseId, value: boolean) =>
    setSubmittedPhases((prev) => ({ ...prev, [phase]: value }));
  const setReviewResult = (decisions: Record<string, ReviewDecision>, connections: Record<string, boolean>) =>
    setReviewResultState({ decisions, connections });
  const value = useMemo<ClientStateContextValue>(
    () => ({
      state, setState, submittedPhases, setPhaseSubmitted, reviewNotes, setReviewNotes,
      reviewDecisions: reviewResult.decisions, reviewConnections: reviewResult.connections, setReviewResult,
      reviewFlowOpen, setReviewFlowOpen, reviewSide, setReviewSide,
    }),
    [state, submittedPhases, reviewNotes, reviewResult, reviewFlowOpen, reviewSide],
  );
  return <ClientStateContext.Provider value={value}>{children}</ClientStateContext.Provider>;
}

/** Fail-soft: components outside a provider get a no-op steady state, so any
 *  page can call useClientState() without a conditional provider. */
export function useClientState(): ClientStateContextValue {
  const ctx = useContext(ClientStateContext);
  if (!ctx) return {
    state: 'steady', setState: () => {}, submittedPhases: {}, setPhaseSubmitted: () => {},
    reviewNotes: [], setReviewNotes: () => {}, reviewDecisions: {}, reviewConnections: {}, setReviewResult: () => {},
    reviewFlowOpen: false, setReviewFlowOpen: () => {}, reviewSide: 'client', setReviewSide: () => {},
  };
  return ctx;
}
