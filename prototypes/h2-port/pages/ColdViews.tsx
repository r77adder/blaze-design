import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import { useToast } from '@/staging';
import Globe from '@/icons/20/Globe';
import Star from '@/icons/20/Star';
import Stars from '@/icons/20/Stars';
import Camera1 from '@/icons/20/Camera1';
import Calendar1 from '@/icons/20/Calendar1';
import FileSearch1 from '@/icons/20/FileSearch1';
import PaidAds from '@/icons/20/PaidAds';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import { AiReceptionistSetupModal } from '../ai-receptionist/AiReceptionistSetupModal';
import { useDevState } from '../dev-state-context';
import {
  FirstCampaignProvider,
  useFirstCampaign,
} from '../organic-campaign/first-campaign-context';
import { FirstCampaignModal } from '../organic-campaign/FirstCampaignModal';

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
    <FirstCampaignProvider>
      <OrganicSocialColdViewBody />
      <FirstCampaignModal />
    </FirstCampaignProvider>
  );
}

function OrganicSocialColdViewBody() {
  const { start, open } = useFirstCampaign();
  const location = useLocation();

  // When the user lands here from Home cold's "Turn on" CTA, the URL carries
  // `?setup=1`. Auto-open the first-campaign modal so they go straight from
  // Home → setup flow without a manual click in between. Only fires once.
  useEffect(() => {
    if (open) return;
    const params = new URLSearchParams(location.search);
    if (params.get('setup') === '1') start();
  }, [location.search, open, start]);

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
        <Calendar1 size={28} />
      </div>
      <Heading level={3} style={{ marginBottom: 8 }}>
        No posts scheduled yet
      </Heading>
      <Text
        variant="secondary"
        style={{ display: 'block', marginBottom: 24, lineHeight: 1.55, maxWidth: 400 }}
      >
        Plan your first week of organic posts — Blaze will draft, schedule, and crosspost across every connected channel.
      </Text>
      <Button variant="primary" size="lg" onPress={() => start()}>
        Plan first post
      </Button>
    </div>
  );
}

export function SdrColdView() {
  const [modalOpen, setModalOpen] = useState(false);
  const { setState } = useDevState();

  return (
    <>
      {/* Inlined empty-state shell (instead of <EmptyState>) so the CTA can
          open the setup modal and the cold view can manage modal state
          locally. Same overall shape — centered icon + title + subhead + CTA. */}
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
          <UserProfileGroup size={28} />
        </div>
        <Heading level={3} style={{ marginBottom: 8 }}>
          No deals or programs yet
        </Heading>
        <Text
          variant="secondary"
          style={{ display: 'block', marginBottom: 24, lineHeight: 1.55, maxWidth: 400 }}
        >
          Connect a data source to import contacts. The AI Receptionist will qualify leads, draft
          email and SMS outreach, and run the full pipeline end-to-end.
        </Text>
        <Button variant="primary" size="lg" onPress={() => setModalOpen(true)}>
          Set up AI Receptionist
        </Button>
      </div>

      {modalOpen && (
        <AiReceptionistSetupModal
          onClose={() => setModalOpen(false)}
          onFinish={() => {
            setState('/h2/sdr', 'steady');
            setModalOpen(false);
          }}
        />
      )}
    </>
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

export function SeoColdView() {
  return (
    <EmptyState
      icon={<FileSearch1 size={28} />}
      title="No content published yet"
      subhead="Pick your topic clusters and Blaze will draft 4 SEO posts per month — written by AI, edited by humans, optimized for the queries your customers actually search."
      ctaLabel="Pick your topics"
      ctaMessage="Opening topic-cluster picker"
    />
  );
}

export function AeoColdView() {
  return (
    <EmptyState
      icon={<Stars size={28} />}
      title="Not cited by AI yet"
      subhead="Blaze submits structured citations to ChatGPT, Perplexity, Gemini, and Claude so your brand is the answer when customers ask."
      ctaLabel="Submit my citations"
      ctaMessage="Opening citation submission flow"
    />
  );
}
