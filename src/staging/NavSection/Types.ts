import type { HTMLAttributes } from 'react';

// Groups a set of NavItems under an uppercase section label inside a Sidebar.
// The label is a string prop (not a slot) so the section's anatomy is rigid:
// label first, then children NavItems. See CONVENTIONS.md.
export interface NavSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Uppercase label rendered above the children. Optional — pass undefined
   *  to render an unlabeled group (useful for the top-of-sidebar items). */
  label?: string;
  /** When true, the label becomes a button and the children can be hidden by
   *  clicking it. A chevron next to the label rotates 180° when collapsed.
   *  Mirrors prod's SectionHeader (apps/blaze/src/blaze-components/
   *  WorkspaceDashboardSidebar/components/SectionHeader/) which uses a
   *  ChevronRight that rotates 90deg via the `.expanded` class.
   *  Requires `label` — a collapsible section without a label has no
   *  affordance to toggle.
   *  Defaults to false (non-collapsible). */
  collapsible?: boolean;
  /** Initial collapsed state when uncontrolled. Defaults to false (expanded). */
  defaultCollapsed?: boolean;
}
