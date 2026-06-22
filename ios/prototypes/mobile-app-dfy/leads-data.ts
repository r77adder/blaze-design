// Mobile-app Receptionist tab data. Mirrors the H2 prototype's Lead/Message shape
// (see prototypes/h2/sdr-data.ts) but trimmed for a mobile prototype and re-using
// iOS color tokens. Transcripts are short on purpose so the conversation view
// renders in a single mobile scroll.

import type { ContentStatusVariant } from '@ios/components';

export type Channel = 'form' | 'inbound-call' | 'missed-call' | 'chat' | 'cold-followup';

/** Simplified four-state lifecycle for any lead/conversation. Mirrors the
 *  latest PR35 (`claude/modest-raman-17172f` head) status set:
 *   - ai-handling:    the AI assistant is actively managing the conversation
 *   - human-handling: escalated to or being driven by a team member
 *   - resolved:       the conversation reached a successful close (e.g. booked)
 *   - opted-out:      the prospect declined, was disqualified, or stopped engaging
 */
export type Status =
  | 'ai-handling'
  | 'human-handling'
  | 'resolved'
  | 'opted-out';

export type MessageRole = 'ai' | 'prospect' | 'system' | 'owner';
export type MessageType = 'text' | 'call' | 'system';
export type MessageMedium = 'email' | 'sms' | 'chat' | 'call' | 'voicemail';

export interface CallTurn { speaker: string; line: string }

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  call?: { duration: string; turns: CallTurn[] };
  timestamp: string;
  medium?: MessageMedium;
}

/** Booking lifecycle outcome — mirrors PR55's BookingOutcome. When unset the
 *  effective value is derived from `scheduled_when` (future = scheduled,
 *  past = completed); set it to pin an explicit override. */
export type BookingOutcome =
  | 'scheduled'
  | 'completed'
  | 'estimate-sent'
  | 'won'
  | 'job-done'
  | 'no-show'
  | 'canceled'
  | 'lost';

export interface Booking {
  id: string;
  title: string;
  /** Human label, e.g. "Thursday, Jun 5 · 2:00 PM CT" */
  when: string;
  /** Who from the team will attend */
  host: string;
  /** Minutes from "now" — positive = upcoming, negative or zero = past.
   *  Mirrors PR35's `scheduled_when` field on Lead. Drives the
   *  Upcoming / Past split + sort order on the Bookings tab. */
  scheduled_when?: number;
  /** Manual outcome override. When null/undefined, effectiveBookingOutcome()
   *  derives one from scheduled_when. */
  outcome?: BookingOutcome | null;
}

export interface PassedOn {
  id: string;
  /** Why the AI passed this to a human (one sentence). */
  reason: string;
  /** Stable relative offset for display. */
  timestamp: string;
  /** Optional follow-up draft the AI prepared. */
  draft?: string;
}

export interface Lead {
  id: string;
  last_activity_at: string;
  prospect: {
    name: string;
    company: string;
    phone: string;
    email: string;
    avatarUrl?: string;
  };
  channel: Channel;
  status: Status;
  /** Call activity signal surfaced as a pill in the AI Handling inbox group:
   *  'live' = a call is in progress right now; 'successful' = a call just
   *  completed successfully. Only meaningful when status === 'ai-handling'. */
  callOutcome?: 'live' | 'successful';
  /** Short, hand-authored "what's needed" phrase shown as the third line in
   *  the inbox row (in place of a raw transcript snippet). Sentence case,
   *  ≤ ~8 words. Mirrors PR35's `LEAD_NEEDS_SUMMARY` map. */
  needs_summary: string;
  /** Longer 1–2 sentence recap shown in the prominent blue Summary card at
   *  the top of the conversation thread (PR55). Falls back to needs_summary
   *  via conversationSummary() when absent. */
  conversation_summary?: string;
  score: number;
  transcript: Message[];
  bookings: Booking[];
  passed_on: PassedOn[];
  tags: string[];
}

// ─── Display metadata ────────────────────────────────────────────────────────

export const CHANNEL_LABELS: Record<Channel, string> = {
  form: 'Form',
  'inbound-call': 'Inbound call',
  'missed-call': 'Missed call',
  chat: 'Chat',
  'cold-followup': 'Cold follow-up',
};

export const MEDIUM_LABELS: Record<MessageMedium, string> = {
  email: 'Email',
  sms: 'SMS',
  chat: 'Chat',
  call: 'Call',
  voicemail: 'Voicemail',
};

/** Map an SDR status to (a) the closest iOS ContentStatusPill variant for color
 *  and (b) the label shown on the pill. Custom labels are passed via the pill's
 *  `label` prop so we stay inside the blaze design system. */
export interface StatusStyle {
  variant: ContentStatusVariant;
  label: string;
}

// Map each PR35 status to (a) the closest iOS ContentStatusPill variant for
// color and (b) the label PR35 shows on the pill. Custom labels are passed
// via the pill's `label` prop so we stay inside the blaze design system.
//   tone 'info'    → posting (blue)
//   tone 'warning' → review (orange)
//   tone 'success' → approved (green)
//   tone 'neutral' → draft (grey)
export const STATUS_STYLES: Record<Status, StatusStyle> = {
  'ai-handling':    { variant: 'posting',  label: 'AI Handling' },
  'human-handling': { variant: 'review',   label: 'Needs Attention' },
  'resolved':       { variant: 'approved', label: 'Resolved' },
  'opted-out':      { variant: 'draft',    label: 'Opted Out' },
};

