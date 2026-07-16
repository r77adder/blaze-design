import { useState } from 'react';
import { Heading, Text, Button, useModals } from '@/components';
import { Card, StatusPill } from '@/staging';
import Check2 from '@/icons/20/Check2';
import { HOME_CONNECT_INTEGRATIONS, type ConnectIntegration } from './growth-review/data';
import { ConnectModal, CONNECT_ICONS } from './growth-review/ConnectModal';
import { ICON_BOX } from './HomeColdShared';

/**
 * The client-portal "Connect your accounts" section. Always expanded (no
 * accordion), and every Connect opens the same instruction modal used on the
 * last step of the Growth Engine Review.
 */
export function ConnectAccountsSection({ defaultConnectedIds }: { defaultConnectedIds: string[] }) {
  const { openModal } = useModals();
  const [connected, setConnected] = useState<Set<string>>(() => new Set(defaultConnectedIds));

  const markConnected = (id: string) =>
    setConnected((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Heading level={3} style={{ margin: 0, flex: 1 }}>Connect your accounts</Heading>
        <Text variant="metadata" color="var(--dark-60)">{connected.size} of {HOME_CONNECT_INTEGRATIONS.length} connected</Text>
      </div>
      <Card padding="none">
        {HOME_CONNECT_INTEGRATIONS.map((integration, i) => (
          <ConnectRow
            key={integration.id}
            integration={integration}
            connected={connected.has(integration.id)}
            onConnect={() => openModal(ConnectModal, { integration, onConnected: () => markConnected(integration.id) })}
            isFirst={i === 0}
          />
        ))}
      </Card>
    </section>
  );
}

function ConnectRow({ integration, connected, onConnect, isFirst }: {
  integration: ConnectIntegration;
  connected: boolean;
  onConnect: () => void;
  isFirst: boolean;
}) {
  const Icon = CONNECT_ICONS[integration.icon];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderTop: isFirst ? 'none' : '1px solid var(--dark-8)' }}>
      <span aria-hidden style={ICON_BOX}><Icon size={20} color="var(--dark-80)" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Heading level={5} style={{ margin: 0 }}>{integration.name}</Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 3, lineHeight: 1.45 }}>{integration.purpose}</Text>
      </div>
      {connected ? (
        <StatusPill tone="success"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check2 size={13} color="var(--status-approved)" />Connected</span></StatusPill>
      ) : (
        <Button variant="secondary" size="sm" onPress={onConnect}>Connect</Button>
      )}
    </div>
  );
}
