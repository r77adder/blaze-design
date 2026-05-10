import { Button, Text } from '@/components';
import { Card, KindBadge, SourcePill } from '@/staging';
import type { SourceName } from '@/staging';
import type { FeedItem as FeedItemData, FeedSource } from './feed-data';

interface FeedItemProps {
  item: FeedItemData;
  onAction: (label: string, source: string) => void;
}

/**
 * Feed-data uses short source keys (seo, organic, influencer…) while the
 * lib's <SourcePill> uses canonical SourceName keys (seoaeo, organicsocial,
 * ugc…). Map between them at the boundary.
 */
const SOURCE_KEY_MAP: Record<FeedSource, SourceName> = {
  campaigns: 'campaigns',
  seo: 'seoaeo',
  organic: 'organicsocial',
  influencer: 'ugc',
  map: 'mapranking',
  landing: 'landingpages',
  'paid-search': 'paidsearch',
  'paid-social': 'paidsocial',
  reputation: 'reputation',
  email: 'emailsms',
};

/**
 * Local arrow icon for the primary action button. Will move to `@/icons/16`
 * once an Arrow / ChevronRight icon exists in the lib. See GAPS.md.
 */
function ArrowRight({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function FeedItem({ item, onAction }: FeedItemProps) {
  return (
    <Card padding="md" interactive>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 6px' }}>
        {/* meta row: source + kind + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <SourcePill source={SOURCE_KEY_MAP[item.source]} label={item.sourceLabel} />
          <KindBadge kind={item.kind} />
          <Text
            variant="metadata"
            color="var(--dark-40)"
            style={{
              marginLeft: 'auto',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {item.time}
          </Text>
        </div>

        {/* title */}
        <Text variant="largeList" style={{ display: 'block', lineHeight: 1.35 }}>
          {item.title}
        </Text>

        {/* body */}
        <Text
          variant="secondary"
          color="var(--dark-60)"
          style={{ display: 'block', lineHeight: 1.55 }}
        >
          {item.body}
        </Text>

        {/* actions */}
        {(item.primary || item.secondary) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              marginTop: 8,
            }}
          >
            {item.secondary && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onAction(item.secondary!, item.sourceLabel);
                }}
              >
                {item.secondary}
              </Button>
            )}
            {item.primary && (
              <Button
                variant="secondary"
                size="sm"
                endIcon={ArrowRight}
                onClick={(event) => {
                  event.stopPropagation();
                  onAction(item.primary!, item.sourceLabel);
                }}
              >
                {item.primary}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
