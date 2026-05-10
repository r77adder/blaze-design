import { forwardRef, type CSSProperties } from 'react';
import type { ParagraphProps } from './Types';
import styles from './Paragraph.module.scss';

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
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
      <p ref={ref} className={classes} style={mergedStyle} {...rest}>
        {children}
      </p>
    );
  },
);
Paragraph.displayName = 'Paragraph';
