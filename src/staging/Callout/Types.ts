import type { HTMLAttributes, ReactNode, ComponentType } from 'react';
import type { IconProps } from '../../icons/Types';

/** Semantic tone for inline info / warning / danger / success panels.
 *  Mirrors `StatusPillTone` but produces a larger panel with optional
 *  leading icon, title, and body. `neutral` uses `var(--dark-4)` bg —
 *  the same surface as quiet notices. */
export type CalloutTone = 'neutral' | 'info' | 'warning' | 'danger' | 'success';

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CalloutTone;
  /** Optional leading icon component (e.g. `AlertTriangle` from `@/icons/20`).
   *  Rendered at size 20. */
  icon?: ComponentType<IconProps>;
  /** Optional short title above the body. */
  title?: ReactNode;
  children?: ReactNode;
}
