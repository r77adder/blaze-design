import { forwardRef, type MouseEvent } from 'react';
import type { CheckboxProps } from './Types';
import Check from '../../icons/16/Check';
import styles from './Checkbox.module.scss';

/**
 * Checkbox primitive used across H2 prototypes. Controlled via
 * `checked` + `onChange(next)`. Renders a 16px box with a check glyph when
 * on, plus an optional inline label.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onChange, children, className, onClick, type = 'button', disabled, ...rest }, ref) => {
    const classes = [styles.root, checked ? styles.on : null, className]
      .filter(Boolean)
      .join(' ');

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onChange(!checked);
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
        <span className={styles.box} aria-hidden>
          {checked && <Check size={12} color="var(--light-100)" />}
        </span>
        {children !== undefined && children !== null && children !== false && (
          <span className={styles.label}>{children}</span>
        )}
      </button>
    );
  },
);
Checkbox.displayName = 'Checkbox';
