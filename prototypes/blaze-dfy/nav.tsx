import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Text } from '@/components';
import { TabChip } from '@/staging';
import { PrototypeShell } from '../_shell';
import type { SidebarSection } from '../_shell/Sidebar';
import { getAccounts } from './lib/api';
import HomeIcon from '@/icons/20/Home';
import Insights from '@/icons/20/BarChartSquare';
import ClipboardCheck from '@/icons/20/Approvals';
import Compass from '@/icons/20/Globe';
import Clapperboard from '@/icons/20/Star';
import Palette from '@/icons/20/Brand';
import Calendar from '@/icons/20/Calendar1';
import ArrowLeft from '@/icons/20/ArrowLeft';
import Lightning from '@/icons/20/Lightning';
import Settings from '@/icons/20/Settings';
import type { Account } from './lib/types';
import type { Side } from './lib/router';
import { HOME_TAB_COUNTS } from './Home';

export const BASE = '/blaze-dfy';
export type Go = (path: string) => void;
export function useGo(): Go {
  const navigate = useNavigate();
  return (path: string) => navigate(BASE + path);
}

/** Phase-screen layout: the step content scrolls in an inner area and the
 *  Back / Continue footer is a real flex sibling pinned to the bottom of the
 *  workspace content area (never floating over scrolling content). Walks
 *  sub-steps, then jumps to the previous/next section. */
export function PhaseScreen({ account, side, section, sub, go, prevSection, nextSection, nextHref, nextLabel, maxWidth = 920, children }: {
  account: Account; side: Side; section: string; sub: string; go: Go; prevSection?: string; nextSection?: string; nextHref?: string; nextLabel: string; maxWidth?: number; children: ReactNode;
}) {
  const steps = STEPS[section] ?? [];
  const i = steps.findIndex((x) => x.key === sub);
  const back = () => (i <= 0 ? go(prevSection ? `/${account.id}/${side}/${prevSection}` : `/${account.id}/${side}`) : go(`/${account.id}/${side}/${section}/${steps[i - 1].key}`));
  const next = () => (i >= steps.length - 1 ? go(nextHref ?? (nextSection ? `/${account.id}/${side}/${nextSection}` : `/${account.id}/${side}`)) : go(`/${account.id}/${side}/${section}/${steps[i + 1].key}`));
  // Content scrolls in its own area, so reset that scroll on each sub-step.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [sub]);
  // Bleed past the shell's 24px content padding so the footer bar spans
  // edge-to-edge and sits flush at the very bottom; the scroll area re-adds
  // padding so the content itself keeps its margins.
  return (
    <div style={{ height: 'calc(100% + 48px)', margin: -24, display: 'flex', flexDirection: 'column' }}>
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 24px 32px' }}>
        <div style={{ maxWidth, margin: '0 auto' }}>{children}</div>
      </div>
      <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <Button variant="secondary" size="lg" onPress={back}>Back</Button>
        <Button size="lg" onPress={next}>{i >= steps.length - 1 ? nextLabel : 'Continue'}</Button>
      </div>
    </div>
  );
}

/** `hidden` steps (intro / done) are valid sub values but don't show as tabs. */
export interface Step { key: string; label: string; hidden?: boolean }
export const STEPS: Record<string, Step[]> = {
  // Home tab strip (rendered in the topbar, no step numbers). Workstream is
  // AM-only — filtered out for the client view in WorkspaceShell.
  home: [
    { key: 'overview', label: 'Overview' },
    { key: 'work', label: 'Workstream' },
    { key: 'insights', label: 'Insights' },
  ],
  strategy: [
    { key: 'intro', label: 'Intro', hidden: true },
    { key: 'context', label: 'Brand context' },
    { key: 'creative', label: 'Creative guidelines' },
    { key: 'swipe', label: 'Swipe file' },
    { key: 'audit', label: 'Competitive audit' },
    { key: 'goals', label: 'Goals & theme' },
    { key: 'done', label: 'Done', hidden: true },
  ],
  creative: [
    { key: 'intro', label: 'Intro', hidden: true },
    { key: 'storyboard', label: 'Visual review' },
    { key: 'feedback', label: 'Feedback summary' },
    { key: 'calendar', label: 'Campaign calendar' },
    { key: 'done', label: 'Done', hidden: true },
  ],
  // Steady-state Strategy tab — Scorecard / Blaze Plan as top nav tabs.
  plan: [
    { key: 'scorecard', label: 'Scorecard' },
    { key: 'blaze-plan', label: 'Blaze Plan' },
  ],
};

