import { useState } from 'react';
import { Button, Modal, Text, type StackModalProps } from '@/components';
import { Avatar, Callout, TabChip, Toggle, useToast } from '@/staging';
import { COMPETITORS, COMPETITOR_PROFILES, type CompetitorKey } from './data';

// Local constants for swatches not covered by tokens.
const STATUS_GREEN = '#059669';

/**
 * Per-competitor tracking-settings modal. Opens from Competitor Detail.
 * Mirrors source HTML's #cs-modal (line 7621+):
 *   - Refresh frequency
 *   - Alert toggles
 *   - Channel monitoring list
 *   - Strategic role dropdown
 *   - Danger zone (pause / untrack)
 */
export function CompetitorSettingsModal({
  competitorKey,
  close,
}: StackModalProps & { competitorKey: CompetitorKey }) {
  const c = COMPETITORS[competitorKey];
  const profile = COMPETITOR_PROFILES[competitorKey];
  const { showToast } = useToast();

  const [freq, setFreq] = useState<'realtime' | 'daily' | 'weekly'>('daily');
  const [alerts, setAlerts] = useState({
    'new-ad': true,
    spike: true,
    sentiment: false,
    positioning: false,
  });
  const [channels, setChannels] = useState<Record<string, boolean>>(
    Object.fromEntries(profile.channels.map((ch) => [ch.name, true])),
  );

  const toggleAlert = (k: keyof typeof alerts) => setAlerts((p) => ({ ...p, [k]: !p[k] }));
  const toggleChannel = (k: string) => setChannels((p) => ({ ...p, [k]: !p[k] }));

  return (
    <Modal.Root size="md" aria-labelledby="cs-title">
      <Modal.Header
        title={`Tracking settings · ${c.name}`}
        id="cs-title"
        onClose={close}
      />
      <Modal.Content>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <Avatar fallback={c.initials} size="lg" style={{ background: c.color, color: 'var(--light-100)', fontSize: 14, fontWeight: 700 }} />
          <div>
            <Text variant="smallList">{c.name}</Text>
            <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)' }}>{profile.trackingSince} · Daily refresh</Text>
          </div>
        </div>

        <Section label="Refresh frequency">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['realtime', 'daily', 'weekly'] as const).map((k) => {
              const titles = { realtime: '⚡ Real-time', daily: '☀ Daily', weekly: '📅 Weekly' };
              return (
                <TabChip
                  key={k}
                  selected={freq === k}
                  onSelect={() => setFreq(k)}
                >
                  {titles[k]}
                </TabChip>
              );
            })}
          </div>
          <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 8 }}>
            {{ realtime: 'Updates within 60s', daily: 'Every morning', weekly: 'Lighter touch' }[freq]}
          </Text>
        </Section>

        <Section label="Alert me when">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {([
              { key: 'new-ad', icon: '🚨', title: 'New ad launched', sub: 'A fresh creative goes live on Google or Meta' },
              { key: 'spike', icon: '📈', title: 'Engagement spike', sub: 'A post performs 3× their normal baseline' },
              { key: 'sentiment', icon: '💬', title: 'Sentiment shift', sub: 'Conversation tone changes meaningfully' },
              { key: 'positioning', icon: '🆕', title: 'New positioning detected', sub: 'Tagline, product, or messaging changes' },
            ] as const).map((a) => {
              const on = alerts[a.key];
              return (
                <div
                  key={a.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    border: '1px solid var(--dark-8)',
                    background: 'var(--light-100)',
                    borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <Text variant="smallList" style={{ display: 'block', color: 'var(--dark-90)' }}>{a.title}</Text>
                    <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)' }}>{a.sub}</Text>
                  </div>
                  <Toggle checked={on} onChange={() => toggleAlert(a.key)} />
                </div>
              );
            })}
          </div>
        </Section>

        <Section label="Channels to monitor">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profile.channels.map((ch) => {
              const on = channels[ch.name] ?? false;
              return (
                <div
                  key={ch.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 14px',
                    border: '1px solid var(--dark-8)',
                    background: 'var(--light-100)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Text variant="smallList" style={{ display: 'block' }}>{ch.name}</Text>
                    <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)' }}>{ch.followers} · {ch.activity}</Text>
                  </div>
                  <Text variant="metadata" style={{ color: ch.status === 'Live' ? STATUS_GREEN : 'var(--dark-60)' }}>● {ch.status}</Text>
                  <Toggle checked={on} onChange={() => toggleChannel(ch.name)} />
                </div>
              );
            })}
          </div>
        </Section>

        <Section label="Strategic role">
          <select
            defaultValue={c.tag ?? 'Digital challenger'}
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid var(--dark-15)',
              borderRadius: 8,
              fontSize: 14,
              background: 'var(--light-100)',
            }}
          >
            <option>National franchise leader</option>
            <option>Digital challenger</option>
            <option>Direct local rival</option>
            <option>Hill Country specialist</option>
            <option>Adjacent (handyman / DIY)</option>
            <option>Adjacent (general contractor)</option>
          </select>
        </Section>

        <Section label="Danger zone">
          <Callout tone="danger" title="Pause or stop tracking this competitor">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span>
                Pausing keeps the data but stops new updates. Untracking removes them from your feed, table, and alerts — historical data is archived.
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" variant="secondary" onPress={() => showToast({ message: `⏸ Paused tracking ${c.name}`, variant: 'success' })}>⏸ Pause tracking</Button>
                <Button size="sm" variant="danger" onPress={() => showToast({ message: `🗑 Untracked ${c.name}`, variant: 'success' })}>🗑 Untrack</Button>
              </div>
            </div>
          </Callout>
        </Section>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="tertiary" onPress={close}>Cancel</Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>Last synced 12 min ago</Text>
          <Modal.FooterButton
            variant="primary"
            onPress={() => {
              showToast({ message: '✓ Settings saved', variant: 'success' });
              close();
            }}
          >
            Save changes
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Text variant="smallList" style={{ display: 'block', color: 'var(--dark-90)', marginBottom: 8 }}>
        {label}
      </Text>
      {children}
    </div>
  );
}
