import { useNavigate } from 'react-router-dom';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button, Text, useModals } from '@/components';
import { TabChip, useToast, StatusPill } from '@/staging';
import { PrototypeShell } from '../_shell';
import type { SidebarSection } from '../_shell/Sidebar';
import { getAccounts, handoffAccount } from './lib/api';
import { HandoffModal } from './Handoff';
import { ApprovalSettingsModal, approvalsChangeRequests } from './Approvals';
import { DevStatePanel } from './DevStatePanel';
import { useDfyState } from './lib/dev-state';
import { useReview, stepReviewCounts, type Phase } from './lib/review';
import HomeIcon from '@/icons/20/Home';
import ClipboardCheck from '@/icons/20/Approvals';
import Compass from '@/icons/20/Globe';
import Clapperboard from '@/icons/20/Star';
import Palette from '@/icons/20/Brand';
import ArrowLeft from '@/icons/20/ArrowLeft';
import ArrowSwitchHorizontal from '@/icons/20/ArrowSwitchHorizontal';
import Lightning from '@/icons/20/Lightning';
import Settings from '@/icons/20/Settings';
import Marker03 from '@/icons/20/Marker03';
import Cursor04 from '@/icons/20/Cursor04';
import Google from '@/icons/20/Google';
import Target2 from '@/icons/20/Target2';
import Templates from '@/icons/20/Templates';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import CalendarPost from '@/icons/20/CalendarPost';
import Insights from '@/icons/20/BarChartSquare';
import AudioSettings from '@/icons/20/AudioSettings';
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
/** Lets a phase step inject chrome into the PhaseScreen frame: a centered
 *  cluster in the sticky footer, and a bar that floats just above it. */
interface PhaseChrome { setFooterCenter: (n: ReactNode) => void; setAboveFooter: (n: ReactNode) => void; setNextDisabled: (b: boolean) => void }
const PhaseChromeContext = createContext<PhaseChrome | null>(null);
export const usePhaseChrome = () => useContext(PhaseChromeContext);

/** Lets a page inject chrome into the WorkspaceShell topbar — sub-tabs into the
 *  center, page actions (e.g. "Generate report") on the right.
 *  Used by the ported H2 pages' H2Layout shim. */
interface WorkspaceChrome { setTopbarCenter: (n: ReactNode) => void; setTopbarRight: (n: ReactNode) => void; setFullBleed: (b: boolean) => void }
const WorkspaceChromeContext = createContext<WorkspaceChrome | null>(null);
export const useWorkspaceChrome = () => useContext(WorkspaceChromeContext);

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
  const [footerCenter, setFooterCenter] = useState<ReactNode>(null);
  const [aboveFooter, setAboveFooter] = useState<ReactNode>(null);
  const [nextDisabled, setNextDisabled] = useState(false);
  const chrome = useMemo(() => ({ setFooterCenter, setAboveFooter, setNextDisabled }), []);
  // Bleed past the shell's 24px content padding so the footer bar spans
  // edge-to-edge and sits flush at the very bottom; the scroll area re-adds
  // padding so the content itself keeps its margins.
  return (
    <PhaseChromeContext.Provider value={chrome}>
      <div style={{ height: 'calc(100% + 48px)', margin: -24, display: 'flex', flexDirection: 'column' }}>
        <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 24px 32px' }}>
          <div style={{ maxWidth, margin: '0 auto' }}>{children}</div>
        </div>
        {aboveFooter && (
          <div style={{ flexShrink: 0, padding: '16px 24px' }}>
            <div style={{ maxWidth, margin: '0 auto' }}>{aboveFooter}</div>
          </div>
        )}
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button variant="secondary" size="lg" onPress={back}>Back</Button>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{footerCenter}</div>
          <Button size="lg" isDisabled={nextDisabled} onPress={next}>{i >= steps.length - 1 ? nextLabel : 'Continue'}</Button>
        </div>
      </div>
    </PhaseChromeContext.Provider>
  );
}

