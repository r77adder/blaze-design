import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Button, Heading, IconButton, Text } from '@/components';
import { Checkbox, Chip, Pill, Select, TextField } from '@/staging';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import VideoOn from '@/icons/20/VideoOn';
import Image from '@/icons/20/Image';
import {
  AD_CTA_OPTIONS,
  useMetaCampaign,
  type AdCta,
} from '../meta-campaign-context';
import {
  FORMAT_DISPLAY_LABEL,
  SOURCE_TYPE_LABEL,
  type Concept,
  type ConceptSourceType,
  type CopyOverrides,
  type Variant,
  type VariantSourceType,
} from '../concept/types';
import {
  resolveVariantCopy,
  variantHasDeviation,
} from '../concept/copy';
import { defaultAdName } from '../concept/ad-name';
import {
  CONCEPT_THEMES,
  materializeCustomConcept,
  materializeThemedConcept,
  materializeVariantFromSource,
} from '../concept/defaults';
import { PROVEN_ADS } from '../proven-ads';
import { ORGANIC_CREATIVE } from '../organic-creative';
import { COMPETITOR_CREATIVE } from '../competitor-creative';
import { AI_CREATIVE } from '../ai-creative';

/** Stage 3 — Ads: concepts as themes, each with a mixed-source variant slate
 *  underneath (past winner + organic + competitor + Blaze-generated). Copy
 *  inheritance + per-variant override marker work across the whole slate. */
export function Stage3Ads() {
  const {
    draft,
    concepts,
    addConcept,
    removeConcept,
    updateConcept,
    updateConceptCopy,
    addVariantToConcept,
    removeVariant,
    setVariantIncluded,
    setVariantCustomName,
    setVariantOverride,
    clearVariantOverride,
    updateVariant,
  } = useMetaCampaign();

  const includedCount = useMemo(
    () => concepts.reduce((sum, c) => sum + c.variants.filter((v) => v.included).length, 0),
    [concepts],
  );

  // Generation tracking. New variants land in "generating" state and reveal
  // one-by-one over ~1.6s — mirrors Blaze adapting the source creative to
  // the brand. On first mount, every existing variant is treated as fresh
  // so the user sees Blaze "do work" on the seeded default concept.
  const { generating, markGenerating } = useGenerationTracker();
  const initialMountRef = useRef(true);
  useEffect(() => {
    if (!initialMountRef.current) return;
    initialMountRef.current = false;
    const allIds = concepts.flatMap((c) => c.variants.map((v) => v.id));
    if (allIds.length > 0) markGenerating(allIds);
  }, [concepts, markGenerating]);

  const handleAddTheme = (themeId: string) => {
    const theme = CONCEPT_THEMES.find((t) => t.id === themeId);
    if (!theme) return;
    const concept = materializeThemedConcept(theme);
    addConcept(concept);
    markGenerating(concept.variants.map((v) => v.id));
  };

  const handleAddCustom = (name: string) => {
    if (name.trim()) addConcept(materializeCustomConcept(name));
  };

  const handleAddVariant = (conceptId: string, sourceType: VariantSourceType, refId: string) => {
    const variant = materializeVariantFromSource(sourceType, refId);
    if (!variant) return;
    addVariantToConcept(conceptId, variant);
    markGenerating([variant.id]);
  };

  // Theme names already used → hide them from the "Add concept" picker.
  const usedThemeNames = useMemo(
    () => new Set(concepts.map((c) => c.name.toLowerCase())),
    [concepts],
  );

  return (
    <div style={{ width: '100%', maxWidth: 880, margin: '0 auto' }}>
      <ShimmerKeyframes />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 6px' }}>
        <Heading level={2} style={{ color: 'var(--dark-90)' }}>
          Pick your ads
        </Heading>
        <Text variant="secondary">
          {includedCount} ad{includedCount === 1 ? '' : 's'} across {concepts.length} concept{concepts.length === 1 ? '' : 's'}
        </Text>
      </div>
      <Text variant="secondary">
        Each concept becomes one ad set under {draft.name}. Variants in a concept
        share copy so you isolate the angle, not the execution.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
        {concepts.map((c, i) => (
          <ConceptCard
            key={c.id}
            index={i}
            concept={c}
            campaignName={draft.name}
            generating={generating}
            onRemove={() => removeConcept(c.id)}
            onRename={(name) => updateConcept(c.id, { name })}
            onUpdateField={(patch) => updateConcept(c.id, patch)}
            onCopyChange={(field, value) => updateConceptCopy(c.id, { [field]: value })}
            onToggleVariant={(vid, included) => setVariantIncluded(c.id, vid, included)}
            onRenameVariant={(vid, name) => setVariantCustomName(c.id, vid, name)}
            onRemoveVariant={(vid) => removeVariant(c.id, vid)}
            onAddVariant={(sourceType, refId) => handleAddVariant(c.id, sourceType, refId)}
            onSetOverride={(vid, field, value) => setVariantOverride(c.id, vid, field, value)}
            onClearOverride={(vid, field) => clearVariantOverride(c.id, vid, field)}
            onUpdateVariant={(vid, patch) => updateVariant(c.id, vid, patch)}
            isOnlyConcept={concepts.length === 1}
          />
        ))}

        <AddConceptControl
          usedNames={usedThemeNames}
          onPickTheme={handleAddTheme}
          onAddCustom={handleAddCustom}
        />
      </div>
    </div>
  );
}

