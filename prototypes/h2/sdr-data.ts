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
      company: 'Northbeam Labs',
      phone: '+1 (415) 555-0148',
      email: 'aria.chen@northbeamlabs.com',
      source_url: 'radianthealth.co/b2b/wellness-benefits?utm_campaign=mid-market',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
    },
    channel: 'form',
    status: 'hot',
    score: 92,
    factors: ['Explicit budget', 'Owner has authority', 'Q3 deadline'],
    tags: ['B2B SaaS', 'Mid-market', 'Hot lead 24h'],
    first_touch_source: 'B2B wellness benefits landing page',
    first_seen: 'm:30',
    hubspot_id: 'HS-39201',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: '$50–80k confirmed',
      timeline: 'Decide by end of month',
      need: 'Replacing HubSpot; needs better email',
      decisionMaker: 'Yes — VP Sales',
      custom: { 'Team size': '8 SDRs' },
      reasoning:
        'Strong fit — explicit budget, owner has authority, timeline this quarter.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Lead captured · B2B wellness benefits page',
        timestamp: 'm:30',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Hi Aria — thanks for reaching out about Radiant Health's team plan. I see you mentioned an 8-person SDR team and Q3 rollout. Quick question to point you to the right pricing: are you replacing an existing benefit like Calm or starting from scratch?",
        timestamp: 'm:29',
      },
      {
        id: 't3',
        role: 'prospect',
        type: 'text',
        content:
          "We're replacing HubSpot's wellness add-on — turned out to be a glorified PDF library. Budget's $50–80k for the year.",
        timestamp: 'm:25',
      },
      {
        id: 't4',
        role: 'ai',
        type: 'text',
        content:
          "Got it — that's well within our team tier. Two of our closest analogues (Atlas Bio, ~10 SDRs) saw 32% benefit-utilization in the first quarter. Are you the final approver, or is there a partner I should loop in?",
        timestamp: 'm:24',
      },
      {
        id: 't5',
        role: 'prospect',
        type: 'text',
        content:
          "I'm the VP Sales — I sign. We need to decide by end of month though, our renewal with HubSpot is up.",
        timestamp: 'm:14',
      },
      {
        id: 't6',
        role: 'ai',
        type: 'text',
        content:
          "Perfect — that gives us plenty of room. I'll send a Calendly link for a 15-minute fit call with our team lead, Renée. She can walk through the rollout and confirm pricing live. Tuesday or Thursday work better?",
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
      company: 'Vellum Retail',
      phone: '+1 (628) 555-0193',
      email: 'm.lee@vellumretail.com',
      source_url: 'radianthealth.co/enterprise',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80',
    },
    channel: 'inbound-call',
    status: 'escalated',
    score: 78,
    factors: ['Strong intent', 'No timeline yet', 'Needs custom contract'],
    tags: ['Enterprise', 'Retail', 'Procurement gate'],
    first_touch_source: 'Inbound — phone tree, option 2',
    first_seen: 'm:180',
    hubspot_id: 'HS-39188',
    calendly_event_id: null,
    suggested_next_action: {
      type: 'send-followup',
      summary: 'Send personalized follow-up: discount offer for Q3 signing',
      payload:
        'Hi Morgan — circling back on our call. To make the timing work for your procurement review, I can lock in 12% off if you sign by Q3 close. Want me to draft the SOW?',
    },
    scorecard: {
      budget: 'Confidential — VP-level approval',
      timeline: 'Tentatively Q4',
      need: 'Wellness layer for 1,200-person retail org',
      decisionMaker: 'Needs CFO sign-off',
      custom: { 'Team size': '1,200 retail staff', 'Region': 'EMEA + NA' },
      reasoning:
        'High intent, large potential ACV, but timeline ambiguity and procurement gate keep this from being a clean Hot.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Inbound call · option 2 (sales)',
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
            { speaker: 'Caller', line: "Hi, I'm calling about your enterprise wellness package — saw it on the radianthealth website." },
            { speaker: 'AI', line: "Hi! Happy to help. Before we dive in — are you looking at this for your own team or evaluating for a client?" },
            { speaker: 'Caller', line: "For our retail org. We're about 1,200 people across NA and EMEA." },
            { speaker: 'AI', line: "Great scale — we have a few clients in that range. Quick question: is this replacing an existing program, or net-new?" },
            { speaker: 'Caller', line: "Replacing. The current vendor's reporting is a nightmare and renewal's coming up." },
            { speaker: 'AI', line: "Got it. When does that renewal land — and is there a budget envelope we should fit?" },
            { speaker: 'Caller', line: "Probably Q4. Budget I can't share over the phone, but it's VP-approved." },
            { speaker: 'AI', line: "Understood. Let me get you on with our enterprise lead, Renée — she can walk through the EMEA-specific compliance side and pricing under NDA. Can I have her email you a slot picker?" },
            { speaker: 'Caller', line: "Yes please. m.lee@vellumretail.com." },
            { speaker: 'AI', line: "Confirmed. She'll follow up within the hour." },
          ],
        },
        timestamp: 'm:179',
      },
      {
        id: 't3',
        role: 'system',
        type: 'system',
        content: 'Escalated to owner · enterprise rules-engine triggered',
        timestamp: 'm:178',
      },
      {
        id: 't4',
        role: 'ai',
        type: 'text',
        content:
          'Following up by email — Morgan, thanks for the call earlier. As mentioned, Renée will send a slot picker shortly. In the meantime, attached is our enterprise security overview.',
        timestamp: 'm:170',
      },
      {
        id: 't5',
        role: 'prospect',
        type: 'text',
        content:
          "Thanks. Quick clarifying question: do you have a separate price for EMEA-only deployment? Procurement is asking.",
        timestamp: 'm:90',
      },
      {
        id: 't6',
        role: 'ai',
        type: 'text',
        content:
          "Yes — we offer regional carveouts. EMEA-only typically lands 18-22% below the global package. Want me to send a quick term sheet, or wait for the full call with Renée?",
        timestamp: 'm:88',
      },
      {
        id: 't7',
        role: 'prospect',
        type: 'text',
        content: "Term sheet would help — I want to share it with the CFO ahead of the call.",
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
      company: 'The Long Bench',
      phone: '+1 (310) 555-0167',
      email: 'priya@thelongbench.studio',
      source_url: 'radianthealth.co/small-teams',
    },
    channel: 'chat',
    status: 'in-conversation',
    score: 71,
    factors: ['Engaged via widget', 'Small team', 'Likely fast-close'],
    tags: ['SMB', 'Creative agency', 'Founder-led'],
    first_touch_source: 'Pricing page chat widget',
    first_seen: 'm:60',
    hubspot_id: 'HS-39214',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: '$8–15k/yr ballpark',
      timeline: 'Within 2 weeks',
      need: 'Affordable wellness for 6-person studio',
      decisionMaker: 'Yes — founder',
      custom: { 'Team size': '6 designers' },
      reasoning:
        'Fits the SMB starter tier cleanly. Founder is the buyer and timeline is fast.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Chat widget opened · /pricing',
        timestamp: 'm:60',
      },
      {
        id: 't2',
        role: 'prospect',
        type: 'text',
        content: "Hi! Do you have something for really small teams? We're 6 designers.",
        timestamp: 'm:59',
      },
      {
        id: 't3',
        role: 'ai',
        type: 'text',
        content:
          "Hi Priya — absolutely. Our Studio plan starts at $125/seat/month for teams under 10. Includes the full app, monthly group coaching, and the supplement allowance. Curious what's driving the search — burnout, retention, something else?",
        timestamp: 'm:58',
      },
      {
        id: 't4',
        role: 'prospect',
        type: 'text',
        content: "Burnout and we're losing people to bigger studios with better benefits. Need something quickly.",
        timestamp: 'm:55',
      },
      {
        id: 't5',
        role: 'ai',
        type: 'text',
        content:
          "Hear you. Two of our small-studio clients (Pelt, Foursquare-Sigma) cited the supplement allowance as the thing the team actually noticed. Are you the final say on benefits decisions?",
        timestamp: 'm:54',
      },
      {
        id: 't6',
        role: 'prospect',
        type: 'text',
        content: "Yes — I'm the founder. Can we start in the next two weeks?",
        timestamp: 'm:48',
      },
      {
        id: 't7',
        role: 'ai',
        type: 'text',
        content:
          "Yes — Studio plan deploys in 5 business days once paperwork's signed. Want me to send a sample agreement and a Calendly for a 15-min onboarding walkthrough?",
        timestamp: 'm:47',
      },
      {
        id: 't8',
        role: 'prospect',
        type: 'text',
        content: "Yes please. And include the supplement-allowance details for our accountant.",
        timestamp: 'm:25',
      },
      {
        id: 't9',
        role: 'ai',
        type: 'text',
        content:
          "On it — sample agreement + supplement-allowance memo coming through in a moment. I'll also drop a slot picker.",
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
      company: 'Meridian Data',
      phone: '+1 (212) 555-0142',
      email: 'casey@meridiandata.io',
      source_url: 'radianthealth.co/landing/data-teams',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
    },
    channel: 'missed-call',
    status: 'escalated',
    score: 84,
    factors: ['High-intent missed call', 'Decision-maker confirmed', 'Budget signaled'],
    tags: ['Mid-market', 'Data infra', 'Founder buyer'],
    first_touch_source: 'Landing page — Data Teams',
    first_seen: 'm:300',
    hubspot_id: 'HS-39167',
    calendly_event_id: null,
    suggested_next_action: {
      type: 'call-back',
      summary: 'Call Casey back at the number on file — voicemail mentioned a Q3 timeline',
      payload:
        "Casey — sorry we missed you. Just listened to your voicemail. Free this afternoon or tomorrow morning to chat through your Q3 rollout?",
    },
    scorecard: {
      budget: '$30k confirmed range',
      timeline: 'Q3 rollout',
      need: 'Replacing fragmented PTO + wellness perks',
      decisionMaker: 'Founder/CEO',
      custom: { 'Team size': '24 engineers' },
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
            { speaker: 'Caller', line: "Hey, this is Casey Park, founder at Meridian Data. We're looking at wellness benefits for our team of 24 engineers — saw your data-teams landing page." },
            { speaker: 'Caller', line: "Budget's around $30k for the year, and we want to roll something out by Q3. Call me back at this number — happy to chat." },
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
          "Hi Casey — caught your voicemail and want to make sure you talk to the right person. Quick text: are you free this afternoon (3-5pm ET) or tomorrow morning for a 15-min call?",
        timestamp: 'm:295',
      },
      {
        id: 't5',
        role: 'prospect',
        type: 'text',
        content: "Tomorrow AM works. 9:30 ET?",
        timestamp: 'm:120',
      },
      {
        id: 't6',
        role: 'ai',
        type: 'text',
        content: "9:30 AM ET locked in. Sending a calendar invite now from renee@radianthealth.co.",
        timestamp: 'm:119',
        medium: 'email',
      },
      {
        id: 't7',
        role: 'prospect',
        type: 'text',
        content: "Great. One more thing — can you send the data-teams case study before the call?",
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
      company: 'Bracken & Co',
      phone: '+1 (917) 555-0118',
      email: 'jfitz@brackenco.com',
      source_url: 'radianthealth.co/blog/burnout-q2-report',
    },
    channel: 'cold-followup',
    status: 'in-conversation',
    score: 58,
    factors: ['Re-engaged after cold drip', 'No budget yet', 'Exploratory'],
    tags: ['SMB', 'Marketing agency'],
    first_touch_source: 'Burnout Q2 report — gated download',
    first_seen: 'm:60000',
    hubspot_id: 'HS-37102',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: 'Not yet defined',
      timeline: 'Exploring for early next year',
      need: 'Lightweight team wellness',
      decisionMaker: 'Co-founder pair — both approve',
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
          "Jordan — sharing the Q2 burnout report you downloaded back in November. Has anything shifted on the wellness front for Bracken?",
        timestamp: 'm:119',
      },
      {
        id: 't3',
        role: 'prospect',
        type: 'text',
        content: "Actually yes — we lost two people to burnout last quarter. Reading this now.",
        timestamp: 'm:90',
      },
      {
        id: 't4',
        role: 'ai',
        type: 'text',
        content:
          "Sorry to hear that. The report's section on 30/60/90 interventions might be the most useful starting point — page 14. Curious where Bracken is on benefits today.",
        timestamp: 'm:89',
      },
      {
        id: 't5',
        role: 'prospect',
        type: 'text',
        content: "Bare minimum — health insurance and PTO. Wellness is something we keep talking about but never act on.",
        timestamp: 'm:80',
      },
      {
        id: 't6',
        role: 'ai',
        type: 'text',
        content:
          "Common pattern. Most teams your size start with a one-month pilot — low commitment, you can see what the team actually uses. Want me to share what that looks like?",
        timestamp: 'm:79',
      },
      {
        id: 't7',
        role: 'prospect',
        type: 'text',
        content: "Yes, send the pilot details — and CC my co-founder, Mara.",
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
      company: 'Arbor Agency',
      phone: '+1 (646) 555-0144',
      email: 'sasha.bell@arboragency.com',
      source_url: 'radianthealth.co/teams',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80',
    },
    channel: 'form',
    status: 'in-conversation',
    score: 64,
    factors: ['Form submitted minutes ago', 'No reply yet'],
    tags: ['SMB', 'Media agency'],
    first_touch_source: 'Teams pricing page form',
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
        content: 'Lead captured · Teams pricing page form',
        timestamp: 'm:30',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Hi Sasha — thanks for the inquiry. To send the right info, are you exploring this for your own team or a client?",
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
      company: 'Helmsman Labs',
      phone: '+1 (404) 555-0181',
      email: 'noah@helmsmanlabs.com',
      source_url: 'radianthealth.co/case-studies/atlas-bio',
    },
    channel: 'chat',
    status: 'in-conversation',
    score: 76,
    factors: ['Browsed case studies', 'Owner buyer', 'Asked for ROI numbers'],
    tags: ['B2B SaaS', 'Mid-market'],
    first_touch_source: 'Atlas Bio case study page',
    first_seen: 'm:90',
    hubspot_id: 'HS-39222',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: '$30–50k indicated',
      timeline: 'Next quarter',
      need: 'Wellness program with measurable retention impact',
      decisionMaker: 'Yes — head of people',
      reasoning:
        'Good fit. Wants concrete ROI numbers before committing to a call.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Chat widget opened · /case-studies/atlas-bio',
        timestamp: 'm:90',
      },
      {
        id: 't2',
        role: 'prospect',
        type: 'text',
        content: "Just read the Atlas Bio case study. The 32% utilization number — is that durable or did it drop off?",
        timestamp: 'm:89',
      },
      {
        id: 't3',
        role: 'ai',
        type: 'text',
        content:
          "Great question — at month 12, Atlas was at 29% (small dip from month 3's peak of 34%). Most clients stabilize in the 25-30% range. Anything specific you're trying to validate?",
        timestamp: 'm:88',
      },
      {
        id: 't4',
        role: 'prospect',
        type: 'text',
        content: "Retention. We lost 4 people in Q1 — exit interviews mentioned burnout. Trying to put a real program in place.",
        timestamp: 'm:80',
      },
      {
        id: 't5',
        role: 'ai',
        type: 'text',
        content:
          "Understood. Atlas measured a 19% drop in voluntary attrition between year-1 and year-2. Want me to share their full retention deck (anonymized)?",
        timestamp: 'm:78',
      },
      {
        id: 't6',
        role: 'prospect',
        type: 'text',
        content: "Yes, send it. Also need pricing for ~40 people.",
        timestamp: 'm:60',
      },
      {
        id: 't7',
        role: 'ai',
        type: 'text',
        content:
          "Sending now. For 40 it's $34k/year on the Studio Plus tier. I'll include a one-pager comparing tiers. Worth a 20-min call once you've reviewed?",
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
      company: 'Goldfinch Architects',
      phone: '+1 (503) 555-0179',
      email: 'emily@goldfincharchitects.com',
      source_url: 'radianthealth.co/pricing',
      avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80',
    },
    channel: 'inbound-call',
    status: 'booked',
    score: 88,
    factors: ['Booked discovery call', 'Confirmed budget', 'Sole decision-maker'],
    tags: ['SMB', 'Architecture firm', 'Founder buyer'],
    first_touch_source: 'Inbound — phone tree, option 1',
    first_seen: 'm:240',
    hubspot_id: 'HS-39201',
    calendly_event_id: 'cal_8z2k',
    suggested_next_action: null,
    scorecard: {
      budget: '$18k/yr confirmed',
      timeline: 'Start next month',
      need: 'Stress-management focused (deadline-heavy work)',
      decisionMaker: 'Yes — founder',
      custom: { 'Team size': '12 architects' },
      reasoning:
        'Already on the calendar with Renée. Strong signals across the board.',
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
          "Hi Emily — recapping our call: 12-person architecture firm, stress-management is the priority, $18k/year budget. Sending the discovery slot picker now.",
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
        content: 'Meeting booked · Thursday 11:00 AM PT with Renée Park',
        timestamp: 'm:159',
      },
      {
        id: 't5',
        role: 'ai',
        type: 'text',
        content:
          "Confirmed! Renée will send the agenda Wednesday afternoon. In the meantime, here's the stress-management module overview to skim.",
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
      company: 'Stagecraft Studio',
      phone: '+1 (415) 555-0192',
      email: 'd.wu@stagecraft.studio',
      source_url: 'radianthealth.co/teams',
    },
    channel: 'cold-followup',
    status: 'disqualified',
    score: 32,
    factors: ['Wrong company size', 'No budget'],
    tags: ['Freelancer', 'Out of ICP'],
    first_touch_source: 'Cold sequence · newsletter signup',
    first_seen: 'm:30000',
    hubspot_id: 'HS-36140',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      reasoning: 'Solo freelancer — not in our ICP. Politely disqualified.',
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
        content: "Hi David — Radiant Health helps small teams build wellness programs. How big is Stagecraft?",
        timestamp: 'm:399',
      },
      {
        id: 't3',
        role: 'prospect',
        type: 'text',
        content: "Just me — I freelance.",
        timestamp: 'm:300',
      },
      {
        id: 't4',
        role: 'ai',
        type: 'text',
        content:
          "Appreciate the reply! We're built for teams 5+. For solo practitioners, our newsletter and free resources are likely a better fit — you'll stay on the list.",
        timestamp: 'm:299',
      },
      {
        id: 't5',
        role: 'system',
        type: 'system',
        content: 'Auto-disqualified · solo freelancer outside ICP',
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
      company: 'Oakwise Health',
      phone: '+1 (212) 555-0136',
      email: 'talia@oakwise.health',
      source_url: 'radianthealth.co/partners',
      avatarUrl: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=120&q=80',
    },
    channel: 'form',
    status: 'closed',
    score: 70,
    factors: ['Partnered with us last quarter', 'Deal closed'],
    tags: ['Partner', 'Won'],
    first_touch_source: 'Partners page form',
    first_seen: 'm:43200',
    hubspot_id: 'HS-35001',
    calendly_event_id: 'cal_9aa1',
    suggested_next_action: null,
    scorecard: {
      reasoning: 'Won — moved to onboarding. Closed in the AI Receptionist view.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Deal won · moved to onboarding queue',
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
      company: 'Waypoint Bio',
      phone: '+1 (415) 555-0118',
      email: 'rohan@waypointbio.com',
      source_url: 'radianthealth.co/teams',
    },
    channel: 'chat',
    status: 'hot',
    score: 89,
    factors: ['Highly engaged chat', 'Owner', 'Q3 deadline confirmed'],
    tags: ['Mid-market', 'Biotech', 'Owner buyer'],
    first_touch_source: 'Pricing page chat widget',
    first_seen: 'm:120',
    hubspot_id: 'HS-39243',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      budget: '$45k confirmed',
      timeline: 'Sign by end of Q3',
      need: 'Replacing legacy EAP for 18-person bio lab',
      decisionMaker: 'Yes — founder/CEO',
      custom: { 'Team size': '18 scientists + ops' },
      reasoning:
        'Strong fit and high engagement velocity. Founder buyer, confirmed budget, fast timeline.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Chat widget opened · /teams',
        timestamp: 'm:120',
      },
      {
        id: 't2',
        role: 'prospect',
        type: 'text',
        content: "Need to replace our EAP — current vendor is barely used. 18 people, biotech lab.",
        timestamp: 'm:119',
      },
      {
        id: 't3',
        role: 'ai',
        type: 'text',
        content:
          "Got it — EAP underutilization is the #1 complaint we hear. Most clients see 3-4× the engagement on our platform. Are you the buyer here?",
        timestamp: 'm:118',
      },
      {
        id: 't4',
        role: 'prospect',
        type: 'text',
        content: "Founder/CEO, yes. Budget around $45k. Want to sign before Q3 close.",
        timestamp: 'm:115',
      },
      {
        id: 't5',
        role: 'ai',
        type: 'text',
        content:
          "Perfect — that's clean fit for the Studio Plus tier. Sending a calendar link for a 20-min walkthrough with Renée. Tomorrow morning work?",
        timestamp: 'm:114',
      },
      {
        id: 't6',
        role: 'prospect',
        type: 'text',
        content: "Yes. 10am PT ideal.",
        timestamp: 'm:101',
      },
      {
        id: 't7',
        role: 'system',
        type: 'system',
        content: 'Calendar invite sent · 10:00 AM PT with Renée Park',
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
      company: 'Cintra Services',
      phone: '+44 20 7946 0511',
      email: 'helena@cintraservices.uk',
      source_url: 'radianthealth.co/uk',
    },
    channel: 'form',
    status: 'in-conversation',
    score: 49,
    factors: ['UK-based', 'No clear timeline'],
    tags: ['UK', 'Services'],
    first_touch_source: 'UK landing page form',
    first_seen: 'm:60',
    hubspot_id: 'HS-39238',
    calendly_event_id: null,
    suggested_next_action: null,
    scorecard: {
      reasoning:
        'New UK lead — qualification pending. Services vertical typically takes longer to close.',
    },
    transcript: [
      {
        id: 't1',
        role: 'system',
        type: 'system',
        content: 'Lead captured · UK landing page form',
        timestamp: 'm:60',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Hi Helena — thanks for reaching out. Just to send the right info, are you exploring this for the UK office only, or across multiple regions?",
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
      company: 'Hammerlane Studio',
      phone: '+1 (646) 555-0102',
      email: 'felix@hammerlane.studio',
      source_url: 'radianthealth.co/studios',
    },
    channel: 'missed-call',
    status: 'closed',
    score: 41,
    factors: ['No reply after voicemail', 'Cooled off'],
    tags: ['SMB', 'Creative'],
    first_touch_source: 'Studios landing page',
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
        content: "Hi Felix — just missed your call. Free anytime today to chat?",
        timestamp: 'm:355',
      },
      {
        id: 't3',
        role: 'ai',
        type: 'text',
        content: "Following up — happy to share a 1-pager if a call's not convenient.",
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
      company: 'Brightline Fund',
      phone: '+1 (415) 555-0177',
      email: 'mia@brightline.fund',
      source_url: 'radianthealth.co/teams',
      avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&q=80',
    },
    channel: 'form',
    status: 'in-conversation',
    score: 73,
    factors: ['VC fund — fast buyer profile', 'Engaged immediately'],
    tags: ['VC', 'Small team'],
    first_touch_source: 'Teams pricing page form',
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
        content: 'Lead captured · Teams pricing page form',
        timestamp: 'm:20',
      },
      {
        id: 't2',
        role: 'ai',
        type: 'text',
        content:
          "Hi Mia — thanks for filling out the form. Quick question to point you at the right plan: how many people are at Brightline today?",
        timestamp: 'm:18',
      },
    ],
  },
];
