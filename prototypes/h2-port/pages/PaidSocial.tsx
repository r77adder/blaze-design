import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button, Heading, IconButton, Modal, ModalStack, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { StatusPill, TabChip } from '@/staging';
import MetaBrand from '@/icons/20/MetaBrand';
import MoreDots from '@/icons/20/MoreDots';
import Plus from '@/icons/20/Plus';
import ChevronRightSmall from '@/icons/20/ChevronRightSmall';
import ArrowUpSm from '@/icons/20/ArrowUpSm';
import Brand from '@/icons/20/Brand';
import BrandFilled from '@/icons/20/BrandFilled';
import AlertTriangle from '@/icons/20/AlertTriangle';
import { H2Layout } from '../H2Layout';
import { PaidSocialInsightsView } from '../insights/PaidSocialInsights';
import { useMetaCampaign } from '../meta-campaign/meta-campaign-context';
import type { AdSet } from '../meta-campaign/concept/types';

// ─── TYPES ─────────────────────────────────────────────────────────────

export type Status =
  | 'on-track'
  | 'spending-too-fast'
  | 'winner'
  | 'testing'
  | 'paused'
  | 'over-budget'
  | 'spending-slowly';

type SubTab = 'campaigns' | 'insights';

export interface FatigueSignal {
  label: string;
  value: string;
  tone: 'negative' | 'warning';
}

export interface FatigueCreative {
  name: string;
  imageUrl: string;
  caption: string;
}

export interface FatigueFlag {
  ageDays: number;
  signal: string; // short pill text e.g. "CTR -32% past 7d"
  // The new modal renders these directly:
  currentAd: FatigueCreative;
  proposedAd: FatigueCreative;
  signals: FatigueSignal[];
}

export interface Ad {
  id: string;
  name: string;
  thumb: string; // gradient
  budget: number;
  spent: number;
  results: number;
  costPerResult: number;
  /** Total impressions served (raw count). */
  impressions: number;
  /** Click-through rate as a percentage value, e.g. 4.5 means 4.5%. */
  ctr: number;
  status: Status;
  enabled: boolean;
  flagged?: boolean;
  fatigue?: FatigueFlag;
  /** Optional concept this ad belongs to. Set by AddAdsModal when the user
   *  picks a target concept on the review step. Read by the concept-grouped
   *  AdsTable on the detail page so the added ad lands in the right
   *  concept's bucket without mutating the campaign's adSets structure. */
  conceptId?: string;
}

export interface Campaign {
  id: string;
  name: string;
  budget: number;
  spent: number;
  results: number;
  costPerResult: number;
  status: Status;
  enabled: boolean;
  flagged?: boolean;
  /** Legacy flat ad list — pre-hierarchy seed data and the AddAdsModal flow
   *  still populate this. New campaigns also populate `adSets[0]` and the
   *  detail page synthesizes a default ad set + default concept when the
   *  field is absent.
   *
   *  AddAdsModal-added ads carry an optional `conceptId` so the
   *  concept-grouped AdsTable can place them in the right concept group
   *  without mutating the original adSets structure. */
  ads?: Ad[];
  /** Meta-aligned hierarchy: Campaign > Ad set > Concept > Variant. Optional
   *  so existing seed `CAMPAIGNS` keep type-checking; Unit 10 backfills these
   *  via a read-time synthesizer. */
  adSets?: AdSet[];
  fatigue?: FatigueFlag;
}

