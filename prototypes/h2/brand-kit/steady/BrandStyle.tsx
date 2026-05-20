import { useState, type ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import UploadsCloud from '@/icons/20/UploadsCloud';
import Edit1 from '@/icons/20/Edit1';
import Upload from '@/icons/20/Upload';
import ChevronDown from '@/icons/20/ChevronDown';

/**
 * Brand Style tab — Logo, Visual style, Fonts, Colors, and Visual identity
 * description. Each block is a Card-like surface with its own header,
 * action affordance (top-right), and body.
 */

export function BrandStyle() {
  return (
    <div>
      <SectionHeading title="Brand Style" />

      {/* section: logo + visual style (top row) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 24 }}>
        <LogoCard />
        <VisualStyleCard />
      </div>

      {/* section: fonts + colors (second row) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
        <FontsCard />
        <ColorsCard />
      </div>

      {/* section: visual identity description (full width) */}
      <div style={{ marginTop: 16 }}>
        <IdentityDescriptionCard />
      </div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--dark-8)' }}>
      <Heading level={2} style={{ margin: 0, fontSize: 22 }}>{title}</Heading>
    </div>
  );
}

interface PanelProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  bodyStyle?: React.CSSProperties;
}

function Panel({ title, action, children, bodyStyle }: PanelProps) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--dark-8)' }}>
        <Heading level={4} style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{title}</Heading>
        {action}
      </div>
      <div style={{ padding: 18, ...bodyStyle }}>{children}</div>
    </div>
  );
}

function LinkButton({ children, onPress, frontIcon: FrontIcon }: { children: ReactNode; onPress: () => void; frontIcon?: React.ComponentType<{ size?: number; color?: string }> }) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--dark-90)',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'inherit',
        padding: 0,
      }}
    >
      {FrontIcon && <FrontIcon size={14} color="currentColor" />}
      {children}
    </button>
  );
}

// ─── Logo ────────────────────────────────────────────────────────────

function LogoCard() {
  const { showToast } = useToast();
  return (
    <Panel
      title="Logo"
      action={<LinkButton onPress={() => showToast({ message: 'Add more logos coming soon' })} frontIcon={Plus}>Add More</LinkButton>}
    >
      <LogoTile />
    </Panel>
  );
}

function LogoTile() {
  const { showToast } = useToast();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 200,
        height: 140,
        borderRadius: 10,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontFamily: '"Times New Roman", "Times", serif',
          fontSize: 28,
          letterSpacing: '-0.3px',
          color: 'var(--dark-90)',
          fontStyle: 'italic',
        }}
      >
        LilyBee
      </span>

      {hovered && (
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'inline-flex', gap: 6 }}>
          <button
            type="button"
            aria-label="Delete logo"
            onClick={() => showToast({ message: 'Delete logo coming soon' })}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--dark-90)',
            }}
          >
            <Trash2 size={16} color="currentColor" />
          </button>
          <button
            type="button"
            onClick={() => showToast({ message: 'Replace logo coming soon' })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 28,
              padding: '0 10px',
              borderRadius: 8,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              cursor: 'pointer',
              color: 'var(--dark-90)',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            <UploadsCloud size={14} color="currentColor" />
            Replace
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Visual style ────────────────────────────────────────────────────

function VisualStyleCard() {
  const { showToast } = useToast();
  return (
    <Panel
      title="Visual style"
      action={<LinkButton onPress={() => showToast({ message: 'Change visual style coming soon' })} frontIcon={Edit1}>Change</LinkButton>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 16, alignItems: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 10,
            overflow: 'hidden',
            background: 'var(--dark-4)',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 80 }}>
          <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>Selected style</Text>
          <Text style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>Tunnel Vision</Text>
        </div>
      </div>
    </Panel>
  );
}

// ─── Fonts ───────────────────────────────────────────────────────────

