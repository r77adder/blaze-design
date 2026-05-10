// Three-variant cut from prod's 12. Per CONVENTIONS.md this is INTENTIONAL
// DIVERGE — primary/secondary/tertiary are the universal three; app-specific
// variants (red/green/danger/editor/etc.) are not exposed at the design-system
// layer. If a future need arises, port the prod variant here rather than
// inventing a new one.
import type { ButtonHTMLAttributes, ComponentType } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonIconProps {
  size?: number;
  color?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  frontIcon?: ComponentType<ButtonIconProps>;
  endIcon?: ComponentType<ButtonIconProps>;
  isDisabled?: boolean;
  fullWidth?: boolean;
}
