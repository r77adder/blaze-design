import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDfyState } from './lib/dev-state';
import { useAmView } from './lib/am-view';
import { useReview } from './lib/review';
import { ChangesPanel, CHANGES_COUNT } from './ChangesPanel';

/**
 * Floating designer-only control pinned to the workspace sidebar's bottom-left.
 * Flips the whole workspace between its cold (new / empty / mid-onboarding) and
 * steady (populated / active) state. Mirrors the H2 prototype's dev panel:
 * dashed brand-yellow border on a dark surface, monospace, draggable, with the
 * position persisted in localStorage. Rendered only inside an open workspace.
 */

const STORAGE_KEY = 'blaze-dfy-dev-panel-position';

interface Position {
  x: number;
  y: number;
}

function loadStoredPosition(): Position | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Position;
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Each logical group is its own inline-flex unit so it never splits mid-group:
// the outer panel wraps cleanly *between* groups instead of orphaning a button.
const GROUP_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
  flexShrink: 0,
};

export function DevStatePanel() {
  const { state, setState } = useDfyState();
  const { seedReviewed, clearReview } = useReview();
  const { side, setSide, reviewOpen } = useAmView();
  const navigate = useNavigate();
  // Show the AM/Client switch on the approvals, AI Receptionist, and home
  // surfaces, and jump to the matching surface on the other side.
  const pathname = useLocation().pathname;
  const surface = pathname.includes('/approvals') ? 'approvals'
    : pathname.includes('/sdr') ? 'sdr'
    : pathname.includes('/reputation') ? 'reputation'
    : (pathname.includes('/home') || /\/am\/?$/.test(pathname)) ? 'home'
    : null;
  const clientHref = surface === 'approvals' ? '/dfy-client/approvals'
    : surface === 'sdr' ? '/dfy-client/leads'
    : surface === 'reputation' ? '/dfy-client/reputation'
    : '/dfy-client';
  // Sit quietly at half opacity by default; lift to full on hover so the panel
  // never competes with the real workspace chrome.
  const [hovered, setHovered] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);

  const [position, setPosition] = useState<Position | null>(() =>
    typeof window === 'undefined' ? null : loadStoredPosition(),
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    if (!position) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch {
      /* ignore */
    }
  }, [position]);

  const onHandlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragOffsetRef.current = { dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const onHandlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const offset = dragOffsetRef.current;
    if (!offset || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    setPosition({
      x: clamp(event.clientX - offset.dx, 8, maxX),
      y: clamp(event.clientY - offset.dy, 8, maxY),
    });
  };

  const onHandlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragOffsetRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  // Default: tuck inside the sidebar's bottom-left, just above the two sticky
  // footer items (Handoff client / All accounts). Once dragged, the saved x/y
  // wins.
  const positionStyles = position ? { left: position.x, top: position.y } : { left: 8, bottom: 84 };

  return (
    <>
    <div
      ref={panelRef}
      data-dev-panel
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        ...positionStyles,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 3,
        background: 'var(--dark-90)',
        border: '1px dashed var(--brand)',
        borderRadius: 6,
        padding: 4,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        boxShadow: hovered ? '0 2px 10px rgba(0,0,0,0.20)' : 'none',
        userSelect: 'none',
        touchAction: 'none',
        // Stay inside the 238px sidebar (8px inset each side) so the panel
        // wraps within the rail instead of spilling into the content area.
        maxWidth: 222,
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 120ms ease',
      }}
    >
      {/* Changes sits on top, on the surfaces it references (approvals + home).
          The AI Receptionist surface gets the side switch but not Changes. */}
      {(surface === 'approvals' || surface === 'home') && (
        <>
          <button
            type="button"
            data-dev-changes-button
            onClick={() => setChangesOpen(true)}
            style={{
              appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 10.5, lineHeight: 1, padding: '4px 6px', borderRadius: 3, background: 'transparent',
              color: 'var(--light-60)', fontWeight: 400, letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%',
            }}
          >
            Changes
            <span style={{ background: 'rgba(255,255,255,0.14)', color: 'var(--light-60)', borderRadius: 99, padding: '1px 5px', fontSize: 9.5, fontWeight: 600 }}>{CHANGES_COUNT}</span>
          </button>
          <span aria-hidden style={{ height: 1, background: 'var(--light-60)', opacity: 0.22, margin: '0 2px' }} />
        </>
      )}

      {/* Controls row: drag handle + state group + side switch. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, rowGap: 4, flexWrap: 'wrap' }}>
        <div
          data-dev-drag-handle
          title="Drag to move"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 10,
            height: 18,
            cursor: 'grab',
            color: 'var(--light-60)',
            fontSize: 10,
            lineHeight: 1,
            letterSpacing: '-1px',
            flexShrink: 0,
          }}
          aria-label="Drag dev panel"
        >
          ⋮⋮
        </div>
        {/* Group 1: workspace state. Stays together on its own row. */}
        <div style={GROUP_STYLE}>
          <DevStateButton text="Cold" selected={state === 'cold'} onClick={() => { clearReview(); setState('cold'); }} />
          <DevStateButton text="Reviewed" selected={state === 'reviewed'} onClick={() => { seedReviewed(); setState('reviewed'); }} />
          <DevStateButton text="Steady" selected={state === 'steady'} onClick={() => { clearReview(); setState('steady'); }} />
        </div>
        {/* Group 2: AM/Client side switch (approvals + home). Wraps to its own row. */}
        {surface && (
          <div style={GROUP_STYLE}>
            {/* While the review overlay is open, flip its AM ⇄ Client side in
                place; otherwise fall back to opening the client portal. */}
            {surface === 'home' && reviewOpen ? (
              <>
                <SideButton text="AM" current={side === 'am'} onClick={() => setSide('am')} />
                <SideButton text="Client" current={side === 'client'} onClick={() => setSide('client')} />
              </>
            ) : (
              <>
                <SideButton text="AM" current onClick={() => {}} />
                <SideButton text="Client" onClick={() => navigate(clientHref)} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
    <ChangesPanel open={changesOpen} onClose={() => setChangesOpen(false)} prepare={() => setState('steady')} />
    </>
  );
}

function SideButton({ text, current, onClick }: { text: string; current?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={current ? 'Current view' : `Open ${text} view`}
      style={{
        appearance: 'none', border: 'none', cursor: current ? 'default' : 'pointer',
        fontFamily: 'inherit', fontSize: 10.5, lineHeight: 1, padding: '3px 6px', borderRadius: 3,
        background: current ? 'rgba(255,255,255,0.16)' : 'transparent',
        color: current ? 'var(--light-100)' : 'var(--light-60)',
        fontWeight: current ? 600 : 400, letterSpacing: '0.02em', whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      {text}
    </button>
  );
}

function DevStateButton({ text, selected, onClick }: { text: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      data-dev-state-button={text.toLowerCase()}
      data-selected={selected ? 'true' : 'false'}
      onClick={onClick}
      style={{
        appearance: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 10.5,
        lineHeight: 1,
        padding: '3px 6px',
        borderRadius: 3,
        background: selected ? 'var(--brand)' : 'transparent',
        color: selected ? 'var(--dark-90)' : 'var(--light-60)',
        fontWeight: selected ? 600 : 400,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {text}
    </button>
  );
}
