import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/** Visual style of the tab strip. `underline` paints a 2px bottom border
 *  on the active tab (sidebar / content panel pattern); `solid` paints a
 *  filled chip background (use TabChip for that — Tabs only supports
 *  underline today). */
export type TabsVariant = 'underline';

export interface TabsRootProps extends HTMLAttributes<HTMLDivElement> {
  /** Currently selected tab id. */
  value: string;
  /** Called with the next tab id when the user activates one. */
  onChange: (next: string) => void;
  variant?: TabsVariant;
  children?: ReactNode;
}

export interface TabsTabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange'> {
  /** Id of this tab — matches against `TabsRoot.value`. */
  value: string;
  children?: ReactNode;
}

export interface TabsContextValue {
  value: string;
  onChange: (next: string) => void;
}
