import { useMemo, type ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { Pill, StatusPill, type StatusPillTone } from '@/staging';
import MetaBrand from '@/icons/20/MetaBrand';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import Globe from '@/icons/20/Globe';
import ChevronRightSmall from '@/icons/20/ChevronRightSmall';
import {
  GENDER_LABEL,
  OBJECTIVE_LABEL,
  useMetaCampaign,
  type AdSetDraft,
  type GeneratedAd,
  type MetaCampaignDraft,
} from '../meta-campaign-context';
import { CampaignSummary } from '../confidence/CampaignSummary';
import { defaultSafetyNetForDraft } from '../confidence/defaults';
import { CAMPAIGNS } from '../../pages/PaidSocial';
import {
  BID_STRATEGY_LABEL,
  PERFORMANCE_GOAL_LABEL,
  SOURCE_TYPE_LABEL,
  type Concept,
  type VariantSourceType,
} from '../concept/types';

const REVIEW_SOURCE_TONE: Record<VariantSourceType, StatusPillTone> = {
  proven: 'success',
  organic: 'info',
  competitor: 'warning',
  ai: 'accent',
};
import { resolveVariantCopy } from '../concept/copy';
import { resolveAdName } from '../concept/ad-name';

/** Stage 4 — Review & launch. Shows the Campaign > Ad set > Ad hierarchy
 *  alongside the existing confidence layer (preflight, similar campaigns,
 *  safety net). The confidence layer reads a legacy-shape draft built from
 *  the new hierarchy via `adaptForConfidence`. */
export function Stage4Review() {
  const { draft, adSetDraft, concepts, createdCampaigns } = useMetaCampaign();

  // Adapt the new hierarchy into the legacy shape CampaignSummary reads.
  const legacyDraft: MetaCampaignDraft & LegacyOverlay = useMemo(
    () => adaptDraftForConfidence(draft, adSetDraft, concepts),
    [draft, adSetDraft, concepts],
  );
  const legacyAds: GeneratedAd[] = useMemo(
    () => adaptAdsForConfidence(draft, concepts),
    [draft, concepts],
  );

  const includedCount = legacyAds.filter((a) => a.included).length;

  // Default safety net rules — derived for CampaignSummary's prose. Not
  // surfaced as an editor in this prototype; the user can revisit rules
  // post-launch from the detail page.
  const historicalCampaigns = useMemo(() => [...createdCampaigns, ...CAMPAIGNS], [createdCampaigns]);
  const safetyNet = useMemo(
    () => defaultSafetyNetForDraft(legacyDraft, historicalCampaigns),
    [legacyDraft, historicalCampaigns],
  );

  return (
    <div style={{ width: '100%', maxWidth: 880, margin: '0 auto' }}>
      <Heading level={2} style={{ margin: '0 0 6px' }}>
        Review the campaign
      </Heading>
      <Text variant="secondary">
        Confirm the Campaign &gt; Ad set &gt; Ad hierarchy before launch.
      </Text>

      <div style={{ height: 1, background: 'var(--dark-8)', margin: '24px 0' }} />

      {/* Hierarchy breadcrumb */}
      <Breadcrumb
        campaign={draft.name}
        adSet={adSetDraft.name}
        adCount={includedCount}
      />

      {/* Campaign card */}
      <SummaryCard
        eyebrow="Campaign"
        title={draft.name}
        icon={<MetaBrand size={20} />}
        rows={[
          { label: 'Objective', value: OBJECTIVE_LABEL[draft.objective] },
          {
            label: 'Budget',
            value:
              draft.budgetType === 'daily'
                ? `$${draft.budgetAmount.toLocaleString()}/day`
                : `$${draft.budgetAmount.toLocaleString()} lifetime`,
          },
          {
            label: 'Bid strategy',
            value:
              draft.bidTargetValue !== undefined
                ? `${BID_STRATEGY_LABEL[draft.bidStrategy]} · target $${draft.bidTargetValue}`
                : BID_STRATEGY_LABEL[draft.bidStrategy],
          },
          {
            label: 'Schedule',
            value:
              draft.schedule.endsAt
                ? `${draft.schedule.startsAt} → ${draft.schedule.endsAt}`
                : `${draft.schedule.startsAt} → ongoing`,
          },
          {
            label: 'Special ad categories',
            value:
              draft.specialAdCategories.length === 0
                ? 'No'
                : draft.specialAdCategories
                    .map((c) =>
                      c === 'credit'
                        ? 'Credit'
                        : c === 'employment'
                          ? 'Employment'
                          : c === 'housing'
                            ? 'Housing'
                            : 'Social / elections / politics',
                    )
                    .join(', '),
          },
        ]}
      />

      {/* One ad-set card per concept. 1 concept = 1 ad set is the v1
       *  default; each ad set takes its targeting from the Stage 2
       *  template and its name from the concept. */}
      {concepts
        .filter((c) => c.variants.some((v) => v.included))
        .map((concept) => (
          <AdSetCard
            key={concept.id}
            adSetDraft={adSetDraft}
            campaignName={draft.name}
            concept={concept}
          />
        ))}

      <CampaignSummary draft={legacyDraft} generatedAds={legacyAds} safetyNet={safetyNet} />
    </div>
  );
}

// ─── Hierarchy display ───────────────────────────────────────────────────

function Breadcrumb({ campaign, adSet, adCount }: { campaign: string; adSet: string; adCount: number }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 999,
        background: 'var(--dark-4)',
        color: 'var(--dark-90)',
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}
    >
      <MetaBrand size={14} />
      <span>{campaign}</span>
      <ChevronRightSmall size={14} color="var(--dark-60)" />
      <span>{adSet}</span>
      <ChevronRightSmall size={14} color="var(--dark-60)" />
      <span>{adCount} ad{adCount === 1 ? '' : 's'}</span>
    </div>
  );
}

