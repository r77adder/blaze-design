/**
 * SDR Settings — types, libraries, and defaults for the new Settings tab on
 * /h2/sdr. Mirrors the spec captured in the user's "AI SDR" doc:
 *
 * - Per channel: which outcomes the AI is allowed to drive toward, the
 *   reply-time SLA, an on/off master, and a follow-up flow.
 * - Connect-to-human is always an allowed outcome (locked, can't be
 *   removed) so the AI always has a graceful escape hatch.
 * - Scheduling provider picker (6 providers) — only one is "primary".
 * - Flow templates seed editable step sequences; once a user edits, the
 *   flow drifts off-template and we mark it Custom.
 */

import type { Channel } from './sdr-data';

// ── Outcomes ────────────────────────────────────────────────────────────────

export type OutcomeId =
  | 'book'
  | 'quote'
  | 'capture'
  | 'faq'
  | 'info'
  | 'human';

export interface Outcome {
  id: OutcomeId;
  label: string;
  description: string;
  /** True for outcomes that can't be removed from any channel — currently
   *  just 'human' (Connect to human expert). */
  locked?: boolean;
}

export const OUTCOMES: Outcome[] = [
  { id: 'book',    label: 'Book a meeting',     description: 'AI offers a scheduling link and confirms a time.' },
  { id: 'quote',   label: 'Quote a price',      description: 'AI surfaces a starting price or range.' },
  { id: 'capture', label: 'Capture lead info',  description: 'AI collects name, contact, intent, and routes to CRM.' },
  { id: 'faq',     label: 'Answer a question',  description: 'AI deflects with a FAQ answer when intent is informational.' },
  { id: 'info',    label: 'Send info / brochure', description: 'AI sends a one-pager, pricing sheet, or service menu.' },
  { id: 'human',   label: 'Connect to human expert', description: 'Always-on escape hatch — the AI hands off when asked or stuck.', locked: true },
];

// ── Scheduling providers ────────────────────────────────────────────────────

export type ProviderId = 'calendly' | 'cal' | 'hubspot' | 'acuity' | 'google' | 'microsoft';

export interface Provider {
  id: ProviderId;
  label: string;
  /** Letter shown in the colored tile when no real logo is loaded. */
  initial: string;
  /** Brand color for the tile. */
  color: string;
  description: string;
}

export const PROVIDERS: Provider[] = [
  { id: 'calendly',  label: 'Calendly',           initial: 'C', color: '#006bff', description: 'The default for most small teams. Round-robin and team links supported.' },
  { id: 'cal',       label: 'Cal.com',            initial: 'C', color: '#292929', description: 'Open-source alternative to Calendly. Self-hostable.' },
  { id: 'hubspot',   label: 'HubSpot Meetings',   initial: 'H', color: '#ff7a59', description: 'Built into HubSpot CRM. Best if your contacts already live there.' },
  { id: 'acuity',    label: 'Acuity Scheduling',  initial: 'A', color: '#000000', description: 'Service-business focused — intake forms, packages, classes.' },
  { id: 'google',    label: 'Google Calendar',    initial: 'G', color: '#4285f4', description: 'Direct calendar pick — no separate booking page.' },
  { id: 'microsoft', label: 'Microsoft Bookings', initial: 'M', color: '#0078d4', description: 'Microsoft 365 customers. Pulls staff and services from M365.' },
];

// ── Flow templates ─────────────────────────────────────────────────────────

export type FlowChannel = 'sms' | 'email';

export interface FlowStep {
  id: string;
  /** Delay before this step, expressed in a short readable form ("24h", "3d"). */
  delay: string;
  channel: FlowChannel;
  message: string;
}

export type FlowTemplateId = '3-touch' | 'single' | 'none' | 'custom';

export interface FlowTemplate {
  id: FlowTemplateId;
  label: string;
  /** Subtitle shown under the template name in the picker. */
  description: string;
  steps: FlowStep[];
}

const seedStep = (id: string, delay: string, channel: FlowChannel, message: string): FlowStep => ({
  id, delay, channel, message,
});

