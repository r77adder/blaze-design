/**
 * Toast — iOS floating notification.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 5000:16172
 *
 * Animation: slides in from above, centered horizontally, aligned just above
 * the ToolbarHeader top edge. Auto-dismisses after 5 seconds.
 *
 * Variants:
 *   success    — dark-90 bg, check icon, "Saved successfully!", optional "Undo" button
 *   generating — white bg + dark-8 border, spinner, message, elapsed timer
 *
 * Usage (inside PhoneFrame, after StatusBar + ToolbarHeader):
 *   <Toast variant="success" visible={saved} onDismiss={() => setSaved(false)} />
 *
 * Place it as a sibling to the scrollable content div. It's absolutely
 * positioned at the top of the PhoneFrame (below StatusBar = top ~44px).
 */

import { useEffect, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'generating';

export interface ToastProps {
  variant?: ToastVariant;
  message?: string;
  visible: boolean;
  /** Called when the toast finishes animating out (auto after 5s or on Undo). */
  onDismiss?: () => void;
  onUndo?: () => void;
  /** Seconds elapsed shown in "generating" variant. */
  elapsed?: number;
}

const DISMISS_DELAY = 5000;

export function Toast({
  variant = 'success',
  message,
  visible,
  onDismiss,
  onUndo,
  elapsed,
}: ToastProps) {
  const [show, setShow] = useState(false);
  const [entered, setEntered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mount → enter animation
  useEffect(() => {
    if (visible) {
      setShow(true);
      // Small rAF so the initial off-screen position renders before transition fires
      const raf = requestAnimationFrame(() => setEntered(true));
      timerRef.current = setTimeout(() => {
        setEntered(false);
        setTimeout(() => {
          setShow(false);
          onDismiss?.();
        }, 300);
      }, DISMISS_DELAY);
      return () => {
        cancelAnimationFrame(raf);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      setEntered(false);
      const t = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(t);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null;

  const isSuccess = variant === 'success';
  const defaultMessage = isSuccess ? 'Saved successfully!' : 'Generating…';
  const displayMessage = message ?? defaultMessage;

  const pillStyle = isSuccess
    ? { background: 'var(--ios-dark-90)', border: 'none' }
    : {
        background: 'var(--ios-light-100)',
        border: '1px solid var(--ios-dark-8)',
        boxShadow: 'var(--ios-glass-shadow)',
      };

  const textColor = isSuccess ? 'var(--ios-light-100)' : 'var(--ios-dark-90)';

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'none',
        transform: entered ? 'translateY(0)' : 'translateY(-80px)',
        opacity: entered ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
      }}
    >
      <div
        style={{
          height: 52,
          maxWidth: 340,
          paddingLeft: 16,
          paddingRight: 12,
          borderRadius: 99,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'all',
          ...pillStyle,
        }}
      >
        {/* Icon */}
        {isSuccess ? (
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
              <path d="M1 5l3.5 4L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0, animation: 'ios-spin 1s linear infinite' }}
          >
            <style>{`@keyframes ios-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            <circle cx="9" cy="9" r="7" stroke="var(--ios-dark-8)" strokeWidth="2" />
            <path d="M9 2a7 7 0 0 1 7 7" stroke="var(--ios-dark-90)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}

        {/* Message */}
        <span
          style={{
            fontFamily: 'var(--ios-font)',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.4,
            color: textColor,
            whiteSpace: 'nowrap',
          }}
        >
          {displayMessage}
        </span>

        {/* Elapsed (generating only) */}
        {!isSuccess && elapsed !== undefined && (
          <span
            style={{
              fontFamily: 'var(--ios-font)',
              fontSize: 12,
              fontWeight: 400,
              color: 'var(--ios-dark-40)',
              whiteSpace: 'nowrap',
            }}
          >
            {elapsed}s
          </span>
        )}

        {/* Undo button (success only) */}
        {isSuccess && onUndo && (
          <button
            type="button"
            onClick={() => {
              onUndo?.();
              setEntered(false);
              setTimeout(() => { setShow(false); onDismiss?.(); }, 300);
            }}
            style={{
              height: 32,
              paddingLeft: 12,
              paddingRight: 12,
              borderRadius: 99,
              background: 'var(--ios-light-100)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--ios-font)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ios-dark-90)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}
