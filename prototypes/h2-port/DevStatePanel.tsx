import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEV_STATE_PATHS, useDevState, type DevState } from './dev-state-context';
import { useOnboarding } from './onboarding/onboarding-context';

/**
 * Floating dev-only panel pinned to a corner of every H2 page. Designer can
 * drag the grip handle to reposition it (e.g. when it covers a real button).
 * Position persists in localStorage.
 *
 * Visually distinct (dashed brand-yellow border on a dark surface, monospace)
 * so it never reads as part of the prototype chrome. Hidden on pathnames that
 * have no cold variant.
 */

const STORAGE_KEY = 'h2-dev-panel-position';

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

export function DevStatePanel() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { getState, setState } = useDevState();
  const { active: onboardingActive, open: openOnboarding } = useOnboarding();

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

  // Render on every H2 route — even routes without per-path cold/steady — so
  // the global Onboarding toggle is always reachable.
  if (!pathname.startsWith('/h2')) return null;
  const hasPathState = DEV_STATE_PATHS.has(pathname);

  const current = getState(pathname);

  const onHandlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    };
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

  // Default: sit inside the sidebar's bottom area, just above the 2
  // sticky bottom items (Invite Team Members + Help & Learn Blaze).
  // ~88px clears those two NavItems + their container padding. Left 8
  // tucks it inside the sidebar's left edge. Once the user drags, the
  // saved x/y wins.
  const positionStyles = position
    ? { left: position.x, top: position.y }
    : { left: 8, bottom: 88 };

  return (
    <div
      ref={panelRef}
      data-dev-panel
      style={{
        position: 'fixed',
        ...positionStyles,
        zIndex: 50,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        background: 'var(--dark-90)',
        border: '1px dashed var(--brand)',
        borderRadius: 6,
        padding: '3px 4px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        boxShadow: '0 2px 10px rgba(0,0,0,0.20)',
        userSelect: 'none',
        touchAction: 'none',
        maxWidth: 222,
      }}
    >
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
        aria-label="Drag DEV panel"
      >
        ⋮⋮
      </div>
      {hasPathState && (
        <>
          <DevStateButton
            label="cold"
            text="Cold"
            selected={current === 'cold'}
            onClick={() => setState(pathname, 'cold')}
          />
          <DevStateButton
            label="steady"
            text="Steady"
            selected={current === 'steady'}
            onClick={() => setState(pathname, 'steady')}
          />
          <Divider />
        </>
      )}
      <DevStateButton
        label="cold"
        text="Onboarding"
        selected={onboardingActive}
        onClick={() => {
          navigate('/h2');
          openOnboarding({ reset: true });
        }}
      />
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 1,
        height: 12,
        background: 'rgba(255,255,255,0.16)',
        margin: '0 1px',
        flexShrink: 0,
      }}
    />
  );
}

function DevStateButton({
  label,
  text,
  selected,
  onClick,
}: {
  label: DevState;
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-dev-state-button={label}
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
