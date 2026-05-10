import type { ReactNode } from 'react';
import { Button } from '@/components';
import LockOpen3 from '@/icons/24/LockOpen3';
import styles from './TopBar.module.scss';

export interface TopBarProps {
  title?: string;
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  /**
   * Optional content rendered BEFORE the default chrome cluster (state pickers,
   * page-specific actions, etc). The default cluster (credits + Upgrade +
   * avatar) ALWAYS renders so prototypes match prod's chrome regardless of
   * page-specific affordances.
   */
  rightContent?: ReactNode;
}

/**
 * Default chrome cluster — always rendered on the right of the topbar.
 * Mirrors prod's actual rendering verified via Chrome DevTools MCP:
 *   - Credits indicator: sparkle icon + "N Credits"
 *   - Upgrade button: real <Button variant="secondary" size="md"> from blaze-ui
 *     with LockOpen3 frontIcon, var(--upgrade) text color
 *   - Avatar: 28px circle
 *
 * NOT the gradient `VirtualMarketerUpgradeButton` — that's a legacy variant.
 * Prod uses the regular blaze-ui Button.
 */
function DefaultChromeCluster() {
  return (
    <>
      <span className={styles.creditsPill}>
        <span className={styles.creditsIcon} aria-hidden>✦</span>
        48 Credits
      </span>
      <Button
        variant="secondary"
        size="md"
        frontIcon={LockOpen3}
        style={{ color: 'var(--upgrade)' }}
      >
        Upgrade
      </Button>
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
          {title && <span className={styles.title}>{title}</span>}
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
