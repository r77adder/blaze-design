import { type ComponentType, type ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { Card } from '@/staging';

type Glyph = ComponentType<{ size?: number; color?: string }>;

/**
 * Shared "cold" explanatory state for client pages that have nothing to show
 * until the account goes live. Laid out like a normal page (left-aligned, same
 * 960 width as the rest of the portal): a muted icon, an H2 headline, a
 * plain-English description, and (the only boxed element) a Card listing what
 * will appear here once live. An optional `children` slot can add a faded
 * page-specific preview.
 *
 * Composed only from Blaze components, deliberately neutral (no pill, no tint).
 * Reused across Approvals / Calendar / Insights / Leads.
 */
export function ColdState({
  icon: Icon,
  title,
  description,
  points,
  children,
}: {
  icon: Glyph;
  title: string;
  description: string;
  points?: string[];
  children?: ReactNode;
}) {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 4px 60px' }}>
      <Icon size={26} color="var(--dark-40)" />
      <Heading level={2} style={{ margin: '12px 0 8px' }}>{title}</Heading>
      <Text variant="primary" style={{ display: 'block', color: 'var(--dark-60)', lineHeight: 1.6, maxWidth: 600 }}>
        {description}
      </Text>
      {points && points.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Card padding="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {points.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span aria-hidden style={{ marginTop: 8, width: 5, height: 5, borderRadius: 99, background: 'var(--dark-15)', flexShrink: 0 }} />
                  <Text variant="secondary" style={{ color: 'var(--dark-80)', lineHeight: 1.5 }}>{p}</Text>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      {children && <div style={{ marginTop: 24 }}>{children}</div>}
    </div>
  );
}
