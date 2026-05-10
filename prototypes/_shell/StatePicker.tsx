import { createContext, useContext, useState, type ReactNode } from 'react';
import styles from './PrototypeShell.module.scss';

interface StateContextValue {
  state: string;
  setState: (s: string) => void;
  states: readonly string[];
}
const StateContext = createContext<StateContextValue | null>(null);

export function useStateContext(): StateContextValue {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useStateContext must be used inside <StatePicker>');
  return ctx;
}

/** Like useStateContext but returns null instead of throwing — for components
 *  (like <StatePickerControls />) that want to render conditionally based on
 *  whether a provider is mounted, without forcing every caller to wrap in
 *  <StatePicker>. */
export function useOptionalStateContext(): StateContextValue | null {
  return useContext(StateContext);
}

interface StatePickerProps {
  states: readonly string[];
  defaultState?: string;
  children: ReactNode;
}

/**
 * Provides state context to descendants. Pure provider — does NOT render
 * any picker UI. Render <StatePickerControls /> wherever you want the
 * cold/steady/error toggle to appear (typically the topbar's right slot).
 */
export function StatePicker({ states, defaultState, children }: StatePickerProps) {
  const [state, setState] = useState<string>(defaultState ?? states[0] ?? '');
  return (
    <StateContext.Provider value={{ state, setState, states }}>{children}</StateContext.Provider>
  );
}

export function StatePickerControls() {
  // No-op when there's no <StatePicker> ancestor so this component can be
  // safely included in default chrome (e.g. TopBar) without forcing every
  // prototype to wrap in a provider.
  const ctx = useOptionalStateContext();
  if (!ctx) return null;
  const { state, setState, states } = ctx;
  return (
    <div className={styles.statePicker}>
      {states.map((s) => (
        <button
          key={s}
          type="button"
          className={`${styles.stateBtn} ${state === s ? styles.stateBtnActive : ''}`}
          onClick={() => setState(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
