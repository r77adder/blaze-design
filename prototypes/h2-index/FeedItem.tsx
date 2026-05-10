import { Button, Text } from '@/components';
import ArrowRightSm from '@/icons/16/ArrowRightSm';
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
            style={{
              marginLeft: 'auto',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--dark-40)',
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
          style={{ display: 'block', lineHeight: 1.55, color: 'var(--dark-60)' }}
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
                endIcon={ArrowRightSm}
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
