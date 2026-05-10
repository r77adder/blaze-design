import type { HTMLAttributes } from 'react';
import type { TextVariant } from '../Text';

// Re-export for ergonomics — Paragraph shares Text's variant taxonomy.
export type { TextVariant } from '../Text';

export interface ParagraphProps extends Omit<HTMLAttributes<HTMLParagraphElement>, 'color'> {
  variant?: TextVariant;
  /** Number of lines to clamp to. 1 forces single-line with ellipsis; >1 clamps via -webkit-line-clamp. */
  lineClamp?: number;
  /** Color escape hatch — accepts any valid CSS color. */
  color?: string;
}
