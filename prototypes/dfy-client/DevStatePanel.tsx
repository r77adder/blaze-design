import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useClientState, type ClientState } from './dev-state';

/**
 * Designer-only control pinned to the bottom-left of the client portal. Flips
 * the whole portal between its cold (early onboarding), reviewing (everything
 * but go-live is ready), mixed (each item mid-review at a different stage),
 * and steady (live) state. Mirrors blaze-dfy's own DevStatePanel — dashed
 * brand-yellow border on a dark surface, monospace, draggable, with the
 * position persisted in localStorage. Prototype chrome, not part of the
 * shipped client view.
 */

const OPTIONS: { value: ClientState; label: string }[] = [
  { value: 'cold', label: 'Cold' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'steady', label: 'Steady' },
];

const STORAGE_KEY = 'dfy-client-dev-panel-position';

interface Position { x: number; y: number }

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
  const { state, setState } = useClientState();

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

  // Default: bottom-left, above the sidebar's sticky footer items. Once
  // dragged, the saved x/y wins.
  const positionStyles = position ? { left: position.x, top: position.y } : { left: 12, bottom: 64 };

  return (
    <div
      ref={panelRef}
      data-dev-panel
      style={{
        position: 'fixed',
        ...positionStyles,
        zIndex: 60,
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
        aria-label="Drag dev panel"
      >
        ⋮⋮
      </div>
      {OPTIONS.map((o) => (
        <DevStateButton key={o.value} text={o.label} selected={state === o.value} onClick={() => setState(o.value)} />
      ))}
    </div>
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
