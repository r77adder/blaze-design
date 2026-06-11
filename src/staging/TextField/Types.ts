import type { InputHTMLAttributes } from 'react';

export type TextFieldSize = 'sm' | 'md';

/** Single-line text input. Mirrors the look of prod's inline form fields
 *  (8px radius, `--dark-8` border, Sohne body type, subtle focus ring).
 *  `onChange` is value-first for prototype ergonomics — it receives the
 *  string, not the raw event. */
export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  size?: TextFieldSize;
  /** Fires with the input's current string value. */
  onChange?: (value: string) => void;
  /** Renders the error border + focus ring. */
  invalid?: boolean;
  /** Stretch to fill the available inline width. */
  fullWidth?: boolean;
}
