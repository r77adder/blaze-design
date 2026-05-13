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

import plusIcon from '@ios/icons/plus-01.svg';
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

function AppScreens({ onCalendarPostClick }: { onCalendarPostClick: (idx: number) => void }) {
  const { state } = useStateContext();
  return (
    <>
      {state === 'home'      && <HomeScreen />}
      {state === 'calendar'  && <CalendarScreen onPostClick={onCalendarPostClick} />}
      {state === 'campaigns' && <CampaignsScreen />}
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
  const [calPreviewIdx, setCalPreviewIdx] = useState<number | null>(null);

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

  return (
    <StatePicker states={TABS} defaultState="home">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', background: 'linear-gradient(145deg, var(--dark-4) 0%, rgba(124,92,252,0.05) 100%)' }}>
        <PhoneFrame footer={<AppTabBar />} overlay={calOverlay}>
          <AppScreens onCalendarPostClick={setCalPreviewIdx} />
        </PhoneFrame>
      </div>
    </StatePicker>
  );
}
