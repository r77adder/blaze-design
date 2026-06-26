import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { Chip, Select, StatusPill, TextField } from '@/staging';
import Globe from '@/icons/20/Globe';
import Target5 from '@/icons/20/Target5';
import Map02 from '@/icons/20/Map02';
import {
  GENDER_LABEL,
  LANGUAGE_OPTIONS,
  useMetaCampaign,
  type Gender,
} from '../meta-campaign-context';
import {
  CONVERSION_EVENT_ORDER,
  CONVERSION_LOCATION_LABEL,
  CONVERSION_LOCATION_ORDER,
  MANUAL_PLACEMENT_LABEL,
  MANUAL_PLACEMENT_ORDER,
  PERFORMANCE_GOAL_LABEL,
  PERFORMANCE_GOAL_ORDER,
  type AdSetConversionEvent,
  type AdSetPerformanceGoal,
  type AudienceMode,
  type ConversionLocation,
  type ManualPlacement,
  type PlacementsMode,
} from '../concept/types';
import { defaultAdSetName } from '../concept/defaults';

const SUGGESTED_LOCATIONS = [
  'Austin, TX · 25mi',
  'Cedar Park, TX · 15mi',
  'Round Rock, TX · 15mi',
  'Pflugerville, TX · 10mi',
  'San Antonio, TX · 25mi',
];

/** Stage 2 — Ad set: name, performance goal, conversion event, pixel,
 *  destination URL, audience (age/gender/language/locations), geo targeting.
 *  Default ad set is named "{Campaign} – Default Ad Set" so it's clearly
 *  identifiable in Stage 4's review and on the detail page. */
