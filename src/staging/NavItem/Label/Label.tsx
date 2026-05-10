import { useContext } from 'react';
import type { NavItemLabelProps } from '../Types';
import { NavItemContext } from '../NavItemContext';
import styles from './Label.module.scss';

/**
 * NavItem.Label — typography-bearing label slot. Faithful port of prod's
 * apps/blaze/src/blaze-components/WorkspaceDashboardSidebar/components/NavItem/Label/Label.tsx
 *
 * The font (`@include sm-sohne` = 14px Buch) lives in Label.module.scss, NOT in
 * NavItem.module.scss — that's the whole point of the composition refactor.
 *
 * Active-bold treatment: prod's NavMenuItem applies its own `.isActive` class
 * (apps/blaze/.../NavMenu/NavMenuItem/NavMenuItem.module.scss line 25-29) to
 * NavItem.Label via the `classNames` prop, which sets `font-weight: 500` in
 * redesign mode. Our composition skips the NavMenuItem layer, so Label
 * subscribes to NavItemContext directly and applies the bold class when
 * `isActive`.
 *
 * Prop name `classNames` (not `className`) mirrors prod 1:1 to ease consumer
 * porting.
 */
export const Label = ({ label, classNames, ...rest }: NavItemLabelProps) => {
  const ctx = useContext(NavItemContext);
  const isActive = ctx?.isActive ?? false;
  const classes = [styles.label, isActive ? styles.active : null, classNames]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} title={label} {...rest}>
      {label}
    </div>
  );
};
Label.displayName = 'NavItem.Label';
