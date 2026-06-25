import { Card } from '@/staging';
import { Text } from '@/components';
import { fmtDelta } from '../mockData';
import { FONT, tracking } from '../format';

/**
 * A KPI tile. Doubles as the hero-chart metric selector: when `onSelect` is
 * set the tile is clickable, and the selected tile shows an accent ring + the
 * value in the metric's color (tying it to the chart line below). Delta is a
 * fraction vs. the previous period — up reads green, down reads red.
 */
export function StatTile({
  label,
  value,
  delta,
  selected = false,
  accent = 'var(--dark-90)',
  onSelect,
}: {
  label: string;
  value: string;
  delta: number;
  selected?: boolean;
  accent?: string;
  onSelect?: () => void;
}) {
  const up = delta >= 0;
  const deltaColor = up ? 'var(--status-approved)' : 'var(--red-70)';

  return (
    <Card
      padding="md"
      interactive={!!onSelect}
      onClick={onSelect}
      style={{
        flex: '1 1 0',
        minWidth: 168,
        boxShadow: selected ? `0 0 0 2px ${accent}` : undefined,
        borderColor: selected ? 'transparent' : undefined,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text variant="metadata" color="var(--dark-60)">
          {label}
        </Text>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 30,
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '0.2px',
            color: selected ? accent : 'var(--dark-90)',
          }}
        >
          {value}
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: FONT,
            fontSize: 12,
            letterSpacing: tracking(12),
            color: deltaColor,
            fontWeight: 500,
          }}
        >
          <span aria-hidden style={{ fontSize: 9 }}>
            {up ? '▲' : '▼'}
          </span>
          {fmtDelta(delta)}
          <span style={{ color: 'var(--dark-40)', fontWeight: 400 }}>vs. previous</span>
        </div>
      </div>
    </Card>
  );
}
