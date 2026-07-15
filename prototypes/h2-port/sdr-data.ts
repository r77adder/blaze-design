/**
 * /h2/sdr — mock data + types for the AI-inbound-sales SDR feature.
 *
 * Two screens consume this data:
 *  - Leads inbox (table) — sortable list across all channels and statuses.
 *  - Lead detail (3-pane) — profile / conversation thread / scorecard + actions.
 *
 * Pure DATA + helpers. No JSX. See:
 *  - prototypes/h2/pages/Sdr.tsx — page entry + inbox table
 *  - prototypes/h2/SdrDetail.tsx — three-pane detail view + Calendly mock modal
 */

import type { StatusPillTone } from '@/staging';

/** Identity record for a person who has ever reached out. One contact can
 *  have multiple leads over time (one per inbound reach-out). */
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export type Channel = 'form' | 'inbound-call' | 'chat';

export type Method = 'call' | 'sms' | 'other';

/** Simplified four-state lifecycle for any lead/conversation:
 *  - ai-handling:    the AI assistant is actively managing the conversation
 *  - human-handling: escalated to or being driven by a team member
 *  - resolved:       the conversation reached a successful close (e.g. booked)
 *  - opted-out:      the prospect declined, was disqualified, or stopped engaging
 */
export type Status =
  | 'ai-handling'
  | 'human-handling'
  | 'resolved'
  | 'opted-out';

/** Post-booking outcome — how a booking actually performed after it was
 *  scheduled. `scheduled` and `completed` are derived automatically from the
 *  appointment time (future vs past) unless the user overrides; the rest are
 *  set manually. See effectiveBookingOutcome() / BOOKING_OUTCOME_STYLES. */
export type BookingOutcome =
  | 'scheduled'
  | 'completed'
  | 'estimate-sent'
  | 'won'
  | 'job-done'
  | 'no-show'
  | 'canceled'
  | 'lost';

export type MessageRole = 'ai' | 'prospect' | 'system' | 'owner';
export type MessageType = 'text' | 'call' | 'system';

/** Per-message delivery channel. Distinct from the lead's source `channel`:
 *  a lead may arrive via a missed call but the AI then follow up via SMS,
 *  then switch to email when sharing a deck. Used to render the per-message
 *  channel glyph + the conversation-header channel summary. */
export type MessageMedium = 'email' | 'sms' | 'chat' | 'call' | 'voicemail';

export interface CallTurn {
  speaker: string;
  line: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  /** Body for type=text and type=system. */
  content: string;
  /** Populated only for type=call. */
  call?: { duration: string; turns: CallTurn[] };
  /** Human-friendly relative timestamp ("2m ago"). */
  timestamp: string;
  /** Explicit delivery channel for this message. When omitted, the renderer
   *  derives a sensible default from the message type + lead channel. */
  medium?: MessageMedium;
}

export const MEDIUM_LABELS: Record<MessageMedium, string> = {
  email: 'Email',
  sms: 'SMS',
  chat: 'Chat',
  call: 'Call',
  voicemail: 'Voicemail',
};

/** Fallback medium when a message doesn't specify one. Used by both the
 *  thread renderer and the channel-summary strip. */
export function defaultMedium(msg: Message, leadChannel: Channel): MessageMedium | null {
  if (msg.type === 'system') return null;
  if (msg.type === 'call') return 'call';
  if (leadChannel === 'chat') return 'chat';
  return 'sms';
}

/** Unique mediums used across a transcript (system messages excluded). Used
 *  by the conversation-header channel-summary strip. */
export function transcriptMediums(transcript: Message[], leadChannel: Channel): MessageMedium[] {
  const seen = new Set<MessageMedium>();
  const order: MessageMedium[] = [];
  for (const msg of transcript) {
    const m = msg.medium ?? defaultMedium(msg, leadChannel);
    if (!m) continue;
    if (!seen.has(m)) {
      seen.add(m);
      order.push(m);
    }
  }
  return order;
}

export interface Scorecard {
  budget?: string;
  timeline?: string;
  need?: string;
  decisionMaker?: string;
  custom?: Record<string, string>;
  reasoning: string;
}

export interface SuggestedNextAction {
  type: string;
  summary: string;
  payload: string;
}

export interface Lead {
  id: string;
  /** Links this lead to a Contact record. */
  contact_id?: string;
  /** Other lead IDs from the same contact's conversation history. */
  related_lead_ids?: string[];
  created_at: string;
  /** Used as the default inbox sort key. ISO-like string is fine — we render
   *  via formatRelative() so absolute parsing isn't needed. The mock data
   *  uses an integer minute-offset string ('m:120' = 120 minutes ago) for
   *  cheap deterministic sorting. */
  last_activity_at: string;
  prospect: {
    name: string;
    /** Company / org the prospect represents. Shown beneath the name in the
     *  detail view's right-rail prospect card and feeds the inbox row. */
    company: string;
    phone: string;
    email: string;
    source_url: string;
    /** Optional Unsplash portrait URL. Falls back to initials when missing. */
    avatarUrl?: string;
  };
  channel: Channel;
  method: Method;
  status: Status;
  /** Explicit "new / waiting on us" override for the inbox dot. When set, it
   *  wins over the transcript-derived value — used to curate how many rows
   *  read as new. Omit to fall back to transcript derivation. */
  unread?: boolean;
  /** 0-100 qualification score. */
  score: number;
  factors: string[];
  transcript: Message[];
  scorecard: Scorecard;
  suggested_next_action?: SuggestedNextAction | null;
  hubspot_id: string;
  calendly_event_id: string | null;
  /** Human-readable scheduled time for booked appointments. Set when the
   *  AI (or owner) confirms a meeting. Only meaningful when status === 'resolved'.
   *  Example: 'Thu, May 29 · 3:00 PM CT'. */
  scheduled_at?: string;
  /** Minutes-from-now for the scheduled meeting. Positive = future, negative
   *  = past. Used to bucket bookings into Upcoming vs Past on the Bookings
   *  tab and to sort within each bucket. Must be set whenever scheduled_at
   *  is set. */
  scheduled_when?: number;
  /** Free-form location for the scheduled meeting — usually the prospect's
   *  address neighborhood, "Phone call", "Virtual", or similar. Only
   *  meaningful when status === 'resolved'. */
  location?: string;
  /** Manually-set post-booking outcome. When unset, the outcome is derived
   *  from the appointment time (future → scheduled, past → completed) via
   *  effectiveBookingOutcome(); setting it pins an explicit override. */
  outcome?: BookingOutcome | null;
  /** Call activity signal surfaced as a pill in the AI Handling inbox group:
   *  'live' = a call is in progress right now; 'successful' = a call just
   *  completed successfully. Only meaningful when status === 'ai-handling'. */
  callOutcome?: 'live' | 'successful';
  tags: string[];
  /** Landing-page name or form label captured at first touch. */
  first_touch_source: string;
  /** Stable relative offset for "first seen" display. */
  first_seen: string;
}

// ─── Channel + status display metadata ──────────────────────────────

export const SOURCE_LABELS: Record<Channel, string> = {
  form: 'Web form',
  'inbound-call': 'Inbound call',
  chat: 'Chat widget',
};

export const METHOD_LABELS: Record<Method, string> = {
  call: 'Call',
  sms: 'SMS',
  other: 'Chat',
};

export interface StatusStyle {
  label: string;
  tone: StatusPillTone;
}

export const STATUS_STYLES: Record<Status, StatusStyle> = {
  'ai-handling':    { label: 'AI Handling',    tone: 'info'    },
  'human-handling': { label: 'Needs Attention', tone: 'warning' },
  'resolved':       { label: 'Resolved',       tone: 'success' },
  'opted-out':      { label: 'Opted Out',      tone: 'neutral' },
};

/** Ordered by what surfaces first for the user — human work first, then in-flight
 *  AI work, then terminal states. Same order drives the inbox grouping and the
 *  dashboard "Lead status snapshot" rows. */
export const ALL_STATUSES: Status[] = [
  'human-handling',
  'ai-handling',
  'resolved',
  'opted-out',
];

// ─── Booking outcomes ─────────────────────────────────────────────────

/** Label + pill tone for each booking outcome. Tones map to sentiment:
 *  neutral (inactive), info (happened), warning (awaiting), success/accent
 *  (positive), danger (negative). */
export const BOOKING_OUTCOME_STYLES: Record<BookingOutcome, StatusStyle> = {
  scheduled:       { label: 'Scheduled',     tone: 'neutral' },
  completed:       { label: 'Met',           tone: 'info'    },
  'estimate-sent': { label: 'Estimate sent', tone: 'warning' },
  won:             { label: 'Won',           tone: 'success' },
  'job-done':      { label: 'Job done',      tone: 'accent'  },
  'no-show':       { label: 'No-show',       tone: 'danger'  },
  canceled:        { label: 'Canceled',      tone: 'neutral' },
  lost:            { label: 'Lost',          tone: 'danger'  },
};

/** Funnel order: happy path first, then the closed-early exits. Drives the
 *  outcome picker menu. */
export const ALL_BOOKING_OUTCOMES: BookingOutcome[] = [
  'scheduled',
  'completed',
  'estimate-sent',
  'won',
  'job-done',
  'no-show',
  'canceled',
  'lost',
];

/** Time-derived outcome when the user hasn't pinned one: a future appointment
 *  is 'scheduled', a past one is 'completed'. */
export function autoBookingOutcome(lead: Lead): BookingOutcome {
  return (lead.scheduled_when ?? 0) > 0 ? 'scheduled' : 'completed';
}

/** The outcome to display: the manual override if set, else the time-derived
 *  value. */
export function effectiveBookingOutcome(lead: Lead): BookingOutcome {
  return lead.outcome ?? autoBookingOutcome(lead);
}

/** True when the outcome is still tracking the appointment time automatically
 *  (no manual override set). */
export function isAutoBookingOutcome(lead: Lead): boolean {
  return lead.outcome == null;
}

export const ALL_CHANNELS: Channel[] = ['form', 'inbound-call', 'chat'];

export const ALL_METHODS: Method[] = ['call', 'sms', 'other'];

/** Short, hand-authored "what's needed" phrase per lead id, keyed by lead.id.
 *  Drives the inbox "What's needed" column so it never falls back to raw chat
 *  excerpts. Sentence case, ≤ ~8 words. Covers every lead across all statuses
 *  (incl. the re-skinned ids l-aria-chen…l-mia-andersson rendered in Sdr.tsx
 *  and l-priya-followup defined in Sdr.tsx). */
