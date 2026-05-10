import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from '../Toast';
import { ToastContext } from './ToasterContext';
import type { ToasterProps } from './Types';
import styles from './Toaster.module.scss';

/**
 * Toaster — portal host for active toasts. Mount once near the root of any
 * prototype that uses `useToast()`. Reads from ToastContext (provided by
 * <ToasterProvider>); renders into document.body via portal so it floats
 * above the prototype shell regardless of stacking context.
 *
 * SSR-safe: returns null when document is not available (e.g. during a
 * Jest jsdom render before document is fully wired — which doesn't happen
 * in practice but the guard is cheap and keeps the contract clean).
 */
export function Toaster({ className }: ToasterProps = {}) {
  const ctx = useContext(ToastContext);

  if (typeof document === 'undefined') return null;
  if (!ctx || ctx.toasts.length === 0) return null;

  const classes = [styles.root, className].filter(Boolean).join(' ');

  return createPortal(
    <div className={classes} role="region" aria-label="Notifications">
      {ctx.toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant ?? 'success'}
          action={t.action}
          onDismiss={t.dismissAfter === 0 ? () => ctx.dismissToast(t.id) : undefined}
          style={{ pointerEvents: 'auto' }}
        >
          {t.message}
        </Toast>
      ))}
    </div>,
    document.body,
  );
}
