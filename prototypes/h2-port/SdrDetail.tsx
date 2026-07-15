import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type SVGProps } from 'react';
import { Button, Heading, IconButton, Modal, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Avatar, StatusPill, useToast } from '@/staging';
import Voice from '@/icons/20/Voice';
import Play3 from '@/icons/20/Play3';
import ThumbUp from '@/icons/20/ThumbUp';
import ThumbDown from '@/icons/20/ThumbDown';
import Mail from '@/icons/20/Mail';
import MessageChat01 from '@/icons/20/MessageChat01';
import Templates from '@/icons/20/Templates';
import Calendar1 from '@/icons/20/Calendar1';
import Refresh01 from '@/icons/20/Refresh01';
import ChevronDown from '@/icons/20/ChevronDown';
import Trash2 from '@/icons/20/Trash2';
import AlertTriangle from '@/icons/20/AlertTriangle';
import Send2 from '@/icons/16/Send2';
import Send1 from '@/icons/20/Send1';
import Copy from '@/icons/20/Copy';
import ArrowLeft from '@/icons/20/ArrowLeft';
import ArrowUp from '@/icons/20/ArrowUp';
import ArrowDown from '@/icons/20/ArrowDown';
import {
  SOURCE_LABELS,
  STATUS_STYLES,
  ALL_STATUSES,
  BOOKING_OUTCOME_STYLES,
  effectiveBookingOutcome,
  avatarColor,
  conversationSummary,
  defaultMedium,
  MEDIUM_LABELS,
  formatRelative,
  relativeMinutesAgo,
  type BookingOutcome,
  type Channel,
  type Contact,
  type Lead,
  type Message,
  type MessageMedium,
  type Scorecard,
  type Status,
} from './sdr-data';
import { OutcomeSelect } from './BookingOutcomeSelect';
import { DEFAULT_QUALIFICATION_QUESTIONS } from './qualification-criteria-data';
import { qualificationAnswer } from './qualification-answer';

// Blaze-style focus for the composer: the textarea has no border of its own —
// the visible border lives on its parent pill wrapper — so focus mutates the
// PARENT (darker border + subtle ring), reverting on blur.
const composerFocusProps = {
  onFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const parent = e.currentTarget.parentElement;
    if (parent) {
      parent.style.borderColor = 'var(--dark-40)';
      parent.style.boxShadow = '0 0 0 3px var(--dark-4)';
    }
  },
  onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const parent = e.currentTarget.parentElement;
    if (parent) {
      parent.style.borderColor = 'var(--dark-8)';
      parent.style.boxShadow = 'none';
    }
  },
};

/**
 * Outlined calendar icon. The lib's `Calendar1` relies on the <svg> carrying
 * `fill="none"`, which Button's `.frontIcon { fill }` rule overrides — making
 * the icon read as a solid block inside a Button. This local copy sets
 * `fill="none"` on the <path> itself, so the stroke outline survives.
 */
