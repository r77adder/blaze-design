import { type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heading, Text } from '@/components';
import { Card, StatusPill } from '@/staging';
import type { StatusPillTone } from '@/staging';
import Cursor04 from '@/icons/20/Cursor04';
import Globe from '@/icons/20/Globe';
import Map02 from '@/icons/20/Map02';
import Calendar1 from '@/icons/20/Calendar1';
import Star from '@/icons/20/Star';
import MessageChat01 from '@/icons/20/MessageChat01';
import { useOnboarding } from '../onboarding-context';
import { useDevState } from '../../dev-state-context';
import { FlowBody, FlowFooter, FlowHeader } from '../../cold-flows/cold-flow-shell';
import { CreativeStep, GoalsStep, SwipeStep } from '../../cold-flows/StrategyFlow';
import { FeedbackSummary } from '../../cold-flows/CreativeReviewFlow';

/**
 * V1-only onboarding steps. In V1 we fold the Strategy onboarding + Creative
 * review flows into the onboarding wizard itself (V2 keeps them in the cold
 * state). Each wraps a step body shared 1:1 with the cold-state flows in the
 * onboarding's chrome + a Back/Continue footer driven by the onboarding
 * context — so the content is identical across both placements.
 *
 * Brand context isn't a step here — it's folded into the Basics step. The
 * competitive audit isn't either — the Scorecard step covers it.
 */

export function OnbCreativeGuidelines() {
  const { next, back } = useOnboarding();
  return (
    <>
      <CreativeStep />
      <FlowFooter onBack={back} onNext={next} />
    </>
  );
}

export function OnbSwipe() {
  const { next, back } = useOnboarding();
  return (
    <FlowBody>
      <FlowHeader title="What's working in your market" subtitle="React so we learn what to chase — most of these are paid ads from local competitors." />
      <SwipeStep />
      <FlowFooter onBack={back} onNext={next} />
    </FlowBody>
  );
}

export function OnbGoals() {
  const { next, back } = useOnboarding();
  return (
    <FlowBody>
      <FlowHeader title="Marketing goals" subtitle="Set your targets, channels, and what's worked so far." />
      <GoalsStep />
      <FlowFooter onBack={back} onNext={next} nextLabel="See the plan" />
    </FlowBody>
  );
}

// ─── Plan ("here's how we'll grow your business") ────────────────────────────
// Informational summary of the engagement, shown right after Marketing goals.
// Each line is what Blaze runs + a pill flagging where the user's sign-off is
// needed vs. what we fully manage.

type PlanItem = {
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  desc: string;
  tone: StatusPillTone;
  tag: string;
};

const PLAN: PlanItem[] = [
  {
    icon: Cursor04,
    title: 'Paid ads on Meta & Google',
    desc: 'We build, launch, and continuously optimize paid campaigns to put you in front of high-intent buyers — just confirm the creative and budget before we go live.',
    tone: 'info',
    tag: 'Your input',
  },
  {
    icon: Globe,
    title: 'SEO & AEO content',
    desc: 'We publish content tuned to rank on Google and to get you cited in AI answers like ChatGPT and Perplexity.',
    tone: 'neutral',
    tag: 'Fully managed',
  },
  {
    icon: Map02,
    title: 'Local presence & Google Business Profile',
    desc: "We sharpen your Google Business Profile and local SEO so you surface in the map pack — we'll flag the gaps for you to review.",
    tone: 'info',
    tag: 'Your input',
  },
  {
    icon: Calendar1,
    title: 'A year of organic social',
    desc: 'We map a 12-month calendar of campaigns and posts to build your social presence — everything waits for your approval before it goes out.',
    tone: 'info',
    tag: 'Your input',
  },
  {
    icon: Star,
    title: 'Reviews & reputation',
    desc: 'We monitor reviews across the sites that matter and surface the ones worth a response, so you reply where it counts.',
    tone: 'info',
    tag: 'Your input',
  },
  {
    icon: MessageChat01,
    title: 'AI receptionist',
    desc: 'We answer missed calls and texts automatically, capturing every lead so none slips through the cracks.',
    tone: 'neutral',
    tag: 'Fully managed',
  },
];

export function OnbPlan() {
  const { next, back } = useOnboarding();
  return (
    <FlowBody maxWidth={720}>
      <FlowHeader
        title="Here's how we'll grow your business"
        subtitle="Your always-on marketing team across paid, search, social, and reputation. We run it end-to-end — and pull you in only where your call matters."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PLAN.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'var(--dark-4)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color="var(--dark-90)" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500, fontSize: 16 }}>
                      {p.title}
                    </Text>
                    <span style={{ flexShrink: 0 }}>
                      <StatusPill tone={p.tone}>{p.tag}</StatusPill>
                    </span>
                  </div>
                  <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 6, lineHeight: 1.45 }}>
                    {p.desc}
                  </Text>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <FlowFooter onBack={back} onNext={next} nextLabel="See the creative" />
    </FlowBody>
  );
}

export function OnbStoryboard() {
  const { back, finish } = useOnboarding();
  const { setState: setDevState } = useDevState();
  const navigate = useNavigate();
  // Generating the real first wave takes a while, so we kick it off in the
  // background and send the user into their workspace instead of making them
  // wait — they'll get an email when it's ready.
  const setupWorkspace = () => {
    setDevState('/h2', 'cold');
    finish();
    // ?creative=ready tells the cold Home to pop the "creative is ready"
    // announcement a beat after the workspace loads.
    navigate('/h2?creative=ready');
  };
  return (
    <FlowBody>
      <GeneratingCreative />
      <FlowFooter onBack={back} onNext={setupWorkspace} nextLabel="Set up your workspace while you wait" />
    </FlowBody>
  );
}

const GEN_TILES = ['4 / 5', '9 / 16', '4 / 5', '9 / 16', '4 / 5', '9 / 16', '4 / 5'];

function GeneratingCreative() {
  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ maxWidth: 470, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'var(--dark-4)', color: 'var(--dark-80)', fontSize: 14, fontWeight: 500, marginBottom: 24 }}>
          <GenSpinner />
          Generating
        </span>
        <Heading level={2} style={{ fontSize: 28, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 12 }}>
          Your first wave of creative is on the way
        </Heading>
        <Text variant="primary" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, lineHeight: 1.55, marginBottom: 8 }}>
          Great creative takes a few minutes to generate. We'll email you at{' '}
          <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>john@certapro-austin.com</strong> the moment your ads, posts, and videos are ready to review — no need to wait around.
        </Text>
      </div>
      {/* Full-bleed strip of large generating tiles that runs off both edges. */}
      <div style={{ marginTop: 44, position: 'relative', left: '50%', transform: 'translateX(-50%)', width: '100vw', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center' }}>
          {GEN_TILES.map((ar, i) => (
            <div
              key={i}
              style={{ flexShrink: 0, height: 'min(46vh, 440px)', aspectRatio: ar, borderRadius: 16, background: 'var(--dark-4)', border: '1px solid var(--dark-8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <GenSpinner size={28} color="var(--dark-40)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenSpinner({ size = 16, color = 'var(--dark-90)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" stroke="var(--dark-8)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke={color} strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export function OnbCreativeFeedback() {
  const { next, back } = useOnboarding();
  return (
    <FlowBody>
      <FlowHeader title="What we learned" subtitle="Synthesized from your feedback — saved to your Brand Kit." />
      <FeedbackSummary />
      <FlowFooter onBack={back} onNext={next} />
    </FlowBody>
  );
}
