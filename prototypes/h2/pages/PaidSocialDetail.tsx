import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Heading, IconButton, Modal, ModalStack, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Card, Chip, Pill, SegmentedControl, Select, StatusPill, TextField, Toggle, useToast } from '@/staging';
import ArrowLeft from '@/icons/20/ArrowLeft';
import MetaBrand from '@/icons/20/MetaBrand';
import MoreDots from '@/icons/20/MoreDots';
import AlertTriangle from '@/icons/20/AlertTriangle';
import Stars from '@/icons/20/Stars';
import ChevronRightSmall from '@/icons/20/ChevronRightSmall';
import ChevronDown from '@/icons/20/ChevronDown';
import ArrowUpSm from '@/icons/20/ArrowUpSm';
import Globe from '@/icons/20/Globe';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import Marker from '@/icons/20/Marker';
import Target5 from '@/icons/20/Target5';
import Plus from '@/icons/20/Plus';
import Calendar1 from '@/icons/20/Calendar1';
import Grid from '@/icons/20/Grid';
import List from '@/icons/20/List';
import { H2Layout } from '../H2Layout';
import { AddAdsModal } from '../meta-campaign/AddAdsModal';
import {
  CAMPAIGNS,
  FatigueRefreshModal,
  StatusChip,
  formatMoney,
  type Ad,
  type Campaign,
  type FatigueFlag,
} from './PaidSocial';
import { useMetaCampaign } from '../meta-campaign/meta-campaign-context';
import { synthesizeAdSets } from '../meta-campaign/concept/synthesize';
import { CONCEPT_THEMES, materializeCustomConcept, materializeThemedConcept } from '../meta-campaign/concept/defaults';
import type { AdSet, Concept } from '../meta-campaign/concept/types';
import { PERFORMANCE_GOAL_LABEL } from '../meta-campaign/concept/types';

interface KpiSpec {
  label: string;
  value: string;
  sub: string;
  trend: number[];
  delta: number;
}

type TimeRange = '7d' | '14d' | '30d' | '90d' | 'lifetime';

const TIME_RANGE_LABEL: Record<TimeRange, string> = {
  '7d': 'Last 7 days',
  '14d': 'Last 14 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  lifetime: 'Lifetime',
};

const TIME_RANGE_DAYS: Record<TimeRange, number | null> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  '90d': 90,
  lifetime: null,
};

const TIME_RANGE_ORDER: TimeRange[] = ['7d', '14d', '30d', '90d', 'lifetime'];

function rangeSubtitle(timeRange: TimeRange): string {
  const days = TIME_RANGE_DAYS[timeRange];
  return days === null ? 'over the campaign’s lifetime' : `in the last ${days} days`;
}

interface FatigueEntry {
  key: string;
  adName: string;
  fatigue: FatigueFlag;
}

/** Route entry — wraps the detail in its own ModalStack so the fatigue modal
 *  has a scope. */
export function PaidSocialDetailRoute() {
  return (
    <ModalStack>
      <PaidSocialDetailInner />
    </ModalStack>
  );
}

function PaidSocialDetailInner() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { createdCampaigns } = useMetaCampaign();
  const navigate = useNavigate();
  const { addConceptToCampaign, updateAdSet } = useMetaCampaign();
  const { openModal } = useModals();
  const [addingAds, setAddingAds] = useState(false);
  /** Concept id the AddAdsModal should target on open — set when the
   *  user clicks a per-ad-set "+ Add ads" button. */
  const [addAdsTargetConceptId, setAddAdsTargetConceptId] = useState<string | undefined>();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const campaign = [...createdCampaigns, ...CAMPAIGNS].find(
    (c) => c.id === campaignId,
  );

  if (!campaign) {
    return (
      <H2Layout title="Campaign not found">
        <div style={{ maxWidth: 720, margin: '60px auto', textAlign: 'center' }}>
          <Heading level={2} style={{ marginBottom: 8 }}>
            We couldn’t find that campaign
          </Heading>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            It may have been deleted or renamed. Head back to the list.
          </Text>
          <div style={{ marginTop: 20 }}>
            <Button variant="secondary" onPress={() => navigate('/h2/paid-social')}>
              Back to Paid Social
            </Button>
          </div>
        </div>
      </H2Layout>
    );
  }

  return (
    <H2Layout
      title={<CampaignTitle campaign={campaign} />}
      topbarRight={<CampaignActions campaign={campaign} />}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 28px 60px' }}>
        <CampaignAttentionPanel campaign={campaign} />
        <PerformanceHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <KpiStrip campaign={campaign} timeRange={timeRange} />
        <AdsTable
          campaign={campaign}
          onAddAds={(conceptId) => {
            setAddAdsTargetConceptId(conceptId);
            setAddingAds(true);
          }}
          onAddAdSet={() =>
            openModal(AddAdSetDialog, {
              campaign,
              onCreate: (concept) => addConceptToCampaign(campaign.id, concept),
            })
          }
          onEditAudience={(adSet) =>
            openModal(EditAudienceDialog, {
              adSet,
              onSave: (patch) => updateAdSet(campaign.id, adSet.id, patch),
            })
          }
        />

        <AddAdsModal
          open={addingAds}
          campaign={campaign}
          targetConceptId={addAdsTargetConceptId}
          onClose={() => {
            setAddingAds(false);
            setAddAdsTargetConceptId(undefined);
          }}
        />
      </div>
    </H2Layout>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────

function CampaignTitle({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();
  const goBack = () => navigate('/h2/paid-social');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <IconButton
        aria-label="Back to Paid Social"
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        onPress={goBack}
      />
      <span style={{ display: 'inline-flex', flexShrink: 0 }}>
        <MetaBrand size={20} />
      </span>
      <span
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: 'var(--dark-90)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {campaign.name}
      </span>
      <span style={{ flexShrink: 0 }}>
        <StatusChip status={campaign.status} />
      </span>
    </div>
  );
}

function CampaignActions({ campaign }: { campaign: Campaign }) {
  const [enabled, setEnabled] = useState(campaign.enabled);
  return (
    <>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px 6px 12px',
          border: '1px solid var(--dark-8)',
          borderRadius: 999,
        }}
      >
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
          {enabled ? 'Active' : 'Paused'}
        </Text>
        <Toggle checked={enabled} onChange={setEnabled} aria-label="Campaign on/off" />
      </div>
      <IconButton aria-label="More actions" variant="ghost" size="sm" icon={MoreDots} />
    </>
  );
}

