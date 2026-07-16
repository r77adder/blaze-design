import { useState } from 'react';
import { Heading, Text, Button, ModalStack } from '@/components';
import { ToasterProvider, Toaster, StatusPill, useToast } from '@/staging';
import Check2 from '@/icons/20/Check2';
import ArrowRight from '@/icons/20/ArrowRight';
import {
  AM_NAME,
  CLIENT_NAME,
  ARTICLES,
  PAID_GROUPS,
  STRATEGY_PILLARS,
} from './data';
import { GradientHeadline, RequestChangesAction } from './ui';
import { STEPS, StepFooter, WizardFrame, WizardProvider, useWizard, type StepId, type Decision, type ReviewMode } from './wizard';
import { StepScorecard } from './StepScorecard';
import { StepStrategy } from './StepStrategy';
import { StepWebsite } from './StepWebsite';
import { StepArticles, StepPaidAds } from './StepCreative';
import { StepIntegrations } from './StepIntegrations';
import { AmScorecard, AmWebsite, AmPaidAds, AmArticles, AmStrategy } from './am-steps';

/**
 * Growth Engine Review: an onboarding-style, step-by-step review flow for a
 * DFY client (Grain Design Flooring). Opens on an overview of all six steps;
 * composes designs proven in the dfy-client portal + blaze-dfy AM approvals.
 *
 * Embedded into the dfy-client COLD home as a full-screen overlay: `onExit`
 * backs out to the portal, `onComplete` reports the review outcome so the
 * portal can flip to its Reviewed / changes-requested state.
 */

/** What the client did across the whole flow, reported to the host on submit.
 *  Includes the raw decision/connection maps so the host can persist them and
 *  reopen the review with every step marked as it was left. */
export interface ReviewOutcome {
  approved: boolean;
  changes: number;
  notes: string[];
  decisions: Record<string, Decision>;
  connections: Record<string, boolean>;
}

function summarize(decisions: Record<string, Decision>, connections: Record<string, boolean>): ReviewOutcome {
  const all = Object.values(decisions);
  const changed = all.filter((d) => d.status === 'changes');
  return {
    approved: changed.length === 0,
    changes: changed.length,
    notes: changed.map((d) => d.note ?? '').filter(Boolean),
    decisions,
    connections,
  };
}

/** The client's returned verdicts, seeded when an AM reopens a review that has
 *  already been sent back with changes (the blaze-dfy `reviewed` state). Each
 *  key matches the section that surfaces it in the AM steps. */
export const AM_CLIENT_FEEDBACK: Record<string, Decision> = {
  'step:website': { status: 'changes', note: 'Can we make the headline warmer? "ready!" feels generic. And use the white-oak living room shot as the hero, not the close-up.' },
  'strategy:discovery': { status: 'changes', note: 'Can we start the paid budget lower, around $2,000/mo, and scale up once we see leads coming in?' },
  'seo:lvp-vs-hardwood': { status: 'changes', note: 'Keep the LVP vs hardwood piece neutral, we install and sell both, so it should not lean against LVP.' },
  'paid:sitelinks': { status: 'changes', note: 'On Financing Options, drop the "0% for 12 months" line, we cannot guarantee that rate right now, and point it at the general financing page. The rest look great.' },
};

export function GrowthEngineReviewFlow({ mode = 'client', reviewed = false, onComplete, onExit, initialDecisions, initialConnections }: {
  /** 'client' reviews/approves; 'am' lets the strategist build/edit it. */
  mode?: ReviewMode;
  /** AM reopening a review the client already returned with changes. */
  reviewed?: boolean;
  onComplete?: (outcome: ReviewOutcome) => void;
  onExit?: () => void;
  initialDecisions?: Record<string, Decision>;
  initialConnections?: Record<string, boolean>;
}) {
  const seededDecisions = initialDecisions ?? (mode === 'am' && reviewed ? AM_CLIENT_FEEDBACK : undefined);
  return (
    <ToasterProvider>
      <WizardProvider mode={mode} reviewed={mode === 'am' && reviewed} initialDecisions={seededDecisions} initialConnections={initialConnections}>
        <ModalStack>
          <Flow onComplete={onComplete} onExit={onExit} />
        </ModalStack>
        <Toaster />
      </WizardProvider>
    </ToasterProvider>
  );
}

