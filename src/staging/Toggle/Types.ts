import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** Visual tone of the "on" state. `default` paints the active track with
 *  `var(--dark-90)` (matches the lib's primary button family); `success`
 *  paints it `var(--green-50)` for affirmative toggles like Auto-publish. */
export type ToggleTone = 'default' | 'success';

/** Single size for now — 32×18 track, 14px thumb. Matches the hand-rolled
 *  pattern in the H2 prototype. */
export type ToggleSize = 'md';

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children'> {
  /** Whether the toggle is on. */
  checked: boolean;
  /** Called with the next value when the user toggles. */
  onChange: (next: boolean) => void;
  /** Optional label rendered to the right of the track. */
  children?: ReactNode;
  /** Tonal palette for the on state. */
  tone?: ToggleTone;
  /** Reserved — only `md` is supported today. */
  size?: ToggleSize;
}