// ─── KPI STRIP ───────────────────────────────────────────────────────────

function buildKpis(c: Campaign, timeRange: TimeRange): KpiSpec[] {
  const monthlyBudget = c.budget * 30;
  // Synthetic per-campaign performance metrics — kept stable per id so the
  // page doesn't shuffle data on every render.
  const seed = c.id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rng = (offset: number, mod: number) => (seed + offset) % mod;

  const impressions = Math.max(20_000, c.spent * (110 + rng(1, 30)));
  const ctr = 1.5 + ((rng(2, 40)) / 10);
  const roas = c.results === 0
    ? 0
    : (c.results * 240) / Math.max(1, c.spent);
  const roasDelta = c.results === 0 ? 0 : -2 + rng(3, 18);

  return [
    {
      label: 'Spent',
      value: formatMoney(c.spent),
      sub: `of ${formatMoney(monthlyBudget)} monthly budget`,
      trend: spark(seed, 7, 0.4),
      delta: c.status === 'spending-too-fast' ? 14 : -3 + rng(4, 8),
    },
    {
      label: 'Estimate requests',
      value: String(c.results),
      sub: rangeSubtitle(timeRange),
      trend: spark(seed + 1, 7, 0.5),
      delta: c.status === 'over-budget' ? -22 : -4 + rng(5, 16),
    },
    {
      label: 'Cost per result',
      value: formatMoney(c.costPerResult),
      sub: 'per lead',
      trend: spark(seed + 2, 7, 0.3),
      delta: c.status === 'winner' ? -11 : -2 + rng(6, 14),
    },
    {
      label: 'CTR',
      value: `${ctr.toFixed(1)}%`,
      sub: 'click-through rate',
      trend: spark(seed + 3, 7, 0.4),
      delta: -3 + rng(7, 10),
    },
    {
      label: 'Impressions',
      value: formatThousands(impressions),
      sub: 'people reached',
      trend: spark(seed + 4, 7, 0.4),
      delta: -1 + rng(8, 12),
    },
    {
      label: 'ROAS',
      value: roas > 0 ? `${roas.toFixed(1)}x` : '—',
      sub: 'return on ad spend',
      trend: spark(seed + 5, 7, 0.4),
      delta: roasDelta,
    },
  ];
}

function PerformanceHeader({
  timeRange,
  onTimeRangeChange,
}: {
  timeRange: TimeRange;
  onTimeRangeChange: (next: TimeRange) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
      }}
    >
      <Heading level={3} style={{ color: 'var(--dark-90)' }}>
        Performance
      </Heading>
      <Select
        value={timeRange}
        onChange={(v) => onTimeRangeChange(v as TimeRange)}
        options={TIME_RANGE_ORDER.map((key) => ({
          value: key,
          label: TIME_RANGE_LABEL[key],
        }))}
        size="sm"
        leadingIcon={Calendar1}
        align="right"
        aria-label="Time range"
      />
    </div>
  );
}

function KpiStrip({ campaign, timeRange }: { campaign: Campaign; timeRange: TimeRange }) {
  const kpis = buildKpis(campaign, timeRange);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 32,
      }}
    >
      {kpis.map((k) => (
        <KpiTile key={k.label} kpi={k} timeRange={timeRange} />
      ))}
    </div>
  );
}

function KpiTile({ kpi, timeRange }: { kpi: KpiSpec; timeRange: TimeRange }) {
  const up = kpi.delta >= 0;
  return (
    <Card style={{ borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text variant="metadata" style={{ color: 'var(--dark-60)', fontSize: 12, display: 'block' }}>
        {kpi.label}
      </Text>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.1 }}>
          {kpi.value}
        </span>
        <DeltaBadge delta={kpi.delta} timeRange={timeRange} />
      </div>
      <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block' }}>
        {kpi.sub}
      </Text>
      <div style={{ marginTop: 4 }}>
        <Sparkline points={kpi.trend} up={up} />
      </div>
    </Card>
  );
}

function DeltaBadge({ delta, timeRange }: { delta: number; timeRange: TimeRange }) {
  const compareLabel = deltaCompareLabel(timeRange);
  if (delta === 0) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>—</span>
        {compareLabel && (
          <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>{compareLabel}</span>
        )}
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 4,
        fontSize: 12,
        fontWeight: 500,
        color: up ? 'var(--status-approved)' : 'var(--red-70)',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          transform: up ? 'none' : 'rotate(180deg)',
          alignSelf: 'center',
        }}
      >
        <ArrowUpSm size={12} color="currentColor" />
      </span>
      <span>{Math.abs(delta)}%</span>
      {compareLabel && (
        <span style={{ fontSize: 11, color: 'var(--dark-60)', fontWeight: 400 }}>
          {compareLabel}
        </span>
      )}
    </span>
  );
}

/** Maps the active time range to a "vs prev N" comparison label.
 *  Lifetime has no meaningful comparison period — returns null so the
 *  badge collapses to just the delta. */
function deltaCompareLabel(timeRange: TimeRange): string | null {
  const days = TIME_RANGE_DAYS[timeRange];
  if (days === null) return null;
  return `vs prev ${days}d`;
}

