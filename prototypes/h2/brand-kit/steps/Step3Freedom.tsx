import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import ArrowRight from '@/icons/20/ArrowRight';
import Check2 from '@/icons/20/Check2';
import Stars from '@/icons/20/Stars';
// Layers01 isn't shipped; Layers1 is the closest match (single-tile layers glyph).
import Layers1 from '@/icons/20/Layers1';
import Lock3 from '@/icons/20/Lock3';
import { useToast } from '@/staging';
import { useBrandKit } from '../brand-kit-context';
import { useDevState } from '../../dev-state-context';
import { FREEDOMS, type FreedomOption } from '../brand-kit-data';

/**
 * Step 3 — Photo freedom. The user picks how much creative latitude Blaze
 * has when transforming their photos. Two-column layout: option cards on
 * the left, a generated-image preview on the right with the original photo
 * inset over the bottom-left corner.
 *
 * On Continue: mark the brand kit as done, fire a confirmation toast, and
 * navigate back to /h2 so the Home cold-state Brand Kit row reflects the
 * completed state.
 */
export function Step3Freedom() {
  const { freedom, setFreedom, back, finish } = useBrandKit();
  const { showToast } = useToast();
  const { setState: setDevState } = useDevState();
  const navigate = useNavigate();

  const handleContinue = () => {
    finish();
    // Flip /h2/brand-kit to steady so a future visit (sidebar, Home row)
    // lands on the populated content surface, not the setup takeover.
    setDevState('/h2/brand-kit', 'steady');
    showToast({
      message: 'Brand kit finalized — logo, colors, voice locked in.',
    });
    navigate('/h2');
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        minHeight: 'calc(100vh - 3px)',
        paddingBottom: 100,
      }}
    >
      {/* section: left — title + option cards */}
      <div style={{ padding: '64px 48px 0', maxWidth: 600 }}>
        <Heading
          level={1}
          style={{ margin: 0, fontSize: 32, lineHeight: 1.2, letterSpacing: '-0.01em' }}
        >
          When Blaze uses your photos, how far can it go?
        </Heading>
        <Text
          variant="secondary"
          color="var(--dark-60)"
          style={{ display: 'block', marginTop: 12, lineHeight: 1.5 }}
        >
          Blaze generates a new image matching the topic of the post. Choose how
          much it can change from the original.
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
          {FREEDOMS.map((option) => (
            <FreedomCard
              key={option.id}
              option={option}
              selected={freedom === option.id}
              onSelect={() => setFreedom(option.id)}
            />
          ))}
        </div>
      </div>

      {/* section: right — preview + original-image inset */}
      <div
        style={{
          background: 'var(--dark-4)',
          padding: 40,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 520,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=85"
            alt="Generated image preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 14,
              boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
              display: 'block',
            }}
          />
          <OriginalImageInset />
        </div>
      </div>

      {/* section: sticky footer — back + continue */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 84,
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          zIndex: 4,
        }}
      >
        <button
          type="button"
          onClick={back}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 4px',
            color: 'var(--dark-60)',
            fontFamily: "'Sohne', sans-serif",
            fontSize: 14,
            letterSpacing: '0.28px',
            fontWeight: 400,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--dark-90)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--dark-60)';
          }}
        >
          Back
        </button>
        <Button variant="primary" size="lg" endIcon={ArrowRight} onPress={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

interface FreedomCardProps {
  option: FreedomOption;
  selected: boolean;
  onSelect: () => void;
}

function FreedomCard({ option, selected, onSelect }: FreedomCardProps) {
  const baseStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '40px minmax(0, 1fr) 22px',
    alignItems: 'flex-start',
    gap: 16,
    padding: '18px 20px',
    borderRadius: 12,
    background: 'var(--light-100)',
    border: selected ? '1.5px solid var(--dark-90)' : '1px solid var(--dark-8)',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
    boxShadow: selected ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={baseStyle}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: option.iconTint,
          color: option.iconColor,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FreedomIcon iconKey={option.iconKey} color={option.iconColor} />
      </div>

      <div style={{ minWidth: 0 }}>
        <Heading
          level={5}
          style={{ margin: 0, lineHeight: 1.25 }}
        >
          {option.name}
        </Heading>
        <Text
          variant="secondary"
          color="var(--dark-60)"
          style={{ display: 'block', marginTop: 4, lineHeight: 1.45 }}
        >
          {option.description}
        </Text>
      </div>

      <RadioCircle selected={selected} />
    </button>
  );
}

function RadioCircle({ selected }: { selected: boolean }): ReactNode {
  return (
    <div
      aria-hidden
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: selected ? 'var(--dark-90)' : 'transparent',
        border: selected ? '1.5px solid var(--dark-90)' : '1.5px solid var(--dark-15)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2,
        transition: 'background-color 160ms ease, border-color 160ms ease',
      }}
    >
      {selected && <Check2 size={14} color="var(--light-100)" />}
    </div>
  );
}

function FreedomIcon({
  iconKey,
  color,
}: {
  iconKey: FreedomOption['iconKey'];
  color: string;
}): ReactNode {
  if (iconKey === 'sparkle') return <Stars size={20} color={color} />;
  if (iconKey === 'layers') return <Layers1 size={20} color={color} />;
  if (iconKey === 'lock') return <Lock3 size={20} color={color} />;
  // No Diamond/Rhombus icon exists in @/icons/20; fall back to a 14px rotated
  // square outline tinted with the option's icon color.
  return (
    <span
      aria-hidden
      style={{
        width: 14,
        height: 14,
        border: `1.5px solid ${color}`,
        transform: 'rotate(45deg)',
        borderRadius: 2,
        display: 'inline-block',
      }}
    />
  );
}

function OriginalImageInset() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        width: '32%',
        minWidth: 160,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        padding: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--dark-4)',
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=85"
          alt="Original photo uploaded by the user"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
      <Text
        variant="secondary"
        color="var(--dark-60)"
        style={{
          display: 'block',
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        Original Image
      </Text>
    </div>
  );
}
