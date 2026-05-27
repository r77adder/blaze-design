import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button, Heading, IconButton, Modal, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Card, StatusPill, TabChip, Toggle } from '@/staging';
import Plus from '@/icons/20/Plus';
import Plus02 from '@/icons/20/Plus02';
import ChevronDown from '@/icons/16/ChevronDown';
import ChevronRight from '@/icons/24/ChevronRight';
import Refresh01 from '@/icons/20/Refresh01';
import Trash2 from '@/icons/20/Trash2';
import FilePlus1 from '@/icons/20/FilePlus1';
import Close from '@/icons/16/Close';
import StillImageIcon from './StillImageIcon';

/**
 * Shared "create" surface for the Calendar (OrganicSocial) and Campaigns views.
 *
 *  1. CreateChooserModal — three full-width rows: Post / Campaign / Add Strategy.
 *  2. NewPostModal — the Post step. One or more posts, each defaulting to
 *     Still Image, each with a content-type dropdown. "AI Avatar Video" carries
 *     a [new] tag. Parent maps the returned drafts into whatever it needs
 *     (calendar posts, a toast, etc.).
 */

// ─── CONTENT TYPES ─────────────────────────────────────────────────

export type ContentTypeId =
  | 'still'
  | 'carousel'
  | 'feed-video'
  | 'ai-avatar'
  | 'short-video'
  | 'story'
  | 'blog'
  | 'email';

interface ContentTypeDef {
  id: ContentTypeId;
  label: string; // short label shown on the trigger pill
  menuLabel: string; // descriptive label shown in the dropdown list
  color: string;
  glyph: ReactNode; // inline 24-viewBox stroke glyph
  isNew?: boolean;
}

export const CONTENT_TYPES: ContentTypeDef[] = [
  {
    id: 'still',
    label: 'Still Image',
    menuLabel: 'Still image posts',
    color: 'var(--red-70)',
    glyph: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </>
    ),
  },
  {
    id: 'carousel',
    label: 'Carousel',
    menuLabel: 'Carousels',
    color: 'var(--status-connect)',
    glyph: (
      <>
        <rect x="8" y="4" width="12" height="14" rx="2" />
        <path d="M4 7v11a3 3 0 0 0 3 3h11" />
      </>
    ),
  },
  {
    id: 'feed-video',
    label: 'Video Feed Post',
    menuLabel: 'Video feed posts',
    color: 'var(--purple)',
    glyph: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    id: 'ai-avatar',
    label: 'AI Avatar Video',
    menuLabel: 'AI Avatar Video',
    color: 'var(--purple)',
    isNew: true,
    glyph: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <circle cx="10" cy="11" r="2.4" />
        <path d="M6.5 17c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7" />
        <path d="M17.5 6.2l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    id: 'short-video',
    label: 'Short Form Video',
    menuLabel: 'Short form videos',
    color: 'var(--status-posting)',
    glyph: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <path d="M11 18h2" />
      </>
    ),
  },
  {
    id: 'story',
    label: 'Story',
    menuLabel: 'Stories',
    color: 'var(--status-new)',
    glyph: (
      <>
        <circle cx="11" cy="12" r="8" strokeDasharray="3 2.4" />
        <path d="M18.5 4.5v5M16 7h5" />
      </>
    ),
  },
  {
    id: 'blog',
    label: 'Blog Post',
    menuLabel: 'Blog post',
    color: 'var(--status-approved)',
    glyph: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    menuLabel: 'Email',
    color: 'var(--status-review)',
    glyph: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M4 7l8 6 8-6" />
      </>
    ),
  },
];

const CONTENT_BY_ID = Object.fromEntries(CONTENT_TYPES.map((c) => [c.id, c])) as Record<ContentTypeId, ContentTypeDef>;

