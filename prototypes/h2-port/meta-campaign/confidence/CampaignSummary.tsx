import { Text } from '@/components';
import Stars from '@/icons/20/Stars';
import { campaignSummary } from './summary';
import type { GeneratedAd, MetaCampaignDraft } from '../meta-campaign-context';
import type { SafetyNetConfig } from './types';

/**
 * Plain-English campaign summary block. Renders the brief Blaze would give a
 * CMO — reads like a sentence, not a config receipt.
 */
export function CampaignSummary({
  draft,
  generatedAds,
  safetyNet,
}: {
  draft: MetaCampaignDraft;
  generatedAds: GeneratedAd[];
  safetyNet: SafetyNetConfig;
}) {
  const paragraph = campaignSummary({ draft, generatedAds, safetyNet });
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '16px 18px',
        borderRadius: 12,
        background: 'rgba(124, 92, 252, 0.06)',
        border: '1px solid rgba(124, 92, 252, 0.18)',
      }}
    >
      <span style={{ display: 'inline-flex', flexShrink: 0, marginTop: 2 }}>
        <Stars size={18} color="var(--purple)" />
      </span>
      <Text
        variant="secondary"
        style={{
          color: 'var(--dark-80)',
          lineHeight: 1.55,
          display: 'block',
          fontSize: 14,
        }}
      >
        {paragraph}
      </Text>
    </div>
  );
}
