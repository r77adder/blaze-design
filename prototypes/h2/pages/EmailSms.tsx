import { useState } from 'react';
import { Button, Modal, ModalStack, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';
import { H2Layout } from '../H2Layout';
import { useDevState } from '../dev-state-context';
import { EmailSmsColdView } from './ColdViews';

/**
 * /h2/email-sms — port of Blaze H2 Features/email&sms.html (program hub).
 *
 * Steady-state library of email/SMS programs with four sections:
 *   - Active (running now)
 *   - Drafts (strategy ready, awaiting approval)
 *   - Agent-suggested (clickable; opens detail modal)
 *   - Coming soon (blocked on integration; clicking shows toast)
 *
 * Clicking a non-blocked program opens a vetted Modal with tabs:
 *   - Overview (trigger / channels / cadence / planned-step list / activity)
 *   - Sequence (timeline of touches with channel tag, send window, snippet)
 *   - Performance (per-program stat cards)
 *
 * Topbar "New program" button + a card-CTA both open the New-program
 * modal — a Welcome-Stack scaffold with trigger / channels / cadence /
 * planned steps / sources, mirroring renderCreateModalBody from source.
 */

// ─── DATA ───────────────────────────────────────────────────────────────

type Channel = 'email' | 'sms';
type Status = 'live' | 'draft' | 'suggested';

interface Step {
  channel: Channel;
  day: string;
  when: string;
  title: string;
  snippet: string;
}

interface ProgramStat {
  k: string;
  v: string;
  d?: string;
  up?: boolean;
}

interface Activity {
  kind: 'agent' | 'win' | 'edit';
  title: string;
  meta: string;
  time: string;
}

interface PerfCard {
  k: string;
  v: string;
  d?: string;
}

interface Program {
  id: string;
  name: string;
  status: Status;
  stage: string;
  trigger: string;
  desc: string;
  attention?: { tone: 'yellow' | 'purple'; label: string; icon?: 'star' | 'none' };
  channels: Channel[];
  stats: ProgramStat[];
  proposals: number;
  steps: Step[];
  activity: Activity[];
  perf?: PerfCard[];
}

const PROGRAMS: Program[] = [
  {
    id: 'welcome',
    name: 'Welcome Stack',
    status: 'live',
    stage: 'Acquisition → First purchase',
    trigger: 'Email signup',
    desc: 'Post-signup nurture — turn a fresh email signup into a confirmed first order across email and SMS.',
    attention: { tone: 'yellow', label: '3 agent proposals waiting', icon: 'star' },
    channels: ['email', 'sms'],
    stats: [
      { k: 'Recipients · 28d', v: '1,356', d: '+12.4%', up: true },
      { k: 'First orders', v: '184', d: '+8.1%', up: true },
      { k: 'Conversion', v: '13.6%', d: 'Above benchmark', up: true },
      { k: 'Revenue · 28d', v: '$14,720', d: '+$1,890', up: true },
    ],
    proposals: 3,
    steps: [
      { channel: 'email', day: 'Day 0', when: '5 min after signup', title: 'Welcome — what arrives in your first box', snippet: 'A short, warm welcome with what to expect on day one.' },
      { channel: 'sms', day: 'Day 1', when: 'Morning · local time', title: 'A short tip on getting started', snippet: 'Short SMS — surface the routine quiz and offer a 5-min check-in.' },
      { channel: 'email', day: 'Day 2', when: 'Same time as Day 0', title: 'Story — why we make it this way', snippet: 'Brand story email — builds trust before the offer reminder.' },
      { channel: 'sms', day: 'Day 4', when: 'Afternoon nudge', title: 'Last call on your welcome offer', snippet: 'Time-bound nudge — welcome offer expires tonight.' },
      { channel: 'email', day: 'Day 6', when: 'Soft close', title: 'Cart link + one-tap reorder', snippet: 'Soft cart-recovery close before the welcome window expires.' },
    ],
    activity: [
      { kind: 'agent', title: 'Agent proposes a new subject line for Step 3', meta: 'Story → Real customer voice variant', time: '2h ago' },
      { kind: 'win', title: 'A/B test won — variant B on Step 1', meta: '+9.2% open rate · auto-applied', time: 'Yesterday' },
      { kind: 'edit', title: 'You approved a copy change on Step 5', meta: 'Soft close · cart link', time: '3 days ago' },
    ],
    perf: [
      { k: 'Sent', v: '1,356', d: '+12.4% vs prev. 28d' },
      { k: 'Open rate', v: '58.4%', d: '+4.2pt vs benchmark' },
      { k: 'Click rate', v: '32.1%', d: '+2.1pt vs benchmark' },
      { k: 'Conversion', v: '13.6%', d: 'Net new orders' },
    ],
  },
  {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    status: 'draft',
    stage: 'Order → 24h after',
    trigger: 'Shopify order created',
    desc: 'The first 24 hours after an order is placed — confirmation, shipping ETA, what to expect on delivery day.',
    attention: { tone: 'yellow', label: 'Approve to activate' },
    channels: ['email', 'sms'],
    stats: [
      { k: 'Drafted steps', v: '4' },
      { k: 'Estimated reach', v: '~480/wk' },
      { k: 'Strategy', v: 'Ready', d: 'Reviewed by agent', up: true },
      { k: 'Approval', v: 'Awaiting', d: 'You' },
    ],
    proposals: 0,
    steps: [
      { channel: 'email', day: 'T+0', when: 'Within 60s of order', title: "Order confirmed — here's what happens next", snippet: 'Receipt + packing summary. Sets shipping expectations.' },
      { channel: 'sms', day: 'T+24h', when: 'Once tracking is created', title: 'Your box is on the way', snippet: 'Short tracking SMS — links to carrier page.' },
      { channel: 'email', day: 'Delivery day', when: 'Morning of arrival', title: 'Your box arrives today — quick start guide', snippet: "Drops the day-of guide so they're ready when it lands." },
      { channel: 'sms', day: 'T+24h after delivery', when: 'Same hour next day', title: 'How was unboxing?', snippet: 'Light check-in — opens a reply thread to support.' },
    ],
    activity: [
      { kind: 'agent', title: 'Agent finished drafting all 4 steps', meta: 'Pulled from Shopify order schema and your Brand Kit', time: '4h ago' },
      { kind: 'agent', title: 'Agent paired SMS Step 3 with the carrier ETA webhook', meta: 'Will only send when tracking event arrives', time: '4h ago' },
    ],
  },
  {
    id: 'refill_reminder',
    name: 'Refill Reminder',
    status: 'draft',
    stage: '3 days before refill',
    trigger: 'Auto-renewal eligibility',
    desc: "Three days before a customer's bottle runs out — a friendly nudge with one-tap reorder, plus stock + auto-renewal toggles.",
    attention: { tone: 'yellow', label: 'Approve to activate' },
    channels: ['email', 'sms'],
    stats: [
      { k: 'Drafted steps', v: '5' },
      { k: 'Estimated reach', v: '~210/wk' },
      { k: 'Strategy', v: 'Ready' },
      { k: 'Approval', v: 'Awaiting', d: 'You' },
    ],
    proposals: 0,
    steps: [
      { channel: 'sms', day: 'T-3 days', when: 'Morning · local', title: 'Heads up — refill in 3 days', snippet: "Light heads-up so it doesn't feel like a sales nudge." },
      { channel: 'email', day: 'T-2 days', when: 'Same time as last order', title: 'Refill week — keep your rhythm going', snippet: 'Reorder email with one-tap CTA.' },
      { channel: 'sms', day: 'T-1 day', when: 'Afternoon', title: 'Last call before stock-out', snippet: 'Final nudge before they run out.' },
      { channel: 'email', day: 'T+1 day', when: 'If no reorder', title: 'Did your routine pause?', snippet: "Soft check-in if they didn't reorder." },
      { channel: 'email', day: 'T+7 days', when: 'If still no reorder', title: 'A small offer to come back', snippet: 'Soft win-back offer with no expiry pressure.' },
    ],
    activity: [
      { kind: 'agent', title: 'Agent finished drafting all 5 steps', meta: 'Anchored on Klaviyo subscription cohort', time: '1d ago' },
    ],
  },
  {
    id: 'post_delivery',
    name: 'Post-Delivery Review',
    status: 'suggested',
    stage: '48h post-delivery',
    trigger: 'Carrier delivered event',
    desc: '48 hours after a package lands — thank customers, ask for a review, route negative sentiment to your inbox first.',
    attention: { tone: 'purple', label: 'Agent ready to draft', icon: 'star' },
    channels: ['email', 'sms'],
    stats: [
      { k: 'Eligible audience', v: '~960/mo' },
      { k: 'Projected lift', v: '+34% reviews', up: true },
      { k: 'Effort', v: 'Low' },
      { k: 'Risk', v: 'Low' },
    ],
    proposals: 0,
    steps: [
      { channel: 'email', day: 'T+48h', when: 'Morning, local time', title: 'How are you feeling on day two?', snippet: 'Routes 5★ feedback to public review, lower to support inbox.' },
      { channel: 'email', day: 'T+5 days', when: 'Only if rated 5★', title: 'Would you share that? (Google review)', snippet: 'Asks for a Google review only when sentiment is positive.' },
      { channel: 'sms', day: 'T+10 days', when: 'If review left', title: 'Thank you — small token', snippet: 'Closes the loop with a small thank-you credit.' },
    ],
    activity: [
      { kind: 'agent', title: 'Agent ready to draft this program', meta: 'Will use carrier delivery webhook + sentiment routing', time: 'Now' },
    ],
  },
  {
    id: 'winback',
    name: 'Win-Back',
    status: 'suggested',
    stage: '12+ months dormant',
    trigger: 'No purchase in 12 months',
    desc: "Re-engage past customers who haven't ordered in 12+ months with a personalized offer based on their last purchase category.",
    attention: { tone: 'purple', label: 'Agent ready to draft', icon: 'star' },
    channels: ['email'],
    stats: [
      { k: 'Eligible audience', v: '2,140' },
      { k: 'Projected lift', v: '~38 orders' },
      { k: 'Effort', v: 'Low' },
      { k: 'Risk', v: 'Medium · offer cost' },
    ],
    proposals: 0,
    steps: [
      { channel: 'email', day: 'Day 0', when: 'After eligibility', title: "It's been a minute", snippet: 'Soft hello — no offer yet, just an open door.' },
      { channel: 'email', day: 'Day 5', when: 'If no reply or click', title: 'Personalized offer based on last category', snippet: 'Targeted offer using last purchase category.' },
      { channel: 'email', day: 'Day 14', when: 'Last touch', title: 'Last call — soft close', snippet: 'Last note before pausing the audience.' },
      { channel: 'email', day: 'Day 21', when: 'Win-back winners', title: "Welcome back — what's changed", snippet: 'Onboards win-back customers to current product.' },
    ],
    activity: [
      { kind: 'agent', title: 'Agent ready to draft this program', meta: 'Will segment by last purchase category', time: 'Now' },
    ],
  },
  {
    id: 'loyalty',
    name: 'Loyalty Tier-Up',
    status: 'suggested',
    stage: '3rd / 5th order milestones',
    trigger: 'Order count reaches threshold',
    desc: 'Customers approaching repeat-order thresholds get a nudge to order before tier benefits expire.',
    attention: { tone: 'purple', label: 'Agent ready to draft', icon: 'star' },
    channels: ['email'],
    stats: [
      { k: 'Eligible audience', v: '~210/mo' },
      { k: 'Projected lift', v: '+18% repeat', up: true },
      { k: 'Effort', v: 'Medium' },
      { k: 'Risk', v: 'Low' },
    ],
    proposals: 0,
    steps: [
      { channel: 'email', day: '1 order away from tier', when: 'Eligibility match', title: "You're one order from your next tier", snippet: 'Carrot — surfaces what unlocks at the next tier.' },
      { channel: 'email', day: '7 days before benefits expire', when: 'Mid-cycle reminder', title: 'Heads up — your tier benefits expire soon', snippet: 'Loss-aversion reminder — keeps engagement high.' },
      { channel: 'email', day: 'After tier graduation', when: 'Celebration', title: 'You made it — welcome to Gold', snippet: 'Confirms tier graduation and next-tier path.' },
    ],
    activity: [
      { kind: 'agent', title: 'Agent ready to draft this program', meta: 'Will pull thresholds from your loyalty program config', time: 'Now' },
    ],
  },
];

interface BlockedProgram {
  name: string;
  desc: string;
  reason: string;
}

const BLOCKED: BlockedProgram[] = [
  { name: 'Abandoned Cart Recovery', desc: "Pick up shoppers who didn't reach checkout within 60 minutes.", reason: 'Requires Shopify cart pixel' },
  { name: 'Birthday & Anniversary', desc: "Celebrate customers on the right date with an offer that's actually for them.", reason: 'Requires CRM date fields mapped' },
];

const PLANNED_STEPS = [
  { delay: 'Day 0', channel: 'email' as Channel, when: '5 min after signup', title: 'Welcome — what arrives in your first box' },
  { delay: 'Day 1', channel: 'sms' as Channel, when: 'Morning, local time', title: 'A short tip on getting started' },
  { delay: 'Day 2', channel: 'email' as Channel, when: 'Same time as Day 0', title: 'Story — why we make it this way' },
  { delay: 'Day 4', channel: 'sms' as Channel, when: 'Afternoon nudge', title: 'Last call on your welcome offer' },
  { delay: 'Day 6', channel: 'email' as Channel, when: 'Soft close', title: 'Cart link + one-tap reorder' },
];

// ─── ICONS / PILLS ──────────────────────────────────────────────────────

function ChannelIcon({ kind, size = 22 }: { kind: Channel; size?: number }) {
  const inner = size === 22 ? 12 : Math.round(size * 0.55);
  if (kind === 'email') {
    return (
      <span style={{ display: 'inline-flex', width: size, height: size, borderRadius: 6, background: '#DBEAFE', color: '#3B82F6', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" width={inner} height={inner} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <path d="m3 8 9 6 9-6" />
        </svg>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', width: size, height: size, borderRadius: 6, background: '#F1ECFF', color: '#5B21B6', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" width={inner} height={inner} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12c0 4-4 7-9 7-1.4 0-2.7-.2-3.9-.7L3 20l1.5-4.3A6.6 6.6 0 0 1 3 12c0-4 4-7 9-7s9 3 9 7z" />
      </svg>
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const cfg: Record<Status, { bg: string; color: string; dot: string; label: string; pulse?: boolean }> = {
    live: { bg: '#DCFCE7', color: '#14532D', dot: '#22C55E', label: 'Live', pulse: true },
    draft: { bg: 'rgba(252,183,40,0.16)', color: '#B06000', dot: '#FCB728', label: 'Draft' },
    suggested: { bg: '#F1ECFF', color: '#5B21B6', dot: '#3B82F6', label: 'Suggested' },
  };
  const c = cfg[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 500, background: c.bg, color: c.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, boxShadow: c.pulse ? '0 0 0 0 rgba(34,197,94,0.45)' : undefined, animation: c.pulse ? 'es-pulse 1.6s ease infinite' : undefined }} />
      {c.label}
    </span>
  );
}

function AttentionPill({ attention }: { attention: NonNullable<Program['attention']> }) {
  const isYellow = attention.tone === 'yellow';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 450,
      background: isYellow ? 'rgba(252,183,40,0.16)' : '#F1ECFF',
      color: isYellow ? '#B06000' : '#5B21B6',
    }}>
      {attention.icon === 'star' && (
        <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor" aria-hidden>
          <path d="m12 2 1.6 4.6L18 8.2l-3.4 2.5L16 15l-4-2.7L8 15l1.4-4.3L6 8.2l4.4-1.6z" />
        </svg>
      )}
      {attention.label}
    </span>
  );
}

