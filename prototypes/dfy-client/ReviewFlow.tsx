import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrowthEngineReviewFlow, type ReviewOutcome } from './growth-review/GrowthReview';
import { useClientState } from './dev-state';

type Fallback = {
  decisions?: Record<string, { status: 'approved' | 'changes'; note?: string }>;
  connections?: Record<string, boolean>;
};

/**
 * Translates a finished review into the portal's view state:
 *   - everything approved → `reviewed` (the completed look)
 *   - any change requested → `mixed` (Home shows the count + AM notified)
 *
 * Shared by the overlay (useReviewFlow) and the standalone /growth-review
 * route, so both entry points leave the portal in the same place.
 */
function useApplyOutcome(): (outcome: ReviewOutcome) => void {
  const { setState, setReviewNotes, setReviewResult } = useClientState();
  return (outcome) => {
    setReviewResult(outcome.decisions, outcome.connections);
    if (outcome.approved) {
      setReviewNotes([]);
      setState('reviewed');
    } else {
      setReviewNotes(outcome.notes);
      setState('mixed');
    }
  };
}

/** Real decisions from a prior submission when there are any; otherwise the
 *  caller's scripted set, so a dev-toggled Reviewed/Mixed still shows each
 *  step marked correctly. */
function useSeed(fallback?: Fallback) {
  const { reviewDecisions, reviewConnections } = useClientState();
  const hasReal = Object.keys(reviewDecisions).length > 0;
  return {
    decisions: hasReal ? reviewDecisions : (fallback?.decisions ?? {}),
    connections: hasReal ? reviewConnections : (fallback?.connections ?? {}),
  };
}

/**
 * Hosts the Growth Engine Review as a full-screen overlay over the client
 * portal.
 *
 * Returns a `launch()` to open the flow and an `overlay` node the caller
 * renders somewhere in its tree. Used by the cold / reviewed / mixed Homes so
 * the "Review" (and later "View") entry points all share one flow instance.
 */
export function useReviewFlow(fallback?: Fallback): { launch: () => void; overlay: ReactNode } {
  const { setReviewFlowOpen, reviewSide, setReviewSide } = useClientState();
  const applyOutcome = useApplyOutcome();
  const seed = useSeed(fallback);
  const [open, setOpen] = useState(false);

  const setOpenState = (v: boolean) => { setOpen(v); setReviewFlowOpen(v); if (v) setReviewSide('client'); };

  const overlay = open ? (
    <GrowthEngineReviewFlow
      mode={reviewSide}
      initialDecisions={seed.decisions}
      initialConnections={seed.connections}
      onExit={() => setOpenState(false)}
      onComplete={(outcome) => { setOpenState(false); applyOutcome(outcome); }}
    />
  ) : null;

  return { launch: () => setOpenState(true), overlay };
}

/**
 * The same review, mounted at its own URL so it can be sent to someone
 * directly: `/dfy-client/growth-review` opens the client review,
 * `/dfy-client/growth-review/am` the strategist side. Finishing or exiting
 * drops them on the client home, in whatever state the review produced.
 */
export function GrowthReviewRoute({ sub }: { sub?: string }) {
  const navigate = useNavigate();
  const { setReviewFlowOpen, reviewSide, setReviewSide } = useClientState();
  const applyOutcome = useApplyOutcome();
  const seed = useSeed();
  const urlMode = sub === 'am' ? 'am' : 'client';

  // The URL picks the side on load; the dev panel's AM/Client toggle can still
  // flip it afterwards, since it writes the same reviewSide.
  useEffect(() => { setReviewSide(urlMode); }, [urlMode]);

  // Tell the dev panel a review is on screen so it offers that toggle.
  useEffect(() => {
    setReviewFlowOpen(true);
    return () => setReviewFlowOpen(false);
  }, []);

  return (
    <GrowthEngineReviewFlow
      mode={reviewSide}
      initialDecisions={seed.decisions}
      initialConnections={seed.connections}
      onExit={() => navigate('/dfy-client')}
      onComplete={(outcome) => { applyOutcome(outcome); navigate('/dfy-client'); }}
    />
  );
}