export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: '3-touch',
    label: '3-touch re-engagement',
    description: '24h → 72h → 7d. Default for forms and missed calls.',
    steps: [
      seedStep('s1', '24h', 'sms',   'Quick check-in — wanted to make sure you got the info you needed. Reply here if any questions.'),
      seedStep('s2', '72h', 'email', "Hi — circling back in case it slipped past. Happy to set up a time if it'd help."),
      seedStep('s3', '7d',  'email', 'Last note from us — leaving this here in case timing wasn\'t right. Always open if you want to revisit.'),
    ],
  },
  {
    id: 'single',
    label: 'Single nudge at 24h',
    description: 'One follow-up SMS, then stop.',
    steps: [
      seedStep('s1', '24h', 'sms', 'Wanted to follow up on your message. Anything I can help line up?'),
    ],
  },
  {
    id: 'none',
    label: 'None — single attempt',
    description: 'No follow-up. AI replies once and waits for the prospect.',
    steps: [],
  },
];

export const FLOW_TEMPLATE_BY_ID: Record<FlowTemplateId, FlowTemplate> = {
  '3-touch': FLOW_TEMPLATES[0],
  single:    FLOW_TEMPLATES[1],
  none:      FLOW_TEMPLATES[2],
  // Custom is a synthetic id used when a flow has drifted off-template;
  // it never has a canonical step set of its own.
  custom: { id: 'custom', label: 'Custom', description: 'Edited from a template.', steps: [] },
};

// ── Per-channel settings ───────────────────────────────────────────────────

export interface ChannelSettings {
  enabled: boolean;
  outcomes: Set<OutcomeId>;
  /** Free-form outcomes the user has added on top of the built-in library.
   *  Always treated as "selected" — adding one means the AI is allowed to
   *  drive that conversation toward it. Removing the chip drops it. */
  customOutcomes: string[];
  /** Reply within X seconds — the AI's response SLA for this channel. */
  slaSeconds: number;
  /** Currently-selected template; 'custom' means "edited off-template". */
  templateId: FlowTemplateId;
  flowSteps: FlowStep[];
}

const baseChannelSettings = (
  outcomes: OutcomeId[],
  slaSeconds: number,
  templateId: Exclude<FlowTemplateId, 'custom'>,
): ChannelSettings => ({
  enabled: true,
  outcomes: new Set<OutcomeId>([...outcomes, 'human']),
  customOutcomes: [],
  slaSeconds,
  templateId,
  // Deep-clone the seed steps so editing one channel doesn't mutate
  // another channel's flow (since seedStep returns fresh objects, we
  // just spread for new ids).
  flowSteps: FLOW_TEMPLATE_BY_ID[templateId].steps.map((s, i) => ({
    ...s,
    id: `${templateId}-${i + 1}-${Math.random().toString(36).slice(2, 6)}`,
  })),
});

export const DEFAULT_CHANNEL_SETTINGS: Record<Channel, ChannelSettings> = {
  form:           baseChannelSettings(['capture', 'book'],         300, '3-touch'),
  'inbound-call': baseChannelSettings(['book', 'quote'],           4,   'single'),
  'missed-call':  baseChannelSettings(['capture', 'book'],         30,  '3-touch'),
  chat:           baseChannelSettings(['faq', 'book', 'capture'],  8,   'single'),
  'cold-followup': baseChannelSettings(['capture'],                120, 'none'),
};

// ── Brand & identity ──────────────────────────────────────────────────────

export type Vertical =
  | 'home-services'
  | 'wellness-fitness'
  | 'professional-services'
  | 'food-hospitality'
  | 'retail-ecommerce'
  | 'other';

export const VERTICAL_LABELS: Record<Vertical, string> = {
  'home-services':         'Home services (plumbing, HVAC, electrical)',
  'wellness-fitness':      'Wellness & fitness',
  'professional-services': 'Professional services',
  'food-hospitality':      'Food & hospitality',
  'retail-ecommerce':      'Retail & ecommerce',
  other:                   'Other',
};

export interface BrandIdentity {
  businessName: string;
  vertical: Vertical;
  ownerName: string;
  serviceArea: string;
  address: string;
}

// ── Business knowledge ────────────────────────────────────────────────────

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export interface DayHours {
  /** True when the business is closed on this day. */
  closed: boolean;
  /** Opening time as "HH:MM" 24-hour. */
  open: string;
  /** Closing time as "HH:MM" 24-hour. */
  close: string;
}

