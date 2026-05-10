import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContext } from './ToasterContext';
import type { ActiveToast, ToasterProviderProps, ToastSpec } from './Types';

const DEFAULT_DISMISS_MS = 2400;

/**
 * ToasterProvider — owns the active toast queue + auto-dismiss timers.
 * Mount once at your prototype/app root and pair with a single <Toaster />
 * for the portal host.
 *
 * Auto-dismiss is the v1 behavior (mirrors the inline implementation that
 * lived in prototypes/h2-index/index.tsx). Pause-on-hover and stack-cap
 * are deferred to v2 — keep the surface small until a prototype demands them.
 */
export function ToasterProvider({ children }: ToasterProviderProps) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (spec: ToastSpec) => {
      const id = spec.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const next: ActiveToast = { ...spec, id };

      setToasts((prev) => [...prev, next]);

      const dismissAfter = spec.dismissAfter ?? DEFAULT_DISMISS_MS;
      if (dismissAfter > 0) {
        const timer = setTimeout(() => dismissToast(id), dismissAfter);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismissToast],
  );

  // Cleanup pending timers on unmount so React doesn't warn about state
  // updates after unmount.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
