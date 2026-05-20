/**
 * ContentCard — content-type card for campaign review and detail views.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 5514-93803
 *
 * Structure
 *   Header:  type icon (20 px) · type label (14/400) · date (14/400, right-align)
 *   Media:   varies by type (image, portrait, email body, blog body)
 *   Caption: 14/400, 2-line clamp, px-8 pb-8
 *
 * Overlays (inside media, position absolute):
 *   Status pill:    bottom-19 left-19
 *   Duration badge: bottom-19 right-19  (feed-video · short only)
 *   Approve anim:   full inset, green-tinted + growing checkmark
 */

import stillIcon    from '../icons/lighter_weight/Property 1=still image.svg';
import storiesIcon  from '../icons/lighter_weight/Property 1=stories.svg';
import carouselIcon from '../icons/lighter_weight/Property 1=carousel.svg';
import feedVideoIcon from '../icons/lighter_weight/Property 1=feed video posts.svg';
import shortIcon    from '../icons/lighter_weight/Property 1=short form video.svg';
import emailIcon    from '../icons/lighter_weight/Property 1=emails.svg';
import blogIcon     from '../icons/lighter_weight/Property 1=blogs.svg';

export type ContentCardType   = 'still' | 'story' | 'carousel' | 'feed-video' | 'short' | 'email' | 'blog';
export type ContentCardStatus = 'pending' | 'approved' | 'rejected';

export interface ContentCardProps {
  type: ContentCardType;
  date: string;
  /** Optional caption text rendered below the media (2-line clamp). */
  caption?: string;
  status?: ContentCardStatus;
  /** Main media image URL (still, carousel, feed-video). */
  img?: string;
  /** Number of slides (carousel). */
  slides?: number;
  /** Duration string e.g. "0:15" (feed-video, short). */
  duration?: string;
  /** Story sticker line 1. */
  sticker1?: string;
  /** Story sticker line 2. */
  sticker2?: string;
  /** Email subject line. */
  subject?: string;
  /** Email hero image URL. */
  heroImg?: string;
  /** Blog title. */
  title?: string;
  /** Blog cover image URL. */
  coverImg?: string;
  /** Approval animation state — drives the green-overlay checkmark. */
  approveAnim?: 'idle' | 's1' | 's2';
  /** Checkmark image URL shown during approve animation. */
  checkmarkImg?: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<ContentCardType, { label: string; icon: string }> = {
  still:       { label: 'Still image',       icon: stillIcon      as unknown as string },
  story:       { label: 'Story',             icon: storiesIcon    as unknown as string },
  carousel:    { label: 'Carousel',          icon: carouselIcon   as unknown as string },
  'feed-video':{ label: 'Feed video post',   icon: feedVideoIcon  as unknown as string },
  short:       { label: 'Short form video',  icon: shortIcon      as unknown as string },
  email:       { label: 'Email',             icon: emailIcon      as unknown as string },
  blog:        { label: 'Blog',              icon: blogIcon       as unknown as string },
};

const STATUS_STYLE: Record<ContentCardStatus, React.CSSProperties> = {
  pending:  { background: 'var(--ios-warning-30)',  color: 'var(--ios-warning-text)', border: '1px solid var(--ios-warning-30)' },
  approved: { background: 'var(--ios-green-10)',    color: 'var(--ios-green)',         border: '1px solid var(--ios-green-10)' },
  rejected: { background: 'var(--ios-dark-8)',      color: 'var(--ios-dark-60)',       border: '1px solid var(--ios-dark-4)' },
};
const STATUS_LABEL: Record<ContentCardStatus, string> = {
  pending: 'Review', approved: 'Approved', rejected: 'Draft',
};

function StatusPill({ status }: { status: ContentCardStatus }) {
  return (
    <div style={{
      position: 'absolute', bottom: 19, left: 19,
      padding: '2px 4px 1px', borderRadius: 4.69,
      fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.12,
      fontFamily: 'var(--ios-font)',
      pointerEvents: 'none',
      ...STATUS_STYLE[status],
    }}>
      {STATUS_LABEL[status]}
    </div>
  );
}

function DurationBadge({ duration }: { duration: string }) {
  return (
    <div style={{
      position: 'absolute', bottom: 19, right: 19,
      background: 'var(--ios-dark-90)', color: '#fff',
      borderRadius: 16, padding: '2px 6px',
      fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.12,
      fontFamily: 'var(--ios-font)',
      pointerEvents: 'none',
    }}>
      {duration}
    </div>
  );
}

function ApproveOverlay({ anim, checkmarkImg }: { anim: 'idle' | 's1' | 's2'; checkmarkImg?: string }) {
  if (anim === 'idle' || !checkmarkImg) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--ios-green-10)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 5,
    }}>
      <img src={checkmarkImg} alt="" style={{
        width:  anim === 's2' ? 70 : 40,
        height: anim === 's2' ? 70 : 40,
        objectFit: 'contain',
        transition: 'width 0.35s cubic-bezier(0.34,1.56,0.64,1), height 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </div>
  );
}

