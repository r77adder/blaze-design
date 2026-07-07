import { useMemo, useState, type ComponentType } from 'react';
import { Heading, Text, Button, useModals } from '@/components';
import { useToast } from '@/staging';
import Check2 from '@/icons/20/Check2';
import Edit3 from '@/icons/20/Edit3';
import Calendar1 from '@/icons/20/Calendar1';
import Globe from '@/icons/20/Globe';
import Star from '@/icons/20/Star';
import Cursor04 from '@/icons/20/Cursor04';
import VideoOn from '@/icons/20/VideoOn';
import FileMultiple from '@/icons/20/FileMultiple';
import Document from '@/icons/20/Document';
import Mail from '@/icons/20/Mail';
import Iphone02 from '@/icons/16/Iphone02';
import ApprovalsIcon from '@/icons/20/Approvals';
import StillImageIcon from '../h2/StillImageIcon';
import { ClientShell } from './shell';
import { PostPreviewModal } from './PostPreviewModal';
import { ColdState } from './ColdState';
import { useClientState } from './dev-state';
import { StoryPreview, ReelPreview } from './SocialPreviewFrames';

/**
 * Client Approvals — ground-up redesign for Grain Design Flooring (Austin, TX).
 *
 * The client's one job here is to sign off on content. This view leads with the
 * CONTENT TYPE (Organic, Story, Reel, Blog, Paid…) as the primary label, shows a
 * large preview and the FULL caption, and puts permanent, comfortable
 * Approve / Request-changes buttons on every card. Campaign + dates are quiet
 * secondary metadata. Approve / Request changes drive local state (decided cards
 * visibly change) and a toast.
 */

// ── Tokens ───────────────────────────────────────────────────────────────────
const F = "'Sohne', sans-serif";
const dark90 = 'var(--dark-90)';
const dark80 = 'var(--dark-80)';
const dark60 = 'var(--dark-60)';
const dark40 = 'var(--dark-40)';
const dark8 = 'var(--dark-8)';
const dark4 = 'var(--dark-4)';
const dark2 = 'var(--dark-2)';
const white = 'var(--light-100)';
const green = 'var(--status-approved)';
const red = 'var(--red-90)';

// ── Flooring imagery (Unsplash — hardwood / interiors / showroom) ───────────────
const IMG = {
  hardwood: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
  install: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop',
  livingRoom: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop',
  crew: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop',
  detail: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop',
  showroom: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop',
  tile: 'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=800&auto=format&fit=crop',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop',
  stairs: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop',
  swatch: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop',
};

// ── Types ───────────────────────────────────────────────────────────────────
type Status = 'pending' | 'approved' | 'rejected';
type ContentType = 'Organic' | 'Story' | 'Reel' | 'Carousel' | 'Paid' | 'Blog' | 'Email';

interface Item {
  id: number;
  type: ContentType;
  title?: string;
  caption: string;
  img: string;
  campaign: string;
  date: string;
  channelIcon: 'organic' | 'paid' | 'seo' | 'reputation';
  slides?: number;
}

