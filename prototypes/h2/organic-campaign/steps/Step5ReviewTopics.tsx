import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Button, Heading, Text } from '@/components';
import { useToast } from '@/staging';
import Images from '@/icons/20/Images';
import Carousel from '@/icons/20/Carousel';
import VideoOn from '@/icons/20/VideoOn';
import Play3 from '@/icons/20/Play3';
import MediaStrip from '@/icons/20/MediaStrip';
import Document from '@/icons/20/Document';
import Mail from '@/icons/20/Mail';
import ChevronDown from '@/icons/20/ChevronDown';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import Upload from '@/icons/20/Upload';
import Edit1 from '@/icons/20/Edit1';
import type { Icon } from '@/icons/Types';
import {
  useFirstCampaign,
  type FirstCampaignContentType,
  type FirstCampaignTopic,
} from '../first-campaign-context';

/**
 * Step 5 — Review your generated posts. Each post is a horizontal card with
 * a square reference image (or upload square for blank posts) on the left
 * and content-type / posting / schedule controls on the right. The user can
 * append more posts via a "+ Add post" dropdown (blank or AI-generated).
 */

// ---------- Content-type catalog --------------------------------------------

interface ContentTypeMeta {
  label: string;
  Icon: Icon;
  color: string;
}

const CONTENT_TYPES: Record<FirstCampaignContentType, ContentTypeMeta> = {
  still: { label: 'Still image posts', Icon: Images, color: '#bc010b' },
  carousel: { label: 'Carousels', Icon: Carousel, color: '#ed7c2c' },
  video: { label: 'Video feed posts', Icon: VideoOn, color: '#7c5cfc' },
  'short-video': { label: 'Short form videos', Icon: Play3, color: '#0179cf' },
  stories: { label: 'Stories', Icon: MediaStrip, color: '#e65cac' },
  blog: { label: 'Blog post', Icon: Document, color: '#04af00' },
  email: { label: 'Email', Icon: Mail, color: '#edb62c' },
};

const CONTENT_TYPE_ORDER: FirstCampaignContentType[] = [
  'still',
  'carousel',
  'video',
  'short-video',
  'stories',
  'blog',
  'email',
];

// ---------- AI seed pool for "AI Generated Post" ----------------------------

const AI_POOL: Array<{ topic: string; image: string; contentType: FirstCampaignContentType }> = [
  {
    topic: 'Brewing temperature matters',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=320&q=80',
    contentType: 'still',
  },
  {
    topic: 'Why we roast in small batches',
    image: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=320&q=80',
    contentType: 'carousel',
  },
  {
    topic: 'Meet our newest single-origin',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=320&q=80',
    contentType: 'video',
  },
  {
    topic: 'Coffee is bitter — here is why',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=320&q=80',
    contentType: 'short-video',
  },
  {
    topic: 'A morning ritual worth keeping',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=320&q=80',
    contentType: 'still',
  },
];

// ---------- Generic dropdown wrapper ----------------------------------------

interface DropdownProps {
  open: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
  position?: 'top' | 'bottom';
  minWidth?: number;
  children: ReactNode;
}

function Dropdown({
  open,
  onClose,
  align = 'left',
  position = 'bottom',
  minWidth = 200,
  children,
}: DropdownProps) {
  if (!open) return null;
  const vertical = position === 'bottom'
    ? { top: 'calc(100% + 6px)' }
    : { bottom: 'calc(100% + 6px)' };
  const horizontal = align === 'right' ? { right: 0 } : { left: 0 };
  return (
    <div
      onClick={(e) => {
        // Swallow clicks inside so the outside listener doesn't fire.
        e.stopPropagation();
      }}
      style={{
        position: 'absolute',
        ...vertical,
        ...horizontal,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
        boxShadow: '0 12px 32px rgba(0,0,0,0.10)',
        padding: 6,
        zIndex: 10,
        minWidth,
      }}
    >
      {children}
      <CloseOnOutside onClose={onClose} />
    </div>
  );
}

