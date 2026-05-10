import { forwardRef } from 'react';
import type { AvatarProps } from './Types';
import styles from './Avatar.module.scss';

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, fallback, size = 'md', alt, className, ...rest }, ref) => {
    const classes = [styles.root, styles[`size-${size}`], className]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
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
