import { useState, useEffect, useRef } from 'react';
import { StatePicker, useStateContext, PhoneFrame } from '../_shell';
import { TabBar, Sheet, Stepper } from '@ios/components';
import type { TabItem } from '@ios/components';
import { HomeScreen } from './HomeScreen';
import type { LLDataState } from './HomeScreen';
import { CampaignsScreen } from './CampaignsScreen';
import { BrandKitScreen } from './BrandKitScreen';
import { MoreScreen } from './MoreScreen';
import { LeadsScreen } from './LeadsScreen';
import { LeadConversationScreen, LeadConversationComposer } from './LeadConversationScreen';
import { StatusPickerSheet } from './StatusPickerSheet';
import { getLead, type Status } from './leads-data';
import { CampaignSettingsOverlay } from './CampaignSettingsOverlay';
import { ASSETS } from './assets';

// Learning Loop feature module (lives in ../learning-loop/)
import { LandingScreen as LLLandingScreen } from '../learning-loop/LandingScreen';
import { LearningsScreen } from '../learning-loop/LearningsScreen';
import { NotifyMeModal } from '../learning-loop/NotifyMeModal';
import { IOSAlert } from '../learning-loop/IOSAlert';
import { LockScreen } from '../learning-loop/LockScreen';
import linkIcon from '@ios/icons/link-external.svg';

// Unscheduled posts feature module (the latest Calendar lives here)
import { CalendarScreen } from '../unscheduled-posts/CalendarScreen';
import { UnscheduledDrawer, INITIAL_UNSCHEDULED_POSTS } from '../unscheduled-posts/UnscheduledDrawer';
import type { UnscheduledPost } from '../unscheduled-posts/UnscheduledDrawer';
import { RescheduleSheet } from '../unscheduled-posts/RescheduleSheet';
import { ContentPreviewScreen } from '../unscheduled-posts/ContentPreviewScreen';

// Campaign approval feature module
import { CampaignApprovalFlow } from '../campaign-approval';

import plusIcon from '@ios/icons/plus-01.svg';
import checkBrokenIcon from '@ios/icons/lighter_weight/check-broken.svg';
import postIcon from '@ios/icons/lighter_weight/design.svg';
import popoverCalendarIcon from '@ios/icons/lighter_weight/calendar-01.svg';
import addStrategyIcon from '@ios/icons/lighter_weight/add-strategy.svg';
import homeIcon from '@ios/icons/home-04.svg';
import homeFilledIcon from '@ios/icons/home-filled.svg';
import calendarIcon from '@ios/icons/calendar-01.svg';
import campaignsIcon from '@ios/icons/layers-05.svg';
// Thin stroked variant — matches the weight of the other tab-bar icons
// (the default `user-profile-group.svg` is a heavier filled glyph).
import receptionistIcon from '@ios/icons/users.svg';
import moreIcon from '@ios/icons/more-dots.svg';

// Primary tabs shown in the bottom tab bar.
const TABS = ['home', 'calendar', 'campaigns', 'receptionist', 'more'] as const;

// All states the state context will accept (includes secondary sub-views like
// brand-kit and lead-conversation that are pushed from a parent tab and don't
// have their own tab in the tab bar).
const ALL_STATES = [...TABS, 'brand-kit', 'lead-conversation'] as const;
type AppState = (typeof ALL_STATES)[number];

const TAB_ITEMS: TabItem[] = [
  { id: 'home',         label: 'Home',         icon: homeIcon, iconActive: homeFilledIcon },
  { id: 'calendar',     label: 'Calendar',     icon: calendarIcon },
  { id: 'campaigns',    label: 'Campaigns',    icon: campaignsIcon },
  { id: 'receptionist', label: 'Receptionist', icon: receptionistIcon },
  { id: 'more',         label: 'More',         icon: moreIcon },
];

// Map a sub-view back to its parent tab so the tab bar stays highlighted on
// the right tab while the user is deep in a secondary screen.
function parentTab(state: string): string {
  if (state === 'brand-kit')         return 'more';
  if (state === 'lead-conversation') return 'receptionist';
  return state;
}

