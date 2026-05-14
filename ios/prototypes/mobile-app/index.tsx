import { useState } from 'react';
import { StatePicker, useStateContext, PhoneFrame } from '../_shell';
import { TabBar } from '@ios/staging';
import type { TabItem } from '@ios/staging';
import { HomeScreen } from './HomeScreen';
import { CalendarScreen, CAL_POSTS } from './CalendarScreen';
import { CampaignsScreen } from './CampaignsScreen';
import { BrandKitScreen } from './BrandKitScreen';
import { MoreScreen } from './MoreScreen';
import { ContentPreviewSheet } from './ContentPreviewSheet';
import { CampaignSettingsOverlay } from './CampaignSettingsOverlay';

import plusIcon from '@ios/icons/plus-01.svg';
import checkBrokenIcon from '@ios/icons/lighter_weight/check-broken.svg';
import homeIcon from '@ios/icons/home-04.svg';
import homeFilledIcon from '@ios/icons/home-filled.svg';
import calendarIcon from '@ios/icons/calendar-01.svg';
import campaignsIcon from '@ios/icons/layers-05.svg';
import brandKitIcon from '@ios/icons/atom.svg';
import brandKitFilledIcon from '@ios/icons/brandkit_filled.svg';
import moreIcon from '@ios/icons/more-dots.svg';

const TABS = ['home', 'calendar', 'campaigns', 'brand-kit', 'more'] as const;
type Tab = (typeof TABS)[number];

const TAB_ITEMS: TabItem[] = [
  { id: 'home',       label: 'Home',      icon: homeIcon,      iconActive: homeFilledIcon },
  { id: 'calendar',   label: 'Calendar',  icon: calendarIcon },
  { id: 'campaigns',  label: 'Campaigns', icon: campaignsIcon },
  { id: 'brand-kit',  label: 'Brand Kit', icon: brandKitIcon,  iconActive: brandKitFilledIcon },
  { id: 'more',       label: 'More',      icon: moreIcon },
];

function AppScreens({ onCalendarPostClick, onCampaignsSettings }: { onCalendarPostClick: (idx: number) => void; onCampaignsSettings: () => void }) {
  const { state } = useStateContext();
  return (
    <>
      {state === 'home'      && <HomeScreen />}
      {state === 'calendar'  && <CalendarScreen onPostClick={onCalendarPostClick} />}
      {state === 'campaigns' && <CampaignsScreen onSettingsClick={onCampaignsSettings} />}
      {state === 'brand-kit' && <BrandKitScreen />}
      {state === 'more'      && <MoreScreen />}
      <div style={{ height: 126 }} />
    </>
  );
}

function AppTabBar() {
  const { state, setState } = useStateContext();
  return (
    <TabBar
      tabs={TAB_ITEMS}
      activeTab={state}
      onTabChange={setState}
      floatingButton={
        (state === 'calendar' || state === 'campaigns')
          ? { icon: plusIcon, label: 'New' }
          : undefined
      }
    />
  );
}

export default function MobileApp() {
  const [calPreviewIdx, setCalPreviewIdx]   = useState<number | null>(null);
  const [campSettingsOpen, setCampSettingsOpen] = useState(false);
  const [showCampToast, setShowCampToast]   = useState(false);

  function handleCampConfirm() {
    setShowCampToast(true);
    setTimeout(() => setShowCampToast(false), 5000);
  }

  const calOverlay = calPreviewIdx !== null ? (
    <ContentPreviewSheet
      key={calPreviewIdx}
      post={CAL_POSTS[calPreviewIdx]}
      hasPrev={calPreviewIdx > 0}
      hasNext={calPreviewIdx < CAL_POSTS.length - 1}
      onClose={() => setCalPreviewIdx(null)}
      onPrev={() => setCalPreviewIdx(i => (i !== null && i > 0 ? i - 1 : i))}
      onNext={() => setCalPreviewIdx(i => (i !== null && i < CAL_POSTS.length - 1 ? i + 1 : i))}
    />
  ) : undefined;

  const campOverlay = campSettingsOpen ? (
    <CampaignSettingsOverlay
      onClose={() => setCampSettingsOpen(false)}
      onConfirm={handleCampConfirm}
    />
  ) : undefined;

  return (
    <StatePicker states={TABS} defaultState="home">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', background: 'linear-gradient(145deg, var(--dark-4) 0%, rgba(124,92,252,0.05) 100%)' }}>
        <PhoneFrame footer={<AppTabBar />} overlay={calOverlay ?? campOverlay ?? <CampToast show={showCampToast} />}>
          <AppScreens onCalendarPostClick={setCalPreviewIdx} onCampaignsSettings={() => setCampSettingsOpen(true)} />
        </PhoneFrame>
      </div>
    </StatePicker>
  );
}

function CampToast({ show }: { show: boolean }) {
  if (!show) return null;
  const font = 'var(--ios-font)';
  return (
    <>
      <style>{`
        @keyframes campToastIn { from { opacity:0; transform:translateX(-50%) translateY(-60px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .camp-toast { animation: campToastIn 0.32s cubic-bezier(0.34,1.4,0.64,1) forwards; }
      `}</style>
      <div className="camp-toast" style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', borderRadius: 99, height: 52, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 200, whiteSpace: 'nowrap' }}>
        <div style={{ width: 20, height: 20, borderRadius: 99, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={checkBrokenIcon} alt="" style={{ width: 16, height: 16 }} />
        </div>
        <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'white' }}>Changes applied to 6 campaigns</span>
      </div>
    </>
  );
}
