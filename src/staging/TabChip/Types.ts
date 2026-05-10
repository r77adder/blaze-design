import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * TabChip — toggleable rounded-pill chip with an optional inline counter.
 * Used for filter strips like the H2 home feed ("All", "Needs sign-off",
 * "Insights") where each tab shows a count.
 *
 * Source: Ivan's `Blaze H2 Features/index.html` `.ff` and `.ff.active` rules
 * (lines ~440-459). Distinct from the existing `Chip` (which is a generic
 * status pill, not a tab strip).
 */
export interface TabChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onSelect'> {
  /** Tab label (rendered before the counter). */
  children: ReactNode;
  /** Whether this tab is the currently-active one. */
  selected?: boolean;
  /** Optional numeric count rendered as a small chip after the label. */
  count?: number;
  /** Click handler — typically flips the parent's active tab. */
  onSelect?: () => void;
}