// ── Content authored for Grain Design Flooring ──────────────────────────────────
const ITEMS: Item[] = [
  {
    id: 1,
    type: 'Organic',
    campaign: 'Fall Hardwood Showcase',
    date: 'Oct 2 · 10:00 AM',
    channelIcon: 'organic',
    img: IMG.hardwood,
    caption:
      'Floor of the week 🪵 This Tarrytown living room went from tired carpet to wide-plank white oak with a matte hardwax finish. Quarter-sawn for that tight, even grain — and yes, it’s pet-friendly. Eight days, start to finish. Swipe to see the before. #GrainDesignFlooring #AustinHardwood',
  },
  {
    id: 2,
    type: 'Reel',
    campaign: 'Fall Hardwood Showcase',
    date: 'Oct 4 · 9:00 AM',
    channelIcon: 'organic',
    img: IMG.install,
    caption:
      'Watch 1,400 sq ft of European white oak go in over two days in Westlake. Rack, glue, set, repeat — every board hand-selected so the grain flows room to room. The satisfying part starts at 0:18. 🎬',
  },
  {
    id: 3,
    type: 'Story',
    campaign: 'Fall Hardwood Showcase',
    date: 'Oct 5 · 8:00 AM',
    channelIcon: 'organic',
    img: IMG.detail,
    caption:
      'Behind the finish ✨ Our crew sands to 120 grit, then again by hand at the edges before a single coat goes down. This is the part nobody sees — and the reason your floors still look right in ten years.',
  },
  {
    id: 4,
    type: 'Carousel',
    campaign: 'Fall Hardwood Showcase',
    date: 'Oct 7 · 11:00 AM',
    channelIcon: 'organic',
    slides: 5,
    img: IMG.swatch,
    caption:
      'Five hardwood tones we’re specifying most this season — from pale Scandi white oak to a deep walnut-stained ash. Each one reacts differently to Austin’s afternoon light, so we sample on-site before you commit. Which would you pick? 🎨',
  },
  {
    id: 5,
    type: 'Paid',
    campaign: 'LVP Fall Promo — Meta',
    date: 'Oct 9 · 9:00 AM',
    channelIcon: 'paid',
    img: IMG.livingRoom,
    caption:
      'Waterproof luxury vinyl plank that looks like real oak — and stands up to kids, dogs, and Texas summers. Book your free in-home design consult before Oct 31 and we’ll waive the install fee on any LVP project over 600 sq ft. 🏡',
  },
  {
    id: 6,
    type: 'Paid',
    campaign: 'LVP Fall Promo — Meta',
    date: 'Oct 14 · 10:00 AM',
    channelIcon: 'paid',
    img: IMG.kitchen,
    caption:
      'Refinish, don’t replace. We brought this 1990s kitchen floor back to life with a full sand-and-recoat in a custom warm-walnut tone — half the cost of new hardwood, done in three days. Limited fall slots left in the Austin area. 🛠️',
  },
  {
    id: 7,
    type: 'Blog',
    campaign: 'SEO Relevance Blogs',
    date: 'Oct 11 · 10:00 AM',
    channelIcon: 'seo',
    img: IMG.tile,
    title: 'Hardwood vs. LVP vs. Tile: Which Flooring Actually Holds Up in an Austin Home?',
    caption:
      'A design-led breakdown of how each material handles heat, humidity, pets, and resale — and where we’d use each one.',
  },
  {
    id: 8,
    type: 'Blog',
    campaign: 'SEO Relevance Blogs',
    date: 'Oct 13 · 10:00 AM',
    channelIcon: 'seo',
    img: IMG.stairs,
    title: 'Should You Refinish or Replace Your Hardwood Floors?',
    caption:
      'Our master installer walks through the five things we check on every floor — board thickness, gaps, cupping, finish wear, and subfloor — to tell you which path actually makes sense.',
  },
  {
    id: 9,
    type: 'Email',
    campaign: 'Showroom Newsletter',
    date: 'Oct 16 · 8:00 AM',
    channelIcon: 'organic',
    img: IMG.showroom,
    title: 'New in the showroom this month',
    caption:
      'Three wide-plank white oak collections and a matte herringbone tile you have to see in person. Walk the samples under real light, bring your paint chips, and meet the design team. Open Sat 10–4 on South Lamar. ☀️',
  },
];

// ── Channel icon helper ─────────────────────────────────────────────────────────
function ChannelIcon({ channel }: { channel: Item['channelIcon'] }) {
  if (channel === 'paid') return <Cursor04 size={12} color={dark40} />;
  if (channel === 'seo') return <Globe size={12} color={dark40} />;
  if (channel === 'reputation') return <Star size={12} color={dark40} />;
  return <Calendar1 size={12} color={dark40} />;
}

// ── Status ribbon shown on decided cards ────────────────────────────────────────
function DecisionBanner({ status, note }: { status: Exclude<Status, 'pending'>; note?: string }) {
  const cfg =
    status === 'approved'
      ? { Icon: Check2, color: green, label: 'Approved', sub: 'Scheduled to publish' }
      : { Icon: Edit3, color: red, label: 'Changes requested', sub: 'Your team will revise' };
  const showNote = status === 'rejected' && !!note;
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px',
        background: status === 'approved' ? 'rgba(4,175,0,0.07)' : 'rgba(174,34,34,0.06)',
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <cfg.Icon size={18} color={cfg.color} />
        <span style={{ fontSize: 14, fontWeight: 500, color: cfg.color, fontFamily: F, letterSpacing: '0.14px' }}>
          {cfg.label}
        </span>
        <span style={{ fontSize: 14, color: dark60, fontFamily: F, marginLeft: 'auto' }}>{cfg.sub}</span>
      </div>
      {showNote && (
        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(174,34,34,0.15)' }}>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: dark60, fontFamily: F, marginBottom: 4 }}>Your requested changes</span>
          <p style={{ margin: 0, fontSize: 14, color: dark80, fontFamily: F, lineHeight: 1.5 }}>{note}</p>
        </div>
      )}
    </div>
  );
}

// ── Aspect ratio per content type — previews show the content's true proportions ──
const ASPECT: Record<ContentType, string> = {
  Reel: '9 / 16',
  Story: '9 / 16',
  Carousel: '4 / 5',
  Organic: '4 / 5',
  Paid: '1 / 1',
  Blog: '16 / 9',
  Email: '16 / 9',
};