function BlockedPill() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 500, background: 'var(--dark-4)', color: 'var(--dark-60)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--dark-25)' }} />
      Coming soon
    </span>
  );
}

// ─── PROGRAM ROW (flat list — mirrors PaidSearch campaign row) ─────────

const ROW_GRID = '2fr 1fr 110px 110px 130px 110px 28px';

function ProgramRow({
  p,
  onOpen,
  last,
}: {
  p: Program;
  onOpen: () => void;
  last: boolean;
}) {
  const audience = p.stats.find((s) => /audience|reach|recipients/i.test(s.k));
  const audienceVal = audience?.v ?? '—';
  const cadence = `${p.steps.length} touches`;
  const lastSent =
    p.status === 'live'
      ? '2h ago'
      : p.status === 'draft'
        ? 'Not sent yet'
        : 'Not drafted';

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'grid',
        gridTemplateColumns: ROW_GRID,
        gap: 14,
        alignItems: 'center',
        padding: '14px 16px',
        background: 'transparent',
        border: 'none',
        borderBottom: last ? 'none' : '1px solid var(--dark-8)',
        width: '100%',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 450, color: 'var(--dark-90)' }}>{p.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 2 }}>
          {p.trigger} · {p.stage}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <StatusPill status={p.status} />
        {p.attention && <AttentionPill attention={p.attention} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {p.channels.map((c) => <ChannelIcon key={c} kind={c} size={20} />)}
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>{cadence}</div>
      <div style={{ fontSize: 13, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>{audienceVal}</div>
      <div style={{ fontSize: 12.5, color: 'var(--dark-60)' }}>{lastSent}</div>
      <div style={{ color: 'var(--dark-40)' }}>
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </div>
    </button>
  );
}

function BlockedRow({ b, onClick, last }: { b: BlockedProgram; onClick: () => void; last: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: ROW_GRID,
        gap: 14,
        alignItems: 'center',
        padding: '14px 16px',
        background: 'transparent',
        border: 'none',
        borderBottom: last ? 'none' : '1px solid var(--dark-8)',
        width: '100%',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        opacity: 0.75,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 450, color: 'var(--dark-90)' }}>{b.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 2 }}>{b.desc}</div>
      </div>
      <div>
        <BlockedPill />
      </div>
      <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>—</div>
      <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>—</div>
      <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>—</div>
      <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>{b.reason}</div>
      <div style={{ color: 'var(--dark-40)' }}>
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </div>
    </button>
  );
}