interface NavDef { label: string; icon: React.ComponentType<{ size?: number }>; section: string }
interface NavGroup { label?: string; items: NavDef[] }

/** AM sidebar splits the onboarding flow from the steady-state run-the-account
 *  tools, mirroring how the workspace shifts after onboarding completes. */
const AM_SECTIONS: NavGroup[] = [
  { items: [
    { label: 'Home', icon: HomeIcon, section: 'home' },
    { label: 'Content Calendar', icon: Calendar, section: 'calendar' },
  ] },
  { label: 'Onboarding', items: [
    { label: 'Strategy onboarding', icon: Compass, section: 'strategy' },
    { label: 'Creative Review', icon: Clapperboard, section: 'creative' },
  ] },
  { label: 'Steady state', items: [
    { label: 'Brand Kit', icon: Palette, section: 'brand' },
    { label: 'Strategy', icon: Lightning, section: 'plan' },
    { label: 'Settings', icon: Settings, section: 'settings' },
  ] },
];
/** Client side splits into a Review section (the onboarding deliverables to
 *  sign off on) and the steady-state workspace tools. */
const CLIENT_SECTIONS: NavGroup[] = [
  { items: [
    { label: 'Home', icon: HomeIcon, section: 'home' },
    { label: 'Calendar', icon: Calendar, section: 'calendar' },
  ] },
  { label: 'Review', items: [
    { label: 'Strategy', icon: Compass, section: 'review-strategy' },
    { label: 'Creative', icon: Clapperboard, section: 'review-creative' },
    { label: 'Weekly Content', icon: ClipboardCheck, section: 'approvals' },
  ] },
  { items: [
    { label: 'Performance', icon: Insights, section: 'insights' },
    { label: 'Brand Kit', icon: Palette, section: 'brand' },
  ] },
];

