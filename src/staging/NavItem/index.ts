// `NavItem` is a callable Root + a namespace exposing sub-components
// (`NavItem.Label`, `NavItem.Counter`). Mirrors prod's
//   apps/blaze/src/blaze-components/WorkspaceDashboardSidebar/components/NavItem/index.ts
// shape so consumers porting from prod don't rename imports.
export { NavItem } from './NavItem';
export { NavItemContext, useNavItemContext } from './NavItemContext';
export type {
  NavItemRootProps,
  NavItemLabelProps,
  NavItemCounterProps,
  NavItemTrailProps,
  NavItemSize,
  NavItemContextValue,
} from './Types';
