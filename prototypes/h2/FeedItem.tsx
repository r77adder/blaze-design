import type { ComponentType } from 'react';
import { Button, Text } from '@/components';
import ArrowRightSm from '@/icons/16/ArrowRightSm';
import Calendar1 from '@/icons/20/Calendar1';
import Cursor04 from '@/icons/20/Cursor04';
import FileSearch1 from '@/icons/20/FileSearch1';
import Google from '@/icons/20/Google';
import Mail from '@/icons/20/Mail';
import Map02 from '@/icons/20/Map02';
import Star from '@/icons/20/Star';
import Target2 from '@/icons/20/Target2';
import Templates from '@/icons/20/Templates';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import { Card, StatusPill } from '@/staging';
import type { FeedItem as FeedItemData, FeedSource } from './feed-data';
import styles from './FeedItem.module.scss';

interface FeedItemProps {
  item: FeedItemData;
  onAction: (label: string, source: string) => void;
  onOpen?: (item: FeedItemData) => void;
}

/**
 * FeedSource → tool icon. Mirrors the TOOL_ICONS map in pages/Tools.tsx (each
 * feed source corresponds to a sidebar tool). Re-declared locally because the
 * mappings only overlap partially (feed has a 'campaigns' source that isn't a
 * ToolId, tools-context doesn't have a source for it) and lifting a shared
 * map for ten entries isn't worth the indirection. If a third surface ever
 * needs the same mapping, lift it then.
 */
const SOURCE_ICONS: Record<FeedSource, ComponentType<{ size?: number; color?: string }>> = {
  campaigns: Target2,
  seo: FileSearch1,
  organic: Calendar1,
  influencer: UserProfileCircle,
  map: Map02,
  landing: Templates,
  'paid-search': Google,
  'paid-social': Cursor04,
  reputation: Star,
  email: Mail,
};

const THUMB_MAX_INLINE = 4;
const THUMB_SIZE = 64;

export function FeedItem({ item, onAction, onOpen }: FeedItemProps) {
  const thumbnails = item.thumbnails ?? [];
  const visibleThumbs = thumbnails.slice(0, THUMB_MAX_INLINE);
  const overflowCount = thumbnails.length - visibleThumbs.length;
  const SourceIcon = SOURCE_ICONS[item.source];
  // Creative Fatigue items (those carrying a `proposedSolution`) are a
  // different kind of action than a draft-approval — they're a response to
  // a system-detected alert. Surface them with a distinct red badge in
  // place of the amber "Needs sign-off" so they read at a glance as
  // alerts, not approvals.
  const isFatigue = item.kind === 'action' && Boolean(item.proposedSolution);

  return (
    // Prototype-level overrides on the generic <Card>: Ivan's H2 feed-item
    // spec wants 14px radius + asymmetric 18px-20px padding. The generic
    // Card defaults (8px / 16px) are right for typical use; this prototype
    // uses inline style to opt into the H2-specific shape without expanding
    // Card's API for a one-off. Verified via Chrome DevTools MCP.
    //
    // Border: a subtle --dark-4 default that lifts to --dark-8 on hover
    // (the canonical "default border" token). The hover border-color lives
    // in FeedItem.module.scss because :hover can't be expressed inline; the
    // box-shadow from Card's own interactive hover is preserved.
    <Card
      padding="none"
      interactive
      onClick={onOpen ? () => onOpen(item) : undefined}
      className={styles.feedCard}
      style={{ borderRadius: 14, padding: '18px 20px', border: '1px solid var(--dark-4)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* meta row: kind badge (colored, draws the eye) + feature/source
            label (gray, recedes) + time. Kind comes first so it's the first
            thing the user reads on each card. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          {isFatigue ? (
            <StatusPill tone="danger" size="sm">Fatigue alert</StatusPill>
          ) : item.kind === 'action' ? (
            <StatusPill tone="warning" size="sm">Needs sign-off</StatusPill>
          ) : (
            <StatusPill tone="info" size="sm">Insight</StatusPill>
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--dark-60)',
            }}
          >
            <SourceIcon size={16} color="var(--dark-60)" />
            <Text
              variant="metadata"
              style={{
                color: 'var(--dark-60)',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              {item.sourceLabel}
            </Text>
          </span>
          <Text
            variant="metadata"
            style={{
              marginLeft: 'auto',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--dark-60)',
              fontSize: '12px',
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
            fontSize: '14px',
            marginBottom: thumbnails.length > 0 || item.primary ? 14 : 0,
          }}
        >
          {item.body}
        </Text>

        {/* thumbnails — small row, max 4, "+N" overflow */}
        {thumbnails.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: item.primary ? 14 : 0,
            }}
          >
            {visibleThumbs.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                width={THUMB_SIZE}
                height={THUMB_SIZE}
                style={{
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: 8,
                  objectFit: 'cover',
                  border: '1px solid var(--dark-8)',
                  display: 'block',
                  background: 'var(--dark-4)',
                }}
              />
            ))}
            {overflowCount > 0 && (
              <div
                style={{
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: 8,
                  border: '1px solid var(--dark-8)',
                  background: 'var(--dark-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--dark-60)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                +{overflowCount}
              </div>
            )}
          </div>
        )}

        {/* actions — single primary CTA only (secondary lives in modal) */}
        {item.primary && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
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
          </div>
        )}
      </div>
    </Card>
  );
}
