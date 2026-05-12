import type { ReactElement, ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { useToast } from '@/staging';
import Mail from '@/icons/20/Mail';
import Globe from '@/icons/20/Globe';
import Star from '@/icons/20/Star';
import Camera1 from '@/icons/20/Camera1';
import Calendar1 from '@/icons/20/Calendar1';
import PaidAds from '@/icons/20/PaidAds';
import UserProfileGroup from '@/icons/20/UserProfileGroup';

/**
 * Cold-state placeholders for H2 routes that don't already model a setup
 * or empty path. Each is a simple centered empty state with an icon
 * (vetted from `@/icons`), a heading, a subhead, and a primary CTA.
 *
 * The CTAs are no-ops that fire a toast — the goal is to give the designer
 * a faithful empty-state silhouette to screenshot from, not a working flow.
 */

function EmptyState({
  icon,
  title,
  subhead,
  ctaLabel,
  ctaMessage,
}: {
  icon: ReactElement;
  title: string;
  subhead: ReactNode;
  ctaLabel: string;
  ctaMessage: string;
}) {
  const { showToast } = useToast();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        minHeight: 360,
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: 'var(--dark-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          color: 'var(--dark-60)',
        }}
      >
        {icon}
      </div>
      <Heading level={3} style={{ marginBottom: 8 }}>
        {title}
      </Heading>
      <Text
        variant="secondary"
        style={{ display: 'block', marginBottom: 24, lineHeight: 1.55, maxWidth: 400 }}
      >
        {subhead}
      </Text>
      <Button
        variant="primary"
        size="lg"
        onPress={() => showToast({ message: ctaMessage })}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}

export function OrganicSocialColdView() {
  return (
    <EmptyState
      icon={<Calendar1 size={28} />}
      title="No posts scheduled yet"
      subhead="Plan your first week of organic posts — Blaze will draft, schedule, and crosspost across every connected channel."
      ctaLabel="Plan first post"
      ctaMessage="Opening planner — connect at least one channel to begin"
    />
  );
}

export function EmailSmsColdView() {
  return (
    <EmptyState
      icon={<Mail size={28} />}
      title="No programs running"
      subhead="Welcome, win-back, abandoned-cart, and more — start a program and Blaze will draft the full sequence."
      ctaLabel="Start your first program"
      ctaMessage="Opening new-program flow"
    />
  );
}

export function LandingPagesColdView() {
  return (
    <EmptyState
      icon={<Globe size={28} />}
      title="No landing pages yet"
      subhead="Spin up a campaign-matched landing page in minutes. Blaze writes the copy, sources the imagery, and wires the tracking."
      ctaLabel="Create landing page"
      ctaMessage="Opening landing page wizard"
    />
  );
}

export function ReputationColdView() {
  return (
    <EmptyState
      icon={<Star size={28} />}
      title="Connect a review source"
      subhead="Pull in Google, Yelp, and DM feedback so Blaze can triage, draft replies, and surface what needs your attention."
      ctaLabel="Connect a source"
      ctaMessage="Opening review-source picker"
    />
  );
}

export function UgcColdView() {
  return (
    <EmptyState
      icon={<Camera1 size={28} />}
      title="No UGC campaigns yet"
      subhead="Brief creators, collect deliverables, and approve final cuts — all in one place. Spin up your first campaign to get started."
      ctaLabel="Create UGC campaign"
      ctaMessage="Opening UGC campaign brief"
    />
  );
}

export function CrmColdView() {
  return (
    <EmptyState
      icon={<UserProfileGroup size={28} />}
      title="No deals yet"
      subhead="Connect a data source to import contacts and let Blaze SDR start qualifying leads and drafting follow-ups."
      ctaLabel="Connect a data source"
      ctaMessage="Opening data-source connect flow"
    />
  );
}

export function PaidAdsColdView() {
  return (
    <EmptyState
      icon={<PaidAds size={28} />}
      title="No paid social campaigns yet"
      subhead="Connect Meta and TikTok ads to let Blaze plan, draft, and optimize creative across your funnel."
      ctaLabel="Connect ad accounts"
      ctaMessage="Opening ad-account connect flow"
    />
  );
}
