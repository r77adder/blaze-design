import { useState, useCallback } from 'react';
import { PhoneFrame } from '../_shell';
import { TabBar, GlassIconButton } from '@ios/components';
import type { TabItem } from '@ios/components';
import homeIcon from '@ios/icons/home-04.svg';
import homeFilledIcon from '@ios/icons/home-filled.svg';
import calendarIcon from '@ios/icons/calendar-01.svg';
import layersIcon from '@ios/icons/layers-05.svg';
import brandKitIcon from '@ios/icons/brandkit_filled.svg';
import moreIcon from '@ios/icons/more-dots.svg';
import chevLeftIcon from '@ios/icons/chevron-left.svg';

// ── Image assets ──────────────────────────────────────────────────────────────
const AV  = 'https://www.figma.com/api/mcp/asset/3b201747-2fda-47ad-ad32-bd538537b43e';
const CK  = 'https://www.figma.com/api/mcp/asset/bf418beb-b21e-408f-b5ee-f167032c8b7a';
const IMG1 = 'https://www.figma.com/api/mcp/asset/f9de6206-307b-4a7d-a279-7fdad209957c';
const IMG2 = 'https://www.figma.com/api/mcp/asset/861374f8-f235-4861-982b-7ef9c61b993f';
const IMG3 = 'https://www.figma.com/api/mcp/asset/d2648b60-309f-4127-b5c3-cf36aee60154';
const IMG4 = 'https://www.figma.com/api/mcp/asset/7fdee3c4-c5be-4da5-9bbc-affa5ebd7190';
const IMG5 = 'https://www.figma.com/api/mcp/asset/60bdce21-f033-4e5d-9866-a632780b79cc';
const HERO = 'https://www.figma.com/api/mcp/asset/d2648b60-309f-4127-b5c3-cf36aee60154';
const AVATAR = 'https://www.figma.com/api/mcp/asset/efaaccc8-0c4d-4b5a-8bb3-cbd3253b808f';

// ── Types ─────────────────────────────────────────────────────────────────────
type PostStatus = 'pending' | 'approved' | 'rejected';
type PostType = 'still' | 'carousel' | 'story' | 'short' | 'feed-video' | 'email' | 'blog';

interface Post {
  type: PostType;
  platform: string;
  date: string;
  caption: string;
  img?: string;
  slides?: number;
  sticker1?: string;
  sticker2?: string;
  subject?: string;
  title?: string;
}

// ── Post data ─────────────────────────────────────────────────────────────────
const POSTS: Post[] = [
  { type:'still',      platform:'Instagram', date:'Sep 25 · 10:00am', img:IMG1, caption:'Discover the joyful playtime moments at Houston Boxer Rescue where each wag of a tail brings pure joy.' },
  { type:'story',      platform:'Instagram', date:'Sep 26 · 9:00am',  sticker1:'Get access to loyalty', sticker2:'discounts and savings', caption:'Get access to loyalty discounts and savings this fall!' },
  { type:'carousel',   platform:'Instagram', date:'Sep 27 · 11:00am', slides:5, img:IMG2, caption:'Spring is here and so are our amazing deals on premium coffee.' },
  { type:'short',      platform:'YouTube',   date:'Sep 28 · 2:00pm',  caption:'Description goes here and continue to be in two lines #hashtag' },
  { type:'feed-video', platform:'Instagram', date:'Sep 29 · 10:00am', img:IMG3, caption:'Behind the scenes of our latest Kona Coffee roast.' },
  { type:'email',      platform:'Email',     date:'Oct 1 · 8:00am',   subject:'Snag 20% Off Our New Product: Limited Time Sale this Weekend!', caption:'Snag 20% Off Our New Product' },
  { type:'blog',       platform:'Blog',      date:'Oct 2 · 9:00am',   title:'Unleashing Business Potential with AI: Transformative Tools for Your Company', caption:'Unleashing Business Potential with AI' },
  { type:'still',      platform:'Facebook',  date:'Oct 3 · 9:00am',   img:IMG4, caption:'Wellness tips for the modern professional. Start your day right.' },
  { type:'carousel',   platform:'Instagram', date:'Oct 4 · 11:00am',  slides:4, img:IMG5, caption:'Our top picks for the season — swipe through to see all 4 featured products.' },
  { type:'story',      platform:'Instagram', date:'Oct 5 · 10:00am',  sticker1:'Limited time offer!', sticker2:'Shop now and save 25%', caption:'Limited time offer! Shop now and save 25%' },
  { type:'short',      platform:'TikTok',    date:'Oct 6 · 2:00pm',   caption:'Watch how we make our signature Kona brew #coffee #recipe' },
  { type:'feed-video', platform:'Facebook',  date:'Oct 7 · 3:00pm',   img:IMG1, caption:'Join us for our virtual tasting event this Friday at 6pm PST.' },
];
const TOTAL = POSTS.length;
const TYPE_LABELS: Record<PostType, string> = { still:'Still image', carousel:'Carousel', story:'Story', short:'Short', 'feed-video':'Feed video', email:'Email', blog:'Blog' };

// ── Tokens (inline, matching ios/tokens/colors.css) ───────────────────────────
const T = {
  font:     "'Sohne', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
  bgGray:   '#f7f7f7',
  bgLight:  '#ffffff',
  dark90:   'rgba(0,0,0,0.9)',
  dark80:   'rgba(0,0,0,0.8)',
  dark60:   'rgba(0,0,0,0.6)',
  dark40:   'rgba(0,0,0,0.4)',
  dark25:   'rgba(0,0,0,0.25)',
  dark15:   'rgba(0,0,0,0.15)',
  dark8:    'rgba(0,0,0,0.08)',
  dark4:    'rgba(0,0,0,0.04)',
  dark2:    'rgba(0,0,0,0.02)',
  light100: '#ffffff',
  light60:  'rgba(255,255,255,0.6)',
  green:    '#20a14f',
  green10:  'rgba(32,161,79,0.1)',
  warning30:'rgba(255,174,0,0.3)',
  warningTx:'#3f2b00',
  red:      '#ae2222',
  glassBlur:'blur(20px) saturate(140%)',
};


