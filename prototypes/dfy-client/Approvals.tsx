import { useMemo, useState, type ComponentType } from 'react';
import { Heading, Text, Button, IconButton, Modal, useModals } from '@/components';
import { TabChip, useToast } from '@/staging';
import ArrowLeft from '@/icons/20/ArrowLeft';
import ChevronRight from '@/icons/16/ChevronRight';
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
import EyeOpen from '@/icons/20/EyeOpen';
import StillImageIcon from '../h2/StillImageIcon';
// Shared with the AM side so both use exactly the same cards + page layout.
import { CardBody, TypeIcon, TYPE_LABEL as AM_TYPE_LABEL, CARD_W, CARD_H, PAGE_W, ContentTypeSections, StatusTabContent, StatusTabChevron, statusTabStyle, type Post as AmPost } from '../blaze-dfy/Approvals';
import { ClientShell } from './shell';
import { PostPreviewModal } from './PostPreviewModal';
import { ColdState } from './ColdState';
import { useClientState } from './dev-state';
import { StoryPreview, ReelPreview } from './SocialPreviewFrames';

/**
 * Client Approvals, ground-up redesign for Grain Design Flooring (Austin, TX).
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

// ── Flooring imagery (Unsplash, hardwood / interiors / showroom) ───────────────
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
// 'updated' = the team revised a piece the client asked changes on and re-sent
// it for another look. It's actionable like 'pending', filed under its own tab.
type Status = 'pending' | 'approved' | 'rejected' | 'updated';
type ContentType = 'Organic' | 'Story' | 'Reel' | 'Carousel' | 'Paid' | 'PaidSearch' | 'Blog' | 'Email' | 'Reputation';

// ── Status filter subtabs (mirror the AM side, minus the AM-only Draft) ────────
type Subtab = 'in-review' | 'changes' | 'updated' | 'approved';
const CLIENT_TABS: { key: Subtab; label: string }[] = [
  { key: 'in-review', label: 'In review' },
  { key: 'changes',   label: 'Requested changes' },
  { key: 'updated',   label: 'Updated' },
  { key: 'approved',  label: 'Approved' },
];
const SUBTAB_STATUS: Record<Subtab, Status> = {
  'in-review': 'pending', changes: 'rejected', updated: 'updated', approved: 'approved',
};
// Demo seeds so the steady client always lands on a populated pipeline (never an
// empty tab): a healthy In review queue, plus a few pieces already in each other
// state. `CHANGES_SEED` also carries the note the client left on each.
const UPDATED_SEED = [1, 5];                  // team revised, awaiting a second look
const APPROVED_SEED = [3, 13];                // already signed off
const CHANGES_SEED: Record<number, string> = {
  11: 'Can we lead with the waterproof + pet-proof angle in the headline? That’s what our buyers search for.',
  8: 'Great draft. Add a short cost section so it ranks for the “refinish vs replace cost” query.',
};
// The original change the client asked for on each updated piece, plus the
// team's reply when they re-sent it. Together these seed the feedback thread
// shown in the preview for an updated design.
const UPDATED_NOTES: Record<number, string> = {
  1: 'Love the room, but can we use a brighter, daytime photo? This one reads a little dark.',
  5: 'Can we make the “no install fee” offer the headline instead of burying it in the caption?',
};
const UPDATED_REPLIES: Record<number, string> = {
  1: 'Done, we swapped in the brighter midday shot of the Tarrytown install. Take another look whenever you have a minute.',
  5: 'Updated, the fee-waiver offer now leads the headline and the caption is tightened up. Ready for your review.',
};

// Same content-type taxonomy the AM side uses, so both tell one story.
type Section = 'paid-social' | 'paid-search' | 'organic' | 'seo' | 'reputation';

interface Item {
  id: number;
  type: ContentType;
  section: Section;
  title?: string;
  caption: string;
  img?: string;
  campaign: string;
  date: string;
  channelIcon: 'organic' | 'paid' | 'seo' | 'reputation';
  slides?: number;
  batch?: 'current' | 'previous';  // previous batches live behind a header toggle
  headline?: string;               // PaidSearch: Google ad headline
  rating?: number;                 // Reputation: star rating
  reviewer?: string;               // Reputation: who left the review
  source?: string;                 // Reputation: Google / Yelp
}

// Content-type section order + labels (mirrors the AM side).
const SECTION_LABEL: Record<Section, string> = {
  'paid-social': 'Paid Social',
  'paid-search': 'Paid Search',
  organic: 'Organic',
  seo: 'SEO / AEO articles',
  reputation: 'Reputation',
};
const SECTION_GROUPS: { label: string; sections: Section[] }[] = [
  { label: 'Paid Ads', sections: ['paid-social', 'paid-search'] },
  { label: 'Organic', sections: ['organic'] },
  { label: 'SEO / AEO articles', sections: ['seo'] },
  { label: 'Reputation', sections: ['reputation'] },
];

// ── Content authored for Grain Design Flooring ──────────────────────────────────
const ITEMS: Item[] = [
  {
    id: 1,
    type: 'Organic',
    section: 'organic',
    batch: 'current',
    campaign: 'Fall Hardwood Showcase',
    date: 'Oct 2 · 10:00 AM',
    channelIcon: 'organic',
    img: IMG.hardwood,
    caption:
      'Floor of the week 🪵 This Tarrytown living room went from tired carpet to wide-plank white oak with a matte hardwax finish. Quarter-sawn for that tight, even grain, and yes, it’s pet-friendly. Eight days, start to finish. Swipe to see the before. #GrainDesignFlooring #AustinHardwood',
  },
  {
    id: 2,
    type: 'Reel',
    section: 'organic',
    batch: 'current',
    campaign: 'Fall Hardwood Showcase',
    date: 'Oct 4 · 9:00 AM',
    channelIcon: 'organic',
    img: IMG.install,
    caption:
      'Watch 1,400 sq ft of European white oak go in over two days in Westlake. Rack, glue, set, repeat, every board hand-selected so the grain flows room to room. The satisfying part starts at 0:18. 🎬',
  },
  {
    id: 3,
    type: 'Story',
    section: 'organic',
    batch: 'current',
    campaign: 'Fall Hardwood Showcase',
    date: 'Oct 5 · 8:00 AM',
    channelIcon: 'organic',
    img: IMG.detail,
    caption:
      'Behind the finish ✨ Our crew sands to 120 grit, then again by hand at the edges before a single coat goes down. This is the part nobody sees, and the reason your floors still look right in ten years.',
  },
  {
    id: 4,
    type: 'Carousel',
    section: 'organic',
    batch: 'current',
    campaign: 'Fall Hardwood Showcase',
    date: 'Oct 7 · 11:00 AM',
    channelIcon: 'organic',
    slides: 5,
    img: IMG.swatch,
    caption:
      'Five hardwood tones we’re specifying most this season, from pale Scandi white oak to a deep walnut-stained ash. Each one reacts differently to Austin’s afternoon light, so we sample on-site before you commit. Which would you pick? 🎨',
  },
  {
    id: 5,
    type: 'Paid',
    section: 'paid-social',
    batch: 'current',
    campaign: 'LVP Fall Promo, Meta',
    date: 'Oct 9 · 9:00 AM',
    channelIcon: 'paid',
    img: IMG.livingRoom,
    caption:
      'Waterproof luxury vinyl plank that looks like real oak, and stands up to kids, dogs, and Texas summers. Book your free in-home design consult before Oct 31 and we’ll waive the install fee on any LVP project over 600 sq ft. 🏡',
  },
  {
    id: 6,
    type: 'Paid',
    section: 'paid-social',
    batch: 'current',
    campaign: 'LVP Fall Promo, Meta',
    date: 'Oct 14 · 10:00 AM',
    channelIcon: 'paid',
    img: IMG.kitchen,
    caption:
      'Refinish, don’t replace. We brought this 1990s kitchen floor back to life with a full sand-and-recoat in a custom warm-walnut tone, half the cost of new hardwood, done in three days. Limited fall slots left in the Austin area. 🛠️',
  },
  {
    id: 10,
    type: 'PaidSearch',
    section: 'paid-search',
    batch: 'current',
    campaign: 'Fall Refinishing, Google',
    date: 'Oct 9 · 8:00 AM',
    channelIcon: 'paid',
    headline: 'Hardwood Floor Refinishing Austin | Free Estimate in 24 Hrs',
    caption:
      'Dust-free sanding, custom stains, and a 10-year finish warranty. Trusted by 400+ Austin homeowners. Book your free in-home estimate today.',
  },
  {
    id: 11,
    type: 'PaidSearch',
    section: 'paid-search',
    batch: 'current',
    campaign: 'Fall Refinishing, Google',
    date: 'Oct 12 · 8:00 AM',
    channelIcon: 'paid',
    headline: 'Luxury Vinyl Plank Installation | Waterproof, Pet-Proof Floors',
    caption:
      'Realistic wood look, built for Texas homes. Free design consult + no install fee over 600 sq ft this fall. Serving greater Austin.',
  },
  {
    id: 7,
    type: 'Blog',
    section: 'seo',
    batch: 'current',
    campaign: 'SEO Relevance Blogs',
    date: 'Oct 11 · 10:00 AM',
    channelIcon: 'seo',
    img: IMG.tile,
    title: 'Hardwood vs. LVP vs. Tile: Which Flooring Actually Holds Up in an Austin Home?',
    caption:
      'A design-led breakdown of how each material handles heat, humidity, pets, and resale, and where we’d use each one.',
  },
  {
    id: 8,
    type: 'Blog',
    section: 'seo',
    batch: 'current',
    campaign: 'SEO Relevance Blogs',
    date: 'Oct 13 · 10:00 AM',
    channelIcon: 'seo',
    img: IMG.stairs,
    title: 'Should You Refinish or Replace Your Hardwood Floors?',
    caption:
      'Our master installer walks through the five things we check on every floor, board thickness, gaps, cupping, finish wear, and subfloor, to tell you which path actually makes sense.',
  },
  {
    id: 12,
    type: 'Reputation',
    section: 'reputation',
    batch: 'current',
    campaign: 'Reputation Management',
    date: 'Oct 10 · 1:00 PM',
    channelIcon: 'reputation',
    rating: 5,
    reviewer: 'Maria H.',
    source: 'Google',
    title: 'Reply to Maria H. · ★★★★★',
    caption:
      'We love our new white-oak floors, the crew was tidy and finished early. Only hiccup was a squeak near the stair landing that showed up a week later.',
  },
  {
    id: 13,
    type: 'Reputation',
    section: 'reputation',
    batch: 'current',
    campaign: 'Reputation Management',
    date: 'Oct 11 · 11:00 AM',
    channelIcon: 'reputation',
    rating: 3,
    reviewer: 'Karen L.',
    source: 'Yelp',
    title: 'Reply to Karen L. · ★★★☆☆',
    caption:
      'Floors look great but scheduling took two calls to pin down. Wish the start date had been firmer up front.',
  },
  {
    id: 9,
    type: 'Email',
    section: 'organic',
    batch: 'current',
    campaign: 'Showroom Newsletter',
    date: 'Oct 16 · 8:00 AM',
    channelIcon: 'organic',
    img: IMG.showroom,
    title: 'New in the showroom this month',
    caption:
      'Three wide-plank white oak collections and a matte herringbone tile you have to see in person. Walk the samples under real light, bring your paint chips, and meet the design team. Open Sat 10–4 on South Lamar. ☀️',
  },

  // ── Previous batch, already decided, revealed via the header toggle ──────────
  {
    id: 101, type: 'Organic', section: 'organic', batch: 'previous',
    campaign: 'September Refresh', date: 'Sep 12 · 10:00 AM', channelIcon: 'organic', img: IMG.livingRoom,
    caption: 'Before & after: a South Congress bungalow that traded worn pine for engineered white oak. Same footprint, entirely new light. ✨',
  },
  {
    id: 102, type: 'Paid', section: 'paid-social', batch: 'previous',
    campaign: 'Summer LVP, Meta', date: 'Sep 15 · 9:00 AM', channelIcon: 'paid', img: IMG.kitchen,
    caption: 'End-of-summer LVP event, waterproof floors installed in as little as one day. Free consult through Sep 30.',
  },
  {
    id: 103, type: 'Blog', section: 'seo', batch: 'previous',
    campaign: 'SEO Relevance Blogs', date: 'Sep 18 · 10:00 AM', channelIcon: 'seo', img: IMG.detail,
    title: 'How to Care for Hardwood Floors in Central Texas Humidity',
    caption: 'A seasonal maintenance guide our installers actually follow, cleaning, humidity, and when to recoat.',
  },
  {
    id: 104, type: 'Reputation', section: 'reputation', batch: 'previous',
    campaign: 'Reputation Management', date: 'Sep 20 · 2:00 PM', channelIcon: 'reputation', rating: 5, reviewer: 'Devon P.', source: 'Google',
    title: 'Reply to Devon P. · ★★★★★',
    caption: 'Best contractor experience we have had in Austin. Clear quote, no surprises, and the herringbone entry is stunning.',
  },
];

// AI-drafted reply the client is approving, keyed by reputation item id.
const REPLY_DRAFT: Record<number, string> = {
  12: 'Thank you so much, Maria, we’re thrilled you love the white oak! We’d like to come back and take care of that squeak near the landing at no charge. Someone from our team will reach out to schedule a quick visit. 🙌',
  13: 'Thanks for the honest feedback, Karen. You’re right that scheduling should have been tighter, we’ve since changed how we confirm start dates. We’d love to make it right; a team member will follow up shortly.',
  104: 'Thank you, Devon! It was a pleasure working with you, that herringbone entry turned out beautifully. We appreciate you trusting us with your home. 🙏',
};

// ── Star rating (reputation) ──────────────────────────────────────────────────
function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < rating ? 'var(--status-review)' : 'none'}>
          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z" stroke="var(--status-review)" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

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

// ── Aspect ratio per content type, previews show the content's true proportions ──
const ASPECT: Record<ContentType, string> = {
  Reel: '9 / 16',
  Story: '9 / 16',
  Carousel: '4 / 5',
  Organic: '4 / 5',
  Paid: '1 / 1',
  PaidSearch: '16 / 9',
  Blog: '16 / 9',
  Email: '16 / 9',
  Reputation: '16 / 9',
};

// ── Type glyph, icon + colored label, matching the Calendar's content treatment ──
const TYPE_META: Record<ContentType, { icon: ComponentType<{ size?: number; color?: string }>; color: string }> = {
  Organic:    { icon: StillImageIcon, color: 'var(--red-70)' },
  Story:      { icon: Iphone02,       color: 'var(--status-new)' },
  Reel:       { icon: VideoOn,        color: 'var(--purple)' },
  Carousel:   { icon: FileMultiple,   color: 'var(--status-connect)' },
  Paid:       { icon: Cursor04,       color: 'var(--status-posting)' },
  PaidSearch: { icon: Globe,          color: 'var(--status-posting)' },
  Blog:       { icon: Document,       color: 'var(--status-approved)' },
  Email:      { icon: Mail,           color: 'var(--status-review)' },
  Reputation: { icon: Star,           color: 'var(--status-review)' },
};

// Human labels for the type chip (the enum values aren't all display-ready).
const TYPE_LABEL: Record<ContentType, string> = {
  Organic: 'Organic', Story: 'Story', Reel: 'Reel', Carousel: 'Carousel',
  Paid: 'Paid Social', PaidSearch: 'Paid Search', Blog: 'Article',
  Email: 'Email', Reputation: 'Review Response',
};

// ── Shared-card adapter ────────────────────────────────────────────────────────
// Map the client's content types onto the AM card's types so both render with
// the exact same CardBody + card shell.
const TYPE_TO_AM: Record<ContentType, AmPost['type']> = {
  Organic: 'still', Story: 'story', Reel: 'short', Carousel: 'carousel',
  Paid: 'paid-social', PaidSearch: 'paid-search', Blog: 'blog', Email: 'email', Reputation: 'review',
};
const toPost = (i: Item): AmPost => ({
  id: i.id, type: TYPE_TO_AM[i.type], section: i.section, date: i.date, dateSort: i.date,
  caption: i.caption, img: i.img, slides: i.slides,
  headline: i.headline, rating: i.rating, reviewer: i.reviewer, source: i.source,
});

// Client content card, identical shell + CardBody to the AM side. Approve /
// Request changes live on hover; the card opens the full preview on click.
function ClientCard({ item, status, requestedNote, onApprove, onOpenPreview }: {
  item: Item; status: Status; requestedNote?: string; onApprove: () => void; onOpenPreview: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const post = toPost(item);
  // Approved / changes are settled; pending & updated are still the client's to act on.
  const decided = status === 'approved' || status === 'rejected';
  return (
    <div
      style={{ position: 'relative', width: CARD_W, height: CARD_H, flexShrink: 0, background: dark2, border: `1px solid ${dark4}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', opacity: status === 'approved' ? 0.7 : 1, transition: 'opacity 0.2s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { if (!(e.target as HTMLElement).closest('button, a, input, label')) onOpenPreview(); }}
    >
      <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 2px', flexShrink: 0 }}>
        <TypeIcon type={post.type} size={16} />
        <span style={{ fontSize: 14, color: dark80, fontFamily: F, flex: 1, letterSpacing: '0.14px' }}>{AM_TYPE_LABEL[post.type]}</span>
        <span style={{ fontSize: 12.5, color: dark40, fontFamily: F, letterSpacing: '0.12px', whiteSpace: 'nowrap' }}>{item.date}</span>
      </div>
      <CardBody post={post} />
      {decided && (
        <div style={{ padding: '0 14px 14px', marginTop: 'auto' }}>
          {status === 'approved' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: green, fontFamily: F, fontWeight: 500 }}>
              <Check2 size={16} color={green} /> Approved · scheduled
            </span>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: dark90, fontFamily: F, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>“{requestedNote || 'Changes requested, your team will revise this.'}”</p>
          )}
        </div>
      )}
      {status === 'updated' && (
        <div style={{ padding: '0 14px 14px', marginTop: 'auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--status-posting)', fontFamily: F, fontWeight: 500 }}>
            <Edit3 size={16} color="var(--status-posting)" /> Revised by your team · take another look
          </span>
        </div>
      )}
      {/* Hover overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', opacity: hovered ? 1 : 0, transition: 'opacity 0.18s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: hovered ? 'all' : 'none' }}>
        <div style={{ transform: hovered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(4px)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {decided ? (
            <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onOpenPreview(); }}>Review</Button>
          ) : (
            <>
              <Button variant="green" size="sm" frontIcon={Check2} onClick={(e) => { e.stopPropagation(); onApprove(); }}>Approve</Button>
              <Button variant="secondary" size="sm" frontIcon={Edit3} onClick={(e) => { e.stopPropagation(); onOpenPreview(); }}>Request changes</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
      {/* Header, type pill (left), date & time (top right) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px 16px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <TypeIcon size={18} color={meta.color} />
          <span style={{ fontSize: 15.5, color: dark80, fontFamily: F }}>{TYPE_LABEL[item.type]}</span>
          {item.slides ? <span style={{ fontSize: 13, color: dark60, fontFamily: F }}>· {item.slides} slides</span> : null}
        </span>
        <span style={{ fontSize: 13.5, color: dark60, fontFamily: F, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{item.date}</span>
      </div>

      {/* Preview, image types render true proportions; text types (Paid Search,
          Review responses) render their own mock, no image. */}
      {item.type === 'PaidSearch' ? (
        <div style={{ padding: '0 20px' }}>
          <div
            role="button" tabIndex={0} onClick={onOpenPreview}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenPreview(); } }}
            style={{ borderRadius: 10, border: `1px solid ${dark8}`, background: white, padding: '16px 18px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: dark90, fontFamily: F, border: '1px solid var(--dark-15)', borderRadius: 4, padding: '0 5px', lineHeight: '17px' }}>Ad</span>
              <span style={{ fontSize: 13, color: dark60, fontFamily: F }}>graindesignflooring.com</span>
            </div>
            <p style={{ margin: 0, fontSize: 18, color: '#1a0dab', fontFamily: F, lineHeight: 1.3 }}>{item.headline}</p>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: dark60, fontFamily: F, lineHeight: 1.55 }}>{item.caption}</p>
          </div>
        </div>
      ) : item.type === 'Reputation' ? (
        <div style={{ padding: '0 20px' }}>
          <div
            role="button" tabIndex={0} onClick={onOpenPreview}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenPreview(); } }}
            style={{ borderRadius: 10, border: `1px solid ${dark8}`, background: dark2, padding: '14px 16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <StarRow rating={item.rating ?? 5} />
              <span style={{ fontSize: 14, fontWeight: 500, color: dark90, fontFamily: F }}>{item.reviewer}</span>
              <span style={{ fontSize: 12, color: dark40, fontFamily: F, marginLeft: 'auto' }}>{item.source}</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: dark80, fontFamily: F, lineHeight: 1.55 }}>“{item.caption}”</p>
          </div>
        </div>
      ) : (
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
      )}

      {/* Title + caption. Paid Search shows nothing extra (the ad is the content);
          Reputation shows the drafted reply the client is signing off on. */}
      {item.type === 'PaidSearch' ? null : item.type === 'Reputation' ? (
        <div style={{ padding: '16px 20px 8px' }}>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: dark60, fontFamily: F, marginBottom: 4 }}>Drafted reply</span>
          <p style={{ margin: 0, fontSize: 16, color: dark80, fontFamily: F, lineHeight: 1.55, letterSpacing: '0.1px' }}>{REPLY_DRAFT[item.id]}</p>
        </div>
      ) : (
        <div style={{ padding: '16px 20px 8px' }}>
          {item.title && <Heading level={5} style={{ margin: '0 0 6px' }}>{item.title}</Heading>}
          <p style={{ margin: 0, fontSize: 16, color: dark80, fontFamily: F, lineHeight: 1.55, letterSpacing: '0.1px', whiteSpace: 'pre-wrap' }}>
            {item.caption}
          </p>
        </div>
      )}

      {/* Campaign, quiet metadata, moved below the caption */}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10 }}>
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

