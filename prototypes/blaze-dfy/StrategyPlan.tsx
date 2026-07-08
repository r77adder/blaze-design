import { useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { Heading, Text } from '@/components';
import { StatusPill, Toggle } from '@/staging';
import Calendar1 from '@/icons/20/Calendar1';
import Star from '@/icons/20/Star';
import Cursor04 from '@/icons/20/Cursor04';
import Google from '@/icons/20/Google';
import Globe from '@/icons/20/Globe';
import Marker03 from '@/icons/20/Marker03';
import Website from '@/icons/20/Website';
import SupportBubble from '@/icons/20/SupportBubble';
import Target2 from '@/icons/20/Target2';
import type { Account } from './lib/types';
import { HoverInput } from './ui';

/**
 * AM Strategy — the account-manager mirror of the client's read-only strategy
 * tab. Same grouped channel layout, but the AM sees EVERY feature (including the
 * ones that are switched off), can toggle any of them on, and can edit both the
 * cadence text (right of the title) and the plan description (below) that the
 * client ultimately reads. Off channels are dimmed but stay fully editable.
 */

type IconType = ComponentType<{ size?: number; color?: string }>;

interface Channel {
  group: string;
  name: string;
  icon: IconType;
  on: boolean;
  cadence: string;
  plan: string;
}

const GROUP_ORDER = ['Get found', 'Build trust', 'Convert & catch'];

const INITIAL: Channel[] = [
  // Get found
  {
    group: 'Get found',
    name: 'Paid Social',
    icon: Cursor04,
    on: true,
    cadence: 'Always-on · $1.8k / mo',
    plan: 'Lead-gen ads on Meta targeting Austin homeowners, routed straight to your free flooring estimate page.',
  },
  {
    group: 'Get found',
    name: 'Paid Search',
    icon: Google,
    on: true,
    cadence: 'Always-on · $2.4k / mo',
    plan: 'Google Search ads on high-intent terms like "hardwood flooring near me" pointed at the estimate page.',
  },
  {
    group: 'Get found',
    name: 'Local SEO',
    icon: Marker03,
    on: true,
    cadence: 'Weekly GBP posts + photos',
    plan: 'Google Business posts and geotagged job photos to climb the local map pack for Austin flooring searches.',
  },
  {
    group: 'Get found',
    name: 'SEO / AEO',
    icon: Globe,
    on: true,
    cadence: '2 pages / month',
    plan: 'Pricing and material-comparison content (hardwood vs LVP vs tile) built to rank and get cited in AI answers.',
  },
  {
    group: 'Get found',
    name: 'Competitor Tracking',
    icon: Target2,
    on: false,
    cadence: 'Weekly digest',
    plan: 'Track competitor ads, offers, and local rankings so we can react fast and keep you a step ahead.',
  },
  // Build trust
  {
    group: 'Build trust',
    name: 'Website',
    icon: Website,
    on: true,
    cadence: 'Estimate page live · ongoing upkeep',
    plan: 'A dedicated estimate landing page converting 2.3× the homepage, plus ongoing mobile speed fixes for phones.',
  },
  {
    group: 'Build trust',
    name: 'Organic Campaigns',
    icon: Calendar1,
    on: true,
    cadence: '9 posts / week · IG + Facebook',
    plan: 'Before/after install Reels and neighborhood-named posts to grow reach and keep your crew top of mind.',
  },
  {
    group: 'Build trust',
    name: 'Reputation',
    icon: Star,
    on: true,
    cadence: 'Continuous · 4.7★ avg',
    plan: 'Post-install review asks plus on-brand replies within hours to keep review velocity and rating high.',
  },
  // Convert & catch
  {
    group: 'Convert & catch',
    name: 'AI Receptionist',
    icon: SupportBubble,
    on: true,
    cadence: '24/7 · calls, texts & chats',
    plan: 'An AI receptionist answering every call, text, and chat in seconds — qualifying and booking leads around the clock.',
  },
];

export function AmStrategyPlan({ account }: { account: Account }) {
  const [channels, setChannels] = useState<Channel[]>(INITIAL);
  const update = (idx: number, patch: Partial<Channel>) =>
    setChannels((cs) => cs.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  const activeCount = channels.filter((c) => c.on).length;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '8px 4px 60px' }}>
      {/* section: header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '8px 0 4px' }}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
          Toggle the channels Blaze runs for {account.name}, and edit the cadence and description the client sees.
        </Text>
        <div style={{ flexShrink: 0 }}>
          <StatusPill tone="info">{activeCount} active</StatusPill>
        </div>
      </div>

      {/* section: channel groups */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 32 }}>
        {GROUP_ORDER.map((group) => {
          const rows = channels
            .map((c, i) => ({ c, i }))
            .filter((x) => x.c.group === group);
          return (
            <section key={group}>
              <div style={{ borderBottom: '1px solid var(--dark-4)', paddingBottom: 10, marginBottom: 8 }}>
                <Heading level={3}>{group}</Heading>
              </div>
              <div>
                {rows.map((x, idx) => (
                  <ChannelRow
                    key={x.c.name}
                    channel={x.c}
                    showTopBorder={idx > 0}
                    onChange={(patch) => update(x.i, patch)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ChannelRow({
  channel,
  showTopBorder,
  onChange,
}: {
  channel: Channel;
  showTopBorder: boolean;
  onChange: (patch: Partial<Channel>) => void;
}) {
  const Icon = channel.icon;
  const on = channel.on;
  // Keep the icon tile a square whose side matches the row's content height —
  // flexbox won't transfer a stretched cross-size to the main axis, so mirror
  // the rendered height onto the width with a ResizeObserver.
  const boxRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const sync = () => {
      el.style.width = `${el.offsetHeight}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 16,
        padding: '16px 0',
        borderTop: showTopBorder ? '1px solid var(--dark-4)' : 'none',
      }}
    >
      <span
        ref={boxRef}
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'stretch',
          flexShrink: 0,
          borderRadius: 8,
          background: on ? 'var(--dark-4)' : 'var(--dark-2)',
        }}
      >
        <Icon size={20} color={on ? 'var(--dark-90)' : 'var(--dark-40)'} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <Heading level={5} style={{ margin: 0, color: on ? 'var(--dark-90)' : 'var(--dark-40)' }}>
            {channel.name}
          </Heading>
          <HoverInput
            value={channel.cadence}
            onChange={(v) => onChange({ cadence: v })}
            placeholder="Add cadence…"
            style={{ marginLeft: 'auto', width: 260, flexShrink: 0, fontSize: 14, textAlign: 'right', color: on ? 'var(--dark-90)' : 'var(--dark-40)' }}
          />
        </div>
        <HoverInput
          multiline
          value={channel.plan}
          onChange={(v) => onChange({ plan: v })}
          placeholder="Describe what the client sees…"
          style={{ marginTop: 2, minHeight: 46, fontSize: 14, lineHeight: 1.5, color: 'var(--dark-60)' }}
        />
      </div>

      <div style={{ alignSelf: 'flex-start', flexShrink: 0 }}>
        <Toggle checked={on} onChange={(v) => onChange({ on: v })} />
      </div>
    </div>
  );
}
