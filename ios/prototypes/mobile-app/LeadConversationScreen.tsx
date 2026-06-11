import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ToolbarButton, ContentStatusPill } from '@ios/components';
import {
  getLead,
  formatRelative,
  defaultMedium,
  MEDIUM_LABELS,
  STATUS_STYLES,
  isAnonymousName,
  conversationSummary,
  effectiveBookingOutcome,
  BOOKING_OUTCOME_STYLES,
  ALL_BOOKING_OUTCOMES,
  type Message,
  type Lead,
  type Status,
  type BookingOutcome,
} from './leads-data';
import phoneCallIcon from '@ios/icons/phone-call01.svg';
import messageCircleIcon from '@ios/icons/message-circle.svg';
import refreshIcon from '@ios/icons/refresh.svg';
import sendIcon from '@ios/icons/send-01.svg';
import checkVerifiedIcon from '@ios/icons/check-verified-02.svg';
import chevronDownIcon from '@ios/icons/chevron-down.svg';

const font = 'var(--ios-font)';

// ─── helpers ───────────────────────────────────────────────────────────────

/** Display label for the role next to a message timestamp. The 'prospect'
 *  bucket is filled at call time with the lead's own name (see `roleLabel()`)
 *  so each bubble reads "Aria Chen · 25m · Email" rather than "Lead · …". */
const STATIC_ROLE_LABELS: Record<'ai' | 'owner', string> = {
  ai: 'AI',
  owner: 'You',
};

function roleLabel(role: 'ai' | 'prospect' | 'owner', lead: Lead): string {
  if (role === 'prospect') return lead.prospect.name;
  return STATIC_ROLE_LABELS[role];
}

// ─── sticky conversation header ─────────────────────────────────────────────
//
// Mirrors the layout of `ToolbarHeader variant="default"` but lets us drop a
// status pill into the right slot (the lib component's `rightButton` prop
// only accepts a single ToolbarButton variant). Pinned to the top of the
// scrolling container so the back arrow + status stay reachable while the
// user scrolls a long conversation.

function ConversationHeader({
  title,
  onBack,
  status,
  scrolled = false,
}: {
  title: string;
  onBack: () => void;
  status?: Status;
  /** When true, fade the title into the center and paint the bottom divider.
   *  Drives the iOS Large Title behavior — title and divider only appear
   *  once the user scrolls past the lead's hero card. */
  scrolled?: boolean;
}) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'var(--ios-background-gray, #f7f7f7)',
      backdropFilter: 'saturate(140%) blur(20px)',
      WebkitBackdropFilter: 'saturate(140%) blur(20px)',
      borderBottom: scrolled ? '1px solid var(--ios-dark-4)' : '1px solid transparent',
      transition: 'border-color 120ms ease-out',
    }}>
      <div style={{
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxSizing: 'border-box',
      }}>
        {/* Left: back */}
        <div style={{ flexShrink: 0 }}>
          <ToolbarButton variant="back" onClick={onBack} aria-label="Back" />
        </div>
        {/* Center: title — only visible after the user scrolls past the
            contact card (iOS Large Title behavior). */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: font,
            fontSize: 'var(--ios-h3-size)',
            fontWeight: 'var(--ios-h3-weight)' as unknown as number,
            lineHeight: 'var(--ios-h3-lh)',
            color: 'var(--ios-dark-90)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            opacity: scrolled ? 1 : 0,
            transition: 'opacity 120ms ease-out',
          }}>
            {title}
          </span>
        </div>
        {/* Right: status pill */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {status && (
            <ContentStatusPill
              variant={STATUS_STYLES[status].variant}
              label={STATUS_STYLES[status].label}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── small primitives ──────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '0 20px' }}>
      <span style={{
        fontFamily: font, fontSize: 16, fontWeight: 500, lineHeight: 1.4,
        color: 'var(--ios-dark-90)',
      }}>
        {children}
      </span>
    </div>
  );
}

