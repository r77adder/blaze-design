import { useState } from 'react';
import { Sheet, Toggle, Stepper } from '@ios/staging';
import { ASSETS } from './assets';

// section: constants

const font = 'var(--ios-font)';

const POST_DAYS = ['Any day', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CONFIRM_CAMPAIGNS = [
  {
    id: 1,
    thumb: ASSETS.campThumb1,
    dates: 'Fri, Feb 8 – Mon, Feb 12',
    title: 'Brew Bold: Signature Blends, Local Pride',
    category: '🛍️ Offer & Services',
    badge: 'Generates in 4 days',
  },
  {
    id: 2,
    thumb: ASSETS.campThumb2,
    dates: 'Mon, Feb 19 – Fri, Feb 23',
    title: 'Brew Masters: Techniques from Around the World',
    category: '🛍️ Offer & Services',
    badge: 'Generates in 10 days',
  },
  {
    id: 3,
    thumb: ASSETS.campThumb3,
    dates: 'Sat, Feb 24 – Wed, Feb 28',
    title: 'Sustainability in Every Sip: Eco-Friendly Coffee Practices',
    category: '🛍️ Offer & Services',
    badge: 'Generates in 16 days',
  },
  {
    id: 4,
    thumb: ASSETS.campThumb4,
    dates: 'Thu, Feb 29 – Mon, Mar 4',
    title: 'Coffee and Culture: Traditions Across Continents',
    category: '🛍️ Offer & Services',
    badge: 'Generates in 6 days',
  },
];

// section: types

type View = 'settings' | 'content' | 'still-image' | 'carousel' | 'feed-video' | 'blogs' | 'emails' | 'confirm';
type ContentMode = 'crosspost' | 'unique';

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

// section: inline SVG icons

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3" stroke="var(--ios-dark-80)" strokeWidth="1.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M14.36 5.64l1.42-1.42M4.22 15.78l1.42-1.42" stroke="var(--ios-dark-80)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="14" rx="3" stroke="var(--ios-dark-80)" strokeWidth="1.5" />
      <path d="M2 8h16M6 2v4M14 2v4" stroke="var(--ios-dark-80)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconBarChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="11" width="4" height="7" rx="1" stroke="var(--ios-dark-80)" strokeWidth="1.5" />
      <rect x="8" y="6" width="4" height="12" rx="1" stroke="var(--ios-dark-80)" strokeWidth="1.5" />
      <rect x="14" y="2" width="4" height="16" rx="1" stroke="var(--ios-dark-80)" strokeWidth="1.5" />
    </svg>
  );
}

function IconStillImage() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="16" height="14" rx="3" stroke="#E8672A" strokeWidth="1.5" />
      <circle cx="7" cy="8" r="1.5" stroke="#E8672A" strokeWidth="1.5" />
      <path d="M2 14l4-4 3 3 3-3 4 4" stroke="#E8672A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCarousel() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="12" height="14" rx="2" stroke="#E8672A" strokeWidth="1.5" />
      <path d="M1 6v8M19 6v8" stroke="#E8672A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="12" rx="3" stroke="#7C5CFC" strokeWidth="1.5" />
      <path d="M14 8l4-2v8l-4-2V8z" stroke="#7C5CFC" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconBlog() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="#34A853" strokeWidth="1.5" />
      <path d="M6 7h8M6 10h8M6 13h5" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="#FBBC05" strokeWidth="1.5" />
      <path d="M2 7l8 5 8-5" stroke="#FBBC05" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
      <path d="M1 1l6 6-6 6" stroke="var(--ios-dark-40)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheckmark() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
      <path d="M1 4l3 3 5-6" stroke="var(--ios-light-100)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// section: sub-components

function CreditsNote() {
  return (
    <span style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: 'var(--ios-dark-60)' }}>
      12 posts per week&nbsp;&nbsp;•&nbsp;&nbsp;165 credits&nbsp;&nbsp;•&nbsp;&nbsp;+15 more credits per week
    </span>
  );
}

