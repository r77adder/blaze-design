import type { ComponentType } from 'react';
import { Heading, Text, Button, IconButton, Modal, type StackModalProps } from '@/components';
import type { IconProps } from '@/icons/Types';
import AlertTriangle from '@/icons/20/AlertTriangle';
import GraduationCap from '@/icons/20/GraduationCap';
import Help from '@/icons/20/Help';
import Close from '@/icons/20/Close';
import LinkExternal from '@/icons/20/LinkExternal';
import ChevronRightSmall from '@/icons/20/ChevronRightSmall';
import Instagram from '@/icons/20/Instagram';
import Facebook from '@/icons/20/Facebook';
import Google from '@/icons/20/Google';
import Globe from '@/icons/20/Globe';
import Calendar1 from '@/icons/20/Calendar1';
import Mail from '@/icons/20/Mail';
import MetaBrand from '@/icons/20/MetaBrand';
import Marker03 from '@/icons/20/Marker03';
import type { ConnectIconKey, ConnectIntegration } from './data';

/** Shared icon map for connect rows + this modal, keyed by ConnectIconKey. */
export const CONNECT_ICONS: Record<ConnectIconKey, ComponentType<IconProps>> = {
  instagram: Instagram,
  facebook: Facebook,
  google: Google,
  globe: Globe,
  calendar: Calendar1,
  mail: Mail,
  meta: MetaBrand,
  marker: Marker03,
};

/** Connect-account help modal, mirroring the Meta/Instagram onboarding sheet:
 *  a yellow instructions panel with numbered steps, an optional inline mockup,
 *  a setup-guide link, and a footer that hands off to the provider. The host
 *  passes `onConnected` — the flow marks its own connection, the portal marks
 *  the account in Home. */
export function ConnectModal({ integration, close, onConnected }: StackModalProps & { integration: ConnectIntegration; onConnected?: () => void }) {
  const Icon = CONNECT_ICONS[integration.icon];

  return (
    <Modal.Root size="lg" onClose={close} onPressOutside={close}>
      <div style={{ fontFamily: "'Sohne', sans-serif", display: 'flex', flexDirection: 'column', maxHeight: '86vh' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '28px 32px 20px' }}>
          <Icon size={28} />
          <Heading level={2} style={{ margin: 0, flex: 1 }}>{integration.modalTitle}</Heading>
          <IconButton size="sm" variant="ghost" icon={Close} title="Close" onPress={close} />
        </div>

        {/* body */}
        <div style={{ padding: '0 32px', overflowY: 'auto' }}>
          <div style={{ background: 'rgba(252,183,40,0.12)', border: '1px solid rgba(252,183,40,0.32)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <AlertTriangle size={20} color="var(--dark-90)" />
              <Heading level={4} style={{ margin: 0 }}>Instructions</Heading>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {integration.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 99, background: 'var(--dark-90)', color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginTop: 1 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ display: 'block', fontSize: 15, color: 'var(--dark-90)', lineHeight: 1.55 }}>{step.text}</Text>
                    {step.note && (
                      <Text style={{ display: 'block', fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.55, marginTop: 10 }}>Note: {step.note}</Text>
                    )}
                    {step.mockup === 'instagram' && <InstagramMockup />}
                    {step.guideLabel && (
                      <div style={{ marginTop: 16 }}>
                        <Button variant="secondary" size="sm" frontIcon={GraduationCap} onPress={() => {}}>{step.guideLabel}</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 32px', marginTop: 8 }}>
          <Button variant="ghost" size="lg" onPress={close}>Back</Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="lg" frontIcon={Help} onPress={() => {}}>Get Live Help</Button>
            <Button variant="primary" size="lg" endIcon={LinkExternal} onPress={() => { onConnected?.(); close(); }}>{integration.ctaLabel}</Button>
          </div>
        </div>
      </div>
    </Modal.Root>
  );
}

// ─── Inline mockups ──────────────────────────────────────────────────────────

function MockRow({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
      <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, background: dark ? 'rgba(255,255,255,0.14)' : 'var(--dark-8)' }} />
      <Text style={{ flex: 1, fontSize: 14, color: dark ? 'var(--light-100)' : 'var(--dark-80)' }}>{label}</Text>
      <ChevronRightSmall size={18} color={dark ? 'var(--light-60)' : 'var(--dark-40)'} />
    </div>
  );
}

/** Two side-by-side settings mockups, IG "For professionals" + FB "Business
 *  settings", echoing where the client confirms their account type. */
function InstagramMockup() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
      <div style={{ background: 'var(--dark-90)', borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--light-100)' }}>For professionals</Text>
          <Instagram size={20} />
        </div>
        <MockRow label="Insights" dark />
        <MockRow label="Scheduled content" dark />
        <MockRow label="Business tools and controls" dark />
      </div>
      <div style={{ background: 'rgba(124,92,252,0.06)', borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>Business settings</Text>
          <Facebook size={20} />
        </div>
        <MockRow label="Business info" />
        <MockRow label="Your contact info" />
        <MockRow label="Meta Verified" />
      </div>
    </div>
  );
}
