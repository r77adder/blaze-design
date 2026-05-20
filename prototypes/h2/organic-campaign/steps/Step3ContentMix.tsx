import { Heading, Text } from '@/components';
import { useFirstCampaign } from '../first-campaign-context';
import Edit1 from '@/icons/20/Edit1';
import ChevronDown from '@/icons/20/ChevronDown';
import Play3 from '@/icons/20/Play3';

interface ContentType {
  id: string;
  name: string;
  description: string;
  cost: number;
  imageUrl: string;
  withPlay?: boolean;
}

const TYPES: ContentType[] = [
  {
    id: 'still-images',
    name: 'Still Images',
    description: 'Single image post for feeds',
    cost: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80',
  },
  {
    id: 'carousels',
    name: 'Carousels',
    description: 'Multi-slide storytelling',
    cost: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80',
  },
  {
    id: 'feed-videos',
    name: 'Feed Videos',
    description: 'Polished video for feed',
    cost: 40,
    imageUrl:
      'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&q=80',
    withPlay: true,
  },
  {
    id: 'short-form',
    name: 'Short-form Video',
    description: 'Reels, TikToks, Shorts',
    cost: 40,
    imageUrl:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
    withPlay: true,
  },
  {
    id: 'stories',
    name: 'Stories',
    description: 'Ephemeral vertical content',
    cost: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1488741222121-fc9efa90f25f?w=400&q=80',
  },
  {
    id: 'blogs',
    name: 'Blogs',
    description: 'Long-form SEO articles',
    cost: 20,
    imageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80',
  },
  {
    id: 'emails',
    name: 'Emails',
    description: 'Newsletters and campaigns',
    cost: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=400&q=80',
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    description: 'Facebook and Instagram ads',
    cost: 36,
    imageUrl:
      'https://images.unsplash.com/photo-1492138645846-2bcabb05e2f7?w=400&q=80',
  },
];

/** Step 3 — Recommended content mix + credits sidebar. */
export function Step3ContentMix() {
  const { data } = useFirstCampaign();

  const totalCredits = TYPES.reduce(
    (sum, t) => sum + (data.quantities[t.id] ?? 0) * t.cost,
    0,
  );

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '24px auto 0' }}>
      <Heading level={2} style={{ marginBottom: 8, fontSize: 32 }}>
        Here&rsquo;s what we recommend for your first week
      </Heading>
      <Text variant="secondary">
        Based on your strategy and channels, this is a good starting mix for a
        business like yours. You can adjust the quantities or change it anytime
        after setup.
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr) 240px',
          gap: 16,
          marginTop: 28,
        }}
      >
        {TYPES.map((t) => (
          <ContentCard
            key={t.id}
            type={t}
            qty={data.quantities[t.id] ?? 0}
          />
        ))}

        {/* Credits sidebar */}
        <aside
          style={{
            gridRow: 'span 3',
            gridColumn: '4',
            padding: 20,
            borderRadius: 12,
            border: '1px solid var(--dark-8)',
            background: 'var(--light-100)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignSelf: 'start',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--dark-60)', letterSpacing: '0.26px' }}>
            This amount uses
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 500,
                color: 'var(--dark-90)',
                lineHeight: 1,
              }}
            >
              {totalCredits}
            </div>
            <div style={{ fontSize: 13, color: 'var(--dark-60)' }}>credits / week</div>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--dark-60)',
              lineHeight: 1.55,
              letterSpacing: '0.26px',
            }}
          >
            Credits are what Blaze spends to generate your content. Each type costs a different amount.
          </p>
          <button type="button" style={breakdownStyle}>
            <span>How costs break down</span>
            <ChevronDown size={14} />
          </button>
          <div
            style={{
              height: 1,
              background: 'var(--dark-8)',
              margin: '4px 0',
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--dark-60)',
              lineHeight: 1.55,
              letterSpacing: '0.26px',
            }}
          >
            Your trial includes <strong style={{ color: 'var(--dark-90)' }}>200 credits</strong> — enough to generate your first week.
          </p>
          <button type="button" style={adjustStyle}>
            <Edit1 size={14} />
            <span>Adjust quantities</span>
          </button>
        </aside>
      </div>
    </div>
  );
}

function ContentCard({ type, qty }: { type: ContentType; qty: number }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--dark-4)',
          marginBottom: 12,
        }}
      >
        <img
          src={type.imageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {type.withPlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--light-100)',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.55)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play3 size={16} />
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--dark-90)',
          marginBottom: 4,
        }}
      >
        {type.name}
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--dark-60)',
          lineHeight: 1.4,
          marginBottom: 8,
          letterSpacing: '0.26px',
        }}
      >
        {type.description}
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--dark-60)',
          marginBottom: 12,
          letterSpacing: '0.24px',
        }}
      >
        ✨ {type.cost} credits each
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto' }}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: 'var(--dark-90)',
            lineHeight: 1,
          }}
        >
          {qty}
        </div>
        <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>/ week</div>
      </div>
    </div>
  );
}

const breakdownStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: 'transparent',
  border: 'none',
  padding: 0,
  color: 'var(--dark-90)',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  alignSelf: 'flex-start',
};

const adjustStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'transparent',
  border: 'none',
  padding: 0,
  color: 'var(--dark-60)',
  fontFamily: 'inherit',
  fontSize: 13,
  cursor: 'pointer',
  alignSelf: 'flex-start',
};
