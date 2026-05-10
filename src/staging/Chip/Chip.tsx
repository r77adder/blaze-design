import { forwardRef, useState, type MouseEvent } from 'react';
import type { ChipProps, ChipSize } from './Types';
import Plus from '../../icons/12/Plus';
import Close from '../../icons/12/Close';
import styles from './Chip.module.scss';

const ICON_SIZE: Record<ChipSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
};

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      variant = 'default',
      size = 'md',
      icon: Icon,
      selected,
      onSelectionChange,
      deletable = false,
      onDelete,
      type = 'button',
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const isControlled = selected !== undefined;
    const [internalSelected, setInternalSelected] = useState(false);
    const isSelected = isControlled ? selected : internalSelected;

    const classes = [
      styles.root,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      isSelected ? styles.selected : null,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      const next = !isSelected;
      if (!isControlled) setInternalSelected(next);
      onSelectionChange?.(next);
      onClick?.(event);
    };

    const handleDelete = (event: MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      onDelete?.();
    };

    const handleDeleteKey = (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        onDelete?.();
      }
    };

    const iconSize = ICON_SIZE[size];

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        aria-pressed={isSelected}
        onClick={handleClick}
        {...rest}
      >
        {Icon ? (
          <span className={styles.icon}>
            <Icon size={iconSize} />
          </span>
        ) : null}
        {variant === 'add' ? (
          <span className={styles.icon}>
            <Plus size={iconSize} />
          </span>
        ) : null}
        {children !== undefined && children !== null && children !== false ? (
          <span className={styles.label}>{children}</span>
        ) : null}
        {deletable ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Remove"
            className={styles.delete}
            onClick={handleDelete}
            onKeyDown={handleDeleteKey}
          >
            <Close size={12} />
          </span>
        ) : null}
      </button>
    );
  },
);
Chip.displayName = 'Chip';
