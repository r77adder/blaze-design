import { useMemo, useRef, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { Heading, Text, Button, IconButton, Modal, useModals, type StackModalProps } from '@/components';
import { StatusPill, Pill, Avatar, Checkbox, Select } from '@/staging';
import Voice from '@/icons/20/Voice';
import MessageText2 from '@/icons/20/MessageText2';
import MessageChat01 from '@/icons/20/MessageChat01';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import Download from '@/icons/20/Download';
import Settings from '@/icons/20/Settings';
import Help from '@/icons/16/Help';
import Send1 from '@/icons/20/Send1';
import Check from '@/icons/16/Check';
import ChevronRight from '@/icons/16/ChevronRight';
import ArrowLeft from '@/icons/20/ArrowLeft';
import Copy from '@/icons/20/Copy';
import { DEFAULT_QUALIFICATION_QUESTIONS } from '../h2/qualification-criteria-data';
import {
  LEADS,
  type Lead,
  type Status,
  STATUS_STYLES,
  SOURCE_LABELS,
  METHOD_LABELS,
  MEDIUM_LABELS,
  defaultMedium,
  formatRelative,
  conversationSummary,
  avatarColor,
  isUnread,
  relativeMinutesAgo,
  type Message,
} from '../h2/sdr-data';
import { STRATEGIST } from './HomeColdShared';
import { ClientShell } from './shell';
import { ColdState } from './ColdState';
import { useClientState } from './dev-state';
import { ReceptionistSettings } from './ReceptionistSettings';

/**
 * Leads — the AI Receptionist's lead inbox, surfaced as a first-party client
 * tab for Grain Design Flooring. Reuses H2's `LEADS` data in a read-only table
 * (clients watch the pipeline the receptionist is filling; they don't work the
 * queue). Each row is CLICKABLE → opens a view-only lead detail modal showing
 * the prospect, channel/method/status, qualification factors, and the
 * conversation summary.
 */

export function Leads() {
  const { state } = useClientState();
  const leads = LEADS;
  const { openModal } = useModals();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Full-page AI Receptionist settings, scoped to the Leads tab — opens from the
  // topbar button and returns here on back (no route change).
  if (settingsOpen) {
    return <ReceptionistSettings onBack={() => setSettingsOpen(false)} />;
  }

  // Cold — pre-go-live: the AI Receptionist isn't capturing leads yet, so the
  // inbox is empty. Show an explanatory empty state describing what will land
  // here once the receptionist goes live.
  if (state !== 'steady') {
    return (
      <ClientShell section="leads">
        <ColdState
          icon={UserProfileGroup}
          title="Leads appear here once your AI Receptionist is live."
          description="Every call, text, and form your AI Receptionist captures, qualifies, and books will land here for you to follow."
          points={[
            'Inbound calls and texts captured 24/7',
            'Qualification details and full conversation summaries',
            'Booked appointments, ready to confirm',
          ]}
        />
      </ClientShell>
    );
  }

  return (
    <ClientShell
      section="leads"
      topbarRight={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button variant="tertiary" size="sm" frontIcon={Settings} onPress={() => setSettingsOpen(true)}>
            Settings
          </Button>
          <Button variant="secondary" size="sm" frontIcon={Download} onPress={() => openModal(ExportLeadsModal, { leads })}>
            Export
          </Button>
        </div>
      }
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <LeadsTable leads={leads} onOpen={(list, index) => openModal(LeadDetailModal, { leads: list, index })} />
      </div>
    </ClientShell>
  );
}

// ─── AI Receptionist–style leads inbox ──────────────────────────────
// Mirrors the AI Receptionist's leads table (h2/pages/Sdr.tsx): leads grouped
// by status into collapsible sections, with the columns Prospect · Method ·
// Call reason · Time and the same row treatment (avatar, unread blue dot,
// muted "nothing new" rows). Row click opens the existing view-only lead
// detail modal (link target unchanged).

const LEADS_GRID = '300px 80px minmax(220px, 1fr) 80px';
const STATUS_FUNNEL_ORDER: Status[] = ['human-handling', 'ai-handling', 'resolved', 'opted-out'];

function initials(name: string): string {
  return name.split(/\s+/).map((w) => w.charAt(0).toUpperCase()).slice(0, 2).join('');
}

const localPhone = (phone: string) => phone.replace(/^\+1\s*/, '');

/** Best-guess "call reason" from the lead's source / need / tags. */
function requestType(lead: Lead): string {
  const src = lead.first_touch_source ?? '';
  if (/cabinet/i.test(src)) return 'Cabinet refinishing';
  if (/exterior/i.test(src)) return 'Exterior painting';
  if (/interior/i.test(src)) return 'Interior painting';
  if (/warranty/i.test(src)) return 'Warranty claim';
  if (/hoa/i.test(src)) return 'HOA project';
  if (/commercial|restaurant|healthcare/i.test(src)) return 'Commercial painting';
  if (/deck|fence/i.test(src)) return 'Deck & fence';
  if (/color/i.test(src)) return 'Color consultation';
  const need = lead.scorecard.need ?? '';
  if (/cabinet/i.test(need)) return 'Cabinet refinishing';
  if (/exterior/i.test(need)) return 'Exterior painting';
  if (/interior/i.test(need)) return 'Interior painting';
  const tag = lead.tags.find(
    (t) => !/residential|westlake|cedar park|austin|pflugerville|leander|round rock|lakeway|bee cave|dripping|booked|hot lead|cooled/i.test(t),
  );
  return tag ?? 'General inquiry';
}

function LeadRow({ lead, isLast, onOpen }: { lead: Lead; isLast: boolean; onOpen: () => void }) {
  const unread = isUnread(lead);
  const baseBg = unread ? 'var(--light-100)' : 'var(--dark-2)';
  const hoverBg = unread ? 'var(--dark-2)' : 'var(--dark-4)';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: LEADS_GRID,
        gap: 12,
        padding: '12px 28px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'center',
        cursor: 'pointer',
        background: baseBg,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = baseBg)}
    >
      {/* Prospect — blue dot signals a prospect message waiting on a reply */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, position: 'relative' }}>
        {unread && (
          <span
            aria-label="Unread"
            style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: 'var(--status-posting)' }}
          />
        )}
        <Avatar fallback={initials(lead.prospect.name)} size={32} style={{ background: avatarColor(lead.prospect.name), flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text style={{ fontWeight: 500, color: 'var(--dark-90)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.prospect.name}
          </Text>
          <Text variant="secondary" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {localPhone(lead.prospect.phone)}&nbsp;&nbsp;{lead.location ?? lead.prospect.company}
          </Text>
        </div>
      </div>

      {/* Method */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {lead.method === 'call' && <Voice size={14} color="var(--dark-60)" />}
        {lead.method === 'sms' && <MessageText2 size={14} color="var(--dark-60)" />}
        {lead.method === 'other' && <MessageChat01 size={14} color="var(--dark-60)" />}
        <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14 }}>{METHOD_LABELS[lead.method]}</Text>
      </div>

      {/* Call reason */}
      <div style={{ minWidth: 0 }}>
        <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {requestType(lead)}
        </Text>
      </div>

      {/* Time */}
      <div style={{ fontSize: 12, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {formatRelative(lead.last_activity_at)}
      </div>
    </div>
  );
}

function LeadsTable({ leads, onOpen }: { leads: Lead[]; onOpen: (leads: Lead[], index: number) => void }) {
  const [collapsed, setCollapsed] = useState<Set<Status>>(() => new Set<Status>(['resolved', 'opted-out']));
  const sorted = useMemo(
    () => [...leads].sort((a, b) => relativeMinutesAgo(a.last_activity_at) - relativeMinutesAgo(b.last_activity_at)),
    [leads],
  );
  const groups = STATUS_FUNNEL_ORDER
    .map((status) => ({ status, ss: STATUS_STYLES[status], groupLeads: sorted.filter((l) => l.status === status) }))
    .filter((g) => g.groupLeads.length > 0);
  // Flat display order — powers the modal's up/down lead navigation.
  const ordered = groups.flatMap((g) => g.groupLeads);

  return (
    <>
      {groups.map((g, groupIndex) => {
        const isCollapsed = collapsed.has(g.status);
        const ChevronIcon = isCollapsed ? ChevronDown : ChevronUp;
        return (
          <div key={g.status} style={{ marginTop: groupIndex === 0 ? 0 : 32 }}>
            <button
              type="button"
              aria-expanded={!isCollapsed}
              onClick={() =>
                setCollapsed((prev) => {
                  const next = new Set(prev);
                  if (next.has(g.status)) next.delete(g.status);
                  else next.add(g.status);
                  return next;
                })
              }
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isCollapsed ? 0 : 10, paddingLeft: 2, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' }}
            >
              <Heading level={3}>{g.ss.label}</Heading>
              <Text style={{ fontSize: 14, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>{g.groupLeads.length}</Text>
              <span style={{ marginLeft: 'auto', display: 'inline-flex' }}>
                <ChevronIcon size={18} color="var(--dark-60)" />
              </span>
            </button>
            {!isCollapsed && (
              <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
                {groupIndex === 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: LEADS_GRID, borderBottom: '1px solid var(--dark-8)', padding: '6px 28px', gap: 12, fontSize: 12, color: 'var(--dark-60)', fontWeight: 400 }}>
                    <span>Prospect</span>
                    <span>Method</span>
                    <span>Call reason</span>
                    <span>Time</span>
                  </div>
                )}
                {g.groupLeads.map((lead, i) => (
                  <LeadRow key={lead.id} lead={lead} isLast={i === g.groupLeads.length - 1} onOpen={() => onOpen(ordered, ordered.indexOf(lead))} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ marginTop: 16 }}>
        <Text variant="secondary" style={{ fontSize: 12 }}>{leads.length} leads · sorted by last activity</Text>
      </div>
    </>
  );
}

// ─── Lead detail modal (view-only) ──────────────────────────────────
// Two columns: the main column is a chronological timeline of every touchpoint
// (form submission → calls → texts → the proposed next step); the right rail
// holds the lead's contact + qualification info, phone first.

type Glyph = ComponentType<{ size?: number; color?: string }>;

type TimelineItem =
  | { kind: 'form'; source: string; need?: string; when: string }
  | { kind: 'call'; title: string; duration?: string; summary: string; turns: { speaker: string; line: string }[]; when: string }
  | { kind: 'text'; mediumLabel: string; messages: Message[]; summary?: string; when: string }
  | { kind: 'system'; title: string; when: string };

type SubPage =
  | { kind: 'transcript'; title: string; turns: { speaker: string; line: string }[] }
  | { kind: 'messages'; title: string; messages: Message[] };

function firstName(name: string): string {
  return name.split(/\s+/)[0];
}

const CITY_RE = /austin|round rock|cedar park|westlake|pflugerville|leander|lakeway|bee cave|dripping|tarrytown|mueller|hyde park|travis|north loop|sunset ridge|lakewood|brightline|salt traders/i;
function leadLocation(lead: Lead): string | undefined {
  return lead.location ?? lead.tags.find((t) => CITY_RE.test(t));
}

/** Group the raw transcript into human-readable touchpoints. Consecutive text
 *  messages collapse into one conversation node; calls and system events stay
 *  discrete. A synthetic first-touch node guarantees every lead opens on how it
 *  came in — even a one-message lead shows its form/chat origin. */
function buildTimeline(lead: Lead): TimelineItem[] {
  const items: TimelineItem[] = [];
  const msgs = lead.transcript;

  if (lead.channel === 'form') {
    items.push({ kind: 'form', source: lead.first_touch_source, need: lead.scorecard.need, when: lead.first_seen });
  } else if (lead.channel === 'chat') {
    items.push({ kind: 'system', title: `Started a website chat · ${lead.first_touch_source}`, when: lead.first_seen });
  }

  let i = 0;
  // Fold a leading capture/inbound marker into the first-touch node above,
  // except keep the phone-tree path visible for inbound calls.
  if (msgs[i]?.type === 'system' && /captur|form|landing|inbound|chat|option/i.test(msgs[i].content)) {
    if (lead.channel === 'inbound-call') items.push({ kind: 'system', title: msgs[i].content, when: msgs[i].timestamp });
    i += 1;
  }

  let firstTextRun = true;
  while (i < msgs.length) {
    const m = msgs[i];
    if (m.type === 'system') {
      // internal escalation notes are noise for the client-facing timeline
      if (!/escalat/i.test(m.content)) items.push({ kind: 'system', title: m.content, when: m.timestamp });
      i += 1;
    } else if (m.type === 'call') {
      const turns = m.call?.turns ?? [];
      const callerLine = turns.find((t) => /caller|prospect|client/i.test(t.speaker))?.line;
      items.push({
        kind: 'call',
        title: m.role === 'ai' ? 'AI-handled call' : 'Call',
        duration: m.call?.duration,
        summary: callerLine ?? m.content,
        turns,
        when: m.timestamp,
      });
      i += 1;
    } else {
      const run: Message[] = [];
      while (i < msgs.length && msgs[i].type === 'text') { run.push(msgs[i]); i += 1; }
      const med = run[0].medium ?? defaultMedium(run[0], lead.channel) ?? 'sms';
      items.push({
        kind: 'text',
        mediumLabel: MEDIUM_LABELS[med],
        messages: run,
        summary: firstTextRun ? conversationSummary(lead) : undefined,
        when: run[run.length - 1].timestamp,
      });
      firstTextRun = false;
    }
  }
  return items;
}

const DOT: Record<TimelineItem['kind'], string> = {
  form: 'var(--purple)',
  call: 'var(--status-posting)',
  text: 'var(--dark-30)',
  system: 'var(--dark-15)',
};

function TimelineRow({ dot, isLast, children }: { dot: string; isLast?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 10 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: dot, marginTop: 6, flexShrink: 0 }} />
        {!isLast && <span style={{ flex: 1, width: 1, background: 'var(--dark-8)', marginTop: 3 }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 34 }}>{children}</div>
    </div>
  );
}

function NodeHeader({ title, meta, when }: { title: string; meta?: string; when: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <Heading level={5}>{title}</Heading>
      {meta && <Text variant="metadata" color="var(--dark-60)">· {meta}</Text>}
      <Text variant="metadata" color="var(--dark-40)" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>{formatRelative(when)}</Text>
    </div>
  );
}

function PageLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <div style={{ marginTop: 10 }}>
      <Button variant="secondary" size="sm" onPress={onPress}>{label}</Button>
    </div>
  );
}

function CallTurns({ turns }: { turns: { speaker: string; line: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', background: 'var(--dark-3)', borderRadius: 10 }}>
      {turns.map((t, i) => (
        <div key={i}>
          <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 1 }}>{t.speaker}</Text>
          <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.5 }}>{t.line}</Text>
        </div>
      ))}
    </div>
  );
}

function MessageThread({ messages }: { messages: Message[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {messages.map((m) => {
        const mine = m.role === 'ai' || m.role === 'owner';
        return (
          <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '8px 12px', borderRadius: 12, background: mine ? 'var(--dark-90)' : 'var(--dark-4)' }}>
            <Text variant="secondary" style={{ color: mine ? 'var(--light-100)' : 'var(--dark-90)', lineHeight: 1.5 }}>{m.content}</Text>
          </div>
        );
      })}
    </div>
  );
}

function TimelineNode({ item, isLast, onOpenPage }: { item: TimelineItem; isLast?: boolean; onOpenPage: (p: SubPage) => void }) {
  if (item.kind === 'form') {
    return (
      <TimelineRow dot={DOT.form} isLast={isLast}>
        <NodeHeader title="Form submission" when={item.when} />
        <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block' }}>{item.source}</Text>
        {item.need && <Text variant="secondary" style={{ display: 'block', marginTop: 4, color: 'var(--dark-90)', lineHeight: 1.5 }}>Requested: {item.need}</Text>}
      </TimelineRow>
    );
  }
  if (item.kind === 'call') {
    return (
      <TimelineRow dot={DOT.call} isLast={isLast}>
        <NodeHeader title={item.title} meta={item.duration} when={item.when} />
        <Text variant="secondary" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--dark-90)', lineHeight: 1.5 }}>{item.summary}</Text>
        {item.turns.length > 0 && (
          <PageLink label="See full transcript" onPress={() => onOpenPage({ kind: 'transcript', title: 'Call transcript', turns: item.turns })} />
        )}
      </TimelineRow>
    );
  }
  if (item.kind === 'text') {
    return (
      <TimelineRow dot={DOT.text} isLast={isLast}>
        <NodeHeader title={`${item.mediumLabel} conversation`} meta={`${item.messages.length} message${item.messages.length === 1 ? '' : 's'}`} when={item.when} />
        {item.summary && <Text variant="secondary" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--dark-90)', lineHeight: 1.5 }}>{item.summary}</Text>}
        <PageLink label="See messages" onPress={() => onOpenPage({ kind: 'messages', title: `${item.mediumLabel} conversation`, messages: item.messages })} />
      </TimelineRow>
    );
  }
  return (
    <TimelineRow dot={DOT.system} isLast={isLast}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Text variant="secondary" color="var(--dark-60)">{item.title}</Text>
        <Text variant="metadata" color="var(--dark-40)" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>{formatRelative(item.when)}</Text>
      </div>
    </TimelineRow>
  );
}

