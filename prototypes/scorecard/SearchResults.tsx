import { Text, Heading } from '@/components';
import { Card } from '@/staging';
import Google from '@/icons/20/Google';

// RankChip — visual spec mirrors the StatusPill used in
// prototypes/h2/onboarding (PR #22). 1px tinted border, md size: 14px text,
// 2px×8px padding, 6px radius, no leading dot. Four tones map to scorecard
// rank quality (good / warn / bad / neutral). The bad tone gets an inline
// ✕ icon, same as PR #22's "Not Ranked" pill.

type RankChipVariant = 'good' | 'warn' | 'bad' | 'neutral';

const RANK_CHIP_STYLES: Record<RankChipVariant, React.CSSProperties> = {
  good:    { background: 'rgba(4, 175, 0, 0.10)',    border: '1px solid rgba(4, 175, 0, 0.20)',    color: '#036b00' },
  warn:    { background: 'rgba(237, 182, 44, 0.12)', border: '1px solid rgba(237, 182, 44, 0.24)', color: '#7a5e0c' },
  bad:     { background: 'rgba(188, 1, 11, 0.08)',   border: '1px solid rgba(188, 1, 11, 0.20)',   color: 'var(--red-90)' },
  neutral: { background: 'var(--dark-2)',            border: '1px solid var(--dark-4)',            color: 'var(--dark-60)' },
};

function RankChip({ label, variant }: { label: string; variant: RankChipVariant }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontFamily: 'Sohne, sans-serif',
      fontWeight: 400,
      fontSize: 14,
      lineHeight: '18px',
      letterSpacing: 0,
      padding: '2px 8px',
      borderRadius: 6,
      whiteSpace: 'nowrap',
      maxWidth: '100%',
      flexShrink: 0,
      ...RANK_CHIP_STYLES[variant],
    }}>
      {label}
    </span>
  );
}

interface Row {
  query: string;
  topName: string;
  maps: { label: string; variant: RankChipVariant };
  organic: { label: string; variant: RankChipVariant };
  ads: { label: string; variant: RankChipVariant };
}

const ROWS: Row[] = [
  { query: 'painters Austin',            topName: 'Five Star Painting of South Austin', maps: { label: '#4',         variant: 'warn' }, organic: { label: 'Not Ranked', variant: 'bad' }, ads: { label: 'No ads',        variant: 'neutral' } },
  { query: 'house painters Austin TX',   topName: 'Paper Moon Painting',                maps: { label: 'Not Ranked', variant: 'bad'  }, organic: { label: 'Not Ranked', variant: 'bad' }, ads: { label: 'No ads',        variant: 'neutral' } },
  { query: 'interior painting Austin',   topName: 'WOW 1 DAY PAINTING Austin',          maps: { label: 'Not Ranked', variant: 'bad'  }, organic: { label: 'Not Ranked', variant: 'bad' }, ads: { label: 'No ads',        variant: 'neutral' } },
  { query: 'cabinet painting Austin',    topName: 'Austin Custom Painting',             maps: { label: '#7',         variant: 'warn' }, organic: { label: 'Not Ranked', variant: 'bad' }, ads: { label: 'No ads',        variant: 'neutral' } },
  { query: 'exterior painting Austin',   topName: 'Five Star Painting of South Austin', maps: { label: 'Not Ranked', variant: 'bad'  }, organic: { label: 'Not Ranked', variant: 'bad' }, ads: { label: 'No ads',        variant: 'neutral' } },
  { query: 'certapro austin (branded)',  topName: 'CertaPro Painters of Austin',        maps: { label: '#1',         variant: 'good' }, organic: { label: '#1',         variant: 'good' }, ads: { label: 'Competitor ad', variant: 'bad'     } },
  { query: 'commercial painters Austin', topName: 'Paper Moon Painting',                maps: { label: 'Not Ranked', variant: 'bad'  }, organic: { label: 'Not Ranked', variant: 'bad' }, ads: { label: 'No ads',        variant: 'neutral' } },
  { query: 'HOA painters Austin',        topName: 'College Pro Painters',               maps: { label: 'Not Ranked', variant: 'bad'  }, organic: { label: 'Not Ranked', variant: 'bad' }, ads: { label: 'No ads',        variant: 'neutral' } },
];

export function SearchResults() {
  return (
    <Card padding="lg" style={{ borderRadius: 14 }}>
      <Heading level={4} style={{ marginBottom: 4 }}>This is how you're showing up online</Heading>
      <Text variant="secondary" color="var(--dark-60)" style={{ marginBottom: 20, display: 'block' }}>
        Where you appear when customers in Austin search the queries that matter most.
      </Text>

      {/* column headers */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '4px 8px 12px',
      }}>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--dark-60)' }}>Search query</div>
        <div style={{ width: 110, textAlign: 'center', fontSize: 13, color: 'var(--dark-60)' }}>Map pack</div>
        <div style={{ width: 110, textAlign: 'center', fontSize: 13, color: 'var(--dark-60)' }}>Organic</div>
        <div style={{ width: 120, textAlign: 'center', fontSize: 13, color: 'var(--dark-60)' }}>Paid</div>
      </div>

      {ROWS.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: i === ROWS.length - 1 ? '14px 8px 0' : '14px 8px',
            borderTop: i === 0 ? '1px solid var(--dark-8)' : 'none',
            borderBottom: i < ROWS.length - 1 ? '1px solid var(--dark-8)' : 'none',
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <Google size={20} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, color: 'var(--dark-90)' }}>{row.query}</div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>
                🏆 #1 is {row.topName}
              </div>
            </div>
          </div>
          <div style={{ width: 110, display: 'flex', justifyContent: 'center' }}>
            <RankChip label={row.maps.label} variant={row.maps.variant} />
          </div>
          <div style={{ width: 110, display: 'flex', justifyContent: 'center' }}>
            <RankChip label={row.organic.label} variant={row.organic.variant} />
          </div>
          <div style={{ width: 120, display: 'flex', justifyContent: 'center' }}>
            <RankChip label={row.ads.label} variant={row.ads.variant} />
          </div>
        </div>
      ))}
    </Card>
  );
}