function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  const w = 220;
  const h = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const dx = w / Math.max(1, points.length - 1);
  const d = points
    .map((v, i) => {
      const x = (i * dx).toFixed(1);
      const y = (h - ((v - min) / span) * h).toFixed(1);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
  const stroke = up ? 'var(--status-approved)' : 'var(--red-70)';
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── CREATIVE HEALTH ─────────────────────────────────────────────────────

function collectFatigues(c: Campaign): FatigueEntry[] {
  const items: FatigueEntry[] = [];
  if (c.fatigue) items.push({ key: c.id, adName: c.name, fatigue: c.fatigue });
  for (const ad of c.ads ?? []) {
    if (ad.fatigue) items.push({ key: ad.id, adName: ad.name, fatigue: ad.fatigue });
  }
  return items;
}

/** Single attention panel pinned to the top of the campaign view. Merges the
 *  Blaze learning-loop recommendation and the creative-health fatigue alerts
 *  into one sticky panel, styled like the Paid Social list's fatigue banner.
 *  Opaque (light-100) background so content scrolls cleanly under it. */
function CampaignAttentionPanel({ campaign }: { campaign: Campaign }) {
  const fatigues = collectFatigues(campaign);
  const insights = useMemo(() => buildLearningInsights(campaign), [campaign]);
  const lead = insights[0];
  const { openModal } = useModals();
  const fatigueCount = fatigues.length;

  return (
    <div
      style={{
        borderRadius: 12,
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
        overflow: 'hidden',
        marginBottom: 32,
      }}
    >
      {/* header row — mirrors the Paid Social / Paid Search fatigue banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-4)',
        }}
      >
        {fatigueCount > 0 ? (
          <AlertTriangle size={16} color="var(--status-connect)" />
        ) : (
          <Stars size={16} color="var(--purple)" />
        )}
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
          {fatigueCount > 0
            ? `Creative fatigue · ${fatigueCount} ad${fatigueCount === 1 ? '' : 's'} ${fatigueCount === 1 ? 'needs' : 'need'} attention`
            : 'Creative health · No fatigue detected'}
        </span>
      </div>

      {/* Blaze learning-loop recommendation */}
      {lead && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderBottom: fatigueCount > 0 ? '1px solid var(--dark-4)' : 'none',
          }}
        >
          <Stars size={16} color="var(--purple)" />
          <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{lead.title}</span>
            <span style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.5 }}>{lead.body}</span>
          </div>
          {lead.cta && (
            <div style={{ flexShrink: 0 }}>
              <Button variant="secondary" size="sm" endIcon={ChevronRightSmall}>
                {lead.cta}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* creative-health fatigue rows */}
      {fatigues.map((entry, i) => (
        <div
          key={entry.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderBottom: i === fatigues.length - 1 ? 'none' : '1px solid var(--dark-4)',
          }}
        >
          <img
            src={entry.fatigue.currentAd.imageUrl}
            alt=""
            style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', background: 'var(--dark-4)', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{entry.adName}</span>
            <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>Day {entry.fatigue.ageDays} · {entry.fatigue.signal}</span>
          </div>
          <StatusPill tone="warning" size="sm">
            Fatigue day {entry.fatigue.ageDays}
          </StatusPill>
          <Button
            variant="secondary"
            size="sm"
            frontIcon={Stars}
            onPress={() => openModal(FatigueRefreshModal, { fatigue: entry.fatigue, adName: entry.adName })}
          >
            Refresh with Blaze
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── ADS TABLE ───────────────────────────────────────────────────────────

// On | Ad name (with inline fatigue badge) | Spend (daily / total) | CTR | Results | CPR | Status
const AD_COLS =
  '36px minmax(220px, 1.4fr) 150px 72px 80px 90px 108px';

/** Set of ad ids currently in "Blaze is generating creative…" state.
 *  Local to AdsTable so the staggered reveal doesn't bleed across
 *  campaigns. */
const GeneratingAdsContext = createContext<Set<string>>(new Set());

function useIsAdGenerating(adId: string): boolean {
  return useContext(GeneratingAdsContext).has(adId);
}

function AdsTable({
  campaign,
  onAddAds,
  onAddAdSet,
  onEditAudience,
}: {
  campaign: Campaign;
  /** Called from the per-ad-set "+ Add ads" affordance — the conceptId
   *  scopes the AddAdsModal to land its new ads in that section. */
  onAddAds: (conceptId?: string) => void;
  /** Called from the top-level "+ Add ad set" affordance — opens the
   *  concept-creation popover. */
  onAddAdSet: () => void;
  /** Called from a per-ad-set "Edit" link on the audience strip. */
  onEditAudience: (adSet: AdSet) => void;
}) {
  const { addedAdsByCampaign, addedConceptsByCampaign, adSetEditsByCampaign } = useMetaCampaign();
  const added = addedAdsByCampaign[campaign.id] ?? [];
  const extraConcepts = addedConceptsByCampaign[campaign.id] ?? [];
  const adSetEdits = adSetEditsByCampaign[campaign.id] ?? {};
  const baseAds: Ad[] = campaign.ads ?? syntheticAds(campaign);
  const ads: Ad[] = [...added, ...baseAds];
  const [view, setView] = useState<'list' | 'grid'>('list');

  // Group ads by Ad set > Concept. Synthesized hierarchy maps variant.id →
  // ad.id 1:1 for both wizard-built and seed campaigns. The visual grouping
  // matches Stage 4 Review's AdSetCard: ad-set header wraps its concept
  // sub-sections so the user reads them as one unit.
  const sections = useMemo(
    () => groupAdsByAdSetThenConcept(campaign, ads, added, extraConcepts, adSetEdits),
    [campaign, ads, added, extraConcepts, adSetEdits],
  );
  // Show the structured layout whenever the hierarchy has anything to group
  // — only collapse to flat when the synthesized default + no ads case lands.
  const showGroups = sections.some((s) => s.conceptGroups.length > 0);
  const totalConceptCount = sections.reduce((sum, s) => sum + s.conceptGroups.length, 0);

  // Generation state for freshly-added ads — when a new ad.id appears in
  // `added` that we haven't seen before, hold it in a Set + skeleton for
  // ~1.6s so the user sees Blaze "generating" the creative. Mirrors Stage
  // 3's variant materialization pattern.
  const [generatingAdIds, setGeneratingAdIds] = useState<Set<string>>(new Set());
  const seenAddedIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const seen = seenAddedIdsRef.current;
    const freshIds: string[] = [];
    for (const ad of added) {
      if (!seen.has(ad.id)) {
        seen.add(ad.id);
        freshIds.push(ad.id);
      }
    }
    if (freshIds.length === 0) return;
    setGeneratingAdIds((prev) => {
      const next = new Set(prev);
      for (const id of freshIds) next.add(id);
      return next;
    });
    // Staggered reveal: ~700ms base + 250ms per ad.
    freshIds.forEach((id, i) => {
      const delay = 700 + i * 250;
      window.setTimeout(() => {
        setGeneratingAdIds((prev) => {
          if (!prev.has(id)) return prev;
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, delay);
    });
  }, [added]);

  // Collapsible ad-set sections — expanded by default.
  const [collapsedAdSets, setCollapsedAdSets] = useState<Set<string>>(new Set());
  const toggleAdSet = (key: string) =>
    setCollapsedAdSets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <GeneratingAdsContext.Provider value={generatingAdIds}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}
    >
      <Heading level={3} style={{ color: 'var(--dark-90)' }}>
        Ads in this campaign
      </Heading>
      {showGroups && (
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
          {ads.length} ad{ads.length === 1 ? '' : 's'} · {sections.length} ad set{sections.length === 1 ? '' : 's'} · {totalConceptCount} concept{totalConceptCount === 1 ? '' : 's'}
        </Text>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as 'list' | 'grid')}
          size="sm"
          aria-label="Ad view"
          options={[
            { value: 'list', icon: List, ariaLabel: 'List view' },
            { value: 'grid', icon: Grid, ariaLabel: 'Grid view' },
          ]}
        />
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={onAddAdSet}>
          Add ad set
        </Button>
      </div>
    </div>
    <SectionCard>
      {view === 'list' ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: AD_COLS,
              gap: 12,
              alignItems: 'center',
              padding: '6px 16px',
              borderBottom: '1px solid var(--dark-8)',
            }}
          >
            <HeaderCell>On</HeaderCell>
            <HeaderCell>Ad name</HeaderCell>
            <HeaderCell>Spend</HeaderCell>
            <HeaderCell>CTR</HeaderCell>
            <HeaderCell>Results</HeaderCell>
            <HeaderCell>CPR</HeaderCell>
            <HeaderCell>Status</HeaderCell>
          </div>
          {showGroups
            ? sections.map((section, si) => (
                <AdSetSection
                  key={section.key}
                  section={section}
                  isFirstSection={si === 0}
                  collapsed={collapsedAdSets.has(section.key)}
                  onToggle={() => toggleAdSet(section.key)}
                  onAddAds={() => onAddAds(firstConceptId(section))}
                  onEditAudience={() => onEditAudience(section.adSet)}
                />
              ))
            : ads.map((ad, i) => (
                <AdRow key={ad.id} ad={ad} isLast={i === ads.length - 1} />
              ))}
        </>
      ) : showGroups ? (
        sections.map((section) => {
          const collapsed = collapsedAdSets.has(section.key);
          return (
            <div
              key={section.key}
              style={{
                borderTop: '1px solid var(--dark-8)',
              }}
            >
              <AdSetHeader
                section={section}
                collapsed={collapsed}
                onToggle={() => toggleAdSet(section.key)}
                onAddAds={() => onAddAds(firstConceptId(section))}
                onEditAudience={() => onEditAudience(section.adSet)}
              />
              {!collapsed &&
                section.conceptGroups.map((g) => (
                  <div
                    key={g.key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 14,
                      padding: 16,
                    }}
                  >
                    {g.ads.map((ad) => (
                      <AdCard key={ad.id} ad={ad} />
                    ))}
                  </div>
                ))}
            </div>
          );
        })
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 14,
            padding: 16,
          }}
        >
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </SectionCard>
    </GeneratingAdsContext.Provider>
  );
}