const PAID_ITEM_IDS = [...PAID_GROUPS.flatMap((g) => g.items.map((i) => i.id)), 'paid:search-ads'];
const ARTICLE_ITEM_IDS = ARTICLES.map((i) => i.id);
const STRATEGY_KEYS = STRATEGY_PILLARS.map((p) => `strategy:${p.id}`);

// One-line blurb per step for the overview cards.
const STEP_BLURBS: Record<StepId, string> = {
  scorecard: 'Where you stand today vs. 4 local competitors, scored from public signals.',
  strategy: 'The plan to fix visibility and press your reputation + website edge.',
  website: 'Your rebuilt site, wired around a single call to action.',
  paid: 'Google Search text ads and Local Services Ads on your highest-intent terms.',
  articles: 'Buyer-education articles built to win Google and AI search.',
  integrations: 'The access we\'ll need to run your campaigns, bookings, and reporting.',
};

// ─── Per-step status (overview pill) ─────────────────────────────────────────

type StepStatus = { label: string; tone: 'success' | 'warning' | 'neutral' };

function overviewStatus(id: StepId, decisions: Record<string, Decision>): StepStatus {
  if (id === 'scorecard' || id === 'website') {
    const d = decisions[`step:${id}`];
    if (d?.status === 'approved') return { label: 'Approved', tone: 'success' };
    if (d?.status === 'changes') return { label: 'Changes requested', tone: 'warning' };
    return { label: 'Not Started', tone: 'neutral' };
  }
  if (id === 'integrations') return { label: 'Not Started', tone: 'neutral' };
  const keys = id === 'strategy' ? STRATEGY_KEYS : id === 'paid' ? PAID_ITEM_IDS : ARTICLE_ITEM_IDS;
  const done = keys.filter((k) => decisions[k]).length;
  const changes = keys.filter((k) => decisions[k]?.status === 'changes').length;
  if (done === 0) return { label: 'Not Started', tone: 'neutral' };
  if (done < keys.length) return { label: `${done} of ${keys.length} reviewed`, tone: 'warning' };
  return changes > 0 ? { label: 'Changes requested', tone: 'warning' } : { label: 'Approved', tone: 'success' };
}

// ─── Overview ────────────────────────────────────────────────────────────────

/** The step's preview art, peeking from the bottom-right corner of its card
 *  (clipped by the card's overflow). Uses the Figma "Frame" exports in
 *  public/. Filenames only; the Vite base is prefixed at render so they
 *  resolve under a deployed sub-path (e.g. /prototypes/pr/113/) too. Only four
 *  steps have art; the rest render no corner image. */
const CORNER_FRAMES: Partial<Record<StepId, { src: string; width: number; right: number; bottom: number }>> = {
  scorecard: { src: 'Frame%201171276958.png', width: 80, right: 26, bottom: 0 },
  website: { src: 'Frame%202147229183.png', width: 178, right: -8, bottom: -8 },
  paid: { src: 'Frame%202147229187.png', width: 190, right: 0, bottom: 0 },
  integrations: { src: 'Frame%202147229188.png', width: 148, right: 0, bottom: 16 },
};

function CornerPreview({ id }: { id: StepId }) {
  const f = CORNER_FRAMES[id];
  if (!f) return null;
  return <img src={`${import.meta.env.BASE_URL}${f.src}`} alt="" aria-hidden style={{ position: 'absolute', right: f.right, bottom: f.bottom, width: f.width, display: 'block', pointerEvents: 'none' }} />;
}

function OverviewCard({ index, id, label, blurb, status, onClick }: { index: number; id: StepId; label: string; blurb: string; status: StepStatus; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        appearance: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', position: 'relative', overflow: 'hidden',
        border: `1px solid ${hovered ? 'var(--dark-15)' : 'var(--dark-8)'}`, borderRadius: 18, background: 'var(--light-100)',
        padding: 30, minHeight: 185, display: 'flex', flexDirection: 'column',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.08)' : '0 0 0 rgba(0,0,0,0)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--dark-4)', color: 'var(--dark-60)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{index + 1}</span>
        <Heading level={4} style={{ margin: 0 }}>{label}</Heading>
      </div>
      <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.5, maxWidth: 236 }}>{blurb}</Text>
      <span style={{ flex: 1, minHeight: 20 }} />
      <div style={{ position: 'relative', zIndex: 1, alignSelf: 'flex-start' }}>
        <StatusPill tone={status.tone} size="sm">{status.label}</StatusPill>
      </div>
      <CornerPreview id={id} />
    </button>
  );
}