export function Stage2AdSet() {
  const { draft, adSetDraft, setAdSetField, setAdSetDraft } = useMetaCampaign();

  // When Special Ad Category is set on the campaign, Meta restricts age,
  // gender, and detailed-targeting on the ad set. Surface a banner + lock
  // the relevant inputs.
  const restricted = draft.specialAdCategories.length > 0;

  // Keep ad-set name in sync with campaign name UNTIL the user edits it manually.
  const [nameDirty, setNameDirty] = useState(false);
  useEffect(() => {
    if (!nameDirty) {
      setAdSetField('name', defaultAdSetName(draft.name));
    }
  }, [draft.name, nameDirty, setAdSetField]);

  // Each major section starts as a Blaze-decided readout. Clicking Edit
  // expands it into the full editor. This lets the user trust the
  // defaults by default and only dig in where they have an opinion.
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [editingAudience, setEditingAudience] = useState(false);
  const [editingPlacements, setEditingPlacements] = useState(false);

  return (
    <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
      <Heading level={2} style={{ margin: '0 0 4px', color: 'var(--dark-90)' }}>
        Blaze set up your ad set
      </Heading>
      <Text variant="secondary">
        Reviewed defaults for delivery, audience, and placements. Click Edit on
        any section to override.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginTop: 32 }}>
        {/* Ad set name — always editable inline, it's just a string */}
        <Field label="Ad set name" compact>
          <TextField
            size="sm"
            fullWidth
            value={adSetDraft.name}
            onChange={(v) => {
              setNameDirty(true);
              setAdSetField('name', v);
            }}
          />
        </Field>

        <EditableSection
          title="Delivery"
          editing={editingDelivery}
          onToggle={() => setEditingDelivery((p) => !p)}
          summary={
            <DeliverySummary
              adSetDraft={adSetDraft}
            />
          }
        >
          {/* Conversion location — drives whether destination URL, instant
           *  form, app deeplink etc. are required. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={fieldLabelStyle}>Conversion location</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CONVERSION_LOCATION_ORDER.map((loc) => (
                <Chip
                  key={loc}
                  size="md"
                  selected={adSetDraft.conversionLocation === loc}
                  onSelectionChange={() => setAdSetField('conversionLocation', loc as ConversionLocation)}
                >
                  {CONVERSION_LOCATION_LABEL[loc]}
                </Chip>
              ))}
            </div>
          </div>

          {/* Performance goal + Conversion event — paired delivery row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SelectField
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Target5 size={14} color="var(--dark-60)" />
                  Performance goal
                </span>
              }
              value={adSetDraft.performanceGoal}
              options={PERFORMANCE_GOAL_ORDER.map((g) => ({ id: g, label: PERFORMANCE_GOAL_LABEL[g] }))}
              onSelect={(v) => setAdSetField('performanceGoal', v as AdSetPerformanceGoal)}
            />
            <SelectField
              label="Conversion event"
              value={adSetDraft.conversionEvent}
              options={CONVERSION_EVENT_ORDER.map((e) => ({ id: e, label: e }))}
              onSelect={(v) => setAdSetField('conversionEvent', v as AdSetConversionEvent)}
            />
          </div>

          {/* Pixel — slim inline pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: 'var(--dark-2)',
              border: '1px solid var(--dark-8)',
              borderRadius: 8,
              fontSize: 16,
              color: 'var(--dark-90)',
            }}
          >
            <span style={{ fontWeight: 500 }}>Pixel</span>
            <span style={{ color: 'var(--dark-60)' }}>·</span>
            <span>{adSetDraft.pixelName}</span>
            <span style={{ fontSize: 14, color: 'var(--dark-60)', marginLeft: 'auto' }}>
              {adSetDraft.pixelId}
            </span>
            <span
              style={{
                fontSize: 14,
                color: 'var(--status-approved)',
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              Confirm this is firing before launch.
            </span>
          </div>

          {adSetDraft.conversionLocation === 'website' && (
            <Field
              compact
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={14} color="var(--dark-60)" />
                  Destination URL
                </span>
              }
            >
              <TextField
                size="sm"
                fullWidth
                value={adSetDraft.websiteUrl}
                onChange={(v) => setAdSetField('websiteUrl', v)}
                placeholder="https://"
              />
            </Field>
          )}
        </EditableSection>
      </div>

      <div style={{ marginTop: 40 }}>
        <EditableSection
          title="Audience"
          editing={editingAudience}
          onToggle={() => setEditingAudience((p) => !p)}
          summary={<AudienceSummary adSetDraft={adSetDraft} restricted={restricted} />}
        >
        {/* Advantage+ vs Original audience mode */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['advantage-plus', 'original'] as AudienceMode[]).map((mode) => {
            const selected = adSetDraft.audienceMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setAdSetField('audienceMode', mode)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: selected ? 'var(--light-100)' : 'var(--dark-2)',
                  color: 'var(--dark-90)',
                  border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 16,
                  fontWeight: 500,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span>{mode === 'advantage-plus' ? 'Advantage+ audience' : 'Original audiences'}</span>
                <span style={{ fontSize: 14, color: 'var(--dark-60)', fontWeight: 400 }}>
                  {mode === 'advantage-plus'
                    ? 'Default — Meta finds the audience; inputs below act as suggestions.'
                    : 'Manual targeting. Use inputs below as hard filters.'}
                </span>
              </button>
            );
          })}
        </div>

        {restricted && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(237, 124, 44, 0.10)',
              border: '1px solid rgba(237, 124, 44, 0.25)',
              fontSize: 12,
              color: 'var(--dark-80)',
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            Special ad category is set — Meta restricts age, gender, and
            detailed targeting. The fields below are locked.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
          {/* Age range — compact two-input strip */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={fieldLabelStyle}>Ages</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ flex: 1, opacity: restricted ? 0.6 : 1 }}>
                <TextField
                  size="sm"
                  fullWidth
                  type="number"
                  min={18}
                  max={64}
                  value={String(restricted ? 18 : adSetDraft.ageMin)}
                  disabled={restricted}
                  onChange={(v) => setAdSetField('ageMin', Number(v))}
                />
              </div>
              <span style={{ color: 'var(--dark-60)', fontSize: 16 }}>–</span>
              <div style={{ flex: 1, opacity: restricted ? 0.6 : 1 }}>
                <TextField
                  size="sm"
                  fullWidth
                  type="number"
                  min={18}
                  max={65}
                  value={String(restricted ? 65 : adSetDraft.ageMax)}
                  disabled={restricted}
                  onChange={(v) => setAdSetField('ageMax', Number(v))}
                />
              </div>
            </div>
          </div>

          <SelectField
            label="Language"
            value={adSetDraft.language}
            options={LANGUAGE_OPTIONS.map((l) => ({ id: l, label: l }))}
            onSelect={(v) => setAdSetField('language', v)}
          />

          {/* Gender — pill row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={fieldLabelStyle}>Gender</span>
            <div style={{ display: 'flex', gap: 4, opacity: restricted ? 0.6 : 1 }}>
              {(['all', 'men', 'women'] as Gender[]).map((g) => (
                <Chip
                  key={g}
                  size="md"
                  disabled={restricted}
                  selected={restricted ? g === 'all' : adSetDraft.gender === g}
                  onSelectionChange={() => setAdSetField('gender', g)}
                >
                  {GENDER_LABEL[g]}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {/* Locations — label grouped with its chips so the field reads as one unit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Map02 size={14} color="var(--dark-60)" />
            <span style={fieldLabelStyle}>Locations</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {adSetDraft.locations.map((loc) => (
              <Chip
                key={loc}
                size="md"
                selected
                deletable
                onDelete={() =>
                  setAdSetDraft((p) => ({
                    ...p,
                    locations: p.locations.filter((l) => l !== loc),
                  }))
                }
              >
                {loc}
              </Chip>
            ))}
            {SUGGESTED_LOCATIONS.filter((s) => !adSetDraft.locations.includes(s)).map((loc) => (
              <Chip
                key={loc}
                size="md"
                selected={false}
                onSelectionChange={() =>
                  setAdSetDraft((p) => ({ ...p, locations: [...p.locations, loc] }))
                }
              >
                {loc}
              </Chip>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <ChipListField
            label="Interests / behaviors / demographics"
            placeholder="e.g. homeowners, household income 100k+, recent movers"
            values={adSetDraft.detailedTargeting}
            suggestions={DETAILED_TARGETING_SUGGESTIONS}
            disabled={restricted}
            onChange={(next) => setAdSetField('detailedTargeting', next)}
          />
          <ChipListField
            label="Custom audiences (include)"
            placeholder="e.g. Site visitors 30d, Email list, Lookalike 1%"
            values={adSetDraft.customAudiences}
            suggestions={CUSTOM_AUDIENCE_SUGGESTIONS}
            onChange={(next) => setAdSetField('customAudiences', next)}
          />
          <ChipListField
            label="Exclusions"
            placeholder="e.g. Existing customers, Recent converters (7d)"
            values={adSetDraft.exclusions}
            suggestions={EXCLUSION_SUGGESTIONS}
            onChange={(next) => setAdSetField('exclusions', next)}
          />
        </div>
        </EditableSection>
      </div>

      <div style={{ marginTop: 40 }}>
        <EditableSection
          title="Placements"
          editing={editingPlacements}
          onToggle={() => setEditingPlacements((p) => !p)}
          summary={<PlacementsSummary adSetDraft={adSetDraft} />}
        >
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['advantage-plus', 'manual'] as PlacementsMode[]).map((mode) => {
            const selected = adSetDraft.placementsMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setAdSetField('placementsMode', mode)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: selected ? 'var(--light-100)' : 'var(--dark-2)',
                  color: 'var(--dark-90)',
                  border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 16,
                  fontWeight: 500,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span>
                  {mode === 'advantage-plus' ? 'Advantage+ placements' : 'Manual placements'}
                </span>
                <span style={{ fontSize: 14, color: 'var(--dark-60)', fontWeight: 400 }}>
                  {mode === 'advantage-plus'
                    ? 'Default — Meta picks the best mix.'
                    : 'Pick which surfaces to show on.'}
                </span>
              </button>
            );
          })}
        </div>
        {adSetDraft.placementsMode === 'manual' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {MANUAL_PLACEMENT_ORDER.map((p) => (
              <Chip
                key={p}
                size="md"
                selected={adSetDraft.manualPlacements?.includes(p) ?? false}
                onSelectionChange={() => {
                  setAdSetDraft((prev) => {
                    const current = prev.manualPlacements ?? [];
                    const next = current.includes(p)
                      ? current.filter((x) => x !== p)
                      : [...current, p];
                    return { ...prev, manualPlacements: next };
                  });
                }}
              >
                {MANUAL_PLACEMENT_LABEL[p]}
              </Chip>
            ))}
          </div>
        )}
        </EditableSection>
      </div>
    </div>
  );
}

// ─── EDITABLE SECTION ─────────────────────────────────────────────────

/** Wraps a Stage 2 section in a "Blaze decided this — click Edit to
 *  override" container. Default state shows a compact summary; editing
 *  unfolds the full input set with a Done toggle on the right. */
function EditableSection({
  title,
  icon,
  editing,
  onToggle,
  summary,
  children,
}: {
  title: string;
  icon?: ReactNode;
  editing: boolean;
  onToggle: () => void;
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {icon}
        <Heading level={3} style={{ margin: 0, color: 'var(--dark-90)' }}>
          {title}
        </Heading>
        {!editing && (
          <StatusPill tone="accent" size="sm">
            Recommended
          </StatusPill>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <Button variant="secondary" size="sm" onPress={onToggle}>
            {editing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>
      {!editing && (
        <div style={{ height: 1, background: 'var(--dark-8)', margin: '0 0 16px' }} />
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: editing ? 24 : 12,
          ...(editing && {
            border: '1px solid var(--dark-8)',
            borderRadius: 12,
            padding: 16,
          }),
        }}
      >
        {editing ? children : summary}
      </div>
    </div>
  );
}

// ─── SECTION SUMMARIES ────────────────────────────────────────────────

function summaryRowStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    fontSize: 16,
    color: 'var(--dark-90)',
    lineHeight: 1.4,
  };
}

const summaryLabelStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--dark-60)',
  letterSpacing: '0.28px',
  flexShrink: 0,
  minWidth: 140,
};

