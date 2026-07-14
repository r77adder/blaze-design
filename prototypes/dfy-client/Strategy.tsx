import { type ComponentType, useLayoutEffect, useRef } from 'react';
import { Heading, Text } from '@/components';
import Calendar1 from '@/icons/20/Calendar1';
import Star from '@/icons/20/Star';
import Cursor04 from '@/icons/20/Cursor04';
import Google from '@/icons/20/Google';
import Globe from '@/icons/20/Globe';
import Marker03 from '@/icons/20/Marker03';
import Website from '@/icons/20/Website';
import SupportBubble from '@/icons/20/SupportBubble';
import { ClientShell } from './shell';

/**
 * Client Strategy: a strictly VIEW-ONLY overview of the marketing plan Blaze is
 * running for Grain Design Flooring. The client can SEE which channels are in the
 * plan, plus the cadence/goal and a one-line plan summary for each. There are NO
 * toggles, NO edit affordances, and NO active/recommended status pills. The
 * account manager controls the plan; the client just reads it.
 *
 * The channel taxonomy is harvested from H2's "Blaze Products" list (Tools.tsx)
 * but every operator control has been stripped.
 */

interface Channel {
  name: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  cadence: string;
  plan: string;
}

interface ChannelGroup {
  title: string;
  channels: Channel[];
}

const GROUPS: ChannelGroup[] = [
  {
    title: 'Get found',
    channels: [
      {
        name: 'Paid Social',
        icon: Cursor04,
        cadence: 'Always-on · $1.8k / mo',
        plan: 'Lead-gen ads on Meta targeting Austin homeowners, routed straight to your free flooring estimate page.',
      },
      {
        name: 'Paid Search',
        icon: Google,
        cadence: 'Always-on · $2.4k / mo',
        plan: 'Google Search ads on high-intent terms like "hardwood flooring near me" pointed at the estimate page.',
      },
      {
        name: 'Local SEO',
        icon: Marker03,
        cadence: 'Weekly GBP posts + photos',
        plan: 'Google Business posts and geotagged job photos to climb the local map pack for Austin flooring searches.',
      },
      {
        name: 'SEO / AEO',
        icon: Globe,
        cadence: '2 pages / month',
        plan: 'Pricing and material-comparison content (hardwood vs LVP vs tile) built to rank and get cited in AI answers.',
      },
    ],
  },
  {
    title: 'Build trust',
    channels: [
      {
        name: 'Website',
        icon: Website,
        cadence: 'Estimate page live · ongoing upkeep',
        plan: 'A dedicated estimate landing page converting 2.3× the homepage, plus ongoing mobile speed fixes for phones.',
      },
      {
        name: 'Organic Campaigns',
        icon: Calendar1,
        cadence: '9 posts / week · IG + Facebook',
        plan: 'Before/after install Reels and neighborhood-named posts to grow reach and keep your crew top of mind.',
      },
      {
        name: 'Reputation',
        icon: Star,
        cadence: 'Continuous · 4.7★ avg',
        plan: 'Post-install review asks plus on-brand replies within hours to keep review velocity and rating high.',
      },
    ],
  },
  {
    title: 'Convert & catch',
    channels: [
      {
        name: 'AI Receptionist',
        icon: SupportBubble,
        cadence: '24/7 · calls, texts & chats',
        plan: 'An AI receptionist answering every call, text, and chat in seconds, qualifying and booking leads around the clock.',
      },
    ],
  },
];

export function Strategy({ sub }: { sub?: string }) {
  void sub;
  return (
    <ClientShell section="strategy">
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 4px 60px' }}>
        {/* section: channel groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {GROUPS.map((group) => (
            <ChannelGroupSection key={group.title} group={group} />
          ))}
        </div>

        {/* section: footnote */}
        <Text
          variant="metadata"
          style={{ display: 'block', marginTop: 32, color: 'var(--dark-60)', textAlign: 'center' }}
        >
          Your Blaze team manages the plan. Want to change your strategy? Just message your account manager.
        </Text>
      </div>
    </ClientShell>
  );
}

function ChannelGroupSection({ group }: { group: ChannelGroup }) {
  return (
    <section>
      <div style={{ borderBottom: '1px solid var(--dark-4)', paddingBottom: 10, marginBottom: 8 }}>
        <Heading level={3}>{group.title}</Heading>
      </div>
      <div>
        {group.channels.map((channel, i) => (
          <ChannelRow key={channel.name} channel={channel} showTopBorder={i > 0} />
        ))}
      </div>
    </section>
  );
}

function ChannelRow({ channel, showTopBorder }: { channel: Channel; showTopBorder: boolean }) {
  const Icon = channel.icon;
  // Keep the icon tile a square whose side matches the row's content height.
  // Flexbox won't transfer a stretched cross-size to the main axis via aspect-ratio,
  // so mirror the rendered height onto the width with a ResizeObserver.
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
          background: 'var(--dark-4)',
          color: 'var(--dark-90)',
        }}
      >
        <Icon size={20} color="var(--dark-90)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <Heading level={5} style={{ margin: 0, color: 'var(--dark-90)' }}>
            {channel.name}
          </Heading>
          <Text
            variant="secondary"
            style={{ marginLeft: 'auto', flexShrink: 0, whiteSpace: 'nowrap', color: 'var(--dark-90)' }}
          >
            {channel.cadence}
          </Text>
        </div>
        <Text variant="secondary" style={{ display: 'block', lineHeight: 1.5, color: 'var(--dark-60)', marginTop: 4 }}>
          {channel.plan}
        </Text>
      </div>
    </div>
  );
}
