import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import Images from '@/icons/20/Images';
import VideoOn from '@/icons/20/VideoOn';
import Carousel from '@/icons/20/Carousel';
import Play3 from '@/icons/20/Play3';
import MediaStrip from '@/icons/20/MediaStrip';
import Trash2 from '@/icons/20/Trash2';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import Edit1 from '@/icons/20/Edit1';
import Plus from '@/icons/20/Plus';
import Stars from '@/icons/20/Stars';
import ChevronDown from '@/icons/20/ChevronDown';
import Check2 from '@/icons/20/Check2';
import type { Icon } from '@/icons/Types';
import { AI_CREATIVE, type AiCreative } from './ai-creative';
import type { CreativeFormat } from './competitor-creative';

/** The five ad content types the AI dropdown surfaces — mirrors organic-campaign's
 *  ContentTypeDropdown minus Blog/Email, which don't apply to Meta ads. */
type AdContentType = 'still' | 'carousel' | 'video' | 'short-video' | 'story';

const AD_CONTENT_TYPES: Record<AdContentType, { Icon: Icon; color: string; label: string }> = {
  still: { Icon: Images, color: '#bc010b', label: 'Still image' },
  carousel: { Icon: Carousel, color: '#ed7c2c', label: 'Carousel Post' },
  video: { Icon: VideoOn, color: '#7c5cfc', label: 'Feed Video Post' },
  'short-video': { Icon: Play3, color: '#0179cf', label: 'Short-form Video' },
  story: { Icon: MediaStrip, color: '#e65cac', label: 'Story' },
};

const AD_CONTENT_TYPE_ORDER: AdContentType[] = [
  'still',
  'carousel',
  'video',
  'short-video',
  'story',
];

/** Pool concepts carry a coarser CreativeFormat — map it onto the richer ad
 *  content-type the dropdown exposes. */
function defaultContentType(fmt: CreativeFormat): AdContentType {
  if (fmt === 'Static') return 'still';
  if (fmt === 'Carousel') return 'carousel';
  // Reel and UGC both default to short-form vertical video.
  return 'short-video';
}

const DEFAULT_AUTO_INIT = 3;

interface AiGeneratedListProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  /** How many concepts to seed when the user first opens this tab empty. */
  autoInitCount?: number;
}

/**
 * AI ad-concept list. Mirrors the editable row pattern from the organic-campaign
 * Step 5 PostCard: square reference image, topic + concept text on the right,
 * regenerate + trash actions, and a format chip with the predicted-CTR signal.
 *
 * On first mount with no AI ids selected, seeds the list with `autoInitCount`
 * concepts so the user lands on a populated, editable state. Regenerate swaps
 * a row's concept with the next unused one from the pool; trash removes the row.
 */
export function AiGeneratedList({
  selectedIds,
  onToggle,
  autoInitCount = DEFAULT_AUTO_INIT,
}: AiGeneratedListProps) {
  const autoInittedRef = useRef(false);

  // Auto-seed the list on first mount if the user hasn't picked any AI yet.
  useEffect(() => {
    if (autoInittedRef.current) return;
    autoInittedRef.current = true;
    const aiPicked = AI_CREATIVE.filter((a) => selectedIds.has(a.id));
    if (aiPicked.length > 0) return;
    AI_CREATIVE.slice(0, autoInitCount).forEach((a) => onToggle(a.id));
  }, [selectedIds, onToggle, autoInitCount]);

  const rows = AI_CREATIVE.filter((a) => selectedIds.has(a.id));
  const unusedCount = AI_CREATIVE.length - rows.length;

  const handleRegenerate = (id: string) => {
    const next = AI_CREATIVE.find((a) => !selectedIds.has(a.id));
    if (!next) return; // pool exhausted — could swap-by-shuffle, but keep it honest
    onToggle(id);
    onToggle(next.id);
  };

  const handleAddMore = () => {
    const next = AI_CREATIVE.find((a) => !selectedIds.has(a.id));
    if (!next) return;
    onToggle(next.id);
  };

  if (rows.length === 0) {
    return (
      <EmptyState onGenerate={handleAddMore} />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((c) => (
        <AiRow
          key={c.id}
          creative={c}
          onRegenerate={() => handleRegenerate(c.id)}
          onDelete={() => onToggle(c.id)}
        />
      ))}

      <div style={{ marginTop: 4, display: 'flex' }}>
        <Button
          variant="secondary"
          size="md"
          frontIcon={Plus}
          onPress={handleAddMore}
          isDisabled={unusedCount === 0}
        >
          {unusedCount === 0 ? 'No more concepts' : 'Generate another concept'}
        </Button>
      </div>
    </div>
  );
}