// ─── DATA ──────────────────────────────────────────────────────────────

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'spring-exterior',
    name: 'Spring Exterior Campaign',
    budget: 120,
    spent: 2840,
    results: 38,
    costPerResult: 74.7,
    status: 'spending-too-fast',
    enabled: true,
    flagged: true,
    ads: [
      {
        id: 'spring-exterior-ad-1',
        name: 'Exterior — Reel A',
        // Painter on a ladder finishing an exterior — Austin home.
        thumb: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=200&q=80',
        budget: 50,
        spent: 980,
        results: 18,
        costPerResult: 54.4,
        impressions: 32400,
        ctr: 4.8,
        status: 'winner',
        enabled: true,
        flagged: true,
        fatigue: {
          ageDays: 21,
          signal: 'CTR -28% past 7d',
          currentAd: {
            name: 'Exterior — Reel A',
            imageUrl: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
            caption: 'Crew painting Westlake home · static · 1080×1350',
          },
          proposedAd: {
            name: 'Exterior — Before/after Reel',
            // Fresh concept — before/after slide reel of an exterior repaint.
            imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
            caption: 'Cedar Park before/after reel · 15s vertical · transformation hook',
          },
          signals: [
            { label: 'CTR', value: '−28% past 7 days', tone: 'negative' },
            { label: 'CPM', value: '+16% past 7 days', tone: 'negative' },
            { label: 'Frequency', value: '4.3 — saturated', tone: 'negative' },
            { label: 'Audience overlap', value: '+19% with peer set', tone: 'warning' },
            { label: 'Competitor shift', value: '3 Austin painters moved to before/after reels in 14d', tone: 'warning' },
          ],
        },
      },
      {
        id: 'spring-exterior-ad-2',
        name: 'Exterior — Static B',
        // Clean modern Austin home exterior shot.
        thumb: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=200&q=80',
        budget: 40,
        spent: 920,
        results: 14,
        costPerResult: 65.7,
        impressions: 28700,
        ctr: 3.1,
        status: 'testing',
        enabled: true,
        flagged: true,
        fatigue: {
          ageDays: 17,
          signal: 'Cost/lead +42% past 5d',
          currentAd: {
            name: 'Exterior — Static B',
            imageUrl: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
            caption: 'Finished exterior hero · static · 1080×1080',
          },
          proposedAd: {
            name: 'Exterior — Crew + warranty overlay',
            imageUrl: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
            caption: 'Crew on site · 2-year warranty overlay · single-CTA',
          },
          signals: [
            { label: 'Cost per lead', value: '+42% past 5 days', tone: 'negative' },
            { label: 'Click-to-estimate', value: '−34% past 5 days', tone: 'negative' },
            { label: 'Impressions', value: 'Flat — scroll-stop failing', tone: 'warning' },
            { label: 'Frequency', value: '3.7 — high recall', tone: 'warning' },
            { label: 'Competitor shift', value: '2 Austin peers added crew + warranty overlays in 10d', tone: 'warning' },
          ],
        },
      },
      {
        id: 'spring-exterior-ad-3',
        name: 'Exterior — Carousel C',
        // Painters at work, prep stage on a residential exterior.
        thumb: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=200&q=80',
        budget: 30,
        spent: 940,
        results: 6,
        costPerResult: 156.7,
        impressions: 18100,
        ctr: 1.6,
        status: 'over-budget',
        enabled: true,
      },
    ],
    // Demo hierarchy: each concept lives in its own ad set (1 concept =
    // 1 ad set is the v1 default). Spring Exterior shows two ad sets
    // testing different angles against the same campaign budget.
    adSets: [
      {
        id: 'spring-exterior-adset-owner-led',
        name: 'Spring Exterior – Owner-led trust',
        performanceGoal: 'maximize-leads',
        conversionEvent: 'Lead',
        pixelId: 'pxl_blaze_certapro_austin',
        pixelName: 'CertaPro Austin Pixel',
        websiteUrl: 'https://certapro.com/austin',
        ageMin: 30,
        ageMax: 64,
        gender: 'all',
        language: 'English (US)',
        locations: ['Austin, TX · 25mi'],
        concepts: [
          {
            id: 'spring-exterior-concept-owner-led',
            name: 'Owner-led trust',
            rationale: 'Mixed slate around the trust angle — a past winner replay alongside a competitor-inspired reel for variance.',
            intendedAudience: 'Austin homeowners 30–65, home-improvement intent',
            valueProp: 'Trust signal from a recent neighborhood transformation',
            offerAngle: 'Free in-home estimate from the same crew',
            keyMessage: 'Faded exteriors, transformed in days',
            copy: {
              primaryText: '1,200 Austin homes painted since 2008. Owner-led visits, fixed-price quotes, and a 2-year guarantee.',
              headline: 'Faded exteriors, transformed in days',
              description: '',
              cta: 'Get quote',
            },
            variants: [
              {
                id: 'spring-exterior-ad-1',
                sourceType: 'proven',
                sourceRefId: 'proven-westlake-reel',
                sourceMetric: '4.8% CTR',
                format: 'Reel',
                image: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
                included: true,
              },
              {
                id: 'spring-exterior-ad-2',
                sourceType: 'competitor',
                sourceRefId: 'five-star-reel',
                sourceMetric: '3.4x ROAS',
                format: 'Static',
                image: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
                included: true,
              },
            ],
          },
        ],
      },
      {
        id: 'spring-exterior-adset-before-after',
        name: 'Spring Exterior – Before / after',
        performanceGoal: 'maximize-leads',
        conversionEvent: 'Lead',
        pixelId: 'pxl_blaze_certapro_austin',
        pixelName: 'CertaPro Austin Pixel',
        websiteUrl: 'https://certapro.com/austin',
        ageMin: 30,
        ageMax: 64,
        gender: 'all',
        language: 'English (US)',
        locations: ['Austin, TX · 25mi'],
        concepts: [
          {
            id: 'spring-exterior-concept-before-after',
            name: 'Before / after transformation',
            rationale: 'Theme tested against the owner-led angle. Slate mixes a Tarrytown organic post that already performed with a Blaze-generated neighbor-proof story.',
            intendedAudience: 'Same audience, scroll-stopper visual-led',
            valueProp: 'Visual proof of the transformation in a single scroll',
            offerAngle: 'See the change before you book',
            keyMessage: 'Spot the difference — your house, three days apart',
            copy: {
              primaryText: 'Cedar Park, Tarrytown, Westlake — see what 3 days with our crew looks like.',
              headline: 'Your house, three days apart',
              description: '',
              cta: 'Get quote',
            },
            variants: [
              {
                id: 'spring-exterior-ad-3',
                sourceType: 'organic',
                sourceRefId: 'organic-tarrytown-beforeafter',
                sourceMetric: '9.2% engagement',
                format: 'Carousel',
                image: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&q=80',
                included: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cabinet-1',
    name: 'Cabinet Refinishing Campaign',
    budget: 60,
    spent: 1280,
    results: 22,
    costPerResult: 58.18,
    status: 'on-track',
    enabled: true,
    flagged: true,
    fatigue: {
      ageDays: 28,
      signal: 'Estimate req -38% past 7d',
      currentAd: {
        name: 'Cabinet — Carousel (offer slide 3)',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
        caption: '4-slide before/after carousel · offer on slide 3 · 1080×1080',
      },
      proposedAd: {
        name: 'Cabinet — Offer-first Carousel',
        imageUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80',
        caption: 'Save $500 on full kitchen · frame 1 · urgency overlay · 1080×1350',
      },
      signals: [
        { label: 'Estimate request rate', value: '−38% past 7 days', tone: 'negative' },
        { label: 'Spend per lead', value: '+31% past 7 days', tone: 'negative' },
        { label: 'CTR', value: 'Healthy — landing mismatch likely', tone: 'warning' },
        { label: 'Frequency', value: '4.8 — saturated', tone: 'negative' },
        { label: 'Competitor shift', value: 'Paper Moon now leads with offer on slide 1', tone: 'warning' },
      ],
    },
  },
  {
    id: 'cabinet-2',
    name: 'Cabinet Refinishing Campaign',
    budget: 20,
    spent: 412,
    results: 5,
    costPerResult: 82.4,
    status: 'spending-slowly',
    enabled: true,
  },
  {
    id: 'hoa-repaint-1',
    name: 'HOA Repaint Campaign',
    budget: 80,
    spent: 1840,
    results: 9,
    costPerResult: 204.4,
    status: 'winner',
    enabled: true,
    flagged: true,
  },
  {
    id: 'hoa-repaint-2',
    name: 'HOA Repaint Campaign',
    budget: 25,
    spent: 180,
    results: 0,
    costPerResult: 0,
    status: 'paused',
    enabled: false,
  },
];

// Column template (shared by header + every row).
// On/Off | Name | Budget | Spent | Results | CPR | Status | Fatigue | Type | kebab
const COLS =
  '64px minmax(260px, 1.55fr) 110px 110px 110px 120px 160px 150px 44px 44px';

// ─── ROUTE ─────────────────────────────────────────────────────────────

export function PaidSocialRoute() {
  return (
    <ModalStack>
      <PaidSocialRouteInner />
    </ModalStack>
  );
}

function PaidSocialRouteInner() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('campaigns');
  const { start } = useMetaCampaign();

  const topbarCenter = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {(
        [
          { key: 'campaigns', label: 'Campaigns' },
          { key: 'insights', label: 'Insights' },
        ] as const
      ).map((t) => (
        <TabChip
          key={t.key}
          selected={activeSubTab === t.key}
          onSelect={() => setActiveSubTab(t.key)}
        >
          {t.label}
        </TabChip>
      ))}
    </div>
  );

  const topbarRight = (
    <>
      {activeSubTab === 'campaigns' && (
        <Button variant="secondary" size="md" frontIcon={Plus} onPress={start}>
          New campaign
        </Button>
      )}
    </>
  );

  return (
    <H2Layout topbarCenter={topbarCenter} topbarRight={topbarRight}>
      {activeSubTab === 'campaigns' && <PaidSocialBody />}
      {activeSubTab === 'insights' && <PaidSocialInsightsView />}
    </H2Layout>
  );
}

// Collect every active fatigue across the table — both campaign-level and
// ad-level. The banner stack mirrors these. Each entry has the data needed
// to open the same FatigueRefreshModal that the inline pills open.
interface FatigueBannerItem {
  key: string;
  adName: string;
  fatigue: FatigueFlag;
}

function collectFatigues(): FatigueBannerItem[] {
  const items: FatigueBannerItem[] = [];
  for (const c of CAMPAIGNS) {
    if (c.fatigue) {
      items.push({ key: c.id, adName: c.name, fatigue: c.fatigue });
    }
    for (const ad of c.ads ?? []) {
      if (ad.fatigue) {
        items.push({ key: ad.id, adName: ad.name, fatigue: ad.fatigue });
      }
    }
  }
  return items;
}

function PaidSocialBody() {
  const { createdCampaigns } = useMetaCampaign();
  // Campaigns created via the New-campaign flow sort to the top, above the
  // seed data.
  const rows = [...createdCampaigns, ...CAMPAIGNS];

  const fatigues = collectFatigues();

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 28px 60px' }}>
      {fatigues.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <FatigueSummaryBanner items={fatigues} />
        </div>
      )}

      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          // `overflow: clip` (not hidden) — prevents the browser from auto-scrolling
          // the table sideways when a child takes focus, which was hiding the
          // campaign-name click target and silently breaking detail navigation.
          overflowX: 'clip',
          overflowY: 'visible',
        }}
      >
        <TableHeader />
        {rows.map((c) => (
          <CampaignRow key={c.id} campaign={c} />
        ))}
      </div>

    </div>
  );
}

