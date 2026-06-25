import { useState, type CSSProperties, type ReactNode } from 'react';

/** Optional volume bar drawn behind the row content (Plausible-style), width =
 *  `bar` (0–1) of the row. Spans the full row height. */
function VolumeBar({ bar }: { bar: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: `${Math.max(0, Math.min(1, bar)) * 100}%`,
        background: 'var(--dark-3)',
        borderRadius: 8,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

/**
 * A grid row that behaves like a button: hover tint, pointer, keyboard-
 * activatable. `cols` is the CSS grid-template-columns; optional `bar` (0–1)
 * paints a volume bar behind the content.
 */
export function RowButton({
  cols,
  onClick,
  children,
  align = 'center',
  bar,
}: {
  cols: string;
  onClick?: () => void;
  children: ReactNode;
  align?: CSSProperties['alignItems'];
  bar?: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        appearance: 'none',
        border: 'none',
        background: hover ? 'var(--dark-2)' : 'transparent',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
        width: '100%',
        padding: '10px 8px',
        marginBottom: 3,
        borderRadius: 8,
        font: 'inherit',
        color: 'inherit',
        transition: 'background 120ms',
      }}
    >
      {bar != null && <VolumeBar bar={bar} />}
      <span style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: cols, alignItems: align, gap: 12 }}>
        {children}
      </span>
    </button>
  );
}

/** Non-interactive grid row (same metrics, no hover/click). Supports `bar`. */
export function RowStatic({
  cols,
  children,
  align = 'center',
  bar,
}: {
  cols: string;
  children: ReactNode;
  align?: CSSProperties['alignItems'];
  bar?: number;
}) {
  return (
    <div style={{ position: 'relative', padding: '10px 8px', marginBottom: 3 }}>
      {bar != null && <VolumeBar bar={bar} />}
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: cols, alignItems: align, gap: 12 }}>
        {children}
      </div>
    </div>
  );
}
