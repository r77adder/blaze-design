import { useState } from 'react';
import { Sheet, Toggle, Stepper, SelectionPill } from '@ios/staging';
import { ASSETS } from './assets';

// section: icon imports
import contentIcon from '@ios/icons/lighter_weight/image-03.svg';
import calendarIcon from '@ios/icons/lighter_weight/calendar-01.png';
import growthIcon from '@ios/icons/lighter_weight/line-chart-up-01.svg';
import addAccountIcon from '@ios/icons/lighter_weight/add-square-04.svg';
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore – filenames with spaces are resolved by Vite at build time
import stillImageIcon from '@ios/icons/lighter_weight/Property 1=still image.svg';
// @ts-ignore
import carouselIcon from '@ios/icons/lighter_weight/Property 1=carousel.svg';
// @ts-ignore
import feedVideoIcon from '@ios/icons/lighter_weight/Property 1=feed video posts.svg';
// @ts-ignore
import blogsIcon from '@ios/icons/lighter_weight/Property 1=blogs.svg';
// @ts-ignore
import emailsIcon from '@ios/icons/lighter_weight/Property 1=emails.svg';

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

type View =
  | 'settings' | 'content' | 'still-image' | 'carousel' | 'feed-video' | 'blogs' | 'emails' | 'confirm'
  | 'schedule' | 'review-content' | 'campaign-length'
  | 'growth' | 'expand-playbook' | 'scaling-within';
type ContentMode = 'crosspost' | 'unique';
type ContentTypeId = 'still-image' | 'carousel' | 'feed-video' | 'blogs' | 'emails';

interface ContentTypeSettings {
  postsPerWeek: number;
  toggles: { radiantHealth: boolean; adamNathan: boolean };
  uniquePosts: Record<string, number>;
  postDays: string[];
}

interface Props {
  onClose: () => void;
  onConfirm: () => void;
  onSaveDefaults: () => void;
}

// section: day abbreviations

const DAY_ABBREV: Record<string, string> = {
  'Monday': 'M',
  'Tuesday': 'Tu',
  'Wednesday': 'W',
  'Thursday': 'Th',
  'Friday': 'F',
  'Saturday': 'Sa',
  'Sunday': 'Su',
};

function formatDays(postDays: string[]): string {
  if (postDays.length === 0) return 'Any day';
  return postDays.map(d => DAY_ABBREV[d] ?? d).join(', ');
}

const DEFAULT_CT_SETTINGS: ContentTypeSettings = {
  postsPerWeek: 2,
  toggles: { radiantHealth: true, adamNathan: true },
  uniquePosts: { radiantHealth: 5, adamNathan: 5, twitter: 0, linkedin: 0, google: 0 },
  postDays: [],
};

// section: inline SVG icons

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

// section: radio row (reused for schedule + growth sub-sheets)

function RadioRow({ label, sublabel, selected, onSelect, isLast }: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onSelect: () => void;
  isLast: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        minHeight: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'var(--ios-light-100)',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--ios-dark-4)',
        cursor: 'pointer',
        textAlign: 'left',
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)' }}>{label}</div>
        {sublabel && (
          <div style={{ fontFamily: font, fontSize: 13, fontWeight: 400, color: 'var(--ios-dark-60)', marginTop: 2 }}>{sublabel}</div>
        )}
      </div>
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

