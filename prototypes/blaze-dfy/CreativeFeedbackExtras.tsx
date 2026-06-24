/**
 * Creative Review — feedback "extras" surfaced after a review round.
 *
 *  - InferredTasteCard: read-only "what we learned" summary of the customer's
 *    taste, derived from this round's approvals (inferredTaste()).
 *  - BrandGuidelinesEditor: editable Tone / Lean into / Avoid / Visual lists
 *    that steer every future generation (defaultGuidelines()), held in local
 *    state. Editing here "replaces" the Brand Kit.
 */
import { useState, type ReactNode, type CSSProperties } from 'react';
import { Text, Heading, Button, IconButton } from '@/components';
import { Pill } from '@/staging';
import Trash2 from '@/icons/20/Trash2';
import Plus from '@/icons/20/Plus';
import type { Account } from './lib/types';
import { inferredTaste, defaultGuidelines, type BrandGuidelinesData } from './lib/creative';
import { TextInput } from './ui';

/** Divider + breathing room above each section (except the first). */
const DIVIDER: CSSProperties = { borderTop: '1px solid var(--dark-6)', paddingTop: 32 };

/** Sub-section heading (H3) inside a feedback section. */
function GroupLabel({ children, color }: { children: ReactNode; color?: string }) {
  return <Heading level={3} style={{ margin: '0 0 8px', ...(color ? { color } : null) }}>{children}</Heading>;
}

/* ─── InferredTasteCard ──────────────────────────────────────────────────── */

export function InferredTasteCard({ account }: { account: Account }): JSX.Element {
  const taste = inferredTaste(account);
  return (
    <div>
      <Heading level={2} style={{ marginTop: 0, marginBottom: 4 }}>Inferred Brand Taste</Heading>
      <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 24 }}>What the model learned from this round's approvals.</Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* section: summary */}
        <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.6 }}>{taste.summary}</Text>

        {/* section: liked */}
        <div style={DIVIDER}>
          <GroupLabel>Liked</GroupLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {taste.liked.map((l, i) => <Pill key={i} size="md">{l}</Pill>)}
          </div>
        </div>

        {/* section: tone */}
        <div style={DIVIDER}>
          <GroupLabel>Tone</GroupLabel>
          <Text variant="secondary" color="var(--dark-80)">{taste.tone}</Text>
        </div>

        {/* section: taglines */}
        <div style={DIVIDER}>
          <GroupLabel>Taglines</GroupLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {taste.taglines.map((t, i) => <Pill key={i} size="md">{t}</Pill>)}
          </div>
        </div>

        {/* section: do / don't */}
        <div style={{ ...DIVIDER, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <GroupLabel color="var(--positive-60)">Do</GroupLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {taste.doList.map((d, i) => (
                <Text key={i} variant="secondary" color="var(--positive-60)" style={{ display: 'block', lineHeight: 1.5 }}>{d}</Text>
              ))}
            </div>
          </div>
          <div>
            <GroupLabel color="var(--negative-60)">Don't</GroupLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {taste.dontList.map((d, i) => (
                <Text key={i} variant="secondary" color="var(--negative-60)" style={{ display: 'block', lineHeight: 1.5 }}>{d}</Text>
              ))}
            </div>
          </div>
        </div>

        {/* section: visual notes */}
        <div style={DIVIDER}>
          <GroupLabel>Visual notes</GroupLabel>
          <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {taste.visualNotes.map((v, i) => (
              <li key={i} style={{ color: 'var(--dark-80)' }}>
                <Text variant="secondary" color="var(--dark-80)">{v}</Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── BrandGuidelinesEditor ──────────────────────────────────────────────── */

type SectionKey = keyof BrandGuidelinesData;

const SECTIONS: { key: SectionKey; label: string; color?: string; placeholder: string }[] = [
  { key: 'tone', label: 'Tone', placeholder: 'New tone note' },
  { key: 'leanInto', label: 'Lean into', color: 'var(--positive-60)', placeholder: 'New lean-into' },
  { key: 'avoid', label: 'Avoid', color: 'var(--negative-60)', placeholder: 'New thing to avoid' },
  { key: 'visual', label: 'Visual direction', placeholder: 'New visual note' },
];

/** Editable list section: H3 label, each item an md input with an X to remove,
 *  and a "+ Add" button that appends a fresh empty input. */
function GuidelineSection({ label, color, placeholder, items, onChange }: {
  label: string;
  color?: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const update = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, '']);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <Heading level={3} style={{ margin: 0, ...(color ? { color } : null) }}>{label}</Heading>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <TextInput value={item} placeholder={placeholder} onChange={(e) => update(i, e.target.value)} />
          </div>
          <IconButton icon={Trash2} variant="secondary" size="lg" title="Remove" onPress={() => remove(i)} />
        </div>
      ))}
      <div style={{ display: 'flex' }}>
        <Button variant="tertiary" size="sm" frontIcon={Plus} onPress={add}>Add</Button>
      </div>
    </div>
  );
}

export function BrandGuidelinesEditor({ account }: { account: Account }): JSX.Element {
  const [guidelines, setGuidelines] = useState<BrandGuidelinesData>(() => defaultGuidelines(account));
  const setSection = (key: SectionKey, items: string[]) => setGuidelines((g) => ({ ...g, [key]: items }));
  const section = (key: SectionKey) => {
    const meta = SECTIONS.find((s) => s.key === key)!;
    return <GuidelineSection label={meta.label} color={meta.color} placeholder={meta.placeholder} items={guidelines[key]} onChange={(items) => setSection(key, items)} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <Heading level={2} style={{ marginTop: 0, marginBottom: 4 }}>Brand Guidelines</Heading>
        <Text variant="secondary" color="var(--dark-60)">These steer every future generation. Editing here replaces what's in the Brand Kit.</Text>
      </div>

      <div>{section('tone')}</div>
      <div style={{ ...DIVIDER, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {section('leanInto')}
        {section('avoid')}
      </div>
      <div style={DIVIDER}>{section('visual')}</div>
    </div>
  );
}
