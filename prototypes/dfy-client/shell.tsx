import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconButton, Text } from '@/components';
import { PrototypeShell } from '../_shell';
import type { SidebarSection } from '../_shell/Sidebar';
import Home from '@/icons/20/Home';
import Approvals from '@/icons/20/Approvals';
import Calendar1 from '@/icons/20/Calendar1';
import BarChartSquare from '@/icons/20/BarChartSquare';
import Brand from '@/icons/20/Brand';
import Settings from '@/icons/20/Settings';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import UserProfileAdd from '@/icons/20/UserProfileAdd';
import ArrowLeft from '@/icons/20/ArrowLeft';

export const BASE = '/dfy-client';

/**
 * Client-facing shell for the DFY portal. Mirrors H2's chrome (PrototypeShell)
 * but with a slim, view-only client IA. The done-for-you customer sees results
 * and approves work, they don't operate the account, so the operator nav
 * (Meta Strategy, Content Settings, Competitor Tracking, …) is intentionally
 * absent.
 */
export const NAV: { section: string; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { section: 'home', label: 'Home', icon: Home },
  { section: 'approvals', label: 'Approvals', icon: Approvals },
  { section: 'calendar', label: 'Calendar', icon: Calendar1 },
  { section: 'insights', label: 'Insights', icon: BarChartSquare },
  { section: 'leads', label: 'Leads & Bookings', icon: UserProfileGroup },
];

const SECTION_LABEL: Record<string, string> = Object.fromEntries(NAV.map((n) => [n.section, n.label]));
SECTION_LABEL['brand-kit'] = 'Brand Kit';
SECTION_LABEL.settings = 'Settings';
SECTION_LABEL.scorecard = 'Scorecard';
SECTION_LABEL['review-strategy'] = 'Review your strategy';
SECTION_LABEL['review-goals'] = 'Review your goals';
SECTION_LABEL['review-creative'] = 'Review your creative';

export function useGo() {
  const navigate = useNavigate();
  return (path: string) => navigate(BASE + path);
}

/** Back-arrow + label topbar title cluster, for detail/review pages that
 *  aren't top-level nav sections (e.g. the review-* pages). Matches the
 *  back-button convention already used in h2's detail views. */
export function BackTitle({ label }: { label: string }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton variant="ghost" size="sm" icon={ArrowLeft} aria-label="Back to Home" onPress={() => navigate(BASE)} />
      <Text variant="largeList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{label}</Text>
    </div>
  );
}

export function ClientShell({ section, title, topbarRight, topbarCenter, fullBleed, children }: { section: string; title?: ReactNode; topbarRight?: ReactNode; topbarCenter?: ReactNode; fullBleed?: boolean; children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const sidebarSections: SidebarSection[] = [
    { items: [{ label: 'Home', icon: Home, href: BASE }] },
    { items: NAV.filter((n) => n.section !== 'home').map((n) => ({ label: n.label, icon: n.icon, href: `${BASE}/${n.section}` })) },
    { label: 'Account', items: [
      { label: 'Scorecard', icon: BarChartSquare, href: `${BASE}/scorecard` },
      { label: 'Brand Kit', icon: Brand, href: `${BASE}/brand-kit` },
      { label: 'Settings', icon: Settings, href: `${BASE}/settings` },
    ] },
  ];

  return (
    <PrototypeShell
      title={title ?? SECTION_LABEL[section] ?? 'Blaze'}
      workspaceName="Grain Design Flooring"
      sidebarSections={sidebarSections}
      sidebarActiveLabel={SECTION_LABEL[section] ?? 'Home'}
      topbarRight={topbarRight}
      topbarCenter={topbarCenter}
      fullBleed={fullBleed}
      sidebarFooterItems={[{ label: 'Invite Team Members', icon: UserProfileAdd }]}
    >
      {children}
    </PrototypeShell>
  );
}
