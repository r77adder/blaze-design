import { useState, type ReactNode } from 'react';
import { PhoneFrame } from '../_shell';
import { TabBar } from '@ios/components';
import type { TabItem } from '@ios/components';
import { HomeScreen } from './HomeScreen';
import { LandingScreen } from './LandingScreen';
import { LearningsScreen } from './LearningsScreen';

import homeIcon from '@ios/icons/home-04.svg';
import homeFilledIcon from '@ios/icons/home-filled.svg';
import calendarIcon from '@ios/icons/calendar-01.svg';
import layersIcon from '@ios/icons/layers-05.svg';
import brandKitIcon from '@ios/icons/atom.svg';
import brandKitFilledIcon from '@ios/icons/brandkit_filled.svg';
import moreIcon from '@ios/icons/more-dots.svg';
import linkIcon from '@ios/icons/link-external.svg';

export type LLDataState = 'no-account' | 'collecting' | 'active';

const TABS: TabItem[] = [
  { id: 'home',      label: 'Home',      icon: homeIcon,      iconActive: homeFilledIcon },
  { id: 'calendar',  label: 'Calendar',  icon: calendarIcon },
  { id: 'campaigns', label: 'Campaigns', icon: layersIcon },
  { id: 'brand-kit', label: 'Brand Kit', icon: brandKitIcon,  iconActive: brandKitFilledIcon },
  { id: 'more',      label: 'More',      icon: moreIcon },
];

const PICKER: Array<{ key: LLDataState; label: string }> = [
  { key: 'no-account', label: 'No account' },
  { key: 'collecting', label: 'Collecting' },
  { key: 'active',     label: 'Active' },
];

// section: sticky connect footer (landing only)
function ConnectFooter({ onConnect }: { onConnect: () => void }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '0 20px 34px',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.98) 36%)',
      pointerEvents: 'none',
    }}>
      <button
        type="button"
        onClick={onConnect}
        style={{
          pointerEvents: 'all',
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px 20px', borderRadius: 99, background: 'rgba(0,0,0,0.9)',
          border: 'none', cursor: 'pointer', WebkitAppearance: 'none', marginBottom: 10,
        }}
      >
        <img src={linkIcon} alt="" aria-hidden="true" style={{ width: 18, height: 18, filter: 'invert(1)' }} />
        <span style={{ fontFamily: "'Sohne', sans-serif", fontSize: 16, fontWeight: 500, color: '#fff' }}>
          Connect Accounts
        </span>
      </button>
      <p style={{
        pointerEvents: 'all', margin: 0, textAlign: 'center',
        fontFamily: "'Sohne', sans-serif", fontSize: 13, color: 'rgba(0,0,0,0.5)',
      }}>
        Takes around 2 min
      </p>
    </div>
  );
}

export default function LearningLoopPrototype() {
  const [llState, setLLState] = useState<LLDataState>('active');
  const [view,    setView]    = useState<'home' | 'll'>('home');
  const isLL = view === 'll';

  const footer: ReactNode = !isLL
    ? <TabBar tabs={TABS} activeTab="home" onTabChange={() => {}} />
    : llState === 'no-account'
    ? <ConnectFooter onConnect={() => { setLLState('collecting'); setView('home'); }} />
    : undefined;

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
            onClick={() => { setLLState(key); if (isLL && key === 'no-account') setView('ll'); }}
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

      <PhoneFrame footer={footer}>
        {!isLL && (
          <HomeScreen
            llState={llState}
            onViewLearnings={() => setView('ll')}
          />
        )}
        {isLL && llState === 'no-account' && (
          <LandingScreen onBack={() => setView('home')} />
        )}
        {isLL && (llState === 'collecting' || llState === 'active') && (
          <LearningsScreen state={llState} onBack={() => setView('home')} />
        )}
      </PhoneFrame>
    </div>
  );
}
