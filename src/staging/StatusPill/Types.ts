import type { HTMLAttributes } from 'react';

/** Tonal palette for status pills. Maps a semantic intent (success/warning/
 *  danger/info/accent) to a consistent bg+border+text combo. `neutral` is
 *  the catch-all for non-important statuses ("In conversation", "Closed",
 *  etc.) per the H2 spec — `var(--dark-2)` bg / `var(--dark-4)` border /
 *  `var(--dark-60)` text. */
export type StatusPillTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent';

/** Two sizes only. Both use Buch (400) weight — see CLAUDE.md typography
 *  rule. `sm` = 12px / 4px radius; `md` = 14px / 6px radius. */
export type StatusPillSize = 'sm' | 'md';

export interface StatusPillProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  tone?: StatusPillTone;
  size?: StatusPillSize;
}
