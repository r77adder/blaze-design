import { Button, Heading, Modal, Text, useModals, type StackModalProps } from '@/components';
import { Avatar } from '@/staging';
import {
  AD_INTEL,
  COMPETITORS,
  FEED_CARDS,
  type FeedCard,
} from './data';
import {
  ContentTypeHeader,
  FeedCardThumb,
  PerfSignalRow,
  channelLabel,
} from './components';
import { useSavedCards } from './SavedCardsContext';
import { RemixSlideover } from './RemixSlideover';
import { Instagram, Star, StarFilled } from '@/icons/20';

// Local constants for swatches not covered by tokens.
const STATUS_GREEN = '#059669';
const PURPLE_TINT_BG = '#F5F3FF';
const PURPLE_TINT_BORDER = '#DDD6FE';

// Reusable sentence-case section label (avoids uppercased SectionLabel from components.tsx).
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="metadata" style={{ color: 'var(--dark-60)', display: 'block' }}>
      {children}
    </Text>
  );
}

/**
 * Card detail modal — opens when a feed card is clicked. Shows:
 *   - The original creative (channel-appropriate mock at the top).
 *   - Competitor strip (avatar + name + channel + status).
 *   - Caption / copy.
 *   - Performance stats (4-up grid).
 *   - Perf signals.
 *   - For Google / Meta ad cards: hook pattern + insight + landing-page preview.
 *   - Primary action: Remix → opens RemixSlideover.
 *
 * Mirrors the source HTML's #content-modal (line 7381) and adIntel sections.
 */
