import { createContext, useContext, useState, type ReactNode } from 'react';

/* ─── Shared client-review state ─────────────────────────────────────────────
 * The client reviews onboarding in two separate parts, Strategy (part 1) and
 * Creative (part 2), each its own packet the AM shares from that phase. The
 * client sees almost the same screens the AM set up, with approve / request-
 * changes / comment per section. All in one session via a context wrapping the
 * AM and client routes.
 *
 * `clientReview` is the Milestone-2 prototype switch.                          */

export type Phase = 'strategy' | 'goals' | 'creative';
// Section-level verdict from the client (the Request changes / Approve buttons).
export type ItemStatus = 'pending' | 'approved' | 'changes';
// `edits` holds the client's revised copy keyed by subsection, the client can
// edit individual fields directly, independent of the approve/changes verdict.
export interface ItemFeedback { status: ItemStatus; comment: string; edits?: Record<string, string> }
export type PacketStatus = 'draft' | 'shared' | 'submitted';

export interface ReviewSectionMeta { id: string; title: string; blurb: string }

/** Section list per phase, mirrors what the AM set up in that phase. */
export function reviewSections(phase: Phase): ReviewSectionMeta[] {
  if (phase === 'strategy') {
    return [
      { id: 'context', title: 'Brand context', blurb: 'Business, customers, services, and founder story.' },
      { id: 'brand', title: 'Brand Kit', blurb: 'Colors, fonts, and voice we captured.' },
      { id: 'guidelines', title: 'Creative guidelines', blurb: 'Taglines and do’s & don’ts.' },
    ];
  }
  if (phase === 'goals') {
    return [
      { id: 'success', title: 'What does success look like?', blurb: 'Drafted from your goals and the audit.' },
      { id: 'history', title: 'Marketing history', blurb: 'Summarized from your intake and current channels.' },
      { id: 'events', title: 'Major events', blurb: 'Dates worth planning campaigns around. Tagged as company or industry.' },
      { id: 'plan', title: 'Channels to develop plans around', blurb: "Pre-selected from the audit's biggest gaps. Paid-first." },
    ];
  }
  return [
    { id: 'storyboard', title: 'First creative', blurb: 'The first wave of posts.' },
    { id: 'calendar', title: 'Campaign calendar', blurb: 'Weekly cadence and themes.' },
  ];
}

const PHASES: Phase[] = ['strategy', 'goals', 'creative'];
type ByPhase<T> = Record<Phase, T>;
const byPhase = <T,>(make: () => T): ByPhase<T> => Object.fromEntries(PHASES.map((p) => [p, make()])) as ByPhase<T>;

interface ReviewState {
  /** Set once the AM finishes Strategy onboarding, unlocks the Goals flow. */
  strategyComplete: boolean;
  setStrategyComplete: (v: boolean) => void;
  /** Set once the AM finishes the Goals & theme flow, unlocks Creative Review. */
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
