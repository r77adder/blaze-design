import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Close from '../../icons/20/Close';
import type { ModalProps } from './Types';
import styles from './Modal.module.scss';

/**
 * Modal — portal-mounted dialog with scrim, close button, and Escape/scrim
 * dismissal. Body scrolls; head/foot stay pinned. Mount it conditionally
 * from a parent that owns `isOpen` state (no global modal stack — keep
 * each modal local to its feature).
 *
 * Ported from Ivan's H2 .modal-scrim/.modal SCSS in
 * `~/dev/Blaze H2 Features/organic-social.html`.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  footer,
  children,
  size = 'md',
  className,
  dismissOnScrimClick = true,
  dismissOnEscape = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (dismissOnEscape && e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, dismissOnEscape]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const modalClasses = [styles.modal, styles[`size-${size}`], className]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(e) => {
        if (dismissOnScrimClick && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <Close size={16} />
        </button>
        {(title || description) && (
          <div className={styles.head}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.foot}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