function ContentGlyph({ def, size = 18 }: { def: ContentTypeDef; size?: number }) {
  // "Still Image" ships as a fill-based brand asset, so render the dedicated
  // component instead of the stroke glyph. All other types stay stroke-based.
  if (def.id === 'still') {
    return <StillImageIcon size={size} color={def.color} />;
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={def.color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {def.glyph}
    </svg>
  );
}

// ─── DROPDOWN PRIMITIVE ────────────────────────────────────────────

// Menu positions with `fixed` coords measured off the trigger so it escapes
// the modal body's overflow clipping, and flips upward when low on space.
function FieldDropdown({
  trigger,
  align = 'left',
  menuWidth,
  children,
}: {
  trigger: ReactNode;
  align?: 'left' | 'right';
  menuWidth?: number;
  children: (close: () => void) => ReactNode;
}) {
  const width = menuWidth ?? 220;
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Position the menu after it mounts, measuring its real height. Behaves like
  // a normal dropdown: opens downward directly under the button, capping its
  // height (and scrolling) to fit. Only flips above the button when there is
  // genuinely too little room below and more room above. Clamps into the
  // viewport and re-runs on resize/scroll so it never goes stale.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const b = btnRef.current?.getBoundingClientRect();
      const menu = menuRef.current;
      if (!b || !menu) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 8;
      const gap = 6;
      const minUsable = 180;
      const below = vh - b.bottom - margin;
      const above = b.top - margin;
      // Default to opening down (under the button); only flip up when there's
      // too little room below for a usable menu and more room above.
      const openDown = below >= minUsable || below >= above;
      const maxHeight = Math.max(120, (openDown ? below : above) - gap);
      const height = Math.min(menu.scrollHeight, maxHeight);
      let top = openDown ? b.bottom + gap : b.top - gap - height;
      top = Math.max(margin, Math.min(top, vh - height - margin));
      let left = align === 'right' ? b.right - width : b.left;
      left = Math.max(margin, Math.min(left, vw - width - margin));
      setStyle({ position: 'fixed', top, left, width, maxHeight, overflowY: 'auto', visibility: 'visible' });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, align, width]);

  return (
    <span style={{ display: 'inline-flex' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          setStyle({ visibility: 'hidden' });
          setOpen((o) => !o);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--light-100)',
          border: '1px solid var(--dark-15)',
          borderRadius: 8,
          padding: '6px 10px',
          fontFamily: 'inherit',
          fontSize: 14,
          color: 'var(--dark-90)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {trigger}
        <ChevronDown size={16} color="var(--dark-60)" />
      </button>
      {open &&
        // Portal to <body> so the menu escapes the modal's `transform` (which
        // would otherwise make position:fixed resolve against the modal box,
        // not the viewport) and lands directly under the trigger.
        createPortal(
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99999 }} />
            <div
              ref={menuRef}
              style={{
                ...style,
                zIndex: 100000,
                background: 'var(--light-100)',
                border: '1px solid var(--dark-8)',
                borderRadius: 12,
                boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
                padding: 6,
              }}
            >
              {children(() => setOpen(false))}
            </div>
          </>,
          document.body,
        )}
    </span>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        background: 'transparent',
        border: 'none',
        borderRadius: 8,
        padding: '9px 10px',
        fontFamily: 'inherit',
        fontSize: 14,
        color: 'var(--dark-90)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  );
}

// ─── CHOOSER MODAL ─────────────────────────────────────────────────

function ChooserRow({
  color,
  glyph,
  label,
  description,
  onClick,
}: {
  color: string;
  glyph: ReactNode;
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
        alignItems: 'center',
        gap: 14,
        width: '100%',
        padding: '14px 16px',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'border-color 120ms ease, background 120ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-15)';
        e.currentTarget.style.background = 'var(--dark-2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-8)';
        e.currentTarget.style.background = 'var(--light-100)';
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 10,
          background: color.replace('var(--purple)', 'rgba(124,92,252,0.12)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {glyph}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.05px' }}>{label}</span>
        <span style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.4 }}>{description}</span>
      </span>
      <ChevronRight size={20} color="var(--dark-40)" />
    </button>
  );
}

