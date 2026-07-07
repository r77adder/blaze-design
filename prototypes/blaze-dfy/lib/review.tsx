import { createContext, useContext, useState, type ReactNode } from 'react';

/* ─── Shared client-review state ─────────────────────────────────────────────
 * The client reviews onboarding in two separate parts — Strategy (part 1) and
 * Creative (part 2) — each its own packet the AM shares from that phase. The
 * client sees almost the same screens the AM set up, with approve / request-
 * changes / comment per section. All in one session via a context wrapping the
 * AM and client routes.
 *
 * `clientReview` is the Milestone-2 prototype switch.                          */

export type Phase = 'strategy' | 'goals' | 'creative';
// Section-level verdict from the client (the Request changes / Approve buttons).
export type ItemStatus = 'pending' | 'approved' | 'changes';
// `edits` holds the client's revised copy keyed by subsection — the client can
// edit individual fields directly, independent of the approve/changes verdict.
export interface ItemFeedback { status: ItemStatus; comment: string; edits?: Record<string, string> }
export type PacketStatus = 'draft' | 'shared' | 'submitted';

export interface ReviewSectionMeta { id: string; title: string; blurb: string }

/** Section list per phase — mirrors what the AM set up in that phase. */
export function reviewSections(phase: Phase): ReviewSectionMeta[] {
  if (phase === 'strategy') {
    return [
      { id: 'context', title: 'Brand context', blurb: 'Business, customers, services, and founder story.' },
      { id: 'brand', title: 'Brand Kit', blurb: 'Colors, fonts, and voice we captured.' },
      { id: 'guidelines', title: 'Creative guidelines', blurb: 'Taglines and do’s & don’ts.' },
    ];
  }
  if (phase === 'goals') {
    // Mirrors the pre-submission Goals & theme screen (onboarding-port/steps.tsx
    // GOALS_SECTIONS) so the client reviews the same sections, read-only.
    return [
      { id: 'success', title: 'What does success look like?', blurb: 'Your 30 / 60 / 90-day targets.' },
      { id: 'history', title: 'Marketing history', blurb: 'Channels and what has worked so far.' },
      { id: 'events', title: 'Major events', blurb: 'Dates worth planning campaigns around.' },
      { id: 'plan', title: 'Channels to develop plans around', blurb: 'Where we will focus first.' },
    ];
  }
  return [
    { id: 'storyboard', title: 'First creative', blurb: 'The first wave of posts.' },
    { id: 'calendar', title: 'Campaign calendar', blurb: 'Weekly cadence and themes.' },
  ];
}

/** Which review sections live under each stepped-flow sub-step, so returned
 *  client feedback renders in place on that step (and highlights its tab). */
export const REVIEW_STEP_SECTIONS: Partial<Record<Phase, Record<string, string[]>>> = {
  strategy: { context: ['context'], creative: ['brand', 'guidelines'] },
  creative: { storyboard: ['storyboard'], calendar: ['calendar'] },
};

/** Count how many of a step's sections have changes / edits — used to flag the
 *  step tab in the header. */
export function stepReviewCounts(fb: Record<string, ItemFeedback>, phase: Phase, stepKey: string): { changes: number; edited: number } {
  const ids = REVIEW_STEP_SECTIONS[phase]?.[stepKey] ?? [];
  let changes = 0, edited = 0;
  for (const id of ids) {
    const f = fb[id];
    if (f?.status === 'changes') changes++;
    if (f?.edits && Object.values(f.edits).some((v) => v != null)) edited++;
  }
  return { changes, edited };
}

const PHASES: Phase[] = ['strategy', 'goals', 'creative'];
type ByPhase<T> = Record<Phase, T>;
const byPhase = <T,>(make: () => T): ByPhase<T> => Object.fromEntries(PHASES.map((p) => [p, make()])) as ByPhase<T>;

/** Demo "Reviewed" state — the client returned a realistic mix of approved,
 *  changes-requested and edited sections across all three reviews. Keys match
 *  reviewSections() ids. Built fresh each call so edits never mutate the seed. */