const Chevron = ({ open }: { open: boolean }) => (
  <span style={{ display: 'inline-flex', transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={dark40} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

// ── Collapsible content-type section, H3 header, chevron on the right. Paid
//    Social + Paid Search collapse into one "Paid Ads" section. ─────────────────
function ClientSection({ label, items, statuses, renderCard }: {
  label: string; items: Item[]; statuses: Record<number, Status>; renderCard: (i: Item) => React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  if (items.length === 0) return null;
  const meta = TYPE_META[items[0].type];
  const Icon = meta.icon;
  const pending = items.filter((i) => (statuses[i.id] ?? 'pending') === 'pending').length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
      >
        <Icon size={20} color={meta.color} />
        <span style={{ fontSize: 20, fontWeight: 400, color: dark90, fontFamily: F, letterSpacing: '-0.4px' }}>{label}</span>
        <span style={{ fontSize: 14, color: dark40, fontFamily: F }}>{items.length}</span>
        {pending > 0 && <span style={{ fontSize: 12, color: dark60, fontFamily: F, background: dark4, borderRadius: 99, padding: '1px 8px' }}>{pending} to review</span>}
        <span style={{ marginLeft: 'auto' }}><Chevron open={open} /></span>
      </button>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, alignItems: 'start' }}>
          {items.map(renderCard)}
        </div>
      )}
    </div>
  );
}

