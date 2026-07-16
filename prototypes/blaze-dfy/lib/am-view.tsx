import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Which side of the Growth Engine Review is on screen, driven by the dev
 * panel's existing AM / Client switch. While the review overlay is open the
 * switch flips this side in place (AM edit ⇄ client preview); when it is closed
 * the switch falls back to navigating to the client portal.
 */
export type ReviewSide = 'am' | 'client';

interface AmViewValue {
  side: ReviewSide;
  setSide: (side: ReviewSide) => void;
  /** True while the review overlay is open (so the dev panel flips instead of navigating). */
  reviewOpen: boolean;
  setReviewOpen: (open: boolean) => void;
}

const AmViewContext = createContext<AmViewValue | null>(null);

export function AmViewProvider({ children }: { children: ReactNode }) {
  const [side, setSide] = useState<ReviewSide>('am');
  const [reviewOpen, setReviewOpen] = useState(false);
  const value = useMemo<AmViewValue>(() => ({ side, setSide, reviewOpen, setReviewOpen }), [side, reviewOpen]);
  return <AmViewContext.Provider value={value}>{children}</AmViewContext.Provider>;
}

/** Fail-soft so components outside the provider still render. */
export function useAmView(): AmViewValue {
  const ctx = useContext(AmViewContext);
  if (!ctx) return { side: 'am', setSide: () => {}, reviewOpen: false, setReviewOpen: () => {} };
  return ctx;
}
