import { useState, type ComponentType } from 'react';
import { Button, Heading, Text } from '@/components';
import { useToast, StatusPill } from '@/staging';
import Globe from '@/icons/20/Globe';
import Star from '@/icons/20/Star';
import Cursor04 from '@/icons/20/Cursor04';
import Marker03 from '@/icons/20/Marker03';
import Google from '@/icons/20/Google';
import Insights from '@/icons/20/BarChartSquare';
import Check2 from '@/icons/20/Check2';
import ArrowRight from '@/icons/20/ArrowRight';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import Lock3 from '@/icons/20/Lock3';
import type { Account } from './lib/types';
import { useReview, reviewSections, REVIEW_STEP_SECTIONS, stepReviewCounts, type Phase } from './lib/review';
import { useDfyState } from './lib/dev-state';
import { isScorecardPublished } from './Scorecard';

/**
 * HomeCold — the AM-facing "set the account up" surface shown when the
 * workspace is in its cold state. Surfaces everything that needs doing before
 * the account is live: the three onboarding flows (Competitive scorecard +
 * Strategy onboarding + Creative Review — moved here out of the sidebar) as the
 * first steps, then the account connections and feature activations. Onboarding
 * steps mark complete off the real flow state (useReview / scorecard publish);
 * connections/activations are mocked locally.
 *
 * Mirrors the H2 cold Home energy — warm gradient hero, sticky progress chip,
 * uniform rows that flip to a green "done" state — but reframed for an account
 * manager getting a client workspace online.
 */

interface Activation {
  id: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  blurb: string;
  cta: string;
  /** Friendly confirmation once flipped on. */
  toast: string;
}

const ACTIVATIONS: Activation[] = [
  { id: 'meta', icon: Cursor04, title: 'Connect Meta', blurb: 'Link the Facebook & Instagram accounts so organic posts and paid social can publish.', cta: 'Connect', toast: 'Meta connected — Facebook & Instagram are ready to publish.' },
  { id: 'gbp', icon: Marker03, title: 'Connect Google Business Profile', blurb: 'Sync the listing for local posts, review replies, and map ranking.', cta: 'Connect', toast: 'Google Business Profile connected — local posting is on.' },
  { id: 'gads', icon: Google, title: 'Connect Google Ads', blurb: 'Authorize the ad account so paid search can run and optimize.', cta: 'Connect', toast: 'Google Ads connected — paid search is ready.' },
  { id: 'site', icon: Globe, title: 'Connect website & analytics', blurb: 'Add the site and GA4 so we can track conversions and ship landing pages.', cta: 'Connect', toast: 'Website & analytics connected — conversions are tracked.' },
  { id: 'reputation', icon: Star, title: 'Turn on Reputation', blurb: 'Start monitoring reviews across Google, Yelp, and Facebook.', cta: 'Turn on', toast: 'Reputation is on — we are watching every review surface.' },
  { id: 'seo', icon: Insights, title: 'Turn on SEO/AEO', blurb: 'Track local rankings and draft content for Google and answer engines.', cta: 'Turn on', toast: 'SEO/AEO is on — rankings tracked and topic clusters queued.' },
];

