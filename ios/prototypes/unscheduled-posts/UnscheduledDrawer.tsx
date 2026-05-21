import { ASSETS } from './assets';
import stillImageIcon from '@ios/icons/content-type/still-image.svg';
import storyIcon      from '@ios/icons/content-type/story.svg';
import carouselIcon   from '@ios/icons/content-type/carousel.svg';

const font = 'var(--ios-font)';

type PostType = 'Still image' | 'Story' | 'Carousel';

const TYPE_ICONS: Record<PostType, string> = {
  'Still image': stillImageIcon,
  'Story':       storyIcon,
  'Carousel':    carouselIcon,
};

export type UnscheduledPost = { id: number; type: PostType; img: string; body: string };

export const INITIAL_UNSCHEDULED_POSTS: UnscheduledPost[] = [
  {
    id: 1,
    type: 'Still image',
    img: ASSETS.videoPreview,
    body: 'Get ready to take a trip down memory lane with our latest design system! The vibrant colors, bold typography, and playful illustrations will transport you.',
  },
  {
    id: 2,
    type: 'Story',
    img: ASSETS.videoPreview,
    body: 'Get ready to take a trip down memory lane with our latest design system! The vibrant colors, bold typography, and playful illustrations will transport you.',
  },
  {
    id: 3,
    type: 'Carousel',
    img: ASSETS.carouselImg,
    body: "Get ready to take a trip down memory lane with our latest design system! The vibrant colors, bold typography, and playful illustrations will transport you.",
  },
];

interface Props {
  posts: UnscheduledPost[];
  onClose: () => void;
  onSchedule: (id: number) => void;
}

function TypeIcon({ src }: { src: string }) {
  return <img src={src} alt="" aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0 }} />;
}

export function UnscheduledDrawer({ posts, onClose, onSchedule }: Props) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 40 }} />

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'white', borderRadius: '28px 28px 0 0',
        boxShadow: '0 -4px 60px rgba(0,0,0,0.18)',
        zIndex: 50, overflow: 'hidden',
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.18)', margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: font, fontSize: 18, fontWeight: 400, color: 'var(--ios-dark-90)' }}>
            Unscheduled ({posts.length})
          </span>
        </div>

        {/* Sections */}
        <div style={{ paddingBottom: 36 }}>
          {posts.map((post, i) => (
            <div
              key={post.id}
              style={{
                padding: '14px 20px',
                borderTop: i === 0 ? '1px solid var(--ios-dark-4)' : 'none',
                borderBottom: '1px solid var(--ios-dark-4)',
              }}
            >
              {/* Section header: type icon + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <TypeIcon src={TYPE_ICONS[post.type]} />
                <span style={{ fontFamily: font, fontSize: 13, color: 'var(--ios-dark-60)', letterSpacing: '0.13px' }}>
                  {post.type}
                </span>
              </div>

              {/* Card row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Thumbnail */}
                <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--ios-dark-4)', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Body text */}
                <p style={{
                  flex: 1, margin: 0,
                  fontFamily: font, fontSize: 14, lineHeight: 1.4,
                  color: 'var(--ios-dark-90)', letterSpacing: '0.14px',
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                }}>
                  {post.body}
                </p>

                {/* Schedule button */}
                <button
                  type="button"
                  onClick={() => onSchedule(post.id)}
                  style={{
                    flexShrink: 0,
                    padding: '8px 14px',
                    background: 'white',
                    border: '1px solid var(--ios-dark-8)',
                    borderRadius: 99,
                    cursor: 'pointer',
                    fontFamily: font, fontSize: 13, fontWeight: 500,
                    color: 'var(--ios-dark-90)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    alignSelf: 'center',
                  }}
                >
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
