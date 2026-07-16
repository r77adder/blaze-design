import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Text } from '@/components';
import { Checkbox, Select, SegmentedControl, TextField } from '@/staging';
import Search from '@/icons/20/Search';
import Filter from '@/icons/20/Filter';
import ArrowUp from '@/icons/20/ArrowUp';
import ArrowDown from '@/icons/20/ArrowDown';
import ChevronDown from '@/icons/20/ChevronDown';
import {
  METHOD_LABELS,
  STATUS_STYLES,
  BOOKING_OUTCOME_STYLES,
  ALL_BOOKING_OUTCOMES,
  effectiveBookingOutcome,
  relativeMinutesAgo,
  type Lead,
  type Status,
} from './sdr-data';
import { leadZip, leadService, SAMPLE_ZIPS, FLOORING_SERVICES } from './qualification-answer';

/**
 * Shared CRM-style leads-table kit — the single source for the filter + sort
 * model and toolbar/table chrome used by BOTH the AM inbox
 * (h2-port/pages/Sdr.tsx) and the client portal (dfy-client/Leads.tsx), plus
 * both Export modals. Keeping it in one module is what guarantees the two
 * sides (and their CSV exports) can never drift.
 *
 * Modeled on classic CRM list views (Pipedrive / HubSpot / Salesforce):
 * search on the left; one consolidated Filters button (count badge + dark-90
 * border while active) opening a popover with two sections — lead details
 * (single-select dropdowns) and qualification criteria (multi-select
 * dropdowns); sortable column headers; per-filter Clear buttons.
 */

// ─── Columns + sorting ───────────────────────────────────────────────

export const LEADS_GRID = '300px 76px minmax(140px, 1fr) 136px 76px';

export const STATUS_FUNNEL_ORDER: Status[] = ['human-handling', 'ai-handling', 'resolved', 'opted-out'];

/** Best-guess "call reason" from the lead's source / need / tags. */
export function requestType(lead: Lead): string {
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

export type SortKey = 'prospect' | 'method' | 'reason' | 'status' | 'time';
export type SortDir = 'asc' | 'desc';
export type SortState = { key: SortKey; dir: SortDir };

/** Natural ascending value per sortable column. `time` uses a timestamp proxy
 *  (negative minutes-ago) so desc = newest first, matching CRM conventions. */
const SORT_VALUE: Record<SortKey, (l: Lead) => string | number> = {
  prospect: (l) => l.prospect.name.toLowerCase(),
  method: (l) => METHOD_LABELS[l.method],
  reason: (l) => requestType(l).toLowerCase(),
  status: (l) => STATUS_FUNNEL_ORDER.indexOf(l.status),
  time: (l) => -relativeMinutesAgo(l.last_activity_at),
};

/** First-click direction per column: text/funnel columns start A→Z, the time
 *  column starts newest-first. */
export const DEFAULT_DIR: Record<SortKey, SortDir> = {
  prospect: 'asc',
  method: 'asc',
  reason: 'asc',
  status: 'asc',
  time: 'desc',
};

/** Default: funnel order (Needs Attention first), newest-first within each
 *  status via the always-on time tiebreak in sortLeads. */
export const DEFAULT_SORT: SortState = { key: 'status', dir: 'asc' };

// ─── Scope (Active / Closed) ─────────────────────────────────────────
// Pipedrive-style partition: the working inbox (needs attention + AI
// handling) vs the closed pile (resolved + opted out). A segmented toggle in
// the toolbar switches between them; the status filter only offers the
// statuses of the current scope.

export type LeadScope = 'active' | 'closed';

export const SCOPE_STATUSES: Record<LeadScope, Status[]> = {
  active: ['human-handling', 'ai-handling'],
  closed: ['resolved', 'opted-out'],
};

export const DEFAULT_SCOPE: LeadScope = 'active';

export function applyScope(leads: Lead[], scope: LeadScope): Lead[] {
  return leads.filter((l) => SCOPE_STATUSES[scope].includes(l.status));
}

export function statusOptionsFor(scope: LeadScope) {
  return [
    { value: 'all', label: 'All statuses' },
    ...SCOPE_STATUSES[scope].map((s) => ({ value: s, label: STATUS_STYLES[s].label })),
  ];
}

// ─── Filter model ────────────────────────────────────────────────────
// Shared between each table and its export modal: the table owns the state,
// and Export opens seeded with the exact same values. Qualification criteria
// (service, zip) are multi-select: empty = no filter.

export interface LeadFilters {
  status: string;
  method: string;
  time: string;
  services: string[];
  zips: string[];
}

export const DEFAULT_FILTERS: LeadFilters = { status: 'all', method: 'all', time: 'all', services: [], zips: [] };

export const METHOD_OPTIONS = [
  { value: 'all', label: 'All methods' },
  ...Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label })),
];
export const TIME_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

