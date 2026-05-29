import { useState, type ReactNode } from 'react';
import { PhoneFrame } from '../_shell';
import { TabBar } from '@ios/components';
import type { TabItem } from '@ios/components';
import { HomeScreen } from './HomeScreen';
import { LandingScreen } from './LandingScreen';
import { LearningsScreen } from './LearningsScreen';
import { MoreScreen } from './MoreScreen';
import { NotifyMeModal } from './NotifyMeModal';
import { IOSAlert } from './IOSAlert';
import { LockScreen } from './LockScreen';

import homeIcon from '@ios/icons/home-04.svg';
import homeFilledIcon from '@ios/icons/home-filled.svg';
import calendarIcon from '@ios/icons/calendar-01.svg';
import layersIcon from '@ios/icons/layers-05.svg';
import brandKitIcon from '@ios/icons/atom.svg';
import brandKitFilledIcon from '@ios/icons/brandkit_filled.svg';
import moreIcon from '@ios/icons/more-dots.svg';
import linkIcon from '@ios/icons/link-external.svg';

export type LLDataState = 'no-account' | 'collecting' | 'active';
type View = 'home' | 'more' | 'll' | 'lock-screen';

const TABS: TabItem[] = [
  { id: 'home',      label: 'Home',      icon: homeIcon,      iconActive: homeFilledIcon },
  { id: 'calendar',  label: 'Calendar',  icon: calendarIcon },
  { id: 'campaigns', label: 'Campaigns', icon: layersIcon },
  { id: 'brand-kit', label: 'Brand Kit', icon: brandKitIcon,  iconActive: brandKitFilledIcon },
  { id: 'more',      label: 'More',      icon: moreIcon },
];

const PICKER: Array<{ key: LLDataState; label: string }> = [
  { key: 'no-account', label: 'No connected' },
  { key: 'collecting', label: 'Data waiting' },
  { key: 'active',     label: 'Steady' },
];

// section: sticky connect footer (no-account LL only)
function ConnectFooter({ onConnect, onHowItWorks }: { onConnect: () => void; onHowItWorks: () => void }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '0 20px 30px',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.98) 36%)',
      pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <button
        type="button"
        onClick={onConnect}
        style={{
          pointerEvents: 'all',
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '16px 20px', borderRadius: 99, background: 'rgba(0,0,0,0.9)',
          border: 'none', cursor: 'pointer', WebkitAppearance: 'none',
        }}
      >
        <img src={linkIcon} alt="" aria-hidden="true" style={{ width: 18, height: 18, filter: 'invert(1)' }} />
        <span style={{ fontFamily: "'Sohne', sans-serif", fontSize: 16, fontWeight: 500, color: '#fff' }}>
          Connect Accounts
        </span>
      </button>
      <button
        type="button"
        onClick={onHowItWorks}
        style={{
          pointerEvents: 'all', background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          fontFamily: "'Sohne', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.9)',
        }}
      >
        How Learning Loop works →
      </button>
    </div>
  );
}

export default function LearningLoopPrototype() {
  const [llState, setLLState] = useState<LLDataState>('no-account');
  const [view,    setView]    = useState<View>('home');
  const [notifAccepted, setNotifAccepted] = useState(false);
  const [modal, setModal] = useState<null | 'notify-me' | 'ios-alert'>(null);

  const openLearningLoop = () => setView('ll');
  const backToHome       = () => setView('home');

  // After the iOS alert is allowed, schedule a push to arrive shortly.
  function acceptNotifications() {
    setNotifAccepted(true);
    setModal(null);
    setTimeout(() => setView('lock-screen'), 1800);
  }

  // Tab bar — only "More" is interactive; other tabs are decorative.
  function onTabChange(id: string) {
    if (id === 'more') setView('more');
    else if (id === 'home') setView('home');
  }

  const activeTab = view === 'more' ? 'more' : 'home';
  const isLL = view === 'll';
  const isLock = view === 'lock-screen';
  const showTabBar = view === 'home' || view === 'more';

  const footer: ReactNode = showTabBar
    ? <TabBar tabs={TABS} activeTab={activeTab} onTabChange={onTabChange} />
    : isLL && llState === 'no-account'
    ? <ConnectFooter
        onConnect={() => { setLLState('collecting'); /* stay on LL to show the new state */ }}
        onHowItWorks={() => {}}
      />
    : undefined;

  // Modal overlays render above the footer.
  let overlay: ReactNode = undefined;
  if (modal === 'notify-me') {
    overlay = (
      <NotifyMeModal
        onDismiss={() => setModal(null)}
        onAccept={() => setModal('ios-alert')}
      />
    );
  } else if (modal === 'ios-alert') {
    overlay = (
      <IOSAlert
        onDeny={() => setModal(null)}
        onAllow={acceptNotifications}
      />
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', width: '100vw', height: '100vh', gap: 20,
      background: 'linear-gradient(145deg, rgba(0,0,0,0.03) 0%, rgba(124,92,252,0.06) 100%)',
    }}>
      {/* State picker */}
      <div style={{
        display: 'flex', gap: 4, padding: 5, borderRadius: 99,
        background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        {PICKER.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setLLState(key);
              // When picking active mid-flow, simulate "notification was granted earlier".
              if (key === 'active') setNotifAccepted(true);
              if (key === 'no-account') setNotifAccepted(false);
            }}
            style={{
              padding: '7px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
              background: llState === key ? 'rgba(0,0,0,0.9)' : 'transparent',
              fontFamily: "'Sohne', sans-serif", fontSize: 12,
              fontWeight: llState === key ? 500 : 400,
              color: llState === key ? '#fff' : 'rgba(0,0,0,0.6)',
              WebkitAppearance: 'none', transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <PhoneFrame footer={footer} overlay={overlay}>
        {view === 'home' && (
          <HomeScreen
            llState={llState}
            onViewLearnings={openLearningLoop}
          />
        )}
        {view === 'more' && (
          <MoreScreen onOpenLearningLoop={openLearningLoop} />
        )}
        {isLL && llState === 'no-account' && (
          <LandingScreen onBack={backToHome} />
        )}
        {isLL && (llState === 'collecting' || llState === 'active') && (
          <LearningsScreen
            state={llState}
            onBack={backToHome}
            notifAccepted={notifAccepted}
            onOpenNotifyMe={() => setModal('notify-me')}
          />
        )}
        {isLock && (
          <LockScreen
            onOpenNotification={() => {
              // Tap notification → open Learning Loop in steady state.
              setLLState('active');
              setView('ll');
            }}
          />
        )}
      </PhoneFrame>
    </div>
  );
}
