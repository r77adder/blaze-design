import type { ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { Card } from '@/staging';

/** Centered reading column shared by all three analytics views. */
export function ViewScaffold({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        maxWidth: 1120,
        margin: '0 auto',
        padding: '8px 4px 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Heading level={2}>{title}</Heading>
        <Text variant="secondary" color="var(--dark-60)">
          {blurb}
        </Text>
      </div>
      {children}
    </div>
  );
}

/** Temporary "built next" marker so the route resolves and the skeleton is
 *  navigable. Replaced by the real composition as each view is built. */
export function ComingNext({ items }: { items: string[] }) {
  return (
    <Card padding="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Text variant="label" color="var(--dark-90)">
          Building next
        </Text>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item) => (
            <li key={item}>
              <Text variant="secondary" color="var(--dark-60)">
                {item}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/** Inline KPI strip used by the placeholders to prove the data model is wired
 *  end-to-end. Not the final StatTile — that lands with the Overview build. */
export function StatPreview({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {stats.map((s) => (
        <Card key={s.label} padding="md" style={{ minWidth: 160, flex: '1 1 160px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text variant="metadata" color="var(--dark-60)">
              {s.label}
            </Text>
            <Heading level={3}>{s.value}</Heading>
          </div>
        </Card>
      ))}
    </div>
  );
}
