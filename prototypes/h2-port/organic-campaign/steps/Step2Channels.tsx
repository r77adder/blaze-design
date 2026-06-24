import { Heading, Text } from '@/components';
import { Chip } from '@/staging';
import { useFirstCampaign } from '../first-campaign-context';
import Instagram from '@/icons/20/Instagram';
import Facebook from '@/icons/20/Facebook';
import LinkedIn from '@/icons/20/LinkedIn';
import Twitter from '@/icons/20/Twitter';
import Google from '@/icons/20/Google';
import TikTok from '@/icons/20/TikTok';
import YouTube from '@/icons/20/YouTube';
import Document from '@/icons/20/Document';
import Mail from '@/icons/20/Mail';
import type { ComponentType } from 'react';

interface ChipDef {
  id: string;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  iconColor?: string;
}

const FEED: ChipDef[] = [
  { id: 'feed:instagram', label: 'Instagram', Icon: Instagram, iconColor: '#E4405F' },
  { id: 'feed:facebook', label: 'Facebook', Icon: Facebook, iconColor: '#1877F2' },
  { id: 'feed:linkedin', label: 'Linkedin', Icon: LinkedIn, iconColor: '#0A66C2' },
  { id: 'feed:x', label: 'X (Twitter)', Icon: Twitter },
  { id: 'feed:gbp', label: 'Google Business Profile', Icon: Google },
];

const STORIES: ChipDef[] = [
  { id: 'stories:instagram', label: 'Instagram', Icon: Instagram, iconColor: '#E4405F' },
  { id: 'stories:facebook', label: 'Facebook', Icon: Facebook, iconColor: '#1877F2' },
];

const SHORT: ChipDef[] = [
  { id: 'short:reels', label: 'Instagram Reels', Icon: Instagram, iconColor: '#E4405F' },
  { id: 'short:tiktok', label: 'Tiktok', Icon: TikTok },
  { id: 'short:youtube', label: 'YouTube', Icon: YouTube, iconColor: '#FF0000' },
];

const LONG: ChipDef[] = [
  { id: 'long:blog', label: 'Blog', Icon: Document },
  { id: 'long:newsletter', label: 'Newsletter', Icon: Mail },
];

const SCHEDULE_OPTIONS = [
  { id: 'any', label: 'Any day' },
  { id: 'weekdays', label: 'Weekdays only' },
  { id: 'select', label: 'Let me select' },
] as const;

/** Step 2 — Channels + schedule. */
export function Step2Channels() {
  const { data, setData } = useFirstCampaign();

  const toggle = (id: string) => {
    setData((p) => ({
      ...p,
      channels: { ...p.channels, [id]: !p.channels[id] },
    }));
  };

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '24px auto 0' }}>
      <div style={{ display: 'flex', gap: 40 }}>
        {/* Left: channels + schedule */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Heading level={2} style={{ marginBottom: 8, fontSize: 32, maxWidth: 480 }}>
            Where and when should your content go out?
          </Heading>
          <Text variant="secondary">
            Pick your channels and set your posting scheduling preferences. You can
            change them at anytime.
          </Text>

          <Section label="Social Feed-posts">
            {FEED.map((c) => (
              <ChannelPill
                key={c.id}
                def={c}
                selected={!!data.channels[c.id]}
                onToggle={() => toggle(c.id)}
              />
            ))}
          </Section>

          <Section label="Stories">
            {STORIES.map((c) => (
              <ChannelPill
                key={c.id}
                def={c}
                selected={!!data.channels[c.id]}
                onToggle={() => toggle(c.id)}
              />
            ))}
          </Section>

          <Section label="Short-form Video">
            {SHORT.map((c) => (
              <ChannelPill
                key={c.id}
                def={c}
                selected={!!data.channels[c.id]}
                onToggle={() => toggle(c.id)}
              />
            ))}
          </Section>

          <Section label="Long-Form & Email">
            {LONG.map((c) => (
              <ChannelPill
                key={c.id}
                def={c}
                selected={!!data.channels[c.id]}
                onToggle={() => toggle(c.id)}
              />
            ))}
          </Section>

          <div style={{ marginTop: 28 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: 'var(--dark-90)',
                marginBottom: 12,
              }}
            >
              Post schedule settings
            </div>
            <div style={{ display: 'inline-flex', gap: 8 }}>
              {SCHEDULE_OPTIONS.map((opt) => {
                const selected = data.schedule === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setData((p) => ({ ...p, schedule: opt.id }))
                    }
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--dark-8)',
                      background: selected
                        ? 'var(--dark-4)'
                        : 'var(--light-100)',
                      color: 'var(--dark-90)',
                      fontFamily: 'inherit',
                      fontSize: 14,
                      fontWeight: selected ? 500 : 400,
                      letterSpacing: '0.28px',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: How distribution works info card */}
        <aside
          style={{
            width: 280,
            flexShrink: 0,
            padding: 20,
            borderRadius: 12,
            background: 'var(--dark-4)',
            alignSelf: 'flex-start',
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: 'var(--dark-60)',
              marginBottom: 8,
              letterSpacing: '0.26px',
            }}
          >
            How distribution works
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--dark-90)',
              marginBottom: 10,
              lineHeight: 1.4,
            }}
          >
            Cross-posting is on by default.
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--dark-60)',
              lineHeight: 1.55,
              letterSpacing: '0.26px',
            }}
          >
            Each piece of content posts across all selected channels in its group.
          </p>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: 13,
              color: 'var(--dark-60)',
              lineHeight: 1.55,
              letterSpacing: '0.26px',
            }}
          >
            You can turn cross-posting off per campaign for more individual control
            over each channel.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          fontSize: 14,
          color: 'var(--dark-60)',
          marginBottom: 10,
          letterSpacing: '0.28px',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  );
}

function ChannelPill({
  def,
  selected,
  onToggle,
}: {
  def: ChipDef;
  selected: boolean;
  onToggle: () => void;
}) {
  const { Icon, label, iconColor } = def;
  // Wrap the brand-colored icon so the Chip's icon slot picks up the right
  // brand color rather than the chip's default text color.
  const BrandIcon = ({ size }: { size?: number }) => (
    <Icon size={size} color={iconColor ?? 'var(--dark-90)'} />
  );
  return (
    <Chip
      icon={BrandIcon}
      selected={selected}
      onSelectionChange={onToggle}
      size="md"
    >
      {label}
    </Chip>
  );
}