/** Secondary button that copies the drafted message to the clipboard and
 *  briefly confirms with a check + "Copied to clipboard" (green, fades back). */
function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <Button
      variant="secondary"
      size="md"
      frontIcon={copied ? Check : Copy}
      onPress={copy}
      color={copied ? 'var(--status-approved)' : undefined}
      style={{ transition: 'color 160ms ease' }}
    >
      {copied ? 'Copied to clipboard' : 'Copy message'}
    </Button>
  );
}

function NextActionStep({ lead }: { lead: Lead }) {
  const [done, setDone] = useState(false);
  const na = lead.suggested_next_action;
  const isCall = na?.type === 'call-back';
  const verb = isCall ? `Call ${firstName(lead.prospect.name)}` : 'Send follow-up';
  const doneLabel = isCall ? 'Call logged' : 'Follow-up sent';
  const ActionIcon: Glyph = isCall ? Voice : Send1;

  return (
    <TimelineRow dot="var(--brand)" isLast>
      {na ? (
        <div>
          <Heading level={5} style={{ margin: '0 0 6px' }}>Recommended next step</Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)', lineHeight: 1.4 }}>{na.summary}</Text>
          <div style={{ marginTop: 10, padding: '12px 14px', background: 'var(--dark-2)', border: '1px solid var(--dark-8)', borderRadius: 10 }}>
            <Text variant="secondary" style={{ color: 'var(--dark-80)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{na.payload}</Text>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            {done ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} color="var(--status-approved)" />
                <Text variant="secondary" style={{ color: 'var(--status-approved)', fontWeight: 500 }}>{doneLabel}</Text>
              </span>
            ) : (
              <Button variant="primary" size="md" frontIcon={ActionIcon} onPress={() => setDone(true)}>{verb}</Button>
            )}
            <CopyMessageButton text={na.payload} />
          </div>
        </div>
      ) : lead.scheduled_at ? (
        <div>
          <Heading level={5} style={{ margin: 0 }}>Visit booked</Heading>
          <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginTop: 2 }}>{lead.scheduled_at}{lead.location ? ` · ${lead.location}` : ''}</Text>
        </div>
      ) : (
        <Text variant="secondary" color="var(--dark-60)">No action needed right now — the AI receptionist is handling this lead.</Text>
      )}
    </TimelineRow>
  );
}