function OverviewScreen() {
  const { mode, go, decisions } = useWizard();
  const isAm = mode === 'am';
  return (
    <div style={{ maxWidth: 1044, margin: '0 auto', padding: '52px 32px 64px' }}>
      <div style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto 40px' }}>
        <GradientHeadline level={1}>{isAm ? `Build the engine for ${CLIENT_NAME}.` : 'Your Growth Engine is ready.'}</GradientHeadline>
        <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', marginTop: 14, fontSize: 17, lineHeight: 1.6 }}>
          {isAm
            ? `Set up each piece of the engine, scorecard, website, campaigns, and strategy, then submit it to ${CLIENT_NAME} for sign-off.`
            : `${AM_NAME} and the team built the engine for ${CLIENT_NAME}: scorecard, website, campaigns, and strategy. Review it, approve what fits, and flag what needs work.`}
        </Text>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {STEPS.map((step, i) => (
          <OverviewCard key={step.id} index={i} id={step.id} label={step.label} blurb={STEP_BLURBS[step.id]} status={overviewStatus(step.id, decisions)} onClick={() => go(i)} />
        ))}
      </div>
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
        <Button size="xl" endIcon={ArrowRight} onPress={() => go(0)}>{isAm ? 'Start Building' : 'Start Review'}</Button>
      </div>
    </div>
  );
}

// ─── Flow ────────────────────────────────────────────────────────────────────

function Flow({ onComplete, onExit }: { onComplete?: (outcome: ReviewOutcome) => void; onExit?: () => void }) {
  const wizard = useWizard();
  const { showToast } = useToast();
  const { mode, view, stepIndex, decisions, connections, decide, next, submitted } = wizard;
  const isAm = mode === 'am';
  // AM scorecard sub-state: false = intake (footer reads "Generate scorecard"),
  // true = the generated, editable scorecard.
  const [amScGenerated, setAmScGenerated] = useState(false);
  // AM website: edit the details, then preview what the client sees before
  // continuing.
  const [amWebPreviewing, setAmWebPreviewing] = useState(false);

  // Embedded (onComplete provided): report the outcome to the host and let it
  // close the overlay. Standalone: fall back to the built-in Thanks screen.
  const finish = () => {
    if (onComplete) onComplete(summarize(decisions, connections));
    else wizard.submit();
  };

  if (submitted) return <DoneScreen />;

  if (view === 'overview') {
    return (
      <WizardFrame footer={null} onExit={onExit}>
        <OverviewScreen />
      </WizardFrame>
    );
  }

  const step = STEPS[stepIndex];

  const approveStepAndContinue = (message: string) => {
    decide(`step:${step.id}`, { status: 'approved' });
    showToast({ variant: 'success', message });
    next();
  };

  /** Group-review footer: none decided → approve everything; otherwise
   *  continue, marking the step approved when nothing was flagged. */
  const continueGroupStep = (keys: string[], message: string) => {
    const undecided = keys.filter((k) => !decisions[k]);
    if (undecided.length === keys.length) {
      undecided.forEach((k) => decide(k, { status: 'approved' }));
      approveStepAndContinue(message);
      return;
    }
    const anyChanges = keys.some((k) => decisions[k]?.status === 'changes');
    if (!anyChanges) {
      undecided.forEach((k) => decide(k, { status: 'approved' }));
      approveStepAndContinue(message);
    } else {
      next();
    }
  };

  const decidedCount = (keys: string[]) => keys.filter((k) => decisions[k]).length;

  let body = null;
  let footer = null;

  // AM builds/edits the review; the client reviews + approves it. The two share
  // the wizard chrome (header, footer layout, overview) but render distinct
  // step bodies and footers.
  const amContinue = <StepFooter><Button size="lg" onPress={next}>Continue</Button></StepFooter>;

  switch (step.id) {
    case 'scorecard':
      if (isAm) {
        body = <AmScorecard generated={amScGenerated} />;
        footer = (
          <StepFooter>
            {amScGenerated
              ? <Button size="lg" onPress={next}>Continue</Button>
              : <Button size="lg" onPress={() => setAmScGenerated(true)}>Generate scorecard</Button>}
          </StepFooter>
        );
      } else {
        body = <StepScorecard />;
        footer = (
          <StepFooter>
            <Button size="lg" onPress={() => { decide('step:scorecard', { status: 'approved' }); next(); }}>Continue</Button>
          </StepFooter>
        );
      }
      break;

    case 'strategy':
      if (isAm) { body = <AmStrategy />; footer = amContinue; break; }
      body = <StepStrategy />;
      footer = (
        <StepFooter>
          <Button size="lg" onPress={() => continueGroupStep(STRATEGY_KEYS, 'Strategy approved')}>
            {decidedCount(STRATEGY_KEYS) === 0 ? 'Approve All & Continue' : 'Continue'}
          </Button>
        </StepFooter>
      );
      break;

    case 'website':
      if (isAm) {
        body = <AmWebsite previewing={amWebPreviewing} />;
        footer = amWebPreviewing ? (
          <>
            <div><Button variant="ghost" size="lg" onPress={wizard.back}>Back</Button></div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <Text variant="metadata" color="var(--dark-40)" style={{ letterSpacing: '0.24px' }}>Client preview</Text>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="lg" onPress={() => setAmWebPreviewing(false)}>Edit details</Button>
              <Button size="lg" onPress={next}>Continue</Button>
            </div>
          </>
        ) : (
          <StepFooter>
            <Button size="lg" onPress={() => setAmWebPreviewing(true)}>Preview site</Button>
          </StepFooter>
        );
        break;
      }
      body = <StepWebsite />;
      footer = (
        <StepFooter>
          <RequestChangesAction decisionKey="step:website" prompt="What should change on the website?" size="lg" />
          <Button size="lg" frontIcon={Check2} onPress={() => approveStepAndContinue('Website approved')}>Looks Great, Continue</Button>
        </StepFooter>
      );
      break;

    case 'paid':
      if (isAm) { body = <AmPaidAds />; footer = amContinue; break; }
      body = <StepPaidAds />;
      footer = (
        <StepFooter>
          <Button size="lg" onPress={() => continueGroupStep(PAID_ITEM_IDS, 'Paid creative approved')}>
            {decidedCount(PAID_ITEM_IDS) === 0 ? 'Approve All & Continue' : 'Continue'}
          </Button>
        </StepFooter>
      );
      break;

    case 'articles':
      if (isAm) { body = <AmArticles />; footer = amContinue; break; }
      body = <StepArticles />;
      footer = (
        <StepFooter>
          <Button size="lg" onPress={() => continueGroupStep(ARTICLE_ITEM_IDS, 'Articles approved')}>
            {decidedCount(ARTICLE_ITEM_IDS) === 0 ? 'Approve All & Continue' : 'Continue'}
          </Button>
        </StepFooter>
      );
      break;

    case 'integrations':
      body = <StepIntegrations />;
      footer = (
        <StepFooter>
          <Button size="lg" onPress={finish}>{isAm ? 'Submit to Client' : 'Submit Review'}</Button>
        </StepFooter>
      );
      break;
  }

  return <WizardFrame footer={footer} onExit={onExit}>{body}</WizardFrame>;
}

