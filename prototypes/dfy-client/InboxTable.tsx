import { useMemo, useState } from 'react';
import { Button, Heading, Text } from '@/components';
import { Avatar } from '@/staging';
import Voice from '@/icons/20/Voice';
import MessageText2 from '@/icons/20/MessageText2';
import MessageChat01 from '@/icons/20/MessageChat01';
import {
  type Lead,
  METHOD_LABELS,
  formatRelative,
  avatarColor,
  isUnread,
} from '../h2-port/sdr-data';
import { ScopeToggle, SortHeader } from '../h2-port/leads-table-kit';
import { localPhone } from '../h2-port/qualification-answer';
import { SearchField, ViewFiltersButton, StatusDropdown, Tooltip, TOOLBAR_SIZING_CSS } from './LeadsShared';
import {
  type Handler,
  type LeadStatus,
  type HandlerOverrides,
  type LeadStatusOverrides,
  type ConvSort,
  type ConvSortKey,
  type ViewFilters,
  HANDLER_STYLES,
  HANDLER_DESC,
  HANDLER_OPTIONS,
  LEAD_STATUS_STYLES,
  LEAD_STATUS_DESC,
  LEAD_STATUS_OPTIONS,
  CONV_COLUMNS,
  CONV_DEFAULT_DIR,
  DEFAULT_VIEW_FILTERS,
  handlerOf,
  leadStatusOf,
  contactReason,
  sortConversations,
  applyViewFilters,
  matchesViewQuery,
} from './leads-view';

/**
 * Conversations — every inbound contact the AI Receptionist has captured, lead
 * or not. A flat table with two changeable axes per row: the Lead status
 * (Non-Lead → Booked) and the Handler (AI vs a teammate). Human Followup sorts
 * to the top by default; the Active/Resolved toggle splits open work from
 * wrapped-up inquiries.
 */

const CONV_GRID = '300px 84px 156px minmax(150px, 1fr) 176px 80px';

function initials(name: string): string {
  return name.split(/\s+/).map((w) => w.charAt(0).toUpperCase()).slice(0, 2).join('');
}

function MethodCell({ lead }: { lead: Lead }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      {lead.method === 'call' && <Voice size={14} color="var(--dark-60)" />}
      {lead.method === 'sms' && <MessageText2 size={14} color="var(--dark-60)" />}
      {lead.method === 'other' && <MessageChat01 size={14} color="var(--dark-60)" />}
      <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14 }}>{METHOD_LABELS[lead.method]}</Text>
    </div>
  );
}