function ClientGroups({ itemsBySection, statuses, renderCard }: {
  itemsBySection: Record<Section, Item[]>; statuses: Record<number, Status>; renderCard: (i: Item) => React.ReactNode;
}) {
  const groups = SECTION_GROUPS
    .map((g) => ({ label: g.label, items: g.sections.flatMap((s) => itemsBySection[s]) }))
    .filter((g) => g.items.length > 0);
  if (groups.length === 0) {
    return <div style={{ padding: '48px 0', textAlign: 'center', color: dark40, fontFamily: F, fontSize: 14 }}>Nothing here yet.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {groups.map((group, i) => (
        <div key={group.label} style={{ borderTop: i > 0 ? `1px solid ${dark8}` : undefined, paddingTop: i > 0 ? 32 : 0, marginTop: i > 0 ? 32 : 0 }}>
          <ClientSection label={group.label} items={group.items} statuses={statuses} renderCard={renderCard} />
        </div>
      ))}
    </div>
  );
}

// The AM's note that ships with the current batch (shown in the grey banner).
const CURRENT_NOTE = 'Here’s this week’s batch for Grain Design Flooring. Approve anything that’s good to go, or leave a note on whatever you’d like changed. The paid ads are timed for the fall refinishing push, so start with those if you can. Thanks!';

