import { forwardRef } from 'react';
import type { ButtonProps, ButtonSize } from './Types';
import styles from './Button.module.scss';

const ICON_SIZE: Record<ButtonSize, number> = {
  xs: 16,
  sm: 16,
  md: 16,
  lg: 18,
  xl: 24,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      frontIcon: FrontIcon,
      endIcon: EndIcon,
      isDisabled = false,
      fullWidth = false,
      type = 'button',
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const classes = [
      styles.root,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      fullWidth ? styles.fullWidth : null,
      isDisabled ? styles.disabled : null,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const iconSize = ICON_SIZE[size];

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || isDisabled}
        aria-disabled={isDisabled || undefined}
        {...rest}
      >
        {FrontIcon ? (
          <span className={styles.icon}>
            <FrontIcon size={iconSize} />
          </span>
        ) : null}
        {children !== undefined && children !== null && children !== false ? (
          <span className={styles.label}>{children}</span>
        ) : null}
        {EndIcon ? (
          <span className={styles.icon}>
            <EndIcon size={iconSize} />
          </span>
        ) : null}
      </button>
    );
  },
);
Button.displayName = 'Button';