function FontsCard() {
  const { showToast } = useToast();
  return (
    <Panel
      title="Fonts"
      action={<LinkButton onPress={() => showToast({ message: 'Upload font coming soon' })} frontIcon={Upload}>Upload</LinkButton>}
    >
      {/* Big preview block */}
      <div
        style={{
          position: 'relative',
          padding: '32px 16px',
          background: 'var(--dark-2)',
          borderRadius: 10,
          textAlign: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => showToast({ message: 'Change font coming soon' })}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            height: 26,
            padding: '0 10px',
            borderRadius: 6,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            cursor: 'pointer',
            color: 'var(--dark-90)',
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'inherit',
          }}
        >
          Change
        </button>
        <div
          style={{
            // Use a known web-safe serif as a stand-in for Bricolage Grotesque.
            // The display string is the font name itself; the prototype communicates the
            // selection visually without needing the actual licensed face loaded.
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--dark-90)',
            letterSpacing: '-0.4px',
          }}
        >
          Bricolage Grotesque
        </div>
      </div>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 120px)', gap: 8, marginTop: 14 }}>
        <FieldSelect label="Title font" value="Bricolage Grotesque" />
        <FieldSelect label="Weight" value="Bold" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 120px)', gap: 8, marginTop: 8 }}>
        <FieldSelect label="Body font" value="Lexend" />
        <FieldSelect label="Weight" value="Regular" />
      </div>
    </Panel>
  );
}

function FieldSelect({ label, value }: { label: string; value: string }) {
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Text variant="secondary" style={{ fontSize: 11, color: 'var(--dark-60)' }}>{label}</Text>
      <button
        type="button"
        onClick={() => showToast({ message: `Change ${label} coming soon` })}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 8,
          cursor: 'pointer',
          color: 'var(--dark-90)',
          fontSize: 13,
          fontWeight: 400,
          fontFamily: 'inherit',
          width: '100%',
          minWidth: 0,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        <ChevronDown size={14} color="var(--dark-60)" />
      </button>
    </div>
  );
}

// ─── Colors ──────────────────────────────────────────────────────────

interface ColorSwatchSpec {
  hex: string;
  label: string;
}

const SWATCHES: ColorSwatchSpec[] = [
  { hex: '#ffffff', label: 'White' },
  { hex: '#e5e5e5', label: 'Light grey' },
  { hex: '#9a9a9a', label: 'Mid grey' },
  { hex: '#0179cf', label: 'Bright blue' },
  { hex: '#0e1014', label: 'Near black' },
  { hex: '#f5ecdc', label: 'Light cream' },
];

function ColorsCard() {
  return (
    <Panel title="Colors">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 84px)', gap: 10, justifyContent: 'flex-start' }}>
        {SWATCHES.map((s) => (
          <ColorSwatch key={s.hex} hex={s.hex} label={s.label} />
        ))}
        <AddSwatch />
      </div>
    </Panel>
  );
}

function ColorSwatch({ hex, label }: { hex: string; label: string }) {
  const { showToast } = useToast();
  const [hovered, setHovered] = useState(false);
  // Detect very light swatches so we draw a faint border around them.
  const isLight = ['#ffffff', '#e5e5e5', '#f5ecdc'].includes(hex.toLowerCase());
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 84,
        height: 84,
        borderRadius: 10,
        background: hex,
        border: isLight ? '1px solid var(--dark-8)' : '1px solid transparent',
        cursor: 'pointer',
      }}
      aria-label={label}
    >
      {hovered && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={() => showToast({ message: 'Remove color coming soon' })}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 24,
            height: 24,
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
          <Trash2 size={14} color="currentColor" />
        </button>
      )}
    </div>
  );
}

function AddSwatch() {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() => showToast({ message: 'Add color coming soon' })}
      style={{
        width: 84,
        height: 84,
        borderRadius: 10,
        background: 'transparent',
        border: '1.5px dashed var(--dark-15)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--dark-60)',
      }}
      aria-label="Add color"
    >
      <Plus size={20} color="currentColor" />
    </button>
  );
}

// ─── Visual identity description ─────────────────────────────────────

function IdentityDescriptionCard() {
  const { showToast } = useToast();
  return (
    <Panel
      title="Visual identity description"
      action={<LinkButton onPress={() => showToast({ message: 'Edit description coming soon' })} frontIcon={Edit1}>Edit</LinkButton>}
    >
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--dark-2)',
          borderRadius: 8,
          color: 'var(--dark-90)',
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        Refined minimalism, editorial luxury, warm neutral palette, female founder
        executive, Vogue meets McKinsey
      </div>
    </Panel>
  );
}

