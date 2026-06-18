import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button, Heading, IconButton, Modal, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Card, StatusPill, TabChip, Toggle } from '@/staging';
import { Input, Textarea } from './_ui';
import Plus from '@/icons/20/Plus';
import ChevronDown from '@/icons/16/ChevronDown';
import ChevronRight from '@/icons/24/ChevronRight';
import ArrowRefresh2 from '@/icons/20/ArrowRefresh2';
import ArrowDown from '@/icons/20/ArrowDown';
import XSquareContained from '@/icons/24/XSquareContained';
import Trash2 from '@/icons/20/Trash2';
import FilePlus1 from '@/icons/20/FilePlus1';
import CreditsSparkle from '@/icons/20/CreditsSparkle';
import Play3 from '@/icons/20/Play3';
import Pause from '@/icons/20/Pause';
import Edit3 from '@/icons/20/Edit3';
import Settings from '@/icons/20/Settings';
import InformationCircleSmall from '@/icons/16/InformationCircleSmall';
import UserProfileSquare from '@/icons/20/UserProfileSquare';
import VideoOn from '@/icons/20/VideoOn';
import Iphone02 from '@/icons/16/Iphone02';
import Note2 from '@/icons/20/Note2';
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
    color: '#6A00FF',
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
    color: '#4F62F8',
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
    color: '#00AAFF',
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

// Avatar-driven video formats — all share the Script & Settings + regenerate
// experience (avatar, script, captions) and the calendar content preview.
const VIDEO_TYPES = new Set<ContentTypeId>(['ai-avatar', 'feed-video', 'short-video']);
const isVideoType = (id: ContentTypeId) => VIDEO_TYPES.has(id);

