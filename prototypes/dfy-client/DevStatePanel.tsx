import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClientState, type ClientState } from './dev-state';
import { ChangesPanel, CHANGES_COUNT } from './ChangesPanel';

/**
 * Designer-only control pinned to the bottom-left of the client portal. Flips
 * the whole portal between its cold (early onboarding), reviewing (everything
 * but go-live is ready), mixed (each item mid-review at a different stage),
 * and steady (live) state. Mirrors blaze-dfy's own DevStatePanel: dashed
 * brand-yellow border on a dark surface, monospace, draggable, with the
 * position persisted in localStorage. Prototype chrome, not part of the
 * shipped client view.
 */

const OPTIONS: { value: ClientState; label: string }[] = [
  { value: 'cold', label: 'Cold' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'steady', label: 'Steady' },
];

const STORAGE_KEY = 'dfy-client-dev-panel-position';
/** Session-scoped, so hiding the panel lasts while you demo or share a screen
 *  but never leaks into the next browser session. */
const HIDDEN_KEY = 'dfy-client-dev-panel-hidden';

interface Position { x: number; y: number }

/**
 * Lets the designer hide all prototype chrome (state buttons + the AM/Client
 * switch) for the current session — handy when sending someone the review link
 * or screen-sharing. Toggle with Shift+D; the × on the panel hides it.
 */
function useHidden(): [boolean, (v: boolean) => void] {
  const [hidden, setHiddenState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem(HIDDEN_KEY) === '1';
    } catch {
      return false;
    }
  });

  const setHidden = (v: boolean) => {
    setHiddenState(v);
    try {
      window.sessionStorage.setItem(HIDDEN_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== 'D' && e.key !== 'd') return;
      // Never steal the key while someone is typing into the prototype.
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
      e.preventDefault();
      setHidden(!(window.sessionStorage.getItem(HIDDEN_KEY) === '1'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return [hidden, setHidden];
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
  const { state, setState, reviewFlowOpen, reviewSide, setReviewSide } = useClientState();
  const navigate = useNavigate();
  // Show the AM/Client switch on the approvals, Leads (AI Receptionist), and
  // home surfaces, and jump to the matching surface on the other side.
  const rest = useLocation().pathname.replace(/^\/dfy-client/, '').replace(/^\//, '').replace(/\/$/, '');
  const surface = rest.startsWith('approvals') ? 'approvals'
    : rest.startsWith('leads') ? 'leads'
    : rest.startsWith('reputation') ? 'reputation'
    : (rest === '' || rest === 'home') ? 'home'
    : null;
  const amHref = surface === 'approvals'
    ? '/blaze-dfy/grain-design-flooring/am/approvals'
    : surface === 'leads'
    ? '/blaze-dfy/grain-design-flooring/am/sdr'
    : surface === 'reputation'
    ? '/blaze-dfy/grain-design-flooring/am/reputation'
    : '/blaze-dfy/grain-design-flooring/am/home';
  // Sit quietly at half opacity by default; lift to full on hover so the panel
  // never competes with the real portal chrome.
  const [hovered, setHovered] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [hidden, setHidden] = useHidden();

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

  // Hidden for this session (Shift+D). After all hooks, so order stays stable.
  if (hidden) return null;

  // While the review overlay is open, collapse to just the AM/Client switch so
  // the reviewer can flip sides in place. (After all hooks, so order is stable.)
  if (reviewFlowOpen) {
    return (
      <div
        style={{
          position: 'fixed', left: 12, bottom: 64, zIndex: 60,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--dark-90)', border: '1px dashed var(--brand)', borderRadius: 6, padding: '5px 8px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          opacity: 0.85,
        }}
      >
        <SideButton text="AM" current={reviewSide === 'am'} onClick={() => setReviewSide('am')} />
        <SideButton text="Client" current={reviewSide === 'client'} onClick={() => setReviewSide('client')} />
        <HideButton onClick={() => setHidden(true)} />
      </div>
    );
  }

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

  // Default: bottom-left, above the sidebar's sticky footer items. Once
  // dragged, the saved x/y wins.
  const positionStyles = position ? { left: position.x, top: position.y } : { left: 12, bottom: 64 };

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
        zIndex: 60,
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
          The Leads (AI Receptionist) surface gets the side switch but not Changes. */}
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
        {/* Group 1: portal state. Stays together on its own row. */}
        <div style={GROUP_STYLE}>
          {OPTIONS.map((o) => (
            <DevStateButton key={o.value} text={o.label} selected={state === o.value} onClick={() => setState(o.value)} />
          ))}
        </div>
        {/* Group 2: AM/Client side switch (approvals + home). Wraps to its own row. */}
        {surface && (
          <div style={GROUP_STYLE}>
            <SideButton text="AM" onClick={() => navigate(amHref)} />
            <SideButton text="Client" current onClick={() => {}} />
          </div>
        )}
        <HideButton onClick={() => setHidden(true)} />
      </div>
    </div>
    <ChangesPanel open={changesOpen} onClose={() => setChangesOpen(false)} onJump={(s) => { setState(s); setChangesOpen(false); }} />
    </>
  );
}

/** Dismisses all prototype chrome for the session. Shift+D brings it back. */
function HideButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Hide prototype controls for this session (Shift+D to show again)"
      aria-label="Hide prototype controls for this session"
      style={{
        appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 11, lineHeight: 1, padding: '3px 5px', borderRadius: 3,
        background: 'transparent', color: 'var(--light-60)', fontWeight: 400,
        whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 'auto',
      }}
    >
      ×
    </button>
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
        padding: '3px 4px',
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
