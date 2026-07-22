import { useMemo, useState } from 'react';
import { Button, Heading, Text } from '@/components';
import { StatusPill, Avatar, Card, SegmentedControl } from '@/staging';
import {
  type Lead,
  formatRelative,
  avatarColor,
  relativeMinutesAgo,
} from '../h2-port/sdr-data';
import ColumnVertical3 from '@/icons/20/ColumnVertical3';
import List from '@/icons/20/List';
import { requestType } from '../h2-port/leads-table-kit';
import { localPhone } from '../h2-port/qualification-answer';
import { SearchField, ViewFiltersButton, StatusDropdown, TOOLBAR_SIZING_CSS } from './LeadsShared';
import {
  type Handler,
  type LeadStatus,
  type PipelineScope,
  type ViewFilters,
  type HandlerOverrides,
  type LeadStatusOverrides,
  LEAD_STATUS_STYLES,
  LEAD_STATUS_DESC,
  LEAD_STATUS_OPTIONS,
  HANDLER_STYLES,
  HANDLER_DESC,
  HANDLER_OPTIONS,
  SCOPE_STATUSES,
  DEFAULT_VIEW_FILTERS,
  handlerOf,
  leadStatusOf,
  leadBudget,
  applyViewFilters,
  matchesViewQuery,
} from './leads-view';

/**
 * Leads — the sales-opportunity view. Non-Lead conversations stay in
 * Conversations; everything else lands on this board: Info Needed → Unbooked →
 * Booked (Active), Disqualified · Lost (Closed). A view toggle flips the same
 * rows into a salesperson list. Search + Filters work in both.
 */

const LIST_GRID = '260px minmax(140px, 1fr) 104px 176px 150px 84px';

function initials(name: string): string {
  return name.split(/\s+/).map((w) => w.charAt(0).toUpperCase()).slice(0, 2).join('');
}

/** Best contact handle for the prospect: phone, falling back to email. */
function contactHandle(lead: Lead): string {
  return lead.prospect.phone ? localPhone(lead.prospect.phone) : lead.prospect.email;
}

/** Card meta shown across from the last-activity stamp: the booked appointment
 *  date for a Booked lead, else the service type. */
function cardMeta(lead: Lead, status: LeadStatus): string {
  if (status === 'booked' && lead.scheduled_at) return lead.scheduled_at;
  return requestType(lead);
}

// ─── Kanban ──────────────────────────────────────────────────────────