interface AppScreensProps {
  onCampaignsSettings: () => void;
  showSkeleton?: boolean;
  llState: LLDataState;
  onOpenLearningLoop: () => void;
  onApproveCampaign: () => void;
  unscheduledCount: number;
  onUnscheduled: () => void;
  onBrandKitOpen: () => void;
  onBrandKitClose: () => void;
  onLeadOpen: (id: string) => void;
  onLeadClose: () => void;
  selectedLeadId: string | null;
  onStatusEdit: (leadId: string) => void;
  statusOverrides: Record<string, Status>;
}

function AppScreens({
  onCampaignsSettings, showSkeleton,
  llState, onOpenLearningLoop, onApproveCampaign,
  unscheduledCount, onUnscheduled,
  onBrandKitOpen, onBrandKitClose,
  onLeadOpen, onLeadClose, selectedLeadId,
  onStatusEdit, statusOverrides,
}: AppScreensProps) {
  const { state } = useStateContext();

  // The PhoneFrame wraps all screens in a single shared scroll container, so
  // its scrollTop persists when the active screen swaps. Reset it to the top
  // on every screen change — otherwise returning from a scrolled-down
  // conversation leaves the leads list (or whatever screen) pre-scrolled.
  const anchorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let el: HTMLElement | null = anchorRef.current;
    while (el && el !== document.body) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') break;
      el = el.parentElement;
    }
    if (el && el !== document.body) el.scrollTop = 0;
  }, [state]);

  return (
    <>
      <div ref={anchorRef} style={{ height: 0 }} />
      {state === 'home'              && <HomeScreen llState={llState} onOpenLearningLoop={onOpenLearningLoop} onApproveCampaign={onApproveCampaign} />}
      {state === 'calendar'          && <CalendarScreen unscheduledCount={unscheduledCount} onUnscheduled={onUnscheduled} />}
      {state === 'campaigns'         && <CampaignsScreen onSettingsClick={onCampaignsSettings} showSkeleton={showSkeleton} onCampaignClick={onApproveCampaign} />}
      {state === 'receptionist'      && <LeadsScreen onLeadClick={onLeadOpen} onStatusEdit={onStatusEdit} statusOverrides={statusOverrides} />}
      {state === 'lead-conversation' && selectedLeadId && <LeadConversationScreen leadId={selectedLeadId} onBack={onLeadClose} onStatusEdit={onStatusEdit} statusOverrides={statusOverrides} />}
      {state === 'more'              && <MoreScreen onBrandKitClick={onBrandKitOpen} onOpenLearningLoop={onOpenLearningLoop} />}
      {state === 'brand-kit'         && <BrandKitScreen onBack={onBrandKitClose} />}
      <div style={{ height: 148 }} />
    </>
  );
}

function AppTabBar({ onPlusClick }: { onPlusClick: () => void }) {
  const { state, setState } = useStateContext();
  return (
    <TabBar
      tabs={TAB_ITEMS}
      activeTab={parentTab(state)}
      onTabChange={setState}
      floatingButton={
        (state === 'calendar' || state === 'campaigns')
          ? { icon: plusIcon, label: 'New', onClick: onPlusClick }
          : undefined
      }
    />
  );
}

type StrategyView = 'add-strategies' | 'content-qty' | null;

type UnschedView = 'none' | 'drawer' | 'reschedule' | 'preview';

