import { ASSETS } from './assets';
import { ContentStatusPill } from '@ios/components';
import chevronDownIcon from '@ios/icons/chevron-down.svg';
import filterIcon from '@ios/icons/filter.svg';
import calendarTrashIcon from '@ios/icons/calendar-trash.svg';
import stillImageIcon   from '@ios/icons/content-type/still-image.svg';
import storyIcon        from '@ios/icons/content-type/story.svg';
import carouselIcon     from '@ios/icons/content-type/carousel.svg';
import feedVideoIcon    from '@ios/icons/content-type/feed-video-post.svg';
import shortFormIcon    from '@ios/icons/content-type/short-form-video.svg';
import blogIcon         from '@ios/icons/content-type/blog.svg';
import emailIcon        from '@ios/icons/content-type/email.svg';

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

type PostType = 'Still Image' | 'Story' | 'Carousel' | 'Feed video post' | 'Short Form Video' | 'Blog' | 'Email';

const TYPE_ICONS: Record<PostType, string> = {
  'Still Image':      stillImageIcon,
  'Story':            storyIcon,
  'Carousel':         carouselIcon,
  'Feed video post':  feedVideoIcon,
  'Short Form Video': shortFormIcon,
  'Blog':             blogIcon,
  'Email':            emailIcon,
};

const CAL_POSTS = [
  { id: 1, type: 'Still Image'      as PostType, img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',   time: '9:00am',  body: 'Get ready to take a trip down memory lane with our latest design system! The vibrant colors, bold typography, and playful illustrations will transport you.' },
  { id: 2, type: 'Story'            as PostType, img: ASSETS.videoPreview, time: '11:30am', body: 'Get ready to take a trip down memory lane with our latest design system! The vibrant colors, bold typography, and playful illustrations will transport you.' },
  { id: 3, type: 'Carousel'         as PostType, img: ASSETS.carouselImg,  time: '2:55pm',  body: "We're excited to unveil our new accessibility features in the design system! With improved contrast ratios and screen reader support." },
  { id: 4, type: 'Feed video post'  as PostType, img: ASSETS.videoPreview, time: '4:00pm',  body: "With improved contrast ratios and screen reader support, we are committed to making our products usable for everyone." },
  { id: 5, type: 'Short Form Video' as PostType, img: ASSETS.videoPreview, time: '5:00pm',  body: "We're excited to unveil our new accessibility features in the design system! With improved contrast ratios and screen reader support." },
  { id: 6, type: 'Blog'             as PostType, img: ASSETS.blogCover,    time: '5:30pm',  body: "Discover how our new component library streamlines design-to-development handoff." },
  { id: 7, type: 'Email'            as PostType, img: ASSETS.emailPreview, time: '6:00pm',  body: "Subscribe to our weekly newsletter for the latest updates on our design system." },
];

function TypeIcon({ src }: { src: string }) {
  return <img src={src} alt="" aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0 }} />;
}

interface CalendarScreenProps {
  unscheduledCount?: number;
  onUnscheduled?: () => void;
}

export function CalendarScreen({ unscheduledCount = 3, onUnscheduled }: CalendarScreenProps) {
  return (
    <div style={{ fontFamily: font, background: 'white', minHeight: '100%', paddingBottom: 126 }}>

      {/* Header */}
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
        <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          <span style={{ fontFamily: font, fontSize: 18, fontWeight: 400, lineHeight: 1.4, color: 'var(--ios-dark-90)' }}>September</span>
          <div style={{ paddingTop: 3 }}>
            <img src={chevronDownIcon} alt="" aria-hidden="true" style={{ width: 14, height: 14 }} />
          </div>
        </button>

        {/* Right group: unscheduled badge + Today/filter pill, 8px apart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {unscheduledCount > 0 && <button
            type="button"
            onClick={onUnscheduled}
            style={{
              position: 'relative',
              padding: 6,
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'var(--ios-glass-blur)',
              WebkitBackdropFilter: 'var(--ios-glass-blur)',
              borderRadius: 99,
              boxShadow: '0 0 32px rgba(0,0,0,0.08)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={calendarTrashIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
            </div>
            <div style={{
              position: 'absolute',
              top: -4, right: -4,
              width: 16, height: 16,
              borderRadius: 99,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <span style={{ fontFamily: font, fontSize: 10, fontWeight: 500, color: 'white', lineHeight: 1 }}>{unscheduledCount}</span>
            </div>
          </button>}

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
            <img src={filterIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
          </div>
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
              <div style={{ width: 4, height: 4, borderRadius: 99, background: hasDot ? 'rgba(0,0,0,0.3)' : 'transparent' }} />
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--ios-dark-4)', margin: '4px 0 0' }} />

      {/* Calendar rows */}
      {CAL_POSTS.map((post, i) => (
        <div
          key={post.id}
          style={{
            display: 'flex', gap: 16, alignItems: 'flex-start',
            padding: '15px 20px',
            borderBottom: i < CAL_POSTS.length - 1 ? '1px solid var(--ios-dark-4)' : 'none',
            minHeight: 173, boxSizing: 'border-box',
          }}
        >
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', alignSelf: 'center' }}>
            <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', letterSpacing: '0.12px', lineHeight: 1.4, textAlign: 'right' }}>
              {post.time}
            </span>
            <div style={{ width: 120, height: 120, borderRadius: 8.5, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', paddingTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <TypeIcon src={TYPE_ICONS[post.type]} />
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
