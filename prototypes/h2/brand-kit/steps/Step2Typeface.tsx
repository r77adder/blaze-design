import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import { useToast } from '@/staging';
import ArrowRight from '@/icons/20/ArrowRight';
import ArrowRotateLeft2 from '@/icons/20/ArrowRotateLeft2';
import Check2 from '@/icons/20/Check2';
import Heart from '@/icons/20/Heart';
import Comment from '@/icons/20/Comment';
import Send1 from '@/icons/20/Send1';
import Save2 from '@/icons/20/Save2';
import { useBrandKit } from '../brand-kit-context';
import { TYPEFACES, type TypefaceOption } from '../brand-kit-data';

/**
 * Brand Kit Step 2 — typeface picker.
 *
 * Left column: stacked cards rendering each typeface's display name IN that
 * typeface. Right column: an Instagram-post mockup that updates live to use
 * the selected typeface inside a yellow callout pill over the photo.
 *
 * The three candidate typefaces are loaded from Google Fonts on mount via a
 * single `<link>` injected into <head>, guarded by a `data-brand-kit-fonts`
 * marker so we don't double-inject on re-mount.
 */
export function Step2Typeface() {
  const { typeface, setTypeface, next, back, step } = useBrandKit();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Inject Google Fonts stylesheet for all three typefaces, once per document.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.head.querySelector('link[data-brand-kit-fonts]')) return;
    const families = TYPEFACES.map((t) => `family=${t.googleFontsParam}`).join('&');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.setAttribute('data-brand-kit-fonts', 'true');
    document.head.appendChild(link);
  }, []);

  const selected = TYPEFACES.find((t) => t.id === typeface) ?? TYPEFACES[0];

  const handleBack = () => {
    if (step <= 1) {
      navigate('/h2');
    } else {
      back();
    }
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
      {/* section: left column — typeface picker */}
      <div style={{ padding: '64px 48px 0', maxWidth: 600 }}>
        <Heading level={1} style={{ fontSize: 32, marginBottom: 24 }}>
          Choose your typeface
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TYPEFACES.map((tf) => (
            <TypefaceCard
              key={tf.id}
              typeface={tf}
              selected={tf.id === typeface}
              onSelect={() => setTypeface(tf.id)}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Button
            variant="secondary"
            size="sm"
            onPress={() =>
              showToast({ message: 'Custom font upload is coming soon.' })
            }
          >
            Upload your own
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onPress={() =>
              showToast({ message: 'The full Google Fonts catalog opens here.' })
            }
          >
            Browse all fonts
          </Button>
        </div>
      </div>

      {/* section: right column — live Instagram preview */}
      <div
        style={{
          background: 'var(--dark-90)',
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <InstagramPreview typeface={selected} />
        <button
          type="button"
          onClick={() => showToast({ message: 'Preview refreshed.' })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: 'var(--light-60)',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 8,
            fontFamily: 'Sohne, sans-serif',
            fontSize: 13,
            letterSpacing: '0.26px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--light-100)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--light-60)';
          }}
        >
          <ArrowRotateLeft2 size={16} color="currentColor" />
          Refresh preview
        </button>
      </div>

      {/* section: sticky footer */}
      <StickyFooter onBack={handleBack} onContinue={next} />
    </div>
  );
}

// ── Typeface card ────────────────────────────────────────────────────────────

function TypefaceCard({
  typeface,
  selected,
  onSelect,
}: {
  typeface: TypefaceOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 120,
        padding: '16px 20px',
        background: 'var(--light-100)',
        border: selected ? '1.5px solid var(--dark-90)' : '1px solid var(--dark-8)',
        borderRadius: 14,
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'border-color 140ms ease',
      }}
    >
      <span
        style={{
          fontFamily: typeface.cssFamily,
          fontWeight: typeface.displayWeight,
          letterSpacing: typeface.letterSpacing,
          fontSize: 40,
          color: 'var(--dark-90)',
          lineHeight: 1.05,
        }}
      >
        {typeface.displayName}
      </span>
      <Text color="var(--dark-60)" style={{ fontSize: 13 }}>
        {typeface.supportingName}
      </Text>

      <RadioMark selected={selected} />
    </button>
  );
}

function RadioMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        width: 22,
        height: 22,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: selected ? 'var(--dark-90)' : 'transparent',
        border: selected ? 'none' : '1.5px solid var(--dark-15)',
      }}
    >
      {selected && <Check2 size={14} color="var(--light-100)" />}
    </span>
  );
}

// ── Instagram-post mockup ────────────────────────────────────────────────────

function InstagramPreview({ typeface }: { typeface: TypefaceOption }) {
  return (
    <div
      style={{
        width: 360,
        background: 'var(--light-100)',
        borderRadius: 18,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background:
              'conic-gradient(from 180deg, var(--brand), var(--purple), var(--brand))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, #fcd97a 0%, #f2a93b 50%, #b27ce8 100%)',
              border: '2px solid var(--light-100)',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <Text color="var(--dark-90)" style={{ fontSize: 13, fontWeight: 500 }}>
            radiant_health
          </Text>
          <Text color="var(--dark-60)" style={{ fontSize: 12 }}>
            Just now
          </Text>
        </div>
      </div>

      {/* Square photo with typeface overlay */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          backgroundImage:
            "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=720&q=85')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 16,
            right: 80,
            bottom: '28%',
            background: 'var(--brand)',
            padding: '10px 12px',
            borderRadius: 6,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
          }}
        >
          <span
            style={{
              fontFamily: typeface.cssFamily,
              fontWeight: typeface.displayWeight,
              letterSpacing: typeface.letterSpacing,
              fontSize: 18,
              lineHeight: 1.15,
              color: 'var(--dark-90)',
              display: 'block',
            }}
          >
            Get access to loyalty discounts and savings
          </span>
        </div>
      </div>

      {/* Pagination dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          padding: '8px 0 4px',
        }}
        aria-hidden
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: i === 0 ? 'var(--purple)' : 'var(--dark-15)',
            }}
          />
        ))}
      </div>

      {/* Action row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px 4px',
        }}
      >
        <div style={{ display: 'flex', gap: 14, color: 'var(--dark-90)' }}>
          <Heart size={22} color="currentColor" />
          <Comment size={22} color="currentColor" />
          <Send1 size={22} color="currentColor" />
        </div>
        <div style={{ color: 'var(--dark-90)' }}>
          <Save2 size={22} color="currentColor" />
        </div>
      </div>

      {/* Caption */}
      <div
        style={{
          padding: '4px 14px 14px',
          fontFamily: 'Sohne, sans-serif',
          fontSize: 13,
          lineHeight: 1.35,
          letterSpacing: '0.26px',
          color: 'var(--dark-90)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        <span style={{ fontWeight: 500 }}>radiant_health</span>
        {' '}
        Discover the joyful playtime moments at Houston Boxer Rescue where each
        wag of a tail bri
        <span style={{ color: 'var(--dark-60)' }}>...more</span>
      </div>
    </div>
  );
}

// ── Sticky footer ────────────────────────────────────────────────────────────

function StickyFooter({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 48px',
        background: 'var(--light-100)',
        borderTop: '1px solid var(--dark-8)',
        zIndex: 10,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: 8,
          color: 'var(--dark-60)',
          fontFamily: 'Sohne, sans-serif',
          fontSize: 14,
          letterSpacing: '0.28px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--dark-90)';
          e.currentTarget.style.background = 'var(--dark-4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--dark-60)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        Back
      </button>
      <Button variant="primary" size="md" endIcon={ArrowRight} onPress={onContinue}>
        Continue
      </Button>
    </div>
  );
}
