import type { ReactNode } from 'react';
import { useDfyState } from '../blaze-dfy/lib/dev-state';

/**
 * Faithful-port shim. The H2 feature pages were copied wholesale into this dir
 * for the blaze-dfy workspace (Awareness / Conversion sections). H2's original
 * per-pathname cold/steady map collapses here onto blaze-dfy's single GLOBAL
 * Cold/Steady toggle (../blaze-dfy/lib/dev-state) so the existing bottom-left
 * dev control drives every ported page at once.
 *
 * API is kept identical to the original dev-state-context so the copied pages
 * import it unchanged.
 */
export type DevState = 'cold' | 'steady';

export interface DevStateContextValue {
  getState: (pathname?: string) => DevState;
  setState: (pathname: string, value: DevState) => void;
}

export function useDevState(): DevStateContextValue {
  const { state, setState } = useDfyState();
  return {
    getState: () => state,
    setState: (_pathname: string, value: DevState) => setState(value),
  };
}

/** Pages occasionally reference this; the global toggle ignores per-path sets. */
export const DEV_STATE_PATHS = new Set<string>();

/** No-op: blaze-dfy's DfyStateProvider already supplies the state. */
export function DevStateProvider({ children }: { children: ReactNode }) {
  return children as ReactNode;
}