function AccountAvatar({ type }: { type: 'radiantHealth' | 'adamNathan' | 'x' | 'linkedin' | 'google' }) {
  if (type === 'radiantHealth') {
    return (
      <div style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
        <div style={{ width: 20, height: 20, borderRadius: 99, background: '#45164a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: font, fontSize: 7, fontWeight: 600, color: 'var(--ios-light-100)' }}>RH</span>
        </div>
        {/* Instagram badge */}
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(135deg, #E1306C, #F77737)', border: '1px solid var(--ios-light-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            <rect x="0.5" y="0.5" width="5" height="5" rx="1.5" stroke="white" strokeWidth="0.8" />
            <circle cx="3" cy="3" r="1.2" stroke="white" strokeWidth="0.8" />
            <circle cx="4.5" cy="1.5" r="0.5" fill="white" />
          </svg>
        </div>
      </div>
    );
  }
  if (type === 'adamNathan') {
    return (
      <div style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
        <div style={{ width: 20, height: 20, borderRadius: 99, background: '#6b6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: font, fontSize: 7, fontWeight: 600, color: 'var(--ios-light-100)' }}>AN</span>
        </div>
        {/* LinkedIn badge */}
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: 2, background: '#0077B5', border: '1px solid var(--ios-light-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: font, fontSize: 6, fontWeight: 700, color: 'white', lineHeight: 1 }}>in</span>
        </div>
      </div>
    );
  }
  if (type === 'x') {
    return (
      <div style={{ width: 20, height: 20, borderRadius: 4, background: '#15171a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M7.5 1.5L2.5 8.5M2.5 1.5L7.5 8.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (type === 'linkedin') {
    return (
      <div style={{ width: 20, height: 20, borderRadius: 4, background: '#0077B5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: font, fontSize: 9, fontWeight: 700, color: 'white', lineHeight: 1 }}>in</span>
      </div>
    );
  }
  // google
  return (
    <div style={{ width: 20, height: 20, borderRadius: 4, background: 'white', border: '1px solid var(--ios-dark-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: font, fontSize: 9, fontWeight: 700, background: 'linear-gradient(180deg,#4285F4,#34A853,#FBBC05,#EA4335)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>G</span>
    </div>
  );
}

// section: post-day radio row

function PostDayRow({ day, selected, onSelect, isLast }: { day: string; selected: boolean; onSelect: () => void; isLast: boolean }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--ios-light-100)',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--ios-dark-4)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)' }}>{day}</span>
      {selected ? (
        <div style={{ width: 20, height: 20, borderRadius: 99, background: 'var(--ios-dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconCheckmark />
        </div>
      ) : (
        <div style={{ width: 20, height: 20, borderRadius: 99, border: '1.5px solid var(--ios-dark-40)', flexShrink: 0 }} />
      )}
    </button>
  );
}

// section: account rows for content type screens

function AccountSection({
  mode,
  toggles,
  setToggles,
  uniquePosts,
  setUniquePosts,
}: {
  mode: ContentMode;
  toggles: { radiantHealth: boolean; adamNathan: boolean };
  setToggles: (t: { radiantHealth: boolean; adamNathan: boolean }) => void;
  uniquePosts: Record<string, number>;
  setUniquePosts: (p: Record<string, number>) => void;
}) {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 16px',
    height: 51,
    borderBottom: '1px solid var(--ios-dark-4)',
  };

  return (
    <div style={{ background: 'var(--ios-light-100)', borderRadius: 24, overflow: 'hidden', marginBottom: 20 }}>
      {/* Radiant Health */}
      <div style={rowStyle}>
        <AccountAvatar type="radiantHealth" />
        <span style={{ flex: 1, fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)' }}>Radiant Health</span>
        {mode === 'crosspost' ? (
          <Toggle on={toggles.radiantHealth} onChange={v => setToggles({ ...toggles, radiantHealth: v })} />
        ) : (
          <Stepper value={uniquePosts.radiantHealth} min={0} max={14} onChange={v => setUniquePosts({ ...uniquePosts, radiantHealth: v })} />
        )}
      </div>

      {/* Adam Nathan */}
      <div style={rowStyle}>
        <AccountAvatar type="adamNathan" />
        <span style={{ flex: 1, fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)' }}>Adam Nathan</span>
        {mode === 'crosspost' ? (
          <Toggle on={toggles.adamNathan} onChange={v => setToggles({ ...toggles, adamNathan: v })} />
        ) : (
          <Stepper value={uniquePosts.adamNathan} min={0} max={14} onChange={v => setUniquePosts({ ...uniquePosts, adamNathan: v })} />
        )}
      </div>

      {/* X/Twitter */}
      <div style={rowStyle}>
        <AccountAvatar type="x" />
        <span style={{ flex: 1, fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)' }}>X/Twitter</span>
        {mode === 'crosspost' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-60)' }}>Connect</span>
            <IconChevronRight />
          </div>
        ) : (
          <Stepper value={uniquePosts.twitter} min={0} max={14} onChange={v => setUniquePosts({ ...uniquePosts, twitter: v })} />
        )}
      </div>

      {/* LinkedIn */}
      <div style={rowStyle}>
        <AccountAvatar type="linkedin" />
        <span style={{ flex: 1, fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)' }}>LinkedIn</span>
        {mode === 'crosspost' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-60)' }}>Connect</span>
            <IconChevronRight />
          </div>
        ) : (
          <Stepper value={uniquePosts.linkedin} min={0} max={14} onChange={v => setUniquePosts({ ...uniquePosts, linkedin: v })} />
        )}
      </div>

      {/* Google */}
      <div style={rowStyle}>
        <AccountAvatar type="google" />
        <span style={{ flex: 1, fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)' }}>Google Business Profile</span>
        {mode === 'crosspost' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-60)' }}>Connect</span>
            <IconChevronRight />
          </div>
        ) : (
          <Stepper value={uniquePosts.google} min={0} max={14} onChange={v => setUniquePosts({ ...uniquePosts, google: v })} />
        )}
      </div>

      {/* Add New Account */}
      <button
        type="button"
        style={{ width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)' }}
      >
        Add New Account
      </button>
    </div>
  );
}

// section: content type sheet

const CONTENT_TYPES: { view: View; title: string; icon: () => JSX.Element; subtitle: (mode: ContentMode, postsPerWeek: number, postDay: string) => string }[] = [
  {
    view: 'still-image',
    title: 'Still image post',
    icon: IconStillImage,
    subtitle: (mode, ppw, pd) => mode === 'crosspost' ? `4 accounts · ${ppw} posts/week · ${pd}` : `4 accounts · Total 8 posts · ${pd}`,
  },
  {
    view: 'carousel',
    title: 'Carousel post',
    icon: IconCarousel,
    subtitle: (mode, ppw, pd) => mode === 'crosspost' ? `4 accounts · ${ppw} posts/week · ${pd}` : `4 accounts · Total 8 posts · ${pd}`,
  },
  {
    view: 'feed-video',
    title: 'Feed video post',
    icon: IconVideo,
    subtitle: (mode, ppw, pd) => mode === 'crosspost' ? `4 accounts · ${ppw} posts/week · ${pd}` : `4 accounts · Total 8 posts · ${pd}`,
  },
  {
    view: 'blogs',
    title: 'Blogs',
    icon: IconBlog,
    subtitle: (mode, ppw, pd) => mode === 'crosspost' ? `4 accounts · ${ppw} posts/week · ${pd}` : `4 accounts · Total 8 posts · ${pd}`,
  },
  {
    view: 'emails',
    title: 'Emails',
    icon: IconEmail,
    subtitle: (mode, ppw, pd) => mode === 'crosspost' ? `4 accounts · ${ppw} posts/week · ${pd}` : `4 accounts · Total 8 posts · ${pd}`,
  },
];

function titleForView(v: View): string {
  return CONTENT_TYPES.find(t => t.view === v)?.title ?? '';
}

// section: main component

export function CampaignSettingsOverlay({ onClose, onConfirm }: Props) {
  const [view, setView] = useState<View>('settings');
  const [history, setHistory] = useState<View[]>([]);
  const [mode, setMode] = useState<ContentMode>('crosspost');
  const [postsPerWeek, setPostsPerWeek] = useState(2);
  const [toggles, setToggles] = useState({ radiantHealth: true, adamNathan: true });
  const [uniquePosts, setUniquePosts] = useState<Record<string, number>>({
    radiantHealth: 5,
    adamNathan: 5,
    twitter: 0,
    linkedin: 0,
    google: 0,
  });
  const [postDay, setPostDay] = useState('Any day');
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6]));

  function push(v: View) {
    setHistory(h => [...h, view]);
    setView(v);
  }

  function back() {
    if (history.length === 0) {
      onClose();
      return;
    }
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setView(prev);
  }

  function toggleCampaign(id: number) {
    const next = new Set(confirmedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setConfirmedIds(next);
  }

  // section: settings screen
  const settingsRows = [
    {
      icon: <IconSettings />,
      title: 'Content',
      description: 'Change channels, number of posts, and frequencies per campaign',
      onClick: () => push('content'),
    },
    {
      icon: <IconCalendar />,
      title: 'Schedule',
      description: 'Edit when campaigns and content should be generated',
      onClick: () => {},
    },
    {
      icon: <IconBarChart />,
      title: 'Growth settings',
      description: 'Adjust how quickly your playbook expands and posting scales up',
      onClick: () => {},
    },
  ];

  return (
    <>
      {/* Settings */}
      <Sheet visible={view === 'settings'} title="Settings" size="large" onClose={back}>
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)' }}>
          <div style={{ background: 'var(--ios-light-100)', borderRadius: 24, overflow: 'hidden' }}>
            {settingsRows.map((row, i) => (
              <button
                key={row.title}
                type="button"
                onClick={row.onClick}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < settingsRows.length - 1 ? '1px solid var(--ios-dark-4)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: 20, height: 20, flexShrink: 0 }}>{row.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)', lineHeight: 1.4 }}>{row.title}</div>
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginTop: 2 }}>{row.description}</div>
                </div>
                <IconChevronRight />
              </button>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Content defaults */}
      <Sheet
        visible={view === 'content'}
        title="Content defaults"
        size="large"
        onClose={back}
        primaryLabel="Save Changes"
        onPrimary={() => push('confirm')}
        footerNote={<CreditsNote />}
      >
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Description */}
          <p style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', lineHeight: 1.5, margin: 0 }}>
            Set the default channels, cadence, and weekly post count that each strategy applies to its campaigns.
          </p>

          {/* Mode pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)' }}>
              Post the same content or tailor per channel?
            </span>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setMode('crosspost')}
                style={mode === 'crosspost' ? {
                  border: '1px solid var(--ios-dark-90)',
                  background: 'var(--ios-light-100)',
                  borderRadius: 99,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--ios-dark-90)',
                } : {
                  border: '1px solid var(--ios-dark-4)',
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: 99,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: 16,
                  fontWeight: 400,
                  color: 'var(--ios-dark-90)',
                }}
              >
                Crosspost
              </button>
              <button
                type="button"
                onClick={() => setMode('unique')}
                style={mode === 'unique' ? {
                  border: '1px solid var(--ios-dark-90)',
                  background: 'var(--ios-light-100)',
                  borderRadius: 99,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--ios-dark-90)',
                } : {
                  border: '1px solid var(--ios-dark-4)',
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: 99,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: 16,
                  fontWeight: 400,
                  color: 'var(--ios-dark-90)',
                }}
              >
                Unique posts per channel
              </button>
            </div>
          </div>

          {/* Warning banner — unique mode only */}
          {mode === 'unique' && (
            <div style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.1)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-90)', lineHeight: 1.4 }}>
                  <strong>Unique posts per account use more credits</strong>
                </div>
                <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginTop: 2 }}>
                  Add additional credits or scale back your weekly posts to stay on track.
                </div>
              </div>
            </div>
          )}

          {/* Content type list */}
          <div style={{ background: 'var(--ios-light-100)', borderRadius: 24, overflow: 'hidden' }}>
            {CONTENT_TYPES.map((type, i) => (
              <button
                key={type.view}
                type="button"
                onClick={() => push(type.view)}
                style={{
                  width: '100%',
                  background: 'var(--ios-light-100)',
                  borderRadius: 0,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  padding: '16px 16px 16px 20px',
                  border: 'none',
                  borderBottom: i < CONTENT_TYPES.length - 1 ? '1px solid var(--ios-dark-4)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: 20, height: 20, flexShrink: 0 }}><type.icon /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)', lineHeight: 1.4 }}>{type.title}</div>
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginTop: 2 }}>
                    {type.subtitle(mode, postsPerWeek, postDay)}
                  </div>
                </div>
                <IconChevronRight />
              </button>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Content type screens — still-image, carousel, feed-video, blogs, emails */}
      {(['still-image', 'carousel', 'feed-video', 'blogs', 'emails'] as View[]).map(ct => (
        <Sheet key={ct} visible={view === ct} title={titleForView(ct)} size="large" onClose={back}>
          <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Accounts section label */}
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)', paddingLeft: 15 }}>
              {mode === 'crosspost' ? 'Accounts' : 'Accounts / posts per week'}
            </span>

            <AccountSection
              mode={mode}
              toggles={toggles}
              setToggles={setToggles}
              uniquePosts={uniquePosts}
              setUniquePosts={setUniquePosts}
            />

            {/* Post frequency — crosspost only */}
            {mode === 'crosspost' && (
              <>
                <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)' }}>Post frequency</span>
                <div style={{ background: 'var(--ios-light-100)', borderRadius: 24, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 51 }}>
                    <span style={{ flex: 1, fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)' }}>Posts per week</span>
                    <Stepper value={postsPerWeek} min={1} max={14} onChange={setPostsPerWeek} />
                  </div>
                </div>
              </>
            )}

            {/* Post days */}
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)' }}>Post days</span>
            <div style={{ background: 'var(--ios-light-100)', borderRadius: 24, overflow: 'hidden' }}>
              {POST_DAYS.map((day, i) => (
                <PostDayRow
                  key={day}
                  day={day}
                  selected={postDay === day}
                  onSelect={() => setPostDay(day)}
                  isLast={i === POST_DAYS.length - 1}
                />
              ))}
            </div>
          </div>
        </Sheet>
      ))}

      {/* Confirm */}
      <Sheet
        visible={view === 'confirm'}
        title="Confirm"
        size="large"
        onClose={back}
        primaryLabel="Confirm"
        onPrimary={onConfirm}
      >
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', lineHeight: 1.5, margin: 0 }}>
            All 6 planned campaigns and any future ones will be updated. Deselect any campaigns you'd like to keep unchanged.
          </p>

          {/* Campaign list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {CONFIRM_CAMPAIGNS.map(c => {
              const isSelected = confirmedIds.has(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => toggleCampaign(c.id)}
                  style={{ display: 'flex', gap: 17, alignItems: 'center', position: 'relative', cursor: 'pointer' }}
                >
                  {/* Thumbnail */}
                  <img
                    src={c.thumb}
                    alt=""
                    style={{ width: 104, height: 125, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }}
                  />

                  {/* Content */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 125, paddingTop: 4, paddingBottom: 4 }}>
                    <span style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: 'var(--ios-dark-90)' }}>{c.dates}</span>
                    <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', lineHeight: 1.4 }}>{c.title}</span>
                    <span style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: 'var(--ios-dark-60)' }}>{c.category}</span>
                    <span style={{ border: '1px solid var(--ios-dark-4)', borderRadius: 5, padding: '2px 8px', fontSize: 12, fontFamily: font, color: 'var(--ios-dark-60)', background: 'rgba(0,0,0,0.08)', display: 'inline-block' }}>
                      {c.badge}
                    </span>
                  </div>

                  {/* Radio circle */}
                  {isSelected ? (
                    <div style={{ width: 20, height: 20, borderRadius: 99, background: 'var(--ios-dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconCheckmark />
                    </div>
                  ) : (
                    <div style={{ width: 20, height: 20, borderRadius: 99, border: '1.5px solid var(--ios-dark-40)', flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Sheet>
    </>
  );
}
