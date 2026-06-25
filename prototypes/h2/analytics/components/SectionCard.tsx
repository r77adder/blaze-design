import type { ReactNode } from 'react';
import { Card } from '@/staging';
import { ButtonLink, Heading } from '@/components';

/** A titled section: the headline (and optional action) sit ABOVE the card,
 *  outside it; the card below holds just the content + optional footer.
 *  Composes the staging Card. */
export function SectionCard({
  title,
  headerAction,
  footer,
  bodyPad = true,
  children,
}: {
  title: string;
  /** Deprecated — subheads were removed; kept optional so callers still typecheck. */
  subtitle?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  bodyPad?: boolean;
  children: ReactNode;
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0 2px' }}>
        <Heading level={3}>{title}</Heading>
        {headerAction}
      </div>
      <Card padding="none" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ padding: bodyPad ? '0 18px 14px' : 0 }}>{children}</div>
        {footer && <footer style={{ padding: '12px 18px', borderTop: '1px solid var(--dark-8)' }}>{footer}</footer>}
      </Card>
    </section>
  );
}

/** "View all" style link — a small tertiary button that routes via react-router. */
export function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <ButtonLink to={to} variant="tertiary" size="sm">
      {children}
    </ButtonLink>
  );
}