// ─── media sections ────────────────────────────────────────────────────────────

function StillMedia({ img, status, approveAnim, checkmarkImg }: {
  img?: string; status: ContentCardStatus;
  approveAnim: 'idle' | 's1' | 's2'; checkmarkImg?: string;
}) {
  return (
    <div style={{ position: 'relative', width: '100%', background: '#c8c0b4' }}>
      {img && <img src={img} alt="" style={{ width: '100%', height: 460, objectFit: 'cover', display: 'block' }} />}
      <StatusPill status={status} />
      <ApproveOverlay anim={approveAnim} checkmarkImg={checkmarkImg} />
    </div>
  );
}

function StoryMedia({ sticker1, sticker2, status, approveAnim, checkmarkImg }: {
  sticker1?: string; sticker2?: string; status: ContentCardStatus;
  approveAnim: 'idle' | 's1' | 's2'; checkmarkImg?: string;
}) {
  return (
    <div style={{
      position: 'relative', width: '100%',
      aspectRatio: '249 / 441',
      background: 'linear-gradient(160deg, #1a5fbf 0%, #328cf3 40%, #4aa8e8 100%)',
      overflow: 'hidden',
    }}>
      {/* gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 35%, rgba(0,0,0,0.35) 100%)' }} />
      {/* story progress bars */}
      <div style={{ position: 'absolute', top: 10, left: 8, right: 8, display: 'flex', gap: 3, zIndex: 2 }}>
        {[45, 0, 0].map((pct, i) => (
          <div key={i} style={{ flex: 1, height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.35)', overflow: 'hidden' }}>
            {pct > 0 && <div style={{ width: `${pct}%`, height: '100%', background: '#fff' }} />}
          </div>
        ))}
      </div>
      {/* sticker text */}
      {(sticker1 || sticker2) && (
        <div style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
          {sticker1 && (
            <div style={{ background: '#d0ecf6', padding: '4px 7px', borderRadius: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#000', fontFamily: 'var(--ios-font)', whiteSpace: 'nowrap' }}>{sticker1}</span>
            </div>
          )}
          {sticker2 && (
            <div style={{ background: '#d0ecf6', padding: '4px 7px', borderRadius: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#000', fontFamily: 'var(--ios-font)', whiteSpace: 'nowrap' }}>{sticker2}</span>
            </div>
          )}
        </div>
      )}
      <StatusPill status={status} />
      <ApproveOverlay anim={approveAnim} checkmarkImg={checkmarkImg} />
    </div>
  );
}

function CarouselMedia({ img, slides = 2, status, approveAnim, checkmarkImg }: {
  img?: string; slides?: number; status: ContentCardStatus;
  approveAnim: 'idle' | 's1' | 's2'; checkmarkImg?: string;
}) {
  return (
    <div style={{ position: 'relative', width: '100%', background: '#c8c0b4' }}>
      {img && <img src={img} alt="" style={{ width: '100%', height: 360, objectFit: 'cover', display: 'block' }} />}
      {/* slide counter */}
      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', borderRadius: 12, padding: '2px 8px', fontSize: 12, color: '#fff', fontFamily: 'var(--ios-font)' }}>
        1/{slides}
      </div>
      {/* dot indicators */}
      <div style={{ position: 'absolute', bottom: 19, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, alignItems: 'center' }}>
        {Array.from({ length: slides }, (_, i) => (
          <div key={i} style={{ width: i === 0 ? 8 : 6, height: i === 0 ? 8 : 6, borderRadius: 99, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }} />
        ))}
      </div>
      <StatusPill status={status} />
      <ApproveOverlay anim={approveAnim} checkmarkImg={checkmarkImg} />
    </div>
  );
}

function FeedVideoMedia({ img, duration = '0:30', status, approveAnim, checkmarkImg }: {
  img?: string; duration?: string; status: ContentCardStatus;
  approveAnim: 'idle' | 's1' | 's2'; checkmarkImg?: string;
}) {
  return (
    <div style={{ position: 'relative', width: '100%', background: '#0c0f11', overflow: 'hidden' }}>
      {img && <img src={img} alt="" style={{ width: '100%', aspectRatio: '764 / 1018', objectFit: 'cover', display: 'block', maxHeight: 460 }} />}
      {/* play button */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2 }}>
        <div style={{ width: 48, height: 48, borderRadius: 99, background: 'var(--ios-dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
            <path d="M2 2L14 9L2 16V2Z" fill="white" />
          </svg>
        </div>
      </div>
      <StatusPill status={status} />
      <DurationBadge duration={duration} />
      <ApproveOverlay anim={approveAnim} checkmarkImg={checkmarkImg} />
    </div>
  );
}

function ShortMedia({ status, approveAnim, checkmarkImg, duration = '0:15' }: {
  status: ContentCardStatus; duration?: string;
  approveAnim: 'idle' | 's1' | 's2'; checkmarkImg?: string;
}) {
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '249 / 441',
      background: '#0c0f11', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,15,17,0.3) 0%, rgba(12,15,17,0.1) 40%, rgba(12,15,17,0.6) 100%)' }} />
      {/* "Shorts" label */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 2 }}>
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--ios-font)', textShadow: '0 0 4px rgba(0,0,0,0.5)' }}>Shorts</span>
      </div>
      <StatusPill status={status} />
      <DurationBadge duration={duration} />
      <ApproveOverlay anim={approveAnim} checkmarkImg={checkmarkImg} />
    </div>
  );
}

function EmailMedia({ subject, heroImg, approveAnim, checkmarkImg }: {
  subject?: string; heroImg?: string;
  approveAnim: 'idle' | 's1' | 's2'; checkmarkImg?: string;
}) {
  return (
    <div style={{ position: 'relative', padding: 20, background: '#fff', overflow: 'hidden' }}>
      {subject && (
        <div style={{ fontSize: 28, fontWeight: 400, color: '#2b2f38', lineHeight: 1.2, marginBottom: 12, fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {subject}
        </div>
      )}
      {heroImg && (
        <img src={heroImg} alt="" style={{ width: '100%', height: 188, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 12 }} />
      )}
      <p style={{ margin: 0, fontSize: 16, color: '#2b2f38', lineHeight: 1.55, fontFamily: 'var(--ios-font)' }}>
        In recent years, remote work has become increasingly popular, and with the advancements in AI, it has the potential to become even more efficient.
      </p>
      <ApproveOverlay anim={approveAnim} checkmarkImg={checkmarkImg} />
    </div>
  );
}

function BlogMedia({ title, coverImg, date, approveAnim, checkmarkImg }: {
  title?: string; coverImg?: string; date?: string;
  approveAnim: 'idle' | 's1' | 's2'; checkmarkImg?: string;
}) {
  return (
    <div style={{ position: 'relative', background: '#fff', overflow: 'hidden' }}>
      {coverImg && (
        <img src={coverImg} alt="" style={{ width: '100%', height: 148, objectFit: 'cover', display: 'block' }} />
      )}
      <div style={{ padding: '16px 16px 20px' }}>
        {title && (
          <div style={{ fontSize: 28, fontWeight: 400, color: '#2b2f38', lineHeight: 1.2, marginBottom: 8, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {title}
          </div>
        )}
        {date && (
          <div style={{ fontSize: 14, color: 'var(--ios-dark-60)', marginBottom: 10, fontFamily: 'var(--ios-font)' }}>{date}</div>
        )}
        <p style={{ margin: 0, fontSize: 16, color: '#2b2f38', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', fontFamily: 'var(--ios-font)' }}>
          In recent years, remote work has become increasingly popular, and with the advancements in artificial intelligence, it has the potential to become even more efficient and transformative for businesses.
        </p>
      </div>
      <ApproveOverlay anim={approveAnim} checkmarkImg={checkmarkImg} />
    </div>
  );
}

// ─── main export ───────────────────────────────────────────────────────────────

import React from 'react';

export function ContentCard({
  type,
  date,
  caption,
  status = 'pending',
  img,
  slides,
  duration,
  sticker1,
  sticker2,
  subject,
  heroImg,
  title,
  coverImg,
  approveAnim = 'idle',
  checkmarkImg,
}: ContentCardProps) {
  const { label: typeLabel, icon: typeIcon } = TYPE_META[type];

  return (
    <div style={{
      width: '100%',
      background: '#fff',
      border: '1px solid var(--ios-dark-4)',
      borderRadius: 24,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, background: '#fff', flexShrink: 0 }}>
        <img src={typeIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-90)', fontFamily: 'var(--ios-font)' }}>
          {typeLabel}
        </span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 400, color: 'var(--ios-dark-90)', fontFamily: 'var(--ios-font)', textAlign: 'right' }}>
          {date}
        </span>
      </div>

      {/* Media */}
      {type === 'still' && (
        <StillMedia img={img} status={status} approveAnim={approveAnim} checkmarkImg={checkmarkImg} />
      )}
      {type === 'story' && (
        <StoryMedia sticker1={sticker1} sticker2={sticker2} status={status} approveAnim={approveAnim} checkmarkImg={checkmarkImg} />
      )}
      {type === 'carousel' && (
        <CarouselMedia img={img} slides={slides} status={status} approveAnim={approveAnim} checkmarkImg={checkmarkImg} />
      )}
      {type === 'feed-video' && (
        <FeedVideoMedia img={img} duration={duration} status={status} approveAnim={approveAnim} checkmarkImg={checkmarkImg} />
      )}
      {type === 'short' && (
        <ShortMedia duration={duration} status={status} approveAnim={approveAnim} checkmarkImg={checkmarkImg} />
      )}
      {type === 'email' && (
        <EmailMedia subject={subject} heroImg={heroImg} approveAnim={approveAnim} checkmarkImg={checkmarkImg} />
      )}
      {type === 'blog' && (
        <BlogMedia title={title} coverImg={coverImg} date={date} approveAnim={approveAnim} checkmarkImg={checkmarkImg} />
      )}

      {/* Caption */}
      {caption && type !== 'email' && type !== 'blog' && (
        <div style={{
          padding: '8px 8px 8px',
          fontSize: 14,
          fontWeight: 400,
          color: 'var(--ios-dark-90)',
          lineHeight: 1.5,
          fontFamily: 'var(--ios-font)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        }}>
          {caption}{' '}
          <span style={{ color: 'var(--ios-dark-40)' }}>...more</span>
        </div>
      )}
    </div>
  );
}
