import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import type { Icon } from '../../icons/Types';

export interface SelectOption {
  /** Stable value stored in state. */
  value: string;
  /** Human-facing label shown in the trigger and the menu. */
  label: string;
}

/** A trailing icon-button rendered on every option in the open menu — e.g. a
 *  "play" button to preview each item. Clicking it fires `onAction` without
 *  selecting the option or closing the menu. */
export interface SelectOptionAction {
  icon: Icon;
  /** Accessible label; the option's label is appended automatically. */
  ariaLabel: string;
  onAction: (value: string) => void;
}

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
  /** Currently-selected value. */
  value: string;
  /** Called with the next value when the user picks an option. */
  onChange: (value: string) => void;
  /** Options to choose from. */
  options: SelectOption[];
  /** sm = 13px / compact padding, md = 14px (default), lg = 16px / large padding. */
  size?: SelectSize;
  /** Shown in the trigger when no option matches `value`. */
  placeholder?: string;
  /** Stretch to fill the parent width. */
  fullWidth?: boolean;
  /** Optional trailing icon-button rendered on each option in the menu. */
  optionAction?: SelectOptionAction;
  /** Inline style applied to the root wrapper (use for width constraints). */
  style?: CSSProperties;
}
