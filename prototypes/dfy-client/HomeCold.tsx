import { useState } from 'react';
import { Heading, Text, Button } from '@/components';
import { Card, Avatar } from '@/staging';
import Camera1 from '@/icons/20/Camera1';
import CalendarStart from '@/icons/20/CalendarStart';
import BarChartSquare from '@/icons/20/BarChartSquare';
import Target5 from '@/icons/20/Target5';
import Mail from '@/icons/20/Mail';
import Calendar2 from '@/icons/20/Calendar2';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import { ClientShell, useGo } from './shell';
import { useClientState } from './dev-state';
import { useFeedbackSubmittedModal } from './FeedbackSubmittedModal';
import {
  WORKSPACE_NAME, STRATEGIST, CONNECTIONS, ReadyRow, PhaseRow, ConnectionRow, type PhaseState,
} from './HomeColdShared';

/**
 * HomeCold — the **client** pre-go-live Home, shown right after the account
 * starts onboarding with their Blaze strategist. The heavy operating work is
 * AM-side in blaze-dfy; this is the calm, reassuring window the client sees.
 * View-only. See HomeReviewing for the later "everything but go-live is
 * ready" variant.
 *
 * Two jobs: surface what's already READY for the client to act on (scorecard,
 * strategy), and show what the strategist is still WORKING ON (onboarding
 * phases). Account connections live in a collapsed accordion. Deliberately
 * neutral — white surfaces, --dark-8 borders, color reserved for the
 * strategist Avatar and a success pill where something is ready/connected.
 */

const PHASES: { key: string; icon: typeof Target5; label: string; blurb: string; state: PhaseState }[] = [
  { key: 'goals', icon: Target5, label: 'Goals & themes', blurb: 'We’re mapping your campaign goals and the content themes we’ll run them through.', state: 'current' },
  { key: 'creative', icon: Camera1, label: 'Creative — your first content', blurb: 'We’re generating your first wave of posts and ads for your sign-off on the look and voice.', state: 'current' },
  { key: 'golive', icon: CalendarStart, label: 'Go-live', blurb: 'We connect the last channels and switch everything on — your full portal opens with live results.', state: 'upcoming' },
];

const CONNECTED_ON_LOAD = ['meta', 'gbp'];

export function HomeCold() {
  const go = useGo();
  const { submittedPhases } = useClientState();
  const strategySubmitted = !!submittedPhases.strategy;
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
            We&rsquo;re getting {WORKSPACE_NAME} live.
          </Heading>
          <Text variant="primary" style={{ display: 'block', lineHeight: 1.55, color: 'var(--dark-60)', maxWidth: 560 }}>
            Your Blaze strategist is setting everything up. Here&rsquo;s what&rsquo;s ready for you to
            review now, and what we&rsquo;re working on next.
          </Text>
        </div>

        {/* section: ready for you — one card, rows (matches the sections below) */}
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
            <ReadyRow
              icon={Target5}
              title="Your Strategy"
              blurb={strategySubmitted
                ? 'Thanks for reviewing — your strategist has your feedback and will follow up with the next version.'
                : 'The first campaign plan, audiences, and channel mix are mapped out — review and approve it before we launch.'}
              badge={strategySubmitted ? 'Submitted' : 'Ready'}
              action={<Button variant="secondary" size="sm" onPress={() => go('/review-strategy')}>{strategySubmitted ? 'View strategy' : 'Approve your strategy'}</Button>}
            />
          </Card>
        </section>

        {/* section: what we're working on */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>What we&rsquo;re working on</Heading>
          <Card padding="none">
            {PHASES.map((p, i) => (
              <PhaseRow key={p.key} icon={p.icon} label={p.label} blurb={p.blurb} state={p.state} isFirst={i === 0} />
            ))}
          </Card>
        </section>

        {/* section: connect your accounts — accordion, closed by default */}
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