function CalendarOutline({ size = 20, color = 'currentColor', ...rest }: SVGProps<SVGSVGElement> & { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M3.95833 7.42855H15.625M5.46627 2.5V3.78586M13.9583 2.5V3.78571M16.4583 6.03571V15.25C16.4583 16.4926 15.4634 17.5 14.2361 17.5H5.34722C4.11992 17.5 3.125 16.4926 3.125 15.25V6.03571C3.125 4.79307 4.11992 3.78571 5.34722 3.78571H14.2361C15.4634 3.78571 16.4583 4.79307 16.4583 6.03571Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Channel glyph for the conversation header and inbox row. */
export function ChannelGlyph({
  channel,
  size = 16,
  muted = false,
}: {
  channel: Channel;
  size?: number;
  muted?: boolean;
}) {
  const base = muted ? 'var(--dark-60)' : 'var(--dark-90)';
  if (channel === 'form') return <Templates size={size} color={base} />;
  if (channel === 'inbound-call') return <Voice size={size} color={base} />;
  if (channel === 'chat') return <MessageChat01 size={size} color={base} />;
  return <Mail size={size} color={base} />;
}

interface SdrDetailProps {
  lead: Lead;
  onUpdateLead: (lead: Lead) => void;
  allLeads: Lead[];
  contacts: Contact[];
  onOpenContact: (contactId: string) => void;
  onSwitchToLead?: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function nowOffset(): string {
  return 'm:0';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function makeMessage(role: Message['role'], type: Message['type'], content: string, medium?: MessageMedium): Message {
  return {
    id: `m-${Math.random().toString(36).slice(2, 9)}`,
    role,
    type,
    content,
    timestamp: nowOffset(),
    ...(medium ? { medium } : {}),
  };
}

/** Derive a human request-type label from the lead's tags, status, or channel. */
function requestType(lead: Lead): string {
  const specific = lead.tags.find((t) =>
    /(warranty|emergency|repair|inspection)/i.test(t),
  );
  if (specific) return specific;
  if (lead.status === 'resolved') return 'Booking request';
  if (lead.channel === 'inbound-call') return 'Inbound call inquiry';
  return 'Estimate request';
}

// ─── Contact timeline ─────────────────────────────────────────────────

interface TimelineEvent {
  id: string;
  kind: 'inbound' | 'conversation' | 'trigger' | 'booking' | 'escalation' | 'outcome';
  label: string;
  timestamp: string;
  leadId: string;
  isActive: boolean;
  /** When set, the timeline renders a solid dot in this color (used for the
   *  booking-outcome event so it's colored by sentiment). */
  dotColor?: string;
}

function isTriggerMessage(content: string): boolean {
  return /escalat|flagged for owner|paused for owner|detected|rules-engine|morning digest/i.test(content);
}

// Dot color for a booking-outcome timeline event, by sentiment.
const OUTCOME_DOT_COLOR: Record<string, string> = {
  completed: 'var(--status-posting)',
  'estimate-sent': '#b3870f',
  won: 'var(--status-approved)',
  'job-done': 'var(--purple)',
  'no-show': 'var(--status-connect)',
  canceled: 'var(--dark-40)',
  lost: 'var(--red-70)',
};

function buildContactTimeline(leads: Lead[], activeLead: Lead): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const lead of leads) {
    const isActive = lead.id === activeLead.id;
    events.push({
      id: `${lead.id}-inbound`,
      kind: 'inbound',
      label: lead.channel !== 'form' ? `${SOURCE_LABELS[lead.channel]} · ${requestType(lead)}` : requestType(lead),
      timestamp: lead.created_at,
      leadId: lead.id,
      isActive,
    });
    for (const msg of lead.transcript) {
      if (msg.type === 'system' && isTriggerMessage(msg.content)) {
        events.push({
          id: `${lead.id}-${msg.id}`,
          kind: 'trigger',
          label: msg.content.split('·')[0].trim(),
          timestamp: msg.timestamp,
          leadId: lead.id,
          isActive,
        });
      }
    }
    if (lead.status === 'resolved') {
      events.push({ id: `${lead.id}-out`, kind: 'booking', label: 'Booking scheduled', timestamp: lead.last_activity_at, leadId: lead.id, isActive });
      // Surface the booking's outcome once it's moved past plain "Scheduled"
      // (auto-derived completion or a manual override). Updates live as the
      // outcome is changed from the booking card or the Bookings table.
      const outcome = effectiveBookingOutcome(lead);
      if (outcome !== 'scheduled') {
        events.push({
          id: `${lead.id}-outcome`,
          kind: 'outcome',
          label: `Outcome · ${BOOKING_OUTCOME_STYLES[outcome].label}`,
          timestamp: lead.last_activity_at,
          leadId: lead.id,
          isActive,
          dotColor: OUTCOME_DOT_COLOR[outcome] ?? 'var(--dark-40)',
        });
      }
    } else if (lead.status === 'human-handling') {
      events.push({ id: `${lead.id}-out`, kind: 'escalation', label: 'Needs owner review', timestamp: lead.last_activity_at, leadId: lead.id, isActive });
    } else if (lead.status === 'opted-out') {
      events.push({ id: `${lead.id}-out`, kind: 'outcome', label: 'Opted out', timestamp: lead.last_activity_at, leadId: lead.id, isActive });
    }
  }
  return events;
}

// ─── Calendly mock modal ──────────────────────────────────────────────

const CAL_DAYS = [
  { label: 'Thu', date: 'Nov 14' },
  { label: 'Fri', date: 'Nov 15' },
  { label: 'Mon', date: 'Nov 18' },
];

const CAL_SLOTS = ['9:30 AM', '11:00 AM', '2:00 PM', '3:30 PM'];

function CalendlyMockModal({
  close,
  onPick,
}: StackModalProps & { onPick: (label: string) => void }) {
  return (
    <Modal.Root size="md" aria-labelledby="calendly-mock-title" data-testid="calendly-mock">
      <Modal.Header title="Schedule meeting" id="calendly-mock-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <Text variant="secondary" style={{ display: 'block', marginBottom: 16, lineHeight: 1.5 }}>
          Pick a 30-minute slot. The prospect will receive a confirmation email immediately.
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {CAL_DAYS.map((day) => (
            <div
              key={day.label}
              style={{
                background: 'var(--light-100)',
                border: '1px solid var(--dark-8)',
                borderRadius: 12,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--dark-60)', marginBottom: 4 }}>
                <div style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{day.label}</div>
                <div>{day.date}</div>
              </div>
              {CAL_SLOTS.map((slot) => (
                <Button key={slot} variant="secondary" size="sm" fullWidth onPress={() => { onPick(`${day.label} ${day.date} · ${slot}`); close(); }}>
                  {slot}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="ghost" onPress={close}>Cancel</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── Thread message components ────────────────────────────────────────

const ROLE_LABELS: Record<Message['role'], string> = {
  ai: 'AI',
  prospect: 'Prospect',
  system: 'System',
  owner: 'Owner',
};

const BUBBLE_BG: Record<Message['role'], string> = {
  // AI uses a light --status-posting tint (same blue as the summary card).
  // Owner replies are a solid --status-posting fill so the human takeover
  // reads as a bolder "sent by you" bubble, distinct from the AI's tints.
  ai: 'rgba(1, 121, 207, 0.12)',
  owner: 'var(--status-posting)',
  prospect: 'var(--dark-4)',
  system: 'var(--dark-4)',
};

// Bubble text color. Owner sits on the solid blue fill, so it needs white text
// (~4.5:1 contrast on --status-posting #0179cf — passes WCAG AA); every other
// role sits on a light tint and keeps dark text.
const BUBBLE_FG: Record<Message['role'], string> = {
  ai: 'var(--dark-90)',
  owner: 'var(--light-100)',
  prospect: 'var(--dark-90)',
  system: 'var(--dark-90)',
};

function TextBubble({
  msg,
  prospectName,
  muted = false,
}: {
  msg: Message;
  prospectName: string;
  muted?: boolean;
}) {
  const isOutbound = msg.role === 'ai' || msg.role === 'owner';
  const align: CSSProperties['justifyContent'] = isOutbound ? 'flex-end' : 'flex-start';
  const label = msg.role === 'prospect' ? prospectName : ROLE_LABELS[msg.role];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'flex-end' ? 'flex-end' : 'flex-start',
        gap: 4,
        opacity: muted ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--dark-60)' }}>
        <span style={{ fontWeight: 400 }}>{label}</span>
        <span>· {formatRelative(msg.timestamp)}</span>
      </div>
      <div
        style={{
          background: BUBBLE_BG[msg.role],
          color: BUBBLE_FG[msg.role],
          borderRadius: 12,
          padding: '10px 14px',
          fontSize: 14,
          lineHeight: 1.5,
          maxWidth: '78%',
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

// Thumbs up/down feedback on an interaction (a call, or the whole conversation).
// Local-only: records the rating, toggles off if the same thumb is tapped again,
// and confirms with a toast. Selection is shown by tinting the icon (green up /
// red down) — no filled background.
function FeedbackButtons({ context }: { context: string }) {
  const { showToast } = useToast();
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const choose = (next: 'up' | 'down') => {
    const value = rating === next ? null : next;
    setRating(value);
    if (value === 'up') showToast({ message: `${context} marked helpful` });
    else if (value === 'down') showToast({ message: `${context} flagged for review` });
  };
  const btnStyle: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, padding: 0, border: 'none', borderRadius: 6,
    background: 'transparent', cursor: 'pointer',
  };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <button type="button" aria-label={`${context}: helpful`} aria-pressed={rating === 'up'} onClick={() => choose('up')} style={btnStyle}>
        <ThumbUp size={18} color={rating === 'up' ? 'var(--status-approved)' : 'var(--dark-40)'} />
      </button>
      <button type="button" aria-label={`${context}: not helpful`} aria-pressed={rating === 'down'} onClick={() => choose('down')} style={btnStyle}>
        <ThumbDown size={18} color={rating === 'down' ? 'var(--red-70)' : 'var(--dark-40)'} />
      </button>
    </div>
  );
}

// Call transcript rendered inline — no card. It sits in the conversation flow
// like the text bubbles and system rows; the labelled header + speaker-prefixed
// turns are enough to read it as a call without a box around it. (The boxed/
// tinted card treatment now belongs to the conversation summary at the top.)
function CallTurnBlock({ msg, muted = false }: { msg: Message; muted?: boolean }) {
  const { showToast } = useToast();
  if (!msg.call) return null;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        opacity: muted ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Voice size={16} color="var(--status-posting)" />
        <Text variant="secondary">Call transcript · {msg.call.duration}</Text>
        <Text variant="secondary" style={{ marginLeft: 'auto', fontSize: 12 }}>{formatRelative(msg.timestamp)}</Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msg.call.turns.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5, color: 'var(--dark-80)' }}>
            <span style={{ fontWeight: 500, color: t.speaker === 'AI' ? 'var(--status-posting)' : 'var(--dark-90)', flexShrink: 0, minWidth: 56 }}>
              {t.speaker}:
            </span>
            <span>{t.line}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Button variant="secondary" size="sm" frontIcon={Play3} onPress={() => showToast({ message: 'Replaying call…' })}>
          Replay call
        </Button>
        <FeedbackButtons context="Call" />
      </div>
    </div>
  );
}

// Conversation summary card — the prominent boxed element at the top of the
// thread. Inherits the blue-tinted card treatment the call transcript used to
// own, so the summary now reads as the priority element of the conversation.
function ConversationSummary({ lead }: { lead: Lead }) {
  return (
    <div
      style={{
        border: '1px solid rgba(1, 121, 207, 0.15)',
        background: 'rgba(1, 121, 207, 0.04)',
        borderRadius: 8,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <Text variant="secondary">Summary</Text>
      <Text variant="primary" style={{ fontSize: 16, lineHeight: 1.5 }}>
        {conversationSummary(lead)}
      </Text>
    </div>
  );
}

/**
 * Trailing AI bubble shown to the prospect when a lead is escalated/paused to
 * the owner. Reuses TextBubble so it matches every other AI message exactly.
 * Owner name + timeframe are static (the mock has a single owner, "Matthew").
 */
function EscalationHandoffBubble({ leadId, muted = false }: { leadId: string; muted?: boolean }) {
  const handoff: Message = {
    id: `${leadId}-handoff`,
    role: 'ai',
    type: 'text',
    content:
      "I've passed this over to Matthew, our owner — he'll give you a call about it within one business day. You don't need to do anything else in the meantime.",
    timestamp: nowOffset(),
  };
  return <TextBubble msg={handoff} prospectName="" muted={muted} />;
}

function SystemRow({ msg, muted = false }: { msg: Message; muted?: boolean }) {
  // One quiet system-event row. Trigger-messages (escalations, rules-engine
  // signals) and regular system notes (e.g. "Walkthrough booked") share the
  // same minimal style — it should read as "a system making a decision",
  // never as a loud alert.
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px',
        borderRadius: 6,
        background: 'var(--dark-2)',
        fontSize: 12,
        color: 'var(--dark-60)',
        opacity: muted ? 0.6 : 1,
      }}
    >
      <span style={{ flex: 1 }}>{msg.content}</span>
      <span style={{ color: 'var(--dark-40)', flexShrink: 0 }}>{formatRelative(msg.timestamp)}</span>
    </div>
  );
}

/**
 * True when a system message marks the moment a booking was made — e.g.
 * "Walkthrough booked · …", "Calendar invite sent · …", or the runtime-
 * generated "Meeting booked for …". Used to render the prominent BookingCard
 * inline at the point the booking happened.
 */
function isBookingMessage(msg: Message): boolean {
  return msg.type === 'system' && /booked|calendar invite/i.test(msg.content);
}

/**
 * Prominent green "Booking confirmed" card. Rendered inline in the transcript
 * at the point the booking actually happened (in place of the plain SystemRow),
 * or once at the end of a resolved lead's messages when no booking system
 * message is present. Carries a Reschedule affordance that re-opens the
 * Calendly mock modal via the same handler as the sidebar button.
 */
function BookingCard({ lead, onReschedule, onSetOutcome }: { lead: Lead; onReschedule?: () => void; onSetOutcome?: (o: BookingOutcome | null) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        background: 'rgba(4, 175, 0, 0.06)',
        border: '1px solid rgba(4, 175, 0, 0.25)',
        borderRadius: 12,
        padding: '16px 18px',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'rgba(4, 175, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <CalendarOutline size={20} color="var(--status-approved)" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ fontSize: 12, color: 'var(--status-approved)', fontWeight: 500 }}>
            Booking confirmed
          </Text>
          {onSetOutcome && <OutcomeSelect lead={lead} onSetOutcome={onSetOutcome} />}
        </div>
        <Heading level={3} style={{ margin: 0 }}>
          {lead.scheduled_at}
        </Heading>
        {lead.location && (
          <Text style={{ fontSize: 14, color: 'var(--dark-80)', lineHeight: 1.4 }}>
            {lead.location}
          </Text>
        )}
        <Text variant="secondary" style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.45, marginTop: 2 }}>
          {lead.location === 'Phone call'
            ? 'Matthew will call at the scheduled time. Reschedule from the contact’s calendar if anything changes.'
            : 'Matthew will arrive at the scheduled time. Reschedule from the contact’s calendar if anything changes.'}
        </Text>
        {onReschedule && (
          <div style={{ marginTop: 8 }}>
            <Button variant="secondary" size="sm" frontIcon={CalendarOutline} onPress={onReschedule}>
              Reschedule
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// LiveCallBanner + pulse-style injector removed: the standalone "live-call"
// status was folded into "ai-handling" when the lifecycle was simplified to
// four states. Reintroduce here if a live-call concept comes back as a per-
// lead flag.

// ─── Lead segment divider ─────────────────────────────────────────────

// Section header that introduces each conversation in the unified contact
// thread — a clear H3 heading (the request type) plus a subhead row with the
// status and where/when it came in. No box, no purple.
/** One-line touchpoint hint shown under a collapsed request, e.g.
 *  "Website form · 1 call · 4 messages". */
function engagementHint(lead: Lead): string {
  const es = buildEngagements(lead);
  const parts: string[] = [];
  if (es.some((e) => e.kind === 'form')) parts.push('Website form');
  const calls = es.filter((e) => e.kind === 'call').length;
  if (calls) parts.push(`${calls} call${calls > 1 ? 's' : ''}`);
  const msgs = es.reduce((n, e) => n + (e.kind === 'text' ? e.count : 0), 0);
  if (msgs) parts.push(`${msgs} message${msgs > 1 ? 's' : ''}`);
  return parts.join(' · ');
}

function LeadSegmentDivider({
  lead,
  capture,
  collapsible,
  collapsed,
  onToggle,
}: {
  lead: Lead;
  capture?: Message | null;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const ss = STATUS_STYLES[lead.status];
  const req = requestType(lead);
  const subhead = capture
    ? `${capture.content} · ${formatRelative(capture.timestamp)}`
    : `${lead.channel !== 'form' ? `${SOURCE_LABELS[lead.channel]} · ` : ''}${formatRelative(lead.created_at)}`;
  const body = (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Heading level={3} style={{ marginBottom: 4 }}>{req}</Heading>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <StatusPill tone={ss.tone} size="sm">{ss.label}</StatusPill>
          <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            {subhead}
            {collapsed && engagementHint(lead) ? ` · ${engagementHint(lead)}` : ''}
          </Text>
        </div>
      </div>
      {collapsible && (
        <ChevronDown
          size={20}
          color="var(--dark-60)"
          style={{ flexShrink: 0, marginTop: 2, transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 120ms ease' }}
        />
      )}
    </div>
  );
  const wrapStyle: CSSProperties = {
    paddingBottom: 8,
    marginBottom: collapsed ? 0 : 20,
    borderBottom: collapsed ? 'none' : '1px solid var(--dark-8)',
  };
  if (collapsible) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle?.(); } }}
        style={{ ...wrapStyle, cursor: 'pointer' }}
      >
        {body}
      </div>
    );
  }
  return <div style={wrapStyle}>{body}</div>;
}

// ─── Thread pane ──────────────────────────────────────────────────────

// ─── Engagement summaries (main panel) ───────────────────────────────
// Segment a lead's transcript into human-readable engagements — a Website Form
// submission, an AI-handled call, an SMS/email conversation — each shown as a
// summary with an inline expander to the full transcript. Mirrors the inbox
// timeline's grouping so the detail panel reads as a list of touchpoints.

type Engagement =
  | { id: string; kind: 'form'; title: string; source: string; need?: string; when: string }
  | { id: string; kind: 'call'; title: string; duration?: string; summary: string; turns: { speaker: string; line: string }[]; when: string }
  | { id: string; kind: 'text'; title: string; medium: MessageMedium; count: number; messages: Message[]; summary: string; when: string };

function buildEngagements(lead: Lead): Engagement[] {
  const items: Engagement[] = [];
  const msgs = lead.transcript;

  // Website Form leads open with the form submission as their first engagement.
  if (lead.channel === 'form') {
    items.push({ id: `${lead.id}-form`, kind: 'form', title: 'Website Form', source: lead.first_touch_source, need: lead.scorecard.need, when: lead.first_seen });
  }

  let i = 0;
  // Fold a leading capture/inbound system marker into the header above.
  if (msgs[i]?.type === 'system' && /captur|form|landing|inbound|chat|option/i.test(msgs[i].content)) {
    i += 1;
  }

  // A text "run" accumulates consecutive same-medium messages into one
  // conversation. System messages are dropped from the summary view but do NOT
  // break the run, so a reply appended after a system note (e.g. "AI paused")
  // still folds into the conversation it belongs to.
  let run: Message[] = [];
  const flushRun = () => {
    if (run.length === 0) return;
    const med = run[0].medium ?? defaultMedium(run[0], lead.channel) ?? 'sms';
    items.push({ id: run[0].id, kind: 'text', title: `${MEDIUM_LABELS[med]} conversation`, medium: med, count: run.length, messages: run, summary: conversationSummary(lead), when: run[run.length - 1].timestamp });
    run = [];
  };

  while (i < msgs.length) {
    const m = msgs[i];
    if (m.type === 'system') { i += 1; continue; } // skip, don't flush the current run
    if (m.type === 'call') {
      flushRun();
      const turns = m.call?.turns ?? [];
      const callerLine = turns.find((t) => /caller|prospect|client/i.test(t.speaker))?.line;
      items.push({ id: m.id, kind: 'call', title: m.role === 'ai' ? 'AI-handled call' : 'Call', duration: m.call?.duration, summary: callerLine ?? m.content, turns, when: m.timestamp });
      i += 1;
      continue;
    }
    // text — start a new run when the medium changes
    const med = m.medium ?? defaultMedium(m, lead.channel) ?? 'sms';
    const runMed = run.length ? (run[0].medium ?? defaultMedium(run[0], lead.channel) ?? 'sms') : med;
    if (run.length && runMed !== med) flushRun();
    run.push(m);
    i += 1;
  }
  flushRun();
  return items;
}

/** The medium a reply on this lead should send as — the last text
 *  conversation's medium, or SMS for a call-only / fresh lead. Drives the
 *  Send Text/Reply label and folds the sent reply into that conversation. */
function replyMedium(lead: Lead): MessageMedium {
  const engagements = buildEngagements(lead);
  for (let i = engagements.length - 1; i >= 0; i--) {
    const e = engagements[i];
    if (e.kind === 'text') return e.medium;
    if (e.kind === 'call') return 'sms'; // follow up a call by text
  }
  return 'sms';
}

/** Call transcript rendered inline (turns in a tinted box). */
function InlineCallTurns({ turns }: { turns: { speaker: string; line: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', background: 'var(--dark-2)', border: '1px solid var(--dark-4)', borderRadius: 10 }}>
      {turns.map((t, i) => (
        <div key={i}>
          <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 1 }}>{t.speaker}</Text>
          <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.5 }}>{t.line}</Text>
        </div>
      ))}
    </div>
  );
}

/** SMS/email thread rendered inline as chat bubbles. Outgoing SMS bubbles are
 *  green (texting convention); other channels keep the dark outgoing bubble. */
function InlineMessageThread({ messages, medium }: { messages: Message[]; medium: MessageMedium }) {
  const mineBg = medium === 'sms' ? 'var(--status-approved)' : 'var(--dark-90)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {messages.map((m) => {
        const mine = m.role === 'ai' || m.role === 'owner';
        return (
          <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '8px 12px', borderRadius: 12, background: mine ? mineBg : 'var(--dark-4)' }}>
            <Text variant="secondary" style={{ color: mine ? 'var(--light-100)' : 'var(--dark-90)', lineHeight: 1.5 }}>{m.content}</Text>
          </div>
        );
      })}
    </div>
  );
}

