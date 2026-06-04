import { useMemo, useState } from 'react';
import { Button, Heading, Text, useModals } from '@/components';
import { Avatar, Card, StatusPill, Toggle, useToast } from '@/staging';
import { Plus, Star, StarFilled } from '@/icons/20';
import { H2Layout } from '../../H2Layout';
import { COMPETITORS, META_AD_CARDS, type MetaAdCard } from '../data';
import { PerfSignalRow, gradFor } from '../components';
import { useSavedCards } from '../SavedCardsContext';
import { CardDetailModal } from '../CardDetailModal';
import { FEED_CARDS } from '../data';

/**
 * /competitor-tracking/meta-ads — Meta Ads page.
 *
 * Sections:
 *   1. Top action row (Create New / Settings — toast-only).
 *   2. Challenger testing banner with a switch.
 *   3. Own brand campaigns table (3 Draft rows).
 *   4. Competitor intel section: 6 trending Meta ads with the Facebook-style
 *      mock layout, "Launch campaign with this creative" CTA, and save toggle.
 *
 * Source HTML: lines 6062–6367.
 */
export function MetaAdsPage() {
  const { showToast } = useToast();
  const [challengerOn, setChallengerOn] = useState(false);
  const [campaignPaused, setCampaignPaused] = useState<Record<number, boolean>>({});

  return (
    <H2Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 28, maxWidth: 1280 }}>
        <div>
          <Heading level={2} style={{ marginBottom: 4 }}>Meta Ads</Heading>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            Manage your campaigns. Below, see trending Meta ads from your competitors and launch any creative — remixed for your brand.
          </Text>
        </div>

        {/* Top action row */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="secondary"
            size="sm"
            frontIcon={Plus}
            onPress={() => showToast({ message: 'Opening Meta campaign builder…', variant: 'success' })}
          >
            Create new
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => showToast({ message: 'Opening Meta Ads settings…', variant: 'success' })}
          >
            Settings
          </Button>
        </div>

        {/* Challenger banner */}
        <Card padding="md" style={{ display: 'flex', alignItems: 'center', gap: 16, background: challengerBannerBg, borderColor: challengerBannerBorder }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text variant="largeList" style={{ color: 'var(--dark-90)' }}>Enable automatic challenger testing</Text>
              <span style={challengerTagStyle('champion')}>Champion</span>
              <span style={challengerTagStyle('alt')}>Challenger</span>
            </div>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              Blaze automatically generates challenger ads using credits and up to 10% of your weekly budget. Underperformers pause after 72 hours. Top performers are promoted automatically.
            </Text>
          </div>
          <Toggle
            checked={challengerOn}
            onChange={(next) => {
              setChallengerOn(next);
              showToast({ message: next ? 'Automatic challenger testing enabled' : 'Challenger testing paused', variant: 'success' });
            }}
            aria-label="Enable automatic challenger testing"
          />
        </Card>

        {/* Own campaigns */}
        <Card padding="none" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={tableHeadStyle}>
                <th style={{ ...thStyle, width: 64 }}>On / off</th>
                <th style={thStyle}>Campaign name</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Budget</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount spent</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Results</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Cost per result</th>
                <th style={thStyle}>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'CertaPro Austin — Interior Repaint — 1778876374' },
                { name: 'CertaPro Austin — HOA Exterior — 1778876370' },
                { name: 'CertaPro Austin — Cabinet Refinish — 1778552792' },
              ].map((row, i) => {
                const on = !campaignPaused[i];
                return (
                  <tr key={row.name} style={{ borderBottom: '1px solid var(--dark-4)' }}>
                    <td style={tdStyle}>
                      <Toggle
                        checked={on}
                        onChange={() => setCampaignPaused((p) => ({ ...p, [i]: !p[i] }))}
                        aria-label={`Toggle ${row.name}`}
                      />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 22, height: 22, background: 'linear-gradient(135deg,#0064E0,#0085FF)', color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, borderRadius: 4 }}>M</span>
                        <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>{row.name}</Text>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>$10</Text>
                      <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>daily</Text>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>$--.--</Text>
                      <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>total</Text>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--dark-60)' }}>n/a</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--dark-60)' }}>$--.--</td>
                    <td style={tdStyle}>
                      <StatusPill tone="neutral">Draft</StatusPill>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--dark-40)' }}>⋯</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Button variant="secondary" frontIcon={Plus} onPress={() => showToast({ message: 'Opening Meta campaign builder…', variant: 'success' })}>
          Create new campaign
        </Button>

        {/* Competitor section */}
        <div style={{ marginTop: 12 }}>
          <Heading level={3} style={{ marginBottom: 4 }}>Trending Meta Ads from your competitors</Heading>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            The creatives, hooks, and landing pages your top competitors are running on Facebook & Instagram. Click any to see the full playbook — copy it, or launch your own version.
          </Text>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {META_AD_CARDS.map((c) => (
            <MetaAdTile key={c.id} card={c} />
          ))}
        </div>
      </div>
    </H2Layout>
  );
}

