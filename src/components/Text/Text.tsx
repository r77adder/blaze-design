import { forwardRef, type CSSProperties } from 'react';
import type { TextProps } from './Types';
import styles from './Text.module.scss';

export const Text = forwardRef<HTMLSpanElement, TextProps>(
  ({ variant = 'primary', lineClamp, color, className, children, style, ...rest }, ref) => {
    const classes = [
      styles.root,
      styles[variant],
      lineClamp === 1 && styles.lineClampForceSingleLine,
      lineClamp !== undefined && lineClamp !== 1 && styles.lineClamp,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const mergedStyle: CSSProperties = {
      ...style,
      ...(color !== undefined ? { color } : null),
      ...(lineClamp !== undefined ? ({ ['--lines-to-clamp' as string]: lineClamp } as CSSProperties) : null),
    };

    return (
      <span ref={ref} className={classes} style={mergedStyle} {...rest}>
        {children}
      </span>
    );
  },
);
Text.displayName = 'Text';