// ── Type glyph — icon + colored label, matching the Calendar's content treatment ──
const TYPE_META: Record<ContentType, { icon: ComponentType<{ size?: number; color?: string }>; color: string }> = {
  Organic:  { icon: StillImageIcon, color: 'var(--red-70)' },
  Story:    { icon: Iphone02,       color: 'var(--status-new)' },
  Reel:     { icon: VideoOn,        color: 'var(--purple)' },
  Carousel: { icon: FileMultiple,   color: 'var(--status-connect)' },
  Paid:     { icon: Cursor04,       color: 'var(--status-posting)' },
  Blog:     { icon: Document,       color: 'var(--status-approved)' },
  Email:    { icon: Mail,           color: 'var(--status-review)' },
};

// ── Content card ─────────────────────────────────────────────────────────────────
function ContentCard({ item, status, requestedNote, onApprove, onRequestChanges, onOpenPreview }: {
  item: Item; status: Status; requestedNote?: string; onApprove: () => void; onRequestChanges: (note?: string) => void; onOpenPreview: () => void;
}) {
  const decided = status !== 'pending';
  const meta = TYPE_META[item.type];
  const TypeIcon = meta.icon;
  const [requesting, setRequesting] = useState(false);
  const [note, setNote] = useState('');

  return (
    <div
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--dark-15)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = dark8; e.currentTarget.style.boxShadow = 'none'; }}
      style={{
        background: white, border: `1px solid ${dark8}`, borderRadius: 16,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        opacity: decided ? 0.92 : 1, transition: 'opacity 0.2s, border-color 120ms ease, box-shadow 120ms ease',
      }}
    >
      {/* Header — type pill (left), date & time (top right) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px 12px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <TypeIcon size={16} color={meta.color} />
          <span style={{ fontSize: 14, color: dark80, fontFamily: F }}>{item.type}</span>
          {item.slides ? <span style={{ fontSize: 13, color: dark60, fontFamily: F }}>· {item.slides} slides</span> : null}
        </span>
        <span style={{ fontSize: 13, color: dark60, fontFamily: F, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{item.date}</span>
      </div>

      {/* Preview — true content proportions (9:16, 4:5, 1:1, 16:9 …) */}
      <div style={{ padding: '0 20px' }}>
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenPreview}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenPreview(); } }}
          style={{ position: 'relative', aspectRatio: ASPECT[item.type], borderRadius: 8, overflow: 'hidden', background: dark4, cursor: 'pointer' }}
        >
          {item.type === 'Story' ? (
            <StoryPreview image={item.img} brandInitial="G" brandName="Grain Design Flooring" headline={item.caption} />
          ) : item.type === 'Reel' ? (
            <ReelPreview image={item.img} brandInitial="G" brandName="Grain Design Flooring" caption={item.caption} />
          ) : (
            <>
              <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {item.type === 'Carousel' && item.slides && (
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke={white} strokeWidth="1.8" /><path d="M2 7v10M22 7v10" stroke={white} strokeWidth="1.8" strokeLinecap="round" /></svg>
                  <span style={{ fontSize: 12, color: white, fontFamily: F }}>1/{item.slides}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Title (Blog / Email) + caption */}
      <div style={{ padding: '16px 20px 8px' }}>
        {item.title && <Heading level={5} style={{ margin: '0 0 6px' }}>{item.title}</Heading>}
        <p style={{ margin: 0, fontSize: 16, color: dark80, fontFamily: F, lineHeight: 1.55, letterSpacing: '0.1px', whiteSpace: 'pre-wrap' }}>
          {item.caption}
        </p>
      </div>

      {/* Campaign — quiet metadata, moved below the caption */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 20px 16px' }}>
        <ChannelIcon channel={item.channelIcon} />
        <span style={{ fontSize: 13, color: dark60, fontFamily: F, letterSpacing: '0.13px' }}>{item.campaign}</span>
      </div>

      {/* Action row */}
      <div style={{ marginTop: 'auto', padding: '0 20px 20px' }}>
        {decided ? (
          <DecisionBanner status={status} note={requestedNote} />
        ) : requesting ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: dark80, fontFamily: F }}>What would you like changed?</span>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Swap the hero photo for the white-oak install, and soften the headline. Your team will revise and resend."
              style={{ width: '100%', minHeight: 88, borderRadius: 10, border: `1px solid ${dark8}`, padding: '10px 12px', fontFamily: F, fontSize: 14, color: dark90, lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="subtle" size="md" onPress={() => { setRequesting(false); setNote(''); }}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onPress={() => onRequestChanges(note)} isDisabled={!note.trim()}>
                Send request
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" size="md" frontIcon={Edit3} onPress={() => setRequesting(true)}>
              Request changes
            </Button>
            <Button variant="green" size="md" frontIcon={Check2} onPress={onApprove}>
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Client Approvals page. A two-column grid of large content cards. Header is a
 * clean "Approvals" with a quiet pending count. Approve / Request changes are
 * permanent, comfortable buttons that drive local state + a toast.
 */
export function Approvals({ sub: _sub }: { sub?: string }) {
  const { state } = useClientState();
  const { showToast } = useToast();
  const { openModal } = useModals();

  // Cold — account is still being set up pre-go-live. Nothing to approve yet,
  // so omit the steady topbar controls and show the shared explanatory state.
  if (state !== 'steady') {
    return (
      <ClientShell section="approvals">
        <ColdState
          icon={ApprovalsIcon}
          title="Approvals open when you go live."
          description="This is where you’ll review and sign off on everything before it’s published — nothing goes out without your OK."
          points={[
            'Social posts, stories, reels, and carousels',
            'Blog articles and email campaigns',
            'Paid search and paid social ad creative',
            'AI-drafted replies to your reviews',
          ]}
        />
      </ClientShell>
    );
  }

  const [statuses, setStatuses] = useState<Record<number, Status>>(() => {
    const initial: Record<number, Status> = {};
    ITEMS.forEach((i) => { initial[i.id] = 'pending'; });
    return initial;
  });
  const [notes, setNotes] = useState<Record<number, string>>({});

  const { totalPending, totalApproved, totalChanges } = useMemo(() => {
    const vals = Object.values(statuses);
    return {
      totalPending: vals.filter((s) => s === 'pending').length,
      totalApproved: vals.filter((s) => s === 'approved').length,
      totalChanges: vals.filter((s) => s === 'rejected').length,
    };
  }, [statuses]);

  const approve = (id: number) => {
    setStatuses((prev) => ({ ...prev, [id]: 'approved' }));
    showToast({ variant: 'success', message: 'Approved' });
  };
  const requestChanges = (id: number, note?: string) => {
    setStatuses((prev) => ({ ...prev, [id]: 'rejected' }));
    setNotes((prev) => ({ ...prev, [id]: note?.trim() ?? '' }));
    showToast({ message: note?.trim() ? 'Changes sent — your team will revise this.' : 'Changes requested — your team will revise this.' });
  };
  const approveAll = () => {
    setStatuses((prev) => {
      const next = { ...prev };
      ITEMS.forEach((i) => { if (next[i.id] === 'pending') next[i.id] = 'approved'; });
      return next;
    });
    showToast({ variant: 'success', message: 'Approved everything pending' });
  };

  // Quiet live tally — "X approved · Y changes requested · Z pending".
  const tallyParts: { label: string; color: string }[] = [];
  if (totalApproved > 0) tallyParts.push({ label: `${totalApproved} approved`, color: green });
  if (totalChanges > 0) tallyParts.push({ label: `${totalChanges} changes requested`, color: red });
  tallyParts.push({
    label: totalPending > 0 ? `${totalPending} pending` : 'All caught up',
    color: dark60,
  });

  const topbarRight = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', fontFamily: F, fontSize: 14 }}>
        {tallyParts.map((part, i) => (
          <span key={part.label} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {i > 0 && <span style={{ color: dark40, margin: '0 8px' }}>·</span>}
            <span style={{ color: part.color }}>{part.label}</span>
          </span>
        ))}
      </span>
      {totalPending > 0 && (
        <Button variant="secondary" size="md" frontIcon={Check2} onPress={approveAll}>
          Approve all
        </Button>
      )}
    </div>
  );

  return (
    <ClientShell section="approvals" topbarRight={topbarRight}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 4px 60px' }}>

        {/* Responsive two-column grid of large cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, alignItems: 'start' }}>
          {ITEMS.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              status={statuses[item.id] ?? 'pending'}
              requestedNote={notes[item.id]}
              onApprove={() => approve(item.id)}
              onRequestChanges={(note) => requestChanges(item.id, note)}
              onOpenPreview={() => openModal(PostPreviewModal, {
                items: ITEMS,
                initialIndex: ITEMS.findIndex((i) => i.id === item.id),
                typeMeta: TYPE_META,
                initialNotes: notes,
                rejectedIds: ITEMS.filter((i) => (statuses[i.id] ?? 'pending') === 'rejected').map((i) => i.id),
                onApprove: (id) => approve(id),
                onRequestChanges: (id, note) => requestChanges(id, note),
              })}
            />
          ))}
        </div>

        {totalPending === 0 && (
          <div style={{ marginTop: 28, padding: '20px', textAlign: 'center', border: `1px dashed ${dark8}`, borderRadius: 12, background: dark2 }}>
            <Text variant="secondary" style={{ color: dark60 }}>
              You{"’"}ve reviewed everything in your active campaigns. New content lands here as your team creates it.
            </Text>
          </div>
        )}
      </div>
    </ClientShell>
  );
}
