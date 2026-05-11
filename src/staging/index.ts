/**
 * Staging — shared-across-prototypes work-in-progress components.
 *
 * NOT exported from the publishable lib. To use these in prototypes, import
 * from `@/staging` instead of `@/components`.
 *
 * Promotion criterion: a component graduates to `src/components/` only when
 * prod adopts it into `apps/blaze/src/blaze-ui/`. See
 * `.claude/skills/promoting-staging-component.md` for the full process.
 */

export { Logo } from './Logo';
export type { LogoProps } from './Logo';

export { NavItem, NavItemContext, useNavItemContext } from './NavItem';
export type {
  NavItemRootProps,
  NavItemLabelProps,
  NavItemCounterProps,
  NavItemSize,
  NavItemContextValue,
} from './NavItem';

export { Pill } from './Pill';
export type { PillProps, PillSize } from './Pill';

export { Card } from './Card';
export type { CardProps, CardPadding } from './Card';

export { Chip } from './Chip';
export type { ChipProps, ChipSize, ChipVariant, ChipIconProps } from './Chip';

export { NavSection } from './NavSection';
export type { NavSectionProps } from './NavSection';

export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

export { SourcePill } from './SourcePill';
export type { SourcePillProps, SourceName } from './SourcePill';

export { KindBadge } from './KindBadge';
export type { KindBadgeProps, KindBadgeKind } from './KindBadge';

export { Toast } from './Toast';
export type { ToastProps, ToastVariant, ToastAction } from './Toast';

export { WorkspaceSelector } from './WorkspaceSelector';
export type { WorkspaceSelectorProps } from './WorkspaceSelector';

export { TabChip } from './TabChip';
export type { TabChipProps } from './TabChip';

export { Toaster, ToasterProvider, useToast } from './Toaster';
export type {
  ToasterProps,
  ToasterProviderProps,
  ToastSpec,
  ActiveToast,
  ToastContextValue,
} from './Toaster';
