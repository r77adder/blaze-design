import type { StatusPillTone } from '@/staging';
import {
  type Lead,
  METHOD_LABELS,
  relativeMinutesAgo,
} from '../h2-port/sdr-data';
import { requestType } from '../h2-port/leads-table-kit';
import { seedIndex, leadService, leadZip } from '../h2-port/qualification-answer';

/**
 * Client-local view model for the reworked Leads & Bookings section.
 *
 * The shared `sdr-data` / `leads-table-kit` model is co-owned by the AM side
 * (h2-port/pages/Sdr.tsx), so we DON'T mutate it. Instead we derive the
 * client's model on top of the same `LEADS`, along TWO independent axes:
 *
 *   Handler     — who is working the conversation: Human Followup (needs a
 *                 teammate), Human Handling (a teammate is on it), AI Handling,
 *                 or Resolved.
 *   Lead status — where the contact sits as a sales opportunity: Non-Lead,
 *                 Info Needed, Unbooked, Booked, plus the closed pile
 *                 (Disqualified, Lost).
 *
 * Both derive deterministically from the lead (via `seedIndex`) so they stay
 * stable across renders, and both can be overridden at runtime (the user can
 * switch a handler or move a lead's status) via override maps threaded from
 * the page.
 */

export interface PillStyle {
  label: string;
  tone: StatusPillTone;
}

// ─── Handler ─────────────────────────────────────────────────────────

export type Handler = 'human-followup' | 'human-handling' | 'ai-handling' | 'resolved';

export const HANDLER_STYLES: Record<Handler, PillStyle> = {
  'human-followup': { label: 'Human Followup', tone: 'warning' },
  'human-handling': { label: 'Human Handling', tone: 'accent'  },
  'ai-handling':    { label: 'AI Handling',    tone: 'info'    },
  'resolved':       { label: 'Resolved',       tone: 'success' },
};

export const HANDLER_DESC: Record<Handler, string> = {
  'human-followup': 'Flagged for a person to step in. The most urgent to work.',
  'human-handling': 'A person has taken over and is replying directly.',
  'ai-handling':    'The AI receptionist is handling this automatically.',
  'resolved':       'Wrapped up, no further action needed.',
};

/** Most-important-first — drives the default sort and the filter order. Human
 *  Followup always floats to the top. */
export const HANDLER_ORDER: Handler[] = ['human-followup', 'human-handling', 'ai-handling', 'resolved'];

/** Switchable handlers offered in the pill dropdown. */
export const HANDLER_OPTIONS: Handler[] = ['human-followup', 'human-handling', 'ai-handling', 'resolved'];

/** Map a shared-model lead onto its handler. Shared `human-handling` (labeled
 *  "Needs Attention" upstream) is our Human Followup — a teammate still has to
 *  pick it up; a deterministic slice of `ai-handling` conversations read as
 *  Human Handling (a teammate is already in the thread); `resolved` stays
 *  Resolved; `opted-out` never reaches this surface. */
export function deriveHandler(lead: Lead): Handler {
  if (lead.status === 'human-handling') return 'human-followup';
  if (lead.status === 'resolved') return 'resolved';
  if (lead.status === 'ai-handling') {
    return seedIndex(`${lead.id}·human`, 4) === 0 ? 'human-handling' : 'ai-handling';
  }
  return 'resolved';
}

export type HandlerOverrides = Record<string, Handler>;

/** Effective handler = the user's override if set, else the derived value. */
export function handlerOf(lead: Lead, ov?: HandlerOverrides): Handler {
  return ov?.[lead.id] ?? deriveHandler(lead);
}

/** Opted-out contacts are dropped entirely (per the rework spec). */
export function inboxLeads(leads: Lead[]): Lead[] {
  return leads.filter((l) => l.status !== 'opted-out');
}

// ─── Lead status ─────────────────────────────────────────────────────

export type LeadStatus = 'non-lead' | 'info-needed' | 'unbooked' | 'booked' | 'disqualified' | 'lost';

export const LEAD_STATUS_STYLES: Record<LeadStatus, PillStyle> = {
  'non-lead':     { label: 'Non-Lead',     tone: 'neutral' },
  'info-needed':  { label: 'Info Needed',  tone: 'warning' },
  'unbooked':     { label: 'Unbooked',     tone: 'info'    },
  'booked':       { label: 'Booked',       tone: 'success' },
  'disqualified': { label: 'Disqualified', tone: 'neutral' },
  'lost':         { label: 'Lost',         tone: 'danger'  },
};