/** Ordered by what surfaces first for the user — human work first, then
 *  in-flight AI work, then terminal states. Same order drives the inbox
 *  grouping and the dashboard "Lead status snapshot" rows on PR35. */
export const ALL_STATUSES: Status[] = [
  'human-handling',
  'ai-handling',
  'resolved',
  'opted-out',
];

// ─── Booking outcome (PR55) ──────────────────────────────────────────────────

/** Booking outcome → iOS ContentStatusPill variant + label. Mirrors PR55's
 *  BOOKING_OUTCOME_STYLES, mapped to the blaze iOS pill palette. */
export const BOOKING_OUTCOME_STYLES: Record<BookingOutcome, StatusStyle> = {
  scheduled:       { variant: 'posting',  label: 'Scheduled' },
  completed:       { variant: 'posting',  label: 'Met' },
  'estimate-sent': { variant: 'review',   label: 'Estimate sent' },
  won:             { variant: 'approved', label: 'Won' },
  'job-done':      { variant: 'posted',   label: 'Job done' },
  'no-show':       { variant: 'review',   label: 'No-show' },
  canceled:        { variant: 'draft',    label: 'Canceled' },
  lost:            { variant: 'failed',   label: 'Lost' },
};

/** Funnel order: happy path first, then the closed-early exits. Drives the
 *  in-thread booking outcome dropdown. */
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

/** Time-derived outcome when none is pinned: future appointment = scheduled,
 *  past = completed. */
export function autoBookingOutcome(booking: Booking): BookingOutcome {
  return (booking.scheduled_when ?? 0) > 0 ? 'scheduled' : 'completed';
}

/** The outcome to display: manual override if set, else time-derived. */
export function effectiveBookingOutcome(booking: Booking): BookingOutcome {
  return booking.outcome ?? autoBookingOutcome(booking);
}

// ─── Conversation summary (PR55) ─────────────────────────────────────────────

/** Summary shown in the prominent blue card at the top of the conversation
 *  thread. Prefers the bespoke recap, falls back to the inbox needs_summary
 *  so every thread shows something. */
export function conversationSummary(lead: Lead): string {
  return lead.conversation_summary ?? lead.needs_summary;
}

// ─── Time helpers ────────────────────────────────────────────────────────────

