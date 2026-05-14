import { useState, type ReactNode } from 'react';
import { Button, Heading, IconButton, Modal, ModalStack, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { StatusPill, TabChip } from '@/staging';
import MetaBrand from '@/icons/20/MetaBrand';
import MoreDots from '@/icons/20/MoreDots';
import Plus from '@/icons/20/Plus';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronRightSmall from '@/icons/20/ChevronRightSmall';
import ArrowUpSm from '@/icons/20/ArrowUpSm';
import Brand from '@/icons/20/Brand';
import BrandFilled from '@/icons/20/BrandFilled';
import Globe from '@/icons/20/Globe';
import AlertTriangle from '@/icons/20/AlertTriangle';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';

// ─── TYPES ─────────────────────────────────────────────────────────────

type Status =
  | 'on-track'
  | 'spending-too-fast'
  | 'winner'
  | 'testing'
  | 'paused'
  | 'over-budget'
  | 'spending-slowly';

type SubTab = 'campaigns' | 'market-intelligence';

interface FatigueSignal {
  label: string;
  value: string;
  tone: 'negative' | 'warning';
}

interface FatigueCreative {
  name: string;
  imageUrl: string;
  caption: string;
}

interface FatigueFlag {
  ageDays: number;
  signal: string; // short pill text e.g. "CTR -32% past 7d"
  // The new modal renders these directly:
  currentAd: FatigueCreative;
  proposedAd: FatigueCreative;
  signals: FatigueSignal[];
}

interface Ad {
  id: string;
  name: string;
  thumb: string; // gradient
  budget: number;
  spent: number;
  results: number;
  costPerResult: number;
  status: Status;
  enabled: boolean;
  flagged?: boolean;
  fatigue?: FatigueFlag;
}

interface Campaign {
  id: string;
  name: string;
  budget: number;
  spent: number;
  results: number;
  costPerResult: number;
  status: Status;
  enabled: boolean;
  flagged?: boolean;
  ads?: Ad[];
  fatigue?: FatigueFlag;
}

// ─── DATA ──────────────────────────────────────────────────────────────

const CAMPAIGNS: Campaign[] = [
  {
    id: 'sept-hiring',
    name: 'September Hiring Campaign',
    budget: 250,
    spent: 4820,
    results: 47,
    costPerResult: 102.55,
    status: 'spending-too-fast',
    enabled: true,
    flagged: true,
    ads: [
      {
        id: 'sept-hiring-ad-1',
        name: 'Hiring — Reel A',
        // Candid working/people photo — close-up of a smiling employee at work.
        thumb: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=200&q=80',
        budget: 80,
        spent: 1640,
        results: 21,
        costPerResult: 78.1,
        status: 'winner',
        enabled: true,
        flagged: true,
        fatigue: {
          ageDays: 21,
          signal: 'CTR -32% past 7d',
          currentAd: {
            name: 'Hiring — Reel A',
            // Candid employee close-up — same image used as the row thumbnail.
            imageUrl: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=600&q=80',
            caption: 'Founder testimonial · static · 1080×1350',
          },
          proposedAd: {
            name: 'Hiring — Stat-first Reel',
            // Fresh concept — short-form vertical reel scene (creator filming on phone).
            imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80',
            caption: 'Sofia avatar reel · 15s vertical · stat-first hook',
          },
          signals: [
            { label: 'CTR', value: '−32% past 7 days', tone: 'negative' },
            { label: 'CPM', value: '+18% past 7 days', tone: 'negative' },
            { label: 'Frequency', value: '4.6 — saturated', tone: 'negative' },
            { label: 'Audience overlap', value: '+22% with peer set', tone: 'warning' },
            { label: 'Competitor shift', value: '3 peers moved to vertical video in 14d', tone: 'warning' },
          ],
        },
      },
      {
        id: 'sept-hiring-ad-2',
        name: 'Hiring — Static B',
        // Office / workspace shot — clean desk + laptop scene.
        thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=80',
        budget: 80,
        spent: 1610,
        results: 17,
        costPerResult: 94.7,
        status: 'testing',
        enabled: true,
        flagged: true,
        fatigue: {
          ageDays: 17,
          signal: 'CPL +46% past 5d',
          currentAd: {
            name: 'Hiring — Static B',
            // Clean empty workspace — same image used as the row thumbnail.
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
            caption: 'Empty-office hero · static · 1080×1080',
          },
          proposedAd: {
            name: 'Hiring — Team quote pull-out',
            // Fresh concept — real team shot, collaborative scene.
            imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
            caption: 'Team photo · name + role overlay · single-CTA',
          },
          signals: [
            { label: 'CPL', value: '+46% past 5 days', tone: 'negative' },
            { label: 'Click-to-apply', value: '−38% past 5 days', tone: 'negative' },
            { label: 'Impressions', value: 'Flat — scroll-stop failing', tone: 'warning' },
            { label: 'Frequency', value: '3.9 — high recall', tone: 'warning' },
            { label: 'Competitor shift', value: '2 peers swapped to annotated team photos in 10d', tone: 'warning' },
          ],
        },
      },
      {
        id: 'sept-hiring-ad-3',
        name: 'Hiring — Carousel C',
        // Hands-on / collaborative scene — people working together at a table.
        thumb: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&q=80',
        budget: 90,
        spent: 1570,
        results: 9,
        costPerResult: 174.4,
        status: 'over-budget',
        enabled: true,
      },
    ],
  },
  {
    id: 'bogo-1',
    name: 'BOGO Campaign',
    budget: 10.75,
    spent: 215.4,
    results: 14,
    costPerResult: 15.39,
    status: 'on-track',
    enabled: true,
    flagged: true,
    fatigue: {
      ageDays: 28,
      signal: 'Conv -41% past 7d',
      currentAd: {
        name: 'BOGO — Carousel (offer slide 3)',
        // Product flat-lay — current carousel hero image.
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
        caption: '4-slide carousel · offer on slide 3 · 1080×1080',
      },
      proposedAd: {
        name: 'BOGO — Offer-first Carousel',
        // Fresh concept — bold offer-first creative with bundle imagery.
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
        caption: 'Offer in frame 1 · urgency overlay · 1080×1350',
      },
      signals: [
        { label: 'Conversion rate', value: '−41% past 7 days', tone: 'negative' },
        { label: 'Spend per result', value: '+34% past 7 days', tone: 'negative' },
        { label: 'CTR', value: 'Healthy — landing mismatch likely', tone: 'warning' },
        { label: 'Frequency', value: '5.1 — saturated', tone: 'negative' },
        { label: 'Competitor shift', value: 'Aster & Oak now leads with offer on slide 1', tone: 'warning' },
      ],
    },
  },
  {
    id: 'bogo-2',
    name: 'BOGO Campaign',
    budget: 1.75,
    spent: 38.2,
    results: 3,
    costPerResult: 12.73,
    status: 'spending-slowly',
    enabled: true,
  },
  {
    id: 'mindfulness-1',
    name: 'Mindfulness Campaign',
    budget: 10.75,
    spent: 198.6,
    results: 22,
    costPerResult: 9.03,
    status: 'winner',
    enabled: true,
    flagged: true,
  },
  {
    id: 'mindfulness-2',
    name: 'Mindfulness Campaign',
    budget: 1.75,
    spent: 12.8,
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

  const topbarCenter = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {(
        [
          { key: 'campaigns', label: 'Campaigns' },
          { key: 'market-intelligence', label: 'Market Intelligence' },
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
        <Button variant="secondary" size="md" frontIcon={Plus}>
          New campaign
        </Button>
      )}
      <GenerateReportButton />
    </>
  );

  return (
    <H2Layout topbarCenter={topbarCenter} topbarRight={topbarRight}>
      {activeSubTab === 'campaigns' && <PaidSocialBody />}
      {activeSubTab === 'market-intelligence' && <MarketIntelligenceView />}
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
  // The "September Hiring Campaign" is expanded by default. Designers can
  // collapse it / expand others for the demo.
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['sept-hiring']));

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
          overflow: 'hidden',
        }}
      >
        <TableHeader />
        {CAMPAIGNS.map((c) => {
          const isExpanded = expanded.has(c.id) && !!c.ads?.length;
          return (
            <div key={c.id}>
              <CampaignRow
                campaign={c}
                expandable={!!c.ads?.length}
                expanded={isExpanded}
                onToggleExpand={() => toggleExpanded(c.id)}
              />
              {isExpanded && c.ads?.map((ad) => <AdRow key={ad.id} ad={ad} />)}
            </div>
          );
        })}
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

