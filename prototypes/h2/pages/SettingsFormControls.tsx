import type { CSSProperties, FocusEvent, ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { Pill } from '@/staging';
import CheckboxChecked from '@/icons/20/CheckboxChecked';
import CheckboxLight from '@/icons/20/CheckboxLight';

// ══════════════════════════════════════════════════════════════════════════
// Shared settings-page form controls — extracted from SdrSettings.tsx so
// sibling sections (e.g. QualificationCriteria.tsx) can match the same
// section/field/input look without duplicating styles or causing a
// circular import back into SdrSettings.tsx.
// ══════════════════════════════════════════════════════════════════════════

export function SectionDivider() {
  // Dividers removed for now — kept as a no-op so call sites stay intact.
  return null;
}

export function SectionShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <section>
      <div style={{ marginBottom: 16 }}>
        <Heading level={3} style={{ marginBottom: 4 }}>{title}</Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>{sub}</Text>
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text variant="primary" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      {children}
    </Text>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      {label && <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>{label}</span>}
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative', display: 'inline-block', width: 36, height: 20, flexShrink: 0,
          borderRadius: 999, background: checked ? 'var(--dark-90)' : 'var(--dark-15)',
          transition: 'background-color 160ms ease',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16,
            borderRadius: '50%', background: 'var(--light-100)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transition: 'left 160ms ease',
          }}
        />
      </span>
    </label>
  );
}

// Blaze-style focus: on focus the border darkens to var(--dark-40) + a subtle
// ring; on blur it reverts to the default var(--dark-8). Spread onto raw
// inputs/textareas (those whose resting border is var(--dark-8)).
export const inputFocusProps = {
  onFocus: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--dark-40)';
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--dark-4)';
  },
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--dark-8)';
    e.currentTarget.style.boxShadow = 'none';
  },
};

export const textInputStyle: CSSProperties = {
  fontFamily: 'inherit', fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)',
  padding: '8px 10px', border: '1px solid var(--dark-8)', borderRadius: 6,
  background: 'var(--light-100)', outline: 'none', width: '100%', boxSizing: 'border-box',
};

export const largeInputStyle: CSSProperties = { ...textInputStyle, fontSize: 16, letterSpacing: '0.32px', padding: '12px 14px', borderRadius: 8 };

export function TextField({ label, value, onChange, hint, maxWidth }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; hint?: string; maxWidth?: number }) {
  return (
    <div>
      {hint ? (
        <>
          <div style={{ marginBottom: -6 }}>
            <FieldLabel>{label}</FieldLabel>
          </div>
          <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 8 }}>{hint}</Text>
        </>
      ) : (
        <FieldLabel>{label}</FieldLabel>
      )}
      <input {...inputFocusProps} type="text" value={value} onChange={(e) => onChange(e.target.value)} style={maxWidth ? { ...textInputStyle, maxWidth } : textInputStyle} />
    </div>
  );
}

export function TextareaField({ label, value, onChange, rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        {...inputFocusProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows ?? 3}
        placeholder={placeholder}
        style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: "'Sohne', sans-serif", fontSize: 14 }}
      />
    </div>
  );
}

export function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        {...inputFocusProps}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => { const n = Number(e.target.value); if (Number.isFinite(n)) onChange(n); }}
        style={textInputStyle}
      />
    </div>
  );
}

export function RadioCard({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description?: string }) {
  const Icon = selected ? CheckboxChecked : CheckboxLight;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 14, textAlign: 'left',
        border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-4)'}`,
        borderRadius: 10, background: selected ? 'var(--light-100)' : 'var(--dark-2)',
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'border-color 120ms ease, background 120ms ease',
      }}
    >
      <Icon size={20} />
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{title}</span>
        {description && <span style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.4 }}>{description}</span>}
      </span>
    </button>
  );
}

export function OptionalHint() {
  return <Pill size="xs" style={{ marginLeft: 6 }}>Optional</Pill>;
}
