import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ModalStack, useModals } from '@/components';
import { TabChip, useToast } from '@/staging';
import { CreateChooserModal, NewPostModal, type NewPostDraft, type ContentTypeId } from '../CreatePostFlow';
import Plus from '@/icons/20/Plus';
import ChevronLeft from '@/icons/24/ChevronLeft';
import ChevronRight from '@/icons/24/ChevronRight';
import Refresh01 from '@/icons/20/Refresh01';
import Wrench from '@/icons/20/Wrench';
import ClockBackward from '@/icons/20/ClockBackward';
import Filter from '@/icons/20/Filter';
import FileMultiple from '@/icons/20/FileMultiple';
import Document from '@/icons/20/Document';
import UserProfileSquare from '@/icons/20/UserProfileSquare';
import VideoOn from '@/icons/20/VideoOn';
import Iphone02 from '@/icons/16/Iphone02';
import Emails from '@/icons/20/Emails';
import AlertTriangle from '@/icons/20/AlertTriangle';
import StillImageIcon from '../StillImageIcon';
import { H2Layout } from '../H2Layout';
import { AvatarVideoPreview } from '../AvatarVideoPreview';
import { GenerateReportButton } from '../GenerateReportButton';
import { useDevState } from '../dev-state-context';
import { OrganicSocialColdView } from './ColdViews';

/**
 * /h2/organic-social — deep port of `~/dev/Blaze H2 Features/organic-social.html`.
 *
 * Steady state: 7-day calendar of scheduled posts.
 * Interactivity:
 *  - Topbar "Create" → shared CreateChooserModal (Post / Campaign / Add Strategy)
 *    from ../CreatePostFlow.
 *    - Post → shared NewPostModal; created drafts map to calendar Posts via
 *      CT_TO_KIND and land on the visible week.
 *    - Campaign → navigates to /h2/campaigns (wizard pending campaigns deep port)
 *    - Add Strategy → placeholder toast.
 *  - Week nav: prev/next shifts the visible week (offset 0 = current week).
 *    Off-current-week shows empty cells (no posts).
 *
 * Owns its own <H2Layout> invocation (state must be shared between topbar
 * action and body), so the route element in index.tsx is just <OrganicSocialRoute />.
 */

type PlatformKey = 'instagram' | 'tiktok' | 'linkedin' | 'x';
type Status = 'scheduled' | 'draft' | 'review' | 'approved';
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
// Calendar cards are typed by *content kind* (what the post renders as),
// independent of the platform it ships to.
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

const CONTENT_META: Record<ContentKind, { label: string; icon: typeof FileMultiple; color: string }> = {
  still: { label: 'Still Image', icon: StillImageIcon, color: 'var(--red-70)' },
  carousel: { label: 'Carousel', icon: FileMultiple, color: 'var(--status-connect)' },
  blog: { label: 'Blog Post', icon: Document, color: 'var(--status-approved)' },
  'avatar-video': { label: 'AI Avatar Video', icon: UserProfileSquare, color: '#4F62F8' },
  'feed-video': { label: 'Video Feed Post', icon: VideoOn, color: '#6A00FF' },
  'short-video': { label: 'Short Form Video', icon: Iphone02, color: '#00AAFF' },
};

// Video card kinds share the play badge + content preview.
const VIDEO_KINDS = new Set<ContentKind>(['avatar-video', 'feed-video', 'short-video']);
// Map a calendar card kind back to the create-flow content type for the preview.
const KIND_TO_CT: Partial<Record<ContentKind, ContentTypeId>> = {
  'avatar-video': 'ai-avatar',
  'feed-video': 'feed-video',
  'short-video': 'short-video',
};

const TODAY: DayKey = 'thu';
const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Base week — Monday May 4, 2026 (TODAY = Thu May 7).
const BASE_MONDAY = new Date(2026, 4, 4);