/** "m:<minutes-ago>" → "3m" / "2h" / "1d". */
export function formatRelative(stamp: string): string {
  const m = stamp.match(/^m:(\d+)$/);
  if (!m) return stamp;
  const mins = parseInt(m[1], 10);
  if (mins < 60) return `${mins}m`;
  if (mins < 24 * 60) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / (24 * 60))}d`;
}

/** Returned minutes for sorting; lower = newer. */
export function relativeMinutes(stamp: string): number {
  const m = stamp.match(/^m:(\d+)$/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

export function defaultMedium(msg: Message, leadChannel: Channel): MessageMedium | null {
  if (msg.type === 'system') return null;
  if (msg.type === 'call') return leadChannel === 'missed-call' ? 'voicemail' : 'call';
  if (leadChannel === 'chat') return 'chat';
  if (leadChannel === 'form' || leadChannel === 'cold-followup') return 'email';
  return 'sms';
}

// ─── Sample leads (8, spanning every status + channel) ───────────────────────

export const LEADS: Lead[] = [
  {
    id: 'l-aria-chen',
    last_activity_at: 'm:3',
    prospect: {
      name: 'Aria Chen',
      company: 'Wildflower Ridge HOA',
      phone: '+1 (512) 555-0148',
      email: 'aria.chen@wildflowerridge.org',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    },
    channel: 'form',
    status: 'ai-handling',
    score: 92,
    needs_summary: 'Sent Calendly link — awaiting slot pick',
    conversation_summary: "Aria, the Wildflower Ridge HOA board chair, wants a full exterior repaint of all 14 buildings (~$140–180k) wrapped before September. Over email and a call she settled on Repose Gray with white trim, confirmed the 7-year warranty and per-building pricing, and the AI booked a Thursday walkthrough with Matthew — now awaiting her slot pick.",
    tags: ['HOA', 'Round Rock', 'Hot 24h'],
    transcript: [
      { id: 't1',  role: 'system',   type: 'system', content: 'Lead captured · HOA painting landing page', timestamp: 'm:240' },
      { id: 't2',  role: 'ai',       type: 'text',   medium: 'email', content: "Hi Aria — thanks for reaching out about your Wildflower Ridge HOA project. I see you mentioned 14 buildings and a Q3 timeline. Quick question to scope the bid: are you looking at a full exterior repaint, or trim and accent only?", timestamp: 'm:239' },
      { id: 't3',  role: 'prospect', type: 'text',   medium: 'email', content: "Full exterior — siding, trim, doors. The board approved a $140–180k envelope. Last contractor missed timeline so we're switching.", timestamp: 'm:235' },
      { id: 't4',  role: 'ai',       type: 'text',   medium: 'email', content: "Got it — that's well within our HOA pricing band. Our crew finished a similar 14-building project in Cedar Park last year, on schedule and within $5k of the bid.", timestamp: 'm:234' },
      { id: 't5',  role: 'ai',       type: 'text',   medium: 'email', content: "Are you the final approver, or is there a board partner I should loop in? And do you have a color palette nailed down, or is that still open?", timestamp: 'm:234' },
      { id: 't6',  role: 'prospect', type: 'text',   medium: 'email', content: "I'm the board chair — I sign. Colors are open. Last vote we were leaning Sherwin-Williams Repose Gray for siding, white trim, dark accents on doors.", timestamp: 'm:230' },
      { id: 't7',  role: 'prospect', type: 'text',   medium: 'email', content: "We need to decide by end of month though — painting needs to wrap before September. Roof contractor coming after us.", timestamp: 'm:230' },
      { id: 't8',  role: 'ai',       type: 'text',   medium: 'email', content: "Perfect — Repose Gray with bright white trim is our most-requested HOA combo this year, so we have all the supplies in stock. That gives us plenty of room to start mid-July.", timestamp: 'm:229' },
      { id: 't9',  role: 'system',   type: 'system', content: 'Prospect viewed Cedar Park case study · 4m on page', timestamp: 'm:225' },
      { id: 't10', role: 'prospect', type: 'text',   medium: 'email', content: "Reviewed the Cedar Park case study — looks great. What's your warranty? Last contractor only gave us 2 years.", timestamp: 'm:221' },
      { id: 't11', role: 'ai',       type: 'text',   medium: 'email', content: "Our standard HOA package is a 7-year warranty on paint adhesion, primer included, and 2 years on labor. We can also add an annual touch-up visit at cost ($1,200/yr) if you want it bundled.", timestamp: 'm:220' },
      { id: 't12', role: 'prospect', type: 'text',   medium: 'email', content: "Annual touch-up sounds appealing. Can we walk the property together? I'd rather decide in person.", timestamp: 'm:180' },
      { id: 't13', role: 'ai',       type: 'text',   medium: 'email', content: "Absolutely — I'll set up a 30-minute walkthrough with Matthew, our VP of Residential. He can walk all 14 buildings, confirm condition, and lock the bid live. Tuesday or Thursday work better?", timestamp: 'm:179' },
      { id: 't14', role: 'prospect', type: 'text',   medium: 'email', content: "Thursday — but can we also do a quick call first? I'd like to talk through a couple board concerns.", timestamp: 'm:120' },
      {
        id: 't15', role: 'ai', type: 'call',
        content: 'Outbound call · 8m 22s',
        timestamp: 'm:110',
        call: {
          duration: '8m 22s',
          turns: [
            { speaker: 'AI', line: "Hi Aria — thanks for picking up. Wanted to walk you through the board concerns before Thursday." },
            { speaker: 'Aria', line: "Yeah — main thing is disruption. We've got 80+ units, some retirees who'd lose their morning patio time. How do you minimize that?" },
            { speaker: 'AI', line: "Two ways: we work building-by-building with 48-hour resident notices, and we cap crew hours at 8am–5pm. Patios get protected on the day-of." },
            { speaker: 'Aria', line: "OK that's reasonable. The other thing — what if a building takes longer than estimated?" },
            { speaker: 'AI', line: "We price by building, not by day. If weather or scope blows us past the per-building line, the overrun is on us. That's in the contract." },
            { speaker: 'Aria', line: "Good. I think the board will like that." },
            { speaker: 'AI', line: "Want me to draft a one-pager summarizing those terms before Thursday so you can pre-share with the board?" },
            { speaker: 'Aria', line: "Yes please. That would help a lot." },
          ],
        },
      },
      { id: 't16', role: 'system',   type: 'system', content: 'AI sent board one-pager · resident-disruption + per-building pricing', timestamp: 'm:108' },
      { id: 't17', role: 'prospect', type: 'text',   medium: 'email', content: "Got the one-pager. Forwarded to the board for pre-read. One more question — do you handle pressure washing before paint, or is that separate?", timestamp: 'm:90' },
      { id: 't18', role: 'ai',       type: 'text',   medium: 'email', content: "Pressure wash is included — happens day 1 of each building before any primer goes up. We also do trim repair (rotted boards, caulking) included up to 2% of bid value per building.", timestamp: 'm:89' },
      { id: 't19', role: 'prospect', type: 'text',   medium: 'email', content: "That covers everything I needed. Send the Thursday Calendly link.", timestamp: 'm:30' },
      { id: 't20', role: 'ai',       type: 'text',   medium: 'email', content: "Done — sent for Thursday at 2pm, 3pm, or 4pm. Matthew will bring color swatches and the per-building breakdown so you can sign on the spot if it all checks out.", timestamp: 'm:13' },
      { id: 't21', role: 'prospect', type: 'text',   medium: 'email', content: "Thursday afternoon would be ideal. Send the link!", timestamp: 'm:4' },
      { id: 't22', role: 'system',   type: 'system', content: 'AI sent Calendly link · awaiting slot pick', timestamp: 'm:3' },
    ],
    bookings: [],
    passed_on: [],
  },
  {
    id: 'l-morgan-lee',
    last_activity_at: 'm:14',
    prospect: {
      name: 'Morgan Lee',
      company: 'Hill Country Medical Group',
      phone: '+1 (512) 555-0193',
      email: 'm.lee@hillcountrymed.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    },
    channel: 'inbound-call',
    status: 'human-handling',
    score: 78,
    needs_summary: 'Send phased-rollout SOW to fit Q3/Q4',
    conversation_summary: "Morgan called about exterior work on four Hill Country Medical clinic locations by year-end. The AI proposed phasing the clinics across Q3 and Q4 at a locked-in price and escalated to the owner to draft the multi-site SOW after he asked to run it past his facilities director first.",
    tags: ['Commercial', 'Healthcare', 'Multi-site'],
    transcript: [
      { id: 't1', role: 'system',   type: 'system', content: 'Inbound call routed · phone tree option 2', timestamp: 'm:180' },
      {
        id: 't2', role: 'ai', type: 'call', content: 'Inbound call · 6m 12s',
        timestamp: 'm:170',
        call: {
          duration: '6m 12s',
          turns: [
            { speaker: 'AI', line: "Hill Country Medical — thanks for calling. What can I help with?" },
            { speaker: 'Morgan', line: "We've got four clinic locations we need exterior work on by year-end." },
            { speaker: 'AI', line: "Got it — phased rollout might fit better. Want me to draft a scope?" },
            { speaker: 'Morgan', line: "Yes, run it past our facilities director first." },
          ],
        },
      },
      { id: 't3', role: 'system', type: 'system', content: 'AI escalated to owner · multi-site, needs phased SOW', timestamp: 'm:168' },
      { id: 't4', role: 'ai', type: 'text', medium: 'email', content: "Hi Morgan — circling back. We can phase the four clinics across Q3 and Q4 with a locked-in price. Want me to draft the SOW?", timestamp: 'm:14' },
    ],
    bookings: [],
    passed_on: [
      { id: 'p1', reason: 'Multi-site commercial — needs phased SOW and facilities-director approval.', timestamp: 'm:168', draft: "Hi Morgan — circling back on our call. To fit your facilities review, we can phase the four clinics across Q3 and Q4 with a single locked-in price. Want me to draft the SOW?" },
    ],
  },
  {
    id: 'l-sara-lopez',
    last_activity_at: 'm:24',
    prospect: {
      name: 'Sara Lopez',
      company: 'Lopez Family · Cedar Park',
      phone: '+1 (512) 555-0177',
      email: 'sara.lopez@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
    },
    channel: 'chat',
    status: 'ai-handling',
    score: 71,
    needs_summary: 'Holding Wed–Fri slots — sending swatches',
    conversation_summary: "Sara wants her 30 oak kitchen cabinet doors refinished in sage (Evergreen Fog) with a white island and matching dishwasher panel, within two weeks. Across a long chat/SMS/email thread the AI covered hardware, low-VOC paint, nap-time scheduling, and the doors-offsite workflow, then booked a Wednesday 4 PM walkthrough with Sara Kim.",
    tags: ['Residential', 'Cabinet refinish'],
    transcript: [
      { id: 't01', role: 'system',   type: 'system', content: 'Chat opened · /pricing page', timestamp: 'm:1500' },
      { id: 't02', role: 'prospect', type: 'text', medium: 'chat', content: "Hi — looking to refinish my kitchen cabinets. Ballpark cost for 30 doors?", timestamp: 'm:1498' },
      { id: 't03', role: 'ai',       type: 'text', medium: 'chat', content: "Hi Sara — for 30 doors with primer + 2 coats we typically land between $4–6k. Are you thinking same color or a refresh?", timestamp: 'm:1497' },
      { id: 't04', role: 'prospect', type: 'text', medium: 'chat', content: "Refresh — maybe sage green. Need it done within 2 weeks if possible.", timestamp: 'm:1495' },
      { id: 't05', role: 'ai',       type: 'text', medium: 'chat', content: "Doable — sage is one of our most-requested 2026 colors. We've got Sherwin-Williams Evergreen Fog and Benjamin Moore Saybrook Sage in stock. Want me to send swatches to your address?", timestamp: 'm:1494' },
      { id: 't06', role: 'prospect', type: 'text', medium: 'chat', content: "Yes please. 4209 Cedar Park Drive, Austin TX 78759.", timestamp: 'm:1490' },
      { id: 't07', role: 'system',   type: 'system', content: 'AI mailed swatch packet · USPS Priority · ETA Wednesday', timestamp: 'm:1489' },
      { id: 't08', role: 'ai',       type: 'text', medium: 'chat', content: "Sent — they should arrive Wednesday. While you wait, quick scoping questions: are the cabinets currently painted or stained?", timestamp: 'm:1488' },
      { id: 't09', role: 'prospect', type: 'text', medium: 'chat', content: "Stained — original 90s oak. Pretty worn at the handles and a few water marks near the sink.", timestamp: 'm:1450' },
      { id: 't10', role: 'ai',       type: 'text', medium: 'chat', content: "Got it. Oak is our most common refinish substrate — we'll sand, prime with a stain-blocking primer, then 2 coats. The water-marked panels may need an extra primer pass; I'll flag during the walkthrough.", timestamp: 'm:1448' },
      { id: 't11', role: 'ai',       type: 'text', medium: 'chat', content: "Are you replacing hardware too, or keeping the existing pulls?", timestamp: 'm:1448' },
      { id: 't12', role: 'prospect', type: 'text', medium: 'chat', content: "Replacing — going brushed brass. I can buy them, but do you install?", timestamp: 'm:1380' },
      { id: 't13', role: 'ai',       type: 'text', medium: 'chat', content: "Yes — installation is included for any hardware you supply. We re-drill where needed; new pulls within ±2\" of existing holes mean no extra patching. Wider than that, we patch + spot-prime + spot-paint (add $20/door for that case).", timestamp: 'm:1379' },
      { id: 't14', role: 'prospect', type: 'text', medium: 'chat', content: "These are 5\" pulls and the existing are 3\". So that adds up.", timestamp: 'm:1350' },
      { id: 't15', role: 'ai',       type: 'text', medium: 'chat', content: "30 doors × $20 = $600 on top of the base. Still in the $4.6–6.6k range overall. We can also offer a 3\" → 3.75\" upgrade pulls we have in-house that don't need patching — drops that $600.", timestamp: 'm:1349' },
      { id: 't16', role: 'prospect', type: 'text', medium: 'chat', content: "Hmm. Let me think about the hardware. What about cabinet boxes — same paint or different?", timestamp: 'm:900' },
      { id: 't17', role: 'ai',       type: 'text', medium: 'chat', content: "Most clients go same color throughout — feels seamless. A growing minority do the island a contrast color (we've done deep navy + white perimeter, charcoal + warm white, etc.). Both options included in base price.", timestamp: 'm:899' },
      { id: 't18', role: 'prospect', type: 'text', medium: 'chat', content: "We have an island. Maybe sage everywhere is too much. What if island is white?", timestamp: 'm:880' },
      { id: 't19', role: 'ai',       type: 'text', medium: 'chat', content: "Classic combo. Sage perimeter + white island reads modern-cottage. Want me to add a mockup to the swatch packet? I can render a preview from your kitchen photos.", timestamp: 'm:879' },
      { id: 't20', role: 'prospect', type: 'text', medium: 'chat', content: "Yes! How do I send photos?", timestamp: 'm:870' },
      { id: 't21', role: 'ai',       type: 'text', medium: 'chat', content: "Easiest: text them to 512-555-0001 (our intake line). Wide shots + close-ups of any damaged spots. I'll handle the rest.", timestamp: 'm:870' },
      { id: 't22', role: 'system',   type: 'system', content: 'Prospect texted 12 photos · routed to design queue', timestamp: 'm:720' },
      { id: 't23', role: 'ai',       type: 'text', medium: 'sms', content: "Got the photos — kitchen looks great. Going to render the sage + white island mockup now. ETA tomorrow morning.", timestamp: 'm:719' },
      { id: 't24', role: 'prospect', type: 'text', medium: 'sms', content: "Sounds good. One more thing — we have 2 dogs and a toddler. Are the paints low-VOC?", timestamp: 'm:710' },
      { id: 't25', role: 'ai',       type: 'text', medium: 'sms', content: "Yes — Sherwin Emerald Urethane Trim Enamel, GreenGuard Gold certified. Safe for occupied homes. Strong dry time so you can use the kitchen the morning after we wrap each section.", timestamp: 'm:709' },
      { id: 't26', role: 'prospect', type: 'text', medium: 'sms', content: "Perfect. How loud is the work? Toddler naps 12-2.", timestamp: 'm:700' },
      { id: 't27', role: 'ai',       type: 'text', medium: 'sms', content: "We can schedule the loud parts (sanding) for 8am-12 and quiet work (priming, painting) 1-5. Just flag your toddler's nap window when we lock the schedule.", timestamp: 'm:699' },
      { id: 't28', role: 'system',   type: 'system', content: 'Mockup rendered · sent via email + SMS', timestamp: 'm:480' },
      { id: 't29', role: 'ai',       type: 'text', medium: 'email', content: "Mockup attached — sage perimeter (Sherwin Evergreen Fog) + white island (Pure White). Two angles so you can see how it reads from the entryway and from the breakfast nook.", timestamp: 'm:479' },
      { id: 't30', role: 'prospect', type: 'text', medium: 'email', content: "Oh wow. I love it. Husband loves it. We want to move forward.", timestamp: 'm:420' },
      { id: 't31', role: 'ai',       type: 'text', medium: 'email', content: "Wonderful. Two things to lock in: (1) which sage — Evergreen Fog or Saybrook Sage when swatches arrive Wednesday, (2) walkthrough date for a precise quote. I'm holding Wed-Fri next week.", timestamp: 'm:419' },
      { id: 't32', role: 'prospect', type: 'text', medium: 'email', content: "Wednesday late afternoon works. What time?", timestamp: 'm:410' },
      { id: 't33', role: 'ai',       type: 'text', medium: 'email', content: "Sara — Sara Kim, our estimator, can do Wednesday at 3 or 4pm. Walkthrough takes about 45 minutes; she'll measure every door, confirm hardware plan, and you'll have a locked bid by end of visit.", timestamp: 'm:409' },
      { id: 't34', role: 'prospect', type: 'text', medium: 'email', content: "4pm please. Should I be prepared to put a deposit down at the walkthrough?", timestamp: 'm:400' },
      { id: 't35', role: 'ai',       type: 'text', medium: 'email', content: "Standard is 25% deposit to schedule, balance on completion. If you decide on the spot, Sara can take the deposit via card or check. No pressure — most folks take 24-48hrs to confirm with their spouse.", timestamp: 'm:399' },
      { id: 't36', role: 'prospect', type: 'text', medium: 'email', content: "We're aligned — pretty sure we'll go for it. One more question — warranty?", timestamp: 'm:380' },
      { id: 't37', role: 'ai',       type: 'text', medium: 'email', content: "5-year warranty on paint adhesion, 2-year on labor (re-paint anything that peels or yellows). Annual touch-up visit available at $400/yr if you want it bundled.", timestamp: 'm:379' },
      { id: 't38', role: 'prospect', type: 'text', medium: 'email', content: "We'll skip the annual for now. Anything else I should know?", timestamp: 'm:370' },
      { id: 't39', role: 'ai',       type: 'text', medium: 'email', content: "Two preparation tips: empty cabinet contents into boxes by walkthrough day, and let us know if you have any custom finishes or glazes — those bump the spec.", timestamp: 'm:369' },
      { id: 't40', role: 'prospect', type: 'text', medium: 'email', content: "No glazes, just standard stain. I'll have the cabinets cleared.", timestamp: 'm:360' },
      {
        id: 't41', role: 'ai', type: 'call',
        content: 'Outbound call · 4m 38s',
        timestamp: 'm:300',
        call: {
          duration: '4m 38s',
          turns: [
            { speaker: 'AI', line: "Hi Sara — quick courtesy call before your Wednesday walkthrough. Got a minute?" },
            { speaker: 'Sara', line: "Sure!" },
            { speaker: 'AI', line: "Two things — (1) confirming 4pm Wed at 4209 Cedar Park Drive, (2) Sara Kim will bring the physical swatches + a sample door panel painted in both sage options so you can decide live." },
            { speaker: 'Sara', line: "Perfect. Should I have my husband home?" },
            { speaker: 'AI', line: "Helpful but not required — most decisions get made in 1-2 days post-walkthrough anyway. If he's home it just speeds the deposit step." },
            { speaker: 'Sara', line: "He's home Wed afternoons. We'll both be there." },
            { speaker: 'AI', line: "Excellent. See you Wednesday at 4." },
          ],
        },
      },
      { id: 't42', role: 'system',   type: 'system', content: 'Call summary saved · Wed 4pm confirmed', timestamp: 'm:298' },
      { id: 't43', role: 'prospect', type: 'text', medium: 'chat', content: "By the way — should we tape off the walls or do you handle that?", timestamp: 'm:240' },
      { id: 't44', role: 'ai',       type: 'text', medium: 'chat', content: "We handle all masking — drop cloths, plastic sheeting, blue tape on walls/floors/appliances. Your job is just to clear the cabinet interiors.", timestamp: 'm:239' },
      { id: 't45', role: 'prospect', type: 'text', medium: 'chat', content: "Easy. We should be good. Any tips for the dogs?", timestamp: 'm:230' },
      { id: 't46', role: 'ai',       type: 'text', medium: 'chat', content: "Two options: gate them off to a far room, or board them for the loud days (1-2 max). Doors come off and get sprayed in our shop, so half the project is offsite. Less disruption than you'd think.", timestamp: 'm:229' },
      { id: 't47', role: 'prospect', type: 'text', medium: 'chat', content: "Wait — the doors leave?", timestamp: 'm:220' },
      { id: 't48', role: 'ai',       type: 'text', medium: 'chat', content: "Yes, standard practice for cabinet refinishing. Doors come off Day 1, go to our spray booth for primer + finish (3 days), come back Day 4 with handles installed. Boxes are painted on-site in the meantime.", timestamp: 'm:219' },
      { id: 't49', role: 'prospect', type: 'text', medium: 'chat', content: "Smart. So 4 days total in our kitchen?", timestamp: 'm:210' },
      { id: 't50', role: 'ai',       type: 'text', medium: 'chat', content: "Typically — Day 1 prep + remove + on-site boxes start, Days 2-3 boxes get primer + coats, Day 4 doors back + hardware install. You can use kitchen partially throughout (no upper cabinets, but counters/sink/stove all fine).", timestamp: 'm:209' },
      { id: 't51', role: 'prospect', type: 'text', medium: 'chat', content: "What about the dishwasher?", timestamp: 'm:200' },
      { id: 't52', role: 'ai',       type: 'text', medium: 'chat', content: "Dishwasher panel comes off too if it's wood and you want it painted. If it's stainless or you keep it stained, no touch.", timestamp: 'm:199' },
      { id: 't53', role: 'prospect', type: 'text', medium: 'chat', content: "Wood — we want it sage too. OK we're really in.", timestamp: 'm:180' },
      { id: 't54', role: 'ai',       type: 'text', medium: 'chat', content: "Great. Adding 1 dishwasher panel — no additional cost (we bundle it with the cabinet count).", timestamp: 'm:179' },
      { id: 't55', role: 'system',   type: 'system', content: 'Swatch packet delivered · USPS tracking 9434 6122 …', timestamp: 'm:60' },
      { id: 't56', role: 'prospect', type: 'text', medium: 'chat', content: "Swatches arrived! Holding them up to the wall now. Evergreen Fog reads better in our light than Saybrook.", timestamp: 'm:55' },
      { id: 't57', role: 'ai',       type: 'text', medium: 'chat', content: "Evergreen Fog is the more popular choice in north-facing kitchens like yours — slightly cooler undertone, holds its color through midday light. Good pick.", timestamp: 'm:54' },
      { id: 't58', role: 'prospect', type: 'text', medium: 'chat', content: "Locked in. See you Wednesday at 4.", timestamp: 'm:40' },
      { id: 't59', role: 'ai',       type: 'text', medium: 'chat', content: "See you then! Sara Kim will text you 30 min before to confirm she's en route. Reach out anytime before then if anything comes up.", timestamp: 'm:30' },
      { id: 't60', role: 'prospect', type: 'text', medium: 'chat', content: "Will do. Thanks for being so thorough on this — first contractor experience that hasn't felt like a hassle.", timestamp: 'm:26' },
      { id: 't61', role: 'ai',       type: 'text', medium: 'chat', content: "That's the whole goal. Talk soon!", timestamp: 'm:24' },
    ],
    bookings: [],
    passed_on: [],
  },
  {
    id: 'l-emily-tran',
    last_activity_at: 'm:120',
    prospect: {
      name: 'Emily Tran',
      company: 'Tran Family · Pflugerville',
      phone: '+1 (512) 555-0156',
      email: 'emily.tran@outlook.com',
      avatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80',
    },
    channel: 'inbound-call',
    status: 'resolved',
    score: 88,
    needs_summary: 'Walkthrough booked Thursday at 11 AM',
    conversation_summary: "Emily called about a full repaint of her 2,200 sq ft Pflugerville home (~$8k budget) starting next month. The AI recapped the call by SMS and booked a Thursday 11 AM walkthrough with Matthew.",
    tags: ['Residential', 'Confirmed'],
    transcript: [
      { id: 't1', role: 'system',   type: 'system', content: 'Inbound call · 3m 41s · recap below', timestamp: 'm:130' },
      { id: 't2', role: 'ai',       type: 'text',   medium: 'sms', content: "Hi Emily — recapping your call: full repaint, 2200 sq ft, start next month, $8k budget. Calendar options coming.", timestamp: 'm:128' },
      { id: 't3', role: 'prospect', type: 'text',   medium: 'sms', content: "Thursday at 11 works.", timestamp: 'm:122' },
      { id: 't4', role: 'system',   type: 'system', content: 'Booking confirmed · Thursday 11:00 AM CT with Matthew', timestamp: 'm:120' },
    ],
    bookings: [
      { id: 'b1', title: 'Walkthrough — Tran residence', when: 'Thursday, Jun 5 · 11:00 AM CT', host: 'Matthew Tims (VP Residential)', scheduled_when: 180 },
    ],
    passed_on: [],
  },
  {
    id: 'l-david-park',
    last_activity_at: 'm:55',
    prospect: {
      // AI hasn't captured a name yet — fall back to the formatted phone
      // number (mirrors iOS Phone's "Unknown caller" treatment).
      name: '(512) 555-0211',
      company: 'Missed call · unknown caller',
      phone: '+1 (512) 555-0211',
      email: '',
    },
    channel: 'missed-call',
    status: 'ai-handling',
    score: 64,
    needs_summary: 'Got scope via SMS — sending pricing',
    conversation_summary: "An unknown caller left a voicemail about exteriors-only pricing for a 5-unit apartment block, needed this week. The AI followed up by SMS, captured the scope, and is preparing pricing.",
    tags: ['Commercial', 'Property mgmt'],
    transcript: [
      { id: 't1', role: 'system',   type: 'system', content: 'Missed call · voicemail received', timestamp: 'm:60' },
      { id: 't2', role: 'ai',       type: 'text',   medium: 'sms', content: "Hi David — sorry we missed you. I'm Blaze, the AI receptionist for CertaPro. What property are you looking to quote?", timestamp: 'm:58' },
      { id: 't3', role: 'prospect', type: 'text',   medium: 'sms', content: "5-unit apartment block, exteriors only, need pricing this week.", timestamp: 'm:55' },
    ],
    bookings: [],
    passed_on: [],
  },
  {
    id: 'l-priya-shah',
    last_activity_at: 'm:240',
    prospect: {
      name: 'Priya Shah',
      company: 'Shah Family · Westlake',
      phone: '+1 (512) 555-0222',
      email: 'priya.s@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&q=80',
    },
    channel: 'form',
    status: 'resolved',
    score: 86,
    needs_summary: 'Walkthrough booked Tuesday at 2 PM',
    conversation_summary: "Priya submitted a quote request for an exterior-only repaint of her 4-bedroom Westlake home. The AI offered walkthrough slots and booked Tuesday 2 PM with Sara Kim.",
    tags: ['Residential', 'Walkthrough set'],
    transcript: [
      { id: 't1', role: 'system',   type: 'system', content: 'Form submitted · /quote', timestamp: 'm:300' },
      { id: 't2', role: 'ai',       type: 'text',   medium: 'email', content: "Hi Priya — thanks for the details. I see 4 bedrooms, exterior only. I'll send a few walkthrough slots for next week.", timestamp: 'm:295' },
      { id: 't3', role: 'prospect', type: 'text',   medium: 'email', content: "Tuesday afternoon works.", timestamp: 'm:245' },
      { id: 't4', role: 'system',   type: 'system', content: 'Booking confirmed · Tuesday 2:00 PM CT', timestamp: 'm:240' },
    ],
    bookings: [
      { id: 'b0', title: 'Initial estimate — Shah residence', when: 'Friday, May 30 · 3:00 PM CT', host: 'Sara Kim (Estimator)', scheduled_when: -2880, outcome: 'estimate-sent' },
      { id: 'b1', title: 'Walkthrough — Shah residence', when: 'Tuesday, Jun 10 · 2:00 PM CT', host: 'Sara Kim (Estimator)', scheduled_when: 480 },
    ],
    passed_on: [],
  },
  {
    id: 'l-jake-ward',
    last_activity_at: 'm:1440',
    prospect: {
      name: 'Jake Ward',
      company: 'Renter · downtown',
      phone: '+1 (512) 555-0234',
      email: 'jake.w@gmail.com',
    },
    channel: 'chat',
    status: 'opted-out',
    score: 22,
    needs_summary: 'Disqualified — no landlord authorization',
    conversation_summary: "Jake asked for an interior paint quote on his downtown apartment but has no landlord authorization, so the AI disqualified the lead.",
    tags: ['Renter — no auth'],
    transcript: [
      { id: 't1', role: 'prospect', type: 'text', content: "Can I get an interior paint quote for my apartment?", timestamp: 'm:1445' },
      { id: 't2', role: 'ai',       type: 'text', content: "Hi Jake — most landlords need to authorize exterior changes. Do you have written approval from your landlord?", timestamp: 'm:1442' },
      { id: 't3', role: 'prospect', type: 'text', content: "No, I'd be doing it on my own.", timestamp: 'm:1441' },
      { id: 't4', role: 'system',   type: 'system', content: 'Disqualified · no landlord authorization', timestamp: 'm:1440' },
    ],
    bookings: [],
    passed_on: [],
  },
  {
    id: 'l-anna-rivera',
    last_activity_at: 'm:480',
    prospect: {
      name: 'Anna Rivera',
      company: 'Rivera Restaurant Group',
      phone: '+1 (512) 555-0255',
      email: 'anna@riverarestaurants.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    },
    channel: 'cold-followup',
    status: 'human-handling',
    score: 69,
    needs_summary: 'GM intro needed before pricing',
    conversation_summary: "Anna at Rivera Restaurant Group is interested in an exterior refresh across five locations, but timing is tight and she wants her GM Jamie looped in first. The AI escalated for a human warm intro before pricing.",
    tags: ['Commercial', 'Multi-location'],
    transcript: [
      { id: 't1', role: 'system',   type: 'system', content: 'Cold follow-up · industry list', timestamp: 'm:600' },
      { id: 't2', role: 'ai',       type: 'text',   medium: 'email', content: "Hi Anna — saw the new Rivera location opening on South Lamar. Want a quick exterior refresh quote for all 5 locations?", timestamp: 'm:595' },
      { id: 't3', role: 'prospect', type: 'text',   medium: 'email', content: "Interested but timing is tight. Can you talk to our GM Jamie?", timestamp: 'm:485' },
      { id: 't4', role: 'system',   type: 'system', content: 'AI escalated to owner · waiting on GM intro', timestamp: 'm:480' },
    ],
    bookings: [],
    passed_on: [
      { id: 'p1', reason: 'Restaurant group wants GM (Jamie) looped in before pricing — needs human warm intro.', timestamp: 'm:480' },
    ],
  },
  {
    // Live inbound call where the AI hasn't captured the caller's name yet.
    // Demonstrates the phone-number fallback in the inbox.
    id: 'l-unknown-call-0301',
    last_activity_at: 'm:2',
    prospect: {
      name: '(512) 555-0301',
      company: 'Inbound call · qualifying',
      phone: '+1 (512) 555-0301',
      email: '',
    },
    channel: 'inbound-call',
    status: 'ai-handling',
    callOutcome: 'live',
    score: 50,
    needs_summary: 'On call now — qualifying scope',
    conversation_summary: "A new caller is on the line right now asking for an exterior repaint quote for their house. The AI is qualifying square footage and timeline live.",
    tags: ['Inbound', 'Live'],
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · phone tree option 1', timestamp: 'm:3' },
      {
        id: 't2', role: 'ai', type: 'call', content: 'Live call',
        timestamp: 'm:2',
        call: {
          duration: 'in progress',
          turns: [
            { speaker: 'AI', line: "Thanks for calling — what can I help with today?" },
            { speaker: 'Caller', line: "I need a quote for repainting the outside of my house." },
            { speaker: 'AI', line: "Got it. Roughly how many sq ft, and do you have a target timeline?" },
          ],
        },
      },
    ],
    bookings: [],
    passed_on: [],
  },
];

export function getLead(id: string): Lead | undefined {
  return LEADS.find(l => l.id === id);
}

/** True when the lead's "name" field is actually a phone-number fallback —
 *  i.e. the AI hasn't captured a real name yet. Drives the avatar icon
 *  fallback so anonymous callers get a phone glyph instead of "(" as the
 *  initial. Treats anything starting with a non-letter (digit, +, parens)
 *  as anonymous. */
export function isAnonymousName(name: string): boolean {
  const ch = name.trim().charAt(0);
  return ch !== '' && !/[A-Za-z]/.test(ch);
}
