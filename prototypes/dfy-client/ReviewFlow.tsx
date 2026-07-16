import { useState, type ReactNode } from 'react';
import { GrowthEngineReviewFlow } from './growth-review/GrowthReview';
import { useClientState } from './dev-state';

/**
 * Hosts the Growth Engine Review as a full-screen overlay over the client
 * portal, and translates its outcome into the portal's view state:
 *   - everything approved → `reviewed` (the completed look)
 *   - any change requested → `mixed` (Home shows the count + AM notified)
 *
 * Returns a `launch()` to open the flow and an `overlay` node the caller
 * renders somewhere in its tree. Used by the cold / reviewed / mixed Homes so
 * the "Review" (and later "View") entry points all share one flow instance.
 */
export function useReviewFlow(fallback?: {
  decisions?: Record<string, { status: 'approved' | 'changes'; note?: string }>;
  connections?: Record<string, boolean>;
}): { launch: () => void; overlay: ReactNode } {
  const { setState, setReviewNotes, setReviewResult, reviewDecisions, reviewConnections, setReviewFlowOpen, reviewSide, setReviewSide } = useClientState();
  const [open, setOpen] = useState(false);

  const setOpenState = (v: boolean) => { setOpen(v); setReviewFlowOpen(v); if (v) setReviewSide('client'); };

  // Use the real decisions from a prior submission if there are any; otherwise
  // fall back to a scripted set so a dev-toggled Reviewed/Mixed still shows
  // each step marked correctly.
  const hasReal = Object.keys(reviewDecisions).length > 0;
  const seedDecisions = hasReal ? reviewDecisions : (fallback?.decisions ?? {});
  const seedConnections = hasReal ? reviewConnections : (fallback?.connections ?? {});

  const overlay = open ? (
    <GrowthEngineReviewFlow
      mode={reviewSide}
      initialDecisions={seedDecisions}
      initialConnections={seedConnections}
      onExit={() => setOpenState(false)}
      onComplete={(outcome) => {
        setOpenState(false);
        setReviewResult(outcome.decisions, outcome.connections);
        if (outcome.approved) {
          setReviewNotes([]);
          setState('reviewed');
        } else {
          setReviewNotes(outcome.notes);
          setState('mixed');
        }
      }}
    />
  ) : null;

  return { launch: () => setOpenState(true), overlay };
}