function reviewedSeed(): ByPhase<Record<string, ItemFeedback>> {
  return {
    strategy: {
      context: { status: 'pending', comment: '', edits: { overview: "Grain Design Flooring — Naperville's family-owned hardwood & luxury vinyl specialists since 2009." } },
      brand: { status: 'approved', comment: '' },
      guidelines: { status: 'changes', comment: 'Can we punch up the taglines? The current ones feel a little safe.' },
    },
    goals: {
      success: { status: 'approved', comment: '' },
      history: { status: 'pending', comment: '', edits: { form: 'edited' } },
      events: { status: 'changes', comment: 'Add our fall install-before-holidays promo in October.' },
      plan: { status: 'approved', comment: '' },
    },
    creative: {
      storyboard: { status: 'changes', comment: 'The lead slide should open with the sage exterior, not the navy one.' },
      calendar: { status: 'approved', comment: '' },
    },
  };
}

interface ReviewState {
  /** Set once the AM finishes Strategy onboarding — unlocks the Goals flow. */
  strategyComplete: boolean;
  setStrategyComplete: (v: boolean) => void;
  /** Set once the AM finishes the Goals & theme flow — unlocks Creative Review. */
  goalsComplete: boolean;
  setGoalsComplete: (v: boolean) => void;
  /** Set once the AM finishes Creative Review. */
  creativeComplete: boolean;
  setCreativeComplete: (v: boolean) => void;
  packet: (p: Phase) => PacketStatus;
  share: (p: Phase) => void;
  reset: (p: Phase) => void;
  submit: (p: Phase) => void;
  feedback: (p: Phase) => Record<string, ItemFeedback>;
  setItem: (p: Phase, id: string, patch: Partial<ItemFeedback>) => void;
  resolve: (p: Phase, id: string) => void;
  /** Demo helpers used by the dev panel's Reviewed / Cold-Steady buttons. */
  seedReviewed: () => void;
  clearReview: () => void;
}

const Ctx = createContext<ReviewState | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [packets, setPackets] = useState<ByPhase<PacketStatus>>(() => byPhase<PacketStatus>(() => 'draft'));
  const [feedback, setFeedback] = useState<ByPhase<Record<string, ItemFeedback>>>(() => byPhase(() => ({})));
  const [strategyComplete, setStrategyComplete] = useState(false);
  const [goalsComplete, setGoalsComplete] = useState(false);
  const [creativeComplete, setCreativeComplete] = useState(false);

  const setPacket = (p: Phase, s: PacketStatus) => setPackets((m) => ({ ...m, [p]: s }));
  const setItem = (p: Phase, id: string, patch: Partial<ItemFeedback>) =>
    setFeedback((m) => ({ ...m, [p]: { ...m[p], [id]: { status: 'pending', comment: '', ...m[p][id], ...patch } } }));

  return (
    <Ctx.Provider value={{
      strategyComplete, setStrategyComplete,
      goalsComplete, setGoalsComplete,
      creativeComplete, setCreativeComplete,
      packet: (p) => packets[p],
      share: (p) => setPacket(p, 'shared'),
      submit: (p) => setPacket(p, 'submitted'),
      reset: (p) => { setPacket(p, 'draft'); setFeedback((m) => ({ ...m, [p]: {} })); },
      feedback: (p) => feedback[p],
      setItem,
      resolve: (p, id) => setItem(p, id, { status: 'approved' }),
      seedReviewed: () => {
        setPackets(byPhase<PacketStatus>(() => 'submitted'));
        setFeedback(reviewedSeed());
        setStrategyComplete(true); setGoalsComplete(true); setCreativeComplete(true);
      },
      clearReview: () => {
        setPackets(byPhase<PacketStatus>(() => 'draft'));
        setFeedback(byPhase(() => ({})));
        setStrategyComplete(false); setGoalsComplete(false); setCreativeComplete(false);
      },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useReview(): ReviewState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useReview must be used within ReviewProvider');
  return v;
}
