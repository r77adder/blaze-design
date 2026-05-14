import { useState, type CSSProperties } from 'react';
import { Button, Heading, Modal, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Avatar, useToast } from '@/staging';
import Voice from '@/icons/20/Voice';
import Mail from '@/icons/20/Mail';
import MessageChat01 from '@/icons/20/MessageChat01';
import MessageText2 from '@/icons/20/MessageText2';
import Templates from '@/icons/20/Templates';
import Globe from '@/icons/20/Globe';
import LinkExternal from '@/icons/20/LinkExternal';
import Calendar1 from '@/icons/20/Calendar1';
import Refresh01 from '@/icons/20/Refresh01';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import Trash2 from '@/icons/20/Trash2';
import Send2 from '@/icons/16/Send2';
import {
  CHANNEL_LABELS,
  MEDIUM_LABELS,
  STATUS_STYLES,
  ALL_STATUSES,
  defaultMedium,
  formatRelative,
  scoreColor,
  scoreHeadline,
  transcriptMediums,
  type Channel,
  type Lead,
  type Message,
  type MessageMedium,
  type Scorecard,
  type Status,
} from './sdr-data';

/** Channel glyph used in the conversation header + inbox row. `Voice` is the
 *  closest telephony icon in our 20px set; missed-call uses red-70 tint. */
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
  if (channel === 'missed-call') return <Voice size={size} color="var(--red-70)" />;
  if (channel === 'chat') return <MessageChat01 size={size} color={base} />;
  return <Mail size={size} color={base} />;
}

/** Per-message medium glyph. Smaller cousin of ChannelGlyph: maps the
 *  delivery medium (sms/email/chat/call/voicemail) to its icon. */
function MediumGlyph({
  medium,
  size = 14,
  color = 'var(--dark-60)',
}: {
  medium: MessageMedium;
  size?: number;
  color?: string;
}) {
  if (medium === 'email') return <Mail size={size} color={color} />;
  if (medium === 'sms') return <MessageText2 size={size} color={color} />;
  if (medium === 'chat') return <MessageChat01 size={size} color={color} />;
  if (medium === 'voicemail') return <Voice size={size} color="var(--red-70)" />;
  return <Voice size={size} color={color} />;
}

/** Small inline medium badge — icon + label — used next to the role label
 *  on each text bubble and (chip-style) in the channel-summary strip. */
function MediumBadge({
  medium,
  chip = false,
}: {
  medium: MessageMedium;
  chip?: boolean;
}) {
  if (chip) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          background: 'var(--dark-4)',
          color: 'var(--dark-90)',
          fontSize: 12,
          lineHeight: 1.2,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        <MediumGlyph medium={medium} size={12} color="var(--dark-80)" />
        {MEDIUM_LABELS[medium]}
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        color: 'var(--dark-60)',
      }}
    >
      <MediumGlyph medium={medium} size={12} color="var(--dark-60)" />
      {MEDIUM_LABELS[medium]}
    </span>
  );
}

interface SdrDetailProps {
  lead: Lead;
  /** Update a lead in-place. */
  onUpdateLead: (lead: Lead) => void;
}

// ─── helpers ──────────────────────────────────────────────────────────

function nowOffset(): string {
  return 'm:0';
}

/** First-letter initials (max 2) from a full name — same rule as the inbox row. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function makeMessage(
  role: Message['role'],
  type: Message['type'],
  content: string,
): Message {
  return {
    id: `m-${Math.random().toString(36).slice(2, 9)}`,
    role,
    type,
    content,
    timestamp: nowOffset(),
  };
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
      <Modal.Header
        title="Schedule meeting"
        id="calendly-mock-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <Text
          variant="secondary"
          style={{ display: 'block', marginBottom: 16, lineHeight: 1.5 }}
        >
          Pick a 30-minute slot. The prospect will receive a confirmation email
          immediately.
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
          }}
        >
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
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: 'var(--dark-60)',
                  marginBottom: 4,
                }}
              >
                <div style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{day.label}</div>
                <div>{day.date}</div>
              </div>
              {CAL_SLOTS.map((slot) => (
                <Button
                  key={slot}
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onPress={() => {
                    onPick(`${day.label} ${day.date} · ${slot}`);
                    close();
                  }}
                >
                  {slot}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── Conversation thread ──────────────────────────────────────────────

const ROLE_LABELS: Record<Message['role'], string> = {
  ai: 'AI',
  prospect: 'Prospect',
  system: 'System',
  owner: 'Owner',
};

const ROLE_DOTS: Record<Message['role'], string> = {
  ai: 'var(--purple)',
  prospect: 'var(--dark-60)',
  system: 'var(--dark-40)',
  owner: 'var(--status-connect)',
};

/** Per-role bubble tint — three flavors so the thread reads as a clear
 *  three-way conversation:
 *  - ai      → soft purple (accent tint, mirrors the AI-draft card)
 *  - owner   → soft blue   (human-rep takeover)
 *  - prospect→ neutral gray (current behavior)
 *  - system  → not bubbled — uses SystemRow */
