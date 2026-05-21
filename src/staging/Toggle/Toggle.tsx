import { forwardRef, type MouseEvent } from 'react';
import type { ToggleProps } from './Types';
import styles from './Toggle.module.scss';

/**
 * Switch primitive used across H2 prototypes.
 *
 * Two visual forms:
 *  - With a child label → renders a chrome-wrapped switch (border + bg).
 *  - Without a child label → renders a bare switch (just the track + thumb).
 *
 * Both forms share the same track + thumb geometry.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, children, tone = 'default', className, onClick, type = 'button', ...rest }, ref) => {
    const bare = children === undefined;
    const classes = [
      bare ? styles.bareRoot : styles.root,
      checked ? styles.on : null,
      tone === 'success' ? styles['tone-success'] : null,
      className,
    ]
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
        role="switch"
        aria-checked={checked}
        className={classes}
        onClick={handleClick}
        {...rest}
      >
        <span className={styles.track}>
          <span className={styles.thumb} />
        </span>
        {!bare && <span className={styles.label}>{children}</span>}
      </button>
    );
  },
);
Toggle.displayName = 'Toggle';
