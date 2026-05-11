import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Button, IconButton } from '@/components';
import { useToast } from '@/staging';
import ArrowLeft from '@/icons/16/ArrowLeft';
import Grid from '@/icons/20/Grid';
import MoreDots from '@/icons/20/MoreDots';
import Star20 from '@/icons/20/Star';
import Star14 from '@/icons/14/Star';
import Plus12 from '@/icons/12/Plus';
import Close12 from '@/icons/12/Close';
import Close from '@/icons/16/Close';
import Check from '@/icons/16/Check';
import EyeOpen from '@/icons/20/EyeOpen';
import ChevronRight from '@/icons/16/ChevronRight';
import ChevronDown from '@/icons/16/ChevronDown';
import Send1 from '@/icons/20/Send1';
import Caption from '@/icons/20/Caption';
import ImageIcon from '@/icons/20/Image';
import VolumeOn from '@/icons/20/VolumeOn';
import Camera from '@/icons/20/Camera';
import UserProfile from '@/icons/20/UserProfile';
import Instagram from '@/icons/16/Instagram';
import LinkedIn from '@/icons/16/LinkedIn';
import Twitter from '@/icons/16/Twitter';

/**
 * /h2/multi-change — deep port of Blaze H2 Features/multi-change-mockup.html.
 *
 * UNLIKE every other H2 deep-port page, this is a STANDALONE tool screen
 * with its own full-page chrome (topbar + left sidebar + center + right
 * sidebar). It does NOT render <H2Layout>; the H2 sidebar/topbar are
 * intentionally absent. The page acts like a drilled-into editor tool.
 *
 * Mental model:
 *  - Each post element (caption / design / audio) has its own queue of
 *    proposed versions. The "current" version is what's published.
 *  - The user picks an element via the post card OR the left-sidebar
 *    suggestions, generates new versions via the chat input or the
 *    add-type buttons, then selects which version to publish and approves.
 *
 * Local state keeps the queue per element + which one is selected.
 */

// ─── DATA ──────────────────────────────────────────────────────────────

type ElementId = 'caption' | 'image' | 'audio';

interface ElementState {
  versions: string[]; // index 0 is "current (published)"
  selected: number;
  open: boolean;
  addOpen: boolean;
}

const PURPLE = '#a229fe';
const PURPLE_TEXT = '#7b1fbe';
const GREEN = '#20a14f';

const SEED_CAPTION_VERSIONS = [
  'Discover the joyful playtime moments at Houston Boxer Rescue where each wag of a tail brings hope and happiness. These resilient boxers showcase their playful nature…',
  'These resilient dogs remind us that joy lives in small moments…',
  'Every tail wag tells a story of hope. Meet our rescued boxers.',
];

const SEED_IMAGE_VERSIONS = [
  'Breathe deeply, savor every moment (dark serif overlay)',
  'Brighter tone, lighter background, minimal text',
];

const ADD_TYPES: Record<ElementId, string[]> = {
  caption: ['Rewrite shorter', 'More emotional', 'Custom…'],
  image: ['Brighter palette', 'Different photo', 'Custom…'],
  audio: ['Upbeat', 'Calm', 'Custom…'],
};

const ELEMENT_META: Record<ElementId, { label: string; icon: typeof Caption }> = {
  caption: { label: 'Caption', icon: Caption },
  image: { label: 'Design', icon: ImageIcon },
  audio: { label: 'Audio', icon: VolumeOn },
};

// ─── ROUTE ─────────────────────────────────────────────────────────────