function ActionButtonContents({ icon, label }: { icon: string; label: string }) {
  return (
    <>
      <img src={icon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
      <span style={{
        fontFamily: font, fontSize: 12, fontWeight: 500, lineHeight: 1.2,
        color: 'var(--ios-dark-80)',
      }}>
        {label}
      </span>
    </>
  );
}

const ACTION_BUTTON_STYLE: React.CSSProperties = {
  flex: 1,
  height: 56,
  background: 'white',
  border: '1px solid var(--ios-dark-8)',
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  padding: 10,
  cursor: 'pointer',
  textDecoration: 'none',
  boxSizing: 'border-box',
};

// ─── contact card ──────────────────────────────────────────────────────────

function ContactCard({ lead, onStatusEdit }: { lead: Lead; onStatusEdit: () => void }) {
  const anonymous = isAnonymousName(lead.prospect.name);
  const initial = lead.prospect.name.trim().charAt(0).toUpperCase();

  return (
    <div style={{
      margin: '12px 20px 0',
      background: 'white',
      borderRadius: 14,
      padding: 14,
      border: '1px solid var(--ios-dark-8)',
    }}>
      {/* Identity row — avatar + name/company stacked on the right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 99,
          background: '#45164a',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {lead.prospect.avatarUrl ? (
            <img
              src={lead.prospect.avatarUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : anonymous ? (
            <img
              src={phoneCallIcon}
              alt=""
              aria-hidden="true"
              style={{ width: 22, height: 22, filter: 'invert(1)', opacity: 0.9 }}
            />
          ) : (
            <span style={{
              fontFamily: font, fontSize: 18, fontWeight: 500,
              color: 'white', lineHeight: 1,
            }}>
              {initial}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{
            fontFamily: font, fontSize: 17, fontWeight: 500, lineHeight: 1.25,
            color: 'var(--ios-dark-90)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {lead.prospect.name}
          </span>
          <span style={{
            fontFamily: font, fontSize: 13, fontWeight: 400, lineHeight: 1.3,
            color: 'var(--ios-dark-60)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {lead.prospect.company}
          </span>
        </div>
      </div>

      {/* Call / Text / Status — directly under the identity row. */}
      <div style={{ marginTop: 14 }}>
        <CallTextStatusRow
          phone={lead.prospect.phone}
          contactName={lead.prospect.name}
          onStatusEdit={onStatusEdit}
        />
      </div>
    </div>
  );
}

/** Reusable Call / Text / Status row — extracted so it can be embedded
 *  either inside the contact card or at the bottom of the conversation
 *  above the composer. White-tile buttons with an icon stacked above a
 *  12px label, evenly spaced. Phone/SMS use real `tel:` / `sms:` anchors. */
export function CallTextStatusRow({
  phone,
  contactName,
  onStatusEdit,
}: {
  phone: string;
  contactName: string;
  onStatusEdit: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      justifyContent: 'center',
    }}>
      <a
        href={`tel:${phone}`}
        style={ACTION_BUTTON_STYLE}
        aria-label={`Call ${contactName}`}
      >
        <ActionButtonContents icon={phoneCallIcon} label="Call" />
      </a>
      <a
        href={`sms:${phone}`}
        style={ACTION_BUTTON_STYLE}
        aria-label={`Text ${contactName}`}
      >
        <ActionButtonContents icon={messageCircleIcon} label="Text" />
      </a>
      <button
        type="button"
        onClick={onStatusEdit}
        style={ACTION_BUTTON_STYLE}
        aria-label="Change status"
      >
        <ActionButtonContents icon={refreshIcon} label="Status" />
      </button>
    </div>
  );
}

// ─── bookings ──────────────────────────────────────────────────────────────

