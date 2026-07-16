/**
 * Card shell + body copied verbatim from the PR112 approvals redesign
 * (prototypes/blaze-dfy/Approvals.tsx) so the Growth Engine Review creative
 * cards render identically to the AM/client approvals cards. The only local
 * change is at the call site: the header's date slot shows the review status
 * instead of a posting time.
 */

import { Pill } from '@/staging';
import { ReelPlayer } from './reel-player';

const F = "'Sohne', sans-serif";
const dark90 = 'var(--dark-90)';
const dark80 = 'var(--dark-80)';
const dark60 = 'var(--dark-60)';
const dark40 = 'var(--dark-40)';
const dark15 = 'var(--dark-15)';
const dark8 = 'var(--dark-8)';
const white = 'var(--light-100)';

export type ContentType = 'still' | 'carousel' | 'story' | 'short' | 'feed-video' | 'email' | 'blog' | 'gbp' | 'paid-social' | 'paid-search' | 'lsa' | 'seo-article' | 'review';

export interface Post {
  id: number;
  type: ContentType;
  date: string;
  caption: string;
  img?: string;
  /** Optional real video clip for reel/video types; falls back to a simulated player. */
  video?: string;
  slides?: number;
  headline?: string;
  rating?: number;
  reviewer?: string;
  source?: string;
  /** Local Services Ad: review count + service area shown under the rating. */
  reviews?: number;
  area?: string;
  /** SEO / AEO article: the search / AI query the piece targets. */
  query?: string;
}

export const TYPE_LABEL: Record<ContentType, string> = {
  still: 'Still Image', carousel: 'Carousel', story: 'Story',
  short: 'Reel', 'feed-video': 'Video', email: 'Email', blog: 'Article',
  gbp: 'Google Business', 'paid-social': 'Paid Social', 'paid-search': 'Paid Search',
  lsa: 'Local Services Ad', 'seo-article': 'SEO / AEO Article',
  review: 'Review Response',
};

// ── Type icons, exact SVG paths uploaded by designer ────────────────────────
export function TypeIcon({ type, size = 14 }: { type: ContentType; size?: number }) {
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
    case 'gbp': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 21c4-3.5 6-6.9 6-10a6 6 0 10-12 0c0 3.1 2 6.5 6 10z" stroke="#0179CF" strokeWidth="1.4" strokeLinejoin="round"/>
        <circle cx="12" cy="11" r="2.2" stroke="#0179CF" strokeWidth="1.4"/>
      </svg>
    );
    case 'paid-social': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M5 4l14 6-6 2-2 6-6-14z" stroke="#0179CF" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    );
    case 'paid-search': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="10.5" cy="10.5" r="6.5" stroke="#0179CF" strokeWidth="1.4"/>
        <path d="M20 20l-4.5-4.5" stroke="#0179CF" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    );
    case 'lsa': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 3v5c0 4.2-2.8 7.6-7 9-4.2-1.4-7-4.8-7-9V6l7-3z" stroke="#34A853" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#34A853" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'seo-article': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="10.5" cy="10.5" r="6.5" stroke="#20A14F" strokeWidth="1.4"/>
        <path d="M20 20l-4.5-4.5" stroke="#20A14F" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M8 9.5h5M8 12h3" stroke="#20A14F" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    );
    case 'review': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z" stroke="#EDB62C" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    );
    default: return null;
  }
}

function RatingStars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < rating ? '#EDB62C' : 'none'}>
          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z" stroke="#EDB62C" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
      ))}
    </span>
  );
}

const SERIF = "Georgia, 'Times New Roman', serif";
const CARD_SHADOW = '0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)';
export const CARD_W = 340;
export const CARD_H = 500;
export const PAGE_W = CARD_W * 3 + 18 * 2;

