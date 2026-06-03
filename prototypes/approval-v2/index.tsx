import { useState, useRef, useEffect } from 'react';
import { PrototypeShell } from '../_shell';
import { Button, Modal, ModalStack, useModals } from '@/components';
import { Carousel as CarouselIcon, Play3, EmailNewsLetterIcon, Document, Approvals as ApprovalsIcon, Check2, EyeOpen, ArrowLeft, ArrowRight, Globe } from '@/icons/20';
import { Layers5 } from '@/icons/24';
import { Iphone02, ChevronDown, ChevronRight } from '@/icons/16';

// ── Figma image assets ────────────────────────────────────────────────────────
const IMG_AVATAR   = 'https://www.figma.com/api/mcp/asset/04425bfb-30dc-45d9-9537-cd0d3ca4cfbb';
const IMG_1        = 'https://www.figma.com/api/mcp/asset/4c047060-cc47-4c6f-af99-cf67bdaf3a0d';
const IMG_2        = 'https://www.figma.com/api/mcp/asset/164d9412-dd01-401c-ab81-6fb400161319';
const IMG_3        = 'https://www.figma.com/api/mcp/asset/571812d3-568a-4b7a-8601-7f0816650e27';
const IMG_4        = 'https://www.figma.com/api/mcp/asset/d8bef08b-4a5a-4156-8618-1dd03aa75e46';
const IMG_5        = 'https://www.figma.com/api/mcp/asset/f8c4a55a-3082-47bd-a27f-fe3776455196';
const IMG_6        = 'https://www.figma.com/api/mcp/asset/9537a071-cf88-4438-8799-604d73e8696f';
const IMG_COVER    = 'https://www.figma.com/api/mcp/asset/1c3a3bc3-b59b-45e0-ba7b-ef83b0a1732b';
const IMG_COVER2   = 'https://www.figma.com/api/mcp/asset/e2a608cb-dac4-4ced-a667-215aad739d56';

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
  posts: Post[];
}

// ── Data ──────────────────────────────────────────────────────────────────────
const CAMPAIGNS: Campaign[] = [
  {
    id: 0,
    name: 'Eat Well Feel Better',
    dateRange: 'Sept 28 – Oct 18',
    badge: 'Campaigns',
    posts: [
      { id:0,  type:'still',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:00', img:IMG_1,    caption:'Discover the joyful playtime moments.' },
      { id:1,  type:'story',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:01', img:IMG_2,    caption:'Get access to loyalty discounts this fall!' },
      { id:2,  type:'feed-video', date:'Sep 25  10:00am', dateSort:'2025-09-25T10:02', img:IMG_3,    caption:'Behind the scenes of our latest Kona Coffee roast.' },
      { id:3,  type:'story',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:03', img:IMG_4,    caption:'Limited time offer — shop now and save 25%.' },
      { id:4,  type:'carousel',   date:'Sep 25  10:00am', dateSort:'2025-09-25T10:04', img:IMG_5, slides:5, caption:'Spring is here — swipe through our top 5 picks.' },
      { id:5,  type:'still',      date:'Sep 26  10:00am', dateSort:'2025-09-26T10:00', img:IMG_6,    caption:'Wellness tips for the modern professional.' },
      { id:6,  type:'carousel',   date:'Sep 27  11:00am', dateSort:'2025-09-27T11:00', img:IMG_COVER, slides:4, caption:'Our top picks for this season.' },
      { id:7,  type:'email',      date:'Sep 28  8:00am',  dateSort:'2025-09-28T08:00', img:IMG_COVER2, caption:'Snag 20% off — limited time sale this weekend!' },
    ],
  },
  {
    id: 1,
    name: 'SEO Relevance Blogs',
    dateRange: 'Sept 28 – Oct 18',
    badge: 'SEO',
    posts: [
      { id:100, type:'blog', date:'Sep 25  10:00am', dateSort:'2025-09-25T10:00', img:IMG_1, caption:'Unleashing Business Potential with AI: Transformative Tools for Your Company' },
      { id:101, type:'blog', date:'Sep 26  10:00am', dateSort:'2025-09-26T10:00', img:IMG_2, caption:'Unleashing Business Potential with AI: Transformative Tools for Your Company' },
      { id:102, type:'blog', date:'Sep 27  10:00am', dateSort:'2025-09-27T10:00', img:IMG_3, caption:'Unleashing Business Potential with AI: Transformative Tools for Your Company' },
    ],
  },
];

const TYPE_LABEL: Record<ContentType, string> = {
  still: 'Still Image', carousel: 'Carousel', story: 'Story',
  short: 'Short', 'feed-video': 'Feed Video Post', email: 'Email', blog: 'Blog',
};

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: Status }) {
  const cfg =
    status === 'approved'  ? { bg:'rgba(32,161,79,0.15)',  border:'rgba(32,161,79,0.2)',  color:green,  label:'Approved' } :
    status === 'rejected'  ? { bg:dark4,                   border:dark4,                  color:dark60, label:'Draft'    } :
                             { bg:'rgba(255,174,0,0.2)',   border:'rgba(255,174,0,0.3)',  color:'#3f2b00', label:'Review' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'2px 6px', borderRadius:4,
      background:cfg.bg, border:`1px solid ${cfg.border}`,
      fontSize:11, fontWeight:400, color:cfg.color, fontFamily:F,
      letterSpacing:'0.22px', whiteSpace:'nowrap',
    }}>{cfg.label}</span>
  );
}

