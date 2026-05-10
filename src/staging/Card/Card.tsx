import { forwardRef, type KeyboardEvent } from 'react';
import type { CardProps } from './Types';
import styles from './Card.module.scss';

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'md',
      interactive = false,
      className,
      children,
      onClick,
      onKeyDown,
      tabIndex,
      role,
      ...rest
    },
    ref,
  ) => {
    const classes = [
      styles.root,
      styles[`padding-${padding}`],
      interactive ? styles.interactive : null,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (interactive && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
      onKeyDown?.(event);
    };

    return (
      <div
        ref={ref}
        className={classes}
        onClick={onClick}
        onKeyDown={interactive || onKeyDown ? handleKeyDown : undefined}
        tabIndex={interactive ? tabIndex ?? 0 : tabIndex}
        role={interactive ? role ?? 'button' : role}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';