// Previously-reviewed batches. Each carries the note the team sent with it and
// the pieces the client already signed off on.
interface Batch { id: string; title: string; dateRange: string; note: string; items: Item[] }
const PREVIOUS_BATCHES: Batch[] = [
  {
    id: 'b-oct1', title: 'Early October', dateRange: 'Sep 29 to Oct 5',
    note: 'First wave of the fall refinishing push. Mostly evergreen pieces plus the season kickoff post. Thanks for the quick turnaround on these!',
    items: [
      { id: 9001, type: 'Organic', section: 'organic', channelIcon: 'organic', campaign: 'Fall Refinishing', date: 'Sep 29 · 10:00 AM', img: IMG.hardwood, caption: 'Fall is the best time to refinish hardwood. Cooler, drier air means faster, cleaner cures. Booking now for October.' },
      { id: 9002, type: 'Blog', section: 'seo', channelIcon: 'seo', campaign: 'SEO Relevance Blogs', date: 'Sep 30 · 10:00 AM', title: 'How Long Does Hardwood Refinishing Take?', caption: 'A room by room breakdown of timelines, dry times, and what to expect while we work.' },
      { id: 9003, type: 'Paid', section: 'paid-social', channelIcon: 'paid', campaign: 'LVP Fall Promo', date: 'Oct 1 · 9:00 AM', img: IMG.livingRoom, caption: 'Waterproof luxury vinyl that looks like real oak. Free in home consult this fall.' },
    ],
  },
  {
    id: 'b-sep28', title: 'Late September', dateRange: 'Sep 22 to Sep 28',
    note: 'Reputation replies and a showroom reel. The Yelp response was softened per your last note. Let us know if the tone lands right.',
    items: [
      { id: 9101, type: 'Reel', section: 'organic', channelIcon: 'organic', campaign: 'Showroom', date: 'Sep 23 · 9:00 AM', img: IMG.install, caption: 'Two days, 1,400 sq ft of white oak. The satisfying part starts at 0:18.' },
      { id: 9102, type: 'Reputation', section: 'reputation', channelIcon: 'reputation', campaign: 'Reputation Management', date: 'Sep 24 · 1:00 PM', rating: 5, reviewer: 'Priya S.', source: 'Google', caption: 'Beautiful work on our stairs and hallway. The crew was on time every day.' },
      { id: 9103, type: 'PaidSearch', section: 'paid-search', channelIcon: 'paid', campaign: 'Fall Refinishing, Google', date: 'Sep 25 · 8:00 AM', headline: 'Dust-Free Hardwood Refinishing | Austin, TX', caption: 'Custom stains and a 10 year finish warranty. Free estimate in 24 hours.' },
    ],
  },
  {
    id: 'b-sep21', title: 'Mid September', dateRange: 'Sep 15 to Sep 21',
    note: 'The swatch carousel and the showroom newsletter. Small copy tweaks from your feedback are in. All set to publish.',
    items: [
      { id: 9201, type: 'Carousel', section: 'organic', channelIcon: 'organic', campaign: 'Fall Hardwood Showcase', date: 'Sep 16 · 11:00 AM', img: IMG.swatch, slides: 5, caption: 'Five hardwood tones we are specifying most this season. Which would you pick?' },
      { id: 9202, type: 'Email', section: 'organic', channelIcon: 'organic', campaign: 'Showroom Newsletter', date: 'Sep 18 · 8:00 AM', img: IMG.showroom, title: 'New in the showroom this month', caption: 'Three wide plank white oak collections and a matte herringbone tile. Open Sat 10 to 4.' },
    ],
  },
];