export default function MobileApp() {
  const [campSettingsOpen, setCampSettingsOpen] = useState(false);
  const [showCampToast, setShowCampToast]       = useState(false);
  const [showDefaultsToast, setShowDefaultsToast] = useState(false);
  const [plusPopoverOpen, setPlusPopoverOpen]   = useState(false);
  const [strategyView, setStrategyView]         = useState<StrategyView>(null);
  const [showStrategyToast, setShowStrategyToast] = useState(false);
  const [showSkeleton, setShowSkeleton]         = useState(false);
  const [selectedLeadId, setSelectedLeadId]     = useState<string | null>(null);

  // Shared status-picker bottom sheet — opened from the swipe-left Status
  // action on lead/booking rows and from the in-card Status action in the
  // lead conversation. statusOverrides lets the user "change" a lead's
  // status from any entry point and have it reflected everywhere without
  // mutating the seed LEADS array.
  const [statusEditLeadId, setStatusEditLeadId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides]   = useState<Record<string, Status>>({});

  // Learning Loop state ------------------------------------------------------
  const [llState, setLLState]                   = useState<LLDataState>('no-account');
  const [llView, setLLView]                     = useState<'tabs' | 'll' | 'lock'>('tabs');
  const [notifAccepted, setNotifAccepted]       = useState(false);
  const [llModal, setLLModal]                   = useState<null | 'notify-me' | 'ios-alert'>(null);

  function acceptNotifications() {
    setNotifAccepted(true);
    setLLModal(null);
    setTimeout(() => setLLView('lock'), 1800);
  }

  // Unscheduled posts state --------------------------------------------------
  const [unschedView,  setUnschedView]  = useState<UnschedView>('none');
  const [unschedPosts, setUnschedPosts] = useState<UnscheduledPost[]>(INITIAL_UNSCHEDULED_POSTS);
  function scheduleUnscheduled(id: number) {
    setUnschedPosts(prev => prev.filter(p => p.id !== id));
    setUnschedView('reschedule');
  }

  // Campaign approval state --------------------------------------------------
  const [campaignFlowOpen, setCampaignFlowOpen] = useState(false);

  // campaign settings confirmed — show "Changes applied" toast
  function handleCampConfirm() {
    setCampSettingsOpen(false);
    setShowCampToast(true);
    setTimeout(() => setShowCampToast(false), 5000);
  }

  // schedule / growth defaults saved — show "Saved new defaults" toast
  function handleSaveDefaults() {
    setShowDefaultsToast(true);
    setTimeout(() => setShowDefaultsToast(false), 4000);
  }

  // strategy launched — show skeleton + "Added new strategies" toast
  function handleStrategyLaunch() {
    setStrategyView(null);
    setShowSkeleton(true);
    setShowStrategyToast(true);
    setTimeout(() => {
      setShowStrategyToast(false);
      setShowSkeleton(false);
    }, 4000);
  }

  // Unscheduled posts overlays (drawer / reschedule sheet / preview)
  const calOverlay = (
    <>
      {unschedView === 'drawer' && (
        <UnscheduledDrawer
          posts={unschedPosts}
          onClose={() => setUnschedView('none')}
          onSchedule={scheduleUnscheduled}
        />
      )}
      {unschedView === 'reschedule' && (
        <RescheduleSheet
          onBack={() => setUnschedView('drawer')}
          onClose={() => setUnschedView('none')}
          onConfirm={() => setUnschedView('preview')}
        />
      )}
      {unschedView === 'preview' && (
        <ContentPreviewScreen onClose={() => setUnschedView('none')} />
      )}
    </>
  );

  const campOverlay = campSettingsOpen ? (
    <CampaignSettingsOverlay
      onClose={() => setCampSettingsOpen(false)}
      onConfirm={handleCampConfirm}
      onSaveDefaults={handleSaveDefaults}
    />
  ) : null;

  const plusPopover = plusPopoverOpen ? (
    <PlusPopover
      onClose={() => setPlusPopoverOpen(false)}
      onStrategy={() => { setPlusPopoverOpen(false); setStrategyView('add-strategies'); }}
    />
  ) : null;

  const strategyOverlay = strategyView ? (
    <StrategyFlow
      view={strategyView}
      onClose={() => setStrategyView(null)}
      onNext={() => setStrategyView('content-qty')}
      onLaunch={handleStrategyLaunch}
    />
  ) : null;

  // Learning Loop overlays + push views -------------------------------------
  const llOverlay = (
    <>
      {llModal === 'notify-me' && (
        <NotifyMeModal onDismiss={() => setLLModal(null)} onAccept={() => setLLModal('ios-alert')} />
      )}
      {llModal === 'ios-alert' && (
        <IOSAlert onDeny={() => setLLModal(null)} onAllow={acceptNotifications} />
      )}
    </>
  );

  // Footer slot for AppBody to consume — three signals:
  //  - llConnectFooter: render the LL "Connect Accounts" CTA when present
  //  - hideFooter:      omit the footer entirely (LL push view / lock /
  //                     campaign approval flow takes over the whole frame)
  //  - default:         AppBody renders its own <AppTabBar> with the
  //                     leadReturnTab-aware activeTab mapping
  const llConnectFooter =
    llView === 'll' && llState === 'no-account'
      ? <LLConnectFooter onConnect={() => setLLState('collecting')} />
      : null;
  const hideFooter = llView === 'll' || llView === 'lock' || campaignFlowOpen;

  return (
    <StatePicker states={ALL_STATES} defaultState="home">
      <AppBody
        llView={llView}
        llState={llState}
        campaignFlowOpen={campaignFlowOpen}
        onOpenLearningLoop={() => setLLView('ll')}
        onLLBack={() => setLLView('tabs')}
        onLLLockOpen={() => { setLLState('active'); setLLView('ll'); }}
        onLLConnect={() => setLLState('collecting')}
        onApproveCampaign={() => setCampaignFlowOpen(true)}
        onCampaignClose={() => setCampaignFlowOpen(false)}
        onCampaignsSettings={() => setCampSettingsOpen(true)}
        unscheduledCount={unschedPosts.length}
        onUnscheduled={() => setUnschedView('drawer')}
        onPlusClick={() => setPlusPopoverOpen(v => !v)}
        notifAccepted={notifAccepted}
        onOpenNotifyMe={() => setLLModal('notify-me')}
        showSkeleton={showSkeleton}
        showCampToast={showCampToast}
        showDefaultsToast={showDefaultsToast}
        showStrategyToast={showStrategyToast}
        selectedLeadId={selectedLeadId}
        onLeadOpen={setSelectedLeadId}
        onLeadClose={() => setSelectedLeadId(null)}
        calOverlay={calOverlay}
        campOverlay={campOverlay}
        strategyOverlay={strategyOverlay}
        plusPopover={plusPopover}
        llOverlay={llOverlay}
        llConnectFooter={llConnectFooter}
        hideFooter={hideFooter}
        statusEditLeadId={statusEditLeadId}
        onStatusEdit={setStatusEditLeadId}
        onStatusEditClose={() => setStatusEditLeadId(null)}
        onStatusPick={(leadId, next) => setStatusOverrides(prev => ({ ...prev, [leadId]: next }))}
        statusOverrides={statusOverrides}
      />
    </StatePicker>
  );
}