const BUBBLE_BG: Record<Message['role'], string> = {
  ai: 'rgba(124, 92, 252, 0.12)',
  owner: 'rgba(1, 121, 207, 0.12)',
  prospect: 'var(--dark-4)',
  system: 'var(--dark-4)',
};

function TextBubble({ msg, leadChannel }: { msg: Message; leadChannel: Channel }) {
  const isOutbound = msg.role === 'ai' || msg.role === 'owner';
  const align: CSSProperties['justifyContent'] = isOutbound ? 'flex-end' : 'flex-start';
  const bubbleBg = BUBBLE_BG[msg.role];
  const bubbleColor = 'var(--dark-90)';
  const medium = msg.medium ?? defaultMedium(msg, leadChannel);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'flex-end' ? 'flex-end' : 'flex-start', gap: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--dark-60)',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: ROLE_DOTS[msg.role],
          }}
        />
        <span style={{ fontWeight: 500 }}>{ROLE_LABELS[msg.role]}</span>
        {medium && (
          <>
            <span aria-hidden>·</span>
            <MediumBadge medium={medium} />
          </>
        )}
        <span>· {formatRelative(msg.timestamp)}</span>
      </div>
      <div
        style={{
          background: bubbleBg,
          color: bubbleColor,
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

function CallTurnBlock({ msg }: { msg: Message }) {
  if (!msg.call) return null;
  return (
    <div
      style={{
        borderLeft: '3px solid var(--status-posting)',
        background: 'rgba(1, 121, 207, 0.05)',
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Voice size={14} color="var(--status-posting)" />
        <Text style={{ fontWeight: 500, color: 'var(--dark-90)' }}>
          Call transcript · {msg.call.duration}
        </Text>
        <Text variant="secondary" style={{ marginLeft: 'auto', fontSize: 12 }}>
          {formatRelative(msg.timestamp)}
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {msg.call.turns.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 8,
              fontSize: 12,
              lineHeight: 1.5,
              color: 'var(--dark-80)',
            }}
          >
            <span
              style={{
                fontWeight: 500,
                color: t.speaker === 'AI' ? 'var(--purple)' : 'var(--dark-90)',
                flexShrink: 0,
                minWidth: 56,
              }}
            >
              {t.speaker}:
            </span>
            <span>{t.line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemRow({ msg }: { msg: Message }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: '4px 0',
        fontSize: 12,
        color: 'var(--dark-40)',
        textAlign: 'center',
      }}
    >
      <span style={{ height: 1, flex: 1, background: 'var(--dark-4)' }} />
      <span>System · {msg.content} · {formatRelative(msg.timestamp)}</span>
      <span style={{ height: 1, flex: 1, background: 'var(--dark-4)' }} />
    </div>
  );
}

// ─── Pane: thread (center) ────────────────────────────────────────────

interface ThreadPaneProps {
  lead: Lead;
  paused: boolean;
  onSendOwner: (text: string) => void;
  onResumeAi: () => void;
}

function ThreadPane({ lead, paused, onSendOwner, onResumeAi }: ThreadPaneProps) {
  const [draft, setDraft] = useState('');
  const canSend = draft.trim().length > 0;
  const mediums = transcriptMediums(lead.transcript, lead.channel);
  const isMultiChannel = mediums.length > 1;
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
      {/* section: channel summary — replaces the old "Conversation" header.
          Shows every medium used in this thread; flags multi-channel state. */}
      {mediums.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            borderBottom: '1px solid var(--dark-8)',
            background: 'var(--dark-2)',
            flexWrap: 'wrap',
          }}
        >
          <Text variant="metadata" style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            {isMultiChannel ? 'Multi-channel' : 'Channel'}
          </Text>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {mediums.map((m) => (
              <MediumBadge key={m} medium={m} chip />
            ))}
          </div>
          {isMultiChannel && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: 'var(--dark-60)',
              }}
            >
              {lead.transcript.length} turns across {mediums.length} channels
            </span>
          )}
          {!isMultiChannel && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: 'var(--dark-60)',
              }}
            >
              {lead.transcript.length} turns
            </span>
          )}
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {lead.transcript.map((msg) => {
          if (msg.type === 'system') return <SystemRow key={msg.id} msg={msg} />;
          if (msg.type === 'call') return <CallTurnBlock key={msg.id} msg={msg} />;
          return <TextBubble key={msg.id} msg={msg} leadChannel={lead.channel} />;
        })}
      </div>

      {/* section: composer — sticks to the bottom of the pane. Single-line
          input. Pause banner sits directly above it when AI is paused. */}
      <div style={{ borderTop: '1px solid var(--dark-8)', padding: '10px 16px', flexShrink: 0 }}>
        {paused && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(237, 124, 44, 0.1)',
              border: '1px solid rgba(237, 124, 44, 0.25)',
              borderRadius: 8,
              padding: '6px 10px',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--status-connect)',
                flexShrink: 0,
              }}
            />
            <Text style={{ flex: 1, fontSize: 12, color: 'var(--dark-90)' }}>
              AI paused — you are now responding.
            </Text>
            <Button variant="ghost" size="sm" onPress={onResumeAi}>
              Resume AI
            </Button>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 999,
            padding: '4px 4px 4px 14px',
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSend) {
                e.preventDefault();
                onSendOwner(draft.trim());
                setDraft('');
              }
            }}
            placeholder="Type a message to take over the conversation…"
            style={{
              flex: 1,
              fontFamily: 'inherit',
              fontSize: 14,
              color: 'var(--dark-90)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 0',
              lineHeight: 1.4,
              minWidth: 0,
            }}
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!canSend}
            onClick={() => {
              onSendOwner(draft.trim());
              setDraft('');
            }}
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