/** Toggle one value in a multi-select list. */
export const toggleItem = (list: string[], item: string) =>
  list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

function matchesTime(lead: Lead, time: string): boolean {
  if (time === 'all') return true;
  const mins = relativeMinutesAgo(lead.last_activity_at);
  if (time === 'today') return mins <= 24 * 60;
  if (time === '7d') return mins <= 7 * 24 * 60;
  return mins <= 30 * 24 * 60;
}

export function applyFilters(leads: Lead[], f: LeadFilters): Lead[] {
  return leads.filter((l) =>
    (f.status === 'all' || l.status === f.status) &&
    (f.method === 'all' || l.method === f.method) &&
    (f.services.length === 0 || f.services.includes(leadService(l))) &&
    (f.zips.length === 0 || f.zips.includes(leadZip(l))) &&
    matchesTime(l, f.time));
}

export function sortLeads(leads: Lead[], sort: SortState): Lead[] {
  const value = SORT_VALUE[sort.key];
  const m = sort.dir === 'asc' ? 1 : -1;
  return [...leads].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    const primary = (va < vb ? -1 : va > vb ? 1 : 0) * m;
    if (primary !== 0) return primary;
    // Ties always break newest-first, so e.g. the default status sort reads
    // Needs Attention → AI Handling with fresh activity on top of each block.
    return relativeMinutesAgo(a.last_activity_at) - relativeMinutesAgo(b.last_activity_at);
  });
}

export const activeFilterCount = (f: LeadFilters) =>
  [f.status, f.method, f.time].filter((v) => v !== 'all').length +
  (f.services.length > 0 ? 1 : 0) +
  (f.zips.length > 0 ? 1 : 0);

/** Free-text search across name, phone, company/location, and call reason. */
export function matchesQuery(lead: Lead, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  return `${lead.prospect.name} ${lead.prospect.phone} ${lead.location ?? lead.prospect.company} ${requestType(lead)}`
    .toLowerCase()
    .includes(q);
}

// ─── Filter controls ─────────────────────────────────────────────────

/** Section title inside the filters popover / export filter area. */
export function FilterSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="primary" style={{ display: 'block', color: 'var(--dark-90)' }}>{children}</Text>
  );
}

/** Labeled filter wrapper: field label on the left, a Clear button on the
 *  right (shown only while the filter is active) that clears just this
 *  filter. */
export function FilterField({ label, onClear, children }: { label: string; onClear?: () => void; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, minHeight: 18 }}>
        <Text variant="metadata" color="var(--dark-60)">{label}</Text>
        {onClear && (
          <Button variant="tertiary" size="xs" aria-label={`Clear ${label.toLowerCase()} filter`} onPress={onClear}>Clear</Button>
        )}
      </div>
      {children}
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options, onClear }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; onClear?: () => void }) {
  return (
    <FilterField label={label} onClear={onClear}>
      <Select value={value} onChange={onChange} options={options} size="md" fullWidth aria-label={label} />
    </FilterField>
  );
}

/** Dropdown multi-select: a Select-look trigger opening a checkbox list that
 *  stays open across toggles. The menu portals to <body> with fixed
 *  positioning (same approach as the staging Select) so it never clips inside
 *  the filters popover or an export modal. */
