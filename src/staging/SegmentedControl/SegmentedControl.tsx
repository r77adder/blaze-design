import { forwardRef } from 'react';
import type { SegmentedControlProps, SegmentedControlSize } from './Types';
import styles from './SegmentedControl.module.scss';

const ICON_SIZE: Record<SegmentedControlSize, number> = {
  sm: 16,
  md: 18,
};

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      value,
      onChange,
      options,
      size = 'md',
      fullWidth = false,
      className,
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const rootClasses = [
      styles.root,
      styles[`size-${size}`],
      fullWidth ? styles.fullWidth : null,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} role="tablist" aria-label={ariaLabel} className={rootClasses}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = opt.value === value;
          const iconOnly = opt.label == null;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={iconOnly ? opt.ariaLabel ?? opt.value : opt.ariaLabel}
              className={[
                styles.segment,
                iconOnly ? styles.iconOnly : null,
                isSelected ? styles.selected : null,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange(opt.value)}
            >
              {Icon && <Icon size={ICON_SIZE[size]} color="currentColor" />}
              {opt.label != null && <span className={styles.label}>{opt.label}</span>}
            </button>
          );
        })}
      </div>
    );
  },
);
SegmentedControl.displayName = 'SegmentedControl';