// ─── Score donut ──────────────────────────────────────────────────────

/** Score donut — SVG ring chart. Outer dimension 64px, stroke 8px, ring
 *  radius 28px. The dasharray + dashoffset technique fills clockwise from
 *  the top (rotate -90deg). */
function ScoreDonut({ score }: { score: number }) {
  const size = 64;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = circumference * (1 - clamped / 100);
  const color = scoreColor(score).fg;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--dark-8)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Sohne', sans-serif"
        fontSize="16"
        fontWeight="500"
        fill="var(--dark-90)"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

// ─── BANT qualification ──────────────────────────────────────────────

type BantStatus = 'positive' | 'negative' | 'unknown';

interface BantRow {
  label: string;
  value: string;
  status: BantStatus;
}

/** Derive a positive/negative/unknown status from a free-text scorecard
 *  field. Pure heuristics — looks for "below", "no/not", "yes", concrete
 *  numbers, etc. */
function classifyBudget(value?: string): BantStatus {
  if (!value) return 'unknown';
  const v = value.toLowerCase();
  if (/(below|under|no\s+budget|not\s+(yet|defined|set)|tbd|n\/a)/.test(v)) return 'negative';
  if (/(\$|confirmed|approved|indicated|range|budget|ballpark|k\/yr|k\/year|\/mo|\/yr)/.test(v))
    return 'positive';
  return 'unknown';
}

function classifyAuthority(value?: string): BantStatus {
  if (!value) return 'unknown';
  const v = value.toLowerCase();
  if (/^(yes|owner|founder|ceo|vp|cmo|head of|cfo|co-founder|both approve)/.test(v))
    return 'positive';
  if (/(influencer|needs\s+(approval|sign-off|cfo)|not\s+the|no\s+(authority|sign-off))/.test(v))
    return 'negative';
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
  if (/(not\s+urgent|no\s+timeline|exploring|early\s+next|someday|tbd|n\/a)/.test(v))
    return 'negative';
  if (/(this\s+(quarter|month|week)|end\s+of|next\s+(month|quarter|week)|q[1-4]|by|within|sign|start|rollout|deadline|deploy)/.test(v))
    return 'positive';
  return 'unknown';
}

