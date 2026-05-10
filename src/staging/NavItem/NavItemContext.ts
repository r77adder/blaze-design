import { createContext, useContext } from 'react';
import type { NavItemContextValue } from './Types';

/**
 * Mirrors prod's `NavItemContext` (apps/blaze/src/blaze-components/
 * WorkspaceDashboardSidebar/components/NavItem/NavItemContext.ts). Sub-components
 * (`Label`, `Counter`, `Control`, `Emoji`) read this to react to active / hover
 * state without prop-drilling.
 */
export const NavItemContext = createContext<NavItemContextValue>({
  isActive: false,
  isHovered: false,
});

export const useNavItemContext = () => useContext(NavItemContext);