// Lives inside <StatePicker> so it can read/write the current state — needed
// to push and pop the secondary sub-views (`brand-kit`, `lead-conversation`)
// that aren't represented in the tab bar but ARE valid app states.
interface AppBodyProps {
  llView: 'tabs' | 'll' | 'lock';
  llState: LLDataState;
  campaignFlowOpen: boolean;
  onOpenLearningLoop: () => void;
  onLLBack: () => void;
  onLLLockOpen: () => void;
  onLLConnect: () => void;
  onApproveCampaign: () => void;
  onCampaignClose: () => void;
  onCampaignsSettings: () => void;
  unscheduledCount: number;
  onUnscheduled: () => void;
  onPlusClick: () => void;
  notifAccepted: boolean;
  onOpenNotifyMe: () => void;
  showSkeleton: boolean;
  showCampToast: boolean;
  showDefaultsToast: boolean;
  showStrategyToast: boolean;
  selectedLeadId: string | null;
  onLeadOpen: (id: string | null) => void;
  onLeadClose: () => void;
  calOverlay: React.ReactNode;
  campOverlay: React.ReactNode;
  strategyOverlay: React.ReactNode;
  plusPopover: React.ReactNode;
  llOverlay: React.ReactNode;
  /** Sticky LL "Connect Accounts" CTA, when relevant. */
  llConnectFooter: React.ReactNode;
  /** True when the LL push view / lock screen / campaign approval flow
   *  should take the whole frame and the footer should be omitted. */
  hideFooter: boolean;
  /** Lead whose status the picker is currently editing — null when closed. */
  statusEditLeadId: string | null;
  onStatusEdit: (leadId: string) => void;
  onStatusEditClose: () => void;
  onStatusPick: (leadId: string, next: Status) => void;
  /** Map of lead id → newly-picked status (overrides the seed lead.status). */
  statusOverrides: Record<string, Status>;
}

