import { useState, type ComponentType, type ReactNode } from 'react';
import { Button, IconButton, Text } from '@/components';
import { Card, Chip, Pill } from '@/staging';
import { Ads, Document, EyeOpen, Facebook, Google, Instagram, LinkedIn, Star, StarFilled } from '@/icons/20';
import StillImageIcon from '../StillImageIcon';
import { useSavedCards } from './SavedCardsContext';
import {
  COMPETITORS,
  type ChannelKey,
  type CompetitorKey,
  type FeedCard,
  type PerfSignal,
} from './data';

// Brand identity colors — kept as raw hex (third-party brand identity, not design tokens).
const BRAND_COLORS = {
  linkedin: '#0A66C2',
  google: '#4285F4',
  meta: '#0064E0',
  instagramGradient: 'linear-gradient(135deg,#f09433 0%,#dc2743 50%,#bc1888 100%)',
  // LinkedIn organic post surface (LinkedIn feed bg).
  linkedinSurface: '#F3F2EF',
  // Google Search result text colors.
  googleResultText: '#202124',
  googleResultUrl: '#5F6368',
  googleResultLink: '#1A0DAB',
  // Meta ad bottom-bar surface + CTA bg.
  metaSurface: '#F0F2F5',
  metaCtaBg: '#E4E6EB',
} as const;

// Specific engagement-glyph red (matches the heart/like color of the source mockup,
// distinct from the design-system token --red-70 which is reserved for error states).
const ENGAGEMENT_GLYPH_RED = '#DC2626';

// Perf-signal tonal palette — kept as raw hex to preserve the specific tinted
// surface/foreground shades from the source mockup (these are tonal scales, not
// design tokens).
const SIGNAL_TONE_COLORS = {
  viral: { bg: '#FEF3C7', label: '#92400E', value: '#78350F' },
  above: { bg: '#ECFDF5', label: '#047857', value: '#065F46' },
  below: { bg: '#FEF2F2', label: '#B91C1C', value: '#991B1B' },
  brandHit: { bg: '#F5F3FF', label: '#6D28D9', value: '#5B21B6' },
} as const;

/**
 * Shared primitives for the Competitor Tracking prototype: channel iconography,
 * perf-signal pills, feed-card thumbs, and the FeedCardTile composite.
 *
 * The HTML mockup expresses these as bespoke CSS rules per card variant
 * (`.card-thumb`, `.linkedin-post-thumb`, `.google-ad-thumb`, `.meta-ad-thumb`).
 * Here they collapse into a single `<FeedCardTile card={FeedCard}>` that picks
 * the right thumb shape from `card.type`. See GAPS.md → "FeedCard variants".
 */

const CHANNEL_LABELS: Record<ChannelKey, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  google: 'Google Ads',
  meta: 'Meta Ads',
};

const CHANNEL_TINT: Record<ChannelKey, string> = {
  instagram: BRAND_COLORS.instagramGradient,
  linkedin: BRAND_COLORS.linkedin,
  google: BRAND_COLORS.google,
  meta: BRAND_COLORS.meta,
};

const CHANNEL_ICONS: Record<ChannelKey, React.ComponentType<{ size?: number; color?: string }>> = {
  instagram: Instagram,
  linkedin: LinkedIn,
  google: Google,
  meta: Facebook,
};

const GRADIENTS = [
  'linear-gradient(135deg,#A78BFA 0%,#7C3AED 100%)',
  'linear-gradient(135deg,#60A5FA 0%,#2563EB 100%)',
  'linear-gradient(135deg,#34D399 0%,#059669 100%)',
  'linear-gradient(135deg,#F472B6 0%,#DB2777 100%)',
  'linear-gradient(135deg,#FB923C 0%,#EA580C 100%)',
  'linear-gradient(135deg,#FBBF24 0%,#D97706 100%)',
  'linear-gradient(135deg,#FCA5A5 0%,#DC2626 100%)',
  'linear-gradient(135deg,#0EA5E9 0%,#0369A1 100%)',
];

export function gradFor(n: number | undefined): string {
  if (n === undefined) return GRADIENTS[0]!;
  return GRADIENTS[(n - 1) % GRADIENTS.length]!;
}

export function channelLabel(c: ChannelKey): string {
  return CHANNEL_LABELS[c];
}

