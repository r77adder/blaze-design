import { useState, useCallback, useRef } from 'react';
import { PhoneFrame } from '../_shell';
import { TabBar, GlassIconButton, ContentCard, CampaignPill, ContentPill, PostPreviewCard, ToolbarHeader, ContentPreviewFooter, ToolbarButton } from '@ios/components';
import type { TabItem } from '@ios/components';
import homeIcon from '@ios/icons/home-04.svg';
import homeFilledIcon from '@ios/icons/home-filled.svg';
import calendarIcon from '@ios/icons/calendar-01.svg';
import layersIcon from '@ios/icons/layers-05.svg';
import atomIcon from '@ios/icons/atom.svg';
import moreIcon from '@ios/icons/more-dots.svg';
import chevLeftIcon from '@ios/icons/chevron-left.svg';
import approvalsIcon from '@ios/icons/approvals.svg';
import creditsIcon from '@ios/icons/credits.svg';

// ── Image assets ──────────────────────────────────────────────────────────────
const HERO   = 'https://www.figma.com/api/mcp/asset/d2648b60-309f-4127-b5c3-cf36aee60154';
const AVATAR = 'https://www.figma.com/api/mcp/asset/efaaccc8-0c4d-4b5a-8bb3-cbd3253b808f';
const IMG1   = 'https://www.figma.com/api/mcp/asset/f9de6206-307b-4a7d-a279-7fdad209957c';
const IMG2   = 'https://www.figma.com/api/mcp/asset/861374f8-f235-4861-982b-7ef9c61b993f';
const IMG3   = 'https://www.figma.com/api/mcp/asset/d2648b60-309f-4127-b5c3-cf36aee60154';
const IMG4   = 'https://www.figma.com/api/mcp/asset/7fdee3c4-c5be-4da5-9bbc-affa5ebd7190';
const IMG5   = 'https://www.figma.com/api/mcp/asset/60bdce21-f033-4e5d-9866-a632780b79cc';
const IMG_EMAIL = 'https://www.figma.com/api/mcp/asset/18c22376-a705-44c4-b1d2-b76779d4ef38';
const IMG_BLOG  = 'https://www.figma.com/api/mcp/asset/4b9ee42d-7ad2-45cc-a259-c3adbb12b836';
const COFFEE1 = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80';
const COFFEE2 = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80';
const COFFEE3 = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop&q=80';
const COFFEE4 = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop&q=80';
const COFFEE5 = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';
const COFFEE6 = 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80';

// ── Types ─────────────────────────────────────────────────────────────────────
type PostStatus = 'pending' | 'approved' | 'rejected';
type PostType = 'still' | 'carousel' | 'story' | 'short' | 'feed-video' | 'email' | 'blog';

interface Post {
  id: number;
  type: PostType;
  platform: string;
  date: string;
  dateSort: string; // ISO-style for sorting
  caption: string;
  img?: string;
  slides?: number;
  sticker1?: string;
  sticker2?: string;
  subject?: string;
  title?: string;
}

const POSTS: Post[] = [
  { id:0,  type:'still',      platform:'Instagram', date:'Sep 25 · 10:00am', dateSort:'2025-09-25T10:00', img:IMG1,    caption:'Discover the joyful playtime moments at Houston Boxer Rescue where each wag of a tail brings pure joy.' },
  { id:1,  type:'story',      platform:'Instagram', date:'Sep 26 · 9:00am',  dateSort:'2025-09-26T09:00', img:COFFEE1, sticker1:'Get access to loyalty', sticker2:'discounts and savings', caption:'Get access to loyalty discounts and savings this fall!' },
  { id:2,  type:'carousel',   platform:'Instagram', date:'Sep 27 · 11:00am', dateSort:'2025-09-27T11:00', slides:5, img:IMG2, caption:'Spring is here and so are our amazing deals on premium coffee.' },
  { id:3,  type:'short',      platform:'YouTube',   date:'Sep 28 · 2:00pm',  dateSort:'2025-09-28T14:00', img:COFFEE2, caption:'Description goes here and continue to be in two lines #hashtag' },
  { id:4,  type:'feed-video', platform:'Instagram', date:'Sep 29 · 10:00am', dateSort:'2025-09-29T10:00', img:IMG3, caption:'Behind the scenes of our latest Kona Coffee roast.' },
  { id:5,  type:'email',      platform:'Email',     date:'Oct 1 · 8:00am',   dateSort:'2025-10-01T08:00', img:COFFEE3, subject:'Snag 20% Off Our New Product: Limited Time Sale this Weekend!', caption:'Snag 20% Off Our New Product' },
  { id:6,  type:'blog',       platform:'Blog',      date:'Oct 2 · 9:00am',   dateSort:'2025-10-02T09:00', img:COFFEE4, title:'Unleashing Business Potential with AI: Transformative Tools for Your Company', caption:'Unleashing Business Potential with AI' },
  { id:7,  type:'still',      platform:'Facebook',  date:'Oct 3 · 9:00am',   dateSort:'2025-10-03T09:00', img:IMG4, caption:'Wellness tips for the modern professional. Start your day right.' },
  { id:8,  type:'carousel',   platform:'Instagram', date:'Oct 4 · 11:00am',  dateSort:'2025-10-04T11:00', slides:4, img:IMG5, caption:'Our top picks for the season — swipe through to see all 4 featured products.' },
  { id:9,  type:'story',      platform:'Instagram', date:'Oct 5 · 10:00am',  dateSort:'2025-10-05T10:00', img:COFFEE5, sticker1:'Limited time offer!', sticker2:'Shop now and save 25%', caption:'Limited time offer! Shop now and save 25%' },
  { id:10, type:'short',      platform:'TikTok',    date:'Oct 6 · 2:00pm',   dateSort:'2025-10-06T14:00', img:COFFEE6, caption:'Watch how we make our signature Kona brew #coffee #recipe' },
  { id:11, type:'feed-video', platform:'Facebook',  date:'Oct 7 · 3:00pm',   dateSort:'2025-10-07T15:00', img:IMG1, caption:'Join us for our virtual tasting event this Friday at 6pm PST.' },
];
const TOTAL = POSTS.length;
const TYPE_LABELS: Record<PostType, string> = { still:'Still image', carousel:'Carousel', story:'Story', short:'Short', 'feed-video':'Feed video', email:'Email', blog:'Blog' };

// ── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  font:    "'Sohne', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
  bgGray:  '#f7f7f7',
  bgLight: '#ffffff',
  dark90:  'rgba(0,0,0,0.9)',
  dark80:  'rgba(0,0,0,0.8)',
  dark60:  'rgba(0,0,0,0.6)',
  dark40:  'rgba(0,0,0,0.4)',
  dark25:  'rgba(0,0,0,0.25)',
  dark15:  'rgba(0,0,0,0.15)',
  dark8:   'rgba(0,0,0,0.08)',
  dark4:   'rgba(0,0,0,0.04)',
  dark2:   'rgba(0,0,0,0.02)',
  light100:'#ffffff',
  green:   '#20a14f',
  green10: 'rgba(32,161,79,0.1)',
  red:     '#ae2222',
};

const ChevRight = ({ color = T.dark25 }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 8L14 12L10 16" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const TAB_ITEMS: TabItem[] = [
  { id:'home',      label:'Home',      icon: homeIcon     as unknown as string, iconActive: homeFilledIcon as unknown as string },
  { id:'calendar',  label:'Calendar',  icon: calendarIcon as unknown as string },
  { id:'campaigns', label:'Campaigns', icon: layersIcon   as unknown as string },
  { id:'brand-kit', label:'Brand Kit', icon: atomIcon     as unknown as string },
  { id:'more',      label:'More',      icon: moreIcon     as unknown as string },
];

// ── Confetti particle ─────────────────────────────────────────────────────────
function ConfettiPiece({ x, color, delay, duration }: { x: number; color: string; delay: number; duration: number }) {
  return (
    <div style={{
      position: 'absolute',
      top: -10,
      left: `${x}%`,
      width: 8,
      height: 8,
      background: color,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      animation: `confettiFall ${duration}s ${delay}s ease-in forwards`,
    }} />
  );
}

// ── Celebration Modal ─────────────────────────────────────────────────────────
function CelebrationModal({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const confettiColors = ['#fcb728', '#7c5cfc', '#20a14f', '#0179cf', '#e65cac', '#ff6b35', '#04af00'];
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 3.5 + Math.sin(i) * 8 + 50) % 100,
    color: confettiColors[i % confettiColors.length],
    delay: (i * 0.06) % 0.8,
    duration: 1.8 + (i % 5) * 0.2,
  }));

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(520px) rotate(720deg) scale(0.5); opacity: 0; }
        }
        @keyframes celebrationSlide {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes celebrationFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes starPop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onDismiss}
        style={{
          position: 'absolute', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.45)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'all' : 'none',
          transition: 'opacity 0.3s',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 301,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '0 24px 44px',
        overflow: 'hidden',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.45s cubic-bezier(0.32,1,0.6,1)',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.12)',
      }}>
        {/* Confetti burst (only animates when visible) */}
        {visible && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {pieces.map((p, i) => <ConfettiPiece key={i} {...p} />)}
          </div>
        )}

        {/* Handle */}
        <div style={{ width: 40, height: 4, background: T.dark8, borderRadius: 99, margin: '14px auto 0' }} />

        {/* Star icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '28px auto 20px',
          background: 'linear-gradient(145deg, #fcb728 0%, #ff9f00 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: visible ? 'starPop 0.55s 0.15s both' : 'none',
          boxShadow: '0 8px 24px rgba(252,183,40,0.35)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.4 8.2H21L15.8 12.1L17.9 18.4L12 14.5L6.1 18.4L8.2 12.1L3 8.2H9.6L12 2Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Heading */}
        <h2 style={{
          margin: '0 0 10px', textAlign: 'center',
          fontSize: 26, fontWeight: 500, color: T.dark90,
          fontFamily: T.font, lineHeight: 1.15,
        }}>
          First campaign approved!
        </h2>

        {/* Subtext */}
        <p style={{
          margin: '0 0 28px', textAlign: 'center',
          fontSize: 16, fontWeight: 400, color: T.dark60,
          fontFamily: T.font, lineHeight: 1.55, letterSpacing: '0.32px',
        }}>
          Kona Coffee for the holidays is approved and ready to post. Your content will go live on schedule.
        </p>

        {/* Approve date row */}
        <div style={{
          background: T.dark4, borderRadius: 12, padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 14, color: T.dark60, fontFamily: T.font }}>Posts scheduled</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: T.dark90, fontFamily: T.font }}>Sep 25 – Oct 7</span>
        </div>

        {/* CTA */}
        <button
          onClick={onDismiss}
          style={{
            width: '100%', height: 52, borderRadius: 99,
            background: T.dark90, color: '#fff', border: 'none',
            fontSize: 16, fontWeight: 400, fontFamily: T.font,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.4"/>
            <path d="M8.5 12L11 14.5L15.5 9.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Done
        </button>

        <p style={{
          margin: '14px 0 0', textAlign: 'center',
          fontSize: 14, color: T.dark40, fontFamily: T.font,
          letterSpacing: '-0.28px',
        }}>
          You can still edit posts before they go live.
        </p>
      </div>
    </>
  );
}

