import { useMemo, useState } from 'react';
import { Heading, Text, Modal, useModals, type StackModalProps } from '@/components';
import { StatusPill, Pill, Avatar } from '@/staging';
import Voice from '@/icons/20/Voice';
import MessageText2 from '@/icons/20/MessageText2';
import MessageChat01 from '@/icons/20/MessageChat01';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import {
  LEADS,
  type Lead,
  type Status,
  STATUS_STYLES,
  SOURCE_LABELS,
  METHOD_LABELS,
  LEAD_NEEDS_SUMMARY,
  scoreHeadline,
  formatRelative,
  conversationSummary,
  avatarColor,
  isUnread,
  truncate,
  relativeMinutesAgo,
} from '../h2/sdr-data';
import { ClientShell } from './shell';
import { ColdState } from './ColdState';
import { useClientState } from './dev-state';

/**
 * Leads — the AI Receptionist's lead inbox, surfaced as a first-party client
 * tab for Grain Design Flooring. Reuses H2's `LEADS` data in a read-only table
 * (clients watch the pipeline the receptionist is filling; they don't work the
 * queue). Each row is CLICKABLE → opens a view-only lead detail modal showing
 * the prospect, channel/method/status, score + qualification factors, and the
 * conversation summary.
 */

export function Leads() {
  const { state } = useClientState();
  const leads = LEADS;
  const { openModal } = useModals();

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
            'Qualification scores and full conversation summaries',
            'Booked appointments, ready to confirm',
          ]}
        />
      </ClientShell>
    );
  }

  const stats = useMemo(() => {
    const booked = leads.filter((l) => l.status === 'resolved').length;
    const avg = Math.round(leads.reduce((s, l) => s + l.score, 0) / Math.max(1, leads.length));
    return { total: leads.length, booked, avg };
  }, [leads]);

  return (
    <ClientShell section="leads">
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          <Kpi label="Leads captured" value={String(stats.total)} delta="this month" />
          <Kpi label="Booked" value={String(stats.booked)} delta="appointments" />
          <Kpi label="Avg. qualification" value={`${stats.avg}/100`} delta="lead score" />
        </div>

        <LeadsTable leads={leads} onOpen={(lead) => openModal(LeadDetailModal, { lead })} />
      </div>
    </ClientShell>
  );
}

// ─── AI Receptionist–style leads inbox ──────────────────────────────
// Mirrors the AI Receptionist's leads table (h2/pages/Sdr.tsx): leads grouped
// by status into collapsible sections, with the same five columns — Prospect ·
// Method · Call reason · What's needed · Time — and the same row treatment
// (avatar, unread blue dot, muted "nothing new" rows). Row click opens the
// existing view-only lead detail modal (link target unchanged).

const LEADS_GRID = '300px 68px 160px minmax(160px, 2fr) 64px';
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

function latestSnippet(lead: Lead): string {
  for (const t of [...lead.transcript].reverse()) {
    if (t.type === 'text' && t.content) return t.content;
    if (t.type === 'call' && t.call?.turns?.length) return t.call.turns[t.call.turns.length - 1].line;
  }
  return lead.transcript.length ? lead.transcript[lead.transcript.length - 1].content : '';
}

function whatsNeeded(lead: Lead): string {
  return LEAD_NEEDS_SUMMARY[lead.id] ?? lead.suggested_next_action?.summary ?? latestSnippet(lead);
}

function LeadRow({ lead, isLast, onOpen }: { lead: Lead; isLast: boolean; onOpen: () => void }) {
  const snippet = whatsNeeded(lead);
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

      {/* What's needed */}
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        {lead.status === 'ai-handling' && lead.callOutcome === 'live' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <StatusPill tone="danger" size="sm">Live</StatusPill>
            <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, whiteSpace: 'nowrap' }}>Call in progress</Text>
          </div>
        ) : lead.status === 'ai-handling' && lead.scheduled_at ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <StatusPill tone="success" size="sm">Scheduled</StatusPill>
            <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, whiteSpace: 'nowrap' }}>Nothing needed</Text>
          </div>
        ) : lead.status === 'ai-handling' && lead.callOutcome === 'successful' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <StatusPill tone="success" size="sm">Call successful</StatusPill>
            <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncate(snippet, 36)}</Text>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: unread ? 'var(--dark-90)' : 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4, fontWeight: unread ? 500 : 400 }}>
            {truncate(snippet, 60)}
          </div>
        )}
      </div>

      {/* Time */}
      <div style={{ fontSize: 12, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {formatRelative(lead.last_activity_at)}
      </div>
    </div>
  );
}