function SummaryCard({
  eyebrow,
  title,
  icon,
  rows,
}: {
  eyebrow: string;
  title: string;
  icon?: ReactNode;
  rows: { label: string; value: string; icon?: ReactNode }[];
}) {
  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: 18,
        background: 'var(--light-100)',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        {icon}
        <div>
          <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 12, letterSpacing: '0.24px' }}>
            {eyebrow}
          </Text>
          <Text style={{ color: 'var(--dark-90)', fontSize: 16, fontWeight: 500, display: 'block' }}>
            {title}
          </Text>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 10 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 12, letterSpacing: '0.22px' }}>
              {r.label}
            </Text>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--dark-90)', fontSize: 14 }}>
              {r.icon}
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Unified ad-set + concept card. 1 concept = 1 ad set in v1, so each
 *  concept gets its own ad-set wrapper. The wrapper inherits targeting
 *  from the Stage 2 ad-set draft and takes its name from the concept. */
function AdSetCard({
  adSetDraft,
  campaignName,
  concept,
}: {
  adSetDraft: AdSetDraft;
  campaignName: string;
  concept: Concept;
}) {
  const includedVariants = concept.variants.filter((v) => v.included);
  const adCount = includedVariants.length;
  const adSetName = `${campaignName} – ${concept.name}`;

  const adSetRows: { label: string; value: string; icon?: ReactNode }[] = [
    {
      label: 'Conversion location',
      value:
        adSetDraft.conversionLocation === 'website'
          ? 'Website'
          : adSetDraft.conversionLocation === 'app'
            ? 'App'
            : adSetDraft.conversionLocation === 'messaging-apps'
              ? 'Messaging apps'
              : adSetDraft.conversionLocation === 'calls'
                ? 'Calls'
                : 'Instant Forms',
    },
    { label: 'Performance goal', value: PERFORMANCE_GOAL_LABEL[adSetDraft.performanceGoal] },
    { label: 'Conversion event', value: adSetDraft.conversionEvent },
    { label: 'Pixel', value: `${adSetDraft.pixelName} (${adSetDraft.pixelId})` },
    {
      label: 'Destination',
      value: adSetDraft.websiteUrl || '— not set —',
      icon: <Globe size={14} color="var(--dark-60)" />,
    },
    {
      label: 'Audience',
      value: `Ages ${adSetDraft.ageMin}–${adSetDraft.ageMax}, ${GENDER_LABEL[adSetDraft.gender].toLowerCase()}, ${adSetDraft.language}`,
    },
    {
      label: 'Locations',
      value: adSetDraft.locations.length === 0 ? '— none —' : adSetDraft.locations.join(', '),
    },
    ...(adSetDraft.detailedTargeting.length > 0
      ? [{ label: 'Detailed targeting', value: adSetDraft.detailedTargeting.join(', ') }]
      : []),
    ...(adSetDraft.customAudiences.length > 0
      ? [{ label: 'Custom audiences', value: adSetDraft.customAudiences.join(', ') }]
      : []),
    ...(adSetDraft.exclusions.length > 0
      ? [{ label: 'Exclusions', value: adSetDraft.exclusions.join(', ') }]
      : []),
    {
      label: 'Placements',
      value:
        adSetDraft.placementsMode === 'advantage-plus'
          ? 'Advantage+ (recommended)'
          : (adSetDraft.manualPlacements ?? []).join(', ') || 'Manual',
    },
  ];

  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--light-100)',
        marginBottom: 16,
      }}
    >
      {/* Ad-set header — matches the Campaign card's eyebrow+title+rows layout */}
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <UserProfileGroup size={20} color="var(--dark-60)" />
          <div style={{ flex: 1 }}>
            <Text
              variant="secondary"
              style={{ color: 'var(--dark-60)', fontSize: 12, letterSpacing: '0.24px' }}
            >
              Ad set
            </Text>
            <Text style={{ color: 'var(--dark-90)', fontSize: 16, fontWeight: 500, display: 'block' }}>
              {adSetName}
            </Text>
          </div>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            1 concept · {adCount} ad{adCount === 1 ? '' : 's'}
          </Text>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 10 }}>
          {adSetRows.map((r) => (
            <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 12, letterSpacing: '0.22px' }}>
                {r.label}
              </Text>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--dark-90)', fontSize: 14 }}>
                {r.icon}
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* The concept that ships into this ad set */}
      <ConceptSection concept={concept} campaignName={campaignName} />
    </div>
  );
}

