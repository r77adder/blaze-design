import React from 'react';

export type PostPreviewCardStatus = 'pending' | 'approved' | 'rejected';
export type PostPreviewType = 'still' | 'carousel' | 'story' | 'short' | 'feed-video' | 'email' | 'blog';

export interface PostPreviewCardProps {
  type?: PostPreviewType;
  /** Post image URL */
  img?: string;
  /** Caption text shown below the image (feed types) */
  caption?: string;
  /** Platform account name shown in the header */
  username?: string;
  /** Avatar image URL */
  avatar?: string;
  /** Current approval status */
  status?: PostPreviewCardStatus;
  /** Approve animation phase */
  approveAnim?: 'idle' | 's1' | 's2';
  /** @deprecated kept for API compat */
  checkmarkImg?: string;
  /** @deprecated kept for API compat */
  approvalsImg?: string;
  // Type-specific
  /** Number of slides (carousel) */
  slides?: number;
  /** Story sticker line 1 */
  sticker1?: string;
  /** Story sticker line 2 */
  sticker2?: string;
  /** Email subject line */
  subject?: string;
  /** Email hero image URL */
  heroImg?: string;
  /** Blog post title */
  title?: string;
  /** Blog cover image URL */
  coverImg?: string;
  /** Post date (shown in blog/email preview) */
  date?: string;
}

const FONT  = "'Sohne', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif";
const INTER = "'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

