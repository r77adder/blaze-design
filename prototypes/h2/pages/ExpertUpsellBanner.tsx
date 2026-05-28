import { Button, Heading, Text } from '@/components';
import { ArrowRight } from '@/icons/20';

const HEADSHOT = 'https://cdn.prod.website-files.com/64cd367074be316f3359db61/69fa1e7f4a1bab3f0a963897_image%20771-p-1600.jpg';

export function ExpertUpsellBanner({ onTalk }: { onTalk: () => void }) {
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
          borderRadius: 12,
          flexShrink: 0,
          backgroundImage: `url("${HEADSHOT}")`,
          backgroundSize: 'cover',
          backgroundPosition: '70% 50%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <Heading level={5}>Show up ahead of competitors on Google</Heading>
        <Text variant="secondary">Run Local Service Ads to rise above the pack.</Text>
      </div>

      <div style={{ flexShrink: 0, paddingRight: 24 }}>
        <Button variant="secondary" endIcon={ArrowRight} onPress={onTalk}>
          Talk to a marketing expert 1:1
        </Button>
      </div>
    </div>
  );
}