/** Nested concept block inside an AdSetCard. No outer border of its own —
 *  it lives inside the ad-set card and reads as part of the same unit. */
function ConceptSection({ concept, campaignName }: { concept: Concept; campaignName: string }) {
  const included = concept.variants.filter((v) => v.included);
  if (included.length === 0) return null;

  return (
    <div style={{ borderTop: '1px solid var(--dark-8)' }}>
      <div
        style={{
          padding: '14px 18px',
          background: 'var(--dark-2)',
          borderBottom: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <StatusPill tone="accent" size="sm">Concept</StatusPill>
        <Text style={{ color: 'var(--dark-90)', fontSize: 16, fontWeight: 500, display: 'block' }}>
          {concept.name}
        </Text>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', marginLeft: 'auto' }}>
          {included.length} ad{included.length === 1 ? '' : 's'} · mixed sources
        </Text>
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {included.map((v, i) => {
            const resolved = resolveVariantCopy(v, concept);
            const name = resolveAdName({ campaignName, concept, variant: v, index: i });
            const usingDefault = !v.customName || v.customName.trim() === '';
            return (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  border: '1px solid var(--dark-8)',
                  borderRadius: 10,
                }}
              >
                <img
                  src={v.image}
                  alt={`${v.format} variant`}
                  style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
                    {resolved.headline}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
                    {name}{usingDefault ? ' · auto' : ''}
                  </span>
                </div>
                <StatusPill tone={REVIEW_SOURCE_TONE[v.sourceType]} size="sm">
                  {SOURCE_TYPE_LABEL[v.sourceType]}
                </StatusPill>
                <Pill size="sm">{v.format}</Pill>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Adapters (new hierarchy → legacy confidence-layer shape) ────────────

interface LegacyOverlay {
  topic: string;
  dailyBudget: number;
  websiteUrl: string;
  adHeadline: string;
  adCta: GeneratedAd['cta'];
  adCaption: string;
  ageMin: number;
  ageMax: number;
  gender: 'all' | 'men' | 'women';
  language: string;
  locations: string[];
}

function adaptDraftForConfidence(
  draft: MetaCampaignDraft,
  adSet: ReturnType<typeof useMetaCampaign>['adSetDraft'],
  concepts: Concept[],
): MetaCampaignDraft & LegacyOverlay {
  const firstConcept = concepts[0];
  const firstVariant = firstConcept?.variants.find((v) => v.included) ?? firstConcept?.variants[0];
  const resolved =
    firstConcept && firstVariant ? resolveVariantCopy(firstVariant, firstConcept) : null;

  return {
    ...draft,
    // Legacy budget — confidence layer reads dailyBudget. For lifetime budgets
    // we approximate by spreading across a 30-day flight.
    dailyBudget:
      draft.budgetType === 'daily' ? draft.budgetAmount : Math.round(draft.budgetAmount / 30),
    topic: draft.campaignTopic,
    websiteUrl: adSet.websiteUrl,
    adHeadline: resolved?.headline ?? '',
    adCta: resolved?.cta ?? 'Get quote',
    adCaption: resolved?.primaryText ?? '',
    ageMin: adSet.ageMin,
    ageMax: adSet.ageMax,
    gender: adSet.gender,
    language: adSet.language,
    locations: adSet.locations,
  };
}

function adaptAdsForConfidence(
  draft: MetaCampaignDraft,
  concepts: Concept[],
): GeneratedAd[] {
  const out: GeneratedAd[] = [];
  for (const c of concepts) {
    for (const v of c.variants) {
      const resolved = resolveVariantCopy(v, c);
      out.push({
        id: v.id,
        sourceId: v.sourceRefId,
        source: v.sourceType,
        origin: c.name,
        metric: v.sourceMetric,
        format: v.format,
        image: v.image,
        headline: resolved.headline,
        primaryText: resolved.primaryText,
        cta: resolved.cta,
        included: v.included,
      });
    }
  }
  return out;
}