export function MultiChangeRoute() {
  const { showToast } = useToast();

  const [target, setTarget] = useState<ElementId | null>('caption');
  const [elements, setElements] = useState<Record<ElementId, ElementState>>({
    caption: { versions: SEED_CAPTION_VERSIONS, selected: 1, open: true, addOpen: false },
    image: { versions: SEED_IMAGE_VERSIONS, selected: 1, open: false, addOpen: false },
    audio: { versions: ['No current audio'], selected: 0, open: false, addOpen: false },
  });

  const totalPending = useMemo(
    () =>
      (elements.caption.versions.length - 1) +
      (elements.image.versions.length - 1) +
      Math.max(0, elements.audio.versions.length - 1),
    [elements],
  );

  // ── Actions ──
  const targetEl = (el: ElementId) => {
    setTarget(el);
    setElements((prev) => ({
      ...prev,
      [el]: { ...prev[el], open: true },
    }));
    showToast({ message: `Targeting ${ELEMENT_META[el].label} — type a change below` });
  };

  const clearTarget = () => setTarget(null);

  const toggleBlock = (el: ElementId) => {
    setElements((prev) => ({ ...prev, [el]: { ...prev[el], open: !prev[el].open } }));
  };

  const toggleAddBtns = (el: ElementId) => {
    setElements((prev) => ({ ...prev, [el]: { ...prev[el], addOpen: !prev[el].addOpen } }));
  };

  const selectVersion = (el: ElementId, idx: number) => {
    setElements((prev) => ({ ...prev, [el]: { ...prev[el], selected: idx } }));
  };

  const previewVersion = (el: ElementId, idx: number) => {
    selectVersion(el, idx);
    showToast({ message: `Previewing version ${idx}` });
  };

  const removeVersion = (el: ElementId, idx: number) => {
    setElements((prev) => {
      const versions = prev[el].versions.slice();
      versions.splice(idx, 1);
      const selected = Math.min(prev[el].selected, versions.length - 1);
      return { ...prev, [el]: { ...prev[el], versions, selected } };
    });
    showToast({ message: 'Version removed' });
  };

  const addFromType = (el: ElementId, type: string) => {
    if (type === 'Custom…') {
      targetEl(el);
      setElements((prev) => ({ ...prev, [el]: { ...prev[el], addOpen: false } }));
      return;
    }
    showToast({ message: `Generating "${type}" version for ${ELEMENT_META[el].label}…` });
    window.setTimeout(() => {
      setElements((prev) => {
        const versions = [...prev[el].versions, `[${type}] — New ${ELEMENT_META[el].label.toLowerCase()} generated by Blaze`];
        return { ...prev, [el]: { ...prev[el], versions, addOpen: false } };
      });
    }, 700);
  };

  const sendFromInput = () => {
    if (!target) {
      showToast({ message: 'Click an element on the post to target it first', variant: 'warning' });
      return;
    }
    showToast({ message: `Generating new ${ELEMENT_META[target].label.toLowerCase()} version…` });
    window.setTimeout(() => {
      setElements((prev) => ({
        ...prev,
        [target]: {
          ...prev[target],
          versions: [...prev[target].versions, 'New version generated from your prompt'],
        },
      }));
    }, 700);
  };

  const approve = () => {
    showToast({
      message: `Approved — publishing ${ELEMENT_META[target ?? 'caption'].label.toLowerCase()} v${elements[target ?? 'caption'].selected}`,
    });
  };

  const decline = () => {
    showToast({ message: "Marked as 'Don't post'" });
  };

  // ── Derived: caption preview text follows selected caption ──
  const previewCaption = elements.caption.versions[elements.caption.selected] ?? elements.caption.versions[0];

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#fafafa',
        color: 'var(--dark-90)',
        overflow: 'hidden',
        fontFamily: "'Sohne', sans-serif",
      }}
    >
      <Topbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar
          target={target}
          onTarget={targetEl}
          onClearTarget={clearTarget}
          onSend={sendFromInput}
        />

        <Center
          target={target}
          captionText={previewCaption}
          captionVersionCount={elements.caption.versions.length - 1}
          imageVersionCount={elements.image.versions.length - 1}
          onTarget={targetEl}
        />

        <RightSidebar
          elements={elements}
          totalPending={totalPending}
          onToggleBlock={toggleBlock}
          onToggleAddBtns={toggleAddBtns}
          onSelect={selectVersion}
          onPreview={previewVersion}
          onRemove={removeVersion}
          onAddFromType={addFromType}
          onApprove={approve}
          onDecline={decline}
          onSeeNext={(dir) => showToast({ message: dir === 'next' ? 'Next item' : 'Previous item' })}
        />
      </div>
    </div>
  );
}

// ─── TOPBAR ────────────────────────────────────────────────────────────

