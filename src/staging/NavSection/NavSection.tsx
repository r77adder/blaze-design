import { forwardRef, useState, type KeyboardEvent } from 'react';
import type { NavSectionProps } from './Types';
import ChevronRight from '../../icons/12/ChevronRight';
import styles from './NavSection.module.scss';

/**
 * NavSection — wraps a labeled, optionally-collapsible group of NavItems.
 * Faithful port of prod's `SectionHeader` (and its `Button.tsx` child) at
 *   apps/blaze/src/blaze-components/WorkspaceDashboardSidebar/components/SectionHeader/
 *
 * Prod's render shape (matching here):
 *   <div class="root [expanded]">
 *     <button class="label [hovered]">
 *       <Text variant="label"><span class="labelText">{children}</span></Text>
 *       {withChevron && <ChevronRight />}
 *     </button>
 *     {action}
 *   </div>
 *
 * Differences from prod (per CONVENTIONS strip-list):
 *   - Stripped `react-aria` `useHover` — native onMouseEnter/Leave handles the
 *     `.hovered` class. (`useHover` is non-trivial only when touch behaviour
 *     matters; the SectionHeader hover is a hover-only affordance.)
 *   - Stripped `react-aria` `useButton` — native button semantics suffice.
 *   - Replaced prod's `SectionHeaderProps.action` slot with a fixed
 *     `defaultCollapsed` + uncontrolled toggle. Prod toggles via parent
 *     state (RootStore) — not appropriate for a design-system primitive.
 *
 * Chevron rotation mirrors prod exactly: base ChevronRight points right;
 * `.expanded` wrapper applies `rotate(90deg)` so it points down. Filled
 * 12px ChevronRight icon ported from prod's `almanac-ui/icons/12/ChevronRight`
 * (NOT our previously-used hand-translated 16px ChevronDown).
 */
export const NavSection = forwardRef<HTMLDivElement, NavSectionProps>(
  ({ label, collapsible = false, defaultCollapsed = false, className, children, ...rest }, ref) => {
    const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
    const [isHovered, setIsHovered] = useState(false);
    const isCollapsible = collapsible && Boolean(label);

    const rootClasses = [styles.root, isExpanded ? styles.expanded : null, className]
      .filter(Boolean)
      .join(' ');

    const buttonClasses = [styles.label, isHovered ? styles.hovered : null].filter(Boolean).join(' ');

    const toggle = () => setIsExpanded((e) => !e);
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    };

    return (
      <div ref={ref} className={rootClasses} {...rest}>
        {label ? (
          isCollapsible ? (
            <button
              type="button"
              className={buttonClasses}
              aria-expanded={isExpanded}
              onClick={toggle}
              onKeyDown={handleKeyDown}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className={styles.labelText}>{label}</span>
              <ChevronRight />
            </button>
          ) : (
            <div className={styles.label}>
              <span className={styles.labelText}>{label}</span>
            </div>
          )
        ) : null}
        {isCollapsible && !isExpanded ? null : children}
      </div>
    );
  },
);
NavSection.displayName = 'NavSection';
