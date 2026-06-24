import { useState, type ComponentType } from 'react';
import { IconButton, Modal, Text } from '@/components';
import type { StackModalProps } from '@/components';
import ChevronUp from '@/icons/20/ChevronUp';
import ChevronDown from '@/icons/20/ChevronDown';
import Calendar1 from '@/icons/20/Calendar1';
import Cursor04 from '@/icons/20/Cursor04';
import FileSearch1 from '@/icons/20/FileSearch1';
import Google from '@/icons/20/Google';
import Mail from '@/icons/20/Mail';
import Map02 from '@/icons/20/Map02';
import Star from '@/icons/20/Star';
import Target2 from '@/icons/20/Target2';
import Templates from '@/icons/20/Templates';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import { KindBadge, StatusPill } from '@/staging';
import type { FeedItem as FeedItemData, FeedSource, ProposedSolution } from './feed-data';

const SOURCE_ICONS: Record<FeedSource, ComponentType<{ size?: number; color?: string }>> = {
  campaigns: Target2,
  seo: FileSearch1,
  organic: Calendar1,
  influencer: UserProfileCircle,
  map: Map02,
  landing: Templates,
  'paid-search': Google,
  'paid-social': Cursor04,
  reputation: Star,
  email: Mail,
};

const SOURCE_CONTEXT: Record<FeedSource, { why: string; steps: string[] }> = {
  reputation: {
    why: 'Unanswered reviews and mentions affect booking conversion. The agent watches every source 24/7 and drafts replies that match your brand tone before anything goes live.',
    steps: [
      'Review the AI draft and edit any phrases that don\'t sound like you',
      'Approve to publish to the source; we\'ll track the sentiment shift',
      'Or skip and handle this one manually later',
    ],
  },
  seo: {
    why: 'Visibility in AI search engines (ChatGPT, Perplexity, Gemini) depends on whether your brand can be cited authoritatively. The agent finds and fixes citation gaps continuously.',
    steps: [
      'Approve all to roll out the proposed fixes in one click',
      'Or open AEO to review each action individually',
      'Re-run analysis after content publishes to confirm citations',
    ],
  },
  'paid-search': {
    why: 'Ad-spend efficiency drops the moment a keyword over-bids or a high-CPC term outpaces conversion. The agent monitors live bid economics and proposes guardrails.',
    steps: [
      'Pause the keyword to stop the bleed while you investigate',
      'Or accept the suggested max bid (we\'ll watch the next 6h closely)',
      'Open Paid Search to see the full bid + CTR history',
    ],
  },
  influencer: {
    why: 'AI-generated UGC content needs a brand-safety pass before going live. The agent flags anything off-tone or off-brand against your guidelines.',
    steps: [
      'Approve all that pass brand-safety automatically',
      'Open the one with a tone flag to inspect manually',
      'Or open UGC Content to see the full grid + brand-fit scores',
    ],
  },
  email: {
    why: 'Multi-step lifecycle programs need fresh copy each cycle to keep engagement. The agent regenerates variants and waits for your approval before pushing live.',
    steps: [
      'Review each proposed step\'s copy in the AI Receptionist outreach editor',
      'Approve to push live in the next send window',
      'Or open AI Receptionist to edit any step manually',
    ],
  },
  campaigns: {
    why: 'Cross-channel campaigns coordinate budget, creative, and timing across every product surface. The agent surfaces blockers and stage-gate decisions in real time.',
    steps: [
      'Open the campaign to see the full timeline + assets',
      'Approve the next-stage gate (we\'ll notify the team)',
      'Or snooze until tomorrow morning',
    ],
  },
  map: {
    why: 'Local map ranking is driven by review velocity, photo freshness, and Google Business Profile signals. The agent watches all three for shifts.',
    steps: [
      'Open Map Ranking to see the affected listings',
      'Approve the suggested GBP fixes',
      'Or snooze and revisit after the next 48h of data',
    ],
  },
  landing: {
    why: 'Landing-page conversion flatlines when copy goes stale. The agent runs continuous A/B variants and surfaces the winners as soon as significance is reached.',
    steps: [
      'Promote the winning variant to 100% traffic',
      'Open Landing Pages to inspect the experiment',
      'Or keep the current variant and end the test',
    ],
  },
  organic: {
    why: 'Organic Campaigns posts are the steady drumbeat of your brand. The agent watches engagement and timing fit, and queues the next week\'s posts for review.',
    steps: [
      'Open Organic Campaigns to review the calendar',
      'Approve the suggested posts for the upcoming week',
      'Or snooze until you\'re ready to plan',
    ],
  },
  'paid-social': {
    why: 'Paid Social efficiency drops fast when creative fatigue sets in. The agent watches CPM/CPA shifts and proposes a refresh before the spike compounds.',
    steps: [
      'Approve a creative refresh from the variant pool',
      'Pause the underperforming ad set',
      'Open Paid Social to see the full breakdown by placement',
    ],
  },
};

