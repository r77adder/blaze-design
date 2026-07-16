import { Heading, Text, Button } from '@/components';
import { Card, Avatar } from '@/staging';
import CalendarStart from '@/icons/20/CalendarStart';
import Target5 from '@/icons/20/Target5';
import Mail from '@/icons/20/Mail';
import Calendar2 from '@/icons/20/Calendar2';
import { ClientShell } from './shell';
import { WORKSPACE_NAME, STRATEGIST, ReadyRow, PhaseRow } from './HomeColdShared';
import { AccessChecklist } from './growth-review/StepIntegrations';
import { useReviewFlow } from './ReviewFlow';

/**
 * HomeCold — the **client** pre-go-live Home, shown right after the account
 * starts onboarding. Everything the strategist prepared is bundled into one
 * Growth Engine Review the client opens from here; approving it (or requesting
 * changes) flips the portal to its `reviewed` / `mixed` state. View-only
 * otherwise — connect accounts, see what's next, reach the strategist.
 */

export function HomeCold() {
  const review = useReviewFlow();

  return (
    <ClientShell section="home">
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 4px 60px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* section: intro */}
        <div>
          <Heading level={2} style={{ lineHeight: 1.15, letterSpacing: '-0.4px', margin: '0 0 10px' }}>
            We&rsquo;re getting {WORKSPACE_NAME} live.
          </Heading>
          <Text variant="primary" style={{ display: 'block', lineHeight: 1.55, color: 'var(--dark-90)', maxWidth: 560 }}>
            Your Blaze strategist has your first plan ready. Walk through it, approve what looks
            right, and flag anything you&rsquo;d change, then we&rsquo;ll get you live.
          </Text>
        </div>

        {/* section: the Growth Engine Review — the single thing to do */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>Ready for you</Heading>
          <Card padding="none">
            <ReadyRow
              icon={Target5}
              title="Growth Engine Review"
              blurb="Your competitive scorecard, growth strategy, new website, first paid campaigns, and organic content — all in one place for your sign-off before we launch."
              action={<Button size="md" onPress={review.launch}>Review</Button>}
              isFirst
            />
          </Card>
        </section>

        {/* section: connect your accounts — same component as the review's last step */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>Connect your accounts</Heading>
          <AccessChecklist />
        </section>

        {/* section: go-live */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>What we&rsquo;re working on</Heading>
          <Card padding="none">
            <PhaseRow
              icon={CalendarStart}
              label="Go-live"
              blurb="We connect the last channels and switch everything on the moment you&rsquo;ve reviewed your Growth Engine — your full portal opens with live results."
              state="current"
              isFirst
            />
          </Card>
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
                <Button variant="secondary" size="sm" frontIcon={Mail}>Email</Button>
              </div>
            </div>
          </Card>
          <Text
            variant="secondary"
            color="var(--dark-60)"
            style={{ display: 'block', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}
          >
            You&rsquo;ll get full access to results, approvals, and your calendar the moment you go live.
          </Text>
        </section>
      </div>
      {review.overlay}
    </ClientShell>
  );
}
