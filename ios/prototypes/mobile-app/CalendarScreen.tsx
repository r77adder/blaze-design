import { ASSETS } from './assets';
import { ContentStatusPill } from '@ios/staging';
import type { PostData } from './ContentPreviewSheet';
import chevronDownIcon from '@ios/icons/chevron-down.svg';
import doubleChevronIcon from '@ios/icons/double-chevron-vertical.svg';
import imageIcon from '@ios/icons/image-03.svg';
import clockIcon from '@ios/icons/clock-check.svg';
import playIcon from '@ios/icons/play.svg';
import cardIcon from '@ios/icons/card.svg';
import mailIcon from '@ios/icons/mail.svg';
import layersIcon from '@ios/icons/layers-05.svg';

const font = 'var(--ios-font)';

const WEEK = [
  { day: 'S', date: 6,  hasDot: false },
  { day: 'M', date: 7,  hasDot: false },
  { day: 'T', date: 8,  hasDot: true  },
  { day: 'W', date: 9,  hasDot: true  },
  { day: 'T', date: 10, hasDot: true  },
  { day: 'F', date: 11, hasDot: false },
  { day: 'S', date: 12, hasDot: true  },
];
const ACTIVE_DATE = 10;

type PostType = 'Still Image' | 'Story' | 'Carousel' | 'Feed Video' | 'Short Form' | 'Blog' | 'Email';

const TYPE_ICONS: Record<PostType, string> = {
  'Still Image': imageIcon,
  'Story':       clockIcon,
  'Carousel':    layersIcon,
  'Feed Video':  playIcon,
  'Short Form':  playIcon,
  'Blog':        cardIcon,
  'Email':       mailIcon,
};

export const CAL_POSTS: PostData[] = [
  { id: 1, type: 'Still Image', img: ASSETS.calStillImage,   body: 'Get ready to take a trip down memory lane with our latest design system! The vibrant colors, bold typography, and playful illustrations will transport you back to the golden age of retro comics.' },
  { id: 2, type: 'Story',       img: ASSETS.calVideoPreview, body: 'Get ready to take a trip down memory lane with our latest design system! The vibrant colors, bold typography, and playful illustrations will transport you back to the golden age of retro comics.' },
  { id: 3, type: 'Carousel',    img: ASSETS.calCarouselImg,  body: 'Get ready to take a trip down memory lane with our latest design system! The vibrant colors, bold typography, and playful illustrations will transport you back to the golden age of retro comics.' },
  { id: 4, type: 'Feed Video',  img: ASSETS.calVideoPreview, body: "We're excited to unveil our new accessibility features in the design system! With improved contrast ratios and screen reader support, we are committed to making our products usable for everyone." },
  { id: 5, type: 'Short Form',  img: ASSETS.calVideoPreview, body: "We're excited to unveil our new accessibility features in the design system! With improved contrast ratios and screen reader support, we are committed to making our products usable for everyone." },
  { id: 6, type: 'Blog',        img: ASSETS.calBlogCover,    body: "We're excited to unveil our new accessibility features in the design system! With improved contrast ratios and screen reader support, we are committed to making our products usable for everyone." },
  { id: 7, type: 'Email',       img: ASSETS.calEmailPreview, body: "We're excited to unveil our new accessibility features in the design system! With improved contrast ratios and screen reader support, we are committed to making our products usable for everyone." },
];

const POSTS_WITH_TIME = CAL_POSTS.map(p => ({ ...p, time: '2:55pm', type: p.type as PostType }));

interface Props {
  onPostClick?: (idx: number) => void;
}

export function CalendarScreen({ onPostClick }: Props) {
  return (
    <div style={{ fontFamily: font, background: 'white', minHeight: '100%', paddingBottom: 126 }}>

      {/* Header — 68px visible */}
      <div style={{
        height: 68,
        background: 'var(--ios-background-gray)',
        borderBottom: '1px solid var(--ios-dark-4)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '0 20px 8px',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}>
        <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span style={{ fontFamily: font, fontSize: 18, fontWeight: 400, lineHeight: 1.4, color: 'var(--ios-dark-90)' }}>September</span>
          <div style={{ paddingTop: 3 }}>
            <img src={chevronDownIcon} alt="" aria-hidden="true" style={{ width: 14, height: 14 }} />
          </div>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: 6, borderRadius: 99,
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'var(--ios-glass-blur)',
          WebkitBackdropFilter: 'var(--ios-glass-blur)',
          boxShadow: '0 0 32px rgba(0,0,0,0.08)',
        }}>
          <div style={{ height: 32, padding: '0 6px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontFamily: font, fontSize: 14, fontWeight: 400, lineHeight: 1.4, color: 'var(--ios-dark-90)', letterSpacing: '0.14px' }}>Today</span>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <img src={doubleChevronIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
          </div>
        </div>
      </div>

      {/* Week strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', paddingTop: 5 }}>
        {WEEK.map(({ day, date, hasDot }) => {
          const isActive = date === ACTIVE_DATE;
          return (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 5, paddingBottom: 2, borderRadius: 12, background: isActive ? 'rgba(0,0,0,0.03)' : 'transparent' }}>
              <div style={{ height: 15, width: 53, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: font, fontSize: 10, fontWeight: 400, color: isActive ? 'var(--ios-dark-90)' : 'var(--ios-dark-40)', letterSpacing: '0.3px', lineHeight: 1.5 }}>{day}</span>
              </div>
              <div style={{ width: 25, height: 25, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: isActive ? 'var(--ios-dark-90)' : 'var(--ios-dark-60)', lineHeight: 1.5 }}>{date}</span>
              </div>
              <div style={{ width: 4, height: 4, borderRadius: 99, background: hasDot ? 'var(--ios-brand)' : 'transparent' }} />
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--ios-dark-4)', margin: '4px 0 0' }} />

      {/* Calendar rows */}
      {POSTS_WITH_TIME.map((post, i) => (
        <div
          key={post.id}
          onClick={() => onPostClick?.(i)}
          style={{
            display: 'flex', gap: 16, alignItems: 'flex-start',
            padding: '15px 20px',
            borderBottom: i < POSTS_WITH_TIME.length - 1 ? '1px solid var(--ios-dark-4)' : 'none',
            minHeight: 173, boxSizing: 'border-box',
            cursor: 'pointer',
          }}
        >
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', alignSelf: 'center' }}>
            <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', letterSpacing: '0.12px', lineHeight: 1.4, textAlign: 'right' }}>
              {post.time}
            </span>
            <div style={{ width: 120, height: 120, borderRadius: 8.5, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src={post.img ?? ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', paddingTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <img src={TYPE_ICONS[post.type]} alt="" aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0 }} />
                <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', letterSpacing: '0.12px', lineHeight: 1.4, whiteSpace: 'nowrap' }}>
                  {post.type}
                </span>
              </div>
              <ContentStatusPill variant="review" />
            </div>
            <p style={{ margin: 0, fontFamily: font, fontSize: 14, lineHeight: 1.4, color: 'var(--ios-dark-90)', letterSpacing: '0.14px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
              {post.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
