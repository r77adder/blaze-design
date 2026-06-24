import { useRef, useState, type ReactNode } from 'react';
import { StatusPill } from '@/staging';
import ChevronDown from '@/icons/20/ChevronDown';
import {
  ALL_BOOKING_OUTCOMES,
  BOOKING_OUTCOME_STYLES,
  effectiveBookingOutcome,
  type BookingOutcome,
  type Lead,
} from './sdr-data';

// Shared booking-outcome picker. A selectable status pill that opens a menu of
// all eight outcomes (happy path + a divider + the closed-early exits). Used by
// both the Bookings table rows and the in-thread booking card. The menu is
// fixed-positioned so it escapes any `overflow: hidden` / scroll container, and
// clicks are stopped from bubbling so picking never triggers a parent handler
// (row navigation, etc.).

function OutcomeMenuItem({ active, onSelect, children }: { active: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'space-between',
        padding: '7px 8px',
        border: 'none',
        borderRadius: 6,
        background: active ? 'var(--dark-4)' : 'transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        width: '100%',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--dark-2)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

export function OutcomeSelect({ lead, onSetOutcome }: { lead: Lead; onSetOutcome: (o: BookingOutcome | null) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const eff = effectiveBookingOutcome(lead);
  const style = BOOKING_OUTCOME_STYLES[eff];

  const toggle = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 4, left: r.left });
    setOpen((v) => !v);
  };
  const pick = (o: BookingOutcome) => { onSetOutcome(o); setOpen(false); };

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ minWidth: 0 }}>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label="Change outcome"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <StatusPill tone={style.tone} size="sm">{style.label}</StatusPill>
        <ChevronDown size={12} color="var(--dark-40)" />
      </button>
      {open && pos && (
        <>
          <div onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
          <div
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              minWidth: 190,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              padding: 4,
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {ALL_BOOKING_OUTCOMES.flatMap((o) => {
              const s = BOOKING_OUTCOME_STYLES[o];
              const item = (
                <OutcomeMenuItem key={o} active={eff === o} onSelect={() => pick(o)}>
                  <StatusPill tone={s.tone} size="sm">{s.label}</StatusPill>
                </OutcomeMenuItem>
              );
              // Divider splits the happy path from the closed-early outcomes.
              return o === 'no-show'
                ? [<div key="divider" style={{ height: 1, background: 'var(--dark-8)', margin: '4px 0' }} />, item]
                : [item];
            })}
          </div>
        </>
      )}
    </div>
  );
}
