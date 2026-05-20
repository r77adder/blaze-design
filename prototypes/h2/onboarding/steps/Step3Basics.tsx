import { useState, type ChangeEvent, type ComponentType } from 'react';
import { Button, Heading, Text } from '@/components';
import { Chip } from '@/staging';
import CustomerService from '@/icons/20/CustomerService';
import Marker from '@/icons/20/Marker';
import Bag04 from '@/icons/20/Bag04';
import Check2 from '@/icons/20/Check2';
import Edit1 from '@/icons/20/Edit1';
import { BUSINESS_TYPES, type BusinessType } from '../../tools-context';
import { useOnboarding } from '../onboarding-context';

const TYPE_ICONS: Record<BusinessType, ComponentType<{ size?: number; color?: string }>> = {
  services: CustomerService,
  local: Marker,
  products: Bag04,
};

const TYPE_DESCRIPTIONS: Record<BusinessType, string> = {
  services: 'Consultant, agencies, freelancer',
  local: 'Restaurants, stores, salons',
  products: 'E-commerce, manufactures',
};

const LANGUAGES = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German'];
const ETHNICITIES = ['Multicultural/Diverse Group', 'Black', 'White', 'Asian', 'Hispanic / Latino'];
const GENDERS = ['All Genders', 'Female', 'Male', 'Non-Binary'];
const AGES = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