export function HomeCold({ account, onOpenSection }: { account: Account; onOpenSection?: (section: string) => void }) {
  const { showToast } = useToast();
  const { strategyComplete, goalsComplete, creativeComplete, packet, feedback } = useReview();
  const { setState } = useDfyState();
  const [connected, setConnected] = useState<Set<string>>(() => new Set());
  const scorecardComplete = isScorecardPublished(account.id);

  // Once the client has reviewed a phase and submitted changes/edits, the step
  // flips from "Completed" to a "needs review" state that opens the summary.
  const reviewOf = (phase: Phase): { changes: number; edited: number } | undefined => {
    if (packet(phase) !== 'submitted') return undefined;
    const fb = feedback(phase);
    const secs = reviewSections(phase);
    const changes = secs.filter((s) => fb[s.id]?.status === 'changes').length;
    const edited = secs.filter((s) => { const e = fb[s.id]?.edits; return e && Object.values(e).some((v) => v != null); }).length;
    return changes || edited ? { changes, edited } : undefined;
  };
  const stratReview = reviewOf('strategy');
  const goalsReview = reviewOf('goals');
  const creativeReview = reviewOf('creative');

  // Opening a review lands on the first step (if the phase is stepped) that has
  // a change/edit, so the AM starts right where the feedback is. Phases without
  // steps (goals) just open the page.
  const openReview = (phase: Phase) => {
    const map = REVIEW_STEP_SECTIONS[phase];
    const fb = feedback(phase);
    const step = map && Object.keys(map).find((k) => { const c = stepReviewCounts(fb, phase, k); return c.changes + c.edited > 0; });
    onOpenSection?.(step ? `${phase}/${step}` : phase);
  };

  const total = 4 + ACTIVATIONS.length;
  const doneCount = (scorecardComplete ? 1 : 0) + (strategyComplete ? 1 : 0) + (goalsComplete ? 1 : 0) + (creativeComplete ? 1 : 0) + connected.size;
  const allDone = doneCount === total;

  const connect = (a: Activation) => {
    setConnected((prev) => {
      if (prev.has(a.id)) return prev;
      const next = new Set(prev);
      next.add(a.id);
      return next;
    });
    showToast({ message: a.toast });
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 4px 60px' }}>
      {/* hero — no wrapper / eyebrow, just the headline + intro */}
      <div style={{ marginBottom: 28 }}>
        <Heading level={2} style={{ lineHeight: 1.15, letterSpacing: '-0.6px', marginBottom: 10, fontSize: 30 }}>Let's get {account.name} live.</Heading>
        <Text variant="primary" style={{ display: 'block', lineHeight: 1.5, color: 'var(--dark-60)', fontSize: 16, maxWidth: 560 }}>
          Finish the four onboarding steps, then connect the client's accounts and switch on the features in their plan. Everything they'll run on starts here.
        </Text>
      </div>

      {allDone ? (
        <AllDoneBanner onCta={() => setState('steady')} />
      ) : (
        <>
          {/* onboarding steps */}
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
            <StepRow
              n={1}
              title="Competitive scorecard"
              blurb="Scan the client's online presence against local competitors, then publish the scorecard to their portal."
              done={scorecardComplete}
              onStart={() => onOpenSection?.('scorecard')}
              isFirst
            />
            <StepRow
              n={2}
              title="Strategy onboarding"
              blurb={stratReview ? `${account.poc.name} requested changes and made edits — open to review them.` : 'Capture brand context and creative guidelines, then send them to the client for review.'}
              done={strategyComplete}
              review={stratReview}
              onStart={() => openReview('strategy')}
            />
            <StepRow
              n={3}
              title="Goals & theme"
              blurb={goalsReview ? `${account.poc.name} requested changes and made edits — open to review them.` : 'Set goals, channels, and the first campaign theme, then send it to the client for review.'}
              done={goalsComplete}
              review={goalsReview}
              locked={!strategyComplete}
              lockedHint="Finish Strategy onboarding first"
              onStart={() => openReview('goals')}
            />
            <StepRow
              n={4}
              title="Creative Review"
              blurb={creativeReview ? `${account.poc.name} requested changes and made edits — open to review them.` : 'Generate the first wave of creative, mark what to send the client, and set the campaign cadence.'}
              done={creativeComplete}
              review={creativeReview}
              locked={!goalsComplete}
              lockedHint="Finish the Goals & theme step first"
              onStart={() => openReview('creative')}
            />
          </div>

          {/* connections / activations */}
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
            {ACTIVATIONS.map((a, i) => (
              <ActivationRow key={a.id} activation={a} done={connected.has(a.id)} onConnect={() => connect(a)} isFirst={i === 0} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** A numbered onboarding step — navigates into its flow, flips to done when the
 *  flow reports complete. Can be locked behind the previous step. When the
 *  client has reviewed and sent back changes/edits, `review` flips it to a
 *  "needs review" state that opens the change summary. */
function StepRow({ n, title, blurb, done, locked, lockedHint, onStart, isFirst, review }: {
  n: number;
  title: string;
  blurb: string;
  done: boolean;
  locked?: boolean;
  lockedHint?: string;
  onStart: () => void;
  isFirst?: boolean;
  review?: { changes: number; edited: number };
}) {
  // The whole row is clickable when unlocked — starts the flow (or re-runs it
  // once complete). Locked steps stay inert.
  const clickable = !locked;
  const reviewLabel = review ? [review.changes ? `${review.changes} change${review.changes === 1 ? '' : 's'}` : '', review.edited ? `${review.edited} edit${review.edited === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ') : '';
  const rowBg = review ? 'color-mix(in srgb, var(--status-review) 8%, transparent)' : done ? 'rgba(4, 175, 0, 0.04)' : 'transparent';
  return (
    <div
      onClick={clickable ? onStart : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStart(); } } : undefined}
      title={clickable ? (review ? `Review changes for ${title}` : `${done ? 'Redo' : 'Start'} ${title}`) : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderTop: isFirst ? 'none' : '1px solid var(--dark-4)', background: rowBg, opacity: locked && !done ? 0.6 : 1, cursor: clickable ? 'pointer' : 'default', transition: 'background 260ms ease' }}
    >
      <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 99, flexShrink: 0, fontSize: 14, fontWeight: 600, background: review ? 'color-mix(in srgb, var(--status-review) 18%, transparent)' : done ? 'rgba(4, 175, 0, 0.12)' : 'var(--dark-90)', color: review ? 'var(--status-review)' : done ? '#04af00' : 'var(--light-100)' }}>
        {done && !review ? <Check2 size={16} color="#04af00" /> : n}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heading level={5} style={{ margin: 0 }}>{title}</Heading>
          {done && !review && <Button variant="ghost" size="xs" frontIcon={ArrowRefresh} onPress={onStart}>Redo</Button>}
        </div>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 3, lineHeight: 1.45 }}>{blurb}</Text>
      </div>
      {review ? (
        <Button variant="secondary" size="sm" onPress={onStart} endIcon={ArrowRight}>Review {reviewLabel}</Button>
      ) : done ? (
        <StatusPill tone="success">Completed</StatusPill>
      ) : locked ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--dark-40)', fontSize: 13, flexShrink: 0 }} title={lockedHint}>
          <Lock3 size={16} color="var(--dark-40)" />
          Locked
        </span>
      ) : (
        <Button variant="secondary" size="sm" onPress={onStart} endIcon={ArrowRight}>Start</Button>
      )}
    </div>
  );
}

/** An account connection / feature activation — mocked: flips to "on" locally. */
function ActivationRow({ activation, done, onConnect, isFirst }: {
  activation: Activation;
  done: boolean;
  onConnect: () => void;
  isFirst: boolean;
}) {
  const Icon = activation.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderTop: isFirst ? 'none' : '1px solid var(--dark-4)', background: done ? 'rgba(4, 175, 0, 0.04)' : 'transparent', transition: 'background 260ms ease' }}>
      <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: 'var(--dark-2)', color: 'var(--dark-90)' }}>
        <Icon size={20} color="var(--dark-90)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Heading level={5} style={{ margin: 0 }}>{activation.title}</Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 3, lineHeight: 1.45 }}>{activation.blurb}</Text>
      </div>
      {done ? (
        <StatusPill tone="success">Connected</StatusPill>
      ) : (
        <Button variant="secondary" size="sm" onPress={onConnect}>{activation.cta}</Button>
      )}
    </div>
  );
}

function AllDoneBanner({ onCta }: { onCta: () => void }) {
  return (
    <div style={{ padding: '36px 28px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(252, 183, 40, 0.10) 0%, rgba(124, 92, 252, 0.08) 100%)', border: '1px solid rgba(252, 183, 40, 0.30)' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: 'rgba(4, 175, 0, 0.12)', marginBottom: 16 }}>
        <Check2 size={20} color="#04af00" />
      </div>
      <Heading level={3} style={{ lineHeight: 1.2, letterSpacing: '-0.3px', marginBottom: 8 }}>The account is set up.</Heading>
      <Text variant="primary" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 15, lineHeight: 1.5, marginBottom: 20, maxWidth: 480 }}>
        Onboarding is done and every account is connected. Switch to the live workspace to start running the account.
      </Text>
      <Button variant="primary" size="md" onPress={onCta} endIcon={ArrowRight}>See the live workspace</Button>
    </div>
  );
}