// ── Approval row card ─────────────────────────────────────────────────────────
// Wraps ContentCard with an action bar that appears on hover/tap.
function ApprovalCard({
  post,
  status,
  hovered,
  onHover,
  onApprove,
  onRemoveApproval,
  onReview,
}: {
  post: Post;
  status: PostStatus;
  hovered: boolean;
  onHover: (v: boolean) => void;
  onApprove: () => void;
  onRemoveApproval: () => void;
  onReview: () => void;
}) {
  const isApproved = status === 'approved';

  return (
    <div
      style={{ position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={() => onHover(!hovered)}
    >
      {/* Dimming overlay when actions are visible */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16, zIndex: 1,
        background: 'rgba(0,0,0,0.18)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s',
        pointerEvents: 'none',
      }} />

      <ContentCard
        type={post.type}
        date={post.date}
        caption={post.caption}
        status={status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending'}
        img={post.img}
        slides={post.slides}
        sticker1={post.sticker1}
        sticker2={post.sticker2}
        subject={post.subject}
        title={post.title}
        heroImg={IMG_EMAIL}
        coverImg={IMG_BLOG}
      />

      {/* Action buttons — float above card */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 10,
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'scale(1)' : 'scale(0.92)',
        transition: 'opacity 0.22s, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: hovered ? 'all' : 'none',
      }}>
        {/* Primary: Approve / Remove approval */}
        <button
          onClick={(e) => { e.stopPropagation(); isApproved ? onRemoveApproval() : onApprove(); }}
          style={{
            height: 40, paddingLeft: 16, paddingRight: 16,
            borderRadius: 99,
            background: isApproved ? 'rgba(255,255,255,0.92)' : 'rgba(32,161,79,0.93)',
            color: isApproved ? T.dark90 : '#fff',
            border: isApproved ? `1px solid ${T.dark8}` : 'none',
            fontSize: 14, fontWeight: 500, fontFamily: T.font,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {isApproved ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M19.4221 8.01389C18.0322 5.61438 15.4343 4 12.4588 4C9.08513 4 6.19686 6.07535 5.00433 9.01736M16.9806 9.01736H21V5.00347M5.57787 16.0417C6.96782 18.4412 9.56573 20.0556 12.5412 20.0556C15.9149 20.0556 18.8031 17.9802 19.9957 15.0382M8.0194 15.0382H4V19.0521" stroke={T.dark90} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Remove approval
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.4"/>
                <path d="M8.5 12L11 14.5L15.5 9.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Approve
            </>
          )}
        </button>

        {/* Secondary: Review */}
        <button
          onClick={(e) => { e.stopPropagation(); onReview(); }}
          style={{
            height: 36, paddingLeft: 14, paddingRight: 14,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.85)',
            color: T.dark90,
            border: `1px solid ${T.dark8}`,
            fontSize: 14, fontWeight: 400, fontFamily: T.font,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 1px 8px rgba(0,0,0,0.12)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
            <path d="M2.02173 12.0003C3.29132 7.17363 7.23128 3.66699 12.0001 3.66699C16.769 3.66699 20.7089 7.17363 21.9785 12.0003C20.7089 16.827 16.769 20.3337 12.0001 20.3337C7.23128 20.3337 3.29132 16.827 2.02173 12.0003Z" stroke={T.dark90} strokeWidth="1.4"/>
            <circle cx="12" cy="12" r="3" stroke={T.dark90} strokeWidth="1.4"/>
          </svg>
          Review
        </button>
      </div>
    </div>
  );
}

// ── Campaign screen ───────────────────────────────────────────────────────────
function CampaignScreen({
  onBack,
  onReview,
  postStates,
  onApprovePost,
  onRemoveApproval,
}: {
  onBack: () => void;
  onReview: (index: number) => void;
  postStates: PostStatus[];
  onApprovePost: (id: number) => void;
  onRemoveApproval: (id: number) => void;
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [approvedCollapsed, setApprovedCollapsed] = useState(false);

  // Sort: pending/rejected first by date, approved last by date
  const pendingPosts = POSTS
    .filter(p => postStates[p.id] !== 'approved')
    .sort((a, b) => a.dateSort.localeCompare(b.dateSort));

  const approvedPosts = POSTS
    .filter(p => postStates[p.id] === 'approved')
    .sort((a, b) => a.dateSort.localeCompare(b.dateSort));

  const approvedCount = approvedPosts.length;
  const pendingCount  = pendingPosts.filter(p => postStates[p.id] === 'pending').length;

  const MenuRow = ({ label, value, last = false }: { label: string; value?: string; last?: boolean }) => (
    <div style={{ height:52, display:'flex', alignItems:'center', padding:'0 16px', borderBottom: last ? 'none' : `1px solid ${T.dark4}`, cursor:'pointer', gap:12 }}>
      <span style={{ flex:1, fontSize:16, fontWeight:400, color:T.dark80, fontFamily:T.font, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</span>
      {value && <span style={{ fontSize:14, color:T.dark60, fontFamily:T.font, flexShrink:0, textAlign:'right', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</span>}
      <ChevRight />
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', background:'rgba(0,0,0,0.02)', height:'100%', position:'relative' }}>
      <div style={{ flex:1, overflowY:'auto', paddingBottom:120 }}>

        {/* section: hero */}
        <div style={{ position:'relative', height:280, overflow:'hidden', flexShrink:0 }}>
          <img src={HERO} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)' }} />
          <div style={{ position:'absolute', top:64, left:16 }}>
            <GlassIconButton icon={chevLeftIcon as unknown as string} label="Back" onClick={onBack} />
          </div>
          <div style={{ position:'absolute', top:64, right:16 }}>
            <GlassIconButton icon={moreIcon as unknown as string} label="More" />
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0 16px 18px' }}>
            <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
              <CampaignPill variant="strategy" label="Offer &amp; Promotion" emoji="🛍️" />
              <CampaignPill variant={approvedCount === TOTAL ? 'approved' : 'connect'} />
            </div>
            <h2 style={{ margin:0, fontSize:26, fontWeight:400, color:'#fff', lineHeight:1.1, fontFamily:T.font, textShadow:'0px 1px 7px rgba(0,0,0,0.45)' }}>Kona Coffee for the holidays</h2>
          </div>
        </div>

        {/* section: details */}
        <div style={{ display:'flex', flexDirection:'column', gap:20, padding:20 }}>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ paddingLeft:16 }}>
              <span style={{ fontSize:16, fontWeight:500, color:T.dark90, fontFamily:T.font }}>Campaign details</span>
            </div>
            <div style={{ background:'#fff', border:`1px solid ${T.dark4}`, borderRadius:24, overflow:'hidden' }}>
              <div style={{ height:52, display:'flex', alignItems:'center', padding:'0 16px', borderBottom:`1px solid ${T.dark4}`, cursor:'pointer' }}>
                <span style={{ flex:1, fontSize:16, fontWeight:400, color:T.dark80, fontFamily:T.font }}>Theme</span>
                <ChevRight />
              </div>
              <div style={{ padding:'12px 16px 14px', borderBottom:`1px solid ${T.dark4}` }}>
                <p style={{ margin:0, fontSize:16, fontWeight:400, color:T.dark90, fontFamily:T.font, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                  Introduce the unique warmth and authentic hospitality of Casa di Manolo emphasizing the 'home away from home' feeling in Tuscany's serene countryside.
                </p>
              </div>
              <MenuRow label="Call-to-action" value="Eat more BBQ" />
              <MenuRow label="Target link" value="www.konacoffee.com" />
              <MenuRow label="Audience" value="Financial Advisors, Consultants..." />
              <div style={{ height:56, display:'flex', alignItems:'center', padding:'0 16px', cursor:'pointer', gap:12 }}>
                <span style={{ fontSize:16, fontWeight:400, color:T.dark90, fontFamily:T.font, flexShrink:0 }}>Context</span>
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:5 }}>
                  {[IMG1, IMG2, IMG3].map((src, i) => (
                    <div key={i} style={{ width:28, height:28, borderRadius:5, overflow:'hidden', flexShrink:0, border:`1px solid ${T.dark4}` }}>
                      <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    </div>
                  ))}
                  <span style={{ fontSize:14, fontWeight:400, color:T.dark90, fontFamily:T.font, whiteSpace:'nowrap' }}>+12</span>
                  <ChevRight />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ paddingLeft:16 }}>
              <span style={{ fontSize:16, fontWeight:500, color:T.dark90, fontFamily:T.font }}>Schedule &amp; accounts</span>
            </div>
            <div style={{ background:'#fff', border:`1px solid ${T.dark4}`, borderRadius:24, overflow:'hidden' }}>
              <MenuRow label="Schedule" value="Sept 28 – Oct 18" />
              <MenuRow label="Accounts" value="Adam Nathan + 3" />
              <MenuRow label="Content" value="2 stills, 2 carousels, 2 videos..." last />
            </div>
          </div>

          {/* section: post list */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ paddingLeft:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:16, fontWeight:500, color:T.dark90, fontFamily:T.font }}>
                {pendingCount > 0 ? `${pendingCount} posts to review` : 'All posts reviewed'}
              </span>
              <button
                style={{ display:'flex', alignItems:'center', gap:4, height:32, borderRadius:99, border:'none', background:'transparent', padding:'0 6px', cursor:'pointer', fontSize:14, fontWeight:500, color:T.dark90, fontFamily:T.font }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={T.dark90} strokeWidth="1.8" strokeLinecap="round"/></svg>
                Add New
              </button>
            </div>

            {/* Pending / not-approved posts */}
            {pendingPosts.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {pendingPosts.map(post => (
                  <ApprovalCard
                    key={post.id}
                    post={post}
                    status={postStates[post.id]}
                    hovered={hoveredId === post.id}
                    onHover={(v) => setHoveredId(v ? post.id : null)}
                    onApprove={() => { setHoveredId(null); onApprovePost(post.id); }}
                    onRemoveApproval={() => { setHoveredId(null); onRemoveApproval(post.id); }}
                    onReview={() => { setHoveredId(null); onReview(post.id); }}
                  />
                ))}
              </div>
            )}

            {/* Approved posts — collapsible section */}
            {approvedPosts.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {/* Approved section header */}
                <button
                  onClick={() => setApprovedCollapsed(c => !c)}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'10px 16px', background:'transparent', border:'none', cursor:'pointer',
                    width:'100%',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke={T.green} strokeWidth="1.5"/>
                      <path d="M8.5 12L11 14.5L15.5 9.5" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize:14, fontWeight:500, color:T.green, fontFamily:T.font }}>
                      Approved ({approvedCount})
                    </span>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    style={{ transform: approvedCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.22s' }}
                  >
                    <path d="M6 9L12 15L18 9" stroke={T.dark40} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Approved cards */}
                {!approvedCollapsed && (
                  <div style={{ display:'flex', flexDirection:'column', gap:12, paddingTop:4 }}>
                    {approvedPosts.map(post => (
                      <ApprovalCard
                        key={post.id}
                        post={post}
                        status={postStates[post.id]}
                        hovered={hoveredId === post.id}
                        onHover={(v) => setHoveredId(v ? post.id : null)}
                        onApprove={() => { setHoveredId(null); onApprovePost(post.id); }}
                        onRemoveApproval={() => { setHoveredId(null); onRemoveApproval(post.id); }}
                        onReview={() => { setHoveredId(null); onReview(post.id); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:10, background:'linear-gradient(to bottom, rgba(254,254,254,0) 0%, rgba(254,254,254,0.96) 35%)', padding:'20px 20px 36px', display:'flex', flexDirection:'column', gap:10 }}>
        <button
          onClick={() => onReview(pendingPosts[0]?.id ?? 0)}
          style={{ width:'100%', background:T.dark90, color:'#fff', border:'none', borderRadius:99, height:52, fontSize:16, fontWeight:400, cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
        >
          {pendingCount > 0 && (
            <img src={approvalsIcon as unknown as string} alt="" style={{ width:20, height:20, filter:'brightness(0) invert(1)' }} />
          )}
          {pendingCount > 0 ? 'Review Posts' : 'Add Posts'}
        </button>
        {pendingCount > 0 && (
          <button style={{ width:'100%', background:'#fff', color:T.dark90, border:`1px solid ${T.dark8}`, borderRadius:99, height:52, fontSize:16, fontWeight:400, cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            Regenerate All
            <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>
              <img src={creditsIcon as unknown as string} alt="" style={{ width:16, height:16, opacity:0.6 }} />
              <span style={{ color:T.dark60, fontSize:16 }}>125</span>
            </span>
          </button>
        )}
        <p style={{ margin:0, textAlign:'center', fontSize:14, color:T.dark60, fontFamily:T.font, letterSpacing:'-0.28px' }}>
          {pendingCount > 0 ? 'Approve by Mar 26 to publish on time.' : 'All posts are approved and scheduled!'}
        </p>
      </div>
    </div>
  );
}

// ── Review Sheet ──────────────────────────────────────────────────────────────
function ReviewSheet({
  open, cur, postStates, onClose, onPrev, onNext, onApprove, onDontPost, onActions,
  approveAnim, cardAnim,
}: {
  open: boolean; cur: number; postStates: PostStatus[]; onClose: () => void;
  onPrev: () => void; onNext: () => void; onApprove: () => void; onDontPost: () => void;
  onActions: () => void; approveAnim: 'idle' | 's1' | 's2';
  cardAnim: 'idle' | 'exit' | 'enter';
}) {
  const post = POSTS[cur];
  const status = postStates[cur];
  const reviewed = postStates.filter(s => s !== 'pending').length;
  const contentPillVariant = status === 'approved' ? 'approved' : status === 'rejected' ? 'draft' : 'review';

  const cardTransform =
    cardAnim === 'exit'  ? 'translateX(-110%) scale(0.94)' :
    cardAnim === 'enter' ? 'translateX(60px)'               :
    'translateX(0)';
  const cardTransition = cardAnim === 'enter' ? 'none' : 'transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease';
  const cardOpacity = cardAnim === 'idle' ? 1 : 0;

  return (
    <>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:T.dark8, zIndex:200, opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none', transition:'opacity 0.3s' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:814, background:T.bgGray, borderRadius:'24px 24px 0 0', boxShadow:'0 15px 75px rgba(0,0,0,0.18)', zIndex:201, transform: open ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.42s cubic-bezier(0.32,1.0,0.60,1)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', flexShrink:0 }}>
          <div style={{ width:44, display:'flex', alignItems:'center', justifyContent:'flex-start', flexShrink:0 }}>
            <ToolbarButton variant="back" aria-label="Close" onClick={onClose} />
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minWidth:0 }}>
            <div style={{ fontSize:18, fontWeight:400, lineHeight:1.4, color:T.dark90, fontFamily:T.font, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:200 }}>{TYPE_LABELS[post.type]}</div>
          </div>
          <div style={{ width:44, display:'flex', alignItems:'center', justifyContent:'flex-end', flexShrink:0 }}>
            <ContentPill variant={contentPillVariant} />
          </div>
        </div>
        <div style={{ padding:'0 0 10px', display:'flex', gap:8, alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {postStates.map((s, i) => (
              <div key={i} style={{ width:6, height:6, borderRadius:99, flexShrink:0, background: s==='approved' ? T.green : s==='rejected' ? T.red : i===cur ? T.dark25 : T.dark8, boxShadow: i===cur ? `0 0 0 2px rgba(255,255,255,0.9), 0 0 0 3.5px ${T.dark25}` : 'none', transition:'background 0.25s, box-shadow 0.25s' }} />
            ))}
          </div>
          <span style={{ fontSize:12, color:T.dark40, fontFamily:T.font, whiteSpace:'nowrap' }}>{reviewed} of {TOTAL} reviewed</span>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'4px 16px 0', overflow:'hidden' }}>
          <div style={{ width:'100%', display:'flex', justifyContent:'center', transform: cardTransform, opacity: cardOpacity, transition: cardTransition }}>
            <PostPreviewCard
              type={post.type}
              img={post.img}
              caption={post.caption}
              username="radiant_health"
              avatar={AVATAR}
              status={status}
              approveAnim={approveAnim}
              slides={post.slides}
              sticker1={post.sticker1}
              sticker2={post.sticker2}
              subject={post.subject}
              title={post.title}
              heroImg={IMG_EMAIL}
              coverImg={IMG_BLOG}
              date={post.date}
            />
          </div>
        </div>
        <ContentPreviewFooter
          variant={status === 'approved' ? 'approved-connected' : status === 'rejected' ? 'dont-post' : 'review'}
          contentType={TYPE_LABELS[post.type]}
          date={post.date}
          badgeCount={postStates.filter(s => s === 'approved').length}
          onPrev={onPrev}
          onNext={onNext}
          onPrimaryAction={status === 'pending' ? onApprove : undefined}
          onSecondaryAction={status === 'pending' ? onDontPost : undefined}
          onActions={onActions}
        />
      </div>
    </>
  );
}

// ── Actions Drawer ────────────────────────────────────────────────────────────
function ActionsDrawer({ open, isApproved, postDate, onClose, onRemoveApproval }: {
  open: boolean; isApproved: boolean; postDate: string; onClose: () => void; onRemoveApproval: () => void;
}) {
  const DrawerItem = ({ icon, label, rhs, danger, onClick }: { icon: React.ReactNode; label: string; rhs?: React.ReactNode; danger?: boolean; onClick?: () => void }) => (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', padding:'0 16px', height:52, cursor:'pointer', gap:12, borderBottom:`1px solid ${T.dark4}` }}>
      <div style={{ width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
      <span style={{ flex:1, fontSize:16, fontWeight:400, color: danger ? T.red : T.dark90, fontFamily:T.font, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</span>
      {rhs ?? <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M10 8L14 12L10 16" stroke={T.dark25} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:T.dark8, zIndex:202, opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none', transition:'opacity 0.3s' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:T.bgLight, borderRadius:'38px 38px 0 0', boxShadow:'0 15px 75px rgba(0,0,0,0.18)', zIndex:203, transform: open ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.38s cubic-bezier(0.32,1.0,0.60,1)', overflow:'hidden', paddingBottom:40 }}>
        <div style={{ width:58, height:6, background:T.dark8, borderRadius:99, margin:'12px auto 8px' }} />
        {isApproved && (
          <DrawerItem onClick={onRemoveApproval} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M19.4221 8.01389C18.0322 5.61438 15.4343 4 12.4588 4C9.08513 4 6.19686 6.07535 5.00433 9.01736M16.9806 9.01736H21V5.00347M5.57787 16.0417C6.96782 18.4412 9.56573 20.0556 12.5412 20.0556C15.9149 20.0556 18.8031 17.9802 19.9957 15.0382M8.0194 15.0382H4V19.0521" stroke={T.dark90} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Remove approval" />
        )}
        <DrawerItem onClick={onClose} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12.5365 19.2431L13.2788 18.4112C14.1896 17.3904 15.8236 17.5231 16.5577 18.6774C17.2416 19.7527 18.7274 19.9566 19.6757 19.1052L21.0211 17.8972M2.97888 19.4701L7.34487 18.5904C7.57664 18.5437 7.78946 18.4296 7.9566 18.2624L17.7303 8.48332C18.1989 8.01446 18.1986 7.25447 17.7296 6.78601L15.6591 4.71794C15.1903 4.24967 14.4307 4.24999 13.9623 4.71865L4.18764 14.4987C4.02083 14.6656 3.90693 14.878 3.86018 15.1093L2.97888 19.4701Z" stroke={T.dark90} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Adjust caption" />
        <DrawerItem onClick={onClose} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M21.6 11.9752L12 16.8959L2.40002 11.9752M21.6 16.6793L12 21.6L2.40002 16.6793M12 2.40002L21.6 7.32077L12 12.2415L2.40002 7.32077L12 2.40002Z" stroke={T.dark90} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Edit design" />
        <DrawerItem onClick={onClose} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M19.4221 8.01389C18.0322 5.61438 15.4343 4 12.4588 4C9.08513 4 6.19686 6.07535 5.00433 9.01736M16.9806 9.01736H21V5.00347M5.57787 16.0417C6.96782 18.4412 9.56573 20.0556 12.5412 20.0556C15.9149 20.0556 18.8031 17.9802 19.9957 15.0382M8.0194 15.0382H4V19.0521" stroke={T.dark90} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Regenerate this content" rhs={<div style={{ display:'flex', alignItems:'center', gap:4, fontSize:14, color:T.dark60, fontFamily:T.font, flexShrink:0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L13.9 7.9H20L14.9 11.5L16.8 17.4L12 13.8L7.2 17.4L9.1 11.5L4 7.9H10.1L12 2Z" stroke="rgba(0,0,0,0.4)" strokeWidth="1.3" strokeLinejoin="round"/></svg>1<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M10 8L14 12L10 16" stroke={T.dark25} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg></div>} />
        <DrawerItem onClick={onClose} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4.75 8.91425H18.75M6.55952 3V4.54304M16.75 3V4.54285M19.75 7.24285V18.3C19.75 19.7912 18.5561 21 17.0833 21H6.41667C4.94391 21 3.75 19.7912 3.75 18.3V7.24285C3.75 5.75168 4.94391 4.54285 6.41667 4.54285H17.0833C18.5561 4.54285 19.75 5.75168 19.75 7.24285Z" stroke={T.dark90} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Schedule" rhs={<div style={{ display:'flex', alignItems:'center', gap:4, fontSize:14, color:T.dark60, fontFamily:T.font, flexShrink:0 }}>{postDate}<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M10 8L14 12L10 16" stroke={T.dark25} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg></div>} />
        <div style={{ borderBottom:'none' }}>
          <DrawerItem onClick={onClose} danger icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4 6.17647H20M10 16.7647V10.4118M14 16.7647V10.4118M16 21H8C6.89543 21 6 20.0519 6 18.8824V7.23529C6 6.65052 6.44772 6.17647 7 6.17647H17C17.5523 6.17647 18 6.65052 18 7.23529V18.8824C18 20.0519 17.1046 21 16 21ZM10 6.17647H14C14.5523 6.17647 15 5.70242 15 5.11765V4.05882C15 3.47405 14.5523 3 14 3H10C9.44772 3 9 3.47405 9 4.05882V5.11765C9 5.70242 9.44772 6.17647 10 6.17647Z" stroke={T.red} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Delete" />
        </div>
      </div>
    </>
  );
}

// ── Home screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onCampaignClick }: { onCampaignClick: () => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:'#ffffff', height:'100%' }}>
      <div style={{ background:'#ffffff', flexShrink:0 }}>
        <ToolbarHeader
          variant="screen"
          titleSlot={
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:99, background:'#45164a', overflow:'hidden', flexShrink:0 }}>
                <img src={AVATAR} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <span style={{ fontSize:18, fontWeight:400, color:T.dark90, fontFamily:T.font }}>Radiant Health</span>
            </div>
          }
          rightButtons={<ToolbarButton variant="credits" credits={96} />}
        />
      </div>
      <div style={{ flex:1, overflowY:'auto', paddingBottom:136, background:'#ffffff' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:30, padding:'20px 20px 10px' }}>
          <h1 style={{ margin:0, fontSize:28, fontWeight:400, lineHeight:1.1, color:T.dark90, fontFamily:T.font }}>Welcome back, Fabian</h1>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ fontSize:22, fontWeight:400, lineHeight:1.2, color:T.dark90, fontFamily:T.font }}>Up next</div>
            <div onClick={onCampaignClick} style={{ background:'#fff', border:`1px solid ${T.dark8}`, borderRadius:12, padding:16, display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
              <div style={{ width:30, height:30, minWidth:30, borderRadius:6, background:'linear-gradient(180deg,#20a14f,#1fcf5f)', border:`1px solid ${T.dark4}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg viewBox="0 0 18 18" fill="none" width="18" height="18"><circle cx="9" cy="9" r="6.5" stroke="rgba(255,255,255,0.95)" strokeWidth="1.15"/><path d="M6 9L8 11.5L12.5 7" stroke="rgba(255,255,255,0.95)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:16, fontWeight:500, color:T.dark90, marginBottom:4, fontFamily:T.font }}>Approve your next campaign</div>
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  <div style={{ fontSize:14, fontWeight:400, color:T.dark60, lineHeight:1.5, letterSpacing:'0.28px', fontFamily:T.font, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Kona Coffee for the holidays</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:T.dark40, fontFamily:T.font }}>
                    <span>Sep 25 – Oct 7</span>
                    <span style={{ color:T.dark25 }}>•</span>
                    <span>12 posts to review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ApprovalV2() {
  const [screen, setScreen]           = useState<'home' | 'campaign'>('home');
  const [sheetOpen, setSheetOpen]     = useState(false);
  const [cur, setCur]                 = useState(0);
  const [postStates, setPostStates]   = useState<PostStatus[]>(Array(TOTAL).fill('pending'));
  const [actionsOpen, setActionsOpen] = useState(false);
  const [approveAnim, setApproveAnim] = useState<'idle' | 's1' | 's2'>('idle');
  const [cardAnim, setCardAnim]       = useState<'idle' | 'exit' | 'enter'>('idle');

  // Celebration modal: fires once when all posts are approved
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const hasShownCelebration = useRef(false);

  const openSheet = useCallback((postId: number) => {
    setCur(postId);
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const advanceToNext = useCallback((states: PostStatus[], afterId: number) => {
    const afterIndex = POSTS.findIndex(p => p.id === afterId);
    const next = POSTS.find((p, i) => i > afterIndex && states[p.id] === 'pending');
    if (next) {
      setCur(next.id);
    } else if (states.every(s => s !== 'pending')) {
      setTimeout(() => {
        setSheetOpen(false);
        if (!hasShownCelebration.current) {
          hasShownCelebration.current = true;
          setTimeout(() => setCelebrationVisible(true), 480);
        }
      }, 500);
    }
  }, []);

  const handleApprove = useCallback(() => {
    setApproveAnim('s1');
    setTimeout(() => setApproveAnim('s2'), 420);

    setTimeout(() => {
      let updatedStates: PostStatus[] = [];
      setPostStates(prev => {
        updatedStates = [...prev];
        updatedStates[cur] = 'approved';
        return updatedStates;
      });
      setApproveAnim('idle');
      setTimeout(() => setCardAnim('exit'), 120);
      setTimeout(() => {
        setCardAnim('enter');
        advanceToNext(updatedStates, cur);
      }, 120 + 380);
      setTimeout(() => setCardAnim('idle'), 120 + 380 + 40);
    }, 950);
  }, [cur, advanceToNext]);

  const handleDontPost = useCallback(() => {
    let updatedStates: PostStatus[] = [];
    setPostStates(prev => {
      updatedStates = [...prev];
      updatedStates[cur] = 'rejected';
      return updatedStates;
    });
    setTimeout(() => setCardAnim('exit'), 60);
    setTimeout(() => {
      setCardAnim('enter');
      advanceToNext(updatedStates, cur);
    }, 60 + 380);
    setTimeout(() => setCardAnim('idle'), 60 + 380 + 40);
  }, [cur, advanceToNext]);

  const handleRemoveApproval = useCallback((id?: number) => {
    const targetId = id ?? cur;
    setActionsOpen(false);
    setTimeout(() => {
      setPostStates(prev => { const n = [...prev]; n[targetId] = 'pending'; return n; });
    }, 280);
  }, [cur]);

  const handleApprovePost = useCallback((id: number) => {
    setPostStates(prev => {
      const next = [...prev];
      next[id] = 'approved';
      if (!hasShownCelebration.current && next.every(s => s !== 'pending')) {
        hasShownCelebration.current = true;
        setTimeout(() => setCelebrationVisible(true), 300);
      }
      return next;
    });
  }, []);

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100vw', height:'100vh', background:'linear-gradient(145deg, rgba(0,0,0,0.04) 0%, rgba(124,92,252,0.05) 100%)' }}>
      <PhoneFrame
        overlayStatusBar={screen === 'campaign'}
        statusBarTheme={screen === 'campaign' ? 'white' : 'dark'}
        footer={screen === 'home' ? <TabBar tabs={TAB_ITEMS} activeTab="home" onTabChange={() => {}} /> : undefined}
        overlay={
          <>
            <ReviewSheet
              open={sheetOpen} cur={cur} postStates={postStates}
              onClose={closeSheet}
              onPrev={() => setCur(c => Math.max(0, c - 1))}
              onNext={() => setCur(c => Math.min(TOTAL - 1, c + 1))}
              onApprove={handleApprove} onDontPost={handleDontPost}
              onActions={() => setActionsOpen(true)} approveAnim={approveAnim}
              cardAnim={cardAnim}
            />
            <ActionsDrawer
              open={actionsOpen} isApproved={postStates[cur] === 'approved'}
              postDate={POSTS[cur].date} onClose={() => setActionsOpen(false)}
              onRemoveApproval={() => handleRemoveApproval()}
            />
            <CelebrationModal
              visible={celebrationVisible}
              onDismiss={() => setCelebrationVisible(false)}
            />
          </>
        }
      >
        <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
          <div style={{ display:'flex', width:'200%', height:'100%', transform: screen === 'campaign' ? 'translateX(-50%)' : 'translateX(0)', transition:'transform 0.38s cubic-bezier(0.4,0,0.2,1)' }}>
            <div style={{ width:'50%', height:'100%', overflowY:'auto', overflowX:'hidden' }}>
              <HomeScreen onCampaignClick={() => setScreen('campaign')} />
            </div>
            <div style={{ width:'50%', height:'100%', overflowY:'auto', overflowX:'hidden' }}>
              <CampaignScreen
                onBack={() => setScreen('home')}
                onReview={(id) => openSheet(id)}
                postStates={postStates}
                onApprovePost={handleApprovePost}
                onRemoveApproval={(id) => handleRemoveApproval(id)}
              />
            </div>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}