function LeadsTable({ leads, onOpen }: { leads: Lead[]; onOpen: (lead: Lead) => void }) {
  const [collapsed, setCollapsed] = useState<Set<Status>>(() => new Set<Status>(['resolved', 'opted-out']));
  const sorted = useMemo(
    () => [...leads].sort((a, b) => relativeMinutesAgo(a.last_activity_at) - relativeMinutesAgo(b.last_activity_at)),
    [leads],
  );
  const groups = STATUS_FUNNEL_ORDER
    .map((status) => ({ status, ss: STATUS_STYLES[status], groupLeads: sorted.filter((l) => l.status === status) }))
    .filter((g) => g.groupLeads.length > 0);

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
                    <span>What&apos;s needed</span>
                    <span>Time</span>
                  </div>
                )}
                {g.groupLeads.map((lead, i) => (
                  <LeadRow key={lead.id} lead={lead} isLast={i === g.groupLeads.length - 1} onOpen={() => onOpen(lead)} />
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

function LeadDetailModal({ lead, close }: StackModalProps & { lead: Lead }) {
  const st = STATUS_STYLES[lead.status];
  const summary = conversationSummary(lead);
  const sk = lead.scorecard;
  const scorecardRows = [
    ['Need', sk.need],
    ['Budget', sk.budget],
    ['Timeline', sk.timeline],
    ['Decision-maker', sk.decisionMaker],
    ...Object.entries(sk.custom ?? {}),
  ].filter((r): r is [string, string] => Boolean(r[1]));

  return (
    <Modal.Root size="md" aria-labelledby="lead-detail-title">
      <Modal.Header title={lead.prospect.name} id="lead-detail-title" onClose={close} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* status + score + channel strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <StatusPill tone={st.tone} size="sm">{st.label}</StatusPill>
            <StatusPill tone={lead.score >= 80 ? 'success' : lead.score >= 60 ? 'info' : lead.score >= 40 ? 'warning' : 'danger'} size="sm">
              {lead.score} · {scoreHeadline(lead.score)}
            </StatusPill>
            <Text variant="metadata" color="var(--dark-60)">
              {SOURCE_LABELS[lead.channel]} · {METHOD_LABELS[lead.method]}
            </Text>
          </div>

          {/* prospect contact card */}
          <Section title="Prospect">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px' }}>
              <Field label="Company" value={lead.prospect.company} />
              <Field label="Source" value={lead.first_touch_source} />
              <Field label="Phone" value={lead.prospect.phone} />
              <Field label="Email" value={lead.prospect.email} />
            </div>
          </Section>

          {/* conversation summary */}
          <Section title="Conversation summary">
            <Text variant="secondary" style={{ display: 'block', lineHeight: 1.6, color: 'var(--dark-80)' }}>
              {summary}
            </Text>
            {lead.scheduled_at && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--dark-4)',
                  fontSize: 14,
                  color: 'var(--dark-80)',
                }}
              >
                <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>Appointment</strong> · {lead.scheduled_at}
                {lead.location ? ` · ${lead.location}` : ''}
              </div>
            )}
          </Section>

          {/* qualification factors */}
          {lead.factors.length > 0 && (
            <Section title="Qualification factors">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {lead.factors.map((f) => (
                  <Pill key={f} size="md">{f}</Pill>
                ))}
              </div>
            </Section>
          )}

          {/* scorecard */}
          {scorecardRows.length > 0 && (
            <Section title="Scorecard">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {scorecardRows.map(([k, v], i) => (
                  <div
                    key={k}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr',
                      gap: 12,
                      padding: '9px 0',
                      borderTop: i > 0 ? '1px solid var(--dark-8)' : 'none',
                    }}
                  >
                    <Text variant="metadata" color="var(--dark-60)">{k}</Text>
                    <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.45 }}>{v}</Text>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <Text
        variant="metadata"
        color="var(--dark-60)"
        style={{ letterSpacing: '0.04em', display: 'block', marginBottom: 10 }}
      >
        {title}
      </Text>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 2 }}>{label}</Text>
      <Text variant="secondary" style={{ color: 'var(--dark-90)', wordBreak: 'break-word' }}>{value}</Text>
    </div>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: '14px 16px', background: 'var(--light-100)' }}>
      <Text variant="metadata" color="var(--dark-60)" style={{ letterSpacing: '0.04em', display: 'block' }}>{label}</Text>
      <Heading level={2} style={{ display: 'block', margin: '4px 0 2px' }}>{value}</Heading>
      <Text variant="metadata" color="var(--dark-60)">{delta}</Text>
    </div>
  );
}