// ─── FATIGUE SUMMARY BANNER (consolidated, top-of-page) ────────────────
// One banner above the table — softer red tint, lists every fatigued ad set.
// Each row inside is clickable and opens the FatigueRefreshModal for that item.

function FatigueSummaryBanner({ items }: { items: FatigueBannerItem[] }) {
  const { openModal } = useModals();
  return (
    <div
      style={{
        borderRadius: 12,
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
        overflow: 'hidden',
      }}
    >
      {/* header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-4)',
        }}
      >
        <AlertTriangle size={16} color="var(--status-connect)" />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
          Creative fatigue · {items.length} ad set{items.length === 1 ? '' : 's'} need attention
        </span>
      </div>

      {/* inline list — each row clickable */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <FatigueSummaryRow
            key={item.key}
            name={item.adName}
            signal={item.fatigue.signal}
            onSelect={() => openModal(FatigueRefreshModal, { fatigue: item.fatigue, adName: item.adName })}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function FatigueSummaryRow({
  name,
  signal,
  onSelect,
  isLast,
}: {
  name: string;
  signal: string;
  onSelect: () => void;
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        background: hovered ? 'var(--dark-4)' : 'transparent',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        width: '100%',
        transition: 'background-color 120ms ease',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', flexShrink: 0 }}>
        {name}
      </span>
      <span
        style={{
          fontSize: 12,
          color: 'var(--dark-60)',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {signal}
      </span>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', color: 'var(--dark-40)' }} aria-hidden>
        <ChevronRightSmall size={16} />
      </span>
    </button>
  );
}

// ─── TABLE HEADER ──────────────────────────────────────────────────────

function TableHeader() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        gap: 12,
        alignItems: 'center',
        padding: '6px 16px',
        borderBottom: '1px solid var(--dark-8)',
      }}
    >
      <HeaderCell>On/Off</HeaderCell>
      <HeaderCell>Campaign name</HeaderCell>
      <HeaderCell>Budget</HeaderCell>
      <HeaderCell>Amount spent</HeaderCell>
      <HeaderCell>Results</HeaderCell>
      <HeaderCell>Cost per result</HeaderCell>
      <HeaderCell>Status</HeaderCell>
      <HeaderCell>Fatigue</HeaderCell>
      <HeaderCell>Type</HeaderCell>
      <span />
    </div>
  );
}

function HeaderCell({ children }: { children: ReactNode }) {
  return (
    <Text
      variant="metadata"
      style={{
        color: 'var(--dark-60)',
        fontSize: 12,
        fontWeight: 400,
      }}
    >
      {children}
    </Text>
  );
}

// ─── CAMPAIGN ROW ──────────────────────────────────────────────────────

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const [enabled, setEnabled] = useState(campaign.enabled);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        gap: 12,
        alignItems: 'center',
        padding: '14px 16px',
        borderBottom: '1px solid var(--dark-8)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Toggle checked={enabled} onChange={() => setEnabled((v) => !v)} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Link
          to={`/h2/paid-social/${campaign.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
            flex: 1,
            color: 'var(--dark-90)',
            textDecoration: 'none',
            cursor: 'pointer',
            padding: '4px 6px',
            margin: '-4px -6px',
            borderRadius: 6,
            transition: 'background-color 120ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MetaBrand size={20} />
          </span>
          <Text
            variant="largeList"
            style={{ color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {campaign.name}
          </Text>
        </Link>
      </div>
      <TwoLineCell value={formatMoney(campaign.budget)} sub="daily" />
      <TwoLineCell value={formatMoney(campaign.spent)} sub="total" />
      <TwoLineCell value={String(campaign.results)} sub="estimate requests" />
      <TwoLineCell value={formatMoney(campaign.costPerResult)} sub="per lead" />
      <div>
        <StatusChip status={campaign.status} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {campaign.fatigue ? (
          <FatigueFlagPill fatigue={campaign.fatigue} adName={campaign.name} />
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TypeFlag flagged={!!campaign.flagged} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton aria-label="Row actions" variant="ghost" size="sm" icon={MoreDots} />
      </div>
    </div>
  );
}

// ─── AD THUMB ──────────────────────────────────────────────────────────

function AdThumb({ thumb, name }: { thumb: string; name: string }) {
  const isUrl = /^https?:\/\//.test(thumb);
  if (isUrl) {
    return (
      <img
        src={thumb}
        alt={name}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          objectFit: 'cover',
          display: 'block',
          flexShrink: 0,
          background: 'var(--dark-4)',
        }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        background: thumb,
        flexShrink: 0,
      }}
    />
  );
}

// ─── CELL HELPERS ──────────────────────────────────────────────────────

function TwoLineCell({ value, sub }: { value: string; sub: string }) {
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

// ─── FATIGUE FLAG PILL ─────────────────────────────────────────────────

function FatigueFlagPill({ fatigue, adName }: { fatigue: FatigueFlag; adName: string }) {
  const { openModal } = useModals();
  return (
    <button
      type="button"
      onClick={() => openModal(FatigueRefreshModal, { fatigue, adName })}
      style={{
        display: 'inline-flex',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <StatusPill tone="warning" size="sm">
        Fatigue day {fatigue.ageDays}
      </StatusPill>
    </button>
  );
}

// ─── FATIGUE REFRESH MODAL ─────────────────────────────────────────────

interface FatigueRefreshModalProps {
  fatigue: FatigueFlag;
  adName: string;
}

export function FatigueRefreshModal({
  close,
  fatigue,
  adName,
}: StackModalProps & FatigueRefreshModalProps) {
  return (
    <Modal.Root size="lg" aria-labelledby="fatigue-refresh-title">
      <Modal.Header
        title={`Refresh creative — ${adName}`}
        id="fatigue-refresh-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        {/* Two-column comparison — current vs proposed */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <FatigueCreativePanel label="Current" creative={fatigue.currentAd} />
          <FatigueCreativePanel label="Proposed" creative={fatigue.proposedAd} />
        </div>

        {/* Detected signals list */}
        <section>
          <Heading level={5} style={{ color: 'var(--dark-90)', marginBottom: 12 }}>
            Detected signals
          </Heading>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {fatigue.signals.map((s, i) => (
              <FatigueSignalRow
                key={s.label}
                signal={s}
                isLast={i === fatigue.signals.length - 1}
              />
            ))}
          </div>
        </section>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Snooze 7 days
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>
            Approve refresh
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function FatigueCreativePanel({
  label,
  creative,
}: {
  label: 'Current' | 'Proposed';
  creative: FatigueCreative;
}) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Text
          variant="metadata"
          style={{
            color: 'var(--dark-60)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: 12,
            display: 'block',
          }}
        >
          {label}
        </Text>
        <Heading level={5} style={{ color: 'var(--dark-90)' }}>
          {creative.name}
        </Heading>
      </div>
      <div
        aria-hidden
        style={{
          height: 240,
          background: `var(--dark-4) center / cover no-repeat url(${creative.imageUrl})`,
        }}
      />
      <div style={{ padding: 16 }}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.55 }}>
          {creative.caption}
        </Text>
      </div>
    </div>
  );
}

function FatigueSignalRow({
  signal,
  isLast,
}: {
  signal: FatigueSignal;
  isLast: boolean;
}) {
  const dotColor =
    signal.tone === 'negative' ? 'var(--red-70)' : 'var(--status-connect)';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-8)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }}
      />
      <Text variant="secondary" style={{ color: 'var(--dark-60)', minWidth: 140 }}>
        {signal.label}
      </Text>
      <Text style={{ color: 'var(--dark-90)', fontSize: 14 }}>{signal.value}</Text>
    </div>
  );
}

// ─── STATUS CHIP ───────────────────────────────────────────────────────

interface StatusStyle {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  withArrow?: boolean;
}

const STATUS_STYLES: Record<Status, StatusStyle> = {
  'on-track': { label: 'On track', tone: 'success' },
  'spending-too-fast': { label: 'Spending too fast', tone: 'warning', withArrow: true },
  winner: { label: 'Winner', tone: 'success' },
  testing: { label: 'Testing', tone: 'warning' },
  paused: { label: 'Paused', tone: 'neutral' },
  'over-budget': { label: 'Over budget', tone: 'danger' },
  'spending-slowly': { label: 'Spending slowly', tone: 'neutral' },
};

export function StatusChip({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <StatusPill tone={s.tone} size="sm">
      {s.withArrow ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {s.label}
          <ArrowUpSm size={12} />
        </span>
      ) : (
        s.label
      )}
    </StatusPill>
  );
}

// ─── TYPE FLAG ─────────────────────────────────────────────────────────

function TypeFlag({ flagged }: { flagged: boolean }) {
  // Filled green tag for flagged campaigns, outlined neutral for the rest.
  // Brand/BrandFilled is the closest tag-shape in our 20px catalog.
  if (flagged) {
    return <BrandFilled size={20} color="var(--status-approved)" />;
  }
  return <Brand size={20} color="var(--dark-40)" />;
}

// ─── TOGGLE (duplicated from Tools.tsx — per-row pill toggle) ──────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 34,
        height: 20,
        flexShrink: 0,
        borderRadius: 999,
        background: checked ? 'var(--dark-90)' : 'var(--dark-15)',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        transition: 'background-color 160ms ease',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 16 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'var(--light-100)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'left 160ms ease',
        }}
      />
    </button>
  );
}

// ─── HELPERS ───────────────────────────────────────────────────────────

export function formatMoney(n: number): string {
  if (n === 0) return '$0';
  if (Number.isInteger(n)) return `$${n.toLocaleString()}`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
