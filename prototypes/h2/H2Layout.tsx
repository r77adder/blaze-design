import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { H2_SECTIONS, PrototypeShell } from '../_shell';

const PAGE_TITLES: Record<string, string> = {
  '/h2': 'Home',
  '/h2/organic-social': 'Organic Social',
  '/h2/seo-aeo': 'SEO/AEO',
  '/h2/map-ranking': 'Map Ranking',
  '/h2/influencer-content': 'UGC Content',
  '/h2/paid-social': 'Paid Social',
  '/h2/paid-search': 'Paid Search',
  '/h2/email-sms': 'Email & SMS Programs',
  '/h2/landing-pages': 'Landing Pages',
  '/h2/reputation': 'Reputation',
  '/h2/content-plan': 'Content Plan',
  '/h2/campaigns': 'Campaigns',
  '/h2/multi-change': 'Multi-Change',
};

export interface H2LayoutProps {
  children: ReactNode;
  /** Override the auto-derived page title (defaults to PAGE_TITLES[pathname]). */
  title?: string;
  /** Optional content rendered in the topbar BEFORE the default chrome cluster.
   *  Use for page-level actions like "Create new". */
  topbarRight?: ReactNode;
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
export function H2Layout({ children, title, topbarRight }: H2LayoutProps) {
  const { pathname } = useLocation();
  const derived = PAGE_TITLES[pathname] ?? 'Blaze';
  return (
    <PrototypeShell
      title={title ?? derived}
      sidebarSections={H2_SECTIONS}
      workspaceName="Radiant Health"
      topbarRight={topbarRight}
    >
      {children}
    </PrototypeShell>
  );
}
