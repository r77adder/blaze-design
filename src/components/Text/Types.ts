import type { HTMLAttributes } from 'react';

/**
 * Text variants — mirror prod `apps/blaze/src/blaze-ui/Text/Text.tsx`.
 *
 * Prod ships nine variants; we ship seven. The two omitted (`largeListDark`,
 * `secondaryDark`) are dark-background overrides that consumers can express
 * via the `color` escape-hatch prop. See CONVENTIONS.md for the policy.
 */
export type TextVariant =
  | 'primary'
  | 'secondary'
  | 'placeholder'
  | 'label'
  | 'largeList'
  | 'smallList'
  | 'metadata';

export interface TextProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  variant?: TextVariant;
  /** Number of lines to clamp to. 1 forces single-line with ellipsis; >1 clamps via -webkit-line-clamp. */
  lineClamp?: number;
  /** Color escape hatch — accepts any valid CSS color. */
  color?: string;
}
