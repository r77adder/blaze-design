import type { HTMLAttributes } from 'react';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  /**
   * When true, the card behaves like a button: pointer cursor, hover lift,
   * focus ring, tabIndex=0, and Enter/Space activate the consumer-supplied
   * onClick. The card still renders as a `<div role="button">` rather than
   * a `<button>` so it composes around arbitrary block content (other
   * buttons, links, headings) without nested-interactive HTML errors.
   */
  interactive?: boolean;
}
