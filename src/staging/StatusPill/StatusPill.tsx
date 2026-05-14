import { forwardRef } from 'react';
import type { StatusPillProps } from './Types';
import styles from './StatusPill.module.scss';

/**
 * StatusPill — single primitive for every status indicator across the
 * H2 prototype. See `StatusPill.module.scss` for the full spec.
 */
export const StatusPill = forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ tone = 'neutral', size = 'sm', className, children, ...rest }, ref) => {
    const classes = [
      styles.root,
      styles[`size-${size}`],
      styles[`tone-${tone}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <span ref={ref} className={classes} {...rest}>
        {children}
      </span>
    );
  },
);
StatusPill.displayName = 'StatusPill';
