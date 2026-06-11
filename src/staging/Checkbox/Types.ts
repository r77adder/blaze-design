import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** Controlled checkbox with an optional inline label. Mirrors the Toggle
 *  API shape (`checked` + `onChange(next)`) so call sites stay consistent
 *  across the lib. */
export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children'> {
  /** Whether the box is checked. */
  checked: boolean;
  /** Called with the next value when the user toggles. */
  onChange: (next: boolean) => void;
  /** Optional label rendered to the right of the box. */
  children?: ReactNode;
}
