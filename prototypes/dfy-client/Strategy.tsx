import { type ComponentType } from 'react';
import { Heading, Text } from '@/components';
import Calendar1 from '@/icons/20/Calendar1';
import Star from '@/icons/20/Star';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import Cursor04 from '@/icons/20/Cursor04';
import Google from '@/icons/20/Google';
import Globe from '@/icons/20/Globe';
import Marker03 from '@/icons/20/Marker03';
import Templates from '@/icons/20/Templates';
import Website from '@/icons/20/Website';
import { ClientShell } from './shell';

/**
 * Client Strategy — a strictly VIEW-ONLY overview of the marketing plan Blaze is
 * running for Grain Design Flooring. The client can SEE which channels are in the
 * plan, plus the cadence/goal and a one-line plan summary for each. There are NO
 * toggles, NO edit affordances, and NO active/recommended status pills — the
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
    title: 'Organic',
    channels: [
      {
        name: 'Organic Campaigns',
        icon: Calendar1,
        cadence: '9 posts / week · IG + Facebook',
        plan: 'Before/after install Reels and neighborhood-named posts to grow reach and keep your crew top of mind.',
      },
      {
        name: 'UGC Content',
        icon: UserProfileCircle,
        cadence: 'Real-home photo features',
        plan: 'Real customer floors and crew spotlights turned into authentic posts to lift trust and engagement.',
      },
    ],
  },
  {
    title: 'Paid',
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
    ],
  },
  {
    title: 'Search & Local',
    channels: [
      {
        name: 'SEO / AEO',
        icon: Globe,
        cadence: '2 pages / month',
        plan: 'Pricing and material-comparison content (hardwood vs LVP vs tile) built to rank and get cited in AI answers.',
      },
      {
        name: 'Local SEO',
        icon: Marker03,
        cadence: 'Weekly GBP posts + photos',
        plan: 'Google Business posts and geotagged job photos to climb the local map pack for Austin flooring searches.',
      },
    ],
  },
  {
    title: 'Conversion',
    channels: [
      {
        name: 'Landing Pages',
        icon: Templates,
        cadence: 'Estimate page live',
        plan: 'A dedicated estimate landing page converting 2.3× the homepage — the destination for all paid traffic.',
      },
      {
        name: 'Website',
        icon: Website,
        cadence: 'Maintenance only',
        plan: 'Ongoing mobile speed fixes to cut the ~30% load-time bounce on phones browsing your flooring galleries.',
      },
    ],
  },
  {
    title: 'Reputation',
    channels: [
      {
        name: 'Reputation',
        icon: Star,
        cadence: 'Continuous · 4.7★ avg',
        plan: 'Post-install review asks plus on-brand replies within hours to keep review velocity and rating high.',
      },
    ],
  },
];

export function Strategy({ sub }: { sub?: string }) {
  void sub;
  return (
    <ClientShell section="strategy">
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 4px 60px' }}>
        {/* section: header */}
        <div style={{ padding: '24px 0 8px' }}>
          <Heading level={2} style={{ lineHeight: 1.2, letterSpacing: '-0.4px', marginBottom: 0 }}>
            Your strategy at a glance
          </Heading>
        </div>

        {/* section: channel groups */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
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
      <div style={{ borderBottom: '1px solid var(--dark-8)', paddingBottom: 10, marginBottom: 8 }}>
        <Heading level={4}>{group.title}</Heading>
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
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: '16px 0',
        borderTop: showTopBorder ? '1px solid var(--dark-8)' : 'none',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 8,
          background: 'var(--dark-4)',
          color: 'var(--dark-90)',
        }}
      >
        <Icon size={20} color="var(--dark-90)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text variant="smallList" style={{ display: 'block', color: 'var(--dark-90)' }}>
          {channel.name}
        </Text>
        <Text variant="secondary" style={{ display: 'block', lineHeight: 1.5, color: 'var(--dark-60)', marginTop: 4 }}>
          {channel.plan}
        </Text>
      </div>
      <Text variant="metadata" style={{ flexShrink: 0, textAlign: 'right', color: 'var(--dark-60)', lineHeight: 1.5 }}>
        {channel.cadence}
      </Text>
    </div>
  );
}