const ChevRight = ({ color = T.dark25 }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 8L14 12L10 16" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

// ── Card sub-components ───────────────────────────────────────────────────────
const IgHeader = () => (
  <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', gap:9 }}>
    <div style={{ width:30, height:30, borderRadius:99, background:'#45164a', overflow:'hidden', flexShrink:0 }}>
      <img src={AV} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
    </div>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:12, fontWeight:500, color:T.dark90, fontFamily:T.font }}>radiant_health</div>
      <div style={{ fontSize:10, color:T.dark40, fontFamily:T.font }}>Just now</div>
    </div>
    <div style={{ fontSize:14, color:T.dark60, fontWeight:700, letterSpacing:'0.5px' }}>···</div>
  </div>
);

const IgActions = () => (
  <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', background:T.bgLight }}>
    <div style={{ display:'flex', gap:14, alignItems:'center' }}>
      {[
        <path key="h" d="M11 19S3 13.5 3 8c0-2.2 1.8-4 4-4 1.5 0 2.8.8 4 2 1.2-1.2 2.5-2 4-2 2.2 0 4 1.8 4 4 0 5.5-8 11-8 11Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5"/>,
        <path key="c" d="M4 4h14v12H7L4 19V4Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" strokeLinejoin="round"/>,
        <path key="s" d="M19 3L11 19 9 12 2 10 19 3Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" strokeLinejoin="round"/>,
      ].map((p, i) => (
        <svg key={i} width="22" height="22" viewBox="0 0 22 22" fill="none">{p}</svg>
      ))}
    </div>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 3h12v16l-6-4-6 4V3Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
  </div>
);

function ApproveOverlay({ anim }: { anim: 'idle' | 's1' | 's2' }) {
  if (anim === 'idle') return null;
  return (
    <div style={{ position:'absolute', inset:0, background:T.green10, display:'flex', alignItems:'center', justifyContent:'center', zIndex:5 }}>
      <img src={CK} alt="" style={{
        width: anim === 's2' ? 70 : 40,
        height: anim === 's2' ? 70 : 40,
        objectFit:'contain',
        transition:'width 0.35s cubic-bezier(0.34,1.56,0.64,1), height 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </div>
  );
}

function StillCard({ post, anim }: { post: Post; anim: 'idle' | 's1' | 's2' }) {
  return (
    <>
      <IgHeader />
      <div style={{ position:'relative', width:'100%', background:'#c8c0b4', overflow:'hidden' }}>
        <img src={post.img} alt="" style={{ width:'100%', height:260, objectFit:'cover', display:'block' }} />
        <ApproveOverlay anim={anim} />
      </div>
      <div style={{ padding:'16px 14px', background:'#EDE8DF' }}>
        <p style={{ fontSize:19, fontWeight:500, color:'#1a1a1a', lineHeight:1.35, fontFamily:T.font }}>Discover hidden Tuscan gems and unwind in a sanctuary designed just for you.</p>
      </div>
      <IgActions />
      <div style={{ padding:'0 12px 12px', fontSize:12, color:T.dark90, lineHeight:1.5, background:T.bgLight, fontFamily:T.font }}>
        <strong style={{ fontWeight:500 }}>radiant_health</strong> {post.caption} <span style={{ color:T.dark40 }}>…more</span>
      </div>
    </>
  );
}

function CarouselCard({ post, anim }: { post: Post; anim: 'idle' | 's1' | 's2' }) {
  const dots = Array.from({ length: post.slides ?? 2 }, (_, i) => (
    <div key={i} style={{ width:6, height:6, borderRadius:99, background: i===0 ? T.dark90 : T.dark8, flexShrink:0 }} />
  ));
  return (
    <>
      <IgHeader />
      <div style={{ position:'relative', width:'100%', background:'#c8c0b4', overflow:'hidden' }}>
        <img src={post.img} alt="" style={{ width:'100%', height:260, objectFit:'cover', display:'block' }} />
        <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.88)', borderRadius:12, padding:'2px 7px', fontSize:12, color:'#fff', fontFamily:T.font }}>2/{post.slides}</div>
        <ApproveOverlay anim={anim} />
      </div>
      <div style={{ padding:'16px 14px', background:'#EDE8DF' }}>
        <p style={{ fontSize:19, fontWeight:500, color:'#1a1a1a', lineHeight:1.35, fontFamily:T.font }}>{post.caption}</p>
      </div>
      <IgActions />
      <div style={{ padding:'0 12px 12px', fontSize:12, color:T.dark90, lineHeight:1.5, background:T.bgLight, fontFamily:T.font }}>
        <strong style={{ fontWeight:500 }}>radiant_health</strong> {post.caption}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'8px 12px 12px', background:T.bgLight }}>{dots}</div>
    </>
  );
}