// ─── Concept card ───────────────────────────────────────────────────────

function ConceptCard({
  index,
  concept,
  campaignName,
  generating,
  onRemove,
  onRename,
  onUpdateField,
  onCopyChange,
  onToggleVariant,
  onRenameVariant,
  onRemoveVariant,
  onAddVariant,
  onSetOverride,
  onClearOverride,
  onUpdateVariant,
  isOnlyConcept,
}: {
  index: number;
  concept: Concept;
  campaignName: string;
  generating: Set<string>;
  onRemove: () => void;
  onRename: (name: string) => void;
  onUpdateField: (patch: Partial<Concept>) => void;
  onCopyChange: (field: 'primaryText' | 'headline' | 'description' | 'cta', value: string) => void;
  onToggleVariant: (vid: string, included: boolean) => void;
  onRenameVariant: (vid: string, name: string) => void;
  onRemoveVariant: (vid: string) => void;
  onAddVariant: (sourceType: VariantSourceType, refId: string) => void;
  onSetOverride: <K extends keyof CopyOverrides>(vid: string, field: K, value: CopyOverrides[K]) => void;
  onClearOverride: (vid: string, field?: keyof CopyOverrides) => void;
  onUpdateVariant: (vid: string, patch: Partial<Variant>) => void;
  isOnlyConcept: boolean;
}) {
  const mix = useMemo(() => sourceMix(concept), [concept]);
  const mixLabel = sourceMixLabel(mix);
  const strategyLine = strategySummary(concept);
  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        background: 'var(--light-100)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--dark-2)',
          borderBottom: '1px solid var(--dark-8)',
          borderTopLeftRadius: 13,
          borderTopRightRadius: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Heading level={3} style={{ margin: 0, color: 'var(--dark-90)' }}>
            Concept {index + 1}
          </Heading>
          <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 12 }}>
            {mixLabel}
          </Text>
        </div>
        <div style={{ display: 'inline-flex', width: 'auto', maxWidth: 280 }}>
          <TextField
            size="sm"
            value={concept.name}
            onChange={(v) => onRename(v)}
            aria-label="Concept name"
            style={{ width: 'auto', minWidth: 140, fontSize: 18, fontWeight: 500 }}
          />
        </div>
        {!isOnlyConcept && (
          <IconButton
            icon={Trash2}
            size="sm"
            variant="tertiary"
            aria-label="Remove concept"
            onPress={onRemove}
          />
        )}
      </div>

      {/* Blaze's read — read-only AI recommendation, one-line summary */}
      {strategyLine && (
        <div style={{ padding: '12px 20px' }}>
          <Text variant="secondary" style={{ color: 'var(--dark-80)', lineHeight: 1.5, display: 'block' }}>
            {strategyLine}
          </Text>
        </div>
      )}

      {/* Shared copy bundle */}
      <div
        style={{
          padding: 20,
          borderTop: '1px solid var(--dark-8)',
        }}
      >
        <Heading level={3} style={{ margin: '0 0 12px', color: 'var(--dark-90)' }}>
          Shared copy
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <CopyField
            label="Primary text"
            value={concept.copy.primaryText}
            onChange={(v) => onCopyChange('primaryText', v)}
            multiline
          />
          <CopyField
            label="Headline"
            value={concept.copy.headline}
            onChange={(v) => onCopyChange('headline', v)}
          />
          <CopyField
            label="Description"
            value={concept.copy.description}
            onChange={(v) => onCopyChange('description', v)}
            placeholder="Optional — Meta shows this under the headline."
          />
          <CtaSelect
            value={concept.copy.cta}
            onChange={(v) => onCopyChange('cta', v)}
          />
        </div>
      </div>

      {/* Variant slate */}
      <div style={{ padding: 20, borderTop: '1px solid var(--dark-8)' }}>
        <Heading level={3} style={{ margin: '0 0 12px', color: 'var(--dark-90)' }}>
          Variant slate
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          {concept.variants.map((v, i) => (
            <VariantTile
              key={v.id}
              variant={v}
              index={i}
              concept={concept}
              campaignName={campaignName}
              generating={generating.has(v.id)}
              onToggle={(included) => onToggleVariant(v.id, included)}
              onRename={(name) => onRenameVariant(v.id, name)}
              onRemove={() => onRemoveVariant(v.id)}
              onSetOverride={(field, value) => onSetOverride(v.id, field, value)}
              onClearOverride={(field) => onClearOverride(v.id, field)}
              onUpdateVariant={(patch) => onUpdateVariant(v.id, patch)}
            />
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <AddVariantTile
            usedRefIds={new Set(concept.variants.map((v) => v.sourceRefId))}
            onPick={onAddVariant}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Source-mix summary on concept header ────────────────────────────────

interface SourceMix {
  proven: number;
  organic: number;
  competitor: number;
  ai: number;
}

function sourceMix(concept: Concept): SourceMix {
  const mix: SourceMix = { proven: 0, organic: 0, competitor: 0, ai: 0 };
  for (const v of concept.variants) mix[v.sourceType] += 1;
  return mix;
}

/** Compact "N ads · <source phrasing>" label describing a concept's slate. */
function sourceMixLabel(mix: SourceMix): string {
  const entries = (['proven', 'organic', 'competitor', 'ai'] as VariantSourceType[])
    .filter((k) => mix[k] > 0);
  const total = entries.reduce((sum, k) => sum + mix[k], 0);
  return entries.length === 0
    ? 'Empty slate — add variants below'
    : entries.length === 1
      ? `${total} ad${total === 1 ? '' : 's'} · ${SOURCE_TYPE_LABEL[entries[0]].toLowerCase()}`
      : `${total} ads · mixed sources`;
}

const SOURCE_PALETTE: Record<VariantSourceType, { bg: string; fg: string }> = {
  proven: { bg: 'rgba(4, 175, 0, 0.12)', fg: 'var(--status-approved)' },
  organic: { bg: 'rgba(1, 121, 207, 0.12)', fg: 'var(--status-posting)' },
  competitor: { bg: 'rgba(237, 124, 44, 0.12)', fg: 'var(--status-connect)' },
  ai: { bg: 'rgba(124, 92, 252, 0.12)', fg: 'var(--purple)' },
};

// ─── Variant tile ────────────────────────────────────────────────────────

function VariantTile({
  variant,
  index,
  concept,
  campaignName,
  generating,
  onToggle,
  onRename,
  onRemove,
  onSetOverride,
  onClearOverride,
  onUpdateVariant,
}: {
  variant: Variant;
  index: number;
  concept: Concept;
  campaignName: string;
  generating: boolean;
  onToggle: (included: boolean) => void;
  onRename: (name: string) => void;
  onRemove: () => void;
  onSetOverride: <K extends keyof CopyOverrides>(field: K, value: CopyOverrides[K]) => void;
  onClearOverride: (field?: keyof CopyOverrides) => void;
  onUpdateVariant: (patch: Partial<Variant>) => void;
}) {
  const [showOverrides, setShowOverrides] = useState(false);
  const [showNameField, setShowNameField] = useState(!!variant.customName);
  const resolved = resolveVariantCopy(variant, concept);
  const deviates = variantHasDeviation(variant, concept);
  const generatedName = defaultAdName({ campaignName, concept, variant, index });
  const palette = SOURCE_PALETTE[variant.sourceType];

  if (generating) {
    return <GeneratingVariantTile variant={variant} palette={palette} />;
  }

  // Blaze-generated variants render in a row layout that mirrors the
  // AddAdsModal's BlazeGeneratedCard pattern — Topic label, concept name,
  // AI content-type pill — instead of the standard 4:5 tile. They span
  // the full grid row so the layout reads as "AI authoring card".
  if (variant.sourceType === 'ai') {
    return (
      <AiVariantTile
        variant={variant}
        concept={concept}
        index={index}
        campaignName={campaignName}
        resolved={resolved}
        deviates={deviates}
        generatedName={generatedName}
        showOverrides={showOverrides}
        setShowOverrides={setShowOverrides}
        showNameField={showNameField}
        setShowNameField={setShowNameField}
        onToggle={onToggle}
        onRename={onRename}
        onRemove={onRemove}
        onSetOverride={onSetOverride}
        onClearOverride={onClearOverride}
        onUpdateVariant={onUpdateVariant}
      />
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${variant.included ? (deviates ? 'var(--purple)' : 'var(--dark-15)') : 'var(--dark-8)'}`,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--light-100)',
        opacity: variant.included ? 1 : 0.55,
        transition: 'opacity 120ms ease, border-color 120ms ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '4 / 5', background: 'var(--dark-4)' }}>
        <img
          src={variant.image}
          alt={`${variant.format} variant`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Pill
          size="sm"
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'var(--light-100)',
            color: palette.fg,
          }}
        >
          {SOURCE_TYPE_LABEL[variant.sourceType]}
          {variant.sourceMetric && <> · {variant.sourceMetric}</>}
        </Pill>
        <Pill
          size="sm"
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'var(--light-100)',
            color: 'var(--dark-90)',
          }}
        >
          {FORMAT_DISPLAY_LABEL[variant.format]}
        </Pill>
      </div>

      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Included */}
        <Checkbox checked={variant.included} onChange={onToggle}>
          Included
        </Checkbox>

        {/* Ad name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>Ad name</span>
          {showNameField ? (
            <TextField
              size="sm"
              fullWidth
              value={variant.customName ?? generatedName}
              onChange={(v) => onRename(v)}
              onBlur={() => {
                if (!variant.customName?.trim()) setShowNameField(false);
              }}
              autoFocus
              aria-label="Ad name"
              style={{ fontSize: 12 }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNameField(true)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--dark-60)',
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title="Click to customize"
            >
              {variant.customName?.trim() || generatedName}
            </button>
          )}
        </div>

        {/* Resolved copy preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.3 }}>
            {resolved.headline}
          </span>
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            CTA — {resolved.cta}
          </span>
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button
            variant="secondary"
            size="xs"
            onPress={() => setShowOverrides((p) => !p)}
          >
            {showOverrides ? 'Hide overrides' : deviates ? 'Edit override' : 'Override copy'}
          </Button>
          <IconButton
            icon={Trash2}
            size="sm"
            variant="tertiary"
            aria-label="Remove variant"
            onPress={onRemove}
          />
        </div>

        {showOverrides && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
            <VariantAssetField
              variant={variant}
              onUpdateVariant={onUpdateVariant}
            />
            <OverrideField
              label="Destination URL (per-ad override)"
              shared=""
              value={variant.overrides?.websiteUrl}
              onChange={(v) => onSetOverride('websiteUrl', v)}
              onClear={() => onClearOverride('websiteUrl')}
              placeholder="Inherits ad-set URL when blank"
            />
            <OverrideField
              label="Headline"
              shared={concept.copy.headline}
              value={variant.overrides?.headline}
              onChange={(v) => onSetOverride('headline', v)}
              onClear={() => onClearOverride('headline')}
            />
            <OverrideField
              label="Primary text"
              shared={concept.copy.primaryText}
              value={variant.overrides?.primaryText}
              onChange={(v) => onSetOverride('primaryText', v)}
              onClear={() => onClearOverride('primaryText')}
              multiline
            />
            <button
              type="button"
              onClick={() => onClearOverride()}
              style={{
                alignSelf: 'flex-start',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                color: 'var(--dark-60)',
                textDecoration: 'underline',
              }}
            >
              Reset all overrides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Row-layout tile for Blaze-generated variants. Mirrors the
 *  BlazeGeneratedCard pattern from AddAdsModal — 100×100 preview on the
 *  left, Topic + concept name + AI content-type pill on the right —
 *  while preserving the Stage 3 variant controls (Included toggle,
 *  ad name, copy override, asset link/brief, remove). Spans the full
 *  3-column slate grid via gridColumn: '1 / -1'. */
function AiVariantTile({
  variant,
  concept,
  resolved,
  deviates,
  generatedName,
  showOverrides,
  setShowOverrides,
  showNameField,
  setShowNameField,
  onToggle,
  onRename,
  onRemove,
  onSetOverride,
  onClearOverride,
  onUpdateVariant,
}: {
  variant: Variant;
  concept: Concept;
  index: number;
  campaignName: string;
  resolved: ReturnType<typeof resolveVariantCopy>;
  deviates: boolean;
  generatedName: string;
  showOverrides: boolean;
  setShowOverrides: (next: boolean | ((prev: boolean) => boolean)) => void;
  showNameField: boolean;
  setShowNameField: (next: boolean) => void;
  onToggle: (included: boolean) => void;
  onRename: (name: string) => void;
  onRemove: () => void;
  onSetOverride: <K extends keyof CopyOverrides>(field: K, value: CopyOverrides[K]) => void;
  onClearOverride: (field?: keyof CopyOverrides) => void;
  onUpdateVariant: (patch: Partial<Variant>) => void;
}) {
  const { label: contentTypeLabel, Icon: ContentTypeIcon, color: contentTypeColor } =
    aiContentTypeFor(variant.format);
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        display: 'flex',
        gap: 14,
        padding: 14,
        borderRadius: 12,
        border: `1px solid ${variant.included ? (deviates ? 'var(--purple)' : 'var(--dark-15)') : 'var(--dark-8)'}`,
        background: 'var(--light-100)',
        opacity: variant.included ? 1 : 0.55,
        transition: 'opacity 120ms ease, border-color 120ms ease',
        alignItems: 'flex-start',
      }}
    >
      {/* Square preview */}
      <div
        style={{
          position: 'relative',
          width: 100,
          height: 100,
          borderRadius: 10,
          overflow: 'hidden',
          background: 'var(--dark-4)',
          flexShrink: 0,
        }}
      >
        <img
          src={variant.image}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <Pill
          aria-hidden
          size="sm"
          style={{
            position: 'absolute',
            left: 6,
            bottom: 6,
            background: 'var(--light-100)',
            color: 'var(--purple)',
          }}
        >
          AI
        </Pill>
      </div>

      {/* Right side */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Topic label + Included + action icons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            minHeight: 24,
          }}
        >
          <span
            style={{
              fontSize: 12,
              letterSpacing: '0.22px',
              color: 'var(--dark-60)',
            }}
          >
            Topic
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Checkbox checked={variant.included} onChange={onToggle}>
              Included
            </Checkbox>
            <IconButton
              icon={ArrowRefresh}
              size="sm"
              variant="tertiary"
              aria-label="Regenerate"
            />
            <IconButton
              icon={Trash2}
              size="sm"
              variant="tertiary"
              aria-label="Remove variant"
              onPress={onRemove}
            />
          </div>
        </div>

        {/* Concept name */}
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.3 }}>
          {concept.name}
        </div>

        {/* Resolved headline + CTA caption */}
        <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.5 }}>
          {resolved.headline} <span style={{ color: 'var(--dark-60)' }}>·</span> CTA — {resolved.cta}
        </div>

        {/* Ad name (click to edit) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--dark-60)', letterSpacing: '0.22px' }}>
            Ad name
          </span>
          {showNameField ? (
            <TextField
              size="sm"
              fullWidth
              value={variant.customName ?? generatedName}
              onChange={(v) => onRename(v)}
              onBlur={() => {
                if (!variant.customName?.trim()) setShowNameField(false);
              }}
              autoFocus
              aria-label="Ad name"
              style={{ fontSize: 12 }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNameField(true)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--dark-60)',
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title="Click to customize"
            >
              {variant.customName?.trim() || generatedName}
            </button>
          )}
        </div>

        {/* Controls row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            marginTop: 4,
          }}
        >
          <Pill
            size="sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(124, 92, 252, 0.10)',
              color: 'var(--purple)',
            }}
          >
            <ContentTypeIcon size={12} color={contentTypeColor} />
            {contentTypeLabel}
          </Pill>
          <Chip variant="add" size="sm">
            Add context
          </Chip>
          <Button variant="secondary" size="sm" onPress={() => setShowOverrides((p) => !p)}>
            {showOverrides ? 'Hide overrides' : deviates ? 'Edit override' : 'Override copy'}
          </Button>
        </div>

        {showOverrides && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 8,
              paddingTop: 12,
              borderTop: '1px solid var(--dark-8)',
            }}
          >
            <VariantAssetField variant={variant} onUpdateVariant={onUpdateVariant} />
            <OverrideField
              label="Destination URL (per-ad override)"
              shared=""
              value={variant.overrides?.websiteUrl}
              onChange={(v) => onSetOverride('websiteUrl', v)}
              onClear={() => onClearOverride('websiteUrl')}
              placeholder="Inherits ad-set URL when blank"
            />
            <OverrideField
              label="Headline"
              shared={concept.copy.headline}
              value={variant.overrides?.headline}
              onChange={(v) => onSetOverride('headline', v)}
              onClear={() => onClearOverride('headline')}
            />
            <OverrideField
              label="Primary text"
              shared={concept.copy.primaryText}
              value={variant.overrides?.primaryText}
              onChange={(v) => onSetOverride('primaryText', v)}
              onClear={() => onClearOverride('primaryText')}
              multiline
            />
            <button
              type="button"
              onClick={() => onClearOverride()}
              style={{
                alignSelf: 'flex-start',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                color: 'var(--dark-60)',
                textDecoration: 'underline',
              }}
            >
              Reset all overrides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Map our internal CreativeFormat onto the form's "AI content type"
 *  label + icon. Mirrors AddAdsModal's aiContentTypeFor. */
function aiContentTypeFor(format: Variant['format']): {
  label: string;
  Icon: typeof VideoOn;
  color: string;
} {
  switch (format) {
    case 'Reel':
    case 'UGC':
      return { label: 'AI Avatar Video', Icon: VideoOn, color: 'var(--purple)' };
    case 'Carousel':
      return { label: 'AI Carousel', Icon: Image, color: 'var(--status-connect)' };
    case 'Static':
    default:
      return { label: 'Still image post', Icon: Image, color: 'var(--status-connect)' };
  }
}

function OverrideField({
  label,
  shared,
  value,
  onChange,
  onClear,
  multiline,
  placeholder,
}: {
  label: string;
  shared: string;
  value?: string;
  onChange: (v: string) => void;
  onClear: () => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const deviating = value && value !== shared;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, color: 'var(--dark-60)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        {deviating && (
          <button
            type="button"
            onClick={onClear}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
              color: 'var(--purple)',
            }}
          >
            Clear
          </button>
        )}
      </span>
      {multiline ? (
        <textarea
          value={value ?? shared}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          style={{
            ...overrideInputStyle,
            resize: 'vertical',
            lineHeight: 1.4,
            color: deviating ? 'var(--purple)' : 'var(--dark-90)',
          }}
        />
      ) : (
        <TextField
          size="sm"
          fullWidth
          value={value ?? shared}
          placeholder={placeholder}
          onChange={(v) => onChange(v)}
          aria-label={label}
          style={{ color: deviating ? 'var(--purple)' : 'var(--dark-90)' }}
        />
      )}
    </div>
  );
}

/** Asset link vs Brief toggle on each variant — matches the form's
 *  per-ad "Link to asset" / "Brief for asset" choice. */
function VariantAssetField({
  variant,
  onUpdateVariant,
}: {
  variant: Variant;
  onUpdateVariant: (patch: Partial<Variant>) => void;
}) {
  const mode = variant.assetMode ?? 'link';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>Creative asset</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {(['link', 'brief'] as const).map((m) => {
          const selected = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onUpdateVariant({ assetMode: m })}
              style={{
                flex: 1,
                padding: '4px 8px',
                background: 'var(--light-100)',
                color: selected ? 'var(--dark-90)' : 'var(--dark-60)',
                border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {m === 'link' ? 'Asset link' : 'Brief'}
            </button>
          );
        })}
      </div>
      {mode === 'link' ? (
        <TextField
          size="sm"
          fullWidth
          value={variant.assetLink ?? ''}
          placeholder="https:// link to the finished asset"
          onChange={(v) => onUpdateVariant({ assetLink: v })}
          aria-label="Asset link"
        />
      ) : (
        <textarea
          value={variant.assetBrief ?? ''}
          placeholder="visual, format / aspect ratio (1:1, 9:16), key message, brand/legal elements"
          onChange={(e) => onUpdateVariant({ assetBrief: e.target.value })}
          rows={2}
          style={{ ...overrideInputStyle, resize: 'vertical', lineHeight: 1.4 }}
        />
      )}
    </div>
  );
}

// ─── Add variant tile (in-slate picker) ──────────────────────────────────

function AddVariantTile({
  usedRefIds,
  onPick,
}: {
  usedRefIds: Set<string>;
  onPick: (sourceType: VariantSourceType, refId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<VariantSourceType>('proven');

  const options = useMemo(() => sourceOptions(tab).filter((o) => !usedRefIds.has(o.id)), [tab, usedRefIds]);

  return (
    <div style={{ position: 'relative' }}>
      <Button variant="secondary" size="sm" frontIcon={Plus} onPress={() => setOpen((p) => !p)}>
        Add variant
      </Button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: 300,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
            zIndex: 20,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(['proven', 'organic', 'competitor', 'ai'] as VariantSourceType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 999,
                  background: 'var(--light-100)',
                  color: 'var(--dark-90)',
                  border: `1px solid ${tab === t ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {SOURCE_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {options.length === 0 ? (
              <Text variant="secondary" style={{ color: 'var(--dark-60)', padding: 8, fontSize: 12 }}>
                All {SOURCE_TYPE_LABEL[tab].toLowerCase()} sources are already in this slate.
              </Text>
            ) : (
              options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onPick(tab, o.id);
                    setOpen(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '6px 8px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    fontFamily: 'inherit',
                    fontSize: 12,
                    color: 'var(--dark-90)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {o.label}
                  </span>
                  {o.metric && (
                    <span style={{ fontSize: 12, color: 'var(--dark-60)', flexShrink: 0 }}>{o.metric}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function sourceOptions(sourceType: ConceptSourceType): { id: string; label: string; metric: string }[] {
  switch (sourceType) {
    case 'proven':
      return PROVEN_ADS.map((p) => ({ id: p.id, label: p.campaignName, metric: p.metric }));
    case 'organic':
      return ORGANIC_CREATIVE.map((o) => ({ id: o.id, label: o.platform, metric: o.metric }));
    case 'competitor':
      return COMPETITOR_CREATIVE.map((c) => ({ id: c.id, label: c.peer, metric: c.metric }));
    case 'ai':
      return AI_CREATIVE.map((a) => ({ id: a.id, label: a.concept, metric: '' }));
  }
}

// ─── Strategy + copy primitives ──────────────────────────────────────────

/** One-line "Blaze's read" — distills the concept's rationale and strategy
 *  fields (audience / value prop / offer) into a single summary sentence.
 *  Returns an empty string for concepts with nothing to show (empty custom
 *  concepts collapse silently). */
function strategySummary(concept: Concept): string {
  if (concept.rationale) return concept.rationale;
  const parts: string[] = [];
  if (concept.valueProp) parts.push(concept.valueProp);
  if (concept.intendedAudience) parts.push(`for ${concept.intendedAudience}`);
  if (concept.offerAngle) parts.push(`— ${concept.offerAngle}`);
  return parts.join(' ');
}

function CopyField({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 14, color: 'var(--dark-90)', letterSpacing: '0.28px', fontWeight: 400 }}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          style={{
            padding: '10px 12px',
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 8,
            fontFamily: "'Sohne', sans-serif",
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--dark-90)',
            resize: 'vertical',
            outline: 'none',
            minHeight: 78,
          }}
        />
      ) : (
        <TextField
          size="sm"
          fullWidth
          value={value}
          onChange={(v) => onChange(v)}
          placeholder={placeholder}
          aria-label={label}
        />
      )}
    </div>
  );
}

function CtaSelect({ value, onChange }: { value: AdCta; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 14, color: 'var(--dark-90)', letterSpacing: '0.28px', fontWeight: 400 }}>Call to action</span>
      <Select
        value={value}
        onChange={(v) => onChange(v)}
        options={AD_CTA_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
        size="sm"
        fullWidth
        aria-label="Call to action"
      />
    </div>
  );
}

// ─── Add concept dropdown ────────────────────────────────────────────────

function AddConceptControl({
  usedNames,
  onPickTheme,
  onAddCustom,
}: {
  usedNames: Set<string>;
  onPickTheme: (themeId: string) => void;
  onAddCustom: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const themes = CONCEPT_THEMES.filter((t) => !usedNames.has(t.name.toLowerCase()));

  return (
    <div style={{ position: 'relative' }}>
      <Button variant="secondary" size="md" frontIcon={Plus} onPress={() => setOpen((p) => !p)}>
        Add concept
      </Button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 14,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
            zIndex: 20,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 12, letterSpacing: '0.22px', marginBottom: 6 }}>
              Recommended themes
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {themes.length === 0 ? (
                <Text variant="secondary" style={{ padding: 8, color: 'var(--dark-60)' }}>
                  All recommended themes are already in this campaign.
                </Text>
              ) : (
                themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onPickTheme(t.id);
                      setOpen(false);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
                      {t.name}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.4 }}>
                      {t.rationale}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--dark-8)', paddingTop: 10 }}>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 12, letterSpacing: '0.22px', marginBottom: 6 }}>
              Or name your own theme
            </Text>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <TextField
                size="sm"
                fullWidth
                value={customName}
                onChange={(v) => setCustomName(v)}
                placeholder="e.g. Color confidence"
                aria-label="Custom theme name"
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customName.trim()) {
                    onAddCustom(customName);
                    setCustomName('');
                    setOpen(false);
                  }
                }}
              />
              <Button
                variant="primary"
                size="sm"
                isDisabled={!customName.trim()}
                onPress={() => {
                  if (customName.trim()) {
                    onAddCustom(customName);
                    setCustomName('');
                    setOpen(false);
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Local style primitives ──────────────────────────────────────────────

// ─── Generation tracker (UI-only loading state) ──────────────────────────

/** Tracks which variant IDs are currently "generating" — drives the shimmer
 *  on the tile and the banner up top. New variants enter generating state
 *  and reveal one-by-one over ~1.6s (staggered) so the user feels Blaze
 *  doing work rather than the UI snapping into place. */
function useGenerationTracker() {
  const [generating, setGenerating] = useState<Set<string>>(new Set());

  const markGenerating = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setGenerating((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
    // Staggered reveal: ~600ms base + 250ms per variant.
    ids.forEach((id, i) => {
      const delay = 600 + i * 250;
      window.setTimeout(() => {
        setGenerating((prev) => {
          if (!prev.has(id)) return prev;
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, delay);
    });
  }, []);

  return {
    generating,
    markGenerating,
    isAnyGenerating: generating.size > 0,
  };
}

/** Skeleton state shown while Blaze is "generating" a variant. Keeps the
 *  source pill visible (we already know provenance) and replaces the image
 *  + copy preview with shimmer bars. */
function GeneratingVariantTile({
  variant,
  palette,
}: {
  variant: Variant;
  palette: { bg: string; fg: string };
}) {
  return (
    <div
      style={{
        border: '1px solid var(--dark-15)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--light-100)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 5',
          background:
            'linear-gradient(90deg, var(--dark-4) 0%, var(--dark-8) 50%, var(--dark-4) 100%)',
          backgroundSize: '200% 100%',
          animation: 'blaze-shimmer 1.4s linear infinite',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 999,
            background: palette.bg,
            color: palette.fg,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {SOURCE_TYPE_LABEL[variant.sourceType]}
          {variant.sourceMetric && <span style={{ opacity: 0.7 }}>· {variant.sourceMetric}</span>}
        </span>
        <span
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            padding: '3px 8px',
            borderRadius: 999,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'var(--light-100)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {FORMAT_DISPLAY_LABEL[variant.format]}
        </span>
        <div
          aria-live="polite"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--purple)',
            fontFamily: "'Sohne', sans-serif",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.24px',
          }}
        >
          <span>Generating…</span>
        </div>
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ShimmerBar width="70%" height={10} />
        <ShimmerBar width="90%" height={12} />
        <ShimmerBar width="55%" height={10} />
      </div>
    </div>
  );
}

function ShimmerBar({ width, height }: { width: string; height: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background:
          'linear-gradient(90deg, var(--dark-4) 0%, var(--dark-8) 50%, var(--dark-4) 100%)',
        backgroundSize: '200% 100%',
        animation: 'blaze-shimmer 1.4s linear infinite',
      }}
    />
  );
}

/** Inject the keyframes once at the top of Stage 3. Prototype-only — the
 *  vetted lib will use real CSS modules. */
function ShimmerKeyframes() {
  return (
    <style>
      {`@keyframes blaze-shimmer {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }
      @keyframes blaze-pulse {
        0%, 100% { background-color: rgba(124, 92, 252, 0.07); }
        50% { background-color: rgba(124, 92, 252, 0.18); }
      }`}
    </style>
  );
}

const overrideInputStyle: CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-15)',
  borderRadius: 6,
  fontFamily: "'Sohne', sans-serif",
  fontSize: 12,
  outline: 'none',
};