function Topbar() {
  return (
    <div
      style={{
        height: 60,
        background: 'var(--light-100)',
        borderBottom: '1px solid var(--dark-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        <IconButton variant="secondary" size="sm" icon={ArrowLeft} aria-label="Back" />
        <IconButton variant="secondary" size="sm" icon={Grid} aria-label="All posts" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--dark-80)' }}>
        <span>Our BBQ Journey: From Humble Beginnings to Culinary Innovation</span>
        <div
          style={{
            background: 'rgba(162,41,254,0.08)',
            border: '1px solid var(--dark-4)',
            borderRadius: 16,
            padding: '4px 10px',
            fontSize: 13,
            color: PURPLE,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          Review <ChevronDown />
        </div>
        <IconButton variant="ghost" size="sm" icon={MoreDots} aria-label="More" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 13,
            color: 'var(--dark-90)',
            padding: '6px 8px',
            borderRadius: 8,
          }}
        >
          <Star20 /> 1842 Credits
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#45164a' }} />
      </div>
    </div>
  );
}

// ─── LEFT SIDEBAR ──────────────────────────────────────────────────────

function LeftSidebar({
  target,
  onTarget,
  onClearTarget,
  onSend,
}: {
  target: ElementId | null;
  onTarget: (el: ElementId) => void;
  onClearTarget: () => void;
  onSend: () => void;
}) {
  return (
    <div
      style={{
        width: 300,
        background: '#f4f5f5',
        borderRight: '1px solid var(--dark-4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: 20,
        padding: 16,
        flexShrink: 0,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--dark-40)',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Suggestions
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <SuggestionPill icon={ImageIcon} label="Change design" onClick={() => onTarget('image')} />
          <SuggestionPill icon={Caption} label="Change caption" onClick={() => onTarget('caption')} />
          <SuggestionPill icon={VolumeOn} label="Change audio" onClick={() => onTarget('audio')} />
          <SuggestionPill icon={Grid} label="Change template" />
          <SuggestionPill icon={Caption} label="Revise prompt" />
        </div>
      </div>

      <ChatInput target={target} onClearTarget={onClearTarget} onSend={onSend} />
    </div>
  );
}

function SuggestionPill({ icon: Icon, label, onClick }: { icon: typeof Caption; label: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        padding: '7px 10px',
        fontSize: 13,
        color: 'var(--dark-80)',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <Icon />
      {label}
    </div>
  );
}

function ChatInput({
  target,
  onClearTarget,
  onSend,
}: {
  target: ElementId | null;
  onClearTarget: () => void;
  onSend: () => void;
}) {
  const placeholder =
    target === 'caption'
      ? 'Describe a new caption version…'
      : target === 'image'
      ? 'Describe a new design version…'
      : target === 'audio'
      ? 'Describe a new audio version…'
      : 'Ask Blaze to change something...';

  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {target && (
          <div
            style={{
              fontSize: 12,
              background: 'rgba(162,41,254,0.08)',
              color: PURPLE,
              borderRadius: 6,
              padding: '2px 7px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{ELEMENT_META[target].label}</span>
            <span onClick={onClearTarget} style={{ cursor: 'pointer', fontSize: 11, opacity: 0.6 }}>
              ✕
            </span>
          </div>
        )}
        <div style={{ fontSize: 13, color: 'var(--dark-40)', flex: 1 }}>{placeholder}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 13,
            color: 'var(--dark-60)',
            padding: '5px 7px',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          📎 Attach <ChevronDown />
        </div>
        <IconButton variant="primary" size="sm" icon={Send1} aria-label="Send" onPress={onSend} />
      </div>
    </div>
  );
}

// ─── CENTER ────────────────────────────────────────────────────────────

function Center({
  target,
  captionText,
  captionVersionCount,
  imageVersionCount,
  onTarget,
}: {
  target: ElementId | null;
  captionText: string;
  captionVersionCount: number;
  imageVersionCount: number;
  onTarget: (el: ElementId) => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 20px',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <ViewAsRail />

      <PostCard
        target={target}
        captionText={captionText}
        captionVersionCount={captionVersionCount}
        imageVersionCount={imageVersionCount}
        onTarget={onTarget}
      />
    </div>
  );
}

function ViewAsRail() {
  const [active, setActive] = useState<string>('Person');
  const buttons: { id: string; icon: typeof Camera; label: string }[] = [
    { id: 'Camera', icon: Camera, label: 'Instagram' },
    { id: 'Person', icon: UserProfile, label: 'Owner' },
    { id: 'Briefcase', icon: UserProfile, label: 'Pro' },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: 'calc(50% - 270px)',
        top: 260,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>View as</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {buttons.map((b) => {
          const isActive = active === b.id;
          return (
            <button
              key={b.id}
              type="button"
              aria-label={b.label}
              onClick={() => setActive(b.id)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 6,
                border: isActive ? '1.5px solid var(--dark-90)' : '1px solid var(--dark-8)',
                background: 'var(--light-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <b.icon />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PostCard({
  target,
  captionText,
  captionVersionCount,
  imageVersionCount,
  onTarget,
}: {
  target: ElementId | null;
  captionText: string;
  captionVersionCount: number;
  imageVersionCount: number;
  onTarget: (el: ElementId) => void;
}) {
  const captionTargeted = target === 'caption';
  const imageTargeted = target === 'image';

  return (
    <div
      style={{
        background: 'var(--light-100)',
        borderRadius: 14,
        border: '1px solid var(--dark-8)',
        boxShadow: '0 14px 56px rgba(0,0,0,0.1)',
        width: 400,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 8px' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#45164a',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--light-100)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          RH
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#101419' }}>Radiant Health</div>
          <div style={{ fontSize: 10, color: 'var(--dark-60)' }}>Jun 26 at 3:30 · 🌐</div>
        </div>
      </div>

      {/* Caption */}
      <div
        onClick={() => onTarget('caption')}
        title="Click to target this element"
        style={{
          padding: '4px 14px 8px',
          fontSize: 11,
          lineHeight: 1.5,
          color: '#101419',
          position: 'relative',
          cursor: 'pointer',
          borderRadius: 4,
          transition: 'background 0.15s',
          background: captionTargeted ? 'rgba(162,41,254,0.06)' : undefined,
          outline: captionTargeted ? '1.5px solid rgba(162,41,254,0.3)' : undefined,
        }}
      >
        {captionVersionCount > 0 && (
          <ElementBadge label={`${captionVersionCount} version${captionVersionCount > 1 ? 's' : ''}`} top={4} right={8} />
        )}
        <span>{captionText}</span>
        <span style={{ color: 'var(--dark-60)', fontSize: 11 }}> See more</span>
      </div>

      {/* Image */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
          background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 50%, #3a2a1a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600') center/cover",
            opacity: 0.55,
          }}
        />
        <div
          onClick={() => onTarget('image')}
          title="Click to target this element"
          style={{
            position: 'absolute',
            bottom: 30,
            left: 20,
            right: 20,
            color: 'var(--light-100)',
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.2,
            fontFamily: 'Georgia, serif',
            cursor: 'pointer',
            borderRadius: 4,
            padding: 4,
            background: imageTargeted ? 'rgba(162,41,254,0.2)' : undefined,
            outline: imageTargeted ? '1.5px solid rgba(162,41,254,0.5)' : undefined,
          }}
        >
          Breathe deeply,<br />
          savor every moment
        </div>
        {imageVersionCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: PURPLE,
              color: 'var(--light-100)',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 99,
              padding: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(162,41,254,0.3)',
              zIndex: 2,
            }}
          >
            <Star14 /> {imageVersionCount} version{imageVersionCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          borderTop: '1px solid var(--dark-8)',
          padding: '8px 30px',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--dark-60)' }}>👍 Like</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--dark-60)' }}>💬 Comment</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--dark-60)' }}>↗ Share</span>
      </div>
    </div>
  );
}

function ElementBadge({ label, top, right }: { label: string; top: number; right: number }) {
  return (
    <span
      style={{
        position: 'absolute',
        top,
        right,
        background: PURPLE,
        color: 'var(--light-100)',
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 99,
        padding: '1px 6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(162,41,254,0.3)',
        zIndex: 2,
      }}
    >
      <Star14 /> {label}
    </span>
  );
}

// ─── RIGHT SIDEBAR ─────────────────────────────────────────────────────

function RightSidebar({
  elements,
  totalPending,
  onToggleBlock,
  onToggleAddBtns,
  onSelect,
  onPreview,
  onRemove,
  onAddFromType,
  onApprove,
  onDecline,
  onSeeNext,
}: {
  elements: Record<ElementId, ElementState>;
  totalPending: number;
  onToggleBlock: (el: ElementId) => void;
  onToggleAddBtns: (el: ElementId) => void;
  onSelect: (el: ElementId, idx: number) => void;
  onPreview: (el: ElementId, idx: number) => void;
  onRemove: (el: ElementId, idx: number) => void;
  onAddFromType: (el: ElementId, type: string) => void;
  onApprove: () => void;
  onDecline: () => void;
  onSeeNext: (dir: 'prev' | 'next') => void;
}) {
  return (
    <div
      style={{
        width: 268,
        background: 'rgba(255,255,255,0.7)',
        borderLeft: '1px solid var(--dark-4)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px 0' }}>
        <button
          type="button"
          onClick={() => onSeeNext('prev')}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 13,
            color: 'var(--dark-90)',
            padding: '4px 6px',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← See Previous
        </button>
        <button
          type="button"
          onClick={() => onSeeNext('next')}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 13,
            color: 'var(--dark-90)',
            padding: '4px 6px',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          See Next →
        </button>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Action row */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={onApprove}
            style={{
              flex: 1,
              padding: 8,
              background: GREEN,
              border: '1px solid var(--dark-8)',
              borderRadius: 8,
              color: 'var(--light-100)',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Check /> Approve
          </button>
          <button
            type="button"
            onClick={onDecline}
            style={{
              flex: 1,
              padding: 8,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 8,
              color: 'var(--dark-90)',
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              fontFamily: 'inherit',
            }}
          >
            <Close /> Don't Post
          </button>
        </div>

        {/* About this post */}
        <div>
          <SectionLabel>About this post</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <InfoPill>🤖 AI Generated Image</InfoPill>
            <InfoPill>
              <Star14 /> 5 credits used
            </InfoPill>
          </div>
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                padding: '4px 9px',
                borderRadius: 6,
                border: '1px solid var(--dark-8)',
                background: 'var(--light-100)',
                fontSize: 11,
                color: 'var(--dark-60)',
                cursor: 'pointer',
              }}
            >
              Change how AI is used →
            </span>
          </div>
        </div>

        {/* Change queue */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: 'var(--dark-80)', fontWeight: 500 }}>Change queue</div>
            <div
              style={{
                background: 'rgba(162,41,254,0.1)',
                color: PURPLE,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 99,
                padding: '1px 7px',
              }}
            >
              {totalPending} pending
            </div>
          </div>

          <div
            style={{
              background: 'rgba(162,41,254,0.06)',
              border: '1px solid rgba(162,41,254,0.15)',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 11,
              color: PURPLE_TEXT,
              lineHeight: 1.5,
              marginBottom: 10,
            }}
          >
            <strong>New:</strong> Each element now has its own queue. Select a version, then Approve to publish.
          </div>

          {(['caption', 'image', 'audio'] as ElementId[]).map((el) => (
            <ChangeBlock
              key={el}
              el={el}
              state={elements[el]}
              onToggleBlock={() => onToggleBlock(el)}
              onToggleAddBtns={() => onToggleAddBtns(el)}
              onSelect={(idx) => onSelect(el, idx)}
              onPreview={(idx) => onPreview(el, idx)}
              onRemove={(idx) => onRemove(el, idx)}
              onAddFromType={(type) => onAddFromType(el, type)}
            />
          ))}
        </div>

        {/* Posting on */}
        <div>
          <SectionLabel>Posting on</SectionLabel>
          <div
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 8,
              padding: '7px 10px',
              fontSize: 13,
              color: 'var(--dark-90)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            Fri Sep 18, 11:15am PT
            <ChevronDown />
          </div>
        </div>

        {/* Crosspost */}
        <div>
          <SectionLabel>Crosspost</SectionLabel>
          <div style={{ display: 'flex', gap: 5 }}>
            <ChannelButton icon={Camera} on />
            <ChannelButton icon={Instagram} on />
            <ChannelButton icon={LinkedIn} connect />
            <ChannelButton icon={Twitter} connect />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: 'var(--dark-40)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function InfoPill({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
        borderRadius: 6,
        padding: '5px 8px',
        fontSize: 12,
        color: 'var(--dark-80)',
      }}
    >
      {children}
    </div>
  );
}

function ChannelButton({ icon: Icon, on, connect }: { icon: typeof Camera; on?: boolean; connect?: boolean }) {
  return (
    <div
      style={{
        width: 50,
        height: 50,
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        background: 'var(--light-100)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        cursor: 'pointer',
        opacity: connect ? 0.4 : 1,
      }}
    >
      <Icon />
      {connect ? (
        <div style={{ fontSize: 9, color: 'var(--dark-60)' }}>Connect</div>
      ) : (
        <div
          style={{
            width: 16,
            height: 10,
            borderRadius: 99,
            background: on ? 'var(--dark-90)' : 'var(--dark-15)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 1,
              top: 1,
              width: 8,
              height: 8,
              background: 'var(--light-100)',
              borderRadius: '50%',
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── CHANGE BLOCK ──────────────────────────────────────────────────────

function ChangeBlock({
  el,
  state,
  onToggleBlock,
  onToggleAddBtns,
  onSelect,
  onPreview,
  onRemove,
  onAddFromType,
}: {
  el: ElementId;
  state: ElementState;
  onToggleBlock: () => void;
  onToggleAddBtns: () => void;
  onSelect: (idx: number) => void;
  onPreview: (idx: number) => void;
  onRemove: (idx: number) => void;
  onAddFromType: (type: string) => void;
}) {
  const meta = ELEMENT_META[el];
  const Icon = meta.icon;
  const count = el === 'audio' ? Math.max(0, state.versions.length - 1) : state.versions.length - 1;

  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 6,
        background: 'var(--light-100)',
      }}
    >
      <div
        onClick={onToggleBlock}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon />
          <span style={{ fontSize: 13, color: 'var(--dark-80)' }}>{meta.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              background: count > 0 ? PURPLE : 'var(--dark-8)',
              color: count > 0 ? 'var(--light-100)' : 'var(--dark-40)',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 99,
              padding: '1px 6px',
              minWidth: 18,
              textAlign: 'center',
            }}
          >
            {count}
          </span>
          <span
            style={{
              fontSize: 10,
              color: 'var(--dark-40)',
              transform: state.open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              display: 'inline-flex',
            }}
          >
            <ChevronRight />
          </span>
        </div>
      </div>

      {state.open && (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--dark-4)' }}>
          {el === 'audio' && state.versions.length <= 1 ? (
            <div style={{ padding: '9px 12px' }}>
              <div style={{ fontSize: 12, color: 'var(--dark-40)', fontStyle: 'italic' }}>No changes queued</div>
            </div>
          ) : (
            state.versions.map((text, i) => (
              <QueueItem
                key={i}
                index={i}
                text={text}
                isCurrent={i === 0}
                isSelected={i === state.selected}
                onSelect={() => onSelect(i)}
                onPreview={i > 0 ? () => onPreview(i) : undefined}
                onRemove={i > 0 ? () => onRemove(i) : undefined}
              />
            ))
          )}

          <div
            onClick={onToggleAddBtns}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderTop: '1px dashed var(--dark-8)',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--dark-40)',
            }}
          >
            <Plus12 /> Add another {meta.label.toLowerCase()} version
          </div>

          {state.addOpen && (
            <div
              style={{
                display: 'flex',
                gap: 4,
                flexWrap: 'wrap',
                padding: '8px 12px 10px',
                borderTop: '1px solid var(--dark-4)',
              }}
            >
              {ADD_TYPES[el].map((type) => (
                <span
                  key={type}
                  onClick={() => onAddFromType(type)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: 6,
                    border: '1px solid var(--dark-8)',
                    background: 'var(--light-100)',
                    fontSize: 11,
                    color: 'var(--dark-60)',
                    cursor: 'pointer',
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QueueItem({
  index,
  text,
  isCurrent,
  isSelected,
  onSelect,
  onPreview,
  onRemove,
}: {
  index: number;
  text: string;
  isCurrent: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onPreview?: () => void;
  onRemove?: () => void;
}) {
  const trimmed = text.length > 55 ? text.slice(0, 55) + '…' : text;
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '9px 12px',
        borderBottom: '1px solid var(--dark-4)',
        position: 'relative',
        cursor: 'pointer',
        background: isSelected ? 'rgba(162,41,254,0.04)' : undefined,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          border: isSelected ? `1.5px solid ${PURPLE}` : '1.5px solid var(--dark-15)',
          borderRadius: '50%',
          flexShrink: 0,
          marginTop: 2,
          background: isSelected ? PURPLE : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected && (
          <div style={{ width: 5, height: 5, background: 'var(--light-100)', borderRadius: '50%' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            marginBottom: 2,
            color: isCurrent ? 'var(--dark-40)' : PURPLE,
            fontWeight: isCurrent ? 400 : 600,
          }}
        >
          {isCurrent ? 'Current (published)' : `Version ${index}${isSelected ? ' — selected' : ''}`}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--dark-80)',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {trimmed}
        </div>
      </div>
      {(onPreview || onRemove) && (
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexShrink: 0 }}>
          {onPreview && (
            <QActionBtn
              ariaLabel="Preview this version"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
            >
              <EyeOpen />
            </QActionBtn>
          )}
          {onRemove && (
            <QActionBtn
              danger
              ariaLabel="Remove version"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Close12 />
            </QActionBtn>
          )}
        </div>
      )}
    </div>
  );
}

function QActionBtn({
  children,
  onClick,
  ariaLabel,
  danger,
}: {
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        width: 22,
        height: 22,
        borderRadius: 5,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        cursor: 'pointer',
        color: danger ? 'var(--red-90)' : 'var(--dark-60)',
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}
