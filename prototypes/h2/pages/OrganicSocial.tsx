import { useMemo, useState } from 'react';
import { Button } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';
import ChevronLeft from '@/icons/24/ChevronLeft';
import ChevronRight from '@/icons/24/ChevronRight';
import Instagram from '@/icons/20/Instagram';
import TikTok from '@/icons/20/TikTok';
import LinkedIn from '@/icons/20/LinkedIn';
import Twitter from '@/icons/20/Twitter';

/**
 * /h2/organic-social — port of Blaze H2 Features/organic-social.html.
 *
 * Static calendar grid of scheduled posts across IG/TikTok/LinkedIn/X.
 * Status pills (scheduled / draft / review). Page tabs (Campaigns | Calendar).
 *
 * NOT yet wired (TODO follow-up):
 *  - Create-new chooser modal (Campaign vs Post picker)
 *  - New-post modal with platform/type/day/time pickers
 *  - Week navigation (currently shows static May 4-10, 2026)
 *  - Click-through to multi-change editor
 */

type PlatformKey = 'instagram' | 'tiktok' | 'linkedin' | 'x';
type Status = 'scheduled' | 'draft' | 'review';
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface Post {
  day: DayKey;
  time: string;
  platform: PlatformKey;
  type: string;
  title: string;
  thumb: string | null;
  status: Status;
  source: string;
}

const TODAY: DayKey = 'thu';

const DAYS: { key: DayKey; name: string; date: string }[] = [
  { key: 'mon', name: 'Mon', date: 'May 4' },
  { key: 'tue', name: 'Tue', date: 'May 5' },
  { key: 'wed', name: 'Wed', date: 'May 6' },
  { key: 'thu', name: 'Thu', date: 'May 7' },
  { key: 'fri', name: 'Fri', date: 'May 8' },
  { key: 'sat', name: 'Sat', date: 'May 9' },
  { key: 'sun', name: 'Sun', date: 'May 10' },
];

const PLATFORM_ICONS: Record<PlatformKey, React.ComponentType<{ size?: number }>> = {
  instagram: Instagram,
  tiktok: TikTok,
  linkedin: LinkedIn,
  x: Twitter,
};

const PLATFORM_NAMES: Record<PlatformKey, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  x: 'X',
};

const STATUS_STYLES: Record<Status, { bg: string; color: string }> = {
  scheduled: { bg: '#DCFCE7', color: '#14532D' },
  draft: { bg: 'rgba(252,183,40,0.18)', color: '#9A6300' },
  review: { bg: '#FEF3C7', color: '#713F12' },
};

