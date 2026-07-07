import { useState, useRef, useEffect, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { PrototypeShell, H2_SECTIONS } from '../_shell';
import { Button, IconButton, Text, Modal, ModalStack, useModals, type StackModalProps } from '@/components';
import { Toast, StatusPill as DSStatusPill, Checkbox, Avatar, TextField, Pill, Toggle as DSToggle } from '@/staging';
import type { IconProps } from '@/icons/Types';
import { Approvals as ApprovalsIcon, Check2, EyeOpen, ArrowLeft, ArrowRight, Globe, CalendarEdit, Settings } from '@/icons/20';
import { Maximise01 } from '@/icons/20/Maximise01';
import { Minimise02 } from '@/icons/20/Minimise02';
import { Layers5 } from '@/icons/24';
import { ChevronDown, ChevronRight } from '@/icons/16';
// Post-preview chrome icons (ported 1:1 from the dfy-client PostPreviewModal).
import MoreDots from '@/icons/20/MoreDots';
import Comment from '@/icons/20/Comment';
import Edit1 from '@/icons/20/Edit1';
import Templates from '@/icons/20/Templates';
import Stars from '@/icons/20/Stars';
import Images from '@/icons/20/Images';
import UserProfileAdd from '@/icons/20/UserProfileAdd';
import Google from '@/icons/20/Google';
import ChevronLeftLg from '@/icons/24/ChevronLeft';
import Heart from '@/icons/24/Heart';
import Send from '@/icons/16/Send';
import InstagramBrand from '@/icons/24/InstagramBrand';
import FacebookBrand from '@/icons/35/FacebookBrand';
import LinkedInBrand from '@/icons/32/LinkedInBrand';
import TwitterBrand from '@/icons/20/TwitterBrand';
import Paperclip from '@/icons/24/Paperclip';
import ArrowUp from '@/icons/20/ArrowUp';
import { useDfyState } from './lib/dev-state';

// ── Image assets (Figma + Unsplash fallbacks) ─────────────────────────────────
const IMG_AVATAR = 'https://www.figma.com/api/mcp/asset/04425bfb-30dc-45d9-9537-cd0d3ca4cfbb';
// Unsplash
const U1 = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop'; // restaurant table
const U2 = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop'; // food plate
const U3 = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop'; // healthy vegetables
const U4 = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop'; // cooking
const U5 = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop'; // healthy bowl
const U6 = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop'; // laptop/business
const U7 = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop'; // business portrait
const U8 = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop'; // food spread

// ── Tokens ────────────────────────────────────────────────────────────────────
const F = "'Sohne', sans-serif";
const dark90  = 'rgba(0,0,0,0.9)';
const dark80  = 'rgba(0,0,0,0.8)';
const dark60  = 'rgba(0,0,0,0.6)';
const dark40  = 'rgba(0,0,0,0.4)';
const dark15  = 'rgba(0,0,0,0.15)';
const dark8   = 'rgba(0,0,0,0.08)';
const dark4   = 'rgba(0,0,0,0.04)';
const dark2   = 'rgba(0,0,0,0.02)';
const green   = '#20a14f';
const green10 = 'rgba(32,161,79,0.1)';
const red     = '#ae2222';
const white   = '#ffffff';

// ── Types ─────────────────────────────────────────────────────────────────────
type Status = 'pending' | 'approved' | 'rejected';
type ContentType = 'still' | 'carousel' | 'story' | 'short' | 'feed-video' | 'email' | 'blog';

interface Post {
  id: number;
  type: ContentType;
  date: string;          // display label
  dateSort: string;      // ISO string for sorting
  caption: string;
  img?: string;
  slides?: number;
}

interface Campaign {
  id: number;
  name: string;
  dateRange: string;
  badge: string;
  endDate: string; // ISO date string for past/active logic
  posts: Post[];
}

// ── Data ──────────────────────────────────────────────────────────────────────
const CAMPAIGNS: Campaign[] = [
  {
    id: 0,
    name: 'Eat Well Feel Better',
    dateRange: 'Sept 28 – Oct 18',
    badge: 'Campaigns',
    endDate: '2026-10-18', // future — active
    posts: [
      { id:0, type:'still',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:00', img:U1, caption:'Get ready to take a trip down memory lane with our latest design. Experience the finest dining in the heart of the city — where every plate tells a story and every bite is crafted with love. Reserve your table now and treat yourself to something extraordinary. 🍽️ #FineD' },
      { id:1, type:'story',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:01', img:U2, caption:'Get access to exclusive loyalty discounts and savings this fall! Limited time offer for our valued members — earn points on every purchase, unlock early access to seasonal menus, and enjoy complimentary desserts on your birthday. Join the family today and taste the difference. 🍂' },
      { id:2, type:'feed-video', date:'Sep 25  10:00am', dateSort:'2025-09-25T10:02', img:U3, caption:'Behind the scenes of our latest farm-to-table experience. Watch how we source the freshest ingredients straight from local growers who share our passion for quality. From the field to your fork in under 24 hours — this is food with a story worth telling. 🌿 #FarmToTable' },
      { id:3, type:'story',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:03', img:U4, caption:'Limited time offer — shop now and save 25% on all meal prep kits this weekend only! Stock your fridge with chef-curated recipes designed to save you time without sacrificing flavor. Healthy eating has never been this easy or this delicious. Use code PREP25 at checkout. 🥗' },
      { id:4, type:'carousel',   date:'Sep 25  10:00am', dateSort:'2025-09-25T10:04', img:U5, slides:5, caption:'Spring is here — swipe through our top 5 seasonal picks for a healthier you! From vibrant grain bowls to refreshing smoothie blends, our nutrition team has curated the best of the season. Tap each slide to see the full recipe and order your ingredients directly from our app. 🌸' },
      { id:5, type:'still',      date:'Sep 26  10:00am', dateSort:'2025-09-26T10:00', img:U6, caption:'Wellness tips for the modern professional. Eat better, live better, feel better every day. We know how busy life gets, which is why we\'ve designed meal plans that fit around your schedule — not the other way around. Fuel your ambitions with food that actually works as hard as you do. 💪' },
      { id:6, type:'carousel',   date:'Sep 27  11:00am', dateSort:'2025-09-27T11:00', img:U7, slides:4, caption:'Our top picks for the season — curated by our nutrition experts for optimal health and maximum flavor. Swipe to explore four standout dishes that hit every macro target while keeping your taste buds guessing. Perfect for meal-preppers and food lovers alike. Tag a friend who needs to see this! 🏆' },
      { id:7, type:'email',      date:'Sep 28  8:00am',  dateSort:'2025-09-28T08:00', img:U8, caption:'Snag 20% off — limited time sale this weekend only! Don\'t miss our biggest discount of the year across the entire menu. Whether you\'re stocking up on staples or trying something new, now\'s the time to go big. Shop before midnight Sunday and use code SAVE20 to claim your discount. ⏰' },
    ],
  },
  {
    id: 1,
    name: 'SEO Relevance Blogs',
    dateRange: 'Sept 28 – Oct 18',
    badge: 'SEO',
    endDate: '2026-10-18', // future — active
    posts: [
      { id:100, type:'blog', date:'Sep 25  10:00am', dateSort:'2025-09-25T10:00', img:U6, caption:'Unleashing Business Potential with AI: Transformative Tools for Your Company' },
      { id:101, type:'blog', date:'Sep 26  10:00am', dateSort:'2025-09-26T10:00', img:U7, caption:'Unleashing Business Potential with AI: Transformative Tools for Your Company' },
      { id:102, type:'blog', date:'Sep 27  10:00am', dateSort:'2025-09-27T10:00', img:U2, caption:'Unleashing Business Potential with AI: Transformative Tools for Your Company' },
    ],
  },
  // ── Past campaigns (end date has passed) ──────────────────────────────────
  {
    id: 2,
    name: 'Spring Sale 2025',
    dateRange: 'Mar 15 – Apr 5',
    badge: 'Campaigns',
    endDate: '2025-04-05', // past
    posts: [
      { id:200, type:'still',    date:'Mar 15  10:00am', dateSort:'2025-03-15T10:00', img:U1, caption:'Spring into savings — our biggest sale of the season starts now.' },
      { id:201, type:'carousel', date:'Mar 18  9:00am',  dateSort:'2025-03-18T09:00', img:U3, slides:4, caption:'4 reasons to shop our spring collection this weekend.' },
      { id:202, type:'email',    date:'Mar 22  8:00am',  dateSort:'2025-03-22T08:00', img:U8, caption:'Don\'t miss out — spring deals end Sunday!' },
    ],
  },
  {
    id: 3,
    name: 'Valentine\'s Day Push',
    dateRange: 'Feb 1 – Feb 14',
    badge: 'Campaigns',
    endDate: '2025-02-14', // past
    posts: [
      { id:300, type:'still',      date:'Feb 1  10:00am', dateSort:'2025-02-01T10:00', img:U4, caption:'Show your love with our Valentine\'s Day gift guide.' },
      { id:301, type:'story',      date:'Feb 7  9:00am',  dateSort:'2025-02-07T09:00', img:U5, caption:'Share the love — limited edition Valentine\'s specials.' },
      { id:302, type:'feed-video', date:'Feb 12  2:00pm', dateSort:'2025-02-12T14:00', img:U2, caption:'Behind the scenes of our Valentine\'s Day photoshoot.' },
      { id:303, type:'email',      date:'Feb 13  8:00am', dateSort:'2025-02-13T08:00', img:U7, caption:'Last chance — Valentine\'s deals expire at midnight!' },
    ],
  },
];

const TYPE_LABEL: Record<ContentType, string> = {
  still: 'Still Image', carousel: 'Carousel', story: 'Story',
  short: 'Short', 'feed-video': 'Feed Video', email: 'Email', blog: 'Blog',
};

// ── Client review (shared source of truth) ─────────────────────────────────────
// The client's verdicts on the active campaign's posts. One place drives three
// surfaces: the reviewed/steady Approvals groupings (returned / approved-by-
// client), the in-preview chat thread, and the connected Home feed items.
export interface ClientReview {
  status: 'approved' | 'changes';
  comment?: string;   // present for change requests — shown as a chat bubble
  author: string;
  initials: string;
  time: string;
}
export const CLIENT_REVIEW: Record<number, ClientReview> = {
  0: { status: 'approved', author: 'Sarah', initials: 'SJ', time: '3h ago' },
  1: { status: 'changes',  author: 'Sarah', initials: 'SJ', time: '2h ago', comment: 'The offer text gets a little lost against the plating shot — can we bump up the size and add more contrast?' },
  2: { status: 'approved', author: 'Sarah', initials: 'SJ', time: '3h ago' },
  4: { status: 'changes',  author: 'Sarah', initials: 'SJ', time: '2h ago', comment: 'Can the lead slide open with the sage Lakeway exterior instead of the navy one? That’s the look we want for summer.' },
  5: { status: 'approved', author: 'Sarah', initials: 'SJ', time: '4h ago' },
};

// ── Home-feed projections of the client review ─────────────────────────────────
export interface HomeChangeRequest { postId: number; campaign: string; type: ContentType; typeLabel: string; comment: string; author: string; initials: string; time: string }
export function approvalsChangeRequests(): HomeChangeRequest[] {
  return Object.entries(CLIENT_REVIEW)
    .filter(([, r]) => r.status === 'changes' && r.comment)
    .map(([id, r]) => {
      const pid = Number(id);
      const campaign = CAMPAIGNS.find(c => c.posts.some(p => p.id === pid))!;
      const post = campaign.posts.find(p => p.id === pid)!;
      return { postId: pid, campaign: campaign.name, type: post.type, typeLabel: TYPE_LABEL[post.type], comment: r.comment!, author: r.author, initials: r.initials, time: r.time };
    });
}
export interface HomeApprovedGroup { campaign: string; count: number; thumbs: string[] }
export function approvalsApprovedGroups(): HomeApprovedGroup[] {
  const groups = new Map<string, HomeApprovedGroup>();
  Object.entries(CLIENT_REVIEW)
    .filter(([, r]) => r.status === 'approved')
    .forEach(([id]) => {
      const pid = Number(id);
      const campaign = CAMPAIGNS.find(c => c.posts.some(p => p.id === pid))!;
      const post = campaign.posts.find(p => p.id === pid)!;
      const g = groups.get(campaign.name) ?? { campaign: campaign.name, count: 0, thumbs: [] };
      g.count++;
      if (post.img && g.thumbs.length < 4) g.thumbs.push(post.img);
      groups.set(campaign.name, g);
    });
  return [...groups.values()];
}

// ── Status pill ───────────────────────────────────────────────────────────────
const purple = '#7f24b7';

function StatusPill({ status, dontPostReasons, isPast, resubmitNote, requestedChange, tooltipPlacement = 'above' }: { status: Status; dontPostReasons?: string[]; isPast?: boolean; resubmitNote?: string; requestedChange?: boolean; tooltipPlacement?: 'above' | 'below' }) {
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const isDontPost = status === 'rejected';
  const isPosted  = isPast && status === 'approved';
  const isFailed  = isPast && status === 'pending';
  const isResubmitted = !isPast && status === 'pending' && !!resubmitNote;
  const cfg =
    isPosted ? {
      bg: white, overlay: 'rgba(127,36,183,0.08)',
      border: 'rgba(127,36,183,0.25)', color: purple, label: 'Posted',
    } :
    isFailed ? {
      bg: white, overlay: dark4,
      border: dark15, color: dark60, label: 'Failed',
    } :
    requestedChange ? {
      // Matches the BDS StatusPill `danger` tone (rgba(188,1,11) / --red-90).
      bg: white, overlay: 'rgba(188,1,11,0.08)',
      border: 'rgba(188,1,11,0.2)', color: 'var(--red-90)', label: 'Requested change',
    } :
    status === 'approved' ? {
      bg: white, overlay: 'rgba(32,161,79,0.1)',
      border: 'rgba(32,161,79,0.25)', color: green, label: 'Approved',
    } :
    isDontPost ? {
      bg: white, overlay: 'rgba(174,34,34,0.08)',
      border: 'rgba(174,34,34,0.3)', color: '#ae2222', label: "Don't Post",
    } : isResubmitted ? {
      bg: white, overlay: 'rgba(255,174,0,0.3)',
      border: 'rgba(255,174,0,0.45)', color: '#7a4800', label: 'Review V2',
    } : {
      bg: white, overlay: 'rgba(255,174,0,0.3)',
      border: 'rgba(255,174,0,0.45)', color: '#7a4800', label: 'Review',
    };

  const hasReasons = isDontPost && dontPostReasons && dontPostReasons.length > 0;
  const hasTooltip = hasReasons || isResubmitted;
  const tooltipLines = hasReasons ? dontPostReasons! : resubmitNote ? [resubmitNote] : [];
  const tooltipLabel = hasReasons ? 'Reason' : 'Agent Note';

  return (
    <>
      <span
        style={{ display: 'inline-flex', alignItems: 'center' }}
        onMouseEnter={e => {
          if (!hasTooltip) return;
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setTooltipPos({ x: r.left, y: r.top });
        }}
        onMouseLeave={() => setTooltipPos(null)}
      >
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 4,
          padding:'2px 6px', borderRadius:4,
          backgroundColor: cfg.bg,
          backgroundImage: `linear-gradient(${cfg.overlay}, ${cfg.overlay})`,
          border:`1px solid ${cfg.border}`,
          fontSize:11, fontWeight:400, color:cfg.color, fontFamily:F,
          letterSpacing:'0.22px', whiteSpace:'nowrap',
          cursor: hasReasons ? 'default' : 'inherit',
        }}>
          {cfg.label}
          {/* Only show the info glyph when there's actually a tooltip to reveal. */}
          {hasTooltip && (
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M6.5 6C6.5 5.17 7.17 4.5 8 4.5C8.83 4.5 9.5 5.17 9.5 6C9.5 6.83 8 7.5 8 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
            </svg>
          )}
        </span>
      </span>
      {tooltipPos && hasTooltip && createPortal(
        <div style={{
          position: 'fixed', left: tooltipPos.x,
          ...(tooltipPlacement === 'below'
            ? { top: tooltipPos.y + 28 }
            : { top: tooltipPos.y, transform: 'translateY(calc(-100% - 8px))' }),
          background: dark90, color: white, borderRadius: 6,
          padding: '8px 10px', fontSize: 11, fontFamily: F, lineHeight: 1.6,
          whiteSpace: 'nowrap', zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontWeight: 500, marginBottom: 4, opacity: 0.7, fontSize: 10, letterSpacing: '0.2px', textTransform: 'uppercase' }}>{tooltipLabel}</div>
          {tooltipLines.map(r => <div key={r}>• {r}</div>)}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Type icons — exact SVG paths uploaded by designer ────────────────────────
function TypeIcon({ type, size = 14 }: { type: ContentType; size?: number }) {
  switch (type) {
    case 'still': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4.29654 18.4715C4.10128 18.6667 4.10128 18.9833 4.29654 19.1786C4.49181 19.3738 4.80839 19.3738 5.00365 19.1786L4.6501 18.825L4.29654 18.4715ZM8.8501 14.625L9.20365 14.2715C9.00839 14.0762 8.69181 14.0762 8.49654 14.2715L8.8501 14.625ZM10.9501 16.725L10.5965 17.0786C10.7918 17.2738 11.1084 17.2738 11.3037 17.0786L10.9501 16.725ZM15.6751 12L16.0287 11.6465C15.8334 11.4512 15.5168 11.4512 15.3215 11.6465L15.6751 12ZM19.5215 16.5536C19.7168 16.7488 20.0334 16.7488 20.2287 16.5536C20.4239 16.3583 20.4239 16.0417 20.2287 15.8465L19.8751 16.2L19.5215 16.5536ZM4.6501 18.825L5.00365 19.1786L9.20365 14.9786L8.8501 14.625L8.49654 14.2715L4.29654 18.4715L4.6501 18.825ZM8.8501 14.625L8.49654 14.9786L10.5965 17.0786L10.9501 16.725L11.3037 16.3715L9.20365 14.2715L8.8501 14.625ZM10.9501 16.725L11.3037 17.0786L16.0287 12.3536L15.6751 12L15.3215 11.6465L10.5965 16.3715L10.9501 16.725ZM15.6751 12L15.3215 12.3536L19.5215 16.5536L19.8751 16.2L20.2287 15.8465L16.0287 11.6465L15.6751 12ZM6.7501 3.60001V4.10001H17.2501V3.60001V3.10001H6.7501V3.60001ZM20.4001 6.75001H19.9001V17.25H20.4001H20.9001V6.75001H20.4001ZM17.2501 20.4V19.9H6.7501V20.4V20.9H17.2501V20.4ZM3.6001 17.25H4.1001V6.75001H3.6001H3.1001V17.25H3.6001ZM6.7501 20.4V19.9C5.28654 19.9 4.1001 18.7136 4.1001 17.25H3.6001H3.1001C3.1001 19.2658 4.73426 20.9 6.7501 20.9V20.4ZM20.4001 17.25H19.9001C19.9001 18.7136 18.7137 19.9 17.2501 19.9V20.4V20.9C19.2659 20.9 20.9001 19.2658 20.9001 17.25H20.4001ZM17.2501 3.60001V4.10001C18.7137 4.10001 19.9001 5.28645 19.9001 6.75001H20.4001H20.9001C20.9001 4.73417 19.2659 3.10001 17.2501 3.10001V3.60001ZM6.7501 3.60001V3.10001C4.73426 3.10001 3.1001 4.73417 3.1001 6.75001H3.6001H4.1001C4.1001 5.28645 5.28654 4.10001 6.7501 4.10001V3.60001ZM9.9001 8.32501H9.4001C9.4001 8.91871 8.9188 9.40001 8.3251 9.40001V9.90001V10.4C9.47109 10.4 10.4001 9.471 10.4001 8.32501H9.9001ZM8.3251 9.90001V9.40001C7.73139 9.40001 7.2501 8.91871 7.2501 8.32501H6.7501H6.2501C6.2501 9.471 7.17911 10.4 8.3251 10.4V9.90001ZM6.7501 8.32501H7.2501C7.2501 7.7313 7.73139 7.25001 8.3251 7.25001V6.75001V6.25001C7.17911 6.25001 6.2501 7.17902 6.2501 8.32501H6.7501ZM8.3251 6.75001V7.25001C8.9188 7.25001 9.4001 7.7313 9.4001 8.32501H9.9001H10.4001C10.4001 7.17902 9.47109 6.25001 8.3251 6.25001V6.75001Z" fill="#FD4242"/>
      </svg>
    );
    case 'carousel': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M16.587 2.1565C17.4502 2.03277 18.2505 2.63469 18.3712 3.4983L18.5313 4.65162L22.1182 5.7151C22.8977 5.94639 23.3514 6.75697 23.1407 7.54225L19.6319 20.6028C19.4193 21.3924 18.6128 21.8665 17.8194 21.6682L11.2374 20.0227C11.1029 19.989 10.9944 19.9036 10.9288 19.7932L4.96686 20.6497C4.10357 20.7735 3.30333 20.1716 3.18268 19.3079L1.31842 5.93287C1.19893 5.07398 1.79691 4.2797 2.65534 4.1565L16.587 2.1565ZM19.1358 18.595C19.0594 18.6183 18.9809 18.638 18.8995 18.6497L13.1631 19.4729L18.0626 20.6985C18.3269 20.7643 18.5962 20.6061 18.6671 20.343L19.1358 18.595ZM12.2559 14.3596C12.0881 14.5818 11.7845 14.6516 11.5362 14.5256L8.99518 13.2346L4.32135 18.0823C4.28126 18.1238 4.23448 18.1551 4.18659 18.1819L4.32233 19.1497C4.35526 19.3823 4.57112 19.5453 4.80377 19.512L18.7354 17.512C18.9668 17.4787 19.1277 17.264 19.0958 17.0325L18.5176 12.886C18.4951 12.8743 18.4717 12.8628 18.4503 12.8479L15.1426 10.5335L12.2559 14.3596ZM16.751 3.29518L2.81842 5.29518C2.5869 5.32841 2.42505 5.54205 2.4571 5.77369L3.98932 16.7678L8.46295 12.1311L8.53327 12.0686C8.70617 11.9394 8.94061 11.9168 9.13776 12.0169L11.627 13.2825L14.5596 9.39772C14.7462 9.15101 15.0952 9.09636 15.3487 9.27369L18.3018 11.3411L17.2315 3.65748C17.199 3.42451 16.9839 3.26204 16.751 3.29518ZM20.0176 15.3128L22.1749 7.28346C22.2452 7.02174 22.0938 6.75129 21.834 6.67408L18.6837 5.73951L20.0176 15.3128ZM6.21002 7.2024C6.89628 7.10416 7.53221 7.58067 7.63092 8.26686C7.72935 8.95332 7.25291 9.59014 6.56647 9.68873C5.88003 9.78721 5.24328 9.31065 5.1446 8.62428C5.04606 7.93771 5.52345 7.30094 6.21002 7.2024Z" fill="#EF6800"/>
      </svg>
    );
    case 'story': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M14.875 14.25L11.5 13.125V8.42087M20.5 12C20.5 7.02944 16.4706 3 11.5 3C6.52944 3 2.5 7.02944 2.5 12C2.5 16.9706 6.52944 21 11.5 21C12.0768 21 12.6409 20.9457 13.1875 20.8421M15.4375 18.1875L17.125 19.875L21.625 15.375" stroke="#FF37CA" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'short': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M10.3333 5H13.6667M6 4.5V19.5C6 20.8807 6.89543 22 8 22H16C17.1046 22 18 20.8807 18 19.5V4.50001C18 3.1193 17.1046 2.00002 16 2.00001L8 2C6.89543 2 6 3.11929 6 4.5Z" stroke="#00AAFF" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'feed-video': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12.1055 8.83333H9.3555M15.8752 14.3867L20.5252 16.6771C21.0072 16.9705 21.513 16.7976 21.5 16.1856L21.4674 8.09104C21.4262 7.42667 21.0341 7.24539 20.4568 7.55242L15.8621 9.64057M5.25 18.5H13.6055C14.8481 18.5 15.8555 17.5051 15.8555 16.2778L15.8752 13.4275L15.8555 7.72222C15.8555 6.49492 14.8481 5.5 13.6055 5.5H5.25C4.00736 5.5 3 6.49492 3 7.72222V16.2778C3 17.5051 4.00736 18.5 5.25 18.5Z" stroke="#6A00FF" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'email': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4.6875 6.75L11.3596 11.5403C11.7449 11.8168 12.2551 11.8168 12.6404 11.5403L19.3125 6.75M5.25 19H18.75C19.9926 19 21 17.9553 21 16.6667V7.33333C21 6.04467 19.9926 5 18.75 5H5.25C4.00736 5 3 6.04467 3 7.33333V16.6667C3 17.9553 4.00736 19 5.25 19Z" stroke="#FFAE00" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'blog': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M8.40033 7.20001H15.6003M8.40033 10.8H15.6003M8.40033 14.4H12.0003M6.60004 2.40001H17.4003C18.7258 2.40001 19.8003 3.47455 19.8003 4.80005L19.8 19.2001C19.8 20.5255 18.7254 21.6 17.4 21.6L6.59994 21.6C5.27446 21.5999 4.19994 20.5254 4.19995 19.1999L4.20004 4.8C4.20005 3.47452 5.27457 2.40001 6.60004 2.40001Z" stroke="#20A14F" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    default: return null;
  }
}

// ── Content card — 245×378px, dark-2 bg, Figma spec ─────────────────────────
function ContentCard({
  post, status, dontPostReasons, resubmitNote, isPast, onApprove, onRemoveApproval, onReview,
}: {
  post: Post; status: Status; dontPostReasons?: string[]; resubmitNote?: string; isPast?: boolean;
  onApprove: () => void; onRemoveApproval: () => void; onReview: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isApproved = status === 'approved';
  const isDraft    = status === 'rejected';
  const isBlog     = post.type === 'blog';

  // Header height: pt-12 + icon(14) + pb-2 = ~34px
  // Caption area: ~58px (2 lines × 18px + 10px top + 8px bottom)
  const CARD_H   = 378;
  const HEADER_H = 36;
  // Portrait types fill the card with just the image (no caption section)
  const isPortrait = post.type === 'story' || post.type === 'short' || post.type === 'feed-video';
  // Landscape types (still/carousel): grouped caption+image with shadow
  const isLandscape = post.type === 'still' || post.type === 'carousel';

  return (
    <div
      style={{
        position: 'relative', width: 245, height: CARD_H, flexShrink: 0,
        background: dark2, border: `1px solid ${dark4}`,
        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        opacity: isApproved ? 0.65 : 1, transition: 'opacity 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { if (!(e.target as HTMLElement).closest('button, a, input, label')) onReview(); }}
    >
      {/* ── Header: icon + type + date ── */}
      <div style={{ height: HEADER_H, display:'flex', alignItems:'center', gap:4, padding:'12px 12px 2px', flexShrink:0 }}>
        <TypeIcon type={post.type} size={14} />
        <span style={{ fontSize:12, color:dark60, fontFamily:F, flex:1, letterSpacing:'0.24px' }}>{TYPE_LABEL[post.type]}</span>
        <span style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', whiteSpace:'nowrap' }}>{post.date}</span>
      </div>

      {isBlog ? (
        /* ── Blog layout — white inner card with shadow ── */
        <div style={{ flex:1, padding:'0 10px 32px', display:'flex', flexDirection:'column' }}>
          <div style={{
            flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
            background: white, borderRadius:8,
            boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {/* Image — top, edge-to-edge within inner card */}
            <div style={{ height: 126, flexShrink:0, background:'#c8c0b4', overflow:'hidden', borderRadius:'8px 8px 0 0' }}>
              {post.img && <img src={post.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            </div>
            {/* Text content */}
            <div style={{ flex:1, padding:'10px 12px 10px', overflow:'hidden', display:'flex', flexDirection:'column', gap:5 }}>
              <p style={{ margin:0, fontSize:16, fontWeight:400, color:dark90, fontFamily:F, lineHeight:1.3,
                display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                {post.caption}
              </p>
              <p style={{ margin:0, fontSize:11, color:dark40, fontFamily:F }}>July 8, 2025</p>
              <p style={{ margin:0, fontSize:12, color:dark60, fontFamily:F, lineHeight:1.55, letterSpacing:'0.24px',
                display:'-webkit-box', WebkitLineClamp:6, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                In recent years, remote work has become increasingly popular, and with the advancements in artificial intelligence (AI), it has the potential to become even more efficient. AI technologies have the ability to streamline processes, enhance communication, and improve productivity, ultimately transforming.
              </p>
            </div>
          </div>
        </div>

      ) : isPortrait ? (
        /* ── Portrait 9:16 — full-bleed image edge-to-edge below header ── */
        <div style={{ flex:1, position:'relative', background:'#1a1a1a', overflow:'hidden' }}>
          {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
          {post.type === 'feed-video' && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:44, height:44, borderRadius:99, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="16" viewBox="0 0 16 18" fill="white"><path d="M2 2L14 9L2 16V2Z"/></svg>
              </div>
            </div>
          )}
        </div>

      ) : isLandscape ? (
        /* ── Landscape layout (still / carousel) — caption + image grouped with shadow ── */
        <div style={{ flex:1, padding:'0 10px 10px', display:'flex', flexDirection:'column' }}>
          <div style={{
            flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
            background: white, borderRadius:8,
            boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {/* Caption inside the white group */}
            <div style={{ padding:'10px 12px 8px', flexShrink:0 }}>
              <p style={{
                margin:0, fontSize:12, color:dark80, fontFamily:F, lineHeight:1.55, letterSpacing:'0.24px',
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden',
              }}>
                {post.caption}
                {post.caption.length > 55 && <span style={{ color:dark40 }}> ...mo...</span>}
              </p>
            </div>
            {/* Image fills remaining space in the group */}
            <div style={{ flex:1, position:'relative', background:'#c8c0b4', overflow:'hidden' }}>
              {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
              {/* Carousel slide badge */}
              {post.type === 'carousel' && post.slides && (
                <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.55)', borderRadius:4, padding:'2px 6px', display:'flex', alignItems:'center', gap:3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="white" strokeWidth="1.6"/><path d="M2 7v10M22 7v10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  <span style={{ fontSize:10, color:'white', fontFamily:F }}>{post.slides}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      ) : (
        /* ── Email / other — simple caption + image ── */
        <>
          <div style={{ padding:'0 12px 8px', flexShrink:0 }}>
            <p style={{ margin:0, fontSize:12, color:dark80, fontFamily:F, lineHeight:1.55,
              display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
              {post.caption}
            </p>
          </div>
          <div style={{ flex:1, position:'relative', background:'#c8c0b4', overflow:'hidden' }}>
            {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
          </div>
        </>
      )}

      {/* ── Status pill — always anchored bottom-left 10px ── */}
      <div style={{ position:'absolute', bottom:10, left:12, zIndex:5 }}>
        <StatusPill status={status} dontPostReasons={dontPostReasons} resubmitNote={resubmitNote} isPast={isPast} />
      </div>

      {/* ── Hover overlay ── */}
      <div style={{
        position:'absolute', inset:0,
        background:'rgba(0,0,0,0.35)',
        opacity: hovered ? 1 : 0, transition:'opacity 0.18s',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
        pointerEvents: hovered ? 'all' : 'none',
      }}>
        <div style={{
          transform: hovered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(4px)',
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:8,
        }}>
          {!isPast && (
            <Button
              variant={isApproved ? 'secondary' : isDraft ? 'secondary' : 'green'}
              size="sm"
              frontIcon={isApproved ? ApprovalsIcon : isDraft ? CalendarEdit : Check2}
              onPress={(e) => { (e as any).continuePropagation?.(); }}
              onClick={(e) => { e.stopPropagation(); isApproved ? onRemoveApproval() : onApprove(); }}
            >
              {isApproved ? 'Remove approval' : isDraft ? 'Reschedule' : 'Approve'}
            </Button>
          )}
          <Button variant="secondary" size="sm" frontIcon={EyeOpen}
            onClick={(e) => { e.stopPropagation(); onReview(); }}>
            {isPast ? 'View' : 'Review'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Campaign section ──────────────────────────────────────────────────────────
function CampaignSection({
  campaign, statuses, dontPostReasons, resubmitNotes, onApprove, onRemoveApproval, onReview, onApproveAll, justCompleted, defaultCollapsed, isPast, message,
}: {
  campaign: Campaign;
  statuses: Record<number, Status>;
  dontPostReasons: Record<number, string[]>;
  resubmitNotes?: Record<number, string>;
  onApprove: (id: number) => void;
  onRemoveApproval: (id: number) => void;
  onReview: (id: number) => void;
  onApproveAll: () => void;
  justCompleted?: boolean;
  defaultCollapsed?: boolean;
  isPast?: boolean;
  /** Cover note the AM sent with the campaign — shown under the name. */
  message?: string;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);
  const [animState, setAnimState] = useState<'idle' | 'animating' | 'collapsed'>('idle');
  const [approvedSectionCollapsed, setApprovedSectionCollapsed] = useState(false);

  useEffect(() => {
    if (!justCompleted) return;
    // Short delay so the modal starts opening simultaneously
    const t1 = setTimeout(() => setAnimState('animating'), 80);
    // After animation completes, snap to collapsed
    const t2 = setTimeout(() => { setAnimState('collapsed'); setCollapsed(true); }, 680);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [justCompleted]);

  const pending  = campaign.posts.filter(p => statuses[p.id] !== 'approved').sort((a,b) => a.dateSort.localeCompare(b.dateSort));
  const approved = campaign.posts.filter(p => statuses[p.id] === 'approved').sort((a,b) => a.dateSort.localeCompare(b.dateSort));

  const totalReviewed = campaign.posts.filter(p => statuses[p.id] !== 'pending').length;
  const totalPosts    = campaign.posts.length;
  const approvedCount = approved.length;
  const rejectedCount = campaign.posts.filter(p => statuses[p.id] === 'rejected').length;
  const pendingCount  = campaign.posts.filter(p => statuses[p.id] === 'pending').length;

  const approvedW = Math.round((approvedCount / totalPosts) * 111);
  const rejectedW = Math.round((rejectedCount / totalPosts) * 111);
  const pendingW  = 111 - approvedW - rejectedW;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Campaign header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Collapse chevron */}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:20, height:20, border:'none', background:'transparent', cursor:'pointer', padding:0, flexShrink:0 }}
            aria-label={collapsed ? 'Expand campaign' : 'Collapse campaign'}
          >
            {collapsed
              ? <ChevronRight size={16} color={dark40} />
              : <ChevronDown  size={16} color={dark40} />}
          </button>
          <span style={{ fontSize:18, fontWeight:400, color:dark80, fontFamily:F, letterSpacing:'-0.36px' }}>{campaign.name}</span>
          <span style={{ fontSize:14, color:dark60, fontFamily:F, letterSpacing:'0.14px' }}>{campaign.dateRange}</span>
          {/* Badge — icon matches the sidebar nav icon for the badge type */}
          <span style={{
            display:'inline-flex', alignItems:'center', gap:4,
            background:dark2, borderRadius:4,
            padding:'2px 6px', fontSize:12, color:dark90, fontFamily:F, letterSpacing:'0.24px',
          }}>
            {campaign.badge === 'SEO' ? <Globe size={12} color={dark60} /> : <Layers5 size={12} color={dark60} />}
            {campaign.badge}
          </span>
          {/* Arrow button */}
          <button style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', padding:0 }}>
            <ArrowRight size={16} color={dark60} />
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {isPast ? (
            /* Past campaign: just show total post count, no bar or Approve All */
            <span style={{ fontSize:12, color:dark60, fontFamily:F, whiteSpace:'nowrap', letterSpacing:'0.12px' }}>
              {totalPosts} posts
            </span>
          ) : (
            <>
              {/* Progress bar + label */}
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ display:'flex', borderRadius:99, overflow:'hidden' }}>
                  {approvedW > 0 && <div style={{ width:approvedW, height:2, background:green }} />}
                  {rejectedW > 0 && <div style={{ width:rejectedW, height:2, background:red }} />}
                  {pendingCount > 0 && pendingW > 0 && <div style={{ width:pendingW, height:2, background:dark8 }} />}
                </div>
                <span style={{ fontSize:12, color:dark60, fontFamily:F, whiteSpace:'nowrap', letterSpacing:'0.12px' }}>
                  {totalReviewed} of {totalPosts} reviewed
                </span>
                {totalReviewed === totalPosts && (
                  <ApprovalsIcon size={14} color={green} />
                )}
              </div>

              {/* Vertical divider + Approve All — only for active campaigns */}
              {pendingCount > 0 && <div style={{ width:1, height:16, background:dark8 }} />}
              {pendingCount > 0 && (
                <button
                  onClick={onApproveAll}
                  style={{
                    display:'flex', alignItems:'center', gap:5,
                    padding:'6px 8px', borderRadius:8, border:'none',
                    background:'transparent', cursor:'pointer',
                    fontSize:14, fontWeight:400, color:dark90, fontFamily:F, letterSpacing:'0.14px',
                  }}
                >
                  <ApprovalsIcon size={15} color={dark90} />
                  Approve All
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* AM cover note sent with the campaign */}
      {message && (
        <div style={{ background:dark2, border:`1px solid ${dark8}`, borderRadius:10, padding:'11px 14px' }}>
          <span style={{ fontSize:12, color:dark40, fontFamily:F, display:'block', marginBottom:3 }}>Note from your Blaze team</span>
          <p style={{ margin:0, fontSize:14, color:dark80, fontFamily:F, lineHeight:1.55, whiteSpace:'pre-wrap' }}>{message}</p>
        </div>
      )}

      {/* ── Cards ── */}
      {!collapsed && (
        <div style={{
          display:'flex', flexDirection:'column', gap:18,
          opacity:   animState === 'animating' ? 0 : 1,
          transform: animState === 'animating' ? 'translateY(24px)' : 'translateY(0)',
          maxHeight: animState === 'animating' ? 0 : 'none',
          overflow:  animState === 'animating' ? 'hidden' : 'visible',
          transition: animState === 'animating'
            ? 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.4,0,1,1), max-height 0.55s ease'
            : 'none',
        }}>
          {isPast ? (
            /* Past campaigns — flat grid with Posted/Don't Post/Failed pills */
            <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
              {campaign.posts.map(post => (
                <ContentCard
                  key={post.id} post={post}
                  status={statuses[post.id]}
                  dontPostReasons={dontPostReasons[post.id]}
                  resubmitNote={resubmitNotes?.[post.id]}
                  isPast
                  onApprove={() => onApprove(post.id)}
                  onRemoveApproval={() => onRemoveApproval(post.id)}
                  onReview={() => onReview(post.id)}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Pending grid */}
              {pending.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
                  {pending.map(post => (
                    <ContentCard
                      key={post.id} post={post}
                      status={statuses[post.id]}
                      dontPostReasons={dontPostReasons[post.id]}
                      resubmitNote={resubmitNotes?.[post.id]}
                      onApprove={() => onApprove(post.id)}
                      onRemoveApproval={() => onRemoveApproval(post.id)}
                      onReview={() => onReview(post.id)}
                    />
                  ))}
                </div>
              )}
              {/* Approved section */}
              {approved.length > 0 && (() => {
                const allDone = pending.length === 0;
                if (allDone) {
                  return (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
                      {approved.map(post => (
                        <ContentCard
                          key={post.id} post={post} status={statuses[post.id]}
                          onApprove={() => onApprove(post.id)}
                          onRemoveApproval={() => onRemoveApproval(post.id)}
                          onReview={() => onReview(post.id)}
                        />
                      ))}
                    </div>
                  );
                }
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:4 }}>
                      <div style={{ flex:1, height:1, background:dark8 }} />
                      <button
                        onClick={() => setApprovedSectionCollapsed(c => !c)}
                        style={{ display:'flex', alignItems:'center', gap:5, background:'transparent', border:'none', cursor:'pointer', padding:'2px 0', flexShrink:0 }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                          <circle cx="12" cy="12" r="9" stroke={green} strokeWidth="1.5"/>
                          <path d="M8.5 12L11 14.5L15.5 9.5" stroke={green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize:12, fontWeight:500, color:green, fontFamily:F, whiteSpace:'nowrap' }}>
                          Approved ({approved.length})
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          style={{ transform: approvedSectionCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
                          <path d="M6 9l6 6 6-6" stroke={dark40} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <div style={{ flex:1, height:1, background:dark8 }} />
                    </div>
                    {!approvedSectionCollapsed && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
                        {approved.map(post => (
                          <ContentCard
                            key={post.id} post={post} status={statuses[post.id]}
                            onApprove={() => onApprove(post.id)}
                            onRemoveApproval={() => onRemoveApproval(post.id)}
                            onReview={() => onReview(post.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Social platform icons ─────────────────────────────────────────────────────
const SocialIcon = ({ platform, active }: { platform: string; active?: boolean }) => {
  const opacity = active ? 1 : 0.4;
  const size = 28;
  const icons: Record<string, React.ReactNode> = {
    instagram: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <defs>
          <radialGradient id="ig-g" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497"/>
            <stop offset="10%" stopColor="#fdf497"/>
            <stop offset="30%" stopColor="#fd5949"/>
            <stop offset="55%" stopColor="#d6249f"/>
            <stop offset="70%" stopColor="#285AEB"/>
          </radialGradient>
        </defs>
        <rect width="28" height="28" rx="7" fill="url(#ig-g)"/>
        <rect x="7" y="7" width="14" height="14" rx="4" stroke="white" strokeWidth="1.4"/>
        <circle cx="14" cy="14" r="4" stroke="white" strokeWidth="1.4"/>
        <circle cx="19" cy="9" r="1" fill="white"/>
      </svg>
    ),
    facebook: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#1877F2"/>
        <path d="M16.5 9h-2a1 1 0 00-1 1v2h3l-.5 3H13.5v7H10.5v-7H9v-3h1.5v-2a4 4 0 014-4h2v3z" fill="white"/>
      </svg>
    ),
    linkedin: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#0A66C2"/>
        <path d="M9 11.5h2.5v8H9v-8zm1.25-1a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zM13.5 11.5H16v1.1c.4-.7 1.3-1.3 2.5-1.3 2.2 0 3 1.5 3 3.5v4.7H19v-4.4c0-1-.4-1.6-1.3-1.6-1.1 0-1.7.7-1.7 1.8v4.2H13.5v-8z" fill="white"/>
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#000"/>
        <path d="M8 8h4l2.5 3.5L17 8h3l-4.5 6L20 20h-4l-2.8-3.8L10 20H7l5-6.5L8 8z" fill="white"/>
      </svg>
    ),
    google: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="white" stroke="#e0e0e0" strokeWidth="1"/>
        <path d="M20.8 14.2c0-.5 0-1-.1-1.5H14v2.8h3.8a3.2 3.2 0 01-1.4 2.1v1.8h2.3c1.3-1.2 2.1-3 2.1-5.2z" fill="#4285F4"/>
        <path d="M14 21c1.9 0 3.5-.6 4.7-1.7l-2.3-1.8c-.6.4-1.4.7-2.4.7-1.9 0-3.4-1.3-4-3H7.7v1.8A7 7 0 0014 21z" fill="#34A853"/>
        <path d="M10 15.2a4.2 4.2 0 010-2.4v-1.8H7.7A7 7 0 007 14c0 1.1.3 2.2.7 3.2L10 15.2z" fill="#FBBC04"/>
        <path d="M14 10.6c1 0 2 .4 2.7 1.1l2-2C17.5 8.5 15.9 8 14 8a7 7 0 00-6.3 3.8l2.3 1.8c.6-1.7 2.1-3 4-3z" fill="#EA4335"/>
      </svg>
    ),
  };
  return <span style={{ opacity, cursor: 'pointer', display: 'flex' }}>{icons[platform]}</span>;
};

// ── Don't Post feedback modal ─────────────────────────────────────────────────
const DONT_POST_OPTIONS = [
  'Image', 'Wrong language', 'Amount of text', 'Caption text',
  'Layout', 'Writing quality', 'Inaccurate', 'Missing text',
  'Colors and fonts', 'Other',
];

// ── Resubmit confirmation modal ───────────────────────────────────────────────
function ResubmitModal({ close, onConfirm, onReviewFirst }: {
  close: () => void;
  onConfirm: (note: string) => void;
  onReviewFirst: () => void;
}) {
  const [note, setNote] = useState('');
  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <span style={{ fontSize: 17, fontWeight: 500, color: dark90, fontFamily: F }}>
          Resubmit to Client?
        </span>
      </Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 14, color: dark60, fontFamily: F, lineHeight: 1.65 }}>
            Have you revised this post? The client will be notified to review it again.
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note for the client (optional)"
            style={{
              width: '100%', minHeight: 80, resize: 'vertical',
              border: `1px solid ${dark15}`, borderRadius: 8,
              padding: '10px 12px', fontSize: 13, color: dark90,
              fontFamily: F, lineHeight: 1.5, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="secondary" onPress={() => { close(); onReviewFirst(); }}>
            Review Post First
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => { onConfirm(note.trim()); close(); }}>
            Yes, Resubmit
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function DontPostModal({ close, onConfirm }: { close: () => void; onConfirm: (reasons: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [otherText, setOtherText] = useState('');
  const otherSelected = selected.has('Other');

  const toggle = (opt: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(opt) ? next.delete(opt) : next.add(opt);
    return next;
  });

  const buildReasons = () => {
    const reasons = Array.from(selected).filter(r => r !== 'Other');
    if (otherSelected) reasons.push('Other');
    if (otherText.trim()) reasons.push(otherText.trim());
    return reasons;
  };

  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <span style={{ fontSize: 17, fontWeight: 500, color: dark90, fontFamily: F }}>
          What could be improved?
        </span>
      </Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DONT_POST_OPTIONS.map(opt => {
              const active = selected.has(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggle(opt)}
                  style={{
                    padding: '6px 12px', borderRadius: 99,
                    border: `1.5px solid ${active ? dark90 : dark15}`,
                    background: active ? dark4 : white,
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    color: dark90, fontFamily: F, cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <textarea
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
            placeholder="Tell us more"
            style={{
              width: '100%', minHeight: 88, resize: 'vertical',
              border: `1px solid ${dark15}`, borderRadius: 8,
              padding: '10px 12px', fontSize: 13, color: dark90,
              fontFamily: F, lineHeight: 1.5, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => { onConfirm(buildReasons()); close(); }}>
            Send Feedback
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}


// ── Post preview (full-screen) ────────────────────────────────────────────────
// Ported 1:1 from the dfy-client PostPreviewModal chrome — sidebar, "view as"
// rail, phone preview and header — minus the client-only Request changes /
// Approve header actions (this is the AM side, so it's Previous / Next only).
type Glyph = ComponentType<IconProps>;
const PREVIEW_CLIENT = 'Grain Design Flooring';
const PREVIEW_PLATFORMS: { glyph: Glyph; label: string }[] = [
  { glyph: InstagramBrand as Glyph, label: 'Instagram' },
  { glyph: FacebookBrand as Glyph, label: 'Facebook' },
  { glyph: LinkedInBrand as Glyph, label: 'LinkedIn' },
  { glyph: TwitterBrand as Glyph, label: 'X/Twitter' },
  { glyph: Google as Glyph, label: 'Google Business' },
];
const PREVIEW_LABEL: React.CSSProperties = { display: 'block', fontSize: 13, color: dark60, marginBottom: 10 };

function PreviewSidebarAction({ icon: Icon, title, sub }: { icon: Glyph; title: string; sub?: string }) {
  return (
    <button type="button" style={{ display: 'flex', alignItems: sub ? 'flex-start' : 'center', gap: 12, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '8px 0', cursor: 'pointer', fontFamily: F }}>
      <span style={{ color: dark80, display: 'inline-flex', flexShrink: 0, marginTop: sub ? 1 : 0 }}><Icon size={20} color={dark80} /></span>
      <span style={{ minWidth: 0 }}>
        <Text style={{ display: 'block', color: dark90 }}>{title}</Text>
        {sub && <Text variant="metadata" style={{ display: 'block', color: dark60, marginTop: 2 }}>{sub}</Text>}
      </span>
    </button>
  );
}

interface PreviewPost { id: number; type: ContentType; caption: string; img?: string; campaign: string; date: string; feedback?: ClientReview; status: Status; internalStatus: InternalStatus; isPast: boolean; requestedChange: boolean; approvedByClient: boolean }

// Client-request thread shown in the preview sidebar — the client's change
// request as a received bubble + a reply composer, all from BDS pieces.
function PreviewClientThread({ feedback }: { feedback: ClientReview }) {
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const send = () => { if (reply.trim()) { setSent(s => [...s, reply.trim()]); setReply(''); } };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={PREVIEW_LABEL}>Client request</span>
      {/* Received bubble (from the client) */}
      <div style={{ minWidth: 0 }}>
        <div style={{ background: white, border: `1px solid ${dark8}`, borderRadius: 12, padding: '8px 12px' }}>
          <Text variant="secondary" style={{ display: 'block', color: dark90, lineHeight: 1.5 }}>{feedback.comment}</Text>
        </div>
        <Text variant="metadata" style={{ display: 'block', color: dark40, marginTop: 4 }}>{feedback.author} · {feedback.time}</Text>
      </div>
      {/* Sent replies (from the AM) */}
      {sent.map((s, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ maxWidth: '85%', background: dark90, borderRadius: '12px 12px 4px 12px', padding: '8px 12px' }}>
            <Text variant="secondary" style={{ display: 'block', color: white, lineHeight: 1.5 }}>{s}</Text>
          </div>
        </div>
      ))}
      {/* Reply composer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TextField
          fullWidth size="sm" value={reply}
          onChange={setReply}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
          placeholder="Reply to the client…"
        />
        <IconButton variant="primary" size="sm" icon={ArrowUp} aria-label="Send reply" isDisabled={!reply.trim()} onPress={send} />
      </div>
    </div>
  );
}

// Left "Ask Blaze" panel — same pattern as the h2 ApprovalsV2 preview, rebuilt
// from BDS pieces (TextField + IconButton) instead of raw <input>/<button>.
const PREVIEW_IMPROVEMENTS = [
  { emoji: '🖼️', label: 'Change photo content', detail: '“add people into the background to fill the scene”' },
  { emoji: '🏙️', label: 'Adjust background',    detail: '“replace the background with a modern office”' },
  { emoji: '✏️', label: 'Change text overlay',  detail: '“make the headline bigger and move it to the top”' },
  { emoji: '🎨', label: 'Modify colors',         detail: '“make the color scheme more vibrant”' },
  { emoji: '🏷️', label: 'Modify branding',       detail: '“Add my logo in the bottom right corner”' },
];

function PreviewChatPanel() {
  const [msg, setMsg] = useState('');
  return (
    <aside style={{ width: 320, flexShrink: 0, borderRight: `1px solid ${dark8}`, background: 'var(--background-light)', display: 'flex', flexDirection: 'column', padding: '24px 24px 0', overflowY: 'auto' }}>
      {/* Spacer pushes the suggestions + prompt down so they sit just above the composer. */}
      <div style={{ flex: 1 }} />
      <Text variant="secondary" style={{ display: 'block', color: dark80, marginBottom: 16, lineHeight: 1.5 }}>Blaze can improve this post by:</Text>
      <ol style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PREVIEW_IMPROVEMENTS.map((s) => (
          <li key={s.label} style={{ color: dark80, lineHeight: 1.5 }}>
            <Text variant="secondary" style={{ color: dark80, lineHeight: 1.5 }}>
              <span style={{ marginRight: 4 }}>{s.emoji}</span>
              <span style={{ fontWeight: 500, color: dark90 }}>{s.label}</span>
              {': '}
              <span style={{ color: dark60 }}>{s.detail}</span>
            </Text>
          </li>
        ))}
      </ol>
      <Text variant="secondary" style={{ display: 'block', color: dark80, margin: '20px 0 12px' }}>What would you like to do?</Text>
      {/* Composer — BDS TextField + IconButtons, no raw controls */}
      <div style={{ position: 'sticky', bottom: 0, background: 'var(--background-light)', paddingBottom: 20 }}>
        <div style={{ border: `1px solid ${dark8}`, borderRadius: 16, background: white, padding: 6 }}>
          <TextField
            fullWidth
            value={msg}
            onChange={setMsg}
            placeholder="Ask Blaze to change something..."
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '8px 8px 6px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
            <IconButton variant="secondary" size="sm" icon={Paperclip} aria-label="Attach" />
            <IconButton variant="primary" size="sm" icon={ArrowUp} aria-label="Send" isDisabled={!msg.trim()} onPress={() => setMsg('')} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function PostPreview({ items, initialIndex, close }: StackModalProps & { items: PreviewPost[]; initialIndex: number }) {
  const [idx, setIdx] = useState(Math.max(0, initialIndex));
  const item = items[idx];
  const go = (n: number) => setIdx(Math.max(0, Math.min(items.length - 1, n)));

  // "Posting to" starts as a read-only pill summary; the edit button swaps in
  // the per-platform row list so you can toggle a connected account on/off for
  // this post, or connect one that's missing.
  const [platforms, setPlatforms] = useState(() =>
    PREVIEW_PLATFORMS.map((p) => ({ ...p, connected: p.label !== 'Google Business', selected: p.label !== 'Google Business' })),
  );
  const [editingPosting, setEditingPosting] = useState(false);
  const [postingHover, setPostingHover] = useState(false);
  const setPlatformSelected = (label: string, next: boolean) =>
    setPlatforms((ps) => ps.map((p) => (p.label === label ? { ...p, selected: next } : p)));
  const connectPlatform = (label: string) =>
    setPlatforms((ps) => ps.map((p) => (p.label === label ? { ...p, connected: true, selected: true } : p)));
  return (
    <Modal.Root size="fullscreen" height="100vh" onClose={close} onPressOutside={close} aria-label="Post preview">
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', background: white }}>
        {/* topbar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 16px', borderBottom: `1px solid ${dark8}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <IconButton variant="ghost" size="sm" icon={ArrowLeft} aria-label="Back" onPress={close} />
            <TypeIcon type={item.type} size={20} />
            <Text variant="secondary" style={{ color: dark90, whiteSpace: 'nowrap' }}>{TYPE_LABEL[item.type]}</Text>
            {/* Pill mirrors the card in Approvals */}
            {item.isPast
              ? <StatusPill status={item.status} isPast />
              : item.requestedChange
                ? <StatusPill status="rejected" requestedChange />
                : item.approvedByClient
                  ? <StatusPill status="approved" />
                  : <InternalStatusPill status={item.internalStatus} />}
            <IconButton variant="ghost" size="sm" icon={MoreDots} aria-label="More" />
          </div>
          {/* center — Previous / Next only (client-only actions omitted) */}
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button variant="tertiary" size="md" frontIcon={ChevronLeftLg} isDisabled={idx === 0} onPress={() => go(idx - 1)}>Previous</Button>
            <Button variant="tertiary" size="md" endIcon={ChevronRight} isDisabled={idx === items.length - 1} onPress={() => go(idx + 1)}>Next</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, justifyContent: 'flex-end' }}>
            <Avatar fallback="MH" size={32} />
          </div>
        </div>
        {/* body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* left — Ask Blaze chat panel */}
          <PreviewChatPanel />
          <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, padding: '40px 24px', background: 'var(--default-bg)' }}>
            {/* view-as rail */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <Text variant="metadata" style={{ color: dark60, marginBottom: 2 }}>View as</Text>
              {PREVIEW_PLATFORMS.map(({ glyph: G, label }, i) => (
                <span key={label} aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, border: i === 0 ? `1px solid ${dark15}` : '1px solid transparent', background: i === 0 ? white : 'transparent', boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                  <G size={14} />
                </span>
              ))}
            </div>
            {/* phone preview */}
            <div style={{ width: 360, flexShrink: 0, border: `1px solid ${dark8}`, borderRadius: 16, background: white, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                <Avatar fallback="G" size={28} style={{ background: 'var(--brand)' }} />
                <Text style={{ fontWeight: 500, color: dark90 }}>{PREVIEW_CLIENT}</Text>
              </div>
              {item.img
                ? <div style={{ aspectRatio: '4 / 5', background: `center/cover no-repeat url('${item.img}'), ${dark4}` }} />
                : <div style={{ aspectRatio: '4 / 5', background: dark4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text variant="secondary" style={{ color: dark40 }}>{TYPE_LABEL[item.type]}</Text></div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 14px 4px', color: dark90 }}>
                <Heart size={24} color={dark90} />
                <Comment size={20} color={dark90} />
                <Send size={16} color={dark90} />
              </div>
              <div style={{ padding: '6px 14px 16px' }}>
                <Text variant="secondary" style={{ display: 'block', color: dark90, lineHeight: 1.5 }}><span style={{ fontWeight: 500 }}>{PREVIEW_CLIENT}</span> {item.caption}</Text>
                <Text variant="secondary" style={{ display: 'block', color: dark40, marginTop: 2 }}>see more</Text>
              </div>
            </div>
          </div>
          {/* sidebar */}
          <aside style={{ width: 312, flexShrink: 0, borderLeft: `1px solid ${dark8}`, background: 'var(--background-light)', overflowY: 'auto', padding: '24px 24px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
            {item.feedback?.status === 'changes' && item.feedback.comment && (
              <PreviewClientThread feedback={item.feedback} />
            )}
            <div>
              <span style={PREVIEW_LABEL}>Posting on</span>
              <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: F }}>
                <Text variant="primary" style={{ color: dark90 }}>{item.date}</Text>
                <ChevronDown size={16} color={dark60} />
              </button>
            </div>
            <div onMouseEnter={() => setPostingHover(true)} onMouseLeave={() => setPostingHover(false)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...PREVIEW_LABEL, marginBottom: 0 }}>Posting to</span>
                <span style={{ opacity: editingPosting || postingHover ? 1 : 0, transition: 'opacity 120ms ease' }}>
                  {editingPosting ? (
                    <Button variant="secondary" size="sm" onPress={() => setEditingPosting(false)}>Save</Button>
                  ) : (
                    <IconButton variant="ghost" size="sm" icon={Edit1} aria-label="Edit posting accounts" onPress={() => setEditingPosting(true)} />
                  )}
                </span>
              </div>
              {editingPosting ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {platforms.map(({ glyph: G, label, connected, selected }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <G size={20} />
                      <Text style={{ flex: 1, color: dark90 }}>{label}</Text>
                      {connected ? (
                        <DSToggle checked={selected} onChange={(next) => setPlatformSelected(label, next)} />
                      ) : (
                        <Button variant="secondary" size="sm" endIcon={ChevronRight} onPress={() => connectPlatform(label)}>Connect</Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {platforms.filter((p) => p.connected && p.selected).map(({ glyph: G, label }) => (
                    <Pill key={label} size="md">
                      <G size={14} />
                      <span style={{ marginLeft: 5 }}>{label}</span>
                    </Pill>
                  ))}
                </div>
              )}
            </div>
            <div>
              <span style={PREVIEW_LABEL}>Campaign</span>
              <Text variant="primary" style={{ display: 'block', color: dark90, lineHeight: 1.35 }}>{item.campaign}</Text>
            </div>
            <div>
              <span style={PREVIEW_LABEL}>Quick Edits</span>
              <PreviewSidebarAction icon={Edit1 as Glyph} title="Adjust Caption" />
              <PreviewSidebarAction icon={Templates as Glyph} title="Edit Design" />
            </div>
            <div>
              <span style={PREVIEW_LABEL}>Redesign</span>
              <PreviewSidebarAction icon={Stars as Glyph} title="Regenerate Design" sub="Blaze will generate new design" />
              <PreviewSidebarAction icon={Images as Glyph} title="Replace with Media" sub="Swap design with your own" />
            </div>
          </aside>
        </div>
      </div>
    </Modal.Root>
  );
}

// ── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch" aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 40, height: 24, borderRadius: 99, border: 'none', padding: 2,
        background: on ? dark90 : dark15,
        cursor: 'pointer', flexShrink: 0, position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 19 : 3,
        width: 18, height: 18, borderRadius: 99, background: white,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
        display: 'block',
      }} />
    </button>
  );
}

// ── Approval Settings modal ───────────────────────────────────────────────────
const CONTENT_TYPES = [
  { key: 'campaigns',  label: 'Organic Campaigns',           desc: 'Scheduled social posts across all connected platforms.',   defaultOn: false },
  { key: 'seo-local',  label: 'Local SEO — Google Business', desc: 'Posts and updates to your Google Business Profile.',       defaultOn: true  },
  { key: 'seo-blogs',  label: 'SEO / AEO Blogs',             desc: 'Long-form content published to your website or blog.',     defaultOn: false },
  { key: 'reputation', label: 'Reputation',                  desc: 'Review responses and reputation management content.',      defaultOn: true  },
  { key: 'paid-ads',   label: 'Paid Ads',                    desc: 'Search and display ad copy before going to ad networks.',  defaultOn: true  },
  { key: 'paid-social',label: 'Paid Search',                 desc: 'Google Search ad copy before going live on search networks.',        defaultOn: true },
];

function TurnOffConfirmModal({ close, onConfirm }: { close: () => void; onConfirm: () => void }) {
  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <span style={{ fontSize: 17, fontWeight: 500, color: dark90, fontFamily: F }}>Turn off Approvals?</span>
      </Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 14, color: dark60, fontFamily: F, lineHeight: 1.65 }}>
            All content types will bypass client review and publish automatically after agent review.
          </p>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: 'rgba(255,174,0,0.1)', border: '1px solid rgba(255,174,0,0.4)',
            borderRadius: 8, padding: '10px 12px',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 13, color: '#7a4800', fontFamily: F, lineHeight: 1.55 }}>
              Any content currently awaiting client approval will be auto-approved and scheduled to post.
            </p>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="secondary" onPress={close}>Cancel</Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => { onConfirm(); close(); }}>Turn Off</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

export function ApprovalSettingsModal({ close }: { close: () => void }) {
  const { openModal } = useModals();
  const [approvalsOn, setApprovalsOn] = useState(true);
  const [types, setTypes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CONTENT_TYPES.map(t => [t.key, t.defaultOn]))
  );

  const handleMasterToggle = (val: boolean) => {
    if (!val) {
      openModal(TurnOffConfirmModal, { onConfirm: () => setApprovalsOn(false) });
    } else {
      setApprovalsOn(true);
    }
  };

  const clientRequiredCount = Object.values(types).filter(Boolean).length;

  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: dark90, fontFamily: F }}>Approval Settings</span>
          <span style={{ fontSize: 13, color: dark60, fontFamily: F, lineHeight: 1.5 }}>
            Control which content types require client sign-off before publishing.
          </span>
        </div>
      </Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Master toggle */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 16 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: dark90, fontFamily: F }}>Approvals</p>
              <p style={{ margin: 0, fontSize: 13, color: dark60, fontFamily: F, lineHeight: 1.55 }}>
                Require client sign-off before content goes live. When off, agent-reviewed content publishes automatically.
              </p>
            </div>
            <Toggle on={approvalsOn} onChange={handleMasterToggle} />
          </div>

          {/* Per-type list — only when approvals is on */}
          {approvalsOn && (
            <>
              <div style={{ height: 1, background: dark8, margin: '0 0 16px' }} />
              <div>
              <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 500, color: dark40, fontFamily: F, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Approval required per content type
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {CONTENT_TYPES.map((ct, i) => (
                  <div key={ct.key} style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
                    paddingTop: i === 0 ? 0 : 14, paddingBottom: 14,
                    borderBottom: i < CONTENT_TYPES.length - 1 ? `1px solid ${dark8}` : 'none',
                  }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 400, color: dark90, fontFamily: F }}>
                        {ct.label}
                      </p>
                      <p style={{ margin: '0 0 6px', fontSize: 12, color: dark60, fontFamily: F, lineHeight: 1.5 }}>{ct.desc}</p>
                      <DSStatusPill tone={types[ct.key] ? 'success' : 'neutral'} size="sm">
                        {types[ct.key] ? 'Client approval required' : 'Agent review only'}
                      </DSStatusPill>
                    </div>
                    <Toggle on={types[ct.key]} onChange={v => setTypes(prev => ({ ...prev, [ct.key]: v }))} />
                  </div>
                ))}
              </div>
              </div>
            </>
          )}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <span style={{ fontSize: 12, color: dark60, fontFamily: F }}>
            {approvalsOn
              ? `${clientRequiredCount} of ${CONTENT_TYPES.length} content types require client approval`
              : 'Approvals disabled — all content publishes automatically'}
          </span>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>Save settings</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ── Celebration modal ─────────────────────────────────────────────────────────
interface CelebrationModalProps {
  close: () => void; index: number; isOpen?: boolean;
  campaignName?: string; postCount?: number; dateRange?: string;
}

function CelebrationModal({ close, campaignName = 'Campaign', postCount = 0, dateRange = '' }: CelebrationModalProps) {
  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          <div style={{
            width:48, height:48, borderRadius:99,
            background:green10,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke={green} strokeWidth="1.6"/>
              <path d="M8 12.5l2.5 2.5 5-5.5" stroke={green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize:22, fontWeight:500, color:dark90, fontFamily:F, lineHeight:1.2 }}>
            You're all set!
          </span>
        </div>
      </Modal.Header>

      <Modal.Content>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <p style={{ margin:0, fontSize:15, fontWeight:400, color:dark60, fontFamily:F, lineHeight:1.65, letterSpacing:'0.3px' }}>
            <strong style={{ color:dark90, fontWeight:500 }}>{campaignName}</strong> has been approved and ready to publish. Your posts will go live according to their scheduled times for the accounts that you have connected.
          </p>
          <div style={{
            display:'flex', alignItems:'center', gap:24,
            padding:'14px 20px', background:dark2, borderRadius:10,
            border:`1px solid ${dark4}`,
          }}>
            <div>
              <div style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', marginBottom:2 }}>Campaign</div>
              <div style={{ fontSize:14, fontWeight:500, color:dark90, fontFamily:F, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{campaignName}</div>
            </div>
            <div style={{ width:1, height:32, background:dark8 }} />
            <div>
              <div style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', marginBottom:2 }}>Schedule</div>
              <div style={{ fontSize:14, fontWeight:500, color:dark90, fontFamily:F }}>{dateRange}</div>
            </div>
            <div style={{ width:1, height:32, background:dark8 }} />
            <div>
              <div style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', marginBottom:2 }}>Posts approved</div>
              <div style={{ fontSize:14, fontWeight:500, color:green, fontFamily:F }}>{postCount} posts</div>
            </div>
          </div>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Modal.FooterButton variant="secondary" onPress={close}>
              View Calendar
            </Modal.FooterButton>
            <Modal.FooterButton variant="primary" onPress={close}>
              Done
            </Modal.FooterButton>
          </div>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ── Internal status pill ──────────────────────────────────────────────────────
type InternalStatus = 'internalReview' | 'readyForClient';

function InternalStatusPill({ status }: { status: InternalStatus }) {
  const cfg = status === 'readyForClient'
    ? { bg: white, overlay: 'rgba(32,161,79,0.1)', border: 'rgba(32,161,79,0.25)', color: green, label: 'Ready for Client' }
    : { bg: white, overlay: 'rgba(106,0,255,0.08)', border: 'rgba(106,0,255,0.2)', color: '#6a00ff', label: 'Internal Review' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'2px 6px', borderRadius:4,
      backgroundColor: cfg.bg,
      backgroundImage: `linear-gradient(${cfg.overlay}, ${cfg.overlay})`,
      border: `1px solid ${cfg.border}`,
      fontSize:11, fontWeight:400, color:cfg.color, fontFamily:F,
      letterSpacing:'0.22px', whiteSpace:'nowrap',
    }}>{cfg.label}</span>
  );
}

// ── Internal content card ─────────────────────────────────────────────────────
function InternalCard({
  post, internalStatus, onMarkReady, onUndo, onReview, isPast,
  requestedChange, approvedByClient, dontPostReasons, onResubmit, pastClientStatus,
}: {
  post: Post; internalStatus: InternalStatus; isPast?: boolean;
  onMarkReady: () => void; onUndo: () => void; onReview: () => void;
  requestedChange?: boolean;
  approvedByClient?: boolean;
  dontPostReasons?: string[];
  onResubmit?: (note: string) => void;
  pastClientStatus?: Status;
}) {
  const [hovered, setHovered] = useState(false);
  const { openModal } = useModals();
  const isReady = internalStatus === 'readyForClient';

  const handleResubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(ResubmitModal, {
      onConfirm: (note: string) => onResubmit?.(note),
      onReviewFirst: () => onReview(),
    });
  };
  const isBlog  = post.type === 'blog';
  const isPortrait = post.type === 'story' || post.type === 'short' || post.type === 'feed-video';
  const isLandscape = post.type === 'still' || post.type === 'carousel';

  const CARD_H   = 378;
  const HEADER_H = 36;

  return (
    <div
      style={{
        position:'relative', width:245, height:CARD_H, flexShrink:0,
        // Requested-change designs get a subtle red wash so it's clear at a
        // glance which aren't approved yet.
        background: requestedChange ? 'rgba(188,1,11,0.04)' : dark2,
        border: `1px solid ${requestedChange ? 'rgba(188,1,11,0.2)' : dark4}`,
        borderRadius:10,
        overflow:'hidden', cursor:'pointer',
        opacity: 1, transition:'opacity 0.2s',
        display:'flex', flexDirection:'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { if (!(e.target as HTMLElement).closest('button, a, input, label')) onReview(); }}
    >
      {/* Header */}
      <div style={{ height:HEADER_H, display:'flex', alignItems:'center', gap:6, padding:'12px 12px 2px', flexShrink:0 }}>
        <TypeIcon type={post.type} size={14} />
        <span style={{ fontSize:12, color:dark60, fontFamily:F, flex:1, letterSpacing:'0.24px' }}>{TYPE_LABEL[post.type]}</span>
        <span style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', whiteSpace:'nowrap' }}>{post.date}</span>
        {!isPast && !requestedChange && !approvedByClient && (
          <span onClick={(e) => e.stopPropagation()} title={isReady ? 'Will be sent to the client' : 'Excluded from the client send'} style={{ position:'relative', zIndex:6, display:'inline-flex', alignItems:'center' }}>
            <Checkbox checked={isReady} onChange={(next) => (next ? onMarkReady() : onUndo())} />
          </span>
        )}
      </div>

      {isBlog ? (
        <div style={{ flex:1, padding:'0 10px 32px', display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:white, borderRadius:8, boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ height:126, flexShrink:0, background:'#c8c0b4', overflow:'hidden', borderRadius:'8px 8px 0 0' }}>
              {post.img && <img src={post.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            </div>
            <div style={{ flex:1, padding:'10px 12px 10px', overflow:'hidden', display:'flex', flexDirection:'column', gap:5 }}>
              <p style={{ margin:0, fontSize:16, fontWeight:400, color:dark90, fontFamily:F, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>{post.caption}</p>
              <p style={{ margin:0, fontSize:11, color:dark40, fontFamily:F }}>July 8, 2025</p>
              <p style={{ margin:0, fontSize:12, color:dark60, fontFamily:F, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:6, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>In recent years, remote work has become increasingly popular, and with the advancements in artificial intelligence (AI), it has the potential to become even more efficient.</p>
            </div>
          </div>
        </div>
      ) : isPortrait ? (
        /* ── Portrait 9:16 — full-bleed image edge-to-edge below header ── */
        <div style={{ flex:1, position:'relative', background:'#1a1a1a', overflow:'hidden' }}>
          {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
          {post.type === 'feed-video' && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:44, height:44, borderRadius:99, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="16" viewBox="0 0 16 18" fill="white"><path d="M2 2L14 9L2 16V2Z"/></svg>
              </div>
            </div>
          )}
        </div>
      ) : isLandscape ? (
        <div style={{ flex:1, padding:'0 10px 10px', display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:white, borderRadius:8, boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ padding:'10px 12px 8px', flexShrink:0 }}>
              <p style={{ margin:0, fontSize:12, color:dark80, fontFamily:F, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                {post.caption}{post.caption.length > 55 && <span style={{ color:dark40 }}> ...mo...</span>}
              </p>
            </div>
            <div style={{ flex:1, position:'relative', background:'#c8c0b4', overflow:'hidden' }}>
              {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
              {post.type === 'carousel' && post.slides && (
                <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.55)', borderRadius:4, padding:'2px 6px', display:'flex', alignItems:'center', gap:3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="white" strokeWidth="1.6"/><path d="M2 7v10M22 7v10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  <span style={{ fontSize:10, color:'white', fontFamily:F }}>{post.slides}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding:'0 12px 8px', flexShrink:0 }}>
            <p style={{ margin:0, fontSize:12, color:dark80, fontFamily:F, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>{post.caption}</p>
          </div>
          <div style={{ flex:1, position:'relative', background:'#c8c0b4', overflow:'hidden' }}>
            {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
          </div>
        </>
      )}

      {/* Status pill */}
      <div style={{ position:'absolute', bottom:10, left:12, zIndex:5 }}>
        {isPast && pastClientStatus !== undefined
          ? <StatusPill status={pastClientStatus} dontPostReasons={dontPostReasons} isPast />
          : requestedChange
            ? <StatusPill status="rejected" requestedChange dontPostReasons={dontPostReasons} />
            : approvedByClient
              ? <StatusPill status="approved" />
              : <InternalStatusPill status={internalStatus} />}
      </div>

      {/* Hover overlay */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', opacity:hovered?1:0, transition:'opacity 0.18s', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, pointerEvents:hovered?'all':'none' }}>
        <div style={{ transform:hovered?'scale(1) translateY(0)':'scale(0.9) translateY(4px)', transition:'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          {isPast ? (
            <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onReview(); }}>
              View
            </Button>
          ) : requestedChange ? (
            <>
              <Button variant="green" size="sm" frontIcon={Check2} onClick={handleResubmit}>
                Resubmit to Client
              </Button>
              <Button variant="secondary" size="sm" frontIcon={EyeOpen}
                onClick={(e) => { e.stopPropagation(); onReview(); }}>
                Review
              </Button>
            </>
          ) : approvedByClient ? (
            <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onReview(); }}>
              Review
            </Button>
          ) : (
            <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onReview(); }}>
              Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Internal campaign section (proper component so useState works) ───────────
function InternalCampaignSection({
  campaign, internalStatuses, statuses, dontPostReasons, today, isPast: isPastProp,
  onMarkReady, onUndo, onSendToClient, onReview, onResubmit,
  defaultCollapsed,
}: {
  campaign: Campaign;
  internalStatuses: Record<number, InternalStatus>;
  statuses: Record<number, Status>;
  dontPostReasons: Record<number, string[]>;
  today: string;
  isPast?: boolean;
  onMarkReady: (id: number) => void;
  onUndo: (id: number) => void;
  onSendToClient: () => void;
  onReview: (post: Post) => void;
  onResubmit: (id: number, note: string) => void;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);

  const posts = campaign.posts;
  const isReturned    = (p: Post) => statuses[p.id] === 'rejected'  && internalStatuses[p.id] === 'readyForClient';
  const isApproved    = (p: Post) => statuses[p.id] === 'approved'  && internalStatuses[p.id] === 'readyForClient';
  const activePosts        = posts.filter(p => !isReturned(p) && !isApproved(p));
  const totalCount  = activePosts.length;
  const isPastCamp  = isPastProp ?? campaign.endDate < today;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Campaign header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:20, height:20, border:'none', background:'transparent', cursor:'pointer', padding:0, flexShrink:0 }}
            aria-label={collapsed ? 'Expand campaign' : 'Collapse campaign'}
          >
            {collapsed ? <ChevronRight size={16} color={dark40} /> : <ChevronDown size={16} color={dark40} />}
          </button>
          <span style={{ fontSize:18, fontWeight:400, color:dark80, fontFamily:F, letterSpacing:'-0.36px' }}>{campaign.name}</span>
          <span style={{ fontSize:14, color:dark60, fontFamily:F }}>{campaign.dateRange}</span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:dark2, borderRadius:4, padding:'2px 6px', fontSize:12, color:dark90, fontFamily:F }}>
            {campaign.badge === 'SEO' ? <Globe size={12} color={dark60} /> : <Layers5 size={12} color={dark60} />}
            {campaign.badge}
          </span>
          <button style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', padding:0 }}>
            <ArrowRight size={16} color={dark60} />
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {isPastCamp ? (
            <span style={{ fontSize:12, color:dark60, fontFamily:F }}>{posts.length} posts</span>
          ) : (() => {
            const clientRejectedCount = posts.filter(p => statuses[p.id] === 'rejected').length;
            const clientApprovedCount = posts.filter(p => statuses[p.id] === 'approved').length;
            const hasClientFeedback = clientRejectedCount > 0 || clientApprovedCount > 0;
            return (
              <>
                {/* Total count */}
                <span style={{ fontSize:12, color:dark60, fontFamily:F, whiteSpace:'nowrap' }}>
                  {posts.length} posts
                </span>

                {/* Client feedback counters — requested changes surfaced here */}
                {hasClientFeedback && (
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {clientRejectedCount > 0 && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:red, fontFamily:F, fontWeight:500, whiteSpace:'nowrap' }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke={red} strokeWidth="1.4"/>
                          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={red} strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        {clientRejectedCount} requested {clientRejectedCount === 1 ? 'change' : 'changes'}
                      </span>
                    )}
                    {clientApprovedCount > 0 && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:green, fontFamily:F, fontWeight:500, whiteSpace:'nowrap' }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke={green} strokeWidth="1.4"/>
                          <path d="M5 8.5l2 2 4-4" stroke={green} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {clientApprovedCount} approved
                      </span>
                    )}
                  </div>
                )}

                {/* Send to Client */}
                {totalCount > 0 && (
                  <>
                    <div style={{ width:1, height:16, background:dark8 }} />
                    <Button variant="secondary" size="sm" onPress={onSendToClient}>Send to Client</Button>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Cards grid */}
      {!collapsed && (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

          {/* Past campaigns — flat grid with Posted/Don't Post/Failed */}
          {isPastCamp ? (
            <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
              {posts.map(post => (
                <InternalCard
                  key={post.id} post={post}
                  internalStatus={internalStatuses[post.id]}
                  isPast
                  pastClientStatus={statuses[post.id]}
                  dontPostReasons={dontPostReasons[post.id]}
                  onMarkReady={() => onMarkReady(post.id)}
                  onUndo={() => onUndo(post.id)}
                  onReview={() => onReview(post)}
                />
              ))}
            </div>
          ) : (
          /* One flat list — the client's verdicts live on each card's own pill. */
          <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
            {posts.map(post => (
              <InternalCard
                key={post.id} post={post}
                internalStatus={internalStatuses[post.id]}
                requestedChange={isReturned(post)}
                approvedByClient={isApproved(post)}
                dontPostReasons={dontPostReasons[post.id]}
                onMarkReady={() => onMarkReady(post.id)}
                onUndo={() => onUndo(post.id)}
                onReview={() => onReview(post)}
                onResubmit={(note) => onResubmit(post.id, note)}
              />
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Inner app (needs ModalStack context) ─────────────────────────────────────
/* ── Approvals filter (content type + status) ───────────────────────────────
   Drives the AM-side Filter dropdown next to Settings. Facet counts derive
   from the campaigns' initial state; the live view filters on current
   per-post statuses. */
export type ApprovalTypeFilter = 'all' | 'campaigns' | 'seo' | 'reputation' | 'paid-social' | 'paid-search';
export type ApprovalStatusFilter = 'all' | 'internalReview' | 'inClientReview' | 'returned' | 'approved' | 'posted' | 'failed';

interface FacetOption<K> { key: K; label: string; count: number; badge?: boolean }
export interface ApprovalFacets {
  types: FacetOption<ApprovalTypeFilter>[];
  statuses: FacetOption<ApprovalStatusFilter>[];
}

function statusBucketFor(internal: InternalStatus, status: Status, isPast: boolean): ApprovalStatusFilter {
  if (isPast) return status === 'approved' ? 'posted' : status === 'pending' ? 'failed' : 'returned';
  if (internal === 'readyForClient') return status === 'rejected' ? 'returned' : status === 'approved' ? 'approved' : 'inClientReview';
  return 'internalReview';
}

export function approvalFacets(): ApprovalFacets {
  const today = '2026-06-03';
  const entries = CAMPAIGNS.flatMap(c => c.posts.map((_, i) => {
    const isPast = c.endDate < today;
    const internal: InternalStatus = isPast ? (i % 2 === 0 ? 'readyForClient' : 'internalReview') : 'internalReview';
    const status: Status = isPast ? (i % 2 === 0 ? 'approved' : 'rejected') : 'pending';
    return { badge: c.badge, bucket: statusBucketFor(internal, status, isPast) };
  }));
  const total = entries.length;
  const byType = (t: ApprovalTypeFilter) => entries.filter(e => (t === 'campaigns' && e.badge === 'Campaigns') || (t === 'seo' && e.badge === 'SEO')).length;
  const byStatus = (s: ApprovalStatusFilter) => entries.filter(e => e.bucket === s).length;
  return {
    types: [
      { key: 'all', label: 'All types', count: total },
      { key: 'campaigns', label: 'Organic Campaigns', count: byType('campaigns') },
      { key: 'seo', label: 'SEO/AEO', count: byType('seo') },
      { key: 'reputation', label: 'Reputation', count: 0 },
      { key: 'paid-social', label: 'Paid Social', count: 0 },
      { key: 'paid-search', label: 'Paid Search', count: 0 },
    ],
    statuses: [
      { key: 'all', label: 'All', count: total },
      { key: 'internalReview', label: 'Internal review', count: byStatus('internalReview') },
      { key: 'inClientReview', label: 'In client review', count: byStatus('inClientReview') },
      { key: 'returned', label: 'Requested changes', count: byStatus('returned'), badge: true },
      { key: 'approved', label: 'Approved', count: byStatus('approved') },
      { key: 'posted', label: 'Posted', count: byStatus('posted') },
      { key: 'failed', label: 'Failed', count: byStatus('failed') },
    ],
  };
}

function FilterRow<K extends string>({ opt, selected, onSelect }: { opt: FacetOption<K>; selected: boolean; onSelect: (k: K) => void }) {
  return (
    <button
      onClick={() => onSelect(opt.key)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', background: selected ? dark4 : 'transparent', fontFamily: F }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = dark2; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize: 15, color: dark90, fontWeight: selected ? 500 : 400 }}>{opt.label}</span>
      {opt.badge && opt.count > 0
        ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 99, background: red, color: white, fontSize: 11, fontWeight: 600, padding: '0 5px', lineHeight: 1 }}>{opt.count}</span>
        : <span style={{ fontSize: 14, color: dark40 }}>{opt.count}</span>}
      {selected && <span style={{ marginLeft: 'auto', display: 'inline-flex', color: dark90 }}><Check2 size={16} /></span>}
    </button>
  );
}

/** Send-to-client modal — a pre-generated cover note the AM can adjust inline. */
/** Pre-generated AM cover note shown to the client above a campaign. Used both
 *  as the SendToClientModal default and as the client-side fallback so the note
 *  is always present in the demo (a live send overrides it). */
function defaultCampaignMessage(campaignName: string, count: number, dateRange: string) {
  return `Hi there,\n\nThe ${campaignName} content is ready for your review — ${count} ${count === 1 ? 'piece' : 'pieces'} for ${dateRange}. Approve anything that's good to go, or leave a note on whatever you'd like changed.\n\nThanks!`;
}

function SendToClientModal({ close, campaignName, count, dateRange, onSend }: { close: () => void; campaignName: string; count: number; dateRange: string; onSend: (message: string) => void }) {
  const [message, setMessage] = useState(defaultCampaignMessage(campaignName, count, dateRange));
  return (
    <Modal.Root size="md" onClose={close}>
      <Modal.Header title={`Send ${campaignName} to client`} onClose={close} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 13, color: dark60, fontFamily: F, lineHeight: 1.5 }}>The client sees this note above the campaign. Adjust it before sending.</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoFocus
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 168, resize: 'vertical', border: `1px solid ${dark8}`, borderRadius: 8, padding: '10px 12px', fontFamily: F, fontSize: 14, color: dark90, lineHeight: 1.6, outline: 'none', background: white }}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="secondary" onPress={close}>Cancel</Modal.FooterButton>
          <Modal.FooterButton variant="primary" isDisabled={!message.trim()} onPress={() => { onSend(message.trim()); close(); }}>Send to Client</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

/** AM-side Filter dropdown — content type + status, anchored under the button. */
export function ApprovalsFilterControl({ type, status, onChange }: { type: ApprovalTypeFilter; status: ApprovalStatusFilter; onChange: (next: { type?: ApprovalTypeFilter; status?: ApprovalStatusFilter }) => void }) {
  const [open, setOpen] = useState(false);
  const facets = approvalFacets();
  return (
    <div style={{ position: 'relative' }}>
      <Button variant="tertiary" size="sm" endIcon={ChevronDown} onPress={() => setOpen(o => !o)}>Filter</Button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 59 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 290, maxHeight: '72vh', overflowY: 'auto', background: white, borderRadius: 12, border: `1px solid ${dark8}`, boxShadow: '0 16px 48px rgba(15,23,42,0.18)', zIndex: 60, padding: 8 }}>
            <p style={{ margin: '4px 8px 6px', fontSize: 13, color: dark40, fontFamily: F }}>Content type</p>
            {facets.types.map(o => <FilterRow key={o.key} opt={o} selected={o.key === type} onSelect={(k) => onChange({ type: k })} />)}
            <div style={{ height: 1, background: dark8, margin: '8px 4px' }} />
            <p style={{ margin: '4px 8px 6px', fontSize: 13, color: dark40, fontFamily: F }}>Status</p>
            {facets.statuses.map(o => <FilterRow key={o.key} opt={o} selected={o.key === status} onSelect={(k) => onChange({ status: k })} />)}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The Approvals view, decoupled from any shell. `clientView` is a controlled
 * prop so it can be driven either by the standalone prototype's own toggle or
 * by an embedding workspace's AM/Client switch. `embedded` drops the in-content
 * client banner (the embedding shell shows its own AM/Client switch).
 */
export function ApprovalV2View({ clientView, embedded = false, initialReviewPostId, typeFilter = 'all', statusFilter = 'all', campaignMessages: campaignMessagesProp, onSendCampaignMessage }: { clientView: boolean; embedded?: boolean; initialReviewPostId?: string | number; typeFilter?: ApprovalTypeFilter; statusFilter?: ApprovalStatusFilter; campaignMessages?: Record<number, string>; onSendCampaignMessage?: (campaignId: number, message: string) => void }) {
  const today = '2026-06-03';
  const tab: 'internal' | 'client' = clientView ? 'client' : 'internal';
  // Only a steady (running) account shows the client's verdicts on the active
  // campaign. Cold + reviewed accounts keep the pre-send state (all awaiting).
  const { state } = useDfyState();
  const clientReviewed = state === 'steady';

  // Seeds are reusable so flipping the dev-state toggle re-derives them live
  // (steady = client verdicts; cold/reviewed = pre-send, all awaiting).
  const seedInternal = (): Record<number, InternalStatus> => {
    const initial: Record<number, InternalStatus> = {};
    CAMPAIGNS.forEach(c => {
      const isPast = c.endDate < today;
      c.posts.forEach((p, i) => {
        initial[p.id] = isPast ? (i % 2 === 0 ? 'readyForClient' : 'internalReview') : 'readyForClient';
      });
    });
    return initial;
  };
  const seedStatuses = (withClientReview: boolean): Record<number, Status> => {
    const initial: Record<number, Status> = {};
    CAMPAIGNS.forEach(c => {
      const isPast = c.endDate < today;
      c.posts.forEach((p, i) => {
        if (isPast) { initial[p.id] = i % 2 === 0 ? 'approved' : 'rejected'; return; }
        const review = withClientReview ? CLIENT_REVIEW[p.id] : undefined;
        initial[p.id] = review ? (review.status === 'approved' ? 'approved' : 'rejected') : 'pending';
      });
    });
    return initial;
  };

  const [internalStatuses, setInternalStatuses] = useState<Record<number, InternalStatus>>(seedInternal);
  const [statuses, setStatuses] = useState<Record<number, Status>>(() => seedStatuses(clientReviewed));
  // Re-seed when the dev-state toggle flips — a demo reset, so it clobbers any
  // in-session AM edits (acceptable for the toggle).
  useEffect(() => {
    setInternalStatuses(seedInternal());
    setStatuses(seedStatuses(state === 'steady'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const triggerFeedbackToast = () => {
    setShowFeedbackToast(true);
    setTimeout(() => setShowFeedbackToast(false), 3500);
  };
  const [completingCampaignId, setCompletingCampaignId] = useState<number | null>(null);
  const [dontPostReasons, setDontPostReasons] = useState<Record<number, string[]>>({});
  const [resubmitNotes, setResubmitNotes] = useState<Record<number, string>>({});

  const { openModal } = useModals();

  // Open the full-screen post preview seeded with every post, so Previous/Next
  // walks the whole queue. Campaign name is resolved per post for the sidebar.
  const openPreview = (postId: number) => {
    const items: PreviewPost[] = CAMPAIGNS.flatMap(c => {
      const isPast = c.endDate < today;
      return c.posts.map(p => {
        const status = statuses[p.id];
        const internalStatus = internalStatuses[p.id];
        // Mirror the card's pill exactly (same isReturned/isApproved rules).
        const requestedChange  = !isPast && status === 'rejected' && internalStatus === 'readyForClient';
        const approvedByClient = !isPast && status === 'approved' && internalStatus === 'readyForClient';
        return { id: p.id, type: p.type, caption: p.caption, img: p.img, campaign: c.name, date: p.date, status, internalStatus, isPast, requestedChange, approvedByClient, feedback: clientReviewed ? CLIENT_REVIEW[p.id] : undefined };
      });
    });
    const initialIndex = Math.max(0, items.findIndex(i => i.id === postId));
    openModal(PostPreview, { items, initialIndex });
  };

  const triggerCelebration = (campaignId: number) => {
    const campaign = CAMPAIGNS.find(c => c.id === campaignId)!;
    setCompletingCampaignId(campaignId);
    setTimeout(() => openModal(CelebrationModal, {
      campaignName: campaign.name,
      postCount:    campaign.posts.length,
      dateRange:    campaign.dateRange,
    }), 150);
    setTimeout(() => setCompletingCampaignId(null), 800);
  };

  const approve = (id: number, campaignId: number) => {
    setStatuses(prev => {
      const next = { ...prev, [id]: 'approved' as Status };
      const campaign = CAMPAIGNS.find(c => c.id === campaignId)!;
      if (campaign.posts.every(p => next[p.id] === 'approved')) triggerCelebration(campaignId);
      return next;
    });
  };

  const removeApproval = (id: number) => {
    setStatuses(prev => ({ ...prev, [id]: 'pending' }));
  };

  const rejectPost = (id: number) => {
    setStatuses(prev => ({ ...prev, [id]: 'rejected' }));
  };

  const resubmitPost = (id: number, note: string) => {
    setStatuses(prev => ({ ...prev, [id]: 'pending' }));
    setDontPostReasons(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (note) setResubmitNotes(prev => ({ ...prev, [id]: note }));
    else setResubmitNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  // Internal handlers
  const markReadyForClient = (id: number) => {
    setInternalStatuses(prev => ({ ...prev, [id]: 'readyForClient' }));
  };
  const undoReady = (id: number) => {
    setInternalStatuses(prev => ({ ...prev, [id]: 'internalReview' }));
  };
  // Cover note the AM sends with each campaign; the client sees it under the name.
  // Hoisted to the shell when embedded so it survives the AM↔Client toggle;
  // falls back to local state for the standalone view.
  const [localMessages, setLocalMessages] = useState<Record<number, string>>({});
  const campaignMessages = campaignMessagesProp ?? localMessages;
  const saveCampaignMessage = (campaignId: number, message: string) =>
    onSendCampaignMessage ? onSendCampaignMessage(campaignId, message) : setLocalMessages(prev => ({ ...prev, [campaignId]: message }));
  const sendToClient = (campaign: Campaign) => {
    const count = campaign.posts.filter(p => internalStatuses[p.id] === 'readyForClient').length;
    openModal(SendToClientModal, {
      campaignName: campaign.name,
      count,
      dateRange: campaign.dateRange,
      onSend: (message: string) => saveCampaignMessage(campaign.id, message),
    });
  };

  const approveAll = (campaign: Campaign) => {
    setStatuses(prev => {
      const next = { ...prev };
      campaign.posts.forEach(p => { next[p.id] = 'approved'; });
      triggerCelebration(campaign.id);
      return next;
    });
  };

  // Returned by client count for header badge
  const returnedCount = CAMPAIGNS.filter(c => c.endDate >= today)
    .flatMap(c => c.posts)
    .filter(p => statuses[p.id] === 'rejected' && internalStatuses[p.id] === 'readyForClient')
    .length;

  // Deep-link: open a specific post's review page on mount (e.g. a workstream
  // "Open carousel" CTA routes straight to the post in question).
  useEffect(() => {
    if (initialReviewPostId == null) return;
    const post = CAMPAIGNS.flatMap(c => c.posts).find(p => String(p.id) === String(initialReviewPostId));
    if (post) openPreview(post.id);
  }, [initialReviewPostId]);

  // Live filter (AM topbar dropdown) — type by campaign badge, status by the
  // current per-post bucket.
  const matchesFilter = (p: Post, c: Campaign) => {
    const typeOk = typeFilter === 'all'
      || (typeFilter === 'campaigns' && c.badge === 'Campaigns')
      || (typeFilter === 'seo' && c.badge === 'SEO');
    const statusOk = statusFilter === 'all'
      || statusBucketFor(internalStatuses[p.id], statuses[p.id], c.endDate < today) === statusFilter;
    return typeOk && statusOk;
  };

  return (
    <>
      {/* The requested-changes count now lives next to the "Approvals" title in
          the shell topbar (see WorkspaceShell), so no banner here. */}

      {/* Client view banner — standalone only (embedding shell has its own switch) */}
      {clientView && !embedded && (
        <div style={{ display:'flex', alignItems:'center', gap:10, background:dark90, color:white, borderRadius:10, padding:'10px 14px', marginBottom:16, fontFamily:F }}>
          <EyeOpen size={16} color={white} />
          <span style={{ fontSize:13, flex:1 }}>
            Viewing as <strong style={{ fontWeight:600 }}>Client</strong> — only content marked ready for client is visible.
          </span>
        </div>
      )}

      {tab === 'internal' ? (
        /* ── Internal Review tab ── */
        (() => {
          const SectionHeader = ({ label, count }: { label: string; count: number }) => (
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:13, fontWeight:500, color:dark40, fontFamily:F, letterSpacing:'0.26px', whiteSpace:'nowrap' }}>
                {label} <span style={{ fontWeight:400 }}>({count})</span>
              </span>
              <div style={{ flex:1, height:1, background:dark8 }} />
            </div>
          );

          const isAllReady = (c: Campaign) => c.posts.every(p => internalStatuses[p.id] === 'readyForClient');
          // Apply the Filter: keep only matching posts, then drop empty campaigns.
          const filtered = CAMPAIGNS
            .map(c => ({ ...c, posts: c.posts.filter(p => matchesFilter(p, c)) }))
            .filter(c => c.posts.length > 0);
          const activeCampaigns = filtered.filter(c => c.endDate >= today);
          const pastCampaigns   = filtered.filter(c => c.endDate < today);

          const renderIC = (c: Campaign, opts?: { defaultCollapsed?: boolean; isPast?: boolean }) => (
            <InternalCampaignSection
              key={c.id}
              campaign={c}
              internalStatuses={internalStatuses}
              statuses={statuses}
              dontPostReasons={dontPostReasons}
              resubmitNotes={resubmitNotes}
              today={today}
              isPast={opts?.isPast}
              defaultCollapsed={opts?.defaultCollapsed}
              onMarkReady={markReadyForClient}
              onUndo={undoReady}
              onSendToClient={() => sendToClient(c)}
              onReview={(post) => openPreview(post.id)}
              onResubmit={resubmitPost}
            />
          );

          if (filtered.length === 0) {
            return (
              <div style={{ padding: '56px 0', textAlign: 'center', color: dark40, fontFamily: F, fontSize: 14 }}>
                No content matches this filter.
              </div>
            );
          }

          return (
            <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
              {activeCampaigns.map(c => renderIC(c))}
              {pastCampaigns.length > 0 && (
                <>
                  <SectionHeader label="Past campaigns" count={pastCampaigns.length} />
                  {pastCampaigns.map(c => renderIC(c, { defaultCollapsed: true, isPast: true }))}
                </>
              )}
            </div>
          );
        })()
      ) : (
        /* ── Client Approval tab ── */
        (() => {
        const today = '2026-06-03';
        const isAllApproved = (c: Campaign) => c.posts.every(p => statuses[p.id] === 'approved');
        const isPast        = (c: Campaign) => c.endDate < today && !isAllApproved(c);
        const isActive      = (c: Campaign) => !isAllApproved(c) && !isPast(c);

        const active   = CAMPAIGNS.filter(isActive);
        const approved = CAMPAIGNS.filter(isAllApproved);
        const past     = CAMPAIGNS.filter(isPast);

        const renderCampaign = (campaign: Campaign, opts?: { defaultCollapsed?: boolean; isPast?: boolean }) => {
          // Only expose posts the internal team has marked Ready for Client
          const visiblePosts = campaign.posts.filter(p => internalStatuses[p.id] === 'readyForClient');
          if (visiblePosts.length === 0) return null;
          const clientCampaign = { ...campaign, posts: visiblePosts };
          // The AM's cover note: a live send (campaignMessages) wins; otherwise
          // active campaigns fall back to the default note so the client always
          // sees one in the demo. Past/approved campaigns get no fallback.
          const message = campaignMessages[campaign.id]
            ?? (isActive(campaign) ? defaultCampaignMessage(campaign.name, visiblePosts.length, campaign.dateRange) : undefined);
          return (
            <CampaignSection
              key={campaign.id}
              campaign={clientCampaign}
              statuses={statuses}
              dontPostReasons={dontPostReasons}
              resubmitNotes={resubmitNotes}
              onApprove={(id) => approve(id, campaign.id)}
              onRemoveApproval={removeApproval}
              onReview={(id) => openPreview(id)}
              onApproveAll={() => approveAll(clientCampaign)}
              justCompleted={completingCampaignId === campaign.id}
              defaultCollapsed={opts?.defaultCollapsed}
              isPast={opts?.isPast}
              message={message}
            />
          );
        };

        const SectionHeader = ({ label, count }: { label: string; count: number }) => (
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:13, fontWeight:500, color:dark40, fontFamily:F, letterSpacing:'0.26px', whiteSpace:'nowrap' }}>
              {label} <span style={{ fontWeight:400 }}>({count})</span>
            </span>
            <div style={{ flex:1, height:1, background:dark8 }} />
          </div>
        );

        // Nothing to approve = no active campaign has any readyForClient+pending post
        const hasAnythingToApprove = active.some(c =>
          c.posts.some(p => internalStatuses[p.id] === 'readyForClient' && statuses[p.id] === 'pending')
        );

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
            {/* ── Empty state ── */}
            {!hasAnythingToApprove && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'40px 0 20px' }}>
                <div style={{ width:56, height:56, borderRadius:99, background:'rgba(32,161,79,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke={green} strokeWidth="1.5"/>
                    <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke={green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ margin:0, fontSize:22, fontWeight:500, color:dark90, fontFamily:F, textAlign:'center' }}>
                  All Set! Nothing to Approve just yet.
                </p>
                <div style={{ display:'flex', gap:10 }}>
                  <Button variant="secondary" size="sm" frontIcon={Layers5}>Open Campaigns</Button>
                  <Button variant="secondary" size="sm" frontIcon={CalendarEdit}>Go to Calendar</Button>
                </div>
              </div>
            )}

            {/* ── Active campaigns ── */}
            {active.map(renderCampaign)}

            {/* ── Approved section ── */}
            {approved.length > 0 && (
              <>
                <SectionHeader label="Approved" count={approved.length} />
                {approved.map(renderCampaign)}
              </>
            )}

            {/* ── Past (unapproved) section ── */}
            {past.length > 0 && (
              <>
                <SectionHeader label="Past campaigns" count={past.length} />
                {past.map(c => renderCampaign(c, { defaultCollapsed: true, isPast: true }))}
              </>
            )}
          </div>
        );
      })()
      )}

      {/* Feedback submitted toast */}
      {showFeedbackToast && createPortal(
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
          <Toast variant="success" onDismiss={() => setShowFeedbackToast(false)}>
            Feedback submitted. Agent is notified for revision.
          </Toast>
        </div>,
        document.body
      )}
    </>
  );
}

/** Standalone prototype chrome — its own shell + a local View-as-client toggle
 *  that drives the shared <ApprovalV2View>. */
function ApprovalV2Inner() {
  const [clientView, setClientView] = useState(false);
  const { openModal } = useModals();
  return (
    <PrototypeShell
      title="Approvals"
      sidebarSections={H2_SECTIONS}
      workspaceName="CertaPro Austin"
      topbarRight={
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:dark90, fontFamily:F }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16z" fill={dark90}/></svg>
            82 Credits
          </span>
          <Button variant="tertiary" size="sm" frontIcon={Settings} onPress={() => openModal(ApprovalSettingsModal, {})}>Settings</Button>
          <Button
            variant={clientView ? 'primary' : 'secondary'}
            size="sm"
            frontIcon={EyeOpen}
            onPress={() => setClientView(v => !v)}
          >
            {clientView ? 'Exit client view' : 'View as client'}
          </Button>
        </div>
      }
    >
      <ApprovalV2View clientView={clientView} />
    </PrototypeShell>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ApprovalV2Web() {
  return (
    <ModalStack>
      <ApprovalV2Inner />
    </ModalStack>
  );
}
