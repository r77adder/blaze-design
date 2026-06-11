import type { ComponentType, ReactNode } from 'react';
import type { IconProps } from '../../icons/Types';

export type SegmentedControlSize = 'sm' | 'md';

export interface SegmentedOption {
  value: string;
  /** Text label. Omit for an icon-only segment. */
  label?: ReactNode;
  /** Leading icon component (e.g. `List`, `Grid`). */
  icon?: ComponentType<IconProps>;
  /** Accessible label — required for icon-only segments. */
  ariaLabel?: string;
}

/** A single-select segmented toggle (tablist semantics). The selected segment
 *  fills with `--dark-90`. Generalizes the list/grid view toggles and small
 *  two/three-way choosers prototypes were hand-rolling. */
export interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  size?: SegmentedControlSize;
  /** Distribute segments evenly across the full width. */
  fullWidth?: boolean;
  'aria-label'?: string;
  className?: string;
}
