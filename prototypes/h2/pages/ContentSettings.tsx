import { useState, type CSSProperties, type ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { Chip, TabChip } from '@/staging';
import Sliders from '@/icons/16/Sliders';
import FileMultiple from '@/icons/16/Templates';
import ChevronDown from '@/icons/16/ChevronDown';
import ChevronRightSmall from '@/icons/12/ChevronRightSmall';
import AI from '@/icons/20/AI';
import ContentMix from '@/icons/16/ContentMix';
import Brand from '@/icons/20/Brand';
import ShieldChecked from '@/icons/20/ShieldChecked';
import UserProfileCircle from '@/icons/16/UserProfileCircle';
import { H2Layout } from '../H2Layout';
import { AvatarsTab } from '../AvatarsTab';

type Tab = 'general' | 'avatars' | 'blogs';

export function ContentSettingsRoute() {
  const [tab, setTab] = useState<Tab>('general');
  const tabs = (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      <TabChip selected={tab === 'general'} onSelect={() => setTab('general')}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Sliders size={14} />
          General
        </span>
      </TabChip>
      <TabChip selected={tab === 'avatars'} onSelect={() => setTab('avatars')}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <UserProfileCircle size={14} />
          Avatars
        </span>
      </TabChip>
      <TabChip selected={tab === 'blogs'} onSelect={() => setTab('blogs')}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FileMultiple size={14} />
          Blogs
        </span>
      </TabChip>
    </div>
  );

  const bodyMaxWidth = tab === 'avatars' ? 1180 : 760;

  return (
    <H2Layout title="Content Preferences" topbarCenter={tabs}>
      <div style={{ maxWidth: bodyMaxWidth, margin: '0 auto', padding: '8px 4px 80px' }}>
        {tab === 'general' && <GeneralTab />}
        {tab === 'avatars' && <AvatarsTab />}
        {tab === 'blogs' && <BlogsTab />}
      </div>
    </H2Layout>
  );
}

// ---------------------------------------------------------------------------
// General tab
// ---------------------------------------------------------------------------

function GeneralTab() {
  return (
    <>
      <Section title="Content Guidelines">
        <Field label="Content language">
          <FakeSelect value="English (US)" width={260} />
        </Field>

        <Field label="Words and concepts to avoid">
          <Chip variant="add" size="md">Add</Chip>
        </Field>

        <Field label="Primary market locations">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Chip deletable size="md">Italy</Chip>
            <Chip deletable size="md">United States</Chip>
            <Chip variant="add" size="md">Add</Chip>
          </div>
        </Field>

        <Field label="Who you're speaking to">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <SubField label="Age">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <NumberInput value={25} />
                <Text style={{ color: 'var(--dark-60)', fontSize: 13 }}>to</Text>
                <NumberInput value={54} />
              </div>
            </SubField>
            <SubField label="Gender">
              <FakeSelect value="All genders" width={180} />
            </SubField>
          </div>
        </Field>

        <Field label="Who appears in content">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <SubField label="Age">
              <FakeSelect value="35-44" width={130} />
            </SubField>
            <SubField label="Gender">
              <FakeSelect value="All Genders" width={170} />
            </SubField>
            <SubField label="Ethnicity">
              <FakeSelect value="Multicultural / Diverse Group" width={250} />
            </SubField>
          </div>
          <button
            type="button"
            style={{
              marginTop: 14,
              padding: 0,
              border: 'none',
              background: 'transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: "'Sohne', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--dark-90)',
              cursor: 'pointer',
            }}
          >
            Add Representation details (optional)
            <ChevronRightSmall size={12} />
          </button>
        </Field>
      </Section>

      <ContentModificationSection />

      <Section title="Video Preferences">
        <Text style={{ color: 'var(--dark-60)', fontSize: 13 }}>
          Configure default duration, aspect ratios, and captioning behavior for generated videos.
        </Text>
      </Section>
    </>
  );
}

function ContentModificationSection() {
  const [choice, setChoice] = useState<'growth' | 'balanced' | 'brand-first' | 'strict'>('growth');
  return (
    <Section title="Content Modification">
      <Text
        style={{
          display: 'block',
          color: 'var(--dark-60)',
          fontSize: 13,
          lineHeight: 1.55,
          marginBottom: 16,
        }}
      >
        Blaze's content is created by using AI to generate variants of assets in your Brand Kit
        that are optimized for your goals, strategies, and topics. Choose how you'd like to balance
        fidelity to your assets v. optimizing content to your goals.
      </Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <ModeOption
          icon={AI}
          title="Growth-focused"
          description="Maximizes performance with AI enhancements and smart substitutions."
          selected={choice === 'growth'}
          onSelect={() => setChoice('growth')}
        />
        <ModeOption
          icon={ContentMix}
          title="Balanced"
          description="Improves styling and composition while keeping more of your original content intact."
          selected={choice === 'balanced'}
          onSelect={() => setChoice('balanced')}
        />
        <ModeOption
          icon={Brand}
          title="Brand-first"
          description="Applies lighting improvements while preserving the original look and feel."
          selected={choice === 'brand-first'}
          onSelect={() => setChoice('brand-first')}
        />
        <ModeOption
          icon={ShieldChecked}
          title="Strict brand control"
          description="Uses only your Brand Kit assets without modifications or stock content. Carousels cannot be created."
          selected={choice === 'strict'}
          onSelect={() => setChoice('strict')}
        />
      </div>
    </Section>
  );
}

function ModeOption({
  icon: Icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
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
        gap: 12,
        padding: 12,
        border: 'none',
        background: 'transparent',
        borderRadius: 8,
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          flexShrink: 0,
          borderRadius: 999,
          border: selected ? '5px solid var(--dark-90)' : '1.5px solid var(--dark-15)',
          background: 'var(--light-100)',
          marginTop: 2,
          boxSizing: 'border-box',
        }}
      />
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 8,
          background: 'rgba(124, 92, 252, 0.10)',
          color: 'var(--purple)',
        }}
      >
        <Icon size={20} color="var(--purple)" />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <Text style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)' }}>{title}</Text>
        <Text style={{ color: 'var(--dark-60)', fontSize: 13, lineHeight: 1.5 }}>
          {description}
        </Text>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Blogs tab
