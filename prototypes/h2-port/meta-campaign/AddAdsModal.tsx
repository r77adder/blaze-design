import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Button, Heading, Text } from '@/components';
import Close from '@/icons/20/Close';
import Stars from '@/icons/20/Stars';
import MetaBrand from '@/icons/20/MetaBrand';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import Plus from '@/icons/20/Plus';
import VideoOn from '@/icons/20/VideoOn';
import Image from '@/icons/20/Image';
import { COMPETITOR_CREATIVE } from './competitor-creative';
import { ORGANIC_CREATIVE } from './organic-creative';
import { AI_CREATIVE } from './ai-creative';
import { PROVEN_ADS } from './proven-ads';
import {
  buildAdFromGenerated,
  useMetaCampaign,
  type GeneratedAd,
} from './meta-campaign-context';
import { synthesizeAdSets } from './concept/synthesize';
import {
  FORMAT_DISPLAY_LABEL,
  SOURCE_TYPE_LABEL,
  type Concept,
  type VariantSourceType,
} from './concept/types';
import { materializeVariantFromSource } from './concept/defaults';
import type { Campaign } from '../pages/PaidSocial';

/** Per-ad budget Blaze stages each new variant at. Matches the campaign
 *  flow's default — user can adjust on the detail page after launch. */
const DEFAULT_PER_AD_BUDGET = 25;

const SRC_PALETTE: Record<VariantSourceType, { bg: string; fg: string }> = {
  proven: { bg: 'rgba(4, 175, 0, 0.12)', fg: 'var(--status-approved)' },
  organic: { bg: 'rgba(1, 121, 207, 0.12)', fg: 'var(--status-posting)' },
  competitor: { bg: 'rgba(237, 124, 44, 0.12)', fg: 'var(--status-connect)' },
  ai: { bg: 'rgba(124, 92, 252, 0.12)', fg: 'var(--purple)' },
};

interface PickedVariant {
  key: string;
  sourceType: VariantSourceType;
  refId: string;
  format: string;
  image: string;
  metric: string;
  origin: string;
}

export interface AddAdsModalProps {
  open: boolean;
  campaign: Campaign;
  /** Pre-selects the concept the new ads should land under. */
  targetConceptId?: string;
  onClose: () => void;
}

/**
 * In-campaign "Add ads" flow — mirrors Stage 3's Add-variant pattern from
 * the create-campaign wizard:
 *
 *  • Target concept is fixed (passed via targetConceptId) or auto-picked.
 *  • Body shows that concept's shared copy as read-only context so the
 *    user knows what the new ads will inherit.
 *  • 4-tab inline source picker (Past winner / Organic / Competitor /
 *    Blaze AI). Picking an entry adds it to a "Variants to add" strip.
 *  • Submit dispatches each picked variant as an Ad tagged with the
 *    target conceptId so the detail page groups them correctly.
 */