function AppBody(props: AppBodyProps) {
  const { state, setState } = useStateContext();
  // While a lead conversation is open we swap whatever the LL footer would be
  // for the chat composer — feels like a real iOS messaging detail screen.
  // The composer starts empty (PR55): the AI's proposed reply lives in its
  // own block in the thread, and the summary in a card at the top.
  const footer = (() => {
    if (state === 'lead-conversation') {
      return <LeadConversationComposer key={props.selectedLeadId ?? 'none'} />;
    }
    if (props.hideFooter) return undefined;
    if (props.llConnectFooter) return props.llConnectFooter;
    return <AppTabBar onPlusClick={props.onPlusClick} />;
  })();
  // Resolve which lead the status picker is editing → its current effective
  // status (override if present, else the seed value).
  const statusEditLead = props.statusEditLeadId ? getLead(props.statusEditLeadId) : undefined;
  const statusEditCurrent = statusEditLead
    ? (props.statusOverrides[statusEditLead.id] ?? statusEditLead.status)
    : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', background: 'linear-gradient(145deg, var(--dark-4) 0%, rgba(124,92,252,0.05) 100%)' }}>
      <PhoneFrame
        footer={footer}
        overlay={
          <>
            {props.calOverlay ?? props.campOverlay ?? props.strategyOverlay ?? props.plusPopover ?? null}
            {props.llOverlay}
            <CampToast show={props.showCampToast} />
            <DefaultsToast show={props.showDefaultsToast} />
            <StrategyToast show={props.showStrategyToast} />
            <StatusPickerSheet
              visible={props.statusEditLeadId !== null}
              current={statusEditCurrent}
              onClose={props.onStatusEditClose}
              onPick={(next) => { if (props.statusEditLeadId) props.onStatusPick(props.statusEditLeadId, next); }}
            />
          </>
        }
      >
        {props.llView === 'tabs' && !props.campaignFlowOpen && (
          <AppScreens
            onCampaignsSettings={props.onCampaignsSettings}
            showSkeleton={props.showSkeleton}
            onApproveCampaign={props.onApproveCampaign}
            unscheduledCount={props.unscheduledCount}
            onUnscheduled={props.onUnscheduled}
            llState={props.llState}
            onOpenLearningLoop={props.onOpenLearningLoop}
            onBrandKitOpen={() => setState('brand-kit')}
            onBrandKitClose={() => setState('more')}
            onLeadOpen={(id) => { props.onLeadOpen(id); setState('lead-conversation'); }}
            onLeadClose={() => { props.onLeadClose(); setState('receptionist'); }}
            selectedLeadId={props.selectedLeadId}
            onStatusEdit={props.onStatusEdit}
            statusOverrides={props.statusOverrides}
          />
        )}
        {props.llView === 'll' && props.llState === 'no-account' && (
          <LLLandingScreen onBack={props.onLLBack} />
        )}
        {props.llView === 'll' && props.llState !== 'no-account' && (
          <LearningsScreen
            state={props.llState as 'collecting' | 'active'}
            onBack={props.onLLBack}
            notifAccepted={props.notifAccepted}
            onOpenNotifyMe={props.onOpenNotifyMe}
          />
        )}
        {props.llView === 'lock' && (
          <LockScreen onOpenNotification={props.onLLLockOpen} />
        )}
        {props.campaignFlowOpen && (
          <CampaignApprovalFlow onClose={props.onCampaignClose} />
        )}
      </PhoneFrame>
    </div>
  );
}

