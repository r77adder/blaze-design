import { Text, Heading } from '@/components';
import { Card } from '@/staging';
import AlertTriangle from '@/icons/20/AlertTriangle';

const COMPETITORS = [
  { rank: 1, name: 'Five Star Painting of South Austin', place: '1st' },
  { rank: 2, name: 'Paper Moon Painting',                place: '2nd' },
  { rank: 3, name: 'WOW 1 DAY PAINTING Austin',          place: '3rd' },
  { rank: 4, name: 'College Pro Painters',               place: '4th' },
  { rank: 7, name: 'CertaPro Painters of Austin',        place: 'You', isYou: true },
];

function ordinalColor(rank: number): string {
  if (rank <= 3) return 'var(--status-approved)';
  if (rank <= 5) return 'var(--status-review)';
  return 'var(--red-70)';
}

interface CompetitorRowProps {
  rank: number;
  name: string;
  place: string;
  isYou?: boolean;
}

function CompetitorRow({ rank, name, place, isYou }: CompetitorRowProps) {
  // YOU row: negative horizontal margin extends the tinted pill past the
  // natural row edges (into the card's padding), while a matching padding
  // pushes the items back to their normal column positions. End result:
  // BG breathes around the row, columns stay aligned across all rows.
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: isYou ? '9px 12px' : '9px 0',
      margin: isYou ? '0 -12px' : 0,
      borderBottom: '1px solid var(--dark-8)',
      background: isYou ? 'rgba(188, 1, 11, 0.05)' : 'transparent',
      borderRadius: isYou ? 6 : 0,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: isYou ? 'rgba(188, 1, 11, 0.12)' : 'var(--dark-4)',
        color: isYou ? 'var(--red-70)' : 'var(--dark-60)',
        fontWeight: 700, fontSize: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {rank}
      </div>
      <Text
        variant={isYou ? 'smallList' : 'secondary'}
        color={isYou ? 'var(--red-70)' : undefined}
        style={{ flex: 1 }}
      >
        {name}
      </Text>
      <Text
        variant="metadata"
        color={isYou ? 'var(--red-70)' : ordinalColor(rank)}
        style={{ fontWeight: 700 }}
      >
        {place}
      </Text>
    </div>
  );
}

export function HookRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

      {/* hook card */}
      <Card padding="lg" style={{ borderRadius: 14 }}>
        <Heading level={4} style={{ marginBottom: 14 }}>
          You're leaving{' '}
          <span style={{ color: 'var(--red-70)' }}>~$3,200/month</span>
          {' '}of growth on the table due to 23 fixable issues.
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'A competitor is bidding on "certapro austin" — they\'re stealing customers searching your name.',
            'You haven\'t posted on Instagram in 41 days. Homeowners in Round Rock and Cedar Park are choosing whoever shows up.',
            'You reply to fewer than 1 in 5 reviews. Owner replies lift conversion ~11%.',
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: 'var(--red-70)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', marginTop: 2 }}>
                <AlertTriangle size={18} />
              </span>
              <Text variant="secondary" color="var(--dark-60)">{text}</Text>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 14,
          borderTop: '1px dashed var(--dark-8)', paddingTop: 12,
        }}>
          <Text variant="label" color="var(--dark-40)">
            Opportunity math: $1,100/mo branded search loss + $1,400/mo untapped local SEO + $700/mo conversion lift on existing traffic.
          </Text>
        </div>
      </Card>

      {/* competitors card */}
      <Card padding="lg" style={{ borderRadius: 14 }}>
        <Heading level={4} style={{ marginBottom: 14 }}>
          You're ranking below 6 competitors in your service area
        </Heading>
        {COMPETITORS.map(c => (
          <CompetitorRow key={c.rank} {...c} />
        ))}
      </Card>
    </div>
  );
}