// ── Shared approve animation overlay ─────────────────────────────────────────
function ApproveAnim({ approveAnim }: { approveAnim: 'idle' | 's1' | 's2' }) {
  if (approveAnim === 'idle') return null;
  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(32,161,79,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: approveAnim === 's2' ? 1 : 0,
        transition: 'opacity 0.35s ease',
        zIndex: 10,
      }}
    >
      <div
        style={{
          width:  approveAnim === 's2' ? 80 : 48,
          height: approveAnim === 's2' ? 80 : 48,
          borderRadius: '50%',
          background: '#20a14f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'width 0.45s cubic-bezier(0.34,1.56,0.64,1), height 0.45s cubic-bezier(0.34,1.56,0.64,1)',
          flexShrink: 0,
        }}
      >
        <svg
          width={approveAnim === 's2' ? 36 : 22}
          height={approveAnim === 's2' ? 28 : 17}
          viewBox="0 0 36 28"
          fill="none"
          style={{ transition: 'width 0.45s cubic-bezier(0.34,1.56,0.64,1), height 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          <path d="M3 14.5L13.5 25L33 3" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ── Instagram feed shell (still · carousel · feed-video) ──────────────────────
function FeedShell({
  img,
  caption,
  username,
  avatar,
  approveAnim,
  animating,
  children,
}: {
  img?: string;
  caption?: string;
  username: string;
  avatar?: string;
  approveAnim: 'idle' | 's1' | 's2';
  animating: boolean;
  children?: React.ReactNode; // image area slot (can add overlays)
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 331,
        background: '#ffffff',
        border: animating ? '1px solid #20a14f' : '1.2px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        boxShadow: '0px 5.842px 46.732px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        transition: 'border-color 0.35s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 9px 8px' }}>
        <div style={{ width: 25, height: 25, borderRadius: 99, background: '#45164a', overflow: 'hidden', flexShrink: 0 }}>
          {avatar && <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.8)', lineHeight: 1.42 }}>{username}</span>
          <span style={{ fontFamily: INTER, fontSize: 8, fontWeight: 400, color: 'rgba(0,0,0,0.4)', lineHeight: 1.32 }}>Just now</span>
        </div>
      </div>

      {/* Image area (type-specific overlays injected via children) */}
      <div style={{ width: '100%', aspectRatio: '1', position: 'relative', background: 'rgba(0,0,0,0.04)' }}>
        {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        {children}
        <ApproveAnim approveAnim={approveAnim} />
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M12 21.5C12 21.5 2.5 15.5 2.5 8.5C2.5 5.46 5.46 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.54 3 23.5 5.46 23.5 8.5C23.5 15.5 12 21.5 12 21.5Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Caption */}
      {caption && (
        <div style={{ padding: '0 13px 13px' }}>
          <p style={{ margin: 0, fontFamily: INTER, fontSize: 11, color: '#101419', lineHeight: 1.52 }}>
            <strong>{username} </strong>
            <span style={{ fontWeight: 400 }}>{caption.length > 90 ? caption.slice(0, 90) : caption}</span>
            {caption.length > 90 && <span style={{ color: 'rgba(0,0,0,0.4)' }}> ...</span>}
            {caption.length > 90 && <span style={{ color: '#8f98a9' }}>more</span>}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Story card (portrait · 9:16 · full-bleed · no feed shell) ────────────────
function StoryCard({
  img,
  username,
  avatar,
  sticker1,
  sticker2,
  approveAnim,
  animating,
}: {
  img?: string;
  username: string;
  avatar?: string;
  sticker1?: string;
  sticker2?: string;
  approveAnim: 'idle' | 's1' | 's2';
  animating: boolean;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 280,
        aspectRatio: '249 / 441',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        border: animating ? '1px solid #20a14f' : '1.2px solid rgba(0,0,0,0.08)',
        boxShadow: '0px 5.842px 46.732px rgba(0,0,0,0.05)',
        transition: 'border-color 0.35s ease',
        background: 'linear-gradient(160deg, #1a5fbf 0%, #328cf3 40%, #4aa8e8 100%)',
      }}
    >
      {/* Background image */}
      {img && (
        <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, rgba(0,0,0,0.4) 100%)' }} />

      {/* Story progress bars */}
      <div style={{ position: 'absolute', top: 10, left: 8, right: 8, display: 'flex', gap: 3, zIndex: 2 }}>
        {[45, 0, 0].map((pct, i) => (
          <div key={i} style={{ flex: 1, height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.35)', overflow: 'hidden' }}>
            {pct > 0 && <div style={{ width: `${pct}%`, height: '100%', background: '#fff' }} />}
          </div>
        ))}
      </div>

      {/* Username header */}
      <div style={{ position: 'absolute', top: 20, left: 8, right: 8, display: 'flex', alignItems: 'center', gap: 6, zIndex: 2 }}>
        <div style={{ width: 26, height: 26, borderRadius: 99, background: '#45164a', overflow: 'hidden', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.8)' }}>
          {avatar && <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, color: '#fff', lineHeight: 1.4, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{username}</span>
        <span style={{ fontFamily: INTER, fontSize: 9, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>Just now</span>
      </div>

      {/* Sticker labels */}
      {(sticker1 || sticker2) && (
        <div style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2, alignItems: 'center' }}>
          {sticker1 && (
            <div style={{ background: '#d0ecf6', padding: '4px 8px', borderRadius: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#000', fontFamily: FONT, whiteSpace: 'nowrap' }}>{sticker1}</span>
            </div>
          )}
          {sticker2 && (
            <div style={{ background: '#d0ecf6', padding: '4px 8px', borderRadius: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#000', fontFamily: FONT, whiteSpace: 'nowrap' }}>{sticker2}</span>
            </div>
          )}
        </div>
      )}

      <ApproveAnim approveAnim={approveAnim} />
    </div>
  );
}

// ── Short/Reels card (portrait · 9:16 · dark · play button) ──────────────────
function ShortCard({
  img,
  username,
  caption,
  approveAnim,
  animating,
}: {
  img?: string;
  username: string;
  caption?: string;
  approveAnim: 'idle' | 's1' | 's2';
  animating: boolean;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 280,
        aspectRatio: '249 / 441',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        border: animating ? '1px solid #20a14f' : '1.2px solid rgba(0,0,0,0.08)',
        boxShadow: '0px 5.842px 46.732px rgba(0,0,0,0.05)',
        transition: 'border-color 0.35s ease',
        background: '#0c0f11',
      }}
    >
      {img && <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 35%, rgba(0,0,0,0.65) 100%)' }} />

      {/* Shorts label */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 2 }}>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: INTER, textShadow: '0 0 4px rgba(0,0,0,0.5)', letterSpacing: '-0.2px' }}>Shorts</span>
      </div>

      {/* Play button */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none' }}>
        <div style={{ width: 44, height: 44, borderRadius: 99, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <svg width="14" height="16" viewBox="0 0 16 18" fill="none"><path d="M2 2L14 9L2 16V2Z" fill="white" /></svg>
        </div>
      </div>

      {/* Username + caption at bottom */}
      <div style={{ position: 'absolute', bottom: 14, left: 12, right: 12, zIndex: 2 }}>
        <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 3 }}>@{username}</span>
        {caption && <span style={{ fontFamily: INTER, fontSize: 10, color: 'rgba(255,255,255,0.8)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{caption}</span>}
      </div>

      <ApproveAnim approveAnim={approveAnim} />
    </div>
  );
}

// ── Email preview card ────────────────────────────────────────────────────────
function EmailCard({
  subject,
  heroImg,
  username,
  approveAnim,
  animating,
}: {
  subject?: string;
  heroImg?: string;
  username: string;
  approveAnim: 'idle' | 's1' | 's2';
  animating: boolean;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 331,
        background: '#fff',
        border: animating ? '1px solid #20a14f' : '1.2px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        boxShadow: '0px 5.842px 46.732px rgba(0,0,0,0.05)',
        transition: 'border-color 0.35s ease',
      }}
    >
      {/* Email header bar */}
      <div style={{ background: 'rgba(0,0,0,0.03)', padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(0,0,0,0.4)', width: 28, flexShrink: 0 }}>From</span>
          <span style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(0,0,0,0.7)', fontWeight: 500 }}>{username}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(0,0,0,0.4)', width: 28, flexShrink: 0 }}>Sub</span>
          <span style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(0,0,0,0.85)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 230 }}>{subject}</span>
        </div>
      </div>
      {/* Email body */}
      <div style={{ padding: '16px 16px 20px', position: 'relative' }}>
        {subject && (
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: '#2b2f38', lineHeight: 1.25, marginBottom: 12 }}>{subject}</div>
        )}
        {heroImg && (
          <img src={heroImg} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 12 }} />
        )}
        <p style={{ margin: 0, fontFamily: FONT, fontSize: 13, color: '#2b2f38', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          In recent years, remote work has become increasingly popular, and with the advancements in AI, it has the potential to become even more efficient and transformative for teams.
        </p>
        <ApproveAnim approveAnim={approveAnim} />
      </div>
    </div>
  );
}

// ── Blog preview card ─────────────────────────────────────────────────────────
function BlogCard({
  title,
  coverImg,
  date,
  caption,
  approveAnim,
  animating,
}: {
  title?: string;
  coverImg?: string;
  date?: string;
  caption?: string;
  approveAnim: 'idle' | 's1' | 's2';
  animating: boolean;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 331,
        background: '#fff',
        border: animating ? '1px solid #20a14f' : '1.2px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        boxShadow: '0px 5.842px 46.732px rgba(0,0,0,0.05)',
        transition: 'border-color 0.35s ease',
      }}
    >
      {coverImg && <img src={coverImg} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />}
      <div style={{ padding: '16px 16px 20px', position: 'relative' }}>
        {date && <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(0,0,0,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{date} · Blog</div>}
        {title && <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: '#2b2f38', lineHeight: 1.25, marginBottom: 10 }}>{title}</div>}
        {caption && (
          <p style={{ margin: 0, fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.6)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{caption}</p>
        )}
        <ApproveAnim approveAnim={approveAnim} />
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function PostPreviewCard({
  type = 'still',
  img,
  caption = '',
  username = 'radiant_health',
  avatar,
  status = 'pending',
  approveAnim = 'idle',
  slides = 1,
  sticker1,
  sticker2,
  subject,
  title,
  heroImg,
  coverImg,
  date,
}: PostPreviewCardProps) {
  const animating = approveAnim !== 'idle';

  // ── story ──
  if (type === 'story') {
    return (
      <StoryCard
        img={img}
        username={username}
        avatar={avatar}
        sticker1={sticker1}
        sticker2={sticker2}
        approveAnim={approveAnim}
        animating={animating}
      />
    );
  }

  // ── short ──
  if (type === 'short') {
    return (
      <ShortCard
        img={img}
        username={username}
        caption={caption}
        approveAnim={approveAnim}
        animating={animating}
      />
    );
  }

  // ── email ──
  if (type === 'email') {
    return (
      <EmailCard
        subject={subject}
        heroImg={heroImg ?? img}
        username={username}
        approveAnim={approveAnim}
        animating={animating}
      />
    );
  }

  // ── blog ──
  if (type === 'blog') {
    return (
      <BlogCard
        title={title}
        coverImg={coverImg ?? img}
        date={date}
        caption={caption}
        approveAnim={approveAnim}
        animating={animating}
      />
    );
  }

  // ── feed-video ──
  if (type === 'feed-video') {
    return (
      <FeedShell img={img} caption={caption} username={username} avatar={avatar} approveAnim={approveAnim} animating={animating}>
        {/* Play button overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 99, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <svg width="14" height="16" viewBox="0 0 16 18" fill="none"><path d="M2 2L14 9L2 16V2Z" fill="white" /></svg>
          </div>
        </div>
      </FeedShell>
    );
  }

  // ── carousel ──
  if (type === 'carousel') {
    return (
      <FeedShell img={img} caption={caption} username={username} avatar={avatar} approveAnim={approveAnim} animating={animating}>
        {/* Slide count badge */}
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 99, padding: '2px 7px', zIndex: 2 }}>
          <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 600, color: '#fff' }}>1/{slides}</span>
        </div>
        {/* Dot indicators */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 2 }}>
          {Array.from({ length: Math.min(slides, 5) }, (_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: 99, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.45)' }} />
          ))}
        </div>
      </FeedShell>
    );
  }

  // ── still (default) ──
  return (
    <FeedShell img={img} caption={caption} username={username} avatar={avatar} approveAnim={approveAnim} animating={animating} />
  );
}