// Sample answers that actually match the qualification-criteria labels. The
// underlying H2 lead data is painting-themed and has no zips, so we derive a
// stable, on-label value per lead: a real Austin service-area zip and a
// flooring service (Grain Design Flooring's actual offerings).
const SAMPLE_ZIPS = ['78701', '78702', '78703', '78704', '78705', '78610', '78613', '78620', '78641', '78660', '78664', '78681'];
const FLOORING_SERVICES = ['Hardwood floor', 'Laminate floor', 'Vinyl floor', 'Carpet'];
function seedIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}
const leadZip = (lead: Lead) => SAMPLE_ZIPS[seedIndex(lead.id, SAMPLE_ZIPS.length)];
const leadService = (lead: Lead) => FLOORING_SERVICES[seedIndex(`${lead.id}·svc`, FLOORING_SERVICES.length)];

/** This lead's answer to a configured qualification question — shared by the
 *  lead detail rail and the CSV export columns/filters. */
function qualificationAnswer(lead: Lead, id: string): string | undefined {
  switch (id) {
    case 'q-name': return lead.prospect.name;
    case 'q-phone': return localPhone(lead.prospect.phone);
    case 'q-zip': return leadZip(lead);
    case 'q-budget': return lead.scorecard.budget;
    case 'q-service': return leadService(lead);
    default: return undefined;
  }
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 2 }}>{label}</Text>
      <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.4, wordBreak: 'break-word' }}>{value}</Text>
    </div>
  );
}

