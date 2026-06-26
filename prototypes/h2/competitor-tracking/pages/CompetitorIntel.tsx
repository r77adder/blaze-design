import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text, useModals } from '@/components';
import { Avatar, Card, StatusPill } from '@/staging';
import { Check2, ChevronRightSmall, Filter, Star } from '@/icons/20';
import { H2Layout } from '../../H2Layout';
import {
  COMPETITORS,
  COMPETITOR_TABLE,
  FEED_CARDS,
  type ChannelKey,
  type CompetitorKey,
} from '../data';
import {
  ChannelDot,
  ContentCard,
  channelLabel,
} from '../components';
import { CardDetailModal } from '../CardDetailModal';
import { CompetitorTabs } from '../CompetitorTabs';
import { AddCompetitorButton } from '../AddCompetitorButton';
import { useSavedCards } from '../SavedCardsContext';

/**
 * /competitor-tracking — Competitor Intel landing page.
 *
 * Sections:
 *   1. Landscape strip (flat 4-card grid — link → /landscape).
 *   2. Competitors table.
 *   3. Content grid (3 columns of ContentCard) with optional filter panel.
 *
 * Topbar:
 *   - `CompetitorTabs` in the center slot (Tracking / Alerts / Landscape).
 *   - "Add competitor" button in the right slot.
 *
 * Interactivity:
 *   - Click "Filter" above the Competitor Content section to open a single
 *     dropdown with Competitor + Channel radio-style selectors.
 *   - Click a feed card → opens CardDetailModal.
 *   - Click a table row → /competitor-tracking/competitor/:key.
 *   - "View landscape" → /competitor-tracking/landscape.
 */

const CHANNEL_LABELS_FALLBACK: Record<ChannelKey, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  google: 'Google Ads',
  meta: 'Meta Ads',
};