const SEED_POSTS: Post[] = [
  { day: 'mon', time: '9:00 AM', platform: 'instagram', type: 'Reel', contentType: 'still', title: 'Before & after — Tarrytown kitchen cabinet refinish in 60 seconds.', thumb: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=70', status: 'approved', source: 'Cabinet Refresh May' },
  { day: 'mon', time: '1:00 PM', platform: 'tiktok', type: 'Short', contentType: 'still', title: '30-second guide to picking exterior colors for Texas heat.', thumb: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=70', status: 'approved', source: 'Color Trends 2026' },
  { day: 'tue', time: '8:00 AM', platform: 'linkedin', type: 'Post', contentType: 'blog', title: 'Why prep matters more than paint — the playbook our crews run on every job', body: 'Prep is the part nobody sees, and the part that decides whether a finish lasts two years or ten. Here is the exact sequence Matthew walks before a single drop of paint goes on.', thumb: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=70', status: 'review', source: 'Crew Spotlights' },
  { day: 'tue', time: '4:00 PM', platform: 'instagram', type: 'Carousel', contentType: 'carousel', title: '5 paint mistakes Austin homeowners keep making (and how to avoid them).', thumb: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=70', status: 'approved', source: 'Color Trends 2026' },
  { day: 'wed', time: '9:00 AM', platform: 'instagram', type: 'Story', contentType: 'still', title: 'BTS — Round Rock HOA repaint, day 18 of 42.', thumb: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=70', status: 'approved', source: 'HOA Round Rock' },
  { day: 'wed', time: '2:00 PM', platform: 'x', type: 'Post', contentType: 'still', title: 'What a free estimate actually covers — the six things every Austin homeowner should expect.', thumb: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=70', status: 'review', source: 'Estimate FAQ' },
  { day: 'thu', time: '10:00 AM', platform: 'instagram', type: 'Reel', contentType: 'avatar-video', title: 'A day on the crew — exterior repaint in Westlake.', thumb: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=70', status: 'approved', source: 'Crew Spotlights' },
  { day: 'thu', time: '5:00 PM', platform: 'tiktok', type: 'Short', contentType: 'carousel', title: 'Cabinet refinish vs replace — what it really costs in Austin.', thumb: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=70', status: 'approved', source: 'Cabinet Refresh May' },
  { day: 'tue', time: '11:00 AM', platform: 'instagram', type: 'Reel', contentType: 'feed-video', title: 'Color of the week — Tarrytown trim in warm white.', thumb: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=70', status: 'approved', source: 'Color Trends 2026' },
  { day: 'fri', time: '6:00 PM', platform: 'tiktok', type: 'Short', contentType: 'short-video', title: 'Three exterior colors that survive Texas summers.', thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=70', status: 'review', source: 'Color Trends 2026' },
  { day: 'fri', time: '11:00 AM', platform: 'instagram', type: 'Reel', contentType: 'still', title: 'Friday reveal — Lakeway exterior, 4 days from prep to finish.', thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=70', status: 'review', source: 'Color Trends 2026' },
  { day: 'fri', time: '3:00 PM', platform: 'linkedin', type: 'Post', contentType: 'blog', title: 'What we learned running an HOA repaint with 14 buildings on one timeline', body: 'Fourteen buildings, one timeline, zero missed handoffs. What coordinating an HOA-scale repaint taught us about sequencing crews and keeping color approvals moving.', thumb: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=600&q=70', status: 'approved', source: 'HOA Round Rock' },
  { day: 'sat', time: '9:00 AM', platform: 'instagram', type: 'Carousel', contentType: 'carousel', title: 'Weekend project — 5 small interior paint refreshes that change a room.', thumb: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&q=70', status: 'approved', source: 'Color Trends 2026' },
  { day: 'sat', time: '7:00 PM', platform: 'tiktok', type: 'Short', contentType: 'still', title: 'Why we never skip the power wash — even on tight timelines.', thumb: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=70', status: 'approved', source: 'Crew Spotlights' },
  { day: 'sun', time: '5:00 PM', platform: 'instagram', type: 'Story', contentType: 'avatar-video', title: 'Sunday Q&A — drop your Austin paint questions, John is answering.', thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=70', status: 'approved', source: 'Estimate FAQ' },
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
      name: DAY_NAMES[i],
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  });
}

// Opaque status badge — readable whether it floats over a photo or sits on
// a white surface (the lib StatusPill is 10%-translucent, so it'd wash out
// over an image). `approved` = green, `review` = amber + warning triangle,
// everything else = neutral grey.
function StatusBadge({ status }: { status: Status }) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 8px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  };

  if (status === 'approved') {
    return (
      <span
        style={{
          ...base,
          backgroundImage:
            'linear-gradient(rgba(4,175,0,0.14), rgba(4,175,0,0.14)), linear-gradient(var(--light-100), var(--light-100))',
          border: '1px solid rgba(4,175,0,0.22)',
          color: '#036b00',
        }}
      >
        Approved
      </span>
    );
  }

  if (status === 'review') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            ...base,
            backgroundImage:
              'linear-gradient(rgba(252,183,40,0.24), rgba(252,183,40,0.24)), linear-gradient(var(--light-100), var(--light-100))',
            border: '1px solid rgba(252,183,40,0.45)',
            color: '#8a5a00',
          }}
        >
          Review
        </span>
        <span style={{ color: '#d99a00', display: 'inline-flex' }}>
          <AlertTriangle size={16} color="currentColor" />
        </span>
      </span>
    );
  }

  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      style={{
        ...base,
        backgroundImage:
          'linear-gradient(var(--dark-4), var(--dark-4)), linear-gradient(var(--light-100), var(--light-100))',
        border: '1px solid var(--dark-8)',
        color: 'var(--dark-60)',
      }}
    >
      {label}
    </span>
  );
}

function TypeAndTime({ post }: { post: Post }) {
  const meta = CONTENT_META[post.contentType];
  const TypeIcon = meta.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 400, color: 'var(--dark-80)' }}>
        <TypeIcon size={16} color={meta.color} />
        {meta.label}
      </span>
      <span style={{ fontSize: 13, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {post.time.toLowerCase().replace(/\s/g, '')}
      </span>
    </div>
  );
}

function Caption({ text }: { text: string }) {
  const truncated = text.length > 78;
  const shown = truncated ? text.slice(0, 78).replace(/\s+\S*$/, '') : text;
  return (
    <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.45 }}>
      {shown}
      {truncated && (
        <>
          {' … '}
          <span style={{ color: 'var(--dark-40)' }}>more</span>
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
  // ── Blog variant — header, landscape image, serif title + body, status ──
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
          <div style={{ fontSize: 13, color: 'var(--dark-40)' }}>{dayFull}</div>
          {post.body && (
            <div
              style={{
                fontSize: 13,
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

  // ── Media variant — header + caption, then image with status overlay ──
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
          <span style={{ fontSize: 14, fontWeight: 400, color: isToday ? 'var(--dark-60)' : 'var(--dark-40)' }}>
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
              color: 'var(--dark-40)',
              fontSize: 13,
            }}
          >
            Nothing scheduled
          </div>
        )}
      </div>
    </div>
  );
}

// Ghost icon button for the calendar toolbar (chevrons, filter). Transparent
// until hover, matching the borderless toolbar buttons in the screenshot.
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

// ─── ROUTE ─────────────────────────────────────────────────────────

export function OrganicSocialRoute() {
  return (
    <ModalStack>
      <OrganicSocialRouteInner />
    </ModalStack>
  );
}

// The New Post modal offers richer content types than the calendar's four
// renderable card kinds — collapse each to the nearest one.
const CT_TO_KIND: Record<ContentTypeId, ContentKind> = {
  still: 'still',
  carousel: 'carousel',
  blog: 'blog',
  'feed-video': 'feed-video',
  'short-video': 'short-video',
  'ai-avatar': 'avatar-video',
  story: 'still',
  email: 'blog',
};

type OrganicSubtab = 'calendar' | 'insights' | 'learnings' | 'recents' | 'approvals';

const SUBTABS: ReadonlySet<OrganicSubtab> = new Set(['calendar', 'insights', 'learnings', 'recents', 'approvals']);

function parseSubtab(raw: string | null): OrganicSubtab {
  return raw && SUBTABS.has(raw as OrganicSubtab) ? (raw as OrganicSubtab) : 'calendar';
}

function OrganicSocialRouteInner() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openModal, closeModal } = useModals();
  const { getState } = useDevState();
  const isCold = getState('/h2/organic-social') === 'cold';
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [weekOffset, setWeekOffset] = useState(0);
  // AI Avatar Video cards open a full content preview (not just a toast).
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const openPost = (p: Post) => {
    if (VIDEO_KINDS.has(p.contentType)) setPreviewPost(p);
    else showToast({ message: `Open · ${p.title.slice(0, 40)}` });
  };
  // Tab lives in the URL (?tab=insights etc.) so deep-links and cross-page
  // tabbing (Campaigns's topbar links back here with the param set) work.
  const tab = parseSubtab(searchParams.get('tab'));
  const setTab = (next: OrganicSubtab) => {
    const sp = new URLSearchParams(searchParams);
    if (next === 'calendar') sp.delete('tab');
    else sp.set('tab', next);
    setSearchParams(sp, { replace: true });
  };

  const visibleWeek = useMemo(() => weekFromOffset(weekOffset), [weekOffset]);
  const isCurrentWeek = weekOffset === 0;

  const byDay = useMemo(() => {
    const map: Record<DayKey, Post[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
    if (isCurrentWeek) posts.forEach((p) => map[p.day].push(p));
    return map;
  }, [posts, isCurrentWeek]);

  // Schedule slots for the New Post modal — one per visible day, label keyed
  // back to a calendar day/time so created drafts land on real columns.
  const dateSlots = useMemo(
    () => visibleWeek.map((d) => ({ label: `${d.date}, 10:00am`, day: d.key, time: '10:00 AM' })),
    [visibleWeek],
  );

  const createPosts = (drafts: NewPostDraft[]) => {
    const fallbackThumb = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=70';
    const made: Post[] = drafts.map((d) => {
      const slot = dateSlots.find((s) => s.label === d.date) ?? dateSlots[0];
      return {
        day: slot.day,
        time: slot.time,
        platform: 'instagram',
        type: 'Post',
        contentType: CT_TO_KIND[d.contentType],
        title: d.topic.trim() || 'Untitled post',
        thumb: d.refImage ?? fallbackThumb,
        status: 'review',
        source: 'Standalone',
      };
    });
    setPosts((prev) => [...prev, ...made]);
    closeModal();
    if (weekOffset !== 0) setWeekOffset(0);
    showToast({ message: `${made.length} post${made.length === 1 ? '' : 's'} added to calendar` });
  };

  const handleOpenChooser = () => {
    openModal(CreateChooserModal, {
      onPickPost: () => {
        closeModal();
        openModal(NewPostModal, { dateOptions: dateSlots.map((s) => s.label), onCreate: createPosts });
      },
      onPickCampaign: () => {
        closeModal();
        showToast({ message: 'Campaign wizard coming with campaigns deep port' });
        navigate('/h2/campaigns');
      },
      onPickStrategy: () => {
        closeModal();
        showToast({ message: 'Strategy builder coming soon' });
      },
    });
  };

  const topbarCenter = (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      <TabChip selected={false} onSelect={() => navigate('/h2/campaigns')}>Campaigns</TabChip>
      <TabChip selected={tab === 'calendar'} onSelect={() => setTab('calendar')}>Calendar</TabChip>
      <TabChip selected={tab === 'insights'} onSelect={() => setTab('insights')}>Insights</TabChip>
      <TabChip selected={tab === 'learnings'} onSelect={() => setTab('learnings')}>Learnings</TabChip>
      <TabChip selected={tab === 'recents'} onSelect={() => setTab('recents')}>Recents</TabChip>
    </div>
  );

  if (isCold) {
    return (
      <H2Layout>
        <OrganicSocialColdView />
      </H2Layout>
    );
  }

  if (tab === 'insights') {
    return (
      <H2Layout topbarCenter={topbarCenter} topbarRight={<GenerateReportButton />}>
        <EmptyTab heading="Insights coming soon" body="Cross-platform performance summaries, top-post breakdowns, and audience trends will land here." />
      </H2Layout>
    );
  }

  if (tab === 'learnings') {
    return (
      <H2Layout topbarCenter={topbarCenter} topbarRight={<GenerateReportButton />}>
        <EmptyTab heading="Learnings coming soon" body="What's working and what isn't — the patterns the agent has picked up from your posts, and the recommendations it's acting on." />
      </H2Layout>
    );
  }

  if (tab === 'approvals') {
    return (
      <H2Layout topbarCenter={topbarCenter} topbarRight={<GenerateReportButton />}>
        <EmptyTab heading="Approvals coming soon" body="Posts the agent flags for sign-off — and your team's approval queue — will land here." />
      </H2Layout>
    );
  }

  if (tab === 'recents') {
    return (
      <H2Layout topbarCenter={topbarCenter} topbarRight={<GenerateReportButton />}>
        <RecentsTab onOpen={(p) => showToast({ message: `Open · ${p.title.slice(0, 40)}` })} />
      </H2Layout>
    );
  }

  return (
    <>
    {previewPost && (
      <AvatarVideoPreview post={previewPost} contentType={KIND_TO_CT[previewPost.contentType] ?? 'ai-avatar'} onClose={() => setPreviewPost(null)} />
    )}
    <H2Layout topbarCenter={topbarCenter} topbarRight={<GenerateReportButton />} fullBleed>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--default-bg)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            borderBottom: '1px solid var(--dark-4)',
            background: 'var(--default-bg)',
            flexShrink: 0,
          }}
        >
          {/* Date navigation */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, justifySelf: 'start' }}>
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

          {/* Actions — centered */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, justifySelf: 'center' }}>
            <Button variant="ghost" size="md" frontIcon={Plus} onPress={handleOpenChooser}>
              Create
            </Button>
            <Button
              variant="ghost"
              size="md"
              frontIcon={Refresh01}
              onPress={() => showToast({ message: 'Regenerating this week’s posts…' })}
            >
              Regenerate
            </Button>
            <Button
              variant="ghost"
              size="md"
              frontIcon={Wrench}
              onPress={() => showToast({ message: 'Improve — agent suggestions coming soon' })}
            >
              Improve
            </Button>
            <Button
              variant="ghost"
              size="md"
              frontIcon={ClockBackward}
              onPress={() => showToast({ message: 'Unscheduled posts coming soon' })}
            >
              Unscheduled
              <span style={{ marginLeft: 6, color: 'var(--dark-40)', fontVariantNumeric: 'tabular-nums' }}>4</span>
            </Button>
          </div>

          {/* View controls — right */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, justifySelf: 'end' }}>
            <Button
              variant="ghost"
              size="md"
              withChevron="down"
              onPress={() => showToast({ message: 'View density — Compact / Comfortable coming soon' })}
            >
              Compact
            </Button>
            <HeaderIconButton label="Filter" onClick={() => showToast({ message: 'Filters coming soon' })}>
              <Filter size={20} />
            </HeaderIconButton>
          </div>
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

    </H2Layout>
    </>
  );
}