/** `hidden` steps (intro / done) are valid sub values but don't show as tabs. */
export interface Step { key: string; label: string; hidden?: boolean }
export const STEPS: Record<string, Step[]> = {
  // Home tab strip (rendered in the topbar, no step numbers). Workstream is
  // AM-only — filtered out for the client view in WorkspaceShell.
  // Overview is hidden for now — Workstream is the default landing tab and is
  // shown to both AM and client (each gets a different feed in Home).
  home: [
    { key: 'work', label: 'Workstream' },
    { key: 'insights', label: 'Insights' },
  ],
  strategy: [
    { key: 'context', label: 'Brand context' },
    { key: 'creative', label: 'Creative guidelines' },
    { key: 'done', label: 'Done', hidden: true },
  ],
  creative: [
    { key: 'intro', label: 'Intro', hidden: true },
    { key: 'plan', label: 'Plan' },
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
  // Settings tabs — customer details vs the billing record. No step numbers.
  settings: [
    { key: 'general', label: 'General' },
    { key: 'billing', label: 'Billing' },
  ],
  scorecard: [
    { key: 'setup', label: 'Online presence' },
    { key: 'competitors', label: 'Competitors' },
    { key: 'view', label: 'Scorecard' },
  ],
};

interface NavDef { label: string; icon: React.ComponentType<{ size?: number }>; section: string }
interface NavGroup { label?: string; items: NavDef[] }

/** AM sidebar splits the onboarding flow from the steady-state run-the-account
 *  tools, mirroring how the workspace shifts after onboarding completes. */
/** Ported H2 feature groups — shared by AM and Client sidebars. */
const AWARENESS_GROUP: NavGroup = { label: 'Awareness', items: [
  { label: 'Organic Campaigns', icon: CalendarPost, section: 'organic-social' },
  { label: 'Local SEO', icon: Marker03, section: 'organic-profile' },
  { label: 'SEO/AEO', icon: Compass, section: 'seo-aeo' },
  { label: 'Paid Social', icon: Cursor04, section: 'paid-social' },
  { label: 'Paid Search', icon: Google, section: 'paid-search' },
  { label: 'Competitor Tracking', icon: Target2, section: 'competitor-tracking' },
] };
const CONVERSION_GROUP: NavGroup = { label: 'Conversion', items: [
  { label: 'Landing Pages', icon: Templates, section: 'landing-pages' },
  { label: 'AI Receptionist', icon: UserProfileGroup, section: 'sdr' },
  { label: 'Reputation', icon: Clapperboard, section: 'reputation' },
] };

const AM_SECTIONS: NavGroup[] = [
  { items: [
    { label: 'Home', icon: HomeIcon, section: 'home' },
    { label: 'Approvals', icon: ClipboardCheck, section: 'approvals' },
  ] },
  AWARENESS_GROUP,
  CONVERSION_GROUP,
  { label: 'Settings', items: [
    { label: 'Brand Kit', icon: Palette, section: 'brand' },
    { label: 'Scorecard', icon: Insights, section: 'scorecard' },
    { label: 'Strategy', icon: Lightning, section: 'plan' },
    { label: 'Account', icon: Settings, section: 'settings' },
    { label: 'Content Settings', icon: AudioSettings, section: 'content-settings' },
  ] },
];

/** Step tabs rendered into the top nav bar (PrototypeShell topbarCenter).
 *  `flags` marks steps whose client feedback needs review (a count pill). */
function StepTabs({ steps, active, onSelect, showIndex = true, flags }: { steps: Step[]; active: string; onSelect: (k: string) => void; showIndex?: boolean; flags?: Record<string, number> }) {
  const visible = steps.filter((s) => !s.hidden);
  return (
    <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
      {visible.map((s, i) => {
        const on = s.key === active;
        const flag = flags?.[s.key] ?? 0;
        return (
          <button key={s.key} onClick={() => onSelect(s.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: on ? 500 : 400, whiteSpace: 'nowrap', background: 'transparent', color: on ? 'var(--dark-90)' : 'var(--dark-60)' }}>
            {showIndex && <span style={{ width: 16, height: 16, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, background: on ? 'var(--dark-90)' : 'var(--dark-6)', color: on ? 'var(--light-100)' : 'var(--dark-60)' }}>{i + 1}</span>}
            {s.label}
            {flag > 0 && <StatusPill tone="warning" size="sm">{flag}</StatusPill>}
          </button>
        );
      })}
    </div>
  );
}

/** Common workspace chrome: PrototypeShell + DFY sidebar (react-router hrefs)
 *  + optional step tabs in the nav bar. */
export function WorkspaceShell({
  account, side, section, sub, creativeLocked, onReload, topbarExtra, children,
}: {
  account: Account; side: Side; section: string; sub?: string; creativeLocked?: boolean; onReload?: () => void; topbarExtra?: ReactNode; children: ReactNode;
}) {
  const go = useGo();
  const { openModal, closeModal } = useModals();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  // Topbar chrome injected by the page (ported H2 pages push their sub-tabs +
  // actions up here via the H2Layout shim).
  const [injectedCenter, setInjectedCenter] = useState<ReactNode>(null);
  const [injectedRight, setInjectedRight] = useState<ReactNode>(null);
  const [fullBleed, setFullBleed] = useState(false);
  const wsChrome = useMemo(() => ({ setTopbarCenter: setInjectedCenter, setTopbarRight: setInjectedRight, setFullBleed }), []);

  const openHandoff = () => openModal(HandoffModal, {
    account,
    onConfirm: (amName: string, note: string) => {
      handoffAccount(account.id, amName, note);
      closeModal();
      onReload?.();
      showToast({ message: `Handed off to ${amName} — they now own this workspace` });
    },
  });
  const { state: dfyState } = useDfyState();
  const { packet, feedback } = useReview();
  const groups = AM_SECTIONS;
  const allItems = groups.flatMap((g) => g.items);
  const active = allItems.find((n) => n.section === section)?.label ?? allItems[0].label;
  const steps = STEPS[section];

  // In a stepped review phase, once the client returns feedback, flag each step
  // tab with its count of changes + edits so the AM can review in place.
  const stepFlags: Record<string, number> = (side === 'am' && (section === 'strategy' || section === 'creative') && packet(section as Phase) === 'submitted')
    ? Object.fromEntries((steps ?? []).map((st) => { const c = stepReviewCounts(feedback(section as Phase), section as Phase, st.key); return [st.key, c.changes + c.edited]; }))
    : {};

  // Flat sections (Home / Settings / steady-state Strategy) render their sub-tabs
  // as the standard TabChip strip — the same rounded-pill tab the rest of the app
  // uses. Only the onboarding wizards (Strategy / Creative) get numbered step tabs,
  // since those are a sequential flow.
  const chipStrip = (withCounts: boolean) => (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      {(steps ?? []).filter((st) => !st.hidden).map((st) => {
        const count = withCounts
          ? (st.key === 'meetings' ? HOME_TAB_COUNTS.meetings : st.key === 'work' ? HOME_TAB_COUNTS.work : 0)
          : 0;
        return (
          <TabChip key={st.key} selected={sub === st.key} count={count > 0 ? count : undefined} onSelect={() => go(`/${account.id}/${side}/${section}/${st.key}`)}>{st.label}</TabChip>
        );
      })}
    </div>
  );

  const topbarCenter = !sub ? undefined
    // Cold Home is a single setup checklist — no Workstream/Insights tabs.
    : section === 'home' ? (dfyState !== 'steady' && side === 'am' ? undefined : chipStrip(true))
    : section === 'settings' || section === 'plan' ? chipStrip(false)
    : steps
      ? <StepTabs steps={steps} active={sub} onSelect={(k) => go(`/${account.id}/${side}/${section}/${k}`)} flags={stepFlags} />
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

  // In a steady account, surface the client's requested-changes count right
  // next to the "Approvals" title (mirrors the red requested-change pill).
  const requestedChanges = section === 'approvals' && dfyState === 'steady' ? approvalsChangeRequests().length : 0;
  const titleNode = requestedChanges > 0 ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: "'Sohne', sans-serif", fontWeight: 500, fontSize: 16, color: 'var(--dark-90)' }}>{active}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 99, background: 'var(--red-90)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '0 5px', lineHeight: 1 }}>{requestedChanges}</span>
        <span style={{ fontSize: 13, color: 'var(--red-90)', fontWeight: 500 }}>{requestedChanges === 1 ? 'requested change' : 'requested changes'}</span>
      </span>
    </span>
  ) : active;

  return (
   <WorkspaceChromeContext.Provider value={wsChrome}>
    <PrototypeShell
      title={titleNode}
      fullBleed={fullBleed}
      workspaceName={account.name}
      onWorkspacePress={() => setMenuOpen((o) => !o)}
      sidebarSections={sidebarSections}
      sidebarActiveLabel={active}
      sidebarFooterItems={[
        { label: 'Handoff client', icon: ArrowSwitchHorizontal, onClick: openHandoff },
        { label: 'All accounts', icon: ArrowLeft, href: BASE },
      ]}
      topbarCenter={injectedCenter ?? topbarCenter}
      topbarRight={
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {topbarExtra}
          {injectedRight}
          {section === 'approvals' && (
            <Button variant="tertiary" size="sm" frontIcon={Settings} onPress={() => openModal(ApprovalSettingsModal, {})}>Settings</Button>
          )}
        </div>
      }
    >
      {children}
    </PrototypeShell>
    {menuOpen && <AccountSwitcher side={side} currentId={account.id} go={go} onClose={() => setMenuOpen(false)} />}
    <DevStatePanel />
   </WorkspaceChromeContext.Provider>
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