function StoryCard({ post, anim }: { post: Post; anim: 'idle' | 's1' | 's2' }) {
  return (
    <div style={{ position:'relative', width:'100%', height:520, background:'linear-gradient(160deg,#1a5fbf 0%,#328cf3 40%,#4aa8e8 100%)', overflow:'hidden', borderRadius:'inherit' }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0.25) 0%,transparent 35%,rgba(0,0,0,0.35) 100%)' }} />
      <div style={{ position:'absolute', top:10, left:8, right:8, display:'flex', gap:3, zIndex:2 }}>
        {[45, 0, 0].map((pct, i) => (
          <div key={i} style={{ flex:1, height:2, borderRadius:99, background:'rgba(255,255,255,0.35)', overflow:'hidden' }}>
            {pct > 0 && <div style={{ width:`${pct}%`, height:'100%', background:'#fff', borderRadius:99 }} />}
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', top:20, left:8, right:8, display:'flex', alignItems:'center', gap:7, zIndex:2 }}>
        <div style={{ width:24, height:24, borderRadius:99, background:'#45164a', overflow:'hidden', flexShrink:0 }}>
          <img src={AV} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
        <span style={{ color:'#fff', fontSize:11, fontWeight:500, fontFamily:T.font }}>radiant_health</span>
        <span style={{ color:'rgba(255,255,255,0.75)', fontSize:10, fontFamily:T.font }}>2h</span>
      </div>
      <div style={{ position:'absolute', top:'52%', left:'50%', transform:'translate(-50%,-50%)', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:4, zIndex:2 }}>
        <div style={{ background:'#d0ecf6', padding:'4px 7px', borderRadius:4 }}>
          <span style={{ fontSize:16, fontWeight:800, color:'#000', fontFamily:T.font, whiteSpace:'nowrap' }}>{post.sticker1 ?? 'Limited time offer!'}</span>
        </div>
        <div style={{ background:'#d0ecf6', padding:'4px 7px', borderRadius:4 }}>
          <span style={{ fontSize:16, fontWeight:800, color:'#000', fontFamily:T.font, whiteSpace:'nowrap' }}>{post.sticker2 ?? 'Shop now and save'}</span>
        </div>
      </div>
      {anim !== 'idle' && <ApproveOverlay anim={anim} />}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#010001', padding:'11px 14px', display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ flex:1, border:'1px solid rgba(255,255,255,0.35)', borderRadius:99, padding:'7px 14px' }}>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:10, fontFamily:T.font }}>Send message...</span>
        </div>
      </div>
    </div>
  );
}

function ShortCard({ post, anim }: { post: Post; anim: 'idle' | 's1' | 's2' }) {
  return (
    <div style={{ position:'relative', width:'100%', height:520, background:'#0c0f11', overflow:'hidden', borderRadius:'inherit' }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(12,15,17,0.4) 0%,rgba(12,15,17,0.1) 40%,rgba(12,15,17,0.6) 100%)' }} />
      <div style={{ position:'absolute', top:12, left:12, zIndex:2 }}>
        <span style={{ color:'#fff', fontSize:15, fontWeight:700, fontFamily:T.font, textShadow:'0 0 4px rgba(0,0,0,0.5)' }}>Shorts</span>
      </div>
      <div style={{ position:'absolute', right:10, bottom:80, zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        {['❤️','💬','🔁','✈️','⋯'].map((lbl, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
            <span style={{ fontSize:20 }}>{lbl}</span>
            <span style={{ fontSize:8, color:'#fff', fontFamily:T.font }}>{['223','23','23','10',''][i]}</span>
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', bottom:20, left:12, right:50, zIndex:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <div style={{ width:24, height:24, borderRadius:99, background:'#45164a', overflow:'hidden', flexShrink:0 }}>
            <img src={AV} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <span style={{ color:'#fff', fontSize:10, fontWeight:500, fontFamily:T.font }}>radiant_health</span>
          <div style={{ border:'1px solid rgba(255,255,255,0.5)', borderRadius:6, padding:'2px 7px' }}>
            <span style={{ color:'#fff', fontSize:9, fontFamily:T.font }}>Follow</span>
          </div>
        </div>
        <p style={{ color:'#fff', fontSize:10, fontFamily:T.font, lineHeight:1.4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>{post.caption}</p>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'rgba(12,15,17,0.8)' }}>
        <div style={{ width:'35%', height:'100%', background:'rgba(255,255,255,0.6)' }} />
      </div>
      {anim !== 'idle' && <ApproveOverlay anim={anim} />}
    </div>
  );
}

function FeedVideoCard({ post, anim }: { post: Post; anim: 'idle' | 's1' | 's2' }) {
  return (
    <>
      <IgHeader />
      <div style={{ position:'relative', width:'100%', background:'#c8c0b4', overflow:'hidden' }}>
        <img src={post.img} alt="" style={{ width:'100%', height:260, objectFit:'cover', display:'block' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', zIndex:2 }}>
          <div style={{ width:52, height:52, borderRadius:99, background:'rgba(255,255,255,0.88)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.2)' }}>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none"><path d="M2 2l14 8-14 8V2Z" fill="rgba(0,0,0,0.85)"/></svg>
          </div>
        </div>
        <ApproveOverlay anim={anim} />
      </div>
      <div style={{ padding:'16px 14px', background:'#EDE8DF' }}>
        <p style={{ fontSize:19, fontWeight:500, color:'#1a1a1a', lineHeight:1.35, fontFamily:T.font }}>{post.caption}</p>
      </div>
      <IgActions />
      <div style={{ padding:'0 12px 12px', fontSize:12, color:T.dark90, lineHeight:1.5, background:T.bgLight, fontFamily:T.font }}>
        <strong style={{ fontWeight:500 }}>radiant_health</strong> {post.caption}
      </div>
    </>
  );
}

function EmailCard({ post, anim }: { post: Post; anim: 'idle' | 's1' | 's2' }) {
  return (
    <div style={{ background:'#fff', padding:20, borderRadius:'inherit', position:'relative', overflow:'hidden' }}>
      <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginBottom:14 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="1.5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2"/><path d="M1 5l6 4 6-4" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>
        <span style={{ fontSize:11, fontWeight:500, color:T.dark60, fontFamily:T.font }}>Email</span>
      </div>
      <div style={{ fontSize:20, fontWeight:400, color:'#2b2f38', lineHeight:1.25, marginBottom:12, fontFamily:"Georgia,'Times New Roman',serif" }}>{post.subject}</div>
      <img src="https://www.figma.com/api/mcp/asset/18c22376-a705-44c4-b1d2-b76779d4ef38" alt="" style={{ width:'100%', borderRadius:8, display:'block', marginBottom:12, objectFit:'cover', height:140 }} />
      <p style={{ fontSize:13, color:'#2b2f38', lineHeight:1.55, marginBottom:10 }}>In recent years, remote work has become increasingly popular, and with the advancements in AI, it has the potential to become even more efficient.</p>
      <p style={{ fontSize:13, fontWeight:600, color:'#2b2f38', lineHeight:1.4, marginBottom:6 }}>Carnival Colors</p>
      <p style={{ fontSize:13, color:'#2b2f38', lineHeight:1.55 }}>AI technologies have the ability to streamline processes, enhance communication, and improve productivity.</p>
      {anim !== 'idle' && <ApproveOverlay anim={anim} />}
    </div>
  );
}

function BlogCard({ post, anim }: { post: Post; anim: 'idle' | 's1' | 's2' }) {
  return (
    <div style={{ background:'#fff', borderRadius:'inherit', overflow:'hidden', position:'relative' }}>
      <img src="https://www.figma.com/api/mcp/asset/4b9ee42d-7ad2-45cc-a259-c3adbb12b836" alt="" style={{ width:'100%', height:140, objectFit:'cover', display:'block' }} />
      <div style={{ padding:'16px 20px 20px' }}>
        <div style={{ fontSize:11, fontWeight:500, color:T.dark40, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8, fontFamily:T.font }}>Blog post</div>
        <div style={{ fontSize:20, fontWeight:400, color:'#2b2f38', lineHeight:1.25, marginBottom:8, fontFamily:"Georgia,'Times New Roman',serif" }}>{post.title}</div>
        <div style={{ fontSize:12, color:T.dark60, marginBottom:10, fontFamily:T.font }}>July 8, 2025</div>
        <p style={{ fontSize:13, color:'#2b2f38', lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>In recent years, remote work has become increasingly popular, and with the advancements in artificial intelligence, it has the potential to become even more efficient.</p>
      </div>
      {anim !== 'idle' && <ApproveOverlay anim={anim} />}
    </div>
  );
}

function PostCard({ post, anim }: { post: Post; anim: 'idle' | 's1' | 's2' }) {
  const isDark = post.type === 'story' || post.type === 'short';
  return (
    <div style={{
      width:330, flexShrink:0, border:`1px solid ${T.dark8}`, borderRadius:14.78,
      overflow:'hidden', background: isDark ? 'transparent' : T.bgLight,
    }}>
      {post.type === 'still'      && <StillCard post={post} anim={anim} />}
      {post.type === 'carousel'   && <CarouselCard post={post} anim={anim} />}
      {post.type === 'story'      && <StoryCard post={post} anim={anim} />}
      {post.type === 'short'      && <ShortCard post={post} anim={anim} />}
      {post.type === 'feed-video' && <FeedVideoCard post={post} anim={anim} />}
      {post.type === 'email'      && <EmailCard post={post} anim={anim} />}
      {post.type === 'blog'       && <BlogCard post={post} anim={anim} />}
    </div>
  );
}

// ── Tab bar config ────────────────────────────────────────────────────────────
const TAB_ITEMS: TabItem[] = [
  { id:'home',      label:'Home',      icon: homeIcon      as unknown as string, iconActive: homeFilledIcon as unknown as string },
  { id:'calendar',  label:'Calendar',  icon: calendarIcon  as unknown as string },
  { id:'campaigns', label:'Campaigns', icon: layersIcon     as unknown as string },
  { id:'brand-kit', label:'Brand Kit', icon: brandKitIcon  as unknown as string },
  { id:'more',      label:'More',      icon: moreIcon      as unknown as string },
];

// ── Home screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onCampaignClick }: { onCampaignClick: () => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:T.bgGray, height:'100%' }}>
      {/* Header */}
      <div style={{ background:'#fff', padding:'10px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${T.dark4}`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:99, background:'#45164a', overflow:'hidden', flexShrink:0 }}>
            <img src={AVATAR} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <span style={{ fontSize:17, fontWeight:500, color:T.dark90, fontFamily:T.font }}>Radiant Health</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, background:'#fff', border:`1px solid ${T.dark8}`, borderRadius:99, padding:'7px 14px', fontSize:14, fontWeight:500, color:T.dark90, fontFamily:T.font }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.3 4.8H12.2L9 7.1L10.3 10.9L7 8.6L3.7 10.9L5 7.1L1.8 4.8H5.7L7 1Z" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinejoin="round"/></svg>
          96
        </div>
      </div>
      {/* Scroll */}
      <div style={{ flex:1, overflowY:'auto', paddingBottom:136 }}>
        <div style={{ background:'#fff', padding:'22px 20px 20px', borderBottom:`8px solid ${T.bgGray}` }}>
          <h1 style={{ fontSize:28, fontWeight:400, lineHeight:1.1, color:T.dark90, fontFamily:T.font }}>Welcome back, Fabian</h1>
        </div>
        {/* Up next */}
        <div style={{ padding:'20px 20px 0', marginTop:4 }}>
          <div style={{ fontSize:18, fontWeight:400, color:T.dark90, marginBottom:12, fontFamily:T.font }}>Up next</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {/* Connect accounts */}
            <div style={{ background:'#fff', border:`1px solid ${T.dark8}`, borderRadius:14, padding:16, display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{ width:40, height:40, minWidth:40, borderRadius:10, background:'linear-gradient(145deg,#F5A623,#F7C47A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg viewBox="0 0 22 22" fill="none" width="22" height="22"><rect x="3" y="4" width="16" height="14" rx="2.5" stroke="rgba(255,255,255,0.95)" strokeWidth="1.6"/><path d="M3 8.5h16" stroke="rgba(255,255,255,0.95)" strokeWidth="1.6" strokeLinecap="round"/><path d="M8 2v4M14 2v4" stroke="rgba(255,255,255,0.95)" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:500, color:T.dark90, marginBottom:3, fontFamily:T.font }}>Connect your accounts</div>
                <div style={{ fontSize:13, color:T.dark60, lineHeight:1.4, fontFamily:T.font }}>Your posts are idle. Automatically publish your approved content.</div>
              </div>
            </div>
            {/* Approve campaign */}
            <div onClick={onCampaignClick} style={{ background:'#fff', border:`1px solid ${T.dark8}`, borderRadius:14, padding:16, display:'flex', alignItems:'flex-start', gap:14, cursor:'pointer' }}>
              <div style={{ width:40, height:40, minWidth:40, borderRadius:10, background:'linear-gradient(145deg,#20A14F,#1FCF5F)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg viewBox="0 0 22 22" fill="none" width="22" height="22"><circle cx="11" cy="11" r="7.5" stroke="rgba(255,255,255,0.95)" strokeWidth="1.6"/><path d="M7.5 11L10 13.5L14.5 9" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:500, color:T.dark90, marginBottom:3, fontFamily:T.font }}>Approve your next campaign</div>
                <div style={{ fontSize:13, color:T.dark60, lineHeight:1.4, fontFamily:T.font }}>Spring Sale 2026: The best of spring sale</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:T.dark40, marginTop:5, fontFamily:T.font }}>
                  <span>Apr 19 – May 1</span>
                  <div style={{ width:3, height:3, borderRadius:99, background:T.dark40, flexShrink:0 }} />
                  <span>16 posts to review</span>
                </div>
              </div>
            </div>
            {/* Upgrade */}
            <div style={{ background:'#fff', border:`1px solid ${T.dark8}`, borderRadius:14, padding:16, display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{ width:40, height:40, minWidth:40, borderRadius:10, background:'linear-gradient(145deg,#7B5CE5,#9B7FF5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg viewBox="0 0 22 22" fill="none" width="22" height="22"><path d="M11 2L12.8 7.5H18.5L13.8 10.9L15.6 16.4L11 13L6.4 16.4L8.2 10.9L3.5 7.5H9.2L11 2Z" fill="rgba(255,255,255,0.95)"/></svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:500, color:T.dark90, marginBottom:3, fontFamily:T.font }}>Upgrade to create more content</div>
                <div style={{ fontSize:13, color:T.dark60, lineHeight:1.4, fontFamily:T.font }}>You're running low on credits. The Starter plan gives you 600 per month.</div>
              </div>
            </div>
          </div>
        </div>
        {/* Upcoming posts */}
        <div style={{ padding:'20px 20px 0', marginTop:20, paddingBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:18, fontWeight:400, color:T.dark90, fontFamily:T.font }}>Upcoming posts</div>
            <div style={{ width:28, height:28, borderRadius:99, background:T.dark4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:T.dark60, cursor:'pointer', lineHeight:1 }}>+</div>
          </div>
          <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
            {[
              { img:IMG5, tag:'Instagram', color:T.dark90, title:'Holiday Gift Guide', date:'Tomorrow · 9:00 AM' },
              { img:IMG1, tag:'Facebook', color:'#1877f2', title:'Spring Sale Promo', date:'May 20 · 11:00 AM' },
              { img:IMG4, tag:'Instagram', color:T.dark90, title:'Wellness Tips', date:'May 22 · 10:00 AM' },
            ].map((card, i) => (
              <div key={i} style={{ minWidth:155, width:155, borderRadius:14, overflow:'hidden', border:`1px solid ${T.dark8}`, background:'#fff', flexShrink:0 }}>
                <img src={card.img} alt="" style={{ width:'100%', height:140, objectFit:'cover', display:'block' }} />
                <div style={{ padding:'10px 12px', background:'#fff', borderTop:`1px solid ${T.dark4}` }}>
                  <div style={{ fontSize:10, fontWeight:500, color:card.color, marginBottom:3, fontFamily:T.font }}>● {card.tag}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:T.dark90, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontFamily:T.font }}>{card.title}</div>
                  <div style={{ fontSize:11, color:T.dark40, fontFamily:T.font }}>{card.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Campaign screen ───────────────────────────────────────────────────────────
function CampaignScreen({ onBack, onReview, campaignApproved }: { onBack: () => void; onReview: () => void; campaignApproved: boolean }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:T.bgGray, height:'100%', position:'relative' }}>
      <div style={{ flex:1, overflowY:'auto', paddingBottom:165 }}>
        {/* Hero */}
        <div style={{ position:'relative', height:280, overflow:'hidden', flexShrink:0 }}>
          <img src={HERO} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', background:'#2d4a2a' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0.06) 0%,rgba(0,0,0,0.62) 100%)' }} />
          <div style={{ position:'absolute', top:64, left:16 }}>
            <GlassIconButton icon={chevLeftIcon as unknown as string} label="Back" onClick={onBack} />
          </div>
          <div style={{ position:'absolute', top:64, right:16 }}>
            <GlassIconButton icon={moreIcon as unknown as string} label="More" />
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0 16px 18px' }}>
            <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
              <div style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:99, padding:'5px 12px', fontSize:12, fontWeight:500, color:'#fff', fontFamily:T.font }}>🛍️ Offer &amp; Promotion</div>
              {campaignApproved ? (
                <div style={{ background:'rgba(32,161,79,0.17)', border:'1px solid rgba(32,161,79,0.1)', borderRadius:4.69, padding:'5px 12px', fontSize:12, fontWeight:500, color:T.green, fontFamily:T.font }}>Approved</div>
              ) : (
                <div style={{ background:'rgba(205,155,15,0.88)', border:'1px solid rgba(255,200,50,0.2)', borderRadius:99, padding:'5px 12px', fontSize:12, fontWeight:500, color:'#fff', fontFamily:T.font }}>12 posts to Review</div>
              )}
            </div>
            <h2 style={{ fontSize:26, fontWeight:400, color:'#fff', lineHeight:1.2, fontFamily:T.font }}>Kona Coffee for the holidays</h2>
          </div>
        </div>

        {/* Campaign details */}
        <div style={{ padding:'20px 16px 10px', fontSize:18, fontWeight:400, color:T.dark90, fontFamily:T.font }}>Campaign details</div>
        <div style={{ background:'#fff', border:`1px solid ${T.dark8}`, borderRadius:16, margin:'0 16px', overflow:'hidden' }}>
          {[['Theme',''], ['Call-to-action','Eat more BBQ'], ['Target link','www.konacoffee.com'], ['Audience','Financial Advisors, Consulta...'], ['Context','']].map(([lbl, val], i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom: i < 4 ? `1px solid ${T.dark4}` : 'none', gap:12, cursor:'pointer' }}>
              <span style={{ fontSize:15, color:T.dark90, flexShrink:0, fontFamily:T.font }}>{lbl}</span>
              {val ? <span style={{ fontSize:14, color:T.dark40, display:'flex', alignItems:'center', gap:5, fontFamily:T.font }}>{val} <ChevRight /></span> : <ChevRight />}
            </div>
          ))}
        </div>

        {/* Schedule & accounts */}
        <div style={{ padding:'20px 16px 10px', fontSize:18, fontWeight:400, color:T.dark90, fontFamily:T.font }}>Schedule &amp; accounts</div>
        <div style={{ background:'#fff', border:`1px solid ${T.dark8}`, borderRadius:16, margin:'0 16px', overflow:'hidden' }}>
          {[['Schedule','Sept 28 – Oct 18'], ['Accounts','Adam Nathan + 3'], ['Content','2 stills, 2 carousels, 2 videos...']].map(([lbl, val], i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom: i < 2 ? `1px solid ${T.dark4}` : 'none', gap:12, cursor:'pointer' }}>
              <span style={{ fontSize:15, color:T.dark90, flexShrink:0, fontFamily:T.font }}>{lbl}</span>
              <span style={{ fontSize:14, color:T.dark40, display:'flex', alignItems:'center', gap:5, fontFamily:T.font }}>{val} <ChevRight /></span>
            </div>
          ))}
        </div>

        {/* Post list */}
        <div style={{ padding:'20px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:18, fontWeight:400, color:T.dark90, fontFamily:T.font }}>Review 15 posts</span>
          <span style={{ fontSize:14, fontWeight:500, color:T.dark40, fontFamily:T.font }}>+ Add New</span>
        </div>
        <div style={{ background:'#fff', border:`1px solid ${T.dark8}`, borderRadius:16, margin:'0 16px', overflow:'hidden' }}>
          {[
            { date:'Sep 25 10:00am', caption:'Get ready to take a trip down memory lane with our latest design.', img:IMG1 },
            { date:'Sep 27 2:00pm', caption:'Discover the joyful playtime moments at Houston Boxer Rescue.', img:IMG2 },
          ].map((post, i) => (
            <div key={i} onClick={onReview} style={{ borderBottom: i < 1 ? `1px solid ${T.dark4}` : 'none', cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px 6px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:500, color:T.dark60, fontFamily:T.font }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:T.dark4, border:`1px solid ${T.dark8}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="2" stroke="rgba(0,0,0,0.45)" strokeWidth="1.2"/><path d="M1 9L4 6.5L6.5 8L9 5.5L12 8" stroke="rgba(0,0,0,0.45)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  Still image
                </div>
                <span style={{ fontSize:12, color:T.dark40, fontFamily:T.font }}>{post.date}</span>
              </div>
              <p style={{ padding:'0 16px 10px', fontSize:13, color:T.dark60, lineHeight:1.5, fontFamily:T.font, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>{post.caption}</p>
              <img src={post.img} alt="" style={{ width:'100%', height:210, objectFit:'cover', display:'block' }} />
            </div>
          ))}
        </div>
        <div style={{ height:12 }} />
      </div>

      {/* Sticky footer */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#fff', padding:'12px 16px 30px' }}>
        <button onClick={campaignApproved ? undefined : onReview} style={{ width:'100%', background:T.dark90, color:'#fff', border:'none', borderRadius:99, height:52, fontSize:16, fontWeight:500, cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
          {!campaignApproved && <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5"/><path d="M5.5 9L8 11.5L12.5 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          {campaignApproved ? 'Add Posts' : 'Review Posts'}
        </button>
        {!campaignApproved && (
          <button style={{ width:'100%', background:T.bgLight, color:T.dark90, border:`1px solid ${T.dark8}`, borderRadius:99, height:52, fontSize:16, fontWeight:500, cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:9 }}>
            Regenerate All ✦ 125
          </button>
        )}
        <p style={{ textAlign:'center', fontSize:12, color:T.dark40, fontFamily:T.font }}>
          {campaignApproved ? 'All posts are approved and scheduled! Add more content anytime.' : 'Approve by Mar 26 to publish on time.'}
        </p>
      </div>
    </div>
  );
}

// ── Review Sheet ──────────────────────────────────────────────────────────────
function ReviewSheet({
  open, cur, postStates, onClose, onPrev, onNext, onApprove, onDontPost, onActions,
  approveAnim,
}: {
  open: boolean; cur: number; postStates: PostStatus[]; onClose: () => void;
  onPrev: () => void; onNext: () => void; onApprove: () => void; onDontPost: () => void;
  onActions: () => void; approveAnim: 'idle' | 's1' | 's2';
}) {
  const post = POSTS[cur];
  const status = postStates[cur];
  const reviewed = postStates.filter(s => s !== 'pending').length;

  const pillStyle: React.CSSProperties = status === 'approved'
    ? { background:T.green10, color:T.green }
    : status === 'rejected'
    ? { background:T.dark8, color:T.dark60 }
    : { background:T.warning30, color:T.warningTx };
  const pillLabel = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Draft' : 'Review';

  const ActBtn = ({ children, label, danger, success, onClick, wide = true }: { children: React.ReactNode; label: string; danger?: boolean; success?: boolean; onClick?: () => void; wide?: boolean }) => (
    <div onClick={onClick} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, height:54, borderRadius:99, cursor:'pointer', border:`1px solid ${T.dark8}`, background:'rgba(255,255,255,0.6)', backdropFilter:T.glassBlur, WebkitBackdropFilter:T.glassBlur, boxShadow:`0 0 32px rgba(0,0,0,0.08), inset 0 0 0 0.5px ${T.dark8}`, fontFamily:T.font, padding:'0 10px', ...(wide ? { flex:1 } : { width:50, flexShrink:0 }) }}>
      {children}
      <span style={{ fontSize:10, fontWeight:500, color: danger ? T.red : success ? T.green : T.dark60, whiteSpace:'nowrap', fontFamily:T.font }}>{label}</span>
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:T.dark8, zIndex:200, opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none', transition:'opacity 0.3s' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:814, background:T.bgGray, borderRadius:'24px 24px 0 0', boxShadow:'0 15px 75px rgba(0,0,0,0.18)', zIndex:201, transform: open ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.42s cubic-bezier(0.32,1.0,0.60,1)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Drag handle */}
        <div style={{ width:36, height:4, background:T.dark8, borderRadius:99, margin:'12px auto 0', flexShrink:0 }} />
        {/* Header */}
        <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', flexShrink:0 }}>
          <div style={{ width:44, display:'flex', alignItems:'center', justifyContent:'flex-start', flexShrink:0 }}>
            <div onClick={onClose} style={{ width:36, height:36, borderRadius:99, background:'rgba(255,255,255,0.6)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', boxShadow:'0 0 32px rgba(0,0,0,0.08)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, fontSize:20, color:T.dark90, paddingRight:2 }}>‹</div>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', minWidth:0 }}>
            <div style={{ fontSize:18, fontWeight:400, lineHeight:1.4, color:T.dark90, fontFamily:T.font, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:200 }}>Kona Coffee for the holi…</div>
            <div style={{ fontSize:12, color:T.dark40, marginTop:2, fontFamily:T.font }}>{reviewed} of {TOTAL} reviewed</div>
          </div>
          <div style={{ width:44, display:'flex', alignItems:'center', justifyContent:'flex-end', flexShrink:0 }}>
            <div style={{ padding:'2px 4px', borderRadius:4.69, fontSize:12, fontWeight:400, whiteSpace:'nowrap', flexShrink:0, fontFamily:T.font, lineHeight:1.4, ...pillStyle }}>{pillLabel}</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ padding:'0 20px 10px', display:'flex', gap:4, flexShrink:0 }}>
          {postStates.map((s, i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:99, background: s==='approved' ? T.green : s==='rejected' ? T.red : i===cur ? T.dark40 : T.dark8, transition:'background 0.25s' }} />
          ))}
        </div>
        {/* Card */}
        <div style={{ flex:1, overflowY:'auto', padding:'4px 16px 12px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <PostCard post={post} anim={approveAnim} />
        </div>
        {/* Metadata */}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 20px 4px', flexShrink:0 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            <div style={{ fontSize:10, fontWeight:500, color:T.dark40, textTransform:'uppercase', letterSpacing:'0.5px', fontFamily:T.font }}>Content type</div>
            <div style={{ fontSize:14, fontWeight:500, color:T.dark90, fontFamily:T.font }}>{TYPE_LABELS[post.type]}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'flex-end' }}>
            <div style={{ fontSize:10, fontWeight:500, color:T.dark40, textTransform:'uppercase', letterSpacing:'0.5px', fontFamily:T.font }}>Posting on</div>
            <div style={{ fontSize:14, fontWeight:500, color: status==='rejected' ? T.dark40 : T.dark90, fontFamily:T.font }}>
              {status === 'rejected' ? 'Not scheduled' : post.date}
            </div>
          </div>
        </div>
        {/* Action bar */}
        <div style={{ padding:'6px 12px 28px', display:'flex', alignItems:'center', gap:7, flexShrink:0 }}>
          <ActBtn label="Prev" wide={false} onClick={onPrev}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M15 19L8 12L15 5" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </ActBtn>
          {status === 'pending' && <>
            <ActBtn label="Don't Post" danger onClick={onDontPost}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="8.5" stroke={T.red} strokeWidth="1.5"/><path d="M18 6L6 18M18 18L6 6" stroke={T.red} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </ActBtn>
            <ActBtn label="Approve" success onClick={onApprove}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="8.5" stroke={T.green} strokeWidth="1.5"/><path d="M7.5 12.8235C8.82559 13.9216 11.0568 15.9412 12.0541 17.5C13.2396 15.2059 16.3757 9.29412 20 7" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </ActBtn>
            <ActBtn label="Actions" onClick={onActions}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="5.5" cy="12" r="1.5" fill={T.dark60}/><circle cx="12" cy="12" r="1.5" fill={T.dark60}/><circle cx="18.5" cy="12" r="1.5" fill={T.dark60}/></svg>
            </ActBtn>
          </>}
          {status === 'approved' && <>
            <ActBtn label="Reschedule">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4.75 8.91425H18.75M6.55952 3V4.54304M16.75 3V4.54285M19.75 7.24285V18.3C19.75 19.7912 18.5561 21 17.0833 21H6.41667C4.94391 21 3.75 19.7912 3.75 18.3V7.24285C3.75 5.75168 4.94391 4.54285 6.41667 4.54285H17.0833C18.5561 4.54285 19.75 5.75168 19.75 7.24285Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </ActBtn>
            <ActBtn label="Post">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M21.0704 2.92961L10.4065 13.5936M3.27112 8.23529L19.877 2.47406C20.8996 2.11927 21.8808 3.1004 21.526 4.12303L15.7648 20.7289C15.3701 21.8665 13.7726 21.8977 13.3338 20.7764L10.6969 14.0377C10.5652 13.7011 10.2989 13.4348 9.96238 13.3031L3.22366 10.6662C2.10232 10.2275 2.13351 8.62997 3.27112 8.23529Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </ActBtn>
            <ActBtn label="Actions" onClick={onActions}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="5.5" cy="12" r="1.5" fill={T.dark60}/><circle cx="12" cy="12" r="1.5" fill={T.dark60}/><circle cx="18.5" cy="12" r="1.5" fill={T.dark60}/></svg>
            </ActBtn>
          </>}
          {status === 'rejected' && <>
            <ActBtn label="Schedule">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4.75 8.91425H18.75M6.55952 3V4.54304M16.75 3V4.54285M19.75 7.24285V18.3C19.75 19.7912 18.5561 21 17.0833 21H6.41667C4.94391 21 3.75 19.7912 3.75 18.3V7.24285C3.75 5.75168 4.94391 4.54285 6.41667 4.54285H17.0833C18.5561 4.54285 19.75 5.75168 19.75 7.24285Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </ActBtn>
            <ActBtn label="Regenerate">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M19.4221 8.01389C18.0322 5.61438 15.4343 4 12.4588 4C9.08513 4 6.19686 6.07535 5.00433 9.01736M16.9806 9.01736H21V5.00347M5.57787 16.0417C6.96782 18.4412 9.56573 20.0556 12.5412 20.0556C15.9149 20.0556 18.8031 17.9802 19.9957 15.0382M8.0194 15.0382H4V19.0521" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </ActBtn>
            <ActBtn label="Actions" onClick={onActions}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="5.5" cy="12" r="1.5" fill={T.dark60}/><circle cx="12" cy="12" r="1.5" fill={T.dark60}/><circle cx="18.5" cy="12" r="1.5" fill={T.dark60}/></svg>
            </ActBtn>
          </>}
          <ActBtn label="Next" wide={false} onClick={onNext}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M9 5L16 12L9 19" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </ActBtn>
        </div>
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
        <DrawerItem onClick={onClose} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12.5365 19.2431L13.2788 18.4112C14.1896 17.3904 15.8236 17.5231 16.5577 18.6774C17.2416 19.7527 18.7274 19.9566 19.6757 19.1052L21.0211 17.8972M2.97888 19.4701L7.34487 18.5904C7.57664 18.5437 7.78946 18.4296 7.9566 18.2624L17.7303 8.48332C18.1989 8.01446 18.1986 7.25447 17.7296 6.78601L15.6591 4.71794C15.1903 4.24967 14.4307 4.24999 13.9623 4.71865L4.18764 14.4987C4.02083 14.6656 3.90693 14.878 3.86018 15.1093L2.97888 19.4701Z" stroke={T.dark90} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Adjust caption" />
        <DrawerItem onClick={onClose} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M21.6 11.9752L12 16.8959L2.40002 11.9752M21.6 16.6793L12 21.6L2.40002 16.6793M12 2.40002L21.6 7.32077L12 12.2415L2.40002 7.32077L12 2.40002Z" stroke={T.dark90} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Edit design" />
        <DrawerItem onClick={onClose} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M19.4221 8.01389C18.0322 5.61438 15.4343 4 12.4588 4C9.08513 4 6.19686 6.07535 5.00433 9.01736M16.9806 9.01736H21V5.00347M5.57787 16.0417C6.96782 18.4412 9.56573 20.0556 12.5412 20.0556C15.9149 20.0556 18.8031 17.9802 19.9957 15.0382M8.0194 15.0382H4V19.0521" stroke={T.dark90} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Regenerate this content" rhs={<div style={{ display:'flex', alignItems:'center', gap:4, fontSize:14, color:T.dark60, fontFamily:T.font, flexShrink:0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L13.9 7.9H20L14.9 11.5L16.8 17.4L12 13.8L7.2 17.4L9.1 11.5L4 7.9H10.1L12 2Z" stroke="rgba(0,0,0,0.4)" strokeWidth="1.3" strokeLinejoin="round"/></svg>1<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M10 8L14 12L10 16" stroke={T.dark25} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg></div>} />
        <DrawerItem onClick={onClose} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4.75 8.91425H18.75M6.55952 3V4.54304M16.75 3V4.54285M19.75 7.24285V18.3C19.75 19.7912 18.5561 21 17.0833 21H6.41667C4.94391 21 3.75 19.7912 3.75 18.3V7.24285C3.75 5.75168 4.94391 4.54285 6.41667 4.54285H17.0833C18.5561 4.54285 19.75 5.75168 19.75 7.24285Z" stroke={T.dark90} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Schedule" rhs={<div style={{ display:'flex', alignItems:'center', gap:4, fontSize:14, color:T.dark60, fontFamily:T.font, flexShrink:0 }}>{postDate}<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M10 8L14 12L10 16" stroke={T.dark25} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg></div>} />
        <DrawerItem onClick={onClose} icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M21.0704 2.92961L10.4065 13.5936M3.27112 8.23529L19.877 2.47406C20.8996 2.11927 21.8808 3.1004 21.526 4.12303L15.7648 20.7289C15.3701 21.8665 13.7726 21.8977 13.3338 20.7764L10.6969 14.0377C10.5652 13.7011 10.2989 13.4348 9.96238 13.3031L3.22366 10.6662C2.10232 10.2275 2.13351 8.62997 3.27112 8.23529Z" stroke={T.dark90} strokeWidth="1.5" strokeLinecap="round"/></svg>} label="Posting accounts" rhs={<div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}><div style={{ width:18, height:18, borderRadius:4, background:'linear-gradient(145deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg></div><svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M10 8L14 12L10 16" stroke={T.dark25} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/></svg></div>} />
        <div style={{ borderBottom:'none' }}>
          <DrawerItem onClick={onClose} danger icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4 6.17647H20M10 16.7647V10.4118M14 16.7647V10.4118M16 21H8C6.89543 21 6 20.0519 6 18.8824V7.23529C6 6.65052 6.44772 6.17647 7 6.17647H17C17.5523 6.17647 18 6.65052 18 7.23529V18.8824C18 20.0519 17.1046 21 16 21ZM10 6.17647H14C14.5523 6.17647 15 5.70242 15 5.11765V4.05882C15 3.47405 14.5523 3 14 3H10C9.44772 3 9 3.47405 9 4.05882V5.11765C9 5.70242 9.44772 6.17647 10 6.17647Z" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Delete" />
        </div>
      </div>
    </>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function CampaignApproval() {
  const [screen, setScreen] = useState<'home' | 'campaign'>('home');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cur, setCur] = useState(0);
  const [postStates, setPostStates] = useState<PostStatus[]>(Array(TOTAL).fill('pending'));
  const [campaignApproved, setCampaignApproved] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [approveAnim, setApproveAnim] = useState<'idle' | 's1' | 's2'>('idle');

  const openSheet = useCallback(() => {
    setPostStates(prev => {
      const firstPending = prev.findIndex(s => s === 'pending');
      setCur(firstPending !== -1 ? firstPending : 0);
      return prev;
    });
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const advanceToNext = useCallback((states: PostStatus[], afterCur: number) => {
    const next = states.findIndex((s, i) => i > afterCur && s === 'pending');
    if (next !== -1) {
      setCur(next);
    } else if (states.every(s => s !== 'pending')) {
      setTimeout(() => {
        setSheetOpen(false);
        setTimeout(() => setCampaignApproved(true), 420);
      }, 500);
    }
  }, []);

  const handleApprove = useCallback(() => {
    setApproveAnim('s1');
    setTimeout(() => setApproveAnim('s2'), 420);
    setTimeout(() => {
      setPostStates(prev => {
        const next = [...prev];
        next[cur] = 'approved';
        setTimeout(() => {
          setApproveAnim('idle');
          advanceToNext(next, cur);
        }, 700);
        return next;
      });
    }, 950);
  }, [cur, advanceToNext]);

  const handleDontPost = useCallback(() => {
    setPostStates(prev => {
      const next = [...prev];
      next[cur] = 'rejected';
      setTimeout(() => advanceToNext(next, cur), 600);
      return next;
    });
  }, [cur, advanceToNext]);

  const handleRemoveApproval = useCallback(() => {
    setActionsOpen(false);
    setTimeout(() => {
      setPostStates(prev => { const n = [...prev]; n[cur] = 'pending'; return n; });
    }, 280);
  }, [cur]);

  const activeTab = screen === 'home' ? 'home' : 'campaigns';

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100vw', height:'100vh', background:'linear-gradient(145deg, rgba(0,0,0,0.04) 0%, rgba(124,92,252,0.05) 100%)' }}>
      <PhoneFrame
        footer={screen === 'home' ? <TabBar tabs={TAB_ITEMS} activeTab={activeTab} onTabChange={() => {}} /> : undefined}
        overlay={
          <>
            <ReviewSheet
              open={sheetOpen} cur={cur} postStates={postStates}
              onClose={closeSheet} onPrev={() => setCur(c => Math.max(0, c - 1))}
              onNext={() => setCur(c => Math.min(TOTAL - 1, c + 1))}
              onApprove={handleApprove} onDontPost={handleDontPost}
              onActions={() => setActionsOpen(true)} approveAnim={approveAnim}
            />
            <ActionsDrawer
              open={actionsOpen} isApproved={postStates[cur] === 'approved'}
              postDate={POSTS[cur].date} onClose={() => setActionsOpen(false)}
              onRemoveApproval={handleRemoveApproval}
            />
          </>
        }
      >
        {/* Sliding screens */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
          <div style={{ display:'flex', width:'200%', height:'100%', transform: screen === 'campaign' ? 'translateX(-50%)' : 'translateX(0)', transition:'transform 0.38s cubic-bezier(0.4,0,0.2,1)' }}>
            <div style={{ width:'50%', height:'100%', overflowY:'auto', overflowX:'hidden' }}>
              <HomeScreen onCampaignClick={() => setScreen('campaign')} />
            </div>
            <div style={{ width:'50%', height:'100%', overflowY:'auto', overflowX:'hidden' }}>
              <CampaignScreen onBack={() => setScreen('home')} onReview={openSheet} campaignApproved={campaignApproved} />
            </div>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}