function LeadDetailModal({ leads, index, close }: StackModalProps & { leads: Lead[]; index: number }) {
  const [idx, setIdx] = useState(index);
  const [page, setPage] = useState<SubPage | null>(null);
  const lead = leads[idx];
  const st = STATUS_STYLES[lead.status];
  const sk = lead.scorecard;
  const timeline = buildTimeline(lead);
  const go = (delta: number) => { setIdx((i) => Math.min(leads.length - 1, Math.max(0, i + delta))); setPage(null); };

  // Transcript / message threads open as their own modal page — footer holds
  // Back (to the lead detail) and a primary Done.
  if (page) {
    return (
      <Modal.Root size="md" aria-labelledby="lead-subpage-title">
        <Modal.Header title={page.title} id="lead-subpage-title" onClose={close} />
        <Modal.Content>
          {page.kind === 'transcript' ? <CallTurns turns={page.turns} /> : <MessageThread messages={page.messages} />}
        </Modal.Content>
        <Modal.Footer>
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="subtle" frontIcon={ArrowLeft} onPress={() => setPage(null)}>Back</Modal.FooterButton>
          </Modal.FooterContent>
          <Modal.FooterContent slot="right">
            <Modal.FooterButton variant="primary" onPress={() => setPage(null)}>Done</Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      </Modal.Root>
    );
  }

  return (
    <Modal.Root size="md" aria-labelledby="lead-detail-title">
      <Modal.Header
        onClose={close}
        subHeader={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusPill tone={st.tone} size="sm">{st.label}</StatusPill>
          </div>
        }
      >
        {/* name (left) + lead pager floating centered in the header, no container */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <Heading level={2} id="lead-detail-title" style={{ margin: 0 }}>{lead.prospect.name}</Heading>
          <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <IconButton variant="secondary" size="sm" icon={ChevronUp} aria-label="Previous lead" isDisabled={idx === 0} onPress={() => go(-1)} />
            <Text variant="metadata" color="var(--dark-60)" style={{ whiteSpace: 'nowrap' }}>{idx + 1} / {leads.length}</Text>
            <IconButton variant="secondary" size="sm" icon={ChevronDown} aria-label="Next lead" isDisabled={idx === leads.length - 1} onPress={() => go(1)} />
          </span>
        </div>
      </Modal.Header>
      <Modal.Content withoutFooter>
        <div style={{ display: 'flex', gap: 28, alignItems: 'stretch' }}>
          {/* main — timeline of touchpoints, ending on the proposed next step */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {timeline.filter((item) => item.kind !== 'system').map((item, i) => (
              <TimelineNode key={i} item={item} onOpenPage={setPage} />
            ))}
            <NextActionStep key={lead.id} lead={lead} />
          </div>

          {/* right rail — contact + qualification, phone first */}
          <aside style={{ width: 244, flexShrink: 0, borderLeft: '1px solid var(--dark-8)', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* contact — the client's primary handle on this lead, elevated */}
            <div style={{ padding: 16, background: 'var(--dark-2)', border: '1px solid var(--dark-8)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 2 }}>Phone</Text>
                <a href={`tel:${lead.prospect.phone.replace(/[^\d+]/g, '')}`} style={{ textDecoration: 'none' }}>
                  <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{lead.prospect.phone}</Text>
                </a>
              </div>
              {lead.prospect.email && (
                <div>
                  <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 2 }}>Email</Text>
                  <a href={`mailto:${lead.prospect.email}`} style={{ textDecoration: 'underline', textDecorationColor: 'var(--dark-15)', textUnderlineOffset: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', wordBreak: 'break-word' }}>{lead.prospect.email}</Text>
                  </a>
                </div>
              )}
              {leadLocation(lead) && (
                <div>
                  <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 2 }}>Location</Text>
                  <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>{leadLocation(lead)}</Text>
                </div>
              )}
            </div>

            {/* qualification criteria — one row per configured question */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Heading level={5} style={{ margin: 0 }}>Qualification criteria</Heading>
              {DEFAULT_QUALIFICATION_QUESTIONS.map((q) => (
                <InfoRow key={q.id} label={q.label} value={qualificationAnswer(lead, q.id)} />
              ))}
            </div>
          </aside>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

// ─── Export to CSV ──────────────────────────────────────────────────
// The header Export button opens this modal: tick which details to include
// (each becomes a CSV column), preview the shape via the "?" hover, then
// download. Clients unsure what to pull can ping their Blaze strategist.

interface ExportField {
  key: string;
  /** Doubles as the checkbox label and the CSV column header. */
  label: string;
  /** Short example shown beside the label for the less self-evident fields. */
  hint?: string;
  value: (lead: Lead) => string;
  defaultOn: boolean;
  group: 'details' | 'qualification';
}

// Name and phone intentionally live only under Qualification criteria (Full
// name / Phone number) so the two column groups never duplicate each other.
const DETAIL_FIELDS: ExportField[] = [
  { key: 'email', label: 'Email', value: (l) => l.prospect.email, defaultOn: true, group: 'details' },
  { key: 'company', label: 'Company / location', value: (l) => l.location ?? l.prospect.company, defaultOn: true, group: 'details' },
  { key: 'reason', label: 'Call reason', value: (l) => requestType(l), defaultOn: true, group: 'details' },
  { key: 'method', label: 'Method', hint: 'Call, SMS, Chat', value: (l) => METHOD_LABELS[l.method], defaultOn: false, group: 'details' },
  { key: 'status', label: 'Status', hint: 'AI handling, Booked', value: (l) => STATUS_STYLES[l.status].label, defaultOn: false, group: 'details' },
  { key: 'activity', label: 'Last activity', hint: '14m ago, 2d ago', value: (l) => formatRelative(l.last_activity_at), defaultOn: false, group: 'details' },
];

// Each configured qualification question is also an exportable column. Full
// name and Phone number default on (they replace the old Lead-details columns).
const QUALIFICATION_FIELDS: ExportField[] = DEFAULT_QUALIFICATION_QUESTIONS.map((q) => ({
  key: `qual-${q.id}`,
  label: q.label,
  value: (l) => qualificationAnswer(l, q.id) ?? '',
  defaultOn: q.id === 'q-name' || q.id === 'q-phone',
  group: 'qualification',
}));

const EXPORT_FIELDS: ExportField[] = [...DETAIL_FIELDS, ...QUALIFICATION_FIELDS];

/** Quote a CSV cell only when it contains a comma, quote, or newline. */
function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function downloadLeadsCsv(fields: ExportField[], leads: Lead[]) {
  const rows = [fields.map((f) => f.label), ...leads.map((l) => fields.map((f) => f.value(l)))];
  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grain-design-flooring-leads.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Hover preview: a mini spreadsheet of the currently-checked columns filled
 *  with a few real leads, so the client sees exactly what the CSV will hold.
 *  Rendered in a portal with fixed positioning so it escapes the modal's
 *  `overflow: auto` clip and can show every selected column in full. */
function CsvPreview({ fields, leads, anchor }: { fields: ExportField[]; leads: Lead[]; anchor: DOMRect }) {
  // Center the popover under the "?" trigger, clamping its width so it never
  // runs off either edge of the viewport.
  const centerX = anchor.left + anchor.width / 2;
  const edgeGap = Math.min(centerX, window.innerWidth - centerX) - 12;
  const base: React.CSSProperties = {
    position: 'fixed', top: anchor.bottom + 8, left: centerX, transform: 'translateX(-50%)', zIndex: 3000,
    background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10,
    boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 14,
    maxWidth: Math.max(240, Math.round(edgeGap * 2)),
  };
  if (fields.length === 0) {
    return (
      <div style={{ ...base, width: 240 }}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>Tick at least one column to preview your export.</Text>
      </div>
    );
  }
  const cell: React.CSSProperties = { border: '1px solid var(--dark-8)', padding: '6px 10px', whiteSpace: 'nowrap', textAlign: 'left' };
  return (
    <div style={base}>
      <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 10, letterSpacing: '0.04em' }}>This is how your CSV will look</Text>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {fields.map((f) => (
                <th key={f.key} style={{ ...cell, fontWeight: 500, color: 'var(--dark-90)', background: 'var(--dark-4)' }}>{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                {fields.map((f) => (
                  <td key={f.key} style={{ ...cell, color: 'var(--dark-60)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.value(l)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 6 }}>{label}</Text>
      <Select value={value} onChange={onChange} options={options} size="md" fullWidth aria-label={label} />
    </div>
  );
}

function ExportLeadsModal({ leads, close }: StackModalProps & { leads: Lead[] }) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(EXPORT_FIELDS.filter((f) => f.defaultOn).map((f) => f.key)),
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [zipFilter, setZipFilter] = useState('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const helpRef = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const activeFields = EXPORT_FIELDS.filter((f) => selected.has(f.key));

  const filteredLeads = useMemo(
    () => leads.filter((l) =>
      (statusFilter === 'all' || l.status === statusFilter) &&
      (methodFilter === 'all' || l.method === methodFilter) &&
      (serviceFilter === 'all' || leadService(l) === serviceFilter) &&
      (zipFilter === 'all' || leadZip(l) === zipFilter),
    ),
    [leads, statusFilter, methodFilter, serviceFilter, zipFilter],
  );
  const isFiltered = filteredLeads.length !== leads.length;

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const statusOptions = [{ value: 'all', label: 'All statuses' }, ...STATUS_FUNNEL_ORDER.map((s) => ({ value: s, label: STATUS_STYLES[s].label }))];
  const methodOptions = [{ value: 'all', label: 'All methods' }, { value: 'call', label: 'Call' }, { value: 'sms', label: 'SMS' }, { value: 'other', label: 'Chat' }];
  const serviceOptions = [{ value: 'all', label: 'Any service' }, ...FLOORING_SERVICES.map((s) => ({ value: s, label: s }))];
  const zipOptions = [{ value: 'all', label: 'All zip codes' }, ...SAMPLE_ZIPS.map((z) => ({ value: z, label: z }))];
  const detailFields = EXPORT_FIELDS.filter((f) => f.group === 'details');
  const qualFields = EXPORT_FIELDS.filter((f) => f.group === 'qualification');

  const renderCheckbox = (f: ExportField) => (
    <Checkbox key={f.key} style={{ gap: 12 }} checked={selected.has(f.key)} onChange={() => toggle(f.key)}>
      <Text variant="primary" style={{ color: 'var(--dark-90)' }}>
        {f.label}
        {f.hint && <span style={{ color: 'var(--dark-60)', marginLeft: 5 }}>({f.hint})</span>}
      </Text>
    </Checkbox>
  );

  return (
    <Modal.Root size="md" aria-labelledby="export-leads-title">
      <Modal.Header
        title="Export leads to CSV"
        id="export-leads-title"
        onClose={close}
        subHeader={
          <Text variant="secondary" style={{ color: 'var(--dark-60)', fontWeight: 400, lineHeight: 1.5 }}>
            Choose which details to include. Each one you tick becomes a column in your CSV.{' '}
            <span
              style={{ display: 'inline-flex', verticalAlign: 'middle' }}
              onMouseEnter={() => { setAnchor(helpRef.current?.getBoundingClientRect() ?? null); setPreviewOpen(true); }}
              onMouseLeave={() => setPreviewOpen(false)}
            >
              <button
                ref={helpRef}
                type="button"
                aria-label="Preview how the CSV columns will look"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 99, border: 'none', background: 'var(--dark-6)', cursor: 'help', padding: 0 }}
              >
                <Help size={12} color="var(--dark-60)" />
              </button>
            </span>
          </Text>
        }
      />
      <Modal.Content>
        {previewOpen && anchor && createPortal(
          <CsvPreview fields={activeFields} leads={filteredLeads.slice(0, 4)} anchor={anchor} />,
          document.body,
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* columns — lead details */}
          <div>
            <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 10 }}>Lead details</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
              {detailFields.map(renderCheckbox)}
            </div>
          </div>

          {/* columns — qualification criteria */}
          <div>
            <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 10 }}>Qualification criteria</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
              {qualFields.map(renderCheckbox)}
            </div>
          </div>

          {/* filter which leads to include */}
          <div style={{ borderTop: '1px solid var(--dark-8)', paddingTop: 20 }}>
            <Heading level={5} style={{ margin: '0 0 2px' }}>Filter leads</Heading>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block', marginBottom: 14 }}>Optional — export only the leads that match.</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
              <FilterSelect label="Method" value={methodFilter} onChange={setMethodFilter} options={methodOptions} />
              <FilterSelect label="Primary service" value={serviceFilter} onChange={setServiceFilter} options={serviceOptions} />
              <FilterSelect label="Zip code" value={zipFilter} onChange={setZipFilter} options={zipOptions} />
            </div>
          </div>

          {/* not sure? contact your strategist — kept subtle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid var(--dark-5)', borderRadius: 10 }}>
            <Avatar fallback={STRATEGIST.initials} size={28} style={{ background: 'var(--purple)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Text variant="secondary" style={{ color: 'var(--dark-90)', fontWeight: 500, lineHeight: 1.3 }}>Not sure what to include?</Text>
              <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.3 }}>{STRATEGIST.name} · {STRATEGIST.title}</Text>
            </div>
            <Button variant="tertiary" size="sm">Message</Button>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="subtle" onPress={close}>Cancel</Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Text variant="secondary" style={{ color: 'var(--dark-60)', marginRight: 12 }}>
            {isFiltered ? `${filteredLeads.length} of ${leads.length} leads` : `${leads.length} leads`}
          </Text>
          <Modal.FooterButton
            variant="primary"
            frontIcon={Download}
            isDisabled={activeFields.length === 0 || filteredLeads.length === 0}
            onPress={() => { downloadLeadsCsv(activeFields, filteredLeads); close(); }}
          >
            Export CSV
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

