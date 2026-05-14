import { forwardRef, type CSSProperties } from 'react';
import type { AvatarProps } from './Types';
import styles from './Avatar.module.scss';

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, fallback, size = 'md', alt, className, style, ...rest }, ref) => {
    const numericSize = typeof size === 'number' ? size : undefined;
    const presetSize = typeof size === 'string' ? size : undefined;
    const classes = [
      styles.root,
      presetSize ? styles[`size-${presetSize}`] : null,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const inlineStyle: CSSProperties | undefined = numericSize
      ? {
          width: numericSize,
          height: numericSize,
          fontSize: Math.max(10, Math.round(numericSize * 0.36)),
          ...style,
        }
      : style;
    return (
      <div ref={ref} className={classes} style={inlineStyle} {...rest}>
        {src ? (
          <img className={styles.image} src={src} alt={alt ?? ''} />
        ) : (
          <span className={styles.fallback} aria-hidden={alt ? undefined : true}>
            {fallback}
          </span>
        )}
      </div>
    );
  },
);
Avatar.displayName = 'Avatar';
