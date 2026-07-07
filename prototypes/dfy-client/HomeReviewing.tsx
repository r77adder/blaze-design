import { useState } from 'react';
import { Heading, Text, Button } from '@/components';
import { Card, Avatar } from '@/staging';
import CalendarStart from '@/icons/20/CalendarStart';
import BarChartSquare from '@/icons/20/BarChartSquare';
import Target5 from '@/icons/20/Target5';
import Camera1 from '@/icons/20/Camera1';
import Mail from '@/icons/20/Mail';
import Calendar2 from '@/icons/20/Calendar2';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import { ClientShell, useGo } from './shell';
import { useClientState, type ReviewPhaseId } from './dev-state';
import { useFeedbackSubmittedModal } from './FeedbackSubmittedModal';
import {
  WORKSPACE_NAME, STRATEGIST, CONNECTIONS, ReadyRow, PhaseRow, ConnectionRow,
} from './HomeColdShared';

/**
 * HomeReviewing — the **client** Home once onboarding is nearly done: the
 * scorecard, strategy, goals, and first creative are all ready for the
 * client to review — only go-live itself is still pending. Sits between
 * HomeCold (early onboarding) and Home (live) in the cold/steady toggle.
 *
 * Shares its "Ready for you" / "What we're working on" / "Connect your
 * accounts" building blocks with HomeCold (see HomeColdShared) — only the
 * content of each section differs: everything is Ready here except go-live,
 * and accounts default to fully connected since the account is this close
 * to launch.
 */

const READY_ITEMS: { phase: ReviewPhaseId; icon: typeof Target5; title: string; blurb: string; submittedBlurb: string; path: string; cta: string; submittedCta: string }[] = [
  {
    phase: 'strategy',
    icon: Target5,
    title: 'Your Strategy',
    blurb: 'The first campaign plan, audiences, and channel mix are mapped out — review and approve it before we launch.',
    submittedBlurb: 'Thanks for reviewing — your strategist has your feedback and will follow up with the next version.',
    path: '/review-strategy',
    cta: 'Approve your strategy',
    submittedCta: 'View strategy',
  },
  {
    phase: 'goals',
    icon: CalendarStart,
    title: 'Your Goals',
    blurb: 'Your first 30/60/90-day goals, channels, and major events to plan around are ready to review.',
    submittedBlurb: 'Thanks for reviewing — your strategist has your feedback and will follow up with the next version.',
    path: '/review-goals',
    cta: 'Approve your goals',
    submittedCta: 'View goals',
  },
  {
    phase: 'creative',
    icon: Camera1,
    title: 'Your Creative',
    blurb: 'Your first wave of posts and a draft campaign calendar are ready for your sign-off on the look and voice.',
    submittedBlurb: 'Thanks for reviewing — your strategist has your feedback and will follow up with the next version.',
    path: '/review-creative',
    cta: 'Approve your creative',
    submittedCta: 'View creative',
  },
];

const CONNECTED_ON_LOAD = CONNECTIONS.map((c) => c.id);

export function HomeReviewing() {
  const go = useGo();
  const { submittedPhases } = useClientState();
  const [connected, setConnected] = useState<Set<string>>(() => new Set(CONNECTED_ON_LOAD));
  const [connectOpen, setConnectOpen] = useState(false);

  useFeedbackSubmittedModal();

  const connect = (id: string) =>
    setConnected((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  return (
    <ClientShell section="home">
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 4px 60px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* section: intro */}
        <div>
          <Heading level={2} style={{ lineHeight: 1.15, letterSpacing: '-0.4px', margin: '0 0 10px' }}>
            One step left before {WORKSPACE_NAME} goes live.
          </Heading>
          <Text variant="primary" style={{ display: 'block', lineHeight: 1.55, color: 'var(--dark-60)', maxWidth: 560 }}>
            Everything your strategist put together is ready for you to review. Once it&rsquo;s
            approved we&rsquo;ll flip the switch and your full portal opens with live results.
          </Text>
        </div>

        {/* section: ready for you — scorecard + all three review phases */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>Ready for you</Heading>
          <Card padding="none">
            <ReadyRow
              icon={BarChartSquare}
              title="Business Scorecard"
              blurb={`See how ${WORKSPACE_NAME} stacks up against local Austin flooring competitors, and where we'll focus first.`}
              action={<Button variant="secondary" size="sm" onPress={() => go('/scorecard')}>View scorecard</Button>}
              isFirst
            />
            {READY_ITEMS.map((item) => {
              const submitted = !!submittedPhases[item.phase];
              return (
                <ReadyRow
                  key={item.phase}
                  icon={item.icon}
                  title={item.title}
                  blurb={submitted ? item.submittedBlurb : item.blurb}
                  badge={submitted ? 'Submitted' : 'Ready'}
                  action={<Button variant="secondary" size="sm" onPress={() => go(item.path)}>{submitted ? item.submittedCta : item.cta}</Button>}
                />
              );
            })}
          </Card>
        </section>

        {/* section: what we're working on — only go-live left */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>What we&rsquo;re working on</Heading>
          <Card padding="none">
            <PhaseRow
              icon={CalendarStart}
              label="Go-live"
              blurb="We're connecting the last channels and will switch everything on the moment you've reviewed everything above."
              state="current"
              isFirst
            />
          </Card>
        </section>

        {/* section: connect your accounts — accordion, closed by default, all connected */}
        <section>
          <button
            type="button"
            aria-expanded={connectOpen}
            onClick={() => setConnectOpen((o) => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', marginBottom: connectOpen ? 12 : 0 }}
          >
            <Heading level={3} style={{ margin: 0, flex: 1 }}>Connect your accounts</Heading>
            <Text variant="metadata" color="var(--dark-60)">{connected.size} of {CONNECTIONS.length} connected</Text>
            <span style={{ display: 'inline-flex' }}>
              {connectOpen ? <ChevronUp size={20} color="var(--dark-60)" /> : <ChevronDown size={20} color="var(--dark-60)" />}
            </span>
          </button>
          {connectOpen && (
            <Card padding="none">
              {CONNECTIONS.map((c, i) => (
                <ConnectionRow
                  key={c.id}
                  connection={c}
                  connected={connected.has(c.id)}
                  onConnect={() => connect(c.id)}
                  isFirst={i === 0}
                />
              ))}
            </Card>
          )}
        </section>

        {/* section: strategist */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>{STRATEGIST.title}</Heading>
          <Card padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar fallback={STRATEGIST.initials} size="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Heading level={5} style={{ margin: 0 }}>{STRATEGIST.name}</Heading>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Button variant="secondary" size="sm" frontIcon={Calendar2}>Book a call</Button>
                <Button variant="secondary" size="sm" frontIcon={Mail}>Message</Button>
              </div>
            </div>
          </Card>
          <Text
            variant="secondary"
            color="var(--dark-60)"
            style={{ display: 'block', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}
          >
            You&rsquo;ll get full access — results, approvals, your calendar — the moment you go live.
          </Text>
        </section>
      </div>
    </ClientShell>
  );
}