function CloseOnOutside({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onDocClick() {
      onClose();
    }
    // Defer one tick so the click that opened us doesn't immediately close it.
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', onDocClick);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [onClose]);
  return null;
}

// ---------- Content type dropdown -------------------------------------------

function ContentTypeDropdown({
  value,
  onChange,
}: {
  value: FirstCampaignContentType;
  onChange: (next: FirstCampaignContentType) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = CONTENT_TYPES[value];
  const MetaIcon = meta.Icon;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 8px 6px 10px',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 14,
          letterSpacing: '0.26px',
          color: 'var(--dark-90)',
          minHeight: 32,
        }}
      >
        <MetaIcon size={16} color={meta.color} />
        <span>{meta.label}</span>
        <ChevronDown size={14} color="var(--dark-60)" />
      </button>
      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        align="left"
        minWidth={210}
      >
        {CONTENT_TYPE_ORDER.map((key) => {
          const item = CONTENT_TYPES[key];
          const ItemIcon = item.Icon;
          const selected = key === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 10px',
                background: selected ? 'var(--dark-4)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                letterSpacing: '0.26px',
                color: 'var(--dark-90)',
                textAlign: 'left',
              }}
            >
              <ItemIcon size={16} color={item.color} />
              {item.label}
            </button>
          );
        })}
      </Dropdown>
    </div>
  );
}

// ---------- Small plain icon button (regenerate / trash) --------------------

function PlainIconButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hover ? 'var(--dark-4)' : 'transparent',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        color: 'var(--dark-60)',
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

// ---------- Generic "label + caret" mock dropdown button --------------------

function MockDropdownButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 8px 6px 10px',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 14,
        letterSpacing: '0.26px',
        color: 'var(--dark-90)',
        minHeight: 32,
      }}
    >
      <span>{label}</span>
      <ChevronDown size={14} color="var(--dark-60)" />
    </button>
  );
}

// ---------- Post card -------------------------------------------------------