export interface BusinessKnowledge {
  services: string[];
  hours: Record<DayKey, DayHours>;
  /** Long-form FAQ context — fed verbatim to the AI prompt. */
  faq: string;
}

// ── Conversation goals (global defaults) ──────────────────────────────────

export type PrimaryGoal = 'book' | 'capture';

export type RequiredFieldId =
  | 'callerName'
  | 'phone'
  | 'email'
  | 'service'
  | 'date'
  | 'time'
  | 'address'
  | 'problem';

export const REQUIRED_FIELDS: { id: RequiredFieldId; label: string }[] = [
  { id: 'callerName', label: 'Caller name' },
  { id: 'phone',      label: 'Phone number' },
  { id: 'email',      label: 'Email address' },
  { id: 'service',    label: 'Desired service' },
  { id: 'date',       label: 'Preferred date' },
  { id: 'time',       label: 'Preferred time' },
  { id: 'address',    label: 'Service address' },
  { id: 'problem',    label: 'Description of problem' },
];

export type AfterHoursBehavior = 'accept' | 'message' | 'triage';

export const AFTER_HOURS_OPTIONS: { id: AfterHoursBehavior; label: string; description: string }[] = [
  { id: 'accept',  label: 'Accept bookings',  description: 'Full booking flow runs as normal.' },
  { id: 'message', label: 'Take a message',   description: 'Captures details for next-day follow-up.' },
  { id: 'triage',  label: 'Emergency triage', description: 'Escalate emergencies; others take a message.' },
];

export interface ConversationGoals {
  primaryGoal: PrimaryGoal;
  requiredFields: Set<RequiredFieldId>;
  afterHours: AfterHoursBehavior;
}

// ── Escalation rules ──────────────────────────────────────────────────────

export type EscalationAction = 'escalate' | 'digest' | 'decline' | 'handle';

export const ESCALATION_ACTIONS: { id: EscalationAction; label: string; tone: string; description: string }[] = [
  { id: 'escalate', label: 'Escalate now',  tone: 'danger',  description: 'Notify owner immediately.' },
  { id: 'digest',   label: 'Morning digest', tone: 'warning', description: 'Log and notify at 8 AM.' },
  { id: 'decline',  label: 'Decline',        tone: 'neutral', description: 'AI wraps up, offers callback.' },
  { id: 'handle',   label: 'AI handles',     tone: 'success', description: 'No escalation needed.' },
];

export interface EscalationTrigger {
  id: string;
  label: string;
  description: string;
  duringHours: EscalationAction;
  afterHours: EscalationAction;
}

export const DEFAULT_ESCALATION_TRIGGERS: EscalationTrigger[] = [
  { id: 'burst-pipe', label: 'Burst pipe / active flood',   description: 'Caller explicitly mentions active water emergency.', duringHours: 'escalate', afterHours: 'escalate' },
  { id: 'gas-safety', label: 'Gas-related / safety issue',  description: 'Smell of gas, CO concern, anything safety-critical.', duringHours: 'escalate', afterHours: 'escalate' },
  { id: 'complaint',  label: 'Caller mentions complaint',   description: 'Dissatisfied with previous work or service.',         duringHours: 'escalate', afterHours: 'digest'   },
  { id: 'ask-human',  label: 'Asks to speak to a human',    description: 'Explicitly requests a person.',                       duringHours: 'escalate', afterHours: 'decline'  },
  { id: 'ask-price',  label: 'Asks for a price or quote',   description: 'Wants a quote before booking.',                       duringHours: 'escalate', afterHours: 'digest'   },
  { id: 'reschedule', label: 'Wants to reschedule',         description: 'Existing customer changing an appointment.',          duringHours: 'handle',   afterHours: 'handle'   },
];

// ── Channel setup (outbound mediums) ──────────────────────────────────────

export type CallRoutingMethod = 'after-hours' | 'overflow' | 'always-on';

export const CALL_ROUTING_OPTIONS: { id: CallRoutingMethod; label: string; description: string }[] = [
  { id: 'after-hours', label: 'After-hours only (conditional forward)', description: "Customer sets up a conditional forward on their main line — calls go to AI outside business hours. Daytime calls ring normally." },
  { id: 'overflow',    label: 'Overflow / no-answer',                   description: 'Calls ring the real number first. If unanswered after 4 rings, forward to AI. Good for solopreneurs.' },
  { id: 'always-on',   label: 'Always-on (replace published number)',   description: 'Customer updates Google Business Profile, website, ads to use the AI number. AI handles all calls 24/7.' },
];