function BookingCard({
  title,
  when,
  host,
  outcome,
  onSetOutcome,
}: {
  title: string;
  when: string;
  host: string;
  outcome: BookingOutcome;
  onSetOutcome: (o: BookingOutcome) => void;
}) {
  const [open, setOpen] = useState(false);
  const style = BOOKING_OUTCOME_STYLES[outcome];
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--ios-dark-8)',
      borderRadius: 12,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Booking info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
          <span style={{
            fontFamily: font, fontSize: 14, fontWeight: 500, lineHeight: 1.4,
            color: 'var(--ios-dark-90)',
          }}>
            {title}
          </span>
          <span style={{
            fontFamily: font, fontSize: 13, fontWeight: 400, lineHeight: 1.4,
            color: 'var(--ios-dark-60)',
          }}>
            {when}
          </span>
          <span style={{
            fontFamily: font, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
            color: 'var(--ios-dark-60)',
          }}>
            {host}
          </span>
        </div>
        <img
          src={checkVerifiedIcon}
          alt=""
          aria-hidden="true"
          style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2 }}
        />
      </div>

      {/* Outcome dropdown — under the booking info. Tappable row shows the
          current outcome pill + chevron; toggles an inline option list. */}
      <div style={{ borderTop: '1px solid var(--ios-dark-4)', paddingTop: 12 }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 0, textAlign: 'left',
          }}
        >
          <span style={{
            flex: 1, fontFamily: font, fontSize: 13, fontWeight: 400,
            color: 'var(--ios-dark-60)', letterSpacing: '0.13px',
          }}>
            Outcome
          </span>
          <ContentStatusPill variant={style.variant} label={style.label} />
          <img
            src={chevronDownIcon}
            alt=""
            aria-hidden="true"
            style={{
              width: 16, height: 16, flexShrink: 0, opacity: 0.4,
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 160ms ease',
            }}
          />
        </button>

        {open && (
          <div style={{
            marginTop: 10,
            display: 'flex', flexDirection: 'column',
            border: '1px solid var(--ios-dark-8)', borderRadius: 10, overflow: 'hidden',
          }}>
            {ALL_BOOKING_OUTCOMES.map((o, i) => {
              const s = BOOKING_OUTCOME_STYLES[o];
              const selected = o === outcome;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => { onSetOutcome(o); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px',
                    background: selected ? 'var(--ios-dark-4)' : 'transparent',
                    border: 'none',
                    borderBottom: i < ALL_BOOKING_OUTCOMES.length - 1 ? '1px solid var(--ios-dark-4)' : 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <ContentStatusPill variant={s.variant} label={s.label} />
                  <span style={{ flex: 1 }} />
                  {selected && (
                    <img src={checkVerifiedIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16, opacity: 0.9 }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── messages ──────────────────────────────────────────────────────────────

function SystemRow({ content, timestamp }: { content: string; timestamp: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 0',
    }}>
      <span style={{ flex: 1, height: 1, background: 'var(--ios-dark-8)' }} />
      <span style={{
        fontFamily: font, fontSize: 11, fontWeight: 400, lineHeight: 1.4,
        color: 'var(--ios-dark-60)', textAlign: 'center',
      }}>
        {content} · {formatRelative(timestamp)}
      </span>
      <span style={{ flex: 1, height: 1, background: 'var(--ios-dark-8)' }} />
    </div>
  );
}

// Call transcript rendered inline — no box. It flows with the text bubbles
// and system rows; the labelled header + speaker-prefixed turns are enough to
// read it as a call. The boxed/tinted treatment now belongs to the summary
// card at the top of the thread (mirrors PR55).
function CallBlock({ msg }: { msg: Message }) {
  if (!msg.call) return null;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '4px 0',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: font, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
        color: 'var(--ios-dark-60)',
      }}>
        <span style={{ fontWeight: 500, color: 'var(--ios-dark-80)' }}>Call transcript</span>
        <span>· {msg.call.duration}</span>
        <span style={{ marginLeft: 'auto' }}>{formatRelative(msg.timestamp)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {msg.call.turns.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 8,
              fontFamily: font, fontSize: 14, fontWeight: 400, lineHeight: 1.5,
              color: 'var(--ios-dark-80)',
            }}
          >
            <span style={{
              fontWeight: 500, flexShrink: 0, minWidth: 52,
              color: t.speaker === 'AI' ? '#0083e2' : 'var(--ios-dark-90)',
            }}>
              {t.speaker}:
            </span>
            <span>{t.line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Summary — a "Summary" section header (matching Conversation / Bookings)
// over a prominent blue-tinted recap card. The priority element at the top
// of every thread (PR55).
function SummaryCard({ lead }: { lead: Lead }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionHeader>Summary</SectionHeader>
      <div style={{ padding: '0 20px' }}>
        <div style={{
          border: '1px solid rgba(0,131,226,0.18)',
          background: 'rgba(0,131,226,0.05)',
          borderRadius: 12,
          padding: '14px 16px',
        }}>
          <span style={{
            fontFamily: font, fontSize: 16, fontWeight: 400, lineHeight: 1.5,
            color: 'var(--ios-dark-90)',
          }}>
            {conversationSummary(lead)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Proposed-reply block — the AI's prepared draft, shown above the composer as
// its own element with a Send Reply action (PR55). Calling onSend appends it
// to the thread and removes the block.
function ProposedReply({ draft, onSend }: { draft: string; onSend: () => void }) {
  return (
    <div style={{
      margin: '0 20px',
      border: '1px solid var(--ios-dark-8)',
      background: 'white',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontFamily: font, fontSize: 12, fontWeight: 500, lineHeight: 1.3,
          color: 'var(--ios-dark-60)', letterSpacing: '0.2px',
        }}>
          Proposed reply
        </span>
        <button
          type="button"
          onClick={onSend}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--ios-dark-90)', border: 'none', borderRadius: 99,
            padding: '6px 14px', cursor: 'pointer',
          }}
        >
          <img src={sendIcon} alt="" aria-hidden="true" style={{ width: 14, height: 14, filter: 'invert(1)' }} />
          <span style={{ fontFamily: font, fontSize: 13, fontWeight: 500, color: 'white' }}>Send Reply</span>
        </button>
      </div>
      <span style={{
        fontFamily: font, fontSize: 14, fontWeight: 400, lineHeight: 1.45,
        color: 'var(--ios-dark-80)',
      }}>
        {draft}
      </span>
    </div>
  );
}

function TextBubble({ msg, lead }: { msg: Message; lead: Lead }) {
  const isOutbound = msg.role === 'ai' || msg.role === 'owner';
  const role = msg.role as 'ai' | 'prospect' | 'owner';
  const medium = msg.medium ?? defaultMedium(msg, lead.channel);
  const align = isOutbound ? 'flex-end' : 'flex-start';

  const bubbleStyle: React.CSSProperties = isOutbound
    ? {
        background: '#45164a',
        color: 'white',
        borderRadius: 12,
        borderBottomRightRadius: 4,
      }
    : {
        background: 'var(--ios-dark-4)',
        color: 'var(--ios-dark-90)',
        borderRadius: 12,
        borderBottomLeftRadius: 4,
      };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: align,
      gap: 4,
    }}>
      <div style={{
        ...bubbleStyle,
        maxWidth: '78%',
        padding: '10px 14px',
        fontFamily: font,
        fontSize: 14,
        lineHeight: 1.4,
        fontWeight: 400,
      }}>
        {msg.content}
      </div>
      <div style={{
        fontFamily: font, fontSize: 10, fontWeight: 400, lineHeight: 1.4,
        color: 'var(--ios-dark-40)',
      }}>
        {roleLabel(role, lead)} · {formatRelative(msg.timestamp)}
        {medium ? ` · ${MEDIUM_LABELS[medium]}` : ''}
      </div>
    </div>
  );
}

// ─── composer ──────────────────────────────────────────────────────────────

/** Bottom chat composer for the lead-conversation view. Exported so the host
 *  can render it in the PhoneFrame's footer slot (replacing the tab bar while
 *  a lead is open).
 *
 *  Mirrors the TabBar's floating pattern exactly (`ios/components/TabBar.tsx`):
 *  a 126px absolutely-positioned strip whose background fades from transparent
 *  at the top to the opaque page background at the 60% mark — messages
 *  visibly slide under it and dissolve into the page as they approach the
 *  capsule. `pointerEvents: none` on the strip so it doesn't eat scroll
 *  gestures; the capsule itself restores `pointerEvents: all`. */
interface LeadConversationComposerProps {
  initialValue?: string;
  /** AI-prepared context shown as a floating banner directly above the
   *  (unused now — summary lives in a top card, draft in the proposed-reply
   *  block; kept optional for back-compat). */
  passedOnReason?: string;
  passedOnAt?: string;
}

export function LeadConversationComposer({
  initialValue = '',
}: LeadConversationComposerProps = {}) {
  // Local mutable text. Starts empty (PR55) — the AI's proposed reply now
  // lives in its own block in the thread, not prefilled here.
  const [value, setValue] = useState(initialValue);

  // Auto-grow the textarea so multi-line input stays readable in one glance.
  // Reset to 'auto' first so it can shrink as text is removed. Capped at
  // ~5 lines (140 px) via maxHeight — beyond that the textarea scrolls.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: 148,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: 10,
        padding: '24px 14px 34px',
        background:
          'linear-gradient(to bottom, rgba(247,247,247,0), var(--ios-background-gray) 40%)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'all',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          background: 'var(--ios-tab-bar-bg)',
          backdropFilter: 'var(--ios-glass-blur)',
          WebkitBackdropFilter: 'var(--ios-glass-blur)',
          boxShadow: 'var(--ios-glass-shadow), inset 0 0 0 0.5px var(--ios-dark-8)',
          borderRadius: 20,
          padding: '6px 6px 6px 4px',
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          inputMode="text"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Message"
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 140,
            border: 'none',
            background: 'transparent',
            padding: '10px 14px',
            fontFamily: font,
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.4,
            color: 'var(--ios-dark-90)',
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'none',
            overflow: 'auto',
          }}
        />
        <button
          type="button"
          aria-label="Send"
          style={{
            width: 40,
            height: 40,
            borderRadius: 99,
            background: 'var(--ios-dark-90)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            alignSelf: 'flex-end',
          }}
        >
          <img
            src={sendIcon}
            alt=""
            aria-hidden="true"
            style={{ width: 18, height: 18, filter: 'invert(1)' }}
          />
        </button>
      </div>
    </div>
  );
}