export const LEAD_STATUS_DESC: Record<LeadStatus, string> = {
  'non-lead':     'Not a sales opportunity. A general or support inquiry.',
  'info-needed':  'A lead still missing details before it can be booked.',
  'unbooked':     'Qualified lead, no appointment scheduled yet.',
  'booked':       'An appointment is on the calendar.',
  'disqualified': 'Not a fit. Out of area or out of scope.',
  'lost':         'Was a real opportunity but did not close.',
};

/** Options offered in the lead-status dropdown (the four primary statuses).
 *  Moving Non-Lead → Info Needed here is how a plain inquiry becomes a lead. */
export const LEAD_STATUS_OPTIONS: LeadStatus[] = ['non-lead', 'info-needed', 'unbooked', 'booked'];

/** The two negative close reasons, offered from the Close lead control. */
export const LEAD_STATUS_CLOSED: LeadStatus[] = ['disqualified', 'lost'];

/** Ordering for the sortable Lead status column — open pipeline first. */
export const LEAD_STATUS_ORDER: LeadStatus[] = ['info-needed', 'unbooked', 'booked', 'disqualified', 'lost', 'non-lead'];

/** A contact is a lead (sales opportunity) when it's headed somewhere in the
 *  pipeline. Anything with a booking or a recorded outcome is always a lead;
 *  the rest split deterministically, leaving a minority of pure inbound
 *  inquiries that live only in Conversations. */
export function isLead(lead: Lead): boolean {
  if (lead.scheduled_at || lead.outcome) return true;
  return seedIndex(`${lead.id}·kind`, 3) !== 0;
}

/** Pipeline stage of a lead (only meaningful when isLead). */
function leadStage(lead: Lead): Exclude<LeadStatus, 'non-lead'> {
  if (lead.outcome === 'lost' || lead.outcome === 'no-show') return 'lost';
  if (lead.status === 'opted-out') return 'disqualified';
  if (lead.scheduled_at) return 'booked';
  const qualified = lead.score >= 60 && !!lead.scorecard.budget && !!lead.scorecard.timeline;
  return qualified ? 'unbooked' : 'info-needed';
}

export function deriveLeadStatus(lead: Lead): LeadStatus {
  return isLead(lead) ? leadStage(lead) : 'non-lead';
}

export type LeadStatusOverrides = Record<string, LeadStatus>;

export function leadStatusOf(lead: Lead, ov?: LeadStatusOverrides): LeadStatus {
  return ov?.[lead.id] ?? deriveLeadStatus(lead);
}

export type PipelineScope = 'active' | 'closed';

export const SCOPE_STATUSES: Record<PipelineScope, LeadStatus[]> = {
  active: ['info-needed', 'unbooked', 'booked'],
  closed: ['disqualified', 'lost'],
};

/** Everything that is (or has been) a lead reaches the Leads board — plain
 *  Non-Lead conversations stay in Conversations only. */
export function pipelineLeads(leads: Lead[], ov?: LeadStatusOverrides): Lead[] {
  return leads.filter((l) => leadStatusOf(l, ov) !== 'non-lead');
}

// ─── Reason + budget ─────────────────────────────────────────────────

/** Reasons for contacts that aren't sales opportunities — support and service
 *  touchpoints, never anything about buying a new job. */
const INQUIRY_REASONS = [
  'Business hours',
  'General question',
  'Existing project follow-up',
  'Warranty claim',
  'Billing question',
  'Office location',
  'Reschedule visit',
  'Supplier call',
];

/** "Reason" cell: the service interest for leads, a general-inquiry label for
 *  everyone else. */
export function contactReason(lead: Lead): string {
  if (isLead(lead)) return requestType(lead);
  return INQUIRY_REASONS[seedIndex(`${lead.id}·inq`, INQUIRY_REASONS.length)];
}

/** Compact budget figure pulled from the scorecard's free-form budget note
 *  (e.g. "$140–180k confirmed" → "$140–180k"). Empty when no dollar amount is
 *  on file ("Not yet defined", "Confidential …"). */
export function leadBudget(lead: Lead): string {
  const raw = lead.scorecard.budget;
  if (!raw) return '';
  const m = raw.match(/\$[\d.,]+(?:[–-][\d.,]+)?k?\+?/i);
  return m ? m[0] : '';
}