// ─── EMPTY TAB ─────────────────────────────────────────────────────

function EmptyTab({ heading, body }: { heading: string; body: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px',
        gap: 8,
        color: 'var(--dark-90)',
        minHeight: 400,
      }}
    >
      <div
        style={{
          fontSize: 17,
          fontWeight: 500,
          color: 'var(--dark-90)',
          letterSpacing: '-0.1px',
        }}
      >
        {heading}
      </div>
      <div
        style={{
          fontSize: 14,
          color: 'var(--dark-60)',
          lineHeight: 1.55,
          maxWidth: 440,
        }}
      >
        {body}
      </div>
    </div>
  );
}

// ─── RECENTS TAB ───────────────────────────────────────────────────

type RecentType = 'still' | 'carousel' | 'blog' | 'email';
type RecentStatus = 'new' | 'review';

interface RecentRow {
  id: string;
  type: RecentType;
  title: string;
  body: string;
  date: string;
  time: string;
  status: RecentStatus;
  thumb: string;
}

const RECENT_TYPE_META: Record<RecentType, { label: string; icon: typeof FileMultiple; color: string; bg: string }> = {
  still: { label: 'Still Image', icon: StillImageIcon, color: 'var(--red-70)', bg: 'rgba(188, 1, 11, 0.10)' },
  carousel: { label: 'Carousel', icon: FileMultiple, color: '#ed7c2c', bg: 'rgba(237, 124, 44, 0.12)' },
  blog: { label: 'Blog Post', icon: Document, color: 'var(--status-approved)', bg: 'rgba(4, 175, 0, 0.10)' },
  email: { label: 'Email', icon: Emails, color: '#edb62c', bg: 'rgba(237, 182, 44, 0.14)' },
};

