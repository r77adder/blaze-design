import { useEffect, type ReactNode } from 'react';
import { FONT, tracking } from '../format';

/**
 * Slide-over chrome shared by the Source Drawer and the Content asset panel:
 * backdrop, right-anchored panel, slide transition, Escape-to-close, and a
 * header (eyebrow + title + close, with an optional stat block).
 *
 * The PARENT owns mount + the `open` boolean (so it can keep the panel mounted
 * through the exit animation while its data is still available). This shell is
 * purely presentational.
 */
export function DrawerShell({
  open,
  onClose,
  eyebrow,
  title,
  headerExtra,
  width = 520,
  children,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: ReactNode;
  title: ReactNode;
  headerExtra?: ReactNode;
  width?: number;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', opacity: open ? 1 : 0, transition: 'opacity 220ms' }}
      />
      <div
        role="dialog"
        aria-label={typeof title === 'string' ? title : undefined}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width,
          maxWidth: '92vw',
          background: 'var(--light-100)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.16)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 240ms cubic-bezier(0.32,0.72,0,1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '26px 30px 20px', borderBottom: '1px solid var(--dark-8)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              {eyebrow && (
                <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(12), color: 'var(--dark-60)' }}>{eyebrow}</span>
              )}
              <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 500, letterSpacing: '0.2px', color: 'var(--dark-90)', lineHeight: 1.25 }}>
                {title}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                appearance: 'none',
                border: '1px solid var(--dark-8)',
                background: 'var(--light-100)',
                width: 30,
                height: 30,
                borderRadius: 8,
                cursor: 'pointer',
                color: 'var(--dark-60)',
                fontSize: 15,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
          {headerExtra && <div style={{ marginTop: 16 }}>{headerExtra}</div>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 22px 44px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