function DoneScreen() {
  const { decisions, restart } = useWizard();
  const all = Object.entries(decisions);
  const changes = all.filter(([, d]) => d.status === 'changes');
  const approved = all.filter(([, d]) => d.status === 'approved');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--light-100)', fontFamily: "'Sohne', sans-serif" }}>
      <div style={{ maxWidth: 560, textAlign: 'center', padding: 32 }}>
        <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 99, background: 'rgba(4,175,0,0.10)', color: 'var(--status-approved)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check2 size={28} color="var(--status-approved)" />
        </div>
        <Heading level={2} style={{ margin: '0 0 10px' }}>Thanks, review sent</Heading>
        <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.65 }}>
          {changes.length > 0
            ? `You approved ${approved.length} item${approved.length === 1 ? '' : 's'} and sent ${changes.length} note${changes.length === 1 ? '' : 's'} to the team. ${AM_NAME} will follow up with ${CLIENT_NAME} on each one before anything goes live.`
            : `Everything's approved. ${AM_NAME} and the team will take it from here. Your growth engine starts now.`}
        </Text>
        {changes.length > 0 && (
          <div style={{ margin: '20px 0 0', textAlign: 'left', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '16px 20px', background: 'var(--light-100)' }}>
            <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 8 }}>Your notes for the team</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {changes.map(([key, d]) => (
                <Text key={key} variant="secondary" color="var(--dark-80)" style={{ display: 'block', lineHeight: 1.5 }}>· {d.note}</Text>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginTop: 28 }}>
          <Button variant="secondary" size="md" onPress={restart}>Start Over</Button>
        </div>
      </div>
    </div>
  );
}