const RECENT_POSTS: RecentRow[] = [
  {
    id: 'r1',
    type: 'still',
    title: 'Built for Texas heat — our 2026 exterior palette',
    body: "Austin summers are brutal on exterior paint. Here are the four colors our crews are pulling most this season — and the prep that makes them last.",
    date: 'Mon, May 25',
    time: '12:30pm',
    status: 'new',
    thumb: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/02/After-Pic.png',
  },
  {
    id: 'r2',
    type: 'carousel',
    title: 'Cabinet refinish vs replace — Tarrytown kitchen breakdown',
    body: 'A Tarrytown homeowner saved roughly 70% versus full cabinet replacement by refinishing. Carousel of the before, the prep, and the final reveal.',
    date: 'Thu, May 28',
    time: '9:00am',
    status: 'review',
    thumb: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg',
  },
  {
    id: 'r3',
    type: 'still',
    title: 'Why we never skip the power wash',
    body: 'Even on tight timelines, prep is the longest job — because clean substrate is what makes our 2-year warranty hold up.',
    date: 'Tue, May 26',
    time: '12:00pm',
    status: 'review',
    thumb: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/power-washing-2.jpg',
  },
  {
    id: 'r4',
    type: 'blog',
    title: 'Choosing an Austin painter? Here is what to ask first.',
    body: 'A 6-minute read for Austin homeowners — license + insurance + warranty + crew + prep + cleanup. The same checklist John runs with every estimate.',
    date: 'Fri, May 29',
    time: '2:00pm',
    status: 'new',
    thumb: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2022/03/white-painted-brick-home-686x353.jpg',
  },
  {
    id: 'r5',
    type: 'still',
    title: 'Lakeway reveal — 4 days from prep to finish',
    body: 'Full stucco repaint, three trim colors, all wrapped up in 4 days. We sent a slow-pan walk-through to the homeowner before they got home from work.',
    date: 'Mon, May 25',
    time: '3:00pm',
    status: 'review',
    thumb: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2025/01/After-4-rotated.jpeg',
  },
  {
    id: 'r6',
    type: 'still',
    title: 'Color consultation — what John actually does on site',
    body: 'Free with every estimate. John walks the rooms with three deck options, talks light direction, and leaves you with sample patches on the wall.',
    date: 'Fri, May 29',
    time: '12:00pm',
    status: 'new',
    thumb: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/color_consultation_certapro_preview-686x353.jpg',
  },
  {
    id: 'r7',
    type: 'email',
    title: 'Spring exterior estimates — book before the rains',
    body: 'A short note for past customers. May calendar is filling up; we are still booking exterior projects for first-half June if you have been holding off.',
    date: 'Mon, May 25',
    time: '8:00am',
    status: 'new',
    thumb: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/AfterIMG_0384-scaled.jpeg',
  },
];

