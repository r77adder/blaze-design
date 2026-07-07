import { Heading, Text } from '@/components';
import Heart01 from '@/icons/20/Heart01';
import Send1 from '@/icons/20/Send1';
import Comment from '@/icons/20/Comment';

/**
 * Platform-accurate preview chrome for Story, Reel, and Blog content — used
 * anywhere a content card shows one of these assets (Approvals grid, Creative
 * review, the fullscreen post preview) so it reads as the real thing instead
 * of a generic social-post tile. Story/Reel fill the card's existing image
 * slot (aspect-ratio + rounded corners stay on the parent); BlogPreview owns
 * its own layout since a blog article isn't a square/vertical media tile.
 */

const OVERLAY_TEXT_SHADOW = '0 1px 4px rgba(0,0,0,0.45)';

function BrandBadge({ initial, name, size = 20 }: { initial: string; name: string; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: size, height: size, borderRadius: 99, background: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, fontWeight: 600, color: 'var(--dark-90)', flexShrink: 0 }}>{initial}</span>
      <Text style={{ fontSize: 11, fontWeight: 600, color: 'var(--light-100)', textShadow: OVERLAY_TEXT_SHADOW }}>{name}</Text>
    </div>
  );
}

/** Instagram/Facebook Story chrome — segmented progress bar, brand header,
 *  bottom reply bar. */
export function StoryPreview({ image, brandInitial, brandName, headline }: {
  image: string; brandInitial: string; brandName: string; headline?: string;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 58%, rgba(0,0,0,0.6) 100%)' }} />

      {/* segmented progress bar */}
      <div style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', gap: 4 }}>
        <div style={{ flex: 1, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.95)' }} />
        <div style={{ flex: 1, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.35)' }} />
      </div>

      <div style={{ position: 'absolute', top: 16, left: 8, right: 8 }}>
        <BrandBadge initial={brandInitial} name={brandName} />
      </div>

      {headline && (
        <Text style={{ position: 'absolute', left: 10, right: 10, bottom: 32, color: 'var(--light-100)', fontSize: 13, fontWeight: 600, lineHeight: 1.3, textShadow: OVERLAY_TEXT_SHADOW }} lineClamp={2}>
          {headline}
        </Text>
      )}

      {/* bottom reply bar */}
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, height: 22, borderRadius: 99, border: '1px solid rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', padding: '0 8px', minWidth: 0 }}>
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)' }}>Send message…</Text>
        </div>
        <Heart01 size={14} color="var(--light-100)" />
        <Send1 size={14} color="var(--light-100)" />
      </div>
    </div>
  );
}

/** Instagram/Facebook Reel chrome — right action rail, bottom-left
 *  brand + caption, center play glyph. No progress bar (reels aren't
 *  ephemeral like stories). */
export function ReelPreview({ image, brandInitial, brandName, caption }: {
  image: string; brandInitial: string; brandName: string; caption?: string;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.62) 100%)' }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ width: 40, height: 40, borderRadius: 99, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="16" viewBox="0 0 16 18" fill="var(--light-100)"><path d="M2 2L14 9L2 16V2Z" /></svg>
        </div>
      </div>

      {/* right action rail */}
      <div style={{ position: 'absolute', right: 8, bottom: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Heart01 size={16} color="var(--light-100)" />
        <Comment size={16} color="var(--light-100)" />
        <Send1 size={16} color="var(--light-100)" />
      </div>

      {/* bottom-left brand + caption */}
      <div style={{ position: 'absolute', left: 10, right: 36, bottom: 10 }}>
        <div style={{ marginBottom: 4 }}>
          <BrandBadge initial={brandInitial} name={brandName} size={18} />
        </div>
        {caption && (
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', lineHeight: 1.35, textShadow: OVERLAY_TEXT_SHADOW }} lineClamp={2}>
            {caption}
          </Text>
        )}
      </div>
    </div>
  );
}

/** Blog article preview — a website page, not a social post: hero image,
 *  headline, byline, and an excerpt with a "Read full article" affordance.
 *  No like/comment/share chrome, since a blog isn't a social platform post. */
export function BlogPreview({ image, title, excerpt, brandName }: {
  image: string; title: string; excerpt: string; brandName: string;
}) {
  return (
    <div>
      <div style={{ aspectRatio: '16 / 9', background: `center/cover no-repeat url('${image}'), var(--dark-4)` }} />
      <div style={{ padding: '20px 22px 24px' }}>
        <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 8 }}>{brandName} · Blog</Text>
        <Heading level={4} style={{ margin: '0 0 10px', lineHeight: 1.3 }}>{title}</Heading>
        <Text style={{ display: 'block', color: 'var(--dark-80)', lineHeight: 1.6 }}>{excerpt}</Text>
        <Text style={{ display: 'inline-block', marginTop: 14, color: 'var(--dark-90)', fontWeight: 500 }}>Read full article →</Text>
      </div>
    </div>
  );
}
