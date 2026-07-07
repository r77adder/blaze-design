import { useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { useToast, TabChip, StatusPill, Pill } from '@/staging';
import type { StatusPillTone } from '@/staging';
import ChevronLeft from '@/icons/24/ChevronLeft';
import ChevronRight from '@/icons/24/ChevronRight';
import FileMultiple from '@/icons/20/FileMultiple';
import Document from '@/icons/20/Document';
import UserProfileSquare from '@/icons/20/UserProfileSquare';
import VideoOn from '@/icons/20/VideoOn';
import Iphone02 from '@/icons/16/Iphone02';
import AlertTriangle from '@/icons/20/AlertTriangle';
import Calendar1 from '@/icons/20/Calendar1';
import StillImageIcon from '../h2/StillImageIcon';
import { ClientShell } from './shell';
import { ColdState } from './ColdState';
import { useClientState } from './dev-state';

/**
 * Client Calendar — the done-for-you customer SEES the content they're getting,
 * across two views, but never operates it. No Create / Regenerate / Improve /
 * Unscheduled, no filters, no density toggle — just the schedule and themes.
 *
 *   • Calendar  — the 7-day post grid harvested from h2/OrganicSocial
 *                 (DayColumn + PostCard + StatusBadge, week nav, status badges),
 *                 with every operator toolbar button stripped out.
 *   • Campaigns — a clean weekly-campaigns timeline (NOT the operator Gantt):
 *                 each week is a card with its theme, date range, channels, and
 *                 post count. Derived from the same campaign concept in
 *                 h2/Campaigns but reframed as a read-only "here's what's running
 *                 each week" list for the client.
 *
 * The calendar card markup (SEED_POSTS / CONTENT_META / PostCard / DayColumn /
 * StatusBadge / weekFromOffset) is harvested from h2/OrganicSocial.tsx — those
 * symbols aren't exported there, so they're inlined here (we only own this file).
 */

// ─── CALENDAR VIEW — harvested from h2/OrganicSocial ────────────────

type PlatformKey = 'instagram' | 'tiktok' | 'linkedin' | 'x';
type Status = 'scheduled' | 'draft' | 'review' | 'approved';
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type ContentKind = 'still' | 'carousel' | 'blog' | 'avatar-video' | 'feed-video' | 'short-video';

interface Post {
  day: DayKey;
  time: string;
  platform: PlatformKey;
  type: string;
  contentType: ContentKind;
  title: string;
  body?: string;
  thumb: string | null;
  status: Status;
  source: string;
}

const CONTENT_META: Record<ContentKind, { label: string; icon: ComponentType<{ size?: number; color?: string }>; color: string }> = {
  still: { label: 'Still Image', icon: StillImageIcon, color: 'var(--red-70)' },
  carousel: { label: 'Carousel', icon: FileMultiple, color: 'var(--status-connect)' },
  blog: { label: 'Blog Post', icon: Document, color: 'var(--status-approved)' },
  'avatar-video': { label: 'AI Avatar Video', icon: UserProfileSquare, color: '#4F62F8' },
  'feed-video': { label: 'Video Feed Post', icon: VideoOn, color: '#6A00FF' },
  'short-video': { label: 'Short Form Video', icon: Iphone02, color: '#00AAFF' },
};

const VIDEO_KINDS = new Set<ContentKind>(['avatar-video', 'feed-video', 'short-video']);

const TODAY: DayKey = 'thu';
const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BASE_MONDAY = new Date(2026, 4, 4);

const SEED_POSTS: Post[] = [
  { day: 'mon', time: '9:00 AM', platform: 'instagram', type: 'Reel', contentType: 'still', title: 'Before & after — Tarrytown white oak hardwood install in 60 seconds.', thumb: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=70', status: 'approved', source: 'Hardwood Refresh May' },
  { day: 'mon', time: '1:00 PM', platform: 'tiktok', type: 'Short', contentType: 'still', title: '30-second guide to picking floors that hold up to Texas heat & pets.', thumb: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=70', status: 'approved', source: 'Flooring Trends 2026' },
  { day: 'tue', time: '8:00 AM', platform: 'linkedin', type: 'Post', contentType: 'blog', title: 'Why subfloor prep matters more than the plank — the playbook our crews run on every install', body: 'Subfloor prep is the part nobody sees, and the part that decides whether a floor lasts five years or twenty-five. Here is the exact sequence Matthew walks before a single board goes down.', thumb: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=70', status: 'review', source: 'Crew Spotlights' },
  { day: 'tue', time: '4:00 PM', platform: 'instagram', type: 'Carousel', contentType: 'carousel', title: '5 flooring mistakes Austin homeowners keep making (and how to avoid them).', thumb: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=70', status: 'approved', source: 'Flooring Trends 2026' },
  { day: 'wed', time: '9:00 AM', platform: 'instagram', type: 'Story', contentType: 'still', title: 'BTS — Round Rock whole-home LVP install, day 3 of 6.', thumb: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=70', status: 'approved', source: 'Whole-Home LVP' },
  { day: 'wed', time: '2:00 PM', platform: 'x', type: 'Post', contentType: 'still', title: 'What a free flooring estimate actually covers — the six things every Austin homeowner should expect.', thumb: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=70', status: 'review', source: 'Estimate FAQ' },
  { day: 'thu', time: '10:00 AM', platform: 'instagram', type: 'Reel', contentType: 'avatar-video', title: 'A day on the crew — hardwood refinish in Westlake.', thumb: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=70', status: 'approved', source: 'Crew Spotlights' },
  { day: 'thu', time: '5:00 PM', platform: 'tiktok', type: 'Short', contentType: 'carousel', title: 'Refinish vs replace your hardwood — what it really costs in Austin.', thumb: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=70', status: 'approved', source: 'Hardwood Refresh May' },
  { day: 'tue', time: '11:00 AM', platform: 'instagram', type: 'Reel', contentType: 'feed-video', title: 'Floor of the week — wide-plank white oak in a Tarrytown remodel.', thumb: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=70', status: 'approved', source: 'Flooring Trends 2026' },
  { day: 'fri', time: '6:00 PM', platform: 'tiktok', type: 'Short', contentType: 'short-video', title: 'Three floor types that survive Texas summers, kids, and big dogs.', thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=70', status: 'review', source: 'Flooring Trends 2026' },
  { day: 'fri', time: '11:00 AM', platform: 'instagram', type: 'Reel', contentType: 'still', title: 'Friday reveal — Lakeway great room, 4 days from tear-out to finished tile.', thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=70', status: 'review', source: 'Tile Showcase' },
  { day: 'fri', time: '3:00 PM', platform: 'linkedin', type: 'Post', contentType: 'blog', title: 'What we learned flooring 14 units across one apartment community on a single timeline', body: 'Fourteen units, one timeline, zero missed handoffs. What coordinating a community-scale LVP install taught us about sequencing crews and keeping material deliveries moving.', thumb: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=600&q=70', status: 'approved', source: 'Multi-Unit LVP' },
  { day: 'sat', time: '9:00 AM', platform: 'instagram', type: 'Carousel', contentType: 'carousel', title: 'Weekend project — 5 small flooring upgrades that change a whole room.', thumb: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&q=70', status: 'approved', source: 'Flooring Trends 2026' },
  { day: 'sat', time: '7:00 PM', platform: 'tiktok', type: 'Short', contentType: 'still', title: 'Why we never skip moisture testing the slab — even on tight timelines.', thumb: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=70', status: 'approved', source: 'Crew Spotlights' },
  { day: 'sun', time: '5:00 PM', platform: 'instagram', type: 'Story', contentType: 'avatar-video', title: 'Sunday Q&A — drop your Austin flooring questions, John is answering.', thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=70', status: 'approved', source: 'Estimate FAQ' },
];

interface DayInfo {
  key: DayKey;
  name: string;
  date: string;
  full: string;
}

function weekFromOffset(offsetWeeks: number): DayInfo[] {
  const monday = new Date(BASE_MONDAY);
  monday.setDate(monday.getDate() + offsetWeeks * 7);
  return DAY_KEYS.map((key, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      key,
      name: DAY_NAMES[i] ?? '',
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  });
}

const POST_STATUS: Record<Status, { tone: StatusPillTone; label: string }> = {
  scheduled: { tone: 'neutral', label: 'Scheduled' },
  draft: { tone: 'neutral', label: 'Draft' },
  review: { tone: 'warning', label: 'Review' },
  approved: { tone: 'success', label: 'Approved' },
};

function StatusBadge({ status }: { status: Status }) {
  const { tone, label } = POST_STATUS[status];
  if (status === 'review') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <StatusPill tone={tone} size="sm">{label}</StatusPill>
        <span style={{ color: 'var(--status-connect)', display: 'inline-flex' }}>
          <AlertTriangle size={16} color="currentColor" />
        </span>
      </span>
    );
  }
  return <StatusPill tone={tone} size="sm">{label}</StatusPill>;
}

function TypeAndTime({ post }: { post: Post }) {
  const meta = CONTENT_META[post.contentType];
  const TypeIcon = meta.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 400, color: 'var(--dark-80)' }}>
        <TypeIcon size={16} color={meta.color} />
        {meta.label}
      </span>
      <span style={{ fontSize: 14, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {post.time.toLowerCase().replace(/\s/g, '')}
      </span>
    </div>
  );
}

function Caption({ text }: { text: string }) {
  const truncated = text.length > 78;
  const shown = truncated ? text.slice(0, 78).replace(/\s+\S*$/, '') : text;
  return (
    <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.45 }}>
      {shown}
      {truncated && (
        <>
          {' … '}
          <span style={{ color: 'var(--dark-60)' }}>more</span>
        </>
      )}
    </div>
  );
}

const cardShell: React.CSSProperties = {
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 12,
  padding: 0,
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  fontFamily: 'inherit',
  width: '100%',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  transition: 'border-color 120ms ease, box-shadow 120ms ease',
};

function PostCard({ post, dayFull, onOpen }: { post: Post; dayFull: string; onOpen: () => void }) {
  if (post.contentType === 'blog') {
    return (
      <button type="button" onClick={onOpen} style={cardShell}>
        <div style={{ padding: '11px 12px 9px' }}>
          <TypeAndTime post={post} />
        </div>
        {post.thumb && (
          <div style={{ aspectRatio: '16 / 9', background: `center/cover url('${post.thumb}'), var(--dark-4)` }} />
        )}
        <div style={{ padding: '12px 13px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--dark-90)',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.title}
          </div>
          <div style={{ fontSize: 14, color: 'var(--dark-60)' }}>{dayFull}</div>
          {post.body && (
            <div
              style={{
                fontSize: 14,
                color: 'var(--dark-60)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.body}
            </div>
          )}
          <div style={{ marginTop: 2 }}>
            <StatusBadge status={post.status} />
          </div>
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={onOpen} style={cardShell}>
      <div style={{ padding: '11px 12px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <TypeAndTime post={post} />
        <Caption text={post.title} />
      </div>
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 5',
          background: `center/cover url('${post.thumb ?? ''}'), var(--dark-4)`,
        }}
      >
        {post.contentType === 'carousel' && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'inline-flex',
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="8" y="3" width="13" height="13" rx="3" stroke="#fff" strokeWidth="1.7" />
              <path d="M4 8v9a4 4 0 0 0 4 4h9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
        )}
        {VIDEO_KINDS.has(post.contentType) && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M2 2L14 9L2 16V2Z" fill="#fff" />
              </svg>
            </span>
          </span>
        )}
        <div style={{ position: 'absolute', left: 10, bottom: 10 }}>
          <StatusBadge status={post.status} />
        </div>
      </div>
    </button>
  );
}

function DayColumn({
  day,
  posts,
  isCurrentWeek,
  onOpenPost,
}: {
  day: DayInfo;
  posts: Post[];
  isCurrentWeek: boolean;
  onOpenPost: (p: Post) => void;
}) {
  const isToday = isCurrentWeek && day.key === TODAY;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 240px)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '4px 0 12px',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          background: 'var(--default-bg)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            background: isToday ? 'var(--dark-4)' : 'transparent',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{day.date}</span>
          <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--dark-60)' }}>
            {day.name}
          </span>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {posts.length > 0 ? (
          posts.map((p, i) => <PostCard key={i} post={p} dayFull={day.full} onOpen={() => onOpenPost(p)} />)
        ) : (
          <div
            style={{
              margin: 'auto',
              padding: '28px 8px',
              textAlign: 'center',
              color: 'var(--dark-60)',
              fontSize: 14,
            }}
          >
            Nothing scheduled
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 8,
        width: 32,
        height: 32,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--dark-80)',
        padding: 0,
        transition: 'background 120ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  );
}

// ─── POSTING-TO-CHANNELS SUMMARY ────────────────────────────────────
function CalendarView() {
  const { showToast } = useToast();
  const [weekOffset, setWeekOffset] = useState(0);

  const visibleWeek = useMemo(() => weekFromOffset(weekOffset), [weekOffset]);
  const isCurrentWeek = weekOffset === 0;

  const weekPosts = isCurrentWeek ? SEED_POSTS : [];

  const byDay = useMemo(() => {
    const map: Record<DayKey, Post[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
    weekPosts.forEach((p) => map[p.day].push(p));
    return map;
  }, [weekPosts]);

  const openPost = (p: Post) => showToast({ message: `Open · ${p.title.slice(0, 40)}` });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--default-bg)' }}>
      {/* Week nav only — operator toolbar (Create / Regenerate / Improve /
          Unscheduled / density / filter) intentionally removed for the client. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '12px 20px',
          borderBottom: '1px solid var(--dark-4)',
          background: 'var(--default-bg)',
          flexShrink: 0,
        }}
      >
        <HeaderIconButton label="Previous week" onClick={() => setWeekOffset((o) => o - 1)}>
          <ChevronLeft size={20} />
        </HeaderIconButton>
        <button
          type="button"
          onClick={() => setWeekOffset(0)}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 8,
            padding: '6px 10px',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--dark-90)',
            cursor: 'pointer',
            transition: 'background 120ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Today
        </button>
        <HeaderIconButton label="Next week" onClick={() => setWeekOffset((o) => o + 1)}>
          <ChevronRight size={20} />
        </HeaderIconButton>
      </div>

      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', background: 'var(--default-bg)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(240px, 1fr))',
            gap: 12,
            minWidth: 1640,
            padding: '8px 16px 24px',
          }}
        >
          {visibleWeek.map((d) => (
            <DayColumn
              key={d.key}
              day={d}
              posts={byDay[d.key]}
              isCurrentWeek={isCurrentWeek}
              onOpenPost={openPost}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CAMPAIGNS VIEW — weekly themes (clean read-only timeline) ──────
// Reframes the campaign concept from h2/Campaigns (theme + date range +
// channels + post count) as a client-facing "what's running each week" list.
// NOT the operator Gantt — no editing, no proposed/accept, no wizard.

type Channel = 'Instagram' | 'Facebook' | 'TikTok' | 'LinkedIn' | 'X' | 'Email' | 'Blog';
type WeekStatus = 'live' | 'scheduled' | 'review' | 'upcoming';

interface WeeklyCampaign {
  weekLabel: string;
  range: string;
  theme: string;
  blurb: string;
  channels: Channel[];
  posts: number;
  status: WeekStatus;
  thumb: string;
}

const STATUS_TONE: Record<WeekStatus, { tone: StatusPillTone; label: string }> = {
  live: { tone: 'info', label: 'Live this week' },
  scheduled: { tone: 'success', label: 'Scheduled' },
  review: { tone: 'warning', label: 'Awaiting your review' },
  upcoming: { tone: 'neutral', label: 'Upcoming' },
};

const WEEKLY_CAMPAIGNS: WeeklyCampaign[] = [
  {
    weekLabel: 'This week',
    range: 'May 4 – May 10',
    theme: 'Hardwood Refresh — Spring Launch',
    blurb: 'Before/after hardwood installs and refinishes and the subfloor prep that makes them last, leading with the reveal.',
    channels: ['Instagram', 'TikTok', 'LinkedIn'],
    posts: 9,
    status: 'live',
    thumb: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
  },
  {
    weekLabel: 'Next week',
    range: 'May 11 – May 17',
    theme: 'Flooring Trends 2026',
    blurb: 'Hardwood, LVP & tile picks built for Texas homes — floor-of-the-week reels plus a "5 mistakes" carousel.',
    channels: ['Instagram', 'TikTok', 'X'],
    posts: 8,
    status: 'review',
    thumb: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&h=400&fit=crop',
  },
  {
    weekLabel: 'Week of May 18',
    range: 'May 18 – May 24',
    theme: 'Crew Spotlights',
    blurb: 'A day on the crew — authentic, behind-the-scenes installs and refinishes from Westlake to Round Rock.',
    channels: ['Instagram', 'TikTok', 'LinkedIn', 'Blog'],
    posts: 7,
    status: 'scheduled',
    thumb: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop',
  },
  {
    weekLabel: 'Week of May 25',
    range: 'May 25 – May 31',
    theme: 'Multi-Unit LVP',
    blurb: 'Coordinating a community-scale LVP install — 14 units, one timeline, the playbook that keeps it moving.',
    channels: ['Instagram', 'LinkedIn', 'Email'],
    posts: 6,
    status: 'scheduled',
    thumb: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=400&fit=crop',
  },
  {
    weekLabel: 'Week of Jun 1',
    range: 'Jun 1 – Jun 7',
    theme: 'Estimate FAQ',
    blurb: 'What a free flooring estimate actually covers — the six things every Austin homeowner should expect.',
    channels: ['Instagram', 'X', 'Blog'],
    posts: 6,
    status: 'upcoming',
    thumb: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop',
  },
];

function ChannelChips({ channels }: { channels: Channel[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {channels.map((c) => (
        <Pill key={c} size="sm">{c}</Pill>
      ))}
    </div>
  );
}

function WeeklyCampaignRow({ w, onOpen }: { w: WeeklyCampaign; onOpen: () => void }) {
  const st = STATUS_TONE[w.status];
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'flex',
        gap: 18,
        textAlign: 'left',
        width: '100%',
        fontFamily: 'inherit',
        cursor: 'pointer',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        padding: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        transition: 'border-color 120ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--dark-15)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--dark-8)')}
    >
      <span
        style={{
          width: 96,
          height: 96,
          borderRadius: 12,
          flexShrink: 0,
          background: `center/cover url('${w.thumb}'), var(--dark-4)`,
        }}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{w.weekLabel}</span>
          <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>{w.range}</span>
          <span style={{ display: 'inline-flex' }}>
            <StatusPill tone={st.tone} size="sm">{st.label}</StatusPill>
          </span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.2px', lineHeight: 1.25 }}>
          {w.theme}
        </div>
        <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>{w.blurb}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2, flexWrap: 'wrap' }}>
          <ChannelChips channels={w.channels} />
          <span style={{ fontSize: 14, color: 'var(--dark-60)', flexShrink: 0 }}>
            <span style={{ fontWeight: 500, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>{w.posts}</span> posts
          </span>
        </div>
      </div>
    </button>
  );
}

function CampaignsView({ onOpenCampaign }: { onOpenCampaign: (w: WeeklyCampaign) => void }) {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 24px 60px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.2px', marginBottom: 4 }}>
          Weekly campaigns
        </div>
        <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.55 }}>
          The themes Blaze is running for Grain Design Flooring, week by week — what's going out, where, and how much.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {WEEKLY_CAMPAIGNS.map((w) => (
          <WeeklyCampaignRow key={w.weekLabel} w={w} onOpen={() => onOpenCampaign(w)} />
        ))}
      </div>
    </div>
  );
}

// ─── CAMPAIGN DETAIL — ported & reframed from h2/pages/Campaigns.tsx DetailView ──
// View-only client take: hero + status banner + campaign details + the week's
// review grid. Operator affordances (regenerate / add posts / crosspost toggle /
// settings) are stripped — the client just sees what Blaze is running. Mock
// content is flooring (Grain Design Flooring), matching the campaign list.

type ReviewKind = 'still' | 'story' | 'carousel' | 'feed-video';

const REVIEW_META: Record<ReviewKind, { label: string; color: string; icon: ComponentType<{ size?: number; color?: string }> }> = {
  still: { label: 'Still Image', color: 'var(--red-70)', icon: StillImageIcon },
  story: { label: 'Story', color: 'var(--status-new)', icon: Iphone02 },
  carousel: { label: 'Carousel', color: 'var(--status-connect)', icon: FileMultiple },
  'feed-video': { label: 'Feed Video Post', color: 'var(--purple)', icon: VideoOn },
};

interface ReviewItem {
  kind: ReviewKind;
  date: string;
  img: string;
  caption?: string;
  overlayTitle?: string;
  overlaySub?: string;
}

// Flooring-flavored review posts for Grain Design Flooring — the client-facing
// equivalent of H2's painting REVIEW_ITEMS, reusing the calendar's install imagery.
const REVIEW_ITEMS: ReviewItem[] = [
  { kind: 'still', date: 'Mon 9:00am', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=70', caption: 'Before & after — a Tarrytown white-oak install, tear-out to final board.' },
  { kind: 'story', date: 'Tue 8:00am', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=70', overlayTitle: 'What Subfloor Prep Really Changes', overlaySub: 'The step nobody sees — and the reason your floors last decades.' },
  { kind: 'carousel', date: 'Tue 4:00pm', img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=70', caption: '5 flooring mistakes Austin homeowners keep making — swipe for the fixes.' },
  { kind: 'feed-video', date: 'Wed 11:00am', img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=70', overlayTitle: 'Refinish or Replace Your Hardwood?', overlaySub: 'What it really costs in Austin before you decide.' },
  { kind: 'carousel', date: 'Thu 10:00am', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=70', caption: 'A day on the crew — wide-plank oak going down in Westlake.' },
  { kind: 'still', date: 'Fri 11:00am', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=70', caption: 'Weekend-ready — five LVP picks built for Texas heat, kids & big dogs.' },
];

// Per-status framing: the post badge + the banner copy the client reads.
const CAMPAIGN_POST_BADGE: Record<WeekStatus, { tone: StatusPillTone; label: string }> = {
  live: { tone: 'info', label: 'Posting' },
  scheduled: { tone: 'success', label: 'Scheduled' },
  review: { tone: 'warning', label: 'Review' },
  upcoming: { tone: 'neutral', label: 'Queued' },
};

const CAMPAIGN_BANNER: Record<WeekStatus, string> = {
  live: 'This campaign is live — these posts are publishing across your channels this week.',
  scheduled: 'Approved and scheduled. Here’s everything going out this week.',
  review: 'These posts are ready for your sign-off — approve them from the Approvals tab.',
  upcoming: 'Coming up — Blaze is preparing this week’s content.',
};

function DetailRow({ label, icon, children, first }: { label: string; icon: ReactNode; children: ReactNode; first?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20, padding: '14px 0', borderTop: first ? 'none' : '1px solid var(--dark-4)', alignItems: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--dark-60)' }}>
        <span style={{ width: 18, height: 18, color: 'var(--dark-40)', display: 'inline-flex' }}>{icon}</span>
        {label}
      </span>
      <div style={{ fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function ReviewCard({ r, badge }: { r: ReviewItem; badge: { tone: StatusPillTone; label: string } }) {
  const meta = REVIEW_META[r.kind];
  const Icon = meta.icon;
  const portrait = r.kind === 'story' || r.kind === 'feed-video';
  return (
    <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--dark-80)' }}>
          <Icon size={15} color={meta.color} />
          {meta.label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>{r.date}</span>
      </div>
      {!portrait && r.caption && (
        <div style={{ padding: '0 12px 10px', fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.4 }}>
          {r.caption}<span style={{ color: 'var(--dark-40)' }}> …more</span>
        </div>
      )}
      <div style={{ position: 'relative', aspectRatio: portrait ? '3 / 4' : '4 / 3', background: `center/cover no-repeat url('${r.img}'), var(--dark-4)` }}>
        {portrait && (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 45%)' }} />
            <div style={{ position: 'absolute', top: 14, left: 14, right: 14, color: 'var(--light-100)' }}>
              <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.2px' }}>{r.overlayTitle}</div>
              <div style={{ fontSize: 12, lineHeight: 1.4, marginTop: 6, opacity: 0.9 }}>{r.overlaySub}</div>
            </div>
          </>
        )}
        {r.kind === 'feed-video' && (
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M2 2L14 9L2 16V2Z" fill="#fff" /></svg>
            </span>
          </span>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <StatusPill tone={badge.tone} size="sm">{badge.label}</StatusPill>
      </div>
    </div>
  );
}

function CampaignDetail({ campaign: w }: { campaign: WeeklyCampaign }) {
  const st = STATUS_TONE[w.status];
  const badge = CAMPAIGN_POST_BADGE[w.status];
  const posts = REVIEW_ITEMS.slice(0, Math.min(w.posts, REVIEW_ITEMS.length));
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--light-100)' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 260, background: `center/cover no-repeat url('${w.thumb}'), var(--dark-4)`, display: 'flex', alignItems: 'flex-end', padding: '24px 32px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ display: 'inline-flex', marginBottom: 10 }}>
            <StatusPill tone={st.tone} size="md">{st.label}</StatusPill>
          </span>
          <Heading level={2} color="var(--light-100)" style={{ lineHeight: 1.15, letterSpacing: '-0.4px', maxWidth: 720 }}>{w.theme}</Heading>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 32px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--dark-2)', border: '1px solid var(--dark-8)', borderRadius: 14, padding: '14px 16px', marginBottom: 32 }}>
          <StatusPill tone={st.tone} size="md">{st.label}</StatusPill>
          <Text variant="secondary" style={{ flex: 1, color: 'var(--dark-80)', lineHeight: 1.5 }}>{CAMPAIGN_BANNER[w.status]}</Text>
        </div>

        <section style={{ marginBottom: 36 }}>
          <Heading level={4} style={{ marginTop: 0, marginBottom: 8 }}>Campaign details</Heading>
          <DetailRow first label="Schedule" icon={<svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>}>
            {w.range} <span style={{ color: 'var(--dark-40)' }}>· {w.weekLabel.toLowerCase()}</span>
          </DetailRow>
          <DetailRow label="Channels" icon={<svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>}>
            <ChannelChips channels={w.channels} />
          </DetailRow>
          <DetailRow label="Posts" icon={<svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>}>
            <span style={{ fontWeight: 500 }}>{w.posts}</span> posts this week
          </DetailRow>
          <DetailRow label="Audience" icon={<svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>}>
            Austin-area homeowners · 30–65
          </DetailRow>
          <DetailRow label="Brand" icon={<svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-4z" /></svg>}>
            Grain Design Flooring <span style={{ color: 'var(--dark-40)' }}>· from Brand Kit</span>
          </DetailRow>
        </section>

        <section>
          <Heading level={4} style={{ marginTop: 0, marginBottom: 16 }}>This week’s posts</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, alignItems: 'start' }}>
            {posts.map((r, i) => <ReviewCard key={i} r={r} badge={badge} />)}
          </div>
        </section>
      </div>
    </div>
  );
}

function CampaignBackTitle({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to campaigns"
        style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--dark-90)', padding: 0, flexShrink: 0, transition: 'background 120ms ease' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <ChevronLeft size={20} />
      </button>
      <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 520 }}>{name}</span>
    </div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────

type CalSub = 'calendar' | 'campaigns';
const SUBS: ReadonlySet<CalSub> = new Set(['calendar', 'campaigns']);

export function Calendar({ sub }: { sub?: string }) {
  const { state } = useClientState();
  const [view, setView] = useState<CalSub>(sub && SUBS.has(sub as CalSub) ? (sub as CalSub) : 'calendar');
  const [activeCampaign, setActiveCampaign] = useState<WeeklyCampaign | null>(null);

  // Cold — pre-go-live: no schedule yet, just an explanatory empty state.
  // Centered (no fullBleed) and no Calendar/Campaigns tab strip.
  if (state !== 'steady') {
    return (
      <ClientShell section="calendar">
        <ColdState
          icon={Calendar1}
          title="Your content calendar fills in once you’re live."
          description="Every scheduled post across your channels will show up here, organized by date — so you always know what’s going out and when."
          points={[
            'Posts scheduled across Instagram, Facebook, and Google',
            'Campaign timelines and weekly themes',
            'What’s drafted, approved, and already posted',
          ]}
        />
      </ClientShell>
    );
  }

  // Campaign detail — replaces the page chrome with a back button + name.
  if (activeCampaign) {
    return (
      <ClientShell
        section="calendar"
        title={<CampaignBackTitle name={activeCampaign.theme} onBack={() => setActiveCampaign(null)} />}
        fullBleed
      >
        <CampaignDetail campaign={activeCampaign} />
      </ClientShell>
    );
  }

  const topbarCenter = (
    <div style={{ display: 'flex', gap: 6 }}>
      <TabChip selected={view === 'calendar'} onSelect={() => setView('calendar')}>Calendar</TabChip>
      <TabChip selected={view === 'campaigns'} onSelect={() => setView('campaigns')}>Campaigns</TabChip>
    </div>
  );

  return (
    <ClientShell section="calendar" topbarCenter={topbarCenter} fullBleed={view === 'calendar'}>
      {view === 'calendar' ? <CalendarView /> : <CampaignsView onOpenCampaign={setActiveCampaign} />}
    </ClientShell>
  );
}
