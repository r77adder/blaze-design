import { forwardRef } from 'react';
import type { PillProps } from './Types';
import styles from './Pill.module.scss';

export const Pill = forwardRef<HTMLDivElement, PillProps>(
  ({ size = 'md', className, children, ...rest }, ref) => {
    const classes = [styles.root, styles[`size-${size}`], className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  },
);
Pill.displayName = 'Pill';
