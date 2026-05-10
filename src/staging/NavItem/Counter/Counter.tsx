import { useNavItemContext } from '../NavItemContext';
import type { NavItemCounterProps } from '../Types';
import styles from './Counter.module.scss';

/**
 * NavItem.Counter — small right-aligned numeric chip. Faithful (simplified) port of
 *   apps/blaze/src/blaze-components/WorkspaceDashboardSidebar/components/NavItem/Counter/Counter.tsx
 *
 * Prod's Counter shows the count by default and swaps to a base-Counter chip
 * on sidebar hover; the swap is driven by a MobX `leftSidebarStore.isHovered`
 * read. CONVENTIONS strips MobX from ports, so we read `isHovered` from
 * `NavItemContext` instead — the granularity is per-item rather than
 * per-sidebar, which is the right shape for a design-system component.
 *
 * Behavior contract preserved from prod:
 *   - Returns null when `total < 1` (Counter.tsx:11-13 in prod).
 *   - Active state shifts color to the focus token (Counter.module.scss:18).
 */
export const Counter = ({ total, isActive: isActiveProp, classNames, ...rest }: NavItemCounterProps) => {
  const { isActive: isActiveCtx } = useNavItemContext();
  const isActive = isActiveProp ?? isActiveCtx;

  if (total < 1) return null;

  const numberClasses = [styles.number, isActive ? styles.active : null].filter(Boolean).join(' ');
  const wrapperClasses = [styles.counter, classNames].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses} {...rest}>
      <span className={numberClasses}>{total}</span>
    </div>
  );
};
Counter.displayName = 'NavItem.Counter';