export function AddAdsModal({ open, campaign, targetConceptId, onClose }: AddAdsModalProps) {
  const { addAdsToCampaign, addedConceptsByCampaign } = useMetaCampaign();
  const extraConcepts = useMemo(
    () => addedConceptsByCampaign[campaign.id] ?? [],
    [addedConceptsByCampaign, campaign.id],
  );
  const campaignId = campaign.id;
  const campaignName = campaign.name;

  // Find the target concept — caller picks, or default to the first one
  // that surfaces from the campaign's hierarchy.
  const targetConcepts = useMemo<Concept[]>(() => {
    const adSets = synthesizeAdSets(campaign, extraConcepts);
    return adSets.flatMap((a) => a.concepts);
  }, [campaign, extraConcepts]);

  const resolvedConcept = useMemo<Concept | null>(() => {
    if (targetConceptId) {
      const match = targetConcepts.find((c) => c.id === targetConceptId);
      if (match) return match;
    }
    return targetConcepts[0] ?? null;
  }, [targetConceptId, targetConcepts]);

  const targetAdSetName = useMemo<string>(() => {
    if (!resolvedConcept) return campaignName;
    const adSets = synthesizeAdSets(campaign, extraConcepts);
    for (const a of adSets) {
      if (a.concepts.some((c) => c.id === resolvedConcept.id)) return a.name;
    }
    return campaignName;
  }, [resolvedConcept, campaign, extraConcepts, campaignName]);

  // Local picker state
  const [tab, setTab] = useState<VariantSourceType>('proven');
  const [picked, setPicked] = useState<PickedVariant[]>([]);

  // Reset whenever the modal closes so re-opening starts clean.
  useEffect(() => {
    if (!open) {
      setPicked([]);
      setTab('proven');
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Source-data options to pick from, minus what's already in the target
  // concept's slate and what the user has already picked.
  const alreadyInSlate = new Set(resolvedConcept?.variants.map((v) => v.sourceRefId) ?? []);
  const alreadyPicked = new Set(picked.map((p) => p.refId));
  const options = sourceOptions(tab).filter(
    (o) => !alreadyInSlate.has(o.id) && !alreadyPicked.has(o.id),
  );

  const addPick = (refId: string) => {
    const v = materializeVariantFromSource(tab, refId);
    if (!v) return;
    const labelEntry = sourceOptions(tab).find((o) => o.id === refId);
    setPicked((prev) => [
      ...prev,
      {
        key: `${tab}-${refId}-${prev.length}`,
        sourceType: tab,
        refId,
        format: v.format,
        image: v.image,
        metric: v.sourceMetric,
        origin: labelEntry?.label ?? refId,
      },
    ]);
  };

  const removePick = (key: string) => {
    setPicked((prev) => prev.filter((p) => p.key !== key));
  };

  const handleAdd = () => {
    if (picked.length === 0 || !resolvedConcept) return;
    // New ads inherit the concept's shared copy bundle directly.
    const copy = resolvedConcept.copy;
    const ads = picked.map((p, i) => {
      const generated: GeneratedAd = {
        id: `gen-${p.refId}-${Date.now()}-${i}`,
        sourceId: p.refId,
        source: p.sourceType,
        origin: p.origin,
        metric: p.metric,
        format: p.format as never,
        image: p.image,
        headline: copy.headline || '',
        primaryText: copy.primaryText || '',
        cta: copy.cta || 'Learn more',
        included: true,
      };
      return {
        ...buildAdFromGenerated(generated, DEFAULT_PER_AD_BUDGET),
        conceptId: resolvedConcept.id,
      };
    });
    addAdsToCampaign(campaignId, ads);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add ads to campaign"
      onClick={onClose}
      style={overlayStyle}
    >
      <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <MetaBrand size={20} />
            <Text style={{ color: 'var(--dark-90)', fontSize: 15, fontWeight: 500 }}>
              Add ads to <span style={{ fontWeight: 600 }}>{targetAdSetName}</span>
            </Text>
            <span style={blazeBadgeStyle}>
              <Stars size={12} color="var(--purple)" />
              Blaze AI
            </span>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} style={closeBtnStyle}>
            <Close size={18} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Heading level={3} style={{ margin: 0, fontSize: 22 }}>
                Pick creative
              </Heading>
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
                New ads inherit shared copy from the concept below. Pull from any
                of the four sources — Blaze adapts each into a brand-safe ad.
              </Text>
            </div>

            {resolvedConcept && (
              <SharedCopyContext concept={resolvedConcept} />
            )}

            {/* Source tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['proven', 'organic', 'competitor', 'ai'] as VariantSourceType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 999,
                    background: tab === t ? 'var(--dark-90)' : 'var(--light-100)',
                    color: tab === t ? 'var(--light-100)' : 'var(--dark-90)',
                    border: `1px solid ${tab === t ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 12,
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {t === 'ai' && (
                    <Stars
                      size={11}
                      color={tab === t ? 'var(--light-100)' : 'var(--purple)'}
                    />
                  )}
                  {SOURCE_TYPE_LABEL[t]}
                </button>
              ))}
            </div>

            {/* Source entries — AI uses a richer row layout (PostCard-style),
             *  the other three sources use a compact 3-col card grid. */}
            {options.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: 'center',
                  color: 'var(--dark-60)',
                  fontSize: 13,
                  border: '1px dashed var(--dark-15)',
                  borderRadius: 12,
                }}
              >
                Every {SOURCE_TYPE_LABEL[tab].toLowerCase()} source is already
                in this concept or your picked list.
              </div>
            ) : tab === 'ai' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {options.map((o) => (
                  <BlazeGeneratedCard
                    key={o.id}
                    option={o}
                    onAdd={() => addPick(o.id)}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 10,
                }}
              >
                {options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => addPick(o.id)}
                    style={{
                      textAlign: 'left',
                      padding: 0,
                      background: 'var(--light-100)',
                      border: '1px solid var(--dark-8)',
                      borderRadius: 12,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 120ms ease, box-shadow 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--dark-90)';
                      e.currentTarget.style.boxShadow = '0 0 0 1px var(--dark-90)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--dark-8)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {o.image && (
                      <div
                        style={{
                          aspectRatio: '4 / 5',
                          background: 'var(--dark-4)',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={o.image}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
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
                            background: SRC_PALETTE[tab].bg,
                            color: SRC_PALETTE[tab].fg,
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {SOURCE_TYPE_LABEL[tab]}
                          {o.metric && <span style={{ opacity: 0.7 }}>· {o.metric}</span>}
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
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {o.format ? FORMAT_DISPLAY_LABEL[o.format] : 'Static'}
                        </span>
                      </div>
                    )}
                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>
                        {o.label}
                      </span>
                      {o.hook && (
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--dark-60)',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {o.hook}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Picked variants */}
            {picked.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text
                  variant="secondary"
                  style={{ color: 'var(--dark-60)', fontSize: 11, letterSpacing: '0.22px' }}
                >
                  Adding {picked.length} ad{picked.length === 1 ? '' : 's'}
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {picked.map((p) => (
                    <div
                      key={p.key}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px 6px 6px',
                        background: 'var(--dark-4)',
                        border: '1px solid var(--dark-8)',
                        borderRadius: 999,
                        fontSize: 12,
                      }}
                    >
                      <img
                        src={p.image}
                        alt=""
                        style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }}
                      />
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: 999,
                          background: SRC_PALETTE[p.sourceType].bg,
                          color: SRC_PALETTE[p.sourceType].fg,
                          fontSize: 10,
                          fontWeight: 500,
                        }}
                      >
                        {SOURCE_TYPE_LABEL[p.sourceType]}
                      </span>
                      <span style={{ color: 'var(--dark-90)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.origin}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${p.origin}`}
                        onClick={() => removePick(p.key)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: 'var(--dark-60)',
                          fontFamily: 'inherit',
                          fontSize: 14,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <Button
            variant="primary"
            size="lg"
            isDisabled={picked.length === 0}
            onPress={handleAdd}
            frontIcon={Stars}
          >
            Add {picked.length || ''} ad{picked.length === 1 ? '' : 's'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Read-only summary of the target concept's shared copy — sets expectation
 *  that the new ads will inherit this. */
function SharedCopyContext({ concept }: { concept: Concept }) {
  const hasCopy =
    concept.copy.headline || concept.copy.primaryText || concept.copy.description;
  if (!hasCopy) return null;
  return (
    <div
      style={{
        padding: '12px 14px',
        background: 'rgba(124, 92, 252, 0.06)',
        border: '1px solid rgba(124, 92, 252, 0.18)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          color: 'var(--purple)',
          fontWeight: 500,
        }}
      >
        <Stars size={11} color="currentColor" />
        New ads will inherit this copy from "{concept.name}"
      </div>
      {concept.copy.headline && (
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>
          {concept.copy.headline}
        </div>
      )}
      {concept.copy.primaryText && (
        <div style={{ fontSize: 12, color: 'var(--dark-80)', lineHeight: 1.4 }}>
          {concept.copy.primaryText}
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--dark-60)' }}>
        CTA — {concept.copy.cta}
      </div>
    </div>
  );
}

// ─── SOURCE DATA HELPERS ──────────────────────────────────────────────

interface SourceOption {
  id: string;
  label: string;
  hook?: string;
  metric: string;
  image: string;
  format: 'Reel' | 'Static' | 'Carousel' | 'UGC';
}

function sourceOptions(sourceType: VariantSourceType): SourceOption[] {
  switch (sourceType) {
    case 'proven':
      return PROVEN_ADS.map((p) => ({
        id: p.id,
        label: p.campaignName,
        hook: p.hook,
        metric: p.metric,
        image: p.image,
        format: p.format,
      }));
    case 'organic':
      return ORGANIC_CREATIVE.map((o) => ({
        id: o.id,
        label: `Your ${o.platform} post`,
        hook: o.hook,
        metric: o.metric,
        image: o.image,
        format: o.format,
      }));
    case 'competitor':
      return COMPETITOR_CREATIVE.map((c) => ({
        id: c.id,
        label: c.peer,
        hook: c.hook,
        metric: c.metric,
        image: c.adapted.image,
        format: c.format,
      }));
    case 'ai':
      return AI_CREATIVE.map((a) => ({
        id: a.id,
        label: a.concept,
        hook: a.adapted.headline,
        metric: '',
        image: a.adapted.image,
        format: a.format,
      }));
  }
}

// ─── STYLES ──────────────────────────────────────────────────────────────

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(0, 0, 0, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 32,
};

const cardStyle: CSSProperties = {
  width: 'min(960px, calc(100vw - 64px))',
  height: 'min(720px, calc(100vh - 64px))',
  background: 'var(--light-100)',
  borderRadius: 18,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 24px 64px rgba(0, 0, 0, 0.32)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '18px 24px',
  borderBottom: '1px solid var(--dark-8)',
  flexShrink: 0,
};

const bodyStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px 32px',
  display: 'flex',
  flexDirection: 'column',
};

const footerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  borderTop: '1px solid var(--dark-8)',
  flexShrink: 0,
};

const closeBtnStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 6,
  cursor: 'pointer',
  color: 'var(--dark-60)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
};

const blazeBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 8px',
  borderRadius: 999,
  background: 'rgba(124, 92, 252, 0.12)',
  color: 'var(--purple)',
  fontSize: 12,
  fontWeight: 500,
};

const cancelBtnStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: '8px 4px',
  color: 'var(--dark-90)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 14,
  letterSpacing: '0.28px',
};

// ─── BLAZE-GENERATED CARD ─────────────────────────────────────────────

/** Rich row layout for the AI tab — mirrors the organic-campaign
 *  PostCard pattern. Square preview on the left, Topic label +
 *  description on the right, content-type pill + Add context +
 *  regenerate at the bottom. */
function BlazeGeneratedCard({
  option,
  onAdd,
}: {
  option: SourceOption;
  onAdd: () => void;
}) {
  // Map the internal CreativeFormat to the form's AI content-type label +
  // icon (mirrors the AI Avatar Video / Still image post pattern).
  const { label: contentTypeLabel, Icon: ContentTypeIcon, color: contentTypeColor } =
    aiContentTypeFor(option.format);

  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        padding: 14,
        borderRadius: 12,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
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
          src={option.image}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 6,
            bottom: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 6px',
            borderRadius: 999,
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'var(--light-100)',
            fontSize: 10,
            fontWeight: 500,
          }}
        >
          <Stars size={10} color="currentColor" />
          AI
        </div>
      </div>

      {/* Right side */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Topic label + action icons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: 24,
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.22px',
              color: 'var(--dark-60)',
            }}
          >
            Topic
          </span>
          <div style={{ display: 'inline-flex', gap: 2 }}>
            <span
              aria-label="Regenerate"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                color: 'var(--dark-60)',
                borderRadius: 6,
              }}
            >
              <ArrowRefresh size={14} color="currentColor" />
            </span>
          </div>
        </div>

        {/* Concept name */}
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.3 }}>
          {option.label}
        </div>

        {/* Hook / adapted description */}
        {option.hook && (
          <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.5 }}>
            {option.hook}
          </div>
        )}

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
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(124, 92, 252, 0.10)',
              color: 'var(--purple)',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <ContentTypeIcon size={12} color={contentTypeColor} />
            {contentTypeLabel}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'var(--dark-4)',
              color: 'var(--dark-60)',
              fontSize: 12,
            }}
          >
            <Plus size={11} color="currentColor" />
            Add context
          </span>
          <Button variant="primary" size="sm" frontIcon={Stars} onPress={onAdd}>
            Use this concept
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Map our internal CreativeFormat onto the form's "AI content type"
 *  label + icon. Reels become AI Avatar Video, Static becomes Still
 *  image post, Carousel keeps its name, UGC reads as AI Avatar Video. */
function aiContentTypeFor(format?: SourceOption['format']): {
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
