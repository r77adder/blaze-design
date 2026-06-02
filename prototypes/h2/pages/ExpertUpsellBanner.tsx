import { Button, Heading, Text } from '@/components';
import { ArrowRight } from '@/icons/20';

// Drop the salesperson asset into public/salesperson.png — Vite serves /public
// at the site root, so this path resolves to <site>/salesperson.png.
const HEADSHOT = '/salesperson.png';

interface ExpertUpsellBannerProps {
  onTalk: () => void;
  /** Optional copy overrides — defaults match the original Map Ranking usage. */
  heading?: string;
  body?: string;
  ctaLabel?: string;
}

export function ExpertUpsellBanner({
  onTalk,
  heading = 'Show up ahead of competitors on Google',
  body = 'Run Local Service Ads to rise above the pack.',
  ctaLabel = 'Talk to a marketing expert 1:1',
}: ExpertUpsellBannerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'linear-gradient(100deg, #b9d9f4 0%, #d6e9f8 55%, #e7f1fa 100%)',
      }}
    >
      <div
        role="img"
        aria-label=""
        style={{
          width: 96,
          height: 96,
          flexShrink: 0,
          backgroundImage: `url("${HEADSHOT}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <Heading level={5}>{heading}</Heading>
        <Text variant="secondary">{body}</Text>
      </div>

      <div style={{ flexShrink: 0, paddingRight: 24 }}>
        <Button variant="secondary" endIcon={ArrowRight} onPress={onTalk}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