// ── Content type icon ─────────────────────────────────────────────────────────
function TypeIcon({ type }: { type: ContentType }) {
  const style = { color: dark60, flexShrink: 0 } as React.CSSProperties;
  switch (type) {
    case 'still':      return <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="2.5" width="15" height="15" rx="2" stroke={dark60} strokeWidth="1.3"/><circle cx="7" cy="7" r="1.5" fill={dark60}/><path d="M2.5 13l4-4 3 3 2.5-2.5 5.5 5.5" stroke={dark60} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'carousel':   return <CarouselIcon size={14} color={dark60} />;
    case 'story':      return <Iphone02 size={14} color={dark60} />;
    case 'short':      return <Play3 size={14} color={dark60} />;
    case 'feed-video': return <Play3 size={14} color={dark60} />;
    case 'email':      return <EmailNewsLetterIcon size={14} color={dark60} />;
    case 'blog':       return <Document size={14} color={dark60} />;
    default:           return null;
  }
}

// ── Content card ──────────────────────────────────────────────────────────────
function ContentCard({
  post, status, onApprove, onRemoveApproval, onReview,
}: {
  post: Post;
  status: Status;
  onApprove: () => void;
  onRemoveApproval: () => void;
  onReview: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isApproved = status === 'approved';
  const isPortrait = post.type === 'story' || post.type === 'short';

  return (
    <div
      style={{
        position: 'relative', width: 245, flexShrink: 0,
        background: dark2, border: `1px solid ${dark4}`,
        borderRadius: 10, overflow: 'hidden',
        cursor: 'pointer',
        opacity: isApproved ? 0.72 : 1,
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', gap:4, padding:'12px 12px 6px', background:dark2 }}>
        <TypeIcon type={post.type} />
        <span style={{ fontSize:11, fontWeight:400, color:dark60, fontFamily:F, flex:1 }}>{TYPE_LABEL[post.type]}</span>
        <span style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px' }}>{post.date}</span>
      </div>

      {/* Image area */}
      <div style={{
        position: 'relative',
        aspectRatio: isPortrait ? '3/4' : '1/1',
        background: '#c8c0b4', overflow: 'hidden',
      }}>
        {post.img && (
          <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        )}
        {/* Carousel slide count badge */}
        {post.type === 'carousel' && post.slides && (
          <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.55)', borderRadius:4, padding:'2px 6px', display:'flex', alignItems:'center', gap:3 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="white" strokeWidth="1.6"/><path d="M2 7v10M22 7v10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <span style={{ fontSize:10, color:'white', fontFamily:F }}>{post.slides}</span>
          </div>
        )}
        {/* Video play icon */}
        {(post.type === 'feed-video' || post.type === 'short') && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:32, height:32, borderRadius:99, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="10" height="12" viewBox="0 0 16 18" fill="white"><path d="M2 2L14 9L2 16V2Z"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      <div style={{ padding:'10px 12px 12px' }}>
        <p style={{
          margin:0, fontSize:12, fontWeight:400, color:dark80, fontFamily:F, lineHeight:1.5,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden',
          letterSpacing:'0.24px',
        }}>
          {post.caption}
        </p>
      </div>

      {/* Footer row */}
      <div style={{ padding:'0 12px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <StatusPill status={status} />
      </div>

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.18s',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8,
        pointerEvents: hovered ? 'all' : 'none',
      }}>
        <div style={{
          transform: hovered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(4px)',
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <Button
            variant={isApproved ? 'secondary' : 'green'}
            size="sm"
            frontIcon={isApproved ? ApprovalsIcon : Check2}
            onPress={(e) => { (e as any).continuePropagation?.(); onApprove(); }}
            onClick={(e) => { e.stopPropagation(); isApproved ? onRemoveApproval() : onApprove(); }}
          >
            {isApproved ? 'Remove approval' : 'Approve'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            frontIcon={EyeOpen}
            onClick={(e) => { e.stopPropagation(); onReview(); }}
          >
            Review
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Campaign section ──────────────────────────────────────────────────────────
function CampaignSection({
  campaign, statuses, onApprove, onRemoveApproval, onReview, onApproveAll, justCompleted,
}: {
  campaign: Campaign;
  statuses: Record<number, Status>;
  onApprove: (id: number) => void;
  onRemoveApproval: (id: number) => void;
  onReview: (id: number) => void;
  onApproveAll: () => void;
  justCompleted?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  // 'idle' → 'animating' (cards fade+slide down) → 'collapsed'
  const [animState, setAnimState] = useState<'idle' | 'animating' | 'collapsed'>('idle');

  useEffect(() => {
    if (!justCompleted) return;
    // Short delay so the modal starts opening simultaneously
    const t1 = setTimeout(() => setAnimState('animating'), 80);
    // After animation completes, snap to collapsed
    const t2 = setTimeout(() => { setAnimState('collapsed'); setCollapsed(true); }, 680);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [justCompleted]);

  // Pending/rejected first (by date), approved last (by date)
  const pending  = campaign.posts.filter(p => statuses[p.id] !== 'approved').sort((a,b) => a.dateSort.localeCompare(b.dateSort));
  const approved = campaign.posts.filter(p => statuses[p.id] === 'approved').sort((a,b) => a.dateSort.localeCompare(b.dateSort));
  const sorted   = [...pending, ...approved];

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
            {/* Replace gray remainder with approval icon once fully reviewed */}
            {totalReviewed === totalPosts && (
              <ApprovalsIcon size={14} color={green} />
            )}
          </div>

          {/* Vertical divider — only shown when Approve All is visible */}
          {pendingCount > 0 && <div style={{ width:1, height:16, background:dark8 }} />}

          {/* Approve All */}
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
        </div>
      </div>

      {/* Card grid — sorted: pending first, approved last */}
      {!collapsed && (
        <div style={{
          display:'flex', flexWrap:'wrap', gap:18,
          opacity:    animState === 'animating' ? 0 : 1,
          transform:  animState === 'animating' ? 'translateY(24px)' : 'translateY(0)',
          maxHeight:  animState === 'animating' ? 0 : 'none',
          overflow:   animState === 'animating' ? 'hidden' : 'visible',
          transition: animState === 'animating'
            ? 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.4,0,1,1), max-height 0.55s ease'
            : 'none',
        }}>
          {sorted.map(post => (
            <ContentCard
              key={post.id}
              post={post}
              status={statuses[post.id]}
              onApprove={() => onApprove(post.id)}
              onRemoveApproval={() => onRemoveApproval(post.id)}
              onReview={() => onReview(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Social platform icons ─────────────────────────────────────────────────────
const SocialIcon = ({ platform, active }: { platform: string; active?: boolean }) => {
  const s = active ? 1 : 0.35;
  const icons: Record<string, React.ReactNode> = {
    instagram: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
    facebook:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    linkedin:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10v7M7 7v.5M12 17v-4a2 2 0 014 0v4M12 10v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    x:         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    google:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.3 12.2c0-.6-.1-1.2-.2-1.8H12v3.4h4.7a4 4 0 01-1.7 2.6v2.2h2.8c1.6-1.5 2.5-3.7 2.5-6.4z" fill="#4285F4"/><path d="M12 21c2.4 0 4.4-.8 5.8-2.1l-2.8-2.2c-.8.5-1.8.9-3 .9-2.3 0-4.2-1.5-4.9-3.6H4.2v2.2A9 9 0 0012 21z" fill="#34A853"/><path d="M7.1 14c-.2-.5-.3-1-.3-1.6v-1.5c0-.5.1-1 .3-1.5V7.3H4.2A9 9 0 003 12a9 9 0 001.2 4.7l2.9-2.7z" fill="#FBBC04"/><path d="M12 6.8c1.3 0 2.5.4 3.4 1.3l2.5-2.5C16.4 4.2 14.4 3.4 12 3.4A9 9 0 004.2 7.3l2.9 2.3c.7-2 2.6-3.5 4.9-3.5-.1-.1 0-.2 0-.3z" fill="#EA4335"/></svg>,
  };
  return <span style={{ opacity: s, cursor: 'pointer', color: dark80 }}>{icons[platform]}</span>;
};

// ── Content review page (full-page overlay) ───────────────────────────────────
function ReviewPage({ post, status, allPosts, allStatuses, onClose, onApprove, onRemoveApproval, onDontPost, onNavigate }: {
  post: Post; status: Status;
  allPosts: Post[]; allStatuses: Record<number, Status>;
  onClose: () => void; onApprove: () => void; onRemoveApproval: () => void;
  onDontPost: () => void; onNavigate: (id: number) => void;
}) {
  const [chatInput, setChatInput] = useState('');
  const isApproved = status === 'approved';
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
          <StatusPill status={status} />
          <Button variant="ghost" size="sm" square>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill={dark60}/><circle cx="12" cy="12" r="1.5" fill={dark60}/><circle cx="19" cy="12" r="1.5" fill={dark60}/></svg>
          </Button>
        </div>

        {/* Center: Prev / Don't Post / Approve / Next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Button
            variant="ghost" size="sm" frontIcon={ArrowLeft}
            isDisabled={!prevPost}
            onPress={() => prevPost && onNavigate(prevPost.id)}
          >
            Previous
          </Button>
          <Button variant="secondary" size="sm" onPress={() => { onDontPost(); }}>
            Don't Post
          </Button>
          {isApproved ? (
            <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon} onPress={() => { onRemoveApproval(); }}>
              Remove approval
            </Button>
          ) : (
            <Button variant="green" size="sm" frontIcon={Check2} onPress={() => { onApprove(); }}>
              Approve
            </Button>
          )}
          <Button
            variant="ghost" size="sm" endIcon={ArrowRight}
            isDisabled={!nextPost}
            onPress={() => nextPost && onNavigate(nextPost.id)}
          >
            Next
          </Button>
        </div>

        {/* Right: credits + upgrade + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={dark60} strokeWidth="1.6" strokeLinecap="round"/></svg>
            <span style={{ marginLeft: 4, fontSize: 13, color: dark60, fontFamily: F }}>Add More Credits</span>
          </Button>
          <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon}>Upgrade</Button>
          <div style={{ width: 28, height: 28, borderRadius: 99, background: '#5b2d6e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: white, fontSize: 12, fontFamily: F }}>S</div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left panel — AI suggestions */}
        <div style={{
          width: 280, flexShrink: 0,
          background: white, borderRight: `1px solid ${dark8}`,
          display: 'flex', flexDirection: 'column',
          padding: '20px 20px 0',
          overflowY: 'auto',
        }}>
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
          {/* Chat input */}
          <div style={{
            borderTop: `1px solid ${dark8}`, paddingTop: 12, paddingBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              border: `1px solid ${dark8}`, borderRadius: 8, padding: '8px 10px',
              background: white,
            }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask Blaze to change something..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: dark90, fontFamily: F, background: 'transparent' }}
              />
              <button style={{
                width: 26, height: 26, borderRadius: 99, border: 'none',
                background: dark90, color: white, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Center — post preview */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24,
          overflowY: 'auto',
        }}>
          {/* View as label + social icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: dark40, fontFamily: F }}>View as</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            {(['instagram','facebook','linkedin','x','google'] as const).map((p, i) => (
              <SocialIcon key={p} platform={p} active={i === 0} />
            ))}
          </div>

          {/* Post card */}
          <div style={{
            width: 320, background: white, borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
          }}>
            {/* Account not connected banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderBottom: `1px solid ${dark8}`,
            }}>
              <div style={{ width: 24, height: 24, borderRadius: 99, background: dark8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke={dark40} strokeWidth="1.5"/><circle cx="12" cy="12" r="4" stroke={dark40} strokeWidth="1.5"/></svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: dark80, fontFamily: F }}>Account Not Connected</span>
            </div>
            {/* Image */}
            <div style={{ aspectRatio: '1/1', background: '#c8c0b4', overflow: 'hidden' }}>
              {post.img && <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </div>
            {/* Actions row */}
            <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                {['♡', '○', '⬆'].map(ic => <span key={ic} style={{ fontSize: 18, color: dark80, cursor: 'pointer' }}>{ic}</span>)}
              </div>
              <span style={{ fontSize: 18, color: dark80, cursor: 'pointer' }}>⊡</span>
            </div>
            {/* Caption */}
            <div style={{ padding: '0 14px 14px' }}>
              <p style={{ margin: 0, fontSize: 13, color: dark90, fontFamily: F, lineHeight: 1.5 }}>
                <strong>Account Not Connected</strong>{' '}
                <span style={{ color: dark80 }}>{post.caption}</span>
                {' '}<span style={{ color: dark40 }}>see more</span>
              </p>
            </div>
          </div>

          {/* Do you like the result bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 20px', background: white, borderRadius: 99,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: `1px solid ${dark8}`,
          }}>
            <span style={{ fontSize: 13, color: dark80, fontFamily: F }}>Do you like the result?</span>
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16 }}>👎</button>
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16 }}>👍</button>
            <Button variant="secondary" size="sm" onPress={onClose}>Close</Button>
          </div>
        </div>

        {/* Right panel — posting details */}
        <div style={{
          width: 220, flexShrink: 0,
          background: white, borderLeft: `1px solid ${dark8}`,
          padding: '20px 16px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {/* Posting on */}
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Posting on</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: dark90, fontFamily: F }}>{post.date}</p>
            <button style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontSize: 12, color: dark40, fontFamily: F }}>▾</button>
          </div>

          <div style={{ height: 1, background: dark8 }} />

          {/* Posting to */}
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Posting to</p>
            {[
              { name: 'Instagram', connected: false },
              { name: 'Facebook', connected: true },
              { name: 'LinkedIn', connected: true },
              { name: 'X/Twitter', connected: true },
              { name: 'Google Business', connected: true },
            ].map(acct => (
              <div key={acct.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: dark90, fontFamily: F }}>{acct.name}</span>
                {acct.connected
                  ? <div style={{ width: 18, height: 18, borderRadius: 99, background: dark4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={dark40} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  : <Button variant="secondary" size="xs" onPress={() => {}}>Connect</Button>
                }
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: dark8 }} />

          {/* Campaign */}
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Campaign</p>
            <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: dark90, fontFamily: F }}>Eat Well Feel Better</p>
            <p style={{ margin: 0, fontSize: 12, color: dark60, fontFamily: F }}>🛍️ Lifestyle Content</p>
          </div>

          <div style={{ height: 1, background: dark8 }} />

          {/* Quick Edits */}
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Quick Edits</p>
            {[
              { icon: '✏️', label: 'Adjust Caption' },
              { icon: '🎨', label: 'Edit Design' },
            ].map(item => (
              <button key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 4 }}>
                <span>{item.icon}</span>
                <span style={{ fontSize: 13, color: dark90, fontFamily: F }}>{item.label}</span>
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: dark8 }} />

          {/* Redesign */}
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', textTransform: 'uppercase' }}>Redesign</p>
            {[
              { icon: '↻', label: 'Regenerate Design', sub: 'Blaze will generate new design' },
              { icon: '🖼', label: 'Replace with Media', sub: 'Swap design with your own' },
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
  );
}

// ── Celebration modal ─────────────────────────────────────────────────────────
interface CelebrationModalProps { close: () => void; index: number; isOpen?: boolean; }

function CelebrationModal({ close }: CelebrationModalProps) {
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
            First campaign approved!
          </span>
        </div>
      </Modal.Header>

      <Modal.Content>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <p style={{ margin:0, fontSize:15, fontWeight:400, color:dark60, fontFamily:F, lineHeight:1.65, letterSpacing:'0.3px' }}>
            <strong style={{ color:dark90, fontWeight:500 }}>Eat Well Feel Better</strong> has been approved and is ready to publish. Your posts will go live according to their scheduled times.
          </p>
          <div style={{
            display:'flex', alignItems:'center', gap:24,
            padding:'14px 20px', background:dark2, borderRadius:10,
            border:`1px solid ${dark4}`,
          }}>
            <div>
              <div style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', marginBottom:2 }}>Campaign</div>
              <div style={{ fontSize:14, fontWeight:500, color:dark90, fontFamily:F }}>Eat Well Feel Better</div>
            </div>
            <div style={{ width:1, height:32, background:dark8 }} />
            <div>
              <div style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', marginBottom:2 }}>Schedule</div>
              <div style={{ fontSize:14, fontWeight:500, color:dark90, fontFamily:F }}>Sept 28 – Oct 18</div>
            </div>
            <div style={{ width:1, height:32, background:dark8 }} />
            <div>
              <div style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', marginBottom:2 }}>Posts approved</div>
              <div style={{ fontSize:14, fontWeight:500, color:green, fontFamily:F }}>8 posts</div>
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

// ── Inner app (needs ModalStack context) ─────────────────────────────────────
function ApprovalV2Inner() {
  const allPosts = CAMPAIGNS.flatMap(c => c.posts);
  const [statuses, setStatuses] = useState<Record<number, Status>>(
    Object.fromEntries(allPosts.map(p => [p.id, 'pending' as Status]))
  );

  const [reviewPost, setReviewPost] = useState<Post | null>(null);
  const [completingCampaignId, setCompletingCampaignId] = useState<number | null>(null);
  const hasShownCelebration = useRef(false);

  const { openModal } = useModals();

  const triggerCelebration = (campaignId: number) => {
    if (hasShownCelebration.current) return;
    hasShownCelebration.current = true;
    // Animate the campaign cards collapsing immediately
    setCompletingCampaignId(campaignId);
    // Modal opens slightly after animation starts
    setTimeout(() => openModal(CelebrationModal), 150);
    // Reset completingCampaignId after animation is done
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

  const approveAll = (campaign: Campaign) => {
    setStatuses(prev => {
      const next = { ...prev };
      campaign.posts.forEach(p => { next[p.id] = 'approved'; });
      triggerCelebration(campaign.id);
      return next;
    });
  };

  // Upgrade button for topbar
  const upgradeBtn = (
    <button style={{
      display:'flex', alignItems:'center', gap:4,
      padding:'6px 10px', borderRadius:8,
      border:`1px solid ${dark8}`, background:white,
      cursor:'pointer', fontSize:14, fontWeight:400,
      color:'#6a00ff', fontFamily:F, letterSpacing:'0.14px',
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.6H22L15.8 14l2.5 7.4L12 17l-6.3 4.4 2.5-7.4L2 9.6h7.6L12 2z" fill="#6a00ff"/></svg>
      Upgrade
    </button>
  );

  // Avatar for topbar
  const avatarEl = (
    <div style={{ width:32, height:32, borderRadius:99, overflow:'hidden', flexShrink:0 }}>
      <img src={IMG_AVATAR} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
    </div>
  );

  return (
    <PrototypeShell
      title="Approvals"
      sidebarActiveLabel="Approvals"
      topbarRight={<div style={{ display:'flex', alignItems:'center', gap:8 }}>{upgradeBtn}{avatarEl}</div>}
    >
      <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
        {[...CAMPAIGNS].sort((a, b) => {
          const aAllApproved = a.posts.every(p => statuses[p.id] === 'approved');
          const bAllApproved = b.posts.every(p => statuses[p.id] === 'approved');
          return aAllApproved === bAllApproved ? 0 : aAllApproved ? 1 : -1;
        }).map(campaign => (
          <CampaignSection
            key={campaign.id}
            campaign={campaign}
            statuses={statuses}
            onApprove={(id) => approve(id, campaign.id)}
            onRemoveApproval={removeApproval}
            onReview={(id) => {
              const post = campaign.posts.find(p => p.id === id)!;
              setReviewPost(post);
            }}
            onApproveAll={() => approveAll(campaign)}
            justCompleted={completingCampaignId === campaign.id}
          />
        ))}
      </div>

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
          onDontPost={() => { rejectPost(reviewPost.id); setReviewPost(null); }}
          onNavigate={(id) => setReviewPost(CAMPAIGNS.flatMap(c => c.posts).find(p => p.id === id) ?? null)}
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