// ─── screen ────────────────────────────────────────────────────────────────

export function LeadConversationScreen({
  leadId,
  onBack,
  onStatusEdit,
  statusOverrides,
}: {
  leadId: string;
  onBack: () => void;
  onStatusEdit: (leadId: string) => void;
  statusOverrides: Record<string, Status>;
}) {
  const lead = getLead(leadId);
  // Effective status — override map first, then the seed lead.status. The
  // ContactCard + sticky header both read this so a change made via the
  // shared StatusPickerSheet propagates here too.
  const effectiveStatus: Status = lead
    ? (statusOverrides[lead.id] ?? lead.status)
    : 'ai-handling';

  if (!lead) {
    return (
      <div style={{ fontFamily: font, background: '#f8f8f9', minHeight: '100%' }}>
        <ConversationHeader title="Lead" onBack={onBack} />
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          fontFamily: font, fontSize: 16, fontWeight: 400,
          color: 'var(--ios-dark-60)',
        }}>
          Lead not found
        </div>
      </div>
    );
  }

  // The transcript is already authored oldest-first, but be defensive: sort by
  // relativeMinutes descending (larger = older), so the resulting array is
  // newest-last when read top-to-bottom.
  const orderedTranscript = [...lead.transcript].sort((a, b) => {
    const am = a.timestamp.match(/^m:(\d+)$/);
    const bm = b.timestamp.match(/^m:(\d+)$/);
    const an = am ? parseInt(am[1], 10) : 0;
    const bn = bm ? parseInt(bm[1], 10) : 0;
    return bn - an; // older first
  });

  return (
    <ConversationBody
      lead={lead}
      onBack={onBack}
      effectiveStatus={effectiveStatus}
      onStatusEdit={() => onStatusEdit(lead.id)}
      orderedTranscript={orderedTranscript}
    />
  );
}

