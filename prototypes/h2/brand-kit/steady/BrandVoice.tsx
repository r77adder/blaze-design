import { type ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { Chip, useToast } from '@/staging';
import InformationCircleSmall from '@/icons/16/InformationCircleSmall';

/**
 * Brand Voice tab — long-form Purpose + Audience inputs, then five chip
 * groups (Tone, Emotion, Character, Syntax, Language). Chips are deletable
 * value pills; the last chip in each group is a "+ Add" variant.
 */

export function BrandVoice() {
  return (
    <div>
      <SectionHeading title="Brand Voice" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 28 }}>
        <Field label="Purpose">
          <Textarea
            value="Connect with customers as a friend while educating them about the vast array of candies, gummies, chocolates, taffies, and other sweet variants."
          />
        </Field>
        <Field label="Audience">
          <Textarea
            value="Product managers who are subject matter experts in the world of exotic confectionery."
            rows={2}
          />
        </Field>
        <Field label="Tone"><ChipGroup /></Field>
        <Field label="Emotion"><ChipGroup /></Field>
        <Field label="Character"><ChipGroup /></Field>
        <Field label="Syntax"><ChipGroup /></Field>
        <Field label="Language"><ChipGroup /></Field>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{label}</Text>
        <InformationCircleSmall size={14} color="var(--dark-40)" />
      </div>
      {children}
    </div>
  );
}

function Textarea({ value, rows = 3 }: { value: string; rows?: number }) {
  return (
    <textarea
      defaultValue={value}
      rows={rows}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        color: 'var(--dark-90)',
        fontFamily: 'inherit',
        fontSize: 14,
        lineHeight: 1.5,
        resize: 'vertical',
        boxSizing: 'border-box',
      }}
    />
  );
}

function ChipGroup() {
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <Chip deletable size="md" onDelete={() => showToast({ message: 'Remove chip coming soon' })}>Casual</Chip>
      <Chip deletable size="md" onDelete={() => showToast({ message: 'Remove chip coming soon' })}>Conversational</Chip>
      <Chip deletable size="md" onDelete={() => showToast({ message: 'Remove chip coming soon' })}>Optimistic</Chip>
      <Chip variant="add" size="md" onClick={() => showToast({ message: 'Add chip coming soon' })}>Add</Chip>
    </div>
  );
}
