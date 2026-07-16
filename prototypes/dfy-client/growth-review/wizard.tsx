import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Heading, Text, Button, IconButton } from '@/components';
import Check2 from '@/icons/20/Check2';
import Close from '@/icons/20/Close';

/**
 * Wizard state + chrome for the Growth Engine Review.
 *
 * One decision store covers everything reviewable in the flow:
 *  - whole steps (keys like 'step:scorecard')
 *  - individual creatives (keys like 'paid:search-refinish', 'seo:refinish-cost')
 *  - integration questions (keys like 'crm:outlook')
 * Steps derive their progress counts by key prefix.
 *
 * The flow opens on an overview screen (view === 'overview'); picking a step
 * card, or any header step, drops into that step (view === 'step').
 */

// ─── Steps ───────────────────────────────────────────────────────────────────

export const STEPS = [
  { id: 'scorecard', label: 'Scorecard' },
  { id: 'website', label: 'Website' },
  { id: 'paid', label: 'Paid Ads' },
  { id: 'articles', label: 'SEO / AEO' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'integrations', label: 'Integrations' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

// ─── Decisions ───────────────────────────────────────────────────────────────

export type DecisionStatus = 'approved' | 'changes';

export interface Decision {
  status: DecisionStatus;
  note?: string;
}

export type ReviewMode = 'client' | 'am';

interface WizardState {
  /** 'client' = the client reviews/approves; 'am' = the strategist edits it. */
  mode: ReviewMode;
  /** Flip AM ⇄ Client in place (prototype control), keeping the current step. */
  setMode: (mode: ReviewMode) => void;
  /** AM reopened a review the client returned with changes (reviewed state). */
  reviewed: boolean;
  view: 'overview' | 'step';
  stepIndex: number;
  go: (index: number) => void;
  openOverview: () => void;
  next: () => void;
  back: () => void;
  decisions: Record<string, Decision>;
  decide: (key: string, decision: Decision | null) => void;
  connections: Record<string, boolean>;
  connect: (id: string) => void;
  submitted: boolean;
  submit: () => void;
  restart: () => void;
}

const WizardContext = createContext<WizardState | null>(null);

export function useWizard(): WizardState {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside <WizardProvider>');
  return ctx;
}

function scrollTop() {
  requestAnimationFrame(() => document.querySelector('[data-wizard-scroll]')?.scrollTo(0, 0));
}

export function WizardProvider({ children, mode: modeProp = 'client', reviewed = false, initialDecisions, initialConnections }: {
  children: ReactNode;
  /** 'client' (review + approve) or 'am' (strategist edits). */
  mode?: ReviewMode;
  /** AM reopened a review the client returned with changes. */
  reviewed?: boolean;
  /** Seed a reopened review so each step reflects the prior verdicts. */
  initialDecisions?: Record<string, Decision>;
  initialConnections?: Record<string, boolean>;
}) {
  const [mode, setMode] = useState<ReviewMode>(modeProp);
  // The host (blaze-dfy dev panel) can flip the side while the review is open.
  useEffect(() => { setMode(modeProp); }, [modeProp]);
  const [view, setView] = useState<'overview' | 'step'>('overview');
  const [stepIndex, setStepIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Decision>>(initialDecisions ?? {});
  const [connections, setConnections] = useState<Record<string, boolean>>(initialConnections ?? {});
  const [submitted, setSubmitted] = useState(false);

  const value = useMemo<WizardState>(() => {
    const go = (index: number) => {
      const clamped = Math.max(0, Math.min(index, STEPS.length - 1));
      setView('step');
      setStepIndex(clamped);
      scrollTop();
    };
    return {
      mode,
      setMode,
      reviewed,
      view,
      stepIndex,
      go,
      openOverview: () => { setView('overview'); scrollTop(); },
      next: () => go(stepIndex + 1),
      back: () => { if (stepIndex === 0) { setView('overview'); scrollTop(); } else go(stepIndex - 1); },
      decisions,
      decide: (key, decision) =>
        setDecisions((prev) => {
          if (decision === null) {
            const { [key]: _drop, ...rest } = prev;
            return rest;
          }
          return { ...prev, [key]: decision };
        }),
      connections,
      connect: (id) => setConnections((prev) => ({ ...prev, [id]: true })),
      submitted,
      submit: () => setSubmitted(true),
      restart: () => {
        setSubmitted(false);
        setDecisions({});
        setConnections({});
        setStepIndex(0);
        setView('overview');
      },
    };
  }, [mode, reviewed, view, stepIndex, decisions, connections, submitted]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

// ─── Chrome ──────────────────────────────────────────────────────────────────

/** Full-screen wizard frame: header with step indicator, scrollable body,
 *  and a footer action bar supplied by the active step. */
export function WizardFrame({ children, footer, onExit }: { children: ReactNode; footer: ReactNode; onExit?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', background: 'var(--light-100)', fontFamily: "'Sohne', sans-serif" }}>
      <WizardHeader scrolled={scrolled} onExit={onExit} />
      <div
        data-wizard-scroll
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: 'var(--dark-2)' }}
      >
        {children}
      </div>
      {footer && (
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {footer}
        </div>
      )}
    </div>
  );
}

function WizardHeader({ scrolled, onExit }: { scrolled: boolean; onExit?: () => void }) {
  const { view, stepIndex, go, openOverview, decisions } = useWizard();
  const showSteps = view === 'step';
  return (
    <div
      style={{
        flexShrink: 0,
        background: scrolled ? 'var(--light-100)' : 'var(--dark-2)',
        borderBottom: `1px solid ${scrolled ? 'var(--dark-8)' : 'transparent'}`,
        transition: 'background 0.15s ease, border-color 0.15s ease',
        padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={openOverview}
        style={{ appearance: 'none', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
      >
        <Text style={{ fontWeight: 500 }}>Growth Engine Review</Text>
      </button>

      {/* step indicator, centered to the viewport width, hidden on the
       *  overview (the step cards already list every step). */}
      {showSteps && (
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {STEPS.map((step, i) => {
          const active = view === 'step' && i === stepIndex;
          const approved = decisions[`step:${step.id}`]?.status === 'approved';
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => go(i)}
              style={{
                appearance: 'none',
                border: 'none',
                background: active ? 'var(--dark-8)' : 'transparent',
                borderRadius: 8,
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {approved && <Check2 size={14} color="var(--status-approved)" />}
              <Text
                variant="secondary"
                color={active ? 'var(--dark-90)' : 'var(--dark-60)'}
                style={{ whiteSpace: 'nowrap', fontWeight: active ? 500 : 400 }}
              >
                {step.label}
              </Text>
            </button>
          );
        })}
      </div>
      )}

      {onExit && (
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}>
          <IconButton size="sm" variant="ghost" icon={Close} title="Close review" onPress={onExit} />
        </div>
      )}
    </div>
  );
}

/** Standard step intro: headline + supporting line, centered column. An
 *  optional `action` renders across from the headline (e.g. Approve all). */
export function StepIntro({ title, body, maxWidth = 860, action }: { title: string; body?: string; maxWidth?: number; action?: ReactNode }) {
  return (
    <div style={{ maxWidth, margin: '0 auto', padding: '40px 0 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <Heading level={2} style={{ margin: 0 }}>{title}</Heading>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      {body && (
        <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '8px 0 0', lineHeight: 1.6 }}>
          {body}
        </Text>
      )}
    </div>
  );
}

/** Shared footer layout: Back on the left, actions on the right. */
export function StepFooter({ backLabel = 'Back', children }: { backLabel?: string; children: ReactNode }) {
  const { back } = useWizard();
  return (
    <>
      <div style={{ justifySelf: 'start' }}>
        <Button variant="ghost" size="lg" onPress={back}>{backLabel}</Button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>{children}</div>
    </>
  );
}
