// Two H2 onboarding pages ported 1:1 (web) from the H2 web onboarding rework
// (origin/prototype/h2-onboarding-rework). Source of record:
//   prototypes/h2/onboarding/steps/StrategyReviewSteps.tsx  (OnbSwipe, OnbGoals)
//   prototypes/h2/cold-flows/StrategyFlow.tsx                (SwipeStep, GoalsStep)
//
// Each export renders the FULL page: the FlowHeader (title + subtitle) plus the
// step body, 1-to-1 with the originals. The full-flow chrome is stripped — no
// FlowFooter / nav buttons, no FlowProvider / onboarding-context — so the pages
// render standalone with NO providers, dropping into an existing blaze-dfy page
// frame. Neither takes any required props; each seeds from the ported data.

import type { ReactNode } from 'react';
import { FlowHeader, SwipeStep, GoalsStep } from './steps';

/** Width-constrained step body. Mirrors the source FlowBody's centered,
 *  900px-max, horizontally-padded column — minus the fixed-footer bottom
 *  padding and full-viewport scaffold, which the host page owns. */
function PageBody({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>{children}</div>;
}

/** OnbSwipe — "What's working in your market" (web). */
export function SwipeFilePort() {
  return (
    <PageBody>
      <FlowHeader
        title="What's working in your market"
        subtitle="React so we learn what to chase — most of these are paid ads from local competitors."
      />
      <SwipeStep />
    </PageBody>
  );
}

/** OnbGoals — "Marketing goals" (web). */
export function MarketingGoalsPort() {
  return (
    <PageBody>
      <FlowHeader title="Marketing goals" subtitle="Set your targets, channels, and what's worked so far." />
      <GoalsStep />
    </PageBody>
  );
}
