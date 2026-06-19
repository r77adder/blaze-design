import { Button, Heading, Text } from '@/components';
import { ArrowRight } from '@/icons/20';

// Drop the salesperson asset into public/salesperson.png. Resolve against
// Vite's BASE_URL so it works under a deployed sub-path, not just the root.
const HEADSHOT = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/salesperson.png`;

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
  ctaLabel = 'Talk to an expert 1:1',
}: ExpertUpsellBannerProps) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        minHeight: 88,
        borderRadius: 12,
        background: 'linear-gradient(100deg, #b9d9f4 0%, #d6e9f8 55%, #e7f1fa 100%)',
      }}
    >
      {/* Cutout column — image is anchored to the bottom and taller than the
          banner so the top of his head bleeds out above the frame. */}
      <div style={{ position: 'relative', width: 112, flexShrink: 0, alignSelf: 'stretch' }}>
        <img
          src={HEADSHOT}
          alt=""
          style={{
            position: 'absolute',
            left: 14,
            bottom: 0,
            height: 'calc(100% + 14px)',
            width: 'auto',
            maxWidth: 104,
            objectFit: 'contain',
            objectPosition: 'bottom',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, padding: '14px 0' }}>
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