// ---------------------------------------------------------------------------

function BlogsTab() {
  const [externalLinks, setExternalLinks] = useState(true);
  return (
    <Section title="Blogs">
      <Field
        label="Blog keywords"
        hint="We'll use these target keywords when generating content for SEO."
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Tuscany escape', 'Italian villa', 'romantic getaway', 'travel Tuscany', 'authentic hospitality', 'Tuscan villa rental'].map((kw) => (
            <Chip key={kw} deletable size="md">{kw}</Chip>
          ))}
          <Chip variant="add" size="md">Add</Chip>
        </div>
      </Field>

      <Field label="Include external links on blogs posts">
        <OnOffToggle value={externalLinks} onChange={setExternalLinks} />
      </Field>

      <Field
        label="External URLs to avoid"
        hint="We'll exclude these domains when generating content."
      >
        <Chip variant="add" size="md">Add</Chip>
      </Field>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div
        style={{
          borderBottom: '1px solid var(--dark-8)',
          paddingBottom: 10,
          marginBottom: 20,
        }}
      >
        <Heading level={3} style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.2px' }}>
          {title}
        </Heading>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Text
        style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--dark-90)',
          marginBottom: hint ? 2 : 8,
        }}
      >
        {label}
      </Text>
      {hint && (
        <Text style={{ display: 'block', fontSize: 13, color: 'var(--dark-60)', marginBottom: 10 }}>
          {hint}
        </Text>
      )}
      {children}
    </div>
  );
}

function SubField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>{label}</Text>
      {children}
    </div>
  );
}

function FakeSelect({ value, width }: { value: string; width?: number }) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '8px 10px 8px 12px',
    border: '1px solid var(--dark-8)',
    borderRadius: 8,
    background: 'var(--light-100)',
    fontFamily: "'Sohne', sans-serif",
    fontSize: 14,
    color: 'var(--dark-90)',
    cursor: 'pointer',
    minWidth: width ?? 160,
  };
  return (
    <button type="button" style={style}>
      <span>{value}</span>
      <ChevronDown size={16} color="var(--dark-60)" />
    </button>
  );
}

function NumberInput({ value }: { value: number }) {
  return (
    <input
      type="number"
      defaultValue={value}
      style={{
        width: 72,
        padding: '8px 12px',
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        fontFamily: "'Sohne', sans-serif",
        fontSize: 14,
        color: 'var(--dark-90)',
        background: 'var(--light-100)',
        outline: 'none',
      }}
    />
  );
}

function OnOffToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const btn = (active: boolean): CSSProperties => ({
    padding: '6px 16px',
    border: 'none',
    background: active ? 'var(--light-100)' : 'transparent',
    borderRadius: 6,
    fontFamily: "'Sohne', sans-serif",
    fontSize: 13,
    fontWeight: active ? 500 : 400,
    color: active ? 'var(--dark-90)' : 'var(--dark-60)',
    cursor: 'pointer',
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
  });
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 2,
        padding: 4,
        background: 'var(--dark-4)',
        borderRadius: 8,
      }}
    >
      <button type="button" style={btn(value)} onClick={() => onChange(true)}>On</button>
      <button type="button" style={btn(!value)} onClick={() => onChange(false)}>Off</button>
    </div>
  );
}
