import type { HTMLAttributes } from 'react';

// Semantic kind for a feed item. Drives color and default label.
// Action variant gets a star icon, alert gets a warning triangle, insight
// renders text-only. See GAPS.md `### KindBadge` for the source spec.
export type KindBadgeKind = 'action' | 'alert' | 'insight';

export interface KindBadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Which kind of feed item this is. Drives color, icon, and default label. */
  kind: KindBadgeKind;
  /** Override the canonical label per kind. */
  label?: string;
}
