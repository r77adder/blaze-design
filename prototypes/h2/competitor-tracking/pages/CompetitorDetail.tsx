import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Heading, IconButton, Text, useModals } from '@/components';
import { Avatar, Card, StatusPill, useToast } from '@/staging';
import { ArrowLeft, Refresh01, Settings } from '@/icons/20';
import { H2Layout } from '../../H2Layout';
import {
  COMPETITORS,
  COMPETITOR_PROFILES,
  FEED_CARDS,
  type CompetitorKey,
} from '../data';
import { ChannelDot, ContentCard } from '../components';
import { CardDetailModal } from '../CardDetailModal';
import { CompetitorSettingsModal } from '../CompetitorSettingsModal';

/**
 * /competitor-tracking/competitor/:key — drill-down per competitor.
 *
 * Layout (matches source HTML lines 6861–6951):
 *   - Back link → /competitor-tracking
 *   - Header card: large avatar, name + tag, domain · reach · tracking-since,
 *     and Settings + Refresh-data actions.
 *   - 4-up KPI strip with trend lines.
 *   - 2-column strategic positioning (Win vs / Why they win).
 *   - Channel footprint cards.
 *   - Filtered feed grid (cards limited to this competitor).
 */
const CHANNEL_KEY_MAP: Record<string, 'instagram' | 'linkedin' | 'google' | 'meta'> = {
  Instagram: 'instagram',
  LinkedIn: 'linkedin',
  'Google Ads': 'google',
  'Meta Ads': 'meta',
};

/**
 * Tonal tints for the strategic-positioning cards and status accents.
 *
 * These are intentionally hex (not tokens) — they're soft success/danger
 * tints (light bg + complementary border + deep fg) that don't have a
 * direct mapping in the Blaze color tokens. Pulled into named constants
 * instead of being inlined.
 */
const PALETTE_SUCCESS_BG = '#ECFDF5';
const PALETTE_SUCCESS_BORDER = '#A7F3D0';
const PALETTE_SUCCESS_FG = '#065F46';
const PALETTE_DANGER_BG = '#FEF2F2';
const PALETTE_DANGER_BORDER = '#FCA5A5';
const PALETTE_DANGER_FG = '#991B1B';
const STATUS_LIVE_FG = '#059669';