const POSTS: Post[] = [
  { day: 'mon', time: '9:00 AM', platform: 'instagram', type: 'Reel', title: "Why your morning routine isn't sticking — and the 3-minute fix.", thumb: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400&q=70', status: 'scheduled', source: 'Spring Sale 2026' },
  { day: 'mon', time: '1:00 PM', platform: 'tiktok', type: 'Short', title: "30-second adaptogen primer — what they do, what they don't.", thumb: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=70', status: 'scheduled', source: 'Tips & Tricks March' },
  { day: 'tue', time: '8:00 AM', platform: 'linkedin', type: 'Post', title: 'How we built our supplement formula — the unsexy truth.', thumb: null, status: 'draft', source: 'Founder Journey Q1' },
  { day: 'tue', time: '4:00 PM', platform: 'instagram', type: 'Carousel', title: '5 supplements that actually do something.', thumb: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70', status: 'scheduled', source: 'Tips & Tricks March' },
  { day: 'wed', time: '9:00 AM', platform: 'instagram', type: 'Story', title: 'BTS — packing day at the SF studio.', thumb: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=70', status: 'scheduled', source: 'Founder Journey Q1' },
  { day: 'wed', time: '2:00 PM', platform: 'x', type: 'Post', title: 'Sleep stack quick thread — what each ingredient does, in 6 tweets.', thumb: null, status: 'review', source: 'Tips & Tricks March' },
  { day: 'thu', time: '10:00 AM', platform: 'instagram', type: 'Reel', title: 'Day in the life — founder edition.', thumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=70', status: 'scheduled', source: 'Founder Journey Q1' },
  { day: 'thu', time: '5:00 PM', platform: 'tiktok', type: 'Short', title: 'How adaptogens differ from caffeine.', thumb: 'https://images.unsplash.com/photo-1599447332411-fcf9c2406715?w=400&q=70', status: 'scheduled', source: 'Tips & Tricks March' },
  { day: 'fri', time: '11:00 AM', platform: 'instagram', type: 'Reel', title: 'Friday reset routine — 60-second walk-through.', thumb: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=70', status: 'review', source: 'Tips & Tricks March' },
  { day: 'fri', time: '3:00 PM', platform: 'linkedin', type: 'Post', title: 'What we learned shipping V2 — three uncomfortable lessons.', thumb: null, status: 'draft', source: 'Founder Journey Q1' },
  { day: 'sat', time: '9:00 AM', platform: 'instagram', type: 'Carousel', title: 'Weekend reset routine — five small habits that compound.', thumb: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=70', status: 'scheduled', source: 'Tips & Tricks March' },
  { day: 'sat', time: '7:00 PM', platform: 'tiktok', type: 'Short', title: 'Why we slowed down our launch cadence.', thumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70', status: 'draft', source: 'Founder Journey Q1' },
  { day: 'sun', time: '5:00 PM', platform: 'instagram', type: 'Story', title: 'Sunday Q&A — drop your supplement questions.', thumb: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&q=70', status: 'scheduled', source: 'Tips & Tricks March' },
];

function PageTabs({ active }: { active: 'campaigns' | 'calendar' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '0 28px',
        background: 'var(--light-100)',
        borderBottom: '1px solid var(--dark-8)',
        flexShrink: 0,
      }}
    >
      {(['campaigns', 'calendar'] as const).map((key) => (
        <span
          key={key}
          style={{
            padding: '11px 16px',
            fontSize: 13.5,
            fontWeight: active === key ? 500 : 400,
            color: active === key ? 'var(--dark-90)' : 'var(--dark-60)',
            borderBottom: `2px solid ${active === key ? 'var(--dark-90)' : 'transparent'}`,
            marginBottom: -1,
            cursor: 'pointer',
            textTransform: 'capitalize',
          }}
        >
          {key === 'calendar' ? 'Calendar' : 'Campaigns'}
        </span>
      ))}
    </div>
  );
}

function PostTile({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const Icon = PLATFORM_ICONS[post.platform];
  const statusStyle = STATUS_STYLES[post.status];
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 9,
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'inherit',
        transition: 'border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
      }}
    >
      <div
        style={{
          aspectRatio: '1.5 / 1',
          background: post.thumb
            ? `center/cover url('${post.thumb}'), var(--dark-4)`
            : 'linear-gradient(135deg, #1B1B1A 0%, #2A2826 100%)',
          color: post.thumb ? undefined : '#fff',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          padding: post.thumb ? 0 : 10,
        }}
      >
        {!post.thumb && <span style={{ textAlign: 'center' }}>{post.title.slice(0, 80)}</span>}
        <span
          title={PLATFORM_NAMES[post.platform]}
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 22,
            height: 22,
            borderRadius: 6,
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={12} />
        </span>
        <span
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            borderRadius: 5,
            padding: '2px 6px',
            fontSize: 10,
            fontWeight: 500,
          }}
        >
          {post.type}
        </span>
      </div>
      <div style={{ padding: '9px 11px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--dark-60)',
            fontVariantNumeric: 'tabular-nums',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {post.time}
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--dark-15)' }} />
          {PLATFORM_NAMES[post.platform]}
        </div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: 'var(--dark-90)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 500,
              padding: '2px 7px',
              borderRadius: 5,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: statusStyle.bg,
              color: statusStyle.color,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
            {post.status}
          </span>
          <span
            title={post.source}
            style={{
              fontSize: 10,
              color: 'var(--dark-40)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
          >
            {post.source}
          </span>
        </div>
      </div>
    </button>
  );
}

function DayColumn({ day, posts, onOpenPost }: { day: typeof DAYS[number]; posts: Post[]; onOpenPost: (p: Post) => void }) {
  const isToday = day.key === TODAY;
  return (
    <div
      style={{
        borderRight: '1px solid var(--dark-8)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 220px)',
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          background: isToday ? 'var(--light-100)' : 'var(--default-bg)',
          borderBottom: '1px solid var(--dark-8)',
          boxShadow: isToday ? 'inset 0 -2px 0 var(--dark-90)' : undefined,
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--dark-60)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          {day.name}
          {isToday ? ' · TODAY' : ''}
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark-90)', marginTop: 2, letterSpacing: '-0.2px' }}>
          {day.date}
        </div>
        <div style={{ fontSize: 11, color: 'var(--dark-40)', marginTop: 2 }}>
          {posts.length} post{posts.length === 1 ? '' : 's'}
        </div>
      </div>
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {posts.length > 0 ? (
          posts.map((p, i) => <PostTile key={i} post={p} onOpen={() => onOpenPost(p)} />)
        ) : (
          <div
            style={{
              margin: 'auto',
              padding: '28px 8px',
              textAlign: 'center',
              color: 'var(--dark-40)',
              fontSize: 11,
            }}
          >
            Nothing scheduled
          </div>
        )}
      </div>
    </div>
  );
}

export function OrganicSocial() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'campaigns' | 'calendar'>('calendar');
  // Tab state currently unused for body switching — Calendar is the only
  // body in Ivan's source. Switching to Campaigns would route to /h2/campaigns.

  const byDay = useMemo(() => {
    const map: Record<DayKey, Post[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
    POSTS.forEach((p) => map[p.day].push(p));
    return map;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageTabs active={tab} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 28px',
          borderBottom: '1px solid var(--dark-8)',
          background: 'var(--default-bg)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => showToast({ message: 'Previous week (TODO)' })}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-15)',
              borderRadius: 8,
              padding: 6,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--dark-90)', minWidth: 160, textAlign: 'center' }}>
            May 4 – May 10, 2026
          </span>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => showToast({ message: 'Next week (TODO)' })}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-15)',
              borderRadius: 8,
              padding: 6,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(160px, 1fr))',
            gap: 0,
            minWidth: 1180,
          }}
        >
          {DAYS.map((d) => (
            <DayColumn
              key={d.key}
              day={d}
              posts={byDay[d.key]}
              onOpenPost={(p) => showToast({ message: `Open · ${p.title.slice(0, 40)}` })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Topbar action button — exported so /h2/index.tsx can render it via
 * H2Layout's `topbarRight` prop. Keeps the Create-new modal logic
 * deferred (TODO) while still showing the affordance.
 */
export function OrganicSocialTopbarAction() {
  const { showToast } = useToast();
  return (
    <Button variant="secondary" size="md" frontIcon={Plus} onClick={() => showToast({ message: 'Create-new chooser (TODO modal)' })}>
      Create new
    </Button>
  );
}