// ── Shared card body, fills a fixed-height card (verbatim from PR112). ────────
export function CardBody({ post }: { post: Post }) {
  const isPortrait = post.type === 'story' || post.type === 'short' || post.type === 'feed-video';
  const isLandscape = post.type === 'still' || post.type === 'carousel' || post.type === 'paid-social' || post.type === 'gbp';

  if (post.type === 'blog') return (
    <div style={{ flex: 1, minHeight: 0, padding: '10px 10px 12px', display: 'flex' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: white, borderRadius: 8, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#c8c0b4' }}>
          {post.img && <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
        <div style={{ flexShrink: 0, padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 400, color: dark90, fontFamily: SERIF, lineHeight: 1.28, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{post.caption}</p>
        </div>
      </div>
    </div>
  );

  if (post.type === 'paid-search') return (
    <div style={{ flex: 1, minHeight: 0, padding: '10px 10px 12px', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%', background: white, borderRadius: 8, boxShadow: CARD_SHADOW, padding: '16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: dark90, fontFamily: F, border: `1px solid ${dark15}`, borderRadius: 4, padding: '0 4px', lineHeight: '15px' }}>Ad</span>
          <span style={{ fontSize: 11, color: dark60, fontFamily: F }}>graindesignflooring.com</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 400, color: '#1a0dab', fontFamily: F, lineHeight: 1.3 }}>{post.headline ?? post.caption}</p>
            <p style={{ margin: '8px 0 0', fontSize: 12.5, color: dark60, fontFamily: F, lineHeight: 1.55 }}>{post.caption}</p>
          </div>
          {post.img && <img src={post.img} alt="" style={{ width: 76, height: 76, flexShrink: 0, borderRadius: 8, objectFit: 'cover', display: 'block' }} />}
        </div>
      </div>
    </div>
  );

  if (post.type === 'lsa') return (
    <div style={{ flex: 1, minHeight: 0, padding: '10px 10px 12px', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%', background: white, borderRadius: 8, boxShadow: CARD_SHADOW, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 15, height: 15, borderRadius: 99, background: '#34A853', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span style={{ fontSize: 11, color: '#5f6368', fontFamily: F }}>Google Guaranteed</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, color: dark90, fontFamily: F }}>{post.headline}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 13, color: '#e37400', fontWeight: 600, fontFamily: F }}>{post.rating?.toFixed(1)}</span>
          <RatingStars rating={Math.round(post.rating ?? 5)} />
          <span style={{ fontSize: 12, color: dark60, fontFamily: F }}>({post.reviews})</span>
        </div>
        <div style={{ fontSize: 12.5, color: dark60, fontFamily: F, lineHeight: 1.5 }}>{post.area} · {post.caption}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#1a73e8', border: '1px solid #dadce0', borderRadius: 6, padding: '5px 12px', fontFamily: F }}>Request a quote</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#1a73e8', border: '1px solid #dadce0', borderRadius: 6, padding: '5px 12px', fontFamily: F }}>Call</span>
        </div>
      </div>
    </div>
  );

  if (post.type === 'seo-article') return (
    <div style={{ flex: 1, minHeight: 0, padding: '10px 10px 12px', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%', background: white, borderRadius: 8, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
        <div style={{ height: 150, background: '#c8c0b4', overflow: 'hidden' }}>
          {post.img && <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#1a0dab', fontFamily: F, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{post.headline ?? post.caption}</p>
          <p style={{ margin: 0, fontSize: 14, color: dark60, fontFamily: F, lineHeight: 1.55 }}>{post.caption}</p>
          {post.query && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: dark40, fontFamily: F }}>Targets</span>
              <Pill size="sm">{post.query}</Pill>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (post.type === 'review') return (
    <div style={{ flex: 1, minHeight: 0, padding: '10px 10px 12px', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%', background: white, borderRadius: 8, boxShadow: CARD_SHADOW, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RatingStars rating={post.rating ?? 5} />
          <span style={{ fontSize: 12, color: dark90, fontFamily: F, fontWeight: 500 }}>{post.reviewer}</span>
          <span style={{ fontSize: 11, color: dark40, fontFamily: F, marginLeft: 'auto' }}>{post.source}</span>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: dark80, fontFamily: F, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{post.caption}</p>
      </div>
    </div>
  );

  if (isPortrait) {
    const isVideo = post.type === 'feed-video' || post.type === 'short';
    return (
      <div style={{ flex: 1, minHeight: 0, padding: '10px 10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ height: '100%', aspectRatio: '9 / 16', maxWidth: '100%', position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#1a1a1a' }}>
          {isVideo && post.img
            ? <ReelPlayer poster={post.img} src={post.video} />
            : post.img && <img src={post.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
      </div>
    );
  }

  if (isLandscape) return (
    <div style={{ flex: 1, minHeight: 0, padding: '10px 10px 12px', display: 'flex' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: white, borderRadius: 8, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, padding: '10px 12px 8px' }}>
          <p style={{ margin: 0, fontSize: 12.5, color: dark80, fontFamily: F, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{post.caption}</p>
        </div>
        <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#c8c0b4', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {post.img && <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          {post.type === 'carousel' && post.slides && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="white" strokeWidth="1.6"/><path d="M2 7v10M22 7v10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 10, color: 'white', fontFamily: F, lineHeight: 1 }}>{post.slides}</span>
            </div>
          )}
          {post.type === 'paid-social' && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: '3px 7px', display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'white', fontFamily: F, lineHeight: 1 }}>Sponsored</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Email / other, editorial: serif headline, image stage, body excerpt.
  return (
    <div style={{ flex: 1, minHeight: 0, padding: '10px 10px 12px', display: 'flex' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: white, borderRadius: 8, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, padding: '14px 14px 10px' }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 400, color: dark90, fontFamily: SERIF, lineHeight: 1.28, textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{post.caption.split('.')[0]}</p>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: '#c8c0b4' }}>
          {post.img && <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
        <div style={{ flexShrink: 0, padding: '10px 14px 14px' }}>
          <p style={{ margin: 0, fontSize: 12.5, color: dark60, fontFamily: F, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{post.caption}</p>
        </div>
      </div>
    </div>
  );
}
