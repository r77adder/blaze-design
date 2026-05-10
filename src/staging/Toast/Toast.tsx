import { forwardRef, type ComponentType } from 'react';
import type { ToastProps, ToastVariant } from './Types';
import Close from '../../icons/12/Close';
import styles from './Toast.module.scss';

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={styles.spinner}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" opacity="0.25" />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ErrorIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 5 5 11M11 11 5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const DEFAULT_ICONS: Record<ToastVariant, ComponentType<{ size?: number }>> = {
  success: CheckIcon,
  generating: SpinnerIcon,
  error: ErrorIcon,
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      variant = 'success',
      icon,
      action,
      onDismiss,
      className,
      children,
      role,
      ...rest
    },
    ref,
  ) => {
    const classes = [styles.root, styles[`variant-${variant}`], className]
      .filter(Boolean)
      .join(' ');
    const Icon = icon ?? DEFAULT_ICONS[variant];
    return (
      <div ref={ref} className={classes} role={role ?? 'status'} {...rest}>
        {Icon ? (
          <span className={styles.icon}>
            <Icon size={14} />
          </span>
        ) : null}
        {children !== undefined && children !== null && children !== false ? (
          <span className={styles.label}>{children}</span>
        ) : null}
        {action ? (
          <button
            type="button"
            className={styles.action}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            className={styles.dismiss}
            aria-label="Dismiss"
            onClick={onDismiss}
          >
            <Close size={12} />
          </button>
        ) : null}
      </div>
    );
  },
);
Toast.displayName = 'Toast';
