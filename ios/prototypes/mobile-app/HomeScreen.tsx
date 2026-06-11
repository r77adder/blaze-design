import { useState } from 'react';
import { ASSETS } from './assets';
import { CampaignListItem, ContentAreaButton, SidebarDrawer, ToolbarHeader, GlassIconButton, ToolbarButton } from '@ios/components';
import type { WorkspaceItem } from '@ios/components';
import approvalsIcon from '@ios/icons/approvals.svg';
import lightningIcon from '@ios/icons/lightning-01.svg';
import barGroupIcon from '@ios/icons/bar-group-03.svg';
import lineChartIcon from '@ios/icons/line-chart-up-01.svg';
import playIcon from '@ios/icons/play.svg';
import cardIcon from '@ios/icons/card.svg';
import sendIcon from '@ios/icons/send-01.svg';
import plusIcon from '@ios/icons/plus-01.svg';
import chevronRightIcon from '@ios/icons/chevron-right-small.svg';

const font = 'var(--ios-font)';

const MY_WORKSPACES: WorkspaceItem[] = [
  { id: 'radiant', name: 'Radiant Health', plan: 'Growth',  avatarSrc: ASSETS.workspaceAvatar, isCurrent: true },
  { id: 'nike',    name: 'Nike',           plan: 'Growth',  avatarSrc: ASSETS.nikeAvatar },
  { id: 'blanch',  name: 'Blanchards Coffee', plan: 'Starter', avatarBg: '#3d9f73' },
];

const MEMBER_WORKSPACES: WorkspaceItem[] = [
  { id: 'nike-m',   name: 'Nike',             plan: 'Growth',  avatarSrc: ASSETS.nikeAvatar, role: 'member' },
  { id: 'blanch-m', name: 'Blanchards Coffee', plan: 'Starter', avatarBg: '#3d9f73',          role: 'guest'  },
];

const UP_NEXT = [
  {
    id: 1,
    gradient: 'linear-gradient(135deg, #ef7c00 0%, #ffc800 100%)',
    icon: lightningIcon,
    title: 'Connect your accounts',
    sub: null,
    meta: null,
  },
  {
    id: 2,
    gradient: 'linear-gradient(135deg, #20a14f 0%, #1fcf5f 100%)',
    icon: approvalsIcon,
    title: 'Approve your next campaign',
    sub: 'Spring Sale 2026',
    meta: 'Apr 19 – May 1 · 16 posts to review',
  },
  {
    id: 3,
    gradient: 'linear-gradient(135deg, #8b00ef 0%, #b957ff 100%)',
    icon: barGroupIcon,
    title: 'Upgrade to create more content',
    sub: null,
    meta: null,
  },
];

const UPCOMING_POSTS = [
  { id: 1, img: ASSETS.homeUpcomingBlog,    caption: 'The Art of Cold Brew: A Step-by-Step Guide to the perfect steep…' },
  { id: 2, img: ASSETS.homeUpcomingProduct, caption: '5 Signature blends to try this autumn season — light to bold…' },
  { id: 3, img: ASSETS.homeUpcomingPhoto,   caption: 'Savor the Origins — Fall Collection featuring single-origin beans…' },
];

const HOME_CAMPAIGNS = [
  { id: 1, img: ASSETS.homeCampaignSuccess, dateStart: 'Fri, Feb 8', dateEnd: 'Mon, Feb 12', title: 'Success Stories Q1',           category: '🎿 Lifestyle Content', status: 'posting' as const },
  { id: 2, img: ASSETS.homeCampaignTips,    dateStart: 'Fri, Feb 8', dateEnd: 'Mon, Feb 12', title: 'Tips & Tricks March',           category: '💡 Quick Tips',        status: 'review'  as const, statusLabel: '12 posts to review' },
  { id: 3, img: ASSETS.homeCampaignKona,    dateStart: 'Fri, Feb 8', dateEnd: 'Mon, Feb 12', title: 'Kona Coffee for the holidays', category: '🛍️ Offer & Services',  status: 'review'  as const, statusLabel: '4 accounts to connect' },
];

