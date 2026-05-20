import type { ComponentType, ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { useToast } from '@/staging';
import Calendar1 from '@/icons/20/Calendar1';
import Microphone from '@/icons/20/Microphone';
import Mail from '@/icons/20/Mail';
import Lightning from '@/icons/20/Lightning';
import Check2 from '@/icons/20/Check2';

/**
 * Step 2 — "Connect your tools."
 *
 * Vertical list of integration cards. Each one is mock-connected (instant —
 * no auth flow). The Finish button is gated on ≥ 2 connected integrations,
 * matching the spec. On finish, the parent (`AiReceptionistSetupModal`) flips
 * `/h2/sdr` dev state to `steady`, fires a success toast, and closes.
 *
 * Icon substitutions vs spec:
 *   - Twilio: spec said Phone or Smartphone. Neither exists in `@/icons/20`;
 *     closest is `Microphone` (mic glyph reads as voice/call). Using that.
 *   - HubSpot: spec already noted no HubSpot icon — `Lightning` as the
 *     "automation" stand-in.
 *   - Gmail: spec said verify Mail. `Mail` exists; used as-is.
 */

export type IntegrationId = 'calendly' | 'twilio' | 'gmail' | 'hubspot';

interface Integration {
  id: IntegrationId;
  name: string;
  description: string;
  /** Used to render the 40x40 tinted brand square. */
  brandHex: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  /** Shown after connection (e.g. Twilio's assigned number). */
  connectedDetail?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'calendly',
    name: 'Calendly',
    description: "We'll let Riley book meetings directly into your calendar.",
    brandHex: '#f78c2b',
    icon: Calendar1,
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Provision a phone number so Riley can take calls and SMS.',
    brandHex: '#f22f46',
    icon: Microphone,
    connectedDetail: '+1 (415) 555-0142',
  },
  {
    id: 'gmail',
    name: 'Email (Gmail)',
    description: 'Let Riley triage and reply to inbound email.',
    brandHex: '#ea4335',
    icon: Mail,
  },
  {
    id: 'hubspot',
    name: 'CRM (HubSpot)',
    description: 'Sync qualified leads back into your CRM.',
    brandHex: '#ff7a59',
    icon: Lightning,
  },
];

const CONNECT_TOASTS: Record<IntegrationId, string> = {
  calendly: 'Calendly connected · Riley can now book meetings',
  twilio: 'Twilio connected · Number +1 (415) 555-0142 assigned',
  gmail: 'Gmail connected · Riley can triage inbound email',
  hubspot: 'HubSpot connected · Qualified leads will sync to your CRM',
};

const SUCCESS_GREEN = '#04af00';
const MIN_CONNECTIONS = 2;

interface Step2ToolsProps {
  connected: Set<IntegrationId>;
  onConnectedChange: (next: Set<IntegrationId>) => void;
  onBack: () => void;
  onFinish: () => void;
}

export function Step2Tools({ connected, onConnectedChange, onBack, onFinish }: Step2ToolsProps) {
  const { showToast } = useToast();

  const connect = (id: IntegrationId) => {
    if (connected.has(id)) return;
    const next = new Set(connected);
    next.add(id);
    onConnectedChange(next);
    showToast({ message: CONNECT_TOASTS[id] });
  };

  const disconnect = (id: IntegrationId) => {
    const next = new Set(connected);
    next.delete(id);
    onConnectedChange(next);
  };

  const finishDisabled = connected.size < MIN_CONNECTIONS;

  return (
    <>
      <Header />
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px 32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            isConnected={connected.has(integration.id)}
            onConnect={() => connect(integration.id)}
            onDisconnect={() => disconnect(integration.id)}
          />
        ))}
      </div>

      <Footer>
        <Button variant="ghost" size="md" onPress={onBack}>
          Back
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text variant="secondary" style={{ fontSize: 12 }}>
            {connected.size}/{MIN_CONNECTIONS} required connected
          </Text>
          <Button
            variant="primary"
            size="md"
            isDisabled={finishDisabled}
            onPress={() => {
              showToast({ message: 'Riley is live — taking inbound now' });
              onFinish();
            }}
          >
            Finish setup
          </Button>
        </div>
      </Footer>
    </>
  );
}

// ─── Modal-local primitives ──────────────────────────────────────────

function Header() {
  return (
    <div
      style={{
        padding: '24px 32px 20px',
        borderBottom: '1px solid var(--dark-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <Heading level={3} id="ai-receptionist-setup-title" style={{ margin: 0 }}>
        Connect your tools
      </Heading>
      <Text variant="secondary" style={{ lineHeight: 1.5 }}>
        Plug Riley into the apps that actually book meetings and answer calls. You can change these
        later.
      </Text>
    </div>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

interface IntegrationCardProps {
  integration: Integration;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function IntegrationCard({ integration, isConnected, onConnect, onDisconnect }: IntegrationCardProps) {
  const Icon = integration.icon;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        background: 'var(--light-100)',
      }}
    >
      <BrandSquare brandHex={integration.brandHex}>
        <Icon size={20} color={integration.brandHex} />
      </BrandSquare>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <Heading level={4} style={{ margin: 0, fontSize: 14, color: 'var(--dark-90)' }}>
          {integration.name}
        </Heading>
        <Text variant="secondary" style={{ fontSize: 13, lineHeight: 1.45 }}>
          {integration.description}
        </Text>
        {isConnected && integration.connectedDetail && (
          <div style={{ marginTop: 6 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 6,
                background: 'var(--dark-4)',
                color: 'var(--dark-60)',
                fontSize: 12,
                fontFamily: "'Sohne', sans-serif",
              }}
            >
              {integration.connectedDetail}
            </span>
          </div>
        )}
      </div>

      {isConnected ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px 4px 8px',
              borderRadius: 999,
              background: 'rgba(4, 175, 0, 0.12)',
              color: SUCCESS_GREEN,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "'Sohne', sans-serif",
            }}
          >
            <Check2 size={14} color={SUCCESS_GREEN} />
            Connected
          </span>
          <button
            type="button"
            onClick={onDisconnect}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--dark-60)',
              fontSize: 12,
              fontFamily: "'Sohne', sans-serif",
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onPress={onConnect}>
          Connect
        </Button>
      )}
    </div>
  );
}

function BrandSquare({ brandHex, children }: { brandHex: string; children: ReactNode }) {
  // 40x40 tinted square — brand color at 12% alpha as background, the icon
  // itself uses the full brand color (see `color` prop passed to the icon).
  const tint = hexToRgba(brandHex, 0.12);
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: tint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