// Per-engagement icon + accent color for the summary header.
const ENGAGEMENT_META: Record<Engagement['kind'], { Icon: React.ComponentType<{ size?: number; color?: string }>; color: string }> = {
  call: { Icon: Voice, color: 'var(--status-posting)' },     // blue
  text: { Icon: MessageChat01, color: 'var(--status-approved)' }, // green
  form: { Icon: Templates, color: 'var(--purple)' },          // purple
};

/** One engagement's summary card with an inline expander to its full transcript. */
function EngagementBlock({ engagement, open, onToggle }: { engagement: Engagement; open: boolean; onToggle: () => void }) {
  const e = engagement;
  const meta = ENGAGEMENT_META[e.kind];
  const Icon = meta.Icon;
  // Indent the body so the summary and button line up with the title text,
  // clearing the 18px leading icon + 8px gap in the header row.
  const INDENT = 26;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Icon size={18} color={meta.color} />
        <Heading level={5} style={{ margin: 0 }}>{e.title}</Heading>
        {e.kind === 'call' && e.duration && <Text variant="metadata" color="var(--dark-60)">· {e.duration}</Text>}
        {e.kind === 'text' && <Text variant="metadata" color="var(--dark-60)">· {e.count} message{e.count === 1 ? '' : 's'}</Text>}
        <Text variant="metadata" color="var(--dark-40)" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>{formatRelative(e.when)}</Text>
      </div>
      <div style={{ paddingLeft: INDENT }}>
        {e.kind === 'form' ? (
          <>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block' }}>{e.source}</Text>
            {e.need && <Text variant="primary" style={{ display: 'block', marginTop: 4, color: 'var(--dark-90)', lineHeight: 1.5 }}>Requested: {e.need}</Text>}
          </>
        ) : (
          <>
            <Text variant="primary" style={{ display: 'block', color: 'var(--dark-90)', lineHeight: 1.5 }}>{e.summary}</Text>
            <div style={{ marginTop: 10 }}>
              <Button variant="secondary" size="sm" onPress={onToggle}>
                {e.kind === 'call'
                  ? (open ? 'Hide transcript' : 'See full transcript')
                  : (open ? 'Hide messages' : 'See messages')}
              </Button>
            </div>
            {open && e.kind === 'call' && <div style={{ marginTop: 12 }}><InlineCallTurns turns={e.turns} /></div>}
            {open && e.kind === 'text' && <div style={{ marginTop: 12 }}><InlineMessageThread messages={e.messages} medium={e.medium} /></div>}
            {open && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <Text variant="secondary" style={{ fontSize: 13, color: 'var(--dark-60)' }}>Did the AI handle this well?</Text>
                <FeedbackButtons context="Conversation" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** A lead's engagements, stacked with dividers between them. Owns the per-block
 *  expand state and auto-opens the latest text conversation when a reply is
 *  appended (so you can see the message you just sent). */
function LeadEngagements({ lead }: { lead: Lead }) {
  const engagements = buildEngagements(lead);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const prevLen = useRef(lead.transcript.length);
  useEffect(() => {
    if (lead.transcript.length > prevLen.current) {
      const lastText = [...engagements].reverse().find((e) => e.kind === 'text');
      if (lastText) setOpenIds((prev) => new Set(prev).add(lastText.id));
    }
    prevLen.current = lead.transcript.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.transcript.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {engagements.map((e, i) => (
        <div key={e.id} style={{ paddingTop: i === 0 ? 0 : 24, marginTop: i === 0 ? 0 : 24, borderTop: i === 0 ? 'none' : '1px solid var(--dark-8)' }}>
          <EngagementBlock engagement={e} open={openIds.has(e.id)} onToggle={() => toggle(e.id)} />
        </div>
      ))}
    </div>
  );
}

/** Recommended next step / proposed reply, rendered inline in the thread.
 *  The Send Reply + Copy actions sit on the card; the composer input stays
 *  pinned to the bottom. */
function ProposedReplyInline({
  text,
  paused,
  sendLabel,
  onApprove,
  onResumeAi,
}: {
  text: string;
  paused: boolean;
  sendLabel: string;
  onApprove: () => void;
  onResumeAi: () => void;
}) {
  const { showToast } = useToast();
  const copy = () => {
    try { navigator.clipboard?.writeText(text); } catch { /* ignore */ }
    showToast({ message: 'Reply copied' });
  };
  return (
    <div style={{ paddingTop: 24, marginTop: 24, borderTop: '1px solid var(--dark-8)' }}>
      <Heading level={5} style={{ margin: 0, marginBottom: 8 }}>Recommended next step</Heading>
      <div style={{ padding: '12px 14px', background: 'var(--dark-2)', border: '1px solid var(--dark-4)', borderRadius: 10 }}>
        <Text variant="primary" style={{ color: 'var(--dark-90)', lineHeight: 1.5, display: 'block' }}>{text}</Text>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          {paused && <Button variant="ghost" size="md" onPress={onResumeAi}>Resume AI</Button>}
          <Button variant="tertiary" size="md" frontIcon={Copy} onPress={copy}>Copy</Button>
          <Button variant="secondary" size="md" frontIcon={Send1} onPress={onApprove}>{sendLabel}</Button>
        </div>
      </div>
    </div>
  );
}

interface ThreadPaneProps {
  lead: Lead;
  allContactLeads: Lead[];
  paused: boolean;
  onSendOwner: (text: string) => void;
  onApproveSuggested: (text: string) => void;
  onResumeAi: () => void;
  onReschedule: () => void;
  onUpdateLead: (lead: Lead) => void;
  segmentRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

function ThreadPane({
  lead,
  allContactLeads,
  paused,
  onSendOwner,
  onApproveSuggested,
  onResumeAi,
  onReschedule,
  onUpdateLead,
  segmentRefs,
}: ThreadPaneProps) {
  const [draft, setDraft] = useState('');
  const canSend = draft.trim().length > 0;
  const showSegments = allContactLeads.length > 1;

  // With multiple requests, keep only the active request expanded; older ones
  // collapse to their header so the page opens on the request you came for.
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set([lead.id]));
  useEffect(() => { setExpandedSegments(new Set([lead.id])); }, [lead.id]);
  const toggleSegment = (id: string) =>
    setExpandedSegments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // The thread opens pre-scrolled to the TOP so the summary card reads first,
  // and the composer's top border only appears once the messages overflow.
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // Reset the composer to empty whenever the active lead changes. The AI's
  // proposed reply is no longer prefilled here — it lives in its own card above
  // the composer with a dedicated "Send Reply" action.
  useEffect(() => {
    setDraft('');
  }, [lead.id]);

  // Auto-grow the composer textarea to fit the (possibly multi-line, prefilled)
  // draft. Reset to 'auto' first so it can also shrink when text is removed.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  // On opening a conversation, scroll to the top so the summary is seen first.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
    setIsScrollable(el.scrollHeight > el.clientHeight + 1);
  }, [lead.id]);

  // Appending a message (e.g. Send Reply) only recomputes overflow — it must
  // not yank the scroll position back to the top.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrollable(el.scrollHeight > el.clientHeight + 1);
  }, [lead.transcript.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setIsScrollable(el.scrollHeight > el.clientHeight + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--light-100)',
        borderRight: '1px solid var(--dark-8)',
        minHeight: 0,
        height: '100%',
      }}
    >
      {/* unified conversation scroll area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px clamp(64px, 12%, 240px) 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {showSegments ? (
          allContactLeads.map((l, idx) => {
            const first = l.transcript[0];
            const capture = first && first.type === 'system' && !isTriggerMessage(first.content) ? first : null;
            const isOpen = expandedSegments.has(l.id);
            return (
              <div
                key={l.id}
                ref={(el) => { segmentRefs.current[l.id] = el; }}
                style={{ marginTop: idx === 0 ? 0 : 40 }}
              >
                <LeadSegmentDivider
                  lead={l}
                  capture={capture}
                  collapsible
                  collapsed={!isOpen}
                  onToggle={() => toggleSegment(l.id)}
                />
                {isOpen && (
                  <div style={{ paddingBottom: 8 }}>
                    <LeadEngagements lead={l} />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <LeadEngagements lead={lead} />
        )}

        {/* booking confirmation — kept so the operator retains reschedule /
            outcome controls even in the summary-first layout */}
        {lead.status === 'resolved' && !!lead.scheduled_at && (
          <div style={{ paddingTop: 24, marginTop: 24, borderTop: '1px solid var(--dark-8)' }}>
            <BookingCard lead={lead} onReschedule={onReschedule} onSetOutcome={(o) => onUpdateLead({ ...lead, outcome: o })} />
          </div>
        )}

        {/* inline proposed reply / recommended next step */}
        {lead.suggested_next_action && (
          <ProposedReplyInline
            text={lead.suggested_next_action.payload}
            paused={paused}
            sendLabel={replyMedium(lead) === 'sms' ? 'Send Text' : 'Send Reply'}
            onApprove={() => onApproveSuggested(lead.suggested_next_action!.payload)}
            onResumeAi={onResumeAi}
          />
        )}
      </div>

      {/* composer — fixed to the bottom. The proposed reply now lives inline in
          the thread above; only the take-over input stays pinned here. */}
      <div style={{ borderTop: isScrollable ? '1px solid var(--dark-8)' : '1px solid transparent', padding: '16px clamp(64px, 12%, 240px) 28px', flexShrink: 0 }}>
        {/* Fallback Resume AI when the AI is paused and there's no inline
            proposed-reply card to host it. */}
        {paused && !lead.suggested_next_action && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <Button variant="ghost" size="xs" onPress={onResumeAi}>Resume AI</Button>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 22,
            padding: '6px 6px 6px 16px',
          }}
        >
          <textarea
            {...composerFocusProps}
            ref={textareaRef}
            value={draft}
            rows={1}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && canSend) {
                e.preventDefault();
                onSendOwner(draft.trim());
                setDraft('');
              }
            }}
            placeholder="Type a message to take over the conversation…"
            style={{
              flex: 1,
              fontFamily: 'inherit',
              fontSize: 16,
              color: 'var(--dark-90)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '5px 0',
              lineHeight: 1.4,
              minWidth: 0,
              resize: 'none',
              overflowY: 'auto',
              maxHeight: 160,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!canSend}
            onClick={() => { onSendOwner(draft.trim()); setDraft(''); }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: canSend ? 'var(--dark-90)' : 'var(--dark-15)',
              color: canSend ? 'var(--light-100)' : 'var(--dark-60)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canSend ? 'pointer' : 'not-allowed',
              padding: 0,
              flexShrink: 0,
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            <Send2 size={16} color={canSend ? 'var(--light-100)' : 'var(--dark-60)'} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BANT qualification ───────────────────────────────────────────────

type BantStatus = 'positive' | 'negative' | 'unknown';

interface BantRow {
  label: string;
  value: string;
  status: BantStatus;
}

function classifyBudget(value?: string): BantStatus {
  if (!value) return 'unknown';
  const v = value.toLowerCase();
  if (/(below|under|no\s+budget|not\s+(yet|defined|set)|tbd|n\/a)/.test(v)) return 'negative';
  if (/(\$|confirmed|approved|indicated|range|budget|ballpark|k\/yr|k\/year|\/mo|\/yr)/.test(v)) return 'positive';
  return 'unknown';
}

function classifyAuthority(value?: string): BantStatus {
  if (!value) return 'unknown';
  const v = value.toLowerCase();
  if (/^(yes|owner|founder|ceo|vp|cmo|head of|cfo|co-founder|both approve)/.test(v)) return 'positive';
  if (/(influencer|needs\s+(approval|sign-off|cfo)|not\s+the|no\s+(authority|sign-off))/.test(v)) return 'negative';
  return 'unknown';
}

function classifyNeed(value?: string): BantStatus {
  if (!value) return 'unknown';
  const v = value.toLowerCase();
  if (/(no\s+(need|interest)|not\s+(needed|interested)|out\s+of\s+icp)/.test(v)) return 'negative';
  if (v.length > 0) return 'positive';
  return 'unknown';
}

function classifyTimeline(value?: string): BantStatus {
  if (!value) return 'unknown';
  const v = value.toLowerCase();
  if (/(not\s+urgent|no\s+timeline|exploring|early\s+next|someday|tbd|n\/a)/.test(v)) return 'negative';
  if (/(this\s+(quarter|month|week)|end\s+of|next\s+(month|quarter|week)|q[1-4]|by|within|sign|start|rollout|deadline|deploy)/.test(v)) return 'positive';
  return 'unknown';
}

function bantRows(card: Scorecard): BantRow[] {
  return [
    { label: 'Budget',    value: card.budget       ?? 'Not captured', status: classifyBudget(card.budget) },
    { label: 'Authority', value: card.decisionMaker ?? 'Not captured', status: classifyAuthority(card.decisionMaker) },
    { label: 'Need',      value: card.need          ?? 'Not captured', status: classifyNeed(card.need) },
    { label: 'Timeline',  value: card.timeline      ?? 'Not captured', status: classifyTimeline(card.timeline) },
  ];
}

function BantStatusIcon({ status }: { status: BantStatus }) {
  const size = 18;
  if (status === 'positive') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
        <circle cx="9" cy="9" r="9" fill="var(--status-approved)" />
        <path d="M5 9.2 7.8 12l5.2-5.4" fill="none" stroke="var(--light-100)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'negative') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
        <circle cx="9" cy="9" r="9" fill="var(--red-70)" />
        <path d="M6 6l6 6M12 6l-6 6" fill="none" stroke="var(--light-100)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <span aria-hidden style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', border: '1.5px solid var(--dark-15)' }} />
  );
}

function BantRowView({ row, isLast }: { row: BantRow; isLast: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 24px',
        gap: 12,
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-8)',
      }}
    >
      <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>{row.label}</Text>
      <Text style={{ fontSize: 12, color: 'var(--dark-90)', lineHeight: 1.45 }}>{row.value}</Text>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BantStatusIcon status={row.status} />
      </div>
    </div>
  );
}

