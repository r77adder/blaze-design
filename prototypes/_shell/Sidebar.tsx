import { useLocation, useNavigate } from 'react-router-dom';
import { NavItem, NavSection, WorkspaceSelector } from '@/staging';
import {
  Approvals,
  ArrowUpRightSquareContained,
  AudioSettings,
  BarChartSquare,
  Brand,
  Calendar1 as Calendar1Sm,
  ClockBackward,
  Cursor04,
  Folder,
  Globe,
  LineChartUp02,
  Help,
  Image as ImageIcon,
  Lightning,
  Marker03,
  MetaBrand,
  Plus,
  Search,
  Star,
  Templates,
  UserProfileAdd,
  UserProfileCircle,
  UserProfileGroup,
  Wrench,
} from '@/icons/20';
import {
  Atom,
  AudioSettings02,
  BarGroup3,
  Calendar1,
  Home2,
  Layers5,
} from '@/icons/24';
import { BottomItem } from './BottomItem';
import styles from './Sidebar.module.scss';

export interface SidebarNavItem {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  activeIcon?: React.ComponentType<{ size?: number }>;
  /** Optional right-aligned text indicator (e.g. "3/10", "New"). Renders via
   *  `<NavItem.Trail>` — distinct from numeric `<NavItem.Counter>`. */
  trail?: React.ReactNode;
  /** Optional route path — when set, clicking the item navigates via
   *  React Router and active state derives from the current pathname.
   *  When omitted, falls back to label-equals-activeLabel matching. */
  href?: string;
}

export interface SidebarSection {
  /** Optional uppercase label rendered above the section's items. Omit for
   *  the unlabeled top group (Home etc). */
  label?: string;
  items: SidebarNavItem[];
  /** When true, the label becomes a button with a chevron and the items
   *  collapse on click. Requires `label`. Mirrors prod's SectionHeader. */
  collapsible?: boolean;
  /** Initial collapsed state when uncontrolled. Defaults to false. */
  defaultCollapsed?: boolean;
}

/**
 * Default sidebar — mirrors prod's flat top-level layout. Icons match
 * `apps/blaze/src/blaze-components/WorkspaceDashboardSidebar/components/NavMenu/Buttons/`
 * one-to-one for the redesign-mode (`isSystemRedesignEnabled`) branch:
 *
 * - Home → `Home2` (NavMenuHomeItem.tsx, redesign branch)
 * - Calendar → `Calendar1` (NavMenuScheduledPostsItem.tsx, redesign branch)
 * - Campaigns → `Layers5` (NavMenuCampaignsItem.tsx)
 * - Integrations → `Lightning` (NavMenuAutopilotIntegrationsItem.tsx)
 * - Brand Kit → `Atom` (NavMenuBrandKitsItem.tsx, redesign branch)
 * - Content Preferences → `AudioSettings02` (sliders icon — prod's
 *   NavMenuContentPreferencesItem.tsx)
 * - Approvals → `Approvals` (badge icon — NavMenuApprovalsItem.tsx)
 * - Learnings → `ArrowUpRightSquareContained` (NavMenuLearningsItem.tsx)
 * - Insights → `BarGroup3` (NavMenuInsightsItem.tsx)
 *
 * NOTE: prod also renders "Gen V2 Playground" + "Learnings Playground" entries
 * for internal users only — they're gated and never shipped to real customers.
 * They're omitted here so prototypes look like the user-facing nav.
 */
const DEFAULT_SECTIONS: SidebarSection[] = [
  {
    items: [
      { label: 'Home', icon: Home2 },
      { label: 'Calendar', icon: Calendar1 },
      { label: 'Campaigns', icon: Layers5 },
      { label: 'Integrations', icon: Lightning },
      { label: 'Brand Kit', icon: Atom },
      { label: 'Content Preferences', icon: AudioSettings02 },
      { label: 'Approvals', icon: Approvals },
      { label: 'Learnings', icon: ArrowUpRightSquareContained },
      { label: 'Insights', icon: BarGroup3 },
    ],
  },
  // Reach: real users always have at least Meta Ads + SEO populated in prod
  // (those two are the always-on default channels). Spoof those so the section
  // doesn't look empty in prototypes.
  {
    label: 'Reach',
    collapsible: true,
    items: [
      { label: 'Meta Ads', icon: MetaBrand },
      { label: 'SEO', icon: Globe },
    ],
  },
  // Files & Projects: prod renders four standing actions at the top
  // (Create New / Search / Recents / Media Library) plus user-curated folders
  // below. Spoof a few "Week of" folders so the rail looks lived-in.
  {
    label: 'Files & Projects',
    collapsible: true,
    items: [
      { label: 'Create New', icon: Plus },
      { label: 'Search', icon: Search },
      { label: 'Recents', icon: ClockBackward },
      { label: 'Media Library', icon: ImageIcon },
      { label: 'Week of May 04', icon: Folder },
      { label: 'Week of Apr 27', icon: Folder },
      { label: 'Week of Apr 20', icon: Folder },
    ],
  },
];