// ─── Learning Loop helpers ──────────────────────────────────────────────────

function LLStatePicker({ state, onChange }: { state: LLDataState; onChange: (s: LLDataState) => void }) {
  const opts: Array<{ key: LLDataState; label: string }> = [
    { key: 'no-account', label: 'No connected' },
    { key: 'collecting', label: 'Data waiting' },
    { key: 'active',     label: 'Steady' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, padding: 5, borderRadius: 99, background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontFamily: 'var(--ios-font)', fontSize: 11, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.11px' }}>LL</span>
      {opts.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          style={{
            padding: '6px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
            background: state === key ? 'rgba(0,0,0,0.9)' : 'transparent',
            fontFamily: 'var(--ios-font)', fontSize: 12,
            fontWeight: state === key ? 500 : 400,
            color: state === key ? '#fff' : 'rgba(0,0,0,0.6)',
            WebkitAppearance: 'none', transition: 'all 0.15s ease',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function LLConnectFooter({ onConnect }: { onConnect: () => void }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 30px',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.98) 36%)',
      pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <button
        type="button"
        onClick={onConnect}
        style={{
          pointerEvents: 'all', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '16px 20px', borderRadius: 99, background: 'rgba(0,0,0,0.9)',
          border: 'none', cursor: 'pointer', WebkitAppearance: 'none',
        }}
      >
        <img src={linkIcon} alt="" aria-hidden="true" style={{ width: 18, height: 18, filter: 'invert(1)' }} />
        <span style={{ fontFamily: 'var(--ios-font)', fontSize: 16, fontWeight: 500, color: '#fff' }}>Connect Accounts</span>
      </button>
      <button
        type="button"
        style={{
          pointerEvents: 'all', background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          fontFamily: 'var(--ios-font)', fontSize: 14, color: 'rgba(0,0,0,0.9)',
        }}
      >
        How Learning Loop works →
      </button>
    </div>
  );
}

// ─── Toast components ─────────────────────────────────────────────────────────

const TOAST_ANIM = `
  @keyframes iosToastIn { from { opacity:0; transform:translateX(-50%) translateY(-60px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  .ios-toast { animation: iosToastIn 0.32s cubic-bezier(0.34,1.4,0.64,1) forwards; }
`;

function ToastBase({ children }: { children: React.ReactNode }) {
  const font = 'var(--ios-font)';
  return (
    <>
      <style>{TOAST_ANIM}</style>
      <div className="ios-toast" style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', borderRadius: 99, height: 52, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 200, whiteSpace: 'nowrap', fontFamily: font }}>
        {children}
      </div>
    </>
  );
}

function ToastIcon() {
  return (
    <div style={{ width: 20, height: 20, borderRadius: 99, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <img src={checkBrokenIcon} alt="" style={{ width: 16, height: 16 }} />
    </div>
  );
}

function CampToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <ToastBase>
      <ToastIcon />
      <span style={{ fontSize: 16, fontWeight: 400, color: 'white' }}>Changes applied to 6 campaigns</span>
    </ToastBase>
  );
}

function DefaultsToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <ToastBase>
      <ToastIcon />
      <span style={{ fontSize: 16, fontWeight: 400, color: 'white' }}>Saved new defaults</span>
    </ToastBase>
  );
}

function StrategyToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <ToastBase>
      <ToastIcon />
      <span style={{ fontSize: 16, fontWeight: 400, color: 'white' }}>Added new strategies</span>
    </ToastBase>
  );
}

// ─── Plus popover ("Create new") ─────────────────────────────────────────────

function PlusPopover({ onClose, onStrategy }: { onClose: () => void; onStrategy: () => void }) {
  const font = 'var(--ios-font)';

  const items = [
    {
      bg: 'rgba(106,0,255,0.1)',
      iconSrc: postIcon as unknown as string,
      label: 'Post',
      desc: 'Single post for a campaign',
      onClick: onClose,
    },
    {
      bg: 'rgba(0,131,226,0.1)',
      iconSrc: popoverCalendarIcon as unknown as string,
      label: 'Campaign',
      desc: 'Series of posts over time',
      onClick: onClose,
    },
    {
      bg: 'rgba(32,161,79,0.1)',
      iconSrc: addStrategyIcon as unknown as string,
      label: 'Strategy',
      desc: 'Campaigns organized by goal',
      onClick: onStrategy,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 100 }} />
      {/* Card — matches Figma: left:20, w:362, rounded-24, p:20, gap:20 */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 20,
        width: 362,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 24,
        boxShadow: '0 0 32px rgba(0,0,0,0.08)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        zIndex: 101,
      }}>
        {/* Title */}
        <p style={{ fontFamily: font, fontSize: 18, fontWeight: 400, color: 'var(--ios-dark-90)', margin: 0 }}>Create new</p>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              {/* icon box 50×50 */}
              <div style={{ width: 50, height: 50, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={item.iconSrc} alt="" aria-hidden="true" style={{ width: 30, height: 30 }} />
              </div>
              {/* text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)', letterSpacing: '0.16px' }}>{item.label}</div>
                <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-60)', marginTop: 2, letterSpacing: '0.14px' }}>{item.desc}</div>
              </div>
              {/* chevron */}
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
                <path d="M1 1l6 6-6 6" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Strategy flow ────────────────────────────────────────────────────────────

function StrategyFlow({ view, onClose, onNext, onLaunch }: {
  view: StrategyView;
  onClose: () => void;
  onNext: () => void;
  onLaunch: () => void;
}) {
  const font = 'var(--ios-font)';
  const [selectedStrategy, setSelectedStrategy] = useState<string>('thought-leadership');

  // content qty: default 1 each, email 0
  const [contentQty, setContentQty] = useState({
    stillImage: 1, carousel: 1, feedVideo: 1, shortForm: 1, stories: 1, email: 0,
  });

  const RECOMMENDED = [
    {
      id: 'thought-leadership',
      label: '💭 Thought Leadership',
      desc: 'Position yourself as the go-to-expert with insights that build authority.',
      counter: 2,
      thumbSrc: ASSETS.stratThumbThoughtLead,
      thumbGradient: 'linear-gradient(180deg, #f1b748, #904300)',
    },
    {
      id: 'educational',
      label: '📚 Educational Content',
      desc: 'Teach your audience something valuable. Build trust by helping before selling.',
      counter: 3,
      thumbSrc: ASSETS.stratThumbEducational,
      thumbGradient: 'linear-gradient(-52deg, #6d8b30, #dccb7f)',
    },
    {
      id: 'offer-promotion',
      label: '🛍️ Offer & Promotion',
      desc: 'Highlight what you do and why clients choose over the competition.',
      counter: 4,
      thumbSrc: ASSETS.stratThumbOffer,
      thumbGradient: 'linear-gradient(180deg, #ff6d5f, #d030c8, #68057a)',
    },
  ];

  const CONTENT_TYPES = [
    { key: 'stillImage' as const, label: 'Still image post', subtitle: 'Single image post',    credits: 6,  thumb: ASSETS.contentThumbStillImage },
    { key: 'carousel'   as const, label: 'Carousel post',    subtitle: 'Multi-image swipeable', credits: 24, thumb: ASSETS.contentThumbCarousel },
    { key: 'feedVideo'  as const, label: 'Feed video post',  subtitle: 'Standard video',        credits: 40, thumb: ASSETS.contentThumbFeedVideo },
    { key: 'shortForm'  as const, label: 'Short form video', subtitle: 'Reels, Shorts, TikTok', credits: 40, thumb: ASSETS.contentThumbShortForm },
    { key: 'stories'    as const, label: 'Stories',          subtitle: 'Ephemeral content',     credits: 6,  thumb: ASSETS.contentThumbStories },
    { key: 'email'      as const, label: 'Email',            subtitle: 'Email newsletter',      credits: 8,  thumb: ASSETS.contentThumbEmail },
  ];

  const totalCredits = CONTENT_TYPES.reduce((sum, t) => sum + t.credits * contentQty[t.key], 0);

  return (
    <>
      {/* ── Add strategies sheet ── */}
      <Sheet
        visible={view === 'add-strategies'}
        title="Add strategies"
        size="large"
        onClose={onClose}
        primaryContent={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'white' }}>Launch Now</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Credits icon — lightning bolt */}
              <svg width="16" height="18" viewBox="0 0 10 12" fill="none" aria-hidden="true">
                <path d="M5.5 1L1 6.5h4L3.5 11 9 5.5H5L5.5 1Z" fill="rgba(255,255,255,0.8)"/>
              </svg>
              <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>64</span>
            </div>
          </div>
        }
        onPrimary={onNext}
      >
        <div style={{ padding: '0 20px 32px', background: 'var(--ios-background-gray)', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Description */}
          <p style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', lineHeight: 1.5, margin: 0 }}>
            Pick a strategy to add to your current plan
          </p>

          {/* Strategy cards — single select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RECOMMENDED.map((s) => {
              const isSelected = selectedStrategy === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStrategy(s.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: 8,
                    background: 'var(--ios-light-100)',
                    border: isSelected ? '1px solid var(--ios-dark-90)' : '1px solid var(--ios-dark-8)',
                    borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                    position: 'relative',
                  }}
                >
                  {/* thumbnail — left */}
                  <div style={{ width: 75, height: 75, borderRadius: 12, overflow: 'hidden', flexShrink: 0, position: 'relative', background: s.thumbGradient }}>
                    <img src={s.thumbSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {/* text — middle */}
                  <div style={{ flex: 1, minWidth: 0, paddingRight: isSelected ? 32 : 0 }}>
                    <div style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)', marginBottom: 4 }}>{s.label}</div>
                    <p style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, margin: 0, letterSpacing: '0.12px' }}>{s.desc}</p>
                  </div>
                  {/* radio — top-right (absolute), only when selected */}
                  {isSelected && (
                    <div style={{ position: 'absolute', right: 8, top: 6, width: 24, height: 24, borderRadius: 99, background: 'var(--ios-dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Sheet>

      {/* ── Set default content sheet ── */}
      <Sheet
        visible={view === 'content-qty'}
        title="Set default content"
        size="large"
        leftButton="back"
        onClose={onClose}
        primaryLabel="Add Campaigns Now"
        onPrimary={onLaunch}
        footerNote={
          <span style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: 'var(--ios-dark-60)' }}>
            {totalCredits} credits per campaign
          </span>
        }
      >
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)' }}>
          {/* 2-column grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CONTENT_TYPES.map((ct) => (
              <div
                key={ct.key}
                style={{
                  width: 'calc(50% - 4px)',
                  border: '1.5px solid var(--ios-dark-8)',
                  borderRadius: 24,
                  padding: 13.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--ios-light-100)',
                  boxSizing: 'border-box',
                }}
              >
                {/* illustration thumbnail */}
                <div style={{ width: 150, height: 150, borderRadius: 12, overflow: 'hidden', background: 'rgba(0,0,0,0.03)', flexShrink: 0 }}>
                  <img src={ct.thumb} alt={ct.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {/* label + subtitle */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1.4 }}>{ct.label}</div>
                  <div style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, letterSpacing: '0.12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ct.subtitle}</div>
                </div>
                {/* stepper */}
                <Stepper
                  value={contentQty[ct.key]}
                  min={0}
                  max={10}
                  onChange={(v) => setContentQty(prev => ({ ...prev, [ct.key]: v }))}
                />
                {/* credits */}
                <span style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: 'var(--ios-dark-40)', letterSpacing: '0.12px' }}>
                  Costs {ct.credits} credits
                </span>
              </div>
            ))}
          </div>
        </div>
      </Sheet>
    </>
  );
}