export function CompetitorIntelPage() {
  const navigate = useNavigate();
  const { openModal } = useModals();

  const [competitorFilter, setCompetitorFilter] = useState<CompetitorKey | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelKey | 'all'>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const { saved } = useSavedCards();

  const filteredCards = useMemo(() => {
    return FEED_CARDS.filter(
      (c) =>
        (competitorFilter === 'all' || c.competitor === competitorFilter) &&
        (channelFilter === 'all' || c.channel === channelFilter) &&
        (!savedOnly || saved.has(c.id)),
    );
  }, [competitorFilter, channelFilter, savedOnly, saved]);

  return (
    <H2Layout
      topbarCenter={<CompetitorTabs />}
      topbarRight={<AddCompetitorButton />}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 44,
          padding: 28,
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        {/* section: landscape */}
        <LandscapeStrip onOpen={() => navigate('/h2/competitor-tracking/landscape')} />

        {/* section: competitors table */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Heading level={3}>Competitors</Heading>
          <CompetitorTable onDrill={(k) => navigate(`/h2/competitor-tracking/competitor/${k}`)} />
        </section>

        {/* section: content */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Heading level={3}>Competitor Content</Heading>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button
                size="sm"
                variant={savedOnly ? 'primary' : 'secondary'}
                frontIcon={Star}
                isDisabled={saved.size === 0}
                onPress={() => setSavedOnly((v) => !v)}
              >
                {saved.size > 0 ? `Show ${saved.size} Saved` : 'Show Saved Content'}
              </Button>
              <ContentFilterDropdown
                competitorFilter={competitorFilter}
                channelFilter={channelFilter}
                onCompetitorChange={setCompetitorFilter}
                onChannelChange={setChannelFilter}
              />
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <Text style={{ color: 'var(--dark-60)' }}>No content matches this filter.</Text>
          ) : (
            <div style={{ columnCount: 3, columnGap: 24 }}>
              {filteredCards.map((card) => (
                <div key={card.id} style={{ breakInside: 'avoid', marginBottom: 24 }}>
                  <ContentCard
                    card={card}
                    onOpen={(id) => openModal(CardDetailModal, { cardId: id })}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </H2Layout>
  );
}

type ContentFilterDropdownProps = {
  competitorFilter: CompetitorKey | 'all';
  channelFilter: ChannelKey | 'all';
  onCompetitorChange: (k: CompetitorKey | 'all') => void;
  onChannelChange: (k: ChannelKey | 'all') => void;
};

function ContentFilterDropdown({
  competitorFilter,
  channelFilter,
  onCompetitorChange,
  onChannelChange,
}: ContentFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const competitorOptions: Array<{ key: CompetitorKey | 'all'; label: string }> = [
    { key: 'all', label: 'All competitors' },
    ...(['proof', 'bluenotary', 'notarypro'] as CompetitorKey[]).map((k) => ({
      key: k,
      label: COMPETITORS[k].name,
    })),
  ];

  const channelOptions: Array<{ key: ChannelKey | 'all'; label: string }> = [
    { key: 'all', label: 'All channels' },
    ...(['instagram', 'linkedin', 'google', 'meta'] as ChannelKey[]).map((k) => ({
      key: k,
      label: CHANNEL_LABELS_FALLBACK[k] ?? channelLabel(k),
    })),
  ];

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <Button
        size="sm"
        variant="secondary"
        frontIcon={Filter}
        onPress={() => setOpen((v) => !v)}
      >
        Filter
      </Button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            zIndex: 20,
            minWidth: 220,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            padding: '8px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <FilterSection title="Competitor">
            {competitorOptions.map((opt) => (
              <FilterMenuItem
                key={opt.key}
                active={competitorFilter === opt.key}
                onClick={() => onCompetitorChange(opt.key)}
                label={opt.label}
              />
            ))}
          </FilterSection>
          <div style={{ height: 1, background: 'var(--dark-8)', margin: '4px 0' }} />
          <FilterSection title="Channel">
            {channelOptions.map((opt) => (
              <FilterMenuItem
                key={opt.key}
                active={channelFilter === opt.key}
                onClick={() => onChannelChange(opt.key)}
                label={opt.label}
              />
            ))}
          </FilterSection>
        </div>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '4px 12px' }}>
        <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
          {title}
        </Text>
      </div>
      {children}
    </div>
  );
}

function FilterMenuItem({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--dark-4)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '8px 12px',
        background: 'transparent',
        border: 'none',
        textAlign: 'left',
        fontSize: 14,
        fontFamily: 'inherit',
        color: 'var(--dark-90)',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <span>{label}</span>
      {active && (
        <span style={{ color: 'var(--purple)', display: 'inline-flex' }}>
          <Check2 size={16} />
        </span>
      )}
    </button>
  );
}

type LandscapeTone = 'accent' | 'success' | 'info' | 'danger';

function LandscapeStrip({ onOpen }: { onOpen: () => void }) {
  const cards: Array<{ label: string; tone: LandscapeTone; headline: string; body: string }> = [
    {
      label: 'Your position',
      tone: 'accent',
      headline: 'Same-crew, full-scope Austin painter',
      body: 'Between national franchises and one-truck crews. Win by finishing what you start — same faces day-one to day-five.',
    },
    {
      label: 'Biggest opportunity',
      tone: 'success',
      headline: 'HOA + listing-deadline repaints',
      body: "Multi-property work franchises subcontract and solo painters can't scale to. HOA exteriors, MLS turnarounds, cabinet bundles.",
    },
    {
      label: 'Top differentiator',
      tone: 'info',
      headline: 'Crew consistency + UV-stable paint',
      body: "Franchises rotate subs mid-job. Solo painters can't run a 14-house HOA scope. You do both — and you know what survives Austin sun.",
    },
    {
      label: 'Biggest threat',
      tone: 'danger',
      headline: 'Franchises outspending search',
      body: 'Five Star and WOW 1 DAY dominate "house painters Austin" search. Your edge is neighborhood reviews and Realtor referral density.',
    },
  ];
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Heading level={3}>Your competitive landscape</Heading>
          <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
            Generated when you signed up · 11 competitors mapped · Updated 3 days ago
          </Text>
        </div>
        <Button size="sm" variant="secondary" onPress={onOpen}>
          View landscape
        </Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div>
              <StatusPill tone={c.tone} size="sm">
                {c.label}
              </StatusPill>
            </div>
            <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>
              {c.headline}
            </Text>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              {c.body}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}

// Matches paid-search CampaignTable: grid layout, regular-weight header row
// with no background, name + tag pill stacked in the first column, tight
// widths to minimize wrap.
const TABLE_GRID_COLUMNS =
  'minmax(220px, 1.6fr) 100px 110px 150px 90px 90px minmax(160px, 1.2fr) 20px';

const TABLE_GAP = 20;

function CompetitorTable({ onDrill }: { onDrill: (k: CompetitorKey) => void }) {
  return (
    <Card padding="none" style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: TABLE_GRID_COLUMNS,
          gap: TABLE_GAP,
          alignItems: 'center',
          padding: '6px 16px',
          borderBottom: '1px solid var(--dark-8)',
          color: 'var(--dark-60)',
        }}
      >
        <div><Text variant="metadata">Competitor</Text></div>
        <div style={{ textAlign: 'right' }}><Text variant="metadata">Total reach</Text></div>
        <div style={{ textAlign: 'right' }}><Text variant="metadata">Avg engagement</Text></div>
        <div><Text variant="metadata">Channels</Text></div>
        <div style={{ textAlign: 'right' }}><Text variant="metadata">Posts / week</Text></div>
        <div style={{ textAlign: 'right' }}><Text variant="metadata">Active ads</Text></div>
        <div><Text variant="metadata">Latest activity</Text></div>
        <div />
      </div>
      {COMPETITOR_TABLE.map((row, i) => {
        const c = COMPETITORS[row.key];
        return (
          <button
            key={row.key}
            type="button"
            onClick={() => onDrill(row.key)}
            style={{
              display: 'grid',
              gridTemplateColumns: TABLE_GRID_COLUMNS,
              gap: TABLE_GAP,
              alignItems: 'center',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderTop: i === 0 ? 'none' : '1px solid var(--dark-4)',
              width: '100%',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <Avatar
                fallback={c.initials}
                size="md"
                style={{ background: c.color, color: 'var(--light-100)', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0 }}>
                <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>
                  {c.name}
                </Text>
                {c.tag && (
                  <div style={{ marginTop: 4 }}>
                    <StatusPill tone="neutral" size="sm">{c.tag}</StatusPill>
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>{row.totalReach}</Text>
            </div>
            <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>{row.avgEng}</Text>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ChannelDot channel="instagram" size={20} />
              <ChannelDot channel="linkedin" size={20} />
              <ChannelDot channel="google" size={20} />
              <ChannelDot channel="meta" size={20} />
            </div>
            <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>{row.postsPerWeek}</Text>
            </div>
            <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>{row.activeAds}</Text>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', minWidth: 0 }}>
              <Text variant="metadata" style={{ color: 'var(--dark-60)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.latestActivity}
              </Text>
            </div>
            <div style={{ color: 'var(--dark-60)', display: 'flex', alignItems: 'center' }}>
              <ChevronRightSmall size={16} />
            </div>
          </button>
        );
      })}
    </Card>
  );
}