// ─── PROGRAM DETAIL MODAL ───────────────────────────────────────────────

type DetailTab = 'overview' | 'sequence' | 'performance';

interface ProgramDetailModalProps {
  program: Program;
  onAction: (kind: 'pause' | 'review' | 'approve' | 'decline' | 'draft' | 'dismiss') => void;
}

function ProgramDetailModal({ close, program, onAction }: StackModalProps & ProgramDetailModalProps) {
  const [tab, setTab] = useState<DetailTab>('overview');

  const primaryAction = () => {
    if (program.status === 'live') {
      return (
        <>
          <Modal.FooterButton variant="ghost" onPress={() => { onAction('pause'); close(); }}>
            Pause
          </Modal.FooterButton>
          <Modal.FooterButton variant="primary" onPress={() => { onAction('review'); close(); }}>
            Review {program.proposals} proposal{program.proposals === 1 ? '' : 's'}
          </Modal.FooterButton>
        </>
      );
    }
    if (program.status === 'draft') {
      return (
        <>
          <Modal.FooterButton variant="ghost" onPress={() => { onAction('decline'); close(); }}>
            Decline
          </Modal.FooterButton>
          <Modal.FooterButton variant="primary" onPress={() => { onAction('approve'); close(); }}>
            Approve to activate
          </Modal.FooterButton>
        </>
      );
    }
    return (
      <>
        <Modal.FooterButton variant="ghost" onPress={() => { onAction('dismiss'); close(); }}>
          Dismiss
        </Modal.FooterButton>
        <Modal.FooterButton variant="primary" onPress={() => { onAction('draft'); close(); }}>
          Have agent draft
        </Modal.FooterButton>
      </>
    );
  };

  return (
    <Modal.Root size="lg" aria-labelledby="es-detail-title" data-testid="email-sms-detail">
      <Modal.Header
        title={program.name}
        id="es-detail-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        {/* Sub-header: pills + stage + description */}
        <div style={{ padding: '0 4px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <StatusPill status={program.status} />
            {program.channels.map((c) => <ChannelIcon key={c} kind={c} />)}
            <span style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>{program.stage}</span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--dark-60)', lineHeight: 1.55 }}>{program.desc}</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--dark-8)', marginBottom: 16 }}>
          {(['overview', 'sequence', 'performance'] as DetailTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '11px 14px',
                fontFamily: 'inherit',
                fontSize: 13,
                color: tab === t ? 'var(--dark-90)' : 'var(--dark-60)',
                fontWeight: 450,
                borderBottom: tab === t ? '2px solid var(--dark-90)' : '2px solid transparent',
                marginBottom: -1,
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && <DetailOverview program={program} />}
        {tab === 'sequence' && <DetailSequence program={program} />}
        {tab === 'performance' && <DetailPerformance program={program} />}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <span style={{ fontSize: 12, color: 'var(--dark-40)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor" aria-hidden>
              <path d="m12 2 1.6 4.6L18 8.2l-3.4 2.5L16 15l-4-2.7L8 15l1.4-4.3L6 8.2l4.4-1.6z" />
            </svg>
            Drafted by Blaze agent · {program.name}
          </span>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          {primaryAction()}
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function DetailOverview({ program }: { program: Program }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Meta strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <MetaCell label="Trigger" value={program.trigger} />
        <MetaCell label="Channels" value={program.channels.map((c) => c === 'email' ? 'Email' : 'SMS').join(' + ')} />
        <MetaCell label="Cadence" value={`${program.steps.length} touches`} />
        <MetaCell label="Status" value={program.status === 'live' ? 'Running' : program.status === 'draft' ? 'Awaiting approval' : 'Agent ready'} />
      </div>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '14px 4px' }}>
        {program.stats.map((s, i) => (
          <div key={s.k} style={{ padding: '0 16px', borderLeft: i === 0 ? 'none' : '1px solid var(--dark-4)' }}>
            <div style={{ fontSize: 10.5, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 4 }}>{s.k}</div>
            <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.2px' }}>{s.v}</div>
            {s.d && (
              <div style={{ fontSize: 11, color: s.up ? '#14532D' : 'var(--dark-60)', marginTop: 3 }}>{s.d}</div>
            )}
          </div>
        ))}
      </div>

      {/* Activity */}
      <div>
        <SectionTitle>Activity</SectionTitle>
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: 6 }}>
          {program.activity.map((a, i) => (
            <ActivityRow key={i} a={a} first={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailSequence({ program }: { program: Program }) {
  return (
    <div>
      <SectionTitle>Sequence · {program.steps.length} touches</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11.5, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 4 }}>
          Trigger · <span style={{ color: 'var(--dark-90)', textTransform: 'none', letterSpacing: 0, fontSize: 13 }}>{program.trigger}</span>
        </div>
        {program.steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 1fr',
              gap: 14,
              alignItems: 'center',
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              padding: '12px 14px',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChannelIcon kind={s.channel} size={36} />
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: 'var(--light-100)', border: '1.5px solid var(--dark-15)', color: 'var(--dark-90)', fontSize: 10, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 11.5, color: 'var(--dark-60)', marginBottom: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 500, padding: '2px 7px', borderRadius: 5, letterSpacing: '0.04em', textTransform: 'uppercase', background: s.channel === 'email' ? '#DBEAFE' : '#F1ECFF', color: s.channel === 'email' ? '#1E3A8A' : '#5B21B6' }}>
                  {s.channel === 'email' ? 'Email' : 'SMS'}
                </span>
                <span style={{ fontWeight: 450, color: 'var(--dark-90)' }}>{s.day}</span>
                <span style={{ color: 'var(--dark-25)' }}>·</span>
                <span>{s.when}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 450, color: 'var(--dark-90)', marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.45 }}>{s.snippet}</div>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, paddingLeft: 10, marginTop: 4 }}>
          End of sequence
        </div>
      </div>
    </div>
  );
}