const REACH_CARDS = [
  { id: 1, icon: playIcon,    title: 'Try short form video',       sub: 'Build reach with Reels, Shorts, and TikToks tailored to your brand.' },
  { id: 2, icon: cardIcon,    title: 'Set up your SEO engine',     sub: 'Discover keywords and optimize posts to rank higher on search.' },
  { id: 3, icon: sendIcon,    title: 'Run your first ad',          sub: 'Amplify your best content with a Meta ad campaign.' },
  { id: 4, icon: barGroupIcon, title: 'Unlock the Learning Loop', sub: 'Get weekly AI-powered insights to sharpen your content strategy.' },
];

function SectionHeader({ title, showPlus }: { title: string; showPlus?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontFamily: font, fontSize: 22, fontWeight: 400, lineHeight: 1.2, color: 'var(--ios-dark-90)' }}>{title}</span>
      {showPlus && (
        <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, opacity: 0.4 }}>
          <img src={plusIcon} alt="Add" style={{ width: 20, height: 20 }} />
        </button>
      )}
    </div>
  );
}

export type LLDataState = 'no-account' | 'collecting' | 'active';

export function HomeScreen({
  llState = 'no-account',
  onOpenLearningLoop = () => {},
  onApproveCampaign = () => {},
}: {
  llState?: LLDataState;
  onOpenLearningLoop?: () => void;
  onApproveCampaign?: () => void;
} = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const llSub =
    llState === 'no-account' ? 'Recommendations, applied for you' :
    llState === 'collecting' ? 'Day 3 of 7 — almost ready' :
                               '3 recommendations available';

  return (
    <div style={{ fontFamily: font, background: 'white', minHeight: '100%' }}>

      <SidebarDrawer
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        myWorkspaces={MY_WORKSPACES}
        memberWorkspaces={MEMBER_WORKSPACES}
        onWorkspaceSelect={() => setSidebarOpen(false)}
        onAddWorkspace={() => {}}
      />

      {/* Header */}
      <ToolbarHeader
        variant="screen"
        titleSlot={
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 37, flexShrink: 0,
              background: '#45164a', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {ASSETS.workspaceAvatar
                ? <img src={ASSETS.workspaceAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: font, fontSize: 13, fontWeight: 500, color: '#ffffff', lineHeight: 1 }}>R</span>}
            </div>
            <span style={{ fontFamily: font, fontSize: 18, fontWeight: 400, lineHeight: 1.4, color: 'var(--ios-dark-90)' }}>
              Radiant Health
            </span>
          </button>
        }
        rightButtons={
          <ToolbarButton variant="credits" credits={96} />
        }
      />

      {/* Content */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 30, paddingBottom: 20 }}>

        {/* Welcome */}
        <h1 style={{ margin: 0, fontFamily: font, fontSize: 28, fontWeight: 400, lineHeight: 1.1, color: 'var(--ios-dark-90)' }}>
          Welcome back, Fabian
        </h1>

        {/* Up next */}
        <div>
          <SectionHeader title="Up next" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {UP_NEXT.map((card) => (
              <div
                key={card.id}
                onClick={card.title === 'Approve your next campaign' ? onApproveCampaign : undefined}
                style={{
                  border: '1px solid var(--ios-dark-8)',
                  borderRadius: 12, padding: 16,
                  display: 'flex', alignItems: card.sub ? 'flex-start' : 'center', gap: 12,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                  background: card.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={card.icon} alt="" aria-hidden="true" style={{ width: 16, height: 16, filter: 'invert(1)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 500, lineHeight: 1.4, color: 'var(--ios-dark-90)' }}>
                    {card.title}
                  </div>
                  {card.sub && (
                    <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, lineHeight: 1.4, color: 'var(--ios-dark-90)', marginTop: 2, letterSpacing: '0.14px' }}>
                      {card.sub}
                    </div>
                  )}
                  {card.meta && (
                    <div style={{ fontFamily: font, fontSize: 12, lineHeight: 1.4, color: 'var(--ios-dark-60)', marginTop: 2, letterSpacing: '0.12px' }}>
                      {card.meta}
                    </div>
                  )}
                </div>
                <img src={chevronRightIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16, opacity: 0.3, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming posts */}
        <div>
          <SectionHeader title="Upcoming posts" showPlus />
          <div style={{
            display: 'flex', gap: 12,
            overflowX: 'auto', marginLeft: -20, paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
            scrollbarWidth: 'none',
          }}>
            {UPCOMING_POSTS.map((post) => (
              <div
                key={post.id}
                style={{
                  flexShrink: 0, width: 150, height: 222, borderRadius: 8,
                  border: '1px solid var(--ios-dark-4)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  overflow: 'hidden', position: 'relative',
                  background: 'var(--ios-dark-4)',
                }}
              >
                <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{
                  position: 'absolute', bottom: 10, left: 10,
                  padding: '2px 6px', borderRadius: 4,
                  background: 'rgba(255,174,0,0.3)',
                  border: '1px solid rgba(255,174,0,0.3)',
                }}>
                  <span style={{ fontFamily: font, fontSize: 11, fontWeight: 400, lineHeight: 1.4, color: '#3f2b00', whiteSpace: 'nowrap' }}>
                    Review
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <ContentAreaButton type="secondary" size="m" label="See All Content" showChevron fullWidth />
          </div>
        </div>

        {/* Campaigns */}
        <div>
          <SectionHeader title="Campaigns" showPlus />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {HOME_CAMPAIGNS.map((c, i) => (
              <div
                key={c.id}
                style={{
                  paddingTop: i === 0 ? 0 : 16,
                  paddingBottom: i < HOME_CAMPAIGNS.length - 1 ? 16 : 0,
                  borderBottom: i < HOME_CAMPAIGNS.length - 1 ? '1px solid var(--ios-dark-4)' : 'none',
                }}
              >
                <CampaignListItem
                  thumbnailSrc={c.img}
                  dateStart={c.dateStart}
                  dateEnd={c.dateEnd}
                  title={c.title}
                  category={c.category}
                  status={c.status}
                  statusLabel={c.statusLabel}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <ContentAreaButton type="secondary" size="m" label="See All Campaigns" showChevron fullWidth />
          </div>
        </div>

        {/* Track & improve */}
        <div>
          <SectionHeader title="Track & improve" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ border: '1px solid var(--ios-dark-8)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 96 }}>
              <img src={barGroupIcon} alt="" aria-hidden="true" style={{ width: 18, height: 18, opacity: 0.85 }} />
              <span style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1.4 }}>Insights</span>
              <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', letterSpacing: '0.12px', lineHeight: 1.4 }}>See what's driving your performance</span>
            </div>
            <div
              onClick={onOpenLearningLoop}
              style={{ border: '1px solid var(--ios-dark-8)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 96, cursor: 'pointer' }}
            >
              <img src={lineChartIcon} alt="" aria-hidden="true" style={{ width: 18, height: 18, opacity: 0.85 }} />
              <span style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1.4 }}>Learning Loop</span>
              <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', letterSpacing: '0.12px', lineHeight: 1.4 }}>{llSub}</span>
            </div>
          </div>
        </div>

        {/* Expand your reach */}
        <div style={{ paddingBottom: 16 }}>
          <SectionHeader title="Expand your reach" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REACH_CARDS.map((card) => (
              <div
                key={card.id}
                onClick={card.title === 'Unlock the Learning Loop' ? onOpenLearningLoop : undefined}
                style={{
                  border: '1px solid var(--ios-dark-8)',
                  borderRadius: 12, padding: 16,
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--ios-dark-4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <img src={card.icon} alt="" aria-hidden="true" style={{ width: 16, height: 16, opacity: 0.7 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 500, lineHeight: 1.4, color: 'var(--ios-dark-90)' }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: font, fontSize: 12, lineHeight: 1.4, color: 'var(--ios-dark-60)', letterSpacing: '0.12px', marginTop: 2 }}>
                    {card.sub}
                  </div>
                </div>
                <img src={chevronRightIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16, opacity: 0.3, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
