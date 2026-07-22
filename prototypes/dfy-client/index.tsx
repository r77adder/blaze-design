import { useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { ModalStack } from '@/components';
import { Toaster, ToasterProvider } from '@/staging';
import { Heading, Text } from '@/components';
import { ClientShell } from './shell';
import { ClientStateProvider, useClientState } from './dev-state';
import { DevStatePanel } from './DevStatePanel';
import { Home } from './Home';
import { HomeCold } from './HomeCold';
import { HomeReviewed } from './HomeReviewed';
import { HomeMixed } from './HomeMixed';
import { Insights } from './Insights';
import { Leads } from './Leads';
import { BrandKit } from './BrandKit';
import { Settings } from './Settings';
import { Approvals } from './Approvals';
import { Calendar } from './Calendar';
import { Strategy } from './Strategy';
import { Scorecard } from './Scorecard';
import { ReviewStrategy } from './ReviewStrategy';
import { ReviewGoals } from './ReviewGoals';
import { ReviewCreative } from './ReviewCreative';
import { GrowthReviewRoute } from './ReviewFlow';
import { ReputationView, ReputationTabs, type TabKey } from '../h2-port/pages/Reputation';

/**
 * Blaze DFY, the **client** portal (done-for-you customer's view).
 *
 * Built on `main` so it harvests current H2 designs (home feed, ApprovalsV2,
 * per-channel Insights, Website Analytics, content calendar, Brand Kit),
 * reframed view-only for a client who reviews results and approves work.
 *
 * Routes (relative to /dfy-client): / · /approvals · /calendar ·
 * /insights[/:sub] · /leads · /strategy · /brand-kit[/:sub] · /settings[/:sub]
 *
 * The Growth Engine Review also has its own shareable URL: /growth-review
 * (client side) and /growth-review/am (strategist side) — the same flow the
 * cold-state Home opens as an overlay, mounted directly so it can be sent to
 * a reviewer as a link.
 *
 * The bottom-left <DevStatePanel/> flips the whole portal between `cold`
 * (Growth Engine Review ready to review), `reviewed` (client approved it, only
 * go-live left), `mixed` (client requested changes), and `steady` (live) —
 * each page reads useClientState().
 */
function HomeRoute() {
  const { state } = useClientState();
  if (state === 'cold') return <HomeCold />;
  if (state === 'reviewed') return <HomeReviewed />;
  if (state === 'mixed') return <HomeMixed />;
  return <Home />;
}

/** Reputation with its subtabs lifted into the shell topbar. */
function ClientReputation() {
  const [tab, setTab] = useState<TabKey>('reviews');
  return (
    <ClientShell section="reputation" topbarCenter={<ReputationTabs tab={tab} onTab={setTab} />}>
      <ReputationView tab={tab} onTab={setTab} />
    </ClientShell>
  );
}

function SectionRoute() {
  const { section = 'home', sub } = useParams();
  if (section === 'home') return <HomeRoute />;
  if (section === 'approvals') return <Approvals sub={sub} />;
  if (section === 'calendar') return <Calendar sub={sub} />;
  if (section === 'insights') return <Insights sub={sub} />;
  if (section === 'reputation') return <ClientReputation />;
  if (section === 'leads') return <Leads />;
  if (section === 'strategy') return <Strategy sub={sub} />;
  if (section === 'scorecard') return <Scorecard />;
  if (section === 'review-strategy') return <ReviewStrategy />;
  if (section === 'review-goals') return <ReviewGoals />;
  if (section === 'review-creative') return <ReviewCreative />;
  if (section === 'growth-review') return <GrowthReviewRoute sub={sub} />;
  if (section === 'brand-kit') return <BrandKit sub={sub} />;
  if (section === 'settings') return <Settings sub={sub} />;
  return (
    <ClientShell section={section}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 0' }}>
        <Heading level={2} style={{ marginTop: 0 }}>Not found</Heading>
        <Text variant="secondary" color="var(--dark-60)">No such section.</Text>
      </div>
    </ClientShell>
  );
}

export default function DfyClient() {
  return (
    <ClientStateProvider>
      <ToasterProvider>
        <ModalStack>
          <Routes>
            <Route index element={<HomeRoute />} />
            <Route path=":section" element={<SectionRoute />} />
            <Route path=":section/:sub" element={<SectionRoute />} />
          </Routes>
          <Toaster />
          <DevStatePanel />
        </ModalStack>
      </ToasterProvider>
    </ClientStateProvider>
  );
}