function bantRows(card: Scorecard): BantRow[] {
  return [
    {
      label: 'Budget',
      value: card.budget ?? 'Not captured',
      status: classifyBudget(card.budget),
    },
    {
      label: 'Authority',
      value: card.decisionMaker ?? 'Not captured',
      status: classifyAuthority(card.decisionMaker),
    },
    {
      label: 'Need',
      value: card.need ?? 'Not captured',
      status: classifyNeed(card.need),
    },
    {
      label: 'Timeline',
      value: card.timeline ?? 'Not captured',
      status: classifyTimeline(card.timeline),
    },
  ];
}

function BantStatusIcon({ status }: { status: BantStatus }) {
  const size = 18;
  if (status === 'positive') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
        <circle cx="9" cy="9" r="9" fill="var(--status-approved)" />
        <path
          d="M5 9.2 7.8 12l5.2-5.4"
          fill="none"
          stroke="var(--light-100)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === 'negative') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
        <circle cx="9" cy="9" r="9" fill="var(--red-70)" />
        <path
          d="M6 6l6 6M12 6l-6 6"
          fill="none"
          stroke="var(--light-100)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1.5px solid var(--dark-15)',
      }}
    />
  );
}

// ─── Right sidebar (combined score / BANT / next-step / controls) ────

interface SidebarProps {
  lead: Lead;
  onConfirmNextAction: () => void;
  onEditNextAction: () => void;
  onDismissNextAction: () => void;
  onScheduleMeeting: () => void;
  onChangeStatus: (status: Status) => void;
  onDisqualify: () => void;
  onReassign: (name: string) => void;
}

const FAKE_OWNERS = ['Renée Park', 'Jordan Fitzpatrick', 'Devi Chowdhury'];

function Sidebar({
  lead,
  onConfirmNextAction,
  onEditNextAction,
  onDismissNextAction,
  onScheduleMeeting,
  onChangeStatus,
  onDisqualify,
  onReassign,
}: SidebarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);

  // Sublabel: use scorecard.reasoning if it's short, else fall back to first
  // two factors joined by " · ".
  const headline = scoreHeadline(lead.score);
  const sublabel =
    lead.scorecard.reasoning && lead.scorecard.reasoning.length <= 80
      ? lead.scorecard.reasoning
      : lead.factors.slice(0, 2).join(' · ') || lead.scorecard.reasoning;

  const rows = bantRows(lead.scorecard);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        padding: 20,
        background: 'var(--light-100)',
        overflowY: 'auto',
      }}
    >
      {/* section: lead score — sits inline on the sidebar, no wrapper. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <ScoreDonut score={lead.score} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <Text
            variant="metadata"
            style={{ fontSize: 12, color: 'var(--dark-60)', fontWeight: 400 }}
          >
            Lead score
          </Text>
          <Heading level={4} style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
            {headline}
          </Heading>
          <Text
            variant="secondary"
            style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.45 }}
          >
            {sublabel}
          </Text>
        </div>
      </div>

      {/* section: qualification — eyebrow + plain BANT rows on bg. */}
      <div>
        <Text
          variant="metadata"
          style={{
            display: 'block',
            fontSize: 12,
            color: 'var(--dark-60)',
            fontWeight: 400,
            marginBottom: 8,
          }}
        >
          Qualification
        </Text>
        <div>
          {rows.map((row, i) => (
            <BantRowView key={row.label} row={row} isLast={i === rows.length - 1} />
          ))}
        </div>
      </div>

      {/* section: suggested next step (escalated only) — inline, keeps the
          orange left-accent but no card wrapper. */}
      {lead.status === 'escalated' && lead.suggested_next_action && (
        <div
          style={{
            position: 'relative',
            paddingLeft: 12,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              borderRadius: 2,
              background: 'var(--status-connect)',
            }}
          />
          <Heading level={5} style={{ marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            Suggested next step
          </Heading>
          <Text
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--dark-80)',
              lineHeight: 1.55,
              marginBottom: 12,
            }}
          >
            {lead.suggested_next_action.summary}
          </Text>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="primary" size="sm" onPress={onConfirmNextAction}>
              Confirm
            </Button>
            <Button variant="secondary" size="sm" onPress={onEditNextAction}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onPress={onDismissNextAction}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* section: manual controls — 2×2 grid of icon + label secondary buttons. */}
      <div>
        <Text
          variant="metadata"
          style={{
            display: 'block',
            fontSize: 12,
            color: 'var(--dark-60)',
            fontWeight: 400,
            marginBottom: 8,
          }}
        >
          Manual controls
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          <Button
            variant="secondary"
            size="md"
            fullWidth
            frontIcon={Calendar1}
            onPress={onScheduleMeeting}
          >
            Schedule meeting
          </Button>
          <div style={{ position: 'relative' }}>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              frontIcon={Refresh01}
              onPress={() => {
                setStatusOpen((v) => !v);
                setReassignOpen(false);
              }}
            >
              Change status
            </Button>
            {statusOpen && (
              <PopoverMenu onClose={() => setStatusOpen(false)}>
                {ALL_STATUSES.map((s) => (
                  <PopoverItem
                    key={s}
                    onSelect={() => {
                      setStatusOpen(false);
                      onChangeStatus(s);
                    }}
                  >
                    {STATUS_STYLES[s].label}
                  </PopoverItem>
                ))}
              </PopoverMenu>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              frontIcon={UserProfileGroup}
              onPress={() => {
                setReassignOpen((v) => !v);
                setStatusOpen(false);
              }}
            >
              Reassign
            </Button>
            {reassignOpen && (
              <PopoverMenu onClose={() => setReassignOpen(false)}>
                {FAKE_OWNERS.map((name) => (
                  <PopoverItem
                    key={name}
                    onSelect={() => {
                      setReassignOpen(false);
                      onReassign(name);
                    }}
                  >
                    {name}
                  </PopoverItem>
                ))}
              </PopoverMenu>
            )}
          </div>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            frontIcon={Trash2}
            onPress={onDisqualify}
          >
            Disqualify
          </Button>
        </div>
      </div>

      {/* section: prospect (avatar + contact + tags) */}
      <ProspectCard lead={lead} />
    </div>
  );
}

