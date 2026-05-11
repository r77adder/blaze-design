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
    // Prototype-level overrides on the generic <Card>: Ivan's H2 feed-item
    // spec wants 14px radius + asymmetric 18px-20px padding. The generic
    // Card defaults (8px / 16px) are right for typical use; this prototype
    // uses inline style to opt into the H2-specific shape without expanding
    // Card's API for a one-off. Verified via Chrome DevTools MCP.
    <Card padding="none" interactive style={{ borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* meta row: source + kind + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <SourcePill source={SOURCE_KEY_MAP[item.source]} label={item.sourceLabel} />
          <KindBadge kind={item.kind} />
          <Text
            variant="metadata"
            style={{
              marginLeft: 'auto',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--dark-40)',
              fontSize: '11.5px',
            }}
          >
            {item.time}
          </Text>
        </div>

        {/* title — Ivan source: 16px / 500 / dark-90 / lh 1.35 / -0.1px tracking */}
        <Text
          variant="largeList"
          style={{
            display: 'block',
            lineHeight: 1.35,
            letterSpacing: '-0.1px',
            marginBottom: 6,
          }}
        >
          {item.title}
        </Text>

        {/* body — Ivan source: 13.5px / dark-60 / lh 1.55, 14px gap before actions */}
        <Text
          variant="secondary"
          style={{
            display: 'block',
            lineHeight: 1.55,
            color: 'var(--dark-60)',
            fontSize: '13.5px',
            marginBottom: 14,
          }}
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
