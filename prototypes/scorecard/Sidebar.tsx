import { Heading, Text } from '@/components';
import { GaugeRing, useAnimatedScore } from './GaugeRing';
import { statusColor, statusLabel, statusTrack, type Status } from './tokens';

const CATEGORIES: { label: string; score: number; max: number; status: Status }[] = [
  { label: 'Presence & Awareness', score: 9,  max: 25, status: 'bad' },
  { label: 'Paid Ads',             score: 4,  max: 25, status: 'bad' },
  { label: 'Conversion',           score: 17, max: 25, status: 'warn' },
  { label: 'Reputation',           score: 17, max: 25, status: 'warn' },
];

const TOTAL_SCORE = 47;
const TOTAL_MAX = 100;
const TOTAL_STATUS: Status = 'bad';

function HeroScore() {
  // Spec from design: Söhne Leicht (weight 300), 52px, line-height 110%,
  // letter-spacing -2%, red. White disk behind the score reads cleanly on
  // the pink sidebar tint.
  const animated = useAnimatedScore(TOTAL_SCORE, 1100);
  return (
    <GaugeRing
      score={TOTAL_SCORE}
      max={TOTAL_MAX}
      color={statusColor(TOTAL_STATUS)}
      trackColor={statusTrack(TOTAL_STATUS)}
      diskColor="var(--light-100)"
      size={192}
      strokeWidth={10}
      animate
    >
      <span style={{
        fontFamily: "'Sohne', sans-serif",
        fontSize: 64,
        fontWeight: 300,
        color: statusColor(TOTAL_STATUS),
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {Math.round(animated)}
      </span>
      <span style={{ fontSize: 13, color: 'var(--dark-40)', marginTop: -2, lineHeight: 1 }}>
        {TOTAL_MAX}
      </span>
    </GaugeRing>
  );
}

function CategoryRing({ score, max, status }: { score: number; max: number; status: Status }) {
  // Open ring — no score inside, no disk. The status color carries the
  // signal; the score lives next to the label as "20/100".
  return (
    <GaugeRing
      score={score}
      max={max}
      color={statusColor(status)}
      trackColor={statusTrack(status)}
      size={44}
      strokeWidth={4}
      animate
    />
  );
}

export function Sidebar() {
  return (
    <aside style={{
      padding: '24px 24px 120px',
      position: 'sticky',
      top: 0,
      minHeight: '100vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {/* section: hero gauge + status label */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <HeroScore />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: 400, color: 'var(--dark-40)' }}>Online health</Text>
          <Heading level={3} style={{ margin: 0 }}>
            {statusLabel(TOTAL_STATUS)}
          </Heading>
        </div>
      </div>

      {/* section: category rows — no dividers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
        {CATEGORIES.map((cat) => (
          <div
            key={cat.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <CategoryRing score={cat.score} max={cat.max} status={cat.status} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--dark-90)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                }}
              >
                {cat.label}
              </Text>
              <Text
                color={statusColor(cat.status)}
                style={{ fontSize: 13, fontWeight: 500, display: 'block', marginTop: 2 }}
              >
                {statusLabel(cat.status)}
              </Text>
            </div>
            <Text variant="label" color="var(--dark-60)" style={{ flexShrink: 0 }}>
              {cat.score}/{cat.max}
            </Text>
          </div>
        ))}
      </div>

    </aside>
  );
}