function ConvRow({
  lead,
  isLast,
  handlerOv,
  leadStatusOv,
  onSetHandler,
  onSetLeadStatus,
  onOpen,
}: {
  lead: Lead;
  isLast: boolean;
  handlerOv: HandlerOverrides;
  leadStatusOv: LeadStatusOverrides;
  onSetHandler: (id: string, h: Handler) => void;
  onSetLeadStatus: (id: string, s: LeadStatus) => void;
  onOpen: () => void;
}) {
  const unread = isUnread(lead);
  const baseBg = unread ? 'var(--light-100)' : 'var(--dark-2)';
  const hoverBg = unread ? 'var(--dark-2)' : 'var(--dark-4)';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); }
      }}
      style={{
        display: 'grid', gridTemplateColumns: CONV_GRID, gap: 12, padding: '12px 28px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)', alignItems: 'center',
        cursor: 'pointer', background: baseBg,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = baseBg)}
    >
      {/* Prospect */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, position: 'relative' }}>
        {unread && (
          <span
            aria-label="Unread"
            style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: 'var(--status-posting)' }}
          />
        )}
        <Avatar fallback={initials(lead.prospect.name)} size={34} style={{ background: avatarColor(lead.prospect.name), flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Heading level={5} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.prospect.name}
          </Heading>
          <Text variant="secondary" style={{ fontSize: 14, color: 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {localPhone(lead.prospect.phone)}
          </Text>
        </div>
      </div>

      {/* Method */}
      <MethodCell lead={lead} />

      {/* Lead status */}
      <div style={{ minWidth: 0 }}>
        <StatusDropdown
          value={leadStatusOf(lead, leadStatusOv)}
          options={LEAD_STATUS_OPTIONS}
          styles={LEAD_STATUS_STYLES}
          descs={LEAD_STATUS_DESC}
          onChange={(s) => onSetLeadStatus(lead.id, s)}
          ariaLabel="Change lead status"
        />
      </div>

      {/* Reason */}
      <div style={{ minWidth: 0 }}>
        <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {contactReason(lead)}
        </Text>
      </div>

      {/* Handler */}
      <div style={{ minWidth: 0 }}>
        <StatusDropdown
          value={handlerOf(lead, handlerOv)}
          options={HANDLER_OPTIONS}
          styles={HANDLER_STYLES}
          descs={HANDLER_DESC}
          onChange={(h) => onSetHandler(lead.id, h)}
          ariaLabel="Change handler"
        />
      </div>

      {/* Time */}
      <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {formatRelative(lead.last_activity_at)}
      </Text>
    </div>
  );
}

export function InboxTable({
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
  const [scope, setScope] = useState<'active' | 'resolved'>('active');
  const [filters, setFilters] = useState<ViewFilters>(DEFAULT_VIEW_FILTERS);
  const [sort, setSort] = useState<ConvSort>({ key: 'handler', dir: 'asc' });

  const scoped = useMemo(
    () => leads.filter((l) => {
      const resolved = handlerOf(l, handlerOv) === 'resolved';
      if (scope === 'active' && resolved) return false;
      if (scope === 'resolved') {
        if (!resolved) return false;
        // Resolved leads live in the Leads pipeline (Booked / Closed), so the
        // Resolved conversations view only holds wrapped-up non-lead inquiries.
        if (leadStatusOf(l, leadStatusOv) !== 'non-lead') return false;
      }
      return true;
    }),
    [leads, scope, handlerOv, leadStatusOv],
  );
  const rows = useMemo(
    () => sortConversations(
      applyViewFilters(scoped, filters, handlerOv, leadStatusOv).filter((l) => matchesViewQuery(l, query)),
      sort, handlerOv, leadStatusOv,
    ),
    [scoped, filters, query, sort, handlerOv, leadStatusOv],
  );

  const setSortKey = (key: ConvSortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: CONV_DEFAULT_DIR[key] }));

  return (
    <>
      <div className="dfy-lead-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <style>{TOOLBAR_SIZING_CSS}</style>
        <SearchField value={query} onChange={setQuery} placeholder="Search conversations" size="md" />
        <Text variant="metadata" color="var(--dark-60)" style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {rows.length !== scoped.length ? `${rows.length} of ${scoped.length} contacts` : `${scoped.length} contacts`}
        </Text>
        <ScopeToggle
          aria-label="Conversation scope"
          size="md"
          value={scope}
          onChange={(v) => setScope(v as 'active' | 'resolved')}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'resolved', label: 'Resolved' },
          ]}
        />
        <ViewFiltersButton filters={filters} onChange={setFilters} size="md" />
      </div>

      <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: CONV_GRID, gap: 12, padding: '8px 28px', borderBottom: '1px solid var(--dark-8)' }}>
          {CONV_COLUMNS.map((c) => {
            const header = (
              <SortHeader
                label={c.label}
                active={sort.key === c.key}
                dir={sort.key === c.key ? sort.dir : CONV_DEFAULT_DIR[c.key]}
                onSort={() => setSortKey(c.key)}
              />
            );
            return c.desc
              ? <Tooltip key={c.key} label={c.desc} side="bottom">{header}</Tooltip>
              : <span key={c.key}>{header}</span>;
          })}
        </div>
        {rows.map((lead, i) => (
          <ConvRow
            key={lead.id}
            lead={lead}
            isLast={i === rows.length - 1}
            handlerOv={handlerOv}
            leadStatusOv={leadStatusOv}
            onSetHandler={onSetHandler}
            onSetLeadStatus={onSetLeadStatus}
            onOpen={() => onOpen(rows, i)}
          />
        ))}
        {rows.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0' }}>
            <Text variant="secondary" color="var(--dark-60)">No contacts match your filters.</Text>
            <Button variant="tertiary" size="sm" onPress={() => { setQuery(''); setFilters(DEFAULT_VIEW_FILTERS); }}>Clear filters</Button>
          </div>
        )}
      </div>
    </>
  );
}