function ConversationBody({
  lead,
  onBack,
  effectiveStatus,
  onStatusEdit,
  orderedTranscript,
}: {
  lead: Lead;
  onBack: () => void;
  effectiveStatus: Status;
  onStatusEdit: () => void;
  orderedTranscript: Message[];
}) {
  // Track scroll on the PhoneFrame's inner scroll container so we can fade
  // the title in / paint the bottom border once the contact card scrolls
  // out of view (iOS Large Title behavior — mirrors MoreScreen's pattern).
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Proposed reply (the AI's prepared draft) lives in its own block above the
  // composer with a Send Reply action — the composer itself starts empty
  // (PR55). Sending appends the draft as an outbound owner message and
  // removes the proposed-reply block.
  const proposedDraft = lead.passed_on[0]?.draft;
  const [sentReplies, setSentReplies] = useState<Message[]>([]);
  const [replySent, setReplySent] = useState(false);
  const showProposedReply = !!proposedDraft && !replySent;
  const sendProposedReply = () => {
    if (!proposedDraft) return;
    setSentReplies((prev) => [
      ...prev,
      { id: `reply-${prev.length}`, role: 'owner', type: 'text', content: proposedDraft, timestamp: 'm:0' },
    ]);
    setReplySent(true);
  };

  // Per-booking outcome overrides set via the in-thread booking dropdown.
  const [bookingOutcomes, setBookingOutcomes] = useState<Record<string, BookingOutcome>>({});

  useEffect(() => {
    let el: HTMLElement | null = rootRef.current;
    while (el && el !== document.body) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') break;
      el = el.parentElement;
    }
    if (!el || el === document.body) return;
    // Threshold is roughly the height of the contact card so the title only
    // appears once that hero block has scrolled past.
    const handler = () => setScrolled((el as HTMLElement).scrollTop > 60);
    handler();
    el.addEventListener('scroll', handler, { passive: true });
    return () => el!.removeEventListener('scroll', handler);
  }, []);


  return (
    <div ref={rootRef} style={{
      fontFamily: font,
      background: '#f8f8f9',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <ConversationHeader
        title={lead.prospect.name}
        onBack={onBack}
        status={effectiveStatus}
        scrolled={scrolled}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 16 }}>

        {/* Contact card — identity + Call/Text/Status row. */}
        <ContactCard lead={lead} onStatusEdit={onStatusEdit} />

        {/* Summary card — the priority element of the thread (PR55). */}
        <SummaryCard lead={lead} />

        {/* Bookings */}
        {lead.bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionHeader>Bookings</SectionHeader>
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lead.bookings.map((b) => (
                <BookingCard
                  key={b.id}
                  title={b.title}
                  when={b.when}
                  host={b.host}
                  outcome={bookingOutcomes[b.id] ?? effectiveBookingOutcome(b)}
                  onSetOutcome={(o) => setBookingOutcomes((prev) => ({ ...prev, [b.id]: o }))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Conversation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeader>Conversation</SectionHeader>
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orderedTranscript.map((msg) => {
              if (msg.type === 'system') {
                return <SystemRow key={msg.id} content={msg.content} timestamp={msg.timestamp} />;
              }
              if (msg.type === 'call') {
                return <CallBlock key={msg.id} msg={msg} />;
              }
              return <TextBubble key={msg.id} msg={msg} lead={lead} />;
            })}
            {/* Replies sent from the Proposed-reply block render as outbound
                owner bubbles at the end of the thread. */}
            {sentReplies.map((msg) => (
              <TextBubble key={msg.id} msg={msg} lead={lead} />
            ))}
          </div>
        </div>

        {/* Proposed reply — the AI's prepared draft, at the end of the
            thread, with a Send Reply action. Disappears once sent. */}
        {showProposedReply && proposedDraft && (
          <ProposedReply draft={proposedDraft} onSend={sendProposedReply} />
        )}
      </div>
    </div>
  );
}