// ─── Prospect card (bottom of right sidebar) ─────────────────────────

function ProspectRow({
  icon,
  children,
  href,
  color = 'var(--dark-90)',
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  href?: string;
  color?: string;
}) {
  const content = (
    <span
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: 12,
        color,
        flex: 1,
        minWidth: 0,
      }}
    >
      {children}
    </span>
  );
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 0',
        minWidth: 0,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      {href !== undefined ? (
        <a
          href={href}
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'block',
            flex: 1,
            minWidth: 0,
            color,
            textDecoration: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 12,
          }}
        >
          {children}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

function ProspectCard({ lead }: { lead: Lead }) {
  const { prospect, channel, first_touch_source, created_at, tags } = lead;
  const channelLabel = CHANNEL_LABELS[channel];
  const subtitle = `Captured ${formatRelative(created_at)} via ${channelLabel}${
    first_touch_source ? ` — ${first_touch_source}` : ''
  }`;

  return (
    <div>
      <Text
        variant="metadata"
        style={{
          display: 'block',
          fontSize: 12,
          color: 'var(--dark-60)',
          fontWeight: 400,
          marginBottom: 8,
        }}
      >
        Prospect
      </Text>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* identity — name on top, company directly beneath (so the
            org is unambiguous), with the capture metadata below in muted
            text. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Avatar
            src={prospect.avatarUrl}
            fallback={initials(prospect.name)}
            size={48}
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--dark-90)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {prospect.name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--dark-80)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}
            >
              {prospect.company}
            </Text>
            <Text
              variant="secondary"
              style={{
                fontSize: 12,
                color: 'var(--dark-60)',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </Text>
          </div>
        </div>

        {/* contact list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid var(--dark-8)',
          }}
        >
          <ProspectRow icon={<Voice size={16} color="var(--dark-60)" />}>
            {prospect.phone}
          </ProspectRow>
          <ProspectRow icon={<Mail size={16} color="var(--dark-60)" />}>
            {prospect.email}
          </ProspectRow>
          <ProspectRow icon={<Globe size={16} color="var(--dark-60)" />} href="#">
            {prospect.source_url}
          </ProspectRow>
          <ProspectRow
            icon={<LinkExternal size={16} color="var(--purple)" />}
            href="#"
            color="var(--purple)"
          >
            Open in HubSpot
          </ProspectRow>
        </div>

        {/* tags */}
        {tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              paddingTop: 4,
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: 'var(--dark-4)',
                  color: 'var(--dark-90)',
                  fontSize: 12,
                  padding: '4px 8px',
                  borderRadius: 6,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
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
      <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>
        {row.label}
      </Text>
      <Text style={{ fontSize: 12, color: 'var(--dark-90)', lineHeight: 1.45 }}>
        {row.value}
      </Text>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BantStatusIcon status={row.status} />
      </div>
    </div>
  );
}

function PopoverMenu({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9,
        }}
      />
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

function PopoverItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
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

// ─── Edit-next-step inline modal ──────────────────────────────────────

function EditNextStepModal({
  close,
  initial,
  onSave,
}: StackModalProps & { initial: string; onSave: (text: string) => void }) {
  const [text, setText] = useState(initial);
  return (
    <Modal.Root size="md" aria-labelledby="edit-next-title" data-testid="edit-next">
      <Modal.Header
        title="Edit suggested next step"
        id="edit-next-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          style={{
            width: '100%',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--dark-90)',
            background: 'var(--light-100)',
            border: '1px solid var(--dark-15)',
            borderRadius: 10,
            padding: '10px 12px',
            outline: 'none',
            resize: 'vertical',
            minHeight: 120,
            lineHeight: 1.55,
          }}
        />
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="primary"
            onPress={() => {
              onSave(text);
              close();
            }}
          >
            Save
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────

