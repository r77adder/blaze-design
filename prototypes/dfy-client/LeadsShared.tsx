import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Text } from '@/components';
import { StatusPill, TextField } from '@/staging';
import Search from '@/icons/20/Search';
import Filter from '@/icons/20/Filter';
import ChevronDown from '@/icons/16/ChevronDown';
import Check from '@/icons/16/Check';
import {
  FilterField,
  FilterSelect,
  MultiSelect,
  METHOD_OPTIONS,
  TIME_OPTIONS,
  toggleItem,
} from '../h2-port/leads-table-kit';
import { FLOORING_SERVICES, SAMPLE_ZIPS } from '../h2-port/qualification-answer';
import {
  type ViewFilters,
  type PillStyle,
  type Handler,
  type LeadStatus,
  DEFAULT_VIEW_FILTERS,
  viewFilterCount,
  HANDLER_STYLES,
  HANDLER_OPTIONS,
  LEAD_STATUS_STYLES,
  LEAD_STATUS_OPTIONS,
  LEAD_STATUS_CLOSED,
} from './leads-view';

/**
 * Toolbar chrome + status controls shared by both client surfaces
 * (Conversations table + Leads board). Composed from kit primitives so the
 * filter controls can't drift from the AM side's.
 */

/** Sizes the segmented toggles inside a `.dfy-lead-toolbar` to match the
 *  secondary Filters button beside them: 32px tall (30px segment + 1px border
 *  each side) with 8px side padding. Icon-only segments become 36px wide so a
 *  20px icon carries the same 8px of side space. Scoped to the client toolbars
 *  so the shared kit / AM controls keep their own sizing. */
export const TOOLBAR_SIZING_CSS = `
  .dfy-lead-toolbar [role="tab"] { height: 30px !important; padding: 0 8px !important; }
  .dfy-lead-toolbar .leads-view-seg [role="tab"] { width: 36px !important; padding: 0 !important; }
`;

// ─── Tooltip ─────────────────────────────────────────────────────────

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

/** Hover tooltip — a dark bubble portaled to <body> so it never clips, measured
 *  after render to flip away from any viewport edge (top↔bottom, left↔right) and
 *  clamp inside the screen. `disabled` suppresses it (e.g. while a dropdown is
 *  open so the tooltip never covers the menu). `block` makes the wrapper fill
 *  its row for full-width menu items. */
export function Tooltip({ label, side = 'top', disabled = false, block = false, children }: { label: string; side?: TooltipSide; disabled?: boolean; block?: boolean; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!show || !wrapRef.current || !tipRef.current) return;
    const t = wrapRef.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    const gap = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let place: TooltipSide = side;
    if (place === 'top' && t.top - tip.height - gap < 8) place = 'bottom';
    else if (place === 'bottom' && t.bottom + tip.height + gap > vh - 8) place = 'top';
    else if (place === 'right' && t.right + tip.width + gap > vw - 8) place = 'left';
    else if (place === 'left' && t.left - tip.width - gap < 8) place = 'right';

    let top = 0;
    let left = 0;
    if (place === 'top') { top = t.top - tip.height - gap; left = t.left + t.width / 2 - tip.width / 2; }
    else if (place === 'bottom') { top = t.bottom + gap; left = t.left + t.width / 2 - tip.width / 2; }
    else if (place === 'right') { left = t.right + gap; top = t.top + t.height / 2 - tip.height / 2; }
    else { left = t.left - tip.width - gap; top = t.top + t.height / 2 - tip.height / 2; }

    left = Math.max(8, Math.min(left, vw - tip.width - 8));
    top = Math.max(8, Math.min(top, vh - tip.height - 8));
    setCoords({ top, left });
  }, [show, side, label]);

  return (
    <span
      ref={wrapRef}
      style={{ display: block ? 'flex' : 'inline-flex', alignItems: 'center', width: block ? '100%' : undefined }}
      onMouseEnter={() => !disabled && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && !disabled && createPortal(
        <div
          ref={tipRef}
          role="tooltip"
          style={{
            position: 'fixed', top: coords?.top ?? -9999, left: coords?.left ?? -9999,
            zIndex: 3000, background: 'var(--dark-90)', color: 'var(--light-100)',
            fontSize: 12, lineHeight: 1.4, letterSpacing: '0.24px', padding: '6px 9px',
            borderRadius: 6, width: 'max-content', maxWidth: 240, whiteSpace: 'normal',
            textAlign: 'left', pointerEvents: 'none', boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
            visibility: coords ? 'visible' : 'hidden',
          }}
        >
          {label}
        </div>,
        document.body,
      )}
    </span>
  );
}

// ─── Status dropdown ─────────────────────────────────────────────────

/** A pill that opens a menu to change a status (handler or lead status). The
 *  trigger pill carries a tooltip of the current value; each menu option shows
 *  its pill plus a one-line description. Generic over any string-keyed status
 *  set. */