// ─── Shared view filters (Conversations + board) ─────────────────────

export interface ViewFilters {
  handlers: string[];
  leadStatuses: string[];
  method: string;
  time: string;
  services: string[];
  zips: string[];
}

export const DEFAULT_VIEW_FILTERS: ViewFilters = { handlers: [], leadStatuses: [], method: 'all', time: 'all', services: [], zips: [] };

export const viewFilterCount = (f: ViewFilters) =>
  (f.handlers.length > 0 ? 1 : 0) +
  (f.leadStatuses.length > 0 ? 1 : 0) +
  [f.method, f.time].filter((v) => v !== 'all').length +
  (f.services.length > 0 ? 1 : 0) +
  (f.zips.length > 0 ? 1 : 0);

function matchesTime(lead: Lead, time: string): boolean {
  if (time === 'all') return true;
  const mins = relativeMinutesAgo(lead.last_activity_at);
  if (time === 'today') return mins <= 24 * 60;
  if (time === '7d') return mins <= 7 * 24 * 60;
  return mins <= 30 * 24 * 60;
}

export function applyViewFilters(leads: Lead[], f: ViewFilters, hOv?: HandlerOverrides, lsOv?: LeadStatusOverrides): Lead[] {
  return leads.filter((l) =>
    (f.handlers.length === 0 || f.handlers.includes(handlerOf(l, hOv))) &&
    (f.leadStatuses.length === 0 || f.leadStatuses.includes(leadStatusOf(l, lsOv))) &&
    (f.method === 'all' || l.method === f.method) &&
    (f.services.length === 0 || f.services.includes(leadService(l))) &&
    (f.zips.length === 0 || f.zips.includes(leadZip(l))) &&
    matchesTime(l, f.time));
}

/** Free-text search across name, phone, company/location, and reason. */
export function matchesViewQuery(lead: Lead, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  return `${lead.prospect.name} ${lead.prospect.phone} ${lead.location ?? lead.prospect.company} ${contactReason(lead)} ${requestType(lead)}`
    .toLowerCase()
    .includes(q);
}

// ─── Conversations sorting + columns ─────────────────────────────────

export type ConvSortKey = 'prospect' | 'method' | 'leadStatus' | 'reason' | 'handler' | 'time';
export type SortDir = 'asc' | 'desc';
export type ConvSort = { key: ConvSortKey; dir: SortDir };

export const DEFAULT_CONV_SORT: ConvSort = { key: 'handler', dir: 'asc' };

export const CONV_DEFAULT_DIR: Record<ConvSortKey, SortDir> = {
  prospect: 'asc',
  method: 'asc',
  leadStatus: 'asc',
  reason: 'asc',
  handler: 'asc',
  time: 'desc',
};

export interface ConvColumn {
  key: ConvSortKey;
  label: string;
  /** Hover explanation shown on the column header. */
  desc?: string;
}

export const CONV_COLUMNS: ConvColumn[] = [
  { key: 'prospect', label: 'Prospect' },
  { key: 'method', label: 'Method' },
  { key: 'leadStatus', label: 'Lead status', desc: 'Where this contact sits as a sales opportunity — from Non-Lead through Booked.' },
  { key: 'reason', label: 'Reason' },
  { key: 'handler', label: 'Handler', desc: 'Who is working this conversation right now — the AI or a teammate.' },
  { key: 'time', label: 'Time' },
];

export function sortConversations(leads: Lead[], sort: ConvSort, hOv?: HandlerOverrides, lsOv?: LeadStatusOverrides): Lead[] {
  const value = (l: Lead): string | number => {
    switch (sort.key) {
      case 'prospect': return l.prospect.name.toLowerCase();
      case 'method': return METHOD_LABELS[l.method];
      case 'leadStatus': return LEAD_STATUS_ORDER.indexOf(leadStatusOf(l, lsOv));
      case 'reason': return contactReason(l).toLowerCase();
      case 'handler': return HANDLER_ORDER.indexOf(handlerOf(l, hOv));
      case 'time': return -relativeMinutesAgo(l.last_activity_at);
    }
  };
  const m = sort.dir === 'asc' ? 1 : -1;
  return [...leads].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    const primary = (va < vb ? -1 : va > vb ? 1 : 0) * m;
    if (primary !== 0) return primary;
    // Ties always break newest-first.
    return relativeMinutesAgo(a.last_activity_at) - relativeMinutesAgo(b.last_activity_at);
  });
}