function MetaAdTile({ card }: { card: MetaAdCard }) {
  const competitor = COMPETITORS[card.competitor];
  const { openModal } = useModals();
  const { isSaved, toggleSaved } = useSavedCards();
  const saved = isSaved(card.id);

  // Map the MetaAdCard to a FeedCard-compatible id used by AD_INTEL when present.
  const matchedFeedCard = useMemo(
    () => FEED_CARDS.find((f) => f.type === 'ad-meta' && f.metaImage === card.image && f.competitor === card.competitor),
    [card],
  );

  return (
    <Card
      padding="none"
      interactive
      onClick={() => matchedFeedCard && openModal(CardDetailModal, { cardId: matchedFeedCard.id })}
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Facebook-style mock — intentionally retains FB-native colors (E4E6EB CTA button)
          to preserve the recognizable platform aesthetic of the ad preview. */}
      <div style={{ padding: 12, background: 'var(--light-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Avatar fallback={competitor.initials} size="sm" style={{ background: competitor.color, color: 'var(--light-100)', fontSize: 10, fontWeight: 700 }} />
          <div>
            <strong style={{ fontSize: 13 }}>{competitor.name}</strong>
            <div style={{ fontSize: 11, color: 'var(--dark-60)' }}>Sponsored · 🌐</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--dark-90)', lineHeight: '18px', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {card.body}
        </div>
        <div style={{ height: 160, background: gradFor(card.grad), display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: 40 }}>
          {card.image}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0 4px', borderTop: '1px solid var(--dark-4)', marginTop: 10 }}>
          <div>
            <strong style={{ fontSize: 12, color: 'var(--dark-90)' }}>{card.brand}</strong>
            <div style={{ fontSize: 11, color: 'var(--dark-60)' }}>{card.sub}</div>
          </div>
          {/* Keep raw button: this is the FB-style CTA inside the mock, not a real action. */}
          <button type="button" style={{ background: FB_CTA_BG, border: 'none', color: 'var(--dark-90)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{card.cta}</button>
        </div>
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--dark-4)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Text variant="metadata" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--dark-60)' }}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: competitor.color, color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>{competitor.initials}</span>
          <strong style={{ color: 'var(--dark-90)' }}>{competitor.name}</strong> · {card.running}
        </Text>
        <PerfSignalRow signals={card.signals} flat />
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            title={saved ? 'Saved' : 'Save for later'}
            onClick={(e) => {
              e.stopPropagation();
              toggleSaved(card.id);
            }}
            style={saveBtnStyle(saved)}
          >
            {saved ? <StarFilled size={16} /> : <Star size={16} />}
          </button>
          <Button
            size="sm"
            variant="primary"
            onPress={() => matchedFeedCard && (
              // Open the detail modal — Remix CTA inside drives the slide-over.
              openModal(CardDetailModal, { cardId: matchedFeedCard.id })
            )}
            style={{ flex: 1 }}
          >
            Launch campaign with this creative
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Local tonal constants for surfaces that don't map cleanly to StatusPill. */
const challengerBannerBg = '#F5F3FF';
const challengerBannerBorder = '#DDD6FE';
/** Facebook-native light-grey CTA button — kept verbatim to preserve mock fidelity. */
const FB_CTA_BG = '#E4E6EB';

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontWeight: 600,
  textAlign: 'left',
  fontSize: 12,
  color: 'var(--dark-60)',
};
const tableHeadStyle: React.CSSProperties = {
  background: 'var(--dark-2)',
  borderBottom: '1px solid var(--dark-8)',
};
const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
};

function challengerTagStyle(kind: 'champion' | 'alt'): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 4,
    background: kind === 'champion' ? 'rgba(124, 92, 252, 0.12)' : 'var(--dark-4)',
    color: kind === 'champion' ? 'var(--purple)' : 'var(--dark-80)',
    fontWeight: 600,
  };
}

function saveBtnStyle(saved: boolean): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${saved ? 'var(--purple)' : 'var(--dark-8)'}`,
    background: saved ? 'rgba(124, 92, 252, 0.08)' : 'var(--light-100)',
    borderRadius: 6,
    cursor: 'pointer',
    color: saved ? 'var(--purple)' : 'var(--dark-60)',
  };
}