export function MultiSelect({
  placeholder,
  unitPlural,
  options,
  selected,
  onToggle,
  'aria-label': ariaLabel,
}: {
  placeholder: string;
  /** Trigger label for 2+ picks, e.g. "2 services". One pick shows its value. */
  unitPlural: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  'aria-label'?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (r) setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const label =
    selected.length === 0 ? placeholder
    : selected.length === 1 ? selected[0]
    : `${selected.length} ${unitPlural}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%',
          fontFamily: 'inherit', fontSize: 14, letterSpacing: '0.28px',
          color: selected.length ? 'var(--dark-90)' : 'var(--dark-40)',
          background: 'var(--light-100)', border: `1px solid ${open ? 'var(--dark-40)' : 'var(--dark-8)'}`,
          borderRadius: 8, padding: '9px 12px', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <ChevronDown size={16} color="var(--dark-60)" />
      </button>
      {open && coords && createPortal(
        <>
          {/* outside-click catcher */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 3000 }} />
          <div
            role="listbox"
            aria-multiselectable="true"
            style={{
              position: 'fixed', top: coords.top, left: coords.left, minWidth: coords.width, maxHeight: 264, overflowY: 'auto',
              zIndex: 3001, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10,
              boxShadow: '0 12px 32px rgba(0,0,0,0.08)', padding: 6, display: 'flex', flexDirection: 'column', gap: 2,
            }}
          >
            {options.map((o) => (
              <div key={o} style={{ padding: '4px 6px', borderRadius: 6 }}>
                <Checkbox checked={selected.includes(o)} onChange={() => onToggle(o)} style={{ gap: 10, width: '100%' }}>
                  <Text variant="primary" style={{ color: 'var(--dark-90)' }}>{o}</Text>
                </Checkbox>
              </div>
            ))}
          </div>
        </>,
        document.body,
      )}
    </>
  );
}

/** Shared chrome for the consolidated "Filters" controls (Pipedrive-style):
 *  a trigger button with an active-count badge + dark-90 border while
 *  filters are on, opening a right-aligned popover with the given fields. */
function FiltersPopoverShell({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Button doesn't forward arbitrary styles; a scoped rule carries the
          dark-90 border on the trigger — applied only while filters are on,
          same as the counter badge */}
      <style>{`.leads-filters-trigger, .leads-filters-trigger:hover { border-color: var(--dark-90) !important; }`}</style>
      <Button variant="secondary" size="sm" frontIcon={Filter} className={count > 0 ? 'leads-filters-trigger' : undefined} onPress={() => setOpen((o) => !o)}>
        Filters
        {count > 0 && (
          <span
            aria-label={`${count} filter${count === 1 ? '' : 's'} applied`}
            style={{
              marginLeft: 6, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
              background: 'var(--dark-90)', color: 'var(--light-100)',
              fontSize: 11, fontWeight: 500, fontVariantNumeric: 'tabular-nums',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle',
            }}
          >
            {count}
          </span>
        )}
      </Button>
      {open && (
        <>
          {/* outside-click catcher */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
          <div
            role="dialog"
            aria-label="Filters"
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 300, zIndex: 20,
              background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.08)', padding: 16,
              display: 'flex', flexDirection: 'column', gap: 24,
            }}
          >
            {children}
          </div>
        </>
      )}
    </span>
  );
}

/** The leads Filters control: two sections — lead details (status, method,
 *  last activity) and qualification criteria (service, zip as multi-select
 *  dropdowns). Each active filter clears individually via the Clear beside
 *  its label. */
export function FiltersButton({ filters, onChange, scope = 'active' }: { filters: LeadFilters; onChange: (f: LeadFilters) => void; scope?: LeadScope }) {
  const count = activeFilterCount(filters);
  const set = (patch: Partial<LeadFilters>) => onChange({ ...filters, ...patch });
  return (
    <FiltersPopoverShell count={count}>
      {/* section: lead details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FilterSectionLabel>Lead details</FilterSectionLabel>
        <FilterSelect label="Status" value={filters.status} onChange={(v) => set({ status: v })} options={statusOptionsFor(scope)} onClear={filters.status !== 'all' ? () => set({ status: 'all' }) : undefined} />
        <FilterSelect label="Method" value={filters.method} onChange={(v) => set({ method: v })} options={METHOD_OPTIONS} onClear={filters.method !== 'all' ? () => set({ method: 'all' }) : undefined} />
        <FilterSelect label="Last activity" value={filters.time} onChange={(v) => set({ time: v })} options={TIME_OPTIONS} onClear={filters.time !== 'all' ? () => set({ time: 'all' }) : undefined} />
      </div>

      {/* section: qualification criteria (multi-select) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FilterSectionLabel>Qualification criteria</FilterSectionLabel>
        <FilterField label="Primary service" onClear={filters.services.length > 0 ? () => set({ services: [] }) : undefined}>
          <MultiSelect placeholder="Any service" unitPlural="services" options={FLOORING_SERVICES} selected={filters.services} onToggle={(v) => set({ services: toggleItem(filters.services, v) })} aria-label="Filter by primary service" />
        </FilterField>
        <FilterField label="Zip code" onClear={filters.zips.length > 0 ? () => set({ zips: [] }) : undefined}>
          <MultiSelect placeholder="All zip codes" unitPlural="zip codes" options={SAMPLE_ZIPS} selected={filters.zips} onToggle={(v) => set({ zips: toggleItem(filters.zips, v) })} aria-label="Filter by zip code" />
        </FilterField>
      </div>

      {count > 0 && (
        <div>
          <Button variant="tertiary" size="sm" onPress={() => onChange(DEFAULT_FILTERS)}>Clear all</Button>
        </div>
      )}
    </FiltersPopoverShell>
  );
}

// ─── Toolbar + table header ──────────────────────────────────────────

/** Scope switch (Active/Closed, Upcoming/Past): the BDS SegmentedControl
 *  with a subtler selection — the picked segment sits white on a dark-4
 *  track instead of filling dark-90. */
export function ScopeToggle({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  'aria-label'?: string;
}) {
  return (
    <>
      {/* size sm keeps the 28px segment height; font bumps to 14px only */}
      <style>{`
        .leads-scope-toggle [role="tab"] { background: var(--dark-2) !important; color: var(--dark-60) !important; font-size: 14px !important; }
        .leads-scope-toggle [role="tab"] + [role="tab"] { border-left: 1px solid var(--dark-8) !important; }
        .leads-scope-toggle [role="tab"]:hover { color: var(--dark-90) !important; }
        .leads-scope-toggle [role="tab"][aria-selected="true"] { background: var(--light-100) !important; color: var(--dark-90) !important; }
      `}</style>
      <SegmentedControl size="sm" aria-label={ariaLabel} className="leads-scope-toggle" value={value} onChange={onChange} options={options} />
    </>
  );
}

/** Toolbar above the table: search on the left; live count, the
 *  Active/Closed scope toggle, and the consolidated Filters on the right —
 *  classic CRM list view. */
export function LeadsToolbar({
  query,
  onQueryChange,
  scope,
  onScopeChange,
  filters,
  onFiltersChange,
  shownCount,
  totalCount,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  scope: LeadScope;
  onScopeChange: (s: LeadScope) => void;
  filters: LeadFilters;
  onFiltersChange: (f: LeadFilters) => void;
  shownCount: number;
  totalCount: number;
}) {
  // Switching scope drops a status filter that no longer applies (e.g.
  // "Resolved" while jumping back to Active).
  const changeScope = (v: string) => {
    const next = v as LeadScope;
    onScopeChange(next);
    if (filters.status !== 'all' && !SCOPE_STATUSES[next].includes(filters.status as Status)) {
      onFiltersChange({ ...filters, status: 'all' });
    }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', pointerEvents: 'none' }}>
          <Search size={16} color="var(--dark-90)" />
        </span>
        {/* size sm keeps the compact height/padding; fontSize bumps the text
            to 14px without changing the control's dimensions */}
        <TextField size="sm" placeholder="Search leads" aria-label="Search leads" value={query} onChange={onQueryChange} style={{ width: 200, paddingLeft: 32, fontSize: 14 }} />
      </span>
      <Text variant="metadata" color="var(--dark-60)" style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {shownCount !== totalCount ? `${shownCount} of ${totalCount} leads` : `${totalCount} leads`}
      </Text>
      <ScopeToggle
        aria-label="Lead scope"
        value={scope}
        onChange={changeScope}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'closed', label: 'Closed' },
        ]}
      />
      <FiltersButton filters={filters} onChange={onFiltersChange} scope={scope} />
    </div>
  );
}

/** Clickable column header; the active sort column darkens and carries an
 *  asc/desc arrow. */
export function SortHeader({ label, active, dir, onSort }: { label: string; active: boolean; dir: SortDir; onSort: () => void }) {
  const Arrow = dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={onSort}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3, justifySelf: 'start',
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.24px',
        color: active ? 'var(--dark-90)' : 'var(--dark-60)', fontWeight: active ? 500 : 400,
      }}
    >
      {label}
      {active && <Arrow size={12} color="var(--dark-90)" />}
    </button>
  );
}

export const LEAD_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'prospect', label: 'Prospect' },
  { key: 'method', label: 'Method' },
  { key: 'reason', label: 'Call reason' },
  { key: 'status', label: 'Status' },
  { key: 'time', label: 'Time' },
];

/** The table's sortable header row. Clicking a column toggles direction;
 *  a new column starts at its natural default direction. */
export function LeadsHeaderRow({ sort, onSortChange }: { sort: SortState; onSortChange: (s: SortState) => void }) {
  const setSortKey = (key: SortKey) =>
    onSortChange(sort.key === key ? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: DEFAULT_DIR[key] });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: LEADS_GRID, gap: 12, padding: '8px 28px', borderBottom: '1px solid var(--dark-8)' }}>
      {LEAD_COLUMNS.map((c) => (
        <SortHeader
          key={c.key}
          label={c.label}
          active={sort.key === c.key}
          dir={sort.key === c.key ? sort.dir : DEFAULT_DIR[c.key]}
          onSort={() => setSortKey(c.key)}
        />
      ))}
    </div>
  );
}

// ─── Bookings: scope + filters ───────────────────────────────────────
// The same toolbar pattern, adapted to the bookings schema: an
// Upcoming/Past scope toggle, search, and a Filters popover over the two
// discrete booking dimensions — outcome and scheduled month.

export type BookingScope = 'upcoming' | 'past';
export const DEFAULT_BOOKING_SCOPE: BookingScope = 'upcoming';

export interface BookingFilters {
  outcome: string;
  month: string;
}
export const DEFAULT_BOOKING_FILTERS: BookingFilters = { outcome: 'all', month: 'all' };

// Month helpers, parsed from the human `scheduled_at` label
// (e.g. "Mon, Jun 8 · 10:00 AM CT" → "Jun").
export const MONTH_FULL: Record<string, string> = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June',
  Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
};
const MONTH_ORDER = Object.keys(MONTH_FULL);
export const monthOf = (scheduledAt?: string): string | null => {
  const m = scheduledAt?.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/);
  return m ? m[1] : null;
};

export function applyBookingScope(bookings: Lead[], scope: BookingScope): Lead[] {
  return bookings.filter((b) => (scope === 'upcoming' ? (b.scheduled_when ?? 0) > 0 : (b.scheduled_when ?? 0) <= 0));
}

/** Upcoming sorts soonest-first, past most-recently-elapsed first. */
export function sortBookings(bookings: Lead[], scope: BookingScope): Lead[] {
  return [...bookings].sort((a, b) =>
    scope === 'upcoming'
      ? (a.scheduled_when ?? 0) - (b.scheduled_when ?? 0)
      : (b.scheduled_when ?? 0) - (a.scheduled_when ?? 0));
}

export function applyBookingFilters(bookings: Lead[], f: BookingFilters): Lead[] {
  return bookings.filter((b) =>
    (f.outcome === 'all' || effectiveBookingOutcome(b) === f.outcome) &&
    (f.month === 'all' || monthOf(b.scheduled_at) === f.month));
}

export const bookingActiveFilterCount = (f: BookingFilters) =>
  [f.outcome, f.month].filter((v) => v !== 'all').length;

/** Free-text search across name, phone, company, call reason, and location. */
export function matchesBookingQuery(booking: Lead, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  return `${booking.prospect.name} ${booking.prospect.phone} ${booking.prospect.company} ${requestType(booking)} ${booking.location ?? ''}`
    .toLowerCase()
    .includes(q);
}

export const OUTCOME_OPTIONS = [
  { value: 'all', label: 'All outcomes' },
  ...ALL_BOOKING_OUTCOMES.map((o) => ({ value: o, label: BOOKING_OUTCOME_STYLES[o].label })),
];

/** Distinct scheduled months present in the data, in calendar order. */
export function monthOptionsFor(bookings: Lead[]) {
  const present = new Set(bookings.map((b) => monthOf(b.scheduled_at)).filter(Boolean));
  return [
    { value: 'all', label: 'All months' },
    ...MONTH_ORDER.filter((m) => present.has(m)).map((m) => ({ value: m, label: MONTH_FULL[m] })),
  ];
}

/** The bookings Filters control: outcome + scheduled month, with the same
 *  per-filter Clear and Clear all affordances as the leads popover. */
export function BookingsFiltersButton({
  filters,
  onChange,
  monthOptions,
}: {
  filters: BookingFilters;
  onChange: (f: BookingFilters) => void;
  monthOptions: { value: string; label: string }[];
}) {
  const count = bookingActiveFilterCount(filters);
  return (
    <FiltersPopoverShell count={count}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FilterSelect label="Outcome" value={filters.outcome} onChange={(v) => onChange({ ...filters, outcome: v })} options={OUTCOME_OPTIONS} onClear={filters.outcome !== 'all' ? () => onChange({ ...filters, outcome: 'all' }) : undefined} />
        <FilterSelect label="Scheduled" value={filters.month} onChange={(v) => onChange({ ...filters, month: v })} options={monthOptions} onClear={filters.month !== 'all' ? () => onChange({ ...filters, month: 'all' }) : undefined} />
      </div>
      {count > 0 && (
        <div>
          <Button variant="tertiary" size="sm" onPress={() => onChange(DEFAULT_BOOKING_FILTERS)}>Clear all</Button>
        </div>
      )}
    </FiltersPopoverShell>
  );
}

/** Toolbar above the bookings table: search on the left; live count, the
 *  Upcoming/Past scope toggle, and Filters on the right. */
export function BookingsToolbar({
  query,
  onQueryChange,
  scope,
  onScopeChange,
  filters,
  onFiltersChange,
  monthOptions,
  shownCount,
  totalCount,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  scope: BookingScope;
  onScopeChange: (s: BookingScope) => void;
  filters: BookingFilters;
  onFiltersChange: (f: BookingFilters) => void;
  monthOptions: { value: string; label: string }[];
  shownCount: number;
  totalCount: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', pointerEvents: 'none' }}>
          <Search size={16} color="var(--dark-90)" />
        </span>
        {/* 14px text on the compact sm control — matches the leads search */}
        <TextField size="sm" placeholder="Search bookings" aria-label="Search bookings" value={query} onChange={onQueryChange} style={{ width: 200, paddingLeft: 32, fontSize: 14 }} />
      </span>
      <Text variant="metadata" color="var(--dark-60)" style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {shownCount !== totalCount ? `${shownCount} of ${totalCount} bookings` : `${totalCount} bookings`}
      </Text>
      <ScopeToggle
        aria-label="Booking scope"
        value={scope}
        onChange={(v) => onScopeChange(v as BookingScope)}
        options={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past' },
        ]}
      />
      <BookingsFiltersButton filters={filters} onChange={onFiltersChange} monthOptions={monthOptions} />
    </div>
  );
}