function KanbanCard({ lead, status, onOpen }: { lead: Lead; status: LeadStatus; onOpen: () => void }) {
  return (
    <Card
      interactive
      padding="md"
      onClick={onOpen}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 14 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Avatar fallback={initials(lead.prospect.name)} size={32} style={{ background: avatarColor(lead.prospect.name), flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <Heading level={5} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.prospect.name}
          </Heading>
          <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {contactHandle(lead)}
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <Text variant="metadata" color="var(--dark-60)" style={{ fontSize: 14, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cardMeta(lead, status)}
          </Text>
          {leadBudget(lead) && (
            <Text variant="metadata" color="var(--dark-60)" style={{ fontSize: 14, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {leadBudget(lead)}
            </Text>
          )}
        </div>
        <Text variant="secondary" color="var(--dark-40)" style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {formatRelative(lead.last_activity_at)}
        </Text>
      </div>
    </Card>
  );
}

function KanbanColumn({ status, leads, onOpen }: { status: LeadStatus; leads: Lead[]; onOpen: (rows: Lead[], index: number) => void }) {
  const ss = LEAD_STATUS_STYLES[status];
  return (
    <div style={{ flex: '1 1 0', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* status left, count right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <StatusPill tone={ss.tone} size="md" style={{ fontSize: 16, lineHeight: '22px', padding: '3px 12px', borderRadius: 8 }}>{ss.label}</StatusPill>
        <Text variant="metadata" color="var(--dark-60)" style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{leads.length}</Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120 }}>
        {leads.map((lead, i) => (
          <KanbanCard key={lead.id} lead={lead} status={status} onOpen={() => onOpen(leads, i)} />
        ))}
        {leads.length === 0 && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <Text variant="metadata" color="var(--dark-40)">Nothing here</Text>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanBoard({ statuses, byStatus, onOpen }: { statuses: LeadStatus[]; byStatus: Record<string, Lead[]>; onOpen: (rows: Lead[], index: number) => void }) {
  // No backdrop panel — the board sits directly on the white page, with white
  // cards carrying the structure. Columns stay flush with the toolbar edges.
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
      {statuses.map((status) => (
        <KanbanColumn key={status} status={status} leads={byStatus[status] ?? []} onOpen={onOpen} />
      ))}
    </div>
  );
}

// ─── List ────────────────────────────────────────────────────────────

function ListRow({
  lead,
  status,
  handler,
  isLast,
  onSetHandler,
  onSetLeadStatus,
  onOpen,
}: {
  lead: Lead;
  status: LeadStatus;
  handler: Handler;
  isLast: boolean;
  onSetHandler: (id: string, h: Handler) => void;
  onSetLeadStatus: (id: string, s: LeadStatus) => void;
  onOpen: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      style={{
        display: 'grid', gridTemplateColumns: LIST_GRID, gap: 12, padding: '12px 28px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)', alignItems: 'center', cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Prospect */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Avatar fallback={initials(lead.prospect.name)} size={34} style={{ background: avatarColor(lead.prospect.name), flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <Heading level={5} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.prospect.name}
          </Heading>
          <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {localPhone(lead.prospect.phone)}
          </Text>
        </div>
      </div>

      {/* Service */}
      <div style={{ minWidth: 0 }}>
        <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {requestType(lead)}
        </Text>
      </div>

      {/* Budget */}
      <div style={{ minWidth: 0 }}>
        <Text variant="secondary" style={{ fontSize: 14, color: leadBudget(lead) ? 'var(--dark-90)' : 'var(--dark-40)', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {leadBudget(lead) || '—'}
        </Text>
      </div>

      {/* Handler */}
      <div style={{ minWidth: 0 }}>
        <StatusDropdown value={handler} options={HANDLER_OPTIONS} styles={HANDLER_STYLES} descs={HANDLER_DESC} onChange={(h) => onSetHandler(lead.id, h)} ariaLabel="Change handler" />
      </div>

      {/* Lead status */}
      <div style={{ minWidth: 0 }}>
        <StatusDropdown value={status} options={LEAD_STATUS_OPTIONS} styles={LEAD_STATUS_STYLES} descs={LEAD_STATUS_DESC} onChange={(s) => onSetLeadStatus(lead.id, s)} ariaLabel="Change lead status" />
      </div>

      {/* Updated */}
      <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {formatRelative(lead.last_activity_at)}
      </Text>
    </div>
  );
}

function LeadsList({
  statuses,
  byStatus,
  handlerOv,
  onSetHandler,
  onSetLeadStatus,
  onOpen,
}: {
  statuses: LeadStatus[];
  byStatus: Record<string, Lead[]>;
  handlerOv: HandlerOverrides;
  onSetHandler: (id: string, h: Handler) => void;
  onSetLeadStatus: (id: string, s: LeadStatus) => void;
  onOpen: (rows: Lead[], index: number) => void;
}) {
  // Pipeline order, newest-first within each status — the same order the board
  // reads top-to-bottom, flattened.
  const rows = useMemo(() => statuses.flatMap((s) => (byStatus[s] ?? []).map((lead) => ({ lead, status: s }))), [statuses, byStatus]);
  return (
    <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: LIST_GRID, gap: 12, padding: '8px 28px', borderBottom: '1px solid var(--dark-8)', fontSize: 12, letterSpacing: '0.24px', color: 'var(--dark-60)' }}>
        <span>Prospect</span>
        <span>Service</span>
        <span>Budget</span>
        <span>Handler</span>
        <span>Lead status</span>
        <span>Updated</span>
      </div>
      {rows.map(({ lead, status }, i) => (
        <ListRow
          key={lead.id}
          lead={lead}
          status={status}
          handler={handlerOf(lead, handlerOv)}
          isLast={i === rows.length - 1}
          onSetHandler={onSetHandler}
          onSetLeadStatus={onSetLeadStatus}
          onOpen={() => onOpen(rows.map((r) => r.lead), i)}
        />
      ))}
    </div>
  );
}

// ─── Pipeline shell ──────────────────────────────────────────────────

export function LeadsPipeline({
  leads,
  onOpen,
  handlerOv,
  leadStatusOv,
  onSetHandler,
  onSetLeadStatus,
}: {
  leads: Lead[];
  onOpen: (rows: Lead[], index: number) => void;
  handlerOv: HandlerOverrides;
  leadStatusOv: LeadStatusOverrides;
  onSetHandler: (id: string, h: Handler) => void;
  onSetLeadStatus: (id: string, s: LeadStatus) => void;
}) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<PipelineScope>('active');
  // View is remembered per scope: Active opens on the board, Closed opens on
  // the list — and each side keeps whatever the user last switched it to.
  const [viewByScope, setViewByScope] = useState<Record<PipelineScope, 'board' | 'list'>>({ active: 'board', closed: 'list' });
  const view = viewByScope[scope];
  const setView = (v: 'board' | 'list') => setViewByScope((prev) => ({ ...prev, [scope]: v }));
  const [filters, setFilters] = useState<ViewFilters>(DEFAULT_VIEW_FILTERS);

  const statuses = SCOPE_STATUSES[scope];

  const filtered = useMemo(
    () => applyViewFilters(leads, filters, handlerOv, leadStatusOv).filter((l) => matchesViewQuery(l, query)),
    [leads, filters, query, handlerOv, leadStatusOv],
  );

  // Group into the current scope's statuses, newest activity first within each.
  const byStatus = useMemo(() => {
    const groups = Object.fromEntries(statuses.map((s) => [s, [] as Lead[]])) as Record<string, Lead[]>;
    for (const lead of filtered) {
      const s = leadStatusOf(lead, leadStatusOv);
      if (groups[s]) groups[s].push(lead);
    }
    for (const s of statuses) groups[s].sort((a, b) => relativeMinutesAgo(a.last_activity_at) - relativeMinutesAgo(b.last_activity_at));
    return groups;
  }, [filtered, statuses, leadStatusOv]);

  const shown = statuses.reduce((n, s) => n + (byStatus[s]?.length ?? 0), 0);

  return (
    <>
      <div className="dfy-lead-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
        <style>{TOOLBAR_SIZING_CSS}</style>
        <SearchField value={query} onChange={setQuery} placeholder="Search leads" size="md" />
        <Text variant="metadata" color="var(--dark-60)" style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {shown} lead{shown === 1 ? '' : 's'}
        </Text>
        <SegmentedControl
          size="md"
          aria-label="View"
          className="leads-scope-toggle leads-view-seg"
          value={view}
          onChange={(v) => setView(v as 'board' | 'list')}
          options={[
            { value: 'board', icon: ColumnVertical3, ariaLabel: 'Board view' },
            { value: 'list', icon: List, ariaLabel: 'List view' },
          ]}
        />
        <ScopeToggleLocal value={scope} onChange={setScope} />
        <ViewFiltersButton filters={filters} onChange={setFilters} size="md" />
      </div>

      {shown === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '56px 0', background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12 }}>
          <Text variant="secondary" color="var(--dark-60)">No leads match your filters.</Text>
          <Button variant="tertiary" size="sm" onPress={() => { setQuery(''); setFilters(DEFAULT_VIEW_FILTERS); }}>Clear filters</Button>
        </div>
      ) : view === 'board' ? (
        <KanbanBoard statuses={statuses} byStatus={byStatus} onOpen={onOpen} />
      ) : (
        <LeadsList statuses={statuses} byStatus={byStatus} handlerOv={handlerOv} onSetHandler={onSetHandler} onSetLeadStatus={onSetLeadStatus} onOpen={onOpen} />
      )}
    </>
  );
}

/** Active/Closed scope toggle — reuses the kit's subtle SegmentedControl skin
 *  via a thin wrapper so the styling matches the conversations toggle exactly. */
function ScopeToggleLocal({ value, onChange }: { value: PipelineScope; onChange: (v: PipelineScope) => void }) {
  return (
    <>
      <style>{`
        .leads-scope-toggle [role="tab"] { background: var(--dark-2) !important; color: var(--dark-60) !important; font-size: 14px !important; }
        .leads-scope-toggle [role="tab"] + [role="tab"] { border-left: 1px solid var(--dark-8) !important; }
        .leads-scope-toggle [role="tab"]:hover { color: var(--dark-90) !important; }
        .leads-scope-toggle [role="tab"][aria-selected="true"] { background: var(--light-100) !important; color: var(--dark-90) !important; }
      `}</style>
      <SegmentedControl
        size="md"
        aria-label="Lead scope"
        className="leads-scope-toggle"
        value={value}
        onChange={(v) => onChange(v as PipelineScope)}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'closed', label: 'Closed' },
        ]}
      />
    </>
  );
}
