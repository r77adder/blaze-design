import { forwardRef, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { NavItemRootProps } from './Types';
import { NavItemContext } from './NavItemContext';
import { Label } from './Label/Label';
import { Counter } from './Counter/Counter';
import { Trail } from './Trail/Trail';
import styles from './NavItem.module.scss';

/**
 * NavItem.Root — the outer container. Mirrors prod's `NavItem` component
 * (apps/blaze/src/blaze-components/WorkspaceDashboardSidebar/components/NavItem/NavItem.tsx)
 * with the redesign-mode SCSS values baked in (CONVENTIONS.md §strip-list).
 *
 * Stripped from prod (per CONVENTIONS strip-list):
 *   - `react-router-dom` (NavLink, useLocation, matchPath) — replaced with
 *     `isActive` prop and `onPress` callback. Routing is the consumer's job.
 *   - `react-aria/interactions` `useHover` — replaced with native onMouseEnter/Leave
 *     (no `useHover`-specific touch behaviour we depend on yet).
 *   - `useObjectRef` indirection — `forwardRef` directly.
 *
 * Kept from prod:
 *   - The `NavItemContext.Provider` exposing `isActive` + `isHovered`.
 *   - The size-class composition (`size-lg`, `size-md`, `size-sm`).
 *   - The `.active` / `.highlighted` class names so SCSS selectors line up.
 *
 * Typography lives in `Label.module.scss` (the `<NavItem.Label>` sub-component)
 * — Root deliberately does NOT apply a font mixin. This matches prod, where
 * `NavItem.module.scss` sets only chrome (height/padding/gap) and the label
 * picks its own typography in `Label/Label.module.scss`.
 */
const Root = forwardRef<HTMLDivElement, NavItemRootProps>(
  (
    {
      children,
      isActive = false,
      isHighlighted = false,
      size = 'md',
      onPress,
      className,
      onKeyDown,
      onClick,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const classes = [
      styles.root,
      styles[`size-${size}`],
      isActive && !isHighlighted ? styles.active : null,
      isHighlighted ? styles.highlighted : null,
      className,
    ]
      .filter(Boolean)
      .join(' ');

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

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
      onMouseEnter?.(event);
    };

    const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      onMouseLeave?.(event);
    };

    const contextValue = useMemo(() => ({ isActive, isHovered }), [isActive, isHovered]);

    return (
      <NavItemContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="button"
          tabIndex={0}
          className={classes}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...rest}
        >
          {children}
        </div>
      </NavItemContext.Provider>
    );
  },
);
Root.displayName = 'NavItem.Root';

/**
 * `NavItem` is a namespace object that doubles as a React component. The Root
 * is callable (`<NavItem />`) AND the sub-components are accessible as
 * `NavItem.Label`, `NavItem.Counter`, etc — mirroring prod's
 * `apps/blaze/.../NavItem/index.ts` shape:
 *
 *   export const NavItem = { Root, Emoji, Label, Counter, ControlGroup, Control }
 *
 * We use the same surface so consumers porting from prod don't have to rename
 * imports. `<NavItem.Root>` works; bare `<NavItem>` also works as Root.
 *
 * Control / ControlGroup / Emoji are intentionally NOT yet exposed — they're
 * deferred until a prototype actually needs them (per CONVENTIONS bulk-port
 * note: port the whole composition when the consumer pulls them in, not a
 * piecemeal stub now).
 */
export const NavItem = Object.assign(Root, {
  Root,
  Label,
  Counter,
  Trail,
});
