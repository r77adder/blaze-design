import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from 'react';
import styles from './Checkbox.module.scss';

// Prototype-local form controls. These live here (rather than src/staging)
// so the h2 prototype can ship without an eng code-owner review on /src/.
// Promote to src/staging when the patterns settle.

export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> {
  /** Whether the box is checked. */
  checked: boolean;
  /** Called with the next value when toggled. Omit for a read-only display box. */
  onChange?: (next: boolean) => void;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onChange, className, disabled, onClick, type = 'button', ...rest }, ref) => {
    const classes = [styles.root, checked ? styles.checked : null, className]
      .filter(Boolean)
      .join(' ');

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onChange?.(!checked);
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type={type}
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        className={classes}
        onClick={handleClick}
        {...rest}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 6.4 L4.9 8.8 L9.5 3.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    );
  },
);
Checkbox.displayName = 'Checkbox';
