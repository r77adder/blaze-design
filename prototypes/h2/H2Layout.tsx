import { useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { H2_SECTIONS, PrototypeShell, type SidebarSection } from '../_shell';
import { ALL_TOOLS, useTools, type ToolId } from './tools-context';

const FILTERED_SECTION_LABELS = new Set(['Awareness', 'Conversion']);
const TOOL_LABELS = new Set<string>(ALL_TOOLS);

const PAGE_TITLES: Record<string, string> = {
  '/h2': 'Home',
  '/h2/organic-social': 'Organic Campaigns',
  '/h2/seo-aeo': 'SEO/AEO',
  '/h2/map-ranking': 'Map Ranking',
  '/h2/influencer-content': 'UGC Content',
  '/h2/paid-social': 'Paid Social',
  '/h2/paid-search': 'Paid Search',
  '/h2/email-sms': 'Email & SMS Programs',
  '/h2/landing-pages': 'Landing Pages',
  '/h2/crm': 'CRM',
  '/h2/reputation': 'Reputation',
  '/h2/content-plan': 'Content Plan',
  '/h2/campaigns': 'Campaigns',
  '/h2/multi-change': 'Multi-Change',
  '/h2/content-settings': 'Content Preferences',
  '/h2/tools': 'Tools',
};

/** Filter Demand Gen + Conversion sections down to the user's enabled tools.
 *  Home, Settings, and any non-tool entries pass through untouched. */
function filterSectionsForEnabledTools(
  sections: SidebarSection[],
  enabled: Set<ToolId>,
): SidebarSection[] {
  return sections
    .map((section) => {
      if (!section.label || !FILTERED_SECTION_LABELS.has(section.label)) return section;
      const items = section.items.filter((item) => {
        if (!TOOL_LABELS.has(item.label)) return true;
        return enabled.has(item.label as ToolId);
      });
      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);
}

export interface H2LayoutProps {
  children: ReactNode;
  /** Override the auto-derived page title (defaults to PAGE_TITLES[pathname]). */
  title?: string;
  /** Optional content rendered in the topbar BEFORE the default chrome cluster.
   *  Use for page-level actions like "Create new". */
  topbarRight?: ReactNode;
  /** Optional content rendered in the topbar's center slot.
   *  Use for page-level tab strips. */
  topbarCenter?: ReactNode;
}

/**
 * Shared layout for every H2 page. Renders the H2 sidebar (Demand Gen /
 * Conversion / Settings) and the topbar with a route-derived title. Sidebar
 * navigation is wired through React Router — clicking an entry navigates
 * the sub-route and the active state derives from `useLocation().pathname`.
 *
 * Each page-specific component renders only its body content; the layout
 * handles all the chrome.
 */
export function H2Layout({ children, title, topbarRight, topbarCenter }: H2LayoutProps) {
  const { pathname } = useLocation();
  const derived = PAGE_TITLES[pathname] ?? 'Blaze';
  const { enabled } = useTools();
  const sections = useMemo(
    () => filterSectionsForEnabledTools(H2_SECTIONS, enabled),
    [enabled],
  );
  return (
    <PrototypeShell
      title={title ?? derived}
      sidebarSections={sections}
      workspaceName="Radiant Health"
      topbarRight={topbarRight}
      topbarCenter={topbarCenter}
    >
      {children}
    </PrototypeShell>
  );
}
