import { createContext, useContext, useState, type ReactNode } from 'react';

/* ─── Shared client-review state ─────────────────────────────────────────────
 * The client reviews onboarding in two separate parts — Strategy (part 1) and
 * Creative (part 2) — each its own packet the AM shares from that phase. The
 * client sees almost the same screens the AM set up, with approve / request-
 * changes / comment per section. All in one session via a context wrapping the
 * AM and client routes.
 *
 * `clientReview` is the Milestone-2 prototype switch.                          */

export type Phase = 'strategy' | 'creative';
export type ItemStatus = 'pending' | 'approved' | 'changes';
export interface ItemFeedback { status: ItemStatus; comment: string }
export type PacketStatus = 'draft' | 'shared' | 'submitted';

export interface ReviewSectionMeta { id: string; title: string; blurb: string }

/** Section list per phase — mirrors what the AM set up in that phase. */
export function reviewSections(phase: Phase): ReviewSectionMeta[] {
  if (phase === 'strategy') {
    return [
      { id: 'brand', title: 'Brand Kit', blurb: 'Colors, fonts, and voice we captured.' },
      { id: 'guidelines', title: 'Creative guidelines', blurb: 'Taglines and do’s & don’ts.' },
      { id: 'scorecard', title: 'Where you stand', blurb: 'How you compare locally today.' },
      { id: 'goals', title: 'Goals & first theme', blurb: 'The plan and first campaign.' },
    ];
  }
  return [
    { id: 'storyboard', title: 'First creative', blurb: 'The first wave of posts.' },
    { id: 'calendar', title: 'Campaign calendar', blurb: 'Weekly cadence and themes.' },
  ];
}

const PHASES: Phase[] = ['strategy', 'creative'];
type ByPhase<T> = Record<Phase, T>;
const byPhase = <T,>(make: () => T): ByPhase<T> => Object.fromEntries(PHASES.map((p) => [p, make()])) as ByPhase<T>;

interface ReviewState {
  /** Set once the AM finishes Strategy onboarding — unlocks Creative Review. */
  strategyComplete: boolean;
  setStrategyComplete: (v: boolean) => void;
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

  const setPacket = (p: Phase, s: PacketStatus) => setPackets((m) => ({ ...m, [p]: s }));
  const setItem = (p: Phase, id: string, patch: Partial<ItemFeedback>) =>
    setFeedback((m) => ({ ...m, [p]: { ...m[p], [id]: { status: 'pending', comment: '', ...m[p][id], ...patch } } }));

  return (
    <Ctx.Provider value={{
      strategyComplete, setStrategyComplete,
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
