import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PrototypeShell } from '../_shell';
import { Button, Modal, ModalStack, useModals } from '@/components';
import { Approvals as ApprovalsIcon, Check2, EyeOpen, ArrowLeft, ArrowRight, Globe, CalendarEdit } from '@/icons/20';
import { Maximise01 } from '@/icons/20/Maximise01';
import { Minimise02 } from '@/icons/20/Minimise02';
import { Layers5 } from '@/icons/24';
import { ChevronDown, ChevronRight } from '@/icons/16';

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
      { id:0, type:'still',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:00', img:U1, caption:'Get ready to take a trip down memory lane with our latest design. Experience the finest dining in the heart of the city.' },
      { id:1, type:'story',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:01', img:U2, caption:'Get access to loyalty discounts and savings this fall! Limited time offer for our valued members.' },
      { id:2, type:'feed-video', date:'Sep 25  10:00am', dateSort:'2025-09-25T10:02', img:U3, caption:'Behind the scenes of our latest farm-to-table experience. Watch how we source the freshest ingredients.' },
      { id:3, type:'story',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:03', img:U4, caption:'Limited time offer — shop now and save 25% on all meal prep kits this weekend only.' },
      { id:4, type:'carousel',   date:'Sep 25  10:00am', dateSort:'2025-09-25T10:04', img:U5, slides:5, caption:'Spring is here — swipe through our top 5 seasonal picks for a healthier you.' },
      { id:5, type:'still',      date:'Sep 26  10:00am', dateSort:'2025-09-26T10:00', img:U6, caption:'Wellness tips for the modern professional. Eat better, live better, feel better every day.' },
      { id:6, type:'carousel',   date:'Sep 27  11:00am', dateSort:'2025-09-27T11:00', img:U7, slides:4, caption:'Our top picks for the season — curated by our nutrition experts for optimal health.' },
      { id:7, type:'email',      date:'Sep 28  8:00am',  dateSort:'2025-09-28T08:00', img:U8, caption:'Snag 20% off — limited time sale this weekend! Don\'t miss our biggest discount of the year.' },
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

// ── Status pill ───────────────────────────────────────────────────────────────
const purple = '#7f24b7';

function StatusPill({ status, dontPostReasons, isPast }: { status: Status; dontPostReasons?: string[]; isPast?: boolean }) {
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const isDontPost = status === 'rejected';
  const isPosted  = isPast && status === 'approved';
  const isFailed  = isPast && status === 'pending';
  const cfg =
    isPosted ? {
      bg: white, overlay: 'rgba(127,36,183,0.08)',
      border: 'rgba(127,36,183,0.25)', color: purple, label: 'Posted',
    } :
    isFailed ? {
      bg: white, overlay: dark4,
      border: dark15, color: dark60, label: 'Failed',
    } :
    status === 'approved' ? {
      bg: white, overlay: 'rgba(32,161,79,0.1)',
      border: 'rgba(32,161,79,0.25)', color: green, label: 'Approved',
    } :
    isDontPost ? {
      bg: white, overlay: 'rgba(174,34,34,0.08)',
      border: 'rgba(174,34,34,0.3)', color: '#ae2222', label: "Don't Post",
    } : {
      bg: white, overlay: 'rgba(255,174,0,0.3)',
      border: 'rgba(255,174,0,0.45)', color: '#7a4800', label: 'Review',
    };

  const hasReasons = isDontPost && dontPostReasons && dontPostReasons.length > 0;

  return (
    <>
      <span
        style={{ display: 'inline-flex', alignItems: 'center' }}
        onMouseEnter={e => {
          if (!hasReasons) return;
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
          {isDontPost && (
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M6.5 6C6.5 5.17 7.17 4.5 8 4.5C8.83 4.5 9.5 5.17 9.5 6C9.5 6.83 8 7.5 8 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
            </svg>
          )}
        </span>
      </span>
      {tooltipPos && hasReasons && createPortal(
        <div style={{
          position: 'fixed', left: tooltipPos.x, top: tooltipPos.y,
          transform: 'translateY(calc(-100% - 8px))',
          background: dark90, color: white, borderRadius: 6,
          padding: '8px 10px', fontSize: 11, fontFamily: F, lineHeight: 1.6,
          whiteSpace: 'nowrap', zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontWeight: 500, marginBottom: 4, opacity: 0.7, fontSize: 10, letterSpacing: '0.2px', textTransform: 'uppercase' }}>Reason</div>
          {dontPostReasons!.map(r => <div key={r}>• {r}</div>)}
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
  post, status, dontPostReasons, isPast, onApprove, onRemoveApproval, onReview,
}: {
  post: Post; status: Status; dontPostReasons?: string[]; isPast?: boolean;
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
        /* ── Portrait 9:16 layout — padded inside dark-2 card, rounded image ── */
        <div style={{ flex:1, padding:'0 8px 32px', display:'flex', flexDirection:'column' }}>
          <div style={{
            flex:1, position:'relative', overflow:'hidden',
            borderRadius:8, background:'#1a1a1a',
          }}>
            {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            {/* Play icon for feed-video / short */}
            {(post.type === 'feed-video' || post.type === 'short') && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:36, height:36, borderRadius:99, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="11" height="13" viewBox="0 0 16 18" fill="white"><path d="M2 2L14 9L2 16V2Z"/></svg>
                </div>
              </div>
            )}
          </div>
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
        <StatusPill status={status} dontPostReasons={dontPostReasons} isPast={isPast} />
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
  campaign, statuses, dontPostReasons, onApprove, onRemoveApproval, onReview, onApproveAll, justCompleted, defaultCollapsed, isPast,
}: {
  campaign: Campaign;
  statuses: Record<number, Status>;
  dontPostReasons: Record<number, string[]>;
  onApprove: (id: number) => void;
  onRemoveApproval: (id: number) => void;
  onReview: (id: number) => void;
  onApproveAll: () => void;
  justCompleted?: boolean;
  defaultCollapsed?: boolean;
  isPast?: boolean;
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
  onConfirm: () => void;
  onReviewFirst: () => void;
}) {
  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <span style={{ fontSize: 17, fontWeight: 500, color: dark90, fontFamily: F }}>
          Resubmit to Client?
        </span>
      </Modal.Header>
      <Modal.Content>
        <p style={{ margin: 0, fontSize: 14, color: dark60, fontFamily: F, lineHeight: 1.65 }}>
          Have you revised this post? The client will be notified to review it again.
        </p>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="secondary" onPress={() => { close(); onReviewFirst(); }}>
            Review Post First
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => { onConfirm(); close(); }}>
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
    if (otherSelected && otherText.trim()) reasons.push(otherText.trim());
    else if (otherSelected) reasons.push('Other');
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
          {otherSelected && (
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
              autoFocus
            />
          )}
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

// ── Content review page (full-page overlay) ───────────────────────────────────
function ReviewPage({ post, status, allPosts, allStatuses, onClose, onApprove, onRemoveApproval, onDontPost, onNavigate,
  mode, internalStatus, onMarkReady, onUndoReady, dontPostReasons, isPast,
}: {
  post: Post; status: Status;
  allPosts: Post[]; allStatuses: Record<number, Status>;
  onClose: () => void; onApprove: () => void; onRemoveApproval: () => void;
  onDontPost: (reasons: string[]) => void; onNavigate: (id: number) => void;
  mode?: 'internal' | 'client';
  internalStatus?: InternalStatus;
  onMarkReady?: () => void;
  onUndoReady?: () => void;
  dontPostReasons?: Record<number, string[]>;
  isPast?: boolean;
}) {
  const [chatInput, setChatInput] = useState('');
  const [focusMode, setFocusMode] = useState(true);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const CAPTION_LIMIT = 100;
  const { openModal } = useModals();
  const handleDontPost = () => openModal(DontPostModal, { onConfirm: (reasons: string[]) => onDontPost(reasons) });
  const isApproved = status === 'approved';
  const isInternal = mode === 'internal';
  const isReadyForClient = internalStatus === 'readyForClient';
  const currentIdx = allPosts.findIndex(p => p.id === post.id);
  const prevPost = allPosts[currentIdx - 1];
  const nextPost = allPosts[currentIdx + 1];

  const suggestions = [
    { emoji: '🖼️', label: 'Change photo content', detail: '"add people into the background to fill the scene"' },
    { emoji: '🖼️', label: 'Adjust background', detail: '"replace the background with a modern office"' },
    { emoji: '✏️', label: 'Change text overlay', detail: '"make the headline bigger and move it to the top"' },
    { emoji: '👆', label: 'Modify colors', detail: '"make the color scheme more vibrant"' },
    { emoji: '👆', label: 'Modify branding', detail: '"Add my logo in the bottom right corner"' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: '#f4f5f5',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Top bar ── */}
      <div style={{
        height: 52, flexShrink: 0,
        background: white, borderBottom: `1px solid ${dark8}`,
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
      }}>
        {/* Left: back + title + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <Button variant="ghost" size="sm" square frontIcon={ArrowLeft} onPress={onClose} />
          <span style={{ fontSize: 14, fontWeight: 400, color: dark80, fontFamily: F, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
            {post.caption.slice(0, 48)}{post.caption.length > 48 ? '…' : ''}
          </span>
          {isInternal ? (() => {
              if (isPast) return <StatusPill status={status} isPast dontPostReasons={dontPostReasons?.[post.id]} />;
              if (status === 'rejected' && isReadyForClient) return <StatusPill status="rejected" dontPostReasons={dontPostReasons?.[post.id]} />;
              if (status === 'approved' && isReadyForClient) return <StatusPill status="approved" />;
              return <InternalStatusPill status={internalStatus ?? 'internalReview'} />;
            })()
            : <StatusPill status={status} dontPostReasons={dontPostReasons?.[post.id]} isPast={isPast} />}
          <Button variant="ghost" size="sm" square>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill={dark60}/><circle cx="12" cy="12" r="1.5" fill={dark60}/><circle cx="19" cy="12" r="1.5" fill={dark60}/></svg>
          </Button>
        </div>

        {/* Center: Prev / Don't Post / primary CTA / Next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Button
            variant="ghost" size="sm" frontIcon={ArrowLeft}
            isDisabled={!prevPost}
            onPress={() => prevPost && onNavigate(prevPost.id)}
          >
            Previous
          </Button>
          {!(isInternal && isReadyForClient) && status !== 'rejected' && (
            <Button variant="secondary" size="sm" onPress={handleDontPost}>
              Don't Post
            </Button>
          )}
          {isInternal ? (
            isReadyForClient ? (
              <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon} onPress={() => { onUndoReady?.(); }}>
                Remove Approval
              </Button>
            ) : (
              <Button variant="green" size="sm" frontIcon={Check2} onPress={() => { onMarkReady?.(); }}>
                Ready for Client
              </Button>
            )
          ) : (
            isApproved ? (
              <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon} onPress={() => { onRemoveApproval(); }}>
                Remove approval
              </Button>
            ) : status === 'rejected' ? (
              <Button variant="secondary" size="sm" frontIcon={CalendarEdit} onPress={() => { onRemoveApproval(); }}>
                Reschedule
              </Button>
            ) : (
              <Button variant="green" size="sm" frontIcon={Check2} onPress={() => { onApprove(); }}>
                Approve
              </Button>
            )
          )}
          <Button
            variant="ghost" size="sm" endIcon={ArrowRight}
            isDisabled={!nextPost}
            onPress={() => nextPost && onNavigate(nextPost.id)}
          >
            Next
          </Button>
        </div>

        {/* Right: credits + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: dark90, fontFamily: F }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16z" fill={dark90}/></svg>
            82 Credits
          </span>
          <div style={{ width: 28, height: 28, borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
            <img src={IMG_AVATAR} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left panel — AI suggestions */}
        <div style={{
          width: focusMode ? 0 : 280,
          opacity: focusMode ? 0 : 1,
          overflow: 'hidden',
          padding: focusMode ? 0 : undefined,
          flexShrink: 0,
          background: white, borderRight: `1px solid ${dark8}`,
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
        }}>
          <div style={{ width: 280, display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 20px 0', overflowY: 'auto', minHeight: 0 }}>
            <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 400, color: dark80, fontFamily: F, lineHeight: 1.5 }}>
              Blaze can improve this post by:
            </p>
            <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestions.map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: dark80, fontFamily: F, lineHeight: 1.5 }}>
                  <span style={{ marginRight: 4 }}>{s.emoji}</span>
                  <strong style={{ fontWeight: 500, color: dark90 }}>{s.label}</strong>
                  {': '}
                  <span style={{ color: dark60 }}>{s.detail}</span>
                </li>
              ))}
            </ol>
            <p style={{ margin: '20px 0 12px', fontSize: 13, color: dark80, fontFamily: F }}>What would you like to do?</p>
            <div style={{ flex: 1 }} />
          </div>
          {/* Chat input — pinned to bottom */}
          <div style={{
            width: 280, flexShrink: 0,
            borderTop: `1px solid ${dark8}`, padding: '12px 16px 16px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: `1px solid ${dark8}`, borderRadius: 8, padding: '8px 10px',
              background: white,
            }}>
              {/* Paperclip icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: dark40 }}>
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke={dark40} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask Blaze to change something..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: dark90, fontFamily: F, background: 'transparent', minWidth: 0 }}
              />
              {/* Credits label */}
              <span style={{ fontSize: 11, color: dark40, fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}>5 credits ✦</span>
              {/* Send button */}
              <button style={{
                width: 26, height: 26, borderRadius: 99, border: 'none',
                background: dark90, color: white, cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Center — post preview */}
        <div style={{
          flex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24,
          overflowY: 'auto',
        }}>
          {/* Focus Mode toggle button */}
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
            <Button
              variant="secondary"
              size="sm"
              frontIcon={focusMode ? Maximise01 : Minimise02}
              onPress={() => setFocusMode(f => !f)}
            >
              {focusMode ? 'Open Panels to Edit' : 'Focus Mode'}
            </Button>
          </div>

          {/* Post card wrapper — relative so "View as" can sit to the left */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {/* View as label + social icons — pinned left of post card */}
            <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px' }}>View as</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                {(['instagram','facebook','linkedin','x','google'] as const).map((p, i) => (
                  <SocialIcon key={p} platform={p} active={i === 0} />
                ))}
              </div>
            </div>
            {/* Post card — Instagram style */}
            <div style={{
              width: 320, background: white, borderRadius: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
            }}>
              {/* Header row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
              }}>
                {/* Avatar circle with person icon */}
                <div style={{ width: 32, height: 32, borderRadius: 99, background: dark8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke={dark40} strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={dark40} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: dark90, fontFamily: F, lineHeight: 1.2 }}>Account Not Connected</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12, color: dark60, fontFamily: F }}>Jun 26 at 3:30</span>
                    {/* Lock/visibility icon */}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke={dark40} strokeWidth="1.5"/>
                      <path d="M7 11V7a5 5 0 0110 0v4" stroke={dark40} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                {/* More button ⋯ */}
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: dark80, padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill={dark60}/><circle cx="12" cy="12" r="1.5" fill={dark60}/><circle cx="19" cy="12" r="1.5" fill={dark60}/></svg>
                </button>
              </div>
              {/* Image — square */}
              <div style={{ aspectRatio: '1/1', background: '#c8c0b4', overflow: 'hidden' }}>
                {post.img && <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              {/* Action bar */}
              <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* Like */}
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, color: dark80, fontSize: 12, fontFamily: F }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" stroke={dark80} strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" stroke={dark80} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Like
                </button>
                {/* Comment */}
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, color: dark80, fontSize: 12, fontFamily: F }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={dark80} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Comment
                </button>
                {/* Share */}
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, color: dark80, fontSize: 12, fontFamily: F }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={dark80} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Share
                </button>
              </div>
              {/* Caption */}
              <div style={{ padding: '0 14px 14px' }}>
                <p style={{ margin: 0, fontSize: 13, color: dark90, fontFamily: F, lineHeight: 1.5 }}>
                  <strong style={{ fontWeight: 500 }}>Account Not Connected</strong>{' '}
                  <span style={{ color: dark80 }}>
                    {captionExpanded || post.caption.length <= CAPTION_LIMIT
                      ? post.caption
                      : post.caption.slice(0, CAPTION_LIMIT) + '…'}
                  </span>
                  {post.caption.length > CAPTION_LIMIT && (
                    <span
                      onClick={() => setCaptionExpanded(e => !e)}
                      style={{ color: dark40, cursor: 'pointer', marginLeft: 4 }}
                    >
                      {captionExpanded ? 'See less' : 'See more'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — posting details */}
        <div style={{
          width: focusMode ? 0 : 220,
          opacity: focusMode ? 0 : 1,
          overflow: 'hidden',
          flexShrink: 0,
          background: white, borderLeft: `1px solid ${dark8}`,
          transition: 'width 0.3s ease, opacity 0.3s ease',
        }}>
          <div style={{ width: 220, padding: '20px 16px', overflowY: 'auto', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Posting on */}
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Posting on</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: dark90, fontFamily: F, flex: 1 }}>{post.date}</p>
                <button style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={dark40} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            {/* Posting to */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Posting to</p>
              {[
                { name: 'Instagram', platform: 'instagram', connected: false },
                { name: 'Facebook', platform: 'facebook', connected: true },
                { name: 'LinkedIn', platform: 'linkedin', connected: true },
                { name: 'X/Twitter', platform: 'x', connected: true },
                { name: 'Google Business', platform: 'google', connected: true },
              ].map(acct => (
                <div key={acct.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <SocialIcon platform={acct.platform} active={acct.connected} />
                  <span style={{ fontSize: 13, color: dark90, fontFamily: F, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acct.name}</span>
                  {acct.connected
                    ? <div style={{ width: 18, height: 18, borderRadius: 99, background: dark4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={dark40} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    : <Button variant="secondary" size="xs" onPress={() => {}}>Connect</Button>
                  }
                </div>
              ))}
            </div>

            {/* Campaign */}
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Campaign</p>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: dark90, fontFamily: F }}>Eat Well Feel Better</p>
              <p style={{ margin: 0, fontSize: 12, color: dark60, fontFamily: F }}>🛍️ Lifestyle Content</p>
            </div>

            {/* Quick Edits */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Quick Edits</p>
              {[
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={dark60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={dark60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label: 'Adjust caption',
                },
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={dark60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={dark60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label: 'Change design elements',
                },
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke={dark60} strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke={dark60} strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke={dark60} strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke={dark60} strokeWidth="1.5"/></svg>,
                  label: 'Add more in Designer',
                },
              ].map(item => (
                <button key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 4 }}>
                  {item.icon}
                  <span style={{ fontSize: 13, color: dark90, fontFamily: F }}>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Redesign */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Redesign</p>
              {[
                { icon: '↻', label: 'Regenerate Design', sub: 'Blaze will generate new design' },
                { icon: '🖼', label: 'Replace with Image', sub: 'Swap design with your own' },
              ].map(item => (
                <button key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 8, textAlign: 'left' }}>
                  <span style={{ fontSize: 16, lineHeight: 1.2 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, color: dark90, fontFamily: F }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: dark40, fontFamily: F }}>{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
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
  returnedByClient, approvedByClient, dontPostReasons, onResubmit, pastClientStatus,
}: {
  post: Post; internalStatus: InternalStatus; isPast?: boolean;
  onMarkReady: () => void; onUndo: () => void; onReview: () => void;
  returnedByClient?: boolean;
  approvedByClient?: boolean;
  dontPostReasons?: string[];
  onResubmit?: () => void;
  pastClientStatus?: Status;
}) {
  const [hovered, setHovered] = useState(false);
  const { openModal } = useModals();
  const isReady = internalStatus === 'readyForClient';

  const handleResubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(ResubmitModal, {
      onConfirm: () => onResubmit?.(),
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
        background:dark2, border:`1px solid ${dark4}`, borderRadius:10,
        overflow:'hidden', cursor:'pointer',
        opacity: returnedByClient ? 1 : isReady ? 0.65 : 1, transition:'opacity 0.2s',
        display:'flex', flexDirection:'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div style={{ height:HEADER_H, display:'flex', alignItems:'center', gap:4, padding:'12px 12px 2px', flexShrink:0 }}>
        <TypeIcon type={post.type} size={14} />
        <span style={{ fontSize:12, color:dark60, fontFamily:F, flex:1, letterSpacing:'0.24px' }}>{TYPE_LABEL[post.type]}</span>
        <span style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', whiteSpace:'nowrap' }}>{post.date}</span>
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
        <div style={{ flex:1, padding:'0 8px 32px', display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, position:'relative', overflow:'hidden', borderRadius:8, background:'#1a1a1a' }}>
            {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            {(post.type === 'feed-video' || post.type === 'short') && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:36, height:36, borderRadius:99, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="11" height="13" viewBox="0 0 16 18" fill="white"><path d="M2 2L14 9L2 16V2Z"/></svg>
                </div>
              </div>
            )}
          </div>
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
          : returnedByClient
            ? <StatusPill status="rejected" dontPostReasons={dontPostReasons} />
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
          ) : returnedByClient ? (
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
            <>
              <Button
                variant={isReady ? 'secondary' : 'green'}
                size="sm"
                frontIcon={isReady ? ApprovalsIcon : Check2}
                onClick={(e) => { e.stopPropagation(); isReady ? onUndo() : onMarkReady(); }}
              >
                {isReady ? 'Undo' : 'Ready for Client'}
              </Button>
              <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onReview(); }}>
                Review
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Internal campaign section (proper component so useState works) ───────────
function InternalCampaignSection({
  campaign, internalStatuses, statuses, dontPostReasons, today, isPast: isPastProp,
  onMarkReady, onUndo, onMarkAllReady, onReview, onResubmit,
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
  onMarkAllReady: () => void;
  onReview: (post: Post) => void;
  onResubmit: (id: number) => void;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);
  const [returnedCollapsed, setReturnedCollapsed] = useState(false);
  const [approvedCollapsed, setApprovedCollapsed] = useState(false);

  const posts = campaign.posts;
  const isReturned    = (p: Post) => statuses[p.id] === 'rejected'  && internalStatuses[p.id] === 'readyForClient';
  const isApproved    = (p: Post) => statuses[p.id] === 'approved'  && internalStatuses[p.id] === 'readyForClient';
  const returnedPosts      = posts.filter(isReturned);
  const approvedByClient   = posts.filter(isApproved);
  const activePosts        = posts.filter(p => !isReturned(p) && !isApproved(p));
  const readyCount  = activePosts.filter(p => internalStatuses[p.id] === 'readyForClient').length;
  const totalCount  = activePosts.length;
  const allReady    = totalCount > 0 && readyCount === totalCount;
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

                {/* Client feedback counters */}
                {hasClientFeedback && (
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {clientRejectedCount > 0 && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:12, color:red, fontFamily:F, fontWeight:500 }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke={red} strokeWidth="1.4"/>
                          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={red} strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        {clientRejectedCount}
                      </span>
                    )}
                    {clientApprovedCount > 0 && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:12, color:green, fontFamily:F, fontWeight:500 }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke={green} strokeWidth="1.4"/>
                          <path d="M5 8.5l2 2 4-4" stroke={green} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {clientApprovedCount}
                      </span>
                    )}
                  </div>
                )}

                {/* All Ready for Client */}
                {!allReady && totalCount > 0 && (
                  <>
                    <div style={{ width:1, height:16, background:dark8 }} />
                    <button onClick={onMarkAllReady}
                      style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 8px', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', fontSize:14, fontWeight:400, color:dark90, fontFamily:F }}>
                      <ApprovalsIcon size={15} color={dark90} />
                      All Ready for Client
                    </button>
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
          <>
          {/* 1 — Active posts */}
          {activePosts.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
              {activePosts.map(post => (
                <InternalCard
                  key={post.id} post={post}
                  internalStatus={internalStatuses[post.id]}
                  onMarkReady={() => onMarkReady(post.id)}
                  onUndo={() => onUndo(post.id)}
                  onReview={() => onReview(post)}
                />
              ))}
            </div>
          )}

          {/* 2 — Returned by Client (below active, full opacity) */}
          {returnedPosts.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:1, background:dark8 }} />
                <button
                  onClick={() => setReturnedCollapsed(c => !c)}
                  style={{ display:'flex', alignItems:'center', gap:5, background:'transparent', border:'none', cursor:'pointer', padding:'2px 0', flexShrink:0 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                    <circle cx="12" cy="12" r="9" stroke={red} strokeWidth="1.5"/>
                    <path d="M9 9l6 6M15 9l-6 6" stroke={red} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize:12, fontWeight:500, color:red, fontFamily:F, whiteSpace:'nowrap' }}>
                    Returned by Client ({returnedPosts.length})
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    style={{ transform: returnedCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" stroke={dark40} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div style={{ flex:1, height:1, background:dark8 }} />
              </div>
              {!returnedCollapsed && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
                  {returnedPosts.map(post => (
                    <InternalCard
                      key={post.id} post={post}
                      internalStatus={internalStatuses[post.id]}
                      returnedByClient isPast={isPastCamp} dontPostReasons={dontPostReasons[post.id]}
                      onMarkReady={() => onMarkReady(post.id)}
                      onUndo={() => onUndo(post.id)}
                      onReview={() => onReview(post)}
                      onResubmit={() => onResubmit(post.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3 — Approved by Client (bottom, dimmed, collapsible) */}
          {approvedByClient.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:1, background:dark8 }} />
                <button
                  onClick={() => setApprovedCollapsed(c => !c)}
                  style={{ display:'flex', alignItems:'center', gap:5, background:'transparent', border:'none', cursor:'pointer', padding:'2px 0', flexShrink:0 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                    <circle cx="12" cy="12" r="9" stroke={green} strokeWidth="1.5"/>
                    <path d="M8.5 12L11 14.5L15.5 9.5" stroke={green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize:12, fontWeight:500, color:green, fontFamily:F, whiteSpace:'nowrap' }}>
                    Approved by Client ({approvedByClient.length})
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    style={{ transform: approvedCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" stroke={dark40} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div style={{ flex:1, height:1, background:dark8 }} />
              </div>
              {!approvedCollapsed && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
                  {approvedByClient.map(post => (
                    <InternalCard
                      key={post.id} post={post}
                      internalStatus={internalStatuses[post.id]}
                      approvedByClient
                      onMarkReady={() => onMarkReady(post.id)}
                      onUndo={() => onUndo(post.id)}
                      onReview={() => onReview(post)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Inner app (needs ModalStack context) ─────────────────────────────────────
function ApprovalV2Inner() {
  const allPosts = CAMPAIGNS.flatMap(c => c.posts);
  const today = '2026-06-03';
  const [tab, setTab] = useState<'internal' | 'client'>('internal');

  // Internal statuses — all start as internalReview (past campaigns pre-mixed)
  const [internalStatuses, setInternalStatuses] = useState<Record<number, InternalStatus>>(() => {
    const initial: Record<number, InternalStatus> = {};
    CAMPAIGNS.forEach(c => {
      const isPast = c.endDate < today;
      c.posts.forEach((p, i) => {
        initial[p.id] = isPast ? (i % 2 === 0 ? 'readyForClient' : 'internalReview') : 'internalReview';
      });
    });
    return initial;
  });

  const [statuses, setStatuses] = useState<Record<number, Status>>(() => {
    const initial: Record<number, Status> = {};
    CAMPAIGNS.forEach(c => {
      const isPast = c.endDate < today;
      c.posts.forEach((p, i) => {
        // Past campaigns: alternate approved / rejected, no pending
        initial[p.id] = isPast ? (i % 2 === 0 ? 'approved' : 'rejected') : 'pending';
      });
    });
    return initial;
  });

  const [reviewPost, setReviewPost] = useState<Post | null>(null);
  const [completingCampaignId, setCompletingCampaignId] = useState<number | null>(null);
  const [dontPostReasons, setDontPostReasons] = useState<Record<number, string[]>>({});

  const { openModal } = useModals();

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

  const resubmitPost = (id: number) => {
    setStatuses(prev => ({ ...prev, [id]: 'pending' }));
    setDontPostReasons(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  // Internal handlers
  const markReadyForClient = (id: number) => {
    setInternalStatuses(prev => ({ ...prev, [id]: 'readyForClient' }));
  };
  const undoReady = (id: number) => {
    setInternalStatuses(prev => ({ ...prev, [id]: 'internalReview' }));
  };
  const markAllReadyForClient = (campaign: Campaign) => {
    setInternalStatuses(prev => {
      const next = { ...prev };
      campaign.posts.forEach(p => { next[p.id] = 'readyForClient'; });
      return next;
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

  // Topbar right: credits only (shell renders its own avatar)
  const avatarEl = (
    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:dark90, fontFamily:F }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16z" fill={dark90}/></svg>
      82 Credits
    </span>
  );

  // Tab bar in topbar center
  const tabBar = (
    <div style={{ display:'flex', gap:2, background:dark4, borderRadius:8, padding:3 }}>
      {(['internal','client'] as const).map(t => (
        <button key={t} onClick={() => setTab(t)} style={{
          height:28, padding:'0 14px', borderRadius:6, border:'none',
          background: tab === t ? white : 'transparent',
          color: tab === t ? dark90 : dark60,
          fontSize:13, fontWeight: tab === t ? 500 : 400, fontFamily:F,
          cursor:'pointer', transition:'background 0.15s, color 0.15s',
          boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5,
        }}>
          {t === 'internal' ? 'Internal Review' : 'Client Approval'}
          {t === 'internal' && (() => {
            const n = CAMPAIGNS.filter(c => c.endDate >= today).flatMap(c => c.posts).filter(p => statuses[p.id] === 'rejected').length;
            return n > 0 ? (
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:16, height:16, borderRadius:99, background:red, color:white, fontSize:10, fontWeight:600, padding:'0 4px', lineHeight:1 }}>{n}</span>
            ) : null;
          })()}
        </button>
      ))}
    </div>
  );

  return (
    <PrototypeShell
      title="Approvals"
      sidebarActiveLabel="Approvals"
      topbarCenter={tabBar}
      topbarRight={avatarEl}
    >
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
          const activeCampaigns = CAMPAIGNS.filter(c => c.endDate >= today);
          const pastCampaigns   = CAMPAIGNS.filter(c => c.endDate < today);

          const renderIC = (c: Campaign, opts?: { defaultCollapsed?: boolean; isPast?: boolean }) => (
            <InternalCampaignSection
              key={c.id}
              campaign={c}
              internalStatuses={internalStatuses}
              statuses={statuses}
              dontPostReasons={dontPostReasons}
              today={today}
              isPast={opts?.isPast}
              defaultCollapsed={opts?.defaultCollapsed}
              onMarkReady={markReadyForClient}
              onUndo={undoReady}
              onMarkAllReady={() => markAllReadyForClient(c)}
              onReview={setReviewPost}
              onResubmit={resubmitPost}
            />
          );

          const readyCampaigns = activeCampaigns.filter(isAllReady);
          const activePending  = activeCampaigns.filter(c => !isAllReady(c));

          return (
            <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
              {activePending.map(c => renderIC(c))}
              {readyCampaigns.length > 0 && (
                <>
                  <SectionHeader label="Ready for Client" count={readyCampaigns.length} />
                  {readyCampaigns.map(c => renderIC(c))}
                </>
              )}
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
          return (
            <CampaignSection
              key={campaign.id}
              campaign={clientCampaign}
              statuses={statuses}
              dontPostReasons={dontPostReasons}
              onApprove={(id) => approve(id, campaign.id)}
              onRemoveApproval={removeApproval}
              onReview={(id) => { setReviewPost(campaign.posts.find(p => p.id === id)!); }}
              onApproveAll={() => approveAll(clientCampaign)}
              justCompleted={completingCampaignId === campaign.id}
              defaultCollapsed={opts?.defaultCollapsed}
              isPast={opts?.isPast}
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

      {/* Full-page review */}
      {reviewPost && (
        <ReviewPage
          post={reviewPost}
          status={statuses[reviewPost.id]}
          allPosts={CAMPAIGNS.flatMap(c => c.posts)}
          allStatuses={statuses}
          onClose={() => setReviewPost(null)}
          onApprove={() => {
            const c = CAMPAIGNS.find(c => c.posts.some(p => p.id === reviewPost.id))!;
            approve(reviewPost.id, c.id);
          }}
          onRemoveApproval={() => removeApproval(reviewPost.id)}
          onDontPost={(reasons) => { rejectPost(reviewPost.id); setDontPostReasons(prev => ({ ...prev, [reviewPost.id]: reasons })); setReviewPost(null); }}
          onNavigate={(id) => setReviewPost(CAMPAIGNS.flatMap(c => c.posts).find(p => p.id === id) ?? null)}
          mode={tab}
          internalStatus={internalStatuses[reviewPost.id]}
          onMarkReady={() => markReadyForClient(reviewPost.id)}
          onUndoReady={() => undoReady(reviewPost.id)}
          dontPostReasons={dontPostReasons}
          isPast={CAMPAIGNS.find(c => c.posts.some(p => p.id === reviewPost.id))?.endDate < today}
        />
      )}
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
