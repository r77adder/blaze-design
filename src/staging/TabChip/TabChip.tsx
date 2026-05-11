import { forwardRef, type MouseEvent } from 'react';
import type { TabChipProps } from './Types';
import styles from './TabChip.module.scss';

export const TabChip = forwardRef<HTMLButtonElement, TabChipProps>(
  ({ className, children, selected = false, count, onSelect, onClick, type = 'button', ...rest }, ref) => {
    const classes = [styles.root, selected ? styles.selected : null, className].filter(Boolean).join(' ');

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onSelect?.();
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        aria-pressed={selected}
        onClick={handleClick}
        {...rest}
      >
        <span className={styles.label}>{children}</span>
        {count !== undefined && <span className={styles.count}>{count}</span>}
      </button>
    );
  },
);
TabChip.displayName = 'TabChip';