function DeliverySummary({ adSetDraft }: { adSetDraft: ReturnType<typeof useMetaCampaign>['adSetDraft'] }) {
  return (
    <>
      <div style={summaryRowStyle()}>
        <span style={summaryLabelStyle}>Conversion location</span>
        <span>{CONVERSION_LOCATION_LABEL[adSetDraft.conversionLocation]}</span>
      </div>
      <div style={summaryRowStyle()}>
        <span style={summaryLabelStyle}>Performance goal</span>
        <span>{PERFORMANCE_GOAL_LABEL[adSetDraft.performanceGoal]}</span>
      </div>
      <div style={summaryRowStyle()}>
        <span style={summaryLabelStyle}>Conversion event</span>
        <span>{adSetDraft.conversionEvent}</span>
      </div>
      <div style={summaryRowStyle()}>
        <span style={summaryLabelStyle}>Pixel</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {adSetDraft.pixelName}
          <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>
            {adSetDraft.pixelId}
          </span>
        </span>
      </div>
      {adSetDraft.conversionLocation === 'website' && (
        <div style={summaryRowStyle()}>
          <span style={summaryLabelStyle}>Destination</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {adSetDraft.websiteUrl || '— not set —'}
          </span>
        </div>
      )}
    </>
  );
}

function AudienceSummary({
  adSetDraft,
  restricted,
}: {
  adSetDraft: ReturnType<typeof useMetaCampaign>['adSetDraft'];
  restricted: boolean;
}) {
  const ageStr = restricted ? '18–65+ (locked)' : `${adSetDraft.ageMin}–${adSetDraft.ageMax}`;
  const genderStr = restricted ? 'All (locked)' : GENDER_LABEL[adSetDraft.gender];
  return (
    <>
      <div style={summaryRowStyle()}>
        <span style={summaryLabelStyle}>Mode</span>
        <span>
          {adSetDraft.audienceMode === 'advantage-plus' ? 'Advantage+ audience' : 'Original audiences'}
        </span>
      </div>
      <div style={summaryRowStyle()}>
        <span style={summaryLabelStyle}>Ages · gender</span>
        <span>{ageStr} · {genderStr.toLowerCase()}</span>
      </div>
      <div style={summaryRowStyle()}>
        <span style={summaryLabelStyle}>Language</span>
        <span>{adSetDraft.language}</span>
      </div>
      <div style={summaryRowStyle()}>
        <span style={summaryLabelStyle}>Locations</span>
        <span>
          {adSetDraft.locations.length === 0 ? '— none —' : adSetDraft.locations.join(', ')}
        </span>
      </div>
      {adSetDraft.detailedTargeting.length > 0 && (
        <div style={summaryRowStyle()}>
          <span style={summaryLabelStyle}>Interests</span>
          <span>{adSetDraft.detailedTargeting.join(', ')}</span>
        </div>
      )}
      {adSetDraft.customAudiences.length > 0 && (
        <div style={summaryRowStyle()}>
          <span style={summaryLabelStyle}>Custom audiences</span>
          <span>{adSetDraft.customAudiences.join(', ')}</span>
        </div>
      )}
      {adSetDraft.exclusions.length > 0 && (
        <div style={summaryRowStyle()}>
          <span style={summaryLabelStyle}>Exclusions</span>
          <span>{adSetDraft.exclusions.join(', ')}</span>
        </div>
      )}
    </>
  );
}