export interface PhoneMediumSettings {
  aiNumber: string;
  routingMethod: CallRoutingMethod;
  discloseAi: boolean;
}

export interface SmsMediumSettings {
  senderNumber: string;
  signature: string;
}

export interface EmailMediumSettings {
  fromEmail: string;
  signature: string;
}

export interface MediumsSettings {
  phone: PhoneMediumSettings;
  sms: SmsMediumSettings;
  email: EmailMediumSettings;
}

// ── Booking delivery (richer) ─────────────────────────────────────────────

export type BookingOutputMethod = 'ics' | 'calendly' | 'google';

export const BOOKING_OUTPUTS: { id: BookingOutputMethod; label: string; description: string }[] = [
  { id: 'ics',      label: 'Email + calendar invite (ICS)', description: 'Booking sent to owner as a calendar attachment. Owner confirms or reschedules. No integration needed — good for v1.' },
  { id: 'calendly', label: 'Calendly',                       description: "Booking created in customer's Calendly. Requires a valid Calendly scheduling link." },
  { id: 'google',   label: 'Google Calendar',                description: 'Event added directly to Google Calendar. Requires calendar ID + OAuth authorization from the customer.' },
];

export type ConfirmationMode = 'pending' | 'auto';

export interface BookingDelivery {
  outputMethod: BookingOutputMethod;
  confirmationMode: ConfirmationMode;
  /** SMS sent to the caller immediately after booking. Supports variables
   *  like {caller_name}, {service}, {date}, {time}, {address},
   *  {business_name}, {business_phone}. */
  confirmationSms: string;
  /** Email address that gets the booking notification. */
  ownerEmail: string;
  /** Connected account info — surfaced when output method is calendly/google. */
  accountEmail: string;
  eventType: string;
  durationMin: number;
}

// ── Voice & personality ───────────────────────────────────────────────────

export type AiVoiceId = 'ryan' | 'sarah' | 'marcus' | 'emma' | 'david' | 'aria';

export const AI_VOICES: { id: AiVoiceId; name: string; description: string }[] = [
  { id: 'ryan',   name: 'Ryan',   description: 'Warm, professional' },
  { id: 'sarah',  name: 'Sarah',  description: 'Friendly, clear' },
  { id: 'marcus', name: 'Marcus', description: 'Authoritative' },
  { id: 'emma',   name: 'Emma',   description: 'Calm, helpful' },
  { id: 'david',  name: 'David',  description: 'Conversational' },
  { id: 'aria',   name: 'Aria',   description: 'Upbeat, energetic' },
];

export type ConversationTone = 'formal' | 'warm' | 'casual';

export const CONVERSATION_TONES: { id: ConversationTone; label: string }[] = [
  { id: 'formal', label: 'Formal & professional' },
  { id: 'warm',   label: 'Warm & friendly' },
  { id: 'casual', label: 'Casual & relaxed' },
];

/** 0 = no limit; positive numbers are minutes. */
export type MaxCallDuration = 3 | 5 | 10 | 0;

export const MAX_CALL_DURATIONS: { value: MaxCallDuration; label: string }[] = [
  { value: 3,  label: '3 minutes' },
  { value: 5,  label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 0,  label: 'No limit' },
];

export interface VoicePersonality {
  voiceId: AiVoiceId;
  tone: ConversationTone;
  greeting: string;
  topicsToAvoid: string;
  maxCallDuration: MaxCallDuration;
}

// ── Top-level settings shape ───────────────────────────────────────────────

export interface SdrSettings {
  // Existing per-lead-source state
  channels: Record<Channel, ChannelSettings>;
  // Scheduling provider — kept for back-compat; merging into booking.
  primaryProvider: ProviderId | null;
  providerAccount: {
    email: string;
    eventType: string;
    durationMin: number;
  };
  // New sections
  brand: BrandIdentity;
  business: BusinessKnowledge;
  goals: ConversationGoals;
  escalation: { triggers: EscalationTrigger[] };
  mediums: MediumsSettings;
  booking: BookingDelivery;
  voice: VoicePersonality;
}