export function Step3Basics() {
  const { profile, updateProfile, setBusinessType, next, back } = useOnboarding();

  return (
    <div style={{ padding: '64px 24px 120px', maxWidth: 880, margin: '0 auto' }}>
      <Heading
        level={1}
        style={{ fontSize: 32, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 8 }}
      >
        First, let's confirm some basics about your business
      </Heading>
      <Text
        variant="primary"
        style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, marginBottom: 32 }}
      >
        We pulled this from your website — correct anything that's off.
      </Text>

      {/* Business name */}
      <FieldLabel>Business name</FieldLabel>
      <TextInput
        value={profile.name}
        onChange={(e) => updateProfile({ name: e.target.value })}
        style={{ marginBottom: 24 }}
      />

      {/* Business type cards */}
      <div
        style={{
          background: 'rgba(124, 92, 252, 0.04)',
          border: '1px solid rgba(124, 92, 252, 0.12)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 28,
        }}
      >
        <div style={{ marginBottom: 4 }}>
          <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
            Select your type of business
            <span style={{ color: 'var(--red-70)' }}>*</span>
          </Text>
        </div>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 16 }}>
          This will affect your content plan
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {BUSINESS_TYPES.map((b) => {
            const Icon = TYPE_ICONS[b.id];
            const selected = profile.type === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBusinessType(b.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: 16,
                  background: 'var(--light-100)',
                  border: `1.5px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'border-color 120ms ease',
                }}
              >
                <Icon size={20} color="var(--dark-90)" />
                <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
                  {b.label.replace('Local Business', 'Place Based').replace('Services', 'Service Based').replace('Products', 'Product Based')}
                </Text>
                <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
                  {TYPE_DESCRIPTIONS[b.id]}
                </Text>
                {selected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--dark-90)',
                      color: 'var(--light-100)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check2 size={14} color="var(--light-100)" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Elevator pitch */}
      <FieldLabel>Elevator Pitch</FieldLabel>
      <div
        style={{
          border: '1px solid var(--dark-8)',
          borderRadius: 10,
          padding: 16,
          background: 'var(--light-100)',
          marginBottom: 24,
        }}
      >
        <Text variant="primary" style={{ color: 'var(--dark-90)', lineHeight: 1.55, fontSize: 14 }}>
          <span dangerouslySetInnerHTML={{
            __html: profile.elevatorPitch.replace(
              'woman veteran-owned graphic design agency',
              '<strong style="color: var(--dark-90); font-weight: 500;">woman veteran-owned graphic design agency</strong>',
            ),
          }} />
        </Text>
      </div>

      {/* Logo */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
            Logo
          </Text>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 13,
              color: 'var(--dark-90)',
              cursor: 'pointer',
            }}
          >
            <Edit1 size={14} color="var(--dark-90)" />
            Edit
          </button>
        </div>
        <div
          style={{
            width: 360,
            maxWidth: '100%',
            height: 140,
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
            background: 'var(--light-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Times New Roman", Georgia, serif',
            fontSize: 24,
            letterSpacing: '0.18em',
            color: 'var(--dark-90)',
          }}
        >
          SHEREEN HOBAN
        </div>
      </div>

      {/* Audience row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          marginBottom: 24,
        }}
      >
        <div>
          <Heading level={5} style={{ marginBottom: 12 }}>Who you're speaking to</Heading>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <SmallField label="Age">
              <input
                type="number"
                value={profile.audienceAgeMin}
                onChange={(e) => updateProfile({ audienceAgeMin: Number(e.target.value) })}
                style={smallInputStyle}
              />
            </SmallField>
            <span style={{ fontSize: 14, color: 'var(--dark-60)', padding: '8px 4px' }}>to</span>
            <SmallField>
              <input
                type="number"
                value={profile.audienceAgeMax}
                onChange={(e) => updateProfile({ audienceAgeMax: Number(e.target.value) })}
                style={smallInputStyle}
              />
            </SmallField>
            <SmallField label="Gender">
              <Select
                value={profile.audienceGender}
                options={GENDERS}
                onChange={(v) => updateProfile({ audienceGender: v })}
              />
            </SmallField>
          </div>
        </div>
        <div>
          <Heading level={5} style={{ marginBottom: 12 }}>Audience</Heading>
          <SmallField label="Primary Market Locations">
            <LocationChips
              values={profile.audienceLocations}
              onChange={(arr) => updateProfile({ audienceLocations: arr })}
            />
          </SmallField>
        </div>
      </div>

      {/* Who appears in content */}
      <div style={{ marginBottom: 24 }}>
        <Heading level={5} style={{ marginBottom: 12 }}>Who appears in content</Heading>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <SmallField label="Age">
            <Select
              value={profile.contentAge}
              options={AGES}
              onChange={(v) => updateProfile({ contentAge: v })}
            />
          </SmallField>
          <SmallField label="Gender">
            <Select
              value={profile.contentGender}
              options={GENDERS}
              onChange={(v) => updateProfile({ contentGender: v })}
            />
          </SmallField>
          <SmallField label="Ethnicity">
            <Select
              value={profile.contentEthnicity}
              options={ETHNICITIES}
              onChange={(v) => updateProfile({ contentEthnicity: v })}
            />
          </SmallField>
        </div>
      </div>

      {/* Primary language */}
      <div style={{ marginBottom: 24 }}>
        <Heading level={5} style={{ marginBottom: 12 }}>Primary language</Heading>
        <SmallField>
          <Select
            value={profile.primaryLanguage}
            options={LANGUAGES}
            onChange={(v) => updateProfile({ primaryLanguage: v })}
          />
        </SmallField>
      </div>

      {/* Market positioning */}
      <div style={{ marginBottom: 32 }}>
        <Heading level={5} style={{ marginBottom: 12 }}>Market Positioning</Heading>
        <div
          style={{
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
            padding: '18px 22px',
            background: 'var(--light-100)',
          }}
        >
          <PositionLine label="Primary Positioning" text={profile.positioningPrimary} />
          <PositionLine label="Secondary Positioning" text={profile.positioningSecondary} />
          <PositionLine label="Tertiary Positioning" text={profile.positioningTertiary} last />
        </div>
      </div>

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
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 4,
        }}
      >
        <button
          type="button"
          onClick={back}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--dark-90)',
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          Back
        </button>
        <Button variant="primary" size="lg" onPress={next}>
          Set My Content Strategy
        </Button>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      variant="smallList"
      style={{
        display: 'block',
        color: 'var(--dark-90)',
        fontWeight: 500,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

const smallInputStyle: React.CSSProperties = {
  width: 64,
  padding: '8px 10px',
  fontSize: 14,
  fontFamily: 'inherit',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 8,
  color: 'var(--dark-90)',
  outline: 'none',
};

function TextInput({
  value,
  onChange,
  style,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '12px 14px',
        fontSize: 15,
        fontFamily: 'inherit',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
        color: 'var(--dark-90)',
        outline: 'none',
        ...style,
      }}
    />
  );
}

function SmallField({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <Text variant="metadata" style={{ color: 'var(--dark-60)', fontSize: 12 }}>
          {label}
        </Text>
      )}
      {children}
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[] | string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        appearance: 'none',
        padding: '8px 28px 8px 10px',
        fontSize: 14,
        fontFamily: 'inherit',
        background: `var(--light-100) url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23000' stroke-opacity='0.6' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M4 6l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 10px center`,
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        color: 'var(--dark-90)',
        outline: 'none',
        minWidth: 140,
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function LocationChips({
  values,
  onChange,
}: {
  values: string[];
  onChange: (arr: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const remove = (v: string) => onChange(values.filter((x) => x !== v));
  const add = () => {
    const t = draft.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setDraft('');
    setAdding(false);
  };

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {values.map((v) => (
        <Chip
          key={v}
          size="md"
          deletable
          onDelete={() => remove(v)}
        >
          {v}
        </Chip>
      ))}
      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add();
            if (e.key === 'Escape') {
              setDraft('');
              setAdding(false);
            }
          }}
          placeholder="Country / region"
          style={{
            ...smallInputStyle,
            width: 160,
            fontSize: 14,
          }}
        />
      ) : (
        <Chip size="md" variant="add" onClick={() => setAdding(true)}>
          Add
        </Chip>
      )}
    </div>
  );
}

function PositionLine({
  label,
  text,
  last,
}: {
  label: string;
  text: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        padding: '4px 0',
        marginBottom: last ? 0 : 8,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'var(--dark-90)',
          marginTop: 9,
          flexShrink: 0,
        }}
      />
      <Text variant="primary" style={{ color: 'var(--dark-90)', lineHeight: 1.55, fontSize: 14 }}>
        <strong style={{ fontWeight: 500 }}>{label}:</strong> {text}
      </Text>
    </div>
  );
}