// growth badge pill — blue, used for strategy frequency options
function GrowthBadge({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'rgba(0,131,226,0.1)', color: '#0083e2',
      borderRadius: 99, padding: '3px 10px',
      fontFamily: font, fontSize: 12, fontWeight: 500,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

// credits badge pill — blue with sparkle icon prefix
function CreditsBadge({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(0,131,226,0.1)', color: '#0083e2',
      borderRadius: 99, padding: '3px 10px',
      fontFamily: font, fontSize: 12, fontWeight: 500,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {/* sparkle / lightning icon */}
      <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
        <path d="M5.5 1L1 6.5h4L3.5 11 9 5.5H5L5.5 1Z" fill="#0083e2" />
      </svg>
      {label}
    </span>
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
  settings,
  onSettingsChange,
}: {
  mode: ContentMode;
  settings: ContentTypeSettings;
  onSettingsChange: (updates: Partial<ContentTypeSettings>) => void;
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
          <Toggle on={settings.toggles.radiantHealth} onChange={v => onSettingsChange({ toggles: { ...settings.toggles, radiantHealth: v } })} />
        ) : (
          <Stepper value={settings.uniquePosts.radiantHealth} min={0} max={14} onChange={v => onSettingsChange({ uniquePosts: { ...settings.uniquePosts, radiantHealth: v } })} />
        )}
      </div>

      {/* Adam Nathan */}
      <div style={rowStyle}>
        <AccountAvatar type="adamNathan" />
        <span style={{ flex: 1, fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)' }}>Adam Nathan</span>
        {mode === 'crosspost' ? (
          <Toggle on={settings.toggles.adamNathan} onChange={v => onSettingsChange({ toggles: { ...settings.toggles, adamNathan: v } })} />
        ) : (
          <Stepper value={settings.uniquePosts.adamNathan} min={0} max={14} onChange={v => onSettingsChange({ uniquePosts: { ...settings.uniquePosts, adamNathan: v } })} />
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
          <Stepper value={settings.uniquePosts.twitter} min={0} max={14} onChange={v => onSettingsChange({ uniquePosts: { ...settings.uniquePosts, twitter: v } })} />
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
          <Stepper value={settings.uniquePosts.linkedin} min={0} max={14} onChange={v => onSettingsChange({ uniquePosts: { ...settings.uniquePosts, linkedin: v } })} />
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
          <Stepper value={settings.uniquePosts.google} min={0} max={14} onChange={v => onSettingsChange({ uniquePosts: { ...settings.uniquePosts, google: v } })} />
        )}
      </div>

      {/* Add New Account */}
      <button
        type="button"
        style={{ width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)' }}
      >
        <img src={addAccountIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20, opacity: 0.9 }} />
        Add New Account
      </button>
    </div>
  );
}

// section: content type sheet

const CONTENT_TYPES: { view: ContentTypeId; title: string; iconSrc: string; subtitle: (mode: ContentMode, s: ContentTypeSettings) => string }[] = [
  {
    view: 'still-image',
    title: 'Still image post',
    iconSrc: stillImageIcon as unknown as string,
    subtitle: (mode, s) => mode === 'crosspost' ? `4 accounts · ${s.postsPerWeek} posts/week · ${formatDays(s.postDays)}` : `4 accounts · Total 8 posts · ${formatDays(s.postDays)}`,
  },
  {
    view: 'carousel',
    title: 'Carousel post',
    iconSrc: carouselIcon as unknown as string,
    subtitle: (mode, s) => mode === 'crosspost' ? `4 accounts · ${s.postsPerWeek} posts/week · ${formatDays(s.postDays)}` : `4 accounts · Total 8 posts · ${formatDays(s.postDays)}`,
  },
  {
    view: 'feed-video',
    title: 'Feed video post',
    iconSrc: feedVideoIcon as unknown as string,
    subtitle: (mode, s) => mode === 'crosspost' ? `4 accounts · ${s.postsPerWeek} posts/week · ${formatDays(s.postDays)}` : `4 accounts · Total 8 posts · ${formatDays(s.postDays)}`,
  },
  {
    view: 'blogs',
    title: 'Blogs',
    iconSrc: blogsIcon as unknown as string,
    subtitle: (mode, s) => mode === 'crosspost' ? `4 accounts · ${s.postsPerWeek} posts/week · ${formatDays(s.postDays)}` : `4 accounts · Total 8 posts · ${formatDays(s.postDays)}`,
  },
  {
    view: 'emails',
    title: 'Emails',
    iconSrc: emailsIcon as unknown as string,
    subtitle: (mode, s) => mode === 'crosspost' ? `4 accounts · ${s.postsPerWeek} posts/week · ${formatDays(s.postDays)}` : `4 accounts · Total 8 posts · ${formatDays(s.postDays)}`,
  },
];

function titleForView(v: View): string {
  return CONTENT_TYPES.find(t => t.view === v)?.title ?? '';
}

// section: main component

export function CampaignSettingsOverlay({ onClose, onConfirm, onSaveDefaults }: Props) {
  const [view, setView] = useState<View>('settings');
  const [history, setHistory] = useState<View[]>([]);
  const [mode, setMode] = useState<ContentMode>('crosspost');
  const [contentSettings, setContentSettings] = useState<Record<ContentTypeId, ContentTypeSettings>>({
    'still-image': { ...DEFAULT_CT_SETTINGS },
    'carousel':    { ...DEFAULT_CT_SETTINGS },
    'feed-video':  { ...DEFAULT_CT_SETTINGS },
    'blogs':       { ...DEFAULT_CT_SETTINGS },
    'emails':      { ...DEFAULT_CT_SETTINGS },
  });
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6]));

  // section: schedule + growth state
  const [reviewFrequency, setReviewFrequency] = useState<'Weekly' | 'Monthly' | 'Quarterly'>('Weekly');
  const [campaignLength, setCampaignLength] = useState<'1 week' | '2 weeks' | '3 weeks' | '4 weeks'>('1 week');
  const [strategyFrequency, setStrategyFrequency] = useState<'Aggressive' | 'Moderate' | 'Conservative' | 'Manual'>('Conservative');
  const [scalingPace, setScalingPace] = useState<'Competitive' | 'Smart' | 'Manual'>('Competitive');

  function updateCT(ct: ContentTypeId, updates: Partial<ContentTypeSettings>) {
    setContentSettings(prev => ({ ...prev, [ct]: { ...prev[ct], ...updates } }));
  }

  function togglePostDay(ct: ContentTypeId, day: string) {
    const prev = contentSettings[ct].postDays;
    const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
    updateCT(ct, { postDays: next });
  }

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
      iconSrc: contentIcon,
      title: 'Content',
      description: 'Change channels, number of posts, and frequencies per campaign',
      onClick: () => push('content'),
    },
    {
      iconSrc: calendarIcon,
      title: 'Schedule',
      description: 'Edit when campaigns and content should be generated',
      onClick: () => push('schedule'),
    },
    {
      iconSrc: growthIcon,
      title: 'Growth settings',
      description: 'Adjust how quickly your playbook expands and posting scales up',
      onClick: () => push('growth'),
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
                <img src={row.iconSrc} alt="" aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0 }} />
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
        leftButton="back"
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
              <SelectionPill label="Crosspost" selected={mode === 'crosspost'} onClick={() => setMode('crosspost')} />
              <SelectionPill label="Unique posts per channel" selected={mode === 'unique'} onClick={() => setMode('unique')} />
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
                <img src={type.iconSrc} alt="" aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)', lineHeight: 1.4 }}>{type.title}</div>
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginTop: 2 }}>
                    {type.subtitle(mode, contentSettings[type.view])}
                  </div>
                </div>
                <IconChevronRight />
              </button>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Content type screens — still-image, carousel, feed-video, blogs, emails */}
      {(CONTENT_TYPES.map(({ view: ct, title }) => (
        <Sheet key={ct} visible={view === ct} title={title} size="large" leftButton="back" onClose={back}>
          <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Accounts section label */}
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)', paddingLeft: 15 }}>
              {mode === 'crosspost' ? 'Accounts' : 'Accounts / posts per week'}
            </span>

            <AccountSection
              mode={mode}
              settings={contentSettings[ct]}
              onSettingsChange={(updates) => updateCT(ct, updates)}
            />

            {/* Post frequency — crosspost only */}
            {mode === 'crosspost' && (
              <>
                <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)' }}>Post frequency</span>
                <div style={{ background: 'var(--ios-light-100)', borderRadius: 24, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 51 }}>
                    <span style={{ flex: 1, fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-80)' }}>Posts per week</span>
                    <Stepper value={contentSettings[ct].postsPerWeek} min={1} max={14} onChange={v => updateCT(ct, { postsPerWeek: v })} />
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
                  selected={day === 'Any day' ? contentSettings[ct].postDays.length === 0 : contentSettings[ct].postDays.includes(day)}
                  onSelect={() => {
                    if (day === 'Any day') {
                      updateCT(ct, { postDays: [] });
                    } else {
                      togglePostDay(ct, day);
                    }
                  }}
                  isLast={i === POST_DAYS.length - 1}
                />
              ))}
            </div>
          </div>
        </Sheet>
      )))}

      {/* ─── Schedule defaults ─────────────────────────── */}
      <Sheet
        visible={view === 'schedule'}
        title="Schedule defaults"
        size="large"
        leftButton="back"
        onClose={back}
        primaryLabel="Save Changes"
        onPrimary={() => { onSaveDefaults(); onClose(); }}
      >
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Description */}
          <p style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', lineHeight: 1.5, margin: 0 }}>
            Edit when campaigns and content should be generated
          </p>

          {/* Row 1 — Review content */}
          <div>
            <div style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', marginBottom: 8, paddingLeft: 4 }}>
              How often would you like to review?
            </div>
            <div style={{ background: 'var(--ios-light-100)', borderRadius: 16, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => push('review-content')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)' }}>Review content</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-60)' }}>{reviewFrequency}</span>
                  <IconChevronRight />
                </div>
              </button>
            </div>
          </div>

          {/* Row 2 — Campaign length */}
          <div>
            <div style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', marginBottom: 8, paddingLeft: 4 }}>
              How long should campaigns run for?
            </div>
            <div style={{ background: 'var(--ios-light-100)', borderRadius: 16, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => push('campaign-length')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)' }}>Campaign length</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-60)' }}>{campaignLength}</span>
                  <IconChevronRight />
                </div>
              </button>
            </div>
          </div>
        </div>
      </Sheet>

      {/* ─── Review content picker ─────────────────────── */}
      <Sheet
        visible={view === 'review-content'}
        title="Review content"
        size="large"
        leftButton="back"
        onClose={back}
      >
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)' }}>
          <div style={{ background: 'var(--ios-light-100)', borderRadius: 24, overflow: 'hidden' }}>
            {(['Weekly', 'Monthly', 'Quarterly'] as const).map((opt, i, arr) => (
              <RadioRow
                key={opt}
                label={opt}
                selected={reviewFrequency === opt}
                onSelect={() => setReviewFrequency(opt)}
                isLast={i === arr.length - 1}
              />
            ))}
          </div>
        </div>
      </Sheet>

      {/* ─── Campaign length picker ────────────────────── */}
      <Sheet
        visible={view === 'campaign-length'}
        title="Campaign length"
        size="large"
        leftButton="back"
        onClose={back}
      >
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)' }}>
          <div style={{ background: 'var(--ios-light-100)', borderRadius: 24, overflow: 'hidden' }}>
            {(['1 week', '2 weeks', '3 weeks', '4 weeks'] as const).map((opt, i, arr) => (
              <RadioRow
                key={opt}
                label={opt}
                selected={campaignLength === opt}
                onSelect={() => setCampaignLength(opt)}
                isLast={i === arr.length - 1}
              />
            ))}
          </div>
        </div>
      </Sheet>

      {/* ─── Content growth pace ──────────────────────── */}
      <Sheet
        visible={view === 'growth'}
        title="Content growth pace"
        size="large"
        leftButton="back"
        onClose={back}
        primaryLabel="Save Changes"
        onPrimary={() => { onSaveDefaults(); onClose(); }}
        footerNote={
          <span style={{ fontFamily: font, fontSize: 12, fontWeight: 400 }}>
            <span style={{ color: 'var(--ios-dark-90)', fontWeight: 500 }}>+140</span>
            <span style={{ color: 'var(--ios-dark-60)' }}> more credits per campaign</span>
          </span>
        }
      >
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Description */}
          <p style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', lineHeight: 1.5, margin: 0 }}>
            Together, these control how often Blaze starts a new strategy — and how fast publishing ramps up within each one.
          </p>

          {/* Section 1 — strategy frequency */}
          <div>
            <div style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', marginBottom: 8, paddingLeft: 4 }}>
              How often should we add a new content strategy?
            </div>
            <div style={{ background: 'var(--ios-light-100)', borderRadius: 16, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => push('expand-playbook')}
                style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', marginBottom: 4 }}>{strategyFrequency}</div>
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginBottom: 8 }}>
                    {strategyFrequency === 'Aggressive' ? 'Add 1 strategy every 2 weeks' :
                     strategyFrequency === 'Moderate'   ? 'Add 1 strategy every 3 weeks' :
                     strategyFrequency === 'Manual'     ? "I'll choose when to add a new strategy" :
                                                          'Add 1 strategy every 4 weeks'}
                  </div>
                  {strategyFrequency !== 'Manual' && (
                    <GrowthBadge label={
                      strategyFrequency === 'Aggressive' ? '~300% growth over 6 months' :
                      strategyFrequency === 'Moderate'   ? '~200% growth over 6 months' :
                                                           '~100% growth over 6 months'
                    } />
                  )}
                </div>
                <div style={{ paddingTop: 4, flexShrink: 0 }}><IconChevronRight /></div>
              </button>
            </div>
          </div>

          {/* Section 2 — scaling pace */}
          <div>
            <div style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', marginBottom: 8, paddingLeft: 4 }}>
              How quickly should we increase posting once a strategy is active?
            </div>
            <div style={{ background: 'var(--ios-light-100)', borderRadius: 16, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => push('scaling-within')}
                style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', marginBottom: 4 }}>{scalingPace}</div>
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginBottom: 8 }}>
                    {scalingPace === 'Competitive' ? 'Grow fastest. Best for brands racing to build presence. Add 2 pieces per week, every month' :
                     scalingPace === 'Smart'       ? 'Build momentum without overwhelming your feed. Add 1 piece per week, every month' :
                                                     "Great once you've hit your ideal cadence. Keep your current schedule"}
                  </div>
                  {scalingPace === 'Competitive' && <CreditsBadge label="40 additional credits per month" />}
                  {scalingPace === 'Smart'       && <CreditsBadge label="20 additional credits per month" />}
                </div>
                <div style={{ paddingTop: 4, flexShrink: 0 }}><IconChevronRight /></div>
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p style={{ fontFamily: font, fontSize: 13, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.5, margin: 0 }}>
            We will publish no more than 2 posts per day, with a maximum of 15 posts per week.
          </p>
        </div>
      </Sheet>

      {/* ─── Expand your playbook ─────────────────────── */}
      <Sheet
        visible={view === 'expand-playbook'}
        title="Expand your playbook"
        size="large"
        leftButton="back"
        onClose={back}
      >
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', paddingLeft: 4, marginBottom: 4 }}>
            How often should we add a new content strategy?
          </div>
          {([
            { value: 'Aggressive'   as const, sublabel: 'Add 1 strategy every 2 weeks',         badge: '~300% growth over 6 months' },
            { value: 'Moderate'     as const, sublabel: 'Add 1 strategy every 3 weeks',         badge: '~200% growth over 6 months' },
            { value: 'Conservative' as const, sublabel: 'Add 1 strategy every 4 weeks',         badge: '~100% growth over 6 months' },
            { value: 'Manual'       as const, sublabel: "I'll choose when to add a new strategy" },
          ]).map(({ value, sublabel, badge }) => {
            const isSelected = strategyFrequency === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setStrategyFrequency(value)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, padding: '14px 16px', borderRadius: 20, cursor: 'pointer', textAlign: 'left',
                  background: 'var(--ios-light-100)',
                  border: isSelected ? '1.5px solid var(--ios-dark-90)' : '1.5px solid var(--ios-dark-8)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)', marginBottom: 4 }}>{value}</div>
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginBottom: badge ? 8 : 0 }}>{sublabel}</div>
                  {badge && <GrowthBadge label={badge} />}
                </div>
                {isSelected ? (
                  <div style={{ width: 20, height: 20, borderRadius: 99, background: 'var(--ios-dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconCheckmark />
                  </div>
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: 99, border: '1.5px solid var(--ios-dark-40)', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      </Sheet>

      {/* ─── Scaling within strategy ──────────────────── */}
      <Sheet
        visible={view === 'scaling-within'}
        title="Scaling within strategy"
        size="large"
        leftButton="back"
        onClose={back}
      >
        <div style={{ padding: '16px 20px 32px', background: 'var(--ios-background-gray)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', paddingLeft: 4, marginBottom: 4 }}>
            How often should we add a new content strategy?
          </div>
          {([
            { value: 'Competitive' as const, sublabel: 'Grow fastest. Best for brands racing to build presence. Add 2 pieces per week, every month', badge: '40 additional credits per month' },
            { value: 'Smart'       as const, sublabel: 'Build momentum without overwhelming your feed. Add 1 piece per week, every month',             badge: '20 additional credits per month' },
            { value: 'Manual'      as const, sublabel: "Great once you've hit your ideal cadence. Keep your current schedule" },
          ]).map(({ value, sublabel, badge }) => {
            const isSelected = scalingPace === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setScalingPace(value)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, padding: '14px 16px', borderRadius: 20, cursor: 'pointer', textAlign: 'left',
                  background: 'var(--ios-light-100)',
                  border: isSelected ? '1.5px solid var(--ios-dark-90)' : '1.5px solid var(--ios-dark-8)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)', marginBottom: 4 }}>{value}</div>
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginBottom: badge ? 8 : 0 }}>{sublabel}</div>
                  {badge && <CreditsBadge label={badge} />}
                </div>
                {isSelected ? (
                  <div style={{ width: 20, height: 20, borderRadius: 99, background: 'var(--ios-dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconCheckmark />
                  </div>
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: 99, border: '1.5px solid var(--ios-dark-40)', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
          <p style={{ fontFamily: font, fontSize: 13, fontWeight: 400, color: 'var(--ios-dark-60)', lineHeight: 1.5, margin: 0, paddingLeft: 4 }}>
            We will publish no more than 2 posts per day, with a maximum of 15 posts per week.
          </p>
        </div>
      </Sheet>

      {/* Confirm */}
      <Sheet
        visible={view === 'confirm'}
        title="Confirm"
        size="large"
        leftButton="back"
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
                    <span style={{ border: '1px solid var(--ios-dark-4)', borderRadius: 5, padding: '2px 8px', fontSize: 12, fontFamily: font, color: 'var(--ios-dark-60)', background: 'rgba(0,0,0,0.08)', display: 'inline-block', alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>
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