export function ChannelDot({ channel, size = 18 }: { channel: ChannelKey; size?: number }) {
  const Icon = CHANNEL_ICONS[channel];
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        background: CHANNEL_TINT[channel],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--light-100)',
        flexShrink: 0,
      }}
    >
      <Icon size={Math.max(8, size - 6)} color="var(--light-100)" />
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: ChannelKey }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--dark-60)',
        color: 'var(--light-100)',
        padding: '4px 8px',
        borderRadius: 6,
        backdropFilter: 'blur(4px)',
      }}
    >
      <ChannelDot channel={channel} size={14} />
      <Text variant="metadata" style={{ color: 'var(--light-100)', fontWeight: 500 }}>
        {channelLabel(channel)}
      </Text>
    </span>
  );
}

export function CompetitorBadge({ k }: { k: CompetitorKey }) {
  const c = COMPETITORS[k];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--dark-60)',
        color: 'var(--light-100)',
        padding: '4px 8px',
        borderRadius: 6,
        backdropFilter: 'blur(4px)',
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: c.color,
          color: 'var(--light-100)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          fontWeight: 600,
        }}
      >
        {c.initials}
      </span>
      <Text variant="metadata" style={{ color: 'var(--light-100)', fontWeight: 500 }}>
        {c.short}
      </Text>
    </span>
  );
}

// ── Perf signals ──────────────────────────────────────────────────────────

const SIGNAL_BG: Record<PerfSignal['tone'], string> = {
  viral: SIGNAL_TONE_COLORS.viral.bg,
  above: SIGNAL_TONE_COLORS.above.bg,
  typical: 'var(--dark-4)',
  below: SIGNAL_TONE_COLORS.below.bg,
  'brand-hit': SIGNAL_TONE_COLORS.brandHit.bg,
};
const SIGNAL_LABEL_FG: Record<PerfSignal['tone'], string> = {
  viral: SIGNAL_TONE_COLORS.viral.label,
  above: SIGNAL_TONE_COLORS.above.label,
  typical: 'var(--dark-60)',
  below: SIGNAL_TONE_COLORS.below.label,
  'brand-hit': SIGNAL_TONE_COLORS.brandHit.label,
};
const SIGNAL_VALUE_FG: Record<PerfSignal['tone'], string> = {
  viral: SIGNAL_TONE_COLORS.viral.value,
  above: SIGNAL_TONE_COLORS.above.value,
  typical: 'var(--dark-90)',
  below: SIGNAL_TONE_COLORS.below.value,
  'brand-hit': SIGNAL_TONE_COLORS.brandHit.value,
};

/**
 * Stacked perf-signal rows. By default each signal renders with a tonal
 * background (viral yellow, above green, below red, brand-hit purple,
 * typical dark-4). Pass `flat` to drop the background + padding — the
 * tonal label/value colors still carry the meaning. Use `flat` inside
 * cards where backgrounds clutter the layout; keep filled in modals.
 */