function RecentsTab({ onOpen }: { onOpen: (row: RecentRow) => void }) {
  return (
    <div style={{ padding: '8px 0 24px' }}>
      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 90px minmax(0, 1fr) 160px 140px',
          gap: 16,
          alignItems: 'center',
          padding: '12px 20px',
          color: 'var(--dark-40)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.04em',
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <span />
        <span>Preview</span>
        <span>Name</span>
        <span>Post Date &amp; Time</span>
        <span>Post Status</span>
      </div>

      {RECENT_POSTS.map((r, i) => {
        const meta = RECENT_TYPE_META[r.type];
        const TypeIc = meta.icon;
        return (
          <div
            key={r.id}
            onClick={() => onOpen(r)}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 90px minmax(0, 1fr) 160px 140px',
              gap: 16,
              alignItems: 'center',
              padding: '18px 20px',
              borderBottom: '1px solid var(--dark-4)',
              cursor: 'pointer',
              background: 'transparent',
              transition: 'background 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--dark-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ color: 'var(--dark-40)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
              {i + 1}
            </span>
            <img
              src={r.thumb}
              alt=""
              style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                objectFit: 'cover',
                border: '1px solid var(--dark-8)',
                background: 'var(--dark-4)',
              }}
            />
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: meta.color,
                  background: meta.bg,
                  padding: '3px 8px',
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                }}
              >
                <TypeIc size={14} color={meta.color} />
                {meta.label}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: 'var(--dark-90)',
                  letterSpacing: '-0.05px',
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {r.title}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--dark-60)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {r.body}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 13, color: 'var(--dark-90)' }}>{r.date}</span>
              <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>{r.time}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {r.status === 'new' ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--light-100)',
                    background: 'var(--purple)',
                  }}
                >
                  New
                </span>
              ) : (
                <>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#8a5a00',
                      background: 'rgba(252, 183, 40, 0.18)',
                    }}
                  >
                    Review
                  </span>
                  <span style={{ color: '#d99a00', display: 'inline-flex' }}>
                    <AlertTriangle size={16} color="currentColor" />
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
