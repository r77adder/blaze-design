import { useEffect, useRef, useState } from 'react';
import ChevronDown from '@/icons/16/ChevronDown';
import { useAnalytics } from '../analytics-context';
import { WEBSITES } from '../mockData';
import { FONT, tracking } from '../format';

/** Small favicon placeholder for a site (no real favicons in mock data). */
function Favicon({ size = 18 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 5,
        background: 'linear-gradient(135deg, var(--brand), #f59e0b)',
        flexShrink: 0,
        display: 'block',
      }}
    />
  );
}

/**
 * Website switcher — the analytics site picker (Plausible/Fathom-style). Shows
 * the active site's domain with a dropdown to switch. Switching is visual-only
 * in the prototype.
 */
export function WebsiteSelector() {
  const { website, setWebsite } = useAnalytics();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = WEBSITES.find((w) => w.id === website) ?? WEBSITES[0]!;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          height: 40,
          padding: '0 12px',
          borderRadius: 10,
          border: '1px solid var(--dark-8)',
          background: 'var(--light-100)',
          cursor: 'pointer',
          fontFamily: FONT,
        }}
      >
        <Favicon />
        <span style={{ fontSize: 14, fontWeight: 400, letterSpacing: tracking(14), color: 'var(--dark-90)', lineHeight: 1.1 }}>
          {active.domain}
        </span>
        <span style={{ display: 'inline-flex', color: 'var(--dark-60)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms' }}>
          <ChevronDown size={16} />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: 260,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            padding: 4,
            zIndex: 50,
          }}
        >
          {WEBSITES.map((w) => {
            const selected = w.id === active.id;
            return (
              <button
                key={w.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setWebsite(w.id);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 7,
                  border: 'none',
                  background: selected ? 'var(--dark-4)' : 'transparent',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = 'var(--dark-2)';
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Favicon size={20} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, letterSpacing: tracking(14), color: 'var(--dark-90)', fontWeight: selected ? 500 : 400 }}>
                    {w.domain}
                  </span>
                  <span style={{ fontSize: 12, letterSpacing: tracking(12), color: 'var(--dark-60)' }}>{w.name}</span>
                </span>
              </button>
            );
          })}

          <div style={{ height: 1, background: 'var(--dark-8)', margin: '4px 0' }} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 7,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: FONT,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span
              aria-hidden
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                border: '1px dashed var(--dark-15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--dark-60)',
                fontSize: 16,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              +
            </span>
            <span style={{ fontSize: 14, letterSpacing: tracking(14), color: 'var(--dark-80)', fontWeight: 500 }}>Add website</span>
          </button>
        </div>
      )}
    </div>
  );
}