// ─── Shared detail header ─────────────────────────────────────────────
// Used by both the AM (Sdr.tsx) and client (dfy-client Leads) detail pages so
// the lead header reads identically on both sides: a back button + the lead
// name on the left, and a prev/next lead switcher in the center.

/** Back button + lead name — the detail page's left title cluster. When a
 *  status is passed, its pill (e.g. "Needs Attention") sits after the name. */
export function LeadDetailTitle({ name, status, onBack }: { name: string; status?: Lead['status']; onBack: () => void }) {
  const ss = status ? STATUS_STYLES[status] : undefined;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <IconButton variant="ghost" size="sm" icon={ArrowLeft} aria-label="Back" onPress={onBack} />
      <Text variant="largeList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{name}</Text>
      {ss && <StatusPill tone={ss.tone} size="sm">{ss.label}</StatusPill>}
    </div>
  );
}

/** Prev/next lead switcher with an "N of M" count. Hidden for a single lead. */
export function LeadDetailNav({ index, total, onPrev, onNext }: { index?: number; total?: number; onPrev?: () => void; onNext?: () => void }) {
  if (total === undefined || total <= 1) return null;
  const navButton = (handler: (() => void) | undefined, label: string, dir: 'up' | 'down') => (
    <button
      type="button"
      onClick={handler}
      disabled={!handler}
      aria-label={label}
      style={{
        width: 28, height: 28, borderRadius: 6,
        border: '1px solid var(--dark-8)',
        background: handler ? 'var(--light-100)' : 'var(--dark-4)',
        color: handler ? 'var(--dark-80)' : 'var(--dark-15)',
        cursor: handler ? 'pointer' : 'not-allowed',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      }}
    >
      {dir === 'up' ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {index} of {total}
      </span>
      {navButton(onPrev, 'Previous lead', 'up')}
      {navButton(onNext, 'Next lead', 'down')}
    </div>
  );
}

// ─── Sidebar components ───────────────────────────────────────────────

/** Contact detail (phone / email) with a copy button that fades in on hover. */
function CopyableField({ value, label }: { value: string; label: string }) {
  const { showToast } = useToast();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}
    >
      <span style={{ fontSize: 16, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      <span style={{ opacity: hovered ? 1 : 0, transition: 'opacity 120ms ease', flexShrink: 0, display: 'inline-flex' }}>
        <IconButton
          variant="ghost"
          size="xs"
          icon={Copy}
          aria-label={`Copy ${label}`}
          onPress={() => {
            try { navigator.clipboard?.writeText(value); } catch { /* ignore */ }
            showToast({ message: 'Copied' });
          }}
        />
      </span>
    </div>
  );
}

/** Request type label + BANT progress bar (replaces the score donut). */
function RequestProgress({ lead, rows }: { lead: Lead; rows: BantRow[] }) {
  const captured = rows.filter((r) => r.status !== 'unknown').length;
  const total = rows.length;
  const pct = total > 0 ? (captured / total) * 100 : 0;
  const barColor = captured === total ? 'var(--status-approved)' : pct >= 50 ? 'var(--purple)' : 'var(--status-connect)';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
          {requestType(lead)}
        </Text>
        <Text variant="secondary" style={{ fontSize: 12 }}>
          {captured}/{total} fields
        </Text>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'var(--dark-8)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: barColor,
            borderRadius: 999,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {lead.scorecard.reasoning && (
        <Text variant="secondary" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.45 }}>
          {lead.scorecard.reasoning}
        </Text>
      )}
    </div>
  );
}