// ─── AD SET > CONCEPT GROUPED ADS ──────────────────────────────────────

type SrcType = 'proven' | 'organic' | 'competitor' | 'ai';

interface ConceptAdGroup {
  key: string;
  conceptName: string;
  /** Per-source counts of the variants making up this concept's slate.
   *  Concepts are themes, so the slate is mixed — header renders one
   *  pill per non-zero source. */
  sourceMix: Record<SrcType, number>;
  isOrphan: boolean;
  ads: Ad[];
}

interface AdSetSectionBucket {
  key: string;
  adSetName: string;
  adCount: number;
  conceptGroups: ConceptAdGroup[];
  /** Source AdSet — exposed so the section can surface its own
   *  audience / targeting summary inline. */
  adSet: AdSet;
}

/** Build the Ad set > Concept buckets for a campaign's ad list. Mirrors the
 *  Stage 4 Review hierarchy so the detail page reads the same way. Ads
 *  matched to variants by id; AddAdsModal-tagged ads land in the right
 *  concept via ad.conceptId; the rest collect in a "Recently added" group
 *  attached to the first ad set. */
function groupAdsByAdSetThenConcept(
  campaign: Campaign,
  ads: Ad[],
  added: Ad[],
  extraConcepts: Concept[] = [],
  adSetEdits: Record<string, Partial<AdSet>> = {},
): AdSetSectionBucket[] {
  const adSets = synthesizeAdSets(campaign, extraConcepts, adSetEdits);
  const addedIds = new Set(added.map((a) => a.id));
  const byId = new Map(ads.map((a) => [a.id, a]));

  const sections: AdSetSectionBucket[] = [];
  const taken = new Set<string>();
  for (const adSet of adSets) {
    const conceptGroups: ConceptAdGroup[] = [];
    for (const concept of adSet.concepts) {
      const bucket: Ad[] = [];
      const mix: Record<SrcType, number> = { proven: 0, organic: 0, competitor: 0, ai: 0 };
      for (const variant of concept.variants) {
        const match = byId.get(variant.id);
        if (match) {
          bucket.push(match);
          taken.add(match.id);
          mix[variant.sourceType] += 1;
        }
      }
      for (const ad of ads) {
        if (taken.has(ad.id)) continue;
        if (ad.conceptId === concept.id) {
          bucket.push(ad);
          taken.add(ad.id);
        }
      }
      // Keep empty concept groups so newly-created ad sets (zero ads yet)
      // still render — the "+ Add ads" affordance lives on the ad-set
      // header and needs a visible section to anchor onto.
      conceptGroups.push({
        key: concept.id,
        conceptName: concept.name,
        sourceMix: mix,
        isOrphan: false,
        ads: bucket,
      });
    }
    sections.push({
      key: adSet.id,
      adSetName: adSet.name,
      adCount: 0, // filled below after orphan placement
      conceptGroups,
      adSet,
    });
  }

  // Any ads not claimed by a concept land in a "Recently added" bucket on
  // the first ad set.
  const orphans = ads.filter((a) => !taken.has(a.id));
  if (orphans.length > 0 && sections[0]) {
    const allAddedOrphan = orphans.every((a) => addedIds.has(a.id));
    sections[0].conceptGroups.unshift({
      key: 'orphans',
      conceptName: allAddedOrphan ? 'Recently added' : 'Ungrouped',
      sourceMix: { proven: 0, organic: 0, competitor: 0, ai: 0 },
      isOrphan: true,
      ads: orphans,
    });
  }

  // Backfill totals.
  for (const s of sections) {
    s.adCount = s.conceptGroups.reduce((sum, g) => sum + g.ads.length, 0);
  }
  return sections;
}