export function StatusDropdown<T extends string>({
  value,
  options,
  styles,
  descs,
  onChange,
  ariaLabel,
  align = 'left',
}: {
  value: T;
  options: T[];
  styles: Record<string, PillStyle>;
  descs: Record<string, string>;
  onChange: (v: T) => void;
  ariaLabel: string;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ss = styles[value];
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* trigger tooltip is suppressed while the menu is open so it never
          covers the dropdown */}
      <Tooltip label={descs[value]} disabled={open}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-label={ariaLabel}
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <StatusPill tone={ss.tone} size="sm">{ss.label}</StatusPill>
          <ChevronDown size={14} color="var(--dark-60)" />
        </button>
      </Tooltip>
      {open && (
        <>
          <div onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
          <div
            role="menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, minWidth: 180, zIndex: 40,
              background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10,
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)', padding: 6, display: 'flex', flexDirection: 'column', gap: 2,
            }}
          >
            {options.map((opt) => {
              const os = styles[opt];
              // description shows as a tooltip to the SIDE on hover, not inline
              return (
                <Tooltip key={opt} label={descs[opt]} side="right" block>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); onChange(opt); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '7px 8px', border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <StatusPill tone={os.tone} size="sm">{os.label}</StatusPill>
                    {opt === value && <Check size={14} color="var(--dark-60)" />}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Toolbar bits ────────────────────────────────────────────────────

export function SearchField({
  value,
  onChange,
  placeholder,
  size = 'sm',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', pointerEvents: 'none' }}>
        <Search size={16} color="var(--dark-90)" />
      </span>
      <TextField size={size} placeholder={placeholder} aria-label={placeholder} value={value} onChange={onChange} style={{ width: 220, paddingLeft: 34, fontSize: 14 }} />
    </span>
  );
}

/** Maps status keys ↔ labels so the kit's string MultiSelect can show human
 *  labels while the filter state keeps the enum keys. */
function statusMulti<T extends string>(keys: T[], styles: Record<string, PillStyle>, selected: string[], onToggle: (next: string[]) => void) {
  const labelOf = (k: T) => styles[k].label;
  const keyOf = (label: string) => keys.find((k) => labelOf(k) === label);
  return {
    options: keys.map(labelOf),
    selected: selected.map((k) => styles[k]?.label ?? k),
    onToggle: (label: string) => {
      const k = keyOf(label);
      if (k) onToggle(toggleItem(selected, k));
    },
  };
}

/** Consolidated Filters control. Handler + Lead status lead the popover (the
 *  two most important axes), both multi-select, then method / activity /
 *  service / zip. */
export function ViewFiltersButton({ filters, onChange, size = 'sm' }: { filters: ViewFilters; onChange: (f: ViewFilters) => void; size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState(false);
  const count = viewFilterCount(filters);
  const set = (patch: Partial<ViewFilters>) => onChange({ ...filters, ...patch });

  const handlerMulti = statusMulti<Handler>(HANDLER_OPTIONS, HANDLER_STYLES, filters.handlers, (next) => set({ handlers: next }));
  const leadStatusMulti = statusMulti<LeadStatus>([...LEAD_STATUS_OPTIONS, ...LEAD_STATUS_CLOSED], LEAD_STATUS_STYLES, filters.leadStatuses, (next) => set({ leadStatuses: next }));

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <style>{`.leads-filters-trigger, .leads-filters-trigger:hover { border-color: var(--dark-90) !important; }`}</style>
      <Button variant="secondary" size={size} frontIcon={Filter} className={count > 0 ? 'leads-filters-trigger' : undefined} onPress={() => setOpen((o) => !o)}>
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
            {/* Most important: handler + lead status, both multi-select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FilterField label="Handler" onClear={filters.handlers.length > 0 ? () => set({ handlers: [] }) : undefined}>
                <MultiSelect placeholder="Any handler" unitPlural="handlers" options={handlerMulti.options} selected={handlerMulti.selected} onToggle={handlerMulti.onToggle} aria-label="Filter by handler" />
              </FilterField>
              <FilterField label="Lead status" onClear={filters.leadStatuses.length > 0 ? () => set({ leadStatuses: [] }) : undefined}>
                <MultiSelect placeholder="Any lead status" unitPlural="statuses" options={leadStatusMulti.options} selected={leadStatusMulti.selected} onToggle={leadStatusMulti.onToggle} aria-label="Filter by lead status" />
              </FilterField>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Text variant="primary" style={{ display: 'block', color: 'var(--dark-90)' }}>Contact details</Text>
              <FilterSelect label="Method" value={filters.method} onChange={(v) => set({ method: v })} options={METHOD_OPTIONS} onClear={filters.method !== 'all' ? () => set({ method: 'all' }) : undefined} />
              <FilterSelect label="Last activity" value={filters.time} onChange={(v) => set({ time: v })} options={TIME_OPTIONS} onClear={filters.time !== 'all' ? () => set({ time: 'all' }) : undefined} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Text variant="primary" style={{ display: 'block', color: 'var(--dark-90)' }}>Qualification criteria</Text>
              <FilterField label="Primary service" onClear={filters.services.length > 0 ? () => set({ services: [] }) : undefined}>
                <MultiSelect placeholder="Any service" unitPlural="services" options={FLOORING_SERVICES} selected={filters.services} onToggle={(v) => set({ services: toggleItem(filters.services, v) })} aria-label="Filter by primary service" />
              </FilterField>
              <FilterField label="Zip code" onClear={filters.zips.length > 0 ? () => set({ zips: [] }) : undefined}>
                <MultiSelect placeholder="All zip codes" unitPlural="zip codes" options={SAMPLE_ZIPS} selected={filters.zips} onToggle={(v) => set({ zips: toggleItem(filters.zips, v) })} aria-label="Filter by zip code" />
              </FilterField>
            </div>
            {count > 0 && (
              <div>
                <Button variant="tertiary" size="sm" onPress={() => onChange(DEFAULT_VIEW_FILTERS)}>Clear all</Button>
              </div>
            )}
          </div>
        </>
      )}
    </span>
  );
}