export function CreateChooserModal({
  close,
  onPickPost,
  onPickCampaign,
  onPickStrategy,
}: StackModalProps & {
  onPickPost: () => void;
  onPickCampaign: () => void;
  onPickStrategy: () => void;
}) {
  return (
    <Modal.Root size="xs-wide" aria-labelledby="create-chooser-title" data-testid="create-chooser-modal">
      <Modal.Header title="Create New" id="create-chooser-title" onClose={close} compact />
      <Modal.Content withoutFooter compact>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ChooserRow
            color="rgba(124, 92, 252, 0.12)"
            glyph={
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="var(--purple)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4L19 9l-4-4L4 16v4z" />
                <path d="M14 6l4 4" />
              </svg>
            }
            label="Post"
            description="A single post that's added to a campaign"
            onClick={onPickPost}
          />
          <ChooserRow
            color="rgba(1, 121, 207, 0.12)"
            glyph={
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="var(--status-posting)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 9.5h18M8 3v4M16 3v4" />
              </svg>
            }
            label="Campaign"
            description="A themed set of posts over a date range"
            onClick={onPickCampaign}
          />
          <ChooserRow
            color="rgba(4, 175, 0, 0.12)"
            glyph={
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="var(--status-approved)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l9 5-9 5-9-5 9-5z" />
                <path d="M3 13l9 5 5.5-3" />
                <path d="M19 14v6M16 17h6" />
              </svg>
            }
            label="Add Strategy"
            description="A group of campaigns around a goal"
            onClick={onPickStrategy}
          />
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

// ─── NEW POST MODAL ────────────────────────────────────────────────

export interface NewPostDraft {
  id: string;
  contentType: ContentTypeId;
  topic: string;
  refImage: string | null;
  accounts: number;
  date: string;
  // AI Avatar Video settings (set via the Script & Settings modal).
  script?: string;
  durationSec?: number;
  captions?: boolean;
  captionStyle?: string;
  videoStyle?: string;
}

// AI-suggested seeds — CertaPro Austin painting topics + reference images.
const AI_SEEDS: { topic: string; refImage: string }[] = [
  {
    topic:
      'Most exterior paint failures in Austin trace back to prep, not paint. Here are three quick checks to run before your next repaint — and why timing matters in Texas heat.',
    refImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70',
  },
  {
    topic:
      'Cabinet refinish vs. replace — what it actually costs in Austin, and the one question that decides which way to go.',
    refImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70',
  },
  {
    topic:
      'Picking an exterior color that survives Texas sun: the three undertones that hold up, and the two that fade by year two.',
    refImage: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=70',
  },
  {
    topic:
      'What a free estimate really covers — the six things every Austin homeowner should expect before a single drop of paint.',
    refImage: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&q=70',
  },
];

let draftSeq = 0;
const nextId = () => `np-${draftSeq++}`;

const ACCOUNT_OPTIONS = [1, 3, 5];
const DEFAULT_DATE_OPTIONS = ['May 7, 12:15pm', 'May 8, 9:00am', 'May 9, 3:45pm', 'May 12, 10:00am'];

function makeAiDraft(seedIndex: number, date: string): NewPostDraft {
  const seed = AI_SEEDS[seedIndex % AI_SEEDS.length];
  return { id: nextId(), contentType: 'still', topic: seed.topic, refImage: seed.refImage, accounts: 5, date };
}

function makeBlankDraft(date: string): NewPostDraft {
  return { id: nextId(), contentType: 'still', topic: '', refImage: null, accounts: 5, date };
}

// The team's own presenters — shown with a name + delivery note.
const MY_AVATARS = [
  { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=70', name: 'Matthew R.', desc: 'VP of Residential · warm, confident delivery' },
  { img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=70', name: 'Marci L.', desc: 'Brand lead · bright, upbeat tone' },
  { img: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&q=70', name: 'Devin T.', desc: 'Crew foreman · casual, straight-talking' },
];

// Licensed stock presenters — a longer library to scroll through.
const STOCK_AVATARS = [
  { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70', name: 'Daniel' },
  { img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=70', name: 'Aria' },
  { img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=70', name: 'Hannah' },
  { img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=70', name: 'Marcus' },
  { img: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=70', name: 'Lena' },
  { img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=70', name: 'Priya' },
  { img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=70', name: 'Owen' },
  { img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=70', name: 'Sofia' },
  { img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=70', name: 'Jordan' },
  { img: 'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=400&q=70', name: 'Theo' },
  { img: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&q=70', name: 'Elise' },
  { img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=70', name: 'Caleb' },
];

const AVATAR_IMAGE = MY_AVATARS[0].img;
const AVATAR_TOPIC =
  'Matthew, our VP of Residential, walks homeowners through a Tarrytown cabinet refinish — prep, color match, and the final reveal — in a 30-second AI avatar update.';

// Presenter scripts the "Regenerate" button cycles through, keyed by duration
// so a 15s clip stays punchy while a 60s clip has room to breathe.
const SCRIPTS_BY_DURATION: Record<number, string[]> = {
  15: [
    "Hey Austin — Matthew from CertaPro.\n\nGreat paint jobs are won at prep, not paint. Tap the link for a free walkthrough this week.",
    'Refinish your cabinets — don\'t replace them.\n\nA proper refinish costs a fraction and lasts for years. Tap to see how we do it in Austin.',
    'Texas sun fades the wrong colors fast.\n\nTwo undertones hold up, two won\'t. Book a free color consult and we\'ll bring samples to you.',
  ],
  30: [
    "Hey Austin — Matthew here from CertaPro.\n\nMost exterior paint jobs don't fail because of the paint — they fail because of prep. Here are the three things our crews check before a single coat goes on.\n\nWant a free walkthrough? Tap the link and we'll take a look this week.",
    'Thinking about refinishing your cabinets?\n\nBefore you replace them, hear me out. A proper refinish costs a fraction of new cabinets and lasts for years — when it is prepped and sprayed right.\n\nHere is exactly what to look for, and how we do it in Austin.',
    'Texas sun is brutal on exterior color.\n\nTwo undertones hold up through our summers, and two will fade by year two. Let me show you which is which before you pick your next palette.\n\nBook a free color consult and we will bring samples to you.',
  ],
  60: [
    "Hey Austin — Matthew here from CertaPro, VP of Residential.\n\nI get this question every week: why did my exterior paint fail after just two summers? Nine times out of ten, it isn't the paint — it's the prep. So before your next repaint, here are the three checks our crews run on every home.\n\nFirst, we test for chalking and check the moisture in the substrate. Second, we look at caulk lines and trim for movement and gaps. Third, we time the job around the heat — spraying in 100-degree afternoon sun is asking for trouble.\n\nWant us to take a look? Tap the link and we'll set up a free walkthrough this week.",
    'Thinking about your kitchen cabinets — refinish, or replace?\n\nI talk Austin homeowners through this all the time, so let me save you some money. Replacing cabinets can run five figures and weeks of demolition. A proper refinish? A fraction of the cost, done in days, and it lasts for years — when it is prepped, sprayed, and cured the right way.\n\nThe one question that decides it: are the boxes structurally sound? If they are, refinishing is almost always the smarter call.\n\nHere is exactly what we look for, and how our crews do it. Tap the link for a free in-home estimate.',
    'Picking an exterior color in Texas is not like picking one anywhere else.\n\nOur sun is relentless, and it punishes the wrong undertones. Over the years I have watched two undertones hold up beautifully through summer after summer — and two that look great on day one and fade by year two.\n\nWarm earth tones and true neutrals with the right base tend to stay rich. The ones that drift? Cooler blues and certain reds without UV-stable pigments.\n\nBefore you commit to a palette, let us bring real samples to your home and test them on your actual walls. Tap the link to book a free color consult.',
  ],
};

const DURATIONS = [15, 30, 60];

const CAPTION_STYLES = ['Bold pop', 'Minimal', 'Karaoke', 'Clean subtitle'];

// Switching the content type also swaps the reference image + topic so an
// AI Avatar Video shows a presenter and a video-style script rather than a
// still-life, and reverts to a still seed when switched back.
function applyContentType(draft: NewPostDraft, id: ContentTypeId): NewPostDraft {
  if (id === 'ai-avatar') return { ...draft, contentType: id, refImage: AVATAR_IMAGE, topic: AVATAR_TOPIC };
  if (draft.contentType === 'ai-avatar') return { ...draft, contentType: id, refImage: AI_SEEDS[0].refImage, topic: AI_SEEDS[0].topic };
  return { ...draft, contentType: id };
}

// Video styles for the AI Avatar Video.
const VIDEO_STYLES = [
  { id: 'talking-head', name: 'Talking Head', desc: 'Avatar on a clean branded background' },
  { id: 'b-roll', name: 'B-Roll Cutaways', desc: 'Avatar with footage overlays' },
  { id: 'split-screen', name: 'Split Screen', desc: 'Avatar beside text or visuals' },
];

// Shared selection ring used by the avatar + video-style cards.
const selectedCardStyle = (selected: boolean): React.CSSProperties =>
  selected ? { borderColor: 'var(--dark-90)', boxShadow: 'inset 0 0 0 1px var(--dark-90)' } : {};

export function AvatarCard({
  img,
  name,
  desc,
  selected = false,
  onClick,
}: {
  img: string;
  name: string;
  desc?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <Card interactive padding="none" onClick={onClick} style={{ overflow: 'hidden', ...selectedCardStyle(selected) }}>
      <div style={{ width: '100%', aspectRatio: '3 / 4', backgroundImage: `url('${img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{name}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.4, marginTop: 3 }}>{desc}</div>}
      </div>
    </Card>
  );
}

// ─── AVATAR PICKER MODAL ───────────────────────────────────────────

function AvatarPickerModal({
  close,
  value,
  onSelect,
}: StackModalProps & {
  value: string | null;
  onSelect: (img: string) => void;
}) {
  const [tab, setTab] = useState<'mine' | 'stock'>('mine');
  const pick = (img: string) => {
    onSelect(img);
    close();
  };
  return (
    <Modal.Root size="lg" aria-labelledby="avatar-picker-title" data-testid="avatar-picker-modal">
      <Modal.Content compact={false}>
        {/* Custom header: title left, tab chips centered, close right. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 12,
            marginBottom: 22,
          }}
        >
          <Heading level={3} id="avatar-picker-title" style={{ margin: 0 }}>
            Choose an avatar
          </Heading>
          <div style={{ display: 'flex', gap: 6, justifySelf: 'center' }}>
            <TabChip selected={tab === 'mine'} onSelect={() => setTab('mine')}>
              My Avatars
            </TabChip>
            <TabChip selected={tab === 'stock'} onSelect={() => setTab('stock')}>
              Stock Avatars
            </TabChip>
          </div>
          <div style={{ justifySelf: 'end' }}>
            <IconButton icon={Close} size="sm" variant="tertiary" aria-label="Close" onPress={close} />
          </div>
        </div>
        {tab === 'mine' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {MY_AVATARS.map((a) => (
              <AvatarCard key={a.img} img={a.img} name={a.name} desc={a.desc} selected={value === a.img} onClick={() => pick(a.img)} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxHeight: 420, overflowY: 'auto' }}>
            {STOCK_AVATARS.map((a) => (
              <AvatarCard key={a.img} img={a.img} name={a.name} selected={value === a.img} onClick={() => pick(a.img)} />
            ))}
          </div>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}

// ─── SCRIPT & SETTINGS MODAL ───────────────────────────────────────

// A floating 9:16 phone mockup that previews the avatar video. Reflects the
// live state where reasonable: the avatar image fills the screen (or one half
// for Split Screen), a play badge reads it as video, and an optional caption
// bar near the bottom hints at the selected caption style.
function PhonePreview({
  refImage,
  captions,
  captionStyle,
  videoStyle,
}: {
  refImage: string | null;
  captions: boolean;
  captionStyle: string;
  videoStyle: string;
}) {
  const isSplit = videoStyle === 'split-screen';
  const captionBar = captions ? (
    <div
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 18,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          maxWidth: '92%',
          // Hint the selected caption style: bold pop is heavier + tighter,
          // minimal/clean are lighter, karaoke leans on the accent color.
          fontSize: captionStyle === 'Bold pop' ? 14 : 12,
          fontWeight: captionStyle === 'Minimal' || captionStyle === 'Clean subtitle' ? 500 : 700,
          lineHeight: 1.25,
          textAlign: 'center',
          color: captionStyle === 'Karaoke' ? 'var(--brand)' : 'var(--light-100)',
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 8,
          padding: captionStyle === 'Bold pop' ? '6px 10px' : '4px 9px',
          textShadow: captionStyle === 'Minimal' ? 'none' : '0 1px 4px rgba(0,0,0,0.4)',
          letterSpacing: '0.01em',
        }}
      >
        Most paint jobs fail at prep.
      </span>
    </div>
  ) : null;

  const playBadge = (
    <span
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.42)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="18" height="20" viewBox="0 0 16 18" fill="none">
        <path d="M2 2L14 9L2 16V2Z" fill="var(--light-100)" />
      </svg>
    </span>
  );

  return (
    <div
      style={{
        position: 'relative',
        width: 232,
        aspectRatio: '9 / 16',
        borderRadius: 28,
        background: 'var(--dark-90)',
        padding: 8,
        boxShadow: '0 18px 48px rgba(0,0,0,0.28)',
      }}
    >
      {/* screen */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 22,
          overflow: 'hidden',
          background: 'var(--dark-90)',
        }}
      >
        {isSplit ? (
          // Split Screen: avatar on the top half, a text panel below it.
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                flex: 1,
                backgroundImage: refImage ? `url('${refImage}')` : undefined,
                backgroundColor: refImage ? undefined : 'var(--dark-60)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div
              style={{
                flex: 1,
                background: 'var(--light-100)',
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                justifyContent: 'center',
              }}
            >
              <div style={{ height: 8, borderRadius: 4, background: 'var(--dark-15)', width: '70%' }} />
              <div style={{ height: 8, borderRadius: 4, background: 'var(--dark-8)', width: '90%' }} />
              <div style={{ height: 8, borderRadius: 4, background: 'var(--dark-8)', width: '55%' }} />
            </div>
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: refImage ? `url('${refImage}')` : undefined,
              backgroundColor: refImage ? undefined : 'var(--dark-60)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        {/* play badge — centered over the avatar area */}
        <span
          style={{
            position: 'absolute',
            top: isSplit ? '25%' : '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        >
          {playBadge}
        </span>
        {captionBar}
      </div>
    </div>
  );
}

function ScriptSettingsModal({
  close,
  draft,
  onChange,
}: StackModalProps & {
  draft: NewPostDraft;
  onChange: (next: NewPostDraft) => void;
}) {
  const { openModal } = useModals();
  const initialDuration = draft.durationSec ?? 30;
  const [scriptIdx, setScriptIdx] = useState(0);
  const [durationSec, setDurationSec] = useState(initialDuration);
  const [script, setScript] = useState(draft.script ?? SCRIPTS_BY_DURATION[initialDuration][0]);
  const [captions, setCaptions] = useState(draft.captions ?? true);
  const [captionStyle, setCaptionStyle] = useState(draft.captionStyle ?? CAPTION_STYLES[0]);
  const [videoStyle, setVideoStyle] = useState(draft.videoStyle ?? VIDEO_STYLES[0].id);
  // Local copy of the avatar image so a stacked picker updates the preview live
  // (the `draft` prop is a snapshot and won't re-render this modal on its own).
  const [refImage, setRefImage] = useState(draft.refImage);

  // Changing the duration swaps the script to a length-appropriate variant and
  // resets the regenerate cycle for that duration.
  const changeDuration = (s: number) => {
    setDurationSec(s);
    setScriptIdx(0);
    setScript(SCRIPTS_BY_DURATION[s][0]);
  };
  // Regenerate cycles through the variants for the CURRENT duration.
  const regenerate = () => {
    const variants = SCRIPTS_BY_DURATION[durationSec];
    const next = (scriptIdx + 1) % variants.length;
    setScriptIdx(next);
    setScript(variants[next]);
  };
  const openAvatarPicker = () =>
    openModal(AvatarPickerModal, { value: refImage, onSelect: (img) => setRefImage(img) });
  const save = () => {
    onChange({ ...draft, script, durationSec, captions, captionStyle, videoStyle, refImage });
    close();
  };

  const pill = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? 'var(--dark-90)' : 'var(--dark-15)'}`,
    background: active ? 'var(--dark-90)' : 'var(--light-100)',
    color: active ? '#fff' : 'var(--dark-90)',
    borderRadius: 99,
    padding: '6px 14px',
    fontSize: 13,
    fontFamily: 'inherit',
    cursor: 'pointer',
  });

  return (
    <Modal.Root size="lg" aria-labelledby="script-settings-title" data-testid="script-settings-modal">
      <Modal.Header title="Script & Settings" id="script-settings-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
          {/* LEFT — preview pane with a floating phone mockup. */}
          <div
            style={{
              flexShrink: 0,
              width: 320,
              borderRadius: 16,
              background: 'var(--dark-4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 24,
              alignSelf: 'stretch',
            }}
          >
            <PhonePreview
              refImage={refImage}
              captions={captions}
              captionStyle={captionStyle}
              videoStyle={videoStyle}
            />
            <Button variant="secondary" size="sm" onPress={openAvatarPicker}>
              Change Avatar
            </Button>
          </div>

          {/* RIGHT — controls (scroll if tall). */}
          <div style={{ flex: 1, minWidth: 0, maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
            {/* Duration first — it directly shapes the script length. */}
            <div style={{ marginBottom: 24 }}>
              <Heading level={3} style={{ marginBottom: 10 }}>Duration</Heading>
              <div style={{ display: 'flex', gap: 8 }}>
                {DURATIONS.map((s) => (
                  <button key={s} type="button" style={pill(durationSec === s)} onClick={() => changeDuration(s)}>
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <Heading level={3} style={{ flex: 1 }}>Script</Heading>
                <Button variant="tertiary" size="sm" frontIcon={Refresh01} onPress={regenerate}>
                  Regenerate
                </Button>
              </div>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={7}
                style={{
                  width: '100%',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--dark-90)',
                  background: 'var(--light-100)',
                  border: '1px solid var(--dark-15)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: 150,
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <Heading level={3} style={{ marginBottom: 10 }}>Video style</Heading>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {VIDEO_STYLES.map((v) => (
                  <Card
                    key={v.id}
                    interactive
                    padding="md"
                    onClick={() => setVideoStyle(v.id)}
                    style={selectedCardStyle(videoStyle === v.id)}
                  >
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>{v.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.4, marginTop: 4 }}>{v.desc}</div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Captions: H3 left, style label + dropdown, toggle on the right. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Heading level={3} style={{ margin: 0 }}>Captions</Heading>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: captions ? 1 : 0.45, pointerEvents: captions ? 'auto' : 'none' }}>
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--dark-90)' }}>Caption style</span>
                <FieldDropdown align="right" menuWidth={200} trigger={<span>{captionStyle}</span>}>
                  {(closeMenu) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {CAPTION_STYLES.map((s) => (
                        <MenuItem
                          key={s}
                          onClick={() => {
                            setCaptionStyle(s);
                            closeMenu();
                          }}
                        >
                          {s}
                        </MenuItem>
                      ))}
                    </div>
                  )}
                </FieldDropdown>
              </div>
              <Toggle checked={captions} onChange={setCaptions} />
            </div>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={save}>
            Save
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function ContentTypeField({ value, onChange }: { value: ContentTypeId; onChange: (id: ContentTypeId) => void }) {
  const def = CONTENT_BY_ID[value];
  return (
    <FieldDropdown
      menuWidth={236}
      trigger={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <ContentGlyph def={def} size={16} />
          {def.label}
        </span>
      }
    >
      {(close) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {CONTENT_TYPES.map((c) => (
            <MenuItem
              key={c.id}
              onClick={() => {
                onChange(c.id);
                close();
              }}
            >
              <ContentGlyph def={c} size={18} />
              <span style={{ flex: 1 }}>{c.menuLabel}</span>
              {c.isNew && (
                <StatusPill tone="accent" size="sm">
                  New
                </StatusPill>
              )}
            </MenuItem>
          ))}
        </div>
      )}
    </FieldDropdown>
  );
}

function PostRow({
  draft,
  onChange,
  onRegenerate,
  onRemove,
  canRemove,
  dateOptions,
}: {
  draft: NewPostDraft;
  onChange: (next: NewPostDraft) => void;
  onRegenerate: () => void;
  onRemove: () => void;
  canRemove: boolean;
  dateOptions: string[];
}) {
  const { openModal } = useModals();
  const isAvatar = draft.contentType === 'ai-avatar';
  const openAvatarPicker = () =>
    openModal(AvatarPickerModal, { value: draft.refImage, onSelect: (img) => onChange({ ...draft, refImage: img }) });
  const openScriptSettings = () => openModal(ScriptSettingsModal, { draft, onChange });
  const iconBtn: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'var(--dark-60)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      {/* reference image */}
      {draft.refImage ? (
        <div
          onClick={isAvatar ? openAvatarPicker : undefined}
          role={isAvatar ? 'button' : undefined}
          aria-label={isAvatar ? 'Change avatar' : undefined}
          style={{
            position: 'relative',
            flexShrink: 0,
            width: 132,
            height: 132,
            borderRadius: 10,
            backgroundImage: `url('${draft.refImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden',
            cursor: isAvatar ? 'pointer' : 'default',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.55), transparent 55%)' }} />
          {isAvatar && (
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
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="16" viewBox="0 0 16 18" fill="none"><path d="M2 2L14 9L2 16V2Z" fill="#fff" /></svg>
              </span>
            </span>
          )}
          <span
            style={{
              position: 'absolute',
              left: 10,
              bottom: 9,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#fff',
              fontSize: 12,
            }}
          >
            {isAvatar ? 'Change avatar' : 'Reference image'}
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="#fff" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h4L19 9l-4-4L4 16v4z" />
              <path d="M14 6l4 4" />
            </svg>
          </span>
        </div>
      ) : (
        <button
          type="button"
          style={{
            flexShrink: 0,
            width: 132,
            height: 132,
            borderRadius: 10,
            border: '1px dashed var(--dark-15)',
            background: 'var(--dark-2)',
            color: 'var(--dark-60)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
          }}
        >
          <Plus02 size={20} color="var(--dark-40)" />
          Add image
        </button>
      )}

      {/* body */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>Topic:</span>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'transparent',
              border: 'none',
              color: 'var(--dark-60)',
              fontFamily: 'inherit',
              fontSize: 14,
              cursor: 'pointer',
              padding: '4px 4px',
            }}
          >
            <Plus size={16} color="var(--dark-60)" />
            Add Context
          </button>
          <button type="button" aria-label="Regenerate topic" style={iconBtn} onClick={onRegenerate}>
            <Refresh01 size={18} color="var(--dark-60)" />
          </button>
          <button
            type="button"
            aria-label="Remove post"
            style={{ ...iconBtn, opacity: canRemove ? 1 : 0.35, cursor: canRemove ? 'pointer' : 'not-allowed' }}
            onClick={() => canRemove && onRemove()}
          >
            <Trash2 size={18} color="var(--dark-60)" />
          </button>
        </div>

        <textarea
          rows={2}
          placeholder="Write a topic or prompt, or let AI suggest one…"
          value={draft.topic}
          onChange={(e) => onChange({ ...draft, topic: e.target.value })}
          style={{
            width: '100%',
            fontFamily: 'inherit',
            fontSize: 16,
            lineHeight: 1.5,
            color: 'var(--dark-90)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: 0,
          }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <ContentTypeField value={draft.contentType} onChange={(id) => onChange(applyContentType(draft, id))} />
          <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>Posting to</span>
          <FieldDropdown
            menuWidth={160}
            trigger={<span>{draft.accounts} Accounts</span>}
          >
            {(close) => (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {ACCOUNT_OPTIONS.map((n) => (
                  <MenuItem
                    key={n}
                    onClick={() => {
                      onChange({ ...draft, accounts: n });
                      close();
                    }}
                  >
                    {n} {n === 1 ? 'Account' : 'Accounts'}
                  </MenuItem>
                ))}
              </div>
            )}
          </FieldDropdown>
          <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>on</span>
          <FieldDropdown
            align="right"
            menuWidth={200}
            trigger={<span>{draft.date}</span>}
          >
            {(close) => (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {dateOptions.map((d) => (
                  <MenuItem
                    key={d}
                    onClick={() => {
                      onChange({ ...draft, date: d });
                      close();
                    }}
                  >
                    {d}
                  </MenuItem>
                ))}
              </div>
            )}
          </FieldDropdown>
          {isAvatar && (
            <button
              type="button"
              onClick={openScriptSettings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: 'var(--light-100)',
                border: '1px solid var(--dark-15)',
                borderRadius: 8,
                padding: '6px 10px',
                fontFamily: 'inherit',
                fontSize: 14,
                color: 'var(--dark-90)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="var(--purple)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="M10 9l5 3-5 3V9z" fill="var(--purple)" stroke="none" />
              </svg>
              Script &amp; Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NewPostModal({
  close,
  onCreate,
  campaignLabel = 'Tips & Tricks · May 4 – May 31',
  campaignOptions = [
    'Cabinet Refresh May · May 4 – May 31',
    'Color Trends 2026 · May 1 – Jun 15',
    'HOA Round Rock · Apr 20 – Jun 30',
    'Crew Spotlights · Ongoing',
  ],
  dateOptions = DEFAULT_DATE_OPTIONS,
}: StackModalProps & {
  onCreate: (posts: NewPostDraft[]) => void;
  campaignLabel?: string;
  campaignOptions?: string[];
  dateOptions?: string[];
}) {
  const firstDate = dateOptions[0] ?? DEFAULT_DATE_OPTIONS[0];
  const [campaign, setCampaign] = useState(campaignLabel);
  const [posts, setPosts] = useState<NewPostDraft[]>(() => [makeAiDraft(0, firstDate)]);

  const updatePost = (id: string, next: NewPostDraft) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? next : p)));
  const removePost = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));
  const addAiPost = () => setPosts((prev) => [...prev, makeAiDraft(prev.length, firstDate)]);
  const addBlankPost = () => setPosts((prev) => [...prev, makeBlankDraft(firstDate)]);
  const regenerate = (id: string, index: number) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...makeAiDraft(index + 1, p.date), id: p.id, contentType: p.contentType } : p)));

  const count = posts.length;

  const campaignTrigger = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>Campaign</span>
      <FieldDropdown
        align="right"
        menuWidth={240}
        trigger={
          <span
            style={{
              display: 'block',
              fontWeight: 500,
              maxWidth: 220,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {campaign}
          </span>
        }
      >
        {(close) => (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[campaignLabel, ...campaignOptions.filter((c) => c !== campaignLabel)].map((c) => (
              <MenuItem
                key={c}
                onClick={() => {
                  setCampaign(c);
                  close();
                }}
              >
                {c}
              </MenuItem>
            ))}
          </div>
        )}
      </FieldDropdown>
    </span>
  );

  return (
    <Modal.Root size="lg" aria-labelledby="new-post-title" data-testid="new-post-modal">
      <Modal.Header
        title="New Post"
        id="new-post-title"
        onClose={close}
        compact
        actions={campaignTrigger}
        subHeader={
          <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--dark-60)', lineHeight: 1.5 }}>
            Create one or more posts from scratch or with AI. AI generated posts will auto suggest a topic from your campaign and select a reference image.
          </span>
        }
      />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {posts.map((p, i) => (
            <div
              key={p.id}
              style={{ paddingTop: i === 0 ? 0 : 22, borderTop: i === 0 ? 'none' : '1px solid var(--dark-8)' }}
            >
              <PostRow
                draft={p}
                onChange={(next) => updatePost(p.id, next)}
                onRegenerate={() => regenerate(p.id, i)}
                onRemove={() => removePost(p.id)}
                canRemove={count > 1}
                dateOptions={dateOptions}
              />
            </div>
          ))}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <span style={{ display: 'inline-flex', gap: 8 }}>
            <Button variant="secondary" size="md" frontIcon={Plus} onPress={addAiPost}>
              New Post
            </Button>
            <Button variant="ghost" size="md" frontIcon={FilePlus1} onPress={addBlankPost}>
              Blank Post
            </Button>
          </span>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => onCreate(posts)}>
            Create {count} {count === 1 ? 'Post' : 'Posts'}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