export const DEFAULT_SDR_SETTINGS: SdrSettings = {
  channels: DEFAULT_CHANNEL_SETTINGS,
  primaryProvider: 'calendly',
  providerAccount: {
    email: 'john@certapro.com',
    eventType: 'On-site estimate',
    durationMin: 30,
  },
  brand: {
    businessName: 'CertaPro Painters of Austin',
    vertical: 'home-services',
    ownerName: 'John Bunnell',
    serviceArea: 'Austin metro · 50+ ZIP codes (Austin, Cedar Park, Round Rock, Lakeway, Westlake, Bee Cave)',
    address: '12444 Research Blvd, Austin, TX 78759',
  },
  business: {
    services: [
      'Interior painting',
      'Exterior painting',
      'Cabinet refinishing',
      'Color consultation',
      'Commercial painting (HOA, office, healthcare, retail)',
    ],
    hours: {
      mon: { closed: false, open: '08:00', close: '18:00' },
      tue: { closed: false, open: '08:00', close: '18:00' },
      wed: { closed: false, open: '08:00', close: '18:00' },
      thu: { closed: false, open: '08:00', close: '18:00' },
      fri: { closed: false, open: '08:00', close: '18:00' },
      sat: { closed: false, open: '09:00', close: '14:00' },
      sun: { closed: true,  open: '09:00', close: '14:00' },
    },
    faq:
      'We serve the greater Austin metro — Austin, Cedar Park, Round Rock, Lakeway, Westlake, Bee Cave, Pflugerville, Leander, Dripping Springs, and surrounding 50+ ZIP codes. ' +
      'Free on-site estimates and color consultations. Interior projects typically run $3–8k; exterior projects $5–15k for a single-family home. ' +
      'HOA and commercial bids are scoped individually. We back exterior work with a 4-year written warranty.',
  },
  goals: {
    primaryGoal: 'book',
    requiredFields: new Set<RequiredFieldId>(['callerName', 'phone', 'service', 'address', 'date', 'time']),
    afterHours: 'accept',
  },
  escalation: { triggers: DEFAULT_ESCALATION_TRIGGERS },
  mediums: {
    phone: {
      aiNumber: '+1 (512) 323-9502',
      routingMethod: 'after-hours',
      discloseAi: true,
    },
    sms: {
      senderNumber: '+1 (512) 323-9502',
      signature: '— CertaPro Austin',
    },
    email: {
      fromEmail: 'austin@certapro.com',
      signature: 'CertaPro Painters of Austin · Your Local Painters · certapro.com/austin',
    },
  },
  booking: {
    outputMethod: 'ics',
    confirmationMode: 'pending',
    confirmationSms:
      "Hi {caller_name}, thanks for reaching CertaPro Painters of Austin! Your {service} estimate on {date} at {time} at {address} is in. " +
      "We'll confirm by end of day. Reply here with questions or call {business_phone}.",
    ownerEmail: 'john@certapro.com',
    accountEmail: 'john@certapro.com',
    eventType: 'On-site estimate',
    durationMin: 30,
  },
  voice: {
    voiceId: 'sarah',
    tone: 'warm',
    greeting:
      "Hi, thanks for calling CertaPro Painters of Austin — your local painters! I'm an AI assistant helping John's team — I can line up a free on-site estimate or answer questions about interior, exterior, cabinet, or commercial painting. " +
      'Just so you know, this conversation may be logged. What can I help you with today?',
    topicsToAvoid:
      "Don't quote a firm price without an on-site walkthrough — every project's prep varies. Don't comment on competitor pricing or quality. " +
      "If asked about lead-paint abatement or mold, say \"I'll have someone from John's team follow up with you directly.\"",
    maxCallDuration: 5,
  },
};

// ── Step-mutation helpers ──────────────────────────────────────────────────

/** Returns true when a step sequence matches the canonical template steps
 *  (same length, same delay/channel/message). Used to flip a flow back to
 *  its template id if the user happens to manually reproduce it. */
export function matchesTemplate(steps: FlowStep[], templateId: FlowTemplateId): boolean {
  const tpl = FLOW_TEMPLATE_BY_ID[templateId];
  if (steps.length !== tpl.steps.length) return false;
  return steps.every((s, i) => {
    const t = tpl.steps[i];
    return s.delay === t.delay && s.channel === t.channel && s.message === t.message;
  });
}

export function nextStepId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