function ContentGlyph({ def, size = 18 }: { def: ContentTypeDef; size?: number }) {
  // "Still Image" ships as a fill-based brand asset, so render the dedicated
  // component instead of the stroke glyph. All other types stay stroke-based.
  if (def.id === 'still') {
    return <StillImageIcon size={size} color={def.color} />;
  }
  if (def.id === 'ai-avatar') {
    return <UserProfileSquare size={size} color={def.color} />;
  }
  if (def.id === 'feed-video') {
    return <VideoOn size={size} color={def.color} />;
  }
  if (def.id === 'short-video') {
    return <Iphone02 size={size} color={def.color} />;
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
  fullWidth = false,
  triggerStyle,
  children,
}: {
  trigger: ReactNode;
  align?: 'left' | 'right';
  menuWidth?: number;
  /** Stretch the trigger to fill its container; menu matches it unless menuWidth is set. */
  fullWidth?: boolean;
  /** Extra style merged into the trigger button (e.g. custom padding). */
  triggerStyle?: React.CSSProperties;
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
      const w = menuWidth == null && fullWidth ? b.width : width;
      let left = align === 'right' ? b.right - w : b.left;
      left = Math.max(margin, Math.min(left, vw - w - margin));
      setStyle({ position: 'fixed', top, left, width: w, maxHeight, overflowY: 'auto', visibility: 'visible' });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, align, width, fullWidth, menuWidth]);

  return (
    <span style={{ display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined }}>
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
          justifyContent: fullWidth ? 'space-between' : undefined,
          width: fullWidth ? '100%' : undefined,
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
          ...triggerStyle,
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

// ─── DATE PICKER ───────────────────────────────────────────────────

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_OPTIONS = ['9:00AM', '10:00AM', '11:00AM', '12:30PM', '1:00PM', '2:00PM', '3:45PM', '5:00PM'];
// "Today" is fixed for the prototype so the calendar is deterministic.
const TODAY_YEAR = 2026;
const TODAY_MONTH = 5; // June (0-indexed)
const TODAY_DAY = 17;

const formatPostDate = (d: Date, time: string) => `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${time.toLowerCase()}`;

// Parse a "Jun 18, 12:30pm" display string back into calendar state.
function parsePostDate(s: string): { month: number; day: number; time: string } {
  const [datePart = '', timePart = ''] = s.split(', ');
  const [mon = '', dayStr = ''] = datePart.split(' ');
  const month = MONTH_SHORT.indexOf(mon);
  const day = parseInt(dayStr, 10);
  const time = timePart.toUpperCase();
  return {
    month: month >= 0 ? month : TODAY_MONTH,
    day: Number.isFinite(day) ? day : 18,
    time: TIME_OPTIONS.includes(time) ? time : '12:30PM',
  };
}

function DatePicker({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const initial = parsePostDate(value);
  const [viewYear, setViewYear] = useState(TODAY_YEAR);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selected, setSelected] = useState<Date>(new Date(TODAY_YEAR, initial.month, initial.day));
  const [time, setTime] = useState(initial.time);

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: prevMonthDays - firstDow + 1 + i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  for (let d = 1; cells.length < totalCells; d++) cells.push({ day: d, current: false });

  const step = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const pickDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    setSelected(d);
    onChange(formatPostDate(d, time));
  };
  const pickTime = (t: string) => {
    setTime(t);
    onChange(formatPostDate(selected, t));
  };

  const dayBtn = (cell: { day: number; current: boolean }, idx: number) => {
    const isSelected = cell.current && cell.day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();
    const isToday = cell.current && cell.day === TODAY_DAY && viewMonth === TODAY_MONTH && viewYear === TODAY_YEAR;
    return (
      <button
        key={idx}
        type="button"
        disabled={!cell.current}
        onClick={() => cell.current && pickDay(cell.day)}
        style={{
          width: 34,
          height: 34,
          margin: '0 auto',
          borderRadius: 99,
          border: 'none',
          fontFamily: 'inherit',
          fontSize: 14,
          cursor: cell.current ? 'pointer' : 'default',
          background: isSelected ? 'var(--dark-90)' : isToday ? 'var(--dark-8)' : 'transparent',
          color: isSelected ? 'var(--light-100)' : cell.current ? 'var(--dark-90)' : 'var(--dark-40)',
          fontWeight: isSelected ? 500 : 400,
        }}
      >
        {cell.day}
      </button>
    );
  };

  return (
    <FieldDropdown
      align="left"
      menuWidth={300}
      trigger={<span>{value}</span>}
    >
      {() => (
        <div style={{ padding: 8 }}>
          {/* month header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 12px' }}>
            <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark-90)' }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <span style={{ display: 'inline-flex', gap: 4 }}>
              <button type="button" aria-label="Previous month" onClick={() => step(-1)} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6, color: 'var(--dark-60)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button type="button" aria-label="Next month" onClick={() => step(1)} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6, color: 'var(--dark-60)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </span>
          </div>
          {/* weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DOW_LABELS.map((d, i) => (
              <span key={i} style={{ textAlign: 'center', fontSize: 13, color: 'var(--dark-60)', padding: '4px 0' }}>{d}</span>
            ))}
          </div>
          {/* day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 }}>
            {cells.map(dayBtn)}
          </div>
          {/* footer */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: 16, paddingTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>Selected date</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>{WEEKDAY_SHORT[selected.getDay()]}, {MONTH_SHORT[selected.getMonth()]} {selected.getDate()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>Time of day</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--dark-15)', borderRadius: 8, padding: '7px 10px' }}>
                <select
                  value={time}
                  onChange={(e) => pickTime(e.target.value)}
                  style={{ appearance: 'none', WebkitAppearance: 'none', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', outline: 'none', cursor: 'pointer' }}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>EDT</span>
                <ChevronDown size={16} color="var(--dark-60)" />
              </span>
            </div>
          </div>
        </div>
      )}
    </FieldDropdown>
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
  angle?: string;
  // Set only when the angle is "Product reaction".
  productImage?: string | null;
  // True for posts started blank (bring-your-own media) — no topic regenerate.
  blank?: boolean;
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
const DEFAULT_DATE_OPTIONS = ['Jun 18, 12:30pm', 'Jun 19, 9:00am', 'Jun 20, 3:45pm', 'Jun 23, 10:00am'];

function makeAiDraft(seedIndex: number, date: string): NewPostDraft {
  const seed = AI_SEEDS[seedIndex % AI_SEEDS.length];
  return { id: nextId(), contentType: 'still', topic: seed.topic, refImage: seed.refImage, accounts: 5, date };
}

function makeBlankDraft(date: string): NewPostDraft {
  return { id: nextId(), contentType: 'still', topic: '', refImage: null, accounts: 5, date, blank: true };
}

// An AI Avatar Video draft pre-filled with sensible defaults. Used by the
// calendar's "Regenerate Video" flow to seed the Script & Settings modal from
// an existing post. Overrides (topic, date, refImage…) come in via `partial`.
export function makeAvatarDraft(partial: Partial<NewPostDraft> = {}): NewPostDraft {
  const contentType = partial.contentType ?? 'ai-avatar';
  return {
    id: nextId(),
    contentType,
    topic: AVATAR_TOPIC,
    // AI Avatar Video shows a presenter; Feed/Short video use a non-person scene.
    refImage: contentType === 'ai-avatar' ? AVATAR_IMAGE : REFERENCE_IMAGE,
    accounts: 5,
    date: DEFAULT_DATE_OPTIONS[0],
    script: SCRIPTS_BY_DURATION[15][0],
    durationSec: 30,
    captions: true,
    captionStyle: CAPTION_STYLES[0],
    angle: 'recommendation',
    ...partial,
  };
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

// Look up an avatar's display name from its image URL (covers both libraries).
const AVATAR_NAME_BY_IMG: Record<string, string> = Object.fromEntries(
  [...MY_AVATARS, ...STOCK_AVATARS].map((a) => [a.img, a.name]),
);

const AVATAR_IMAGE = MY_AVATARS[0].img;
// Default reference image for Feed/Short video — a non-person scene.
const REFERENCE_IMAGE = AI_SEEDS[0].refImage;

// Derive a display file name from an image URL (last path segment + .jpg).
const imageFileName = (url: string): string => {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean).pop() || 'image';
    return seg.includes('.') ? seg : `${seg}.jpg`;
  } catch {
    return 'reference.jpg';
  }
};
const AVATAR_TOPIC =
  'When your coffee choice needs to match the moment, single origins make the decision feel personal.';

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
};

// The variant pool the regenerate flow cycles through. Short (≤160-char)
// scripts so they fit the generated-script character limit.
const SCRIPT_VARIANTS = SCRIPTS_BY_DURATION[15];

// Caption render styles — each backed by an uploaded preview PNG served from
// public/caption_style/. Names are descriptive of the look. "No caption" = off.
const CAPTION_STYLE_OPTIONS: { name: string; img: string }[] = [
  { name: 'Slate', img: '/caption_style/business.png' },
  { name: 'Minimal', img: '/caption_style/business2.png' },
  { name: 'Outline', img: '/caption_style/business3.png' },
  { name: 'Clean', img: '/caption_style/business4.png' },
  { name: 'Retro', img: '/caption_style/retro1.png' },
  { name: 'Marquee', img: '/caption_style/retro2.png' },
  { name: 'Blush', img: '/caption_style/social1.png' },
  { name: 'Bubble', img: '/caption_style/social2.png' },
  { name: 'Hype', img: '/caption_style/social3.png' },
  { name: 'Punch', img: '/caption_style/social4.png' },
  { name: 'Mint', img: '/caption_style/social5.png' },
  { name: 'Violet', img: '/caption_style/social6.png' },
  { name: 'Reveal', img: '/caption_style/social7.png' },
  { name: 'Lime', img: '/caption_style/social8.png' },
  { name: 'Pop', img: '/caption_style/social9.png' },
  { name: 'Pebble', img: '/caption_style/social10.png' },
  { name: 'Spotlight', img: '/caption_style/social11.png' },
  { name: 'Headline', img: '/caption_style/social12.png' },
  { name: 'Highlighter', img: '/caption_style/social13.png' },
  { name: 'Tag', img: '/caption_style/social14.png' },
  { name: 'Fade', img: '/caption_style/social15.png' },
  { name: 'Glow', img: '/caption_style/social16.png' },
  { name: 'Sticker', img: '/caption_style/social17.png' },
  { name: 'Arcade', img: '/caption_style/social18.png' },
];
const CAPTION_STYLES = CAPTION_STYLE_OPTIONS.map((o) => o.name);
// Matches the neutral gray background baked into the caption preview PNGs, so
// `object-fit: contain` letterboxing blends seamlessly.
const CAPTION_BG = 'rgb(174, 175, 178)';
const CAPTION_IMG_BY_NAME = Object.fromEntries(CAPTION_STYLE_OPTIONS.map((o) => [o.name, o.img]));
// Resolve against Vite's BASE_URL so the previews work under a deployed
// sub-path (the prototypes site is served under a base, not the domain root).
const captionImg = (name: string): string | undefined => {
  const path = CAPTION_IMG_BY_NAME[name];
  return path ? import.meta.env.BASE_URL.replace(/\/$/, '') + path : undefined;
};

// Fixed script length cap (duration is no longer a setting).
const SCRIPT_MAX_CHARS = 160;

// Switching the content type also swaps the reference image + topic so an
// AI Avatar Video shows a presenter and a video-style script rather than a
// still-life, and reverts to a still seed when switched back.
// Credit cost per content type — avatar video matches the 15 shown in the
// regenerate CTA; video formats cost more than static posts.
const CREDIT_COST_BY_TYPE: Record<ContentTypeId, number> = {
  still: 2,
  carousel: 4,
  'feed-video': 10,
  'ai-avatar': 15,
  'short-video': 10,
  story: 8,
  blog: 5,
  email: 2,
};
const postCredits = (p: NewPostDraft) => CREDIT_COST_BY_TYPE[p.contentType] ?? 0;

function applyContentType(draft: NewPostDraft, id: ContentTypeId): NewPostDraft {
  if (isVideoType(id)) return { ...draft, contentType: id, refImage: id === 'ai-avatar' ? AVATAR_IMAGE : REFERENCE_IMAGE, topic: AVATAR_TOPIC };
  if (isVideoType(draft.contentType)) return { ...draft, contentType: id, refImage: AI_SEEDS[0].refImage, topic: AI_SEEDS[0].topic };
  return { ...draft, contentType: id };
}

// Video styles for the AI Avatar Video.
const VIDEO_STYLES = [
  { id: 'talking-head', name: 'Talking Head', desc: 'Avatar on a clean branded background' },
  { id: 'b-roll', name: 'B-Roll Cutaways', desc: 'Avatar with footage overlays' },
  { id: 'split-screen', name: 'Split Screen', desc: 'Avatar beside text or visuals' },
];

// Script angle — the framing the avatar takes. "Product reaction" reacts to a
// specific product, so it requires an attached product image.
const ANGLES = [
  { id: 'testimonial', name: 'Testimonial', desc: "Avatar shares a customer's success story", needsProduct: false },
  { id: 'recommendation', name: 'Recommendation', desc: 'Avatar recommends your product or service', needsProduct: false },
  { id: 'product-reaction', name: 'Product reaction', desc: 'Avatar reacts to a product you attach', needsProduct: true },
];
const ANGLE_BY_ID = Object.fromEntries(ANGLES.map((a) => [a.id, a])) as Record<string, (typeof ANGLES)[number]>;

// Stock product shots for the "Product reaction" attach picker.
const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=70',
  'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=70',
  'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=70',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&q=70',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=70',
  'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=70',
];

// Shared selection ring used by the avatar + video-style cards. A single
// 1.5px border keeps the stroke even all the way around (no doubled-up edges).
const selectedCardStyle = (selected: boolean): React.CSSProperties =>
  selected ? { border: '1.5px solid var(--dark-90)' } : {};

export function AvatarCard({
  img,
  name,
  desc,
  selected = false,
  onClick,
  playing = false,
  onPlay,
}: {
  img: string;
  name: string;
  desc?: string;
  selected?: boolean;
  onClick: () => void;
  playing?: boolean;
  onPlay?: () => void;
}) {
  return (
    <Card interactive padding="none" onClick={onClick} style={{ overflow: 'hidden', ...selectedCardStyle(selected) }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', backgroundImage: `url('${img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {selected && (
          <span style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 99, background: 'var(--dark-90)', border: '1.5px solid var(--light-100)', boxShadow: '0 0 0 1px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        )}
        {onPlay && (
          <button
            type="button"
            aria-label={playing ? `Pause ${name}'s voice` : `Play ${name}'s voice`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'var(--dark-90)',
            }}
          >
            {playing ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1.2" />
                <rect x="14" y="5" width="4" height="14" rx="1.2" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
              </svg>
            )}
          </button>
        )}
      </div>
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
  const [playing, setPlaying] = useState<string | null>(null);
  const [draftImg, setDraftImg] = useState<string | null>(value);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const save = () => {
    if (draftImg) onSelect(draftImg);
    close();
  };
  const togglePlay = (img: string) => {
    if (playTimer.current) clearTimeout(playTimer.current);
    setPlaying((cur) => {
      if (cur === img) return null;
      playTimer.current = setTimeout(() => setPlaying(null), 2200);
      return img;
    });
  };
  return (
    <Modal.Root size="lg" aria-labelledby="avatar-picker-title" data-testid="avatar-picker-modal">
      <Modal.Header title="Choose an avatar" id="avatar-picker-title" onClose={close} compact />
      <Modal.Content compact>
        {/* Tab chips below the heading. */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          <TabChip selected={tab === 'mine'} onSelect={() => setTab('mine')}>
            My Avatars
          </TabChip>
          <TabChip selected={tab === 'stock'} onSelect={() => setTab('stock')}>
            Stock Avatars
          </TabChip>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxHeight: 420, overflowY: 'auto' }}>
          {(tab === 'mine' ? MY_AVATARS : STOCK_AVATARS).map((a) => (
            <AvatarCard
              key={a.img}
              img={a.img}
              name={a.name}
              desc={'desc' in a ? a.desc : undefined}
              selected={draftImg === a.img}
              onClick={() => setDraftImg(a.img)}
              playing={playing === a.img}
              onPlay={() => togglePlay(a.img)}
            />
          ))}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Close
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={save}>
            Save changes
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── SELECT SOURCE MODAL ───────────────────────────────────────────

// Source actions (Upload / Generate with AI / Add from Link) — visual in the
// prototype. Inline SVGs keep them self-contained.
function SourceActionButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        border: '1px solid var(--dark-15)',
        background: 'var(--light-100)',
        borderRadius: 8,
        padding: '7px 12px',
        fontFamily: 'inherit',
        fontSize: 14,
        color: 'var(--dark-90)',
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// A horizontal, scrollable row of image tiles.
function SourceRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>{children}</div>
  );
}

function SourceTile({ img, selected, onClick }: { img: string; selected: boolean; onClick: () => void }) {
  return (
    <Card interactive padding="none" onClick={onClick} style={{ flexShrink: 0, overflow: 'hidden', ...selectedCardStyle(selected) }}>
      <div style={{ width: 150, aspectRatio: '4 / 3', backgroundImage: `url('${img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    </Card>
  );
}

function SectionHeader({ title, right }: { title: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>{title}</span>
      {right}
    </div>
  );
}

function SelectSourceModal({
  close,
  value,
  onSelect,
}: StackModalProps & {
  value: string | null;
  onSelect: (img: string) => void;
}) {
  const pick = (img: string) => {
    onSelect(img);
    close();
  };
  const aiTiles = AI_SEEDS.map((s) => s.refImage);
  const brandTiles = PRODUCT_IMAGES;
  const uploadTiles = [MY_AVATARS[0].img];
  const seeAll = (
    <button type="button" style={{ border: 'none', background: 'transparent', padding: 0, fontFamily: 'inherit', fontSize: 13, color: 'var(--dark-60)', cursor: 'pointer' }}>
      See All
    </button>
  );

  return (
    <Modal.Root size="lg" aria-labelledby="select-source-title" data-testid="select-source-modal">
      <Modal.Header title="Select Image" id="select-source-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        {/* Source actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <SourceActionButton
            label="Upload"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 16V5M7 10l5-5 5 5M5 19h14" stroke="var(--dark-60)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
          <SourceActionButton label="Generate with AI" icon={<CreditsSparkle size={16} />} />
          <SourceActionButton
            label="Add from Link"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" stroke="var(--dark-60)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
        </div>

        {/* Generate with AI */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Generate with AI"
            right={<button type="button" style={{ border: 'none', background: 'transparent', padding: 0, fontFamily: 'inherit', fontSize: 13, color: 'var(--dark-60)', cursor: 'pointer' }}>Generate your own</button>}
          />
          <SourceRow>
            <button
              type="button"
              style={{
                flexShrink: 0,
                width: 150,
                aspectRatio: '4 / 3',
                border: '1px solid var(--dark-8)',
                borderRadius: 8,
                background: 'var(--dark-4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--dark-90)',
                cursor: 'pointer',
              }}
            >
              <CreditsSparkle size={18} />
              Create your own
            </button>
            {aiTiles.map((img) => (
              <SourceTile key={img} img={img} selected={value === img} onClick={() => pick(img)} />
            ))}
          </SourceRow>
        </div>

        {/* From Your Brand Kit */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                From Your Brand Kit
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 400, color: 'var(--dark-60)' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: 'var(--dark-90)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>B</span>
                  Craft Coffee Advocate
                  <ChevronDown size={14} />
                </span>
              </span>
            }
            right={seeAll}
          />
          <SourceRow>
            {brandTiles.map((img) => (
              <SourceTile key={img} img={img} selected={value === img} onClick={() => pick(img)} />
            ))}
          </SourceRow>
        </div>

        {/* Uploads */}
        <div>
          <SectionHeader title="Uploads" right={seeAll} />
          <SourceRow>
            {uploadTiles.map((img) => (
              <SourceTile key={img} img={img} selected={value === img} onClick={() => pick(img)} />
            ))}
          </SourceRow>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

// ─── SCRIPT & SETTINGS MODAL ───────────────────────────────────────

// Renders a caption sample in one of the supported styles. Reused by the phone
// preview and the Step 2 caption-style preview cards so they always match.
// 'Bold pop' = white text in a dark pill, 'Clean' = plain white text,
// 'Highlight' = last word on a brand-yellow highlight.
function CaptionSample({ text, style }: { text: string; style: string }) {
  if (style === 'Highlight') {
    const words = text.split(' ');
    const last = words.pop() ?? '';
    return (
      <span style={{ fontWeight: 700, color: 'var(--light-100)', lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.4)', letterSpacing: '0.01em' }}>
        {words.length > 0 && `${words.join(' ')} `}
        <span style={{ background: 'var(--brand)', color: 'var(--dark-90)', borderRadius: 4, padding: '0 4px' }}>{last}</span>
      </span>
    );
  }
  if (style === 'Clean') {
    return <span style={{ fontWeight: 500, color: 'var(--light-100)', lineHeight: 1.3, textShadow: '0 1px 5px rgba(0,0,0,0.55)' }}>{text}</span>;
  }
  if (style === 'Whisper') {
    // Whole line in the brand accent, bold.
    return <span style={{ fontWeight: 700, color: 'var(--brand)', lineHeight: 1.35, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{text}</span>;
  }
  if (style === 'Terminal') {
    // Monospace green with a block cursor.
    return (
      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.9em', fontWeight: 500, color: '#3ddc84', lineHeight: 1.4, letterSpacing: '0.02em' }}>
        {text}
        <span style={{ display: 'inline-block', width: '0.5em', height: '1em', background: '#3ddc84', marginLeft: 2, verticalAlign: '-0.12em' }} />
      </span>
    );
  }
  // Pill variants — white text on a dark pill, varied by weight/shape/case.
  const pill: Record<string, { weight: number; radius: number; lower?: boolean }> = {
    'Bold pop': { weight: 700, radius: 6 },
    Glide: { weight: 600, radius: 99 },
    Glide2: { weight: 600, radius: 99, lower: true },
    Fusion: { weight: 800, radius: 4 },
  };
  const p = pill[style] ?? pill['Bold pop'];
  return (
    <span style={{ fontWeight: p.weight, color: 'var(--light-100)', lineHeight: 1.45, background: 'rgba(0,0,0,0.72)', borderRadius: p.radius, padding: '3px 8px', letterSpacing: '0.01em', textTransform: p.lower ? 'lowercase' : 'none', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>{text}</span>
  );
}

// A floating 9:16 phone mockup that previews the avatar video. The avatar image
// fills the screen, a play badge reads it as video, and an optional caption bar
// near the bottom reflects the selected caption style.
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
        left: 14,
        right: 14,
        bottom: 18,
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: 13,
        pointerEvents: 'none',
      }}
    >
      <CaptionSample text="Most paint jobs fail at prep." style={captionStyle} />
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
        width: 188,
        aspectRatio: '9 / 16',
        borderRadius: 26,
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

// Reusable gray music thumbnail (note glyph + "Music"), matching the
// stock-audio picker tiles.
function MusicThumb({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 8, flexShrink: 0, background: 'var(--dark-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      <Note2 size={Math.round(size * 0.3)} color="var(--dark-40)" />
      <span style={{ fontSize: 10, color: 'var(--dark-40)' }}>Music</span>
    </div>
  );
}

// Stock background-music library (mocked) for the audio picker.
const STOCK_AUDIO: { name: string; duration: string }[] = [
  { name: 'Upbeat Indie Instrumental', duration: '1:28' },
  { name: 'Inspiring Mission', duration: '2:58' },
  { name: 'Road To Utah (Instrumental)', duration: '3:00' },
  { name: 'Island Melodies', duration: '2:20' },
  { name: 'Electrogaze', duration: '2:24' },
  { name: 'Soul Slippin (No Vocals)', duration: '2:27' },
  { name: 'Old Time Ads (Instrumental)', duration: '2:44' },
  { name: 'Lofi Chill Funk (No Vocal)', duration: '3:00' },
  { name: 'Galactic Sage (Only Drums)', duration: '2:03' },
  { name: 'Cinematic Build', duration: '2:13' },
  { name: 'Acoustic Morning', duration: '3:05' },
  { name: 'Warm Sunrise', duration: '2:08' },
];

// A stock-audio tile. On hover the thumbnail reveals a play/pause control and
// the duration is replaced by a "Select" CTA.
function StockAudioTile({ track, onSelect }: { track: { name: string; duration: string }; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  const [playing, setPlaying] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPlaying(false); }}
      style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--dark-8)', borderRadius: 10, background: 'var(--light-100)', padding: 10 }}
    >
      <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--dark-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        {hover ? (
          <button
            type="button"
            aria-label={playing ? `Pause ${track.name}` : `Play ${track.name}`}
            onClick={() => setPlaying((p) => !p)}
            style={{ position: 'absolute', inset: 0, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
          >
            <span style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {playing ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" /></svg>
              )}
            </span>
          </button>
        ) : (
          <>
            <Note2 size={16} color="var(--dark-40)" />
            <span style={{ fontSize: 10, color: 'var(--dark-40)' }}>Music</span>
          </>
        )}
      </div>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</span>
        {hover ? (
          <Button variant="secondary" size="sm" onPress={onSelect}>Select</Button>
        ) : (
          <span style={{ display: 'block', fontSize: 12, color: 'var(--dark-60)' }}>{track.duration}</span>
        )}
      </span>
    </div>
  );
}

// Audio picker — Brand Kit upload + stock library. (The narration-script field
// from the full design is intentionally omitted here.)
function SelectAudioModal({
  close,
  onSelect,
}: StackModalProps & { value: string; onSelect: (name: string) => void }) {
  return (
    <Modal.Root size="lg" aria-labelledby="select-audio-title" data-testid="select-audio-modal">
      <Modal.Header title="Select audio" id="select-audio-title" onClose={close} compact />
      <Modal.Content compact>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 12 }}>From Brand Kit</div>
        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--dark-15)', background: 'var(--light-100)', borderRadius: 8, padding: '8px 14px', fontFamily: 'inherit', fontSize: 14, color: 'var(--dark-90)', cursor: 'pointer', marginBottom: 24 }}>
          <svg width={18} height={18} viewBox="0 0 20 20" fill="none"><path d="M13.2357 14.3751H14.375C16.3084 14.3751 17.6563 12.9838 17.6563 11.25C17.6563 9.84758 16.7661 8.4856 15.4516 8.16777C15.4067 7.01874 14.8967 6.1607 14.1926 5.70813C13.5021 5.26425 12.6494 5.21033 11.8969 5.54942C11.2936 4.38376 10.1044 3.43774 8.54145 3.43774C6.21651 3.43774 4.5779 5.61334 4.69639 7.83225C3.34714 8.19246 2.34375 9.50049 2.34375 11.0548C2.34375 12.8863 3.73334 14.3751 5.44268 14.3751H6.71875" stroke="var(--dark-90)" strokeWidth="1.4" strokeLinecap="round" /><path d="M10 8.90649V16.5627M10 8.90649L7.26562 11.6409M10 8.90649L12.7344 11.6409" stroke="var(--dark-90)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Upload Audio
        </button>

        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 12 }}>Stock audio</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--dark-8)', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--dark-40)" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <span style={{ fontSize: 14, color: 'var(--dark-40)' }}>Search for audio…</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {STOCK_AUDIO.map((t) => (
            <StockAudioTile key={t.name} track={t} onSelect={() => { onSelect(t.name); close(); }} />
          ))}
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

// Caption-style picker — preview cards (incl. "No caption"), opened from the
// caption box's Change button.
export function CaptionStylePickerModal({
  close,
  captions,
  captionStyle,
  onSelect,
}: StackModalProps & {
  captions: boolean;
  captionStyle: string;
  onSelect: (next: { captions: boolean; style: string }) => void;
}) {
  const [draftOn, setDraftOn] = useState(captions);
  const [draftStyle, setDraftStyle] = useState(captionStyle);
  const save = () => {
    onSelect(draftOn ? { captions: true, style: draftStyle } : { captions: false, style: '' });
    close();
  };
  return (
    <Modal.Root size="md" aria-labelledby="caption-style-title" data-testid="caption-style-picker">
      <Modal.Header title="Caption style" id="caption-style-title" onClose={close} compact />
      <Modal.Content compact>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[{ label: 'No caption', off: true }, ...CAPTION_STYLES.map((s) => ({ label: s, off: false }))].map((opt) => {
            const selected = opt.off ? !draftOn : (draftOn && draftStyle === opt.label);
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => (opt.off ? setDraftOn(false) : (setDraftOn(true), setDraftStyle(opt.label)))}
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '5 / 4', borderRadius: 10, overflow: 'hidden', background: opt.off ? 'var(--dark-2)' : CAPTION_BG, border: selected ? '2px solid var(--dark-90)' : opt.off ? '1.5px solid var(--dark-4)' : '2px solid var(--dark-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                  {opt.off ? (
                    <XSquareContained color="var(--dark-40)" size={22} />
                  ) : (
                    <img src={captionImg(opt.label)} alt={`${opt.label} caption style`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  )}
                  {selected && (
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 99, background: 'var(--dark-90)', border: '1.5px solid var(--light-100)', boxShadow: '0 0 0 1px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--dark-90)', textAlign: 'center' }}>{opt.label}</div>
              </button>
            );
          })}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Close
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={save}>
            Save changes
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

export function ScriptSettingsModal({
  close,
  draft,
  onChange,
  mode = 'create',
}: StackModalProps & {
  draft: NewPostDraft;
  onChange: (next: NewPostDraft) => void;
  // 'create' opens from the New Post flow (CTA = Save). 'regenerate' opens from
  // a post's "Regenerate Video" action (CTA = Regenerate AI Avatar Video + credits).
  mode?: 'create' | 'regenerate';
}) {
  const { openModal } = useModals();
  const [scriptIdx, setScriptIdx] = useState(0);
  const [topic, setTopic] = useState(draft.topic ?? '');
  const [script, setScript] = useState(draft.script ?? SCRIPT_VARIANTS[0]);
  const [captions, setCaptions] = useState(draft.captions ?? true);
  const [captionStyle, setCaptionStyle] = useState(draft.captionStyle ?? CAPTION_STYLES[0]);
  // Video style is no longer user-configurable here; it stays at the default.
  const videoStyle = draft.videoStyle ?? VIDEO_STYLES[0].id;
  const [angle, setAngle] = useState(draft.angle ?? 'recommendation');
  // Local copy of the avatar image so a stacked picker updates the preview live
  // (the `draft` prop is a snapshot and won't re-render this modal on its own).
  const [refImage, setRefImage] = useState(draft.refImage);
  // Product image — only asked for when the angle is "Product reaction".
  const [productImage, setProductImage] = useState<string | null>(draft.productImage ?? null);
  // Script regeneration: a brief loading state, then an "updated" flash.
  const [regenerating, setRegenerating] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  // Snapshot of the script before the last regenerate, to support undo.
  const [prevScript, setPrevScript] = useState<{ text: string; idx: number } | null>(null);
  // Mocked avatar voice playback state.
  const [voicePlaying, setVoicePlaying] = useState(false);
  // Feed/Short video only: narration (AI voiceover) is off by default and gates
  // the generated script; background music picked from a short list.
  const [narration, setNarration] = useState(false);
  const [music, setMusic] = useState(STOCK_AUDIO[0].name);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Simulated rewrite: show the skeleton, swap the copy (saving the prior one for
  // undo), then flash "updated" for a couple of seconds. Drives every trigger.
  const runRewrite = (nextScript: string, nextIdx: number) => {
    const before = { text: script, idx: scriptIdx };
    setRegenerating(true);
    setJustUpdated(false);
    const t1 = window.setTimeout(() => {
      setPrevScript(before);
      setScript(nextScript);
      setScriptIdx(nextIdx);
      setRegenerating(false);
      setJustUpdated(true);
      const t2 = window.setTimeout(() => setJustUpdated(false), 2500);
      timers.current.push(t2);
    }, 1200);
    timers.current.push(t1);
  };
  // Cycle to the next variant (topic regen / angle change).
  const regenerateScript = () => {
    const next = (scriptIdx + 1) % SCRIPT_VARIANTS.length;
    runRewrite(SCRIPT_VARIANTS[next], next);
  };
  // Restore the script from before the last regenerate.
  const undoRegenerate = () => {
    if (!prevScript) return;
    setScript(prevScript.text);
    setScriptIdx(prevScript.idx);
    setPrevScript(null);
    setJustUpdated(false);
  };
  // Selecting an angle rewrites the script for that framing.
  const chooseAngle = (id: string) => {
    setAngle(id);
    regenerateScript();
  };
  const openAvatarPicker = () =>
    openModal(AvatarPickerModal, { value: refImage, onSelect: (img) => setRefImage(img) });
  const openImagePicker = () =>
    openModal(SelectSourceModal, { value: refImage, onSelect: (img) => setRefImage(img) });
  const openMusicPicker = () =>
    openModal(SelectAudioModal, { value: music, onSelect: (name) => setMusic(name) });
  const openProductPicker = () =>
    openModal(SelectSourceModal, { value: productImage, onSelect: (img) => setProductImage(img) });
  const openCaptionPicker = () =>
    openModal(CaptionStylePickerModal, {
      captions,
      captionStyle,
      onSelect: (next: { captions: boolean; style: string }) => {
        setCaptions(next.captions);
        if (next.style) setCaptionStyle(next.style);
      },
    });
  // Mock voice playback for the avatar — flips to a "playing" state briefly.
  const playVoice = () => {
    setVoicePlaying(true);
    const t = window.setTimeout(() => setVoicePlaying(false), 2200);
    timers.current.push(t);
  };
  const [musicPlaying, setMusicPlaying] = useState(false);
  const playMusic = () => {
    setMusicPlaying((p) => !p);
    const t = window.setTimeout(() => setMusicPlaying(false), 2200);
    timers.current.push(t);
  };
  const scriptMax = SCRIPT_MAX_CHARS;
  const avatarName = AVATAR_NAME_BY_IMG[refImage] ?? 'Custom avatar';
  // Label + credit cost adapt to the video content type (AI Avatar Video,
  // Video Feed Post, Short Form Video).
  const typeLabel = CONTENT_BY_ID[draft.contentType]?.label ?? 'AI Avatar Video';
  const regenCredits = CREDIT_COST_BY_TYPE[draft.contentType] ?? 15;
  // Only AI Avatar Video uses an angle + a chosen avatar; Feed/Short video skip both.
  const isAvatarFlow = draft.contentType === 'ai-avatar';
  // Avatar always has a script; Feed/Short only when narration (voiceover) is on.
  const showScript = isAvatarFlow || narration;
  // Product-reaction is the only angle that needs a product image.
  const needsProduct = ANGLE_BY_ID[angle]?.needsProduct ?? false;
  const save = () => {
    onChange({
      ...draft,
      topic,
      script,
      captions,
      captionStyle,
      videoStyle,
      refImage,
      angle,
      productImage: needsProduct ? productImage : null,
    });
    close();
  };

  // Section labels use the DS "label" text style; block + bottom margin
  // positions them above their control.
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 8 };

  return (
    <Modal.Root size="lg" aria-labelledby="script-settings-title" data-testid="script-settings-modal">
      {/* compact header → no divider, large 26px title, floating close (matches prod). */}
      <Modal.Header
        title={mode === 'regenerate' ? `Regenerate ${typeLabel}` : isAvatarFlow ? 'Script & Settings' : 'Video Settings'}
        id="script-settings-title"
        onClose={close}
        compact
      />
      <Modal.Content compact>
        {/* Generate (left) · Render (right) */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', maxHeight: '64vh', overflowY: 'auto' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <style>{`@keyframes ss-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>

            {/* Generate */}
            <div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Heading level={3} style={{ margin: '0 0 4px' }}>{isAvatarFlow ? 'Script inputs' : 'Video inputs'}</Heading>
                <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--dark-60)' }}>{isAvatarFlow ? 'Angle and topic drive the script. Change either and regenerate to get a new draft.' : narration ? 'Topic drives the script. Change it and regenerate to get a new draft.' : 'Change the topic to generate a new video.'}</p>

                {/* Generation inputs grouped in a gray box, separate from the script. */}
                <div style={{ background: 'var(--dark-2)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'stretch' }}>
                    {isAvatarFlow && (
                    <div style={{ width: 200, flexShrink: 0 }}>
                      <Text variant="label" style={labelStyle}>Angle</Text>
                      <FieldDropdown
                        fullWidth
                        menuWidth={280}
                        triggerStyle={{ padding: '10px 12px', border: '1px solid var(--dark-4)' }}
                        trigger={
                          <span style={{ display: 'flex', flexDirection: 'column', gap: 1, whiteSpace: 'normal', textAlign: 'left' }}>
                            <span style={{ fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.2 }}>{ANGLE_BY_ID[angle]?.name ?? ''}</span>
                            <span style={{ fontSize: 11, color: 'var(--dark-60)', lineHeight: 1.3 }}>{ANGLE_BY_ID[angle]?.desc ?? ''}</span>
                          </span>
                        }
                      >
                        {(closeMenu) => (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {ANGLES.map((a) => (
                              <MenuItem key={a.id} onClick={() => { chooseAngle(a.id); closeMenu(); }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '4px 2px' }}>
                                  <span style={{ fontSize: 14, color: 'var(--dark-90)' }}>{a.name}</span>
                                  <span style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.4 }}>{a.desc}</span>
                                </div>
                              </MenuItem>
                            ))}
                          </div>
                        )}
                      </FieldDropdown>

                      {/* Product image — compact, under the Angle dropdown (Product reaction only) */}
                      {needsProduct && (
                        productImage ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, border: '1px solid var(--dark-8)', borderRadius: 8, background: 'var(--light-100)', padding: 5 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0, backgroundImage: `url('${productImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Product</span>
                            <IconButton icon={Edit3} size="sm" variant="tertiary" aria-label="Change product image" onPress={openProductPicker} />
                            <IconButton icon={Trash2} size="sm" variant="tertiary" aria-label="Remove product image" onPress={() => setProductImage(null)} />
                          </div>
                        ) : (
                          <button type="button" onClick={openProductPicker} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', marginTop: 8, border: '1px dashed var(--dark-15)', borderRadius: 8, background: 'var(--light-100)', padding: '8px 10px', fontFamily: 'inherit', fontSize: 13, color: 'var(--dark-60)', cursor: 'pointer' }}>
                            <FilePlus1 />
                            Add product image
                          </button>
                        )
                      )}
                    </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <Text variant="label" style={labelStyle}>Topic</Text>
                      <Textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Topic — what the script should be about"
                        style={{ fontSize: 14, flex: 1, minHeight: 56, resize: 'none' }}
                      />
                    </div>
                  </div>

                  {showScript && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="secondary" size="sm" endIcon={ArrowDown} onPress={regenerateScript} isDisabled={regenerating}>
                        Regenerate script
                      </Button>
                    </div>
                  )}
                </div>

                {!isAvatarFlow && (
                  <>
                    <div style={{ height: 1, background: 'var(--dark-8)', margin: '16px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Heading level={3} style={{ margin: 0 }}>Narration</Heading>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--dark-60)' }}>AI voiceover read from the script below.</p>
                      </div>
                      <Toggle checked={narration} onChange={setNarration} />
                    </div>
                  </>
                )}

                {showScript && (
                <>
                {/* Script field — label + undo, then textarea */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 8px' }}>
                  {isAvatarFlow ? (
                    <Heading level={3} style={{ margin: 0 }}>Generated script</Heading>
                  ) : (
                    <Text variant="label" style={{ margin: 0 }}>Generated script</Text>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {justUpdated && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--status-approved)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="var(--status-approved)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Updated
                      </span>
                    )}
                    {prevScript && (
                      <button type="button" onClick={undoRegenerate} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 12, color: 'var(--dark-60)', cursor: 'pointer' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 14L4 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Undo last regenerate
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    rows={6}
                    maxLength={scriptMax}
                    disabled={regenerating}
                    style={{ fontSize: 14, minHeight: 132 }}
                  />
                  {regenerating && (
                    <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--dark-8)', borderRadius: 8, background: 'var(--light-100)', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box' }}>
                      {['100%', '100%', '55%'].map((w, i) => (
                        <div key={i} style={{ height: 12, width: w, borderRadius: 6, background: 'linear-gradient(90deg, var(--dark-4) 25%, var(--dark-8) 37%, var(--dark-4) 63%)', backgroundSize: '400% 100%', animation: 'ss-shimmer 1.4s ease infinite' }} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: script.length > scriptMax ? 'var(--red-70)' : 'var(--dark-40)' }}>
                    {script.length}/{scriptMax}
                  </span>
                </div>
                </>
                )}
              </div>
            </div>

          </div>

          {/* vertical divider between the two steps */}
          <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--dark-8)', flexShrink: 0 }} />

          {/* Render (right column) */}
          <div style={{ width: 320, flexShrink: 0 }}>
            <div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Heading level={3} style={{ margin: '0 0 4px' }}>Video style</Heading>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--dark-60)' }}>How the finished video looks. These don't change the script.</p>

                {/* Avatar + Caption — matching cards. */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Avatar card — thumbnail, name, voice play + Change. AI Avatar Video only. */}
                  {isAvatarFlow && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '8px 20px 8px 8px' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 8, flexShrink: 0, backgroundColor: 'var(--dark-8)', backgroundImage: refImage ? `url('${refImage}')` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>Avatar</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{avatarName}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <IconButton
                        icon={voicePlaying ? Pause : Play3}
                        size="sm"
                        variant="secondary"
                        aria-label={voicePlaying ? 'Pause voice sample' : 'Play voice sample'}
                        onPress={playVoice}
                      />
                      <Button variant="secondary" size="sm" onPress={openAvatarPicker}>Change</Button>
                    </div>
                  </div>
                  )}

                  {/* Reference image card — Feed/Short video. Change opens the image picker. */}
                  {!isAvatarFlow && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '8px 20px 8px 8px' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 8, flexShrink: 0, backgroundColor: 'var(--dark-8)', backgroundImage: refImage ? `url('${refImage}')` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>Reference image</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{imageFileName(refImage)}</div>
                    </div>
                    <Button variant="secondary" size="sm" onPress={openImagePicker}>Change</Button>
                  </div>
                  )}

                  {/* Music card — Feed/Short video. */}
                  {!isAvatarFlow && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '8px 20px 8px 8px' }}>
                    <MusicThumb size={80} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>Music</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{music}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <IconButton
                        icon={musicPlaying ? Pause : Play3}
                        size="sm"
                        variant="secondary"
                        aria-label={musicPlaying ? 'Pause music' : 'Play music'}
                        onPress={playMusic}
                      />
                      <Button variant="secondary" size="sm" onPress={openMusicPicker}>Change</Button>
                    </div>
                  </div>
                  )}

                  {/* Caption card — captions accompany the script, so hidden when narration is off. */}
                  {showScript && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '8px 20px 8px 8px' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: captions && captionImg(captionStyle) ? CAPTION_BG : 'var(--dark-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                      {captions && captionImg(captionStyle) ? (
                        <img src={captionImg(captionStyle)} alt={`${captionStyle} caption style`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                      ) : (
                        <XSquareContained color="var(--dark-40)" size={22} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>Caption style</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{captions ? captionStyle : 'No caption'}</div>
                    </div>
                    <Button variant="secondary" size="sm" onPress={openCaptionPicker}>Change</Button>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        {mode === 'regenerate' && (
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="ghost" onPress={close}>
              Close
            </Modal.FooterButton>
          </Modal.FooterContent>
        )}
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={save} isDisabled={regenerating}>
            {mode === 'regenerate' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Regenerate {typeLabel}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <CreditsSparkle size={14} />
                  {regenCredits}
                </span>
              </span>
            ) : (
              'Save'
            )}
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
  const isVideo = isVideoType(draft.contentType);
  // Only AI Avatar Video uses a presenter avatar + script microcopy; Feed/Short
  // video use a reference image and "Video Settings".
  const isAvatar = draft.contentType === 'ai-avatar';
  const openAvatarPicker = () =>
    openModal(AvatarPickerModal, { value: draft.refImage, onSelect: (img) => onChange({ ...draft, refImage: img }) });
  const openImagePicker = () =>
    openModal(SelectSourceModal, { value: draft.refImage, onSelect: (img) => onChange({ ...draft, refImage: img }) });
  const openScriptSettings = () => openModal(ScriptSettingsModal, { draft, onChange });
  const openContext = () => openModal(AddContextModal, {});
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
          onClick={isAvatar ? openAvatarPicker : openImagePicker}
          role="button"
          aria-label={isAvatar ? 'Change avatar' : 'Change reference image'}
          style={{
            position: 'relative',
            flexShrink: 0,
            width: 148,
            height: 148,
            borderRadius: 10,
            backgroundImage: `url('${draft.refImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.55), transparent 55%)' }} />
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
          onClick={openImagePicker}
          style={{
            flexShrink: 0,
            width: 148,
            height: 148,
            borderRadius: 10,
            border: 'none',
            background: 'var(--dark-2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--dark-90)',
            textAlign: 'center',
            padding: 12,
            boxSizing: 'border-box',
          }}
        >
          <svg width={24} height={24} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.2357 14.3751H14.375C16.3084 14.3751 17.6563 12.9838 17.6563 11.25C17.6563 9.84758 16.7661 8.4856 15.4516 8.16777C15.4067 7.01874 14.8967 6.1607 14.1926 5.70813C13.5021 5.26425 12.6494 5.21033 11.8969 5.54942C11.2936 4.38376 10.1044 3.43774 8.54145 3.43774C6.21651 3.43774 4.5779 5.61334 4.69639 7.83225C3.34714 8.19246 2.34375 9.50049 2.34375 11.0548C2.34375 12.8863 3.73334 14.3751 5.44268 14.3751H6.71875" stroke="var(--dark-90)" fill="none" strokeWidth="1.15" strokeLinecap="round" />
            <path d="M10 8.90649V16.5627M10 8.90649L7.26562 11.6409M10 8.90649L12.7344 11.6409" stroke="var(--dark-90)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add media to your post
        </button>
      )}

      {/* body */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* top row — content type + posting schedule (left), regenerate + delete (right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <ContentTypeField value={draft.contentType} onChange={(id) => onChange(applyContentType(draft, id))} />
            <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>Posting on</span>
            <DatePicker value={draft.date} onChange={(d) => onChange({ ...draft, date: d })} />
            {isVideo && (
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
                <Settings size={15} color="var(--dark-90)" />
                {isAvatar ? 'Script & Settings' : 'Video Settings'}
              </button>
            )}
          </div>
          <button type="button" aria-label="Regenerate topic" style={iconBtn} onClick={onRegenerate}>
            <ArrowRefresh2 size={18} color="var(--dark-90)" />
          </button>
          <button
            type="button"
            aria-label="Remove post"
            style={{ ...iconBtn, opacity: canRemove ? 1 : 0.35, cursor: canRemove ? 'pointer' : 'not-allowed' }}
            onClick={() => canRemove && onRemove()}
          >
            <Trash2 size={18} color="var(--dark-90)" />
          </button>
        </div>

        {/* topic — existing text field component */}
        <Textarea
          rows={2}
          placeholder="Write a topic or prompt, or let AI suggest one…"
          value={draft.topic}
          onChange={(e) => onChange({ ...draft, topic: e.target.value })}
          style={{ fontSize: 16, lineHeight: 1.5 }}
        />

        {/* All video types show the script microcopy; non-video shows Add context. */}
        {isVideo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dark-40)', fontSize: 12 }}>
            <InformationCircleSmall size={16} color="var(--dark-40)" />
            Topic seeds the script. Review and edit in {isAvatar ? 'Script & Settings' : 'Video Settings'}.
          </div>
        ) : (
          <button
            type="button"
            onClick={openContext}
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'transparent',
              border: 'none',
              color: 'var(--dark-60)',
              fontFamily: 'inherit',
              fontSize: 14,
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            <Plus size={16} color="var(--dark-60)" />
            Add context
          </button>
        )}
      </div>
    </div>
  );
}

// Per-post "Add context" modal — attach websites or documents to one post.
function ContextActionButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid var(--dark-15)',
        background: 'var(--light-100)',
        borderRadius: 8,
        padding: '9px 14px',
        fontFamily: 'inherit',
        fontSize: 14,
        color: 'var(--dark-90)',
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function AddContextModal({ close }: StackModalProps) {
  return (
    <Modal.Root size="lg" aria-labelledby="add-context-title" data-testid="add-context-modal">
      <Modal.Header title="Add websites or documents specific to this post" id="add-context-title" onClose={close} compact />
      <Modal.Content compact>
        <div
          style={{
            background: 'var(--dark-2)',
            borderRadius: 12,
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 48, height: 48, borderRadius: 99, background: 'var(--dark-8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Plus size={20} color="var(--dark-60)" />
          </span>
          <span style={{ fontSize: 15, color: 'var(--dark-90)' }}>No context added yet.</span>
          <span style={{ fontSize: 14, color: 'var(--dark-60)', marginBottom: 16 }}>Add a website or upload files to get started.</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <ContextActionButton
              label="Add Webpage"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--dark-90)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>}
            />
            <ContextActionButton
              label="Upload File"
              icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M13.2357 14.3751H14.375C16.3084 14.3751 17.6563 12.9838 17.6563 11.25C17.6563 9.84758 16.7661 8.4856 15.4516 8.16777C15.4067 7.01874 14.8967 6.1607 14.1926 5.70813C13.5021 5.26425 12.6494 5.21033 11.8969 5.54942C11.2936 4.38376 10.1044 3.43774 8.54145 3.43774C6.21651 3.43774 4.5779 5.61334 4.69639 7.83225C3.34714 8.19246 2.34375 9.50049 2.34375 11.0548C2.34375 12.8863 3.73334 14.3751 5.44268 14.3751H6.71875" stroke="var(--dark-90)" strokeWidth="1.4" strokeLinecap="round" /><path d="M10 8.90649V16.5627M10 8.90649L7.26562 11.6409M10 8.90649L12.7344 11.6409" stroke="var(--dark-90)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            />
            <ContextActionButton
              label="Select from Brand Kit"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--dark-90)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11V5a2 2 0 0 1 2-2h6l9 9-8 8-9-9z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>}
            />
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Back
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" isDisabled onPress={close}>
            Add Context
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// "Add Post" split button — a real secondary Button trigger with a small
// popover menu (Pre-filled / Blank). Opens upward since it sits in the footer.
function AddPostMenu({ onPrefilled, onBlank }: { onPrefilled: () => void; onBlank: () => void }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const anchorRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const b = anchorRef.current?.getBoundingClientRect();
      const m = menuRef.current;
      if (!b || !m) return;
      const width = 220;
      const gap = 6;
      const top = Math.max(8, b.top - gap - m.scrollHeight);
      const left = b.left;
      setStyle({ position: 'fixed', top, left, width, visibility: 'visible' });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  return (
    <span ref={anchorRef} style={{ display: 'inline-flex' }}>
      <Button variant="secondary" size="md" frontIcon={Plus} onPress={() => { setStyle({ visibility: 'hidden' }); setOpen((o) => !o); }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Add Post
          <ChevronDown size={16} color="var(--dark-60)" />
        </span>
      </Button>
      {open &&
        createPortal(
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99999 }} />
            <div
              ref={menuRef}
              style={{ ...style, zIndex: 100000, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.14)', padding: 6 }}
            >
              <MenuItem onClick={() => { onPrefilled(); setOpen(false); }}>
                <Plus size={18} color="var(--dark-60)" />
                <span style={{ flex: 1 }}>Pre-filled Post</span>
              </MenuItem>
              <MenuItem onClick={() => { onBlank(); setOpen(false); }}>
                <FilePlus1 size={18} color="var(--dark-60)" />
                <span style={{ flex: 1 }}>Blank Post</span>
              </MenuItem>
            </div>
          </>,
          document.body,
        )}
    </span>
  );
}

// Campaign options for the New Post header picker. One "active" campaign is
// pre-selected; the rest are upcoming.
interface CampaignItem {
  id: string;
  title: string;
  kind: string;
  range: string;
  img: string;
  status: 'active' | 'future';
}

const CAMPAIGNS: CampaignItem[] = [
  { id: 'savor', title: "Savor Summer With Richmond's Finest Roasts", kind: 'Lifestyle Content', range: 'Jun 17 – 23', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=70', status: 'active' },
  { id: 'roots', title: 'Richmond Roots, Coffee Stories Unfold', kind: 'Lifestyle Content', range: 'Jun 24 – 30', img: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=200&q=70', status: 'future' },
  { id: 'brews', title: 'Summer Brews for the Ethical Sipper', kind: 'Lifestyle Content', range: 'Jul 1 – 7', img: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=200&q=70', status: 'future' },
  { id: 'bean', title: 'Local Coffee Stories: From Bean to Brew', kind: 'Lifestyle Content', range: 'Jul 8 – 14', img: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=200&q=70', status: 'future' },
  { id: 'craft', title: 'Coffee Craft: From Seed to Summer Sip', kind: 'Lifestyle Content', range: 'Jul 15 – 21', img: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=200&q=70', status: 'future' },
];

function CampaignCheck() {
  return (
    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 99, background: 'var(--dark-90)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

function CampaignOption({
  title,
  subtitle,
  thumb,
  selected,
  onClick,
}: {
  title: string;
  subtitle: ReactNode;
  thumb: ReactNode;
  selected: boolean;
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
        textAlign: 'left',
        border: 'none',
        background: selected ? 'var(--dark-4)' : 'transparent',
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--dark-2)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      {thumb}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>{subtitle}</span>
      </span>
      {selected && <CampaignCheck />}
    </button>
  );
}

const campaignThumb = (img: string) => (
  <span style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 8, backgroundColor: 'var(--dark-8)', backgroundImage: `url('${img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
);

export function NewPostModal({
  close,
  onCreate,
  dateOptions = DEFAULT_DATE_OPTIONS,
}: StackModalProps & {
  onCreate: (posts: NewPostDraft[]) => void;
  dateOptions?: string[];
}) {
  const firstDate = dateOptions[0] ?? DEFAULT_DATE_OPTIONS[0];
  const [campaignId, setCampaignId] = useState<string | null>('savor');
  const [posts, setPosts] = useState<NewPostDraft[]>(() => [makeAiDraft(0, firstDate)]);

  const updatePost = (id: string, next: NewPostDraft) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? next : p)));
  const removePost = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));
  const addAiPost = () => setPosts((prev) => [...prev, makeAiDraft(prev.length, firstDate)]);
  const addBlankPost = () => setPosts((prev) => [...prev, makeBlankDraft(firstDate)]);
  // Regenerate ONLY the topic — keep avatar, angle, captions, date, accounts.
  const regenerate = (id: string) =>
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const cur = AI_SEEDS.findIndex((s) => s.topic === p.topic);
        const next = AI_SEEDS[(cur + 1) % AI_SEEDS.length];
        return { ...p, topic: next.topic };
      }),
    );

  const count = posts.length;
  const totalCredits = posts.reduce((sum, p) => sum + postCredits(p), 0);

  const selectedCampaign = CAMPAIGNS.find((c) => c.id === campaignId) ?? null;
  const activeCampaigns = CAMPAIGNS.filter((c) => c.status === 'active');
  const futureCampaigns = CAMPAIGNS.filter((c) => c.status === 'future');
  const campaignTrigger = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>Campaign</span>
      <FieldDropdown
        align="right"
        menuWidth={460}
        trigger={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: 320 }}>
            {selectedCampaign ? (
              <>
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedCampaign.title}</span>
                <span style={{ color: 'var(--dark-40)' }}>•</span>
                <span style={{ color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>{selectedCampaign.range}</span>
              </>
            ) : (
              <span style={{ fontWeight: 500 }}>One-off content</span>
            )}
          </span>
        }
      >
        {(close) => (
          <div style={{ display: 'flex', flexDirection: 'column', padding: 4 }}>
            <CampaignOption
              title="One-off content"
              subtitle="Post not assigned to a campaign"
              selected={campaignId === null}
              onClick={() => { setCampaignId(null); close(); }}
              thumb={
                <span style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 8, border: '1px solid var(--dark-8)', background: 'var(--light-100)', overflow: 'hidden' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M6 42L42 6" stroke="var(--dark-8)" strokeWidth="1.5" /></svg>
                </span>
              }
            />
            <div style={{ height: 1, background: 'var(--dark-8)', margin: '6px 0' }} />
            <div style={{ fontSize: 13, color: 'var(--dark-60)', padding: '4px 12px 6px' }}>Active campaigns</div>
            {activeCampaigns.map((c) => (
              <CampaignOption
                key={c.id}
                title={c.title}
                subtitle={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span>✨</span>{c.kind} • {c.range}</span>}
                thumb={campaignThumb(c.img)}
                selected={campaignId === c.id}
                onClick={() => { setCampaignId(c.id); close(); }}
              />
            ))}
            <div style={{ fontSize: 13, color: 'var(--dark-60)', padding: '10px 12px 6px' }}>Future campaigns</div>
            {futureCampaigns.map((c) => (
              <CampaignOption
                key={c.id}
                title={c.title}
                subtitle={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span>✨</span>{c.kind} • {c.range}</span>}
                thumb={campaignThumb(c.img)}
                selected={campaignId === c.id}
                onClick={() => { setCampaignId(c.id); close(); }}
              />
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
                onRegenerate={() => regenerate(p.id)}
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
          <AddPostMenu onPrefilled={addAiPost} onBlank={addBlankPost} />
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => onCreate(posts)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Create {count} {count === 1 ? 'Post' : 'Posts'}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <CreditsSparkle size={14} />
                {totalCredits}
              </span>
            </span>
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