export const LEAD_NEEDS_SUMMARY: Record<string, string> = {
  // Human handling (needs attention)
  'l-morgan-lee':       'Send phased-rollout offer to fit timing',
  'l-casey-park':       'Voicemail — call back re: August reopen',
  'l-priya-followup':   'Warranty claim — owner callback on peeling',
  'l-jason-lee':        'Draft multi-property SOW, priced per site',
  'l-michelle-huang':   'Voicemail — call back on 6-suite complex',
  // AI handling — in conversation
  'l-priya-rao':        'Sent sample gallery + slot picker',
  'l-jordan-fitzgerald':'Sending walk-through details, CC spouse',
  'l-noah-okafor':      'Sent estimate — awaiting review tomorrow',
  'l-helena-saunders':  'Qualifying — awaiting scope reply',
  'l-mia-andersson':    'Qualifying new Westlake exterior lead',
  'l-hannah-kim':       'Answered prep questions on call',
  'l-victor-ortiz':     'Explaining after-hours impact on quote',
  'l-rachel-moore':     'Sending before/after photos before consult',
  'l-ethan-brown':      'Sharing crew size + timeline on bid',
  'l-naomi-clark':      'Booking this week — sharing open days',
  'l-lucas-white':      'Sending examples — couple discussing budget',
  // AI handling — new request
  'l-sasha-bell':       'Qualifying — awaiting first reply',
  'l-tyler-brooks':     'Qualifying — awaiting scope reply',
  'l-jasmine-wong':     'Qualifying new exterior inquiry',
  'l-carlos-vega':      'Qualified on the call',
  'l-phoebe-mitchell':  'Qualifying — awaiting service-type reply',
  // AI handling — followup sent
  'l-derek-thomas':     'Followed up after missed call — no reply yet',
  'l-natalie-green':    'Following up — awaiting first reply',
  'l-ben-carter':       'Asked exterior scope — no reply yet',
  'l-sofia-ruiz':       'Sent color guide — ready to book?',
  'l-owen-davis':       'Sent guide — awaiting timeline',
  // AI handling — live call
  'l-rebecca-martinez': 'Live call — capturing scope now',
  // Resolved — booked / won
  'l-aria-chen':        'Booked — early-May in-home estimate',
  'l-emily-tran':       'Booked — phone consult Tue 3pm',
  'l-talia-mendez':     'Won — interior repaint complete',
  'l-rohan-bhatt':      'Booked — Mon 10am walkthrough',
  'l-maria-santos':     'Booked — Fri 10am in-home estimate',
  'l-james-park':       'Booked — Wed 2pm in-home estimate',
  'l-lisa-kim':         'Booked — 3-site retail walkthrough',
  'l-robert-chen':      'Booked — Thu 9am referral walkthrough',
  'l-anna-walsh':       'Booked — Tue 3pm exterior walkthrough',
  'l-kevin-torres':     'Booked — Fri 1pm interior walkthrough',
  'l-sandra-lee':       'Booked — Sat 11am cabinet consult',
  'l-marcus-johnson':   'Booked — Mon 10am Victorian walkthrough',
  'l-elena-perez':      'Booked — Thu 2pm color consult',
  'l-brian-thompson':   'Won — office repaint, crew scheduled',
  // Opted out — disqualified / lost
  'l-david-wu':         'Declined — subcontractor, out of ICP',
  'l-felix-rosenthal':  'Auto-closed — no reply after voicemail',
  'l-steven-park':      'Declined — renter, no owner authority',
  'l-amanda-foster':    'Referred out — outside service area',
  'l-daniel-kim':       'Declined — out of area, under minimum',
  'l-laura-simmons':    'Declined — DIY, not seeking contractor',
  'l-grace-patterson':  'Lost — chose lower-price competitor',
};

/** Hand-authored 1–2 sentence recap of the whole conversation, surfaced as the
 *  summary card at the top of the detail thread. Only the leads most likely to
 *  be opened (the human-handling ones needing attention) carry a bespoke recap;
 *  every other lead falls back to its scorecard reasoning via
 *  conversationSummary(). Keep these grounded in the actual transcript. */
export const LEAD_CONVERSATION_SUMMARY: Record<string, string> = {
  // Human handling (needs attention) — these render the proposed-reply card too.
  // NOTE: l-casey-park and l-morgan-lee are re-skinned in pages/Sdr.tsx (as
  // Carlos Reyes and David Lin), so these recaps describe the RENDERED leads.
  'l-casey-park':
    'Carlos wants a full exterior repaint and trim on his Round Rock home (~$12k, May start). The AI booked a 9:30 AM callback, then paused for review before the call.',
  'l-morgan-lee':
    'David, an HOA board president, wants all 14 buildings (~220 units) in NW Austin repainted by Q4. The AI paused for owner review to build a phased two-year estimate.',
  'l-jason-lee':
    'Jason wants an exterior repaint across five rentals (~$60k+) phased through Q4, priced separately. The AI offered a master SOW and paused for owner review.',
  'l-michelle-huang':
    'Michelle wants the common areas and six suites (~14,000 sq ft) at Tarrytown Business Center repainted before Q4. Budget needs owner sign-off, so the AI paused for review.',
  'l-priya-followup':
    'Priya, a past customer, reported trim peeling weeks after her exterior job and shared a photo. The AI flagged a warranty claim and paused for an owner callback.',
};

/** Conversation summary for the detail thread's top card. Prefers the bespoke
 *  recap, then falls back to the lead's scorecard reasoning so every
 *  conversation shows something. */
export function conversationSummary(lead: Lead): string {
  return LEAD_CONVERSATION_SUMMARY[lead.id] ?? lead.scorecard.reasoning;
}

// ─── Score → color ──────────────────────────────────────────────────
//
// Score thresholds drive both the inbox cell color and the detail-view
// donut ring color.

export interface ScoreColor {
  /** Foreground / numeric color. */
  fg: string;
  /** Light tint for backgrounds. */
  tint: string;
}

export function scoreColor(score: number): ScoreColor {
  if (score >= 80) return { fg: 'var(--status-approved)', tint: 'rgba(4, 175, 0, 0.12)' };
  if (score >= 60) return { fg: 'var(--status-posting)', tint: 'rgba(1, 121, 207, 0.12)' };
  if (score >= 40) return { fg: 'var(--status-connect)', tint: 'rgba(237, 124, 44, 0.14)' };
  return { fg: 'var(--red-70)', tint: 'rgba(188, 1, 11, 0.1)' };
}

export function scoreHeadline(score: number): string {
  if (score >= 80) return 'Strong fit';
  if (score >= 60) return 'Promising signal';
  if (score >= 40) return 'Mixed signals';
  return 'Weak fit';
}

// ─── Relative-time helpers ──────────────────────────────────────────

/** Mock data uses a stable string format "m:<minutes-ago>" so we can sort
 *  deterministically without depending on real Date.now() at render time.
 *  formatRelative() turns it into a human label. */
export function relativeMinutesAgo(value: string): number {
  const m = /^m:(\d+)$/.exec(value);
  if (!m) return 0;
  return Number(m[1]);
}