// Modal listing previous batches; selecting one opens it on the main screen.
function PreviousBatchesModal({ batches, onSelect, close }: { batches: Batch[]; onSelect: (id: string) => void; close: () => void }) {
  return (
    <Modal.Root size="md" onClose={close}>
      <Modal.Header title="Previous batches" onClose={close} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {batches.map((b) => (
            <button
              key={b.id}
              onClick={() => { onSelect(b.id); close(); }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', width: '100%', background: 'transparent', border: `1px solid ${dark8}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', fontFamily: F }}
              onMouseEnter={(e) => { e.currentTarget.style.background = dark2; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: dark90 }}>{b.title}</span>
                  <span style={{ fontSize: 13, color: dark40 }}>{b.dateRange} · {b.items.length} {b.items.length === 1 ? 'piece' : 'pieces'}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: dark60, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{b.note}</p>
              </div>
              <span style={{ display: 'inline-flex', flexShrink: 0, marginTop: 2, color: dark40 }}><ChevronRight size={16} color={dark40} /></span>
            </button>
          ))}
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

/**
 * Client Approvals page. Current batch grouped by content type in collapsible
 * sections; a header button opens a modal of previous batches, each of which can
 * be opened on the main screen (with a back button to the current batch).
 */
export function Approvals({ sub: _sub }: { sub?: string }) {
  const { state } = useClientState();
  const { showToast } = useToast();
  const { openModal } = useModals();

  // Current batch is what the client acts on now; previous batches are decided
  // history revealed via the header toggle. Previous items seed as approved.
  const CURRENT = useMemo(() => ITEMS.filter((i) => i.batch !== 'previous'), []);

  const [statuses, setStatuses] = useState<Record<number, Status>>(() => {
    const initial: Record<number, Status> = {};
    CURRENT.forEach((i) => {
      initial[i.id] = UPDATED_SEED.includes(i.id) ? 'updated'
        : CHANGES_SEED[i.id] ? 'rejected'
        : APPROVED_SEED.includes(i.id) ? 'approved'
        : 'pending';
    });
    return initial;
  });
  const [notes, setNotes] = useState<Record<number, string>>(() => ({ ...CHANGES_SEED, ...UPDATED_NOTES }));
  // Which batch is on screen: null = the current batch, else a previous batch id.
  const [viewBatchId, setViewBatchId] = useState<string | null>(null);
  const selectedBatch = viewBatchId ? PREVIOUS_BATCHES.find((b) => b.id === viewBatchId) ?? null : null;

  // Status filter subtab. Deep-linkable via the route param (Home's "updated
  // designs" notification lands straight on the Updated tab).
  const initialSub = (CLIENT_TABS.some((t) => t.key === _sub) ? _sub : 'in-review') as Subtab;
  const [subtab, setSubtab] = useState<Subtab>(initialSub);

  // Cold, account is still being set up pre-go-live. Nothing to approve yet, so
  // omit the steady topbar controls and show the shared explanatory state. (All
  // hooks run above this line — the early return must stay below them.)
  if (state !== 'steady') {
    return (
      <ClientShell section="approvals">
        <ColdState
          icon={ApprovalsIcon}
          title="Approvals open when you go live."
          description="This is where you’ll review and sign off on everything before it’s published, nothing goes out without your OK."
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

  const countByStatus = (st: Status) => CURRENT.filter((i) => (statuses[i.id] ?? 'pending') === st).length;
  const totalPending = countByStatus('pending');

  const approve = (id: number) => {
    setStatuses((prev) => ({ ...prev, [id]: 'approved' }));
    showToast({ variant: 'success', message: 'Approved' });
  };
  const requestChanges = (id: number, note?: string) => {
    setStatuses((prev) => ({ ...prev, [id]: 'rejected' }));
    setNotes((prev) => ({ ...prev, [id]: note?.trim() ?? '' }));
    showToast({ message: note?.trim() ? 'Changes sent. Your team will revise this.' : 'Changes requested. Your team will revise this.' });
  };
  const approveAll = () => {
    setStatuses((prev) => {
      const next = { ...prev };
      CURRENT.forEach((i) => { if (next[i.id] === 'pending') next[i.id] = 'approved'; });
      return next;
    });
    showToast({ variant: 'success', message: 'Approved everything pending' });
  };

  // Status subtabs (mirror the AM side). Only the current batch is filterable;
  // a selected previous batch is read-only history, so no subtabs there.
  const subtabs = selectedBatch ? undefined : (
    <div style={{ display: 'inline-flex', gap: 2, flexWrap: 'nowrap', alignItems: 'center' }}>
      {CLIENT_TABS.map((t, i) => (
        <span key={t.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          {i > 0 && <StatusTabChevron />}
          <TabChip selected={subtab === t.key} onSelect={() => setSubtab(t.key)} style={statusTabStyle(t.key, subtab === t.key)}>
            {/* Client counters live on the two states that need their attention
               (In review, Updated); Requested changes is already settled. */}
            <StatusTabContent
              status={t.key}
              selected={subtab === t.key}
              count={t.key === 'in-review' ? totalPending : t.key === 'updated' ? countByStatus('updated') : undefined}
            />
          </TabChip>
        </span>
      ))}
    </div>
  );

  // "Previous batches" now lives on the right, next to the avatar.
  const topbarRight = selectedBatch || PREVIOUS_BATCHES.length === 0 ? undefined : (
    <Button variant="tertiary" size="sm" onPress={() => openModal(PreviousBatchesModal, { batches: PREVIOUS_BATCHES, onSelect: setViewBatchId })}>
      Previous batches
    </Button>
  );

  // The visible pieces: a selected previous batch, else the current batch
  // filtered to the active status subtab.
  const visible = selectedBatch
    ? selectedBatch.items
    : CURRENT.filter((i) => (statuses[i.id] ?? 'pending') === SUBTAB_STATUS[subtab]);
  const visiblePosts = visible.map(toPost);
  const byId: Record<number, Item> = Object.fromEntries(visible.map((i) => [i.id, i]));
  const statusFor = (id: number): Status => (selectedBatch ? 'approved' : (statuses[id] ?? 'pending'));

  // The preview modal only knows pending / approved / rejected; surface an
  // 'updated' piece as pending so it reads as ready for another review.
  const previewStatuses: Record<number, 'pending' | 'approved' | 'rejected'> = selectedBatch
    ? Object.fromEntries(visible.map((i) => [i.id, 'approved' as const]))
    : Object.fromEntries(CURRENT.map((i) => {
        const s = statuses[i.id] ?? 'pending';
        return [i.id, s === 'updated' ? 'pending' : s];
      }));

  const openPreviewFor = (item: Item) => openModal(PostPreviewModal, {
    items: visible,
    initialIndex: visible.findIndex((i) => i.id === item.id),
    typeMeta: TYPE_META,
    typeLabel: TYPE_LABEL,
    replyDrafts: REPLY_DRAFT,
    initialStatuses: previewStatuses,
    initialNotes: notes,
    rejectedIds: visible.filter((i) => statusFor(i.id) === 'rejected').map((i) => i.id),
    updatedIds: visible.filter((i) => statusFor(i.id) === 'updated').map((i) => i.id),
    updatedReplies: UPDATED_REPLIES,
    onApprove: (id: number) => approve(id),
    onRequestChanges: (id: number, note: string) => requestChanges(id, note),
  });

  const renderCard = (post: AmPost) => {
    const item = byId[post.id];
    return (
      <ClientCard
        key={post.id}
        item={item}
        status={statusFor(item.id)}
        requestedNote={notes[item.id]}
        onApprove={() => approve(item.id)}
        onOpenPreview={() => openPreviewFor(item)}
      />
    );
  };

  // The note lives on the In review tab (and on any opened previous batch); it's
  // the team's message for the pieces still awaiting the client's first look.
  const showNote = selectedBatch ? true : subtab === 'in-review';
  const subtabLabel = CLIENT_TABS.find((t) => t.key === subtab)?.label.toLowerCase() ?? '';

  const title = selectedBatch ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton variant="ghost" size="sm" icon={ArrowLeft} aria-label="Back to current batch" onPress={() => setViewBatchId(null)} />
      <Text variant="largeList" style={{ color: dark90, fontWeight: 500 }}>{selectedBatch.title}<span style={{ color: dark40, fontWeight: 400 }}> · {selectedBatch.dateRange}</span></Text>
    </div>
  ) : (
    <Text variant="largeList" style={{ color: dark90, fontWeight: 500 }}>Approvals</Text>
  );

  return (
    <ClientShell section="approvals" title={title} topbarCenter={subtabs} topbarRight={topbarRight}>
      <div style={{ maxWidth: PAGE_W, margin: '0 auto', padding: '20px 4px 60px' }}>

        {/* The team's note. On the In review tab it also carries the pending
            count + the primary Approve-all action, on the right under the message. */}
        {showNote && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: dark2, border: `1px solid ${dark8}`, borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 32, height: 32, borderRadius: 99, flexShrink: 0, background: 'var(--brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: dark90, fontFamily: F }}>D</span>
              <Text variant="primary" style={{ color: dark90, lineHeight: 1.55 }}>{selectedBatch ? selectedBatch.note : CURRENT_NOTE}</Text>
            </div>
            {!selectedBatch && totalPending > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                <Text variant="secondary" style={{ color: dark60 }}>{totalPending} pending</Text>
                <Button variant="secondary" size="lg" frontIcon={Check2} onPress={approveAll}>
                  Approve all
                </Button>
              </div>
            )}
          </div>
        )}

        {visiblePosts.length > 0 ? (
          <ContentTypeSections posts={visiblePosts} renderCard={renderCard} />
        ) : (
          <div style={{ padding: '56px 0', textAlign: 'center', color: dark40, fontFamily: F, fontSize: 14 }}>
            {selectedBatch ? 'Nothing in this batch.' : `Nothing in ${subtabLabel}.`}
          </div>
        )}
      </div>
    </ClientShell>
  );
}
