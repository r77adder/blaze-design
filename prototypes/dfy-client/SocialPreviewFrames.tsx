import { Heading, Text } from '@/components';
import Heart01 from '@/icons/20/Heart01';
import Send1 from '@/icons/20/Send1';
import Comment from '@/icons/20/Comment';

/**
 * Platform-accurate preview chrome for Story, Reel, and Blog content, used
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

/** Instagram/Facebook Story chrome: segmented progress bar, brand header,
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

/** Instagram/Facebook Reel chrome: right action rail, bottom-left
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

/** Blog article preview: a website page, not a social post. Hero image,
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

/** The full body of a published blog article, mock content so the preview
 *  reads like the live post (hero + title + intro + section headings + body),
 *  not just a truncated card. */
export interface BlogArticle {
  title: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);

/** Full, in-frame scrollable article: a browser window rendering the live
 *  blog post. Used in the fullscreen preview so reviewers read the whole piece
 *  (hero, headline, all sections) instead of an excerpt. Scrolls within itself. */
export function BlogArticlePreview({ image, article, brandName, domain = 'graindesignflooring.com' }: {
  image?: string; article: BlogArticle; brandName: string; domain?: string;
}) {
  return (
    <div style={{ width: 720, flexShrink: 0, display: 'flex', flexDirection: 'column', border: '1px solid var(--dark-8)', borderRadius: 14, overflow: 'hidden', background: 'var(--light-100)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      {/* Browser chrome: traffic-light dots + address bar, so it reads as the live page. */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--dark-8)', background: 'var(--dark-2)' }}>
        <span style={{ display: 'inline-flex', gap: 6 }}>
          {['var(--dark-15)', 'var(--dark-15)', 'var(--dark-15)'].map((c, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 99, background: c }} />
          ))}
        </span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, height: 26, padding: '0 12px', borderRadius: 99, background: 'var(--light-100)', border: '1px solid var(--dark-8)', minWidth: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5V10Z" stroke="var(--dark-40)" strokeWidth="2" strokeLinejoin="round" /></svg>
          <Text variant="metadata" color="var(--dark-60)" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{domain}/blog/{slugify(article.title)}</Text>
        </div>
      </div>

      {/* Article body hugs its content; the surrounding preview area scrolls. */}
      <div>
        {image && <div style={{ aspectRatio: '16 / 9', background: `center/cover no-repeat url('${image}'), var(--dark-4)` }} />}
        <div style={{ padding: '32px 48px 44px' }}>
          <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 12 }}>{brandName} · Blog</Text>
          <Heading level={2} style={{ margin: '0 0 16px', lineHeight: 1.25 }}>{article.title}</Heading>
          <Text style={{ display: 'block', color: 'var(--dark-80)', lineHeight: 1.7, marginBottom: 8 }}>{article.intro}</Text>
          {article.sections.map((s, i) => (
            <div key={i} style={{ marginTop: 28 }}>
              <Heading level={4} style={{ margin: '0 0 12px', lineHeight: 1.3 }}>{s.heading}</Heading>
              {s.paragraphs.map((p, j) => (
                <Text key={j} style={{ display: 'block', color: 'var(--dark-80)', lineHeight: 1.7, marginBottom: 12 }}>{p}</Text>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Mock full-article bodies, keyed by post id, so opening an article in the
 *  preview shows the whole post. Copy follows house style (no em dashes). */
export const ARTICLES: Record<number, BlogArticle> = {
  30: {
    title: 'Hardwood vs. LVP vs. Tile: Which Flooring Actually Holds Up in an Austin Home?',
    intro: 'Austin homes take a beating. Between the heat, the humidity swings, and everything the dogs and kids track in, your floors are working harder than you think. Here is how the three most popular options really compare once you live on them.',
    sections: [
      { heading: 'Solid Hardwood: Beautiful, but Particular', paragraphs: [
        'Nothing reads as warm and high-end as real wood, and a well-finished white oak floor can last decades. The catch is movement. Solid hardwood expands and contracts with humidity, so in a climate like ours it wants a controlled indoor environment and a crew that acclimates the boards before installing.',
        'If you love the look and plan to stay put, hardwood rewards the investment. Refinish it every ten to fifteen years and it effectively resets to new.',
      ] },
      { heading: 'Luxury Vinyl Plank: The Practical Favorite', paragraphs: [
        'LVP has come a long way. The better products photograph almost indistinguishably from real oak, and they are fully waterproof, which matters in kitchens, bathrooms, and anywhere a slab foundation can wick moisture.',
        'For busy households, LVP is often the smart call. It shrugs off scratches, spills, and afternoon sun without the maintenance a natural floor demands.',
      ] },
      { heading: 'Tile: Built for the Tough Rooms', paragraphs: [
        'Porcelain tile is the most durable of the three and the easiest to keep clean, which is why we still specify it for entryways, mudrooms, and wet areas. Modern wood-look and herringbone tile give you that warmth without the upkeep.',
        'The trade-offs are underfoot comfort and installation cost, so we usually reserve tile for the rooms that need its toughness most.',
      ] },
      { heading: 'So, Which Should You Choose?', paragraphs: [
        'There is no single right answer, only the right answer for your home. We walk every project room by room, factor in your foundation and your daily life, and sample materials on-site under your own light before you commit.',
      ] },
    ],
  },
  31: {
    title: 'Should You Refinish or Replace Your Hardwood Floors?',
    intro: 'If your hardwood is looking tired, the good news is you may not need to tear it out. Here is how we help homeowners decide between a refinish and a full replacement.',
    sections: [
      { heading: 'When Refinishing Is the Answer', paragraphs: [
        'Most solid hardwood can be sanded and recoated several times over its life. If the boards are structurally sound and simply scratched, dull, or dated in color, a refinish brings them back to life at a fraction of the cost of new flooring.',
        'It is also faster and far less disruptive. With our dust-free sanding system, most homes are walkable again in about three days.',
      ] },
      { heading: 'When Replacement Makes More Sense', paragraphs: [
        'Some floors are past saving. Deep water damage, boards that have been sanded too thin already, or engineered planks with a wear layer that is spent all point toward replacement.',
        'Replacement is also the moment to rethink layout, plank width, and species if the current floor never quite fit the home.',
      ] },
      { heading: 'Our Recommendation', paragraphs: [
        'We start with an honest assessment. If a refinish will get you ten more years, we will tell you, and we will not upsell a replacement you do not need.',
      ] },
    ],
  },
  32: {
    title: 'Engineered vs. Solid Hardwood: A Design-Led Guide for Humid Climates',
    intro: 'In a humid climate, the hardwood you choose matters as much as the finish. Here is how engineered and solid wood really differ, and when each one wins.',
    sections: [
      { heading: 'How They Are Built', paragraphs: [
        'Solid hardwood is a single piece of wood through and through. Engineered hardwood is a real wood veneer bonded to a dimensionally stable core, which makes it far more resistant to the expansion and contraction that humidity causes.',
      ] },
      { heading: 'Where Engineered Wins', paragraphs: [
        'Over concrete slabs, in rooms with big humidity swings, or anywhere you want wide planks without the risk of cupping, engineered is usually the safer specification. You still get an authentic wood surface you can refinish, at least once or twice depending on the veneer.',
      ] },
      { heading: 'Where Solid Still Leads', paragraphs: [
        'For upstairs rooms with stable conditions and homeowners who want to refinish many times over decades, solid hardwood remains the heirloom choice.',
      ] },
    ],
  },
};
