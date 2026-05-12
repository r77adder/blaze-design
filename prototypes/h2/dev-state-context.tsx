import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Designer-facing dev-state toggle. For every H2 route that supports a
 * "cold" (empty / setup / loading) vs "steady" (populated / active) view,
 * the DevStatePanel writes into this context, and the page's route reads
 * from it to gate its render at the top.
 *
 * Default value for any unset pathname is `'steady'` — pages render their
 * full populated state until the designer explicitly flips it.
 */
export type DevState = 'cold' | 'steady';

interface DevStateContextValue {
  getState: (pathname: string) => DevState;
  setState: (pathname: string, value: DevState) => void;
}

const DevStateContext = createContext<DevStateContextValue | null>(null);

export function DevStateProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Record<string, DevState>>({});

  const getState = useCallback(
    (pathname: string): DevState => map[pathname] ?? 'steady',
    [map],
  );

  const setState = useCallback((pathname: string, value: DevState) => {
    setMap((prev) => ({ ...prev, [pathname]: value }));
  }, []);

  const value = useMemo<DevStateContextValue>(() => ({ getState, setState }), [getState, setState]);

  return <DevStateContext.Provider value={value}>{children}</DevStateContext.Provider>;
}

export function useDevState(): DevStateContextValue {
  const ctx = useContext(DevStateContext);
  if (!ctx) {
    // Fail-soft: tests / non-H2 pages get a no-op so consumers can call
    // useDevState() without conditional providers.
    return {
      getState: () => 'steady',
      setState: () => {},
    };
  }
  return ctx;
}

/**
 * Pathnames that support a cold state. Used by the dev panel to decide
 * whether to render itself. Home / Tools / Content-settings are intentionally
 * excluded — they don't have a cold view by design.
 */
export const DEV_STATE_PATHS = new Set<string>([
  '/h2/organic-social',
  '/h2/seo-aeo',
  '/h2/map-ranking',
  '/h2/influencer-content',
  '/h2/paid-social',
  '/h2/paid-search',
  '/h2/email-sms',
  '/h2/landing-pages',
  '/h2/crm',
  '/h2/reputation',
]);