function PlacementsSummary({
  adSetDraft,
}: {
  adSetDraft: ReturnType<typeof useMetaCampaign>['adSetDraft'];
}) {
  return (
    <div style={summaryRowStyle()}>
      <span style={summaryLabelStyle}>Mode</span>
      <span>
        {adSetDraft.placementsMode === 'advantage-plus'
          ? 'Advantage+ placements (recommended)'
          : `Manual — ${(adSetDraft.manualPlacements ?? []).map((p) => MANUAL_PLACEMENT_LABEL[p]).join(', ') || 'none picked'}`}
      </span>
    </div>
  );
}

// ─── CHIP LIST FIELD ──────────────────────────────────────────────────

const DETAILED_TARGETING_SUGGESTIONS = [
  'Homeowners',
  'Household income $100k+',
  'Recent movers',
  'Home improvement interest',
  'DIY enthusiasts',
];

const CUSTOM_AUDIENCE_SUGGESTIONS = [
  'Site visitors 30d',
  'Email list',
  'Lookalike 1%',
  'Lookalike 2%',
  'Past leads',
];

const EXCLUSION_SUGGESTIONS = [
  'Existing customers',
  'Recent converters (7–14d)',
  'Past 30d converters',
  'Currently in lead funnel',
];

function ChipListField({
  label,
  placeholder,
  values,
  suggestions,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  suggestions: string[];
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const add = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setDraft('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: disabled ? 0.6 : 1 }}>
      <span style={fieldLabelStyle}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {values.map((v) => (
          <Chip
            key={v}
            size="md"
            selected
            deletable
            disabled={disabled}
            onDelete={() => onChange(values.filter((x) => x !== v))}
          >
            {v}
          </Chip>
        ))}
        {suggestions
          .filter((s) => !values.includes(s))
          .map((s) => (
            <Chip
              key={s}
              size="md"
              selected={false}
              disabled={disabled}
              onSelectionChange={() => add(s)}
            >
              {s}
            </Chip>
          ))}
      </div>
      <TextField
        size="sm"
        fullWidth
        value={draft}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(v) => setDraft(v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => {
          if (draft.trim()) add(draft);
        }}
      />
    </div>
  );
}

// ─── LOCAL HELPERS ───────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  options,
  onSelect,
  wrapperStyle,
}: {
  label: ReactNode;
  value: string;
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
  wrapperStyle?: CSSProperties;
}) {
  return (
    <div style={{ ...wrapperStyle }}>
      <span style={{ display: 'block', ...fieldLabelStyle, marginBottom: 6 }}>
        {label}
      </span>
      <Select
        value={value}
        onChange={onSelect}
        options={options.map((o) => ({ value: o.id, label: o.label }))}
        size="sm"
        fullWidth
      />
    </div>
  );
}

const fieldLabelStyle: CSSProperties = {
  fontSize: 14,
  letterSpacing: '0.28px',
  color: 'var(--dark-90)',
  fontWeight: 400,
};

function Field({
  label,
  children,
  compact: _compact,
}: {
  label: ReactNode;
  children: ReactNode;
  /** Reserved — Stage 2 fields all use the same compact rhythm now;
   *  prop kept so call sites can stay declarative for future variants. */
  compact?: boolean;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

function SectionLabel({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      {icon}
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{children}</span>
    </div>
  );
}