// ─── ROW ────────────────────────────────────────────────────────────────

function AiRow({
  creative,
  onRegenerate,
  onDelete,
}: {
  creative: AiCreative;
  onRegenerate: () => void;
  onDelete: () => void;
}) {
  // Local format override — lets the user reframe the same concept as a
  // different content type without losing the concept's hook/copy.
  const [contentType, setContentType] = useState<AdContentType>(
    defaultContentType(creative.format),
  );
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
      {/* LEFT: 122x122 reference image with overlay */}
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
          src={creative.adapted.image}
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
            fontSize: 10,
            letterSpacing: '0.2px',
          }}
        >
          <span>Reference image</span>
          <Edit1 size={12} color="var(--light-100)" />
        </div>
      </div>

      {/* RIGHT: concept block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top: "Concept" label + regenerate + trash */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
            minHeight: 28,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Stars size={12} color="var(--purple)" />
            <span style={{ fontSize: 12, letterSpacing: '0.24px', color: 'var(--dark-60)' }}>
              Concept
            </span>
          </span>
          <div style={{ display: 'inline-flex', gap: 2 }}>
            <PlainIconButton onPress={onRegenerate} ariaLabel="Regenerate concept">
              <ArrowRefresh size={16} color="currentColor" />
            </PlainIconButton>
            <PlainIconButton onPress={onDelete} ariaLabel="Remove concept">
              <Trash2 size={16} color="currentColor" />
            </PlainIconButton>
          </div>
        </div>

        <Heading level={5} style={{ fontSize: 18, marginBottom: 6 }}>
          {creative.concept}
        </Heading>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>
          {creative.hook}
        </Text>

        {/* Controls row: format dropdown */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
            marginTop: 12,
          }}
        >
          <FormatDropdown value={contentType} onChange={setContentType} />
        </div>
      </div>
    </div>
  );
}

// ─── FORMAT DROPDOWN ────────────────────────────────────────────────────

function FormatDropdown({
  value,
  onChange,
}: {
  value: AdContentType;
  onChange: (next: AdContentType) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = AD_CONTENT_TYPES[value];
  const MetaIcon = meta.Icon;

  // Close on outside click — defer one tick so the opening click isn't caught.
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

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
          fontSize: 13,
          letterSpacing: '0.26px',
          color: 'var(--dark-90)',
          minHeight: 32,
        }}
      >
        <MetaIcon size={16} color={meta.color} />
        <span>{meta.label}</span>
        <ChevronDown size={14} color="var(--dark-60)" />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.10)',
            padding: 6,
            zIndex: 10,
            minWidth: 210,
          }}
        >
          {AD_CONTENT_TYPE_ORDER.map((key) => {
            const item = AD_CONTENT_TYPES[key];
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
                  fontSize: 13,
                  letterSpacing: '0.26px',
                  color: 'var(--dark-90)',
                  textAlign: 'left',
                }}
              >
                <ItemIcon size={16} color={item.color} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {selected && <Check2 size={14} color="var(--dark-90)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── EMPTY STATE ────────────────────────────────────────────────────────

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '36px 16px',
        border: '1px dashed var(--dark-15)',
        borderRadius: 12,
        textAlign: 'center',
      }}
    >
      <Stars size={20} color="var(--purple)" />
      <div>
        <Text style={{ color: 'var(--dark-90)', fontSize: 14, fontWeight: 500 }}>
          Generate your first concept
        </Text>
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
          Blaze drafts an ad concept from your topic, brand kit, and channel signals.
        </Text>
      </div>
      <Button variant="primary" size="md" frontIcon={Stars} onPress={onGenerate}>
        Generate concept
      </Button>
    </div>
  );
}

// ─── BUTTON HELPER ──────────────────────────────────────────────────────

function PlainIconButton({
  onPress,
  ariaLabel,
  children,
}: {
  onPress: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...iconBtn,
        background: hover ? 'var(--dark-4)' : 'transparent',
      }}
    >
      {children}
    </button>
  );
}

const iconBtn: CSSProperties = {
  width: 28,
  height: 28,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  color: 'var(--dark-60)',
  padding: 0,
};
