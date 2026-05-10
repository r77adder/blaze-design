import { useContext } from 'react';
import { ToastContext } from './ToasterContext';
import type { ToastContextValue } from './Types';

/**
 * useToast — imperative API for showing toasts from anywhere inside a
 * <ToasterProvider>. Returns `{ showToast, dismissToast, toasts }`.
 *
 * `showToast({ message, variant?, dismissAfter? })` returns the toast id
 * for programmatic dismissal. `dismissAfter` defaults to 2400ms; set to 0
 * to require manual dismissal via `dismissToast(id)`.
 *
 * Throws if called outside a ToasterProvider — that's a configuration bug
 * worth surfacing early rather than silently no-op'ing.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error(
      'useToast must be used inside a <ToasterProvider>. Wrap your app/prototype root with ToasterProvider and render a single <Toaster /> for the portal host.',
    );
  }
  return ctx;
}