export function CardDetailModal({ cardId, close }: StackModalProps & { cardId: string }) {
  const card = FEED_CARDS.find((c) => c.id === cardId);
  const { openModal } = useModals();
  const { isSaved, toggleSaved } = useSavedCards();

  if (!card) {
    return (
      <Modal.Root size="md" aria-labelledby="card-detail-error">
        <Modal.Header title="Not found" id="card-detail-error" onClose={close} />
        <Modal.Content>
          <p style={{ margin: 0 }}>Could not find a card with id {cardId}.</p>
        </Modal.Content>
      </Modal.Root>
    );
  }

  const competitor = COMPETITORS[card.competitor];
  const intel = AD_INTEL[card.id];
  const saved = isSaved(card.id);
  const stats = computeStats(card);

  return (
    <Modal.Root size="md" aria-labelledby="card-detail-title">
      <Modal.Header
        title={`${channelLabel(card.channel)} · ${competitor.name}`}
        id="card-detail-title"
        onClose={close}
      />
      <Modal.Content>
        {/* Mirror the ContentCard structure — header + thumb. */}
        <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--dark-8)' }}>
          <ContentTypeHeader card={card} />
          <FeedCardThumb card={card} hideBadges />
        </div>

        {/* Competitor strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
            padding: 12,
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-8)',
            borderRadius: 8,
          }}
        >
          <Avatar
            fallback={competitor.initials}
            size="md"
            style={{ background: competitor.color, color: 'var(--light-100)', fontSize: 12, fontWeight: 600 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text variant="smallList">{competitor.name}</Text>
            <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>{channelLabel(card.channel)} · Tracked competitor</Text>
          </div>
          <Text variant="metadata" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, color: STATUS_GREEN }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_GREEN }} />
            Live
          </Text>
        </div>

        {/* Caption */}
        {card.caption && (
          <>
            <SectionHeading>Caption / copy</SectionHeading>
            <Text variant="secondary" style={{ display: 'block', margin: '6px 0 16px', color: 'var(--dark-90)' }}>
              {card.caption}
            </Text>
          </>
        )}

        {/* Stats grid */}
        <SectionHeading>Performance</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '6px 0 16px' }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                padding: '10px 12px',
                border: '1px solid var(--dark-8)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Heading level={4} style={{ fontWeight: 500, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</Heading>
              <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Perf signals */}
        <SectionHeading>Signals</SectionHeading>
        <div style={{ margin: '6px 0 16px' }}>
          <PerfSignalRow signals={card.signals} />
        </div>

        {/* Ad intel — only on Google / Meta ad cards with a known playbook */}
        {intel && (
          <div style={{ marginTop: 16, padding: 16, background: PURPLE_TINT_BG, border: `1px solid ${PURPLE_TINT_BORDER}`, borderRadius: 10 }}>
            <SectionHeading>Hook pattern</SectionHeading>
            <Text variant="smallList" style={{ display: 'block', color: 'var(--purple)', margin: '4px 0 2px' }}>{intel.hookPattern}</Text>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)', fontStyle: 'italic', marginBottom: 8 }}>"{intel.hookLine}"</Text>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-80)' }}>{intel.hookInsight}</Text>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${PURPLE_TINT_BORDER}` }}>
              <SectionHeading>Landing page</SectionHeading>
              <div style={{ marginTop: 6, padding: 12, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 8 }}>
                <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)' }}>{intel.lp.eyebrow}</Text>
                <Text variant="largeList" style={{ display: 'block', color: 'var(--dark-90)', margin: '4px 0 6px' }}>{intel.lp.headline}</Text>
                <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 10 }}>{intel.lp.subhead}</Text>
                <Button variant="primary" size="xs" onPress={() => undefined}>
                  {intel.lp.cta}
                </Button>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  {intel.lp.sections.map((s) => (
                    <Text key={s} variant="metadata" style={{ padding: '2px 7px', borderRadius: 4, background: 'var(--dark-4)', color: 'var(--dark-60)' }}>{s}</Text>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="tertiary" onPress={close}>Cancel</Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="tertiary"
            frontIcon={saved ? StarFilled : Star}
            onPress={() => toggleSaved(card.id)}
          >
            {saved ? 'Saved' : 'Save'}
          </Modal.FooterButton>
          <Modal.FooterButton
            variant="primary"
            onPress={() => {
              close();
              openModal(RemixSlideover, { card });
            }}
          >
            Remix in Blaze
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function DetailThumb({ card }: { card: FeedCard }) {
  if (card.type === 'organic-ig') {
    return (
      <div style={{ height: 280, background: gradFor(card.grad), display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 12 }}><ChannelBadge channel={card.channel} /></div>
        <div style={{ position: 'absolute', top: 12, right: 100 }}><CompetitorBadge k={card.competitor} /></div>
        <Instagram size={64} color="rgba(255,255,255,0.85)" />
      </div>
    );
  }
  if (card.type === 'organic-li') {
    return (
      <div style={{ background: '#F3F2EF', padding: '44px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', minHeight: 280 }}>
        <div style={{ position: 'absolute', top: 12, left: 12 }}><ChannelBadge channel="linkedin" /></div>
        <div style={{ position: 'absolute', top: 12, right: 100 }}><CompetitorBadge k={card.competitor} /></div>
        <p style={{ fontSize: 16, color: 'var(--dark-90)', lineHeight: '21px', margin: 0 }}>{card.liBody}</p>
        <div style={{ fontSize: 12, color: '#0A66C2', fontWeight: 500 }}>{card.liTag}</div>
      </div>
    );
  }
  if (card.type === 'ad-google') {
    return (
      <div style={{ background: 'var(--light-100)', padding: '44px 24px 24px', position: 'relative', minHeight: 200 }}>
        <div style={{ position: 'absolute', top: 12, left: 12 }}><ChannelBadge channel="google" /></div>
        <div style={{ position: 'absolute', top: 12, right: 100 }}><CompetitorBadge k={card.competitor} /></div>
        <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#202124', border: '1px solid #202124', padding: '0 4px', borderRadius: 3 }}>Sponsored</span>
        <div style={{ fontSize: 14, color: '#5F6368', marginTop: 6 }}>{card.googleUrl}</div>
        <div style={{ fontSize: 20, color: '#1A0DAB', fontWeight: 500, lineHeight: '26px', margin: '4px 0 8px' }}>{card.googleHeadline}</div>
        <div style={{ fontSize: 14, color: 'var(--dark-80)', lineHeight: '20px' }}>{card.googleDesc}</div>
      </div>
    );
  }
  // ad-meta
  return (
    <div style={{ background: 'var(--light-100)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}><ChannelBadge channel="meta" /></div>
      <div style={{ position: 'absolute', top: 12, right: 100, zIndex: 1 }}><CompetitorBadge k={card.competitor} /></div>
      <div style={{ height: 240, background: gradFor(card.grad), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>{card.metaImage}</div>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0F2F5' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ fontSize: 14, color: 'var(--dark-90)' }}>{card.metaBrand}</strong>
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>{card.metaSub}</span>
        </div>
        <Button variant="secondary" size="xs" onPress={() => undefined}>{card.metaCta}</Button>
      </div>
    </div>
  );
}

function computeStats(card: FeedCard): { label: string; value: string }[] {
  if (card.type === 'organic-ig' || card.type === 'organic-li') {
    return [
      { label: 'Engagement', value: card.engagement ?? '—' },
      { label: card.type === 'organic-li' ? 'Comments' : 'Engagement rate', value: card.secondaryStat ?? '—' },
      { label: 'Posted', value: card.date ?? '—' },
      { label: 'Channel', value: channelLabel(card.channel) },
    ];
  }
  if (card.type === 'ad-google') {
    return [
      { label: 'Impressions', value: '2.4M' },
      { label: 'Avg CTR', value: '5.1%' },
      { label: 'Days running', value: '67d' },
      { label: 'Channel', value: 'Google Ads' },
    ];
  }
  // ad-meta
  return [
    { label: 'Impressions', value: '1.4M' },
    { label: 'Avg CTR', value: '3.2%' },
    { label: 'Days running', value: '32d' },
    { label: 'Channel', value: 'Meta Ads' },
  ];
}
