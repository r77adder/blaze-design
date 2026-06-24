import type { ReactNode } from 'react';
import { Heading, Text } from '@/components';

/**
 * Placeholder page — used while the corresponding Ivan source HTML is being
 * ported. Renders a friendly "coming soon" with the page name and a link
 * back to home so navigation isn't a dead end.
 */
export function Placeholder({ name, sourceFile }: { name: string; sourceFile?: string }): ReactNode {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px' }}>
      <Heading level={2} style={{ marginBottom: 12 }}>{name}</Heading>
      <Text style={{ display: 'block', color: 'var(--dark-60)' }}>
        Coming soon. {sourceFile ? `Port from Blaze H2 Features/${sourceFile}.html.` : null}
      </Text>
    </div>
  );
}
