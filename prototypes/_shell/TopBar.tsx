import type { ReactNode } from 'react';
import styles from './TopBar.module.scss';

export interface TopBarProps {
  /** String renders inside a styled title span; a ReactNode renders as-is
   *  so prototypes can replace the title with a custom cluster (e.g. a detail
   *  view's back-button + lead name + status pill). */
  title?: string | ReactNode;
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  /**
   * Optional content rendered BEFORE the default chrome cluster (state pickers,
   * page-specific actions, etc). The default cluster (avatar) ALWAYS renders so
   * prototypes match prod's chrome regardless of page-specific affordances.
   */
  rightContent?: ReactNode;
}

/**
 * Default chrome cluster — always rendered on the right of the topbar.
 *   - Avatar: 32px circle
 */
function DefaultChromeCluster() {
  return (
    <>
      <span className={styles.avatar} aria-label="Account">K</span>
    </>
  );
}

export function TopBar({ title, leftContent, centerContent, rightContent }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      {(title || leftContent) && (
        <div className={styles.left}>
          {leftContent}
          {typeof title === 'string'
            ? <span className={styles.title}>{title}</span>
            : title}
        </div>
      )}
      {centerContent && <div className={styles.center}>{centerContent}</div>}
      <div className={styles.right}>
        {rightContent}
        <DefaultChromeCluster />
      </div>
    </header>
  );
}
