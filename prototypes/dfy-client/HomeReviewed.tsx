import { Heading, Text, Button } from '@/components';
import { Card, Avatar } from '@/staging';
import CalendarStart from '@/icons/20/CalendarStart';
import Target5 from '@/icons/20/Target5';
import Mail from '@/icons/20/Mail';
import Calendar2 from '@/icons/20/Calendar2';
import { ClientShell } from './shell';
import { WORKSPACE_NAME, STRATEGIST, ReadyRow, PhaseRow } from './HomeColdShared';
import { ConnectAccountsSection } from './ConnectAccounts';
import { HOME_CONNECT_INTEGRATIONS } from './growth-review/data';
import { APPROVED_SEED } from './growth-review/seed';
import { useReviewFlow } from './ReviewFlow';

/**
 * HomeReviewed — the **client** Home once they've approved the whole Growth
 * Engine Review. The completed look: the review shows as done, accounts are
 * connected, and go-live is the only thing left. Reopening the review ("View")
 * shows every step marked as approved.
 */

const ALL_CONNECTED = HOME_CONNECT_INTEGRATIONS.map((c) => c.id);

export function HomeReviewed() {
  const review = useReviewFlow(APPROVED_SEED);

  return (
    <ClientShell section="home">
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 4px 60px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* section: intro */}
        <div>
          <Heading level={2} style={{ lineHeight: 1.15, letterSpacing: '-0.4px', margin: '0 0 10px' }}>
            One step left before {WORKSPACE_NAME} goes live.
          </Heading>
          <Text variant="secondary" style={{ display: 'block', lineHeight: 1.55, color: 'var(--dark-60)', maxWidth: 560 }}>
            You&rsquo;ve approved your Growth Engine. Your strategist is connecting the last channels,
            then we&rsquo;ll flip the switch and your full portal opens with live results.
          </Text>
        </div>

        {/* section: reviewed */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>Approved</Heading>
          <Card padding="none">
            <ReadyRow
              icon={Target5}
              title="Growth Engine Review"
              badge="Reviewed"
              blurb="Thanks! You approved your scorecard, strategy, website, and first creative. Your strategist has the green light to launch."
              action={<Button variant="secondary" size="sm" onPress={review.launch}>View</Button>}
              isFirst
            />
          </Card>
        </section>

        {/* section: connect your accounts — all connected */}
        <ConnectAccountsSection defaultConnectedIds={ALL_CONNECTED} />

        {/* section: go-live */}
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>What we&rsquo;re working on</Heading>
          <Card padding="none">
            <PhaseRow
              icon={CalendarStart}
              label="Go-live"
              blurb="We&rsquo;re connecting the last channels and will switch everything on shortly. Nothing more needed from you."
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
