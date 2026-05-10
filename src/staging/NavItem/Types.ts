import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Sizes match prod's NavItem `'sm' | 'md' | 'lg'` (apps/blaze/src/blaze-components/
 * WorkspaceDashboardSidebar/components/NavItem/Types.ts). Each size is a
 * contiguous slice of the prod-wide range. The active sidebar consumer is `lg`.
 */
export type NavItemSize = 'sm' | 'md' | 'lg';

export interface NavItemRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  isActive?: boolean;
  isHighlighted?: boolean;
  size?: NavItemSize;
  onPress?: () => void;
}

export interface NavItemContextValue {
  isActive: boolean;
  isHovered: boolean;
}

/**
 * Label is its own sub-component because the typography lives in `Label.module.scss`
 * (mirroring prod's NavItem/Label/Label.module.scss `@include sm-sohne`). The Root
 * deliberately does NOT apply a font mixin so the cascade matches prod 1:1.
 */
export interface NavItemLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** String text — provided as a prop (not children) to mirror prod's
   *  `<NavItem.Label label={...} />` shape and so we can wire `title` for
   *  truncation tooltips identically. */
  label: string;
  /** Extra class to merge — prod calls this `classNames` (apps/blaze/.../Label/Label.tsx),
   *  we keep that prop name to ease consumer ports. */
  classNames?: string;
}

export interface NavItemCounterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Numeric value rendered inside the counter chip. Prod's Counter renders
   *  nothing when `total < 1`; we keep that contract. */
  total: number;
  /** When true the counter color shifts to the active token. Mirrors prod's
   *  Counter `isActive` prop. */
  isActive?: boolean;
  classNames?: string;
}