export function CompetitorDetailPage() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { openModal } = useModals();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const validKey = key as CompetitorKey | undefined;
  if (!validKey || !(validKey in COMPETITORS)) {
    return <Navigate to="/h2/competitor-tracking" replace />;
  }

  const competitor = COMPETITORS[validKey];
  const profile = COMPETITOR_PROFILES[validKey];
  const competitorCards = useMemo(
    () => FEED_CARDS.filter((c) => c.competitor === validKey),
    [validKey],
  );

  const detailTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        aria-label="Back to Competitor Tracking"
        onPress={() => navigate('/h2/competitor-tracking')}
      />
      <span aria-hidden style={{ width: 1, height: 16, background: 'var(--dark-15)' }} />
      <Heading level={4} style={{ margin: 0, fontWeight: 500 }}>
        {competitor.name}
      </Heading>
      {competitor.tag && (
        <StatusPill tone="neutral" size="sm">{competitor.tag}</StatusPill>
      )}
    </div>
  );

  const topbarRight = (
    <>
      <IconButton
        variant="ghost"
        size="md"
        icon={Settings}
        aria-label="Settings"
        onPress={() => openModal(CompetitorSettingsModal, { competitorKey: validKey })}
      />
      <IconButton
        variant="ghost"
        size="md"
        icon={Refresh01}
        aria-label={refreshing ? 'Refreshing data' : 'Refresh data'}
        onPress={() => {
          setRefreshing(true);
          showToast({ message: 'Refreshing data…', variant: 'success', dismissAfter: 1200 });
          setTimeout(() => {
            setRefreshing(false);
            showToast({ message: 'Data refreshed', variant: 'success' });
          }, 1200);
        }}
      />
    </>
  );

  return (
    <H2Layout title={detailTitle} topbarRight={topbarRight}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 28, maxWidth: 1280 }}>
        {/* Header — avatar + name + meta. Actions moved to topbar. */}
        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar
              fallback={competitor.initials}
              size="lg"
              style={{ background: competitor.color, color: 'var(--light-100)', width: 56, height: 56 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Heading level={3} style={{ marginBottom: 4 }}>{competitor.name}</Heading>
              <Text variant="metadata" style={{ color: 'var(--dark-60)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{profile.domain}</span>
                <span>·</span>
                <span>{profile.reach}</span>
                <span>·</span>
                <span>{profile.trackingSince}</span>
              </Text>
            </div>
          </div>
          <Text variant="secondary" style={{ color: 'var(--dark-80)' }}>{profile.description}</Text>
        </Card>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total reach', value: profile.kpi.totalReach, trend: profile.kpi.trendReach },
            { label: 'Avg engagement', value: profile.kpi.avgEng, trend: profile.kpi.trendEng },
            { label: 'Posts / week', value: profile.kpi.postsPerWeek, trend: profile.kpi.trendPosts },
            { label: 'Active creatives', value: profile.kpi.activeAds, trend: profile.kpi.trendAds },
          ].map((k) => (
            <Card key={k.label} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>{k.label}</Text>
              <Heading level={2}>{k.value}</Heading>
              <Text variant="metadata" style={{ color: STATUS_LIVE_FG }}>{k.trend}</Text>
            </Card>
          ))}
        </div>

        {/* Strategic positioning */}
        <Section title="Strategic positioning" sub="From your landscape analysis">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <Card padding="md" style={{ background: PALETTE_SUCCESS_BG, borderColor: PALETTE_SUCCESS_BORDER }}>
              <Text variant="smallList" style={{ color: PALETTE_SUCCESS_FG, display: 'block', marginBottom: 6 }}>How to win vs them</Text>
              <Text variant="secondary" style={{ color: 'var(--dark-80)' }}>{profile.win}</Text>
            </Card>
            <Card padding="md" style={{ background: PALETTE_DANGER_BG, borderColor: PALETTE_DANGER_BORDER }}>
              <Text variant="smallList" style={{ color: PALETTE_DANGER_FG, display: 'block', marginBottom: 6 }}>Why they win</Text>
              <Text variant="secondary" style={{ color: 'var(--dark-80)' }}>{profile.theirs}</Text>
            </Card>
          </div>
        </Section>

        {/* Channels */}
        <Section title="Channel footprint" sub={`Across ${profile.channels.length} tracked channels`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {profile.channels.map((ch) => {
              const ck = CHANNEL_KEY_MAP[ch.name];
              const isLive = ch.status === 'Live';
              return (
                <Card key={ch.name} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ck && <ChannelDot channel={ck} size={28} />}
                    <Text variant="smallList">{ch.name}</Text>
                    <span style={{ marginLeft: 'auto' }}>
                      <StatusPill tone={isLive ? 'success' : 'neutral'} size="sm">{ch.status}</StatusPill>
                    </span>
                  </div>
                  <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>{ch.followers}</Text>
                  <Text variant="metadata" style={{ color: 'var(--dark-80)' }}>{ch.activity}</Text>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* Filtered feed */}
        <Section title="Their content & campaigns" sub="Click any card to see the full playbook with hooks & landing pages">
          {competitorCards.length === 0 ? (
            <Text style={{ color: 'var(--dark-60)' }}>No tracked content yet.</Text>
          ) : (
            <div style={{ columnCount: 3, columnGap: 24 }}>
              {competitorCards.map((card) => (
                <div key={card.id} style={{ breakInside: 'avoid', marginBottom: 24 }}>
                  <ContentCard
                    card={card}
                    onOpen={(id) => openModal(CardDetailModal, { cardId: id })}
                  />
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </H2Layout>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Heading level={4} style={{ margin: 0, fontWeight: 500 }}>{title}</Heading>
        <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>{sub}</Text>
      </div>
      {children}
    </section>
  );
}