export function PerfSignalRow({
  signals,
  flat = false,
}: {
  signals: [PerfSignal, PerfSignal];
  flat?: boolean;
}) {
  if (flat) {
    return (
      <div
        style={{
          background: 'var(--dark-2)',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {signals.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              overflow: 'hidden',
            }}
          >
            <span>{s.icon}</span>
            <Text
              variant="secondary"
              style={{
                color: 'var(--dark-90)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
            </Text>
            <Text
              variant="smallList"
              style={{
                marginLeft: 'auto',
                color: 'var(--dark-90)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.value}
            </Text>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {signals.map((s, i) => (
        <div
          key={i}
          style={{
            background: SIGNAL_BG[s.tone],
            padding: '6px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: SIGNAL_LABEL_FG[s.tone],
            overflow: 'hidden',
          }}
        >
          <span>{s.icon}</span>
          <Text
            variant="secondary"
            style={{
              color: SIGNAL_LABEL_FG[s.tone],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </Text>
          <Text
            variant="smallList"
            style={{
              marginLeft: 'auto',
              color: SIGNAL_VALUE_FG[s.tone],
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {s.value}
          </Text>
        </div>
      ))}
    </div>
  );
}

// ── Filter chip rail ──────────────────────────────────────────────────────

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Chip
      size="md"
      selected={active}
      onSelectionChange={() => onClick()}
      style={{
        height: 32,
        padding: '0 12px',
        borderRadius: 99,
        background: active ? 'var(--light-100)' : 'transparent',
        border: `1px solid ${active ? 'var(--dark-15)' : 'transparent'}`,
        color: active ? 'var(--dark-90)' : 'var(--dark-60)',
        boxShadow: active ? '0 1px 2px var(--dark-4)' : 'none',
      }}
    >
      {children}
    </Chip>
  );
}

export function FilterRail({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        background: 'var(--dark-4)',
        padding: 4,
        borderRadius: 99,
        width: 'fit-content',
        flexWrap: 'wrap',
      }}
    >
      {children}
    </div>
  );
}

// ── Feed card thumb (4 variants) ─────────────────────────────────────────

export function FeedCardThumb({ card, hideBadges = false }: { card: FeedCard; hideBadges?: boolean }) {
  if (card.type === 'organic-ig') {
    return (
      <div
        style={{
          minHeight: 280,
          position: 'relative',
          background: gradFor(card.grad),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {!hideBadges && (
          <>
            <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}><ChannelBadge channel={card.channel} /></div>
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}><CompetitorBadge k={card.competitor} /></div>
          </>
        )}
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--light-60)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Instagram size={28} color="var(--light-60)" />
          </div>
        )}
      </div>
    );
  }
  if (card.type === 'organic-li') {
    return (
      <div style={{ position: 'relative', background: BRAND_COLORS.linkedinSurface, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!hideBadges && (
          <>
            <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}><ChannelBadge channel="linkedin" /></div>
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}><CompetitorBadge k={card.competitor} /></div>
          </>
        )}
        <div style={{ padding: '32px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--dark-80)', lineHeight: '15px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{card.liBody}</div>
          <div style={{ fontSize: 12, color: BRAND_COLORS.linkedin, fontWeight: 500 }}>{card.liTag}</div>
        </div>
        {card.imageUrl && (
          <div style={{ width: '100%', minHeight: 200, overflow: 'hidden' }}>
            <img
              src={card.imageUrl}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', minHeight: 200, objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}
      </div>
    );
  }
  if (card.type === 'ad-google') {
    return (
      <div style={{ height: 160, position: 'relative', background: 'var(--light-100)', padding: '32px 14px 14px', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
        {!hideBadges && (
          <>
            <div style={{ position: 'absolute', top: 8, left: 8 }}><ChannelBadge channel="google" /></div>
            <div style={{ position: 'absolute', top: 8, right: 8 }}><CompetitorBadge k={card.competitor} /></div>
          </>
        )}
        <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: BRAND_COLORS.googleResultText, border: `1px solid ${BRAND_COLORS.googleResultText}`, padding: '0 4px', borderRadius: 3, width: 'fit-content' }}>Sponsored</span>
        <div style={{ fontSize: 12, color: BRAND_COLORS.googleResultUrl }}>{card.googleUrl}</div>
        <div style={{ fontSize: 14, color: BRAND_COLORS.googleResultLink, fontWeight: 500, lineHeight: '18px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{card.googleHeadline}</div>
        <div style={{ fontSize: 12, color: 'var(--dark-80)', lineHeight: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{card.googleDesc}</div>
      </div>
    );
  }
  // ad-meta
  return (
    <div style={{ position: 'relative', background: 'var(--light-100)', overflow: 'hidden' }}>
      {!hideBadges && (
        <>
          <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}><ChannelBadge channel="meta" /></div>
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}><CompetitorBadge k={card.competitor} /></div>
        </>
      )}
      <div style={{ minHeight: 280, position: 'relative', background: gradFor(card.grad), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, overflow: 'hidden' }}>
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        ) : (
          card.metaImage
        )}
      </div>
      <div style={{ height: 44, background: BRAND_COLORS.metaSurface, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <strong style={{ fontSize: 12, color: 'var(--dark-90)' }}>{card.metaBrand}</strong>
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>{card.metaSub}</span>
        </div>
        <Button
          size="xs"
          variant="secondary"
          style={{
            background: BRAND_COLORS.metaCtaBg,
            color: 'var(--dark-90)',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {card.metaCta}
        </Button>
      </div>
    </div>
  );
}

// ── FeedCardTile ─────────────────────────────────────────────────────────

export function FeedCardTile({
  card,
  onOpen,
}: {
  card: FeedCard;
  onOpen: (id: string) => void;
}) {
  const { isSaved, toggleSaved } = useSavedCards();
  const saved = isSaved(card.id);
  const isAd = card.type === 'ad-google' || card.type === 'ad-meta';
  return (
    <Card
      padding="none"
      interactive
      onClick={() => onOpen(card.id)}
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <FeedCardThumb card={card} />
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {card.caption && (
          <Text variant="secondary" style={{ color: 'var(--dark-90)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {card.caption}
          </Text>
        )}
        {!isAd && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: ENGAGEMENT_GLYPH_RED }}>{card.engagementGlyph}</span>
              <Text variant="metadata" style={{ color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                {card.engagement}
              </Text>
            </span>
            <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
              <Text variant="metadata" style={{ color: 'var(--dark-80)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                {card.secondaryStat}
              </Text>
              <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
                {card.date}
              </Text>
            </span>
          </div>
        )}
        <PerfSignalRow signals={card.signals} flat />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <IconButton
            size="sm"
            variant="secondary"
            icon={saved ? StarFilled : Star}
            active={saved}
            title={saved ? 'Saved' : 'Save for later'}
            aria-pressed={saved}
            onPress={() => toggleSaved(card.id)}
            onClick={(e) => e.stopPropagation()}
            style={{
              border: `1px solid ${saved ? 'var(--purple)' : 'var(--dark-8)'}`,
              background: saved ? SIGNAL_TONE_COLORS.brandHit.bg : 'var(--light-100)',
              color: saved ? 'var(--purple)' : 'var(--dark-60)',
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            frontIcon={EyeOpen}
            onPress={() => onOpen(card.id)}
            style={{ flex: 1 }}
          >
            View details
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ── Content-type header (used by ContentCard) ────────────────────────────

/**
 * Maps the feed-card variant to a content-type label + colored icon, mirroring
 * the H2 calendar event card's header strip. The competitor-tracking feed
 * doesn't carry the calendar's full content-type taxonomy (still/carousel/
 * feed-video/short-video/story) — instead we infer a sensible label from the
 * platform/format pairing.
 *
 * Icon color tokens are pulled from the CreatePostFlow content-type palette:
 * - still       → red-70
 * - carousel    → status-connect
 * - feed-video  → purple
 * - short-video → status-posting
 * - story       → status-new
 *
 * `Ads` (megaphone glyph) stands in for sponsored content, and `Document`
 * stands in for LinkedIn article-style posts.
 */
const CONTENT_TYPE_BY_FEED_TYPE: Record<
  FeedCard['type'],
  { label: string; icon: ComponentType<{ size?: number; color?: string }>; color: string }
> = {
  'organic-ig': { label: 'Still Image', icon: StillImageIcon, color: 'var(--red-70)' },
  'organic-li': { label: 'Article', icon: Document, color: 'var(--status-posting)' },
  'ad-google': { label: 'Sponsored ad', icon: Ads, color: 'var(--status-connect)' },
  'ad-meta': { label: 'Sponsored image', icon: StillImageIcon, color: 'var(--red-70)' },
};

/**
 * Card header strip — content-type label on the left, platform pill (with a
 * small platform glyph) on the right. Exported so CardDetailModal can reuse
 * the same header above its detail thumb.
 */
export function ContentTypeHeader({ card }: { card: FeedCard }) {
  const def = CONTENT_TYPE_BY_FEED_TYPE[card.type];
  const Icon = def.icon;
  const PlatformIcon = CHANNEL_ICONS[card.channel];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        background: 'var(--light-100)',
        borderBottom: '1px solid var(--dark-4)',
      }}
    >
      <Icon size={16} color={def.color} />
      <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>
        {def.label}
      </Text>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Pill size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {/* Instagram icon has a built-in brand gradient when no `color` prop
            * is passed — passing a CSS gradient string would invalidate the
            * SVG fill. Other channels get their solid brand color. */}
          {card.channel === 'instagram' ? (
            <PlatformIcon size={12} />
          ) : (
            <PlatformIcon size={12} color={CHANNEL_TINT[card.channel]} />
          )}
          {channelLabel(card.channel)}
        </Pill>
      </span>
    </div>
  );
}

// ── ContentCard ──────────────────────────────────────────────────────────

/**
 * Trimmed feed-card variant used on the CompetitorIntel landing page. Less
 * chrome than FeedCardTile: no "View details" CTA (the whole card is the
 * click target), tighter caption font, and a stacked perf-signal column.
 *
 * Channel + competitor identification lives in a Pill footer (not inside the
 * thumb) — the thumb renders without badges via `hideBadges`. Engagement /
 * secondary stats are rendered with per-platform mimicry (heart for IG, thumb
 * for LinkedIn, "Sponsored ·" for ads).
 *
 * FeedCardTile remains the richer tile used by CompetitorDetail.
 */
export function ContentCard({
  card,
  onOpen,
}: {
  card: FeedCard;
  onOpen?: (id: string) => void;
}) {
  const { isSaved, toggleSaved } = useSavedCards();
  const saved = isSaved(card.id);
  const [hovered, setHovered] = useState(false);
  const showSaveBtn = hovered || saved;
  return (
    <Card
      padding="none"
      interactive
      onClick={() => onOpen?.(card.id)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 12 }}
    >
      <ContentTypeHeader card={card} />
      <div style={{ position: 'relative' }}>
        <FeedCardThumb card={card} hideBadges />
        {showSaveBtn && (
          <button
            type="button"
            aria-label={saved ? 'Saved — click to remove' : 'Save'}
            aria-pressed={saved}
            onClick={(e) => {
              e.stopPropagation();
              toggleSaved(card.id);
            }}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--dark-8)',
              background: 'var(--light-100)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: saved ? 'var(--brand)' : 'var(--dark-80)',
              padding: 0,
              transition: 'color 120ms ease, border-color 120ms ease',
            }}
          >
            {saved ? <StarFilled size={16} /> : <Star size={16} />}
          </button>
        )}
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {card.caption && (
          <Text
            variant="secondary"
            style={{
              color: 'var(--dark-90)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {card.caption}
          </Text>
        )}
        <PlatformStatsRow card={card} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <PerfSignalRow signals={card.signals} flat />
        </div>
      </div>
    </Card>
  );
}

// ── Platform-style engagement strip (used by ContentCard) ─────────────────

/**
 * Render the per-platform engagement strip. Each variant mimics the source
 * platform's stats row — IG heart-count-rate, LinkedIn thumb-count-comments,
 * Google "Sponsored · clicks · CTR", Meta "Sponsored · reach · engagement".
 *
 * Missing stats are gracefully omitted. Single row, font-size 12 (xs).
 */
function PlatformStatsRow({ card }: { card: FeedCard }) {
  const parts: ReactNode[] = [];

  if (card.type === 'organic-ig') {
    if (card.engagement) {
      parts.push(
        <Text key="like" variant="smallList" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--dark-90)' }}>
          {card.engagement}
        </Text>,
      );
    }
    if (card.secondaryStat) {
      parts.push(
        <Text key="rate" variant="secondary" style={{ color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
          {card.secondaryStat}
        </Text>,
      );
    }
  } else if (card.type === 'organic-li') {
    if (card.engagement) {
      parts.push(
        <span key="like" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: BRAND_COLORS.linkedin, lineHeight: 1 }}>👍</span>
          <Text variant="secondary" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--dark-80)' }}>
            {card.engagement}
          </Text>
        </span>,
      );
    }
    if (card.secondaryStat) {
      parts.push(
        <Text key="comments" variant="secondary" style={{ color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
          {card.secondaryStat}
        </Text>,
      );
    }
  } else if (card.type === 'ad-google') {
    if (card.engagement) {
      parts.push(
        <Text key="clicks" variant="secondary" style={{ color: 'var(--dark-80)', fontVariantNumeric: 'tabular-nums' }}>
          {card.engagement} clicks
        </Text>,
      );
    }
    if (card.secondaryStat) {
      parts.push(
        <Text key="ctr" variant="secondary" style={{ color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
          {card.secondaryStat} CTR
        </Text>,
      );
    }
  } else {
    // ad-meta
    if (card.engagement) {
      parts.push(
        <Text key="reach" variant="secondary" style={{ color: 'var(--dark-80)', fontVariantNumeric: 'tabular-nums' }}>
          {card.engagement} reach
        </Text>,
      );
    }
    if (card.secondaryStat) {
      parts.push(
        <Text key="eng" variant="secondary" style={{ color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
          {card.secondaryStat}
        </Text>,
      );
    }
  }

  if (parts.length === 0) return null;

  // Interleave parts with a faint bullet separator.
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
      }}
    >
      {parts.map((p, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span style={{ color: 'var(--dark-60)' }}>·</span>}
          {p}
        </span>
      ))}
    </div>
  );
}

// ── Misc shared bits ─────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text
      variant="metadata"
      style={{
        color: 'var(--dark-60)',
        fontWeight: 500,
      }}
    >
      {children}
    </Text>
  );
}
