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

export type Channel = 'form' | 'inbound-call' | 'missed-call' | 'chat' | 'cold-followup';

export type Status =
  | 'in-conversation'
  | 'hot'
  | 'escalated'
  | 'booked'
  | 'disqualified'
  | 'closed';

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
  if (msg.type === 'call') {
    return leadChannel === 'missed-call' ? 'voicemail' : 'call';
  }
  // type === 'text' — infer from how the lead arrived.
  if (leadChannel === 'chat') return 'chat';
  if (leadChannel === 'form' || leadChannel === 'cold-followup') return 'email';
  // missed-call / inbound-call default to SMS for fast follow-up.
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
  status: Status;
  /** 0-100 qualification score. */
  score: number;
  factors: string[];
  transcript: Message[];
  scorecard: Scorecard;
  suggested_next_action?: SuggestedNextAction | null;
  hubspot_id: string;
  calendly_event_id: string | null;
  tags: string[];
  /** Landing-page name or form label captured at first touch. */
  first_touch_source: string;
  /** Stable relative offset for "first seen" display. */
  first_seen: string;
}

// ─── Channel + status display metadata ──────────────────────────────

export const CHANNEL_LABELS: Record<Channel, string> = {
  form: 'Form',
  'inbound-call': 'Inbound Call',
  'missed-call': 'Missed Call',
  chat: 'Chat',
  'cold-followup': 'Cold Followup',
};

export interface StatusStyle {
  label: string;
  tone: StatusPillTone;
}

export const STATUS_STYLES: Record<Status, StatusStyle> = {
  'in-conversation': {
    label: 'In conversation',
    tone: 'neutral',
  },
  hot: {
    label: 'Hot',
    tone: 'danger',
  },
  escalated: {
    label: 'Escalated',
    tone: 'warning',
  },
  booked: {
    label: 'Booked',
    tone: 'success',
  },
  disqualified: {
    label: 'Disqualified',
    tone: 'neutral',
  },
  closed: {
    label: 'Closed',
    tone: 'neutral',
  },
};

export const ALL_STATUSES: Status[] = [
  'in-conversation',
  'hot',
  'escalated',
  'booked',
  'disqualified',
  'closed',
];

export const ALL_CHANNELS: Channel[] = [
  'form',
  'inbound-call',
  'missed-call',
  'chat',
  'cold-followup',
];

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

// ─── Mock leads ─────────────────────────────────────────────────────
//
// 14 leads spanning all 7 statuses (with at least 2 escalated). Channels
// are mixed; scores spread 30-95. Two leads include a call-transcript
// turn ("morgan-lee" inbound-call, "casey-park" missed-call follow-up).

export const LEADS: Lead[] = [
  {
    id: 'l-aria-chen',
    created_at: 'm:30',
    last_activity_at: 'm:3',
    prospect: {
      name: 'Aria Chen',
      company: 'Wildflower Ridge HOA',
      phone: '+1 (512) 555-0148',
      email: 'aria.chen@wildflowerridge.org',
      source_url: 'certapro.com/austin/hoa?utm_campaign=hoa-spring',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    },
    channel: 'form',
    status: 'hot',
    score: 92,
    factors: ['Explicit budget', 'Board chair has authority', 'Q3 deadline'],
    tags: ['HOA', 'Round Rock', 'Hot lead 24h'],
    first_touch_source: 'HOA painting landing page',
    first_seen: 'm:30',
    hubspot_id: 'HS-39201',
    calendly_event_id: null,
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
    status: 'escalated',
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
    status: 'in-conversation',
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
    channel: 'missed-call',
    status: 'escalated',
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
    channel: 'cold-followup',
    status: 'in-conversation',
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
    status: 'in-conversation',
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
    status: 'in-conversation',
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
    status: 'booked',
    score: 88,
    factors: ['Booked walkthrough', 'Confirmed budget', 'Sole decision-maker'],
    tags: ['Residential', 'Westlake', 'Full-house interior'],
    first_touch_source: 'Inbound — phone tree, option 1',
    first_seen: 'm:240',
    hubspot_id: 'HS-39201',
    calendly_event_id: 'cal_8z2k',
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
    channel: 'cold-followup',
    status: 'disqualified',
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
    status: 'closed',
    score: 70,
    factors: ['Signed last quarter', 'Project complete'],
    tags: ['Commercial', 'Healthcare', 'Won'],
    first_touch_source: 'Commercial painting page form',
    first_seen: 'm:43200',
    hubspot_id: 'HS-35001',
    calendly_event_id: 'cal_9aa1',
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
    status: 'hot',
    score: 89,
    factors: ['Highly engaged chat', 'Property owner', 'Q3 deadline confirmed'],
    tags: ['Commercial', 'Office', 'Owner buyer'],
    first_touch_source: 'Office painting page chat widget',
    first_seen: 'm:120',
    hubspot_id: 'HS-39243',
    calendly_event_id: null,
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
    status: 'in-conversation',
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
    channel: 'missed-call',
    status: 'closed',
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
    status: 'in-conversation',
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
];
