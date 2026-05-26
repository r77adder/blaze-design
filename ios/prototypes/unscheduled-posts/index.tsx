import { useState } from 'react';
import { PhoneFrame } from '../_shell';
import { TabBar } from '@ios/components';
import type { TabItem } from '@ios/components';
import { CalendarScreen } from './CalendarScreen';
import { UnscheduledDrawer, INITIAL_UNSCHEDULED_POSTS } from './UnscheduledDrawer';
import type { UnscheduledPost } from './UnscheduledDrawer';
import { RescheduleSheet } from './RescheduleSheet';
import { ContentPreviewScreen } from './ContentPreviewScreen';

import homeIcon from '@ios/icons/home-04.svg';
import homeFilledIcon from '@ios/icons/home-filled.svg';
import calendarIcon from '@ios/icons/calendar-01.svg';
import calendarFilledIcon from '@ios/icons/calendar-01.svg';
import campaignsIcon from '@ios/icons/layers-05.svg';
import brandKitIcon from '@ios/icons/atom.svg';
import brandKitFilledIcon from '@ios/icons/brandkit_filled.svg';
import moreIcon from '@ios/icons/more-dots.svg';

const TAB_ITEMS: TabItem[] = [
  { id: 'home',      label: 'Home',      icon: homeIcon,      iconActive: homeFilledIcon },
  { id: 'calendar', label: 'Calendar',  icon: calendarIcon,  iconActive: calendarFilledIcon },
  { id: 'campaigns', label: 'Campaigns', icon: campaignsIcon },
  { id: 'brand-kit', label: 'Brand Kit', icon: brandKitIcon,  iconActive: brandKitFilledIcon },
  { id: 'more',      label: 'More',      icon: moreIcon },
];

type View = 'calendar' | 'drawer' | 'reschedule' | 'preview';

export default function UnscheduledPostsPrototype() {
  const [view, setView] = useState<View>('calendar');
  const [unscheduledPosts, setUnscheduledPosts] = useState<UnscheduledPost[]>(INITIAL_UNSCHEDULED_POSTS);

  function handleSchedule(id: number) {
    setUnscheduledPosts(prev => prev.filter(p => p.id !== id));
    setView('reschedule');
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', background: 'linear-gradient(145deg, rgba(0,0,0,0.04) 0%, rgba(124,92,252,0.05) 100%)' }}>
      <PhoneFrame
        footer={<TabBar tabs={TAB_ITEMS} activeTab="calendar" onTabChange={() => {}} />}
        overlay={
          <>
            {view === 'drawer' && (
              <UnscheduledDrawer
                posts={unscheduledPosts}
                onClose={() => setView('calendar')}
                onSchedule={handleSchedule}
              />
            )}
            {view === 'reschedule' && (
              <RescheduleSheet
                onBack={() => setView('drawer')}
                onClose={() => setView('calendar')}
                onConfirm={() => setView('preview')}
              />
            )}
            {view === 'preview' && (
              <ContentPreviewScreen onClose={() => setView('calendar')} />
            )}
          </>
        }
      >
        <CalendarScreen unscheduledCount={unscheduledPosts.length} onUnscheduled={() => setView('drawer')} />
      </PhoneFrame>
    </div>
  );
}

