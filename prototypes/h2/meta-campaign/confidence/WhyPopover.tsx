import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Heading, Text } from '@/components';
import Stars from '@/icons/20/Stars';

/**
 * Reusable click-popover for the ✨ "Why?" affordance. Mirrors the ref-based
 * outside-close pattern from PaidSocialDetail's TimeRangeSelect — the
 * mousedown listener checks `rootRef.current.contains(e.target)` so clicks
 * inside the panel never close it.
 *
 * The caller supplies the trigger element (typically the ✨ icon button) via
 * `children`. The popover renders absolute below the trigger.
 */
export function WhyPopover({
  title,
  body,
  align = 'right',
  children,
}: {
  /** Short heading shown above the body. */
  title: string;
  /** Plain-English explanation; can be a string or richer JSX. */
  body: ReactNode;
  /** Which edge of the trigger the popover anchors to. */
  align?: 'left' | 'right';
  /** The trigger element — render the ✨ icon button or label here. */
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', handler);
      document.addEventListener('keydown', onKey);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Why? ${title}`}
        style={triggerStyle}
      >
        {children}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={title}
          style={{
            ...panelStyle,
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Stars size={14} color="var(--purple)" />
            <Heading level={6} style={{ color: 'var(--dark-90)', fontSize: 13, margin: 0 }}>
              {title}
            </Heading>
          </div>
          <Text variant="secondary" style={{ color: 'var(--dark-80)', lineHeight: 1.55, display: 'block' }}>
            {body}
          </Text>
        </div>
      )}
    </span>
  );
}

const triggerStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  color: 'inherit',
  fontFamily: 'inherit',
};

const panelStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  zIndex: 50,
  minWidth: 280,
  maxWidth: 360,
  padding: '12px 14px',
  background: 'var(--light-100)',
  border: '1px solid rgba(124, 92, 252, 0.25)',
  borderRadius: 10,
  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
  // Subtle purple tint to identify it as an AI-explanation moment.
  backgroundImage:
    'linear-gradient(to bottom, rgba(124, 92, 252, 0.04), rgba(124, 92, 252, 0))',
};
