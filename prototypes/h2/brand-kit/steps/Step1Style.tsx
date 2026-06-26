import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import ArrowRight from '@/icons/20/ArrowRight';
import Check2 from '@/icons/20/Check2';
import Palette from '@/icons/20/Palette';
import Stars from '@/icons/20/Stars';
import Sun1 from '@/icons/20/Sun1';
import type { ComponentType, ReactNode } from 'react';
import type { IconProps } from '@/icons/Types';
import { useBrandKit } from '../brand-kit-context';
import { STYLES, type StyleOption } from '../brand-kit-data';

/**
 * Step 1 of the Brand Kit flow — pick a visual style. Two-column split:
 * a list of style cards (Recommended + All Styles sections) on the left,
 * a static before/after preview rendered with the selected style's CSS
 * filter on the right. Sticky footer drives the flow forward.
 */
export function Step1Style() {
  const navigate = useNavigate();
  const { style, setStyle, next } = useBrandKit();
  const selected = STYLES.find((s) => s.id === style) ?? STYLES[0];

  const recommended = STYLES.filter((s) => s.recommended);
  const others = STYLES.filter((s) => !s.recommended);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        minHeight: 'calc(100vh - 3px)',
        paddingBottom: 100,
      }}
    >
      {/* section: left column — copy + style picker */}
      <div style={{ padding: '64px 48px 0', maxWidth: 600 }}>
        <Heading
          level={1}
          style={{
            fontSize: 32,
            letterSpacing: '-0.4px',
            margin: 0,
          }}
        >
          Choose a visual style for your content
        </Heading>
        <Text
          variant="secondary"
          color="var(--dark-60)"
          style={{ display: 'block', marginTop: 12, lineHeight: 1.5 }}
        >
          Blaze applies a consistent photo treatment — lighting, color, and
          texture — across everything it creates. You can change this at
          anytime.
        </Text>

        <div style={{ marginTop: 32 }}>
          <SectionLabel>Recommended for your brand</SectionLabel>
          <CardList items={recommended} selectedId={style} onSelect={setStyle} />
        </div>

        <div style={{ marginTop: 32 }}>
          <SectionLabel>All Styles</SectionLabel>
          <CardList items={others} selectedId={style} onSelect={setStyle} />
        </div>
      </div>

      {/* section: right column — before/after preview */}
      <PreviewPane style={selected} />

      {/* section: sticky footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 4,
        }}
      >
        <BackButton onPress={() => navigate('/h2')} />
        <Button
          variant="primary"
          size="lg"
          endIcon={ArrowRight}
          onPress={() => next()}
        >
          Continue with {selected.name}
        </Button>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  // Sentence-case eyebrow — H2 rules forbid all-caps.
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--dark-90)',
        marginBottom: 12,
        letterSpacing: '0.1px',
      }}
    >
      {children}
    </div>
  );
}

function CardList({
  items,
  selectedId,
  onSelect,
}: {
  items: StyleOption[];
  selectedId: string;
  onSelect: (id: StyleOption['id']) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item) => (
        <StyleCard
          key={item.id}
          option={item}
          selected={item.id === selectedId}
          onSelect={() => onSelect(item.id)}
        />
      ))}
    </div>
  );
}

function StyleCard({
  option,
  selected,
  onSelect,
}: {
  option: StyleOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        width: '100%',
        textAlign: 'left',
        background: 'var(--light-100)',
        border: selected
          ? '1.5px solid var(--dark-90)'
          : '1px solid var(--dark-8)',
        borderRadius: 12,
        // Compensate the 0.5px border-width delta so cards don't visibly shift
        // by half a pixel when selected.
        padding: selected ? '17.5px 19.5px' : '18px 20px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 120ms ease',
      }}
    >
      <img
        src={option.thumbnail}
        alt=""
        style={{
          width: 64,
          height: 64,
          borderRadius: 10,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0, paddingRight: 32 }}>
        <Heading level={5} style={{ margin: 0 }}>
          {option.name}
        </Heading>
        <Text
          variant="secondary"
          color="var(--dark-60)"
          lineClamp={2}
          style={{ display: 'block', marginTop: 4, lineHeight: 1.45 }}
        >
          {option.description}
        </Text>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 12,
          }}
        >
          <MetaPill kind="lighting" value={option.pills.lighting} />
          <MetaPill kind="color" value={option.pills.color} />
          <MetaPill kind="contrast" value={option.pills.contrast} />
        </div>
      </div>

      <RadioDot selected={selected} />
    </button>
  );
}

const PILL_ICON: Record<'lighting' | 'color' | 'contrast', ComponentType<IconProps>> = {
  lighting: Sun1,
  color: Palette,
  // Closest available neighbor for "contrast" — sparkle reads as an
  // adjustment glyph and keeps the row visually balanced. The actual
  // mood/contrast info is conveyed by the pill's value text.
  contrast: Stars,
};

function MetaPill({
  kind,
  value,
}: {
  kind: 'lighting' | 'color' | 'contrast';
  value: string;
}) {
  const Icon = PILL_ICON[kind];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        border: '1px solid var(--dark-8)',
        borderRadius: 999,
        fontSize: 12,
        color: 'var(--dark-90)',
        lineHeight: 1.2,
        background: 'var(--light-100)',
      }}
    >
      <Icon size={12} color="var(--dark-60)" />
      {value}
    </span>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 18,
        right: 18,
        width: 22,
        height: 22,
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: selected ? 'var(--dark-90)' : 'transparent',
        border: selected ? '1.5px solid var(--dark-90)' : '1.5px solid var(--dark-15)',
        flexShrink: 0,
      }}
    >
      {selected && <Check2 size={14} color="var(--light-100)" />}
    </span>
  );
}

function PreviewPane({ style }: { style: StyleOption }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 3,
        width: '100%',
        height: 'calc(100vh - 3px)',
        overflow: 'hidden',
        background: 'var(--dark-4)',
      }}
    >
      {/* Base "before" image fills the whole pane. */}
      <img
        src={style.previewImage}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      {/* "After" image stacked on top, clipped to the right half so the
          left half stays raw. The filter is what the selected style applies. */}
      <img
        src={style.previewImage}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          clipPath: 'inset(0 0 0 50%)',
          filter: style.afterFilter,
          transition: 'filter 240ms ease',
        }}
      />

      {/* Center divider line + circular compare handle (purely decorative). */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: 2,
          background: 'var(--light-100)',
          transform: 'translateX(-1px)',
          opacity: 0.85,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 36,
          height: 36,
          borderRadius: 999,
          background: 'var(--light-100)',
          color: 'var(--dark-90)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 500,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.18)',
          pointerEvents: 'none',
        }}
      >
        <span style={{ letterSpacing: '-2px' }}>{'<>'}</span>
      </div>

      {/* Top-left "Before" pill. */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.65)',
          color: 'var(--light-100)',
          fontSize: 12,
          fontWeight: 500,
          borderRadius: 999,
          backdropFilter: 'blur(4px)',
        }}
      >
        Before
      </div>

      {/* Top-right pill cluster — style name + After. */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'var(--light-100)',
            color: 'var(--dark-90)',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 999,
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          <Stars size={12} color="var(--purple)" />
          {style.name}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'var(--light-100)',
            color: 'var(--dark-90)',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 999,
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          After
        </span>
      </div>
    </div>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 14px',
        background: 'transparent',
        border: 'none',
        borderRadius: 8,
        color: 'var(--dark-90)',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--dark-4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      Back
    </button>
  );
}