function CampaignRow({
  campaign,
  expandable,
  expanded,
  onToggleExpand,
}: {
  campaign: Campaign;
  expandable: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
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
        <ExpandHandle
          expandable={expandable}
          expanded={expanded}
          onClick={onToggleExpand}
        />
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
          style={{ color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {campaign.name}
        </Text>
      </div>
      <TwoLineCell value={formatMoney(campaign.budget)} sub="daily" />
      <TwoLineCell value={formatMoney(campaign.spent)} sub="total" />
      <TwoLineCell value={String(campaign.results)} sub="website leads" />
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

// ─── AD ROW (nested) ───────────────────────────────────────────────────

function AdRow({ ad }: { ad: Ad }) {
  const [enabled, setEnabled] = useState(ad.enabled);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        gap: 12,
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--dark-8)',
        background: 'var(--dark-2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Toggle checked={enabled} onChange={() => setEnabled((v) => !v)} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, paddingLeft: 40 }}>
        <AdThumb thumb={ad.thumb} name={ad.name} />
        <Text
          variant="smallList"
          style={{ color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {ad.name}
        </Text>
      </div>
      <TwoLineCell value={formatMoney(ad.budget)} sub="daily" />
      <TwoLineCell value={formatMoney(ad.spent)} sub="total" />
      <TwoLineCell value={String(ad.results)} sub="website leads" />
      <TwoLineCell value={formatMoney(ad.costPerResult)} sub="per lead" />
      <div>
        <StatusChip status={ad.status} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {ad.fatigue ? <FatigueFlagPill fatigue={ad.fatigue} adName={ad.name} /> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TypeFlag flagged={!!ad.flagged} />
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

function ExpandHandle({
  expandable,
  expanded,
  onClick,
}: {
  expandable: boolean;
  expanded: boolean;
  onClick: () => void;
}) {
  if (!expandable) {
    return <span style={{ width: 20, height: 20, flexShrink: 0 }} />;
  }
  const Icon = expanded ? ChevronDown : ChevronRightSmall;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={expanded ? 'Collapse campaign' : 'Expand campaign'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        flexShrink: 0,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'var(--dark-60)',
        borderRadius: 4,
      }}
    >
      <Icon size={16} />
    </button>
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

function FatigueRefreshModal({
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

function StatusChip({ status }: { status: Status }) {
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

function formatMoney(n: number): string {
  if (n === 0) return '$0';
  if (Number.isInteger(n)) return `$${n.toLocaleString()}`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── MARKET INTELLIGENCE VIEW ──────────────────────────────────────────

interface MarketIntelCard {
  id: string;
  peer: string;
  metric: string;
  observedImage: string;
  adaptedImage: string;
  observedSummary: string;
  adaptedSummary: string;
  observed: string;
  adapted: string;
}

// Unsplash photo IDs chosen for distinct lifestyle/product/people images
// suitable for social-feed creative previews.
const MARKET_INTEL_SOCIAL: MarketIntelCard[] = [
  {
    id: 'mi-s-1',
    peer: 'NorthSun Wellness',
    metric: '3.2x ROAS',
    observedImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=600&q=80',
    observedSummary: 'Founder-led testimonial · stat hook in first 2s.',
    adaptedSummary: 'Sofia avatar voice-over · "3 in 4 women feel tired by 3pm".',
    observed:
      'Founder-led testimonial with a stat hook in the first 2 seconds — close-up framing, daylight, hand-held delivery to feel unscripted.',
    adapted:
      'Sofia avatar voice-over, opening with "3 in 4 women feel tired by 3pm — here\'s what changed for me." Same close-up framing, in our brand palette.',
  },
  {
    id: 'mi-s-2',
    peer: 'Helia Botanicals',
    metric: 'CTR 4.8%',
    observedImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
    observedSummary: 'Split-screen before/after carousel.',
    adaptedSummary: 'Three-frame: groggy → bundle → energized.',
    observed:
      'Split-screen "before/after" carousel showing the morning routine swap. Heavy-grain still + on-brand sans typography.',
    adapted:
      'Three-frame carousel: groggy morning → Daily Wellness Bundle unboxing → energized commute. Re-shot in Radiant Health brand palette.',
  },
  {
    id: 'mi-s-3',
    peer: 'Quiet Mind Co.',
    metric: '2.4x ROAS',
    observedImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    observedSummary: 'Narrative reel with hand-drawn stat overlays.',
    adaptedSummary: 'Elise avatar · ashwagandha + magnesium story.',
    observed:
      'Narrative reel with hand-drawn stat overlays and ambient soundtrack. Calm, slow pacing — feels editorial, not promotional.',
    adapted:
      'Elise avatar narrates the ashwagandha + magnesium story, on-brand serif typography, same ambient soundtrack.',
  },
  {
    id: 'mi-s-4',
    peer: 'Verdant Daily',
    metric: 'CTR 5.6%',
    observedImage: 'https://images.unsplash.com/photo-1542736667-069246bdbc6d?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    observedSummary: 'UGC compilation · 5 customer clips.',
    adaptedSummary: 'Stitch from 5 top-rated Radiant Health reviews.',
    observed:
      'UGC compilation — 5 customer clips stitched with one shared caption. Quick cuts, natural audio, captions burnt-in.',
    adapted:
      'Pull from the 5 highest-rated Radiant Health reviews, stitched into a 20s reel with our caption style and brand-safe music.',
  },
  {
    id: 'mi-s-5',
    peer: 'Aster & Oak',
    metric: '2.9x ROAS',
    observedImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&q=80',
    observedSummary: 'Founder unboxing · handwritten note overlay.',
    adaptedSummary: 'Sofia unboxes the Daily Wellness Bundle.',
    observed:
      'Founder unboxing the product on a desk with a handwritten note overlay. Soft natural light, single take.',
    adapted:
      'Sofia unboxes the Daily Wellness Bundle, scribbled "for tired moms" note on frame, our gold + cream palette.',
  },
  {
    id: 'mi-s-6',
    peer: 'Ground State Labs',
    metric: 'CTR 4.1%',
    observedImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
    adaptedImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
    observedSummary: 'Static ingredient diagram with arrows + CTA.',
    adaptedSummary: '5-supplement stack breakdown · naturopath callouts.',
    observed:
      'Static "ingredient diagram" with hand-drawn arrows and a strong CTA. Single frame designed to stop the scroll.',
    adapted:
      'Radiant Health ingredient breakdown of the 5-supplement stack with naturopath callouts, in our editorial style.',
  },
];

function MarketIntelligenceView() {
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 28px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
          Successful ad creative from peer businesses, adapted for your brand. Click a card to compare side-by-side.
        </Text>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {MARKET_INTEL_SOCIAL.map((card) => (
          <MarketIntelCardView key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function MarketIntelCardView({ card }: { card: MarketIntelCard }) {
  const { openModal } = useModals();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={() => openModal(MarketIntelComparisonModal, { card })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--light-100)',
        border: `1px solid ${hovered ? 'var(--dark-15)' : 'var(--dark-8)'}`,
        boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'border-color 160ms ease, box-shadow 160ms ease',
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <Globe size={16} color="var(--dark-60)" />
        <Text variant="smallList" style={{ color: 'var(--dark-60)' }}>
          Observed at:
        </Text>
        <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
          {card.peer}
        </Text>
        <span
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            borderRadius: 999,
            background: 'rgba(4, 175, 0, 0.10)',
            color: 'var(--status-approved)',
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {card.metric}
        </span>
      </div>

      {/* preview area — stock image teaser */}
      <div
        aria-hidden
        style={{
          height: 260,
          background: `var(--dark-4) center / cover no-repeat url(${card.observedImage})`,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            padding: '4px 8px',
            borderRadius: 4,
            background: 'rgba(0,0,0,0.5)',
            color: 'var(--light-100)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Ad preview
        </div>
      </div>

      {/* body — trimmed summary, no CTAs */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <Text
            variant="metadata"
            style={{
              color: 'var(--dark-60)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: 12,
              display: 'block',
              marginBottom: 4,
            }}
          >
            Observed
          </Text>
          <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>
            {card.observedSummary}
          </Text>
        </div>
        <div>
          <Text
            variant="metadata"
            style={{
              color: 'var(--dark-60)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: 12,
              display: 'block',
              marginBottom: 4,
            }}
          >
            Adapted for Radiant Health
          </Text>
          <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>
            {card.adaptedSummary}
          </Text>
        </div>
      </div>
    </button>
  );
}

// ─── MARKET INTELLIGENCE COMPARISON MODAL ──────────────────────────────

interface MarketIntelComparisonModalProps {
  card: MarketIntelCard;
}

function MarketIntelComparisonModal({
  close,
  card,
}: StackModalProps & MarketIntelComparisonModalProps) {
  return (
    <Modal.Root size="lg" aria-labelledby="mi-comparison-title">
      <Modal.Header
        title="Compare creative"
        id="mi-comparison-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          <ComparisonPanel
            heading={`Observed at: ${card.peer}`}
            metricPill={card.metric}
            image={card.observedImage}
            label="Observed"
            body={card.observed}
          />
          <ComparisonPanel
            heading="Proposed for Radiant Health"
            image={card.adaptedImage}
            label="Adapted"
            body={card.adapted}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Skip
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>
            Add to campaign
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function ComparisonPanel({
  heading,
  metricPill,
  image,
  label,
  body,
}: {
  heading: string;
  metricPill?: string;
  image: string;
  label: string;
  body: string;
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
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <Globe size={16} color="var(--dark-60)" />
        <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
          {heading}
        </Text>
        {metricPill && (
          <span
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: 999,
              background: 'rgba(4, 175, 0, 0.10)',
              color: 'var(--status-approved)',
              fontSize: 12,
              fontWeight: 500,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {metricPill}
          </span>
        )}
      </div>
      <div
        aria-hidden
        style={{
          height: 280,
          background: `var(--dark-4) center / cover no-repeat url(${image})`,
        }}
      />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
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
        <Text variant="smallList" style={{ color: 'var(--dark-90)', lineHeight: 1.55 }}>
          {body}
        </Text>
      </div>
    </div>
  );
}
