import type { ReactNode } from 'react';
import { FONT, tracking } from '../format';

/** Right-aligned, tabular number cell. */
export function Num({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: 14,
        letterSpacing: tracking(14),
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'right',
        color: strong ? 'var(--dark-90)' : 'var(--dark-80)',
        fontWeight: strong ? 500 : 400,
      }}
    >
      {children}
    </span>
  );
}

/** Muted secondary text. */
export function Muted({ children, size = 12 }: { children: ReactNode; size?: number }) {
  return (
    <span style={{ fontFamily: FONT, fontSize: size, letterSpacing: tracking(size), color: 'var(--dark-60)' }}>
      {children}
    </span>
  );
}

/** Primary label text (single-line, truncates). */
export function CellLabel({ children, size = 14 }: { children: ReactNode; size?: number }) {
  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: size,
        letterSpacing: tracking(size),
        color: 'var(--dark-90)',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/** Column header — label style: 12px, dark-60. */
export function ColHead({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: 12,
        letterSpacing: tracking(12),
        color: 'var(--dark-60)',
        textAlign: align,
      }}
    >
      {children}
    </span>
  );
}
