import { NavItem, NavSection, WorkspaceSelector } from '@/staging';
import {
  Approval,
  Approvals,
  ArrowUpRightSquareContained,
  BarChartSquare,
  Brand,
  ClockBackward,
  Folder,
  Gift01,
  Globe,
  Help,
  Image as ImageIcon,
  Lightning,
  MetaBrand,
  Plus,
  Search,
  Settings,
  Templates,
  UserProfileAdd,
  Users,
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
    items: [{ label: 'Home', icon: Home2 }],
  },
  {
    label: 'Demand Gen',
    collapsible: true,
    items: [
      { label: 'Organic Social', icon: BarChartSquare },
      { label: 'SEO/AEO', icon: BarChartSquare },
      { label: 'Map Ranking', icon: BarChartSquare },
      { label: 'UGC Content', icon: Brand },
      { label: 'Paid Social', icon: BarChartSquare },
      { label: 'Paid Search', icon: BarChartSquare },
      { label: 'Email & SMS', icon: Calendar1 },
    ],
  },
  {
    label: 'Conversion',
    collapsible: true,
    items: [
      { label: 'Landing Pages', icon: Templates },
      { label: 'Reputation', icon: Approval },
    ],
  },
  {
    label: 'Settings',
    collapsible: true,
    items: [
      { label: 'Content Settings', icon: Settings },
      { label: 'Brand Kit', icon: Brand },
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

function renderItem(item: SidebarNavItem, activeLabel: string) {
  const isActive = item.label === activeLabel;
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
    <NavItem.Root key={item.label} isActive={isActive} size="lg">
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
            {section.items.map((item) => renderItem(item, activeLabel))}
          </NavSection>
        ))}
      </nav>
      <div className={styles.footer}>
        {/*
          Mirrors prod's BottomItems
          (apps/blaze/.../WorkspaceDashboardSidebar/components/More/components/BottomItems/BottomItems.tsx).
          Order matches prod: Refer & Earn / Join our Community / Invite Team
          Members / Help & Learn Blaze.
        */}
        <BottomItem icon={Gift01}>Refer & Earn</BottomItem>
        <BottomItem icon={Users} href="https://community.blaze.ai">
          Join our Community
        </BottomItem>
        <BottomItem icon={UserProfileAdd}>Invite Team Members</BottomItem>
        <BottomItem icon={Help}>Help & Learn Blaze</BottomItem>
      </div>
    </aside>
  );
}
