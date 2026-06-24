import { Heading, Text } from '@/components';
import ChartHigh from '@/icons/20/ChartHigh';
import { findSimilarCampaign } from './similar-campaign';
import type { GeneratedAd, MetaCampaignDraft } from '../meta-campaign-context';
import type { SimilarMatch } from './types';
import { StatusChip, formatMoney, type Campaign } from '../../pages/PaidSocial';

/**
 * Surfaces the user's closest historical campaign as a confidence anchor.
 * When no match scores above the threshold, renders a fallback card with
 * category benchmarks instead so the user always has SOMETHING to compare
 * against rather than a guessed forecast.
 */
export function SimilarToCard({
  draft,
  generatedAds,
  pool,
}: {
  draft: MetaCampaignDraft;
  generatedAds: GeneratedAd[];
  pool: Campaign[];
}) {
  const match = findSimilarCampaign(draft, generatedAds, pool);

  if (!match) {
    return <FallbackCard />;
  }

  const matchedCampaign = pool.find((c) => c.id === match.campaignId);

  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 16px',
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <ChartHigh size={16} color="var(--dark-60)" />
        <Text style={{ color: 'var(--dark-90)', fontSize: 14, fontWeight: 500 }}>
          Most similar past campaign
        </Text>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* campaign name + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Heading level={5} style={{ color: 'var(--dark-90)', fontSize: 16, margin: 0 }}>
            {match.campaignName}
          </Heading>
          {matchedCampaign && <StatusChip status={matchedCampaign.status} />}
        </div>

        {/* metric recap */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 12,
            padding: '12px 14px',
            background: 'var(--dark-2)',
            borderRadius: 8,
          }}
        >
          <RecapStat label="CTR" value={match.metrics.ctr !== undefined ? `${match.metrics.ctr.toFixed(1)}%` : '—'} />
          <RecapStat
            label="Cost per lead"
            value={match.metrics.costPerResult !== undefined ? formatMoney(match.metrics.costPerResult) : '—'}
          />
          <RecapStat
            label="Results"
            value={match.metrics.results !== undefined ? String(match.metrics.results) : '—'}
          />
          <RecapStat
            label="Impressions"
            value={match.metrics.impressions !== undefined ? formatCount(match.metrics.impressions) : '—'}
          />
        </div>

        {/* similarity / differences narrative */}
        <Text variant="secondary" style={{ color: 'var(--dark-80)', lineHeight: 1.55, display: 'block' }}>
          {narrativeFromMatch(match)}
        </Text>
      </div>
    </div>
  );
}

function FallbackCard() {
  return (
    <div
      style={{
        background: 'var(--dark-2)',
        border: '1px dashed var(--dark-15)',
        borderRadius: 14,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ChartHigh size={16} color="var(--dark-60)" />
        <Text style={{ color: 'var(--dark-90)', fontSize: 14, fontWeight: 500 }}>
          New territory for your account
        </Text>
      </div>
      <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.55, display: 'block' }}>
        No close historical match for this campaign profile. Category benchmarks: ~$78 per lead, ~3.4% CTR,
        ~28-42 estimate requests per month at this budget tier.
      </Text>
    </div>
  );
}

function RecapStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <Text variant="metadata" style={{ color: 'var(--dark-60)', fontSize: 11, display: 'block' }}>
        {label}
      </Text>
      <Text style={{ color: 'var(--dark-90)', fontSize: 15, fontWeight: 500 }}>{value}</Text>
    </div>
  );
}

function narrativeFromMatch(match: SimilarMatch): string {
  const strong = match.score >= 4 ? 'Strong match' : 'Loose match';
  const sims = match.similarities.length
    ? `${match.similarities.join(', ')}`
    : 'limited overlap';
  const diffs = match.differences.length
    ? ` Differs in ${match.differences.join(', ')}.`
    : '';
  return `${strong} on ${sims}.${diffs}`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}k`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}