/** Step tabs rendered into the top nav bar (PrototypeShell topbarCenter). */
function StepTabs({ steps, active, onSelect, showIndex = true }: { steps: Step[]; active: string; onSelect: (k: string) => void; showIndex?: boolean }) {
  const visible = steps.filter((s) => !s.hidden);
  return (
    <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
      {visible.map((s, i) => {
        const on = s.key === active;
        return (
          <button key={s.key} onClick={() => onSelect(s.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: on ? 500 : 400, whiteSpace: 'nowrap', background: 'transparent', color: on ? 'var(--dark-90)' : 'var(--dark-60)' }}>
            {showIndex && <span style={{ width: 16, height: 16, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, background: on ? 'var(--dark-90)' : 'var(--dark-6)', color: on ? 'var(--light-100)' : 'var(--dark-60)' }}>{i + 1}</span>}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/** Common workspace chrome: PrototypeShell + DFY sidebar (react-router hrefs)
 *  + AM/Client switch + optional step tabs in the nav bar. */
export function WorkspaceShell({
  account, side, section, sub, creativeLocked, children,
}: {
  account: Account; side: Side; section: string; sub?: string; creativeLocked?: boolean; children: ReactNode;
}) {
  const go = useGo();
  const [menuOpen, setMenuOpen] = useState(false);
  const groups = side === 'am' ? AM_SECTIONS : CLIENT_SECTIONS;
  const allItems = groups.flatMap((g) => g.items);
  const active = allItems.find((n) => n.section === section)?.label ?? allItems[0].label;
  const steps = STEPS[section];

  // Home uses the TabChip strip (rounded pill + count) — the same tab component
  // the Living Doc home screen ships with; other sections keep the step tabs.
  const topbarCenter = !sub ? undefined
    : section === 'home'
      ? (
        <div style={{ display: 'inline-flex', gap: 6 }}>
          {(steps ?? [])
            .filter((st) => !(side === 'client' && st.key === 'work'))
            .map((st) => {
              const count = st.key === 'meetings' ? HOME_TAB_COUNTS.meetings : st.key === 'work' ? HOME_TAB_COUNTS.work : 0;
              return (
                <TabChip key={st.key} selected={sub === st.key} count={count > 0 ? count : undefined} onSelect={() => go(`/${account.id}/${side}/home/${st.key}`)}>{st.label}</TabChip>
              );
            })}
        </div>
      )
      : steps
        ? <StepTabs steps={steps} active={sub} showIndex={section !== 'plan'} onSelect={(k) => go(`/${account.id}/${side}/${section}/${k}`)} />
        : undefined;

  // Top "All accounts" link returns to the AM directory from anywhere; the rest
  // are the side-appropriate sections with router hrefs. Creative Review is
  // locked (no href, padlock) until Strategy onboarding is finished.
  const sidebarSections: SidebarSection[] = groups.map((g) => ({
    label: g.label,
    items: g.items.map((n) => {
      const locked = creativeLocked && n.section === 'creative';
      return locked
        ? { label: n.label, icon: n.icon, trail: '🔒' }
        : { label: n.label, icon: n.icon, href: `${BASE}/${account.id}/${side}/${n.section}` };
    }),
  }));

  return (
   <>
    <PrototypeShell
      title={section === 'home' ? 'Home' : account.name}
      workspaceName={account.name}
      onWorkspacePress={() => setMenuOpen((o) => !o)}
      sidebarSections={sidebarSections}
      sidebarActiveLabel={active}
      sidebarFooterItems={[{ label: 'All accounts', icon: ArrowLeft, href: BASE }]}
      topbarCenter={topbarCenter}
      topbarRight={
        <div style={{ display: 'inline-flex', gap: 4, padding: 3, background: 'var(--dark-3)', borderRadius: 8 }}>
          {(['am', 'client'] as const).map((s) => {
            const on = s === side;
            return <button key={s} onClick={() => go(`/${account.id}/${s}`)} style={{ border: on ? '1px solid var(--dark-8)' : '1px solid transparent', background: on ? 'var(--light-100)' : 'transparent', color: on ? 'var(--dark-90)' : 'var(--dark-60)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>{s === 'am' ? 'AM' : 'Client'}</button>;
          })}
        </div>
      }
    >
      {children}
    </PrototypeShell>
    {menuOpen && <AccountSwitcher side={side} currentId={account.id} go={go} onClose={() => setMenuOpen(false)} />}
   </>
  );
}

/** Account/workspace overview opened from the sidebar workspace selector —
 *  switch between accounts or jump back to the full directory. */
function AccountSwitcher({ side, currentId, go, onClose }: { side: Side; currentId: string; go: Go; onClose: () => void }) {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  useEffect(() => { getAccounts().then(setAccounts); }, []);
  const stage = (a: Account) => a.status === 'invited' ? 'Awaiting kickoff' : a.status === 'live' ? 'Live' : 'Onboarding';
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 59 }} />
      <div style={{ position: 'fixed', top: 56, left: 14, width: 300, maxHeight: 'calc(100vh - 72px)', overflowY: 'auto', background: 'var(--light-100)', borderRadius: 12, border: '1px solid var(--dark-8)', boxShadow: '0 16px 48px rgba(15,23,42,0.18)', zIndex: 60, padding: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 8px' }}>
          <Text variant="metadata" color="var(--dark-40)">Switch account</Text>
          <Button variant="ghost" size="xs" onPress={() => { onClose(); go(''); }}>All accounts →</Button>
        </div>
        {accounts === null ? (
          <div style={{ padding: 12 }}><Text variant="secondary" color="var(--dark-40)">Loading…</Text></div>
        ) : accounts.map((a) => {
          const on = a.id === currentId;
          return (
            <button key={a.id} onClick={() => { onClose(); go(`/${a.id}/${side}`); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', background: on ? 'var(--dark-4)' : 'transparent', fontFamily: 'inherit' }}>
              <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 7, background: a.accent, color: 'var(--light-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>{a.name.charAt(0)}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <Text variant="smallList" lineClamp={1} style={{ display: 'block' }}>{a.name}</Text>
                <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block' }}>{stage(a)}</Text>
              </span>
              {on && <span style={{ color: 'var(--action-50)', fontWeight: 700 }}>✓</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}
