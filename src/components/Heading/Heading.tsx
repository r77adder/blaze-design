import { forwardRef, createElement, type CSSProperties } from 'react';
import type { HeadingProps } from './Types';
import styles from './Heading.module.scss';

const TAG_BY_LEVEL: Record<1 | 2 | 3 | 4 | 5, 'h1' | 'h2' | 'h3' | 'h4' | 'h5'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, lineClamp, color, className, children, style, ...rest }, ref) => {
    const tag = TAG_BY_LEVEL[level];
    const classes = [
      styles.root,
      styles[`level${level}`],
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

    return createElement(
      tag,
      { ref, className: classes, style: mergedStyle, ...rest },
      children,
    );
  },
);
Heading.displayName = 'Heading';
