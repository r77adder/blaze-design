import type { ReactNode } from 'react';

export type ModalSize = 'md' | 'lg' | 'xl';

export interface ModalProps {
  /** Whether the modal is currently visible. When false, returns null. */
  isOpen: boolean;
  /** Called on close affordances: close button, scrim click, Escape key. */
  onClose: () => void;
  /** Header title — string renders as h2; ReactNode renders verbatim. */
  title?: ReactNode;
  /** Header subtext below the title. */
  description?: ReactNode;
  /** Footer slot — usually action buttons. Omit to drop the foot rule. */
  footer?: ReactNode;
  /** Body content. */
  children?: ReactNode;
  /** Max-width — md=560, lg=720, xl=920. Defaults to md. */
  size?: ModalSize;
  /** Optional className applied to the modal box (not the scrim). */
  className?: string;
  /** Whether scrim click closes the modal. Defaults to true. */
  dismissOnScrimClick?: boolean;
  /** Whether Escape key closes the modal. Defaults to true. */
  dismissOnEscape?: boolean;
}