export function formatRelative(value: string): string {
  const mins = relativeMinutesAgo(value);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Truncate a string at a soft boundary close to `max` chars, appending ellipsis.
export function truncate(text: string, max = 60): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

// Decorative palette for fallback (initials) avatars. Deterministic per name
// so the same person keeps the same color in the list and the detail view.
// No raw black/white/red hex per the design-token rules — these are distinct
// accent hues only.
const AVATAR_COLORS = [
  'var(--purple)',          // violet
  'var(--status-posting)',  // blue
  'var(--status-new)',      // pink
  'var(--status-connect)',  // orange
  'var(--status-posted)',   // deep purple
  '#16a394',                // teal
];

/** Stable background color for a fallback avatar, derived from the name. */
export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** True when the last non-system transcript message came from the prospect.
 *  Use this for the unread dot — not time-based. */
export function isUnread(lead: Lead): boolean {
  if (lead.unread !== undefined) return lead.unread;
  for (let i = lead.transcript.length - 1; i >= 0; i--) {
    const msg = lead.transcript[i];
    if (msg.role !== 'system') return msg.role === 'prospect';
  }
  return false;
}

// ─── Mock leads ─────────────────────────────────────────────────────
//
// 14 leads spanning all 7 statuses (with at least 2 escalated). Channels
// are mixed; scores spread 30-95. Two leads include a call-transcript
// turn ("morgan-lee" inbound-call, "casey-park" missed-call follow-up).

export const LEADS: Lead[] = [
  {
    id: 'l-aria-chen',
    created_at: 'm:43400',
    last_activity_at: 'm:43200',
    prospect: {
      name: 'Aria Chen',
      company: 'Wildflower Ridge HOA',
      phone: '+1 (512) 555-0148',
      email: 'aria.chen@wildflowerridge.org',
      source_url: 'certapro.com/austin/hoa?utm_campaign=hoa-spring',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    },
    channel: 'form',
    method: 'sms',
    status: 'resolved',
    score: 92,
    factors: ['Explicit budget', 'Board chair has authority', 'Q3 deadline'],
    tags: ['HOA', 'Round Rock', 'Hot lead 24h'],
    first_touch_source: 'HOA painting landing page',
    first_seen: 'm:30',
    hubspot_id: 'HS-39201',
    calendly_event_id: 'cal_priya01',
    scheduled_at: 'Thu, May 8 · 3:00 PM CT',
    scheduled_when: -43200,
    location: 'Westlake, TX (in-home)',
    suggested_next_action: null,
    scorecard: {
      budget: '$140–180k confirmed',
      timeline: 'Decide by end of month',
      need: '14-building HOA exterior repaint',
      decisionMaker: 'Yes — HOA board chair',
      custom: { 'Property count': '14 buildings (Round Rock)' },
      reasoning:
        'Strong fit — explicit budget, board chair has authority, timeline this quarter.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Lead captured · HOA painting landing page',
        timestamp: 'm:30',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Hi Aria — thanks for reaching out about your Wildflower Ridge HOA project. I see you mentioned 14 buildings and a Q3 timeline. Quick question to scope the bid: are you looking at full exterior repaint, or trim and accent only?",
        timestamp: 'm:29',
      },
      {
        id: 't3',
        role: 'prospect',
        type: 'text',
        content:
          "Full exterior — siding, trim, doors. The board approved a $140–180k envelope. Last contractor missed timeline so we're switching.",
        timestamp: 'm:25',
      },
      {
        id: 't4',
        role: 'ai',
        type: 'text',
        content:
          "Got it — that's well within our HOA pricing band. Our crew finished a similar 14-building project in Cedar Park last year, on schedule. Are you the final approver, or is there a board partner I should loop in?",
        timestamp: 'm:24',
      },
      {
        id: 't5',
        role: 'prospect',
        type: 'text',
        content:
          "I'm the board chair — I sign. We need to decide by end of month though, painting needs to wrap before September.",
        timestamp: 'm:14',
      },
      {
        id: 't6',
        role: 'ai',
        type: 'text',
        content:
          "Perfect — that gives us plenty of room. I'll send a Calendly link for a 30-minute walkthrough with Matthew, our VP of Residential. He can walk the property and confirm the bid live. Tuesday or Thursday work better?",
        timestamp: 'm:13',
      },
      {
        id: 't7',
        role: 'prospect',
        type: 'text',
        content: "Thursday afternoon would be ideal. Send the link!",
        timestamp: 'm:4',
      },
      {
        id: 't8',
        role: 'system',
        type: 'system',
        content: 'AI sent Calendly link · awaiting slot pick',
        timestamp: 'm:3',
      },
    ],
  },
  {
    id: 'l-morgan-lee',
    created_at: 'm:180',
    last_activity_at: 'm:14',
    prospect: {
      name: 'Morgan Lee',
      company: 'Hill Country Medical Group',
      phone: '+1 (512) 555-0193',
      email: 'm.lee@hillcountrymed.com',
      source_url: 'certapro.com/austin/commercial',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'human-handling',
    score: 78,
    factors: ['Strong intent', 'No timeline yet', 'Needs custom scope of work'],
    tags: ['Commercial', 'Healthcare', 'Multi-site'],
    first_touch_source: 'Inbound — phone tree, option 2',
    first_seen: 'm:180',
    hubspot_id: 'HS-39188',
    calendly_event_id: null,
    suggested_next_action: {
      type: 'send-followup',
      summary: 'Send personalized follow-up: phased-rollout offer to make timing work',
      payload:
        'Hi Morgan — circling back on our call. To fit your facilities review, we can phase the four clinics across Q3 and Q4 with a single locked-in price. Want me to draft the SOW?',
    },
    scorecard: {
      budget: 'Confidential — facilities-director approval',
      timeline: 'Tentatively Q4',
      need: 'Interior repaint across 4 Austin metro clinics',
      decisionMaker: 'Needs CFO sign-off',
      custom: { 'Locations': '4 clinics (Austin + Cedar Park)', 'Total sqft': '~46,000' },
      reasoning:
        'High intent, large potential project value, but timeline ambiguity and CFO gate keep this from being a clean Hot.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Inbound call · option 2 (commercial)',
        timestamp: 'm:180',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'call',
        content: 'AI handled inbound call · 3m 42s',
        call: {
          duration: '3m 42s',
          turns: [
            { speaker: 'Caller', line: "Hi, I'm calling about your commercial painting services — saw your healthcare page on the CertaPro Austin site." },
            { speaker: 'AI', line: "Hi! Happy to help. Before we dive in — is this for one site or a multi-location project?" },
            { speaker: 'Caller', line: "Multi-site. We have four clinics across the Austin metro, about 46,000 square feet total." },
            { speaker: 'AI', line: "Great scope — we've done a few healthcare groups in that range. Quick question: is this a refresh, or are you opening new locations?" },
            { speaker: 'Caller', line: "Refresh. Current paint's chipped in patient-facing areas and our facilities lead wants it handled before the next inspection." },
            { speaker: 'AI', line: "Got it. When does that inspection land — and is there a budget envelope we should fit?" },
            { speaker: 'Caller', line: "Probably Q4. Budget I can't share over the phone, but it's facilities-approved." },
            { speaker: 'AI', line: "Understood. Let me get you on with Matthew, our VP of Residential and Commercial — he can walk through the after-hours scheduling and low-VOC paint options. Can I have him email you a slot picker?" },
            { speaker: 'Caller', line: "Yes please. m.lee@hillcountrymed.com." },
            { speaker: 'AI', line: "Confirmed. He'll follow up within the hour." },
          ],
        },
        timestamp: 'm:179',
      },
      {
        id: 't3',
        role: 'system',
        type: 'system',
        content: 'Escalated to owner · multi-site commercial rules-engine triggered',
        timestamp: 'm:178',
      },
      {
        id: 't4',
        role: 'ai',
        type: 'text',
        content:
          'Following up by email — Morgan, thanks for the call earlier. As mentioned, Matthew will send a slot picker shortly. In the meantime, attached is our healthcare experience overview.',
        timestamp: 'm:170',
      },
      {
        id: 't5',
        role: 'prospect',
        type: 'text',
        content:
          "Thanks. Quick clarifying question: do you offer a single price across all four clinics, or is each one priced separately? Procurement is asking.",
        timestamp: 'm:90',
      },
      {
        id: 't6',
        role: 'ai',
        type: 'text',
        content:
          "Yes — we can structure as a single master agreement with phased site-level pricing. Bundling typically lands 12-15% below per-site bids. Want me to send a quick term sheet, or wait for the full walkthrough with Matthew?",
        timestamp: 'm:88',
      },
      {
        id: 't7',
        role: 'prospect',
        type: 'text',
        content: "Term sheet would help — I want to share it with the CFO ahead of the walkthrough.",
        timestamp: 'm:30',
      },
      {
        id: 't8',
        role: 'system',
        type: 'system',
        content: 'AI paused for owner review · term sheet generation',
        timestamp: 'm:14',
      },
    ],
  },
  {
    id: 'l-priya-rao',
    created_at: 'm:60',
    last_activity_at: 'm:24',
    prospect: {
      name: 'Priya Rao',
      company: 'Tarrytown homeowner',
      phone: '+1 (512) 555-0167',
      email: 'priya.rao@gmail.com',
      source_url: 'certapro.com/austin/cabinet-refinishing',
    },
    channel: 'chat',
    method: 'other',
    status: 'ai-handling',
    score: 71,
    factors: ['Engaged via widget', 'Specific service', 'Likely fast-close'],
    tags: ['Residential', 'Tarrytown', 'Cabinet refinishing'],
    first_touch_source: 'Cabinet refinishing page chat widget',
    first_seen: 'm:60',
    hubspot_id: 'HS-39214',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: '$6–9k ballpark',
      timeline: 'Within 3 weeks',
      need: 'Kitchen cabinet refinish — white shaker look',
      decisionMaker: 'Yes — homeowner',
      custom: { 'Cabinet count': '~32 doors + 8 drawers', 'Neighborhood': 'Tarrytown' },
      reasoning:
        'Fits the residential cabinet refinishing tier cleanly. Homeowner is the buyer and timeline is fast.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Chat widget opened · /cabinet-refinishing',
        timestamp: 'm:60',
      },
      {
        id: 't2',
        role: 'prospect',
        type: 'text',
        content: "Hi! Do you do cabinet refinishing on real wood doors? We have about 32 doors in our Tarrytown kitchen.",
        timestamp: 'm:59',
      },
      {
        id: 't3',
        role: 'ai',
        type: 'text',
        content:
          "Hi Priya — absolutely. Our cabinet refinishing typically runs $6–9k for a kitchen of that size, including spray finish and door-and-drawer pulls reset. Curious what look you're going for — white shaker, stain refresh, or something else?",
        timestamp: 'm:58',
      },
      {
        id: 't4',
        role: 'prospect',
        type: 'text',
        content: "White shaker look. We're hosting family in 4 weeks and want it done before then.",
        timestamp: 'm:55',
      },
      {
        id: 't5',
        role: 'ai',
        type: 'text',
        content:
          "Hear you. Two of our recent Tarrytown projects had the same brief — they cited the spray-booth finish as the difference from a typical brush-and-roll job. Are you the homeowner of record?",
        timestamp: 'm:54',
      },
      {
        id: 't6',
        role: 'prospect',
        type: 'text',
        content: "Yes — I'm the homeowner. Can we start in the next two weeks?",
        timestamp: 'm:48',
      },
      {
        id: 't7',
        role: 'ai',
        type: 'text',
        content:
          "Yes — typical turnaround is 5 business days once the doors come off. Want me to send sample photos of recent Tarrytown jobs and a Calendly for a 30-min in-home color consultation?",
        timestamp: 'm:47',
      },
      {
        id: 't8',
        role: 'prospect',
        type: 'text',
        content: "Yes please. And include the prep checklist so we know what to clear out.",
        timestamp: 'm:25',
      },
      {
        id: 't9',
        role: 'ai',
        type: 'text',
        content:
          "On it — Tarrytown sample gallery + prep checklist coming through in a moment. I'll also drop a slot picker.",
        timestamp: 'm:24',
      },
    ],
  },
  {
    id: 'l-casey-park',
    created_at: 'm:300',
    last_activity_at: 'm:45',
    prospect: {
      name: 'Casey Park',
      company: 'Salt Traders Coastal Cooking',
      phone: '+1 (512) 555-0142',
      email: 'casey@salttraders.com',
      source_url: 'certapro.com/austin/restaurant-painting',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'human-handling',
    score: 84,
    factors: ['High-intent missed call', 'Decision-maker confirmed', 'Budget signaled'],
    tags: ['Commercial', 'Restaurant', 'Owner buyer'],
    first_touch_source: 'Landing page — Restaurant painting',
    first_seen: 'm:300',
    hubspot_id: 'HS-39167',
    calendly_event_id: null,
    suggested_next_action: {
      type: 'call-back',
      summary: 'Call Casey back at the number on file — voicemail mentioned an August reopen',
      payload:
        "Casey — sorry we missed you. Just listened to your voicemail. Free this afternoon or tomorrow morning to chat through your August reopen timeline?",
    },
    scorecard: {
      budget: '$24k confirmed range',
      timeline: 'Wrap before August reopen',
      need: 'Interior repaint — dining room + bar after refresh',
      decisionMaker: 'Owner',
      custom: { 'Square footage': '~4,200 sqft front of house' },
      reasoning:
        'High-signal voicemail referencing budget and timeline — call back ASAP.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Missed inbound call · voicemail captured',
        timestamp: 'm:300',
      },
      {
        id: 't2',
        role: 'system',
        type: 'call',
        content: 'Voicemail · 47s',
        call: {
          duration: '47s',
          turns: [
            { speaker: 'Caller', line: "Hey, this is Casey Park, owner at Salt Traders. We're refreshing our South Austin location and need an interior repaint for the dining room and bar — saw your restaurant painting page." },
            { speaker: 'Caller', line: "Budget's around $24k, and we want to wrap before our August reopen. Call me back at this number — happy to chat." },
          ],
        },
        timestamp: 'm:299',
      },
      {
        id: 't3',
        role: 'system',
        type: 'system',
        content: 'Voicemail transcribed · qualification rules-engine: ESCALATE',
        timestamp: 'm:298',
      },
      {
        id: 't4',
        role: 'ai',
        type: 'text',
        content:
          "Hi Casey — caught your voicemail and want to make sure you talk to the right person. Quick text: are you free this afternoon (3-5pm CT) or tomorrow morning for a 15-min call?",
        timestamp: 'm:295',
      },
      {
        id: 't5',
        role: 'prospect',
        type: 'text',
        content: "Tomorrow AM works. 9:30 CT?",
        timestamp: 'm:120',
      },
      {
        id: 't6',
        role: 'ai',
        type: 'text',
        content: "9:30 AM CT locked in. Sending a calendar invite now from matthew@certapro.com.",
        timestamp: 'm:119',
        medium: 'email',
      },
      {
        id: 't7',
        role: 'prospect',
        type: 'text',
        content: "Great. One more thing — can you send a couple of recent restaurant project photos before the call?",
        timestamp: 'm:60',
        medium: 'email',
      },
      {
        id: 't8',
        role: 'system',
        type: 'system',
        content: 'AI flagged for owner review · custom collateral request',
        timestamp: 'm:45',
      },
    ],
  },
  {
    id: 'l-jordan-fitzgerald',
    created_at: 'm:480',
    last_activity_at: 'm:75',
    prospect: {
      name: 'Jordan Fitzgerald',
      company: 'Bee Cave homeowner',
      phone: '+1 (512) 555-0118',
      email: 'jfitz@gmail.com',
      source_url: 'certapro.com/austin/blog/exterior-colors-2026',
    },
    channel: 'form',
    method: 'other',
    status: 'ai-handling',
    score: 58,
    factors: ['Re-engaged after cold drip', 'No firm date yet', 'Exploratory'],
    tags: ['Residential', 'Bee Cave', 'Exterior'],
    first_touch_source: 'Exterior color trends 2026 — gated download',
    first_seen: 'm:60000',
    hubspot_id: 'HS-37102',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: 'Not yet defined',
      timeline: 'Exploring for early next year',
      need: 'Full exterior repaint — Bee Cave single-family',
      decisionMaker: 'Couple — both approve together',
      reasoning:
        'Re-engaged from a 6-month-old cold drip. Real interest but very early in their cycle.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Cold drip · sequence #4, day 28',
        timestamp: 'm:120',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Jordan — sharing the 2026 exterior color trends guide you downloaded back in November. Has anything shifted on the exterior paint plan for your Bee Cave place?",
        timestamp: 'm:119',
      },
      {
        id: 't3',
        role: 'prospect',
        type: 'text',
        content: "Actually yes — we had two boards lift on the south-facing wall last month. Reading the guide now.",
        timestamp: 'm:90',
      },
      {
        id: 't4',
        role: 'ai',
        type: 'text',
        content:
          "That's worth a closer look — could be moisture or sun damage. The guide's section on Texas-heat-rated paints might be the most useful starting point — page 14. Curious how your current paint is holding up overall.",
        timestamp: 'm:89',
      },
      {
        id: 't5',
        role: 'prospect',
        type: 'text',
        content: "Honestly it's faded everywhere. We keep talking about repainting but never act on it.",
        timestamp: 'm:80',
      },
      {
        id: 't6',
        role: 'ai',
        type: 'text',
        content:
          "Common pattern. Most homeowners in Bee Cave start with a free walk-through and color consultation — low commitment, you can see what the house wants. Want me to share what that looks like?",
        timestamp: 'm:79',
      },
      {
        id: 't7',
        role: 'prospect',
        type: 'text',
        content: "Yes, send the walk-through details — and CC my spouse, Mara.",
        timestamp: 'm:75',
      },
    ],
  },
  {
    id: 'l-sasha-bell',
    created_at: 'm:30',
    last_activity_at: 'm:30',
    prospect: {
      name: 'Sasha Bell',
      company: 'Lakeway homeowner',
      phone: '+1 (512) 555-0144',
      email: 'sasha.bell@yahoo.com',
      source_url: 'certapro.com/austin/interior',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 64,
    factors: ['Form submitted minutes ago', 'No reply yet'],
    tags: ['Residential', 'Lakeway', 'Interior'],
    first_touch_source: 'Interior painting page form',
    first_seen: 'm:30',
    hubspot_id: 'HS-39230',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      reasoning: 'Just arrived — qualification will run when prospect replies.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Lead captured · Interior painting page form',
        timestamp: 'm:30',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Hi Sasha — thanks for the inquiry about your Lakeway place. To send the right estimate, is this a full-house interior or just a few rooms?",
        timestamp: 'm:29',
      },
    ],
  },
  {
    id: 'l-noah-okafor',
    created_at: 'm:90',
    last_activity_at: 'm:55',
    prospect: {
      name: 'Noah Okafor',
      company: 'Helmsman Property Group',
      phone: '+1 (512) 555-0181',
      email: 'noah@helmsmanproperty.com',
      source_url: 'certapro.com/austin/case-studies/cedar-park-hoa',
    },
    channel: 'chat',
    method: 'other',
    status: 'ai-handling',
    score: 76,
    factors: ['Browsed case studies', 'Property manager', 'Asked for warranty terms'],
    tags: ['Commercial', 'Property management'],
    first_touch_source: 'Cedar Park HOA case study page',
    first_seen: 'm:90',
    hubspot_id: 'HS-39222',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: '$80–120k indicated',
      timeline: 'Next quarter',
      need: 'Exterior repaint program across 9 small-multifamily buildings',
      decisionMaker: 'Yes — head of operations',
      reasoning:
        'Good fit. Wants concrete warranty + scheduling commitments before booking a walkthrough.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Chat widget opened · /case-studies/cedar-park-hoa',
        timestamp: 'm:90',
      },
      {
        id: 't2',
        role: 'prospect',
        type: 'text',
        content: "Just read the Cedar Park HOA case study. The 6-week timeline for 14 buildings — was that durable, or did it slip?",
        timestamp: 'm:89',
      },
      {
        id: 't3',
        role: 'ai',
        type: 'text',
        content:
          "Great question — Cedar Park wrapped on day 41, three days ahead of schedule. Most multi-building HOA projects land within 5% of the bid timeline. Anything specific you're trying to validate?",
        timestamp: 'm:88',
      },
      {
        id: 't4',
        role: 'prospect',
        type: 'text',
        content: "Reliability. Last contractor blew past our window by six weeks. Trying to find a partner we can trust on a 9-building portfolio.",
        timestamp: 'm:80',
      },
      {
        id: 't5',
        role: 'ai',
        type: 'text',
        content:
          "Understood. We back exterior work with a 4-year written warranty and assign a single project manager per portfolio. Want me to share our portfolio playbook (anonymized)?",
        timestamp: 'm:78',
      },
      {
        id: 't6',
        role: 'prospect',
        type: 'text',
        content: "Yes, send it. Also need a ballpark for 9 buildings, ~80,000 sqft total exterior.",
        timestamp: 'm:60',
      },
      {
        id: 't7',
        role: 'ai',
        type: 'text',
        content:
          "Sending now. For that scope it lands $80–120k depending on prep depth. I'll include a tier comparison. Worth a 20-min walkthrough once you've reviewed?",
        timestamp: 'm:58',
      },
      {
        id: 't8',
        role: 'prospect',
        type: 'text',
        content: "Let me read first, then circle back tomorrow.",
        timestamp: 'm:55',
      },
    ],
  },
  {
    id: 'l-emily-tran',
    created_at: 'm:240',
    last_activity_at: 'm:120',
    prospect: {
      name: 'Emily Tran',
      company: 'Westlake homeowner',
      phone: '+1 (512) 555-0179',
      email: 'emily.tran@gmail.com',
      source_url: 'certapro.com/austin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'resolved',
    score: 88,
    factors: ['Booked walkthrough', 'Confirmed budget', 'Sole decision-maker'],
    tags: ['Residential', 'Westlake', 'Full-house interior'],
    first_touch_source: 'Inbound — phone tree, option 1',
    first_seen: 'm:240',
    hubspot_id: 'HS-39201',
    calendly_event_id: 'cal_8z2k',
    scheduled_at: 'Tue, Jun 9 · 3:00 PM CT',
    scheduled_when: 5760,
    location: 'Phone call',
    suggested_next_action: null,
    scorecard: {
      budget: '$18k confirmed',
      timeline: 'Start next month',
      need: 'Full interior repaint — 3,400 sqft Westlake home',
      decisionMaker: 'Yes — homeowner',
      custom: { 'Square footage': '3,400 sqft (2 stories)' },
      reasoning:
        'Already on the calendar with Matthew. Strong signals across the board.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Inbound call · qualified by AI',
        timestamp: 'm:240',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Hi Emily — recapping our call: 3,400 sqft Westlake home, full interior repaint, $18k budget. Sending the walkthrough slot picker now.",
        timestamp: 'm:200',
      },
      {
        id: 't3',
        role: 'prospect',
        type: 'text',
        content: "Got it — picking Thursday 11am.",
        timestamp: 'm:160',
      },
      {
        id: 't4',
        role: 'system',
        type: 'system',
        content: 'Walkthrough booked · Thursday 11:00 AM CT with Matthew Tims',
        timestamp: 'm:159',
      },
      {
        id: 't5',
        role: 'ai',
        type: 'text',
        content:
          "Confirmed! Matthew will send the prep checklist Wednesday afternoon. In the meantime, here's our interior color guide to skim.",
        timestamp: 'm:158',
      },
      {
        id: 't6',
        role: 'prospect',
        type: 'text',
        content: "Perfect, thanks.",
        timestamp: 'm:120',
      },
    ],
  },
  {
    id: 'l-david-wu',
    created_at: 'm:480',
    last_activity_at: 'm:200',
    prospect: {
      name: 'David Wu',
      company: 'Renter — South Austin apartment',
      phone: '+1 (512) 555-0192',
      email: 'd.wu@gmail.com',
      source_url: 'certapro.com/austin',
    },
    channel: 'form',
    method: 'other',
    status: 'opted-out',
    score: 32,
    factors: ['Renter, not owner', 'No project authority'],
    tags: ['Renter', 'Out of ICP'],
    first_touch_source: 'Cold sequence · newsletter signup',
    first_seen: 'm:30000',
    hubspot_id: 'HS-36140',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      reasoning: 'Renter without landlord approval — not in our ICP. Politely disqualified.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Cold drip · sequence #2, day 14',
        timestamp: 'm:400',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content: "Hi David — CertaPro Austin handles residential and commercial painting. Is this for a home you own, a rental, or a commercial property?",
        timestamp: 'm:399',
      },
      {
        id: 't3',
        role: 'prospect',
        type: 'text',
        content: "I rent — was hoping to paint my apartment, but landlord said no.",
        timestamp: 'm:300',
      },
      {
        id: 't4',
        role: 'ai',
        type: 'text',
        content:
          "Appreciate the reply! Without landlord sign-off we can't take the job. If your landlord ever wants the unit refreshed, send them our way — we'd be happy to bid it. You'll stay on our color-tips list.",
        timestamp: 'm:299',
      },
      {
        id: 't5',
        role: 'system',
        type: 'system',
        content: 'Auto-disqualified · renter without owner approval',
        timestamp: 'm:200',
      },
    ],
  },
  {
    id: 'l-talia-mendez',
    created_at: 'm:1440',
    last_activity_at: 'm:300',
    prospect: {
      name: 'Talia Mendez',
      company: 'Oakwise Family Dental',
      phone: '+1 (512) 555-0136',
      email: 'talia@oakwisedental.com',
      source_url: 'certapro.com/austin/commercial',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&q=80',
    },
    channel: 'form',
    method: 'sms',
    status: 'resolved',
    score: 70,
    factors: ['Signed last quarter', 'Project complete'],
    tags: ['Commercial', 'Healthcare', 'Won'],
    first_touch_source: 'Commercial painting page form',
    first_seen: 'm:43200',
    hubspot_id: 'HS-35001',
    calendly_event_id: 'cal_9aa1',
    scheduled_at: 'Mon, May 19 · 2:00 PM CT',
    scheduled_when: -24480,
    location: 'Dripping Springs, TX (in-home)',
    suggested_next_action: null,
    scorecard: {
      reasoning: 'Won — interior repaint complete. Closed in the AI Receptionist view.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Project won · moved to scheduling queue',
        timestamp: 'm:300',
      },
    ],
  },
  {
    id: 'l-rohan-bhatt',
    created_at: 'm:120',
    last_activity_at: 'm:100',
    prospect: {
      name: 'Rohan Bhatt',
      company: 'Waypoint Office Park',
      phone: '+1 (512) 555-0118',
      email: 'rohan@waypointoffice.com',
      source_url: 'certapro.com/austin/office',
    },
    channel: 'chat',
    method: 'other',
    status: 'resolved',
    score: 89,
    factors: ['Highly engaged chat', 'Property owner', 'Q3 deadline confirmed'],
    tags: ['Commercial', 'Office', 'Owner buyer'],
    first_touch_source: 'Office painting page chat widget',
    first_seen: 'm:120',
    hubspot_id: 'HS-39243',
    calendly_event_id: null,
    scheduled_at: 'Mon, Jun 8 · 10:00 AM CT',
    scheduled_when: 4320,
    location: 'Waypoint Office Park · Leander, TX',
    suggested_next_action: null,
    scorecard: {
      budget: '$45k confirmed',
      timeline: 'Sign by end of Q3',
      need: 'Office park common-area + suite repaint',
      decisionMaker: 'Yes — owner / facilities lead',
      custom: { 'Square footage': '~12,000 sqft', 'Suites': '18' },
      reasoning:
        'Strong fit and high engagement velocity. Owner buyer, confirmed budget, fast timeline.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Chat widget opened · /office',
        timestamp: 'm:120',
      },
      {
        id: 't2',
        role: 'prospect',
        type: 'text',
        content: "Need to repaint common areas and the suites between tenants — last contractor disappeared mid-project. 18 suites, about 12,000 sqft.",
        timestamp: 'm:119',
      },
      {
        id: 't3',
        role: 'ai',
        type: 'text',
        content:
          "Got it — between-tenant turnovers are our bread and butter. Most office parks see us finish a suite in 2-3 days with low-odor paint so neighbors aren't disrupted. Are you the buyer here?",
        timestamp: 'm:118',
      },
      {
        id: 't4',
        role: 'prospect',
        type: 'text',
        content: "Owner, yes. Budget around $45k. Want to sign before Q3 close.",
        timestamp: 'm:115',
      },
      {
        id: 't5',
        role: 'ai',
        type: 'text',
        content:
          "Perfect — that's a clean fit for our commercial scope. Sending a calendar link for a 20-min walkthrough with Matthew. Tomorrow morning work?",
        timestamp: 'm:114',
      },
      {
        id: 't6',
        role: 'prospect',
        type: 'text',
        content: "Yes. 10am CT ideal.",
        timestamp: 'm:101',
      },
      {
        id: 't7',
        role: 'system',
        type: 'system',
        content: 'Calendar invite sent · 10:00 AM CT with Matthew Tims',
        timestamp: 'm:100',
      },
    ],
  },
  {
    id: 'l-helena-saunders',
    created_at: 'm:60',
    last_activity_at: 'm:50',
    prospect: {
      name: 'Helena Saunders',
      company: 'Pflugerville homeowner',
      phone: '+1 (512) 555-0511',
      email: 'helena.saunders@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 49,
    factors: ['Out of immediate service area', 'No clear timeline'],
    tags: ['Residential', 'Pflugerville', 'Exterior'],
    first_touch_source: 'Exterior painting page form',
    first_seen: 'm:60',
    hubspot_id: 'HS-39238',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      reasoning:
        'New residential lead in Pflugerville — qualification pending. Just needs a timeline + budget.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Lead captured · exterior painting page form',
        timestamp: 'm:60',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Hi Helena — thanks for reaching out. Just to send the right info, are you looking at full exterior, trim only, or a specific area like the front facade?",
        timestamp: 'm:55',
      },
    ],
  },
  {
    id: 'l-felix-rosenthal',
    created_at: 'm:360',
    last_activity_at: 'm:240',
    prospect: {
      name: 'Felix Rosenthal',
      company: 'Leander homeowner',
      phone: '+1 (512) 555-0102',
      email: 'felix.rosenthal@gmail.com',
      source_url: 'certapro.com/austin',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'opted-out',
    score: 41,
    factors: ['No reply after voicemail', 'Cooled off'],
    tags: ['Residential', 'Leander'],
    first_touch_source: 'Home page phone tap',
    first_seen: 'm:9000',
    hubspot_id: 'HS-38112',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      reasoning:
        'Voicemail not returned across 2 follow-up attempts. Auto-closed after 5 days of silence.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Missed inbound call · no voicemail',
        timestamp: 'm:360',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content: "Hi Felix — just missed your call. Free anytime today to chat about your project?",
        timestamp: 'm:355',
      },
      {
        id: 't3',
        role: 'ai',
        type: 'text',
        content: "Following up — happy to send our service menu and a sample exterior color guide if a call's not convenient.",
        timestamp: 'm:300',
      },
      {
        id: 't4',
        role: 'system',
        type: 'system',
        content: 'Auto-closed · no reply across 2 attempts',
        timestamp: 'm:240',
      },
    ],
  },
  {
    id: 'l-mia-andersson',
    created_at: 'm:20',
    last_activity_at: 'm:18',
    prospect: {
      name: 'Mia Andersson',
      company: 'Brightline Boutique Hotel',
      phone: '+1 (512) 555-0177',
      email: 'mia@brightlinehotel.com',
      source_url: 'certapro.com/austin/commercial',
      avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&q=80',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 73,
    factors: ['Hospitality buyer — moves fast', 'Engaged immediately'],
    tags: ['Commercial', 'Hospitality'],
    first_touch_source: 'Commercial painting page form',
    first_seen: 'm:20',
    hubspot_id: 'HS-39248',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      reasoning: 'Brand-new lead. Profile suggests a fast buyer — qualification continues.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Lead captured · commercial painting page form',
        timestamp: 'm:20',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Hi Mia — thanks for filling out the form. Quick question to scope the bid: how many rooms and common areas are we looking at refreshing?",
        timestamp: 'm:18',
      },
    ],
  },

  // ── Batch 2 — 33 additional leads to reach 47 total (12 booked) ─────────
  // All last_activity_at values are within the last 30 days (≤ 43,200 min).

  // Booked — 9 new (total reaches 12)
  {
    id: 'l-maria-santos',
    created_at: 'm:440',
    last_activity_at: 'm:420',
    prospect: {
      name: 'Maria Santos',
      company: 'Cedar Park homeowner',
      phone: '+1 (512) 555-0201',
      email: 'maria.santos@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'form',
    method: 'sms',
    status: 'resolved',
    score: 85,
    factors: ['Confirmed budget', 'Start date locked', 'Sole decision-maker'],
    tags: ['Residential', 'Cedar Park', 'Interior'],
    first_touch_source: 'Interior painting page form',
    first_seen: 'm:440',
    hubspot_id: 'HS-39250',
    calendly_event_id: 'cal_ms01',
    scheduled_at: 'Mon, Jun 2 · 10:00 AM CT',
    scheduled_when: -4320,
    location: 'Cedar Park, TX (in-home)',
    suggested_next_action: null,
    scorecard: {
      budget: '$12k confirmed',
      timeline: 'Start in 3 weeks',
      need: 'Full interior repaint — 2,200 sqft Cedar Park home',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Clean residential fit. Budget confirmed, timeline clear, booking confirmed.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · interior painting page form', timestamp: 'm:440' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Maria — thanks for reaching out. Is this a full-house interior or specific rooms?", timestamp: 'm:435' },
      { id: 't3', role: 'prospect', type: 'text', content: "Full house — 4 bed, 2.5 bath. Budget around $12k.", timestamp: 'm:430' },
      { id: 't4', role: 'system', type: 'system', content: 'Walkthrough booked · Friday 10:00 AM CT with Matthew Tims', timestamp: 'm:420' },
    ],
  },
  {
    id: 'l-james-park',
    created_at: 'm:860',
    last_activity_at: 'm:840',
    prospect: {
      name: 'James Park',
      company: 'Round Rock homeowner',
      phone: '+1 (512) 555-0202',
      email: 'james.park.atx@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'form',
    method: 'sms',
    status: 'resolved',
    score: 91,
    factors: ['High score', 'Full exterior', 'Timeline confirmed'],
    tags: ['Residential', 'Round Rock', 'Exterior'],
    first_touch_source: 'Exterior painting page form',
    first_seen: 'm:860',
    hubspot_id: 'HS-39251',
    calendly_event_id: 'cal_jp01',
    scheduled_at: 'Wed, Jun 10 · 2:00 PM CT',
    scheduled_when: 7200,
    location: 'Round Rock, TX (in-home)',
    suggested_next_action: null,
    scorecard: {
      budget: '$22k confirmed',
      timeline: 'Before school year',
      need: 'Full exterior repaint — 3,800 sqft two-story',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'High-score residential. Budget confirmed above average. Booked walkthrough.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · exterior painting page form', timestamp: 'm:860' },
      { id: 't2', role: 'prospect', type: 'text', content: "Need full exterior on a two-story in Round Rock. $22k budget. Can start in July.", timestamp: 'm:855' },
      { id: 't3', role: 'system', type: 'system', content: 'Walkthrough booked · Monday 2:00 PM CT with Matthew Tims', timestamp: 'm:840' },
    ],
  },
  {
    id: 'l-lisa-kim',
    created_at: 'm:670',
    last_activity_at: 'm:650',
    prospect: {
      name: 'Lisa Kim',
      company: 'Southside Retail Group',
      phone: '+1 (512) 555-0203',
      email: 'lisa@southsideretail.com',
      source_url: 'certapro.com/austin/commercial',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'resolved',
    score: 88,
    factors: ['Commercial buyer', 'Multiple locations', 'Fast timeline'],
    tags: ['Commercial', 'Retail', 'Multi-site'],
    first_touch_source: 'Inbound — phone tree, option 2',
    first_seen: 'm:670',
    hubspot_id: 'HS-39252',
    calendly_event_id: 'cal_lk01',
    scheduled_at: 'Tue, Jun 3 · 11:00 AM CT',
    scheduled_when: -2880,
    location: 'South Austin · 3 retail sites',
    suggested_next_action: null,
    scorecard: {
      budget: '$38k range',
      timeline: 'Refresh before holiday season',
      need: 'Interior repaint across 3 retail locations',
      decisionMaker: 'Yes — property manager',
      reasoning: 'Strong commercial fit. Retail refresh before holidays. Booking confirmed.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · option 2 (commercial)', timestamp: 'm:670' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Lisa — recapping our call: 3 retail locations, interior refresh, $38k range. Sending slot picker now.", timestamp: 'm:665' },
      { id: 't3', role: 'system', type: 'system', content: 'Walkthrough booked · Wednesday 11:00 AM CT with Matthew Tims', timestamp: 'm:650' },
    ],
  },
  {
    id: 'l-robert-chen',
    created_at: 'm:1120',
    last_activity_at: 'm:1100',
    prospect: {
      name: 'Robert Chen',
      company: 'Bouldin Creek homeowner',
      phone: '+1 (512) 555-0204',
      email: 'rchen.austin@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'resolved',
    score: 79,
    factors: ['Budget confirmed', 'Referral from neighbor', 'Fast close'],
    tags: ['Residential', 'Bouldin Creek', 'Interior'],
    first_touch_source: 'Inbound — phone tree, option 1',
    first_seen: 'm:1120',
    hubspot_id: 'HS-39253',
    calendly_event_id: 'cal_rc01',
    suggested_next_action: null,
    scorecard: {
      budget: '$9k confirmed',
      timeline: 'As soon as possible',
      need: 'Interior refresh — 1,800 sqft bungalow',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Referral lead. Small project, fast timeline, budget confirmed. Booked.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · option 1 (residential)', timestamp: 'm:1120' },
      { id: 't2', role: 'system', type: 'system', content: 'Walkthrough booked · Thursday 9:00 AM CT with Matthew Tims', timestamp: 'm:1100' },
    ],
  },
  {
    id: 'l-anna-walsh',
    created_at: 'm:1480',
    last_activity_at: 'm:1450',
    prospect: {
      name: 'Anna Walsh',
      company: 'Bastrop homeowner',
      phone: '+1 (512) 555-0205',
      email: 'anna.walsh@yahoo.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'resolved',
    score: 82,
    factors: ['Clear scope', 'Timeline locked', 'Decision-maker confirmed'],
    tags: ['Residential', 'Bastrop', 'Exterior'],
    first_touch_source: 'Inbound — phone tree, option 1',
    first_seen: 'm:1480',
    hubspot_id: 'HS-39254',
    calendly_event_id: 'cal_aw01',
    suggested_next_action: null,
    scorecard: {
      budget: '$15k approved',
      timeline: 'Fall project',
      need: 'Full exterior — Bastrop ranch-style home',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Clean residential exterior. Budget approved by HOA, fall start confirmed.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · option 1 (residential)', timestamp: 'm:1480' },
      { id: 't2', role: 'system', type: 'system', content: 'Walkthrough booked · Tuesday 3:00 PM CT with Matthew Tims', timestamp: 'm:1450' },
    ],
  },
  {
    id: 'l-kevin-torres',
    created_at: 'm:740',
    last_activity_at: 'm:720',
    prospect: {
      name: 'Kevin Torres',
      company: 'Hyde Park homeowner',
      phone: '+1 (512) 555-0206',
      email: 'kevin.torres.atx@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'chat',
    method: 'other',
    status: 'resolved',
    score: 87,
    factors: ['Chat-to-book in under an hour', 'Homeowner', 'Confirmed budget'],
    tags: ['Residential', 'Hyde Park', 'Interior'],
    first_touch_source: 'Interior painting page chat widget',
    first_seen: 'm:740',
    hubspot_id: 'HS-39255',
    calendly_event_id: 'cal_kt01',
    suggested_next_action: null,
    scorecard: {
      budget: '$11k confirmed',
      timeline: 'Within 6 weeks',
      need: 'Interior refresh — craftsman bungalow, 2,000 sqft',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Fast chat conversion. Homeowner, budget and timeline confirmed. Booked.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Chat widget opened · /interior', timestamp: 'm:740' },
      { id: 't2', role: 'prospect', type: 'text', content: "Need interior refresh on my Hyde Park bungalow, about 2,000 sqft. Budget is $11k.", timestamp: 'm:738' },
      { id: 't3', role: 'system', type: 'system', content: 'Walkthrough booked · Friday 1:00 PM CT with Matthew Tims', timestamp: 'm:720' },
    ],
  },
  {
    id: 'l-sandra-lee',
    created_at: 'm:1880',
    last_activity_at: 'm:1850',
    prospect: {
      name: 'Sandra Lee',
      company: 'Cherrywood homeowner',
      phone: '+1 (512) 555-0207',
      email: 'sandra.lee.cherrywood@gmail.com',
      source_url: 'certapro.com/austin/cabinet-refinishing',
    },
    channel: 'chat',
    method: 'other',
    status: 'resolved',
    score: 83,
    factors: ['Cabinet job', 'Fast timeline', 'Repeat neighborhood referral'],
    tags: ['Residential', 'Cherrywood', 'Cabinet refinishing'],
    first_touch_source: 'Cabinet refinishing page chat widget',
    first_seen: 'm:1880',
    hubspot_id: 'HS-39256',
    calendly_event_id: 'cal_sl01',
    suggested_next_action: null,
    scorecard: {
      budget: '$7k confirmed',
      timeline: 'Before the holidays',
      need: 'Cabinet refinish — kitchen + island, 28 doors',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Cabinet job with clear scope. Referral from a past Cherrywood customer.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Chat widget opened · /cabinet-refinishing', timestamp: 'm:1880' },
      { id: 't2', role: 'prospect', type: 'text', content: "Neighbor recommended you guys. Need kitchen cabinets refinished — 28 doors, white shaker look.", timestamp: 'm:1875' },
      { id: 't3', role: 'system', type: 'system', content: 'Color consultation booked · Saturday 11:00 AM CT with Matthew Tims', timestamp: 'm:1850' },
    ],
  },
  {
    id: 'l-marcus-johnson',
    created_at: 'm:2200',
    last_activity_at: 'm:2150',
    prospect: {
      name: 'Marcus Johnson',
      company: 'Clarksville homeowner',
      phone: '+1 (512) 555-0208',
      email: 'm.johnson.clarksville@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'resolved',
    score: 90,
    factors: ['High-value exterior', 'Budget confirmed', 'Decision-maker on call'],
    tags: ['Residential', 'Clarksville', 'Exterior'],
    first_touch_source: 'Inbound — phone tree, option 1',
    first_seen: 'm:2200',
    hubspot_id: 'HS-39257',
    calendly_event_id: 'cal_mj01',
    suggested_next_action: null,
    scorecard: {
      budget: '$28k confirmed',
      timeline: 'Before August',
      need: 'Full exterior — Victorian-style home, 3,600 sqft',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'High-value Clarksville Victorian. Budget confirmed, timeline locked. Strong fit.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · option 1 (residential)', timestamp: 'm:2200' },
      { id: 't2', role: 'system', type: 'system', content: 'Walkthrough booked · Monday 10:00 AM CT with Matthew Tims', timestamp: 'm:2150' },
    ],
  },
  {
    id: 'l-elena-perez',
    created_at: 'm:2750',
    last_activity_at: 'm:2700',
    prospect: {
      name: 'Elena Perez',
      company: 'Rollingwood homeowner',
      phone: '+1 (512) 555-0209',
      email: 'elena.perez.atx@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'form',
    method: 'sms',
    status: 'resolved',
    score: 86,
    factors: ['Large scope', 'Confirmed budget', 'No competing bids'],
    tags: ['Residential', 'Rollingwood', 'Interior'],
    first_touch_source: 'Interior painting page form',
    first_seen: 'm:2750',
    hubspot_id: 'HS-39258',
    calendly_event_id: 'cal_ep01',
    suggested_next_action: null,
    scorecard: {
      budget: '$19k confirmed',
      timeline: 'Summer project',
      need: 'Full interior — 3,100 sqft Rollingwood home',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Large interior scope. Budget confirmed, exclusive bid opportunity. Booked.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · interior painting page form', timestamp: 'm:2750' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Elena — 3,100 sqft interior repaint is a great fit for our summer crew schedule. Want me to send a slot for a color consult?", timestamp: 'm:2720' },
      { id: 't3', role: 'prospect', type: 'text', content: "Yes please.", timestamp: 'm:2710' },
      { id: 't4', role: 'system', type: 'system', content: 'Color consultation booked · Thursday 2:00 PM CT with Matthew Tims', timestamp: 'm:2700' },
    ],
  },

  // New request — 4 new
  {
    id: 'l-tyler-brooks',
    created_at: 'm:14',
    last_activity_at: 'm:10',
    prospect: {
      name: 'Tyler Brooks',
      company: 'Mueller homeowner',
      phone: '+1 (512) 555-0210',
      email: 'tyler.brooks@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 62,
    factors: ['Just arrived', 'Qualification pending'],
    tags: ['Residential', 'Mueller'],
    first_touch_source: 'Interior painting page form',
    first_seen: 'm:14',
    hubspot_id: 'HS-39259',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Brand-new lead. Qualification begins on first reply.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · interior painting page form', timestamp: 'm:14' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Tyler — thanks for reaching out. To get you the right estimate, is this a full-house interior or specific rooms?", timestamp: 'm:10' },
    ],
  },
  {
    id: 'l-jasmine-wong',
    created_at: 'm:11',
    last_activity_at: 'm:8',
    prospect: {
      name: 'Jasmine Wong',
      company: 'North Loop homeowner',
      phone: '+1 (512) 555-0211',
      email: 'jasmine.wong.atx@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 58,
    factors: ['Just arrived', 'Exterior inquiry'],
    tags: ['Residential', 'North Loop'],
    first_touch_source: 'Exterior painting page form',
    first_seen: 'm:11',
    hubspot_id: 'HS-39260',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'New exterior lead. Awaiting first reply to begin qualification.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · exterior painting page form', timestamp: 'm:11' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Jasmine — quick question: is this a full exterior or trim and accent only?", timestamp: 'm:8' },
    ],
  },
  {
    id: 'l-carlos-vega',
    created_at: 'm:18',
    last_activity_at: 'm:15',
    prospect: {
      name: 'Carlos Vega',
      company: 'East Austin homeowner',
      phone: '+1 (512) 555-0212',
      email: 'carlos.vega.east@gmail.com',
      source_url: 'certapro.com/austin',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'ai-handling',
    score: 67,
    callOutcome: 'successful',
    factors: ['Just arrived', 'Inbound call'],
    tags: ['Residential', 'East Austin'],
    first_touch_source: 'Home page phone tap',
    first_seen: 'm:18',
    hubspot_id: 'HS-39261',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Just called in. AI collecting project details now.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · in progress — AI qualifying', timestamp: 'm:18' },
    ],
  },
  {
    id: 'l-phoebe-mitchell',
    created_at: 'm:16',
    last_activity_at: 'm:12',
    prospect: {
      name: 'Phoebe Mitchell',
      company: 'Travis Country homeowner',
      phone: '+1 (512) 555-0213',
      email: 'phoebe.mitchell@icloud.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 55,
    factors: ['Just arrived', 'Qualification pending'],
    tags: ['Residential', 'Travis Country'],
    first_touch_source: 'Interior painting page form',
    first_seen: 'm:16',
    hubspot_id: 'HS-39262',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Just arrived. Awaiting reply to opening qualification question.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · interior painting page form', timestamp: 'm:16' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Phoebe — happy to help. Is this for an interior refresh, full repaint, or something more specific like cabinets?", timestamp: 'm:12' },
    ],
  },

  // Followup sent — 5 new
  {
    id: 'l-derek-thomas',
    created_at: 'm:200',
    last_activity_at: 'm:180',
    prospect: {
      name: 'Derek Thomas',
      company: 'Rosedale homeowner',
      phone: '+1 (512) 555-0214',
      email: 'derek.thomas.rosedale@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'ai-handling',
    score: 63,
    factors: ['Missed call followed up', 'No reply yet'],
    tags: ['Residential', 'Rosedale', 'Exterior'],
    first_touch_source: 'Home page phone tap',
    first_seen: 'm:200',
    hubspot_id: 'HS-39263',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Missed call. AI sent SMS follow-up. Awaiting reply.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Missed inbound call · no voicemail', timestamp: 'm:200' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Derek — just missed your call. Happy to chat about your exterior project anytime today.", timestamp: 'm:180' },
    ],
  },
  {
    id: 'l-natalie-green',
    created_at: 'm:270',
    last_activity_at: 'm:250',
    prospect: {
      name: 'Natalie Green',
      company: 'Allandale homeowner',
      phone: '+1 (512) 555-0215',
      email: 'natalie.green.atx@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 59,
    factors: ['Form submitted', 'No reply yet'],
    tags: ['Residential', 'Allandale', 'Interior'],
    first_touch_source: 'Interior painting page form',
    first_seen: 'm:270',
    hubspot_id: 'HS-39264',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Form lead. AI sent opening question. Awaiting first reply.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · interior painting page form', timestamp: 'm:270' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Natalie — saw you reached out about interior painting. Is this a full house or a few rooms?", timestamp: 'm:250' },
    ],
  },
  {
    id: 'l-ben-carter',
    created_at: 'm:400',
    last_activity_at: 'm:380',
    prospect: {
      name: 'Ben Carter',
      company: 'Windsor Hills homeowner',
      phone: '+1 (512) 555-0216',
      email: 'ben.carter@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 61,
    factors: ['Exterior inquiry', 'No reply after first message'],
    tags: ['Residential', 'Windsor Hills', 'Exterior'],
    first_touch_source: 'Exterior painting page form',
    first_seen: 'm:400',
    hubspot_id: 'HS-39265',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Exterior lead. AI asked scope question. No reply yet.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · exterior painting page form', timestamp: 'm:400' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Ben — thanks for getting in touch. Full exterior or specific sides/trim?", timestamp: 'm:380' },
    ],
  },
  {
    id: 'l-sofia-ruiz',
    created_at: 'm:580',
    last_activity_at: 'm:550',
    prospect: {
      name: 'Sofia Ruiz',
      company: 'Sunset Valley homeowner',
      phone: '+1 (512) 555-0217',
      email: 'sofia.ruiz.sv@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'ai-handling',
    score: 70,
    factors: ['Called in', 'AI sent follow-up email', 'No reply'],
    tags: ['Residential', 'Sunset Valley', 'Interior'],
    first_touch_source: 'Inbound — phone tree, option 1',
    first_seen: 'm:580',
    hubspot_id: 'HS-39266',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Inbound call, moderate score. Follow-up email sent. Awaiting reply.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · AI qualified, follow-up sent', timestamp: 'm:580' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Sofia — sending the color guide and sample photos for your Sunset Valley interior as discussed. Ready to book a walkthrough?", timestamp: 'm:550', medium: 'email' },
    ],
  },
  {
    id: 'l-owen-davis',
    created_at: 'm:720',
    last_activity_at: 'm:700',
    prospect: {
      name: 'Owen Davis',
      company: 'Barton Hills homeowner',
      phone: '+1 (512) 555-0218',
      email: 'owen.davis.austin@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 56,
    factors: ['Exterior inquiry', 'Follow-up sent'],
    tags: ['Residential', 'Barton Hills', 'Exterior'],
    first_touch_source: 'Exterior painting page form',
    first_seen: 'm:720',
    hubspot_id: 'HS-39267',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Exterior lead. Follow-up sent with service guide. Awaiting reply.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · exterior painting page form', timestamp: 'm:720' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Owen — sent over our Barton Hills exterior guide. What's the timeline you're working toward?", timestamp: 'm:700' },
    ],
  },

  // In conversation — 6 new
  {
    id: 'l-hannah-kim',
    created_at: 'm:370',
    last_activity_at: 'm:350',
    prospect: {
      name: 'Hannah Kim',
      company: 'Crestview homeowner',
      phone: '+1 (512) 555-0219',
      email: 'hannah.kim.crestview@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'ai-handling',
    score: 74,
    callOutcome: 'successful',
    factors: ['Actively engaging', 'Comparing bids', 'Homeowner buyer'],
    tags: ['Residential', 'Crestview', 'Interior'],
    first_touch_source: 'Inbound — phone tree, option 1',
    first_seen: 'm:370',
    hubspot_id: 'HS-39268',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: '$14k range',
      timeline: 'This summer',
      need: 'Interior repaint — 2,600 sqft Crestview home',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Actively comparing two bids. Engaged and responsive. Likely to convert.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · AI qualified', timestamp: 'm:370' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Hannah — thanks for calling. Sending two reference projects close to your Crestview neighborhood now.", timestamp: 'm:360' },
      { id: 't3', role: 'prospect', type: 'text', content: "Got them — both look great. What's included in your prep work?", timestamp: 'm:350' },
    ],
  },
  {
    id: 'l-victor-ortiz',
    created_at: 'm:500',
    last_activity_at: 'm:480',
    prospect: {
      name: 'Victor Ortiz',
      company: 'Austin Chiropractic Center',
      phone: '+1 (512) 555-0220',
      email: 'victor@austinchiro.com',
      source_url: 'certapro.com/austin/commercial',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 71,
    factors: ['Commercial buyer', 'Asked about scheduling', 'After-hours required'],
    tags: ['Commercial', 'Healthcare', 'After-hours'],
    first_touch_source: 'Commercial painting page form',
    first_seen: 'm:500',
    hubspot_id: 'HS-39269',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: '$16k range',
      timeline: 'Between Q3 and Q4',
      need: 'Interior repaint — chiropractic clinic, 2,800 sqft',
      decisionMaker: 'Yes — owner',
      reasoning: 'Healthcare commercial fit. After-hours scheduling required. Engaged.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · commercial painting page form', timestamp: 'm:500' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Victor — commercial clinic repaint is our specialty. Do you need after-hours scheduling to avoid disrupting patients?", timestamp: 'm:495' },
      { id: 't3', role: 'prospect', type: 'text', content: "Yes, definitely need after hours. How does that affect the quote?", timestamp: 'm:480' },
    ],
  },
  {
    id: 'l-rachel-moore',
    created_at: 'm:620',
    last_activity_at: 'm:600',
    prospect: {
      name: 'Rachel Moore',
      company: 'Westover Hills homeowner',
      phone: '+1 (512) 555-0221',
      email: 'rachel.moore.wh@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'chat',
    method: 'other',
    status: 'ai-handling',
    score: 68,
    factors: ['Chat engaged', 'Asking about color consult', 'Homeowner'],
    tags: ['Residential', 'Westover Hills', 'Interior'],
    first_touch_source: 'Interior painting page chat widget',
    first_seen: 'm:620',
    hubspot_id: 'HS-39270',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: 'Exploring — ~$10k',
      timeline: 'Fall',
      need: 'Interior repaint — master + living areas, 1,900 sqft',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Engaged chat lead. Exploring budget range. Color consult likely next step.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Chat widget opened · /interior', timestamp: 'm:620' },
      { id: 't2', role: 'prospect', type: 'text', content: "Do you offer a color consultation before committing to a full repaint?", timestamp: 'm:618' },
      { id: 't3', role: 'ai', type: 'text', content: "Yes — we offer a free 30-min in-home consultation. Want me to send a slot?", timestamp: 'm:615' },
      { id: 't4', role: 'prospect', type: 'text', content: "Yes, but can you also send some before/after photos first?", timestamp: 'm:600' },
    ],
  },
  {
    id: 'l-ethan-brown',
    created_at: 'm:930',
    last_activity_at: 'm:900',
    prospect: {
      name: 'Ethan Brown',
      company: 'Steiner Ranch homeowner',
      phone: '+1 (512) 555-0222',
      email: 'ethan.brown.sr@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'chat',
    method: 'other',
    status: 'ai-handling',
    score: 73,
    factors: ['Large lot', 'Actively engaged', 'Comparing quotes'],
    tags: ['Residential', 'Steiner Ranch', 'Exterior'],
    first_touch_source: 'Exterior painting page chat widget',
    first_seen: 'm:930',
    hubspot_id: 'HS-39271',
    calendly_event_id: null,
    scheduled_at: 'Fri, Jun 12 · 2:00 PM CT',
    scheduled_when: 11520,
    location: 'Steiner Ranch, Austin (in-home)',
    suggested_next_action: null,
    scorecard: {
      budget: '~$25k range',
      timeline: 'Before fall',
      need: 'Full exterior — large two-story in Steiner Ranch',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Large project, comparing bids. Strong engagement. Close likely if price is competitive.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Chat widget opened · /exterior', timestamp: 'm:930' },
      { id: 't2', role: 'prospect', type: 'text', content: "Steiner Ranch full exterior, two-story, probably 3,500 sqft of surface. Getting a few quotes.", timestamp: 'm:928' },
      { id: 't3', role: 'ai', type: 'text', content: "For that size in Steiner Ranch we typically bid $22–28k. Sending a detailed breakdown with warranty terms.", timestamp: 'm:925' },
      { id: 't4', role: 'prospect', type: 'text', content: "Good range. What's the crew size and typical timeline?", timestamp: 'm:900' },
    ],
  },
  {
    id: 'l-naomi-clark',
    created_at: 'm:1220',
    last_activity_at: 'm:1200',
    prospect: {
      name: 'Naomi Clark',
      company: 'Bryker Woods homeowner',
      phone: '+1 (512) 555-0223',
      email: 'naomi.clark.bw@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'ai-handling',
    score: 77,
    factors: ['High engagement', 'Budget confirmed', 'Quick timeline'],
    tags: ['Residential', 'Bryker Woods', 'Interior'],
    first_touch_source: 'Inbound — phone tree, option 1',
    first_seen: 'm:1220',
    hubspot_id: 'HS-39272',
    calendly_event_id: null,
    scheduled_at: 'Thu, Jun 11 · 10:00 AM CT',
    scheduled_when: 8640,
    location: 'Bryker Woods, Austin (in-home)',
    suggested_next_action: null,
    scorecard: {
      budget: '$13k confirmed',
      timeline: 'Wants to start within 2 weeks',
      need: 'Interior repaint — 2,400 sqft Bryker Woods bungalow',
      decisionMaker: 'Yes — homeowner',
      reasoning: 'Fast-close candidate. Budget confirmed, urgent timeline. Near-booking stage.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · AI qualified on call', timestamp: 'm:1220' },
      { id: 't2', role: 'ai', type: 'text', content: "Naomi — confirming $13k interior for your Bryker Woods bungalow. Can we get you in this week for a quick walkthrough?", timestamp: 'm:1215' },
      { id: 't3', role: 'prospect', type: 'text', content: "Yes, sooner the better. What days does Matthew have open?", timestamp: 'm:1200' },
    ],
  },
  {
    id: 'l-lucas-white',
    created_at: 'm:1620',
    last_activity_at: 'm:1600',
    prospect: {
      name: 'Lucas White',
      company: 'Oak Hill homeowner',
      phone: '+1 (512) 555-0224',
      email: 'lucas.white.oakhill@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'form',
    method: 'sms',
    status: 'ai-handling',
    score: 65,
    factors: ['Back-and-forth engaged', 'Timeline uncertain', 'Exploring options'],
    tags: ['Residential', 'Oak Hill', 'Exterior'],
    first_touch_source: 'Exterior painting page form',
    first_seen: 'm:1620',
    hubspot_id: 'HS-39273',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: 'Not yet defined',
      timeline: 'Exploring — maybe fall',
      need: 'Exterior repaint — Oak Hill ranch-style, 2,200 sqft',
      decisionMaker: 'Couple — both need to agree',
      reasoning: 'Engaged but early stage. Couple decision, timeline uncertain. Nurturing.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · exterior painting page form', timestamp: 'm:1620' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Lucas — for an Oak Hill exterior that size, most customers come in around $14–18k. Does that fit the range you had in mind?", timestamp: 'm:1615' },
      { id: 't3', role: 'prospect', type: 'text', content: "Hmm, higher than expected. My wife and I will discuss — can you send some examples?", timestamp: 'm:1600' },
    ],
  },

  // Live call — 1 new
  {
    id: 'l-rebecca-martinez',
    created_at: 'm:5',
    last_activity_at: 'm:2',
    prospect: {
      name: 'Rebecca Martinez',
      company: 'Sunset Ridge homeowner',
      phone: '+1 (512) 555-0225',
      email: 'rebecca.martinez@gmail.com',
      source_url: 'certapro.com/austin',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'ai-handling',
    score: 80,
    callOutcome: 'live',
    factors: ['On the phone now', 'Large scope indicated'],
    tags: ['Residential', 'Sunset Ridge', 'Live'],
    first_touch_source: 'Home page phone tap',
    first_seen: 'm:5',
    hubspot_id: 'HS-39274',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Live call in progress. Scope and budget being captured now.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · AI active — qualifying now', timestamp: 'm:2' },
    ],
  },

  // Needs review — 2 new
  {
    id: 'l-jason-lee',
    created_at: 'm:870',
    last_activity_at: 'm:850',
    prospect: {
      name: 'Jason Lee',
      company: 'Lakewood Hills homeowner',
      phone: '+1 (512) 555-0226',
      email: 'jason.lee.lh@gmail.com',
      source_url: 'certapro.com/austin/commercial',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'human-handling',
    score: 72,
    factors: ['Complex scope', 'Needs custom SOW', 'Multiple properties'],
    tags: ['Commercial', 'Multi-property'],
    first_touch_source: 'Inbound — phone tree, option 2',
    first_seen: 'm:870',
    hubspot_id: 'HS-39275',
    calendly_event_id: null,
    suggested_next_action: {
      type: 'send-followup',
      summary: 'Send custom SOW template for multi-property portfolio',
      payload: 'Hi Jason — following up on the portfolio conversation. I can draft a multi-property SOW if you share the address list.',
    },
    scorecard: {
      budget: '$60k+ anticipated',
      timeline: 'Staggered across Q4',
      need: 'Exterior repaint across 5 rental properties',
      decisionMaker: 'Owner — managing 5 properties',
      reasoning: 'High-value multi-property scope. Custom SOW needed. Escalated for owner review.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · option 2 (commercial)', timestamp: 'm:870' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Jason — circling back on the 5-property portfolio. Want me to draft a master SOW?", timestamp: 'm:860' },
      { id: 't3', role: 'prospect', type: 'text', content: "Yes — but I need each property priced separately so I can phase the spend.", timestamp: 'm:855' },
      { id: 't4', role: 'system', type: 'system', content: 'AI paused for owner review · multi-property custom pricing', timestamp: 'm:850' },
    ],
  },
  {
    id: 'l-michelle-huang',
    created_at: 'm:3300',
    last_activity_at: 'm:3200',
    prospect: {
      name: 'Michelle Huang',
      company: 'Tarrytown Business Center',
      phone: '+1 (512) 555-0227',
      email: 'michelle@tarrytownbiz.com',
      source_url: 'certapro.com/austin/commercial',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'human-handling',
    score: 76,
    factors: ['Commercial complex', 'Budget ambiguous', 'Needs custom quote'],
    tags: ['Commercial', 'Office', 'Complex'],
    first_touch_source: 'Inbound — phone tree, option 2',
    first_seen: 'm:3300',
    hubspot_id: 'HS-39276',
    calendly_event_id: null,
    suggested_next_action: {
      type: 'call-back',
      summary: 'Call Michelle back — she left a detailed voicemail about a 6-suite office complex',
      payload: 'Hi Michelle — got your message about the Tarrytown Business Center. Free for a 15-min call today to walk through the scope?',
    },
    scorecard: {
      budget: 'Facilities-approved — exact amount TBD',
      timeline: 'Before tenant renewals in Q4',
      need: 'Common area + 6 suites repaint — commercial complex',
      decisionMaker: 'Property manager — owner approval needed',
      reasoning: 'Solid commercial opportunity. Owner approval gate and ambiguous budget keep it in review.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · voicemail captured', timestamp: 'm:3300' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Michelle — thanks for the voicemail. Before I send pricing, can you confirm the total sqft for common areas plus the 6 suites?", timestamp: 'm:3280' },
      { id: 't3', role: 'prospect', type: 'text', content: "About 14,000 sqft total. But I need owner sign-off on the final number.", timestamp: 'm:3250' },
      { id: 't4', role: 'system', type: 'system', content: 'AI paused for owner review · owner approval required', timestamp: 'm:3200' },
    ],
  },

  // Disqualified — 4 new
  {
    id: 'l-steven-park',
    created_at: 'm:5100',
    last_activity_at: 'm:5000',
    prospect: {
      name: 'Steven Park',
      company: 'North Austin apartment renter',
      phone: '+1 (512) 555-0228',
      email: 'steven.park.atx@gmail.com',
      source_url: 'certapro.com/austin',
    },
    channel: 'form',
    method: 'sms',
    status: 'opted-out',
    score: 28,
    factors: ['Renter — no owner authority'],
    tags: ['Renter', 'Out of ICP'],
    first_touch_source: 'Home page form',
    first_seen: 'm:5100',
    hubspot_id: 'HS-39277',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Renter without landlord authorization. Auto-disqualified.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · home page form', timestamp: 'm:5100' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Steven — is this for a home you own or rent?", timestamp: 'm:5080' },
      { id: 't3', role: 'prospect', type: 'text', content: "Renting — wondering if landlord would let me paint.", timestamp: 'm:5020' },
      { id: 't4', role: 'system', type: 'system', content: 'Auto-disqualified · renter without owner approval', timestamp: 'm:5000' },
    ],
  },
  {
    id: 'l-amanda-foster',
    created_at: 'm:7100',
    last_activity_at: 'm:7000',
    prospect: {
      name: 'Amanda Foster',
      company: 'Kyle homeowner',
      phone: '+1 (512) 555-0229',
      email: 'amanda.foster.kyle@gmail.com',
      source_url: 'certapro.com/austin',
    },
    channel: 'form',
    method: 'sms',
    status: 'opted-out',
    score: 35,
    factors: ['Outside primary service area', 'Small project'],
    tags: ['Out of service area', 'Kyle'],
    first_touch_source: 'Home page form',
    first_seen: 'm:7100',
    hubspot_id: 'HS-39278',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Kyle address is outside primary Austin service radius. Referred to CertaPro San Marcos.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · home page form', timestamp: 'm:7100' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Amanda — what area is the property in?", timestamp: 'm:7080' },
      { id: 't3', role: 'prospect', type: 'text', content: "Kyle, just south of 150.", timestamp: 'm:7040' },
      { id: 't4', role: 'system', type: 'system', content: 'Auto-disqualified · outside service area — referred to San Marcos franchise', timestamp: 'm:7000' },
    ],
  },
  {
    id: 'l-daniel-kim',
    created_at: 'm:10200',
    last_activity_at: 'm:10000',
    prospect: {
      name: 'Daniel Kim',
      company: 'San Marcos homeowner',
      phone: '+1 (512) 555-0230',
      email: 'daniel.kim.sm@gmail.com',
      source_url: 'certapro.com/austin',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'opted-out',
    score: 30,
    factors: ['Outside service area', 'Budget below minimum'],
    tags: ['Out of service area', 'San Marcos'],
    first_touch_source: 'Home page phone tap',
    first_seen: 'm:10200',
    hubspot_id: 'HS-39279',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'San Marcos address and sub-$3k budget. Outside service area and minimum project size.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · AI qualified', timestamp: 'm:10200' },
      { id: 't2', role: 'system', type: 'system', content: 'Auto-disqualified · outside service area', timestamp: 'm:10000' },
    ],
  },
  {
    id: 'l-laura-simmons',
    created_at: 'm:15200',
    last_activity_at: 'm:15000',
    prospect: {
      name: 'Laura Simmons',
      company: 'South Congress homeowner',
      phone: '+1 (512) 555-0231',
      email: 'laura.simmons.soco@gmail.com',
      source_url: 'certapro.com/austin/interior',
    },
    channel: 'form',
    method: 'sms',
    status: 'opted-out',
    score: 22,
    factors: ['DIY project only', 'Not looking for contractor'],
    tags: ['DIY', 'Out of ICP'],
    first_touch_source: 'Interior painting page form',
    first_seen: 'm:15200',
    hubspot_id: 'HS-39280',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Lead is doing it themselves — just wanted paint brand recommendations. Not a contractor buyer.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · interior painting page form', timestamp: 'm:15200' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Laura — is this for a contractor quote or are you looking for paint brand recommendations?", timestamp: 'm:15180' },
      { id: 't3', role: 'prospect', type: 'text', content: "DIY — just wanted your paint brand recs actually.", timestamp: 'm:15100' },
      { id: 't4', role: 'system', type: 'system', content: 'Auto-disqualified · DIY only, not seeking contractor services', timestamp: 'm:15000' },
    ],
  },

  // Closed won — 1 new
  {
    id: 'l-brian-thompson',
    created_at: 'm:8200',
    last_activity_at: 'm:8000',
    prospect: {
      name: 'Brian Thompson',
      company: 'Meridian Office Complex',
      phone: '+1 (512) 555-0232',
      email: 'brian@meridianoffice.com',
      source_url: 'certapro.com/austin/commercial',
    },
    channel: 'form',
    method: 'sms',
    status: 'resolved',
    score: 78,
    factors: ['Signed contract', 'Project scheduled'],
    tags: ['Commercial', 'Office', 'Won'],
    first_touch_source: 'Commercial painting page form',
    first_seen: 'm:8200',
    hubspot_id: 'HS-39281',
    calendly_event_id: 'cal_bt01',
    suggested_next_action: null,
    scorecard: { reasoning: 'Won — commercial office repaint. Contract signed, crew scheduled.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Project won · contract signed, moved to scheduling', timestamp: 'm:8000' },
    ],
  },

  // Closed lost — 1 new
  {
    id: 'l-grace-patterson',
    created_at: 'm:20500',
    last_activity_at: 'm:20000',
    prospect: {
      name: 'Grace Patterson',
      company: 'West Lake Hills homeowner',
      phone: '+1 (512) 555-0233',
      email: 'grace.patterson.wlh@gmail.com',
      source_url: 'certapro.com/austin/exterior',
    },
    channel: 'inbound-call',
    method: 'call',
    status: 'opted-out',
    score: 45,
    factors: ['Chose competitor', 'Price-sensitive'],
    tags: ['Residential', 'West Lake Hills', 'Lost'],
    first_touch_source: 'Home page phone tap',
    first_seen: 'm:20500',
    hubspot_id: 'HS-39282',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: { reasoning: 'Lost to lower-price competitor. Left on nurture list for future projects.' },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · AI qualified', timestamp: 'm:20500' },
      { id: 't2', role: 'prospect', type: 'text', content: "Thanks for the quote — going with another company this time. Bit lower price.", timestamp: 'm:20050' },
      { id: 't3', role: 'system', type: 'system', content: 'Closed lost · chose competitor on price · added to long-term nurture', timestamp: 'm:20000' },
    ],
  },
];