/** Clickable lead card in the sidebar — jumps thread to that segment. */
function LeadBox({
  lead,
  isActive,
  onClick,
}: {
  lead: Lead;
  isActive: boolean;
  onClick: () => void;
}) {
  const ss = STATUS_STYLES[lead.status];
  const req = requestType(lead);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: isActive ? 'var(--dark-4)' : 'var(--light-100)',
        border: `1px solid ${isActive ? 'var(--dark-15)' : 'var(--dark-8)'}`,
        borderRadius: 8,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {req}
        </span>
        <StatusPill tone={ss.tone} size="sm">{ss.label}</StatusPill>
      </div>
      <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
        {lead.channel !== 'form' && `${SOURCE_LABELS[lead.channel]} · `}{formatRelative(lead.created_at)}
      </span>
    </button>
  );
}

/** Vertical blocky contact timeline. */
function ContactTimeline({
  events,
  scrollToLead,
}: {
  events: TimelineEvent[];
  scrollToLead: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {events.map((ev, i) => {
        const isLast = i === events.length - 1;
        const isLeadStart = ev.kind === 'inbound';
        const isTrigger = ev.kind === 'trigger' || ev.kind === 'escalation';
        const hasColor = !!ev.dotColor;
        const dotBg = hasColor
          ? 'var(--light-100)'
          : isLeadStart
          ? 'var(--dark-80)'
          : isTrigger
          ? 'rgba(237,182,44,0.15)'
          : ev.kind === 'booking'
          ? 'rgba(4,175,0,0.12)'
          : 'var(--dark-4)';
        const dotBorder = hasColor
          ? ev.dotColor!
          : isLeadStart
          ? 'var(--dark-80)'
          : isTrigger
          ? '#edb62c'
          : ev.kind === 'booking'
          ? 'var(--status-approved)'
          : 'var(--dark-15)';
        const DotIcon = isLeadStart
          ? null
          : isTrigger
          ? <AlertTriangle size={14} color="#edb62c" />
          : ev.kind === 'booking'
          ? <Calendar1 size={14} color="var(--status-approved)" />
          : null;

        return (
          <div key={ev.id} style={{ display: 'flex', gap: 10 }}>
            {/* connector column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: dotBg,
                  border: `1px solid ${dotBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isLeadStart ? (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--light-100)', display: 'block' }} />
                ) : hasColor ? (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: ev.dotColor, display: 'block' }} />
                ) : DotIcon}
              </div>
              {!isLast && (
                <div style={{ width: 1, flex: 1, background: 'var(--dark-8)', minHeight: 8 }} />
              )}
            </div>

            {/* event content */}
            <button
              type="button"
              onClick={() => scrollToLead(ev.leadId)}
              style={{
                flex: 1,
                padding: '1px 0 12px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: 14, color: ev.isActive ? 'var(--dark-90)' : 'var(--dark-60)', fontWeight: isLeadStart ? 500 : 400, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ev.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dark-40)', marginTop: 1 }}>
                {formatRelative(ev.timestamp)}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────

interface SidebarProps {
  lead: Lead;
  allContactLeads: Lead[];
  scrollToLead: (id: string) => void;
  onSwitchToLead?: (id: string) => void;
  onOpenContact?: () => void;
  onScheduleMeeting: () => void;
  onChangeStatus: (status: Status) => void;
  onDisqualify: () => void;
}

function Sidebar({
  lead,
  allContactLeads,
  scrollToLead,
  onSwitchToLead,
  onOpenContact,
  onScheduleMeeting,
  onChangeStatus,
  onDisqualify,
}: SidebarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const hasMultipleLeads = allContactLeads.length > 1;
  const timelineEvents = buildContactTimeline(allContactLeads, lead);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 36,
        padding: '20px 0',
        background: 'var(--background-light)',
        overflowY: 'auto',
      }}
    >
      {/* section: compact contact identity */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={onOpenContact}
            disabled={!onOpenContact}
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--dark-90)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: onOpenContact ? 'pointer' : 'default',
              fontFamily: 'inherit',
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              width: '100%',
            }}
          >
            {lead.prospect.name}
          </button>
          <CopyableField value={lead.prospect.phone} label="phone number" />
          <CopyableField value={lead.prospect.email} label="email" />
        </div>
      </div>

      {/* section: all leads for this contact */}
      {hasMultipleLeads && (
        <div style={{ padding: '0 20px' }}>
          <Text
            variant="metadata"
            style={{ display: 'block', fontSize: 11, color: 'var(--dark-60)', fontWeight: 400, marginBottom: 8, letterSpacing: '0.04em' }}
          >
            Leads from this contact
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {allContactLeads.map((l) => (
              <LeadBox
                key={l.id}
                lead={l}
                isActive={l.id === lead.id}
                onClick={() => {
                  if (l.id === lead.id) {
                    scrollToLead(l.id);
                  } else if (onSwitchToLead) {
                    onSwitchToLead(l.id);
                  } else {
                    scrollToLead(l.id);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* section: manual controls — sits above the timeline, no label.
          Single column so labels don't truncate in the narrower sidebar. */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <Button variant="secondary" size="md" frontIcon={CalendarOutline} onPress={onScheduleMeeting}>
            {lead.status === 'resolved' ? 'Reschedule' : 'Schedule meeting'}
          </Button>
          <div style={{ position: 'relative' }}>
            <Button
              variant="secondary"
              size="md"
              onPress={() => setStatusOpen((v) => !v)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Refresh01 size={16} />
                Change status
                <ChevronDown size={14} />
              </span>
            </Button>
            {statusOpen && (
              <PopoverMenu onClose={() => setStatusOpen(false)}>
                {ALL_STATUSES.map((s) => (
                  <PopoverItem key={s} onSelect={() => { setStatusOpen(false); onChangeStatus(s); }}>
                    {STATUS_STYLES[s].label}
                  </PopoverItem>
                ))}
              </PopoverMenu>
            )}
          </div>
          <Button variant="secondary" size="md" frontIcon={Trash2} onPress={onDisqualify}>
            Disqualify
          </Button>
        </div>
      </div>

      {/* section: qualification criteria — the AI's captured answers, migrated
          from the lead detail modal. Name + phone live in the identity header
          above, so they're skipped here to avoid repeating them. */}
      <div style={{ padding: '0 20px' }}>
        <Heading level={5} style={{ margin: '0 0 12px' }}>Qualification</Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DEFAULT_QUALIFICATION_QUESTIONS
            .filter((q) => q.id !== 'q-name' && q.id !== 'q-phone')
            .map((q) => {
              const answer = qualificationAnswer(lead, q.id);
              return (
                <div key={q.id}>
                  <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 2 }}>{q.label}</Text>
                  <Text variant="primary" style={{ color: 'var(--dark-90)', lineHeight: 1.4 }}>{answer ?? '—'}</Text>
                </div>
              );
            })}
        </div>
      </div>

      {/* section: contact timeline */}
      <div style={{ padding: '0 20px' }}>
        <Heading level={5} style={{ margin: '0 0 12px' }}>Timeline</Heading>
        <ContactTimeline events={timelineEvents} scrollToLead={scrollToLead} />
      </div>
    </div>
  );
}

// ─── Popovers ─────────────────────────────────────────────────────────

function PopoverMenu({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          left: 0,
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          padding: 4,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </>
  );
}

function PopoverItem({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        border: 'none',
        background: 'transparent',
        textAlign: 'left',
        fontFamily: 'inherit',
        fontSize: 14,
        color: 'var(--dark-90)',
        borderRadius: 6,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────

export function SdrDetail({ lead, onUpdateLead, allLeads, contacts: _contacts, onOpenContact, onSwitchToLead }: SdrDetailProps) {
  const { showToast } = useToast();
  const { openModal } = useModals();
  const [paused, setPaused] = useState(false);

  // Ref map for scrolling to lead segments in the thread pane
  const segmentRefs = useRef<Record<string, HTMLElement | null>>({});

  const contactLeads = lead.contact_id
    ? allLeads.filter((l) => l.contact_id === lead.contact_id && l.id !== lead.id)
    : [];

  // All leads for this contact, sorted so older/closed context (resolved, opted-
  // out) sits at the top and the currently-active thread (human-handling = needs
  // attention) lands at the bottom, directly above the composer. Within the same
  // status bucket we keep oldest-first so the unified thread reads
  // chronologically.
  const STATUS_THREAD_ORDER: Record<Status, number> = {
    resolved: 0,
    'opted-out': 1,
    'ai-handling': 2,
    'human-handling': 3,
  };
  const allContactLeads = [lead, ...contactLeads].sort((a, b) => {
    const statusDelta = STATUS_THREAD_ORDER[a.status] - STATUS_THREAD_ORDER[b.status];
    if (statusDelta !== 0) return statusDelta;
    return relativeMinutesAgo(b.created_at) - relativeMinutesAgo(a.created_at);
  });

  const scrollToLead = (id: string) => {
    segmentRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenContact = lead.contact_id ? () => onOpenContact(lead.contact_id!) : undefined;

  const appendMessage = (msg: Message) => {
    onUpdateLead({ ...lead, transcript: [...lead.transcript, msg] });
  };

  const handleSendOwner = (text: string) => {
    appendMessage(makeMessage('owner', 'text', text, replyMedium(lead)));
    setPaused(true);
    showToast({ message: 'Message sent · AI paused' });
  };

  // Owner approved the AI's proposed reply: send it as an AI message and clear
  // the suggestion so the proposed-reply card disappears. No pause — the owner
  // is endorsing the AI's draft rather than taking over the conversation. The
  // reply inherits the last conversation's medium so it folds into that thread.
  const handleApproveSuggested = (text: string) => {
    onUpdateLead({
      ...lead,
      suggested_next_action: null,
      transcript: [...lead.transcript, makeMessage('ai', 'text', text, replyMedium(lead))],
    });
    showToast({ message: 'Reply sent' });
  };

  const handleResumeAi = () => {
    setPaused(false);
    appendMessage(makeMessage('system', 'system', 'Owner handed back to AI'));
    showToast({ message: 'AI resumed' });
  };

  const handleScheduleMeeting = () => {
    openModal(CalendlyMockModal, {
      onPick: (label: string) => {
        onUpdateLead({
          ...lead,
          status: 'resolved',
          calendly_event_id: `cal_${Math.random().toString(36).slice(2, 8)}`,
          transcript: [...lead.transcript, makeMessage('system', 'system', `Meeting booked for ${label}`)],
        });
        showToast({ message: `Meeting booked · ${label}` });
      },
    });
  };

  const handleChangeStatus = (status: Status) => {
    if (status === lead.status) return;
    onUpdateLead({
      ...lead,
      status,
      transcript: [...lead.transcript, makeMessage('system', 'system', `Status changed to ${STATUS_STYLES[status].label}`)],
    });
    showToast({ message: `Status → ${STATUS_STYLES[status].label}` });
  };

  const handleDisqualify = () => {
    onUpdateLead({
      ...lead,
      status: 'opted-out',
      transcript: [...lead.transcript, makeMessage('system', 'system', 'Marked as opted out by owner')],
    });
    showToast({ message: 'Lead opted out' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* live-call banner removed — live-call is no longer a discrete status. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <ThreadPane
          lead={lead}
          allContactLeads={allContactLeads}
          paused={paused}
          onSendOwner={handleSendOwner}
          onApproveSuggested={handleApproveSuggested}
          onResumeAi={handleResumeAi}
          onReschedule={handleScheduleMeeting}
          onUpdateLead={onUpdateLead}
          segmentRefs={segmentRefs}
        />
        <Sidebar
          lead={lead}
          allContactLeads={allContactLeads}
          scrollToLead={scrollToLead}
          onSwitchToLead={onSwitchToLead}
          onOpenContact={handleOpenContact}
          onScheduleMeeting={handleScheduleMeeting}
          onChangeStatus={handleChangeStatus}
          onDisqualify={handleDisqualify}
        />
      </div>
    </div>
  );
}