export function FeedItemModal({
  close,
  items,
  initialIndex,
  onAction,
}: StackModalProps & {
  items: FeedItemData[];
  initialIndex: number;
  onAction: (label: string, source: string) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const item = items[index] ?? items[0];
  const ctx = SOURCE_CONTEXT[item.source];
  const total = items.length;
  const SourceIcon = SOURCE_ICONS[item.source];
  const isFatigue = item.kind === 'action' && Boolean(item.proposedSolution);

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };
  const goNext = () => {
    if (index < total - 1) setIndex(index + 1);
  };

  const fire = (label: string) => {
    onAction(label, item.sourceLabel);
    close();
  };

  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontSize: 12,
          color: 'var(--dark-60)',
          fontVariantNumeric: 'tabular-nums',
          minWidth: 40,
          textAlign: 'right',
        }}
      >
        {index + 1} / {total}
      </span>
      <IconButton
        icon={ChevronUp}
        size="sm"
        variant="tertiary"
        isDisabled={index === 0}
        onPress={goPrev}
        aria-label="Previous item"
      />
      <IconButton
        icon={ChevronDown}
        size="sm"
        variant="tertiary"
        isDisabled={index === total - 1}
        onPress={goNext}
        aria-label="Next item"
      />
    </div>
  );

  const thumbnails = item.thumbnails ?? [];

  return (
    <Modal.Root size="md" aria-labelledby="feed-item-title">
      <Modal.Header
        title={item.title}
        id="feed-item-title"
        onClose={close}
        compact={false}
        actions={headerActions}
      />
      <Modal.Content compact={false}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          {isFatigue ? (
            <StatusPill tone="danger" size="sm">Fatigue alert</StatusPill>
          ) : item.kind === 'action' ? (
            <StatusPill tone="warning" size="sm">Needs sign-off</StatusPill>
          ) : (
            <KindBadge kind={item.kind} iconless />
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--dark-60)',
            }}
          >
            <SourceIcon size={16} color="var(--dark-60)" />
            <Text
              variant="metadata"
              style={{
                color: 'var(--dark-60)',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              {item.sourceLabel}
            </Text>
          </span>
          <Text
            variant="metadata"
            style={{
              marginLeft: 'auto',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--dark-40)',
              fontSize: '11.5px',
            }}
          >
            {item.time}
          </Text>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'var(--dark-90)',
            lineHeight: 1.6,
            padding: '14px 16px',
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
            marginBottom: 24,
          }}
        >
          {item.body}
        </p>

        {thumbnails.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 16,
            }}
          >
            {thumbnails.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                style={{
                  height: 120,
                  width: 'auto',
                  flexShrink: 0,
                  borderRadius: 10,
                  border: '1px solid var(--dark-8)',
                  objectFit: 'cover',
                  background: 'var(--dark-4)',
                  display: 'block',
                }}
              />
            ))}
          </div>
        )}

        {item.proposedSolution ? (
          <ProposedSolutionView solution={item.proposedSolution} />
        ) : (
          <>
            <Section title="Why this matters">
              <p style={{ margin: 0, fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.6 }}>
                {ctx.why}
              </p>
            </Section>

            <Section title="Recommended next steps">
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ctx.steps.map((s) => (
                  <li key={s} style={{ fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.55 }}>{s}</li>
                ))}
              </ol>
            </Section>
          </>
        )}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={() => fire('Dismissed')}>
            Dismiss
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {item.secondary && (
              <Modal.FooterButton variant="tertiary" onPress={() => fire(item.secondary!)}>
                {item.secondary}
              </Modal.FooterButton>
            )}
            {item.primary && (
              <Modal.FooterButton variant="primary" onPress={() => fire(item.primary!)}>
                {item.primary}
              </Modal.FooterButton>
            )}
          </div>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function ProposedSolutionView({ solution }: { solution: ProposedSolution }) {
  return (
    <>
      <Section title="Why we flagged this">
        <p style={{ margin: 0, fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.6 }}>
          {solution.reason}
        </p>
      </Section>

      <Section title="What competitors are doing">
        <p style={{ margin: 0, fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.6 }}>
          {solution.competitorResearch}
        </p>
      </Section>

      <Section title="Proposed refresh">
        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {solution.bullets.map((b) => (
            <li key={b} style={{ fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.55 }}>
              {b}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--dark-60)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}