function firstConceptId(section: AdSetSectionBucket): string | undefined {
  return section.conceptGroups.find((g) => !g.isOrphan)?.key;
}

/** Ad-set header — collapsible toggle on the left plus a "+ Add ads"
 *  affordance on the right (scoped to this ad set's concept). */
function AdSetHeader({
  section,
  collapsed,
  onToggle,
  onAddAds,
  onEditAudience,
}: {
  section: AdSetSectionBucket;
  collapsed: boolean;
  onToggle: () => void;
  onAddAds: () => void;
  onEditAudience: () => void;
}) {
  const conceptCount = section.conceptGroups.filter((g) => !g.isOrphan).length;
  const adSet = section.adSet;
  // Audience / targeting details, merged into the header (was its own strip).
  const details: { key: string; icon: typeof UserProfileGroup; label: string }[] = [
    {
      key: 'audience',
      icon: UserProfileGroup,
      label: `Homeowners · ${adSet.ageMin}–${adSet.ageMax}${adSet.gender === 'all' ? '' : ` · ${adSet.gender}`}`,
    },
    {
      key: 'locations',
      icon: Marker,
      label: adSet.locations.length === 0 ? 'No location set' : adSet.locations.join(' · '),
    },
    { key: 'language', icon: Globe, label: adSet.language },
    { key: 'goal', icon: Target5, label: PERFORMANCE_GOAL_LABEL[adSet.performanceGoal] },
  ];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: '100%',
        padding: '12px 12px 12px 16px',
        background: 'var(--light-100)',
      }}
    >
      {/* top row: name (clickable toggle) + add ads + chevron pinned far right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={onToggle}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
          }}
        >
          <Text style={{ color: 'var(--dark-90)', fontSize: 15, fontWeight: 500 }}>
            {section.adSetName}
          </Text>
        </button>
        <Button variant="tertiary" size="sm" frontIcon={Plus} onPress={onAddAds}>
          Add ads
        </Button>
        <button
          type="button"
          aria-label={collapsed ? 'Expand ad set' : 'Collapse ad set'}
          aria-expanded={!collapsed}
          onClick={onToggle}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            flexShrink: 0,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--dark-60)',
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 120ms ease',
            }}
          >
            <ChevronDown size={16} color="currentColor" />
          </span>
        </button>
      </div>

      {/* audience & targeting details, left-aligned with the title; meta count
          leads the row, Edit is a small inline link right after the last detail. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
          {conceptCount} concept{conceptCount === 1 ? '' : 's'} · {section.adCount} ad{section.adCount === 1 ? '' : 's'}
        </span>
        {details.map(({ key, icon: Icon, label }) => (
          <span
            key={key}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--dark-60)' }}
          >
            <Icon size={14} color="var(--dark-60)" />
            {label}
          </span>
        ))}
        <button
          type="button"
          onClick={onEditAudience}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--dark-90)',
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

/** One ad-set block: header + each of its concept groups + ads. A 4px
 *  dark-4 strip above each ad-set draws the separator between sections
 *  so they don't bleed into one another. */
function AdSetSection({
  section,
  isFirstSection,
  collapsed,
  onToggle,
  onAddAds,
  onEditAudience,
}: {
  section: AdSetSectionBucket;
  isFirstSection: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onAddAds: () => void;
  onEditAudience: () => void;
}) {
  return (
    <div
      style={{
        borderTop: isFirstSection ? 'none' : '1px solid var(--dark-8)',
      }}
    >
      <AdSetHeader
        section={section}
        collapsed={collapsed}
        onToggle={onToggle}
        onAddAds={onAddAds}
        onEditAudience={onEditAudience}
      />
      {!collapsed && (
        <>
          {section.conceptGroups.map((group, gi) => {
            const isLastInSection = gi === section.conceptGroups.length - 1;
            return (
              <ConceptGroup
                key={group.key}
                group={group}
                isLast={isLastInSection}
              />
            );
          })}
        </>
      )}
    </div>
  );
}

/** Compact audience + targeting strip surfaced inside an expanded ad-set
 *  section. Audience lives at the ad-set level in Meta's hierarchy, so this
 *  belongs here — not as a campaign-level card. */
function ConceptGroup({ group, isLast }: { group: ConceptAdGroup; isLast: boolean }) {
  // Concept name lives in the ad-set header ("{Campaign} – {Concept}") and
  // surfaces again on the AddAdsModal target picker — no need for its own
  // row in the table. We still render the empty-state hint when the
  // concept has zero ads so the "+ Add ads" button has a visible target.
  if (group.ads.length === 0) {
    return (
      <div
        style={{
          padding: '14px 16px',
          borderBottom: isLast ? 'none' : '1px solid var(--dark-8)',
        }}
      >
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
          No ads yet — use the "Add ads" button on this ad set to pick creative.
        </Text>
      </div>
    );
  }
  return (
    <>
      {group.ads.map((ad, i) => (
        <AdRow
          key={ad.id}
          ad={ad}
          isLast={isLast && i === group.ads.length - 1}
        />
      ))}
    </>
  );
}

// ─── AD CARD (grid view) ─────────────────────────────────────────────────

function AdCard({ ad }: { ad: Ad }) {
  const [enabled, setEnabled] = useState(ad.enabled);
  return (
    <Card
      padding="none"
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        opacity: enabled ? 1 : 0.65,
        transition: 'opacity 120ms ease',
      }}
    >
      {/* image with overlays */}
      <div
        aria-hidden
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          background: `var(--dark-4) center / cover no-repeat url(${ad.thumb})`,
        }}
      >
        {ad.fatigue && (
          <span style={{ position: 'absolute', top: 10, right: 10 }}>
            <Pill size="sm" style={{ background: 'var(--light-100)', color: 'var(--status-connect)' }}>
              Fatigue day {ad.fatigue.ageDays}
            </Pill>
          </span>
        )}
      </div>

      {/* body */}
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Text
            variant="largeList"
            style={{
              color: 'var(--dark-90)',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ad.name}
          </Text>
          <StatusChip status={ad.status} />
        </div>

        {/* stats grid — 2 columns × 3 rows */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px 16px',
            padding: '10px 12px',
            background: 'var(--dark-2)',
            borderRadius: 8,
          }}
        >
          <AdStat label="Impressions" value={formatCount(ad.impressions)} />
          <AdStat label="Spent" value={formatMoney(ad.spent)} />
          <AdStat label="CTR" value={formatPercent(ad.ctr)} />
          <AdStat label="Results" value={String(ad.results)} sub="estimates" />
          <AdStat label="Cost per result" value={formatMoney(ad.costPerResult)} sub="per lead" />
          <AdStat label="Budget" value={`${formatMoney(ad.budget)}/day`} />
        </div>

        {/* footer: toggle + on/paused */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Toggle checked={enabled} onChange={setEnabled} aria-label={`${ad.name} on/off`} />
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            {enabled ? 'Running' : 'Paused'}
          </Text>
        </div>
      </div>
    </Card>
  );
}

function AdStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <Text variant="metadata" style={{ color: 'var(--dark-60)', fontSize: 11, display: 'block' }}>
        {label}
      </Text>
      <Text style={{ color: 'var(--dark-90)', fontSize: 15, fontWeight: 500 }}>
        {value}
      </Text>
      {sub && (
        <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 11 }}>
          {sub}
        </Text>
      )}
    </div>
  );
}

function AdRow({ ad, isLast }: { ad: Ad; isLast: boolean }) {
  const [enabled, setEnabled] = useState(ad.enabled);
  const { openModal } = useModals();
  const isWinner = ad.status === 'winner';
  const isGenerating = useIsAdGenerating(ad.id);

  if (isGenerating) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: AD_COLS,
          gap: 12,
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: isLast ? 'none' : '1px solid var(--dark-8)',
        }}
      >
        <ShimmerBlock width={32} height={20} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <ShimmerBlock width={32} height={32} radius={6} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <ShimmerBlock width="70%" height={12} />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'var(--purple)',
                fontWeight: 500,
              }}
            >
              <Stars size={11} color="currentColor" />
              Generating creative…
            </span>
          </div>
        </div>
        <ShimmerBlock width="80%" height={14} />
        <ShimmerBlock width="60%" height={14} />
        <ShimmerBlock width="50%" height={14} />
        <ShimmerBlock width="60%" height={14} />
        <ShimmerBlock width={70} height={20} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: AD_COLS,
        gap: 12,
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-8)',
      }}
    >
      <Toggle checked={enabled} onChange={setEnabled} aria-label={`${ad.name} on/off`} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <img
          src={ad.thumb}
          alt=""
          style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', background: 'var(--dark-4)', flexShrink: 0 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
          <Text variant="largeList" style={{ color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ad.name}
          </Text>
          {ad.fatigue && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'var(--status-connect)',
                fontWeight: 500,
              }}
            >
              <AlertTriangle size={11} color="currentColor" />
              Fatigue · day {ad.fatigue.ageDays}
            </span>
          )}
        </div>
      </div>
      <TwoLine value={formatMoney(ad.budget)} sub={`/day · ${formatMoney(ad.spent)} spent`} />
      <TwoLine value={formatPercent(ad.ctr)} sub={`${formatCount(ad.impressions)} shown`} />
      <TwoLine value={String(ad.results)} sub="estimates" />
      <TwoLine value={formatMoney(ad.costPerResult)} sub="per lead" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <StatusChip status={ad.status} />
        {isWinner && (
          <button
            type="button"
            aria-label="Scale this winning ad"
            onClick={() => openModal(ScaleAdDialog, { ad })}
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex' }}
          >
            <StatusPill tone="accent" size="sm">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Stars size={12} />
                Scale
              </span>
            </StatusPill>
          </button>
        )}
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}k`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function formatPercent(n: number): string {
  if (n === 0) return '—';
  return `${n.toFixed(1)}%`;
}

/** When a campaign has no nested ads, surface a single derived row so the
 *  table still shows something useful. */
function syntheticAds(c: Campaign): Ad[] {
  // Back-derive plausible impressions + CTR from spend and results so single-ad
  // campaigns don't show 0s in the new analytics columns.
  const impressions = Math.max(0, Math.round((c.spent || 1) * 30));
  const ctr = c.results > 0 && impressions > 0
    ? Math.round((c.results / impressions) * 100 * 100) / 100
    : 0;
  return [
    {
      id: `${c.id}-single`,
      name: `${c.name} — primary ad`,
      thumb: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=200&q=80',
      budget: c.budget,
      spent: c.spent,
      results: c.results,
      costPerResult: c.costPerResult,
      impressions,
      ctr,
      status: c.status,
      enabled: c.enabled,
    },
  ];
}

// ─── TARGETING ───────────────────────────────────────────────────────────

// ─── HIERARCHY BREADCRUMB ───────────────────────────────────────────────

/** Campaign > Ad set > Ad breadcrumb. Lives directly under the page header
 *  so the Meta hierarchy is visible everywhere ads are reviewed or analyzed. */
// ─── LEARNING LOOP (data for the attention panel) ───────────────────────

interface LearningInsight {
  label: string;
  title: string;
  body: string;
  cta?: string;
}

/** Build a 4-module learning-loop view from the campaign's actual numbers.
 *  Replaces the older RecommendationsCard with Andrew's "what's happening /
 *  why / what to try next / variants to try" framing. Heuristic, not ML —
 *  derived from spend, CPR, status, and the campaign's ad set structure. */
function buildLearningInsights(campaign: Campaign): LearningInsight[] {
  const winner = campaign.status === 'winner';
  const overspending = campaign.status === 'spending-too-fast';
  const flagged = campaign.flagged === true;

  // Only the directional "What to try next" — the other framing modules
  // (What's happening / Why / 3 variants) read as filler next to the
  // ads table and KPI strip that already convey those.
  const next: LearningInsight = winner
    ? {
        label: 'What to try next',
        title: 'Test a new angle to avoid concept fatigue.',
        body: 'Add a fresh concept under this ad set — Blaze can stage a competitor-inspired hook so you have variance ready when fatigue starts.',
        cta: 'Add a concept',
      }
    : overspending
      ? {
          label: 'What to try next',
          title: 'Refresh creative, then widen targeting by 25%.',
          body: 'Add 2–3 new variants to the strongest concept. Once they\'re live, expand the geo radius so the audience stops compressing.',
          cta: 'Add variants',
        }
      : flagged
        ? {
            label: 'What to try next',
            title: 'Investigate the flagged ad before scaling.',
            body: 'One ad is flagged for compliance — clear it (or pause it) before raising budget. Blaze can suggest a compliant rewrite.',
            cta: 'Review flag',
          }
        : {
            label: 'What to try next',
            title: 'Let it run, but stage backup variants now.',
            body: 'Pre-build 2–3 variants under your current concept so you can swap in fresh creative the moment fatigue starts.',
            cta: 'Pre-stage variants',
          };

  return [next];
}

// ─── HELPERS ─────────────────────────────────────────────────────────────

function SectionCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  // Routes through the DS Card but keeps the page's 12px radius + clipped
  // corners (Card defaults to 8px) so the internal section separators stay
  // flush to the rounded edge.
  return (
    <Card padding="none" style={{ borderRadius: 12, overflow: 'hidden', ...style }}>
      {children}
    </Card>
  );
}

function HeaderCell({ children }: { children: ReactNode }) {
  return (
    <Text variant="metadata" style={{ color: 'var(--dark-60)', fontSize: 12, fontWeight: 400 }}>
      {children}
    </Text>
  );
}

function TwoLine({ value, sub }: { value: string; sub: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <Text variant="largeList" style={{ color: 'var(--dark-90)' }}>
        {value}
      </Text>
      <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
        {sub}
      </Text>
    </div>
  );
}

function formatThousands(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

/** Deterministic mock sparkline points seeded by campaign id offset. */
function spark(seed: number, count: number, jitter: number): number[] {
  const points: number[] = [];
  let v = 0.5;
  for (let i = 0; i < count; i++) {
    const noise = ((Math.sin(seed + i * 1.7) + 1) / 2 - 0.5) * jitter;
    v = Math.max(0.05, Math.min(0.95, v + noise + 0.04));
    points.push(v);
  }
  return points;
}

// ─── ADD AD SET DIALOG ───────────────────────────────────────────────────

/** Inline dialog for the top-level "+ Add ad set" button. Mirrors Stage 3's
 *  AddConceptControl — recommended themes plus a free-form custom-name
 *  fallback. On confirm, fires `onCreate(concept)` with the materialized
 *  concept (which the caller persists via addConceptToCampaign). */
function AddAdSetDialog({
  close,
  campaign,
  onCreate,
}: StackModalProps & {
  campaign: Campaign;
  onCreate: (concept: Concept) => void;
}) {
  const { addedConceptsByCampaign } = useMetaCampaign();
  const extras = addedConceptsByCampaign[campaign.id] ?? [];
  const usedNames = useMemo(() => {
    const names = new Set<string>();
    for (const adSet of synthesizeAdSets(campaign, extras)) {
      for (const c of adSet.concepts) names.add(c.name.toLowerCase());
    }
    return names;
  }, [campaign, extras]);
  const availableThemes = CONCEPT_THEMES.filter((t) => !usedNames.has(t.name.toLowerCase()));
  const [customName, setCustomName] = useState('');

  const createThemed = (t: (typeof CONCEPT_THEMES)[number]) => {
    onCreate(materializeThemedConcept(t));
    close();
  };
  const createCustom = () => {
    if (!customName.trim()) return;
    onCreate(materializeCustomConcept(customName));
    close();
  };

  return (
    <Modal.Root size="sm" aria-labelledby="add-ad-set-title" onClose={close}>
      <Modal.Header title="Add an ad set" id="add-ad-set-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block', marginBottom: 16 }}>
          1 concept = 1 ad set. Pick a recommended theme or name your own — you'll fill it with ads next.
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 11, letterSpacing: '0.22px' }}>
            Recommended themes
          </Text>
          {availableThemes.length === 0 ? (
            <Text variant="secondary" style={{ color: 'var(--dark-60)', padding: 8 }}>
              Every recommended theme is already used in this campaign.
            </Text>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {availableThemes.map((t) => (
                <Card
                  key={t.id}
                  interactive
                  padding="sm"
                  onClick={() => createThemed(t)}
                  style={{ borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>
                    {t.name}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--dark-60)', lineHeight: 1.4 }}>
                    {t.rationale}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--dark-8)', paddingTop: 12, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 11, letterSpacing: '0.22px' }}>
            Or name your own theme
          </Text>
          <TextField
            size="sm"
            fullWidth
            value={customName}
            onChange={setCustomName}
            placeholder="e.g. Color confidence"
            onKeyDown={(e) => {
              if (e.key === 'Enter') createCustom();
            }}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" isDisabled={!customName.trim()} onPress={createCustom}>
            Add ad set
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── EDIT AUDIENCE DIALOG ────────────────────────────────────────────────

const EDIT_LANGUAGE_OPTIONS = ['English (US)', 'Spanish (US)', 'English & Spanish'];
const EDIT_SUGGESTED_LOCATIONS = [
  'Austin, TX · 25mi',
  'Cedar Park, TX · 15mi',
  'Round Rock, TX · 15mi',
  'Pflugerville, TX · 10mi',
  'San Antonio, TX · 25mi',
];

/** Edit the audience / targeting fields surfaced in the audience strip.
 *  Saves a Partial<AdSet> patch through context.updateAdSet — synthesize
 *  applies it on next read so the originals stay immutable. */
function EditAudienceDialog({
  close,
  adSet,
  onSave,
}: StackModalProps & {
  adSet: AdSet;
  onSave: (patch: Partial<AdSet>) => void;
}) {
  const [ageMin, setAgeMin] = useState(adSet.ageMin);
  const [ageMax, setAgeMax] = useState(adSet.ageMax);
  const [gender, setGender] = useState<AdSet['gender']>(adSet.gender);
  const [language, setLanguage] = useState(adSet.language);
  const [locations, setLocations] = useState<string[]>([...adSet.locations]);

  const save = () => {
    onSave({ ageMin, ageMax, gender, language, locations });
    close();
  };

  return (
    <Modal.Root size="sm" aria-labelledby="edit-audience-title" onClose={close}>
      <Modal.Header title="Edit audience" id="edit-audience-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block', marginBottom: 16 }}>
          {adSet.name}
        </Text>

        {/* Age + Language grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={editLabelStyle}>Ages</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <TextField
                type="number"
                min={18}
                max={64}
                value={ageMin}
                onChange={(v) => setAgeMin(Number(v))}
                size="sm"
                fullWidth
                aria-label="Minimum age"
              />
              <span style={{ color: 'var(--dark-60)' }}>–</span>
              <TextField
                type="number"
                min={18}
                max={65}
                value={ageMax}
                onChange={(v) => setAgeMax(Number(v))}
                size="sm"
                fullWidth
                aria-label="Maximum age"
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={editLabelStyle}>Language</span>
            <Select
              value={language}
              onChange={setLanguage}
              size="sm"
              fullWidth
              aria-label="Language"
              options={EDIT_LANGUAGE_OPTIONS.map((l) => ({ value: l, label: l }))}
            />
          </div>
        </div>

        {/* Gender */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <span style={editLabelStyle}>Gender</span>
          <SegmentedControl
            value={gender}
            onChange={(v) => setGender(v as AdSet['gender'])}
            size="sm"
            fullWidth
            aria-label="Gender"
            options={[
              { value: 'all', label: 'All genders' },
              { value: 'men', label: 'Men' },
              { value: 'women', label: 'Women' },
            ]}
          />
        </div>

        {/* Locations chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={editLabelStyle}>Locations</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {locations.map((loc) => (
              <Chip
                key={loc}
                size="sm"
                selected
                deletable
                onDelete={() => setLocations((p) => p.filter((l) => l !== loc))}
              >
                {loc}
              </Chip>
            ))}
            {EDIT_SUGGESTED_LOCATIONS.filter((s) => !locations.includes(s)).map((loc) => (
              <Chip
                key={loc}
                size="sm"
                variant="add"
                onSelectionChange={() => setLocations((p) => [...p, loc])}
              >
                {loc}
              </Chip>
            ))}
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={save}>
            Save
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

const editLabelStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.22px',
  color: 'var(--dark-60)',
  fontWeight: 500,
};

// ─── SCALE AD DIALOG ──────────────────────────────────────────────────

/** Quick action on Winner ads — scale the creative out without leaving
 *  the campaign view. Two destinations matching how a buyer typically
 *  promotes a winner:
 *   • New campaign — break the ad out with its own budget so it isn't
 *     bottlenecked by the parent campaign's spend.
 *   • New ad set in this campaign — duplicate into a fresh ad set so it
 *     re-enters learning on a new audience without disrupting the
 *     original. */
function ScaleAdDialog({ close, ad }: StackModalProps & { ad: Ad }) {
  const { showToast } = useToast();
  const [destination, setDestination] = useState<'new-campaign' | 'new-ad-set'>('new-campaign');
  const [budget, setBudget] = useState(Math.max(50, ad.budget * 2));

  const handleScale = () => {
    const destLabel = destination === 'new-campaign' ? 'a new campaign' : 'a new ad set';
    showToast({ message: `Scaling "${ad.name}" into ${destLabel} at $${budget}/day` });
    close();
  };

  const destinations: { key: 'new-campaign' | 'new-ad-set'; title: string; body: string }[] = [
    {
      key: 'new-campaign',
      title: 'New campaign',
      body: "Break out with its own budget so it isn't capped by the parent.",
    },
    {
      key: 'new-ad-set',
      title: 'New ad set in this campaign',
      body: "Duplicate into a fresh audience without disrupting the original ad set's learning.",
    },
  ];

  return (
    <Modal.Root size="sm" aria-labelledby="scale-ad-title" onClose={close}>
      <Modal.Header title={ad.name} id="scale-ad-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--status-approved)',
            letterSpacing: '0.22px',
            marginBottom: 4,
          }}
        >
          <Stars size={12} color="currentColor" />
          Scale a winner
        </span>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block', marginBottom: 16 }}>
          {formatPercent(ad.ctr)} CTR · {ad.results} results · {formatMoney(ad.costPerResult)} per lead
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--dark-60)', letterSpacing: '0.22px' }}>
            Where should this winner go?
          </span>
          {destinations.map((d) => {
            const selected = destination === d.key;
            return (
              <Card
                key={d.key}
                interactive
                padding="sm"
                onClick={() => setDestination(d.key)}
                style={{
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  border: selected ? '1px solid var(--dark-90)' : undefined,
                  boxShadow: selected ? '0 0 0 1px var(--dark-90)' : undefined,
                  background: selected ? 'var(--dark-2)' : undefined,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>
                  {d.title}
                </span>
                <span style={{ fontSize: 11, color: 'var(--dark-60)', lineHeight: 1.4 }}>
                  {d.body}
                </span>
              </Card>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--dark-60)', letterSpacing: '0.22px' }}>
            Starting daily budget
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--dark-60)' }}>$</span>
            <TextField
              type="number"
              min={10}
              step={5}
              value={budget}
              onChange={(v) => setBudget(Number(v))}
              size="sm"
              aria-label="Starting daily budget"
              style={{ width: 90 }}
            />
            <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>/day</span>
          </span>
          <Text variant="secondary" style={{ color: 'var(--dark-60)', marginLeft: 'auto' }}>
            Blaze suggests 2× the winner's current daily.
          </Text>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" frontIcon={Stars} onPress={handleScale}>
            Scale ad
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── SHIMMER (generation state) ───────────────────────────────────────

/** Single shimmer block + its keyframes — used by AdRow's "Generating
 *  creative…" state. Mirrors Stage 3's variant-tile shimmer. */
function ShimmerBlock({
  width,
  height,
  radius = 4,
}: {
  width: number | string;
  height: number;
  radius?: number;
}) {
  return (
    <>
      <ShimmerKeyframes />
      <div
        style={{
          width,
          height,
          borderRadius: radius,
          background:
            'linear-gradient(90deg, var(--dark-4) 0%, var(--dark-8) 50%, var(--dark-4) 100%)',
          backgroundSize: '200% 100%',
          animation: 'paid-social-shimmer 1.4s linear infinite',
        }}
      />
    </>
  );
}

function ShimmerKeyframes() {
  return (
    <style>{`@keyframes paid-social-shimmer {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }`}</style>
  );
}