function DetailPerformance({ program }: { program: Program }) {
  if (!program.perf) {
    return (
      <div style={{ background: 'var(--light-100)', border: '1px dashed var(--dark-15)', borderRadius: 12, padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 4 }}>No performance yet</div>
        <div style={{ fontSize: 12.5, color: 'var(--dark-60)', maxWidth: 380, margin: '0 auto', lineHeight: 1.5 }}>
          Once this program is live, the agent surfaces send, open, click, and conversion rates here — plus any active A/B tests.
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {program.perf.map((c) => (
        <div key={c.k} style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{c.k}</div>
          <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.3px', marginTop: 3 }}>{c.v}</div>
          {c.d && (
            <div style={{ fontSize: 11.5, color: '#14532D', marginTop: 3 }}>{c.d}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 10.5, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 450, color: 'var(--dark-90)' }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-60)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
  );
}

function ActivityRow({ a, first }: { a: Activity; first: boolean }) {
  const cfg = a.kind === 'agent'
    ? { bg: '#F1ECFF', color: '#5B21B6' }
    : a.kind === 'win'
      ? { bg: '#DCFCE7', color: '#14532D' }
      : { bg: 'var(--dark-4)', color: 'var(--dark-60)' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 12, alignItems: 'center', padding: '9px 12px', borderTop: first ? 'none' : '1px solid var(--dark-4)' }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {a.kind === 'agent' && (
          <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor" aria-hidden>
            <path d="m12 2 1.6 4.6L18 8.2l-3.4 2.5L16 15l-4-2.7L8 15l1.4-4.3L6 8.2l4.4-1.6z" />
          </svg>
        )}
        {a.kind === 'win' && (
          <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12 5 5L20 7" />
          </svg>
        )}
        {a.kind === 'edit' && (
          <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
          </svg>
        )}
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-90)' }}>
        {a.title} <span style={{ color: 'var(--dark-60)' }}>· {a.meta}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--dark-40)', flexShrink: 0 }}>{a.time}</div>
    </div>
  );
}

// ─── NEW PROGRAM MODAL ──────────────────────────────────────────────────

interface NewProgramModalProps {
  onGenerate: () => void;
}

function NewProgramModal({ close, onGenerate }: StackModalProps & NewProgramModalProps) {
  return (
    <Modal.Root size="lg" aria-labelledby="es-new-title" data-testid="email-sms-new">
      <Modal.Header
        title="New program — Welcome Stack"
        id="es-new-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.2px', marginBottom: 8 }}>
          Turn fresh signups into confirmed first orders.
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--dark-60)', lineHeight: 1.55, marginBottom: 20 }}>
          When a customer joins your list, the agent runs a 5-touch sequence across email and SMS over 6 days — a warm welcome, helpful tips, social proof, and a soft close on their welcome offer.
        </div>

        {/* Meta strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
          <MetaCell label="Trigger" value="Email signup" />
          <MetaCell label="Channels" value="Email + SMS" />
          <MetaCell label="Cadence" value="5 touches · 6 days" />
          <MetaCell label="Tone" value="Warm · helpful" />
        </div>

        {/* Planned steps */}
        <div style={{ marginBottom: 22 }}>
          <SectionTitle>Planned steps</SectionTitle>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: 8, display: 'flex', flexDirection: 'column' }}>
            {PLANNED_STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 130px 1fr',
                  gap: 14,
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--dark-4)',
                }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--light-100)', border: '1px solid var(--dark-8)', color: 'var(--dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 500 }}>
                  {i + 1}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--dark-60)' }}>
                  <ChannelIcon kind={s.channel} size={18} />
                  <span><strong style={{ color: 'var(--dark-90)', fontWeight: 450 }}>{s.delay}</strong> · {s.when}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--dark-90)' }}>{s.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div>
          <SectionTitle>What the agent has read</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { name: 'Brand Kit', meta: 'Voice · tone · color · logo' },
              { name: 'Klaviyo', meta: '12k contacts · last 90d engagement' },
              { name: 'Shopify', meta: 'Order history · catalog · welcome offer' },
            ].map((src) => (
              <div key={src.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 9, fontSize: 12.5 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--dark-2)', border: '1px solid var(--dark-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark-80)' }}>
                  <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 3 4 7v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V7l-8-4z" />
                  </svg>
                </div>
                <span style={{ fontWeight: 450, color: 'var(--dark-90)', flex: 1 }}>{src.name}</span>
                <span style={{ color: 'var(--dark-40)', fontSize: 11.5 }}>{src.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => { onGenerate(); close(); }}>
            Generate program
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── ROUTE ──────────────────────────────────────────────────────────────

export function EmailSmsRoute() {
  return (
    <ModalStack>
      <EmailSmsRouteInner />
    </ModalStack>
  );
}

function EmailSmsRouteInner() {
  const { showToast } = useToast();
  const { openModal } = useModals();
  const { getState } = useDevState();
  const isCold = getState('/h2/email-sms') === 'cold';

  const handleOpenDetail = (p: Program) => {
    openModal(ProgramDetailModal, {
      program: p,
      onAction: (kind) => {
        const messages: Record<typeof kind, string> = {
          pause: `Paused — ${p.name} is no longer sending`,
          review: `Opening ${p.proposals} agent proposal${p.proposals === 1 ? '' : 's'}`,
          approve: `Approved — ${p.name} is going live`,
          decline: `Draft declined — ${p.name} returned to suggestions`,
          draft: `Agent is drafting — ${p.name} ready in ~2 minutes`,
          dismiss: `Dismissed — ${p.name} hidden from suggestions`,
        };
        showToast({ message: messages[kind] });
      },
    });
  };

  const handleOpenNew = () => {
    openModal(NewProgramModal, {
      onGenerate: () => showToast({ message: 'Generating program — agent is drafting' }),
    });
  };

  const topbarRight = (
    <Button variant="secondary" size="md" frontIcon={Plus} onPress={handleOpenNew}>
      New program
    </Button>
  );

  if (isCold) {
    return (
      <H2Layout>
        <EmailSmsColdView />
      </H2Layout>
    );
  }

  return (
    <H2Layout topbarRight={topbarRight}>
      <style>{`
        @keyframes es-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          70%  { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 28px 60px' }}>
        <div
          style={{
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: ROW_GRID,
              gap: 14,
              alignItems: 'center',
              padding: '11px 16px',
              background: 'var(--surface-2, #FAFAFA)',
              borderBottom: '1px solid var(--dark-8)',
              fontSize: 11,
              color: 'var(--dark-40)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 450,
            }}
          >
            <div>Program</div>
            <div>Status</div>
            <div>Channels</div>
            <div>Cadence</div>
            <div>Audience</div>
            <div>Last sent</div>
            <div />
          </div>
          {PROGRAMS.map((p, i) => (
            <ProgramRow
              key={p.id}
              p={p}
              onOpen={() => handleOpenDetail(p)}
              last={i === PROGRAMS.length - 1 && BLOCKED.length === 0}
            />
          ))}
          {BLOCKED.map((b, i) => (
            <BlockedRow
              key={b.name}
              b={b}
              onClick={() => showToast({ message: `${b.reason} — connect to enable ${b.name}` })}
              last={i === BLOCKED.length - 1}
            />
          ))}
        </div>
      </div>
    </H2Layout>
  );
}
