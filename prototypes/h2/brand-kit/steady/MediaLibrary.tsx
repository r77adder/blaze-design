import { useState } from 'react';
import { Button, Heading, Text } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';
import Filter from '@/icons/20/Filter';
import SortVertical02 from '@/icons/20/SortVertical02';
import ChevronDown from '@/icons/20/ChevronDown';
import MoreDots from '@/icons/20/MoreDots';
import Edit1 from '@/icons/20/Edit1';

/**
 * Media Library tab — grid of brand image/video assets used to generate
 * social posts, blogs, and emails. Each card is a 1:1 thumbnail with a
 * caption line. Some have a "Used" pill in the corner, video items have a
 * duration pill, and a few show a 3-dot menu on hover.
 */

interface MediaItem {
  id: string;
  src: string;
  title: string;
  kind: 'image' | 'video';
  date: string;
  /** When set, the title is editable — shown with a pencil icon. */
  editable?: boolean;
  /** True if the asset has been used in a campaign. */
  used?: boolean;
  /** Video duration label, e.g. "0:15". */
  duration?: string;
  /** Show 3-dot menu icon top-right. */
  hasMenu?: boolean;
}

// Real CertaPro Austin project photos pulled from certapro.com/austin —
// these are the assets the Brand Kit imported from the website. Each item
// keeps a title that hints at what's in the photo so the Library reads as
// an actual asset catalog rather than a stock grid.
const ITEMS: MediaItem[] = [
  {
    id: '1',
    src: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/02/After-Pic.png',
    title: 'Lakeway exterior repaint · after',
    kind: 'image',
    date: 'Image · Jan 28, 2026',
    editable: true,
    used: true,
  },
  {
    id: '2',
    src: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg',
    title: 'Cabinet refinish · Tarrytown kitchen',
    kind: 'image',
    date: 'Image · Jan 28, 2026',
    hasMenu: true,
  },
  {
    id: '3',
    src: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2022/03/white-painted-brick-home-686x353.jpg',
    title: 'White brick exterior · Westlake',
    kind: 'image',
    date: 'Image · Jan 27, 2026',
    used: true,
  },
  {
    id: '4',
    src: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/AfterIMG_0384-scaled.jpeg',
    title: 'Interior refresh · Round Rock home',
    kind: 'image',
    date: 'Image · Jan 26, 2026',
  },
  {
    id: '5',
    src: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/power-washing-2.jpg',
    title: 'Power wash time-lapse',
    kind: 'video',
    date: 'Video · Jan 22, 2026',
    duration: '0:15',
    used: true,
  },
  {
    id: '6',
    src: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/color_consultation_certapro_preview-686x353.jpg',
    title: 'Color consultation swatches',
    kind: 'image',
    date: 'Image · Jan 20, 2026',
  },
  {
    id: '7',
    src: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2025/01/After-4-rotated.jpeg',
    title: 'Retail center exterior · commercial',
    kind: 'image',
    date: 'Image · Jan 18, 2026',
    hasMenu: true,
  },
  {
    id: '8',
    src: 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/deck-staining-1.jpg',
    title: 'Deck staining · Cedar Park',
    kind: 'video',
    date: 'Video · Jan 17, 2026',
    duration: '0:15',
  },
];

export function MediaLibrary() {
  const { showToast } = useToast();
  const fire = (msg: string) => () => showToast({ message: msg });

  return (
    <div>
      {/* section: title bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--dark-8)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <Heading level={2} style={{ margin: 0, fontSize: 22 }}>Media library</Heading>
          <Text variant="secondary" style={{ fontSize: 14, color: 'var(--dark-60)' }}>85 images, 12 videos</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SortDropdown onPress={fire('Sort coming soon')} />
          <Button variant="secondary" size="md" frontIcon={Filter} onPress={fire('Filter coming soon')}>
            Filter
          </Button>
        </div>
      </div>

      {/* section: add-media row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingTop: 20, paddingBottom: 24 }}>
        <div style={{ maxWidth: 640 }}>
          <Heading level={4} style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
            Add media to keep your content fresh
          </Heading>
          <Text variant="secondary" style={{ display: 'block', marginTop: 4, fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>
            Blaze uses your images and videos to create relevant social posts, blogs, and
            emails based on your{' '}
            <span style={{ textDecoration: 'underline', textDecorationColor: 'var(--dark-40)' }}>Campaigns</span>.
          </Text>
        </div>
        <Button variant="primary" size="md" frontIcon={Plus} onPress={fire('Add New Media coming soon')}>
          Add New Media
        </Button>
      </div>

      {/* section: media grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        {ITEMS.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const { showToast } = useToast();
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 10,
          overflow: 'hidden',
          background: 'var(--dark-4)',
        }}
      >
        <img
          src={item.src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {item.used && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              padding: '3px 8px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.7)',
              color: 'var(--light-100)',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Used
          </span>
        )}
        {item.duration && (
          <span
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              padding: '3px 8px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.7)',
              color: 'var(--light-100)',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {item.duration}
          </span>
        )}
        {(item.hasMenu || hovered) && (
          <button
            type="button"
            aria-label="Media actions"
            onClick={(e) => {
              e.stopPropagation();
              showToast({ message: 'Media menu coming soon' });
            }}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--dark-90)',
            }}
          >
            <MoreDots size={16} color="currentColor" />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
        <Text
          style={{
            fontSize: 14,
            color: 'var(--dark-90)',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
        >
          {item.title}
        </Text>
        {item.editable && (
          <button
            type="button"
            aria-label="Edit name"
            onClick={() => showToast({ message: 'Rename coming soon' })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--dark-60)',
              flexShrink: 0,
            }}
          >
            <Edit1 size={14} color="currentColor" />
          </button>
        )}
      </div>
      <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>
        {item.date}
      </Text>
    </div>
  );
}

function SortDropdown({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        cursor: 'pointer',
        color: 'var(--dark-90)',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'inherit',
      }}
    >
      <SortVertical02 size={16} color="var(--dark-60)" />
      Newest
      <ChevronDown size={16} color="var(--dark-60)" />
    </button>
  );
}