/**
 * Ivan's H2 sidebar — Demand Gen / Conversion / Settings sections. Opt-in
 * for the /h2-index prototype. Once H2 ships and replaces the default, this
 * may become the new DEFAULT_SECTIONS.
 */
export const H2_SECTIONS: SidebarSection[] = [
  {
    items: [{ label: 'Home', icon: Home2, href: '/h2' }],
  },
  {
    label: 'Awareness',
    collapsible: true,
    items: [
      { label: 'Organic Campaigns', icon: Calendar1Sm, href: '/h2/organic-social' },
      { label: 'Local SEO', icon: Marker03, href: '/h2/organic-profile' },
      { label: 'SEO/AEO', icon: Globe, href: '/h2/seo-aeo' },
      { label: 'UGC Content', icon: UserProfileCircle, href: '/h2/influencer-content' },
      { label: 'Paid Social', icon: Cursor04, href: '/h2/paid-social' },
      { label: 'Paid Search', icon: BarChartSquare, href: '/h2/paid-search' },
    ],
  },
  {
    label: 'Conversion',
    collapsible: true,
    items: [
      { label: 'Landing Pages', icon: Templates, href: '/h2/landing-pages' },
      { label: 'AI Receptionist', icon: UserProfileGroup, href: '/h2/sdr' },
      { label: 'Reputation', icon: Star, href: '/h2/reputation' },
    ],
  },
  {
    label: 'Work in progress',
    collapsible: true,
    items: [
      { label: 'Ranking', icon: LineChartUp02, href: '/h2/ranking' },
    ],
  },
  {
    label: 'Settings',
    collapsible: true,
    items: [
      { label: 'Meta Strategy', icon: Wrench, href: '/h2/tools' },
      { label: 'Content Settings', icon: AudioSettings, href: '/h2/content-settings' },
      { label: 'Brand Kit', icon: Brand, href: '/h2/brand-kit' },
      { label: 'Integrations', icon: Lightning, trail: '3/10' },
    ],
  },
];

export interface SidebarProps {
  activeLabel?: string;
  /** Sectioned sidebar items. Wins over `items` when both are provided. */
  sections?: SidebarSection[];
  /** Legacy flat list. Renders as a single unlabeled section. */
  items?: SidebarNavItem[];
  /** Workspace name shown in the sidebar header selector. */
  workspaceName?: string;
}

function NavItemEntry({ item, activeLabel, pathname, navigate }: {
  item: SidebarNavItem;
  activeLabel: string;
  pathname: string;
  navigate: (to: string) => void;
}) {
  const isActiveByHref = item.href !== undefined && pathname === item.href;
  const isActiveByLabel = item.href === undefined && item.label === activeLabel;
  const isActive = isActiveByHref || isActiveByLabel;
  const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
  // Icon size 18 matches prod's `desktopIconSize` in NavMenuItem.tsx for the
  // redesign branch (`isSystemRedesignEnabled ? 18 : 20`). The size persists
  // for both 20px and 24px source SVGs since they all auto-scale.
  //
  // Composition matches prod's NavMenuItem render shape:
  //   <NavItem.Root size="lg" isActive>
  //     <Icon size={18} />
  //     <NavItem.Label label={...} />
  //   </NavItem.Root>
  // Typography (14px sm-sohne) lives inside <NavItem.Label>, not on the Root.
  return (
    <NavItem.Root
      isActive={isActive}
      size="lg"
      onPress={item.href !== undefined ? () => navigate(item.href!) : undefined}
    >
      <Icon size={18} />
      <NavItem.Label label={item.label} />
      {item.trail !== undefined && <NavItem.Trail>{item.trail}</NavItem.Trail>}
    </NavItem.Root>
  );
}

export function Sidebar({
  activeLabel = 'Home',
  sections,
  items,
  workspaceName = 'Acme Co',
}: SidebarProps) {
  const resolved: SidebarSection[] = sections
    ? sections
    : items
      ? [{ items }]
      : DEFAULT_SECTIONS;

  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.headerSlot}>
        <WorkspaceSelector workspaceName={workspaceName} />
      </div>
      <nav className={styles.nav}>
        {resolved.map((section, idx) => (
          <NavSection
            key={section.label ?? `__unlabeled-${idx}`}
            label={section.label}
            collapsible={section.collapsible}
            defaultCollapsed={section.defaultCollapsed}
          >
            {section.items.map((item) => (
              <NavItemEntry
                key={item.label}
                item={item}
                activeLabel={activeLabel}
                pathname={pathname}
                navigate={navigate}
              />
            ))}
          </NavSection>
        ))}
      </nav>
      <div className={styles.footer}>
        <BottomItem icon={UserProfileAdd}>Invite Team Members</BottomItem>
        <BottomItem icon={Help}>Help & Learn Blaze</BottomItem>
      </div>
    </aside>
  );
}
