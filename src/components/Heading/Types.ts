import type { HTMLAttributes } from 'react';

/**
 * Heading levels — mirror prod `apps/blaze/src/blaze-ui/Heading/Heading.tsx`.
 * `level` is required (semantic — pick the right tag for document outline).
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5;

export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color'> {
  level: HeadingLevel;
  /** Number of lines to clamp to. 1 forces single-line with ellipsis; >1 clamps via -webkit-line-clamp. */
  lineClamp?: number;
  /** Color escape hatch — accepts any valid CSS color. */
  color?: string;
}
