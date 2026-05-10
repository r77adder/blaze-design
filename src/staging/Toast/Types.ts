import type { ComponentType, HTMLAttributes } from 'react';

// Floating notification surface. Purely visual — auto-dismiss timing and
// portal mounting are out of scope for v1. A future Toaster wrapper can
// orchestrate timeouts and stacking. See GAPS.md `### Toast / Toaster`.
export type ToastVariant = 'success' | 'generating' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant. Default 'success'. */
  variant?: ToastVariant;
  /** Leading icon. Defaults to a per-variant icon (check / spinner / cross). */
  icon?: ComponentType<{ size?: number }>;
  /** Optional trailing action button. */
  action?: ToastAction;
  /** When provided, renders a × dismiss button that fires this callback. */
  onDismiss?: () => void;
}