export function SdrDetail({ lead, onUpdateLead }: SdrDetailProps) {
  const { showToast } = useToast();
  const { openModal } = useModals();
  const [paused, setPaused] = useState(false);

  const appendMessage = (msg: Message) => {
    onUpdateLead({ ...lead, transcript: [...lead.transcript, msg] });
  };

  const handleSendOwner = (text: string) => {
    appendMessage(makeMessage('owner', 'text', text));
    setPaused(true);
    showToast({ message: 'Message sent · AI paused' });
  };

  const handleResumeAi = () => {
    setPaused(false);
    appendMessage(makeMessage('system', 'system', 'Owner handed back to AI'));
    showToast({ message: 'AI resumed' });
  };

  const handleConfirmNextAction = () => {
    if (!lead.suggested_next_action) return;
    const summary = lead.suggested_next_action.summary;
    onUpdateLead({
      ...lead,
      status: 'in-conversation',
      suggested_next_action: null,
      transcript: [
        ...lead.transcript,
        makeMessage('system', 'system', `Next step confirmed: ${summary}`),
      ],
    });
    showToast({ message: 'Next step confirmed' });
  };

  const handleEditNextAction = () => {
    if (!lead.suggested_next_action) return;
    openModal(EditNextStepModal, {
      initial: lead.suggested_next_action.summary,
      onSave: (text: string) => {
        if (!lead.suggested_next_action) return;
        onUpdateLead({
          ...lead,
          suggested_next_action: { ...lead.suggested_next_action, summary: text },
        });
        showToast({ message: 'Suggested step updated' });
      },
    });
  };

  const handleDismissNextAction = () => {
    onUpdateLead({ ...lead, suggested_next_action: null });
    showToast({ message: 'Suggestion dismissed' });
  };

  const handleScheduleMeeting = () => {
    openModal(CalendlyMockModal, {
      onPick: (label: string) => {
        onUpdateLead({
          ...lead,
          status: 'booked',
          calendly_event_id: `cal_${Math.random().toString(36).slice(2, 8)}`,
          transcript: [
            ...lead.transcript,
            makeMessage('system', 'system', `Meeting booked for ${label}`),
          ],
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
      transcript: [
        ...lead.transcript,
        makeMessage('system', 'system', `Status changed to ${STATUS_STYLES[status].label}`),
      ],
    });
    showToast({ message: `Status → ${STATUS_STYLES[status].label}` });
  };

  const handleDisqualify = () => {
    onUpdateLead({
      ...lead,
      status: 'disqualified',
      transcript: [
        ...lead.transcript,
        makeMessage('system', 'system', 'Disqualified by owner'),
      ],
    });
    showToast({ message: 'Lead disqualified' });
  };

  const handleReassign = (name: string) => {
    showToast({ message: `Reassigned to ${name}` });
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        height: '100%',
        background: 'var(--light-100)',
        minHeight: 0,
      }}
    >
      <ThreadPane
        lead={lead}
        paused={paused}
        onSendOwner={handleSendOwner}
        onResumeAi={handleResumeAi}
      />
      <Sidebar
        lead={lead}
        onConfirmNextAction={handleConfirmNextAction}
        onEditNextAction={handleEditNextAction}
        onDismissNextAction={handleDismissNextAction}
        onScheduleMeeting={handleScheduleMeeting}
        onChangeStatus={handleChangeStatus}
        onDisqualify={handleDisqualify}
        onReassign={handleReassign}
      />
    </div>
  );
}
