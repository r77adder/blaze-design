import { useState } from 'react';
import { Heading, Text, Button } from '@/components';
import { Card, Avatar, Callout } from '@/staging';
import CalendarStart from '@/icons/20/CalendarStart';
import BarChartSquare from '@/icons/20/BarChartSquare';
import Target5 from '@/icons/20/Target5';
import Camera1 from '@/icons/20/Camera1';
import Mail from '@/icons/20/Mail';
import Calendar2 from '@/icons/20/Calendar2';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import { ClientShell, useGo } from './shell';
import { useFeedbackSubmittedModal } from './FeedbackSubmittedModal';
import {
  WORKSPACE_NAME, STRATEGIST, CONNECTIONS, ReadyRow, PhaseRow, ConnectionRow,
} from './HomeColdShared';

/**
 * HomeMixed — the **client** Home once the client has actually started
 * reviewing: every item sits at a different stage instead of all showing
 * "Ready" at once. Demonstrates the full review-cycle vocabulary in one
 * screen — approved, awaiting the strategist's reply, and the strategist
 * sending something back with addressed feedback (with the note visible
 * right on the card) — alongside one untouched item.
 *
 * Fixed, scripted content (not wired to the live ReviewProvider, which
 * resets on every visit) — this is a Home-only presentation variant, same
 * as HomeCold/HomeReviewing.
 */

const CONNECTED_ON_LOAD = CONNECTIONS.map((c) => c.id);

export function HomeMixed() {
  const go = useGo();
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
            Your strategist has updates for you.
          </Heading>
          <Text variant="primary" style={{ display: 'block', lineHeight: 1.55, color: 'var(--dark-60)', maxWidth: 560 }}>
            A few things are moving — see what&rsquo;s been approved, what&rsquo;s changed based on
            your feedback, and what&rsquo;s still waiting on a reply.
          </Text>
        </div>

        {/* section: ready for you — each item at a different review stage */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>Ready for you</Heading>
          <Card padding="none">
            <ReadyRow
              icon={BarChartSquare}
              title="Business Scorecard"
              badge="Approved"
              blurb="You approved this scorecard. Your strategist will check back in as new competitor data comes in."
              action={<Button variant="secondary" size="sm" onPress={() => go('/scorecard')}>View scorecard</Button>}
              isFirst
            />
            <ReadyRow
              icon={Target5}
              title="Your Strategy"
              badge="Updated"
              badgeTone="info"
              blurb="The first campaign plan, audiences, and channel mix are mapped out."
              extra={(
                <Callout tone="info" title="Dana updated your strategy">
                  &ldquo;I swapped the hero photo on the LVP Fall Promo brief and tightened the call-to-action per your note — take a look when you get a chance.&rdquo;
                </Callout>
              )}
              action={<Button variant="secondary" size="sm" onPress={() => go('/review-strategy')}>Review update</Button>}
            />
            <ReadyRow
              icon={CalendarStart}
              title="Your Goals"
              badge="Changes requested"
              badgeTone="warning"
              blurb="You asked for changes — your strategist is revising and will follow up soon."
              action={<Button variant="secondary" size="sm" onPress={() => go('/review-goals')}>View goals</Button>}
            />
            <ReadyRow
              icon={Camera1}
              title="Your Creative"
              blurb="Your first wave of posts and a draft campaign calendar are ready for your sign-off on the look and voice."
              action={<Button variant="secondary" size="sm" onPress={() => go('/review-creative')}>Approve your creative</Button>}
            />
          </Card>
        </section>

        {/* section: what we're working on */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>What we&rsquo;re working on</Heading>
          <Card padding="none">
            <PhaseRow
              icon={CalendarStart}
              label="Go-live"
              blurb="We're connecting the last channels and will switch everything on once everything above is approved."
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