function PostCard({
  post,
  onChange,
  onRegenerate,
  onDelete,
}: {
  post: FirstCampaignTopic;
  onChange: (next: FirstCampaignTopic) => void;
  onRegenerate: () => void;
  onDelete: () => void;
}) {
  const { showToast } = useToast();
  const isBlank = post.kind === 'blank';

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: 14,
        borderRadius: 12,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        alignItems: 'flex-start',
      }}
    >
      {/* LEFT: 122x122 thumbnail or upload square */}
      {isBlank ? (
        <button
          type="button"
          onClick={() => showToast({ message: 'Media upload coming soon' })}
          style={{
            width: 122,
            height: 122,
            flexShrink: 0,
            borderRadius: 10,
            border: '1px dashed var(--dark-15)',
            background: 'var(--dark-4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            color: 'var(--dark-60)',
            fontFamily: 'inherit',
            fontSize: 12,
            letterSpacing: '0.24px',
            padding: 0,
          }}
        >
          <Upload size={20} color="var(--dark-60)" />
          <span>Upload media</span>
        </button>
      ) : (
        <div
          style={{
            position: 'relative',
            width: 122,
            height: 122,
            borderRadius: 10,
            overflow: 'hidden',
            background: 'var(--dark-4)',
            flexShrink: 0,
          }}
        >
          <img
            src={post.referenceImage}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '14px 8px 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
              color: 'var(--light-100)',
              fontSize: 12,
              letterSpacing: '0.2px',
            }}
          >
            <span>Reference image</span>
            <Edit1 size={12} color="var(--light-100)" />
          </div>
        </div>
      )}

      {/* RIGHT: content block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top row: "Topic:" label + action icons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
            minHeight: 28,
          }}
        >
          <span
            style={{
              fontSize: 12,
              letterSpacing: '0.24px',
              color: 'var(--dark-60)',
            }}
          >
            {isBlank ? 'Caption' : 'Topic'}
          </span>
          <div style={{ display: 'inline-flex', gap: 2 }}>
            {!isBlank && (
              <PlainIconButton onClick={onRegenerate} ariaLabel="Regenerate topic">
                <ArrowRefresh size={16} color="currentColor" />
              </PlainIconButton>
            )}
            <PlainIconButton onClick={onDelete} ariaLabel="Delete post">
              <Trash2 size={16} color="currentColor" />
            </PlainIconButton>
          </div>
        </div>

        {/* Title row */}
        {isBlank ? (
          <input
            type="text"
            value={post.topic}
            onChange={(e) => onChange({ ...post, topic: e.target.value })}
            placeholder="Add a caption"
            style={{
              width: '100%',
              padding: '6px 0',
              marginBottom: 10,
              border: 'none',
              borderBottom: '1px solid var(--dark-8)',
              outline: 'none',
              background: 'transparent',
              fontFamily: "'Sohne', sans-serif",
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: '0.4px',
              color: 'var(--dark-90)',
            }}
          />
        ) : (
          <Heading level={5} style={{ fontSize: 20, marginBottom: 12 }}>
            {post.topic}
          </Heading>
        )}

        {/* Controls row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <ContentTypeDropdown
            value={post.contentType}
            onChange={(next) => onChange({ ...post, contentType: next })}
          />

          <Button
            variant="secondary"
            size="sm"
            frontIcon={Plus}
            onClick={() => showToast({ message: 'Context controls coming soon' })}
          >
            Add context
          </Button>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text variant="secondary" style={{ fontSize: 14 }}>
              Posting to
            </Text>
            <MockDropdownButton
              label="5 Accounts"
              onClick={() => showToast({ message: 'Account selector coming soon' })}
            />
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text variant="secondary" style={{ fontSize: 14 }}>
              on
            </Text>
            <MockDropdownButton
              label="Oct 7, 12:15pm"
              onClick={() => showToast({ message: 'Schedule picker coming soon' })}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------- Add post dropdown -----------------------------------------------

function AddPostButton({
  onAddBlank,
  onAddAi,
}: {
  onAddBlank: () => void;
  onAddAi: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
      <Button
        variant="secondary"
        size="md"
        frontIcon={Plus}
        onClick={() => setOpen((v) => !v)}
      >
        Add post
      </Button>
      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        align="left"
        position="bottom"
        minWidth={200}
      >
        <button
          type="button"
          onClick={() => {
            onAddBlank();
            setOpen(false);
          }}
          style={addItemStyle}
        >
          <Plus size={16} color="var(--dark-60)" />
          Blank post
        </button>
        <button
          type="button"
          onClick={() => {
            onAddAi();
            setOpen(false);
          }}
          style={addItemStyle}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{'✨'}</span>
          AI generated post
        </button>
      </Dropdown>
    </div>
  );
}

const addItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '8px 10px',
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 14,
  letterSpacing: '0.26px',
  color: 'var(--dark-90)',
  textAlign: 'left',
};

// ---------- Step 5 ----------------------------------------------------------

export function Step5ReviewTopics() {
  const { data, setData } = useFirstCampaign();
  // Local id counter for newly added posts so we don't collide with seed ids.
  const newIdSeq = useRef(0);

  const updatePost = (id: string, next: FirstCampaignTopic) => {
    setData((p) => ({
      ...p,
      topics: p.topics.map((t) => (t.id === id ? next : t)),
    }));
  };

  const deletePost = (id: string) => {
    setData((p) => ({ ...p, topics: p.topics.filter((t) => t.id !== id) }));
  };

  const regeneratePost = (id: string) => {
    const pick = AI_POOL[Math.floor(Math.random() * AI_POOL.length)];
    setData((p) => ({
      ...p,
      topics: p.topics.map((t) =>
        t.id === id
          ? { ...t, topic: pick.topic, referenceImage: pick.image }
          : t,
      ),
    }));
  };

  const addBlankPost = () => {
    newIdSeq.current += 1;
    const id = `new-blank-${Date.now()}-${newIdSeq.current}`;
    setData((p) => ({
      ...p,
      topics: [
        ...p.topics,
        {
          id,
          kind: 'blank',
          topic: '',
          contentType: 'still',
          referenceImage: '',
        },
      ],
    }));
  };

  const addAiPost = () => {
    newIdSeq.current += 1;
    const id = `new-ai-${Date.now()}-${newIdSeq.current}`;
    const pick = AI_POOL[Math.floor(Math.random() * AI_POOL.length)];
    setData((p) => ({
      ...p,
      topics: [
        ...p.topics,
        {
          id,
          kind: 'ai',
          topic: pick.topic,
          contentType: pick.contentType,
          referenceImage: pick.image,
        },
      ],
    }));
  };

  return (
    <div style={{ width: '100%', maxWidth: 880, margin: '24px auto 0' }}>
      <Heading level={2} style={{ marginBottom: 8, fontSize: 32 }}>
        Review your topics and their reference images.
      </Heading>
      <Text variant="secondary">
        You can think of these as what directs the main subject and target of the
        content Blaze generates.
      </Text>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 28,
        }}
      >
        {data.topics.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onChange={(next) => updatePost(post.id, next)}
            onRegenerate={() => regeneratePost(post.id)}
            onDelete={() => deletePost(post.id)}
          />
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex' }}>
        <AddPostButton onAddBlank={addBlankPost} onAddAi={addAiPost} />
      </div>
    </div>
  );
}
