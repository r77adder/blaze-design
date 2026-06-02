import { useMemo, useState } from 'react';
import { Button, Heading, Text, useModals } from '@/components';
import { Avatar, Callout, Card, Pill, StatusPill, Toggle, useToast } from '@/staging';
import { AlertTriangle, Plus, Star, StarFilled } from '@/icons/20';
import { H2Layout } from '../../H2Layout';
import { COMPETITORS, FEED_CARDS, GOOGLE_AD_CARDS, type GoogleAdCard } from '../data';
import { PerfSignalRow } from '../components';
import { useSavedCards } from '../SavedCardsContext';
import { CardDetailModal } from '../CardDetailModal';

/**
 * /competitor-tracking/google-ads — Google Ads page.
 *
 * Sections:
 *   1. Setup banner — "Continue setting up your first campaign" (Resume button).
 *   2. Own campaigns table.
 *   3. Competitor intel: 3 trending Google ad cards with SERP-style mock.
 *
 * Source HTML: lines 6370–6515.
 */
export function GoogleAdsPage() {
  const { showToast } = useToast();
  const [campaignOn, setCampaignOn] = useState(false);

  return (
    <H2Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 28, maxWidth: 1280 }}>
        <Heading level={2}>Google Ads</Heading>

        {/* Setup banner */}
        <Callout
          tone="warning"
          icon={AlertTriangle}
          title="Continue setting up your first campaign"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span>You're on step 3 — your progress has been saved.</span>
            <Button
              size="sm"
              variant="primary"
              onPress={() => showToast({ message: 'Resuming campaign setup…', variant: 'success' })}
            >
              Resume
            </Button>
          </div>
        </Callout>

        {/* Own campaigns table */}
        <Card padding="none" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={tableHeadStyle}>
                <th style={thStyle}>Campaign name</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Spend</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Clicks</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Conversions</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>CPA</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>ROAS</th>
                <th style={thStyle}>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--dark-4)' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Toggle
                      checked={campaignOn}
                      onChange={setCampaignOn}
                      aria-label="Toggle Interior Repaint — Austin"
                    />
                    <div>
                      <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>Interior Repaint — Austin</Text>
                      <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>Search</Text>
                    </div>
                  </div>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>$0</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>0</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div>0</div>
                  <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>0% rate</Text>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>$0</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>0.0x</td>
                <td style={tdStyle}><StatusPill tone="neutral">Draft</StatusPill></td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--dark-40)' }}>⋯</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Button variant="secondary" frontIcon={Plus} onPress={() => showToast({ message: 'Opening campaign builder…', variant: 'success' })}>
          Create new campaign
        </Button>

        {/* Competitor section */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginTop: 12 }}>
          <div>
            <Heading level={3} style={{ marginBottom: 4 }}>Trending Google Ads from your competitors</Heading>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', maxWidth: 640 }}>
              The hooks and landing pages your top competitors are running right now. Click any to see the full playbook — copy it, or launch your own version.
            </Text>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--dark-60)' }}>
            <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>Sort:</Text>
            <select
              onChange={(e) => showToast({ message: `Sorted by ${e.target.value}`, variant: 'success' })}
              style={sortSelectStyle}
            >
              <option>Highest CTR</option>
              <option>Most impressions</option>
              <option>Highest spend</option>
              <option>Newest</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {GOOGLE_AD_CARDS.map((c) => (
            <GoogleAdTile key={c.id} card={c} />
          ))}
        </div>
      </div>
    </H2Layout>
  );
}

function GoogleAdTile({ card }: { card: GoogleAdCard }) {
  const competitor = COMPETITORS[card.competitor];
  const { openModal } = useModals();
  const { isSaved, toggleSaved } = useSavedCards();
  const saved = isSaved(card.id);

  // Match to a FeedCard for the detail modal (the source HTML reuses cfc-2/6/12).
  const matchedFeedCard = useMemo(
    () => FEED_CARDS.find((f) => f.type === 'ad-google' && f.competitor === card.competitor),
    [card],
  );

  return (
    <Card
      padding="none"
      interactive
      onClick={() => matchedFeedCard && openModal(CardDetailModal, { cardId: matchedFeedCard.id })}
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* SERP-style mock — intentionally retains Google's signature blue-title /
          green-url / gray-desc palette via local constants below. */}
      <div style={{ padding: 14, background: 'var(--light-100)' }}>
        <Pill size="xs" style={{ marginBottom: 6, color: SERP_INK, borderColor: SERP_INK, background: 'var(--light-100)' }}>
          Sponsored
        </Pill>
        <div style={{ fontSize: 12, color: SERP_URL, marginBottom: 4 }}>{card.url}</div>
        <div style={{ fontSize: 16, color: SERP_LINK, fontWeight: 500, lineHeight: '21px', marginBottom: 6 }}>{card.headline}</div>
        <div style={{ fontSize: 12, color: 'var(--dark-80)', lineHeight: '17px', marginBottom: 10 }}>{card.desc}</div>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: SERP_LINK }}>
          {card.sitelinks.map((s) => (
            <a key={s} style={{ textDecoration: 'underline' }}>{s}</a>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--dark-4)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Text variant="metadata" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--dark-60)' }}>
          <Avatar fallback={competitor.initials} size="sm" style={{ background: competitor.color, color: 'var(--light-100)', fontSize: 10, fontWeight: 700, width: 22, height: 22 }} />
          <strong style={{ color: 'var(--dark-90)' }}>{competitor.name}</strong> · {card.meta}
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
            onPress={() => matchedFeedCard && openModal(CardDetailModal, { cardId: matchedFeedCard.id })}
            style={{ flex: 1 }}
          >
            Launch campaign with this creative
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Google SERP-native palette — kept verbatim to preserve mock fidelity. */
const SERP_INK = '#202124';
const SERP_URL = '#5F6368';
const SERP_LINK = '#1A0DAB';

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

const sortSelectStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid var(--dark-15)',
  background: 'var(--light-100)',
  color: 'var(--dark-80)',
};

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
