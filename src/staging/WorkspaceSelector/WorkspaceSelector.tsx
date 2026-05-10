import { forwardRef, type KeyboardEvent, type MouseEvent } from 'react';
import ChevronDown from '../../icons/16/ChevronDown';
import type { WorkspaceSelectorProps } from './Types';
import styles from './WorkspaceSelector.module.scss';

export const WorkspaceSelector = forwardRef<HTMLDivElement, WorkspaceSelectorProps>(
  (
    {
      workspaceName,
      workspaceLogoSrc,
      workspaceLogoFallback,
      workspaceLogoBg,
      onPress,
      className,
      onClick,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const classes = [styles.root, className].filter(Boolean).join(' ');
    const fallbackLetter =
      workspaceLogoFallback ?? workspaceName.charAt(0).toUpperCase();

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      onPress?.();
      onClick?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onPress?.();
      }
      onKeyDown?.(event);
    };

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        className={classes}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <div
          className={styles.workspaceLogoButton}
          style={workspaceLogoBg ? { background: workspaceLogoBg } : undefined}
        >
          {workspaceLogoSrc ? (
            <img src={workspaceLogoSrc} alt="" />
          ) : (
            <span>{fallbackLetter}</span>
          )}
        </div>
        <span className={styles.workspaceName}>{workspaceName}</span>
        <ChevronDown size={16} className={styles.chevron} />
      </div>
    );
  },
);
WorkspaceSelector.displayName = 'WorkspaceSelector';
