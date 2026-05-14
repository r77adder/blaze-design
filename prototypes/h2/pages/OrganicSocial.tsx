import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, ModalStack, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { TabChip, useToast } from '@/staging';
import { CrosspostWarningModal } from '../CrosspostWarningModal';
import Plus from '@/icons/20/Plus';
import ChevronLeft from '@/icons/24/ChevronLeft';
import ChevronRight from '@/icons/24/ChevronRight';
import Check2 from '@/icons/20/Check2';
import Instagram from '@/icons/20/Instagram';
import TikTok from '@/icons/20/TikTok';
import LinkedIn from '@/icons/20/LinkedIn';
import Twitter from '@/icons/20/Twitter';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';
import { useDevState } from '../dev-state-context';
import { OrganicSocialColdView } from './ColdViews';

/**
 * /h2/organic-social — deep port of `~/dev/Blaze H2 Features/organic-social.html`.
 *
 * Steady state: 7-day calendar of scheduled posts.
 * Interactivity:
 *  - Topbar "Create new" → CreateChooserModal (Campaign vs Post picker)
 *    - Campaign → navigates to /h2/campaigns (wizard pending campaigns deep port)
 *    - Post → opens NewPostModal
 *  - NewPostModal: caption + platform/type/day/time pills + thumbnail picker
 *    + source input. Adds to local POSTS state and toasts confirmation.
 *  - Week nav: prev/next shifts the visible week (offset 0 = current week).
 *    Off-current-week shows empty cells (no posts).
 *
 * Owns its own <H2Layout> invocation (state must be shared between topbar
 * action and body), so the route element in index.tsx is just <OrganicSocialRoute />.
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
const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Base week — Monday May 4, 2026 (TODAY = Thu May 7).
const BASE_MONDAY = new Date(2026, 4, 4);

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

const PLATFORM_DOT: Record<PlatformKey, string> = {
  instagram: '#E1306C',
  tiktok: '#111111',
  linkedin: '#0A66C2',
  x: '#1F2937',
};

const STATUS_STYLES: Record<Status, { bg: string; color: string }> = {
  scheduled: { bg: '#DCFCE7', color: '#14532D' },
  draft: { bg: 'rgba(252,183,40,0.18)', color: '#9A6300' },
  review: { bg: '#FEF3C7', color: '#713F12' },
};

const TYPES_BY_PLATFORM: Record<PlatformKey, string[]> = {
  instagram: ['Reel', 'Carousel', 'Post', 'Story'],
  tiktok: ['Short', 'Story'],
  linkedin: ['Post', 'Carousel', 'Video'],
  x: ['Post', 'Thread'],
};

const NP_TIMES = ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

const NP_THUMBS = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=70',
  'https://images.unsplash.com/photo-1599447332411-fcf9c2406715?w=400&q=70',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=70',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=70',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=70',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=70',
];

const SEED_POSTS: Post[] = [
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

interface DayInfo {
  key: DayKey;
  name: string;
  date: string;
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
    };
  });
}

function formatWeekLabel(days: DayInfo[], offsetWeeks: number): string {
  const monday = new Date(BASE_MONDAY);
  monday.setDate(monday.getDate() + offsetWeeks * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
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

// ─── CHOOSER MODAL ─────────────────────────────────────────────────
// Source: cc-mount in organic-social.html. Two big cards — Campaign and
// Post — laid out 1:1 grid. Post → opens NewPostModal. Campaign →
// navigates to campaigns wizard (TODO until campaigns deep port lands).

function ChooserCard({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 20,
        gap: 10,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: 'var(--default-bg)',
          border: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--dark-90)',
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.05px' }}>{label}</span>
      <span style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.5 }}>{description}</span>
    </button>
  );
}

function CreateChooserModal({
  close,
  onPickCampaign,
  onPickPost,
}: StackModalProps & {
  onPickCampaign: () => void;
  onPickPost: () => void;
}) {
  return (
    <Modal.Root size="md" aria-labelledby="chooser-title" data-testid="create-chooser-modal">
      <Modal.Header
        title="What do you want to create?"
        id="chooser-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <p style={{ margin: '0 0 16px 0', fontSize: 13.5, color: 'var(--dark-60)' }}>
          Pick one — the agent takes it from there.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ChooserCard
            icon={
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 9h18M9 5v14" />
              </svg>
            }
            label="Campaign"
            description="A multi-channel marketing campaign — agent picks the strategy and channel mix."
            onClick={onPickCampaign}
          />
          <ChooserCard
            icon={
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="m3 16 5-5 4 4 3-3 6 6" />
                <circle cx="9" cy="9" r="1.5" />
              </svg>
            }
            label="Post"
            description="A single organic social post for Instagram, TikTok, LinkedIn, or X."
            onClick={onPickPost}
          />
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

// ─── NEW-POST MODAL ────────────────────────────────────────────────
// Source: np-mount + openNewPost() + renderNp(). Form fields:
//  - Caption (textarea)
//  - Platform pills (4 options w/ colored dot)
//  - Type pills (depend on platform — auto-resets when platform changes)
//  - Day pills (Mon–Sun for the current visible week)
//  - Time pills (6 fixed slots)
//  - Thumbnail picker (8 images + None tile)
//  - Source campaign (text input)

interface DraftPost {
  title: string;
  platform: PlatformKey;
  type: string;
  day: DayKey;
  time: string;
  source: string;
  thumb: string | null;
  status: Status;
}

const INITIAL_DRAFT: DraftPost = {
  title: '',
  platform: 'instagram',
  type: 'Reel',
  day: 'thu',
  time: '10:00 AM',
  source: '',
  thumb: null,
  status: 'scheduled',
};

function Pill({
  selected,
  onClick,
  children,
  dotColor,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dotColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: selected ? 'var(--dark-90)' : 'var(--light-100)',
        border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-15)'}`,
        color: selected ? '#fff' : 'var(--dark-90)',
        borderRadius: 99,
        padding: '6px 12px',
        fontFamily: 'inherit',
        fontSize: 12.5,
        cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
    >
      {dotColor && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: dotColor,
            opacity: 0.65,
          }}
        />
      )}
      {children}
    </button>
  );
}

function NPSection({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--dark-60)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}
      >
        {label}
        {optional && (
          <span style={{ color: 'var(--dark-40)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            {' '}
            (optional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function NewPostModal({
  close,
  onSave,
  visibleWeek,
}: StackModalProps & {
  onSave: (p: Post) => void;
  visibleWeek: DayInfo[];
}) {
  const { openModal } = useModals();
  const { showToast } = useToast();
  // Modal mounts on demand via openModal — initial draft is always fresh,
  // no need for the prior `useEffect(() => { if (isOpen) setDraft(INITIAL_DRAFT) })`.
  const [draft, setDraft] = useState<DraftPost>(INITIAL_DRAFT);
  const [crosspost, setCrosspost] = useState(true);

  const setField = <K extends keyof DraftPost>(field: K, value: DraftPost[K]) => {
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'platform') {
        const types = TYPES_BY_PLATFORM[value as PlatformKey] ?? ['Post'];
        if (!types.includes(prev.type)) next.type = types[0];
      }
      return next;
    });
  };

  const types = TYPES_BY_PLATFORM[draft.platform] ?? ['Post'];
  const titleTrimmed = draft.title.trim();
  const canSave = titleTrimmed.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      day: draft.day,
      time: draft.time,
      platform: draft.platform,
      type: draft.type,
      title: titleTrimmed,
      thumb: draft.thumb,
      status: draft.status,
      source: draft.source.trim() || 'Standalone',
    });
  };

  return (
    <Modal.Root size="md" aria-labelledby="new-post-title" data-testid="new-post-modal">
      <Modal.Header
        title="New post"
        id="new-post-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <p style={{ margin: '0 0 16px 0', fontSize: 13.5, color: 'var(--dark-60)' }}>
          Add a single organic social post to your calendar. The agent will draft the rest.
        </p>
      <NPSection label="Caption / title">
        <textarea
          rows={3}
          placeholder="What's the post about?"
          value={draft.title}
          onChange={(e) => setField('title', e.target.value)}
          style={{
            width: '100%',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--dark-90)',
            background: 'var(--light-100)',
            border: '1px solid var(--dark-15)',
            borderRadius: 9,
            padding: '10px 12px',
            outline: 'none',
            resize: 'vertical',
            minHeight: 80,
            lineHeight: 1.55,
          }}
        />
      </NPSection>

      <NPSection label="Platform">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(PLATFORM_NAMES) as PlatformKey[]).map((p) => (
            <Pill
              key={p}
              selected={draft.platform === p}
              onClick={() => setField('platform', p)}
              dotColor={PLATFORM_DOT[p]}
            >
              {PLATFORM_NAMES[p]}
            </Pill>
          ))}
        </div>
      </NPSection>

      <NPSection label="Type">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {types.map((t) => (
            <Pill key={t} selected={draft.type === t} onClick={() => setField('type', t)}>
              {t}
            </Pill>
          ))}
        </div>
      </NPSection>

      <NPSection label="Day">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {visibleWeek.map((d) => (
            <Pill key={d.key} selected={draft.day === d.key} onClick={() => setField('day', d.key)}>
              {d.name} {d.date.replace(/^[A-Za-z]+ /, '')}
            </Pill>
          ))}
        </div>
      </NPSection>

      <NPSection label="Time">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {NP_TIMES.map((t) => (
            <Pill key={t} selected={draft.time === t} onClick={() => setField('time', t)}>
              {t}
            </Pill>
          ))}
        </div>
      </NPSection>

      <NPSection label="Thumbnail" optional>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {NP_THUMBS.map((url) => {
            const selected = draft.thumb === url;
            return (
              <button
                key={url}
                type="button"
                aria-label="Pick thumbnail"
                onClick={() => setField('thumb', url)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 9,
                  background: `center/cover url('${url}')`,
                  border: `2px solid ${selected ? 'var(--dark-90)' : 'transparent'}`,
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'border-color 120ms ease, transform 120ms ease',
                }}
              />
            );
          })}
          <button
            type="button"
            onClick={() => setField('thumb', null)}
            style={{
              width: 46,
              height: 46,
              borderRadius: 9,
              background: 'var(--default-bg)',
              border: '1px dashed var(--dark-15)',
              color: 'var(--dark-60)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontFamily: 'inherit',
            }}
          >
            None
          </button>
        </div>
      </NPSection>

      <NPSection label="Source campaign" optional>
        <input
          placeholder="e.g., Tips & Tricks March"
          value={draft.source}
          onChange={(e) => setField('source', e.target.value)}
          style={{
            width: '100%',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--dark-90)',
            background: 'var(--light-100)',
            border: '1px solid var(--dark-15)',
            borderRadius: 9,
            padding: '10px 12px',
            outline: 'none',
          }}
        />
      </NPSection>

      <NPSection label="Crosspost">
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            fontSize: 13.5,
            color: 'var(--dark-90)',
          }}
        >
          <input
            type="checkbox"
            checked={crosspost}
            onChange={(e) => {
              if (!e.target.checked) {
                openModal(CrosspostWarningModal, {
                  onConfirm: () => {
                    setCrosspost(false);
                    showToast({ message: 'Crosspost disabled · posts will publish per account' });
                  },
                });
              } else {
                setCrosspost(true);
              }
            }}
            style={{ accentColor: 'var(--dark-90)', width: 16, height: 16 }}
          />
          <span>Crosspost to all connected accounts</span>
        </label>
      </NPSection>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="primary"
            frontIcon={Check2}
            isDisabled={!canSave}
            onPress={handleSave}
          >
            Add to calendar
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
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

function OrganicSocialRouteInner() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { openModal, closeModal } = useModals();
  const { getState } = useDevState();
  const isCold = getState('/h2/organic-social') === 'cold';
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [weekOffset, setWeekOffset] = useState(0);

  const visibleWeek = useMemo(() => weekFromOffset(weekOffset), [weekOffset]);
  const weekLabel = useMemo(() => formatWeekLabel(visibleWeek, weekOffset), [visibleWeek, weekOffset]);
  const isCurrentWeek = weekOffset === 0;

  const byDay = useMemo(() => {
    const map: Record<DayKey, Post[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
    if (isCurrentWeek) posts.forEach((p) => map[p.day].push(p));
    return map;
  }, [posts, isCurrentWeek]);

  const handleOpenChooser = () => {
    openModal(CreateChooserModal, {
      onPickCampaign: () => {
        closeModal();
        showToast({ message: 'Campaign wizard coming with campaigns deep port' });
        navigate('/h2/campaigns');
      },
      onPickPost: () => {
        closeModal();
        openModal(NewPostModal, {
          visibleWeek,
          onSave: (p) => {
            setPosts((prev) => [...prev, p]);
            closeModal();
            if (weekOffset !== 0) setWeekOffset(0);
            showToast({ message: 'Post added to calendar' });
          },
        });
      },
    });
  };

  const topbarCenter = (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      <TabChip selected onSelect={() => {}}>Calendar</TabChip>
      <TabChip selected={false} onSelect={() => navigate('/h2/campaigns')}>Campaigns</TabChip>
    </div>
  );

  if (isCold) {
    return (
      <H2Layout>
        <OrganicSocialColdView />
      </H2Layout>
    );
  }

  return (
    <H2Layout topbarCenter={topbarCenter} topbarRight={<GenerateReportButton />}>
      <div style={{ margin: '-24px -24px 0', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              onClick={() => setWeekOffset((o) => o - 1)}
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
            <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--dark-90)', minWidth: 180, textAlign: 'center' }}>
              {weekLabel}
            </span>
            <button
              type="button"
              aria-label="Next week"
              onClick={() => setWeekOffset((o) => o + 1)}
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
          <Button variant="secondary" size="md" frontIcon={Plus} onPress={handleOpenChooser}>
            Create new
          </Button>
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
            {visibleWeek.map((d) => (
              <DayColumn
                key={d.key}
                day={d}
                posts={byDay[d.key]}
                isCurrentWeek={isCurrentWeek}
                onOpenPost={(p) => showToast({ message: `Open · ${p.title.slice(0, 40)}` })}
              />
            ))}
          </div>
        </div>
      </div>

    </H2Layout>
  );
}
